# Globriva — Coğrafya Oyunu

Vite, React ve TypeScript ile geliştirilen dünya ülkeleri tahmin oyunu.

## Kurulum

```bash
npm install
cp .env.example .env
npm run dev
```

`.env` içinde `VITE_SUPABASE_URL` ve yalnızca **anon / publishable** anahtarı tanımlanmalıdır. Şifreli `service_role` / `sb_secret_...` anahtarları istemciye ve GitHub'a yazılmamalıdır. Vite'taki `VITE_` değişkenlerinin tarayıcıya iletildiğini unutmayın.

Ortak skor tablosu için `KURULUM-ORTAK-SKOR.md` ve `supabase/geo_leaderboard.sql` talimatlarına bakın.

## Ödüllü AdMob (+1 can)

Native iOS/Android kurulum ve AdMob App/Rewarded ID adımları için
[`KURULUM-ADMOB-NATIVE.md`](KURULUM-ADMOB-NATIVE.md) dosyasına bakın.
Mobil olmayan web önizlemesinde gerçek AdMob videosu gösterilmez.

Globriva iOS AdMob App ID ve ödüllü (+1 can) birimi `.env.production` içinde yapılandırılmıştır.
Android reklam birimleri henüz eklenmedi; gerçek yayın için AdMob incelemesi ve iPhone cihaz testi gerekir.
