import { configured, validateTicket, send } from '../../server/street/core.mjs';
import { clueForCountry, STREET_HINT_MAX } from '../../server/street/country-mode.mjs';

// Client requests this only after a successful opt-in rewarded ad on native;
// the browser preview is ad-free because AdMob does not run on web.
// Production ranked play will need AdMob server-side verification before
// advertised views / hint penalties can be treated as tamper-proof.
export default function handler(req,res){
  if(req.method!=='POST')return send(res,405,{error:'Method not allowed'});
  if(!configured())return send(res,503,{error:'Konum servisi hazır değil.'});
  const {ticket,level}=req.body??{};
  const row=validateTicket(ticket);
  if(!row)return send(res,400,{error:'Tur süresi doldu. Yeni oyuna başla.'});
  if(!Number.isInteger(level)||level<1||level>STREET_HINT_MAX)
    return send(res,400,{error:'Geçersiz ipucu seviyesi.'});
  const clue=clueForCountry(row.country,level);
  if(!clue||!clue.value)return send(res,404,{error:'Bu konum için ipucu bulunamadı.'});
  return send(res,200,{level,...clue});
}
