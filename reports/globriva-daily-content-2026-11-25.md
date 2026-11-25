# Globriva günlük içerik denetimi — 25 Kasım 2026

İncelenen depo: `oguzhanozeren92-debug/cografya`  
Dal: `main`  
Başlangıç HEAD: `8d7dc3587e1c5d153bfe1da7798029c1b6d70bf7`  
Yeni soru paketi commit'i: `2f80b13ef1a909ba7b0768880b8e53bb40318c1e`

## 1. Loader-linked envanter

| Havuz | Başlangıç | Bitiş | Zorluk / durum |
|---|---:|---:|---|
| Ülke kaydı | 167 | 167 | 52 kolay / 62 orta / 53 zor |
| Başkent varyantı | 167 | 167 | ülke zorluğuyla |
| Bayrak varyantı | 167 | 167 | 168 flag-code kaydı; loader 167 ülkeyle eşleşiyor |
| Ülke ipucu | 99 | 99 | 31 kolay / 33 orta / 35 zor |
| Doğa harita hedefi | 66 | 66 | 22 / 22 / 22 |
| Ada silüeti hedefi | 22 | 22 | 6 / 7 / 9 |
| Sınır odağı | 43 | 43 | geometri tabanlı oynanabilir sayısı bu tur yeniden hesaplanmadı |
| Street Detective | 19 | 19 | loader-eligible; 76 fallback face dosyası |
| Drone 360 pilot | 5 | 5 | 20 fallback face dosyası |
| Drone Gallery kataloğu | 32 albüm / 99 foto | 32 / 99 | 28 approved flag / 87 yerel foto; canlı yayın 0 |
| Yeni soru adayı | 0 | 8 | review-only |
| Yeni oynanabilir soru | 0 | 0 | loader'a bağlanmadı |
| Yeni fotoğraf adayı | 0 | 6 | review-only |
| Yeni doğrulanmış oynanabilir fotoğraf | 0 | 0 | mobil test yapılmadı |

Ülke havuzu 167 kayıttır. FlagCDN kod kataloğunda 168 kod bulunmasına rağmen loader-linked flag soru sayısı 167 ülkeyle sınırlıdır. Doğa, ada, sınır, Street ve Drone havuzları ayrı modlardır; toplam sayı olarak birbiriyle toplanmamalıdır.

Street manifestinde 39 approved/photo-ready kayıt bulunmasına rağmen loader, ülke ipuçları ve yerel fallback yüz koşullarıyla 19 oynanabilir konum seçiyor. Drone pilot 5 konumla sınırlı.

## 2. Yeni review-only soru paketi

`data/open-content/question-rounds/2026-11-25.json` dosyasına 8 aday eklendi:

- Bayrak: Nepal'in dikdörtgen olmayan çift-pennon bayrağı.
- Sınır: Arnavutluk'un kuzey komşusu Karadağ.
- Kültür: Umman aflaj su yönetimi ve yerçekimi.
- Ada: Nauru Topside ve fosfat madenciliğinin kireçtaşı yüzeyine etkisi.
- Şehir: Quito'nun yaklaşık 2.850 m rakımı.
- Medeniyet: Caral-Supe ve Amerika kıtasındaki erken uygarlık merkezi.
- Doğa: Danakil/Afar tektonik üçlü birleşimi.
- Street/şehir dokusu: Fes medinasının dar ve dolambaçlı sokak yapısı.

Her aday Türkçe ve İngilizce soru, dört seçenek, doğru cevap indeksi, kısa açıklama ve kaynak bağlantısı içeriyor. Paket yazma öncesi JSON/şema, benzersiz ID ve prompt, dört seçenek, cevap indeksi, HTTPS kaynak, tekrar kontrolü ve `playable:false` kontrollerinden geçti. Önceki 47 görsel taslağı ve 24 Kasım'daki 7 adayla tam soru tekrarı bulunmadı.

## 3. Fotoğraf kaynak adayları

Altı Commons dosyasının kaynak sayfası, görünen lisans, boyut/konum bilgileri ve özgün dosya bağlantıları incelendi; özgün dosya bağlantıları tarayıcıda açıldı. Bunlar mobil cihazda test edilmiş değildir ve oynanabilir sayılmaz.

| Konum / dosya | Boyut | Lisans | Atıf / konum |
|---|---|---|---|
| Fes — Old Medina of Fez.jpg | 4000×2252 | CC BY-SA 4.0 | MlyHassan; Commons kamera koordinatı mevcut |
| Quito — Historic Center of Quito, Ecuador.jpg | 1944×2592 | CC BY-SA 4.0 | David Adam Kess; şehir doğrulandı, kamera koordinatı yok |
| Umman — Falaj Al-Khatmeen | 5184×3456 | CC BY-SA 4.0 | Dr. Thomas Liptak; kamera koordinatı mevcut; bilgi tabelası görüntüde |
| Caral — Mayor Pyramid and circular enclosure | 5097×2792 | CC BY-SA 2.0 | Jon Gudorf Photography; kamera koordinatı mevcut |
| Nauru — Open cut phosphate mine bins | 2688×3257 | Public Domain Mark | University of Newcastle Special Collections; tarihsel bağlam ve hukuki durum tekrar incelenmeli |
| Arnavutluk — The Accursed Mountains 03 | 5538×3798 | CC BY-SA 4.0 | Leonitaagashi; kamera koordinatı mevcut, sınır işaretçisi değil |

CC BY-SA lisansları ticari yeniden kullanıma izin verir; uygun atıf, lisans bağlantısı, değişiklik belirtimi ve ShareAlike koşulları gerekir. Nauru fotoğrafı Public Domain Mark ile işaretli olduğundan bu, her ülke için geçerli bir formal lisans değildir; hukuki inceleme bekler.

- Kaynak sayfaları: [Fes](https://commons.wikimedia.org/wiki/File:Old_Medina_of_Fez.jpg), [Quito](https://commons.wikimedia.org/wiki/File:Historic_Center_of_Quito,_Ecuador.jpg), [Umman](https://commons.wikimedia.org/wiki/File:Oman,_Birkat_Al-Mawz,_Falaj_Al_Khatmeen.jpg), [Caral](https://commons.wikimedia.org/wiki/File:Mayor_Pyramid_and_circular_enclosure._Caral,_Peru.jpg), [Nauru](https://commons.wikimedia.org/wiki/File:Open_cut_phosphate_mine_bins,_Nauru_(9623496899).jpg), [Arnavutluk](https://commons.wikimedia.org/wiki/File:The_Accursed_Mountains_03.jpg).
- Özgün dosya bağlantıları tarayıcıda açıldı; HTTP/API ve iOS/Android cihaz görüntüleme testi yapılmadı.
- Yeni oynanabilir görsel: 0. Yeni 360 panorama: 0.

## 4. Önceki görsel hata kayıtları

Street yayın durumunda üç başarısız yayın kaydı mevcut:
- Gullfoss
- Kopenhag
- Erivan

Drone Gallery yayın durumunda 11 HTTP 429 kaydı ve album-024 için lisans değişikliği nedeniyle yeniden inceleme uyarısı var. 28 albüm onay işaretli, 87 fotoğraf dosyası bulunmasına rağmen canlı galeri `activated:false`, `readyTotalAlbums:0`, `readyTotalPhotos:0`. Kaynak incelemesi 21 kayıt (20 stored); görsel spot-check 16 albüm/51 fotoğraf. Kaynak kimliği ve lisansın tamamı hâlâ yeniden inceleme gerektiriyor. Album-011 görselinde metin overlay kalite uyarısı var.

Bu turda 429 veya lisans hatalarını atlatmak için güvenli olmayan yayın/URL değişikliği yapılmadı.

## 5. Test ve build durumu

GitHub'dan dosya okumaları başarılı. Yerel clone denemesi `Could not resolve host: github.com` ile başarısız oldu.

Çalıştırılamayan proje testleri:
- `node --test tests/geo-content.test.mjs tests/drone-live.test.mjs tests/drone/hints.test.mjs tests/street/country-mode.test.mjs`
- `node scripts/audit-playable-content.mjs --strict`
- `npm run typecheck`
- `npx vite build`
- `node scripts/panoramas/audit-archive.mjs --live --strict`
- iOS/Android cihazda görüntü açılma testi

`globriva-content-ci.yml` yalnızca manual `workflow_dispatch` ile çalışıyor ve dosyada hosted runner atanmadığı belirtilmiş. GitHub bağlantısında workflow-dispatch başlatma aracı yok. HEAD için check-runs 0; Vercel deployment status success, bu Node/TypeScript testlerinin geçtiği anlamına gelmez.

## 6. Değişiklik

- Sadece review-only aday paketi eklendi.
- Uygulama loader, oyun kodu, görsel yayın manifestleri ve testler değiştirilmedi.
- Yeni oynanabilir soru: 0.
- Yeni doğrulanmış oynanabilir görsel: 0.
- Paket self-validation: başarılı.
- Proje testleri: çalıştırılamadı; DNS/runner engeli.

