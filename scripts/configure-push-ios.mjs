import { existsSync, readFileSync, writeFileSync } from 'node:fs';
const path = 'ios/App/App/AppDelegate.swift';
if (!existsSync(path)) { console.log('iOS AppDelegate not found; skipped.'); process.exit(0); }
const file = readFileSync(path, 'utf8');
if (file.includes('capacitorDidRegisterForRemoteNotifications') &&
    file.includes('capacitorDidFailToRegisterForRemoteNotifications')) { console.log('APNs callbacks already configured.'); process.exit(0); }
const pos = file.lastIndexOf('\n}');
if (pos < 0) throw new Error('AppDelegate.swift syntax not recognized.');
const extra = [
'    // Forward APNs token events to Capacitor push plugin.',
'    func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {',
'        NotificationCenter.default.post(name: .capacitorDidRegisterForRemoteNotifications, object: deviceToken)',
'    }',
'',
'    func application(_ application: UIApplication, didFailToRegisterForRemoteNotificationsWithError error: Error) {',
'        NotificationCenter.default.post(name: .capacitorDidFailToRegisterForRemoteNotifications, object: error)',
'    }',
'',
].join('\n');
writeFileSync(path, file.slice(0,pos) + '\n' + extra + file.slice(pos));
console.log('APNs AppDelegate callback forwarding enabled.');
