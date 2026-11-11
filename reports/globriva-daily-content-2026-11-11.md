# Globriva kaynak denetimi — 2026-11-11

## Bu tur doğrudan sayılan kaynaklar
- `src/data/geoDiscoveryModes.ts`: 66 doğa kaydı; 66 ayrı ID, fakat yalnızca 64 ayrı adlandırılmış coğrafi yer. Zorluk: 22/22/22.
- `src/data/countryClues.ts`: 99 ülke ipucu; 99 benzersiz ülke ID'si. Zorluk: 31/33/35.
- `server/street/approved.mjs`: 39 onaylı panorama manifest ID'si.
- `server/street/photo-ready.mjs`: 39 fotoğraf-hazır ID; iki listenin ID kümeleri tamamen eşleşiyor (eksik veya yetim ID: 0).
- Önceki rapordaki 504 ülke/başkent/bayrak + 60 medeniyet + 99 ipucu + 66 doğa = 729 sabit tanım; 504 ve 60 bu tur uçtan uca yeniden sayılmadı. Ada ve sınır dinamik hedefleri bu toplama katılmadı.
- 183 yerel görsel önceki rapordan gelen sayı; canlı erişim ve mobil oynanabilirlik doğrulanmadı. 39 panorama manifest ID'si 39 çalışır panorama anlamına gelmez.

## İçerik hataları
- Okavango Deltası: `okavango` (orta), `okavango-delta` (kolay).
- Namib Kum Denizi: `namib` (zor), `namib-sand-sea` (zor).
- `tests/geo-content.test.mjs` içinde 63 doğa/57 ayrı ID/21 her seviye ve 96 ülke ipucu beklentisi var; kaynakta sırasıyla 66/66/22 ve 99. Test beklentilerini körlemesine artırmak coğrafi tekrarı gizler; önce aynı yerleri tekilleştirmek gerekir.

## Yeni özgün soru adayları (oyuna eklenmedi)
1. **Şehir / kolay:** “İki yakası Buda ve Peşte olarak bilinen, Tuna Nehri kıyısındaki Avrupa başkenti hangisidir?” Seçenekler: Budapeşte / Bratislava / Belgrad / Zagreb. Cevap: Budapeşte. Açıklama: Buda ve Peşte, Tuna'nın karşı kıyılarında gelişmiş ve 1873'te birleşmiştir. Kaynak: https://www.britannica.com/place/Budapest
2. **Kültür / orta:** “Geleneksel Endonezya kumaş süsleme sanatında, boyanın belirli alanlara ulaşmasını engellemek için kullanılan madde nedir?” Seçenekler: Balmumu / Kil / Tuz / Kireç. Cevap: Balmumu. Açıklama: Batik tekniğinde balmumuyla kaplanan kısımlar boyaya direnç gösterir. Kaynak: https://ich.unesco.org/en/RL/indonesian-batik-00170
3. **Doğa / zor:** “Güney Amerika'da Guyana, Venezuela ve Brezilya yakınlarında bulunan, düz tepeli yüksek kaya oluşumlarına ne ad verilir?” Seçenekler: Tepui / Fiyort / Atol / Moren. Cevap: Tepui. Açıklama: Tepuiler, Guyana Kalkanı'nda görülen dik yamaçlı masa dağlarıdır. Kaynak: https://whc.unesco.org/en/list/701/

Bu üç adayın mevcut yükleyiciyle tam metinsel/anlamsal tekrar kontrolü tamamlanmadı; oynanabilir içerik sayısına dahil edilmedi.

## Testler, lisans ve dağıtım
- GitHub bağlantılı dosya okumaları başarılı. `git clone` denemesi: `Could not resolve host: github.com`.
- Node testleri, TypeScript, build, CDN HTTP ve fiziksel iOS/Android görsel açılma testi çalıştırılamadı.
- Yeni fotoğraf/panorama adayı: 0. Lisans/atıf/konum/URL/mobil doğrulaması yapılmış yeni oynanabilir görsel: 0. Yeni yayımlanan soru: 0.
- Kaynak kodu veya testler değiştirilmedi. Bu dosya yalnızca denetim raporudur.

**Başlangıç → bitiş:** 729 → 729 (önceki toplamın bileşenleriyle kısmen doğrulanan sabit soru tanımı); canlı doğrulanmış oynanabilir görsel bilinmiyor → bilinmiyor.
