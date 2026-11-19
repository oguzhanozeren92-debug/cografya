# Globriva günlük denetim — 19 Kasım 2026

## Bu turda doğrulanan kaynaklar
GitHub bağlantısından `package.json`, `src/data/geoDiscoveryModes.ts`, `src/data/countryClues.ts`, `tests/geo-content.test.mjs`, `server/street/country-mode.mjs`, `scripts/panoramas/check-local-gallery.mjs`, `public/drone-gallery/catalog-v2.json` ve 18 Kasım raporu okundu. GitHub kod arama indeksi kullanılabilir değil; dosyalar doğrudan okundu. Yerel `git clone` denemesi `Could not resolve host: github.com` hatası verdi.

## Kaynak sayımları (oynanabilirlik değil)
- Ülke ipucu: **99 benzersiz ülke kimliği**, zorluk 31/33/35.
- Doğa: **66 farklı kayıt kimliği**, zorluk 22/22/22; **64 ayrı coğrafi hedef**, çünkü `okavango`/`okavango-delta` ve `namib`/`namib-sand-sea` aynı yerleri anlatıyor.
- Ada hedef listesi: **22**; sınır odak listesi: **43**. Bunlar geometri filtresinden geçmiş oynanabilir soru sayıları değildir.
- Drone galeri katalogu: **32 albüm / 99 fotoğraf tanımı / 28 approved=true albüm**. Bunlar editoryal lisans ve canlı mobil erişim doğrulaması değildir. Önceki 379 inceleme adayı ile aynı veri kümesi sayılmamalı.
- Sokak seçim kuralları: 18 fotoğraf ID'si, 6 kaynak ID'si, 9 kolay ID'si; test beklentisi 19 oynanabilir panorama. Gerçek sonuç manifest, ready kimlikleri ve ülke ipuçları kesişimine bağlı.
- Önceki raporlarda toplam **729 sabit soru tanımı** (504+99+66+60) bulunuyordu. Bu turda ülke/başkent/bayrak ve medeniyet yükleyicileri uçtan uca çalıştırılmadığı için 729 **güncel oynanabilir soru sayısı olarak doğrulanmadı**.
- Başlangıç/bitiş kaynak referansı: 729/729; canlı doğrulanmış oynanabilir soru: bilinmiyor/bilinmiyor; canlı doğrulanmış oynanabilir görsel: bilinmiyor/bilinmiyor. Bu tur yayımlanan soru/görsel: **0/0**.

## Yayın dışı yeni soru adayları
Aşağıdaki üç soru kaynak-geneli tekrar taraması ve referans doğrulaması tamamlanmadığı için oynanabilir sayılmaz.
1. **Ada / orta / jeoloji:** “Rock Islands Southern Lagoon adlı UNESCO Dünya Mirası alanı hangi Pasifik ülkesindedir?” A) Palau B) Fiji C) Samoa D) Tonga. **Doğru A.** Açıklama: Palau'daki kireçtaşı adacıkları ve lagünler özgün bir denizel peyzaj oluşturur. Doğrulama adayı: https://whc.unesco.org/en/list/1386/
2. **Medeniyet / zor / kent mirası:** “İçan Kale (Itchan Kala) sur içi tarihi kent alanı hangi ülkededir?” A) Özbekistan B) Kazakistan C) İran D) Tacikistan. **Doğru A.** Açıklama: Hive kentinin surlarla çevrili tarihi çekirdeği İpek Yolu mimari mirasını korur. Doğrulama adayı: https://whc.unesco.org/en/list/543/
3. **Kültür / orta / geleneksel müzik:** “Gamelan adlı geleneksel çalgı toplulukları en çok hangi ülkeyle ilişkilidir?” A) Endonezya B) Nepal C) Moğolistan D) Mısır. **Doğru A.** Açıklama: Gamelan, özellikle Cava ve Bali kültürlerinde çeşitli vurmalı çalgıları bir araya getirir. Doğrulama adayı: https://ich.unesco.org/en/RL/gamelan-01607

## Test ve riskler
`package.json` içinde `test` komutu bulunmuyor; uygun ortamda `node --test tests/geo-content.test.mjs`, `npm run typecheck`, `npm run lint`, `npm run build` ve `npm run gallery:release-check` çalıştırılmalı. Bu tur depo klonlanamadığı için hiçbirisi **çalıştırılamadı**; başarı iddiası yok. Test dosyasında 19 sokak panoraması beklentisi var. Doğa konum tekrarları hâlâ mevcut. CDN HTTP, ticari kullanım lisansı, atıf, koordinat ve gerçek iOS açılma testleri yapılmadı; yeni doğrulanmış görsel **0**. Doğrulanmamış adaylar yayımlanmadı ve uygulama kodu değiştirilmedi.

## Karar
Bu commit yalnızca dürüst kaynak envanteri ve yayın dışı aday raporudur. Sonraki teknik öncelik: bağımlılıkları kurabilen çalışma ortamında testler, aynı konumları tekilleştirme, sokak/drone seçimini gerçek manifestle kesiştirerek sayma ve CDN/iOS görsel açılma doğrulaması.
