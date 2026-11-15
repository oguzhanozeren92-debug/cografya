# Globriva denetimi — 15 Kasım 2026

## Kaynak ve yayın ayrımı
- Doğrudan GitHub üzerinden `package.json`, `tests/geo-content.test.mjs`, `src/data/geoDiscoveryModes.ts`, `server/street/country-mode.mjs` ve 14 Kasım raporu okundu.
- Önceki envanter: 729 sabit soru (504 ülke/başkent/bayrak, 99 ülke ipucu, 66 doğa, 60 medeniyet). Bu turda tam oyun yükleyicisi çalıştırılamadığı için 729 canlı oynanabilir soru sayısı olarak **doğrulanmadı**.
- Önceki envanter: 39 onaylı panorama kaydı, 379 inceleme bekleyen fotoğraf adayı. Bunlar doğrulanmış oynanabilir fotoğraf sayısı değildir.
- `STREET_PLAYABLE_IDS` kaynak listesinde **18** rastgele kimlik; `STREET_PLAYABLE_SOURCE_IDS` listesinde **6** kaynak kimliği görüldü. Bu listelerin birleşimi otomatik olarak 24 oynanabilir fotoğraf demek değildir. Önceki raporda anılan 19 test beklentisiyle uyuşmazlık ayrıca incelenmelidir.
- Test dosyasında hâlâ 63 doğa, 96 ülke ipucu ve eski panorama beklentileri yer alıyor; gerçek veriyle eşleşmeyen test sabitleri değiştirilmedi.
- Yerel git clone `Could not resolve host: github.com` hatası verdi. Bu nedenle Node, typecheck, build, HTTP/CDN, iPhone/Android açılma testleri çalıştırılamadı. Canlı doğrulanmış görsel sayısı başlangıç/bitiş **belirsiz/belirsiz**.
- Yeni görselin ticari lisansı, atıf, kesin koordinat, dosya URL'si ve mobil açılması birlikte doğrulanmadığından **0 yeni görsel yayımlandı**. Kaynak HTTP 429, tek başına oyun içi bozuk bağlantı kanıtı değildir.

## Yeni soru taslakları — yayın dışı
Bunlar kaynak, oyun yükleyicisi ve tam tekrar denetiminden geçmediğinden oynanabilir sayılmaz.

1. **Sınır / zor / çoktan seçmeli:** “Afrika'da tamamen Güney Afrika Cumhuriyeti topraklarıyla çevrili bağımsız ülke hangisidir?” A) Lesotho B) Esvatini C) Botsvana D) Namibya. **Cevap: A.** Öğretici bilgi: Lesotho bir enklav ülkedir; Esvatini'nin Mozambik ile de sınırı vardır.
2. **Ada / orta / konum:** “Hint Okyanusu'ndaki, başkenti Victoria olan ada ülkesi hangisidir?” A) Seyşeller B) Maldivler C) Mauritius D) Komorlar. **Cevap: A.** Öğretici bilgi: Seyşeller, Doğu Afrika açıklarında yer alan bir takımada ülkesidir.
3. **Kültür / zor / kavram:** “Yeni Zelanda'daki Māori halkının geleneksel buluşma alanı ve toplumsal tören merkezi hangi adla bilinir?” A) Marae B) Agora C) Forum D) Stupa. **Cevap: A.** Öğretici bilgi: Marae, Māori topluluklarının toplantı ve törenlerinde önemli bir mekândır.

## Sonuç
Başlangıç/bitiş referans sabit soru tanımı **729/729** (bu tur canlı doğrulanmadı); doğrulanmış oynanabilir görsel **bilinmiyor/bilinmiyor**; yeni aday **3 soru, 0 lisans/URL/mobil onaylı görsel**; yayına alınan **0**; çalıştırılabilen yerel test **0**. Oyun dosyaları ve manifest değiştirilmedi. Bu commit yalnızca denetim raporudur.
