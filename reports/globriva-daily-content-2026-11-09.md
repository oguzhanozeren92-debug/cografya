# Globriva içerik ve yükleyici denetimi — 2026-11-09

## Doğrudan GitHub kaynak sayımı (yayın doğrulaması değil)
- `src/data/countries.ts`: 168 ülke. Ülke/başkent/bayrak üçlü tanım modeliyle 504 sabit tanım.
- `src/data/countryClues.ts`: **99 benzersiz ülke ipucu kartı** (kolay 31, orta 33, zor 35). Önceki 96 envanteri eskimiş. Son kart kimlikleri 070, 688, 442; mevcut test hâlâ 96 bekliyor.
- `src/data/geoDiscoveryModes.ts`: 66 doğa kaydı; 66 farklı teknik ID; kolay/orta/zor 22/22/22. Okavango ve Namib ikişer coğrafi tekrar: **64 farklı yer**.
- `server/history/curated*.mjs`: 5 + 5 + 10 vaka ve her vakada üç soru düzeni; önceki envanter 60 sorudur, çalışma zamanı sayımı yapılmadı.
- Böylece **kaynak tabanlı 729 sabit soru tanımı** (504+99+66+60), fakat coğrafi mükerrer iki doğa kaydı nedeniyle 727 farklı içerik konusu üst sınırı. Dinamik ada/sınır hedefleri 22/43, sabit soru toplamına katılmadı.
- `server/street/photo-ready.mjs` ve `server/street/approved.mjs`: 39 eşleşen kayıt görünür. Önceki 38 beklentisi eskimiş. Bu sayı oynanabilir panorama sayısı değildir; sokak modu filtresi ve CDN/mobil erişimi ayrı kontrol gerektirir.
- Önceki 183 benzersiz yerel oynanabilir görsel tahmini bu turda yeniden doğrulanamadı; doğrulanmış başlangıç/bitiş sayısı **bilinmiyor / bilinmiyor**. Yeni doğrulanmış/yayımlanan görsel 0/0.

## Test engelleri ve hatalar
- `tests/geo-content.test.mjs` ülke kartı sayısını 96, doğa kaydını 63, benzersiz doğa ID'sini 57, her zorlukta 21 ve onaylı panorama sayısını 38 bekliyor. Kaynaklar sırasıyla 99, 66, 66, 22 ve 39 gösteriyor.
- Coğrafi eşanlamlı/aynı koordinat tekrarlarını teknik ID benzersizliği tek başına yakalamıyor: `okavango`/`okavango-delta`, `namib`/`namib-sand-sea`.
- Çalışma ortamında `git ls-remote https://github.com/oguzhanozeren92-debug/cografya.git HEAD` DNS hatası (`Could not resolve host: github.com`) verdi. Node testleri, TypeScript, Vite derlemesi ve canlı CDN/mobil testleri **çalıştırılamadı**. Bu yüzden uygulama kodu değiştirilmedi.

## Yeni içerik adayları — YAYIN DIŞI
1. **Kültür / orta:** “Japonya'da UNESCO tarafından somut olmayan kültürel miras olarak tanınan geleneksel el yapımı kâğıt hangisidir?” Cevap: *Washi*. Açıklama: Washi, geleneksel lif işleme ve kâğıt üretimi tekniklerini kapsar. UNESCO kültürel miras kaynağıyla ve mevcut soru havuzuyla karşılaştırılmadan yayımlanmayacak.
2. **Ada / zor:** “Hint Okyanusu'nda Afrika kıyılarının doğusunda yer alan ve başkenti Moroni olan ada ülkesi hangisidir?” Cevap: *Komorlar*. Açıklama: Komorlar, Mozambik Kanalı'nın kuzey girişinde bulunan bir takımadadır. Mevcut ada/soru tekrarları ve harita geometrisi kontrol edilmeli.
3. **Şehir / orta:** “Tuna Nehri'nin iki yakasındaki Buda ve Peşte yerleşimlerinin birleşmesiyle oluşan başkent hangisidir?” Cevap: *Budapeşte*. Açıklama: Buda ve Peşte 1873'te Óbuda ile birleşerek modern Budapeşte'yi oluşturdu. Mevcut soru tekrarları ve kaynak kontrolü bekliyor.

## Fotoğraf ve panorama araştırması
Bu turda yeni fotoğraf dosyasının ticari lisansı, atıf gereksinimi, GPS/konum doğruluğu, doğrudan URL erişimi ve fiziksel mobil görüntülenmesi birlikte doğrulanamadı. Bu nedenle yeni görsel adayı **doğrulanmış 0**, yayımlanan **0**; var olan CDN bağlantılarının sağlam olduğu iddia edilmez.

## Güvenli sonraki adım
1. Ülke ipuçları 99'a çıkmışken yeni üç kartın yerelleştirmelerini ve doğru zorluklarını test et.
2. Doğa tekrarlarını kaynak doğrulamalı iki farklı yerle değiştir; isim/koordinat temelli tekrar testi ekle.
3. 39 onaylı panoramayı gerçek Street/History yükleyici filtreleriyle ve CDN URL'leriyle kontrol et.
4. Node testleri, typecheck ve build başarılı olmadan oyun koduna commit atma.
