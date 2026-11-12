/**
 * Google AdMob rewarded heart integration (Capacitor iOS/Android only).
 * The ad must be rewarded by the native SDK; dismissing it never grants a heart.
 * Production requires Coğrafya's OWN AdMob application IDs in native settings
 * and its OWN rewarded ad unit IDs in the Vite build environment.
 */
import { Capacitor } from '@capacitor/core';
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
 * UMP privacy consent is refreshed at launch. Google Mobile Ads is initialized
 * only after the SDK confirms that ads may be requested (v8.2 consent flow).
 */
export async function initializeNativeAdSdk(): Promise<boolean> {
  if (!Capacitor.isNativePlatform() || !['ios','android'].includes(Capacitor.getPlatform())) return false;
  if (initialized) return true;
  if (initializing) return initializing;
  initializing = (async () => {
    let consent = await AdMob.requestConsentInfo();
    if (consent.isConsentFormAvailable && consent.status === AdmobConsentStatus.REQUIRED) {
      consent = await AdMob.showConsentForm();
    }
    if (!consent.canRequestAds) return false;
    // iOS App Tracking Transparency: ask once, after the privacy (UMP) form.
    // Ads still load when the player declines (non-personalized).
    if (Capacitor.getPlatform() === 'ios') {
      try {
        const { status } = await AdMob.trackingAuthorizationStatus();
        if (status === 'notDetermined') await AdMob.requestTrackingAuthorization();
      } catch (error) {
        console.warn('[Globriva] ATT izni sorulamadı', error);
      }
    }
    await AdMob.initialize();
    initialized = true;
    return true;
  })().catch((error: unknown) => {
    console.warn('[Coğrafya] Ödüllü reklam başlatılamadı', error);
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