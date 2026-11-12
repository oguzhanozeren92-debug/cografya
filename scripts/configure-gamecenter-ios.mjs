// Adds the Game Center entitlement to the generated Capacitor iOS project.
// App Store Connect refuses Game Center for builds without
// com.apple.developer.game-center in the signed entitlements.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

const ent = 'ios/App/App/App.entitlements';
const pbx = 'ios/App/App.xcodeproj/project.pbxproj';
if (!existsSync(pbx)) { console.log('iOS project not found; skipped.'); process.exit(0); }

let plist = existsSync(ent) ? readFileSync(ent, 'utf8') : `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
</dict>
</plist>
`;
if (!plist.includes('com.apple.developer.game-center')) {
  plist = plist.replace(/<dict>/, '<dict>\n\t<key>com.apple.developer.game-center</key>\n\t<true/>');
}
writeFileSync(ent, plist);

let proj = readFileSync(pbx, 'utf8');
if (!proj.includes('CODE_SIGN_ENTITLEMENTS')) {
  let n = 0;
  proj = proj.replace(/(\n(\s*)INFOPLIST_FILE = App\/Info\.plist;)/g, (m, line, ws) => {
    n++;
    return `\n${ws}CODE_SIGN_ENTITLEMENTS = App/App.entitlements;${line}`;
  });
  if (n === 0) throw new Error('App target build settings not found in project.pbxproj');
  writeFileSync(pbx, proj);
  console.log(`Game Center entitlement linked in ${n} build configuration(s).`);
} else {
  console.log('CODE_SIGN_ENTITLEMENTS already set.');
}
if (!readFileSync(pbx, 'utf8').includes('CODE_SIGN_ENTITLEMENTS = App/App.entitlements;')) {
  throw new Error('Game Center entitlement was not applied.');
}
