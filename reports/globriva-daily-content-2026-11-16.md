# Globriva günlük denetim — 16 Kasım 2026

## Doğrudan doğrulanan kaynaklar
- `package.json`, `tests/geo-content.test.mjs`, `src/data/geoDiscoveryModes.ts`, `server/street/country-mode.mjs`, `scripts/panoramas/check-local-gallery.mjs` GitHub API ile okundu.
- Önceki kaynak envanteri: 729 sabit tanım (504 ülke/başkent/bayrak, 99 ipucu, 66 doğa, 60 medeniyet); tam oyun yükleyicisi çalıştırılmadığından **oynanabilir soru sayısı olarak doğrulanmadı**.
- Sokak listesi: 18 `STREET_PLAYABLE_IDS` + 6 `STREET_PLAYABLE_SOURCE_IDS`. Kimlik birleşimi canlı görüntü sayısı değildir.
- Doğa kaynağı önceki envanterde 66 kayıt / 64 benzersiz konum; Okavango ve Namib çakışmaları için düzeltme test edilmedi.
- Test dosyası 63 doğa, 96 ipucu, 38 panorama bekliyor; bunlar güncel envanterle uyuşmuyor.
- `check-local-gallery.mjs` onaylı galeriler için yerel JPG/WebP sihirli bayt, min 8000 bayt, kaynak ve lisans metaverisi, tekrar ve editoryal işaret kontrolü yapıyor. Bu kontrol canlı CDN, gerçek lisans veya iOS açılmasını doğrulamıyor.
- Yerel `git clone`: `Could not resolve host: github.com`; dolayısıyla npm test/typecheck/build, HTTP/CDN ve cihaz testleri çalıştırılamadı.
- Başlangıç/bitiş: referans sabit tanım 729/729 (yeniden doğrulanmadı); canlı doğrulanmış oynanabilir görsel bilinmiyor/bilinmiyor. Yeni yayımlanan 0 soru, 0 görsel.

## Yeni özgün taslaklar (yayın dışı)
Bu üç taslak tam repo-geneli tekrar, kaynak ve loader doğrulamasından geçmedi. Oynanabilir sayılmaz.
1. **Şehir / orta / eşleştirme**: “Tuna ile Sava nehirlerinin birleştiği yerde bulunan Balkan başkenti hangisidir?” A) Belgrad B) Zagreb C) Ljubljana D) Üsküp. **Cevap A.** Açıklama: Belgrad, Sava'nın Tuna'ya katıldığı noktada yer alır.
2. **Doğa / zor / oluşum**: “Namibya'da Atlantik kıyısı boyunca uzanan, sisin ekosistemde önemli rol oynadığı çöl hangisidir?” A) Namib B) Gobi C) Atakama D) Taklamakan. **Cevap A.** Açıklama: Soğuk Benguela akıntısı kıyı sisinin oluşumuna katkı sağlar. **Uyarı:** Namib konusu doğa havuzunda zaten var; konu tekrar riski nedeniyle yayımlanmamalı.
3. **Kültür / orta / kavram**: “Güney Kore'de sebzelerin fermente edilmesiyle hazırlanan geleneksel yiyecek hangisidir?” A) Kimchi B) Tempura C) Pho D) Satay. **Cevap A.** Açıklama: Kimchi, genellikle lahana veya turp gibi sebzelerin baharatlarla fermente edilmesiyle yapılır.

## Engeller ve sonraki güvenli adımlar
1. Tam loader envanterini, gerçek zorluk ve alt kategori dağılımını çalıştır.
2. Tekrar eden coğrafi konumları semantik olarak birleştir, sonra test sabitlerini gerçek beklentilere göre güncelle.
3. 379 önceki görsel adayını tek tek lisans/atıf/koordinat/URL/cihaz kapılarından geçir; canlı kontrol yapılmadan yayımlama.
4. Kaynak HTTP 429'u bozuk uygulama bağlantısı sanma; canlı bağlantı testini ayrı yap.

Bu commit yalnızca denetim ve yayın dışı soru taslaklarıdır; oyun verisi değiştirilmedi.
