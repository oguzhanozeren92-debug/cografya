/**
 * Globriva: non-secret App Store submission preflight.
 * This is a static gate, not a device test or Apple's approval.
 * Run after npm ci: node scripts/app-store-preflight.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const errors = [];
const read = name => fs.readFileSync(path.join(root,name),'utf8');
function check(ok,message){if(!ok)errors.push(message);}
const requiredFiles=[
  'public/privacy.html','public/support.html','resources/icon.png',
  'capacitor.config.ts','src/components/StartScreen.tsx','codemagic.yaml'
];
for(const filename of requiredFiles)check(fs.existsSync(path.join(root,filename)),'Missing '+filename);
if(errors.length){console.error(errors.join('\n'));process.exit(1);}
const privacy=read('public/privacy.html'),support=read('public/support.html'),
start=read('src/components/StartScreen.tsx'),config=read('capacitor.config.ts'),
pipeline=read('codemagic.yaml');
check(/Globriva/.test(privacy)&&/Privacy Policy/.test(privacy)&&/Gizlilik Politikası/.test(privacy),'Privacy policy must be bilingual and brand-correct');
check(!/pre-release notice|this page is a draft|doğrulanmış doğrudan destek e-posta|yayın öncesi bilgilendirme/i.test(privacy),'Privacy page contains review-time placeholders');
check(/mailto:tarlapusula@gmail\.com/i.test(privacy)&&/mailto:tarlapusula@gmail\.com/i.test(support),'Privacy and support contact missing');
check(/veri silme talebi/i.test(privacy)&&/data deletion request/i.test(privacy),'Privacy policy must explain deletion requests');
check(/\/privacy\.html/.test(start)&&/\/support\.html/.test(start),'App home must link privacy and support');
check(/appId:\s*'com\.oguzhanozeren\.cografya'/.test(config),'App bundle ID changed: verify App Store Connect registration');
check(/submit_to_app_store:\s*false/.test(pipeline),'Code pushes must never auto-submit to App Store');
check(/xcode:\s*latest/.test(pipeline),'Use up-to-date Xcode for iOS 26 SDK');
const icon=fs.readFileSync(path.join(root,'resources/icon.png'));
check(icon.length>8192&&icon.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])),'App icon missing or invalid PNG');
console.log(JSON.stringify({
  status:errors.length?'FAIL':'PASS',app:'Globriva',
  checks:requiredFiles.length+8,errors,
  note:'Review metadata, consent/ATT, real iPhone/iPad tests, entitlement/signing and App Store Connect remain manual gates.'
},null,2));
if(errors.length)process.exitCode=1;
