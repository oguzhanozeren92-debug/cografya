# Globriva günlük içerik denetimi — 2026-11-08

## GitHub kaynak durumu
Varsayılan dal son commit: `16a463bacd08146174e6073b571f9a6cfc162123` (7 Kasım). `src/data/geoDiscoveryModes.ts`, `tests/geo-content.test.mjs`, `package.json` ve 7 Kasım raporu GitHub bağlantısıyla yeniden okundu.

## Önce / sonra (bu turda oyun verisi değiştirilmedi)
- Ülke/başkent/bayrak: 168 ülke × 3 mod = 504 soru tanımı (önceki kaynak envanteri).
- Ülke ipuçları: 96 (testte sabitlenen sayı; bu turda ayrı çalışma zamanı yüklemesi yok).
- Doğa: 66 kayıt; 22/22/22 zorluk. İki coğrafi mükerrer çift nedeniyle 64 farklı yer.
- Medeniyet: 20 vaka × 3 = 60 soru (testin beklentisi).
- Toplam sabit tanım: 726 → 726 (önceki kaynak envanteri, tüm modlar canlı çalıştırılamadı).
- Ada: 22 hedef; sınır: 43 odak (dinamik, sabit soru toplamına katılmaz).
- Oynanabilir benzersiz yerel görsel: önceki envanter 183 → 183 (bu turda URL/mobil yeniden doğrulanmadığı için **doğrulanmış yeni toplam olarak sunulmaz**).
- Yeni yayımlanan soru/görsel: 0/0; lisans ve URL zinciri doğrulanmış yeni görsel: 0.

## Açık tutarsızlıklar
- `okavango` / `okavango-delta` ve `namib` / `namib-sand-sea` aynı yerler.
- Testte `NATURE_POINTS.length===63`, benzersiz ID 57 ve seviye başına 21 bekleniyor; kaynak envanteri 66/66/22. Yalnızca test sayılarını yükseltmek, tekrarları gidermeyeceğinden güvenli düzeltme değildir.
- Sokak testinde 19 panorama, Medeniyet testinde 20 panorama ve bunların 11 ortak olduğu varsayılıyor; 28 farklı panorama konumu sonucu ancak test çalıştırıldığında teyit edilebilir.
- Fiziksel mobil, CDN erişimi, ticari lisans, atıf ve URL testleri bu turda tamamlanmadı; hiçbir aday yayımlanmadı.

## Yeni özgün soru taslakları (YAYIN DIŞI; kaynak/tekrar/konum denetimi tamamlanmadı)
1. **Ada / orta:** 'Afrika'nın güneydoğusundaki büyük adadan Mozambik Kanalı ile ayrılan ülke hangisidir?' Cevap: **Madagaskar**. Açıklama: Mozambik Kanalı, Madagaskar ile Afrika ana karası arasında uzanır.
2. **Sınır / orta:** 'Güney Amerika'da hem Kolombiya hem Peru ile kara sınırı bulunan ve başkenti Quito olan ülke hangisidir?' Cevap: **Ekvador**. Açıklama: Ekvador'un kara komşuları Kolombiya ve Peru'dur.
3. **Doğa / zor:** 'Dünyanın en derin tatlı su gölü hangi ülkededir?' Cevap: **Rusya**. Açıklama: Baykal Gölü Sibirya'da bulunur; mevcut Baykal konumuyla tekrar riski nedeniyle yayın dışıdır.

Bu taslaklar oynanabilir soru sayısına eklenmedi; mevcut soru havuzuyla semantik tekrar karşılaştırması ve kaynak doğrulaması yapılmadan eklenmemeli.

## Test ve erişim
GitHub connector üzerinden dosya okuma başarılı. Yerel `git clone` denemesi `Could not resolve host: github.com` DNS hatasıyla başarısız oldu. Bu nedenle Node testleri, TypeScript, build ve görsel URL/mobil testleri **çalıştırılamadı**. Bu rapor dışında uygulama koduna dokunulmadı.

## Sonraki güvenli adım
Tekrarlı iki doğa yerini gerçek farklı yerlerle değiştir, bilgi notlarını ve seçenek havuzunu güncelle; normalize edilmiş coğrafi isim + yakın koordinat tekrar testi ekle; Node/typecheck/build ve canlı görsel testleri başarıyla bitmeden yayınlama.
