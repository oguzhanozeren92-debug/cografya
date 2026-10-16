/**
 * Rewarded AdMob adapter for a Capacitor native shell.
 * IMPORTANT: The native host must register/initialize AdMob and obtain consent
 * before showing ads. Vite in a regular browser cannot display native AdMob.
 * This module only accepts a *reward result*, never an ad-dismiss event.
 */
type Reward = { amount: number; type: string };
type NativeAdMob = {
  prepareRewardVideoAd(options: { adId: string; isTesting?: boolean }): Promise<unknown>;
  showRewardVideoAd(options?: { adId?: string }): Promise<Reward>;
};
type NativeCapacitor = {
  isNativePlatform?: () => boolean;
  getPlatform?: () => string;
  Plugins?: { AdMob?: NativeAdMob };
};

declare global {
  interface Window { Capacitor?: NativeCapacitor }
}

const IOS_TEST_UNIT = 'ca-app-pub-3940256099942544/1712485313';
const ANDROID_TEST_UNIT = 'ca-app-pub-3940256099942544/5224354917';

function nativeAdConfig(): { plugin: NativeAdMob; adId: string; testing: boolean } | null {
  if (typeof window === 'undefined') return null;
  const cap = window.Capacitor;
  if (!cap?.isNativePlatform?.() || !cap.Plugins?.AdMob) return null;
  const platform = cap.getPlatform?.();
  if (platform !== 'ios' && platform !== 'android') return null;
  // Test units are allowed only in a development build; never ship them in production.
  const testing = import.meta.env.DEV && import.meta.env.VITE_ADMOB_USE_TEST_ADS === 'true';
  const adId = testing ? (platform === 'ios' ? IOS_TEST_UNIT : ANDROID_TEST_UNIT)
    : (platform === 'ios' ? import.meta.env.VITE_ADMOB_REWARDED_IOS_ID : import.meta.env.VITE_ADMOB_REWARDED_ANDROID_ID);
  if (!adId?.trim()) return null;
  return { plugin: cap.Plugins.AdMob, adId: adId.trim(), testing };
}

export function isRewardedHeartAvailable(): boolean {
  return nativeAdConfig() !== null;
}

/** Resolves true only after the Google Mobile Ads SDK reports an earned reward. */
export async function watchRewardedHeartAd(): Promise<boolean> {
  const setup = nativeAdConfig();
  if (!setup) throw new Error('Ödüllü reklam henüz hazır değil. Oyunu reklam izlemeden bitirebilirsin.');
  const { plugin, adId, testing } = setup;
  try {
    await plugin.prepareRewardVideoAd({ adId, isTesting: testing });
    const reward = await plugin.showRewardVideoAd({ adId });
    return typeof reward?.amount === 'number' && reward.amount > 0;
  } catch {
    // A closed, unavailable, or failed ad must never give a heart.
    return false;
  }
}