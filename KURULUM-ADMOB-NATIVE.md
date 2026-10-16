# Coğrafya — Gerçek AdMob ödüllü reklam bağlantısı

Mevcut Coğrafya uygulaması React/Vite web projesiydi. Bu sürüm Capacitor 8.5.3 + `@capacitor-community/admob@8.2.0` için **gerçek native SDK çağrılarını** hazırlar. Normal tarayıcıda Google Mobile Ads SDK çalışmaz; sahte can kazanımı yapılmaz.

## Coğrafya için AdMob hesabında yapılacaklar

TarlaPusula'ya ait reklam kimlikleri **kullanılmamalı**. [AdMob](https://admob.google.com) > Apps > Add app bölümünden **Coğrafya** için her hedef platformda ayrı uygulama oluştur; Rewarded formatında birim ekle.

- iOS App ID: `ca-app-pub-...~...` (native Info.plist)
- iOS Rewarded Ad Unit ID: `ca-app-pub-.../...` (`VITE_ADMOB_REWARDED_IOS_ID`)
- Android App ID: `ca-app-pub-...~...` (native AndroidManifest.xml)
- Android Rewarded Ad Unit ID: `ca-app-pub-.../...` (`VITE_ADMOB_REWARDED_ANDROID_ID`)

Uygulamanın iOS/Android mağaza kimliği: `capacitor.config.ts` içinde **önerilen** `com.oguzhanozeren.cografya`. Mağazaya gönderilmeden önce benzersizliği ve hesap sahipliği doğrulanmalıdır.

## Native proje oluşturma

```sh
npm install
npm run build
npx cap add android  # Android yayınlanacaksa
npx cap add ios      # iOS yayınlanacaksa (macOS/Xcode gerekir)
```

Test için Google'ın resmi *test app ID* ve *rewarded test unit* değerlerini kullan:

```sh
ADMOB_USE_GOOGLE_TEST_APP_IDS=true npm run native:configure
VITE_ADMOB_USE_TEST_ADS=true npm run native:sync
```

**Üretim:** Önce platform-specific gerçek App ID'leri sağlayarak `npm run native:configure` çalıştır. `.env` ya da build environment'da ilgili rewarded unit'i tanımla. `VITE_ADMOB_USE_TEST_ADS=false` olsun. Daha sonra `npm run native:sync`, `npm run native:release:check` ve cihaz testleri yapılmalı. `npm run native:release:check` yalnızca kimlik/doğru format kontrolleridir; reklam servisinin aktifliğini doğrulamaz.

## UMP gizlilik ve ödül güvenliği

`src/lib/rewardedAds.ts` her native açılışta UMP consent sorgular, gerekirse consent formunu gösterir, izin veriliyorsa AdMob'u başlatır. Başlangıç menüsündeki “Reklam gizlilik tercihleri” butonu UMP seçeneklerini açar. iOS ATT / IDFA mesajlarını AdMob üzerinden kurup UMP'ye bırakmak tavsiye edilir; aynı izni iki kere isteme.

+1 can yalnızca `AdMob.showRewardVideoAd()` sonucu **reward.amount > 0** gelirse verilir. Gösterimin kapanması, başarısız olması veya internetin kopması can vermez. Oyun başına 1 ödül limiti korunur. Günlük görev reklamsızdır. Bu ilk sürümde sunucu taraflı ödül doğrulama (AdMob SSV) **kurulu değildir**, bu yüzden rekabet skorlarının hileye karşı korunması tamamlanmış sayılmaz.

## Önemli sınırlar

- AdMob onay ve uygulama kaydı gereken harici AdMob işlemleridir. Hesap kimlikleri henüz Coğrafya deposunda yoktur.
- Plugin'in native derlenmesi için Capacitor platformlarının `cap add` ile üretilmesi ve Google App ID girilmesi gerekir.
- `package.json` için npm kurulum ve lockfile yenilemesi tamamlanmadan `npm ci` çalıştırılmaz.
- iOS SKAdNetwork kimlikleri ve App Store privacy declaration, Android data safety & Google Mobile Ads policy ayarları yayımlama öncesi kontrol edilmeli.

Dokümanlar: https://github.com/capacitor-community/admob/blob/main/docs/consent.md ve https://github.com/capacitor-community/admob/blob/main/docs/rewarded.md