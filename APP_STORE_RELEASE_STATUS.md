# Globriva — iOS App Store hazırlık durumu (27 Ekim 2026)

Bu sayfa bir yayın onayı değil, doğrulanmış durum kaydıdır. Vercel dağıtımının READY olması imzalı iOS paketi veya Apple App Review onayı anlamına gelmez.

## Tamamlanan teknik hazırlık
- `capacitor.config.ts`: Globriva uygulama adı ve önerilen iOS Bundle ID (`com.oguzhanozeren.cografya`).
- `codemagic.yaml`: `atlas-ios-smoke` ve `atlas-ios-testflight` iş akışları. Store'a otomatik gönderim kapalıdır.
- Gizlilik politikası ve destek bağlantıları hem Türkçe hem İngilizce.
- `scripts/panoramas/check-local-gallery.mjs --release`: görsel kalitesi / yayın kaydı için bloklayıcı statik kontrol.
- `npm run gallery:photo-review`: `appstore-review/photo-audit.csv` ve `release-report.json` üretir.
- `npm run gallery:commons-audit`: Commons API üzerinden kaynak sayfası, yazar ve lisans metaverisini sorgular; `appstore-review/commons-source-audit.json` üretir. Ağ hataları belirsiz olarak işaretlenir, onaya dönüşmez.
- İki iOS Codemagic akışı da söz konusu raporları artefakt olarak verir.

## Henüz yapılmayan / bloke eden işler
1. **Fotoğrafların editoryal onayı:** `public/drone-gallery/catalog-v2.json` içinde 16 onaylı albüm, toplam 51 onaylı fotoğraf var. 27 Ekim kontrolünde tam `reviewedLocation + reviewedQuality + reviewedVisual + reviewedLicense + reviewedPlace` işaretlerine sahip albüm sayısı **0**. `gallery:release-check` bu nedenle geçmeyecektir.
2. Her fotoğrafın doğru kaynakla eşleşmesi, fotoğraftaki konumun gerçek olması, atıf / lisans koşulları ve görüntü kalitesi insan gözüyle doğrulanmalı. Commons metaverisi eşleşse bile bu yeterli değildir. Otomatik `reviewed*` veya `approved` bayrağı yazılmaz.
3. Apple Developer'da Bundle ID'nin kullanıcıya ait olduğu; iOS imzalama, provisioning, App Store Connect uygulaması ve Codemagic entegrasyonu kontrol edilmeli.
4. `atlas-ios-smoke` ve `atlas-ios-testflight` başarılı koşulmalı; imzalı IPA TestFlight'a ulaştıktan sonra en az bir gerçek iPhone ve desteklenecek iPad modeliyle açılış, safe-area, reklam izni, offline akış, 360° görüntüler ve her zorluk seviyesi kontrol edilmeli.
5. Reklam gizlilik / ATT / IDFA ve App Store Connect App Privacy + 2026 yaş derecelendirmesi, gerçek IPA ile eşleştirilmeli. App Store görselleri ve açıklama metinleri tamamlanmalı.
6. Canlı AdMob inceleme durumu, çevrim içi sıralama sunucusu ve kullanıcı verisi silme talepleri doğrulanmalı.

## Kontrol komutları
```sh
npm ci
npm run typecheck
npm run build
npm run gallery:photo-review
npm run gallery:commons-audit
npm run gallery:release-check
node scripts/app-store-preflight.mjs
```

**Kritik ilke:** doğrulanmayan fotoğrafın üzerinde `reviewed*` işaretlerini otomatik açmak, sırf kod geçsin diye eşikleri düşürmek ya da eksik içeriği doğruymuş gibi yayınlamak yasak.

İlerleme ve yıldız kayıtlarını içeren oyun akışına bu App Store hazırlık çalışması dokunmaz.
