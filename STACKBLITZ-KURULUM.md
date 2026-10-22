# Globriva - StackBlitz Başlangıç
Kaynak: oguzhanozeren92-debug/cografya (main)
GitHub commit: ce79373f0f66ee1acaa9c9e2a9b2bf9d24b80f5d
Hazırlanma: 22 Ekim 2026

Bu arşiv kaynak projenin güncel 332 takipli dosyasını içerir (gizli .env.production hariç).
Dosyalar StackBlitz için ZIP'in doğrudan köküne yerleştirilmiştir.

KURULUM
1. StackBlitz'te projeyi ZIP dosyasından içe aktar.
2. package.json kökte bulunur; gerekirse npm install ardından npm run dev çalıştır.
3. Supabase/oyun çevrim içi özellikleri gerekiyorsa .env.example dosyasına göre .env oluştur.
   VITE_SUPABASE_URL ve VITE_SUPABASE_ANON_KEY alanlarını kendi Supabase bilgilerinizle doldurun.
   Servis rolü anahtarı, JWT signing secrets veya özel API anahtarlarını VITE_ ile başlayan değişkene yazmayın.
4. StackBlitz Vite önizlemesi Vercel üzerinde çalışan /api/ sunucu işlevlerini yerel olarak sağlamaz.
   Bunlar için gerçek Vercel dağıtımına veya uygun bir geliştirme API ortamına ihtiyaç vardır.
5. Native iOS/Android paketlerini web önizlemesi yerine Codemagic/Capacitor ile oluşturabilirsiniz.
   iOS ikon kaynağı resources/icon.png dosyasında yer alır.

Bu ZIP'de node_modules, dist ve yerel gizli anahtarlar yoktur.
Kaynak değişiklikleri yapıldığında bunları GitHub'a kaydetmeniz önerilir.
