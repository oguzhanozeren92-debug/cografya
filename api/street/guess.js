import { configured, validateTicket, distanceKm, scoreKm, send } from '../../server/street/core.mjs';

export default function handler(req, res) {
  if (req.method !== 'POST') return send(res, 405, { error: 'Method not allowed' });
  if (!configured()) return send(res, 503, { error: 'Konum servisi hazır değil.' });
  const { ticket, guess } = req.body ?? {};
  if (!guess || !Number.isFinite(guess.lat) || !Number.isFinite(guess.lng) ||
    guess.lat < -90 || guess.lat > 90 || guess.lng < -180 || guess.lng > 180)
    return send(res, 400, { error: 'Geçerli bir tahmin noktası seç.' });
  const row = validateTicket(ticket);
  if (!row) return send(res, 400, { error: 'Turun süresi doldu. Yeni bir tur başlat.' });
  const actual = { lat: row.lat, lng: row.lng };
  const km = distanceKm(guess, actual);
  return send(res, 200, {
    actual, km, points: scoreKm(km), country: row.country, city: row.city,
    title: row.title, fact: row.fact,
    credit: { artist: row.artist, license: row.license, source: row.source },
  });
}
