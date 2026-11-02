import { STREET_PLAYABLE_IDS, STREET_PLAYABLE_SOURCE_IDS, COUNTRY_HINTS } from '../server/street/country-mode.mjs';
import { approvedPhotoIds } from '../server/street/photo-ready.mjs';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';

const read = file => readFileSync(resolve(process.cwd(),file),'utf8');
const strings=read('src/lib/i18nStrings.ts');
const jsonStart=strings.indexOf('=',strings.indexOf('export const translations'));
if(jsonStart<0)throw new Error('Locale dictionary not found.');
const catalog=JSON.parse(strings.slice(jsonStart+1).trim().replace(/;\s*$/,''));
const languages=['en','es','de','fr','pt','ru','zh','ja'];
for(const lang of languages)if(!catalog[lang])throw new Error('Missing language: '+lang);
const screens=[
  'StartScreen','QuestionPanel','GameOverScreen','WeeklyLeaderboardScreen','DailyChallengeScreen',
  'ExploreMapScreen','StreetDetectiveScreen','DroneDetectiveScreen','LocationLeaguePanel',
  'StreetPhoto','StreetWorldMap','ReviveScreen','HUD','NotificationSettings'
];
const missingEn=new Set();
const untranslated=[];
for(const screen of screens){
  const src=read('src/components/'+screen+'.tsx');
  for(const match of src.matchAll(/\bt\((['"])(.*?)\1\)/g)){
    const key=match[2];
    if(!catalog.en[key])missingEn.add(screen+': '+key);
  }
}
if(missingEn.size)throw new Error('English fallback missing:\n'+[...missingEn].join('\n'));
const clueSrc=read('src/data/countryClues.ts');
const ids=[...clueSrc.matchAll(/"countryId":\s*"(\d{3})"/g)].map(m=>m[1]);
if(ids.length<63||new Set(ids).size!==ids.length)
  throw new Error('Country clue IDs are missing or duplicated.');
const clues=read('src/lib/clueLanguage.ts');
const coverage=[...clues.matchAll(/'(\d{3})':\{region:/g)].map(m=>m[1]);
if(coverage.length!==ids.length||new Set(coverage).size!==coverage.length||
  coverage.some(id=>!ids.includes(id)))
  throw new Error('Not all '+ids.length+' clue cards are localized.');
const landmarkSrc=read('src/lib/clueLandmarks.ts');
const readArray=name=>{
  const match=landmarkSrc.match(new RegExp('const '+name+'=(\\[[^\\]]+\\]);'));
  if(!match)throw new Error('Missing landmark IDs: '+name);
  return JSON.parse(match[1]);
};
const readNative=name=>{
  const match=landmarkSrc.match(new RegExp('const '+name+':[^=]+=\\s*(\\{[\\s\\S]*?\\});'));
  if(!match)throw new Error('Missing landmark translations: '+name);
  return JSON.parse(match[1]);
};
const baseIds=readArray('ids');
const supplementIds=readArray('supplementalIds');
const baseNative=readNative('native');
const supplementNative=readNative('supplementalNative');
const latestNative=readNative('latestNative');
const landmarkCoverage=new Set([...baseIds,...supplementIds,...Object.keys(latestNative.es||{})]);
if(landmarkCoverage.size!==ids.length||ids.some(id=>!landmarkCoverage.has(id)))
  throw new Error('Landmark translation coverage differs from '+ids.length+' playable clues.');
for(const lang of ['es','de','fr','pt','ru','zh','ja']){
  const base=baseNative[lang]?.split('\n')||[];
  const supplemental=supplementNative[lang]||[];
  const latest=latestNative[lang]||{};
  if(base.length!==baseIds.length||base.some(x=>!x.trim())||
     supplemental.length!==supplementIds.length||supplemental.some(x=>!x.trim())||
     Object.keys(latest).length!==Object.keys(latestNative.es||{}).length||
     Object.values(latest).some(x=>typeof x!=='string'||!x.trim())||
     [...landmarkCoverage].some(id=>!baseIds.includes(id)&&
       !supplementIds.includes(id)&&!latest[id]))
    throw new Error(lang+': incomplete landmark translations.');
}
const streetSource=read('server/street/approved.mjs');
const streetMatch=streetSource.match(/export const approvedPanoramas\s*=\s*(\[[\s\S]*?\]);/);
// Only validate the 37 panorama locations actually selected by the Street loader.
// An additional approved archive photo may exist without being a playable round.
const streetFacts=JSON.parse(streetMatch?.[1]??'[]')
  .filter(row=>row.approved===true && approvedPhotoIds.includes(row.id) &&
    (STREET_PLAYABLE_IDS.has(row.id)||STREET_PLAYABLE_SOURCE_IDS.has(row.sourceId)) &&
    COUNTRY_HINTS[row.country]).map(row=>row.fact);
const droneFacts=[...read('src/data/dronePanoramas.ts').matchAll(/\bfact:\s*'([^'\n]+)'/g)].map(m=>m[1]);
if(streetFacts.length<15||droneFacts.length!==5)throw new Error('Unexpected loader-linked geographic facts.');
for(const fact of [...streetFacts,...droneFacts]){
  for(const language of languages){
    if(!catalog[language][fact])throw new Error(language+': untranslated geographic fact '+fact);
  }
}
console.log((streetFacts.length+droneFacts.length)+'/'+(streetFacts.length+droneFacts.length)+' loader-linked Street and Drone facts localized in all languages.');
for(const lang of languages){
  const count=Object.keys(catalog.en).filter(key=>!!catalog[lang][key]).length;
  if(lang!=='en'&&count<Object.keys(catalog.en).length)untranslated.push(lang+': '+count+'/'+Object.keys(catalog.en).length+' direct interface translations (English fallback otherwise)');
}
console.log('Atlas languages validated:',languages.join(', '),'plus tr');
console.log(ids.length+'/'+ids.length+' mystery countries; 7/7 native landmark label sets; 0 UI strings fall back to Turkish where t() is used');
if(untranslated.length)console.log('Translation coverage: '+untranslated.join(' | '));
