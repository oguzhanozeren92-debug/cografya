/**
 * Atlas Arena native full-screen ads, only at completed-game transitions.
 * No ads over questions, panoramas or maps.
 * Rewarded hearts remain separately available by player request.
 */
import { Capacitor } from '@capacitor/core';
import { AdMob, InterstitialAdPluginEvents } from '@capacitor-community/admob';
import { initializeNativeAdSdk } from '@/lib/rewardedAds';

type Unit = { adId: string; isTesting: boolean };
const TEST_INTERSTITIAL = {
  ios: 'ca-app-pub-3940256099942544/4411468910',
  android: 'ca-app-pub-3940256099942544/1033173712',
};
function interstitialUnit(): Unit | null {
  if (!Capacitor.isNativePlatform()) return null;
  const platform = Capacitor.getPlatform();
  if (platform !== 'ios' && platform !== 'android') return null;
  const isTesting = import.meta.env.VITE_ADMOB_USE_TEST_ADS === 'true';
  const value = isTesting ? TEST_INTERSTITIAL[platform]
    : platform === 'ios' ? import.meta.env.VITE_ADMOB_INTERSTITIAL_IOS_ID
      : import.meta.env.VITE_ADMOB_INTERSTITIAL_ANDROID_ID;
  if (typeof value !== 'string' || !/^ca-app-pub-\d{16}\/\d{10}$/.test(value.trim())) return null;
  return { adId: value.trim(), isTesting };
}

const MIN_GAMES_BETWEEN_ADS = 3;
const MIN_MS_BETWEEN_ADS = 6 * 60 * 1000;
let gamesSinceAd = 0;
let lastInterstitialAt = 0;
let interstitialReady = false;
let interstitialPreparing: Promise<void> | null = null;
let interstitialShowing = false;
let interstitialListenersReady = false;

async function ensureInterstitialListeners() {
  if (interstitialListenersReady) return;
  await AdMob.addListener(InterstitialAdPluginEvents.Dismissed, () => {
    interstitialShowing = false;
    void preloadGameBreakAd();
  });
  await AdMob.addListener(InterstitialAdPluginEvents.FailedToShow, () => {
    interstitialShowing = false;
    void preloadGameBreakAd();
  });
  interstitialListenersReady = true;
}

/** Low-priority preload; never wait on this to transition into a round. */
export function preloadGameBreakAd(): Promise<void> {
  const unit = interstitialUnit();
  if (!unit || interstitialReady || interstitialShowing) return Promise.resolve();
  if (interstitialPreparing) return interstitialPreparing;
  interstitialPreparing = (async () => {
    if (!(await initializeNativeAdSdk())) return;
    await ensureInterstitialListeners();
    await AdMob.prepareInterstitial({ adId: unit.adId, isTesting: unit.isTesting });
    interstitialReady = true;
  })().catch(() => {
    interstitialReady = false;
  }).finally(() => { interstitialPreparing = null; });
  return interstitialPreparing;
}

/**
 * Call ONLY when an actual game/5-round match/10-question daily challenge finishes.
 * First two completed games are always ad-free; then at most one per three
 * completions AND six minutes. Nothing appears if SDK hasn't preloaded an ad.
 */
export function onGameFinished(): void {
  if (!Capacitor.isNativePlatform()) return;
  gamesSinceAd += 1;
  const now = Date.now();
  if (!interstitialReady || interstitialShowing ||
      gamesSinceAd < MIN_GAMES_BETWEEN_ADS ||
      (lastInterstitialAt > 0 && now - lastInterstitialAt < MIN_MS_BETWEEN_ADS)) {
    void preloadGameBreakAd();
    return;
  }
  interstitialReady = false;
  interstitialShowing = true;
  gamesSinceAd = 0;
  lastInterstitialAt = now;
  void AdMob.showInterstitial().catch(() => {
    interstitialShowing = false;
    // Never retry mid-game. The next natural break gets another chance.
    void preloadGameBreakAd();
  });
}
