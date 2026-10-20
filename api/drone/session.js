import { allowAtlasNativeCors } from '../../server/street/core.mjs';
import { approvedDroneMedia } from '../../server/drone/approved.mjs';
import { readyDronePhotoIds } from '../../server/drone/photo-ready.mjs';

// Use verified, same-origin images: no r2.dev CORS, CDN dependency or WebGL
// player is needed on mobile for the reliable four-angle photo mode.
export default function handler(req,res) {
  if(allowAtlasNativeCors(req,res))return;
  res.setHeader('Cache-Control','no-store');
  res.setHeader('Content-Type','application/json; charset=utf-8');
  if(req.method!=='GET')return res.status(405).json({error:'Method not allowed'});
  const verified=new Set(readyDronePhotoIds);
  const usable=approvedDroneMedia.filter(row=>verified.has(row.id));
  if(usable.length<5){
    return res.status(503).json({error:'Dron görüntülerinin güvenli kopyaları hazırlanıyor. Biraz sonra tekrar dene.'});
  }
  return res.status(200).json({
    media:usable.map(row=>({
      id:row.id,
      media:{
        mode:'multires',
        base:'/drone-photos/'+row.id,
        staticBase:'/drone-photos/'+row.id,
        config:row.multires,
      },
    })),
  });
}
