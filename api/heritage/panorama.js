// Globriva: read-only, allowlisted panorama proxy. Sources and licenses live
// in the shared EraAtlas-derived Wikimedia Commons catalogue.
import catalog from '../../src/data/heritage360.json' with { type: 'json' };
import reviewed from '../../src/data/heritage360-source-reviewed.json' with { type: 'json' };

const verified=new Set(reviewed.sourceReviewedIds);
const entries=new Map(catalog.places.filter(p=>verified.has(p.id)).map(p=>[p.id,p]));
const MAX_SIZE=3_900_000;
const userAgent='Globriva/1.0 (licensed historical panoramas; photo attribution on result screen)';
async function request(url,ms){
  const controller=new AbortController();
  const timeout=setTimeout(()=>controller.abort(),ms);
  try{return await fetch(url,{signal:controller.signal,headers:{Accept:'image/jpeg,application/json;q=0.9', 'User-Agent':userAgent}})}
  finally{clearTimeout(timeout)}
}
async function info(file,width){
  const q=new URL('https://commons.wikimedia.org/w/api.php');
  q.searchParams.set('action','query');q.searchParams.set('format','json');q.searchParams.set('formatversion','2');
  q.searchParams.set('titles','File:'+file);q.searchParams.set('prop','imageinfo');
  q.searchParams.set('iiprop','url|size|mime');q.searchParams.set('iiurlwidth',String(width));q.searchParams.set('redirects','1');
  const response=await request(q.href,10500);
  if(!response.ok)throw new Error('commons_metadata_http_'+response.status);
  const data=await response.json(),page=data.query?.pages?.[0],image=page?.imageinfo?.[0];
  if(!image||page.missing)throw new Error('commons_missing');
  if(image.mime!=='image/jpeg'||!(image.width>0&&image.height>0)||
    Math.abs(image.width/image.height-2)>.07)throw new Error('invalid_panorama');
  return image.thumburl||image.url;
}
async function photo(url){
  const target=new URL(url);
  if(target.protocol!=='https:'||!['upload.wikimedia.org','thumb.wikimedia.org'].includes(target.hostname))
    throw new Error('untrusted_image_host');
  const response=await request(target.href,16000);
  if(!response.ok)throw new Error('commons_image_http_'+response.status);
  const kind=(response.headers.get('content-type')||'').split(';')[0].trim().toLowerCase();
  if(kind!=='image/jpeg')throw new Error('not_jpeg');
  if(Number(response.headers.get('content-length')||0)>MAX_SIZE)throw new Error('image_too_large');
  const reader=response.body?.getReader();
  if(!reader)throw new Error('empty_image');
  const chunks=[];let size=0;
  try{
    while(true){const {done,value}=await reader.read();if(done)break;
      size+=value.byteLength;
      if(size>MAX_SIZE){await reader.cancel();throw new Error('image_too_large')}
      chunks.push(Buffer.from(value));
    }
  }finally{reader.releaseLock()}
  if(size<900)throw new Error('image_too_small');
  return Buffer.concat(chunks,size);
}
export default async function handler(req,res){
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Cross-Origin-Resource-Policy','cross-origin');
  res.setHeader('X-Content-Type-Options','nosniff');
  if(req.method!=='GET')return res.status(405).json({error:'method_not_allowed'});
  const id=typeof req.query?.id==='string'?req.query.id:'';
  const place=entries.get(id);
  if(!place||!/^[-a-z0-9]{2,70}$/.test(id))return res.status(404).json({error:'unknown_panorama'});
  if(!/\.jpe?g$/i.test(place.file)||place.file.length>240)
    return res.status(404).json({error:'invalid_file'});
  try{
    const preview=req.query?.preview==='1';
    let bytes;
    try{bytes=await photo(await info(place.file,preview?640:2048))}
    catch(e){
      if(String(e.message)!=='image_too_large')throw e;
      bytes=await photo(await info(place.file,preview?512:1536));
    }
    res.setHeader('Content-Type','image/jpeg');
    res.setHeader('Cache-Control','public, max-age=86400, s-maxage=604800, stale-while-revalidate=604800');
    return res.status(200).end(bytes);
  }catch(e){
    return res.status(503).json({error:'panorama_unavailable',reason:String(e?.message||'unknown').slice(0,64)});
  }
}
