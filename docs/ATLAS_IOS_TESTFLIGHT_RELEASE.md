# Atlas Arena iOS — TestFlight / App Store hazırlık defteri

Güncellendi: 20 Ekim 2026. Yalnızca `oguzhanozeren92-debug/cografya` deposu için.

## Şimdi hazır olanlar

- GitHub kaynak kodunda Capacitor 8, iOS uygulama adı `Atlas Arena`, önerilen bundle ID `com.oguzhanozeren.cografya`.
- `codemagic.yaml` içinde **iki ayrı, manuel başlatılan** akış:
  - `atlas-ios-smoke`: Mac'te iOS Simulator için imzasız derleme, Apple anahtarı gerekmez.
  - `atlas-ios-testflight`: Apple dağıtım sertifikasıyla imzalı IPA üretir, App Store Connect/TestFlight'a yükler. App Store incelemesine otomatik göndermez.
- `resources/icon.png` içindeki ikon otomatik olarak native AppIcon'a işlenmeye çalışılır; nihai App Store görsel kalitesi fiziksel iPhone'da kontrol edilmelidir. Ayrıca ChatGPT'de oluşturulmuş 1024px orijinal ikon ile değiştirilmesi tavsiye edilir.
- Oyun içindeki `/api/street/*` ve `/api/drone/session` istekleri native uygulamada Atlas Vercel HTTPS alanına bağlanır. API'ler iOS Capacitor kaynakları için CORS sağlar.
- Gizlilik politikası taslağı `/privacy.html` altında, uygulama menüsünden erişilebilir.
- 9 dil ve ülke ipuçları ile Vite/TypeScript testleri GitHub iş akışında tanımlıdır.

## 1. Codemagic'e ilk iOS simulator derlemesi

1. Codemagic > **Applications** > Add application > GitHub > `oguzhanozeren92-debug/cografya` projesini seç.
2. Başlangıç dalı **main**, yapılandırma dosyası **codemagic.yaml** olmalı.
3. **atlas-ios-smoke** iş akışını başlat. Apple Developer hesabına, imzaya veya ücretli yayın kimliklerine gerek yoktur.
4. İş başarılıysa build loglarında `xcodebuild ... iphonesimulator ... CODE_SIGNING_ALLOWED=NO` çıkış kodu sıfır olmalı. Başarısızsa loglardaki ilk gerçek hata düzeltilmeli.

## 2. TestFlight için imzalı IPA

1. Apple Developer hesabında `com.oguzhanozeren.cografya` App ID'yi oluştur / müsaitliğini teyit et. Gerekli yetenekleri (bildirim kullanılıyorsa APNs) yapılandır.
2. App Store Connect > Apps > yeni uygulama kayıt ekranında **Atlas Arena** adını ve aynı bundle ID'yi seç. İlk sürüm 1.0 olarak tanımlanabilir.
3. App Store Connect > **Users and Access > Integrations > App Store Connect API**: Codemagic için `App Manager` yetkili bir API anahtarı oluştur. `.p8` dosyasını **yalnızca Codemagic Team integrations > Developer Portal** bölümüne yükle; sohbet veya GitHub'a yapıştırma.
4. Codemagic bağlantısında anahtarın adını **`atlas_arena_apple`** olarak belirle. Codemagic > Code signing identities içinde eşleşen **Apple Distribution** sertifikası ve App Store provisioning profile'ı oluştur veya yükle.
5. Codemagic uygulamasında **`atlas_arena_release`** adlı Environment variable group oluştur (Apple gizli anahtarları bu gruba koyulmaz; Codemagic entegrasyonundadır). Backend kurulduğunda **`VITE_SUPABASE_URL`** ve **`VITE_SUPABASE_ANON_KEY`** kamuya açık/publishable değerlerini bu gruba ekle. **service_role** veya **sb_secret** anahtarı kesinlikle `VITE_` değişkeni olarak girme.
6. **atlas-ios-testflight** iş akışını manuel başlat. `CAPACITOR_PLATFORM=ios npm run native:release:check` gerçek AdMob iOS App ID ve rewarded unit varlığını doğrular, test reklamı açıkken paketlemeyi durdurur.
7. Codemagic başarılı olursa `.ipa` App Store Connect'e yüklenmiş olur. TestFlight > Internal Testing ekranında test kullanıcılarına atanır. **App Store incelemesine otomatik gönderilmez**.

> Yeni bağımsız Atlas Supabase projesi henüz kurulmadığından dünya ligleri ve cihaz bildirimi TestFlight'a geçmeden bağlanıp test edilmelidir. Mevcut iki Supabase projesi (sınav merkezi, tarım pusula) **Atlas için kullanılmamalı**.

## 3. Supabase

- Kullanıcıdan Supabase **organizasyonu** açıkça doğrulanmalı; yeni projenin ücretli olma ihtimali kullanıcıya onaylatılmalıdır.
- Yeni, ayrı proje oluşturulduktan sonra mevcut `supabase/` klasöründeki SQL dosyaları yalnızca o projede ve bağımlılık sırasına göre gözden geçirilerek uygulanmalı.
- Anonymous auth, RLS, dünya sıralamaları, ipucu ve oyun olayları, push device tablosu test edilmeli.
- Projenin public/publishable anahtarı Codemagic `atlas_arena_release` grubuna ve Vercel production'a verilmeli. Sonra native **yeni build** gerekir.
- Kullanıcı hesabı silme / sunucuda saklanan oyuncu kayıtları için çalışır silme süreci sağlanmalı.

## 4. App Store Connect ve inceleme (TestFlight sonrasında)

- Nihai politika sayfasındaki **doğrulanmış destek e-posta adresi** ve saklama/silme beyanları tamamlanmalı; `https://atlas-arena-tau.vercel.app/privacy.html` hem uygulama içinde hem App Store Connect metadata'da görünmeli.
- App Store Connect > App Privacy bölümünde kullanılan AdMob, Supabase, analiz, bildirim veri sınıfları ve tracking izinleri doğru işaretlenmeli.
- iPhone ve (desteklenen cihaz ailesine göre) iPad ekran görüntüleri **gerçek native build'den** alınmalı. Ödüllü reklam gösterim akışını içeren inceleme notu hazırlanmalı.
- App Review notu: hesap oluşturma zorunlu değil; açılışta takma ad belirlenir; ilk oyundan ülke sorularına, Sokak Dedektifi'ne, Dron Dedektifi'ne ve isteğe bağlı reklamla ipucuna erişim anlatılır.
- iPhone'da en az bir tam 5 turluk Sokak turu, Dron turu, normal oyun, skor kaydı, gizlilik tercihi ve internetsiz/hata durumları test edilmeli. Ödüllü reklam sonuçlanmadan ipucu verilmemeli.
- AdMob kullanımı nedeniyle ATT/Google UMP consent, reklam ID'si, veri paylaşımı ve yaş derecelendirmesi gerçek cihaz ve App Store Connect'te kontrol edilmeli.
- TestFlight'da tamamlanmadan **App Store Review'a gönderme**.

## Kullanıcıdan beklenen

1. Codemagic'e `cografya` GitHub deposunu eklemek veya zaten ekliyse uygulama sayfasını göstermek.
2. Supabase'in hangi organizasyonuna **yeni Atlas Arena** projesi açılacağını onaylamak.
3. Atlas Arena için yayımlanacak **destek e-posta adresini** vermek.
4. App Store Connect'te `com.oguzhanozeren.cografya` bundle ID'nin/uygulama kaydının oluşturulup oluşturulmadığını göstermek.

Bu maddeler tamamlanmadan mağaza onayı alınacağı vaat edilemez.
