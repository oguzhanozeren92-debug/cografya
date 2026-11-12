import { configured, parseTicket, send, allowAtlasNativeCors } from '../../server/street/core.mjs';
import { approvedPanoramas } from '../../server/street/approved.mjs';
import { clueForCountry, STREET_HINT_MAX } from '../../server/street/country-mode.mjs';
import { claim } from '../../server/street/ranked.mjs';

// Client requests this only after a successful opt-in rewarded ad on native.
// Every hint is registered against the ticket so /guess applies its penalty
// even if a modified client reports zero hints. Aerial rounds build their hint
// text on the device; for them this endpoint only registers the use.
export default async function handler(req,res){
  if(allowAtlasNativeCors(req,res))return;
  if(req.method!=='POST')return send(res,405,{error:'Method not allowed'});
  if(!configured())return send(res,503,{error:'Konum servisi hazır değil.'});
  const {ticket,level}=req.body??{};
  const t=parseTicket(ticket);
  if(!t)return send(res,400,{error:'Tur süresi doldu. Yeni oyuna başla.'});
  if(!Number.isInteger(level)||level<1||level>STREET_HINT_MAX)
    return send(res,400,{error:'Geçersiz ipucu seviyesi.'});
  await claim(t.nonce,'hint'+level);
  if(t.id.startsWith('aerial:'))return send(res,200,{level,kind:'registered'});
  const row=approvedPanoramas.find(x=>x.id===t.id);
  if(!row)return send(res,400,{error:'Tur süresi doldu. Yeni oyuna başla.'});
  const clue=clueForCountry(row.country,level);
  if(!clue||(clue.kind==='choices'?!Array.isArray(clue.options)||clue.options.length!==4:!clue.value))
    return send(res,404,{error:'Bu konum için ipucu bulunamadı.'});
  return send(res,200,{level,...clue});
}
