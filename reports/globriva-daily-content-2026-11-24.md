# Globriva günlük içerik denetimi — 24 Kasım 2026

İncelenen depo: `oguzhanozeren92-debug/cografya`
Dal: `main`
Başlangıç commit'i: `5218e5c7b96b025406fb843c1fb8a2089ea10555`
Envanter kaynağı: oyun yükleyicileri, sunucu beyaz listeleri, statik dosya ağacı ve QA betikleri.

## 1. Oyun yükleyicisine bağlı envanter

| Modül | Başlangıç | Bitiş | Zorluk |
|---|---:|---:|---|
| Ülke kayıtları / ülke soruları | 168 | 168 | 52 kolay / 62 orta / 54 zor |
| Başkent soru varyantları | 168 | 168 | Ülke kaydının zorluğunu kullanır |
| Bayrak soru varyantları / bayrak kodları | 168 | 168 | Ülke kaydının zorluğunu kullanır |
| Ülke ipucu kartları | 99 | 99 | 31 kolay / 33 orta / 35 zor |
| Doğa harita hedefleri | 66 | 66 | 22 kolay / 22 orta / 22 zor |
| Ada silüeti hedefleri | 22 | 22 | 6 kolay / 7 orta / 9 zor |
| Sınır odağı ülke kimlikleri | 43 | 43 | Kaynak listesi 43; gerçek komşuluk/geometry tur sayısı yerel audit çalıştırılamadığı için ayrıca doğrulanmadı |
| Street Detective | 19 | 19 | 9 kolay kimlik; kalan havuzun manifestinde ayrı bir 3-kademeli zorluk alanı yok |
| Drone 360 pilot | 5 | 5 | 2 kolay / 1 orta / 2 zor |
| Yeni soru taslağı | 0 | 7 | 1 kolay / 3 orta / 3 zor |
| Yeni yayımlanan soru | 0 | 0 | Yükleyiciye eklenmedi |

Ana oyun yükleyicisi `mixed`, `flags`, `clues` modlarını kullanıyor; soru türleri `country`, `capital`, `flag`, `clue`. Harita tarafında Doğa Dedektifi, Ada Avcısı ve Sınır Dedektifi; ayrı görsel modlarda Street Detective ve Drone Detective bulunuyor. `countryKnowledge.ts` içinde 105 ek ülke bilgi notu var; bunlar bağımsız soru bankası değil, açıklama/öğrenme katmanı.

`newGameModes20261026.json` içindeki eski QA hedefleri (doğa 18, ada 15, sınır 40) mevcut kaynakla eşleşmiyor; güncel kaynak sayıları sırasıyla 66, 22 ve 43. Bu plan dosyası bu turda değiştirilmedi.

## 2. Görsel envanteri ve doğrulama

- Street manifestinde 39 onaylı kayıt ve 39 photo-ready kimlik var; sunucu beyaz listesi, ülke ipuçları ve dört yerel yüz dosyası koşullarıyla gerçek tur havuzu 19 panorama. Bu havuz için 76 fallback JPG yüz dosyası mevcut. Manifestteki diğer kayıtlar otomatik olarak oynanabilir sayılmadı.
- Drone pilotunda 5 onaylı ve photo-ready panorama, 20 yerel fallback JPG yüz dosyası var. Bunlar mevcut güvenli pilot havuzu; geniş canlı galeri yerine kullanılıyor.
- Drone Gallery kataloğunda 32 albüm / 99 fotoğraf tanımı var. 28 albüm onay işaretli; 87 fotoğraf dosyası depoda mevcut. Ancak yalnızca 12 albüm / 36 fotoğraf tam editoryal konum-kalite-görsel incelemesi işaretlerini taşıyor ve bunlar 12 ülkeye yayılıyor. Canlı galeri durumu hâlâ `activated:false`, `readyTotalAlbums:0`, `readyTotalPhotos:0`; API'nin canlı galeri eşiği en az 50 ayrı fotoğraf ve 10 ülkedir. 36 editoryal fotoğraf bu eşiğin 14 altında. 87 yerel dosya varlığı, canlı CDN veya mobil açılma doğrulaması değildir.
- Bayrak kodları 168 ülke kaydı için tanımlı; URL'ler FlagCDN üzerinden dinamik oluşturuluyor. Bu turda uzaktaki bayrak URL'leri için HTTP/mobil testi yapılmadı.
- Değişmeyen loader-linked statik panorama havuzu 19 Street + 5 Drone = 24 konum ve 76 + 20 = 96 fallback JPG yüz dosyasıdır. Canlı Drone Gallery fotoğrafı: 0. Yeni doğrulanmış fotoğraf: 0.

## 3. Yeni soru paketi

`data/open-content/question-rounds/2026-11-24.json` içine 7 kaynaklı, özgün soru adayı eklendi:
- Şehir / Lalibela kaya kiliseleri
- Kültür / Wayang kulit
- Kültür / Gürcü çok sesli şarkıcılığı
- Medeniyet / Great Zimbabwe ve Shona
- Ada / Rapa Nui moai malzemesi
- Doğa / Malavi Gölü mbuna çiklitleri
- Sınır / Mozambik Kanalı'nın doğu sınırı

Her soruda dört seçenek, doğru cevap indeksi, kısa öğretici açıklama ve birincil kaynak bağlantısı var. Paket, mevcut 47 görsel-coğrafya taslağıyla tam soru metni tekrarına karşı kontrol edildi. Bunlar metin tabanlı içerik adaylarıdır; mevcut uygulama yükleyicisine bağlanmadıkları ve ürün testleri çalıştırılamadığı için `playable:false` ve `review_required_not_playable` olarak tutuldu. Hiçbir aday canlı oyuna eklenmedi.

## 4. Fotoğraf arşivi, tekrarlar ve hatalar

En son günlük keşif kaydı 23 Kasım 2026 tarihli: 9 bölge arandı, 21 yeni benzersiz Commons dosya adayı bulundu, toplam bekleyen inceleme 695, yüklenen 0, etkinleştirilen 0. Yeni adayların 20'si Viyana/Stephansplatz çevresindeki aynı dar konum kümesinde; 1'i Cape Town. Bunlar 21 ayrı oynanabilir konum olarak sayılmadı. Tüm yeni kayıtlar görsel, konum, projeksiyon ve lisans-atıf incelemesi bekliyor.

23 Kasım Drone yayın durumunda 12 albüm editoryal incelemeye uygun, 22 albüm inceleme bekliyor; bugün yayımlanan 0 albüm / 0 fotoğraf. 11 Commons isteği HTTP 429 aldı; bir albümde lisans değiştiği için yeniden inceleme gerekiyor. Street yayın durumunda Gullfoss, Kopenhag ve Erivan için üç yayın komutu başarısız (exit status 1); ayrıntılı stderr bulunmadığından bağlantı veya dosya düzeltmesi uydurulmadı.

Yeni görseller için ticari lisans, zorunlu atıf, çekim konumu ile tasvir edilen yerin eşleşmesi, özgün dosya URL'si ve mobil görüntülenme bu turda uçtan uca yeniden doğrulanamadı. Bu nedenle yeni fotoğraf yayımlanmadı ve 695 bekleyen aday oynanabilir sayılmadı.

## 5. Test ve dağıtım

Depodaki QA akışı şu kontrolleri tanımlıyor: `node --test tests/geo-content.test.mjs tests/drone-live.test.mjs tests/drone/hints.test.mjs tests/street/country-mode.test.mjs`, `node scripts/audit-playable-content.mjs --strict`, `npm run typecheck`, `npx vite build` ve ayrı canlı arşiv denetimi. `globriva-content-ci.yml` yalnızca `workflow_dispatch` ile tetikleniyor ve dosyada bu hesapta hosted runner atanmadığı notu var.

Bu oturumda yerel clone denemesi `Could not resolve host: github.com` hatasıyla durdu. Dolayısıyla Node testleri, topology audit, TypeScript, Vite build, Commons/R2 HTTP ve gerçek iOS/Android mobil görüntü testi çalıştırılamadı. Güncel HEAD için bildirilen tek commit check Vercel: success; bu, Node/TypeScript testlerinin geçtiği anlamına gelmez. Yeni paket için JSON yapısı, 4 seçenek, cevap indeksi, kaynak URL'si, benzersiz ID/soru metni ve oynanamaz durum kontrolleri yazma öncesinde doğrulandı.

## 6. Değişiklik özeti

- Uygulama kaynak kodu ve oyun yükleyicisi değiştirilmedi.
- 7 soru adayı ayrı, review-only pakete eklendi.
- Yeni oynanabilir soru: 0.
- Yeni doğrulanmış oynanabilir görsel: 0.
- Var olan görsel bağlantıları için güvenli kod düzeltmesi yapılmadı; canlı URL ve mobil doğrulama ortamı yok.
- Proje testleri: çalıştırılamadı; engel GitHub DNS/yerel bağımlılık erişimi ve workflow runner kısıtı.
