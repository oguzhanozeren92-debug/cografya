import { configured, chooseRounds, send, allowAtlasNativeCors } from '../../server/street/core.mjs';

export default function handler(req, res) {
  if(allowAtlasNativeCors(req,res))return;
  if (req.method !== 'GET') return send(res, 405, { error: 'Method not allowed' });
  if (!configured()) return send(res, 503, { error: 'R2 bağlantısı henüz tamamlanmadı.' });
  const rounds = chooseRounds();
  if (!rounds) return send(res, 503, { error: 'Oyun için en az 5 lisanslı ve doğrulanmış 360° konum gerekiyor. Arşiv hazırlanıyor.' });
  return send(res, 200, { rounds });
}
