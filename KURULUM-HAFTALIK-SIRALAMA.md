# Haftalık Dünya Sıralaması — kurulum

Uygulama kaynak kodu hazır. Haftalık skorların canlı çalışması için yalnızca **Coğrafya'ya ait Supabase projesinin** SQL Editor ekranında `supabase/geo_weekly_leaderboard.sql` dosyasındaki SQL çalıştırılmalıdır.

**Önemli:** TarlaPusula veya GıdaLab veritabanında çalıştırmayın. Bu depoya Supabase'in service_role/secret anahtarını asla yüklemeyin. Tarayıcı tarafı yalnızca `VITE_SUPABASE_URL` ve `VITE_SUPABASE_ANON_KEY` (publishable / anon) kullanır. Anonim oturum açma (Auth > Providers > Anonymous Sign-ins) etkin olmalıdır.

## Özellikler

- Pazartesi 00.00 UTC'de yeni yarış haftası açılır. Önceki haftaların skorları silinmez.
- Hafta boyunca bir oyuncunun oyun puanları birikir.
- Podyum ilk 3 oyuncuyu, liste ilk 100 oyuncuyu gösterir.
- Oyuncu ilk 100 dışında olsa da kendi skorunu ve sırasını görür.
- Geçen haftanın sıralamasına erişilir.
- Kullanıcıların mevcut şifresiz Supabase anonim hesapları korunur.

## Kontrol

1. SQL çalıştırıldıktan sonra oyunu aç ve haftalık sıralamaya gir.
2. Bir oyunu bitir; genel rekor ve haftalık toplamın ayrı ayrı güncellendiğini doğrula.
3. Haftalık menüden kendi sıralamanı ve geçen hafta sekmesini aç.

Güvenlik notu: İstemciden gelen skorlar sunucuda temel değer aralıkları için kontrol edilir; hileyi önleyici oyun-oturumu doğrulaması henüz yoktur. Fotoğraf: NASA, Blue Marble / PIA18033 (`images-assets.nasa.gov`).
