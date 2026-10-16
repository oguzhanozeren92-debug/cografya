# Coğrafya — Gerçek AdMob ödüllü reklam bağlantısı

Mevcut Coğrafya uygulaması React/Vite web projesiydi. Bu sürüm Capacitor 8.5.3 + `@capacitor-community/admob@8.2.0` için **gerçek native SDK çağrılarını** hazırlar. Normal tarayıcıda Google Mobile Ads SDK çalışmaz; sahte can kazanımı yapılmaz.

## Coğrafya için AdMob hesabında yapılacaklar

TarlaPusula'ya ait reklam kimlikleri **kullanılmamalı**. AdMob içinde **Atlas Arena iOS** oluşturuldu ve rewarded birimi eklendi. Android hedeflenirse ayrıca uygulama ve reklam birimi açılmalıdır.

- iOS App ID: `ca-app-pub-3095980373635054~2229587754` (native Info.plist)
- iOS Rewarded Ad Unit ID: `ca-app-pub-3095980373635054/4664179401` (`VITE_ADMOB_REWARDED_IOS_ID`)
- Android App ID: `ca-app-pub-...~...` (native AndroidManifest.xml)
- Android Rewarded Ad Unit ID: `ca-app-pub-.../...` (`VITE_ADMOB_REWARDED_ANDROID_ID`)

Uygulamanın iOS/Android mağaza kimliği: `capacitor.config.ts` içinde **önerilen** `com.oguzhanozeren.cografya`. Mağazaya gönderilmeden önce benzersizliği ve hesap sahipliği doğrulanmalıdır.

iOS kimlikleri kaynak depoda yalnızca **herkese açık reklam kimlikleri** olarak `.env.production` içinde saklanır; gizli API anahtarı değildir. Native hazırlama betiği üretim dosyasını otomatik okur.

## Native proje oluşturma

```sh
npm install
npm run build
npx cap add android  # Android yayınlanacaksa
npm run native:ios   # iOS: platformu oluşturur, gerçek App ID'yi Info.plist'e yazar, sync yapar (macOS/Xcode)
```

Test için Google'ın resmi *test app ID* ve *rewarded test unit* değerlerini kullan:

```sh
ADMOB_USE_GOOGLE_TEST_APP_IDS=true npm run native:configure
VITE_ADMOB_USE_TEST_ADS=true npm run native:sync
```

**iOS üretim:** Atlas Arena'nın gerçek App ID ve rewarded unit ID'si `.env.production` dosyasında hazırdır. İlk kez `npm run native:ios`, mevcut iOS projesinde `npm run native:ios:sync` kullan. Ardından `CAPACITOR_PLATFORM=ios npm run native:release:check`, Xcode imzalama, gizlilik uyumu ve fiziksel iPhone testleri yapılmalı. Android için ayrı kimlikler hâlâ gerekir. `npm run native:release:check` yalnızca kimlik/doğru format kontrolleridir; reklam servisinin aktifliğini doğrulamaz.

## UMP gizlilik ve ödül güvenliği

`src/lib/rewardedAds.ts` her native açılışta UMP consent sorgular, gerekirse consent formunu gösterir, izin veriliyorsa AdMob'u başlatır. Başlangıç menüsündeki “Reklam gizlilik tercihleri” butonu UMP seçeneklerini açar. iOS ATT / IDFA mesajlarını AdMob üzerinden kurup UMP'ye bırakmak tavsiye edilir; aynı izni iki kere isteme.

+1 can yalnızca `AdMob.showRewardVideoAd()` sonucu **reward.amount > 0** gelirse verilir. Gösterimin kapanması, başarısız olması veya internetin kopması can vermez. Oyun başına 1 ödül limiti korunur. Günlük görev reklamsızdır. Bu ilk sürümde sunucu taraflı ödül doğrulama (AdMob SSV) **kurulu değildir**, bu yüzden rekabet skorlarının hileye karşı korunması tamamlanmış sayılmaz.

## Önemli sınırlar

- Atlas Arena iOS reklam kimlikleri yapılandırılmıştır. AdMob ekranında **Requires review** göründüğü için canlı reklam sunumu/onayı henüz doğrulanmamıştır.
- Plugin'in native derlenmesi için Capacitor platformlarının `cap add` ile üretilmesi ve Google App ID girilmesi gerekir.
- `package.json` için npm kurulum ve lockfile yenilemesi tamamlanmadan `npm ci` çalıştırılmaz.
- iOS SKAdNetwork kimlikleri ve App Store privacy declaration, Android data safety & Google Mobile Ads policy ayarları yayımlama öncesi kontrol edilmeli.

Dokümanlar: https://github.com/capacitor-community/admob/blob/main/docs/consent.md ve https://github.com/capacitor-community/admob/blob/main/docs/rewarded.md