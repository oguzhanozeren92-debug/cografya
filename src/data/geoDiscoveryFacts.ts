/**
 * Editorial learning notes for the map discovery games.
 * These notes intentionally explain something BEYOND the prompt and answer.
 * Keep world-map geometry credits separate from factual sources.
 */
import { COUNTRY_DATA } from '@/data/countries';
import { getCountryClue } from '@/data/countryClues';
import { EXTRA_COUNTRY_KNOWLEDGE } from '@/data/countryKnowledge';
import { localizedClueCard } from '@/lib/clueLanguage';
import type { Language } from '@/lib/i18n';

type Note = { tr: string; en: string; sourceUrl?: string };
export type DiscoveryNote = { text: string; sourceUrl?: string };

const NATURE_NOTES: Readonly<Record<string,Note>> = {
  nile: {
    tr: 'Nil Deltası, nehrin binlerce yıldır taşıdığı verimli alüvyonlarla oluşmuştur. Bu topraklar, Akdeniz kıyısındaki yoğun tarım ve yerleşimi destekler.',
    en: 'The Nile Delta formed from fertile sediment carried by the river over thousands of years. These soils support farming and dense settlements along the Mediterranean coast.',
  },
  amazon: {
    tr: 'Amazon, okyanusa çok büyük miktarda tatlı su ve tortu taşır. Nehir ağzındaki Marajó Adası ve çevresindeki haliçler karmaşık bir kıyı ekosistemi oluşturur.',
    en: 'The Amazon delivers immense amounts of freshwater and sediment to the ocean. Marajó Island and the surrounding estuaries form a complex coastal ecosystem.',
  },
  victoria: {
    tr: 'Victoria Gölü’nün suları Victoria Nil’i üzerinden Nil Nehri sistemine katılır. Göl, kıyısındaki ülkeler için balıkçılık ve ulaşım açısından önemlidir.',
    en: 'Water from Lake Victoria flows into the Nile system through the Victoria Nile. The lake supports fisheries and transportation in its bordering countries.',
  },
  everest: {
    tr: 'Everest’in yükseldiği Himalayalar, Hint ve Avrasya levhalarının çarpışmasıyla oluşmuştur. Bölgedeki tektonik hareketler dağların yükselmesini hâlâ etkiler.',
    en: 'The Himalayas formed through the collision of the Indian and Eurasian tectonic plates. Tectonic movements continue to shape the mountain range.',
  },
  sahara: {
    tr: 'Sahra’nın tamamı kum tepelerinden oluşmaz. Geniş taşlık düzlükler, kayalık platolar ve dağlık alanlar da bu dev çölün önemli parçalarıdır.',
    en: 'The Sahara is not all sand dunes. Vast stony plains, rocky plateaus and mountains are also major parts of this enormous desert.',
  },
  fuji: {
    tr: 'Fuji, Japonya’nın en yüksek dağıdır ve koni biçimli bir stratovolkandır. Dağ, yalnızca doğal bir simge değil, Japon sanatında ve inanç tarihinde de özel bir yere sahiptir.',
    en: 'Mount Fuji is Japan’s highest mountain and a cone-shaped stratovolcano. It also has an important place in Japanese art and spiritual traditions.',
  },
  mississippi: {
    tr: 'Mississippi’nin taşıdığı tortular deltada yeni kara ve sulak alanların oluşmasına katkıda bulunur. Delta bataklıkları, kıyı ekosistemleri ve kuşlar için önemli yaşam alanlarıdır.',
    en: 'Sediment carried by the Mississippi helps shape land and wetlands in its delta. These marshes provide valuable habitats for coastal wildlife and birds.',
  },
  danube: {
    tr: 'Tuna Deltası sazlıklar, göller ve su kanallarından oluşan geniş bir sulak alandır. Göçmen kuşlar için Avrupa’nın en önemli yaşam alanlarından biri sayılır.',
    en: 'The Danube Delta is a vast wetland of reed beds, lakes and channels. It is one of Europe’s most important habitats for migratory birds.',
  },
  baikal: {
    tr: 'Baykal Gölü yaklaşık 1,6 kilometre derinliğe ulaşır. Dünyada yalnızca bu gölde yaşayan Baykal foku, gölün olağanüstü canlı çeşitliliğinin simgelerindendir.',
    en: 'Lake Baikal reaches a depth of roughly 1.6 kilometres. The Baikal seal, found naturally only in this lake, is a symbol of its remarkable biodiversity.',
    sourceUrl: 'https://world-heritage-datasheets.unep-wcmc.org/datasheet/output/site/lake-baikal/',
  },
  titicaca: {
    tr: 'Titicaca Gölü deniz seviyesinden yaklaşık 3.800 metre yüksektedir. Uros topluluklarının totora sazından yaptığı yüzen adalar, gölün kültürel özelliklerindendir.',
    en: 'Lake Titicaca lies at about 3,800 metres above sea level. The floating islands built from totora reeds by Uros communities are a distinctive cultural feature.',
  },
  kilimanjaro: {
    tr: 'Kilimanjaro tek bir volkanik koniden ibaret değildir: Kibo, Mawenzi ve Shira adlı üç volkanik bölümden oluşur. Kibo, dağın en yüksek noktasını barındırır.',
    en: 'Kilimanjaro is made up of three volcanic cones: Kibo, Mawenzi and Shira. Its highest point is on Kibo.',
  },
  ganges: {
    tr: 'Bu dev delta, Sundarbans adı verilen dünyanın en büyük mangrov ormanlarından birini barındırır. Mangrovlar kıyıdaki canlıları koruyan özel bir ekosistem oluşturur.',
    en: 'This enormous delta contains the Sundarbans, one of the world’s largest mangrove forests. Mangroves support wildlife and help protect coastal habitats.',
  },
  congo: {
    tr: 'Kongo Nehri, Amazon’dan sonra dünyanın en yüksek debili nehirlerinden biridir. Havzasındaki tropik ormanlar, Afrika’nın biyolojik çeşitliliği için çok önemlidir.',
    en: 'The Congo is one of the world’s highest-discharge rivers after the Amazon. The tropical forests of its basin are vital for African biodiversity.',
  },
  aconcagua: {
    tr: 'Aconcagua, yaklaşık 6.960 metre yüksekliğiyle Asya dışındaki en yüksek zirvedir. Arjantin’de, Şili sınırına yakın yükselir; etkin bir yanardağ değildir.',
    en: 'At roughly 6,960 metres, Aconcagua is the highest peak outside Asia. It stands in Argentina near Chile and is not an active volcano.',
    sourceUrl: 'https://education.nationalgeographic.org/resource/cerro-aconcagua/',
  },
  malawi: {
    tr: 'Malavi Gölü, yalnızca burada yaşayan yüzlerce çiklet balığı türüyle ünlüdür. Bu olağanüstü çeşitlilik, canlıların farklı ortamlara uyum sağlayarak nasıl türleştiğini gösterir.',
    en: 'Lake Malawi is famous for hundreds of cichlid fish species found nowhere else. Their diversity helps scientists study how new species evolve.',
    sourceUrl: 'https://whc.unesco.org/en/list/289/',
  },
  yangtze: {
    tr: 'Yangtze Deltası, Şanghay’ı da içeren yoğun yerleşim ve ticaret bölgesidir. Nehrin taşıdığı tortular, kıyı düzlüklerinin şekillenmesinde rol oynamıştır.',
    en: 'The Yangtze Delta includes Shanghai and is a major population and trade region. Sediment from the river has helped shape its coastal plains.',
  },
  reef: {
    tr: 'Büyük Set Resifi tek parça değildir; binlerce ayrı resif ve adacıktan oluşur. Mercan kolonilerinin oluşturduğu kireçtaşı yapılar, çok sayıda deniz canlısına yaşam alanı sağlar.',
    en: 'The Great Barrier Reef is not one single reef; it consists of thousands of reefs and small islands. Limestone structures formed by corals shelter a vast range of marine life.',
  },
  rhine: {
    tr: 'Ren, Kuzey Denizi’ne ulaşırken Hollanda’daki geniş nehir-kol ve delta sistemiyle birleşir. Rotterdam çevresindeki limanlar bu su yolu ağından yararlanır.',
    en: 'Before reaching the North Sea, the Rhine joins the extensive river-and-delta network of the Netherlands. Ports around Rotterdam use this waterway system.',
  },
};

const ISLAND_NOTES: Readonly<Record<string,Note>> = {
  '352': {tr:'İzlanda, Atlantik ortasındaki levha sınırında bulunur. Bu yüzden hem volkanlar hem de jeotermal kaynaklar ada manzarasının önemli parçalarıdır.',en:'Iceland lies on a tectonic plate boundary in the Atlantic, making volcanoes and geothermal springs major features of its landscape.'},
  '450': {tr:'Madagaskar’ın uzun süre diğer kara parçalarından ayrı kalması, lemurlar gibi yalnız burada yaşayan çok sayıda türün evrimleşmesini sağlamıştır.',en:'Long isolation from other landmasses allowed Madagascar to develop unique wildlife, including lemurs that occur naturally nowhere else.'},
  '392': {tr:'Japonya’nın başlıca dört büyük adası Honşu, Hokkaido, Kyuşu ve Şikoku’dur. Ada yayı, Pasifik çevresindeki hareketli levha sınırlarıyla ilişkilidir.',en:'Japan’s four main islands are Honshu, Hokkaido, Kyushu and Shikoku. Its island arc lies near active tectonic plate boundaries.'},
  '554': {tr:'Yeni Zelanda’da dünyaya özgü, uçamayan kivi kuşu yaşar. Güney Adası’nın omurgası olan Güney Alpleri, levha hareketleriyle yükselmiştir.',en:'New Zealand is home to the flightless kiwi bird. The Southern Alps, which run along South Island, rose through tectonic activity.'},
  '192': {tr:'Küba, Karayipler’in en büyük adasıdır. Güneydoğusundaki Sierra Maestra Dağları ile iç kesimlerdeki verimli ovalar dikkat çeker.',en:'Cuba is the largest island in the Caribbean. It includes the Sierra Maestra mountains in the southeast and fertile plains inland.'},
  '144': {tr:'Sri Lanka, Hindistan’dan Palk Boğazı ve sığ deniz alanlarıyla ayrılır. Tarihî Sigiriya kaya yerleşimi adanın önemli kültür miraslarındandır.',en:'Sri Lanka is separated from India by the Palk Strait and shallow seas. The historic rock site of Sigiriya is one of its major cultural landmarks.'},
  '608': {tr:'Filipinler, binlerce adadan oluşan volkanik bir takımadadır. Bu parçalı coğrafya, çok farklı kıyı ve orman ekosistemleri oluşturur.',en:'The Philippines is a volcanic archipelago of thousands of islands. Its fragmented geography supports varied coastal and forest ecosystems.'},
  '360': {tr:'Endonezya’daki adaların bir bölümü Ekvator boyunca sıralanır. Java ve Sumatra gibi adalarda volkanlar ve tropik yağmur ormanları bulunur.',en:'Many Indonesian islands stretch along the equator. Islands such as Java and Sumatra contain volcanoes and tropical rainforests.'},
  '388': {tr:'Jamaika’nın doğusunda yükselen Blue Mountains (Mavi Dağlar), serin yüksek kesimleriyle tanınır. Ada hem dağlık hem de kıyı ovalarına sahiptir.',en:'The Blue Mountains in eastern Jamaica rise above tropical lowlands. The island has both steep highlands and coastal plains.'},
  '242': {tr:'Fiji yüzlerce adadan oluşur. Adaların bir kısmı volkanik kökenlidir; çevrelerindeki mercan resifleri zengin deniz yaşamına ev sahipliği yapar.',en:'Fiji consists of hundreds of islands. Some are volcanic, and surrounding coral reefs host rich marine life.'},
  '480': {tr:'Mauritius, Hint Okyanusu’nda volkanik kökenli bir adadır. Artık soyu tükenmiş dodo kuşunun doğal yaşam alanı olmasıyla da tanınır.',en:'Mauritius is a volcanic island in the Indian Ocean and was the native home of the now-extinct dodo bird.'},
  '196': {tr:'Kıbrıs’ın iç kesimlerinde Trodos Dağları yükselir. Ada, Akdeniz’in doğusunda farklı doğal ortamları ve tarihî ticaret yollarını bir araya getirir.',en:'The Troodos Mountains rise in inland Cyprus. This eastern Mediterranean island has varied landscapes and a long history of trade routes.'},
  '826': {tr:'Büyük Britanya adasında İngiltere, İskoçya ve Galler bulunur; Kuzey İrlanda ise İrlanda adasının kuzeydoğu bölümündedir.',en:'Great Britain contains England, Scotland and Wales. Northern Ireland occupies part of the separate island of Ireland.'},
  '372': {tr:'İrlanda’nın batı kıyısında Atlas Okyanusu’na bakan sarp kayalıklar bulunur. Orta kesimlerde daha alçak ve yeşil düzlükler yaygındır.',en:'Ireland has dramatic Atlantic cliffs along its western coast and generally lower, greener plains across its interior.'},
  '598': {tr:'Yeni Gine, dünyanın en büyük adalarından biridir; doğu yarısı Papua Yeni Gine’ye, batı yarısı Endonezya’ya aittir. Dağlık arazi çok sayıda ayrı kültürün gelişmesini etkilemiştir.',en:'New Guinea is one of the world’s largest islands, shared by Papua New Guinea and Indonesia. Its mountains have shaped the development of many distinct communities.'},
};

// Special border relationships help players understand WHY the two countries
// appeared together instead of seeing the original question again.
const BORDER_PAIRS: Readonly<Record<string,Note>> = {
  '032-152': {
    tr: 'Arjantin ile Şili’nin uzun sınırının önemli bölümü And Dağları boyunca uzanır. Patagonya bölgesi iki ülkeye de yayılır. Asya dışındaki en yüksek zirve Aconcagua, Arjantin’dedir.',
    en: 'Much of the long Argentina–Chile border follows the Andes. Patagonia spans both countries, and Aconcagua in Argentina is the highest summit outside Asia.',
    sourceUrl:'https://education.nationalgeographic.org/resource/cerro-aconcagua/',
  },
  '124-840': {tr:'Kanada ile ABD, Kuzey Amerika’da dünyanın en uzun uluslararası kara sınırlarından birini paylaşır. Büyük Göller bölgesi bu komşuluğun önemli bir bölümünü şekillendirir.',en:'Canada and the United States share one of the world’s longest international land borders. The Great Lakes shape an important part of their frontier.'},
  '250-276': {tr:'Fransa ve Almanya arasındaki Ren Nehri, sınırın çeşitli kesimlerinde doğal bir hat oluşturur. Alsas ve Ren Vadisi Avrupa tarihinde önemli geçiş bölgeleridir.',en:'The Rhine forms a natural boundary along sections of the France–Germany border. Alsace and the Rhine Valley have long been important European corridors.'},
  '620-724': {tr:'Portekiz ve İspanya’nın kara sınırı İber Yarımadası’nın içinden geçer. Duero/Douro ve Guadiana gibi nehirler sınır coğrafyasını etkiler.',en:'Portugal and Spain share the Iberian Peninsula. Rivers including the Douro and Guadiana help shape sections of their frontier.'},
  '152-604': {tr:'Şili ile Peru, Güney Amerika’nın Pasifik kıyısında komşudur. İki ülkenin batısında kıyı çölleri, doğusunda And Dağları uzanır.',en:'Chile and Peru meet on South America’s Pacific coast. Coastal deserts lie to their west, while the Andes rise to the east.'},
  '156-524': {tr:'Nepal ile Çin’in sınırı Himalayalar boyunca uzanır. Dünyanın en yüksek zirvesi Everest, bu sınır üzerinde yükselir.',en:'The Nepal–China border follows the Himalayas. Mount Everest, the highest summit on Earth, stands on that border.'},
  '426-710': {tr:'Lesotho, Güney Afrika tarafından tamamen çevrelenen bağımsız bir ülkedir. Dağlık toprakları nedeniyle “Gökteki Krallık” lakabıyla anılır.',en:'Lesotho is an independent country entirely surrounded by South Africa. Its mountainous terrain gives rise to the nickname “Kingdom in the Sky”.'},
  '032-076': {tr:'Arjantin ile Brezilya sınırının yakınında Iguazú/İguazu Şelaleleri bulunur. Çok sayıda çağlayan, tropik ormanların içindeki geniş bir nehir sistemine yayılır.',en:'Iguazú Falls lies near the Argentina–Brazil border. Its many cascades spread through a river system surrounded by subtropical forest.'},
};

export function getGeoDiscoveryNote(
  mode: 'nature'|'islands'|'borders',
  answerId: string,
  targetId: string | undefined,
  language: Language,
): DiscoveryNote | null {
  const tr = language === 'tr';
  const note = mode === 'nature' ? NATURE_NOTES[answerId]
    : mode === 'islands' ? ISLAND_NOTES[answerId]
    : targetId ? BORDER_PAIRS[[answerId,targetId].sort().join('-')] : undefined;
  if (note) return { text: tr ? note.tr : note.en, sourceUrl: note.sourceUrl };
  if (mode !== 'borders') return null;
  const existing = getCountryClue(answerId);
  const fact = tr
    ? (EXTRA_COUNTRY_KNOWLEDGE[answerId] || existing?.fact)
    : (existing ? localizedClueCard(existing,language).fact : '');
  // The country catalog covers all playable countries, so do not display
  // an artificial statement that merely repeats the border question.
  if (fact) return { text: fact };
  const country=COUNTRY_DATA[answerId];
  if (!country) return null;
  return {
    text: tr
      ? `${country.nameTr}, bulunduğu bölgedeki komşu ülkelerle dağları, vadileri ve ulaşım yollarını paylaşır. Haritada ülkelerin sınırlarının doğal coğrafyayla nasıl ilişkilendiğini karşılaştır.`
      : `Study how ${country.nameTr}'s boundary follows or crosses natural landscapes such as mountains, valleys and river systems.`
  };
}
