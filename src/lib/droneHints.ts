import type { Language } from '@/lib/i18nStrings';
import { localizedCountryName } from '@/lib/countryLanguage';

/** Drone pilot: three optional hints per round; never reveal city or coordinates. */
export const DRONE_HINT_TOTAL = 3;
type ClueStage = 1 | 2 | 3;

export const droneHintCopy: Record<Language, {
  labels: readonly [string,string,string];
  unlock: string;
  maxPoints: string;
  allUsed: string;
  usedLabel: string;
}> = {
  tr:{labels:['Kıta','Coğrafi özellik','Ülke'],unlock:'İpucunu aç',maxPoints:'En yüksek puan',allUsed:'Bu konumdaki bütün ipuçları açıldı.',usedLabel:'Kullanılan ipuçları'},
  en:{labels:['Continent','Geography','Country'],unlock:'Reveal hint',maxPoints:'Maximum score',allUsed:'All hints for this location are revealed.',usedLabel:'Hints used'},
  es:{labels:['Continente','Geografía','País'],unlock:'Mostrar pista',maxPoints:'Puntuación máxima',allUsed:'Se han mostrado todas las pistas de este lugar.',usedLabel:'Pistas usadas'},
  de:{labels:['Kontinent','Geografie','Land'],unlock:'Hinweis anzeigen',maxPoints:'Maximale Punktzahl',allUsed:'Alle Hinweise für diesen Ort sind aufgedeckt.',usedLabel:'Verwendete Hinweise'},
  fr:{labels:['Continent','Géographie','Pays'],unlock:"Révéler l'indice",maxPoints:'Score maximal',allUsed:'Tous les indices de ce lieu sont dévoilés.',usedLabel:'Indices utilisés'},
  pt:{labels:['Continente','Geografia','País'],unlock:'Revelar dica',maxPoints:'Pontuação máxima',allUsed:'Todas as dicas deste local foram reveladas.',usedLabel:'Dicas usadas'},
  ru:{labels:['Континент','География','Страна'],unlock:'Открыть подсказку',maxPoints:'Максимум очков',allUsed:'Все подсказки для этого места открыты.',usedLabel:'Использовано подсказок'},
  zh:{labels:['大洲','地理特征','国家'],unlock:'查看提示',maxPoints:'最高得分',allUsed:'已解锁此地点的所有提示。',usedLabel:'已用提示'},
  ja:{labels:['大陸','地理的特徴','国'],unlock:'ヒントを開く',maxPoints:'最高スコア',allUsed:'この場所のヒントはすべて開きました。',usedLabel:'使用したヒント'},
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

/** Uses CLDR instead of hand-translating region names in nine languages. */
export function droneHintText(id:string,country:string,level:ClueStage,language:Language):string{
  if(level===3)return localizedCountryName(country,language);
  if(level===2)return landscape[id]?.[language] ?? '';
  const region=continents[id];
  if(!region)return '';
  try{
    const locale=language==='zh'?'zh-CN':language==='pt'?'pt-BR':language;
    return new Intl.DisplayNames([locale,'en'],{type:'region'}).of(region) ?? region;
  }catch{return region;}
}

/** Every clue removes a further 20% of the original distance-based reward. */
export function droneHintPoints(basePoints:number,hintCount:number):number{
  const used=Math.min(DRONE_HINT_TOTAL,Math.max(0,Math.trunc(hintCount)));
  return Math.max(0,Math.round(basePoints*(1-0.2*used)));
}
