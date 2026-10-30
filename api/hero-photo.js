// Restore the three exact original Globriva feature photos from 27 October.
// Serve them from our own domain so browser-side Unsplash access failures
// cannot bring back the old GeoDiscoveryArt fallback illustrations.
const ORIGINAL_IMAGES = Object.freeze({
  nature: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1150&q=85',
  islands: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=1150&q=85',
  borders: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=1150&q=85',
});

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).end('Method not allowed');
  }
  const mode = typeof req.query?.mode === 'string' ? req.query.mode : '';
  if (!Object.prototype.hasOwnProperty.call(ORIGINAL_IMAGES, mode)) {
    return res.status(404).end('Unknown Globriva artwork');
  }
  try {
    const upstream = await fetch(ORIGINAL_IMAGES[mode], {
      headers: { 'Accept': 'image/avif,image/webp,image/jpeg,image/*' },
      signal: AbortSignal.timeout(10000),
    });
    if (!upstream.ok) throw new Error('Original artwork unavailable');
    const type = upstream.headers.get('content-type') || '';
    if (!type.startsWith('image/')) throw new Error('Unexpected image type');
    const content = Buffer.from(await upstream.arrayBuffer());
    if (content.length < 1500 || content.length > 6 * 1024 * 1024) throw new Error('Unexpected image size');
    res.statusCode = 200;
    res.setHeader('Content-Type', type);
    res.setHeader('Cache-Control', 'public, s-maxage=604800, max-age=3600, stale-while-revalidate=2592000');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    return res.end(content);
  } catch (error) {
    console.warn('Original Globriva image unavailable:', mode, error?.message || 'fetch error');
    res.setHeader('Cache-Control', 'no-store');
    return res.status(503).end('Image temporarily unavailable');
  }
}
