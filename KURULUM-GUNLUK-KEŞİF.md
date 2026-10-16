# Günlük 10 Soru ve Keşif Atlası

- Açılış menüsünde **Günlük 10 Soru** ve **Keşif Haritam** kartları.
- Aynı UTC gününde bütün cihazlar deterministik olarak aynı 10 soruyu alır. İlk 4 kolay, sonraki 4 orta, son 2 zor; 7 bayrak / 3 başkent sorusu.
- Cevap anında kayıt; sayfa kapanırsa ertesi soru için kaldığı yerden devam eder. Aynı gün ikinci kez sıfırdan oynama yok.
- Seri sayaçları UTC gününe göre tutulur, 1+ gün ara verildiyse yeniden başlar.
- Doğru yanıtlanan ülke, hangi modda olursa olsun, hemen keşfedilir. Keşif listesi localStorage'da kalır; haritadaki gerçek ülke sınırları renklendirilir.
- 10, 50 ve tam katalog hedefleri; ülke bayrağı/başkent kartı.
- Coğrafya Supabase bağlantısı ve `supabase/geo_daily_discovery.sql` kurulduğunda, keşifler kendi anonim player_id oturumuyla isteğe bağlı olarak senkronize edilir; günlük bitirme sonucu da sunucuya gönderilir.
- **Önemli:** Coğrafya Supabase projesi bu çalışma oturumunda bağlı olmadığı için SQL canlıda yürütülemedi. Bu nedenle şu anda keşif ve günlük görev aynı tarayıcı/cihazda çalışır; bulut kaydı canlı ortamda ayrıca doğrulanmalıdır.
- Kullanıcıların sistem saatlerini değiştirmesi veya tarayıcı verilerini silmesi engellenemez; sunucuda doğrulama olmadan günlük ödülü rekabet/ödeme temeli yapmayın.
- Harita topojson verisi `world-atlas/countries-110m.json` (kurulu bağımlılık), bayraklar flagcdn.com, fotoğraf NASA katalog bağlantısı üzerinden yükleniyor. İnternet yokken görseller yüklenmeyebilir ama emoji/fonksiyonel geri dönüşler mevcut.