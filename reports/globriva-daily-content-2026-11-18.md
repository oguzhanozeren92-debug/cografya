# Globriva günlük denetim — 18 Kasım 2026

## Bu turda gerçekten yapılan işlemler
GitHub bağlantısıyla `package.json`, `src/data/geoDiscoveryModes.ts`, `tests/geo-content.test.mjs`, `server/street/country-mode.mjs`, `scripts/panoramas/check-local-gallery.mjs` ve 17 Kasım raporu okundu. `git clone --depth 1` denemesi `Could not resolve host: github.com` hatasıyla başarısız oldu. Bu nedenle Node, TypeScript, Vite ve mobil/CDN testleri çalıştırılamadı. GitHub dosya okuması yerel test değildir.

## Sayım ve yayın sınırları
Önceki envanter: 729 sabit soru tanımı (504 ülke/başkent/bayrak + 99 ülke ipucu + 66 doğa + 60 medeniyet). Bu turda tam oyun yükleyicisi ve tüm modların oynanabilir filtreleri çalıştırılmadı; 729, güncel doğrulanmış oynanabilir soru sayısı değildir. Başlangıç/bitiş referans soru tanımı: 729/729; doğrulanmış oynanabilir soru: bilinmiyor/bilinmiyor. Canlı doğrulanmış oynanabilir görsel: bilinmiyor/bilinmiyor. Yeni yayımlanan soru/görsel: 0/0. Yeni fotoğraf lisans+atıf+konum+URL+mobil doğrulaması: 0.

`server/street/country-mode.mjs` içinde 18 doğrudan sokak fotoğraf ID'si, 6 kaynak ID'si ve 9 kolay ID'si görüldü. Bu listeler görsel erişim testi değildir. `scripts/panoramas/check-local-gallery.mjs` yerel dosya başlığı, dosya boyutu, kaynak, lisans URL'si, tekrarlanan kaynak, albüm onayı ve editoryal inceleme alanlarını kontrol ediyor; ancak canlı CDN HTTP durumu ve iOS açılmasını doğrulamıyor.

## Test borcu
`tests/geo-content.test.mjs` doğa için 63, ülke ipucu için 96, onaylı sokak arşivi için 38 bekliyor; önceki kaynak envanteri sırasıyla 66, 99, 39. Bu değerler otomatik değiştirilmedi: önce semantik tekrar ve oynanabilir filtre kontrolü gerekir. Önceki raporlardaki Okavango ve Namib konum tekrarları henüz çözüldü diye işaretlenemez. `package.json` içinde `test` komutu yok; `node --test tests/geo-content.test.mjs` bağımlılıklar kurulduğunda denenebilir.

## Yeni yayın dışı soru adayları
Aşağıdakiler bilgi açısından makul taslaklardır; repo-geneli benzersizlik ve kaynak doğrulaması tamamlanmadığından **yayımlanmadılar**.

1. **Sınır / zor / enklav:** “İtalya'nın tamamen çevrelediği iki bağımsız devletten biri hangisidir?” A) San Marino B) Andorra C) Monako D) Lihtenştayn. **Doğru: A.** Açıklama: San Marino, İtalya içinde yer alan bağımsız bir mikrodevlettir.
2. **Doğa / orta / jeomorfoloji:** “Dev kum tepeleri ve mevsimsel yağmur gölcükleriyle tanınan Lençóis Maranhenses hangi ülkededir?” A) Brezilya B) Peru C) Namibya D) Fas. **Doğru: A.** Açıklama: Lençóis Maranhenses, Brezilya'nın Maranhão eyaletindeki kıyı kumulu peyzajıdır.
3. **Kültür / orta / somut olmayan miras:** “Geleneksel Kırgız keçe halısı yapımında kullanılan şırdak hangi malzemeyle ilişkilidir?” A) Keçe B) Cam C) Mermer D) Porselen. **Doğru: A.** Açıklama: Şırdak, kesilmiş keçe parçalarının desenli biçimde birleştirilmesiyle üretilen geleneksel halıdır.

## Karar
Tam yükleyici sayımı, tekrar denetimi, ticari lisans/atıf, görsel URL ve cihaz kontrolleri olmadan oyun kodu veya içerik havuzu değiştirilmedi. Yeni commit yalnızca bu denetim raporudur. Öncelik: erişilebilir çalışma ortamında testleri çalıştırmak; gerçek oynanabilir sokak/drone fotoğraflarını doğrulamak; coğrafi tekrarları gidermek.
