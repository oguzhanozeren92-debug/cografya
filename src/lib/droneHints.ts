import type { Language } from '@/lib/i18nStrings';


/** Drone pilot: three optional hints per round; never reveal city or coordinates. */
export const DRONE_HINT_TOTAL = 3;

export const droneHintCopy: Record<Language, {
  labels: readonly [string,string,string];
  unlock: string;
  maxPoints: string;
  allUsed: string;
  usedLabel: string;
  watchAd: string;
  loadingAd: string;
  adFailed: string;
  preview: string;
  photoGuideLabel: string;
  fourChoices: string;
}> = {
  tr:{labels:['Kıta','Coğrafi özellik','4 ülke seçeneği'],unlock:'İpucunu aç',maxPoints:'En yüksek puan',allUsed:'Bu konumdaki bütün ipuçları açıldı.',usedLabel:'Kullanılan ipuçları',watchAd:"Reklam izle ve ipucunu aç",loadingAd:"Reklam yükleniyor...",adFailed:"Reklam tamamlanmadı veya kullanılamıyor. İpucu açılmadı; tekrar deneyebilirsin.",preview:"Web önizlemesinde reklam gösterilmez.",photoGuideLabel:"Fotoğrafta şunlara dikkat et",fourChoices:"Bu dört ülkeden biri"},
  en:{labels:['Continent','Geography','Four countries'],unlock:'Reveal hint',maxPoints:'Maximum score',allUsed:'All hints for this location are revealed.',usedLabel:'Hints used',watchAd:"Watch an ad to unlock",loadingAd:"Loading rewarded ad...",adFailed:"Ad unavailable or reward not earned. Hint not unlocked; please try again.",preview:"Ads are not displayed in the web preview.",photoGuideLabel:"Look for these details",fourChoices:"One of these four countries"},
  es:{labels:['Continente','Geografía','Cuatro países'],unlock:'Mostrar pista',maxPoints:'Puntuación máxima',allUsed:'Se han mostrado todas las pistas de este lugar.',usedLabel:'Pistas usadas',watchAd:"Ver anuncio para desbloquear",loadingAd:"Cargando anuncio...",adFailed:"El anuncio no está disponible o no se completó. Pista bloqueada.",preview:"En la vista web no se muestran anuncios.",photoGuideLabel:"Observa estos detalles",fourChoices:"Uno de estos cuatro países"},
  de:{labels:['Kontinent','Geografie','Vier Länder'],unlock:'Hinweis anzeigen',maxPoints:'Maximale Punktzahl',allUsed:'Alle Hinweise für diesen Ort sind aufgedeckt.',usedLabel:'Verwendete Hinweise',watchAd:"Werbung ansehen und Tipp freischalten",loadingAd:"Belohnungsanzeige wird geladen...",adFailed:"Werbung nicht verfügbar oder nicht abgeschlossen. Hinweis bleibt gesperrt.",preview:"In der Web-Vorschau gibt es keine Werbung.",photoGuideLabel:"Achte auf diese Merkmale",fourChoices:"Eines dieser vier Länder"},
  fr:{labels:['Continent','Géographie','Quatre pays'],unlock:"Révéler l'indice",maxPoints:'Score maximal',allUsed:'Tous les indices de ce lieu sont dévoilés.',usedLabel:'Indices utilisés',watchAd:"Voir une publicité pour débloquer",loadingAd:"Chargement de la publicité...",adFailed:"Publicité indisponible ou non terminée. Indice non débloqué.",preview:"Aucune publicité dans l’aperçu web.",photoGuideLabel:"Observe ces éléments",fourChoices:"Un de ces quatre pays"},
  pt:{labels:['Continente','Geografia','Quatro países'],unlock:'Revelar dica',maxPoints:'Pontuação máxima',allUsed:'Todas as dicas deste local foram reveladas.',usedLabel:'Dicas usadas',watchAd:"Assista ao anúncio para liberar",loadingAd:"Carregando anúncio...",adFailed:"Anúncio indisponível ou não concluído. Dica não liberada.",preview:"Sem anúncios na prévia da web.",photoGuideLabel:"Observe estes detalhes",fourChoices:"Um destes quatro países"},
  ru:{labels:['Континент','География','Четыре страны'],unlock:'Открыть подсказку',maxPoints:'Максимум очков',allUsed:'Все подсказки для этого места открыты.',usedLabel:'Использовано подсказок',watchAd:"Посмотреть рекламу и открыть подсказку",loadingAd:"Загрузка рекламы...",adFailed:"Реклама недоступна или не досмотрена. Подсказка закрыта.",preview:"В веб-версии реклама не показывается.",photoGuideLabel:"Обрати внимание",fourChoices:"Одна из четырёх стран"},
  zh:{labels:['大洲','地理特征','四个国家'],unlock:'查看提示',maxPoints:'最高得分',allUsed:'已解锁此地点的所有提示。',usedLabel:'已用提示',watchAd:"看广告解锁提示",loadingAd:"正在加载激励广告...",adFailed:"广告不可用或未完成，提示尚未解锁。",preview:"网页预览不播放广告。",photoGuideLabel:"留意这些线索",fourChoices:"以下四个国家之一"},
  ja:{labels:['大陸','地理的特徴','4か国の候補'],unlock:'ヒントを開く',maxPoints:'最高スコア',allUsed:'この場所のヒントはすべて開きました。',usedLabel:'使用したヒント',watchAd:"広告を見てヒントを開く",loadingAd:"広告を読み込み中...",adFailed:"広告が利用できないか完了していません。ヒントは未解除です。",preview:"ウェブ版では広告を表示しません。",photoGuideLabel:"写真の注目ポイント",fourChoices:"この4か国のうちの1つ"},
};

// UN M49 continent/subregion codes; localized with device CLDR names.
const continents:Record<string,string>={
  'air-001':'021', // North America
  'air-002':'142', // Asia / South Caucasus
  'air-003':'150', // Europe
  'air-004':'009', // Oceania
  'air-005':'150', // Europe
};

// The second clue is verified against the existing, geolocated catalogue.
const landscape:Record<string,Record<Language,string>>={
  'air-001':{
    tr:'Bir körfez kıyısındaki sahil kenti.',en:'A coastal city on a gulf.',es:'Una ciudad costera junto a un golfo.',de:'Eine Küstenstadt an einem Golf.',fr:"Une ville côtière au bord d’un golfe.",pt:'Uma cidade costeira junto a um golfo.',ru:'Прибрежный город на берегу залива.',zh:'一座位于海湾沿岸的海滨城市。',ja:'湾に面した海沿いの都市。'
  },
  'air-002':{
    tr:'Güney Kafkasya’da büyük bir kent.',en:'A major city in the South Caucasus.',es:'Una gran ciudad del Cáucaso Sur.',de:'Eine Großstadt im Südkaukasus.',fr:'Une grande ville du Caucase du Sud.',pt:'Uma grande cidade no Cáucaso do Sul.',ru:'Крупный город на Южном Кавказе.',zh:'南高加索地区的一座大城市。',ja:'南コーカサスにある大都市。'
  },
  'air-003':{
    tr:'Orta Avrupa’nın iç kesimlerinde küçük bir yerleşim.',en:'A small settlement inland in Central Europe.',es:'Una pequeña localidad del interior de Europa Central.',de:'Eine kleine Ortschaft im Binnenland Mitteleuropas.',fr:'Une petite localité de l’intérieur de l’Europe centrale.',pt:'Uma pequena localidade no interior da Europa Central.',ru:'Небольшой населённый пункт в глубине Центральной Европы.',zh:'中欧内陆的一座小城镇。',ja:'中央ヨーロッパ内陸部の小さな町。'
  },
  'air-004':{
    tr:'İç kesimlerde bir lagünün yakınında.',en:'Inland, near a lagoon.',es:'En el interior, cerca de una laguna.',de:'Im Landesinneren, nahe einer Lagune.',fr:'À l’intérieur des terres, près d’une lagune.',pt:'No interior, perto de uma lagoa.',ru:'В глубине материка, рядом с лагуной.',zh:'位于内陆，靠近一处潟湖。',ja:'内陸部にあり、ラグーンの近く。'
  },
  'air-005':{
    tr:'Güney sahile yakın, yeşil bir park çevresi.',en:'A green park area near the southern coast.',es:'Un parque verde cerca de la costa sur.',de:'Ein grünes Parkgebiet nahe der Südküste.',fr:'Un parc verdoyant près de la côte sud.',pt:'Uma área de parque verde perto da costa sul.',ru:'Зелёный парк недалеко от южного побережья.',zh:'南部海岸附近的一片绿色公园区域。',ja:'南岸近くの緑豊かな公園周辺。'
  }
};

/** Country suggestions are not the answer: each curated set contains
 * four geographically plausible alternatives, including the target.
 */
const choices:Record<string,readonly [string,string,string,string]>={
  'air-001':['Kanada','Meksika','Amerika Birleşik Devletleri','Küba'],
  'air-002':['Ermenistan','Azerbaycan','Gürcistan','Türkiye'],
  'air-003':['Avusturya','Almanya','İsviçre','Çekya'],
  'air-004':['Avustralya','Yeni Zelanda','Fiji','Papua Yeni Gine'],
  'air-005':['Birleşik Krallık','İrlanda','Fransa','Hollanda'],
};
export function droneHintChoices(id:string):readonly string[]{
  return choices[id] ?? [];
}
/** Never return the answer as a level-three clue. */
export function droneHintText(id:string,level:number,language:Language):string{
  if(level===3)return '';
  if(level===2)return landscape[id]?.[language] ?? '';
  const region=continents[id];
  if(!region)return '';
  try{
    const locale=language==='zh'?'zh-CN':language==='pt'?'pt-BR':language;
    return new Intl.DisplayNames([locale,'en'],{type:'region'}).of(region) ?? region;
  }catch{return region;}
}

/** Photo-specific, answer-neutral guidance for less distinctive panoramas. */
const photoFocus:Record<string,Record<Language,string>>={
  'air-001':{
    tr:'Kıyı çizgisinin biçimi, dağlar ve kent dokusu.',
    en:'The outline of the coast, mountains and city blocks.',
    es:'La forma de la costa, montañas y manzanas urbanas.',
    de:'Küstenverlauf, Berge und Stadtstruktur.',
    fr:'Le tracé de la côte, les montagnes et les quartiers.',
    pt:'O litoral, as montanhas e o desenho das ruas.',
    ru:'Береговая линия, горы и планировка города.',
    zh:'观察海岸线、山脉和街区布局。',
    ja:'海岸線、山並み、街区の並び方。'
  },
  'air-002':{
    tr:'Yoğun şehir yerleşimi, geniş yollar ve uzak manzara.',
    en:'Dense urban blocks, wide roads and the distant skyline.',
    es:'Edificios densos, avenidas amplias y horizonte lejano.',
    de:'Dichte Bebauung, breite Straßen und die Fernsicht.',
    fr:'Des immeubles serrés, de larges routes et l’horizon.',
    pt:'Quarteirões densos, vias largas e o horizonte.',
    ru:'Плотная застройка, широкие улицы и дальний горизонт.',
    zh:'留意密集街区、宽阔道路和远处天际线。',
    ja:'密集した街並み、広い道路、遠景。'
  },
  'air-003':{
    tr:'Büyük yapı çatıları, yol düzeni ve yeşil çevre.',
    en:'Large building roofs, road layout and green surroundings.',
    es:'Techos grandes, distribución vial y entorno verde.',
    de:'Große Gebäudedächer, Straßennetz und grüne Umgebung.',
    fr:'Grands toits, réseau de routes et environnement vert.',
    pt:'Grandes telhados, vias e arredores verdes.',
    ru:'Крупные крыши, сеть дорог и зелёные окрестности.',
    zh:'观察大型屋顶、道路布局和周围绿地。',
    ja:'大きな屋根、道路配置、周囲の緑。'
  },
  'air-004':{
    tr:'Sulak alanın şekli, açık arazi ve yerleşim yoğunluğu.',
    en:'The shape of the wetland, open land and sparse settlement.',
    es:'La forma del humedal, espacios abiertos y casas dispersas.',
    de:'Die Form des Feuchtgebiets, weites Land und lockere Siedlung.',
    fr:'La forme de la zone humide, les terres ouvertes et les maisons.',
    pt:'O formato da área úmida, campos abertos e poucas construções.',
    ru:'Форма водоёма, открытые пространства и редкая застройка.',
    zh:'观察湿地形状、开阔土地和稀疏居民区。',
    ja:'湿地の形、広い土地、まばらな家並み。'
  },
  'air-005':{
    tr:'Yeşil alanlar, küçük yol izleri ve çevredeki yerleşim.',
    en:'Green spaces, small roads and the surrounding settlement.',
    es:'Zonas verdes, caminos pequeños y casas alrededor.',
    de:'Grünflächen, kleine Wege und umliegende Siedlungen.',
    fr:'Espaces verts, petits chemins et habitations proches.',
    pt:'Áreas verdes, vias pequenas e construções próximas.',
    ru:'Зелёные зоны, небольшие дороги и окружающие дома.',
    zh:'观察绿地、小路和周围住宅。',
    ja:'緑地、小道、周辺の集落。'
  },
};
export function dronePhotoFocus(id:string,language:Language):string{
  return photoFocus[id]?.[language]??'';
}

/** Every clue removes a further 20% of the original distance-based reward. */
export function droneHintPoints(basePoints:number,hintCount:number):number{
  const used=Math.min(DRONE_HINT_TOTAL,Math.max(0,Math.trunc(hintCount)));
  return Math.max(0,Math.round(basePoints*(1-0.2*used)));
}
