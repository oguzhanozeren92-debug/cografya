# Globriva günlük içerik denetimi — 12 Kasım 2026

## Doğrudan kaynak kontrolü
- src/data/countryClues.ts: 99 ülke ipucu kartı; kolay 31, orta 33, zor 35.
- src/data/geoDiscoveryModes.ts: 66 doğa noktası; kolay 22, orta 22, zor 22. Kimlikler 66 farklı; aynı coğrafi yeri anlatan iki çift: okavango / okavango-delta, namib / namib-sand-sea. Ad bazlı benzersiz yer: 64.
- server/street/approved.mjs: 39 panorama ID'si. server/street/photo-ready.mjs: 39 fotoğraf-hazır ID'si; iki küme birebir eşleşiyor. Bu yalnızca manifest tutarlılığıdır, HTTP/mobil erişimi kanıtlamaz.
- src/data/geoDiscoveryModes.ts: BORDER_FOCUS 43 hedef; ada hedefleri ve diğer sabit sorular bu turda uçtan uca sayılmadı.
- tests/geo-content.test.mjs eski beklentileri içeriyor: 63 doğa, 57 benzersiz ID, seviye başına 21; 96 ülke ipucu; 38 panorama. Gerçek kaynak değerleriyle uyuşmuyor.
- Önceki raporda 729 sabit soru ve 183 yerel görsel bildirilmişti. Bu turda tam oyun yükleyicisi ve dosya sistemi çalıştırılamadığından bunlar **yeniden doğrulanmış oynanabilir toplam** olarak gösterilemez.

## Yeni soru adayları — YAYINLANMADI
1. **Ada / orta / coğrafi oluşum:** “Afrika kıtasının doğusunda Mozambik Kanalı ile ayrılan büyük ada hangisidir?” A) Madagaskar B) Sri Lanka C) Borneo D) Grönland. **Yanıt:** A. **Öğrenme:** Madagaskar, Mozambik'in doğusunda Hint Okyanusu'nda bulunur. **Tekrar riski:** Daha önce Madagaskar sorusu tasarlanmış; tam tekrar kontrolü şart.
2. **Kültür / orta / UNESCO mirası:** “Endonezya'da kumaşa balmumu kullanılarak desen uygulanan geleneksel teknik hangisidir?” A) Batik B) Origami C) Fresk D) Mozaik. **Yanıt:** A. **Öğrenme:** Batik, kumaşın bazı bölümlerini balmumuyla koruyarak boyama desenleri oluşturur. **Tekrar riski:** 11 Kasım taslağıyla aynı konu; yeni soru olarak sayılmamalı.
3. **Doğa / zor / jeomorfoloji:** “Venezuela'nın Guyana Kalkanı'ndaki dik kenarlı masa dağlarına hangi ad verilir?” A) Tepui B) Fiyort C) Atol D) Moren. **Yanıt:** A. **Öğrenme:** Tepuiler, yüksek ve çoğu kez yalıtılmış plato tepeleridir. **Tekrar riski:** 11 Kasım taslağıyla aynı konu; yeni soru olarak sayılmamalı.

Bu adaylar tekrar elemesinde yeni kabul edilmedi: **yeni benzersiz aday 0, yayımlanan 0**. Doğrulanmamış içerik oynanabilir sayılmadı.

## Test, lisans ve erişim engelleri
- GitHub bağlantılı kaynak dosyaları okunabildi.
- Yerel git klonlama / ls-remote denemesi: github.com DNS çözümlenemedi.
- npm test, TypeScript, build ve mobil görsel açılma testleri **çalıştırılamadı**.
- Panorama manifestleri eşleşiyor, ancak URL'ler, görüntü dosyaları, lisans/atıf, koordinatlar ve iOS/Android görüntülenmesi **canlı doğrulanmadı**.
- Üretim koduna, soru havuzuna veya görsellere değişiklik yapılmadı. Bu rapor tek başına oynanabilir içerik artışı değildir.

## Öncelikli sonraki işlemler
1. Aynı yerleri anlatan iki doğa çiftini benzersiz ve doğrulanmış noktalarla değiştir; eski testleri gerçek kurallara göre güncelle, ardından çalıştır.
2. Gerçek oyun yükleyicisinin bütün sabit ve dinamik havuzlarını say; kategoriler ve zorluklarla raporla.
3. CDN URL'leri için HTTP durum, MIME, dosya bütünlüğü, lisans/atıf, koordinat ve gerçek mobil açılma denetimi yap.
