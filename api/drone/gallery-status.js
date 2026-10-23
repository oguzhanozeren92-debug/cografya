import { allowAtlasNativeCors } from '../../server/street/core.mjs';

// Lightweight read-only check for manually uploaded R2 photo albums.
// No user-provided hostnames or arbitrary keys can be fetched.
const albumPattern = /^album-0(?:0[1-9]|1[0-6])$/;
const photoCountForAlbum = id => Number(id.slice(-3)) <= 3 ? 4 : 3;
const basePattern = /^https:\/\/[a-z0-9.-]+(?::443)?$/i;

export default async function handler(req, res) {
  if (allowAtlasNativeCors(req, res)) return;
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const id = String(req.query?.album ?? 'album-001');
  if (!albumPattern.test(id)) return res.status(400).json({ error: 'Invalid album ID' });

  const base = (process.env.STREET_R2_PUBLIC_BASE_URL || '').replace(/\/+$/, '');
  if (!basePattern.test(base)) return res.status(503).json({ error: 'R2 public URL is not configured' });

  const results = await Promise.all(Array.from({ length: photoCountForAlbum(id) }, (_, i) => i + 1).map(async (n) => {
    const key = 'drone-gallery/photos/' + id + '/' + n + '.webp';
    try {
      const response = await fetch(base + '/' + key, {
        method: 'HEAD', cache: 'no-store', signal: AbortSignal.timeout(6500),
      });
      const mime = response.headers.get('content-type') || '';
      const bytes = Number(response.headers.get('content-length') || 0);
      return { number: n, key, exists: response.ok, status: response.status, mime, bytes };
    } catch {
      return { number: n, key, exists: false, status: 0, mime: '', bytes: 0 };
    }
  }));

  return res.status(200).json({
    album: id,
    checked: results.length,
    reachable: results.filter(x => x.exists).length,
    allReachable: results.every(x => x.exists),
    results,
    note: 'HEAD checks prove public reachability, not visual correctness or license approval.',
  });
}
