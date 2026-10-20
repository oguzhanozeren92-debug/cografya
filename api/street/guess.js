import { configured, validateTicket, send, distanceKm } from '../../server/street/core.mjs';
import { scoreStreetGuess, STREET_HINT_MAX } from '../../server/street/country-mode.mjs';
import { isPointInCountry } from '../../server/street/country-map.mjs';

// Precision matters: score by km from the photographed point, plus 1000
// country bonus when the map pin lands within the correct country polygon.
export default function handler(req,res){
  if(req.method!=='POST')return send(res,405,{error:'Method not allowed'});
  if(!configured())return send(res,503,{error:'Konum servisi hazır değil.'});
  const {ticket,guess,hintsUsed=0}=req.body??{};
  const row=validateTicket(ticket);
  if(!row)return send(res,400,{error:'Turun süresi doldu. Yeni bir tur başlat.'});
  if(!guess||typeof guess!=='object'||!Number.isFinite(guess.lat)
     ||!Number.isFinite(guess.lng)||guess.lat<-90||guess.lat>90
     ||guess.lng<-180||guess.lng>180)
    return send(res,400,{error:'Haritada geçerli bir konum seç.'});
  if(!Number.isInteger(hintsUsed)||hintsUsed<0||hintsUsed>STREET_HINT_MAX)
    return send(res,400,{error:'Geçersiz ipucu sayısı.'});
  const actual={lat:row.lat,lng:row.lng};
  const km=distanceKm(guess,actual);
  const correctCountry=isPointInCountry(guess,row.country);
  return send(res,200,{
    correct:correctCountry,correctCountry,km,
    ...scoreStreetGuess(km,correctCountry,hintsUsed),actual,
    country:row.country,city:row.city,title:row.title,fact:row.fact,
    credit:{artist:row.artist,license:row.license,source:row.source},
  });
}
