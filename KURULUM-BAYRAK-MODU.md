# Bayrak Arenası ve İki Ayrı Haftalık Lig

- **Karışık**: ülkeler, başkentler ve 6. sorudan itibaren bayraklar; puanlar `mixed` ligine yazılır.
- **Bayrak**: 168 ülke bayrağını 4 seçenekle tahmin et; puanlar `flags` ligine yazılır.
- **Zorluk**: 1–5 kolay, 6–12 orta, 13 ve sonrası zor. Doğru seçenek ve üç yanıltıcı seçenek aynı zorluk seviyesinden belirlenir.
- Haftalık sıralamalarda `Karışık` / `Bayrak` ve `Bu Hafta` / `Geçen Hafta` sekmeleri vardır. Puanlar ayrı tutulur.
- Eski `geo_weekly_leaderboard` kayıtları `mixed` liginde korunur.
- Bayrak görselleri FlagCDN üzerinden ISO alpha-2 kodlarıyla gösterilir; yüklenemezse bayrak emojisi kullanılır. Görsel erişimi için internet gereklidir.

## Supabase kurulumu

Coğrafya Supabase projesindeki SQL Editor'da önce `supabase/geo_leaderboard.sql` (ilk kurulumsa), sonra **güncel** `supabase/geo_weekly_leaderboard.sql` çalıştırın. İkinci dosya var olan tek ligli veritabanını veri silmeden iki ligli yapıya yükseltir. Oturum açmadan tek takma ad için Anonymous Sign-Ins açık olmalıdır.

> TarlaPusula Supabase projesinde çalıştırmayın. GitHub'a gizli API anahtarı eklemeyin. Web istemcisinde yalnızca publishable/anon anahtarı kullanın.

## Test

1. Yeni oyun aç, Karışık'ı seç ve 6. sorudan sonra bayrak sorularını gör.
2. Bayraklar'ı seç, sadece bayraklarla ilerle; 6. ve 13. sorulardaki zorluğu kontrol et.
3. Oyun bitir; haftalık ekranda Karışık ve Bayrak skorlarının birbirine karışmadığını doğrula.
4. Pazartesi UTC 00:00 sonrasında her iki ligde yeni haftanın açıldığını kontrol et.
