# Globriva — iOS App Store hazırlık durumu (27 Ekim 2026)

Bu sayfa bir yayın onayı değil, doğrulanmış durum kaydıdır. Vercel dağıtımının READY olması imzalı iOS paketi veya Apple App Review onayı anlamına gelmez.

## Tamamlanan teknik hazırlık
- `capacitor.config.ts`: Globriva uygulama adı ve önerilen iOS Bundle ID (`com.oguzhanozeren.cografya`).
- `codemagic.yaml`: `atlas-ios-smoke` (simülatör) ve `atlas-ios-testflight` (yalnızca iç test) için görsel envanter raporlu QA akışları, ayrıca **ayrı** `atlas-ios-store-readiness` sıkı medya yayın kontrolü. App Store incelemesine otomatik gönderim kapalıdır.
- Gizlilik politikası ve destek bağlantıları hem Türkçe hem İngilizce.
- `scripts/panoramas/check-local-gallery.mjs --release`: görsel kalitesi / yayın kaydı için bloklayıcı statik kontrol.
- `npm run gallery:photo-review`: `appstore-review/photo-audit.csv` ve `release-report.json` üretir.
- `npm run gallery:commons-audit`: Commons API üzerinden kaynak sayfası, yazar ve lisans metaverisini sorgular; `appstore-review/commons-source-audit.json` üretir. Ağ hataları belirsiz olarak işaretlenir, onaya dönüşmez.
- İki iOS Codemagic akışı da söz konusu raporları artefakt olarak verir.

## Henüz yapılmayan / bloke eden işler
1. **Fotoğrafların editoryal onayı:** `public/drone-gallery/catalog-v2.json` içinde 16 onaylı albüm, toplam 51 onaylı fotoğraf var. 27 Ekim kontrolünde tam `reviewedLocation + reviewedQuality + reviewedVisual + reviewedLicense + reviewedPlace` işaretlerine sahip albüm sayısı **0**. `gallery:release-check` bu nedenle geçmeyecektir; bu kontrol TestFlight QA akışından ayrılıp yalnızca `atlas-ios-store-readiness` akışında korunmuştur.
2. Her fotoğrafın doğru kaynakla eşleşmesi, fotoğraftaki konumun gerçek olması, atıf / lisans koşulları ve görüntü kalitesi insan gözüyle doğrulanmalı. Commons metaverisi eşleşse bile bu yeterli değildir. Otomatik `reviewed*` veya `approved` bayrağı yazılmaz.
3. Apple Developer'da Bundle ID'nin kullanıcıya ait olduğu; iOS imzalama, provisioning, App Store Connect uygulaması ve Codemagic entegrasyonu kontrol edilmeli.
4. `atlas-ios-smoke` ve `atlas-ios-testflight` başarılı koşulmalı; imzalı IPA TestFlight'a ulaştıktan sonra en az bir gerçek iPhone ve desteklenecek iPad modeliyle açılış, safe-area, reklam izni, offline akış, 360° görüntüler ve her zorluk seviyesi kontrol edilmeli.
5. Reklam gizlilik / ATT / IDFA ve App Store Connect App Privacy + 2026 yaş derecelendirmesi, gerçek IPA ile eşleştirilmeli. App Store görselleri ve açıklama metinleri tamamlanmalı.
6. Canlı AdMob inceleme durumu, çevrim içi sıralama sunucusu ve kullanıcı verisi silme talepleri doğrulanmalı.

## Codemagic kırmızı "Install and verify game" düzeltmesi (27 Ekim 2026)
- Önceki yapılandırmada aynı `gallery:release-check` kontrolü hem iOS smoke hem TestFlight akışına konmuştu. Eksik editoryal inceleme nedeniyle **gerçek cihaz testi daha başlamadan** derleme duruyordu.
- Güncel yapılandırmada `atlas-ios-smoke` ve `atlas-ios-testflight`, dosya sağlığı için `gallery:audit` çalıştırır; eksik editoryal onay bilgileri raporlanır ama test derlemesini engellemez.
- `atlas-ios-store-readiness` yalnızca **nihai App Store gönderimi öncesinde** çalıştırılmalıdır; en az 50 görsel ve 10 ülke için doğrulama kanıtı tamamlanmadan **başarısız** kalması beklenir.
- İmzalı IPA üretiminin ve TestFlight yüklemesinin çalıştığı henüz doğrulanmadı. Bu düzeltme, başka bağımsız kod/derleme hatalarını garanti etmez.

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
