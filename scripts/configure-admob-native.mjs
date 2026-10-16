/** Configure native AdMob App IDs after `npx cap add ios/android`.
 *
 * Env: ADMOB_APP_ID_IOS, ADMOB_APP_ID_ANDROID (ca-app-pub-...~...)
 * For native test builds ONLY: ADMOB_USE_GOOGLE_TEST_APP_IDS=true
 * Atlas Arena iOS production IDs are in .env.production (public IDs, no secrets).
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { loadEnv } from 'vite';

const TEST_APP_IDS = {
  android: 'ca-app-pub-3940256099942544~3347511713',
  ios: 'ca-app-pub-3940256099942544~1458002511',
};
// Reads public production App IDs from .env.production while allowing CI overrides.
const nativeEnv = loadEnv('production', process.cwd(), '');
const readSetting = (key) => process.env[key] || nativeEnv[key];
const testing = readSetting('ADMOB_USE_GOOGLE_TEST_APP_IDS') === 'true';

function appId(platform) {
  const id = testing ? TEST_APP_IDS[platform]
    : readSetting(platform === 'ios' ? 'ADMOB_APP_ID_IOS' : 'ADMOB_APP_ID_ANDROID');
  if (!id) return null;
  if (!/^ca-app-pub-\d{16}~\d{10}$/.test(id)) {
    throw new Error(`Invalid AdMob ${platform} app ID. Use ca-app-pub-...~... (NOT / ad unit ID).`);
  }
  return id;
}

function updateFile(path, update) {
  if (!existsSync(path)) return false;
  const before = readFileSync(path, 'utf8');
  const after = update(before);
  if (before !== after) writeFileSync(path, after);
  return true;
}

const androidId = appId('android');
const iosId = appId('ios');
let updated = 0;

if (androidId) {
  const path = 'android/app/src/main/AndroidManifest.xml';
  if (updateFile(path, xml => {
    if (xml.includes('com.google.android.gms.ads.APPLICATION_ID')) {
      return xml.replace(/<meta-data\s+android:name="com\.google\.android\.gms\.ads\.APPLICATION_ID"[^>]*\/>/, `<meta-data android:name="com.google.android.gms.ads.APPLICATION_ID" android:value="${androidId}" />`);
    }
    const result = xml.replace(/(<application\b[^>]*>)/, `$1\n        <meta-data android:name="com.google.android.gms.ads.APPLICATION_ID" android:value="${androidId}" />`);
    if (result === xml) throw new Error('AndroidManifest.xml application tag not found');
    return result;
  })) { updated++; console.log('Android AdMob App ID configured.'); }
}

if (iosId) {
  const path = 'ios/App/App/Info.plist';
  if (updateFile(path, xml => {
    const pair = `<key>GADApplicationIdentifier</key>\n\t<string>${iosId}</string>`;
    if (xml.includes('<key>GADApplicationIdentifier</key>')) {
      xml = xml.replace(/<key>GADApplicationIdentifier<\/key>\s*<string>[^<]*<\/string>/, pair);
    } else {
      const last = xml.lastIndexOf('</dict>');
      if (last < 0) throw new Error('Info.plist root dict missing');
      xml = xml.slice(0,last) + '\t' + pair + '\n' + xml.slice(last);
    }
    if (!xml.includes('<key>NSUserTrackingUsageDescription</key>')) {
      const last = xml.lastIndexOf('</dict>');
      xml = xml.slice(0,last) + '\t<key>NSUserTrackingUsageDescription</key>\n\t<string>İzin verirseniz reklamları ilgi alanlarınıza göre sunmak için cihaz tanımlayıcısı kullanılabilir.</string>\n' + xml.slice(last);
    }
    return xml;
  })) { updated++; console.log('iOS AdMob App ID configured.'); }
}

if (!updated) {
  throw new Error('No matching native platform and App ID found. First run npx cap add ios/android, then set ADMOB_APP_ID_IOS/ANDROID; for testing explicitly set ADMOB_USE_GOOGLE_TEST_APP_IDS=true.');
}
console.log(testing ? 'Google SAMPLE App IDs configured (TEST BUILDS ONLY).' : 'App-specific AdMob IDs configured.');