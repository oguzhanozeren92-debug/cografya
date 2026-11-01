// Reviewed first-run coordinates for the interactive Natural Earth basemap.
// Point coordinates are approximate play markers, not survey-grade measurements.
export type NaturePoint={id:string;name:string;clue:string;clueEn:string;lat:number;lon:number;level:1|2|3;region:string;sourceUrl?:string};
export const NATURE_POINTS:NaturePoint[]=[
  {
    "id": "nile",
    "name": "Nil Deltası",
    "clue": "Kuzey Afrika'da Akdeniz'e dökülen ve antik Mısır tarımına hayat veren büyük nehrin deltası.",
    "lat": 31.1,
    "lon": 31.4,
    "level": 1,
    "region": "Mısır ve Akdeniz",
    "clueEn": "Find the Mediterranean delta of the river that sustained ancient Egyptian agriculture."
  },
  {
    "id": "amazon",
    "name": "Amazon Nehri Ağzı",
    "clue": "Dünyanın en büyük debili nehrinin Atlas Okyanusu'na ulaştığı Güney Amerika kıyısı.",
    "lat": -0.5,
    "lon": -50.4,
    "level": 1,
    "region": "Brezilya",
    "clueEn": "Find where South America's great river, known for its huge discharge, reaches the Atlantic Ocean."
  },
  {
    "id": "victoria",
    "name": "Victoria Gölü",
    "clue": "Doğu Afrika'daki üç ülkenin çevrelediği, Afrika'nın yüzölçümü bakımından en büyük gölü.",
    "lat": -1,
    "lon": 33,
    "level": 1,
    "region": "Uganda, Kenya ve Tanzanya",
    "clueEn": "Locate the largest African lake by surface area, bordered by three East African countries."
  },
  {
    "id": "everest",
    "name": "Everest Dağı",
    "clue": "Himalayalar'da, Nepal ve Çin sınırında yer alan dünyanın en yüksek zirvesi.",
    "lat": 27.99,
    "lon": 86.93,
    "level": 1,
    "region": "Himalayalar",
    "clueEn": "Locate the world's highest summit, on the Nepal–China border in the Himalayas."
  },
  {
    "id": "sahara",
    "name": "Sahra Çölü",
    "clue": "Kuzey Afrika'nın çok büyük bir bölümünü kaplayan sıcak çöl kuşağının orta kesimleri.",
    "lat": 23,
    "lon": 10,
    "level": 1,
    "region": "Kuzey Afrika",
    "clueEn": "Find the central portion of the enormous hot desert spanning North Africa."
  },
  {
    "id": "fuji",
    "name": "Fuji Dağı",
    "clue": "Honşu adasında bulunan ve Japonya'nın simgelerinden biri olan volkanik dağ.",
    "lat": 35.36,
    "lon": 138.73,
    "level": 1,
    "region": "Japonya",
    "clueEn": "Locate the iconic volcano on Japan's island of Honshu."
  },
  {
    "id": "mississippi",
    "name": "Mississippi Deltası",
    "clue": "Kuzey Amerika'nın güneyinde, Meksika Körfezi'ne dökülen büyük nehrin delta bölgesi.",
    "lat": 29.2,
    "lon": -89.2,
    "level": 2,
    "region": "ABD, Louisiana",
    "clueEn": "Find the delta of North America's major river on the Gulf of Mexico."
  },
  {
    "id": "danube",
    "name": "Tuna Deltası",
    "clue": "Karadeniz kıyısında Romanya ve Ukrayna arasında uzanan büyük sulak alan.",
    "lat": 45.2,
    "lon": 29.6,
    "level": 2,
    "region": "Karadeniz",
    "clueEn": "Find the famous wetland delta along the Black Sea coast of Romania and Ukraine."
  },
  {
    "id": "baikal",
    "name": "Baykal Gölü",
    "clue": "Sibirya'da yer alan, dünya üzerindeki en derin tatlı su gölü.",
    "lat": 53.5,
    "lon": 108.2,
    "level": 2,
    "region": "Rusya",
    "clueEn": "Locate the world's deepest freshwater lake in Siberia."
  },
  {
    "id": "titicaca",
    "name": "Titicaca Gölü",
    "clue": "And Dağları'nda Peru ve Bolivya sınırında bulunan yüksek rakımlı göl.",
    "lat": -15.8,
    "lon": -69.3,
    "level": 2,
    "region": "And Dağları",
    "clueEn": "Find the high-altitude Andean lake shared by Peru and Bolivia."
  },
  {
    "id": "kilimanjaro",
    "name": "Kilimanjaro Dağı",
    "clue": "Tanzanya'da yükselen, Afrika'nın en yüksek dağı.",
    "lat": -3.07,
    "lon": 37.35,
    "level": 2,
    "region": "Doğu Afrika",
    "clueEn": "Find Africa's highest mountain in Tanzania."
  },
  {
    "id": "ganges",
    "name": "Ganj-Brahmaputra Deltası",
    "clue": "Bengal Körfezi'ne dökülen büyük Güney Asya nehirlerinin oluşturduğu delta.",
    "lat": 22,
    "lon": 89,
    "level": 2,
    "region": "Bangladeş ve Hindistan",
    "clueEn": "Find the huge South Asian river delta opening into the Bay of Bengal."
  },
  {
    "id": "congo",
    "name": "Kongo Nehri Ağzı",
    "clue": "Ekvator Afrika'sından gelen güçlü nehrin Atlas Okyanusu'na ulaştığı yer.",
    "lat": -6,
    "lon": 12.3,
    "level": 3,
    "region": "Orta Afrika kıyısı",
    "clueEn": "Locate where the powerful central African river meets the Atlantic Ocean."
  },
  {
    "id": "aconcagua",
    "name": "Aconcagua Dağı",
    "clue": "And Dağları'nda bulunan, Asya dışındaki en yüksek zirve.",
    "lat": -32.65,
    "lon": -70.01,
    "level": 3,
    "region": "Arjantin",
    "clueEn": "Find the highest peak outside Asia, in the Andes."
  },
  {
    "id": "malawi",
    "name": "Malavi Gölü",
    "clue": "Büyük Rift Vadisi'ndeki uzun ve dar Afrika göllerinden biri.",
    "lat": -12,
    "lon": 34.7,
    "level": 3,
    "region": "Doğu Afrika",
    "clueEn": "Locate the long, narrow East African lake within the Great Rift Valley."
  },
  {
    "id": "yangtze",
    "name": "Yangtze Nehri Deltası",
    "clue": "Çin'in doğu kıyısında büyük bir ticaret ve yerleşim alanı oluşturan nehir ağzı.",
    "lat": 31.5,
    "lon": 121.9,
    "level": 3,
    "region": "Çin, Doğu Çin Denizi",
    "clueEn": "Find the delta of the major river on China's eastern coast."
  },
  {
    "id": "reef",
    "name": "Büyük Set Resifi",
    "clue": "Avustralya'nın kuzeydoğu kıyıları boyunca uzanan geniş mercan resifi sistemi.",
    "lat": -18,
    "lon": 146.8,
    "level": 3,
    "region": "Mercan Denizi",
    "clueEn": "Locate the vast coral reef system off northeastern Australia."
  },
  {
    "id": "rhine",
    "name": "Ren Nehri Ağzı",
    "clue": "Alp dağlarından kaynaklanıp Kuzey Denizi'ne ulaşan Avrupa nehir sisteminin deltası.",
    "lat": 51.95,
    "lon": 4.1,
    "level": 3,
    "region": "Hollanda, Kuzey Denizi",
    "clueEn": "Locate the river delta reaching the North Sea in the Netherlands."
  },
  {
    "id": "iguazu",
    "name": "İguazú Şelaleleri",
    "clue": "Arjantin ile Brezilya sınırında, yarım daire biçimli çok sayıda çağlayanın oluşturduğu büyük şelale sistemi.",
    "clueEn": "Locate the huge chain of cascades along the Argentina–Brazil border, surrounded by subtropical forest.",
    "lat": -25.6953,
    "lon": -54.4367,
    "level": 1,
    "region": "Arjantin / Brezilya",
    "sourceUrl": "https://whc.unesco.org/en/list/303/"
  },
  {
    "id": "ngorongoro",
    "name": "Ngorongoro Krateri",
    "clue": "Doğu Afrika'da geniş bir volkanik kaldera içinde savan hayvanlarının yaşadığı koruma alanı.",
    "clueEn": "Find the vast volcanic caldera and wildlife conservation landscape in East Africa.",
    "lat": -3.198,
    "lon": 35.489,
    "level": 1,
    "region": "Tanzanya",
    "sourceUrl": "https://whc.unesco.org/en/list/39/"
  },
  {
    "id": "halong",
    "name": "Ha Long Körfezi",
    "clue": "Güneydoğu Asya kıyısında denizden yükselen yüzlerce dik kireç taşı adacığıyla ünlü körfez.",
    "clueEn": "Locate the Southeast Asian bay dotted with steep limestone islands rising from the sea.",
    "lat": 20.91,
    "lon": 107.18,
    "level": 1,
    "region": "Vietnam",
    "sourceUrl": "https://whc.unesco.org/en/list/672/"
  },
  {
    "id": "atitlan",
    "name": "Atitlán Gölü",
    "clue": "Orta Amerika'nın yüksek kesimlerinde, üç volkanın yakınında bulunan büyük kaldera gölü.",
    "clueEn": "Find the Central American highland lake in a volcanic caldera near three prominent volcanoes.",
    "lat": 14.7,
    "lon": -91.2,
    "level": 1,
    "region": "Guatemala",
    "sourceUrl": "https://www.visitcentroamerica.com/en/visit/lake-atitlan-and-sorrounding-towns/"
  },
  {
    "id": "uyuni",
    "name": "Uyuni Tuz Düzlüğü",
    "clue": "And Dağları'nın yüksek platosunda, yağışlı mevsimde ayna gibi görünen devasa beyaz tuz düzlüğü.",
    "clueEn": "Locate the vast white salt flat on the Andean plateau that can become mirror-like after rain.",
    "lat": -20.1338,
    "lon": -67.4891,
    "level": 2,
    "region": "Bolivya",
    "sourceUrl": "https://calval.cr.usgs.gov/apps/uyuni-salt-flats"
  },
  {
    "id": "roraima",
    "name": "Roraima Dağı",
    "clue": "Güney Amerika'nın kuzeyinde, dik yamaçlı ve düz tepeli tepui dağlarının en tanınan örneklerinden biri.",
    "clueEn": "Find the iconic flat-topped tepui mountain with steep cliffs in northern South America.",
    "lat": 5.143,
    "lon": -60.763,
    "level": 2,
    "region": "Venezuela / Brezilya / Guyana",
    "sourceUrl": "https://whc.unesco.org/en/list/701/"
  },
  {
    "id": "okavango",
    "name": "Okavango Deltası",
    "clue": "Güney Afrika'nın iç kesimlerinde denize ulaşmadan çöl kumlarına yayılan büyük mevsimsel sulak alan.",
    "clueEn": "Locate the great seasonal inland wetland whose waters spread into desert sands rather than reaching the sea.",
    "lat": -19.3,
    "lon": 22.9,
    "level": 2,
    "region": "Botsvana",
    "sourceUrl": "https://whc.unesco.org/en/list/1432/"
  },
  {
    "id": "wulingyuan",
    "name": "Wulingyuan Kayalıkları",
    "clue": "Doğu Asya'da sisler arasından yükselen binlerce ince kuvars kumtaşı sütunuyla tanınan dağlık alan.",
    "clueEn": "Find the East Asian landscape of thousands of narrow sandstone pillars rising through mist.",
    "lat": 29.3333,
    "lon": 110.5,
    "level": 2,
    "region": "Çin, Hunan",
    "sourceUrl": "https://whc.unesco.org/en/list/640/"
  },
  {
    "id": "turkana",
    "name": "Turkana Gölü",
    "clue": "Doğu Afrika Rift Vadisi'nde kurak arazilerle çevrili, tuzlu ve çok uzun bir çöl gölü.",
    "clueEn": "Locate the long saline desert lake in the East African Rift, surrounded by arid terrain.",
    "lat": 3.6,
    "lon": 36.1,
    "level": 3,
    "region": "Kenya / Etiyopya",
    "sourceUrl": "https://whc.unesco.org/en/list/801/"
  },
  {
    "id": "socotra",
    "name": "Sokotra Takımadaları",
    "clue": "Aden Körfezi yakınındaki adalarda, şemsiye biçimli sıra dışı ağaçların ve çok sayıda endemik canlının yaşadığı bölge.",
    "clueEn": "Find the islands near the Gulf of Aden known for umbrella-shaped trees and extraordinary endemic wildlife.",
    "lat": 12.47,
    "lon": 53.83,
    "level": 3,
    "region": "Yemen / Hint Okyanusu",
    "sourceUrl": "https://whc.unesco.org/en/list/1263/"
  },
  {
    "id": "tsingy",
    "name": "Tsingy de Bemaraha",
    "clue": "Hint Okyanusu'ndaki büyük bir adanın batısında, bıçak gibi sivri kireç taşı kulelerinden oluşan karst alanı.",
    "clueEn": "Find the sharp limestone pinnacles and karst labyrinth in the west of a large Indian Ocean island.",
    "lat": -18.74,
    "lon": 44.72,
    "level": 3,
    "region": "Madagaskar",
    "sourceUrl": "https://whc.unesco.org/en/list/494/"
  },
  {
    "id": "namib",
    "name": "Namib Kum Denizi",
    "clue": "Güneybatı Afrika'nın Atlas Okyanusu kıyısında, sisle beslenen ve kızıl kum tepeleriyle tanınan çöl.",
    "clueEn": "Locate the Atlantic coastal desert in southwestern Africa, where fog sustains life among towering red dunes.",
    "lat": -24.75,
    "lon": 15.3,
    "level": 3,
    "region": "Namibya",
    "sourceUrl": "https://whc.unesco.org/en/list/1430/"
  },
  {
    "id": "plitvice",
    "name": "Plitvice Gölleri",
    "clue": "Hırvatistan'ın iç kesimlerinde, kireç taşı eşiklerinin oluşturduğu basamaklı göller ve şelaleler dizisini haritada bul.",
    "clueEn": "Find the stepped chain of lakes and waterfalls formed by limestone barriers in inland Croatia.",
    "lat": 44.87,
    "lon": 15.61,
    "level": 1,
    "region": "Hırvatistan",
    "sourceUrl": "https://whc.unesco.org/en/list/98/"
  },
  {
    "id": "komodo",
    "name": "Komodo Millî Parkı",
    "clue": "Endonezya'nın Küçük Sunda Adaları arasında, büyük kertenkeleleri ve kuru savan yamaçlarıyla tanınan volkanik ada parkını bul.",
    "clueEn": "Locate the volcanic island park in Indonesia's Lesser Sunda Islands, known for giant lizards and dry savannah hills.",
    "lat": -8.55,
    "lon": 119.49,
    "level": 1,
    "region": "Endonezya",
    "sourceUrl": "https://whc.unesco.org/en/list/609/"
  },
  {
    "id": "jeju",
    "name": "Jeju Volkanik Adası",
    "clue": "Kore Yarımadası'nın güneyinde, lav tüpleri ve krater gölleriyle bilinen volkanik adayı haritada bul.",
    "clueEn": "Find the volcanic island south of the Korean Peninsula, famous for lava tubes and crater lakes.",
    "lat": 33.36,
    "lon": 126.53,
    "level": 1,
    "region": "Güney Kore",
    "sourceUrl": "https://whc.unesco.org/en/list/1264/"
  },
  {
    "id": "siankaan",
    "name": "Sian Ka'an Biyosfer Rezervi",
    "clue": "Meksika'nın Yucatán Yarımadası'nın doğu kıyısında mangrov, sulak alan ve mercan resiflerinin buluştuğu koruma alanını bul.",
    "clueEn": "Locate the protected coastal area of mangroves, wetlands and coral reefs on the eastern Yucatán Peninsula.",
    "lat": 19.77,
    "lon": -87.61,
    "level": 2,
    "region": "Meksika",
    "sourceUrl": "https://whc.unesco.org/en/list/410/"
  },
  {
    "id": "kluane",
    "name": "Kluane Millî Parkı",
    "clue": "Kanada'nın Yukon bölgesinde Alaska sınırına yakın, dev buzulları ve yüksek dağlarıyla ünlü millî parkı haritada bul.",
    "clueEn": "Find the national park of enormous glaciers and high mountains near the Alaska border in Canada's Yukon.",
    "lat": 60.73,
    "lon": -139.5,
    "level": 2,
    "region": "Kanada / Yukon",
    "sourceUrl": "https://whc.unesco.org/en/list/72/"
  },
  {
    "id": "ohrid",
    "name": "Ohri Gölü",
    "clue": "Balkanlar'da Kuzey Makedonya ile Arnavutluk arasında uzanan, çok sayıda endemik tatlı su türünü barındıran gölü bul.",
    "clueEn": "Locate the Balkan lake shared by North Macedonia and Albania, known for its many endemic freshwater species.",
    "lat": 41.05,
    "lon": 20.73,
    "level": 2,
    "region": "Kuzey Makedonya / Arnavutluk",
    "sourceUrl": "https://whc.unesco.org/en/list/99/"
  },
  {
    "id": "surtsey",
    "name": "Surtsey Adası",
    "clue": "İzlanda'nın güney kıyılarının açığında 1960'lı yıllardaki denizaltı volkan patlamalarıyla oluşan genç adayı bul.",
    "clueEn": "Find the young island off Iceland's south coast, formed by submarine volcanic eruptions during the 1960s.",
    "lat": 63.3,
    "lon": -20.6,
    "level": 3,
    "region": "İzlanda",
    "sourceUrl": "https://whc.unesco.org/en/list/1267/"
  },
  {
    "id": "tassili",
    "name": "Tassili n'Ajjer Platosu",
    "clue": "Cezayir'in Sahra kesiminde, aşınmış kum taşı sütunları ve tarih öncesi kaya resimleriyle tanınan platoyu bul.",
    "clueEn": "Locate the Saharan plateau in Algeria, renowned for eroded sandstone pillars and prehistoric rock paintings.",
    "lat": 25.5,
    "lon": 9,
    "level": 3,
    "region": "Cezayir / Sahra",
    "sourceUrl": "https://whc.unesco.org/en/list/179/"
  },
  {
    "id": "lena-pillars",
    "name": "Lena Sütunları",
    "clue": "Rusya'nın Yakutistan bölgesinde, büyük bir Sibirya nehrinin kıyısında yükselen yaklaşık yüz metrelik kaya sütunlarını bul.",
    "clueEn": "Find the towering rock pillars lining a major Siberian river in Russia's Sakha Republic.",
    "lat": 61.14,
    "lon": 127.49,
    "level": 3,
    "region": "Rusya / Yakutistan",
    "sourceUrl": "https://whc.unesco.org/en/list/1299/"
  },
  {
    "id": "tongariro",
    "name": "Tongariro Millî Parkı",
    "clue": "Yeni Zelanda'nın Kuzey Adası'nda, etkin volkanların ve Māori halkı için kültürel önem taşıyan dağların bulunduğu parkı bul.",
    "clueEn": "Find the North Island park in New Zealand with active volcanoes and mountains sacred to Māori communities.",
    "lat": -39.2,
    "lon": 175.58,
    "level": 1,
    "region": "Yeni Zelanda / Kuzey Adası",
    "sourceUrl": "https://whc.unesco.org/en/list/421/"
  },
  {
    "id": "nakuru",
    "name": "Nakuru Gölü",
    "clue": "Kenya'nın Büyük Rift Vadisi'nde, flamingoların beslendiği sığ ve alkali göllerden birini haritada bul.",
    "clueEn": "Locate one of the shallow alkaline lakes in Kenya's Great Rift Valley that support feeding flamingos.",
    "lat": -0.36,
    "lon": 36.08,
    "level": 2,
    "region": "Kenya / Rift Vadisi",
    "sourceUrl": "https://whc.unesco.org/en/list/1060/"
  },
  {
    "id": "manu",
    "name": "Manú Millî Parkı",
    "clue": "Peru'da And Dağları'nın doğu yamaçlarından Amazon yağmur ormanlarına uzanan, büyük yükselti farklarıyla tanınan koruma alanını bul.",
    "clueEn": "Find the Peruvian protected area spanning eastern Andean slopes and Amazonian rainforest across a dramatic elevation gradient.",
    "lat": -12.25,
    "lon": -71.55,
    "level": 3,
    "region": "Peru / Andlar-Amazon geçişi",
    "sourceUrl": "https://whc.unesco.org/en/list/402/"
  },
  {
    "id": "uluru",
    "name": "Uluru-Kata Tjuta Millî Parkı",
    "clue": "Avustralya'nın iç kesimlerindeki kızıl çöl düzlüğünde dev bir kumtaşı kütlesi ve kaya kubbelerinin bulunduğu millî parkı haritada bul.",
    "clueEn": "Find the central Australian national park with a giant sandstone monolith and rock domes rising above a red desert plain.",
    "lat": -25.3444,
    "lon": 131.0369,
    "level": 1,
    "region": "Avustralya / Kuzey Toprakları",
    "sourceUrl": "https://whc.unesco.org/en/list/447/"
  },
  {
    "id": "banc-arguin",
    "name": "Banc d'Arguin Millî Parkı",
    "clue": "Moritanya'nın Atlas Okyanusu kıyısında kumulların, sığ deniz alanlarının ve göçmen kuşların buluştuğu koruma alanını bul.",
    "clueEn": "Locate the Mauritanian Atlantic coastal park where dunes, shallow seas and islands shelter large numbers of migratory birds.",
    "lat": 20.2347,
    "lon": -16.1089,
    "level": 2,
    "region": "Moritanya / Atlas Okyanusu",
    "sourceUrl": "https://whc.unesco.org/en/list/506/"
  },
  {
    "id": "sangay",
    "name": "Sangay Millî Parkı",
    "clue": "Ekvador Andları'nda buzullardan yağmur ormanlarına uzanan, etkin volkanları ve dağ tapirlerini barındıran koruma alanını bul.",
    "clueEn": "Find the Ecuadorian Andean park spanning glaciers and rainforest, with active volcanoes and mountain tapirs.",
    "lat": -1.8333,
    "lon": -78.3333,
    "level": 3,
    "region": "Ekvador / And Dağları",
    "sourceUrl": "https://whc.unesco.org/en/list/260/"
  }
,
  {
    "id": "ningaloo",
    "name": "Ningaloo Kıyısı",
    "clue": "Avustralya'nın batı kıyısında, kıyıya yakın mercan resifleri ve mevsimsel balina köpekbalığı buluşmalarıyla tanınan koruma alanını haritada bul.",
    "clueEn": "Locate the Western Australian coastal reserve known for near-shore coral reefs and seasonal gatherings of whale sharks.",
    "lat": -22.551,
    "lon": 113.81,
    "level": 1,
    "region": "Avustralya / Batı kıyısı",
    "sourceUrl": "https://whc.unesco.org/en/list/1369/"
  },
  {
    "id": "blue-hole",
    "name": "Büyük Mavi Çukur",
    "clue": "Orta Amerika'nın Karayip kıyısı açıklarında, bir mercan atolünün içinde yer alan dev, dairesel deniz çukurunu haritada bul.",
    "clueEn": "Find the huge circular marine sinkhole within a coral atoll off the Caribbean coast of Central America.",
    "lat": 17.315,
    "lon": -87.534,
    "level": 1,
    "region": "Belize / Lighthouse Reef",
    "sourceUrl": "https://whc.unesco.org/en/list/764/"
  },
  {
    "id": "mount-kenya",
    "name": "Kenya Dağı",
    "clue": "Doğu Afrika'da ekvatorun yakınında, eski bir yanardağın buzullar tarafından oyulmuş yüksek zirvelerini haritada bul.",
    "clueEn": "Find the high peaks of an ancient volcano near the equator in East Africa, shaped by past glaciation.",
    "lat": -0.152,
    "lon": 37.308,
    "level": 2,
    "region": "Kenya / Orta dağlık bölge",
    "sourceUrl": "https://whc.unesco.org/en/list/800/"
  },
  {
    "id": "madeira-laurisilva",
    "name": "Madeira Defne Ormanları",
    "clue": "Atlas Okyanusu'ndaki Portekiz adasında, sisli vadileri örten eski ve herdem yeşil defne ormanlarını haritada bul.",
    "clueEn": "Locate the ancient evergreen laurel forests covering misty valleys on a Portuguese island in the Atlantic.",
    "lat": 32.767,
    "lon": -17,
    "level": 2,
    "region": "Portekiz / Madeira",
    "sourceUrl": "https://whc.unesco.org/en/list/934/"
  },
  {
    "id": "central-suriname",
    "name": "Orta Surinam Doğa Koruma Alanı",
    "clue": "Güney Amerika'nın kuzeyindeki Guyana Kalkanı üzerinde, büyük kesintisiz tropikal ormanları ve granit kaya tepelerini koruyan alanı bul.",
    "clueEn": "Find the vast protected tropical forest with granite inselbergs on the Guiana Shield in northern South America.",
    "lat": 4,
    "lon": -56.5,
    "level": 3,
    "region": "Surinam / Sipaliwini",
    "sourceUrl": "https://whc.unesco.org/en/list/1017/"
  },
  {
    "id": "lorentz",
    "name": "Lorentz Millî Parkı",
    "clue": "Yeni Gine'nin batısında, yüksek dağlardan tropikal kıyı sulak alanlarına uzanan devasa koruma alanını haritada bul.",
    "clueEn": "Locate the huge protected area in western New Guinea stretching from high mountains to tropical coastal wetlands.",
    "lat": -4.75,
    "lon": 137.8333,
    "level": 3,
    "region": "Endonezya / Papua",
    "sourceUrl": "https://whc.unesco.org/en/list/955/"
  }
];
export const NATURE_SOURCE="https://www.naturalearthdata.com/about/terms-of-use/";
export const ISLAND_COUNTRIES=[
{id:"352",name:"İzlanda",en:"Iceland",level:1},
{id:"450",name:"Madagaskar",en:"Madagascar",level:1},
{id:"392",name:"Japonya",en:"Japan",level:1},
{id:"554",name:"Yeni Zelanda",en:"New Zealand",level:1},
{id:"826",name:"Birleşik Krallık",en:"United Kingdom",level:1},
{id:"044",name:"Bahamalar",en:"Bahamas",level:1},
{id:"192",name:"Küba",en:"Cuba",level:2},
{id:"144",name:"Sri Lanka",en:"Sri Lanka",level:2},
{id:"608",name:"Filipinler",en:"Philippines",level:2},
{id:"360",name:"Endonezya",en:"Indonesia",level:2},
{id:"372",name:"İrlanda",en:"Ireland",level:2},
{id:"332",name:"Haiti",en:"Haiti",level:2},
{id:"214",name:"Dominik Cumhuriyeti",en:"Dominican Republic",level:2},
{id:"388",name:"Jamaika",en:"Jamaica",level:3},
{id:"242",name:"Fiji",en:"Fiji",level:3},
{id:"480",name:"Mauritius",en:"Mauritius",level:3},
{id:"196",name:"Kıbrıs",en:"Cyprus",level:3},
{id:"598",name:"Papua Yeni Gine",en:"Papua New Guinea",level:3},
{id:"548",name:"Vanuatu",en:"Vanuatu",level:3},
{id:"090",name:"Solomon Adaları",en:"Solomon Islands",level:3},
{id:"626",name:"Doğu Timor",en:"Timor-Leste",level:3}
] as const;
export const BORDER_SOURCE="https://www.naturalearthdata.com/about/terms-of-use/";
// The playable border questions are derived, never hand-guessed, from the
// actual country topology's shared-arcs graph. Disputed borders are generalized.
export const BORDER_FOCUS=[
"250","276","724","380","620","124","840","484","076","032",
"152","604","170","356","156","586","050","524","764","704",
"116","418","710","516","072","716","508","818","434","729",
"231","404","800","834","643","398","804","616","112","012"
] as const;
