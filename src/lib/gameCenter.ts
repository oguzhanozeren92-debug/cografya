import { Capacitor, registerPlugin } from '@capacitor/core';

/**
 * Apple Game Center (iOS app only). Every call is a no-op on the web, on Android
 * and when the player is not signed in, so gameplay never depends on it.
 * IDs must match the leaderboards/achievements created in App Store Connect
 * (see docs/GAME_CENTER.md).
 */
export const GC_LEADERBOARDS = {
  streetTour: 'globriva.street.tour',
  worldQuiz: 'globriva.world.quiz',
} as const;
export const GC_ACHIEVEMENTS = {
  firstStreetTour: 'globriva.ach.first_street_tour',
  sharpEye: 'globriva.ach.sharp_eye',
  masterDetective: 'globriva.ach.master_detective',
  quizExplorer: 'globriva.ach.quiz_3000',
} as const;

interface GlobrivaGameCenterPlugin {
  signIn(): Promise<{ signedIn: boolean }>;
  isSignedIn(): Promise<{ signedIn: boolean }>;
  submitScore(options: { leaderboardId: string; score: number }): Promise<{ submitted: boolean }>;
  reportAchievement(options: { achievementId: string; percent?: number }): Promise<{ reported: boolean }>;
  showLeaderboards(): Promise<{ shown: boolean }>;
}

const plugin = registerPlugin<GlobrivaGameCenterPlugin>('GlobrivaGameCenter');
export const gameCenterAvailable = (): boolean =>
  Capacitor.getPlatform() === 'ios' && Capacitor.isPluginAvailable('GlobrivaGameCenter');

let signInPromise: Promise<boolean> | null = null;
export function signInToGameCenter(): Promise<boolean> {
  if (!gameCenterAvailable()) return Promise.resolve(false);
  signInPromise ??= plugin.signIn().then(r => r.signedIn).catch(() => false);
  return signInPromise;
}
export async function submitGameCenterScore(leaderboardId: string, score: number): Promise<void> {
  if (!gameCenterAvailable() || !Number.isInteger(score) || score < 0) return;
  try { if (await signInToGameCenter()) await plugin.submitScore({ leaderboardId, score }); }
  catch { /* Game Center is optional */ }
}
export async function unlockGameCenterAchievement(achievementId: string): Promise<void> {
  if (!gameCenterAvailable()) return;
  try { if (await signInToGameCenter()) await plugin.reportAchievement({ achievementId, percent: 100 }); }
  catch { /* Game Center is optional */ }
}
export async function showGameCenterLeaderboards(): Promise<boolean> {
  if (!gameCenterAvailable()) return false;
  try { return (await signInToGameCenter()) && (await plugin.showLeaderboards()).shown; }
  catch { return false; }
}
