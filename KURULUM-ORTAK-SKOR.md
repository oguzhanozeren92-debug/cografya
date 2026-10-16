# Coğrafya Oyunu — Şifresiz giriş ve ortak skor

- İlk kullanım: takma ad, Supabase anonim oturum; sonraki ziyaret aynı tarayıcı/cihazda otomatik tanınır.
- Oyun sonu: skor otomatik kaydedilir. Aynı kullanıcı için yalnızca en yüksek puan kalır.
- Ana ekran: ortak en iyi oyuncular. Skor aktarımı başarısızsa hata gösterilir.
- Oyun soruları, puan katsayıları, can sistemi ve globe bileşeni değiştirilmemiştir.

## Canlıya alma

1. Coğrafya oyununa ayrılmış bir Supabase projesi seçin. `.env` dosyasındaki `VITE_SUPABASE_URL` ve `VITE_SUPABASE_ANON_KEY` bu projeye ait olmalıdır. Yalnızca **publishable/anon** anahtar kullanılmalıdır; service_role kullanılmaz.
2. Supabase > Authentication > Providers > Anonymous Sign-Ins seçeneğini etkinleştirin.
3. Projenin SQL Editor bölümünde `supabase/geo_leaderboard.sql` dosyasını çalıştırın.
4. Projeyi yeniden derleyip yayınlayın. Farklı iki tarayıcıdan ayrı oyuncularla oyunu bitirerek sıralamayı doğrulayın.

**Güvenlik notu:** Anonim kimlik, şifre gerektirmez ama kullanıcı tarayıcı verilerini silerse veya yeni cihaz kullanırsa eski anonim hesabına otomatik erişemez. Puan sunucuya gönderilen istemci değeridir; ciddi ödüllü/rekabetçi yarışmalarda hile önleme için sunucuda oyun turu doğrulaması eklenmelidir. Takma adların benzersiz olması garanti edilmez; her oyuncu anonim oturum kimliği ile ayrılır.

**Mevcut çevre:** Paylaşılan ZIP'in Supabase proje URL'si bağlı yönetim hesabında listelenen projeler arasında yok. Bu nedenle SQL'i doğrudan çalıştıramadık ve gerçek iki kullanıcılı canlı uçtan uca testi yapamadık.
