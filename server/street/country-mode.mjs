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
  'Finlandiya':{region:'154',landmark:'Northern lights'},
  'İzlanda':{region:'154',landmark:'Geysers and volcanoes'},
  'Danimarka':{region:'154',landmark:'Little Mermaid statue'},
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
// New outdoor photos are allowed only after their independent JPG files
// and R2 multiresolution tiles are verified and whitelisted server-side.
// Source IDs are editor-reviewed; public photo IDs are randomized on upload.
export const STREET_PLAYABLE_SOURCE_IDS = new Set([
  'de-dresden-tram-002',
  'fi-oulu-winter-street-002',
  'is-rainbow-street-002',
  'dk-copenhagen-tower-002',
  'ca-niagara-falls-002',
  'is-gullfoss-waterfall-002',
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
// The score combines exact-distance accuracy and a correct-country bonus.
// Each hint reduces the total possible points, even if the pin is perfect.
export const STREET_HINT_MAX=4;
export const STREET_HINT_SCORES=Object.freeze([5000,4200,3400,2500,1500]);
export function streetDistancePoints(km) {
  if(!Number.isFinite(km)||km<0)return 0;
  const steps=[[0,4000],[10,3920],[50,3600],[100,3200],[250,2400],
    [500,1440],[1000,480],[2000,80],[3000,0]];
  for(let i=1;i<steps.length;i++){
    const [maxDistance,points]=steps[i];
    if(km<=maxDistance){
      const [minDistance,prior]=steps[i-1];
      return Math.round(prior+(points-prior)*(km-minDistance)/(maxDistance-minDistance));
    }
  }
  return 0;
}
export function scoreStreetGuess(km,correctCountry,hintsUsed) {
  if(!Number.isInteger(hintsUsed)||hintsUsed<0||hintsUsed>STREET_HINT_MAX)
    throw new RangeError('Invalid hintsUsed');
  const distancePoints=streetDistancePoints(km);
  const countryBonus=correctCountry?1000:0;
  const rawPoints=distancePoints+countryBonus;
  const points=Math.round(rawPoints*STREET_HINT_SCORES[hintsUsed]/5000);
  return {distancePoints,countryBonus,rawPoints,points,
    hintPenalty:rawPoints-points,maxPoints:STREET_HINT_SCORES[hintsUsed]};
}
const CONTINENT_BY_SUBREGION=Object.freeze({
  '005':'019','013':'019','021':'019',
  '034':'142','030':'142','035':'142','145':'142',
  '155':'150','039':'150','154':'150',
  '053':'009',
});
export function countryChoices(country,random=Math.random){
  const clue=COUNTRY_HINTS[country];
  if(!clue)return [];
  const thisContinent=CONTINENT_BY_SUBREGION[clue.region];
  const all=Object.keys(COUNTRY_HINTS).filter(name=>name!==country);
  const same=all.filter(name=>CONTINENT_BY_SUBREGION[COUNTRY_HINTS[name].region]===thisContinent);
  const other=all.filter(name=>!same.includes(name));
  const shuffle=items=>{
    for(let i=items.length-1;i>0;i--){
      const j=Math.floor(random()*(i+1));
      [items[i],items[j]]=[items[j],items[i]];
    }
    return items;
  };
  // Similar-country distractors make this a useful late hint, not a giveaway.
  const options=[country,...shuffle(same).slice(0,3)];
  for(const candidate of shuffle(other)){
    if(options.length>=4)break;
    options.push(candidate);
  }
  return shuffle(options);
}
export function clueForCountry(country,level){
  const clue=COUNTRY_HINTS[country];
  if(!clue||!Number.isInteger(level)||level<1||level>STREET_HINT_MAX)
    return null;
  if(level===1)return {kind:'region',value:CONTINENT_BY_SUBREGION[clue.region]};
  if(level===2)return {kind:'region',value:clue.region};
  if(level===3)return {kind:'landmark',value:clue.landmark};
  return {kind:'choices',options:countryChoices(country)};
}
