import { approvedDroneMedia } from '../../server/drone/approved.mjs';

export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (req.method !== 'GET') return res.status(405).json({error:'Method not allowed'});
  const publicBase=(process.env.STREET_R2_PUBLIC_BASE_URL||'').replace(/\/$/,'');
  if(!/^https:\/\/[^/]+$/.test(publicBase))return res.status(503).json({error:'360° arşiv bağlantısı henüz yapılandırılmadı.'});
  if(approvedDroneMedia.length<5)return res.status(503).json({error:'Dron panoramaları yükleniyor. Biraz sonra tekrar dene.'});
  const media=approvedDroneMedia.map(x=>({
    id:x.id,
    media:{mode:'multires',base:publicBase+'/drone/'+x.id,config:x.multires}
  }));
  return res.status(200).json({media});
}
