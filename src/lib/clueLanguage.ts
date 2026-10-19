import type { CountryClueCard } from '@/data/countryClues';
import { COUNTRY_DATA } from '@/data/countries';
import type { Language } from './i18nStrings';
import { localizedCapitalName } from './capitalLanguage';
import { localizedClueFeature } from './clueLandmarks';

// Localised geographic clue cards: one regional clue, one distinguishing
// landmark/cultural clue and one progressively revealing capital clue.
// These are authored factual adaptations, not a request-time machine translation.
// Turkish retains its original hand-curated three clues and learning fact.
type Region='eu'|'eastAsia'|'southAsia'|'southeastAsia'|'centralAsia'|
  'northAfrica'|'westAfrica'|'eastAfrica'|'southAfrica'|
  'northAmerica'|'southAmerica'|'oceania'|'caribbean'|'caucasus'|'europeAsia';
const regions:Record<Language,Record<Region,string>>={
  tr:{eu:'Avrupa',eastAsia:'Doğu Asya',southAsia:'Güney Asya',southeastAsia:'Güneydoğu Asya',centralAsia:'Orta Asya',northAfrica:'Kuzey Afrika',westAfrica:'Batı Afrika',eastAfrica:'Doğu Afrika',southAfrica:'Güney Afrika',northAmerica:'Kuzey Amerika',southAmerica:'Güney Amerika',oceania:'Okyanusya',caribbean:'Karayipler',caucasus:'Kafkasya',europeAsia:'Avrupa ve Asya'},
  en:{eu:'Europe',eastAsia:'East Asia',southAsia:'South Asia',southeastAsia:'Southeast Asia',centralAsia:'Central Asia',northAfrica:'North Africa',westAfrica:'West Africa',eastAfrica:'East Africa',southAfrica:'Southern Africa',northAmerica:'North America',southAmerica:'South America',oceania:'Oceania',caribbean:'the Caribbean',caucasus:'the Caucasus',europeAsia:'Europe and Asia'},
  es:{eu:'Europa',eastAsia:'Asia Oriental',southAsia:'Asia Meridional',southeastAsia:'Sudeste Asiático',centralAsia:'Asia Central',northAfrica:'África del Norte',westAfrica:'África Occidental',eastAfrica:'África Oriental',southAfrica:'África Austral',northAmerica:'América del Norte',southAmerica:'América del Sur',oceania:'Oceanía',caribbean:'el Caribe',caucasus:'el Cáucaso',europeAsia:'Europa y Asia'},
  de:{eu:'Europa',eastAsia:'Ostasien',southAsia:'Südasien',southeastAsia:'Südostasien',centralAsia:'Zentralasien',northAfrica:'Nordafrika',westAfrica:'Westafrika',eastAfrica:'Ostafrika',southAfrica:'das südliche Afrika',northAmerica:'Nordamerika',southAmerica:'Südamerika',oceania:'Ozeanien',caribbean:'der Karibik',caucasus:'dem Kaukasus',europeAsia:'Europa und Asien'},
  fr:{eu:"l'Europe",eastAsia:"l'Asie de l'Est",southAsia:"l'Asie du Sud",southeastAsia:"l'Asie du Sud-Est",centralAsia:"l'Asie centrale",northAfrica:"l'Afrique du Nord",westAfrica:"l'Afrique de l'Ouest",eastAfrica:"l'Afrique de l'Est",southAfrica:"l'Afrique australe",northAmerica:"l'Amérique du Nord",southAmerica:"l'Amérique du Sud",oceania:"l'Océanie",caribbean:"les Caraïbes",caucasus:"le Caucase",europeAsia:"l'Europe et l'Asie"},
  pt:{eu:'Europa',eastAsia:'Ásia Oriental',southAsia:'Ásia Meridional',southeastAsia:'Sudeste Asiático',centralAsia:'Ásia Central',northAfrica:'Norte da África',westAfrica:'África Ocidental',eastAfrica:'África Oriental',southAfrica:'África Austral',northAmerica:'América do Norte',southAmerica:'América do Sul',oceania:'Oceania',caribbean:'Caribe',caucasus:'Cáucaso',europeAsia:'Europa e Ásia'},
  ru:{eu:'Европе',eastAsia:'Восточной Азии',southAsia:'Южной Азии',southeastAsia:'Юго-Восточной Азии',centralAsia:'Центральной Азии',northAfrica:'Северной Африке',westAfrica:'Западной Африке',eastAfrica:'Восточной Африке',southAfrica:'Южной Африке',northAmerica:'Северной Америке',southAmerica:'Южной Америке',oceania:'Океании',caribbean:'Карибском бассейне',caucasus:'Кавказе',europeAsia:'Европе и Азии'},
  zh:{eu:'欧洲',eastAsia:'东亚',southAsia:'南亚',southeastAsia:'东南亚',centralAsia:'中亚',northAfrica:'北非',westAfrica:'西非',eastAfrica:'东非',southAfrica:'非洲南部',northAmerica:'北美洲',southAmerica:'南美洲',oceania:'大洋洲',caribbean:'加勒比地区',caucasus:'高加索地区',europeAsia:'欧洲和亚洲'},
  ja:{eu:'ヨーロッパ',eastAsia:'東アジア',southAsia:'南アジア',southeastAsia:'東南アジア',centralAsia:'中央アジア',northAfrica:'北アフリカ',westAfrica:'西アフリカ',eastAfrica:'東アフリカ',southAfrica:'南部アフリカ',northAmerica:'北アメリカ',southAmerica:'南アメリカ',oceania:'オセアニア',caribbean:'カリブ海地域',caucasus:'コーカサス地域',europeAsia:'ヨーロッパとアジア'}
};
type Signal={region:Region;feature:string};
// Identifiers match the original 63 curated clue-card IDs.
const signals:Record<string,Signal>={
  '792':{region:'europeAsia',feature:'the Bosphorus'},'392':{region:'eastAsia',feature:'Mount Fuji'},
  '076':{region:'southAmerica',feature:'the Amazon rainforest'},'250':{region:'eu',feature:'the Eiffel Tower'},
  '818':{region:'northAfrica',feature:'the Giza pyramids'},'840':{region:'northAmerica',feature:'the Grand Canyon'},
  '036':{region:'oceania',feature:'the Great Barrier Reef'},'124':{region:'northAmerica',feature:'the maple leaf'},
  '380':{region:'eu',feature:'the Colosseum'},'156':{region:'eastAsia',feature:'the Great Wall'},
  '276':{region:'eu',feature:'the Berlin Wall'},'826':{region:'eu',feature:'Big Ben'},
  '356':{region:'southAsia',feature:'the Taj Mahal'},'643':{region:'europeAsia',feature:'Siberia'},
  '724':{region:'eu',feature:'flamenco'},'554':{region:'oceania',feature:'the kiwi bird'},
  '032':{region:'southAmerica',feature:'tango'},'410':{region:'eastAsia',feature:'K-pop'},
  '604':{region:'southAmerica',feature:'Machu Picchu'},'484':{region:'northAmerica',feature:'Maya civilisation'},
  '300':{region:'eu',feature:'the Acropolis'},'504':{region:'northAfrica',feature:'the Atlas Mountains'},
  '578':{region:'eu',feature:'its fjords'},'246':{region:'eu',feature:'sauna culture'},
  '752':{region:'eu',feature:'the Nobel Prize ceremonies'},'372':{region:'eu',feature:'the Emerald Isle'},
  '528':{region:'eu',feature:'windmills and canals'},'756':{region:'eu',feature:'the Alps'},
  '231':{region:'eastAfrica',feature:'the rock-cut churches of Lalibela'},
  '360':{region:'southeastAsia',feature:'Bali'},'404':{region:'eastAfrica',feature:'the Maasai Mara'},
  '268':{region:'caucasus',feature:'the Caucasus Mountains'},'704':{region:'southeastAsia',feature:'Ha Long Bay'},
  '566':{region:'westAfrica',feature:'Lagos'},'858':{region:'southAmerica',feature:'the Río de la Plata'},
  '398':{region:'centralAsia',feature:'vast steppes'},'862':{region:'southAmerica',feature:'Angel Falls'},
  '608':{region:'southeastAsia',feature:'Luzon and Mindanao'},'764':{region:'southeastAsia',feature:'Ayutthaya'},
  '064':{region:'southAsia',feature:'Gross National Happiness'},'072':{region:'southAfrica',feature:'the Okavango Delta'},
  '084':{region:'northAmerica',feature:'the Great Blue Hole'},'096':{region:'southeastAsia',feature:'Borneo'},
  '108':{region:'eastAfrica',feature:'Lake Tanganyika'},'148':{region:'northAfrica',feature:'Lake Chad'},
  '262':{region:'eastAfrica',feature:'the Bab el-Mandeb Strait'},'266':{region:'westAfrica',feature:'equatorial rainforests'},
  '270':{region:'westAfrica',feature:'the Gambia River'},'324':{region:'westAfrica',feature:'the Fouta Djallon highlands'},
  '328':{region:'southAmerica',feature:'Kaieteur Falls'},'426':{region:'southAfrica',feature:'mountainous highlands'},
  '430':{region:'westAfrica',feature:'Monrovia'},'454':{region:'eastAfrica',feature:'Lake Malawi'},
  '466':{region:'westAfrica',feature:'Timbuktu'},'478':{region:'westAfrica',feature:'the Sahara Desert'},
  '508':{region:'eastAfrica',feature:'the Indian Ocean coast'},'516':{region:'southAfrica',feature:'the Namib Desert'},
  '548':{region:'oceania',feature:'volcanic islands'},'562':{region:'westAfrica',feature:'the Niger River'},
  '646':{region:'eastAfrica',feature:'a thousand hills'},'716':{region:'southAfrica',feature:'Great Zimbabwe'},
  '768':{region:'westAfrica',feature:'the Gulf of Guinea'},'780':{region:'caribbean',feature:'Trinidad and Tobago'}
};
const templates:Record<Exclude<Language,'tr'>,{
  region:(name:string)=>string;landmark:(feature:string)=>string;capital:(capital:string)=>string;
  fact:(region:string,feature:string)=>string;
}>={
  en:{region:r=>`This country is in ${r}.`,landmark:f=>`It is known for ${f}.`,capital:c=>`Its capital is ${c}.`,fact:(r,f)=>`Located in ${r}, this country is associated with ${f}.`},
  es:{region:r=>`Este país está en ${r}.`,landmark:f=>`Es conocido por ${f}.`,capital:c=>`Su capital es ${c}.`,fact:(r,f)=>`Este país de ${r} es conocido por ${f}.`},
  de:{region:r=>`Dieses Land liegt in ${r}.`,landmark:f=>`Es ist bekannt für ${f}.`,capital:c=>`Die Hauptstadt ist ${c}.`,fact:(r,f)=>`Dieses Land in ${r} ist für ${f} bekannt.`},
  fr:{region:r=>`Région du monde : ${r}.`,landmark:f=>`Il est connu pour ${f}.`,capital:c=>`Sa capitale est ${c}.`,fact:(r,f)=>`Région : ${r}. Élément célèbre : ${f}.`},
  pt:{region:r=>`Região do mundo: ${r}.`,landmark:f=>`Uma pista importante: ${f}.`,capital:c=>`Sua capital é ${c}.`,fact:(r,f)=>`Região: ${r}. Elemento conhecido: ${f}.`},
  ru:{region:r=>`Эта страна находится в ${r}.`,landmark:f=>`Её отличительная особенность — ${f}.`,capital:c=>`Её столица — ${c}.`,fact:(r,f)=>`Страна расположена в ${r}. Известная особенность — ${f}.`},
  zh:{region:r=>`这个国家位于${r}。`,landmark:f=>`这里以${f}闻名。`,capital:c=>`首都是${c}。`,fact:(r,f)=>`这个位于${r}的国家因${f}而闻名。`},
  ja:{region:r=>`この国は${r}にあります。`,landmark:f=>`${f}で知られています。`,capital:c=>`首都は${c}です。`,fact:(r,f)=>`${r}に位置し、${f}で知られる国です。`}
};

export function localizedClueCard(card:CountryClueCard,language:Language):CountryClueCard{
  if(language==='tr')return card;
  const signal=signals[card.countryId];
  const meta=COUNTRY_DATA[card.countryId];
  if(!signal||!meta)return card; // explicitly audited in test scripts
  const region=regions[language][signal.region], t=templates[language];
  const capital=localizedCapitalName(meta.capitalTr,language);
  const feature=localizedClueFeature(card.countryId,language,signal.feature);
  return {
    ...card,
    clues:[t.region(region),t.landmark(feature),t.capital(capital)],
    fact:t.fact(region,feature)
  };
}
export const localizedClueIds=Object.keys(signals);
