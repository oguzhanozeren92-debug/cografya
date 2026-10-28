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
    "sourceUrl": "https://www.britannica.com/place/Lake-Atitlan"
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
    "sourceUrl": "https://science.nasa.gov/earth/earth-observatory/salar-de-uyuni-bolivia-6096/"
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
