# Globriva — canlı drone fotoğraf yayınlama

**Amaç:** Globriva iOS / Android mağazadayken yeni drone fotoğraflarını mağaza güncellemesi göndermeden yayınlamak.

## Nasıl çalışır?

- Oyunun ilk sürümündeki mevcut 5 fotoğraf güvenli yedektir.
- `/api/drone/session`, yayınlanan R2 `drone-live/catalog-v1.json` dosyasını her oturumda kontrol eder.
- **50 veya daha fazla** doğrulanmış kaydı olan katalog, yeni oyun listesini sağlar. Daha az kayıt veya R2 sorunu varsa oyun mevcut beş fotoğrafı kullanır.
- Fotoğraflar Cloudflare R2 üzerinde `drone-live/photos/<id>/f.jpg`, `r.jpg`, `b.jpg`, `l.jpg` anahtarlarıyla (dört yön) yayınlanır. Mobil oyunda görselleri göstermek için yeniden Codemagic build gerekmez.
- CDN URL'si: Vercel sunucu ortamındaki mevcut `STREET_R2_PUBLIC_BASE_URL` (R2 kamuya açık **HTTPS özel alanı**). Anahtarlar yalnızca GitHub Actions Secrets içinde saklanır.

## Fotoğraf ekleme (yönetici iş akışı)

1. `panoramas/drone-live-candidates.json` içine **yeni ID ile**, editörce doğrulanmış kayıt ekle.
2. Örneğin aşağıdaki alanları doldur. `lat/lng`, görselin çekildiği **gerçek konum** olmalı. Dört rakip ülkeden biri hedef ülke olmalı. `hint` hedefi doğrudan söylememeli.
3. Kaydı hem görsel kalitesi hem lisans hem yazar/kaynak hem de çekim koordinatı bakımından kontrol et. Yalnızca dört inceleme işaretinin de değeri **true** olan kayıtlar yüklenebilir.
4. GitHub > **Actions > Globriva — publish approved drone photos without a new app build > Run workflow**. `ids` alanına en fazla 10 ID yaz; örneğin `air-006,air-007`. 10'lu partilerle ilerle.
5. İş akışı Wikimedia Commons üzerinden kaynağı/CC lisansını doğrular, 2:1 ve en az 5000x2500 boyutu kontrol eder, dört JPG önizleme üretir, R2'ye yükler ve HEAD kontrolünden sonra **R2 kataloğunu** günceller.
6. İş akışı logunda `TOTAL READY: 50` (veya üstü) görünene kadar **yeni fotoğraflar aktif oyuna girmez**. Sonrasında uygulama yeniden açılınca yeni arşiv sunulur.

Örnek şema (yayınlanmamış taslak; gerçek onay olmadan kopyala/yapıştır yayınlama):

```json
{
  "id": "air-006",
  "sourceTitle": "File:GERCEK_DOSYA_ADI.jpg",
  "source": "https://commons.wikimedia.org/wiki/File:GERCEK_DOSYA_ADI.jpg",
  "country": "Avusturya",
  "city": "Gerçek şehir",
  "fact": "Kısa doğru yer açıklaması",
  "lat": 47.5, "lng": 14.5,
  "artist": "Gerçek eser sahibi",
  "license": "CC BY-SA 4.0",
  "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0/",
  "difficulty": "easy",
  "regionCode": "150",
  "hint": {"tr":"Dağlarla çevrili Avrupa yerleşimi.","en":"A European settlement surrounded by mountains."},
  "photoFocus": {"tr":"Dağ siluetini ve çatı biçimlerini incele.","en":"Examine the mountains and rooftops."},
  "choices": ["Avusturya", "İsviçre", "Almanya", "İtalya"],
  "reviewedProjection": true,
  "reviewedCoordinates": true,
  "reviewedLicense": true,
  "reviewedQuality": true
}
```

## Dikkat

- **Benzersiz ID** kullanılır; mevcut ID üzerine görsel yazmak yasaktır. Böylece eski CDN önbellekleri yeni fotoğrafı bozmaz.
- Wikimedia telif şartları (CC BY/SA ve benzerleri) sürdürülür; sanatçı, lisans, kaynak görüntüden sonra oyuncuya gösterilir. CC BY-SA için türev görsel dağıtımında gerekli paylaşım şartlarına da uy.
- Güncellenen veri **görseldir ve soru metaverisidir**. Uygulamanın çalışma kodunu uzaktan indirme / değiştirme söz konusu değildir.
- Sistemi bir kez mağaza sürümüne dahil etmek için **yeni bir iOS/Android build gerekir**; ondan sonraki fotoğraflar için gerekmez.
- Şu an fotoğraf kataloğunda **3 aday** var; bunların görsel, lisans, koordinat ve kalite onayları henüz beklemede. Hiçbiri şu an R2 canlı arşivine gönderilmiş değil. Geçerli **50 fotoğraf** seçilip yayınlanmadan bitmiş değildir.
- Bu ilk uygulamada yönetim arayüzü **GitHub Actions** üzerinden çalışır. Ayrı görsel admin ekranı henüz eklenmemiştir.
