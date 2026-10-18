# Atlas Arena — Yönetici Paneli ve Oyun İstatistikleri

**Yönetici adresi:** yayınlandıktan sonra https://atlas-arena-tau.vercel.app/#admin

Bu panel oyunculardan ayrıdır ve kullanıcı arayüzünden erişim bağlantısı verilmez. Ancak
gizli URL güvenlik değildir: **Supabase Auth + satır düzeyi yetki (RLS)** zorunludur.
Panel kodunun GitHub'a kaydedilmesi veya derleme geçmesi veritabanı
migrasyonunun otomatik çalıştığı anlamına GELMEZ.

## İlk kurulum (yalnızca Atlas Arena projesinde)

1. Oyunun kullandığı \`VITE_SUPABASE_URL\` değerinden **doğru Supabase proje kimliğini** belirle.
   Görüşmede erişilebilen TarlaPusula / GıdaLab projelerine yanlışlıkla uygulama.
2. Aynı projede Supabase SQL Editor üzerinden
   \`supabase/geo_admin_analytics.sql\` dosyasını bir kere çalıştır.
3. Supabase Authentication -> Users bölümünde yönetici için e-posta + güçlü parola ile
   hesap oluştur (oyuncuların anonim oturumları yönetici olamaz).
4. **Gerçek yönetici auth.users UUID** değerini doğrulayıp SQL Editor'da şu işlemi
   yalnız DB yöneticisi olarak çalıştır:
   \`insert into public.geo_admin_members(user_id) values ('UUID_BURAYA');\`
   UUID'yi tahmin etme. Bunu hiçbir frontend dosyasına, GitHub'a veya Vercel
   \`VITE_*\` değişkenine yazma.
5. Sitenin canlı derlemesini doğrula. Sonra \`/#admin\` adresinden yönetici
   e-postası ve parolasıyla giriş yap. Yetkisiz oturumlar toplu raporları
   **veritabanından okuyamaz**. Yönetici üyelik satırını silmek erişimi keser.
6. En az birkaç gerçek (test/dev değil) oyuncu soru çözdükten sonra
   1/7/30 günlük panellerin sorgularını doğrula.

## Toplanan sinyaller

- Oyun modu başlangıcı / bilinen çıkışlar; gösterilen sorular, yanıtlar ve
  doğru-yanlış; süre ve seçilen **şık indeksi**, gerekirse ipucu açılması.
- Günlük görev soru yanıtları ve tamamlanması.
- Sokak/Dron 360° görünümün yüklenme süresi, hata türü, tur atlama ve
  konum tahmini (tahmin GPS koordinatı kaydedilmez).
- Rastgele oyun oturumu UUID'si ve Supabase anonim auth UUID'si. **Ad, e-posta,
  telefon, IP, hassas konum veya gerçek cevap metni analitik tabloya yazılmaz.**
  Veriler yalnız yetkili yöneticilere **toplu** olarak sunulur.

Notlar:
- \`geo_play_events\` satırları oyuncuların istemcisi tarafından gönderilir;
  bunlar **kesin anti-cheat veya güvenilir skor kanıtı değildir**.
- Oyuncu bağlantısı koparsa bazı olaylar kaydedilmeyebilir. Gösterilen soru /
  yanıtlanan soru farkı **yaklaşık terk sinyalidir**, kesin ayrılma sayısı değildir.
- Soruların zorluk oranını erken örneklemde otomatik değiştirme. 10'dan az
  yanıtlı sorularda panel "Az veri" gösterir.
- Yönetim "İncelenecek", "İnceleniyor", "Düzeltildi", "Sorun yok" durumlarını
  kaydeder; statik soru bankasını otomatik güncellemez.
- Analytics teknik olarak **best effort** gönderilir. SQL kurulu değilse oyun
  çalışmaya devam eder ama veri kaydedilmez.
- Oyuncuların gizlilik bilgilendirmesinde analitik/çerez davranışı açıkça
  anlatılmalı; geçerli mevzuata göre gerekli tercih/izin akışları eklenmelidir.
- Üretime alırken veri saklama süresi / silme talebi politikası belirlenmeli.

## Sistemi kontrol etme

- \`npm run typecheck\`, \`npm run build\` (CI).
- Supabase SQL Editor'da \`select count(*) from public.geo_play_events;\` kontrol et.
- Oyuna girip en az 1 soru çözdükten sonra yönetici panelinde örneklem oluştuğunu gör.
- Yanlış yetkili kullanıcıyla \`geo_admin_snapshot(7)\` sorgusunun 42501 dönmesini test et.
- Mobil Safari / iOS üzerinde 360° görüntü yükleme ve geçiş süresini ayrıca test et.
