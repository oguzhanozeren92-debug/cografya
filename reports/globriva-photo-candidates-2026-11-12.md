# Globriva: yeni fotoğraf albümü adayları (12 Kasım 2026, gece taraması)

12 yeni albüm (album-023 – album-034), 12 yeni ülke, 36 Commons fotoğrafı `panoramas/drone-gallery-candidates.json` dosyasına **aday** olarak eklendi. Bunlar galeride daha önce olmayan ülkeler.

| Albüm | Şehir | Ülke | Zorluk |
|---|---|---|---|
| album-023 | Marakeş | Fas | orta |
| album-024 | Buenos Aires | Arjantin | orta |
| album-025 | Hanoi | Vietnam | orta |
| album-026 | Seul | Güney Kore | orta |
| album-027 | Petra | Ürdün | orta |
| album-028 | Reykjavík | İzlanda | zor |
| album-029 | Havana | Küba | orta |
| album-030 | Bangkok | Tayland | orta |
| album-031 | Cusco | Peru | orta |
| album-032 | Stockholm | İsveç | orta |
| album-033 | Singapur | Singapur | orta |
| album-034 | Auckland | Yeni Zelanda | zor |

## Nasıl doğrulandı / doğrulanmadı
- Yazar ve lisans, web aramasında dönen Commons dosya sayfası metninden okundu. Bu oturumda Commons API'ye ve sayfalara doğrudan erişilemedi.
- **Hiçbir fotoğrafa bakılmadı.** Görsel kalite, doğru yer, filigran, yüzler gibi kontroller yapılmadı. Bütün `reviewed*` işaretleri `false`.
- Fotoğrafların yaklaşık yarısında boyut görüldü (hepsi ≥1100×650). Diğerlerinde not olarak "Boyut doğrulanmadı" yazıyor; `publish_drone_gallery.py` bunu zaten kontrol ediyor.
- Lisans dağılımı: CC BY-SA 4.0 (çoğunluk), CC BY 4.0 (3), CC BY-SA 3.0 (1), CC0 (1), kamu malı (1). Hepsi yayın betiğinin kabul ettiği lisanslar.

## Dikkat edilmesi gerekenler (`editorNote` alanlarında da var)
1. **Reykjavík, 3. fotoğraf:** Harpa konser salonu (2011) görünüyor. İzlanda'da panorama özgürlüğü kısıtlı. Harpa öne çıkıyorsa fotoğrafı çıkar.
2. **Seul, gece silüeti:** Kore'de modern binalar için panorama özgürlüğü ticari kullanıma kapalı. Uygulamada reklam olduğu için kullanım ticari sayılır. Bina öne çıkmayan genel silüet olarak değerlendir.
3. **Bangkok:** 3 fotoğrafın üçü de Wat Arun. Birini Büyük Saray ile değiştirmek çeşitliliği artırır.
4. **Petra:** Hazine iki kez var. Yedek olarak Diego Delso'nun Manastır fotoğrafı not edildi.
5. **Auckland:** Fotoğraflardan biri PNG. Biri de "Public domain" ve lisans bağlantısı olarak PD Mark verildi. Yayın betiği bunları kabul etmezse yedek gerekir.
6. **Buenos Aires, Caminito:** Lisans, sayfadaki şablon adından (`LarsCurfsCCSA3.0`) çıkarıldı. Sayfada kontrol et.
7. **Singapur, Bijay Chaurasia:** Yazar özel bir atıf metni istiyor (notta yazıyor).

## Sonraki adım
Her albümde fotoğraflara bak. Uygunsa `reviewedVisual`, `reviewedLicense`, `reviewedPlace`, sonra albümde `reviewedLocation` ve `reviewedQuality` alanlarını `true` yap. Sonra GitHub Actions'taki yayın akışına en fazla 10 kimlik ver.
