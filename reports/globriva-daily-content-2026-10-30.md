# Globriva — 30 Ekim 2026 gerçek yükleyici, soru ve medya raporu

## Oyun yükleyicisine bağlı sabit soru envanteri
| Havuz | Başlangıç | Bitiş | Zorluk / kapsam |
|---|---:|---:|---|
| Ülke-harita | 168 | 168 | COUNTRY_DATA; zorluk COUNTRY_DATA üzerinden |
| Başkent | 168 | 168 | COUNTRY_DATA |
| Bayrak | 168 | 168 | COUNTRY_FLAG_CODES; uzaktan gelen bayrak URL'leri tek tek test edilmedi |
| Ülke ipuçları | 81 | **84** | **27 kolay / 26 orta / 31 zor** |
| Doğa Dedektifi | 39 | **42** | **14 kolay / 14 orta / 14 zor** |
| Medeniyet Dedektifi | 60 | 60 | 20 vaka × 3 soru; 10 kolay / 10 orta; zor henüz yok |
| **Toplam sabit soru** | **684** | **690** | **+6** kaynaklı, tekrarsız yeni kayıt |
| Ada Avcısı | 21 aday | 21 aday | Gerçek oynanabilir sayısı Natural Earth geometrisiyle dinamik filtrelenir |
| Sınır Dedektifi | 40 odak | 40 odak | Gerçek soru sayısı topolojik komşulukla dinamik üretilir |

## Yeni içerik ve bilgi kartları
- **Ülke ipucu +3:** Avusturya (kolay, UNESCO Viyana), Ürdün (orta, UNESCO Petra), Angola (zor, UNESCO Mbanza Kongo). Her kartta 3 farklı ipucu, cevap sonrası öğretici bilgi ve kaynak URL'si vardır. Ülke adını soru öncesinde açıkça vermeyen ipuçları kullanıldı.
- **Doğa +3:** Tongariro Millî Parkı (Yeni Zelanda, kolay), Nakuru Gölü (Kenya, orta), Manú Millî Parkı (Peru, zor). Her birinde TR/EN ipucu, yaklaşık harita koordinatı, UNESCO birincil kaynak bağlantısı ve iki dilli cevap sonrası açıklama vardır.
- **Çeviri açığı giderildi:** Daha önce Türkçe kalan 18 ülke ipucu kartı ve bugünkü 3 yeni kart için 9 dilde bölge/ipucu akışı tamamlandı; İspanyolca, Almanca, Fransızca, Portekizce, Rusça, Çince ve Japonca için toplam 147 ek yerel özellik karşılığı eklendi.
- **İçerik sızıntısı kontrolü:** 84 ülke ipucu, 42 doğa sorusu ve 20 tarihî vaka için sorudan önce görünen metinlerde doğru cevabın birebir geçmesi tarandı: **0 yeni hata**.
- **Kalan zorluk uyumsuzluğu:** 10 eski ülke ipucu kartının zorluk seviyesi, harita ülke meta seviyesinden farklı. Bunlar otomatik değiştirilmedi; kart ve harita zorluklarının farklı olmasının bilinçli olup olmadığı editoryal olarak netleştirilmeli.

## Görsel arşivi: oyun dosyaları ve kaynak kayıtları
- Sokak Dedektifi: 37 onaylı konum × 4 JPG = **148** yerel dosya.
- Drone 360°: 5 onaylı konum × 4 JPG = **20** yerel dosya.
- Drone galerisi: 16 onaylı albüm, **51** yerel fotoğraf.
- **Yerel oyun medya dosyası 219 → 219.** GitHub ağacında dosyalar var; bu, tüm CDN URL'lerinin bugün HTTP 200 verdiğini veya fiziksel telefonda açıldığını kanıtlamaz.
- Medeniyet Dedektifi: 20 tarihî 360° vaka; 39 ek fotoğraf kaynak kaydı, bunların canlı erişimi ayrıca doğrulanmalı. 39 kaynak kaydı yerel 219 dosyaya dahil değil.
- **Yeni tam doğrulanıp canlı yayımlanan görsel: 0**. Lisansı ve kaynağı bilinen fakat mobil/CDN koşulları tamamlanmamış görseller oynanabilir sayılmadı.

## Yeni medya araştırması: 5 farklı ülke, 5 aday
Kaynak kayıtları: `panoramas/weekly-research/2026-10-30.json`.
1. Uruguay — Montevideo DJI havadan fotoğrafı, Santiago Mazzarovich, CC BY-SA 4.0, 3000×2248, GPS var.
2. Yeni Zelanda — Tongariro geçidi geniş panoraması, Javier Sánchez Portero, CC BY-SA 3.0, 13699×2528, GPS var; tam küresel 360° **değil**.
3. Kenya — Nakuru şehir/göl panoraması, Trees ForTheFuture, CC BY 2.0, 4864×1296; fotoğraf bazında GPS henüz doğrulanmadı.
4. Ürdün — Wadi Rum gece 360° panoraması, Faraheed, CC BY-SA 4.0, 8000×4000; kesin GPS ve mobil parlaklık kontrolü bekliyor.
5. Angola — Luanda sokak fotoğrafı, Fabio Vanin, CC BY-SA 3.0, 3648×2736; kesin GPS ve mobil kalite kontrolü bekliyor.

**Yanıltıcı aday elendi:** `At Montevideo 2023 360.jpg` adında 360 yazmasına rağmen fotoğraf otel banyosunu gösteren dikey normal görüntüdür; 360 veya şehir panoraması olarak kullanılmadı. Önceki aday ve yayın listeleriyle dosya adı tekrar kontrolü yapıldı: yeni 5 adayda tekrar yok.

## Testler, derleme, açık engeller
- Kaynak üzerinde gerçekleştirilen JS yapısal/semantik denetim: 84 ipucu, 42 doğa, 42 doğa bilgi kartı, 84 çeviri sinyali, 20 tarihî vaka, 60 tarih sorusu ve 39 tarihî ek görsel kaydı. **0 içerik/cevap sızıntısı hatası**. Eski 10 zorluk etiketi farklılığı uyarı olarak bırakıldı.
- Yeni veri kayıtlarında ID tekrarları, coğrafi koordinat sınırları, doğru ülke zorlukları, açıklama ve kaynak alanları kontrol edildi.
- Vercel üretim derlemesi `adba64024ff47f6d2cf0f4a930c1e6eb6ad3d2a0` için **READY**. Bu, `npm run typecheck` veya tam `node --test` sonucu yerine geçmez.
- **Tam Node testleri ve TypeScript kontrolü çalıştırılamadı:** Vercel Sandbox oluşturma çağrısı 402 `payment_required` (snapshot depolama limiti; sıfırlanma 2026-11-01 UTC). GitHub Actions'ın önceki çalıştırıcı atama sorunu da çözülmüş olarak doğrulanmadı.
- **Canlı CDN HTTP ve fiziksel mobil görüntü testi tamamlanmadı**; doğrulanmış bir yeni bozuk bağlantı veya başarılı yeni yayın iddiası yok.
- Yeni adaylar doğrudan yayımlanmadı; bunun nedeni gereksiz yayın kuyruğu değil, eksik gerçek dosya HTTP, konum, dönüştürme ve mobil kalite kontrolleridir.

## Kod ve içerik commitleri
- `556756fab9ab318cb9560d320de18236c0b64dd1` — 3 ülke ipucu.
- `90e05ff427aa8e8bf05f9a3959e2be6a113c75eb` — 3 doğa konumu.
- `ccd93ca8d5b97711804c3d1a2a85495a1823f259` — 3 doğa bilgi kartı.
- `6a828ed93ec069d30d64bd071f9b80ef60a8c7bd` — test sayıları.
- `ef3fd9df719248491647478875288eabaeffb771` — 21 ülke ipucu için çok dilli sinyaller.
- `43aa7e11315a754dfd3d7d5ba59bf0b399c155c9` — 147 yerel özellik çevirisi.
- `adba64024ff47f6d2cf0f4a930c1e6eb6ad3d2a0` — eksik çevirileri yakalayan test.
- `4efe10243df67a9e353abbcd7f3e88ab15c6f933` — 5 yeni medya araştırma kaydı ve 1 yanıltıcı adayın elenmesi.

Kaynaklar: https://whc.unesco.org/en/list/1033/ ; https://whc.unesco.org/en/list/326/ ; https://whc.unesco.org/en/list/1511/ ; https://whc.unesco.org/en/list/421/ ; https://whc.unesco.org/en/list/1060/ ; https://whc.unesco.org/en/list/402/ .
