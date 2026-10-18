/** Fail store packaging if AdMob release identity is incomplete or test units are active. */
import { readFileSync, existsSync } from 'node:fs';
import { loadEnv } from 'vite';
const nativeEnv = loadEnv('production', process.cwd(), '');
const readSetting = (key) => process.env[key] || nativeEnv[key];
const android = 'android/app/src/main/AndroidManifest.xml';
const ios = 'ios/App/App/Info.plist';
const requested = process.env.CAPACITOR_PLATFORM;
const platforms = requested ? [requested] : ['android', 'ios'].filter(p => existsSync(p === 'android' ? android : ios));
if (!platforms.length) throw new Error('No native platform is generated. Use npx cap add ios/android.');
if (readSetting('VITE_ADMOB_USE_TEST_ADS') === 'true' || readSetting('ADMOB_USE_GOOGLE_TEST_APP_IDS') === 'true') {
  throw new Error('Refusing store release with Google test ads enabled.');
}
for (const platform of platforms) {
  const file = platform === 'android' ? android : ios;
  if (!existsSync(file)) throw new Error(`Native ${platform} project is missing.`);
  const contents = readFileSync(file, 'utf8');
  const appId = platform === 'android'
    ? contents.match(/android:name="com\.google\.android\.gms\.ads\.APPLICATION_ID"[^>]*android:value="([^"]+)"/i)?.[1]
    : contents.match(/<key>GADApplicationIdentifier<\/key>\s*<string>([^<]+)<\/string>/)?.[1];
  if (!appId || !/^ca-app-pub-\d{16}~\d{10}$/.test(appId) || appId.includes('3940256099942544')) {
    throw new Error(`Missing real ${platform} AdMob App ID.`);
  }
  const envKey = platform === 'android' ? 'VITE_ADMOB_REWARDED_ANDROID_ID' : 'VITE_ADMOB_REWARDED_IOS_ID';
  const unit = readSetting(envKey);
  if (!unit || !/^ca-app-pub-\d{16}\/\d{10}$/.test(unit) || unit.includes('3940256099942544')) {
    throw new Error(`Missing real ${platform} rewarded ad unit: ${envKey}`);
  }
}
// Banner and interstitial are optional, but any configured production unit must be real.
// Avoid passing Google demo IDs into App Store / Play Store builds.
for (const platform of platforms) {
  for (const format of ['BANNER','INTERSTITIAL']) {
    const key = `VITE_ADMOB_${format}_${platform.toUpperCase()}_ID`;
    const value = readSetting(key);
    if (value && (!/^ca-app-pub-\d{16}\/\d{10}$/.test(value) || value.includes('3940256099942544'))) {
      throw new Error(`Invalid or Google test ${format} unit for ${platform}: ${key}`);
    }
  }
}
console.log('AdMob native app identity and enabled ad units are validated for release.');