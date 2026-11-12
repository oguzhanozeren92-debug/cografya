import { configured, parseTicket, send, distanceKm, allowAtlasNativeCors } from '../../server/street/core.mjs';
import { approvedPanoramas } from '../../server/street/approved.mjs';
import { scoreStreetGuess, STREET_HINT_MAX } from '../../server/street/country-mode.mjs';
import { isPointInCountry } from '../../server/street/country-map.mjs';
import { claim, aerialRows, receiptFor, AERIAL_MAX_POINTS } from '../../server/street/ranked.mjs';

// Distance ladder shared with the client (src/lib/streetLocations.ts).
const STEPS = [[0,5000],[10,4900],[50,4500],[100,4000],[250,3000],[500,1800],[1000,600],[2000,100],[3000,0]];
function locationPoints(km) {
  if (!Number.isFinite(km) || km < 0) return 0;
  for (let i = 1; i < STEPS.length; i++) {
    const [maxKm, maxPoints] = STEPS[i];
    if (km <= maxKm) {
      const [minKm, minPoints] = STEPS[i - 1];
      return Math.max(0, Math.round(minPoints + (maxPoints - minPoints) * (km - minKm) / (maxKm - minKm)));
    }
  }
  return 0;
}

// Each ticket can be guessed once. Hints are counted on the server; the client's
// own hint count is only used when it is higher (never to lower the penalty).
export default async function handler(req,res){
  if(allowAtlasNativeCors(req,res))return;
  if(req.method!=='POST')return send(res,405,{error:'Method not allowed'});
  if(!configured())return send(res,503,{error:'Konum servisi hazır değil.'});
  const {ticket,guess,hintsUsed=0}=req.body??{};
  const t=parseTicket(ticket);
  if(!t)return send(res,400,{error:'Turun süresi doldu. Yeni bir tur başlat.'});
  if(!guess||typeof guess!=='object'||!Number.isFinite(guess.lat)
     ||!Number.isFinite(guess.lng)||guess.lat<-90||guess.lat>90
     ||guess.lng<-180||guess.lng>180)
    return send(res,400,{error:'Haritada geçerli bir konum seç.'});
  if(!Number.isInteger(hintsUsed)||hintsUsed<0||hintsUsed>STREET_HINT_MAX)
    return send(res,400,{error:'Geçersiz ipucu sayısı.'});

  const used=await claim(t.nonce,'guess');
  if(used&&!used.ok)return send(res,409,{error:'Bu tur için tahmin zaten gönderildi.'});
  const ranked=Boolean(used)&&Boolean(t.tour);
  const hints=Math.max(hintsUsed,used?.hints??0);

  if(t.id.startsWith('aerial:')){
    const row=(await aerialRows()).get(t.id.slice(7));
    if(!row)return send(res,404,{error:'Hava görüntüsü bulunamadı.'});
    const level=Math.min(hints,AERIAL_MAX_POINTS.length-1);
    const actual={lat:row.lat,lng:row.lng};
    const km=distanceKm(guess,actual);
    const correct=isPointInCountry(guess,row.country);
    const distancePoints=Math.max(locationPoints(km),correct?3100:0);
    const points=Math.min(distancePoints,AERIAL_MAX_POINTS[level]);
    return send(res,200,{
      correct,km,points,distancePoints,countryBonus:0,
      hintPenalty:Math.max(0,distancePoints-points),maxPoints:AERIAL_MAX_POINTS[level],
      actual,country:row.country,city:row.city,title:'',fact:row.fact,
      receipt:receiptFor(t,points,ranked),ranked,
    });
  }

  const row=approvedPanoramas.find(x=>x.id===t.id);
  if(!row)return send(res,400,{error:'Turun süresi doldu. Yeni bir tur başlat.'});
  const actual={lat:row.lat,lng:row.lng};
  const km=distanceKm(guess,actual);
  const correctCountry=isPointInCountry(guess,row.country);
  const scored=scoreStreetGuess(km,correctCountry,Math.min(hints,STREET_HINT_MAX));
  return send(res,200,{
    correct:correctCountry,correctCountry,km,
    ...scored,actual,
    country:row.country,city:row.city,title:row.title,fact:row.fact,
    credit:{artist:row.artist,license:row.license,source:row.source},
    receipt:receiptFor(t,scored.points,ranked),ranked,
  });
}
