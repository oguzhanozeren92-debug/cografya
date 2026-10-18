# Atlas Arena — iPhone push bildirimi kurulumu

## Hazırlanan sistem
Atlas Arena yerel iOS uygulaması icin Capacitor native APNs push kodu,
bildirim izni/tercih arayuzu, Supabase cihaz tablosu, RLS, hedef ekrana
yonlendirme ve APNs gonderici Edge Function kodu eklendi.
Web onizlemede veya Vercel sitesinde native bildirim acilmaz.

Etkin iki bildirim kategorisi:
- Gunluk 10 soru, sadece o gun bitirmemis oyunculara.
- Haftalik yarismalar, yeni hafta pazartesi baslarken.
Arkadas daveti daha gercek davet altyapisi olmadigi icin pasif.

## 1. Supabase
Atlas Arena'nin kullanildigi gercek Supabase projesini dogrula.
VITE_SUPABASE_URL icindeki proje referansi ile eslesmeli.
TarlaPusula veritabanina bu SQL dosyasini uygulama.
- supabase/geo_push_notifications.sql (SQL Editor icinde calistir)
- supabase/geo_daily_discovery.sql onceden kurulu olmali.

## 2. Apple iOS
- capacitor.config.ts dosyasinda appId su an
  com.oguzhanozeren.cografya. Apple Developer App ID ile birebir eslesmeli.
- Apple Developer portalinda Push Notifications capability etkin olmalidir.
- Apple Developer > Keys bolumunden APNs Authentication Key (.p8) olustur.
  Anahtar dosyasi uygulamaya ve GitHub'a asla eklenmez.
- Xcode / Signing & Capabilities bolumunde Push Notifications ekle;
  provisioning profile icinde aps-environment entitlement bulunmali.
- Native iOS klasoru bu GitHub deposunda henüz bulunmuyor.
  Build bilgisayarinda npm ci sonrasinda ilk kurulumda npm run native:ios,
  sonraki buildlerde npm run native:ios:sync calistirilir.
  configure-push-ios.mjs AppDelegate.swift callbacklerini ekler.
- TestFlight ve App Store dagitimlari production APNs kullanir.
  Debug sandbox build icin VITE_ATLAS_APNS_ENV=sandbox derlenebilir.

## 3. Supabase Edge Function
Edge Functions icin atlas-push fonksiyonunu ayni Atlas Arena Supabase
projesine deploy et. verify_jwt=false ayarla; fonksiyon kendi guclu
ATLAS_PUSH_CRON_SECRET yetkilendirmesini zorunlu tutuyor.
Asagidaki degerler yalnizca Supabase Functions secrets'da olmalidir:
APNS_TEAM_ID, APNS_KEY_ID, APNS_PRIVATE_KEY, APNS_TOPIC ve
ATLAS_PUSH_CRON_SECRET.
APNS_PRIVATE_KEY .p8 dosyasinin PEM icerigi; APNS_TOPIC gercek Bundle ID.
SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY Edge ortaminda server'a ozeldir.

Scheduled Functions / cron iki ayri POST cagrisi yapar. Header:
Authorization: Bearer (ATLAS_PUSH_CRON_SECRET)
JSON body olarak {"kind":"daily"} veya {"kind":"weekly"}.
Onerilen saat:
- Daily: Salı-Pazar 14:00 UTC (TR 17:00); pazartesi bilerek atlanir.
- Weekly: Pazartesi 07:00 UTC (TR 10:00).

Fonksiyon tek calistirmada en fazla 200 cihazi tarar.
Kullanici sayisi arttiginda cursor/queue olusturulmalidir.

## 4. Canliya cikarmadan once
- Apple Push Notifications capability, bundle ID, APNs Key ve
  gercek iPhone/ TestFlight testi zorunlu.
- SQL + APNs secret + Edge deploy + cron henuz yapilmadi.
- Bir kullanici izin vermezse hicbir cihaz tokeni sunucuya kaydedilmez.
- Yalnizca iOS native ekranda zil simgesi gorunur; web'de gorunmez.
- Sunucu anahtarlari veya private .p8 dosyasi VITE_* degiskenlerine
  hicbir zaman konmaz.
