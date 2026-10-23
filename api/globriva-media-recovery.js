// Temporary read-only migration bridge for PUBLIC Globriva gallery images.
// Only fixed, already publicly exposed Cloudflare R2 objects can be served.
// Remove this endpoint once recovery is complete.
const ALBUM = /^album-0(?:0[1-9]|1[0-9]|20)$/;
const R2 = 'https://pub-b3a9d7c95b2449c1a1532fb5b389ef88.r2.dev';
const MAX_SIZE = 3 * 1024 * 1024;
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if(req.method!=='GET')return res.status(405).json({error:'Method not allowed'});
  const album = String(req.query?.album||'');
  const number = Number(req.query?.number);
  if(!ALBUM.test(album)||![1,2,3,4].includes(number)){
    return res.status(400).json({error:'Invalid album or photo number'});
  }
  const key = 'drone-gallery/photos/' + album + '/' + number + '.webp';
  try {
    const response = await fetch(R2 + '/' + key,{signal:AbortSignal.timeout(6000),cache:'no-store'});
    if(!response.ok)return res.status(404).json({error:'Public R2 source unavailable',sourceStatus:response.status,key});
    const bytes = Buffer.from(await response.arrayBuffer());
    if(bytes.length<2048||bytes.length>MAX_SIZE||
       bytes.toString('ascii',0,4)!=='RIFF'||bytes.toString('ascii',8,12)!=='WEBP')
       return res.status(422).json({error:'Not a valid-size WebP image',key,bytes:bytes.length});
    return res.status(200).json({key,length:bytes.length,base64:bytes.toString('base64')});
  }catch(error){
    return res.status(502).json({error:'Could not reach R2 public object',message:error?.message||'Upstream unavailable',key});
  }
}
