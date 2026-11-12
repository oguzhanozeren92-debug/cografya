import { configured, send, allowAtlasNativeCors } from '../../server/street/core.mjs';
import { readTour, aerialRows, aerialTicket } from '../../server/street/ranked.mjs';

// Issues tour-bound tickets for the aerial (photo gallery) rounds the client picked,
// so those rounds are scored on the server like street rounds.
export default async function handler(req, res) {
  if (allowAtlasNativeCors(req, res)) return;
  if (req.method !== 'POST') return send(res, 405, { error: 'Method not allowed' });
  if (!configured()) return send(res, 503, { error: 'Konum servisi hazır değil.' });
  const { tourToken, ids } = req.body ?? {};
  const tour = readTour(tourToken);
  if (!tour) return send(res, 400, { error: 'Tur süresi doldu. Yeni bir tur başlat.' });
  if (!Array.isArray(ids) || ids.length < 1 || ids.length > 3 || new Set(ids).size !== ids.length ||
      !ids.every(id => typeof id === 'string' && /^[a-z0-9-]{3,60}$/.test(id)))
    return send(res, 400, { error: 'Geçersiz hava görüntüsü listesi.' });
  const rows = await aerialRows();
  if (!ids.every(id => rows.has(id))) return send(res, 404, { error: 'Hava görüntüsü bulunamadı.' });
  return send(res, 200, { tickets: Object.fromEntries(ids.map(id => [id, aerialTicket(id, tour)])) });
}
