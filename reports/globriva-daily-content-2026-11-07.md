# Globriva içerik denetimi — 2026-11-07

## Kaynak ve sayım
Doğrudan GitHub varsayılan dalındaki `src/data/geoDiscoveryModes.ts`, `src/data/countries.ts`, `tests/geo-content.test.mjs` ve ilgili tarih/sokak veri dosyaları okundu.

- Ülke veri kaydı: 168 (ülke, başkent ve bayrak modlarında 504 potansiyel sabit soru tanımı).
- Ülke ipucu: önceki envanterde 96; bu turda ayrı çalışma zamanı doğrulaması yapılmadı.
- Doğa: 66 kayıt; 22 kolay / 22 orta / 22 zor. Kimlikler 66 benzersiz; gerçek coğrafi konumlar 64 benzersiz.
- Medeniyet: önceki envanterde 20 vaka × 3 soru = 60; çalışma zamanı doğrulaması yapılmadı.
- Ada hedefi: 22 tanım; sınır odak ülkesi: 43. Bunlar dinamik üretim nedeniyle sabit soru toplamına katılmaz.
- Sabit soru için önceki 726 sayısı yalnızca kaynak envanterine dayalıdır; bu turda canlı oyun yükleyicisi bütünüyle çalıştırılamadı.
- Oynanabilir görsel için önceki 183 sayısı canlı CDN ve mobil testi yapılmadığı için bu turda yeniden doğrulanmış sayı değildir.

## Doğrulanan tekrarlar
- `okavango` ve `okavango-delta`: Okavango Deltası, UNESCO 1432.
- `namib` ve `namib-sand-sea`: Namib Kum Denizi, UNESCO 1430.

## Test engeli
`tests/geo-content.test.mjs` ilk testte 63 doğa kaydı, 57 benzersiz kimlik ve seviye başına 21 bekliyor. Kaynakta 66/66/22 olduğundan bu beklentiler güncel değil. Ancak sadece beklentiyi 66'ya çıkarmak coğrafi tekrarları gizleyeceğinden kod değiştirilmedi. Yerel git clone DNS hatası nedeniyle Node/TypeScript/üretim derlemesi çalıştırılamadı.

## Görsel yayın kararı
Yeni lisans, konum, orijinal dosya URL'si, mobil/CDN görüntüleme ve atıf zinciri eksiksiz doğrulanmış görsel yok. Yeni oynanabilir görsel eklenmedi. Yeni aday ve canlı erişim testleri: 0.

## Güvenli sonraki işlem
İki yinelenen doğa konumunu farklı UNESCO kaynaklı, koordinat ve öğretici bilgi notları doğrulanmış noktalarla değiştir; aynı yer için farklı ID/name ile tekrar oluşturmayı engelleyen normalize edilmiş isim + konum denetimi ekle. Ardından test, typecheck, build ve canlı görsel taramasını çalıştır.
