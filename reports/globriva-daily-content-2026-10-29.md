# Globriva — 29 Ekim 2026 içerik, medya ve yükleyici denetimi

## Oynanabilir soru envanteri (başlangıç → bitiş)
| Mod / kaynak | Önce | Sonra | Not |
|---|---:|---:|---|
| Ülke harita soruları | 168 | 168 | 52 kolay / 62 orta / 54 zor |
| Başkent soruları | 168 | 168 | 168 ülke kaydı |
| Bayrak soruları | 168 | 168 | 168 bayrak kodu; uzak FlagCDN URL'leri topluca test edilmedi |
| Ülke ipuçları | 72 | **81** | 26 kolay / 25 orta / 30 zor |
| Doğa Dedektifi | 30 | **39** | 13/13/13 kaynaklı konum; her tur 10 soru rastgele seçilir |
| Medeniyet Dedektifi | 60 | 60 | 20 vaka, 10 kolay ve 10 orta, 3 soru/vaka; zor aşama henüz yok |
| **Toplam sabit soru tanımı** | **666** | **684** | **+18** yeni, özgün, iki dilli içerik |
| Ada Avcısı | 21 aday | 21 aday | Oynanabilir alt küme Natural Earth geometrisiyle dinamik filtrelenir |
| Sınır Dedektifi | 40 odak ülke | 40 odak ülke | Soru sayısı topolojik komşuluk hesabıyla dinamik belirlenir |

## Medya envanteri (kaynak deposu)
- Sokak Dedektifi: 37 onaylı konum × 4 yerel JPG = **148**.
- Drone 360°: 5 onaylı konum × 4 yerel JPG = **20**.
- Drone galeri: 16 onaylı albüm, **51** fotoğraf; 4 onaysız albüm / 12 fotoğraf oynanabilir sayılmıyor.
- **Yerel oyun görselleri: 219 → 219**; GitHub ağacındaki beklenen 219 yolun tamamı mevcut.
- Medeniyet Dedektifi: 20 360° vaka, 39 ayrı ek görsel kaynak kaydı. Bu 39 dosyanın canlı HTTP erişimi bu tur doğrulanmadı ve yerel 219 toplamına eklenmedi.
- 168 bayrak uzaktan sağlanıyor, yerel görsel toplamına eklenmedi.

## Yeni sorular ve kalite düzeltmeleri
- **+9 Doğa Dedektifi konumu:** Plitvice, Komodo, Jeju (kolay); Sian Ka'an, Kluane, Ohri (orta); Surtsey, Tassili n'Ajjer, Lena Sütunları (zor). UNESCO Dünya Mirası dosyalarıyla eşleştirilmiş konum, TR/EN ipucu ve TR/EN öğretici bilgi kartı içerir.
- **+9 ülke ipucu kartı:** Portekiz, Hırvatistan, Güney Afrika; Kosta Rika, Nepal, İzlanda; Papua Yeni Gine, Kırgızistan, Zambiya. Her biri üç özgün ipucu ve cevap sonrası bilgi içerir.
- Cibuti kartında başkentin ülke adını açıkça vermesi ve Zimbabve kartında anıt adının cevabı açıklaması düzeltildi. 81 kartın tamamı için cevap sızıntısı testi eklendi.
- Doğa bankası 13/13/13'e yükseldi, ancak her oyunda 10 rastgele soru gösterilerek tekrar oynanabilirlik korundu.
- Sokak/Drone dört-yön fotoğrafı yerel CDN kenarında açılamazsa onaylı R2 yedek yüz URL'si bir kez otomatik deneniyor; yükleme zaman aşımı 7,5 saniyeden 12 saniyeye çıkarıldı.

## Yeni 360° kaynak araştırması
**5 ayrı ülke, 5 yeni ve önceki aday/approved listelerinde tekrar etmeyen kaynak**: Peru (Pikimachay Mağarası), Brezilya (Memorial da América Latina), Güney Afrika (Simon's Town Harbour, Poly Haven CC0), İspanya (Fuerte de Navidad), Portekiz (Évora Halk Kütüphanesi).
- Kaynak: `panoramas/weekly-research/2026-10-29.json`.
- Beşinin Wikimedia Commons kaynak sayfası, fotoğrafçı, GPS, ticari kullanıma uygun lisans ve 2:1 360° bilgisi doğrulandı.
- 2 dosyanın orijinal görüntüsü doğrudan açılarak görüldü; kalan 3 dosyanın tam dosya URL testi tamamlanamadı.
- Tam görüntü kalite kontrolü, cubemap dönüştürme, R2 yükleme, tüm yüz URL'lerinin canlı HTTP testi ve fiziksel mobil görüntüleme yapılmadı. **Bu tur yeni yayımlanan görsel: 0.** Hiçbiri oynanabilir sayılmadı veya gereksiz yayın kuyruğuna alınmadı.
- Flickr/Unsplash/Pexels/Pixabay'den otomatik kazıma veya belirsiz lisanslı dosya alımı yapılmadı.

## Test, derleme, kalan engeller
- Depo kaynakları üzerinde 9 bağımsız mantıksal kontrol geçti: soru sayısı/benzersizliği, cevap sızıntısı (ülke/doğa/medeniyet), UNESCO kaynak alanları, fotoğraf tekrarları, test beklentileri ve yerel dosya yolları.
- GitHub'daki **219/219** yerel oyun görseli mevcut; ancak bu, canlı CDN HTTP 200 veya mobil yükleme testi yerine geçmez.
- Vercel üretim derlemesi son uygulama commit'i `68c458c9e7ceb4c072dec4734b21e20f72ca6766` için **READY**. Vite paketleme tamamlandı.
- Uyarılar: `lottie-web` bağımlılığında eval kullanımı ve yaklaşık 2 MB ana JS paketi. Derlemeyi durdurmadılar.
- **`node --test` ve `npm run typecheck` çalıştırılamadı**: GitHub Actions koşucusu önceki denemelerde atanmıyordu; Vercel Sandbox bu tur HTTP 402 kota/plan engeli verdi. Bu iki test geçmiş gibi gösterilmiyor.
- Canlı görsel HTTP denetimi ve fiziksel iOS/Android görüntüleme testi tamamlanmadı. Mevcut 219 dosyanın herhangi birinin canlıda 404 verdiği kanıtlanmadı.
- 18 eski doğa konumu hâlâ yalnızca genel Natural Earth kaynak bağlantısına sahip; olgu bazında birincil kaynak ekleme gelecek turların kalite hedefidir.
- Ada/Sınır dinamik oynanabilir sayılarını dünya topolojisi testleri çalışmadan aday sayılarıyla eşitleme.

## İlgili commitler
- `8bfe56d2cad812382ffa1346870959ef352666ce`: 9 doğa konumu.
- `5aa99589e1a08cf92bfc55ab591b4cc48aa06f9e`: 9 ülke ipucu.
- `311454d7cb63248b3bf8d30437cd4d97e5287a43`: 9 öğretici not.
- `f84c349333ed10cb752f420ddefa840c5bb2a29c`: her tur 10 doğa sorusu.
- `b91333049d86a1845e921bc597c1e131c273aef5`: beş yeni araştırma kaydı.
- `c42c489c31bfaac0057ca0421248d99ec652b68c`: iki eski cevap sızıntısı düzeltildi.
- `bf922863c66c65336a4b416ff4a363e6cd7cb1e5`: fotoğraf yükleme yedeği.
- `68c458c9e7ceb4c072dec4734b21e20f72ca6766`: güncel test beklentileri.
