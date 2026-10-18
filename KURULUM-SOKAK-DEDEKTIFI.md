# Atlas Arena — Sokak Dedektifi (5 rounds, 360° Street View)

## Oyun akışı
- 5 konum; ülkelerin kimliğini yansıtan seçilmiş 20+ semt/meydan/sahil.
- Google Street View API üzerinden 360° panorama; etrafa bakma.
- Google Maps JavaScript API haritasında konum işaretleme, pan/zoom ve iki nokta arası çizgi.
- Kullanıcı harita üzerinde bir koordinat işaretler; gerçek Google panorama
  koordinatıyla Haversine mesafesi hesaplanır.
- 5000 * exp(-km/1100) her tur için; 5 turda maksimum 25000.
- Turda mesafe, şehir, ülke ve kısa bilgi; finalde toplam ve tüm tahminler.
- Ayrı Dünya ve Haftalık en iyi skor sayfası.

## 1. Google Street View anahtarı zorunlu
1. https://console.cloud.google.com/ üzerinden Atlas Arena için proje oluştur/seç.
2. Projede faturalandırmayı etkinleştir.
3. APIs & Services > Library > Maps JavaScript API etkinleştir.
4. Credentials > API key oluştur.
5. Key için Maps JavaScript API kısıtı ve güvenli HTTPS web referrer
   kısıtı (örneğin https://atlas-arena-tau.vercel.app/*) uygula.
6. Vercel'de Atlas Arena > Settings > Environment Variables bölümüne
   VITE_GOOGLE_MAPS_API_KEY ekle; yeni deploy gereklidir.
7. Google Cloud Billing > Budgets & alerts ve API quota limiti ayarla.

Google Dynamic Street View için yayın anındaki fiyat listesi:
aylık 5000 ücretsiz Street View yüklemesi, sonrasında ilk ücretli kademede
1000 başarılı yükleme için 14 USD.
Ek Google dinamik harita yüklemesi için aylık 10000 ücretsiz kullanım sınırı,
sonrasında ilk ücretli kademede 1000 yükleme için 7 USD. Güncel rakamı Google'dan doğrula:
https://developers.google.com/maps/billing-and-pricing/pricing

iOS Capacitor WKWebView uyarısı:
Apple WKWebView'in capacitor://localhost gibi HTTP(S) olmayan URL
şemalarında referrer kısıtlı Google Maps JavaScript anahtarı sorun
çıkarabilir. Gerçek TestFlight / iPhone testi yapmadan native
uyumluluk garantisi yoktur. Gerekirse Maps SDK for iOS panorama
köprüsüne geçilecek; korumasız API key kullanmak çözüm değildir.
https://developers.google.com/maps/api-security-best-practices

Google atıfları:
Google'ın StreetViewPanorama ve Map bileşenleri telif/Google logosunu kendi
gösterir; onları kaldırmak yasak.
Google'ın kullanım koşulları Street View ve Google dışı haritanın
birlikte kullanımını yasaklar; bu modda iki görünüm de Google'dandır.
Atlas Arena'nın diğer modları ve bütün uygulama kullanımı için
Google Maps Platform şartlarına uyum ayrıca değerlendirilmelidir.
https://cloud.google.com/maps-platform/terms Panorama dosyaları cache'lenmez,
indirilmez, kopyalanmaz. Tahmin haritasının sağlayıcısı da Google Maps'tir.

## 2. Supabase lig
Atlas Arena'nın GERÇEK Supabase projesini doğrula, TarlaPusula
veritabanında çalıştırma.
Supabase SQL Editor'da supabase/geo_street_leaderboard.sql çalıştır.
Anonim sign-in etkin olmalıdır.
Mevcut oyun/haftalık tablolarına dokunulmaz, ayrı
geo_street_best ve geo_street_weekly oluşturulur.
SQL kurulana kadar oyun sonuçları yalnız cihazda saklanır.
Gerçek internet sıralaması otomatik olarak oluşmuş sayılmaz.

ÖNEMLİ: Başlangıç liginde skor istemciden gelir; taklit/hile
yapılabilir. Bu nedenle ödüllü turnuva için uygun değildir.
Gelecekte sunucuya özel saklanan gerçek koordinatlar ve sunucu
tarafı tur/puan doğrulaması gerekir.

## 3. Testler
- Gerçek Street View anahtarıyla mobil Safari ve TestFlight WKWebView.
- Listedeki koordinatların kapsama alanını ve temsil gücünü gözle doğrula.
- Kullanıcı 5 tur, atlanan panoramada puan kaybı yok.
- Tahmin haritasının zoom/pan/koordinat hassasiyetini test et.
- Dünya ligi için doğru Atlas Arena SQL ve anonim Supabase auth kontrolü.
- Google Maps API maliyet bütçesi ve kota kontrolü.
