import { VALID_COUNTRY_IDS } from '@/data/countries';
import { backend, getPlayerId } from '@/lib/leaderboard';

const STORAGE_KEY = 'geo-discovered-countries-v1';
export const DISCOVERY_EVENT = 'geo-discoveries-changed';
const allowed = new Set(VALID_COUNTRY_IDS);

export function getDiscoveredCountries(): string[] {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as unknown;
    if (!Array.isArray(stored)) return [];
    return [...new Set(stored.filter((id): id is string => typeof id === 'string' && allowed.has(id)))];
  } catch { return []; }
}

function persist(ids: string[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify([...new Set(ids.filter(id => allowed.has(id)))])); }
  catch { /* Discovery still works in memory-restricted browsing sessions. */ }
  window.dispatchEvent(new Event(DISCOVERY_EVENT));
}

/** Unlock immediately on this device; cloud sync is best effort until the game DB is configured. */
export function discoverCountry(countryId: string): boolean {
  if (!allowed.has(countryId)) return false;
  const previous = getDiscoveredCountries();
  if (previous.includes(countryId)) return false;
  persist([...previous, countryId]);
  void saveDiscoveryToCloud(countryId);
  return true;
}

async function saveDiscoveryToCloud(countryId: string) {
  if (!backend) return;
  try {
    const player = await getPlayerId();
    await backend.from('geo_country_discoveries').upsert({ player_id: player, country_id: countryId }, { onConflict: 'player_id,country_id', ignoreDuplicates: true });
  } catch { /* Local progress remains usable if the table/network is unavailable. */ }
}

/** Union cloud progress with locally unlocked countries on an authenticated device. */
export async function syncDiscoveries(): Promise<void> {
  if (!backend) return;
  try {
    const player = await getPlayerId();
    const { data, error } = await backend.from('geo_country_discoveries').select('country_id').eq('player_id', player);
    if (error) return;
    const cloudIds = (data ?? []).map(row => row.country_id as string).filter(id => allowed.has(id));
    const local = getDiscoveredCountries();
    const combined = [...new Set([...local, ...cloudIds])];
    if (combined.length > local.length) persist(combined);
    const missing = local.filter(id => !cloudIds.includes(id));
    if (missing.length) {
      await backend.from('geo_country_discoveries').upsert(
        missing.map(country_id => ({ player_id: player, country_id })),
        { onConflict: 'player_id,country_id', ignoreDuplicates: true },
      );
    }
  } catch { /* Silent offline fallback. */ }
}