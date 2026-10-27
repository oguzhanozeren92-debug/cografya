// Codemagic and Vercel are separate build systems. Pull only public,
// validated Supabase browser-client settings from the already-working web app.
// This writes a gitignored .env.production.local for Vite; no manual copying.
import { writeFile } from 'node:fs/promises';

const allowedOrigin = 'https://atlas-arena-tau.vercel.app';
const origin = (process.env.VITE_ATLAS_API_ORIGIN || allowedOrigin).replace(/\/+$/, '');
if (origin !== allowedOrigin) {
  console.error('[Globriva iOS] Unexpected configuration source.');
  process.exit(1);
}

function validate(config) {
  const supabaseUrl = String(config?.supabaseUrl || '').trim();
  const supabaseAnonKey = String(config?.supabaseAnonKey || '').trim();
  let projectRef;
  try {
    const u = new URL(supabaseUrl);
    if (u.protocol !== 'https:' ||
        !/^[a-z0-9-]+\.supabase\.(?:co|in)$/.test(u.hostname) ||
        u.pathname !== '/' || u.search || u.hash) {
      throw new Error('Invalid URL');
    }
    projectRef = u.hostname.split('.')[0];
  } catch {
    throw new Error('Invalid Supabase public URL');
  }
  if (!supabaseAnonKey.startsWith('sb_publishable_')) {
    try {
      const parts = supabaseAnonKey.split('.');
      if (parts.length !== 3) throw new Error('Not a JWT');
      const claims = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
      if (claims.role !== 'anon' || claims.ref !== projectRef) throw new Error('Wrong project or role');
    } catch {
      throw new Error('Supabase public key does not match the geography project');
    }
  }
  if (!/^[A-Za-z0-9._-]+$/.test(supabaseAnonKey)) {
    throw new Error('Invalid public key format');
  }
  return { supabaseUrl, supabaseAnonKey };
}

async function loadConfig() {
  // Respect Codemagic variables if the release group already has them.
  if (process.env.VITE_SUPABASE_URL && process.env.VITE_SUPABASE_ANON_KEY) {
    console.log('[Globriva iOS] Using existing public client settings from Codemagic.');
    return validate({
      supabaseUrl: process.env.VITE_SUPABASE_URL,
      supabaseAnonKey: process.env.VITE_SUPABASE_ANON_KEY,
    });
  }
  const endpoint = allowedOrigin + '/api/public-client-config';
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await fetch(endpoint, {
        redirect: 'error',
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(12000),
      });
      if (!response.ok) throw new Error('Endpoint HTTP ' + response.status);
      const config = validate(await response.json());
      console.log('[Globriva iOS] Valid public multiplayer settings fetched from Globriva Vercel.');
      return config;
    } catch (error) {
      if (attempt === 3) {
        throw new Error('Unable to load public multiplayer settings from the live Globriva website: ' +
          (error instanceof Error ? error.message : String(error)));
      }
      await new Promise(resolve => setTimeout(resolve, attempt * 1200));
    }
  }
  throw new Error('Public config unavailable');
}

try {
  const { supabaseUrl, supabaseAnonKey } = await loadConfig();
  // Vite's production-mode build automatically reads this local, ignored file.
  // A Supabase anon/publishable key is explicitly a PUBLIC client key,
  // not a server-secret or service_role credential.
  await writeFile('.env.production.local',
    'VITE_SUPABASE_URL=' + supabaseUrl + '\n' +
    'VITE_SUPABASE_ANON_KEY=' + supabaseAnonKey + '\n',
    { encoding: 'utf8', mode: 0o600 });
  console.log('[Globriva iOS] Public settings ready for the Vite/Capacitor build.');
} catch (error) {
  console.error('[Globriva iOS] ' + (error instanceof Error ? error.message : String(error)));
  process.exitCode = 1;
}
