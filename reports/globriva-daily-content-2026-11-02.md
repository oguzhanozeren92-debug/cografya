# Globriva — 2 Kasım 2026 günlük içerik ve görsel denetimi

## Oyun yükleyicisine bağlı envanter
| Havuz | Başlangıç | Bitiş | Not |
|---|---:|---:|---|
| Ülke haritası | 168 | 168 | Natural Earth / ülke metadatası |
| Başkent | 168 | 168 | Aynı ülke havuzu |
| Bayrak | 168 | 168 | Mevcut bayrak kodları |
| Ülke ipucu | 90 | 93 | Kolay/orta/zor: 29/30/34 |
| Doğa Dedektifi | 51 | 57 | Kolay/orta/zor: 19/19/19 |
| Medeniyet Dedektifi | 60 | 60 | 20 tarihî konum, her biri 3 soru |
| **Sabit soru tanımı toplamı** | **705** | **714** | Dinamik ada/sınır hariç |
| Ada Avcısı aday / haritada oynanabilir | 21 / 20 | 22 / 21 | Trinidad ve Tobago eklendi |
| Sınır Dedektifi odak / geometride oynanabilir | 40 / 40 | 43 / 43 | Bulgaristan, Moğolistan, Doğu Timor |
| Sokak Dedektifi (oyun yükleyicisi) | 19 | 19 | 76 yedek JPG |
| Drone 360° | 5 | 5 | 20 yedek JPG |
| Drone galeri | 16 albüm / 51 JPG-WebP | 16 albüm / 51 JPG-WebP | 4 albüm / 12 fotoğraf onaysız |
| Medeniyet panoramaları | 20 | 20 | Sokak moduyla 11 ortak panorama |
| **Benzersiz oynanabilir yerel görsel** | **183** | **183** | 28 benzersiz panorama ×4 + 20 Drone + 51 galeri |
| Depodaki ve canlı sunucudaki tüm statik dosyalar | 223 | 223 | 10 panorama / 40 JPG henüz oyun yükleyicilerinin seçimine bağlı değil |

## Yeni sorular ve öğretici açıklamalar
- Ülke ipucu: Bulgaristan (kolay), Moğolistan (orta), Doğu Timor (zor); kaynaklı üçer ipucu ve cevap sonrası kısa bilgi.
- Doğa: Garajonay ve Aldabra (kolay); Uvs Nuur ve Puerto Princesa Yeraltı Nehri (orta); Dja ve Danxiashan (zor). Altı farklı UNESCO alanı, iki dilde coğrafi ipucu ve cevap sonrası öğretici bilgi.
- Harita türleri: Trinidad ve Tobago Ada Avcısı'na; Bulgaristan, Moğolistan, Doğu Timor Sınır Dedektifi'ne eklendi.
- Üç yeni ülke ipucuna 7 dilde 21 yerel kültür/doğa anahtar ifadesi eklendi. Soru öncesi cevap sızıntısı ve tekrarlı ID kontrolleri geçti.

## Wikimedia Commons fotoğraf araştırması
6 farklı ülke: İspanya, Çin, Filipinler, Etiyopya, Kosta Rika, Gana. Ayrıntılar: `panoramas/weekly-research/2026-11-02.json`.
- Altısının Commons dosya sayfası, ticari kullanıma uygun CC BY/CC BY-SA lisansı, fotoğrafçısı, geotag koordinatı ve 960px JPEG bağlantısı doğrulandı.
- Altı dosyanın da 960px sürümü HTTP 200, image/jpeg ve JPEG magic-byte kontrollerinden geçti. Her dosya 3000 piksel veya daha yüksek genişliğe sahip.
- Gana'daki geniş dikişli panorama 360° equirectangular değildir; diğer beşi de normal fotoğraftır. Hiçbiri Sokak 360° modu için yanlış etiketlenmedi.
- Fotoğrafların görsel içerik denetimi, fiziksel mobil görüntüleme ve CDN/album yayını tamamlanmadı. **Yeni oynanabilir veya yayımlanan fotoğraf: 0. Kuyruğa alınan: 0.** Bu adaylar yalnız araştırma arşivindedir.

## Bağlantı ve test durumu
- 2 Kasım 2026: Vercel canlı alan adındaki 223 statik görselin tamamına HEAD isteği gönderildi; **223/223 HTTP 200**. Bu, görüntülerin tüm telefonlarda açıldığına dair garanti değildir.
- Önceki raporlardaki 219 oynanabilir görsel sayısı fazla sayımdı: 38 onaylı Sokak panorama klasörünün tamamı Sokak oyununa bağlı değil. Gerçek seçim 19 Sokak + 20 Medeniyet panoraması (11 ortak) = 28 benzersiz panorama; 28×4 + 20 Drone + 51 galeri = **183 benzersiz oynanabilir statik dosya**. Geri kalan 40 JPG arşivde erişilebilir, fakat oyun seçimine bağlı değil.
- Sandbox ortamında mevcut `tests/geo-content.test.mjs` ve `tests/drone/hints.test.mjs` dosyaları çalıştırıldı: **13/13 geçti**. Yerel 37 Sokak panorama klasörünün varlığını kontrol eden tek test, sandbox'ta resim dosyaları kopyalanmadığı için özellikle hariç tutuldu; 223 canlı URL ayrı kontrol edildi.
- Düzenlenen 5 TypeScript dosyasında transpile syntax diagnostics: **0 hata**.
- Tam proje `npm run typecheck` ve `npm run build` sandbox'ta çalıştırılamadı: özel GitHub deposunun tamamı sandbox'a klonlanamıyor. GitHub Actions üzerinden tam kontroller başlatıldı; ilk çalışmada çeviri denetiminin eski 37 fotoğraf varsayımı hatası görüldü ve loader eşleşmesi düzeltilerek yeni CI tetiklendi.
- Niagara seyir alanı için eksik 8 dil çevirisi eklendi; çeviri ve envanter denetimleri artık doğrudan oyun yükleyicisini esas alıyor.
- Vercel üretim dağıtımı 2 Kasım'da 402 `api-deployments-free-per-day` (günlük 100 dağıtım sınırı) nedeniyle engellendi; GitHub'daki yeni içerik henüz canlı sürümde doğrulanmadı.
- Yeni fotoğrafı yayımlamak için fiziksel mobil denetim, görsel kalite incelemesi ve onaylı CDN albümü gerekiyor; lisans/geotag tek başına yeterli değil.

## Kaynaklar
- https://whc.unesco.org/en/list/219/ (Srebarna)
- https://whc.unesco.org/en/list/769/ (Uvs Nuur)
- https://www.unesco.org/en/articles/nino-konis-santana-designated-timor-lestes-first-unesco-biosphere-reserve
- https://whc.unesco.org/en/list/380/ (Garajonay)
- https://whc.unesco.org/en/list/185/ (Aldabra)
- https://whc.unesco.org/en/list/652/ (Puerto Princesa)
- https://whc.unesco.org/en/list/407/ (Dja)
- https://whc.unesco.org/en/list/1335/ (China Danxia)

## Son doğrulama — 2 Kasım 2026
- GitHub Actions `41421040068`, commit `3f5f373634dd7f629cc4f89aaad8ff61ab24a913`: **başarılı**.
- 8 Sokak Dedektifi testi + 15 coğrafya, medeniyet ve Drone testi = **23/23 geçti**.
- 24/24 oyun yükleyicisine bağlı Sokak/Drone bilgi metni tüm dillerde karşılık buldu.
- `node scripts/audit-playable-content.mjs --strict` başarılı; gerçek Street havuzu **19**, Medeniyet **20**, 11 ortak, toplam **28 benzersiz panorama**.
- Tam proje TypeScript kontrolü ve üretim derlemesi GitHub Actions üzerinde **başarılı**.
- Vercel üretim dağıtımı ayrı: günlük ücretsiz dağıtım kotası 402 nedeniyle yeni GitHub commit'i canlıya henüz alınamadı.
