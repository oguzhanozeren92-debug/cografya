# Coğrafya Oyunu

Vite, React ve TypeScript ile geliştirilen dünya ülkeleri tahmin oyunu.

## Kurulum

```bash
npm install
cp .env.example .env
npm run dev
```

`.env` içinde `VITE_SUPABASE_URL` ve yalnızca **anon / publishable** anahtarı tanımlanmalıdır. Şifreli `service_role` / `sb_secret_...` anahtarları istemciye ve GitHub'a yazılmamalıdır. Vite'taki `VITE_` değişkenlerinin tarayıcıya iletildiğini unutmayın.

Ortak skor tablosu için `KURULUM-ORTAK-SKOR.md` ve `supabase/geo_leaderboard.sql` talimatlarına bakın.
