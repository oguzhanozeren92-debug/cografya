// Only publish the Supabase *public client* configuration.
// These values are already embedded in the Globriva web client bundle.
// Never return a service_role/secret key or other server environment settings.
const getAnonProjectRef = (key) => {
  if (key.startsWith('sb_publishable_')) return null;
  try {
    const [, payload] = key.split('.');
    const claims = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (claims.role !== 'anon' || typeof claims.ref !== 'string') return undefined;
    return claims.ref;
  } catch {
    return undefined;
  }
};

export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const supabaseUrl = (process.env.VITE_SUPABASE_URL || '').trim();
  const supabaseAnonKey = (process.env.VITE_SUPABASE_ANON_KEY || '').trim();
  let projectRef;
  try {
    const url = new URL(supabaseUrl);
    if (url.protocol !== 'https:' ||
        !/^[a-z0-9-]+\.supabase\.(?:co|in)$/.test(url.hostname) ||
        url.pathname !== '/' || url.search || url.hash) {
      throw new Error('Invalid Supabase URL');
    }
    projectRef = url.hostname.split('.')[0];
  } catch {
    return res.status(503).json({ error: 'Public multiplayer configuration unavailable' });
  }

  const anonRef = getAnonProjectRef(supabaseAnonKey);
  if (!supabaseAnonKey ||
      anonRef === undefined ||
      (anonRef !== null && anonRef !== projectRef)) {
    return res.status(503).json({ error: 'Public multiplayer configuration unavailable' });
  }

  return res.status(200).json({
    supabaseUrl,
    supabaseAnonKey,
  });
}
