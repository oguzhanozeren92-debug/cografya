# Globriva — Game Center

The iOS app signs in to Game Center at launch (Apple's own banner/sheet), submits
scores and unlocks achievements. Everything is a no-op on the web, on Android and
for players who are not signed in.

Code: `native/game-center` (in-repo Capacitor plugin, Swift Package) and
`src/lib/gameCenter.ts`. No third-party plugin is used.

## App Store Connect setup (one time)

App Store Connect → Apps → Globriva → **Services** → **Game Center**:

### Leaderboards (Classic, "High Score", sort High to Low, format Integer)

| Reference name | Leaderboard ID | Score range |
|---|---|---|
| Sokak Dedektifi | `globriva.street.tour` | 0 – 25000 |
| Dünya Turu | `globriva.world.quiz` | 0 – 1000000 |

### Achievements (100 points total is plenty)

| Reference name | Achievement ID | Points | Hidden |
|---|---|---|---|
| İlk Sokak Turu | `globriva.ach.first_street_tour` | 10 | No |
| Keskin Göz (bir turda 4.900+ puan) | `globriva.ach.sharp_eye` | 20 | No |
| Usta Dedektif (bir turda 20.000+) | `globriva.ach.master_detective` | 40 | No |
| Dünya Kâşifi (Dünya Turu'nda 3.000+) | `globriva.ach.quiz_3000` | 30 | No |

Each needs a Turkish and English localization (title, description, image 512×512 or 1024×1024).

Then on the **version page** (App Store tab → the version you submit) tick
**Game Center** and add the leaderboards and achievements to that version.

IDs in App Store Connect must match `GC_LEADERBOARDS` / `GC_ACHIEVEMENTS` in
`src/lib/gameCenter.ts` exactly.
