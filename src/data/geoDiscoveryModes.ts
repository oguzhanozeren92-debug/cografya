// Reviewed first-run coordinates for the interactive Natural Earth basemap.
// Point coordinates are approximate play markers, not survey-grade measurements.
export type NaturePoint={id:string;name:string;clue:string;lat:number;lon:number;level:1|2|3;region:string};
export const NATURE_POINTS:NaturePoint[]=[
  {
    "id": "nile",
    "name": "Nil Deltası",
    "clue": "Kuzey Afrika'da Akdeniz'e dökülen ve antik Mısır tarımına hayat veren büyük nehrin deltası.",
    "lat": 31.1,
    "lon": 31.4,
    "level": 1,
    "region": "Mısır ve Akdeniz"
  },
  {
    "id": "amazon",
    "name": "Amazon Nehri Ağzı",
    "clue": "Dünyanın en büyük debili nehrinin Atlas Okyanusu'na ulaştığı Güney Amerika kıyısı.",
    "lat": -0.5,
    "lon": -50.4,
    "level": 1,
    "region": "Brezilya"
  },
  {
    "id": "victoria",
    "name": "Victoria Gölü",
    "clue": "Doğu Afrika'daki üç ülkenin çevrelediği, Afrika'nın yüzölçümü bakımından en büyük gölü.",
    "lat": -1,
    "lon": 33,
    "level": 1,
    "region": "Uganda, Kenya ve Tanzanya"
  },
  {
    "id": "everest",
    "name": "Everest Dağı",
    "clue": "Himalayalar'da, Nepal ve Çin sınırında yer alan dünyanın en yüksek zirvesi.",
    "lat": 27.99,
    "lon": 86.93,
    "level": 1,
    "region": "Himalayalar"
  },
  {
    "id": "sahara",
    "name": "Sahra Çölü",
    "clue": "Kuzey Afrika'nın çok büyük bir bölümünü kaplayan sıcak çöl kuşağının orta kesimleri.",
    "lat": 23,
    "lon": 10,
    "level": 1,
    "region": "Kuzey Afrika"
  },
  {
    "id": "fuji",
    "name": "Fuji Dağı",
    "clue": "Honşu adasında bulunan ve Japonya'nın simgelerinden biri olan volkanik dağ.",
    "lat": 35.36,
    "lon": 138.73,
    "level": 1,
    "region": "Japonya"
  },
  {
    "id": "mississippi",
    "name": "Mississippi Deltası",
    "clue": "Kuzey Amerika'nın güneyinde, Meksika Körfezi'ne dökülen büyük nehrin delta bölgesi.",
    "lat": 29.2,
    "lon": -89.2,
    "level": 2,
    "region": "ABD, Louisiana"
  },
  {
    "id": "danube",
    "name": "Tuna Deltası",
    "clue": "Karadeniz kıyısında Romanya ve Ukrayna arasında uzanan büyük sulak alan.",
    "lat": 45.2,
    "lon": 29.6,
    "level": 2,
    "region": "Karadeniz"
  },
  {
    "id": "baikal",
    "name": "Baykal Gölü",
    "clue": "Sibirya'da yer alan, dünya üzerindeki en derin tatlı su gölü.",
    "lat": 53.5,
    "lon": 108.2,
    "level": 2,
    "region": "Rusya"
  },
  {
    "id": "titicaca",
    "name": "Titicaca Gölü",
    "clue": "And Dağları'nda Peru ve Bolivya sınırında bulunan yüksek rakımlı göl.",
    "lat": -15.8,
    "lon": -69.3,
    "level": 2,
    "region": "And Dağları"
  },
  {
    "id": "kilimanjaro",
    "name": "Kilimanjaro Dağı",
    "clue": "Tanzanya'da yükselen, Afrika'nın en yüksek dağı.",
    "lat": -3.07,
    "lon": 37.35,
    "level": 2,
    "region": "Doğu Afrika"
  },
  {
    "id": "ganges",
    "name": "Ganj-Brahmaputra Deltası",
    "clue": "Bengal Körfezi'ne dökülen büyük Güney Asya nehirlerinin oluşturduğu delta.",
    "lat": 22,
    "lon": 89,
    "level": 2,
    "region": "Bangladeş ve Hindistan"
  },
  {
    "id": "congo",
    "name": "Kongo Nehri Ağzı",
    "clue": "Ekvator Afrika'sından gelen güçlü nehrin Atlas Okyanusu'na ulaştığı yer.",
    "lat": -6,
    "lon": 12.3,
    "level": 3,
    "region": "Orta Afrika kıyısı"
  },
  {
    "id": "aconcagua",
    "name": "Aconcagua Dağı",
    "clue": "And Dağları'nda bulunan, Asya dışındaki en yüksek zirve.",
    "lat": -32.65,
    "lon": -70.01,
    "level": 3,
    "region": "Arjantin"
  },
  {
    "id": "malawi",
    "name": "Malavi Gölü",
    "clue": "Büyük Rift Vadisi'ndeki uzun ve dar Afrika göllerinden biri.",
    "lat": -12,
    "lon": 34.7,
    "level": 3,
    "region": "Doğu Afrika"
  },
  {
    "id": "yangtze",
    "name": "Yangtze Nehri Deltası",
    "clue": "Çin'in doğu kıyısında büyük bir ticaret ve yerleşim alanı oluşturan nehir ağzı.",
    "lat": 31.5,
    "lon": 121.9,
    "level": 3,
    "region": "Çin, Doğu Çin Denizi"
  },
  {
    "id": "reef",
    "name": "Büyük Set Resifi",
    "clue": "Avustralya'nın kuzeydoğu kıyıları boyunca uzanan geniş mercan resifi sistemi.",
    "lat": -18,
    "lon": 146.8,
    "level": 3,
    "region": "Mercan Denizi"
  },
  {
    "id": "rhine",
    "name": "Ren Nehri Ağzı",
    "clue": "Alp dağlarından kaynaklanıp Kuzey Denizi'ne ulaşan Avrupa nehir sisteminin deltası.",
    "lat": 51.95,
    "lon": 4.1,
    "level": 3,
    "region": "Hollanda, Kuzey Denizi"
  }
];
export const NATURE_SOURCE="https://www.naturalearthdata.com/about/terms-of-use/";
export const ISLAND_COUNTRIES=[
{id:"352",name:"İzlanda",en:"Iceland",level:1},
{id:"450",name:"Madagaskar",en:"Madagascar",level:1},
{id:"392",name:"Japonya",en:"Japan",level:1},
{id:"554",name:"Yeni Zelanda",en:"New Zealand",level:1},
{id:"192",name:"Küba",en:"Cuba",level:2},
{id:"144",name:"Sri Lanka",en:"Sri Lanka",level:2},
{id:"608",name:"Filipinler",en:"Philippines",level:2},
{id:"360",name:"Endonezya",en:"Indonesia",level:2},
{id:"388",name:"Jamaika",en:"Jamaica",level:3},
{id:"242",name:"Fiji",en:"Fiji",level:3},
{id:"480",name:"Mauritius",en:"Mauritius",level:3},
{id:"196",name:"Kıbrıs",en:"Cyprus",level:3}
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
