# Globriva — 1 Kasım 2026 içerik ve görüntü denetimi

## Oyun yükleyicisine bağlı başlangıç → bitiş

| Mod | Önce | Sonra | Açıklama |
|---|---:|---:|---|
| Ülke harita soruları | 168 | 168 | 52 kolay / 62 orta / 54 zor |
| Başkent soruları | 168 | 168 | 168 ülke |
| Bayrak soruları | 168 | 168 | 168 bayrak |
| Ülke ipucu kartları | 87 | **90** | 28 / 29 / 33; +3 |
| Doğa Dedektifi | 45 | **51** | 17 / 17 / 17; +6 |
| Medeniyet Dedektifi | 60 | 60 | 20 vaka × 3 soru; 10 kolay / 10 orta vaka |
| **Toplam sabit soru tanımı** | **696** | **705** | **+9** |
| Ada Avcısı | 21 aday | 21 aday | Dinamik harita geometrisi; sabit soruya dahil değil |
| Sınır Dedektifi | 40 odak ülke | 40 odak ülke | Dinamik topoloji; sabit soruya dahil değil |
| Sokak Dedektifi | 37 panorama | 37 panorama | 148 JPEG yedek yüz |
| Drone 360° | 5 panorama | 5 panorama | 20 JPEG yedek yüz |
| Drone galeri | 16 albüm / 51 fotoğraf | aynı | 4 albüm onay bekliyor |
| **Yükleyiciye bağlı yerel görüntü** | **219** | **219** | 148+20+51, canlı HEAD doğrulaması 219/219 |
| Tarihî ek fotoğraf | 39 uzak kaynak | 39 | Yerel 219'a dahil değil |

> Toplam sabit soru tanımı; dinamik ada/sınır kombinasyonları ve aynı fotoğrafın tekrar oynanmasından doğan tur varyasyonları dahil değildir. Yükleyici havuzları doğrudan kaynak dosyalardan ve aktif API'den denetlenmiştir.

## Eklenen gerçek ve özgün sorular

**Ülke ipucu +3 (her biri üç kademeli ve cevap sonrası öğretici bilgi):**
- Çekya (kolay): Vltava, tarihî köprü, Prag; UNESCO https://whc.unesco.org/en/list/616/
- Umman (orta): Arap Denizi, Dhofar ve tarihî günlük ticareti; UNESCO https://whc.unesco.org/en/list/1010/
- Tacikistan (zor): Pamir Dağları, buzullar ve Duşanbe; UNESCO https://whc.unesco.org/en/list/1252/

**Doğa Dedektifi +6 (2 kolay / 2 orta / 2 zor, iki dilli ipucu ve cevap sonrası öğretici kart):**
- Ningaloo Kıyısı, Avustralya (kolay): https://whc.unesco.org/en/list/1369/
- Büyük Mavi Çukur, Belize (kolay): https://whc.unesco.org/en/list/764/
- Kenya Dağı, Kenya (orta): https://whc.unesco.org/en/list/800/
- Madeira Defne Ormanları, Portekiz (orta): https://whc.unesco.org/en/list/934/
- Orta Surinam Doğa Koruma Alanı, Surinam (zor): https://whc.unesco.org/en/list/1017/
- Lorentz Millî Parkı, Endonezya (zor): https://whc.unesco.org/en/list/955/

Yeni ülke ipuçlarının yedi yabancı dilde **21 kültürel özellik çevirisi** ve 9 dilde bölge/başkent yerelleştirme sinyali eklendi. Yanıtın soru öncesi ipucu içinde görünmesi engellendi. Doğa konumları coğrafi bölge ve seviye bakımından dengelendi.

## Yeni fotoğraf/panorama araştırması

`panoramas/weekly-research/2026-11-01.json` dosyasında **7 farklı ülkeden 7 Commons fotoğraf adayı**: Avustralya, Kenya, Portekiz, Namibya, Arjantin, Belize, Endonezya. Tüm adayların tekil ticari kullanım lisansı, fotoğrafçı atfı, 640px mobil uyumlu JPEG URL'si ve gerçek HTTP 200/JPEG dosya imzası doğrulandı. Beşinde konum işaretlemesi fotoğraf konumuyla tutarlı. Belize dosyasının kamera konumu hedefin yaklaşık 12 km güneyinde; Endonezya kaydında kamera GPS'i yok. Bu iki adayın konum teyidi bekliyor. **Yedi dosya da normal fotoğraf; 360° olarak sunulmayacak.** Orijinal tam dosya, görsel editör ön izlemesi, R2/albüm entegrasyonu ve fiziksel mobil görüntüleme tamamlanmadı. Bu nedenle **oynanabilir yeni görsel 0, yayımlanan 0, kuyruk 0, araştırma kaydı 7**. Lisans/konum veya gösterim belirsizliği olanlar yayımlanmadı.

## Canlı görsel ve API erişimi

- `https://atlas-arena-tau.vercel.app` üzerinde 219 yerel fotoğraf URL'si HEAD ile tarandı: **219/219 HTTP 200 ve image MIME** (Sokak 148/148, Drone 20/20, galeri 51/51).
- Üç örnek tam GET ile JPEG/WebP dosya imzaları doğrulandı.
- Sokak, Drone ve Medeniyet oturum API'leri HTTP 200 döndürdü. Tarih v2 kolay/orta oturumları 8'er vaka ve 24'er soru verdi; her seviyede 10 onaylı vaka var.
- Wikimedia Commons'taki 39 tarihî ek fotoğrafın 32'si HEAD 200; 7 istek **429 hız sınırlaması** verdi. 429 bozuk dosya kanıtı değildir; yeniden kontrollü deneme ve CDN önbelleği gerektirir.
- Bunlar fiziksel iPhone/iPad render testinin yerine geçmez; Vercel'de eski build'e ait URL'lerin erişilebilirliği yeni binary'nin test edildiğini göstermez.

## Testler ve düzeltmeler

Vercel Sandbox içinde GitHub'dan alınan güncel kaynaklar ve gerçek 148 Sokak JPEG'iyle mevcut Node testleri çalıştırıldı:
- `tests/geo-content.test.mjs`: **10/10 geçti**.
- `tests/drone/hints.test.mjs`: **3/3 geçti**.
- `tests/drone-live.test.mjs`: ilk koşuda **10/11**, hatalı test varsayımı düzeltildikten sonra **11/11 geçti**.
- `tests/street/country-mode.test.mjs`: **8/8 geçti**.
- **Toplam 32/32 test geçti** (dört test dosyası ayrı çalıştırıldı).
- Değiştirilen 5 TypeScript dosyası TypeScript 5.5.4 ile transpile edildi, sözdizimi tanısı **0**.
- Drone galeri testindeki 'ilk resim her zaman 1.jpg' varsayımı hatalıydı; uygulama ilk açıyı kasıtlı olarak rastgele seçiyor. Test artık 1–4 dosyalarının tamamının varlığını kontrol ediyor.
- GitHub Actions 1 Kasım çalışmasında TypeScript'in 8 hatası belirlendi: `LeaderboardEntry.player_id` (2), `VsRoom.otherPlayerId` (5), `StreetPhoto` union narrowing (1). İsteğe bağlı kullanıcı kimlikleri güvenle kontrol edildi, `StreetPhoto` doğrudan discriminant ile daraltıldı. Son GitHub Actions `Atlas Arena Admin Panel CI` çalışması **başarılı**: yerelleştirme, Sokak testleri, `npm run typecheck` ve `npm run build` geçti (run 41290697682). Drone galeri CI da başarıyla tamamlandı (run 41290568989).
- **Tam uygulama `npm run typecheck` ve `npm run build` GitHub Actions'ta başarıyla çalıştı.** Sandbox'ta ayrıca 32 Node testi geçti. Son Vercel üretim dağıtımının yeni GitHub HEAD'i içerdiği henüz doğrulanmadı; son görülen READY dağıtım `6a137b919ff1` commit'ine aitti.

## Kaydedilen başlıca commitler

- `eed490ea60a149ffd39dfde9d5652170515af5cc` — +6 doğa konumu.
- `bc2c4379bc5df29c29cd8893b0a76dadca9b7d9e` — +6 iki dilli bilgi kartı.
- `6a137b919ff1951d461399356dee6d4c7dc54c3e` — +3 ülke ipucu.
- `53b3fa4feaa85f81c982d59f68496d1c5c275dd1` — yerelleştirme.
- `3d645923b8b3d2781ceab19352b93914ffbb5147` — 21 çeviri.
- `e4ad7bd9657e5e9a3707124842c077881f94b5fc` — 7 görsel adayının lisans/konum kayıtları.
- `e7b171eca5683611e24a8e02b7cea140ef0540c0` — Drone testi rastgele açı düzeltmesi.
- `6459dc3e549f` — TypeScript union narrowing düzeltmesi (diğer tip düzeltmeleri önceki commitlerde).
- `1d6e3a4d57d7559be7d3bc3fd77543f5fb59ea1d` — eksik İngilizce arayüz karşılıkları.
- `4536111557a76c5cc042e115a93925050d019f8e` — 90 ülke ipucunun çok dilli kalite kontrolü.

**Net:** 696 → **705** sabit soru; **219 → 219** canlı HTTP doğrulanmış yerel görsel; 7 yeni görsel araştırma adayı, 0 yeni oynanabilir/yayımlanan; 32/32 Node testi ve GitHub Actions yerelleştirme + TypeScript + build kontrolleri geçti. Yeni HEAD için Vercel production dağıtımı henüz doğrulanmadı.
