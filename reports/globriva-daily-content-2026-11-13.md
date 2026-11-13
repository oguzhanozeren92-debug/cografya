# Globriva günlük denetim — 13 Kasım 2026

## Bu tur doğrudan okunan kaynaklar
- `package.json`, `tests/geo-content.test.mjs`, `src/data/geoDiscoveryModes.ts`, `src/data/countryClues.ts`, `src/data/geoDiscoveryFacts.ts`, `server/street/approved.mjs`, `server/street/photo-ready.mjs`, `server/street/country-mode.mjs`.
- Önceki kaynak sayımı: 729 sabit soru (504 ülke/başkent/bayrak, 99 ipucu, 66 doğa, 60 medeniyet). Bu turda bütün oyun yükleyicisi yürütülmediği için **yeniden doğrulanmış toplam değildir**.
- Kaynakta 39 onaylı panorama manifesti ve 39 fotoğraf-hazır kimliği var; bu sayı **Street oynanabilir sayısı değildir**. Street filtresi `approved && ready && (STREET_PLAYABLE_IDS || STREET_PLAYABLE_SOURCE_IDS) && COUNTRY_HINTS` koşullarını uygular. Testin hedefi 19 Street panoramasıdır; bu koşul çalıştırılmadan güncel 19 kesin sayılmaz.
- Önceki sayım: 99 ülke ipucu (31/33/35), 66 doğa noktası (22/22/22), 64 benzersiz doğa konumu; 43 sınır odağı. Tam kategori/alt kategori dağılımı ve oynanabilir yerel görsel toplamı bu turda yeniden ölçülemedi.
- `tests/geo-content.test.mjs` içinde 63 doğa, 57 benzersiz ID, seviye başına 21, 96 ülke ipucu ve 38 onaylı panorama beklentileri bulunuyor. Mevcut kaynak sayımlarıyla tutarsız; körlemesine test rakamı değiştirmek yerine gerçek tekrarları düzeltmek gerekir.
- Aynı coğrafi konum çiftleri: `okavango`/`okavango-delta` ve `namib`/`namib-sand-sea`.

## Yayın dışı özgün soru taslakları
Aşağıdakiler içerik fikridir; mevcut havuzla tam anlamsal tekrar kontrolü ve kaynak doğrulaması yapılmadı.
1. **Sınır / orta / coğrafi akıl yürütme:** “Afrika'da hem Atlas Okyanusu'na hem Akdeniz'e kıyısı olan ülke hangisidir?” A) Fas B) Mali C) Çad D) Nijer. **Doğru A.** Öğrenme: Fas'ın kuzey kıyısı Akdeniz'e, batı kıyısı Atlas Okyanusu'na açılır.
2. **Ada / zor / konum:** “Hint Okyanusu'nda Afrika'nın doğusunda, ana adası Unguja olan takımada hangisidir?” A) Zanzibar B) Azorlar C) Faroe D) Aleutlar. **Doğru A.** Öğrenme: Zanzibar, Tanzanya'ya bağlı ve Unguja ile Pemba adalarını içeren bir takımadadır.
3. **Kültür / orta / UNESCO teması:** “Geleneksel `hāngi` pişirme yönteminde yiyecekler genellikle nerede pişirilir?” A) Toprak içindeki ısıtılmış taşlarla B) Buz üzerinde C) Açık deniz suyunda D) Güneşte kurutularak. **Doğru A.** Öğrenme: Māori hāngi yönteminde yiyecekler sıcak taşlarla ısıtılan toprak çukurunda pişirilir.

**Taslak 3; doğrulanmış yeni aday 0; oynanabilir yayımlanan soru 0; yayımlanan görsel 0.** Görsel için ticari lisans, atıf, koordinat, dosya URL'si, CDN ve mobil açılma kontrolleri tamamlanmadı.

## Çalıştırma ve güvenlik
- GitHub bağlı dosya okuma başarılı.
- Yerel `git ls-remote`: `Could not resolve host: github.com`; tam checkout yapılamadı. Node testleri, TypeScript, build ve gerçek iOS/Android görüntüleme testleri **çalıştırılamadı**.
- Kod veya oynanabilir manifest değiştirilmedi; doğrulanmamış içerik yayımlanmadı.
- **Başlangıç/bitiş soru:** önceki kaynak envanteri 729 → 729 (bu turda yükleyici doğrulaması yok). **Canlı doğrulanmış oynanabilir görsel:** bilinmiyor → bilinmiyor. **Commit:** yalnızca bu denetim raporu.
