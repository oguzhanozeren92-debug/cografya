# Globriva — 3 Kasım 2026 günlük içerik ve görsel raporu

## Gerçek oyun yükleyicisine bağlı envanter

| İçerik | Başlangıç | GitHub bitiş |
|---|---:|---:|
| Ülke haritası | 168 | 168 |
| Başkent | 168 | 168 |
| Bayrak | 168 | 168 |
| Ülke ipucu | 93 | 96 (kolay/orta/zor: 30/31/35) |
| Doğa Dedektifi | 57 | 63 (21/21/21) |
| Medeniyet Dedektifi | 60 | 60 (20 konum × 3 soru) |
| **Toplam sabit soru tanımı** | **714** | **723** |
| Ada Avcısı, haritada oynanabilir | 21 | 21 |
| Sınır Dedektifi odak | 43 | 43 |
| Sokak Dedektifi | 19 panorama | 19 panorama |
| Drone 360° | 5 panorama | 5 panorama |
| Drone galeri | 16 albüm / 51 fotoğraf | aynı |
| Medeniyet panoramaları | 20 (11 Sokak ile ortak) | aynı |
| **Benzersiz oynanabilir yerel görsel dosyası** | **183** | **183** |
| Yeni doğrulanmış oynanabilir görsel | 0 | 0 |

Sabit soruların 504'ü ülke/başkent/bayrak, 96'sı ülke ipucu, 63'ü doğa, 60'ı medeniyet sorusudur. Ada ve sınır oyunları geometri üzerinden dinamik soru oluşturur. 183 sayısı oyun yükleyicisine bağlı yerel dosyaların önceki envanteridir; bu turda 183 dosyanın canlı HTTP veya fiziksel mobil erişimi yeniden doğrulanamadı.

## Yeni oynanabilir içerik — +9 sabit soru

- Ülke ipucu: Belçika (Brugge, kolay), Özbekistan (Semerkant, orta), Eritre (Asmara, zor). Her kartta üç aşamalı ipucu, cevap sonrası öğretici bilgi ve UNESCO kaynak bağlantısı bulunur. İpuçları yedi ek dilde bölge/şehir/kültür sinyaliyle yerelleştirildi.
- Doğa: Yellowstone ve Galápagos (kolay); Sundarbans ve Durmitor (orta); Aïr-Ténéré ve Te Wāhipounamu (zor). Her konumda Türkçe/İngilizce soru, kısa iki dilli bilgi, kaynak ve yaklaşık harita koordinatı bulunur.
- Doğa modunun karşılaştırılabilir seçenek aileleri yeni altı konumu kapsayacak şekilde genişletildi. Aynı adın soruda cevap olarak sızması, ID tekrarı ve geçersiz koordinat statik olarak tarandı.

## Görsel araştırması — beş ülke / beş Commons adayı

Ayrıntılı dosya, atıf, kamera GPS ve lisans kayıtları: `panoramas/weekly-research/2026-11-03.json`.

| Ülke | Konum | Fotoğrafçı | Lisans | Kaynak |
|---|---|---|---|---|
| Belçika | Brugge / IJsputbrug | Marc Ryckaert | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Brugge_IJsputbrug_R02.jpg |
| Özbekistan | Semerkant / Registan | Aleksandr Zykov | CC BY-SA 2.0 | https://commons.wikimedia.org/wiki/File:Registan,_Samarkand_(8590106304).jpg |
| Eritre | Asmara | Clay Gilliland | CC BY-SA 2.0 | https://commons.wikimedia.org/wiki/File:Asmara,_Eritrea_(30777573995).jpg |
| Yeni Zelanda | Fiordland | Krzysztof Golik | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Landscape_of_Fiordland_National_Park_01.jpg |
| Ekvador | Galápagos | Maciej | CC BY-SA 2.0 | https://commons.wikimedia.org/wiki/File:Galapagos,_Ecuador.jpg |

Beşinde kaynak sayfası, fotoğrafçı, ticari kullanıma uygun dosya lisansı, GPS ve normal fotoğraf projeksiyonu doğrulandı. Önceki altı günlük araştırma dosyasıyla dosya adı çakışması bulunmadı. **Bunlar 360° panorama değildir.** Orijinal dosya/thumbnail HTTP erişimi, görüntünün bizzat görsel incelemesi, mobil görüntüleme ve CDN entegrasyonu henüz doğrulanmadı. **Yeni yayımlanan: 0; kuyruğa alınan: 0; oynanabilir sayılan: 0.** Onaylı galeriye kontrolsüz ekleme yapılmadı.

## Testler, canlı yayın ve engeller

- Kaynak doğrulama: 96 benzersiz ülke ipucu, 63 benzersiz doğa noktası, doğa zorlukları 21/21/21, 7 dilde yeni yerel özellik karşılıkları, 6 bilgi notu, 6 karşılaştırılabilir seçenek ailesi eşleşmesi, koordinatlar ve doğa cevap sızıntısı **geçti**.
- `tests/geo-content.test.mjs` ve `tests/geo-option-quality.test.mjs` güncellendi. Tam Node testleri, TypeScript denetimi ve üretim derlemesi **bu turda çalıştırılamadı**. GitHub Actions `Atlas Arena Admin Panel CI` işleri hiçbir adım çalışmadan `failure` oldu (iş kayıtları boş, runner/kota engeli olası). İçerik QA workflow'u yalnız `workflow_dispatch` ile tetikleniyor.
- Canlı statik görüntüler yeniden taranamadı: canlı Vercel alan adına dışarıdan yapılan denemeler erişim hatası döndürdü; bu durum tek başına kırık bağlantı kanıtı değildir. Önceki 2 Kasım denetimi 223/223 HTTP 200 bildirmişti.
- Vercel üretim alias'ında en son doğrulanmış `READY` dağıtımı `b049c7d35ec9621d3b0f6c90876e8b69094c0cb1` commit'indeydi; bu **tam güncel içerik değildir**. Son GitHub sürümünün üretime dağıtılması denendi; Vercel HTTP 402 `api-deployments-free-per-day` (günlük 100 dağıtım sınırı) verdi. Sonraki uygun dağıtımda güncel ana dalın tamamı tek seferde yayınlanmalı.
- Bu nedenle **723 soru GitHub ana dalında**, ancak canlı uygulamada 723 sorunun bulunduğu henüz doğrulanmış değil.

## Kaynaklar

- https://whc.unesco.org/en/list/996/
- https://whc.unesco.org/en/list/603/
- https://whc.unesco.org/en/list/1550/
- https://whc.unesco.org/en/list/28/
- https://whc.unesco.org/en/list/1/
- https://whc.unesco.org/en/list/798/
- https://whc.unesco.org/en/list/100/
- https://whc.unesco.org/en/list/573/
- https://whc.unesco.org/en/list/551/

## GitHub kayıtları

Bu turun son içerik ve fotoğraf araştırması commit'i: `dc66d96d4aa42914b8705d7610af9c034dfb6036`. Rapor ayrıca commit edildi; canlı dağıtım ve tam CI henüz onaylanmadı.
