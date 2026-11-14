# Globriva günlük içerik ve yayın güvenliği — 14 Kasım 2026

## Doğrudan incelenenler
- `package.json`, `tests/geo-content.test.mjs`, `src/data/geoDiscoveryModes.ts`, `server/street/country-mode.mjs`, 13 Kasım denetimi ve son içerik arşivi commit'i.
- Önceki envanter **729 sabit soru** (504 ülke/başkent/bayrak + 99 ipucu + 66 doğa + 60 medeniyet); bu turda tam oyun yükleyicisi çalışmadığı için **güncel kesin oynanabilir sayı değil**.
- Doğa 66 kayıt / önceki sayımda 64 ayrı konum; iki anlamsal tekrar: `okavango`/`okavango-delta` ve `namib`/`namib-sand-sea`.
- 39 onaylı panorama manifest kaydı, Street oynanabilir sayısı değildir. Street oynanabilirliği `approved`, `photo-ready`, kimlik beyaz listesi ve `COUNTRY_HINTS` koşullarının birleşimidir; testin beklediği 19 değer canlı yeniden hesaplanmadı.
- Testler hâlâ 63 doğa, 96 ülke ipucu, 38 panorama bekliyor; önceki envanterle uyuşmuyor.
- Son içerik arşivi commit'i `5f92a0da42e954d49b7c11f569df994483453cb7` (13 Kasım): **62 yeni Commons galeri adayı**, toplam **379 inceleme bekleyen** kayıt; **0 yükleme / 0 aktivasyon**. Bunlar görseli ve konumu onaylanmış oynanabilir içerik değildir.
- Fotoğraf arşivinde **12 editoryal uygun albüm**, **22 editoryal inceleme bekleyen albüm**, **0 yayımlanan albüm** raporlanıyor. Çok sayıda Wikimedia isteğinde HTTP 429 görülmüş; kaynak isteği başarısızlığı, oyun içi R2 bağlantısının bozuk olduğunu tek başına kanıtlamaz.

## Bu tur yeni soru taslakları — YAYIN DIŞI
Tam tekrar ve kaynak denetimi yapılmadığı için adaylar doğrulanmış oynanabilir olarak sayılmıyor.
1. **Sınır / zor / çoktan seçmeli:** “Dünyada hem Fransa hem de Brezilya ile kara sınırı olan ülke hangisidir?” A) Surinam B) Guyana C) Venezuela D) Kolombiya. **Doğru A (Surinam).** Öğrenme: Surinam batıda Guyana, doğuda Fransa'nın denizaşırı bölgesi Fransız Guyanası ve güneyde Brezilya ile komşudur.
2. **Ada / orta / coğrafi konum:** “Afrika kıtasının batısında, başkenti Praia olan ada ülkesi hangisidir?” A) Cabo Verde B) Mauritius C) Seyşeller D) Komorlar. **Doğru A (Cabo Verde).** Öğrenme: Cabo Verde, Atlas Okyanusu'nda Batı Afrika açıklarında yer alan volkanik bir takımadadır.
3. **Kültür / orta / kavram:** “Endonezya'da UNESCO Somut Olmayan Kültürel Miras listesinde bulunan, gölgelerle yapılan geleneksel kukla tiyatrosunun adı nedir?” A) Wayang B) Kabuki C) Kathakali D) Noh. **Doğru A (Wayang).** Öğrenme: Wayang, Endonezya'da farklı kukla ve anlatım biçimleriyle sürdürülen geleneksel tiyatro sanatıdır.

## Görsel güvenlik ve test engelleri
- 62 yeni galeri adayının lisans/atıf, görsel kalite, kesin koordinat, URL HTTP erişimi, R2 yüklemesi ve mobil gösterimi **tamamlanmış değil**. Bu nedenle **0 yeni doğrulanmış görsel / 0 yayın**.
- Özellikle kaynak adaylarında `sourceCoordinates` ile şehir merkezine uzaklık sıfır görünebilmesi, fotoğrafın gerçekten o noktadan çekildiğini kanıtlamaz; tek tek coğrafi kontrol gereklidir.
- Yerel `git clone` DNS engeli: `Could not resolve host: github.com`. Node testleri, TypeScript, build, CDN ve cihaz testleri **çalıştırılamadı**.
- Önceki sabit soru sayısı **729 → 729 (yalnızca referans, yeniden sayım yok)**; canlı doğrulanmış oynanabilir görsel **bilinmiyor → bilinmiyor**.
- Oyun kodu ve oynanabilir manifest değiştirilmedi. Bu rapor dışında commit yok.
