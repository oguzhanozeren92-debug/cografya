/**
 * Google AdMob rewarded heart integration (Capacitor iOS/Android only).
 * The ad must be rewarded by the native SDK; dismissing it never grants a heart.
 * Production requires Coğrafya's OWN AdMob application IDs in native settings
 * and its OWN rewarded ad unit IDs in the Vite build environment.
 */
import { Capacitor } from '@capacitor/core';
import { App as NativeApp } from '@capacitor/app';
import { AdMob, AdmobConsentStatus } from '@capacitor-community/admob';

const TEST_IOS = 'ca-app-pub-3940256099942544/1712485313';
const TEST_ANDROID = 'ca-app-pub-3940256099942544/5224354917';

let initializing: Promise<boolean> | null = null;
let initialized = false;

function getNativeRewardedUnit(): { adId: string; isTesting: boolean } | null {
  if (!Capacitor.isNativePlatform()) return null;
  const platform = Capacitor.getPlatform();
  if (platform !== 'ios' && platform !== 'android') return null;

  // Explicitly enabled ONLY in a native test build. Never enable for a store release.
  const isTesting = import.meta.env.VITE_ADMOB_USE_TEST_ADS === 'true';
  const adId = isTesting
    ? (platform === 'ios' ? TEST_IOS : TEST_ANDROID)
    : (platform === 'ios' ? import.meta.env.VITE_ADMOB_REWARDED_IOS_ID : import.meta.env.VITE_ADMOB_REWARDED_ANDROID_ID);

  if (!adId || !/^ca-app-pub-\d{16}\/\d{10}$/.test(adId.trim())) return null;
  return { adId: adId.trim(), isTesting };
}

/** Native bridge plus a valid, platform-specific rewarded ad unit must exist. */
export function isRewardedHeartAvailable(): boolean {
  return initialized && getNativeRewardedUnit() !== null;
}

export function canConfigureNativeAds(): boolean {
  return getNativeRewardedUnit() !== null;
}

/**
 * Game Center must not present a competing system sheet while ATT is pending.
 * SDK initialization may fail for unrelated UMP/network reasons after ATT
 * has already been answered, so check authorization independently.
 */
export async function isIosTrackingPermissionResolved(): Promise<boolean> {
  if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'ios') return true;
  try {
    return (await AdMob.trackingAuthorizationStatus()).status !== 'notDetermined';
  } catch {
    return false;
  }
}

/**
 * iOS needs an active scene before it can present the system ATT alert.
 * A notDetermined status after requesting means the dialog was suppressed;
 * do not initialize the ads SDK until iOS actually resolves the decision.
 * Both "denied" and "restricted" are valid decisions; gameplay is unaffected.
 */
async function resolveIosTrackingBeforeAds(): Promise<boolean> {
  if (Capacitor.getPlatform() !== 'ios') return true;
  try {
    const current = await AdMob.trackingAuthorizationStatus();
    if (current.status !== 'notDetermined') return true;

    // Allow Capacitor's first frame / iPad scene activation to finish.
    // Calling ATT while the app is inactive silently suppresses the alert.
    await new Promise<void>(resolve => setTimeout(resolve, 450));
    if (!(await NativeApp.getState()).isActive) {
      console.warn('[Globriva] ATT ertelendi: uygulama ön planda değil');
      return false;
    }

    await AdMob.requestTrackingAuthorization();
    const next = await AdMob.trackingAuthorizationStatus();
    if (next.status === 'notDetermined') {
      console.warn('[Globriva] ATT henüz sonuçlanmadı; reklam başlatılmadı');
      return false;
    }
    return true;
  } catch (error) {
    console.warn('[Globriva] ATT durumu doğrulanamadı; reklam başlatılmadı', error);
    return false;
  }
}

/**
 * ATT is resolved BEFORE UMP, Mobile Ads initialization, or any ad request.
 * This is independent of whether UMP requires a consent form in the user's
 * country. If iOS suppresses the system alert, the SDK stays uninitialized;
 * the foreground listener in App.tsx retries the flow on resume.
 */
export async function initializeNativeAdSdk(): Promise<boolean> {
  if (!Capacitor.isNativePlatform() || !['ios','android'].includes(Capacitor.getPlatform())) return false;
  if (initialized) return true;
  if (initializing) return initializing;
  initializing = (async () => {
    if (!(await resolveIosTrackingBeforeAds())) return false;

    try {
      let consent = await AdMob.requestConsentInfo();
      if (consent.isConsentFormAvailable && consent.status === AdmobConsentStatus.REQUIRED) {
        consent = await AdMob.showConsentForm();
      }
      // Only UMP can authorize requesting ads. Never bypass a denied/unknown
      // consent decision when its network request or privacy form fails.
      if (!consent.canRequestAds) return false;
    } catch (error) {
      console.warn('[Globriva] Reklam gizlilik onayı tamamlanamadı; reklam başlatılmadı', error);
      return false;
    }

    await AdMob.initialize();
    initialized = true;
    return true;
  })().catch((error: unknown) => {
    console.warn('[Globriva] Reklam SDK başlatılamadı', error);
    return false;
  }).finally(() => { initializing = null; });
  return initializing;
}

/** Rewarded availability must still require its own platform-specific ad unit. */
export async function initializeRewardedAds(): Promise<boolean> {
  return getNativeRewardedUnit() !== null && initializeNativeAdSdk();
}

/** Show UMP privacy options only on native, never simulate this on the web. */
export async function openAdPrivacyOptions(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  await AdMob.showPrivacyOptionsForm();
  // Allow a fresh consent decision to take effect on the next ad attempt.
  initialized = false;
}

/** True only for a positive native SDK reward. No reward for ad close/failure. */
export async function watchRewardedHeartAd(): Promise<boolean> {
  const config = getNativeRewardedUnit();
  if (!config || !(await initializeRewardedAds())) {
    throw new Error('Ödüllü reklam henüz kullanılamıyor.');
  }
  try {
    await AdMob.prepareRewardVideoAd({ adId: config.adId, isTesting: config.isTesting });
    const reward = await AdMob.showRewardVideoAd({ adId: config.adId });
    return typeof reward?.amount === 'number' && reward.amount > 0;
  } catch (error) {
    console.warn('[Coğrafya] Ödüllü reklam tamamlanmadı', error);
    return false;
  }
}
export type HintAdResult = 'rewarded' | 'dismissed' | 'unavailable';

/**
 * Rewarded ad for an optional hint. When no ad can be loaded (no fill, SDK
 * not ready, offline) the caller unlocks the hint anyway, so the button never
 * looks broken. Only a player who closes a loaded ad early gets no hint.
 */
export async function watchRewardedAdForHint(): Promise<HintAdResult> {
  const config = getNativeRewardedUnit();
  if (!config) return 'unavailable';
  try {
    if (!(await initializeRewardedAds())) return 'unavailable';
    await AdMob.prepareRewardVideoAd({ adId: config.adId, isTesting: config.isTesting });
  } catch (error) {
    console.warn('[Globriva] Ödüllü reklam yüklenemedi', error);
    return 'unavailable';
  }
  try {
    const reward = await AdMob.showRewardVideoAd({ adId: config.adId });
    return typeof reward?.amount === 'number' && reward.amount > 0 ? 'rewarded' : 'dismissed';
  } catch (error) {
    console.warn('[Globriva] Ödüllü reklam tamamlanmadı', error);
    return 'dismissed';
  }
}
