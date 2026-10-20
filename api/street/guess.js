import { configured, validateTicket, distanceKm, scoreKm, send } from '../../server/street/core.mjs';
import { countryAnswerPoints, COUNTRY_HINTS } from '../../server/street/country-mode.mjs';

// Legacy coordinate guesses continue to work for clients with an older build,
// but Atlas Arena's updated Street Detective is country-first.
export default function handler(req,res) {
  if(req.method!=='POST')return send(res,405,{error:'Method not allowed'});
  if(!configured())return send(res,503,{error:'Konum servisi hazır değil.'});
  const {ticket,guess,countryGuess,hintsUsed=0}=req.body??{};
  const row=validateTicket(ticket);
  if(!row)return send(res,400,{error:'Turun süresi doldu. Yeni bir tur başlat.'});
  if(typeof countryGuess==='string'){
    if(!Number.isInteger(hintsUsed)||hintsUsed<0||hintsUsed>2)
      return send(res,400,{error:'Geçersiz ipucu sayısı.'});
    // Deliberately use the server-side catalog. The session never tells the
    // browser which choice is correct.
    const possible=new Set(Object.keys(COUNTRY_HINTS));
    if(!possible.has(countryGuess))
      return send(res,400,{error:'Listeden geçerli bir ülke seç.'});
    const correct=countryGuess===row.country;
    return send(res,200,{
      correct, points:countryAnswerPoints(correct,hintsUsed),
      country:row.country, city:row.city, title:row.title, fact:row.fact,
      credit:{artist:row.artist,license:row.license,source:row.source},
    });
  }
  if(!guess||!Number.isFinite(guess.lat)||!Number.isFinite(guess.lng)||
    guess.lat< -90||guess.lat>90||guess.lng< -180||guess.lng>180)
    return send(res,400,{error:'Geçerli bir tahmin noktası seç.'});
  const actual={lat:row.lat,lng:row.lng};
  const km=distanceKm(guess,actual);
  return send(res,200,{
    actual,km,points:scoreKm(km),country:row.country,city:row.city,
    title:row.title,fact:row.fact,
    credit:{artist:row.artist,license:row.license,source:row.source},
  });
}
