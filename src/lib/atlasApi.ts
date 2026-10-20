import { Capacitor } from '@capacitor/core';

// Capacitor's bundled app uses capacitor://localhost, which cannot serve
// Vercel functions. Web keeps same-origin relative API calls.
const DEFAULT_ATLAS_API_ORIGIN='https://atlas-arena-tau.vercel.app';
export function atlasApi(path:string):string {
  if(!path.startsWith('/api/'))throw new Error('Unexpected Atlas API path');
  if(!Capacitor.isNativePlatform())return path;
  const override=import.meta.env.VITE_ATLAS_API_ORIGIN?.trim();
  const base=(override||DEFAULT_ATLAS_API_ORIGIN).replace(/\/+$/,'');
  if(!/^https:\/\/[a-z0-9.-]+(?::443)?$/i.test(base))throw new Error('Invalid Atlas API base URL');
  return base+path;
}
