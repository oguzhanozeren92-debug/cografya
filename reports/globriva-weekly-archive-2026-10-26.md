# Globriva · Haftalık Drone ve Sokak Arşiv Denetimi
**Denetim:** 26 Ekim 2026 (UTC+3)  
**Durum:** Araştırma ve güvenli yayın kuyruğu güncellendi; bu çalışmada **yeni yayın: 0**.

## Canlı arşiv ve erişilebilirlik
- **Drone fotoğraf galerisi:** 16 aktif albüm / 51 fotoğraf / 16 ülke. Canlı Vercel üzerindeki 51 dosyanın 51'i HEAD, içerik türü ve asgari dosya boyutu kontrolünden geçti.
- **Sokak Dedektifi:** GitHub'da 37 onaylı 360° panorama; 37×4 = **148/148** yedek JPG yüzü canlı ve erişilebilir. 37 Commons orijinalinin tamamında dosya, kaynak lisansı ve 2:1 oranı doğrulandı; 21'inde Commons GPS var ve kaydedilen koordinatla >1 km uyuşmazlık bulunmadı.
- **Drone 360 pilot:** 5 onaylı panorama kayıtlı (Drone galerisiyle karıştırılmamalı).
- **51 Drone galerisi fotoğrafının** tamamı Commons'ta bulundu; lisans ve fotoğrafçı alanları 51/51 uyuştu. Yalnızca 14/51 dosyada Commons koordinatı bulundu. Kalan 37 fotoğrafın şehir/yer doğrulaması kaynak açıklaması, yapı tanıma ve görsel denetimle ayrı ayrı tamamlanmalı; HTTP 200 tek başına yer doğrulaması değildir.
- **Bekleyen mevcut Drone albümleri:** `album-017` Prag, `album-018` Venedik, `album-019` Viyana, `album-020` Lizbon — **4 albüm / 12 fotoğraf**, editoryal kalite/konum bayrakları hâlâ false. Bunlar otomatik yayımlanmadı.

## 26 Ekim araştırması
**14 gerçek 360° panorama / 11 ülke** için Commons dosya, çözünürlük, 2:1 oranı, lisans, atıf ve GPS verileri tarandı. Dokuzunun küçük resimleri görsel olarak karşılaştırıldı. Bunların **5'i farklı ülkelerden** mevcut yetkili Street yayın kuyruğuna seçildi; hiçbiri henüz yeni R2 görseli ve canlı HEAD testi geçmediği için bu çalışmada yayımlandı sayılmadı.

| Kuyruğa alınan | Fotoğrafçı | Lisans | GPS | Kaynak |
| --- | --- | --- | --- | --- |
| Kanada — Niagara Falls | G. Edward Johnson | CC BY 4.0 | 43.079599, -79.078247 | [Commons](https://commons.wikimedia.org/wiki/File:360_photo_between_Horseshoe_and_American_Falls_Niagara_Falls_Canada_2025-09-06_19-12-46_1.jpg) |
| Özbekistan — Taşkent Tarih Müzesi dışı | Aleksey Chalabyan | CC BY-SA 4.0 | 41.312167, 69.269611 | [Commons](https://commons.wikimedia.org/wiki/File:360_panorama_near_State_Museum_of_History_of_Uzbekistan.jpg) |
| İzlanda — Gullfoss | G. Edward Johnson | CC BY 4.0 | 64.326179, -20.124309 | [Commons](https://commons.wikimedia.org/wiki/File:Gullfoss_Waterfall_Iceland_360_degree_panorama_2026-02-06_09-25-21_1.jpg) |
| Danimarka — Kopenhag kule panoraması | Maximilian Schönherr | CC BY-SA 4.0 | 55.672917, 12.594028 | [Commons](https://commons.wikimedia.org/wiki/File:Vor_Frelsers_Kirke_(Kopenhagen)_%E2%80%93_360%C2%B0_panorama_from_the_top.jpg) |
| Ermenistan — Erivan Ulusal Galeri önü | Aleksey Chalabyan | CC BY-SA 4.0 | 40.178417, 44.513639 | [Commons](https://commons.wikimedia.org/wiki/File:360_Panorama_-_New_Year_decorations_in_front_of_National_Gallery_Building_of_Armenia%2C_Yeravan_2022.jpg) |

**Otomatik yayın koruması:** `scripts/panoramas/daily-publish-street.py` kuyruğundan iç mekân Dresden tramvayı, karanlık Oulu ve bu denetimde görsel olarak tekrar incelenmemiş Reykjavík Rainbow Street çıkarıldı. Mevcut günlük yayıncı en fazla bir kaydı işler; her kaydı Commons lisansı, kaynak, R2 karo yükleme ve yedek fotoğraf senkronizasyonundan geçirir. Kuyruğa almak, yayımlamak değildir.

## Yayınlanmayan diğer adaylar
- **Brezilya / Nova Odessa:** lisans ve GPS uygun; botanik bahçesi görseli ülke tahmini için ayırt edici değil.
- **Finlandiya / Oulu:** lisans ve GPS uygun; gece sahnesi oyun için fazla karanlık.
- **Avustralya / Wagga Wagga:** 12000×6000 360° ve GPS uygun. CC BY-SA 3.0 AU **ticari kullanıma izin verir**, ancak mevcut otomatik yayıncı bu lisans varyantını açıkça desteklemiyor; otomatik ithal yok.
- **Birleşik Krallık / Bexhill:** 10240×5120 drone 360° ve GPS/lisans uygun; Drone R2 karo hazırlığı ve son editoryal onay yok.
- **Güney Afrika / Cape Town:** Poly Haven kaynaklı **Table Mountain 2, Signal Hill Sunrise, Victoria Sunset** gerçek konumlu CC0 HDRI'lar. Commons ve resmî Poly Haven API koordinatları doğrulandı; tam görsel kalite incelemesi ve R2 hazır değil.
- **Peru / Cusco:** **Plaza de Armas** ve **katedral çevresi** için 5660×2830 gerçek, GPS'li CC BY-SA 4.0 360° panoramalar bulundu; görsel inceleme ve R2 yayın testi bekliyor.

**Toplam yeni aday statüsü:** 5 güvenli yayın kuyruğunda, 9 ek inceleme/uyarlama bekliyor; **0 yeni yayımlanan**. Drone galerisi için mevcut **4 albüm/12 fotoğraf** ayrıca bekliyor. Sayılar farklı arşiv türleri arasında toplanmamalı.

## Flickr ve diğer kaynaklar
- **Flickr:** Resmî API şartları ticari uygulamalar için ön izin/uygun API anahtarı gerektiriyor. Bu çalışmada lisansı ve API kullanım izni fotoğraf bazında tamamlanmış yeni Flickr varlığı yok; kazıma ve ithal yapılmadı.
- **Poly Haven:** Londra'daki `urban_street_01`, `urban_street_02`, `urban_street_04` HDRI'larının CC0, gerçek GPS ve 2:1 çözünürlükleri resmî API'den doğrulandı. Fakat sıradan sokak kompozisyonları ülke tahmini için yeterince ayırt edici bulunmadığından yayına alınmadı.
- **Unsplash / Pexels / Pixabay:** CC0 kabul edilmedi; herhangi bir toplu indirme/izinsiz ithal yapılmadı.

## Bir sonraki yayın kapısı
Her yeni 360° dosya için özgün fotoğrafın güncel lisansı ve fotoğrafçı atfı, kamera/konum ve equirectangular veri, güçlü coğrafi ipuçları, Pannellum karo üretimi, R2 upload/HEAD ve dört yedek yüzün gerçek HTTP kontrolü gerekir. CC BY-SA dosyalarında dönüştürme ve aynı lisans yükümlülükleri saklanır. Bu koşulların tamamı geçmeden `approved.mjs` ve canlı oyun havuzu değiştirilmemelidir.

**Makine-okunur kayıt:** `panoramas/weekly-research/2026-10-26.json`.  
**Kaynak kontrolü:** Wikimedia Commons dosya API'si, Poly Haven resmî bilgi API'si, canlı Globriva CDN HEAD testleri, GitHub `main` arşivleri.
