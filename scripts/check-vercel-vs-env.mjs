// Build-time guard for Globriva web VS. Never print secrets or credentials.
// On Vercel production the Vite public client config must be available at build time.
if (process.env.VERCEL_ENV === 'production') {
  const rawUrl = process.env.VITE_SUPABASE_URL?.trim() ?? '';
  const clientKey = process.env.VITE_SUPABASE_ANON_KEY?.trim() ?? '';
  let projectRef = '';
  try {
    const url = new URL(rawUrl);
    if (url.protocol !== 'https:' || !/^[a-z0-9-]+\\.supabase\\.(co|in)$/.test(url.hostname)) {
      throw new Error('not a Supabase HTTPS API endpoint');
    }
    projectRef = url.hostname.split('.')[0];
  } catch {
    console.error('[Globriva VS build] VITE_SUPABASE_URL is missing or invalid.');
    process.exit(1);
  }
  if (!(clientKey.startsWith('sb_publishable_') || clientKey.split('.').length === 3)) {
    console.error('[Globriva VS build] VITE_SUPABASE_ANON_KEY is missing or invalid.');
    process.exit(1);
  }
  if (clientKey.split('.').length === 3) {
    try {
      const claims = JSON.parse(Buffer.from(clientKey.split('.')[1], 'base64url').toString('utf8'));
      if (claims.role !== 'anon' || claims.ref !== projectRef) throw new Error('Wrong project or role');
    } catch {
      console.error('[Globriva VS build] Public client key does not match the Supabase project.');
      process.exit(1);
    }
  }
  console.log('[Globriva VS build] Public Supabase client configuration verified; Vite will embed it.');
}
