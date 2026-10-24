import { allowAtlasNativeCors } from '../../server/street/core.mjs';

// Read-only Vercel gallery inspector: checks the exact per-photo format in catalog-v2.json.
// This does NOT approve photographs; licensing, actual subject and locality still require editorial review.
const albumPattern=/^album-0(?:0[1-9]|1[0-9]|20)$/;
const ORIGIN='https://atlas-arena-tau.vercel.app';
const isImage=(mime,format)=>format==='webp'?/^image\/webp(?:;|$)/i.test(mime):/^image\/jpeg(?:;|$)/i.test(mime);
const isFormat=s=>s==='webp'||s==='jpg';
const codeFromError=e=>e?.name==='TimeoutError'?'timeout':'network_error';

export default async function handler(req,res){
 if(allowAtlasNativeCors(req,res))return;
 res.setHeader('Cache-Control','no-store');
 if(req.method!=='GET')return res.status(405).json({error:'Method not allowed'});
 const album=String(req.query?.album??'album-001');
 if(!albumPattern.test(album))return res.status(400).json({error:'Invalid album ID'});
 let record;
 try{
  const r=await fetch(ORIGIN+'/drone-gallery/catalog-v2.json',{cache:'no-store',signal:AbortSignal.timeout(6000)});
  if(!r.ok)throw new Error('catalog status '+r.status);
  const catalog=await r.json();
  if(catalog.version!==2||!Array.isArray(catalog.collections))throw new Error('invalid catalog');
  record=catalog.collections.find(x=>x.id===album);
  if(!record||!Array.isArray(record.images)||record.images.length<3||record.images.length>4)
   throw new Error('album not found in catalog');
 }catch(e){
  return res.status(503).json({album,error:'Gallery catalog unavailable or invalid',detail:codeFromError(e)});
 }
 const results=await Promise.all(record.images.map(async(photo,i)=>{
  const number=i+1, format=isFormat(photo.format)?photo.format:'invalid';
  if(format==='invalid')return {number,format,exists:false,status:0,error:'invalid_format'};
  const key='drone-gallery/photos/'+album+'/'+number+'.'+format;
  try{
   const response=await fetch(ORIGIN+'/'+key,{method:'HEAD',cache:'no-store',signal:AbortSignal.timeout(6500)});
   const mime=response.headers.get('content-type')||'';
   const bytes=Number(response.headers.get('content-length')||0);
   return {number,key,format,exists:response.ok&&isImage(mime,format),status:response.status,mime,bytes};
  }catch(e){return {number,key,format,exists:false,status:0,error:codeFromError(e)}}
 }));
 return res.status(200).json({
  album,city:record.city,approved:record.approved===true,
  checked:results.length,reachable:results.filter(x=>x.exists).length,
  allReachable:results.every(x=>x.exists),results,
  note:'File accessibility only. Human location/subject and Commons attribution/license review are still mandatory before approval.'
 });
}
