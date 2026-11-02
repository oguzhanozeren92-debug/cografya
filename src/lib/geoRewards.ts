import { getDiscoveredCountries } from '@/lib/discovery';

export type GeoRewardMode = 'mixed' | 'flags' | 'clues' | 'nature' | 'islands' | 'borders' | 'street' | 'drone' | 'heritage' | 'daily';
export type GeoRewardLevel = 'easy' | 'medium' | 'hard' | 'tour' | 'daily';

export const GEO_REWARDS_CHANGED = 'globriva-rewards-changed';
const STORAGE_KEY = 'globriva-stage-stars-v1';

type SavedRewards = { stars: Record<string, number>; dailyDates: string[] };
export type GeoAward = { previous: number; earned: number; current: number; gained: number; newBadges: GeoBadge[] };
export type GeoBadge = { id: string; tr: string; en: string; detailTr: string; detailEn: string; icon: string; unlocked: boolean };

export const GEO_REWARD_SECTIONS: ReadonlyArray<{
  id: GeoRewardMode; tr: string; en: string; icon: string; levels: readonly GeoRewardLevel[];
}> = [
  { id: 'mixed', tr: 'Dünya Arenası', en: 'World Arena', icon: '🌍', levels: ['easy','medium','hard'] },
  { id: 'flags', tr: 'Bayrak Arenası', en: 'Flag Arena', icon: '🚩', levels: ['easy','medium','hard'] },
  { id: 'clues', tr: 'İpucu Arenası', en: 'Clue Arena', icon: '🧩', levels: ['easy','medium','hard'] },
  { id: 'nature', tr: 'Doğa Dedektifi', en: 'Nature Detective', icon: '🏞️', levels: ['easy','medium','hard'] },
  { id: 'islands', tr: 'Ada Avcısı', en: 'Island Hunter', icon: '🏝️', levels: ['easy','medium','hard'] },
  { id: 'borders', tr: 'Sınır Dedektifi', en: 'Border Detective', icon: '🧭', levels: ['easy','medium','hard'] },
  { id: 'street', tr: 'Sokak Dedektifi', en: 'Street Detective', icon: '📍', levels: ['tour'] },
  { id: 'heritage', tr: 'Medeniyet Dedektifi', en: 'Civilization Detective', icon: '🏛️', levels: ['easy','medium'] },
  { id: 'daily', tr: 'Günlük Dünya Görevi', en: 'Daily World Quest', icon: '☀️', levels: ['daily'] },
];

export const GEO_REWARD_LEVELS: ReadonlyArray<GeoRewardLevel> = ['easy', 'medium', 'hard'];
const allModes = new Set<GeoRewardMode>(GEO_REWARD_SECTIONS.map(x => x.id));
function valid(mode: GeoRewardMode, level: GeoRewardLevel): boolean {
  return allModes.has(mode) && Boolean(GEO_REWARD_SECTIONS.find(x=>x.id===mode)?.levels.includes(level));
}
function normalized(n: unknown): number {
  return typeof n === 'number' && Number.isFinite(n) ? Math.max(0, Math.min(3, Math.trunc(n))) : 0;
}
function read(): SavedRewards {
  try {
    const raw: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return { stars: {}, dailyDates: [] };
    const parsed = raw as Partial<SavedRewards>;
    const stars = parsed.stars && typeof parsed.stars === 'object' && !Array.isArray(parsed.stars) ? parsed.stars : {};
    const dailyDates = Array.isArray(parsed.dailyDates)
      ? [...new Set(parsed.dailyDates.filter((day): day is string =>
          typeof day === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(day)))].slice(-366)
      : [];
    return { stars, dailyDates };
  } catch { return { stars: {}, dailyDates: [] }; }
}
function write(rewards: SavedRewards): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(rewards)); }
  catch { /* Game remains playable when device storage is unavailable. */ }
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(GEO_REWARDS_CHANGED));
}

/** Matches EraAtlas: completed stages only, at 70/80/90% for one/two/three stars. */
export function geoStarGrade(right: number, total: number, completed: boolean): number {
  if (!completed || !Number.isSafeInteger(right) || !Number.isSafeInteger(total) ||
      total < 5 || right < 0 || right > total) return 0;
  if (right * 100 >= total * 90) return 3;
  if (right * 100 >= total * 80) return 2;
  if (right * 100 >= total * 70) return 1;
  return 0;
}
export function getGeoStars(mode: GeoRewardMode, level: GeoRewardLevel): number {
  if (!valid(mode, level)) return 0;
  const stars = read().stars;
  return mode === 'street' && level === 'tour'
    ? Math.max(normalized(stars['street:tour']), normalized(stars['drone:tour']))
    : normalized(stars[mode + ':' + level]);
}
/** Replays can improve their best stars but can never erase previously earned stars. */
export function awardGeoStars(
  mode: GeoRewardMode, level: GeoRewardLevel, right: number, total: number,
  completed: boolean, dailyDate?: string,
): GeoAward {
  if (!valid(mode, level)) return { previous: 0, earned: 0, current: 0, gained: 0, newBadges: [] };
  const earned = geoStarGrade(right, total, completed);
  const beforeBadges = new Set(getGeoBadges().filter(x => x.unlocked).map(x => x.id));
  const saved = read();
  const key = mode + ':' + level;
  const previous = mode === 'street' && level === 'tour'
    ? Math.max(normalized(saved.stars[key]), normalized(saved.stars['drone:tour']))
    : normalized(saved.stars[key]);
  const current = Math.max(previous, earned);
  const dateValid = mode === 'daily' && completed && total >= 5
    && typeof dailyDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dailyDate);
  const newDay = dateValid && typeof dailyDate === 'string' && !saved.dailyDates.includes(dailyDate);
  if (current > previous || newDay) {
    saved.stars[key] = current;
    if (newDay && dailyDate) saved.dailyDates = [...saved.dailyDates, dailyDate].slice(-366);
    write(saved);
  }
  return {
    previous, earned, current, gained: current - previous,
    newBadges: getGeoBadges().filter(x => x.unlocked && !beforeBadges.has(x.id)),
  };
}
export function getGeoRewardOverview() {
  const saved = read();
  const stages = GEO_REWARD_SECTIONS.flatMap(section => section.levels
    .map(level => ({ mode: section.id, level, stars: section.id === 'street' && level === 'tour'
      ? Math.max(normalized(saved.stars['street:tour']),normalized(saved.stars['drone:tour']))
      : normalized(saved.stars[section.id + ':' + level]) })));
  return {
    stars: stages.reduce((sum, stage) => sum + stage.stars, 0),
    threeStars: stages.filter(x => x.stars === 3).length,
    clearedStages: stages.filter(x => x.stars > 0).length,
    possibleStars: stages.length * 3,
    countries: getDiscoveredCountries().length,
    dailyDays: saved.dailyDates.length,
    stages,
  };
}
export function getGeoBadges(): GeoBadge[] {
  const s = getGeoRewardOverview();
  const has = (mode: GeoRewardMode) => s.stages.some(x => x.mode === mode && x.stars > 0);
  const modes = ['nature', 'islands', 'borders'] as const;
  const b = (id: string, tr: string, en: string, detailTr: string, detailEn: string, icon: string, unlocked: boolean): GeoBadge =>
    ({ id, tr, en, detailTr, detailEn, icon, unlocked });
  return [
    b('first', 'İlk Rota', 'First Route', 'İlk aşamada yıldız kazan', 'Earn stars in your first stage', '🧭', s.clearedStages >= 1),
    b('triple', 'Üç Yıldızlı Kâşif', 'Three-Star Explorer', 'Bir aşamada üç yıldız kazan', 'Earn three stars in one stage', '🌟', s.threeStars >= 1),
    b('journey', 'Kıta Gezgini', 'Continent Traveler', 'Beş aşamayı başarıyla tamamla', 'Clear five stages', '🌎', s.clearedStages >= 5),
    b('atlas', 'Atlas Ustası', 'Atlas Master', 'Toplam 25 yıldız topla', 'Collect 25 stars', '🏆', s.stars >= 25),
    b('discover10', 'İz Sürücü', 'Trail Finder', 'On farklı ülke keşfet', 'Discover ten countries', '📍', s.countries >= 10),
    b('discover50', 'Harita Ustası', 'Map Master', '50 farklı ülke keşfet', 'Discover 50 countries', '🗺️', s.countries >= 50),
    b('discover100', 'Dünya Kâşifi', 'World Explorer', '100 farklı ülke keşfet', 'Discover 100 countries', '🌐', s.countries >= 100),
    b('flag', 'Bayrak Avcısı', 'Flag Hunter', 'Bayrak Arenası’nda yıldız kazan', 'Earn a star in Flag Arena', '🚩', has('flags')),
    b('nature', 'Doğa Rehberi', 'Nature Guide', 'Doğa Dedektifi’nde yıldız kazan', 'Earn a star in Nature Detective', '🏔️', has('nature')),
    b('islands', 'Ada Gezgini', 'Island Traveler', 'Ada Avcısı’nda yıldız kazan', 'Earn a star in Island Hunter', '🏝️', has('islands')),
    b('borders', 'Sınır Uzmanı', 'Border Expert', 'Sınır Dedektifi’nde yıldız kazan', 'Earn a star in Border Detective', '🧩', has('borders')),
    b('all-map', 'Üç Kıtanın İzi', 'Three Paths', 'Üç yeni coğrafya oyununda yıldız kazan', 'Earn stars in all three new geography games', '🗺️', modes.every(has)),
    b('street', 'Sokak İzleri', 'Street Trails', 'Sokak Dedektifi turunda yıldız kazan', 'Earn a star in a Street Detective tour', '🚶', has('street')),
    b('drone', 'Gökyüzü Gözcüsü', 'Sky Scout', 'Önceki hava turlarından kazanılan rozet', 'Badge earned from earlier aerial tours', '🛩️', normalized(read().stars['drone:tour'])>0),
    b('heritage', 'Medeniyet İzleri', 'Civilization Traces', 'Medeniyet Dedektifi’nde yıldız kazan', 'Earn a star in Civilization Detective', '🏛️', has('heritage')),
    b('daily', 'Güneşin Peşinde', 'Chasing the Sun', 'İlk günlük görevi bitir', 'Finish your first daily quest', '☀️', s.dailyDays >= 1),
    b('daily7', 'Yedi Günlük Yolcu', 'Seven-Day Traveler', 'Yedi ayrı günlük görevi bitir', 'Finish seven different daily quests', '🎒', s.dailyDays >= 7),
  ];
}
