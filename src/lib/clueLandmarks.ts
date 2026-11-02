import type { Language } from './i18nStrings';
// Short, human-readable landmark labels, keyed by the same stable clue-card ID.
// Proper names remain recognisable internationally.
const ids=["792","392","076","250","818","840","036","124","380","156","276","826","356","643","724","554","032","410","604","484","300","504","578","246","752","372","528","756","231","360","404","268","704","566","858","398","862","608","764","064","072","084","096","108","148","262","266","270","324","328","426","430","454","466","478","508","516","548","562","646","716","768","780"];
const native:Partial<Record<Language,string>>={"es":"el Bósforo\nel monte Fuji\nla selva amazónica\nla Torre Eiffel\nlas pirámides de Guiza\nel Gran Cañón\nla Gran Barrera de Coral\nla hoja de arce\nel Coliseo\nla Gran Muralla\nel Muro de Berlín\nel Big Ben\nel Taj Mahal\nSiberia\nel flamenco\nel ave kiwi\nel tango\nel K-pop\nMachu Picchu\nla civilización maya\nla Acrópolis\nlas montañas del Atlas\nsus fiordos\nla tradición de la sauna\nlos premios Nobel\nla Isla Esmeralda\nlos molinos y los canales\nlos Alpes\nlas iglesias excavadas en roca de Lalibela\nBali\nMasái Mara\nlas montañas del Cáucaso\nla bahía de Ha Long\nLagos\nel Río de la Plata\nlas enormes estepas\nel Salto Ángel\nLuzón y Mindanao\nAyutthaya\nla Felicidad Nacional Bruta\nel delta del Okavango\nel Gran Agujero Azul\nla isla de Borneo\nel lago Tanganica\nel lago Chad\nel estrecho de Bab el-Mandeb\nlas selvas ecuatoriales\nel río Gambia\nlas montañas de Futa Yallon\nlas cataratas Kaieteur\nsus tierras altas montañosas\nMonrovia\nel lago Malaui\nTombuctú\nel desierto del Sáhara\nsu costa del océano Índico\nel desierto del Namib\nsus islas volcánicas\nel río Níger\nla Tierra de las Mil Colinas\nel Gran Zimbabue\nel golfo de Guinea\nTrinidad y Tobago","de":"den Bosporus\nden Fuji\nden Amazonas-Regenwald\nden Eiffelturm\ndie Pyramiden von Gizeh\nden Grand Canyon\ndas Great Barrier Reef\ndas Ahornblatt\ndas Kolosseum\ndie Chinesische Mauer\ndie Berliner Mauer\nBig Ben\ndas Taj Mahal\nSibirien\nden Flamenco\nden Kiwi-Vogel\nden Tango\nK-Pop\nMachu Picchu\ndie Maya-Kultur\ndie Akropolis\ndas Atlasgebirge\nseine Fjorde\ndie Saunakultur\ndie Nobelpreisverleihungen\ndie Grüne Insel\nWindmühlen und Kanäle\ndie Alpen\ndie Felsenkirchen von Lalibela\nBali\ndie Masai Mara\ndas Kaukasusgebirge\ndie Ha-Long-Bucht\nLagos\nden Río de la Plata\nweite Steppen\nden Salto Ángel\nLuzon und Mindanao\nAyutthaya\ndas Bruttonationalglück\ndas Okavangodelta\ndas Great Blue Hole\ndie Insel Borneo\nden Tanganjikasee\nden Tschadsee\ndie Meerenge Bab al-Mandab\näquatoriale Regenwälder\nden Gambia-Fluss\ndas Fouta-Djallon-Hochland\ndie Kaieteur-Fälle\nsein Bergland\nMonrovia\nden Malawisee\nTimbuktu\ndie Sahara\ndie Küste am Indischen Ozean\ndie Namibwüste\nseine Vulkaninseln\nden Niger\ndas Land der tausend Hügel\nGroß-Simbabwe\nden Golf von Guinea\nTrinidad und Tobago","fr":"le Bosphore\nle mont Fuji\nla forêt amazonienne\nla tour Eiffel\nles pyramides de Gizeh\nle Grand Canyon\nla Grande Barrière de corail\nla feuille d'érable\nle Colisée\nla Grande Muraille\nle mur de Berlin\nBig Ben\nle Taj Mahal\nla Sibérie\nle flamenco\nle kiwi\nle tango\nla K-pop\nle Machu Picchu\nla civilisation maya\nl'Acropole\nles montagnes de l'Atlas\nses fjords\nla culture du sauna\nles prix Nobel\nl'île d'Émeraude\nles moulins et les canaux\nles Alpes\nles églises rupestres de Lalibela\nBali\nle Masaï Mara\nle Caucase\nla baie d'Ha Long\nLagos\nle Río de la Plata\nses vastes steppes\nle Salto Ángel\nLuçon et Mindanao\nAyutthaya\nle bonheur national brut\nle delta de l'Okavango\nle Grand Trou Bleu\nl'île de Bornéo\nle lac Tanganyika\nle lac Tchad\nle détroit de Bab-el-Mandeb\nses forêts équatoriales\nle fleuve Gambie\nles hauteurs du Fouta-Djalon\nles chutes Kaieteur\nses hautes terres montagneuses\nMonrovia\nle lac Malawi\nTombouctou\nle désert du Sahara\nsa côte sur l'océan Indien\nle désert du Namib\nses îles volcaniques\nle fleuve Niger\nle pays des mille collines\nle Grand Zimbabwe\nle golfe de Guinée\nTrinité-et-Tobago","pt":"o Bósforo\no monte Fuji\na Floresta Amazônica\na Torre Eiffel\nas pirâmides de Gizé\no Grand Canyon\na Grande Barreira de Corais\na folha de bordo\no Coliseu\na Grande Muralha\no Muro de Berlim\no Big Ben\no Taj Mahal\na Sibéria\no flamenco\na ave kiwi\no tango\no K-pop\nMachu Picchu\na civilização maia\na Acrópole\nas montanhas do Atlas\nseus fiordes\na cultura da sauna\nos prêmios Nobel\na Ilha Esmeralda\nmoinhos de vento e canais\nos Alpes\nas igrejas de pedra de Lalibela\nBali\na reserva Masai Mara\nas montanhas do Cáucaso\na baía de Ha Long\nLagos\no Río de la Plata\nas vastas estepes\no Salto Ángel\nLuzon e Mindanao\nAyutthaya\na Felicidade Interna Bruta\no delta do Okavango\no Grande Buraco Azul\na ilha de Bornéu\no lago Tanganica\no lago Chade\no estreito de Bab el-Mandeb\nas florestas equatoriais\no rio Gâmbia\nas montanhas de Futa Jalom\nas cataratas Kaieteur\nas terras altas montanhosas\nMonróvia\no lago Maláui\nTimbuktu\no deserto do Saara\na costa do oceano Índico\no deserto do Namibe\nilhas vulcânicas\no rio Níger\na Terra das Mil Colinas\no Grande Zimbábue\no golfo da Guiné\nTrinidad e Tobago","ru":"Босфор\nгора Фудзи\nтропические леса Амазонии\nЭйфелева башня\nпирамиды Гизы\nГранд-Каньон\nБольшой Барьерный риф\nкленовый лист\nКолизей\nВеликая Китайская стена\nБерлинская стена\nБиг-Бен\nТадж-Махал\nСибирь\nфламенко\nптица киви\nтанго\nкей-поп\nМачу-Пикчу\nцивилизация майя\nАкрополь\nАтласские горы\nфьорды\nсауны\nНобелевские премии\nИзумрудный остров\nмельницы и каналы\nАльпы\nскальные церкви Лалибэлы\nБали\nМасаи-Мара\nКавказские горы\nбухта Халонг\nЛагос\nЛа-Плата\nширокие степи\nводопад Анхель\nЛусон и Минданао\nАюттхая\nваловое национальное счастье\nдельта Окаванго\nБольшая голубая дыра\nостров Борнео\nозеро Танганьика\nозеро Чад\nпролив Баб-эль-Мандеб\nэкваториальные леса\nрека Гамбия\nнагорье Фута-Джаллон\nводопад Кайетур\nгорные нагорья\nМонровия\nозеро Малави\nТимбукту\nпустыня Сахара\nпобережье Индийского океана\nпустыня Намиб\nвулканические острова\nрека Нигер\nСтрана тысячи холмов\nБольшой Зимбабве\nГвинейский залив\nТринидад и Тобаго","zh":"博斯普鲁斯海峡\n富士山\n亚马孙雨林\n埃菲尔铁塔\n吉萨金字塔\n大峡谷\n大堡礁\n枫叶\n罗马斗兽场\n万里长城\n柏林墙\n大本钟\n泰姬陵\n西伯利亚\n弗拉门戈\n几维鸟\n探戈\n韩国流行音乐\n马丘比丘\n玛雅文明\n雅典卫城\n阿特拉斯山脉\n峡湾\n桑拿文化\n诺贝尔奖\n翡翠岛\n风车和运河\n阿尔卑斯山\n拉利贝拉岩石教堂\n巴厘岛\n马赛马拉\n高加索山脉\n下龙湾\n拉各斯\n拉普拉塔河口\n广阔的草原\n安赫尔瀑布\n吕宋岛和棉兰老岛\n大城府\n国民幸福总值\n奥卡万戈三角洲\n大蓝洞\n婆罗洲\n坦噶尼喀湖\n乍得湖\n曼德海峡\n赤道雨林\n冈比亚河\n富塔贾隆高地\n凯厄图尔瀑布\n高山地区\n蒙罗维亚\n马拉维湖\n廷巴克图\n撒哈拉沙漠\n印度洋海岸\n纳米布沙漠\n火山岛屿\n尼日尔河\n千丘之国\n大津巴布韦遗址\n几内亚湾\n特立尼达和多巴哥","ja":"ボスポラス海峡\n富士山\nアマゾンの熱帯雨林\nエッフェル塔\nギザのピラミッド\nグランドキャニオン\nグレートバリアリーフ\nカエデの葉\nコロッセオ\n万里の長城\nベルリンの壁\nビッグ・ベン\nタージ・マハル\nシベリア\nフラメンコ\nキーウィ\nタンゴ\nK-POP\nマチュピチュ\nマヤ文明\nアクロポリス\nアトラス山脈\nフィヨルド\nサウナ文化\nノーベル賞\nエメラルドの島\n風車と運河\nアルプス山脈\nラリベラの岩窟教会\nバリ島\nマサイマラ\nコーカサス山脈\nハロン湾\nラゴス\nラプラタ川\n広大な草原\nエンジェルフォール\nルソン島とミンダナオ島\nアユタヤ\n国民総幸福量\nオカバンゴ・デルタ\nグレート・ブルー・ホール\nボルネオ島\nタンガニーカ湖\nチャド湖\nバブ・エル・マンデブ海峡\n赤道の熱帯雨林\nガンビア川\nフータ・ジャロン高地\nカイエトゥール滝\n山岳高原\nモンロビア\nマラウイ湖\nトンブクトゥ\nサハラ砂漠\nインド洋沿岸\nナミブ砂漠\n火山島\nニジェール川\n千の丘の国\nグレート・ジンバブエ\nギニア湾\nトリニダード・トバゴ"};
const lookups=Object.fromEntries(Object.entries(native).map(([lang,raw])=>
  [lang,Object.fromEntries(ids.map((id,i)=>[id,raw.split('\n')[i]]))])
) as Partial<Record<Language,Record<string,string>>>;

// Localized landmarks for 21 additional country clues (2026-10-24 onward).
const supplementalIds=["152","170","192","218","050","450","834","418","242","620","191","710","188","524","352","598","417","894","040","400","024"];
const supplementalNative:Partial<Record<Language,string[]>>={
  "es": [
    "el desierto de Atacama",
    "las regiones cafeteras andinas",
    "Sierra Maestra",
    "las islas Galápagos",
    "los Sundarbans",
    "los lémures y baobabs",
    "el monte Kilimanjaro",
    "el río Mekong",
    "Viti Levu y Vanua Levu",
    "las Azores y Madeira",
    "la costa dálmata",
    "la Montaña de la Mesa",
    "los bosques nubosos",
    "el Himalaya",
    "las fuentes geotérmicas",
    "las tierras altas tropicales",
    "el lago Issyk-Kul",
    "las cataratas Victoria",
    "el centro histórico de Viena",
    "Petra",
    "Mbanza Kongo"
  ],
  "de": [
    "die Atacama-Wüste",
    "die Kaffeeanbaugebiete der Anden",
    "die Sierra Maestra",
    "die Galápagosinseln",
    "die Sundarbans",
    "Lemuren und Baobabs",
    "den Kilimandscharo",
    "den Mekong",
    "Viti Levu und Vanua Levu",
    "die Azoren und Madeira",
    "die dalmatinische Küste",
    "den Tafelberg",
    "Nebelwälder",
    "den Himalaya",
    "geothermische Quellen",
    "tropisches Hochland",
    "den Yssykköl",
    "die Victoriafälle",
    "die Altstadt von Wien",
    "Petra",
    "Mbanza Kongo"
  ],
  "fr": [
    "le désert d'Atacama",
    "les régions caféières des Andes",
    "la Sierra Maestra",
    "les îles Galápagos",
    "les Sundarbans",
    "les lémuriens et les baobabs",
    "le Kilimandjaro",
    "le Mékong",
    "Viti Levu et Vanua Levu",
    "les Açores et Madère",
    "la côte dalmate",
    "la montagne de la Table",
    "les forêts de nuages",
    "l'Himalaya",
    "les sources géothermiques",
    "les hauts plateaux tropicaux",
    "le lac Issyk-Koul",
    "les chutes Victoria",
    "le centre historique de Vienne",
    "Pétra",
    "Mbanza Kongo"
  ],
  "pt": [
    "o deserto do Atacama",
    "as regiões cafeeiras dos Andes",
    "a Sierra Maestra",
    "as ilhas Galápagos",
    "os Sundarbans",
    "os lêmures e baobás",
    "o monte Kilimanjaro",
    "o rio Mekong",
    "Viti Levu e Vanua Levu",
    "os Açores e a Madeira",
    "a costa da Dalmácia",
    "a Montanha da Mesa",
    "as florestas nubladas",
    "o Himalaia",
    "as fontes geotérmicas",
    "as terras altas tropicais",
    "o lago Issyk-Kul",
    "as Cataratas Vitória",
    "o centro histórico de Viena",
    "Petra",
    "Mbanza Kongo"
  ],
  "ru": [
    "пустыней Атакама",
    "кофейными районами Анд",
    "горами Сьерра-Маэстра",
    "Галапагосскими островами",
    "Сундарбаном",
    "лемурами и баобабами",
    "горой Килиманджаро",
    "рекой Меконг",
    "островами Вити-Леву и Вануа-Леву",
    "Азорскими островами и Мадейрой",
    "далматинским побережьем",
    "Столовой горой",
    "облачными лесами",
    "Гималаями",
    "геотермальными источниками",
    "тропическими нагорьями",
    "озером Иссык-Куль",
    "водопадом Виктория",
    "историческим центром Вены",
    "Петрой",
    "Мбанза-Конго"
  ],
  "zh": [
    "阿塔卡马沙漠",
    "安第斯山脉咖啡产区",
    "马埃斯特腊山脉",
    "加拉帕戈斯群岛",
    "孙德尔本斯红树林",
    "狐猴和猴面包树",
    "乞力马扎罗山",
    "湄公河",
    "维提岛和瓦努阿岛",
    "亚速尔群岛和马德拉岛",
    "达尔马提亚海岸",
    "桌山",
    "云雾森林",
    "喜马拉雅山脉",
    "地热温泉",
    "热带高地",
    "伊塞克湖",
    "维多利亚瀑布",
    "维也纳历史中心",
    "佩特拉古城",
    "姆班扎刚果"
  ],
  "ja": [
    "アタカマ砂漠",
    "アンデスのコーヒー産地",
    "シエラ・マエストラ山脈",
    "ガラパゴス諸島",
    "スンダルバンス",
    "キツネザルとバオバブ",
    "キリマンジャロ山",
    "メコン川",
    "ビティレブ島とバヌアレブ島",
    "アゾレス諸島とマデイラ島",
    "ダルマチア海岸",
    "テーブルマウンテン",
    "雲霧林",
    "ヒマラヤ山脈",
    "地熱温泉",
    "熱帯高地",
    "イシク・クル湖",
    "ビクトリアの滝",
    "ウィーン歴史地区",
    "ペトラ遺跡",
    "ムバンザ・コンゴ"
  ]
};
const supplemental=Object.fromEntries(Object.entries(supplementalNative).map(([language,labels])=>
  [language,Object.fromEntries(supplementalIds.map((id,i)=>[id,labels[i]]))]
)) as Partial<Record<Language,Record<string,string>>>;


// Localised feature names for the 31 October 2026 source-backed clues.
const latestNative:Partial<Record<Language,Record<string,string>>> = {
  "es": {
    "203": "el puente de Carlos de Praga",
    "512": "el comercio histórico del incienso",
    "762": "las montañas del Pamir",
    "144": "la fortaleza rocosa de Sigiriya",
    "204": "los palacios reales de Abomey",
    "686": "la isla de Gorée",
    "100": "el humedal de Srebarna y los pelícanos dálmatas",
    "496": "la cuenca del lago Uvs Nuur",
    "626": "el parque nacional Nino Konis Santana"
  },
  "de": {
    "203": "die Karlsbrücke in Prag",
    "512": "den historischen Weihrauchhandel",
    "762": "das Pamirgebirge",
    "144": "die Felsenfestung Sigiriya",
    "204": "die Königspaläste von Abomey",
    "686": "die Insel Gorée",
    "100": "das Srebarna-Feuchtgebiet und Krauskopfpelikane",
    "496": "das Uvs-Nuur-Becken",
    "626": "den Nationalpark Nino Konis Santana"
  },
  "fr": {
    "203": "le pont Charles de Prague",
    "512": "le commerce historique de l'encens",
    "762": "les montagnes du Pamir",
    "144": "la forteresse rocheuse de Sigiriya",
    "204": "les palais royaux d'Abomey",
    "686": "l'île de Gorée",
    "100": "la zone humide de Srebarna et les pélicans frisés",
    "496": "le bassin du lac Uvs Nuur",
    "626": "le parc national Nino Konis Santana"
  },
  "pt": {
    "203": "a Ponte Carlos em Praga",
    "512": "o comércio histórico do incenso",
    "762": "as montanhas do Pamir",
    "144": "a fortaleza rochosa de Sigiriya",
    "204": "os palácios reais de Abomey",
    "686": "a ilha de Gorée",
    "100": "a zona úmida de Srebarna e os pelicanos-crespos",
    "496": "a bacia do lago Uvs Nuur",
    "626": "o Parque Nacional Nino Konis Santana"
  },
  "ru": {
    "203": "Карловым мостом в Праге",
    "512": "исторической торговлей ладаном",
    "762": "Памирскими горами",
    "144": "скальную крепость Сигирия",
    "204": "королевские дворцы Абомея",
    "686": "остров Горе",
    "100": "водно-болотными угодьями Сребырна и кудрявыми пеликанами",
    "496": "бассейном озера Увс-Нуур",
    "626": "национальным парком Нину Кониш Сантана"
  },
  "zh": {
    "203": "布拉格查理大桥",
    "512": "古代乳香贸易",
    "762": "帕米尔高原",
    "144": "锡吉里耶岩石堡垒",
    "204": "阿波美王宫",
    "686": "戈雷岛",
    "100": "斯雷伯尔纳湿地与卷羽鹈鹕",
    "496": "乌布苏湖盆地",
    "626": "尼诺·科尼斯·桑塔纳国家公园"
  },
  "ja": {
    "203": "プラハのカレル橋",
    "512": "歴史的な乳香交易",
    "762": "パミール高原",
    "144": "シーギリヤの岩上要塞",
    "204": "アボメイの王宮群",
    "686": "ゴレ島",
    "100": "スレバルナ湿地とハイイロペリカン",
    "496": "ウヴス・ヌール盆地",
    "626": "ニノ・コニス・サンタナ国立公園"
  }
};

export function localizedClueFeature(id:string,language:Language,english:string):string{
  return latestNative[language]?.[id]??supplemental[language]?.[id]??lookups[language]?.[id]??english;
}
