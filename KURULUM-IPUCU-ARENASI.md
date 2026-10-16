# Atlas Arena — İpuçlarından Ülkeyi Bul
Yeni oyun modu: `clues` • soru tipi: `clue`.

- 63 kontrol edilmiş ülke kartında 3 aşamalı coğrafya/kültür ipucu ve cevap sonrası bir bilgi kartı vardır.
- 1–5 kolay, 6–12 orta, 13+ zor havuz. Her turda 4 seçenek.
- 1. ipucu ücretsiz. 2. ipucu puanı %75'e, 3. ipucu %50'ye indirir.
- Hedef ülke soru çözülmeden dünya üzerinde veya bayrak olarak gösterilmez.
- Doğru cevaplar Keşif Haritası'nı günceller. 3 can ve gerçek reklamdan +1 can akışı aynen korunur.
- Karışık, Bayrak ve İpucu modlarının haftalık ligleri ayrıdır.
- Supabase bağlantısı yoksa mod internet ve giriş olmadan Vercel üzerinde oynanabilir; **çevrim içi haftalık lig kayıtları canlı değildir.**
- `supabase/geo_weekly_leaderboard.sql` yalnızca **Coğrafya'nın kendi Supabase projesinde** uygulanmalıdır. Önceki iki lig puanlarını silmez; üçüncü lig kısıtını ekler.
- Yeni soru eklemeden önce ülkelerin doğruluğu, aşırı kolay spoiler ve tekrarlar kontrol edilmelidir.

Vercel önizleme: https://atlas-arena-tau.vercel.app
