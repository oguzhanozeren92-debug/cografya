/**
 * Atlas Arena's intentionally quiet native ad placements.
 * No web mock ads; no adverts over quizzes, 360° imagery, maps or answer buttons.
 * All formats require valid platform-specific units and a successful UMP consent flow.
 */
import { Capacitor } from '@capacitor/core';
import {
  AdMob, BannerAdPluginEvents, BannerAdPosition, BannerAdSize,
  InterstitialAdPluginEvents,
} from '@capacitor-community/admob';
import { initializeNativeAdSdk } from '@/lib/rewardedAds';

type Placement = 'banner' | 'interstitial';
const TEST_IDS = {
  ios: {
    banner: 'ca-app-pub-3940256099942544/2934735716',
    interstitial: 'ca-app-pub-3940256099942544/4411468910',
  },
  android: {
    banner: 'ca-app-pub-3940256099942544/6300978111',
    interstitial: 'ca-app-pub-3940256099942544/1033173712',
  },
};
type Unit = { adId: string; isTesting: boolean };
function adUnit(placement: Placement): Unit | null {
  if (!Capacitor.isNativePlatform()) return null;
  const platform = Capacitor.getPlatform();
  if (platform !== 'ios' && platform !== 'android') return null;
  const isTesting = import.meta.env.VITE_ADMOB_USE_TEST_ADS === 'true';
  const value = isTesting
    ? TEST_IDS[platform][placement]
    : placement === 'banner'
      ? (platform === 'ios' ? import.meta.env.VITE_ADMOB_BANNER_IOS_ID : import.meta.env.VITE_ADMOB_BANNER_ANDROID_ID)
      : (platform === 'ios' ? import.meta.env.VITE_ADMOB_INTERSTITIAL_IOS_ID : import.meta.env.VITE_ADMOB_INTERSTITIAL_ANDROID_ID);
  if (typeof value !== 'string' || !/^ca-app-pub-\d{16}\/\d{10}$/.test(value.trim())) return null;
  return { adId: value.trim(), isTesting };
}

let bannerWanted = false;
let bannerShown = false;
let bannerListenersReady = false;
let bannerQueue = Promise.resolve();
function setBannerInset(height: number): void {
  if (typeof document === 'undefined') return;
  const safeHeight = Math.max(0, Math.min(130, height));
  document.documentElement.style.setProperty('--atlas-native-banner-height', safeHeight + 'px');
  document.documentElement.classList.toggle('atlas-native-banner-visible', safeHeight > 0);
}
async function ensureBannerListeners(): Promise<void> {
  if (bannerListenersReady) return;
  // Native callbacks expose actual adaptive height so the bottom menu stays tappable.
  await AdMob.addListener(BannerAdPluginEvents.SizeChanged, size => {
    if (bannerWanted) setBannerInset(size.height);
  });
  await AdMob.addListener(BannerAdPluginEvents.Loaded, () => {
    if (bannerWanted) setBannerInset(60);
  });
  await AdMob.addListener(BannerAdPluginEvents.FailedToLoad, () => setBannerInset(0));
  bannerListenersReady = true;
}

/** Serializes show/hide so an asynchronous consent prompt cannot leave a banner over a game. */
export function setHomeBannerVisible(visible: boolean): void {
  if (!Capacitor.isNativePlatform()) return;
  bannerWanted = visible;
  bannerQueue = bannerQueue.catch(() => undefined).then(async () => {
    if (!bannerWanted) {
      if (bannerShown) {
        try { await AdMob.removeBanner(); } catch { /* No ad may be loaded. */ }
        bannerShown = false;
      }
      setBannerInset(0);
      return;
    }
    const unit = adUnit('banner');
    if (!unit || !(await initializeNativeAdSdk()) || !bannerWanted) return;
    if (bannerShown) return;
    try {
      await ensureBannerListeners();
      if (!bannerWanted) return;
      await AdMob.showBanner({
        adId: unit.adId, isTesting: unit.isTesting,
        adSize: BannerAdSize.ADAPTIVE_BANNER,
        position: BannerAdPosition.BOTTOM_CENTER, margin: 0,
      });
      bannerShown = true;
      if (!bannerWanted) {
        await AdMob.removeBanner();
        bannerShown = false;
        setBannerInset(0);
      }
    } catch {
      bannerShown = false;
      setBannerInset(0);
      // Failure must never block entering the game.
    }
  });
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
  const unit = adUnit('interstitial');
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
