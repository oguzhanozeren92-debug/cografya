# Globriva günlük içerik denetimi — 26 Kasım 2026

İncelenen depo: `oguzhanozeren92-debug/cografya`  
Dal: `main`  
Başlangıç HEAD: `9eeeb325710ae1830feb7fd3d286a085fb4756a0`  
Yeni review-only paket commit'i: `76cc7f5fc08824c5e70981b97d35a8b2c68f3e76`

## 1. Loader-linked envanter (son doğrulanmış snapshot: 25 Kasım; bugün yeniden çalıştırılamadı)

| Havuz | Başlangıç | Bitiş | Zorluk / durum |
|---|---:|---:|---|
| Ülke kayıtları | 167 | 167 | 52 kolay / 62 orta / 53 zor |
| Başkent varyantları | 167 | 167 | ülke zorluğuna bağlı |
| Bayrak varyantları | 167 | 167 | 168 flag-code kayıt, loader eşleşmesi 167 |
| Ülke ipuçları | 99 | 99 | 31 kolay / 33 orta / 35 zor |
| Doğa hedefleri | 66 | 66 | 22 / 22 / 22 |
| Ada hedefleri | 22 | 22 | 6 / 7 / 9 |
| Sınır hedefleri | 43 | 43 | geometri tabanlı oynanabilir sayısı bugün yeniden hesaplanmadı |
| Street manifest ready | 39 | 39 | 19 loader-eligible oynanabilir konum |
| Street fallback yüzleri | 76 | 76 | yerel fallback |
| Drone 360 pilot | 5 | 5 | 20 fallback yüz |
| Drone Gallery katalog | 32 albüm / 99 foto | 32 / 99 | 28 approved işareti / 87 yerel foto |
| Drone Gallery editoryal inceleme | 12 albüm | 12 albüm | 22 albüm bekliyor; canlı yayın 0 |
| Yeni soru adayı | 0 | 9 | review-only |
| Yeni oynanabilir soru | 0 | 0 | loader'a bağlanmadı |
| Yeni fotoğraf adayı | 0 | 8 | review-only |
| Yeni doğrulanmış oynanabilir fotoğraf | 0 | 0 | mobil test yapılmadı |

Bu sayılar 25 Kasım loader denetiminden alınan son snapshot'tır; bugün test/loader çalıştırması yapılamadığı için başlangıç ve bitiş aynı snapshot olarak raporlandı. Ayrı mod havuzlarını toplam soru sayısı diye birleştirmedim.

## 2. Günlük fotoğraf arşivi

Son arşiv kaydı 25 Kasım 2026 tarihli:

- 9 bölge taranmış.
- 731 toplam aday görülmüş; 731 inceleme bekliyor.
- 20 yeni benzersiz fotoğraf adayı, Prag çevresindeki tek konum kümesinde.
- Yeni 360 aday: 0; yeni yükleme: 0; aktivasyon: 0.

20 Prag adayını 20 farklı oynanabilir konum olarak saymadım; konum tekrarları/yoğunluğu editoryal inceleme bekliyor.

## 3. Yeni review-only soru paketi

`data/open-content/question-rounds/2026-11-26.json` dosyasına 9 aday eklendi:

- Doğa: Giant's Causeway bazalt sütunlarının volkanik oluşumu.
- Doğa: Ohrid Gölü'nün tektonik kökeni.
- Kültür: Djenné Büyük Camii'nin yıllık çamur sıva yenileme geleneği.
- Şehir: Tbilisi adının 'tbili / sıcak' kökeni.
- Ada: Madagaskar'da doğal olarak bulunan indri lemuru.
- Medeniyet: Angkor'daki Jayatataka Baray'ın yapay rezervuar işlevi.
- Bayrak: Bhutan bayrağındaki Druk ejderhası.
- Sınır: Cebelitarık Boğazı'nın Atlantik–Akdeniz bağlantısı.
- Sokak: Dubrovnik ana caddesi Stradun / Placa.

Her soru Türkçe ve İngilizce, dört farklı seçenek, cevap indeksi, kısa öğretici açıklama ve HTTPS kaynak bağlantısı içeriyor. ID/prompt tekrar kontrolü; 47 mevcut draft ve 24–25 Kasım paketleriyle karşılaştırma başarılı. Her soru `playable:false` olarak tutuldu; oyun loader'ına bağlanmadı.

## 4. Fotoğraf kaynak adayları

8 Commons kaynak sayfası ve özgün dosya bağlantısı tarayıcıda açıldı. Lisans, atıf ve konum bilgisi ayrı alanlarda kaydedildi. Bu, iOS/Android cihaz testi veya R2/CDN doğrulaması değildir.

| Konum | Lisans | Konum / kalite notu |
|---|---|---|
| Giant's Causeway | CC0 1.0 | kamera koordinatı var; 3200×2400 |
| Djenné | CC BY-SA 2.0 | kamera ve konu koordinatı arasında yaklaşık 164 m fark; 3321×2213 |
| Tbilisi | Public domain dedication | kesin kamera koordinatı yok; 3264×2448 |
| Madagaskar / indri | CC BY-SA 2.0 | kesin fotoğraf koordinatı yok; 4066×4066 |
| Angkor / Jayatataka Baray | CC BY-SA 4.0 | kamera koordinatı var; 5312×2988 |
| Ohrid | CC BY-SA 4.0 | kesin kamera koordinatı yok; 6000×4000 |
| Dubrovnik / Stradun | CC BY-SA 3.0 | kesin kamera koordinatı yok; 2816×2112 |
| Cebelitarık | PD WorldWind | 992×653; uydu görüntüsü, sokak panoraması değil |

CC BY-SA kaynaklar ticari kullanım için uygundur ancak atıf, lisans bağlantısı, değişiklik bildirimi ve ShareAlike koşulları gerektirir. CC0/Public Domain adaylarında formal atıf şartı olmayabilir; kaynak kredisi önerilir. Djenné'nin koordinat uyuşmazlığı, Tbilisi/indri/Ohrid/Dubrovnik koordinat eksikleri ve Gibraltar görüntüsünün küçük uydu formatı nedeniyle hiçbir aday oynanabilir sayılmadı.

## 5. Mevcut görsel hata kayıtları

Son yayın-status dosyalarında:

- Street yayın hatası: Gullfoss, Kopenhag ve Erivan (3).
- Drone Gallery HTTP 429: 10 kayıt.
- Album-024: lisans değişikliği nedeniyle tekrar inceleme.
- Album-028: özgün dosya yayınlayıcı için fazla büyük.
- Drone Gallery hazır/aktif: 0 albüm, 0 fotoğraf.

Bu hatalar için yayın manifesti veya URL'yi atlatan bir değişiklik yapılmadı.

## 6. Test ve build durumu

- Yeni paketin JSON/şema, ID/prompt tekrarı, dört seçenek, cevap indeksi, HTTPS kaynak, bilingual alanlar ve `playable:false` kontrolleri: **başarılı**.
- Paket GitHub'a yazıldı ve readback ile tekrar okundu: **başarılı**.
- Yerel clone: `Could not resolve host: github.com`.
- Node oyun testleri, strict loader audit, TypeScript, Vite build, live Commons audit ve iOS/Android cihaz testi: **çalıştırılamadı**.
- `globriva-content-ci.yml` manual `workflow_dispatch` ile çalışıyor; bu bağlantıda workflow başlatma aracı yok. HEAD check-run bulunmadı. Vercel success, proje testlerinin geçtiği anlamına gelmez.

## 7. Değişiklik ve commit

- Sadece review-only soru/fotoğraf aday paketi eklendi.
- Loader, uygulama kodu, yayın manifestleri, R2 ve test dosyaları değiştirilmedi.
- Yeni oynanabilir soru: 0.
- Yeni doğrulanmış oynanabilir fotoğraf: 0.
- Paket self-validation ve readback: başarılı.
- Proje testleri: DNS/runner/dispatch engeli nedeniyle çalıştırılamadı.

Soru ve fotoğraf aday paketi commit'i: `76cc7f5fc08824c5e70981b97d35a8b2c68f3e76`.
