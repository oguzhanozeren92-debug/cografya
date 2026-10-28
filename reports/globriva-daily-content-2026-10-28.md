# Globriva — 28 Ekim 2026 içerik ve arşiv turu

## Gerçek yükleyici envanteri (başlangıç → bitiş)
- Ülke verisi: **168 → 168** (kolay 52, orta 62, zor 54); ülke/başkent soru türleri ayrı ayrı 168 tanım.
- Bayrak kodu: **168 → 168** (FlagCDN canlı URL'leri bu tur doğrulanamadı; bunlar yeni yerel görsel sayılmaz).
- Ülke ipucu kartları: **63 → 72** (kolay 20→23, orta 19→22, zor 24→27).
- Doğa Dedektifi: **18 → 30** (kolay/orta/zor 6/6/6 → 10/10/10); her yeni kayıt iki dilli ipucu, konum ve doğrulanmış bilgi kaynağı içeriyor.
- Ada Avcısı: **21 → 21** aday ülke; oynanabilir olanlar harita geometrisiyle filtreleniyor. Geometri testleri çalıştırılamadığı için 21'in tamamı oynanabilir diye sayılmadı.
- Sınır Dedektifi: **40 → 40** odak ülke; oynanabilir sorular harita komşuluk topolojisinden üretiliyor. Ekrandaki sayı gerçek oluşturulan tura bağlandı.
- Medeniyet Dedektifi: **20 → 20** kaynaklı 360° vaka; **60 → 60** soru; **39** ek fotoğraf kaynak kaydı (canlı açılma bu tur teyit edilemedi).
- Sokak Dedektifi: **37 → 37** onaylı panorama konumu, **148 → 148** yerel dört-yön yedek JPG dosyası.
- Drone 360° pilot: **5 → 5** konum, **20 → 20** yerel dört-yön yedek JPG dosyası.
- Drone galeri: **16 → 16** onaylı albüm, **51 → 51** yerel fotoğraf; 4 albüm/12 fotoğraf yayımlanmış sayılmıyor.
- **Yerel oyun görsel dosyaları (street 148 + drone360 20 + drone galeri 51): 219 → 219.** Kaynak dosyalarının depoda mevcut olduğu kontrol edildi; canlı HTTP ve mobil açılma testleri ayrı.

## Bu tur yeni oynanabilir içerik
- **+21 özgün soru/konum ipucu**: 12 Doğa Dedektifi harita sorusu ve 9 ülke ipucu kartı.
- 12 kısa Türkçe/İngilizce öğretici bilgi kartı eklendi; soru cevabı önce gösterilmiyor.
- Kaynaklar UNESCO, USGS ve Orta Amerika turizm bilgi sitesiyle eşleştirildi.
- Ülke kartları: Şili, Kolombiya, Küba, Ekvador, Bangladeş, Madagaskar, Tanzanya, Laos, Fiji.
- Doğa kayıtları: İguazú, Ngorongoro, Ha Long, Atitlán, Uyuni, Roraima, Okavango, Wulingyuan, Turkana, Sokotra, Tsingy, Namib.

## Yeni görsel araştırması
5 ülkeden **5 yeni gerçek 2:1 360° panorama kaynağı** incelendi: Gürcistan, Nepal, Endonezya, Bangladeş, Filipinler.
- Beşinin de Commons sayfasında ticari kullanıma izin veren CC BY, CC BY-SA veya CC0 lisansı, fotoğrafçı, GPS, 2:1 çözünürlük ve 360° bilgisi var.
- Kaynak dosyalar mevcut listelerle çakışmıyor.
- **Yeni yayımlanan: 0**. Cubemap dönüşümü, CDN yüz URL'leri, mobil görüntüleme ve görsel kalite son kontrolü yapılmadığı için hiçbirini oynanabilir olarak saymadık; gereksiz yayın kuyruğuna da alınmadılar.
- Araştırma dosyası: `panoramas/weekly-research/2026-10-28.json`.

## Test ve yayın durumu
- Kaynak dosyaları üzerinde yapılan 18 mantıksal kontrolden 17'si ilk turda geçti; başarısız kontrol, eski 10 ülke ipucu kartının zorluk seviyesinin genel ülke zorluğundan farklı olmasıydı. Bu, mevcut oyun tasarımında ayrı ipucu zorluğu olabilir; **yeni eklenen 9 kartın tamamı temel zorlukla eşleşiyor**.
- 20 tarihî vakada sorunun cevabının soru öncesi ipucu/galeri metninde aynen verilmesi kontrolünde **0 sızıntı**.
- Sokak 148/148, Drone 20/20, galeri 51/51 yerel dosya kontrolü geçti.
- Vercel'de `017ace7` sürümünün üretim `npm run build` adımı başarıyla tamamlandı; yeni 21 soru bu committe var.
- GitHub Actions test işi başlatıldı ancak runner atanmadan birkaç saniye içinde başarısız oldu (job `steps=[]`, `runner_id=0`). Bu yüzden `node --test` ve `npm run typecheck` çalıştı **diye raporlanmıyor**. Tekrarlayan başarısız işleri önlemek için test akışı geçici olarak yalnızca manuel tetiklemeye bırakıldı.
- Son kaynak değişikliklerinin canlı dağıtımı ayrıca doğrulanmadı. Görsel CDN HTTP sağlık kontrolü ve fiziksel cihaz smoke testi de tamamlanmadı.

## Kaydedilen başlıca commitler
- `e5de696` — 12 yeni doğa sorusu.
- `b413505` — 9 yeni ülke ipucu kartı.
- `66b331a` — 12 öğretici bilgi kartı.
- `66a766e` — gerçek oynanabilir sınır soru sayısı ve kaynak etiketi düzeltmesi.
- `9c4d5b3` — yeni içerik ve ipucu sızıntısı testleri.
- `c574e4d` — yükleyici envanter sayacı.
- `292e757` — 5 ülkeden yeni kaynak araştırması.
- `12176e2` — GitHub Actions runner engeli için manuel test akışı.
