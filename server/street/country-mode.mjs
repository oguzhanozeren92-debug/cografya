// Curated Atlas Arena Street Detective countries. Hints are country-level,
// not exact coordinates or the street/city name. This avoids unfair pixel hunts.
// UN M49 regions/subregions: use genuinely useful regional clues, not exact cities.
export const COUNTRY_HINTS = Object.freeze({
  'Kamboçya':{region:'035',landmark:'Angkor Wat'},
  'Gürcistan':{region:'145',landmark:'Caucasus Mountains'},
  'Fransa':{region:'155',landmark:'Eiffel Tower'},
  'Almanya':{region:'155',landmark:'Berlin Wall'},
  'Brezilya':{region:'005',landmark:'Amazon rainforest'},
  'Hindistan':{region:'034',landmark:'Taj Mahal'},
  'İspanya':{region:'039',landmark:'Flamenco'},
  'Avusturya':{region:'155',landmark:'The Alps'},
  'Meksika':{region:'013',landmark:'Maya civilisation'},
  'Japonya':{region:'030',landmark:'Mount Fuji'},
  'Arjantin':{region:'005',landmark:'Tango'},
  'Slovenya':{region:'039',landmark:'Lake Bled'},
  'Ermenistan':{region:'145',landmark:'Mount Ararat'},
  'Kanada':{region:'021',landmark:'Maple leaf'},
  'Letonya':{region:'154',landmark:'The Baltic Sea'},
  'Estonya':{region:'154',landmark:'Tallinn Old Town'},
  'Avustralya':{region:'053',landmark:'Great Barrier Reef'},
  'Birleşik Krallık':{region:'154',landmark:'Big Ben'},
});
// Actual verified outdoor images with distinctive architecture or landmarks.
// Interior rooms, generic wooded paths and poorly identifiable vistas are
// deliberately excluded until they can be reviewed and given stronger clues.
export const STREET_PLAYABLE_IDS = new Set([
  'p17db95cc7164cdf7c1d7381b', // Iguazú Falls
  'p1ee3ef069b79c4975487e4a2', // Toledo
  'p2ac0b697dadd01b15d9bc49b', // Zócalo, Mexico City
  'p170b676a9de5baf00d21d20f', // Berlin Mauerpark
  'pe8f29d659ed58c581a19ed8e', // Castle near Vienna
  'p399560d02487c101e36f39aa', // Tbilisi parliament
  'pb3490dc48a61d6d63ee70f50', // Phnom Penh Central Market
  'pf760c7acdb84d7f1c6785433', // Azteca stadium
  'p9e6947f46abdfa9f6a1c3a4f', // Guadalajara historic centre
  'pa7f461cb8a5487e7831f5a46', // Berlin Museum Island
  'p19737b3c805ad373c5e91276', // Soissons cathedral
  'p7c54f9fc2f204373984e4277', // Armenia city balloon panorama
  'pb7be9959b560b4fc45009da6', // Vienna metro with distinctive signage
  'pddeca3721b66132159fb57d2', // Mexican canyon
  'pda3c93f8ee9a53c660c1ff3e', // Brazilian museum
  'p6c1ab10e776c0dbc76f8e9b7', // Slovenia town square
  'p187ca3ed52b211676a4a8492', // Cambodia city neighbourhood
  'p05e431142d98c30cfa048108', // Phnom Penh river confluence
]);
// Easier photos are selected before the harder, smaller-city scenes.
export const STREET_EASY_IDS = new Set([
  'p17db95cc7164cdf7c1d7381b',
  'p1ee3ef069b79c4975487e4a2',
  'p2ac0b697dadd01b15d9bc49b',
  'p170b676a9de5baf00d21d20f',
  'pe8f29d659ed58c581a19ed8e',
  'p399560d02487c101e36f39aa',
  'pb3490dc48a61d6d63ee70f50',
  'pf760c7acdb84d7f1c6785433',
  'pa7f461cb8a5487e7831f5a46',
]);
// All rewards are deterministic on the server: four hints have a descending
// ceiling, but a wrong country never earns points, however close the pin is.
export const STREET_HINT_MAX=4;
export const STREET_HINT_SCORES=Object.freeze([5000,4200,3400,2500,1500]);
export function countryAnswerPoints(correct,hintsUsed){
  if(!Number.isInteger(hintsUsed)||hintsUsed<0||hintsUsed>STREET_HINT_MAX)
    throw new RangeError('Invalid hintsUsed');
  return correct?STREET_HINT_SCORES[hintsUsed]:0;
}
const CONTINENT_BY_SUBREGION=Object.freeze({
  '005':'019','013':'019','021':'019',
  '034':'142','030':'142','035':'142','145':'142',
  '155':'150','039':'150','154':'150',
  '053':'009',
});
const CAPITAL=Object.freeze({
  'Kamboçya':'Phnom Penh','Gürcistan':'Tbilisi','Fransa':'Paris',
  'Almanya':'Berlin','Brezilya':'Brasília','Hindistan':'New Delhi',
  'İspanya':'Madrid','Avusturya':'Vienna','Meksika':'Mexico City',
  'Japonya':'Tokyo','Arjantin':'Buenos Aires','Slovenya':'Ljubljana',
  'Ermenistan':'Yerevan','Kanada':'Ottawa','Letonya':'Riga',
  'Estonya':'Tallinn','Avustralya':'Canberra','Birleşik Krallık':'London',
});
export function clueForCountry(country,level){
  const clue=COUNTRY_HINTS[country];
  if(!clue||!Number.isInteger(level)||level<1||level>STREET_HINT_MAX)
    return null;
  if(level===1)return {kind:'region',value:CONTINENT_BY_SUBREGION[clue.region]};
  if(level===2)return {kind:'region',value:clue.region};
  if(level===3)return {kind:'landmark',value:clue.landmark};
  return {kind:'capital',value:CAPITAL[country]};
}
