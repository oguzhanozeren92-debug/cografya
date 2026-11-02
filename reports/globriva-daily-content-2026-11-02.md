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
| Sokak Dedektifi | 37 | 37 | 148 yedek JPG |
| Drone 360° | 5 | 5 | 20 yedek JPG |
| Drone galeri | 16 albüm / 51 JPG-WebP | 16 albüm / 51 JPG-WebP | 4 albüm / 12 fotoğraf onaysız |
| **Doğrulanmış oynanabilir yerel görsel** | **219** | **219** | 148+20+51 |
| Depodaki ve canlı sunucudaki tüm statik dosyalar | 223 | 223 | 4 Sokak fotoğrafı henüz oyun seçimine uygun değil |

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
- Sandbox ortamında mevcut `tests/geo-content.test.mjs` ve `tests/drone/hints.test.mjs` dosyaları çalıştırıldı: **13/13 geçti**. Yerel 37 Sokak panorama klasörünün varlığını kontrol eden tek test, sandbox'ta resim dosyaları kopyalanmadığı için özellikle hariç tutuldu; 223 canlı URL ayrı kontrol edildi.
- Düzenlenen 5 TypeScript dosyasında transpile syntax diagnostics: **0 hata**.
- Tam proje `npm run typecheck` ve `npm run build` çalıştırılamadı: özel GitHub deposunun tamamı sandbox'a klonlanamıyor. CI/Vercel dağıtım sonucu ayrıca izlenmeli.
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
