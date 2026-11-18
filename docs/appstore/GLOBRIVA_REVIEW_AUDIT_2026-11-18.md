# Globriva — App Store yeniden inceleme denetimi
Tarih: 18 Kasım 2026 · Kaynak: oguzhanozeren92-debug/cografya

Bu rapor otomatik kaynak/CI/medya envanteri incelemesidir; fiziksel cihaz, App Store Connect, AdMob dashboard'u veya App Review onayı yerine geçmez.

## Doğrulanan kontroller
- Son App Store ATT uyarısı: iPad Air 11-inch M3, iPadOS 27.3, 1.0 (25).
- ATT istemi reklam SDK'sından önce; UMP canRequestAds doğrulanmadan reklam açılmaz; belirsiz ATT statüsü SDK'yı durdurur.
- Game Center'in izne müdahalesini önlemek üzere geciktirme ve ön plana dönünce tekrar deneme eklendi.
- Yerel ATT/AdMob kullanım açıklaması ve mağaza paketi için gerçek reklam kimliği kontrolü var; demo reklam birimleri yayında engellenir.
- Yönetici paneli iOS/Android uygulamasının erişilebilir ekran akışından çıkarıldı; web tarafında korunuyor.
- 99 ülke ipucu kartı ve 66 doğa konumu üzerinde otomatik içerik kontrolleri; Lüksemburg ipucundaki cevabı açıklayan metin düzeltildi.
- GitHub 'Atlas Arena Admin Panel CI' (commit 5ff26b9b) başarılı; reklam/privacy kalite CI (commit 51797503) başarılı.
- Vercel'de 51797503 production deployment READY. Bu, native IPA ve gerçek cihaz doğrulaması değildir.
- Yerel fotoğraf envanterinde 28 onaylı dron albümü / 87 fotoğraf: dosya eksikliği, aşırı küçük dosya veya tekrar eden Commons kaynak URL'si bulunmadı.
- 156 yerel Street yüz görseli (39 x 4) ve 20 dron yüz görseli (5 x 4) deposunda mevcut.
- ATT/izin/yerel admin girişini denetleyen regresyon testleri GitHub Actions ve her iki Codemagic iOS akışına eklendi.

## Yayına engel olabilecek bekleyen kontroller
1. Dron katalog: 87 onaylı fotoğrafın yalnızca 36'sında editoryal location/quality/visual/license/place işaretleri tümüyle tamam. 16 albüm / 51 fotoğraf hâlâ bu anlamda eksik; release gate en az 50 tam incelenmiş görsel bekliyor. Onay işaretini kanıt olmadan açma.
2. AdMob Privacy & Messaging: IDFA UMP mesajının yayın durumunu incele. Eklenti yönergesine göre UMP IDFA mesajı etkinse manuel ATT isteğiyle çakıştırılmamalı.
3. iOS 27.3 fiziksel iPad ve iPhone temiz kurulum: ATT izin ekranı; reddetme/izin verme sonrası oyun; reklam ve Game Center; çevrim dışı senaryolar; yatay/dikey kayma; 360 foto; ödüllü/ekran arası reklam; kullanıcı veri silme doğrulanmalı.
4. Apple'a özel olarak temiz kurulumdan izin ekranı ve devam eden kullanıcı akışını gösteren ekran kaydı App Review Notes'a eklenmeli.
5. App Store Connect App Privacy/Tracking, yaş derecelendirmesi, ekran görüntüleri, destek-gizlilik URL'leri, ATT amaç metni ve Apple 4.3 özgün içerik açıklaması manuel kontrol edilmeli.
6. Canlı Vercel API, Supabase RPC/RLS, R2 medya CDN ve internet bağlantı hataları gerçek cihazda çalıştırılmalı. Vercel READY olması uçtan uca sağlık kanıtı değildir.
7. Codemagic atlas-ios-testflight imzalı yeni IPA, sonra `atlas-ios-store-readiness` geçmeden App Review'a gönderme.

## Karar
**Yalnızca yeni TestFlight QA yapılabilir. App Review'a yeniden gönderime henüz hazır denemez.**
