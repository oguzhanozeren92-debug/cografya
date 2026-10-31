# Globriva Günlük İçerik — 31 Ekim 2026

## Gerçek yükleyici envanteri ve değişim
Bu sayılar `src/data/countries.ts`, `countryClues.ts`, `geoDiscoveryModes.ts`, `api/history/session.js`, `api/street/session.js`, `api/drone/session.js`, `public/drone-gallery/catalog-v2.json` ve onaylı fotoğraf listelerinden çıkarılmıştır. Yeni adaylar oynanabilir sayılmamıştır.

| Kaynak | Önce | Sonra | Açıklama |
|---|---:|---:|---|
| Ülke harita soruları | 168 | 168 | 52 kolay, 62 orta, 54 zor |
| Başkent soruları | 168 | 168 | Aynı 168 ülke üzerinden |
| Bayrak soruları | 168 | 168 | Bayrak kodu mevcut 168 ülke |
| Ülke ipuçları | 84 | 87 | 27 kolay / 28 orta / 32 zor |
| Doğa Dedektifi | 42 | 45 | 15 / 15 / 15 |
| Medeniyet Dedektifi | 60 | 60 | 20 onaylı 360° vaka × 3 soru; 10 kolay / 10 orta vaka |
| **Sabit soru tanımları toplamı** | **690** | **696** | **+6** |
| Ada Avcısı | 21 aday | 21 aday | Harita geometrisi üzerinden dinamik; sabit soruya eklenmez |
| Sınır Dedektifi | 40 odak | 40 odak | Topoloji üzerinden dinamik; sabit soruya eklenmez |
| Sokak Dedektifi | 37 konum | 37 konum | 148 yerel JPG yüz |
| Drone 360° | 5 konum | 5 konum | 20 yerel JPG yüz |
| Drone galeri | 16 albüm / 51 foto | 16 albüm / 51 foto | 4 albüm henüz onaylı değil |
| **Onaylı yükleyiciye bağlı yerel görsel dosyası** | **219** | **219** | Kaynak ve dosya varlığı; bugünkü canlı CDN/mobil yeniden doğrulaması değildir |
| Medeniyet ek fotoğraf kaynak kaydı | 39 | 39 | Yerel 219 dosyaya dahil değil; canlı erişim ayrı |

## Yeni özgün içerikler
- Ülke ipucu +3: Sri Lanka (Sigiriya, orta), Senegal (Gorée, orta), Benin (Abomey, zor). Her kart 3 aşamalı cevabı açık etmeyen ipucu, cevap sonrası bilgi ve UNESCO birincil kaynak URL'si taşır.
- Doğa +3: Uluru–Kata Tjuta (Avustralya, kolay), Banc d'Arguin (Moritanya, orta), Sangay (Ekvador, zor). Her biri yaklaşık harita noktası, Türkçe/İngilizce soru ipucu ve iki dilli öğretici bilgi kartı taşır.
- Çok dilli ülke ipucu: 3 yeni ülke için 9 dilde bölge/başkent akışı ve 7 yabancı dilde 21 kültürel özellik çevirisi eklendi.
- Birincil kaynaklar: https://whc.unesco.org/en/list/202/ ; https://whc.unesco.org/en/list/26/ ; https://whc.unesco.org/en/list/323/ ; https://whc.unesco.org/en/list/447/ ; https://whc.unesco.org/en/list/506/ ; https://whc.unesco.org/en/list/260/ .

## Beş farklı ülkeden fotoğraf adayları
Dosya: `panoramas/weekly-research/2026-10-31.json`.
1. Avustralya: Uluru–Kata Tjuta yatay panorama, Tong Li, CC BY-SA 4.0, 5699×2119, Commons GPS var; küresel 360° değil.
2. Benin: Abomey Kraliyet Sarayları, Azogbonon, CC BY-SA 4.0, 2560×1920, kamera GPS var; normal fotoğraf.
3. Senegal: Gorée Adası, Amiral serge, CC BY-SA 4.0, 3024×3024, bakış noktası GPS var; kare normal fotoğraf.
4. Sri Lanka: Sigiriya yatay panorama, Wimukthi Bandara, CC BY-SA 4.0, 15128×3054; kaynakta çekim yeri açıklanmış, doğrudan kamera GPS yok. Orijinal dosya açıldı ve görsel ön izlemesi yapıldı; 360° değil.
5. Ekvador: Cotopaxi Millî Parkı, Eman Jaradat, CC BY-SA 4.0, 5184×3456, kamera GPS var; orijinal dosya açıldı ve görsel ön izlemesi yapıldı; normal fotoğraf.

Kaynak sayfaları ve ticari lisanslar beşinde kontrol edildi. Dört adayda kamera/bakış noktası koordinatı var. İki orijinal görüntü açılarak görsel ön izlemesi yapıldı. Hiçbir aday için R2/CDN yüklemesi, tam albüm oluşturma ve fiziksel mobil gösterim testi tamamlanmadı. Bu nedenle **yeni oynanabilir/yayımlanan: 0, kuyruk: 0, araştırma kaydı: 5**. Doğrulanmış içeriklerin doğrudan yayınlanması ilkesi korunuyor; bu kayıtlar yayın kuyruğu değildir. Unsplash, Pexels ve Pixabay CC0 sayılmadı, izinsiz kazıma yapılmadı.

## Testler ve hatalar
- GitHub kaynağından 87 ülke ipucu, 45 doğa konumu, 87 yerelleştirme sinyali, 20 tarihî vaka, 60 tarih sorusu, 39 ek görsel kaydı, 219 yerel oyun dosyası kontrol edildi.
- Bağımsız JS yapısal/semantik tarama: ID tekrarları, seviye dengesi, koordinat sınırları, ülke adının soru öncesinde sızması, doğa bilgi kartı ve kaynak bağlantısı, yeni 3 kültürel çeviri sinyali; **0 hata**.
- Vercel üretim derlemesi `bec7ff230c09aedf0b88640d55433710446f6ab6` için **READY**; Vite build başarılı. Büyük JS parçası uyarısı (2 MB) performans optimizasyonu için açık.
- Tam `node --test` ve `npm run typecheck` koşulamadı: Vercel Sandbox 402 `payment_required` (snapshot kotası; 1 Kasım 2026 UTC sıfırlanma), GitHub Actions CI job'larında runner adı boş, adımlar başlamadan failure. Bu kontroller **geçti** olarak raporlanmıyor.
- 10 eski ülke ipucunun zorluk etiketi harita ülke meta seviyesiyle farklı (300, 578, 246, 752, 372, 528, 756, 360, 862, 764). Yeni 3 kartın seviyesi eşleşiyor.
- 24 saatlik Vercel runtime hata kümesi sorgusunda street/drone/history API için hata kümesi bulunmadı; bu, her mobil görüntünün açıldığını kanıtlamaz. Canlı CDN HTTP ve fiziksel mobil testleri eksik. Bugün yeni doğrulanmış bozuk URL tespit edilmedi.

## GitHub commitleri
- `816a55661913c779836e840996b2b4730dbe5a68` — ülke ipuçları.
- `3147073a76b870e6bce3644914fba27a0b5639d3` — doğa konumları.
- `d64bb67ac4bcbcc9b1a29ec3556d6aba9fa7a474` — doğa bilgi kartları.
- `9664f6b529f6bb6b6ff171aa10c533f5e9742215` — ülke yerelleştirme sinyalleri.
- `846bcef09440031a9e2fa09092abde6e145f5ec6` — kültürel özellik çevirileri.
- `c18bfae3067bf0bb377138202757503f06dc65c2` — içerik testleri.
- `bec7ff230c09aedf0b88640d55433710446f6ab6` — görsel adayları.
