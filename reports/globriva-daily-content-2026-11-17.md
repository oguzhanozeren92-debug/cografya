# Globriva günlük içerik ve doğrulama — 17 Kasım 2026

## Kaynak denetimi
GitHub API üzerinden `package.json`, `src/data/geoDiscoveryModes.ts`, `tests/geo-content.test.mjs`, `server/street/country-mode.mjs` ve 16 Kasım raporu okundu. Tam oyun yükleyicisi yerelde çalıştırılamadı: `git clone` -> `Could not resolve host: github.com`. GitHub API okuması ile gerçek çalışma zamanı testi aynı şey değildir.

Önceki envanter referansı: 729 sabit tanım = 504 ülke/başkent/bayrak + 99 ülke ipucu + 66 doğa + 60 medeniyet. **Bu turda uçtan uca oynanabilir soru sayısı doğrulanmadı.** Kaynakta Sokak Dedektifi için 18 doğrudan fotoğraf ID'si ve 6 kaynak fotoğraf ID'si var; bunlar doğrulanmış canlı görsel sayısı değildir. Başlangıç/bitiş referans soru sayısı 729/729, doğrulanmış oynanabilir görsel sayısı bilinmiyor/bilinmiyor. Yeni yayımlanan soru 0, görsel 0.

## Testte gözlenen teknik borç
`tests/geo-content.test.mjs` doğa için 63 kayıt / 57 ayrı ID ve ülke ipuçları için 96 kart bekliyor; önceki kaynak envanteri 66 ve 99. Bu sabitleri körlemesine güncellemek doğru değil: önce semantik konum tekrarları ve yükleyici filtresi test edilmeli. `package.json` içerisinde bağımsız `test` scripti yok; test dosyası Node test runner ile çalıştırılabilir, ancak bağımlılıklar yerelde kurulamadı. `npm run typecheck`, `npm run build`, CDN HTTP kontrolleri ve iOS testleri çalıştırılamadı.

## Yeni soru adayları — yalnızca yayın dışı
Bunlar repo-geneli tekrar ve kaynak doğrulaması geçmedi; oynanabilir havuza aktarılmadı.

1. **Ada / orta / coğrafi konum:** “Afrika'nın doğu kıyısı açıklarında bulunan, başkenti Moroni olan ada ülkesi hangisidir?” A) Komorlar B) Mauritius C) Maldivler D) Seyşeller. **Doğru A.** Açıklama: Komorlar, Mozambik Kanalı'nın kuzey ucunda yer alan Hint Okyanusu takımadalarıdır. **Tekrar riski:** 9 Kasım taslağında Komorlar geçti; bu nedenle yeni benzersiz soru sayılmamalı.
2. **Şehir / zor / nehir:** “Paraguay Nehri kıyısında kurulan ve Paraguay'ın başkenti olan şehir hangisidir?” A) Asunción B) Montevideo C) Sucre D) Córdoba. **Doğru A.** Açıklama: Asunción, Paraguay Nehri'nin doğu kıyısında bulunur.
3. **Kültür / orta / somut olmayan miras:** “Gürcistan'da çok sesli geleneksel şarkı söyleme biçimi hangi kavramla anılır?” A) Gürcü polifonik şarkıcılığı B) Fado C) Flamenco D) Gamelan. **Doğru A.** Açıklama: Gürcü polifonik şarkıcılığı, birden çok bağımsız ses çizgisinin birlikte kullanıldığı gelenektir.
4. **Doğa / zor / ekosistem:** “Botsvana'da denize ulaşmadan iç bölgede yayılan büyük sulak alan hangisidir?” A) Okavango Deltası B) Nil Deltası C) Tuna Deltası D) Mekong Deltası. **Doğru A.** Açıklama: Okavango, Kalahari havzasındaki iç deltadır. **Tekrar riski:** Okavango mevcut doğa havuzunda bulunduğundan yayımlanmamalı.

## Görsel ve yayın kapısı
Yeni lisans/atıf/konum/CDN/mobil doğrulamasından geçen fotoğraf: **0**. Önceki 379 inceleme bekleyen görsel, oynanabilir kabul edilmedi. 18+6 kimlik, 39 manifest kaydı veya yerel dosya sayısı mobil oynanabilirlik kanıtı değildir. HTTP 429 gibi kaynak sunucu hataları, uygulama CDN hatası olarak otomatik etiketlenmemeli. Bu turda güvenli görsel düzeltmesi veya oyun kodu değişikliği yapılmadı.

## Sonuç
Yeni hazırlanan 4 taslaktan 2'si bilinen konu tekrarı riski taşıyor; diğer 2'si de tam repo tekrar/kaynak testinden geçmedi. Yayın 0/0. Öncelik: oyun yükleyicisiyle gerçek envanter, doğa tekrarları, güncel testler ve cihaz üstünde görsel erişim.