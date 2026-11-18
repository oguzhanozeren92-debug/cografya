import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = path => readFileSync(path, 'utf8');
const ad = read('src/lib/rewardedAds.ts');
const app = read('src/App.tsx');
const main = read('src/main.tsx');
const nativeConfig = read('scripts/configure-admob-native.mjs');
const releaseGate = read('scripts/validate-admob-release.mjs');
const pipeline = read('codemagic.yaml');

test('ATT authorization precedes UMP, AdMob initialization and ad loading', () => {
  const att = ad.indexOf('await AdMob.requestTrackingAuthorization()');
  const ump = ad.indexOf('await AdMob.requestConsentInfo()');
  const sdk = ad.indexOf('await AdMob.initialize()');
  assert.ok(att >= 0 && ump > att && sdk > ump, 'ATT, UMP and SDK order changed');
  assert.match(ad, /if \(!\(await resolveIosTrackingBeforeAds\(\)\)\) return false;/);
  assert.match(ad, /if \(!consent\.canRequestAds\) return false;/);
  assert.match(ad, /if \(next\.status === 'notDetermined'\) \{[\s\S]*?return false;/);
});

test('foreground retry and Game Center cannot preempt unresolved ATT', () => {
  assert.match(app, /NativeApp\.addListener\('appStateChange'/);
  assert.match(app, /isIosTrackingPermissionResolved\(\)\.then\(resolved =>/);
  assert.match(app, /if \(mounted && resolved\) void signInToGameCenter\(\)/);
});

test('native store binaries do not render the web admin dashboard', () => {
  assert.match(main, /!Capacitor\.isNativePlatform\(\) && window\.location\.hash === '#admin'/);
});

test('native release config adds ATT purpose string and refuses test ads', () => {
  assert.match(nativeConfig, /NSUserTrackingUsageDescription/);
  assert.match(releaseGate, /iOS AppTrackingTransparency usage description missing/);
  assert.match(pipeline, /VITE_ADMOB_USE_TEST_ADS: "false"/);
  assert.match(pipeline, /CAPACITOR_PLATFORM=ios npm run native:release:check/);
});
