# Atlas Arena — 300 adet 360° panorama, R2 kurulum ve yayın planı

**Durum:** Hedef 300, doğrulanmış / yüklenmiş dosya sayısı başlangıçta 0.
Lisansı, tam panoraması ve doğru GPS koordinatı onaylanmayan fotoğraf **oyunda gösterilmez**.
Önce 5 farklı ülkeden görüntü yükleyip iPhone'da test et, sonra partiler halinde 300'e çık.

## Seçilen yapı

- Panorama arşivi: Cloudflare R2 Standard bucket: atlas-arena
- Canlı dosya yolu: panoramas/{id}/{level}/{face}{row}_{column}.jpg
- Görsel motoru: Pannellum 2.5.7 (R2 üzerindeki multires 512px JPEG tile setleri)
- Tahmin haritası: uygulamanın mevcut world-atlas / d3-geo ülkeler haritası
- Oyun koordinatları: yalnızca Node server-side approved.mjs dosyasında
- 5 tur ve her tur 0–5.000 puan; Haversine mesafesi sunucuda hesaplanır
- Tek başına oyuncu skoru: cihazda; çevrimiçi rekabetçi puan henüz etkin değil
- Fotoğraf kaynağı: resmi Wikimedia Commons 360° kategorileri
  (Panoramax da lisansı ve indirmeyi doğrulayarak sonraki aşamada değerlendirilebilir)

## 1. R2 bucket aç (gerekli kullanıcı işlemi)
1. https://dash.cloudflare.com > R2 Object Storage > Create Bucket.
2. Ad: atlas-arena; **Standard** depolama; yayın için özel domain ekle
   (örnek: https://panorama.ornek-domain.com). r2.dev test içindir; yoğun trafikte özel domain önerilir.
3. Bucket CORS için sadece uygulama ve uygulamanın gerçek alan adını
   GET/HEAD yöntemleriyle izin verilen köken olarak ekle.
   Örn https://atlas-arena-tau.vercel.app.
4. R2 > Manage R2 API Tokens ile **yalnız bu bucket'a sınırlı** Read/Write
   token oluştur. Asla anahtarı sohbete, GitHub koduna veya Vite'a yazma.
5. GitHub / cografya > Settings > Secrets and variables > Actions kısmında
   R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY adlarında secret tanımla.
6. Vercel Atlas Arena project > Settings > Environment Variables:
   STREET_R2_PUBLIC_BASE_URL=https://pub-b3a9d7c95b2449c1a1532fb5b389ef88.r2.dev
   STREET_SESSION_SECRET=(en az 32 karakterli rastgele değer)
   **Bu ikisi VITE_ ile başlamamalı**, çünkü sunucu ayarlarıdır.
7. Vercel'de yeni bir dağıtım gerekir. Özel domain HTTPS üzerinden çalışmalı.

**Not:** Bu oturumda R2 bucket'ını veya anahtarları oluşturmadık. Gerçek yükleme yapılmadı.

## 2. 300 aday fotoğrafı keşfet
GitHub Actions > Atlas Arena 360 Panorama Library > Run workflow:
task = discover. Workflow, Wikimedia Commons kategorilerinden equirectangular
görünen fotoğrafları teknik açıdan tarar; sonucunu indirilebilir
panorama-candidates-needing-review adlı artifact içine yazar.

Bu **yayın değildir**. Her aday için editör kontrolü gerekir:
- En az 5K × 2.5K, tercihen 8K × 4K / 2:1 tam 360° equirectangular formatı
- Seçtiğimiz ülkeyi gerçekten temsil eden şehir/mahalle / sokak sahnesi
- Gerçek çekim yerinin GPS koordinatı (ülkenin başkenti tahmin edilmeyecek)
- CC0 / public domain / uygun CC-BY / CC-BY-SA lisansı
- Orijinal eser sayfası, sanatçı, lisans ve gerekiyorsa değişiklik bildirimi
- Kaynağın şartları ticari oyunda yeniden yayınlamaya izin veriyor mu?
- 20 farklı ülke, kolay/orta/zor dengesi, aynı meydanın fazla tekrar etmemesi

Sadece kontrol edilmiş satırları panoramas/reviewed.json içindeki panoramas
dizisine ekle. Her satırın formatı:
{
  "id": "fr-paris-montmartre-001",
  "sourceTitle": "File:EXACT_WIKIMEDIA_FILENAME.jpg",
  "source": "https://commons.wikimedia.org/wiki/File:EXACT_WIKIMEDIA_FILENAME.jpg",
  "country": "Fransa",
  "city": "Paris",
  "title": "Montmartre",
  "fact": "Bölgeyle ilgili kısa doğrulanmış bilgi.",
  "lat": 48.886, "lng": 2.34,
  "artist": "Gerçek sanatçı adı",
  "license": "CC BY-SA 4.0",
  "reviewedProjection": true,
  "reviewedCoordinates": true,
  "reviewedLicense": true,
  "reviewedQuality": true
}

## 3. R2'ye kontrollü yayın
Aynı GitHub Actions workflow'unda task=publish, ids alanında onaylı
ID'leri virgülle ayır. Bir çalıştırmada en fazla 10 fotoğraf seç.
Script, Wikimedia lisansını API'den tekrar kontrol eder, orijinali indirir,
Hugin/Pannellum ile alt çözünürlük parçalara ayırır, R2'ye gönderir,
ardından yalnız sunucuya açık koordinat kataloğunu tek commit'te günceller.

**Önemli:** R2 depolamada orijinal dosyalar yerine yalnız yayın tile seti
saklanır. Ancak çok çözünürlüklü parçalar da yer kaplar.
300 × 25 MB = 7.5 GB yalnız tek dosya hesabıdır; tiled toplam
ayrı hesaplanmalıdır. 10 GB ücretsiz katmanın aşılmaması garanti değildir.
R2 Standard ücretsiz: 10 GB-month ve 10 milyon Class B / ay;
işlem ve depolama aşımı ücretli olabilir.
https://developers.cloudflare.com/r2/pricing/

## 4. Oyun ve güvenlik
Başlangıçta en az 5 gerçek panorama yüklenmeden oyun açılmaz;
'360° arşiv hazırlanıyor' mesajı görünür. Aynı oturumda beş
rastgele konum seçilir. Gerçek koordinatlar istemciye önceden gönderilmez;
tahmin sonrası API sunucu hesaplamasını yapar.

Sunucu ayrıca R2 dosyalarına tarayıcı tarafından direkt erişimi kısıtlamaz;
public fotoğraf kaynakları, kredi bağlantıları ve dosya adları üzerinden
konum ipucu elde edilebilir. Kesin hile önleme için geçerli turnuva
oturumları, tek kullanımlık turlar, authenticated server score yazma,
geçerlilik denetimi ve daha kontrollü içerik dağıtımı gerekir.
Bu nedenle dünya ligine ödüllü resmi yarış skoru henüz gönderilmiyor.

## 5. Mobil performans
- 512px parçalar; Pannellum yalnız bakılan yöne gerekli seviyeleri yükler.
- R2 cache ve immutable objeler performansı iyileştirir.
- iPhone Safari / Capacitor WebView test edilmeden yayına 'tamam' denmez.
- Kullanıcının R2 erişimi yokken R2 objesi oluşturulamaz.

## Güncel bağlantı notu (18 Ekim 2026)
Kullanıcı Cloudflare R2 Standard bucket'ını `atlas-arena` adıyla oluşturdu.
Public Development URL: https://pub-b3a9d7c95b2449c1a1532fb5b389ef88.r2.dev
Vercel projesine STREET_R2_PUBLIC_BASE_URL ve sunucuya özel STREET_SESSION_SECRET değişkenleri bağlandı.
CORS ayarı, R2 yayın API kimlikleri ve ilk doğrulanmış panoramalar hâlâ gerekli.
Testten üretime geçerken r2.dev yerine Cloudflare custom domain kullanılmalı.
