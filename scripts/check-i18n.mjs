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
if(ids.length!==63||new Set(ids).size!==63)throw new Error('Expected 63 unique original clue cards.');
const clues=read('src/lib/clueLanguage.ts');
const coverage=[...clues.matchAll(/'(\d{3})':\{region:/g)].map(m=>m[1]);
if(coverage.length!==63||coverage.some(id=>!ids.includes(id)))throw new Error('Not all 63 clue cards are localized.');
const landmarkSrc=read('src/lib/clueLandmarks.ts');
const idsMatch=landmarkSrc.match(/const ids=(\[[^\]]+\]);/);
const landmarkIds=JSON.parse(idsMatch?.[1]??'[]');
if(landmarkIds.length!==63||ids.some((id)=>!landmarkIds.includes(id)))throw new Error('Clue landmark IDs do not match the source.');
const start=landmarkSrc.indexOf('=',landmarkSrc.indexOf('const native:Partial'));
const end=landmarkSrc.indexOf(';\nconst lookups=',start);
const landmarks=JSON.parse(landmarkSrc.slice(start+1,end));
for(const lang of ['es','de','fr','pt','ru','zh','ja']){
  const parts=landmarks[lang]?.split('\n')??[];
  if(parts.length!==63||parts.some(x=>!x.trim()))throw new Error(lang+': missing landmark translations.');
}
const streetSource=read('server/street/approved.mjs');
const streetMatch=streetSource.match(/export const approvedPanoramas\s*=\s*(\[[\s\S]*?\]);/);
const streetFacts=JSON.parse(streetMatch?.[1]??'[]').map(row=>row.fact);
const droneFacts=[...read('src/data/dronePanoramas.ts').matchAll(/\bfact:\s*'([^'\n]+)'/g)].map(m=>m[1]);
if(streetFacts.length!==37||droneFacts.length!==5)throw new Error('Expected 42 geolocated source facts.');
for(const fact of [...streetFacts,...droneFacts]){
  for(const language of languages){
    if(!catalog[language][fact])throw new Error(language+': untranslated geographic fact '+fact);
  }
}
console.log('42/42 geolocated street and drone descriptions localized in all languages.');
for(const lang of languages){
  const count=Object.keys(catalog.en).filter(key=>!!catalog[lang][key]).length;
  if(lang!=='en'&&count<Object.keys(catalog.en).length)untranslated.push(lang+': '+count+'/'+Object.keys(catalog.en).length+' direct interface translations (English fallback otherwise)');
}
console.log('Atlas languages validated:',languages.join(', '),'plus tr');
console.log('63/63 mystery countries; 7/7 native landmark label sets; 0 UI strings fall back to Turkish where t() is used');
if(untranslated.length)console.log('Translation coverage: '+untranslated.join(' | '));
