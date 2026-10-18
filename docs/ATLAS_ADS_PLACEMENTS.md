# Atlas Arena — reklam yerleşim kararı (2026-10-18)

## Oyuncuyu bölmeyen model

| Yer | Format | Tetik |
|---|---|---|
| Yalnız ana menü | Alt sabit adaptif banner | Yalnız native iOS/Android, geçerli AdMob birimi ve izin varsa |
| Karışık / Bayrak / İpucu oyunu | Tam ekran geçiş | Oyun tamamen bittiğinde, yalnız önceden hazır reklam varsa |
| Sokak Dedektifi | Tam ekran geçiş | **5 turun** tamamı bittikten sonra |
| Dron Dedektifi | Tam ekran geçiş | Tüm tur tamamlanınca |
| Günlük 10 soru | Tam ekran geçiş | 10. cevap bitince; 24 saatte tekrarlanan tamamlanmış oturum yeniden tetiklemez |
| İsteğe bağlı ekstra can | Ödüllü video | Oyuncunun açıkça "reklam izle" tuşuna dokunmasıyla (mevcut işleyiş korunur) |
| Harita döndürme, soru, cevap, ipucu, 360° görüntü, haritada konum seçme | **Reklam yok** | Asla oyun sırasında gösterilmez |
| Keşif, haftalık sıralama, günlük görev açıkken, bildirim paneli | **Banner yok** | Banner kaldırılır, butonlar kapatılmaz |

### Sıklık koruması

- İlk **2 tamamlanan oyun reklamsızdır**.
- Her tam ekran geçiş reklamı arasında **en az 3 tamamlanan oyun ve 6 dakika** geçmesi gerekir.
- Tam ekran reklam yalnız **önceden yüklenmiş** ise gösterilir. Reklam yoksa tur geçişi asla bekletilmez.
- Ana menü bannerı yalnızca native; web/Vercel sürümünde reklam görünmez, sahte reklam alanı oluşturulmaz.
- Menünün alt boşluğu yalnız gerçekten yüklenen bannerın yüksekliği kadar artırılır (iPhone çentik/safe area duyarlı).
- Reklam yüklenemezse uygulamanın çalışması etkilenmez.

## AdMob bağlantısı — henüz eksik gerçek birimler

Mevcut `VITE_ADMOB_REWARDED_IOS_ID` gerçek iOS ödüllü reklam birimi korunur.
**Banner ve interstitial için yeni gerçek reklam birimleri otomatik oluşturulmadı.**
Bunlar AdMob panelinden her platform için ayrı oluşturulup şu değişkenlere girilmelidir:

```
VITE_ADMOB_BANNER_IOS_ID=ca-app-pub-.../...
VITE_ADMOB_BANNER_ANDROID_ID=ca-app-pub-.../...
VITE_ADMOB_INTERSTITIAL_IOS_ID=ca-app-pub-.../...
VITE_ADMOB_INTERSTITIAL_ANDROID_ID=ca-app-pub-.../...
```

Eksik birimler ilgili reklam türünü **güvenli biçimde kapalı** tutar. `VITE_ADMOB_USE_TEST_ADS=true` sadece yerel/native TEST derlemede Google test birimlerini açar. Mağaza dağıtımında test reklamları ve test App ID reddedilir: `npm run native:release:check`.

**Google UMP onayı** alınmadan hiç bir reklam yüklenmez. Gerçek reklam yayını için mağaza gizlilik bildirimleri, hedef yaş kitlesi, bölgesel izin/kişiselleştirme kuralları ve AdMob app-ads.txt / hesap politikaları ayrıca gözden geçirilmelidir.

## Kontrol listesi

1. `npm run typecheck` ve `npm run build` GitHub CI'da geçmeli.
2. Gerçek iPhone'da native test reklamları ile ana menü bannerı alt butonları örtmemeli.
3. Bayrak, harita, ipucu, Sokak Dedektifi ve Dron Dedektifi sırasında banner görünmemeli.
4. İlk 2 tamamlanan oyun ve 6 dakika koşuluna kadar tam ekran reklam çıkmamalı.
5. Ağ yavaşsa oyun anında devam etmeli; reklama ait bekleme ekranı olmamalı.
6. Ödüllü reklam yarıda kapanırsa can verilmemeli.
7. Yayın öncesinde gerçek banner/interstitial birimleri ayrıca bağlanmalı. Vercel kotası açılmadan yeni kodun canlıda olduğu iddia edilmemeli.

Önemli: Apple/Facebook girişini isteğe bağlı hâle getirme ayrı bir geliştirme işidir; bu reklam değişikliği oyuncu kimlik/giriş akışını değiştirmez.
