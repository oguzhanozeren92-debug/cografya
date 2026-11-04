#!/usr/bin/env node
/**
 * Codemagic / Capacitor 8 iOS preflight.
 *
 * Some generated SPM projects reference App/config.xml, App/public and
 * App/capacitor.config.json in PBXResourcesBuildPhase even when cap sync has
 * not materialized them. Xcode then reports CpResource "no such file".
 *
 * Never delete or replace healthy generated resources. Recover only when
 * missing, from the Vite build and the repository's Capacitor config.
 */
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const project = 'ios/App/App.xcodeproj';
const root = 'ios/App/App';
const webDir = 'dist';
const publicDir = join(root, 'public');
const hasWebIndex = () => existsSync(join(webDir, 'index.html'));
const hasNativeIndex = () => existsSync(join(publicDir, 'index.html'));
if (!existsSync(project)) throw new Error('Missing ios/App/App.xcodeproj: first run npx cap add ios');
console.log('[iOS resources] cwd:', process.cwd(), 'dist:', existsSync(webDir), 'native public:', existsSync(publicDir));
// Capacitor's generated project can contain valid assets even when the temporary
// web build folder is no longer available. Do not fail on a missing dist in that case.
if (!hasWebIndex() && !hasNativeIndex()) {
  console.warn('[iOS resources] No web index found after Capacitor sync; rebuilding Vite assets once.');
  const build = spawnSync(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', 'build'], { stdio: 'inherit' });
  if (build.status !== 0) throw new Error('Unable to rebuild missing web assets; npm run build returned ' + build.status);
}
if (!hasWebIndex() && !hasNativeIndex()) {
  throw new Error('Both dist/index.html and ios/App/App/public/index.html are missing after rebuild. Check Vite output and Capacitor webDir.');
}

const source = readFileSync('capacitor.config.ts', 'utf8');
function readString(key) {
  const match = source.match(new RegExp('\\b' + key + '\\s*:\\s*[\x27\x22]([^\x27\x22]+)[\x27\x22]'));
  if (!match) throw new Error('Missing required Capacitor config setting: ' + key);
  return match[1];
}
const appId = readString('appId');
const appName = readString('appName');
if (appId !== 'com.oguzhanozeren.cografya') {
  throw new Error('Unexpected Globriva bundle identifier: ' + appId);
}
mkdirSync(root, { recursive: true });

if (!hasNativeIndex()) {
  if (!hasWebIndex()) throw new Error('Cannot recover native public assets without dist/index.html');
  mkdirSync(publicDir, { recursive: true });
  cpSync(webDir, publicDir, { recursive: true, force: true });
  console.log('[iOS resources] Recovered web assets from dist into App/public');
}
if (!existsSync(join(publicDir, 'index.html'))) throw new Error('App/public/index.html still missing');

const configJson = join(root, 'capacitor.config.json');
if (!existsSync(configJson)) {
  const config = {
    appId,
    appName,
    webDir: readString('webDir'),
    backgroundColor: readString('backgroundColor')
  };
  writeFileSync(configJson, JSON.stringify(config, null, 2) + '\n');
  console.log('[iOS resources] Recovered App/capacitor.config.json');
} else {
  const config = JSON.parse(readFileSync(configJson, 'utf8'));
  if (config.appId && config.appId !== appId) throw new Error('Generated capacitor.config.json has wrong appId');
}
const cordovaXml = join(root, 'config.xml');
if (!existsSync(cordovaXml)) {
  const escape = text => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  writeFileSync(cordovaXml, `<?xml version="1.0" encoding="UTF-8"?>
<widget id="${escape(appId)}" version="1.0.0" xmlns="http://www.w3.org/ns/widgets">
  <name>${escape(appName)}</name>
</widget>
`);
  console.log('[iOS resources] Recovered App/config.xml');
}
for (const filename of ['config.xml', 'capacitor.config.json']) {
  if (!existsSync(join(root, filename))) throw new Error('Missing native resource: ' + filename);
}
if (readdirSync(publicDir).length === 0) throw new Error('iOS App/public directory is empty');
console.log('[iOS resources] PASS: config.xml, public/index.html and capacitor.config.json exist');
