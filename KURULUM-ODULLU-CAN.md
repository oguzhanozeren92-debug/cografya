# Ödüllü reklam ile +1 can — Coğrafya

## Oyun kuralları

- Karışık ve Bayrak Arenası **3 can** ile açılır.
- Canlar 1 veya 2 iken, gerçek bir ödüllü reklam SDK'sı bağlıysa üstte `🎬 +1` butonu görünür.
- Son yanlışta can sıfırlanır ve **Devam Şansı** ekranı çıkar. Burada **Reklam İzle · +1 Can** veya **Oyunu Bitir** seçilir.
- Her oyunda **en fazla 1 reklam ödülü** verilir. Ödülü kazanmış oyuncu bir daha canı bitince doğrudan oyun sonuna gider.
- **Yalnızca** AdMob'un `showRewardVideoAd()` tarafından döndürülen *kazandırılmış ödül* (`reward.amount > 0`) can verir. Reklamın açılması/kapanması veya başarısız olması **ödül değildir**.
- Oyuncu baştan oynamak zorunda kalmaz: ödülü alınca skor/seri korunur ve bir sonraki soruya devam eder.
- Günlük 10 Soru, Keşif Haritası ve mevcut haftalık ligler etkilenmez.

## Canlı reklamları bağlama (Capacitor iOS / Android)

Mevcut depo **React/Vite web kaynak kodu** içerir. AdMob'un iOS/Android SDK'sı veya native uygulama kabuğu depoda henüz kurulu değil. Bu sebeple reklam gösterme altyapısı ve ekranları hazır olsa da gerçek reklamlar **henüz çalışmaz**; oyuncuya sahte izlenme/ödül gösterilmez.

1. Üretilen mobil uygulama paketine `@capacitor-community/admob` sürümünü o uygulamanın Capacitor ana sürümüyle uyumlu olacak şekilde ekleyin; iOS/Android native kurulumu ve uygulama AdMob App ID yapılandırmasını tamamlayın.
2. Native sarmalayıcıda Google Mobile Ads SDK'sı için gerekli **rıza / gizlilik** sürecini tamamlayıp `AdMob.initialize()` çağırın. JS tarafında `window.Capacitor.Plugins.AdMob` erişimi olan bir native plugin köprüsü sağlamalısınız. (Sadece Vite tarayıcı önizlemesinde gösterilemez.)
3. Çalışma ortamında `VITE_ADMOB_REWARDED_IOS_ID` ve/veya `VITE_ADMOB_REWARDED_ANDROID_ID` değerlerini gerçek reklam birimi ID'leriyle tanımlayın. Bunlar **ödüllü (rewarded)** reklam birimleri olmalı; banner/interstitial birimleri değil. Ad birimi ID'leri gizli servis anahtarı değildir.
4. Test native derlemesinde `VITE_ADMOB_USE_TEST_ADS=true` yazın. Geliştirme modunda resmi AdMob test birimleri kullanılır, production build test birimlerini kullanmaz.
5. Reklam yüklenmezse, izleme yarıda kesilirse ya da ödül kazanılmazsa +1 can verilmemesini cihazda test edin. Can ödülü sadece bir kez verilmeli.
6. Çevrimiçi yarışların hileye dayanıklılığı için ileri aşamada Google'ın **server-side verification (SSV)** callback'ini sunucu tarafında doğrulayın; sadece istemci tarafındaki ödül puanına güvenmeyin.

Kod bağlantı noktası: `src/lib/rewardedAds.ts`.

Kaynaklar:
- https://github.com/capacitor-community/admob/blob/main/docs/rewarded.md
- https://developers.google.com/admob/ios/rewarded
- https://developers.google.com/admob/android/rewarded