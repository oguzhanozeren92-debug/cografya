# Globriva içerik denetimi — 2026-11-10

## Kaynak bazlı envanter (main, commit 492561b6921b68049be6a2947e6a4bb04fd88920)

- Doğa Dedektifi: 66 kayıt (22 kolay / 22 orta / 22 zor, önceki kaynak denetimine göre); Okavango Deltası ve Namib Kum Denizi çift kayıtlı: en fazla 64 benzersiz coğrafi konum.
- Ülke ipuçları: önceki kaynak denetimi 99; bu turda tüm kartlar programatik olarak sayılmadı.
- Ülke/başkent/bayrak: önceki envanter 504.
- Medeniyet: 5+5+10 vaka, her vakada 3 soru = 60 tanım.
- Sabit soru toplamı: önceki envanter 729; bu turda tüm oyun yükleyicisi uçtan uca çalıştırılamadı.
- Onaylı panorama manifesti: 39 kayıt; photo-ready listesi: 39 ID. Bunlar canlı URL ve mobil açılabilirlik kanıtı değildir.
- Önceki yerel görsel envanteri 183; canlı doğrulama yok.

## Açık kalite engelleri

1. tests/geo-content.test.mjs eski beklentiler içeriyor: 63 doğa, 57 benzersiz ID, 21/seviye ve 96 ülke ipucu. Mevcut kaynaklarla tutarsız.
2. Doğada aynı yer iki ayrı ID ile kayıtlı: okavango/okavango-delta, namib/namib-sand-sea.
3. Bu ortamda git clone DNS hatası verdi; Node, TypeScript ve üretim testleri çalıştırılamadı.
4. 39 panorama manifest kaydının HTTP, R2 döşeme URL, mobil görüntü ve lisans-atıf zinciri uçtan uca doğrulanamadı. Yeni oynanabilir görsel eklenmedi.

## Yayımlanmayan özgün soru taslakları

Bu sorular oyun yükleyicisine bağlı değildir; tekrar kontrolü, lisans ve kaynak denetimi tamamlanmadan yayımlanmayacaktır.

1. **Ada / orta:** “Hint Okyanusu'nda Afrika ana karasının doğusunda bulunan ve lemurlarıyla tanınan büyük ada hangisidir?” Seçenekler: Madagaskar / Sri Lanka / Borneo / Sumatra. **Cevap:** Madagaskar. **Bilgi:** Madagaskar'ın uzun süreli coğrafi izolasyonu, kendine özgü canlı çeşitliliğinin gelişmesine katkıda bulunmuştur. Kaynak: https://www.britannica.com/place/Madagascar
2. **Sınır / orta:** “Güney Amerika'da hem Kolombiya hem Peru ile kara sınırı bulunan ve Galápagos Adaları'nı yöneten ülke hangisidir?” Seçenekler: Ekvador / Şili / Uruguay / Paraguay. **Cevap:** Ekvador. **Bilgi:** Galápagos Adaları, Ekvador ana karasının batısında Pasifik Okyanusu'nda yer alır. Kaynak: https://www.britannica.com/place/Ecuador
3. **Kültür / zor:** “Japonya'nın geleneksel el yapımı kâğıt üretim tekniği hangi adla bilinir?” Seçenekler: Washi / Batik / Ikat / Talavera. **Cevap:** Washi. **Bilgi:** Washi üretiminde lif hazırlama ve kâğıdı elle oluşturma teknikleri kültürel miras olarak aktarılır. Kaynak: https://ich.unesco.org/en/RL/washi-craftsmanship-of-traditional-japanese-hand-made-paper-01001

## Sonuç

Başlangıç/bitiş: 729 → 729 sabit soru tanımı (önceki envanter, bu turda uçtan uca doğrulanmadı); canlı doğrulanmış oynanabilir görsel sayısı başlangıç/bitiş **bilinmiyor**. Yeni taslak: 3; yeni yayımlanan soru: 0; yeni fotoğraf adayı: 0; yayımlanan görsel: 0. Uygulama kodu değiştirilmedi.
