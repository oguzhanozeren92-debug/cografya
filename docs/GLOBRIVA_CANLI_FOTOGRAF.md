# Globriva — 3–4 fotoğraflı canlı konum albümleri

## Temel karar

**360° görüntü zorunlu değildir.** Her konumun aynı şehri/ülkeyi temsil eden **3 veya 4 gerçek fotoğrafı** bulunur. Oyuncu oklarla fotoğraflar arasında geçer, tam ekran açar ve yakınlaştırır. İlk oyun beş turdur; 50 fotoğraf tek turda oynatılmaz.

İlk hedef **50 ADET FARKLI FOTOĞRAF**. Bu, 50 konum veya 50 panorama anlamına gelmez; örneğin 13 konum × 4 fotoğraf = 52 fotoğraf. Kopya dosyalar sayılmaz. 50 ayrı lisanslı fotoğraf, en az 10 farklı ülkeden tamamlandığında yeni arşiv otomatik açılır.

## İçerik eklemek için kullanılan dosya

`panoramas/drone-gallery-candidates.json` — yeni fotoğraf albümlerinin kaynakları, eser sahipleri, lisans bağlantıları, konumları, ipuçları ve onay durumları.

Şu anda burada **4 albüme ayrılmış 15 kaynak adayı** var:

- Birleşik Krallık / Londra — 4
- Türkiye / İstanbul — 4
- İtalya / Roma — 4
- Fransa / Paris — 3

Bu 15 kayıt **araştırılmış adaydır**. Fotoğrafların son görsel doğrulaması ve R2'ye yüklenmesi yapılmadan bunları aktif sayma. Her albümde `reviewedLocation` ve `reviewedQuality`, ayrıca her fotoğrafta `reviewedVisual`, `reviewedLicense` ve `reviewedPlace` doğrulanıp `true` yapılmalıdır. Sadece dosya adlarına dayanarak onay verme.

## Yayınlama

GitHub Actions → **Globriva — publish 3-4 photo location albums to R2** → **Run workflow** → `ids` alanına virgülle ayrılmış en çok 10 adet onaylı albüm kimliği (ör. `album-001,album-002`) yaz.

`scripts/panoramas/publish_drone_gallery.py` şunları yapar:

1. **Her fotoğrafı ayrı ayrı** Wikimedia Commons'ta lisans açısından yeniden doğrular.
2. Fotoğrafları indirip en az 1.100 × 650 uygun kalitede olduklarını kontrol eder; 360° oranı aranmaz.
3. Orijinalden, konum EXIF verilerini taşımayan, yüklemeye uygun optimize JPEG oluşturur.
4. R2'ye `drone-gallery/photos/<album-id>/1.jpg`, `2.jpg`, `3.jpg` ve isteğe bağlı `4.jpg` yollarına yükler.
5. Her fotoğrafın R2 HEAD ve boyut doğrulaması yapıldıktan sonra `drone-gallery/catalog-v2.json` kataloğuna albümü ekler. Başarısız albüm yayınlanmaz.
6. Etkinlik için en az **50 farklı Commons kaynağı** ve **10 farklı ülke** olması gerekir. Oyuncu her oyun başlangıcında yeni katalogdan 5 konum görür.

Yeni uygulama sürümü `/api/drone/session?v=2` üzerinden fotoğraf albümlerini tanır. Eski sürümler farklı galeri veri türünü almaz; varsa güvenli eski pilot fotoğraflara döner.

## Telif ve görünürlük

Her fotoğrafın `artist`, `license`, `licenseUrl`, `source` bilgisi ayrıdır. Oyun cevaptan **sonra fotoğrafların her biri için** lisans ve kaynağı gösterir. Paylaşım / aynı lisansla kullanım gibi CC BY-SA şartlarını ayrıca takip et. Albüm kimliklerinde şehir/ülke adı kullanma, böylece görsel URL'si oyunun cevabını söylemez.

## Mağaza ve operasyon

Bu galeri görüntüleyiciyi destekleyen uygulama kodu bir kez App Store / Google Play sürümüne dahil edilmelidir. **Sonrasındaki yeni fotoğraf eklemeleri** yalnız R2 içeriği ve katalog güncellemesiyle yapılabilir; TestFlight veya mağaza güncellemesi gerekmez.

**Henüz mağazada çalıştığı teyit edilmedi:** GitHub değişiklikleri cihaz build'i ve Vercel dağıtımı olmadan canlı değildir. Mevcut 5 fotoğraflı pilot bölüm korunur.

### Eski 360° arşivi

`panoramas/drone-live-candidates.json`, `scripts/panoramas/publish_drone_live.py` ve `drone-live/catalog-v1.json` önceki 360° sistemidir. Yeni 50 fotoğraf hedefini burada arama; yeni işler için `drone-gallery-candidates.json` kullan.
