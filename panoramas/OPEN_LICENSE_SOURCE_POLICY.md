# Globriva — fotoğraf kaynakları ve yayın politikası

Bu kılavuz **reklamlı/ticari bir coğrafya oyunu** için geçerlidir. Ücretsiz
görüntüleme izni, fotoğrafı indirip oyun arşivinde tekrar yayımlama izni
anlamına gelmez. Kaynağın lisansı, platform erişim koşulları, fotoğrafın
konum doğruluğu ve gerçek görsel içeriği ayrı ayrı kontrol edilir.

## Kaynak öncelikleri

| Kaynak | Durum | İzin / kontrol |
| --- | --- | --- |
| Wikimedia Commons | **Birincil otomatik aday kaynağı** | Dosya bazında CC0 / kamu malı / CC BY / CC BY-SA; fotoğrafçı, sürüm, kaynak ve değişiklik notları korunur. |
| Flickr Creative Commons | **İkincil aday kaynağı; otomatik ithal yok** | Fotoğrafın gerçek CC lisansı ticari kullanım ve gerekli uyarlamalara izin vermeli; CC BY / BY-SA / CC0 öncelikli. Lisans, orijinal kaynak, fotoğrafçı ve platform/API koşulları doğrulanır. |
| Poly Haven | **CC0 360° HDRI; konum oyunu için şartlı** | Varlık lisansı CC0. Ancak çoğu HDRI belirli bir şehir/ülke tahmini için uygun değildir; hassas konum ve gerçek çekim alanı doğrulanmadan oyun sorusu olmaz. API/indirime ayrı site kullanım koşulları uygulanır. |
| Unsplash | **Tekil kullanım değerlendirmesi** | Unsplash License CC0 değildir. Ticari kullanım mümkün olabilir; rakip fotoğraf hizmeti oluşturma ve toplu erişim koşulları kontrol edilir. |
| Pexels | **Tekil kullanım değerlendirmesi** | Pexels License CC0 değildir. Ticari kullanım mümkün; yeniden dağıtım ve API kurallarına uyulur. Erişim anahtarı yoksa otomatik toplama yapılmaz. |
| Pixabay | **Tekil kullanım değerlendirmesi** | İçeriklerin tamamı CC0 değildir. Pixabay Content License (ve eski tarihli CC0 istisnaları), tek başına dağıtım yasağı ve üçüncü kişi/marka hakları kontrol edilir. |
| 360Cities / AirPano / Street View | **İzin veya resmî API olmadan arşiv ithali yok** | Sitede görüntüleme veya gömme hakkı R2'ye yeniden yükleme hakkı değildir. |

**Otomatik yayın güvenliği:** Mevcut `publish_drone_gallery.py` yalnızca
Wikimedia Commons'tan özgün kaynak bağlantılarını doğrulayarak yayınlar.
Bu kısıt başka sitelerden görseller için baypas edilmez. Farklı bir kaynağın
ithali, o kaynağa özel ayrı lisans doğrulaması ve yasal erişim yöntemi gerektirir.

## Her fotoğraf için zorunlu denetim

- [ ] Kaynak sayfası ve **asıl** dosyanın hâlâ erişilebilir olması
- [ ] Fotoğrafçı veya gerçek hak sahibinin adı; özgün kaynak ve lisans URL'si
- [ ] Lisansın ticari oyuna, indirmeye ve gerekli uyarlamalara izin vermesi
- [ ] CC BY-SA gibi lisanslarda uygun atıf ve uyarlanmış görsel lisansı
- [ ] Gerçek görüntünün görsel kalite, çözünürlük ve oyun ipuçları açısından incelenmesi
- [ ] Ülke, şehir ve gerekiyorsa GPS bilgisinin bağımsız doğrulanması
- [ ] Gerçek 360° için equirectangular/kübik panorama doğrulaması; geniş açı = 360° değil
- [ ] Tekrarlanan kaynak, kötü görüntü, uygunsuz konum ve ülke çeşitliliği kontrolleri
- [ ] Cloudflare R2 yükleme, bütün resimleri GET/HEAD ile kontrol ve oyun oturumu testi

Yalnızca lisans doğrulaması geçmiş fotoğraflar, **görsel ve konum onayı
almadıkları sürece** yayınlanmaz. Ana Globriva oyunu hiçbir aday kayıt nedeniyle
bozulmaz; beş onaylı Drone panoraması ve mevcut Sokak havuzu çalışmaya devam eder.

## Kaynak bağlantıları

- https://commons.wikimedia.org/wiki/Commons:Licensing
- https://www.flickr.com/help/terms/api
- https://polyhaven.com/license
- https://unsplash.com/license
- https://www.pexels.com/license/
- https://pixabay.com/service/license-summary/
