import { configured, send, allowAtlasNativeCors } from '../../server/street/core.mjs';
import { readTour, readReceipt, certificate, ROUND_LIMIT } from '../../server/street/ranked.mjs';

// Turns the 5 signed round receipts of one tour into a signed score certificate.
// Skipped (broken) rounds count as 0 and need no receipt.
export default function handler(req,res){
  if(allowAtlasNativeCors(req,res))return;
  if(req.method!=='POST')return send(res,405,{error:'Method not allowed'});
  if(!configured())return send(res,503,{error:'Konum servisi hazır değil.'});
  const {tourToken,receipts}=req.body??{};
  const tour=readTour(tourToken);
  if(!tour)return send(res,400,{error:'Tur süresi doldu.'});
  if(!Array.isArray(receipts)||receipts.length<1||receipts.length>ROUND_LIMIT)
    return send(res,400,{error:'Geçersiz tur sonucu.'});
  const parsed=receipts.map(readReceipt);
  if(parsed.some(r=>!r||r.tour!==tour))return send(res,400,{error:'Geçersiz tur sonucu.'});
  if(new Set(parsed.map(r=>r.nonce)).size!==parsed.length||new Set(parsed.map(r=>r.id)).size!==parsed.length)
    return send(res,400,{error:'Aynı tur iki kez sayılamaz.'});
  if(parsed.some(r=>!r.ranked))return send(res,409,{error:'Bu tur sıralamaya kaydedilemiyor.'});
  const score=parsed.reduce((sum,r)=>sum+r.points,0);
  if(!Number.isInteger(score)||score<0||score>ROUND_LIMIT*5000)return send(res,400,{error:'Geçersiz tur sonucu.'});
  const cert=certificate(tour,score);
  if(!cert)return send(res,503,{error:'Sıralama imzası yapılandırılmadı.'});
  return send(res,200,cert);
}
