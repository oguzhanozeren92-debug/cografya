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
  'okavango-delta': {"tr":"Okavango'nun mevsimsel taşkınları Kalahari'de geniş sulak alanlar oluşturur; suyun büyük bölümü buharlaşır veya toprağa sızar.","en":"Seasonal floods spread across the Kalahari, where much of the Okavango's water evaporates or infiltrates the ground.","sourceUrl":"https://whc.unesco.org/en/list/1432/"},
  'wadi-rum': {"tr":"Vadi Rum'da doğal kaya oluşumlarının yanında binlerce yıllık kaya yazıtları ve arkeolojik izler de korunur.","en":"Wadi Rum preserves ancient rock inscriptions and archaeological remains alongside its distinctive desert landforms.","sourceUrl":"https://whc.unesco.org/en/list/1377/"},
  'namib-sand-sea': {"tr":"Namib kıyılarındaki sis, çok kurak bir bölgede yaşayan bazı bitki ve hayvanlar için önemli bir nem kaynağıdır.","en":"Coastal fog supplies vital moisture to some plants and animals in the extremely arid Namib landscape.","sourceUrl":"https://whc.unesco.org/en/list/1430/"},
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
  iguazu: {
    tr: "Şelaleler, bazalt kayaçlardan oluşan bir eşik boyunca çok sayıda kola ayrılır. Sürekli yükselen su buharı, çevredeki yağmur ormanının nemli mikroiklimini destekler.",
    en: "The falls spread across a basalt rock escarpment into many cascades. Constant spray helps sustain a humid rainforest microclimate.",
    sourceUrl: "https://whc.unesco.org/en/list/303/",
  },
  ngorongoro: {
    tr: "Bu dev kaldera, eski bir volkanın çökmesiyle oluşmuştur. Çukurun tabanındaki otlaklar ve su kaynakları birçok büyük memeli türünü bir arada barındırır.",
    en: "This huge caldera formed when an ancient volcano collapsed. Grasslands and water sources on its floor support many large mammal species.",
    sourceUrl: "https://whc.unesco.org/en/list/39/",
  },
  halong: {
    tr: "Kireç taşı kuleleri uzun süreli karst aşınması ve deniz seviyesindeki değişimlerle şekillenmiştir. Mağaralar ve adacıklar zengin kıyı ekosistemleri oluşturur.",
    en: "Limestone towers were shaped by long-term karst erosion and sea-level changes. Caves and islets form varied coastal ecosystems.",
    sourceUrl: "https://whc.unesco.org/en/list/672/",
  },
  atitlan: {
    tr: "Göl, büyük bir volkanik çöküntü olan kalderayı doldurur. Kıyı köylerinde Kaqchikel ve Tz’utujil Maya kültürleri yaşamaya devam eder.",
    en: "The lake fills a large volcanic caldera. Kaqchikel and Tz’utujil Maya communities maintain living cultural traditions around its shores.",
    sourceUrl: "https://www.visitcentroamerica.com/en/visit/lake-atitlan-and-sorrounding-towns/",
  },
  uyuni: {
    tr: "Beyaz yüzeyin altında eski göllerin buharlaşmasıyla biriken tuz katmanları bulunur. Düz ve parlak zemin, uydu sensörlerinin kalibrasyonunda da kullanılır.",
    en: "Salt layers accumulated as ancient lakes evaporated. The exceptionally flat, bright surface is also used to calibrate satellite sensors.",
    sourceUrl: "https://calval.cr.usgs.gov/apps/uyuni-salt-flats",
  },
  roraima: {
    tr: "Tepui adı verilen düz tepeli dağlar, çevrelerindeki alçak arazilerden uzun süre yalıtılmıştır. Bu durum, kendilerine özgü canlı topluluklarının gelişmesine katkıda bulunmuştur.",
    en: "Flat-topped tepuis have long been isolated above surrounding lowlands. This isolation has helped distinct plant and animal communities develop.",
    sourceUrl: "https://whc.unesco.org/en/list/701/",
  },
  okavango: {
    tr: "Bu iç delta denize dökülmez; suları Kalahari Havzası'na yayılıp buharlaşır ve toprağa sızar. Mevsimsel taşkınlar kurak dönemde bile yaban hayatına su sağlar.",
    en: "This inland delta has no outlet to the sea: its waters spread into the Kalahari Basin and evaporate or soak away. Seasonal floods sustain wildlife even in dry months.",
    sourceUrl: "https://whc.unesco.org/en/list/1432/",
  },
  wulingyuan: {
    tr: "Bölgedeki binlerce dar kumtaşı sütunu, uzun süreli aşınma ve kaya çatlaklarının genişlemesiyle şekillenmiştir. Sisli vadiler ve doğal taş köprüler manzarayı tamamlar.",
    en: "Thousands of narrow sandstone pillars formed through erosion and widening fractures. Misty valleys and natural stone bridges complete the landscape.",
    sourceUrl: "https://whc.unesco.org/en/list/640/",
  },
  turkana: {
    tr: "Çevresindeki Koobi Fora tortulları erken insan atalarına ait önemli fosiller barındırır. Gölün çevresi bugün kurak olsa da geçmişte çok farklı iklimler yaşamıştır.",
    en: "Sediments at nearby Koobi Fora preserve important fossils of early human relatives. The now-arid lake basin experienced very different climates in the past.",
    sourceUrl: "https://whc.unesco.org/en/list/801/",
  },
  socotra: {
    tr: "Bu takımadalardaki bitkilerin önemli bir bölümü dünyada başka yerde doğal olarak bulunmaz. Uzun coğrafi yalıtım, sıra dışı bitki biçimlerinin gelişmesine katkı sağlamıştır.",
    en: "A large share of the archipelago's plants occur naturally nowhere else. Long geographic isolation helped produce its unusual plant forms.",
    sourceUrl: "https://whc.unesco.org/en/list/1263/",
  },
  tsingy: {
    tr: "Keskin kireç taşı kuleleri yağmur suyunun kayaçları çözmesiyle oluşan karst şekilleridir. Aralarındaki yarıklar ve orman parçaları çok sayıda endemik türe yaşam alanı sunar.",
    en: "The sharp limestone pinnacles are karst forms carved by dissolving rainwater. Crevices and forest patches shelter many endemic species.",
    sourceUrl: "https://whc.unesco.org/en/list/494/",
  },
  namib: {
    tr: "Atlantik'ten gelen sis, çok az yağış alan kum denizinde bazı canlılar için hayati nem kaynağıdır. Rüzgârlar, dev kum tepelerinin biçimini sürekli değiştirir.",
    en: "Fog drifting in from the Atlantic provides vital moisture in this very dry sand sea. Winds continuously reshape its enormous dunes.",
    sourceUrl: "https://whc.unesco.org/en/list/1430/",
  },
  "plitvice": {"tr":"Kalsiyum karbonat birikimleri doğal traverten setleri oluşturur. Su, zamanla bu setlerin üzerinden akarak göllerin ve çağlayanların yerini değiştirebilir.","en":"Calcium carbonate deposits build natural travertine barriers. Flowing water can gradually reshape the lakes and waterfalls.","sourceUrl":"https://whc.unesco.org/en/list/98/"},
  "komodo": {"tr":"Bu adalardaki kuru savanlar, mercanlı kıyılarla keskin bir karşıtlık oluşturur. Dev varanlar yalnızca birkaç Endonezya adasında doğal olarak yaşar.","en":"Dry savannah landscapes contrast with coral-rich coasts. Giant monitor lizards occur naturally on only a few Indonesian islands.","sourceUrl":"https://whc.unesco.org/en/list/609/"},
  "jeju": {"tr":"Lav tüpleri, bir lav akıntısının dış kısmı soğuyup sertleşirken içindeki erimiş lavın akmaya devam etmesiyle oluşabilir.","en":"Lava tubes can form when the outer surface of a lava flow hardens while molten lava keeps moving through its interior.","sourceUrl":"https://whc.unesco.org/en/list/1264/"},
  "siankaan": {"tr":"Kıyı mangrovları, tatlı su sulak alanları ve deniz resifleri birbirine bağlı bir yaşam ağı oluşturur; bu çeşitlilik birçok kuş türünü destekler.","en":"Coastal mangroves, freshwater wetlands and marine reefs form a connected habitat network that supports diverse birdlife.","sourceUrl":"https://whc.unesco.org/en/list/410/"},
  "kluane": {"tr":"Bu dağlık sınır bölgesi, kutup alanları dışındaki en büyük buz alanlarından birini barındırır. Buzullar, vadilerin biçimlenmesinde önemli rol oynar.","en":"This transboundary mountain region contains one of the largest icefields outside the polar regions. Glaciers have helped carve its valleys.","sourceUrl":"https://whc.unesco.org/en/list/72/"},
  "ohrid": {"tr":"Gölün uzun jeolojik geçmişi, başka sularda bulunmayan çok sayıda canlı türünün gelişmesine katkıda bulunmuştur.","en":"The lake's long geological history helped many freshwater species evolve that are found naturally nowhere else.","sourceUrl":"https://whc.unesco.org/en/list/99/"},
  "surtsey": {"tr":"Ada oluştuğundan beri koruma altındadır. Bilim insanları, yeni oluşmuş toprağa bitki ve hayvanların nasıl yerleştiğini burada gözlemleyebilir.","en":"The island has been protected since it emerged, allowing scientists to observe how plants and animals colonise newly formed land.","sourceUrl":"https://whc.unesco.org/en/list/1267/"},
  "tassili": {"tr":"Kum taşı şekilleri uzun süreli aşınmayla ortaya çıkmıştır. Kaya resimleri, Sahra'nın geçmişte bugünkünden farklı iklimler yaşadığını gösterir.","en":"Long-term erosion shaped the sandstone formations. Rock paintings provide evidence that the Sahara experienced different climates in the past.","sourceUrl":"https://whc.unesco.org/en/list/179/"},
  "lena-pillars": {"tr":"Aşırı soğuk ve sıcaklık farkları kayalarda çatlakları genişletir. Donma-çözülme ve akarsu aşındırması sütunların ayrışmasına katkı sağlar.","en":"Extreme temperatures widen fractures in rock. Freeze-thaw weathering and river erosion help isolate the stone pillars.","sourceUrl":"https://whc.unesco.org/en/list/1299/"},
  "tongariro": {"tr":"Bu park hem volkanik jeomorfolojisi hem de Māori topluluklarının dağlarla kurduğu kültürel bağ nedeniyle karma Dünya Mirası alanıdır.","en":"The park is a mixed World Heritage site, recognised for volcanic landscapes and the cultural significance of its mountains to Māori communities.","sourceUrl":"https://whc.unesco.org/en/list/421/"},
  "nakuru": {"tr":"Nakuru, Bogoria ve Elementaita gölleri birlikte bir Dünya Mirası alanı oluşturur. Alkali sularındaki besin ağı flamingoların yaşamını destekler.","en":"Nakuru, Bogoria and Elementaita together form a World Heritage property. Food webs in their alkaline waters support flamingos.","sourceUrl":"https://whc.unesco.org/en/list/1060/"},
  "manu": {"tr":"Park, And Dağları'ndan Amazon havzasına uzanan yükselti kuşaklarında çok farklı bitki örtüsü ve yaban hayatı barındırır.","en":"The park spans elevation zones from the Andes into the Amazon Basin, supporting very different vegetation and wildlife.","sourceUrl":"https://whc.unesco.org/en/list/402/"},
  "uluru": {"tr":"Anangu halkı için bu kayalıklar yaşayan bir kültürel mirasın parçasıdır. Park, hem jeolojik özellikleri hem de geleneksel bilgi ve inançlarla ilişkisi nedeniyle Dünya Mirası statüsündedir.","en":"For the Anangu people, these rock formations are part of a living cultural heritage. The park is recognised for both its geology and its continuing traditional significance.","sourceUrl":"https://whc.unesco.org/en/list/447/"},
  "banc-arguin": {"tr":"Çöl ile Atlantik'in buluştuğu sığ kıyı suları ve deniz çayırları, göçmen kıyı kuşları için önemli beslenme ve dinlenme alanları oluşturur.","en":"Shallow coastal waters and seagrass beds where desert meets the Atlantic provide vital feeding and resting grounds for migratory shorebirds.","sourceUrl":"https://whc.unesco.org/en/list/506/"},
  "sangay": {"tr":"Parkta yüksek And çayırları, bulut ormanları ve Amazon yağmur ormanları farklı yükselti kuşaklarında bulunur. Dağ tapiri ve And kondoru bu çeşitliliğin simgelerindendir.","en":"High Andean grasslands, cloud forests and Amazonian rainforest occur at different elevations. Mountain tapirs and Andean condors are among its notable species.","sourceUrl":"https://whc.unesco.org/en/list/260/"},
  "ningaloo": {"tr":"Bu kıyıdaki Cape Range kireçtaşı arazisi, mağaralar ve yer altı su yolları barındırır. Kara ve deniz ekosistemleri yan yana korunur.","en":"The Cape Range limestone landscape contains caves and underground watercourses. The protected area connects terrestrial and marine ecosystems.","sourceUrl":"https://whc.unesco.org/en/list/1369/"},
  "blue-hole": {"tr":"Lighthouse Reef Atolü'ndeki bu çukur, eski kireçtaşı mağara sistemlerinin deniz seviyesi değişimleriyle ilişkili oluşumunu gösterir. Çevresinde mercan resifleri bulunur.","en":"This feature within Lighthouse Reef Atoll reveals a limestone cave history linked to changing sea levels. Coral reef habitats surround it.","sourceUrl":"https://whc.unesco.org/en/list/764/"},
  "mount-kenya": {"tr":"Dağın yüksek kesimlerindeki Afro-alpin bitki toplulukları, sert iklime uyum sağlamıştır. UNESCO alanı, kuzeydeki fil geçiş koridoruyla daha alçak habitatlara bağlanır.","en":"Afro-alpine plants on the upper slopes are adapted to harsh conditions. The World Heritage property also connects to lower habitats through an elephant corridor.","sourceUrl":"https://whc.unesco.org/en/list/800/"},
  "madeira-laurisilva": {"tr":"Bu ormanlar adanın su döngüsünü düzenlemeye yardımcı olur. Yalnızca bu adada bulunan Madeira defne güvercini gibi canlılar için önemli yaşam alanları sağlar.","en":"These forests help regulate the island's water cycle and provide habitat for endemic species such as the Madeira laurel pigeon.","sourceUrl":"https://whc.unesco.org/en/list/934/"},
  "central-suriname": {"tr":"Koruma alanı, Coppename Nehri'nin üst havzasını ve başka nehirlerin kaynaklarını kapsar. Ulaşılması güç bölgelerde jaguar, dev su samuru ve harpi kartalı yaşar.","en":"The reserve protects the upper Coppename watershed and several river headwaters. Remote habitats support jaguars, giant river otters and harpy eagles.","sourceUrl":"https://whc.unesco.org/en/list/1017/"},
  "lorentz": {"tr":"Parkta yükselti boyunca ekosistemler hızla değişir; yüksek kesimlerdeki buzullaşma izleri ve alçak kesimlerdeki mangrovlar aynı koruma alanında bulunur.","en":"Ecosystems change sharply with altitude: traces of mountain glaciation and lowland mangrove habitats occur within the same protected landscape.","sourceUrl":"https://whc.unesco.org/en/list/955/"},
  "garajonay": {"tr":"La Gomera'daki nemli rüzgârlar, eski defne ormanlarını besler. Bu orman tipi geçmişte Avrupa ve Kuzey Afrika'da çok daha yaygındı.","en":"Moist trade winds sustain La Gomera's ancient laurel forests. This forest type was once far more widespread across Europe and North Africa.","sourceUrl":"https://whc.unesco.org/en/list/380/"},
  "aldabra": {"tr":"Atolün uzak ve erişimi güç oluşu, dev kara kaplumbağalarının büyük bir doğal popülasyonunun korunmasına katkıda bulunmuştur.","en":"The atoll's isolation and difficult access have helped protect a very large wild population of giant tortoises.","sourceUrl":"https://whc.unesco.org/en/list/185/"},
  "uvs-nuur": {"tr":"Bu sınır aşan havza, tuzlu göl çevresindeki bozkırlardan dağ tundrasına kadar farklı iklim kuşaklarını barındırır; göçmen kuşlar için önemlidir.","en":"This transboundary basin spans habitats from saline lake steppes to mountain tundra and provides important habitat for migratory birds.","sourceUrl":"https://whc.unesco.org/en/list/769/"},
  "puerto-princesa-river": {"tr":"Yeraltı nehrinin denize yakın alt bölümü gelgitten etkilenir. Çevresindeki ormanlar, dağdan denize uzanan bağlantılı bir ekosistemi korur.","en":"Tides influence the lower reaches of the underground river. The surrounding forests protect a connected mountain-to-sea ecosystem.","sourceUrl":"https://whc.unesco.org/en/list/652/"},
  "dja-reserve": {"tr":"Nehir kıvrımı doğal bir sınır oluşturur. Bu yağmur ormanı, batı ova gorilleri, şempanzeler ve orman fillerinin yaşam alanlarını korur.","en":"A river loop forms a natural boundary. The rainforest shelters western lowland gorillas, chimpanzees and forest elephants.","sourceUrl":"https://whc.unesco.org/en/list/407/"},
  "danxiashan": {"tr":"Kırmızı kumtaşı ve çakıltaşı katmanları, yükselme ve uzun süreli aşınmayla dik kayalıklara dönüşmüştür. UNESCO alanı Çin'de altı ayrı bölümden oluşur.","en":"Uplift and long-term erosion sculpted red sandstone and conglomerate into steep cliffs. The UNESCO property consists of six separate areas in China.","sourceUrl":"https://whc.unesco.org/en/list/1335/"},  "yellowstone": {"tr":"Bu parkta binlerce jeotermal oluşum vardır. Yer altı ısısı, sıcak su kaynaklarını ve aralıklı püsküren gayzerleri besler.","en":"Thousands of geothermal features occur here. Heat below ground drives hot springs and periodically erupting geysers.","sourceUrl":"https://whc.unesco.org/en/list/28/"},
  "galapagos-islands": {"tr":"Adaların okyanus akıntılarının kesişiminde bulunması, deniz yaşamını zenginleştirir. Uzun süreli yalıtılmışlık, eşsiz kara türlerinin evrimini desteklemiştir.","en":"Meeting ocean currents enrich marine life, while long isolation has helped distinctive land species evolve.","sourceUrl":"https://whc.unesco.org/en/list/1/"},
  "sundarbans-bangladesh": {"tr":"Mangrov kökleri tuzlu ve gelgitli sulara uyum sağlar. Bu orman, Bengal kaplanı ve pek çok kuş türü için önemli bir yaşam alanıdır.","en":"Mangrove roots adapt to salty tidal waters. This forest provides habitat for Bengal tigers and many bird species.","sourceUrl":"https://whc.unesco.org/en/list/798/"},
  "durmitor": {"tr":"Buzulların açtığı vadiler ve karstik kireçtaşı, bu dağlık parkın göllerini ve derin kanyonlarını şekillendirmiştir.","en":"Glacial valleys and karst limestone have shaped this mountain park's lakes and deep river gorges.","sourceUrl":"https://whc.unesco.org/en/list/100/"},
  "air-tenere": {"tr":"Dağların çevresindeki aşırı kurak çöl ortamına rağmen, yüksek kesimlerde farklı bitki toplulukları ve Sahra-Sahel yaban hayatı korunur.","en":"Despite the surrounding arid desert, the higher mountains shelter different plant communities and Saharo-Sahelian wildlife.","sourceUrl":"https://whc.unesco.org/en/list/573/"},
  "te-wahipounamu": {"tr":"Buzullar fiyortları ve sarp vadileri oymuştur. Güney kayınları ve podokarp ormanları, kea gibi yerel kuşlara yaşam alanı sağlar.","en":"Glaciers carved fjords and steep valleys. Southern beech and podocarp forests support native birds such as the kea.","sourceUrl":"https://whc.unesco.org/en/list/551/"},
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
