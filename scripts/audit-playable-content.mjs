#!/usr/bin/env node
/**
 * Counts ONLY pools used by Globriva's current game loaders.
 * "Playable" here means local source, geometry and static assets pass checks;
 * it is NOT a claim that every remote URL is currently reachable.
 * Remote Commons/R2/Vercel checks belong to scripts/panoramas/audit-archive.mjs.
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import ts from 'typescript';
import { neighbors } from 'topojson-client';
import { approvedPanoramas } from '../server/street/approved.mjs';
import { approvedPhotoIds } from '../server/street/photo-ready.mjs';
import { STREET_PLAYABLE_IDS, STREET_PLAYABLE_SOURCE_IDS, COUNTRY_HINTS } from '../server/street/country-mode.mjs';
import { approvedDroneMedia } from '../server/drone/approved.mjs';
import { readyDronePhotoIds } from '../server/drone/photo-ready.mjs';
import { HISTORY_CASES } from '../server/history/curated.mjs';
import { HISTORY_MEDIUM_CASES } from '../server/history/curated-medium.mjs';
import { HISTORY_EXPANDED_CASES } from '../server/history/curated-expanded.mjs';
import { HISTORY_DETAIL_PHOTOS } from '../server/history/detail-photos.mjs';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const require=createRequire(import.meta.url);
const topo=require('world-atlas/countries-110m.json');
const loadTs=async path=>{
  const source=readFileSync(resolve(root,path),'utf8');
  const result=ts.transpileModule(source,{compilerOptions:{
    target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext,
  }});
  return import('data:text/javascript;base64,'+Buffer.from(result.outputText).toString('base64'));
};
const [countries,clues,geo,flags]=await Promise.all([
  loadTs('src/data/countries.ts'),loadTs('src/data/countryClues.ts'),
  loadTs('src/data/geoDiscoveryModes.ts'),loadTs('src/data/flags.ts'),
]);
const tier=(rows,getLevel)=>Object.fromEntries([1,2,3].map(level=>[
  ['easy','medium','hard'][level-1],rows.filter(row=>getLevel(row)===level).length,
]));
const allCountries=Object.entries(countries.COUNTRY_DATA);
const shapes=topo.objects.countries.geometries;
const normId=x=>String(x).padStart(3,'0');
const shapesById=new Set(shapes.map(x=>normId(x.id)));
const arcs=neighbors(shapes);
const adj=new Map(shapes.map((x,i)=>[normId(x.id),
  new Set((arcs[i]||[]).map(index=>normId(shapes[index].id)))]));
const borderFocus=geo.BORDER_FOCUS.filter(id=>
  shapesById.has(id)&&countries.COUNTRY_DATA[id]&&adj.get(id)?.size);
const playableBorders=(level)=>{
  const target=level===1?borderFocus.slice(0,14):level===2
    ?borderFocus.slice(14,29):borderFocus.slice(29);
  return target.filter(id=>{
    const links=[...(adj.get(id)||[])].filter(x=>countries.COUNTRY_DATA[x]&&shapesById.has(x));
    const non=borderFocus.filter(x=>x!==id&&!adj.get(id)?.has(x));
    return links.length>0&&non.length>=3;
  }).length;
};
const streetReady=new Set(approvedPhotoIds);
const street=approvedPanoramas.filter(row=>row.approved===true &&
  row.mode==='multires' && streetReady.has(row.id) &&
  (STREET_PLAYABLE_IDS.has(row.id)||STREET_PLAYABLE_SOURCE_IDS.has(row.sourceId))&&COUNTRY_HINTS[row.country] &&
  ['f','r','b','l'].every(face=>existsSync(resolve(root,'public/street-photos',row.id,face+'.jpg'))));
const droneReady=new Set(readyDronePhotoIds);
const drone360=approvedDroneMedia.filter(row=>droneReady.has(row.id) &&
  ['f','r','b','l'].every(face=>existsSync(resolve(root,'public/drone-photos',row.id,face+'.jpg'))));
const gallery=JSON.parse(readFileSync(resolve(root,'public/drone-gallery/catalog-v2.json'),'utf8'));
const eligibleAlbums=gallery.collections.filter(album=>album.approved===true&&
  [3,4].includes(album.images?.length) && album.images.every((photo,i)=>
    photo.artist&&photo.license&&photo.source?.startsWith('https://commons.wikimedia.org/wiki/File:') &&
    existsSync(resolve(root,'public/drone-gallery/photos',album.id,
      (i+1)+'.'+(photo.format==='webp'?'webp':'jpg')))));
const allHistory=[...HISTORY_CASES,...HISTORY_MEDIUM_CASES,...HISTORY_EXPANDED_CASES];
const history=allHistory.filter(row=>streetReady.has(row.panoramaId) &&
  row.questions?.length===3 && row.questions.every(q=>
    q.options?.length===4 && Number.isInteger(q.correct) &&
    q.correct>=0&&q.correct<=3));
const countHistoryByDifficulty=Object.fromEntries(['easy','medium'].map(d=>[
  d,history.filter(x=>(x.difficulty||'easy')===d).length,
]));
const islandPlayable=geo.ISLAND_COUNTRIES.filter(x=>shapesById.has(x.id));
const flagsReady=allCountries.filter(([id])=>flags.COUNTRY_FLAG_CODES[id]);
const output={
  date:new Date().toISOString(),
  definition:'Counts reflect current loader eligibility, geometry and repository files. Remote HTTP health is audited separately.',
  main:{countries:allCountries.length,countryByDifficulty:tier(allCountries,([,v])=>v.difficulty),
    capitalQuestions:allCountries.length,flagQuestions:flagsReady.length,
    clueCards:Object.values(clues.COUNTRY_CLUES).length,
    clueByDifficulty:tier(Object.values(clues.COUNTRY_CLUES),x=>x.difficulty)},
  map:{
    nature:geo.NATURE_POINTS.length,natureByDifficulty:tier(geo.NATURE_POINTS,x=>x.level),
    islandCandidates:geo.ISLAND_COUNTRIES.length,islandPlayable:islandPlayable.length,
    islandByDifficulty:tier(islandPlayable,x=>x.level),
    borderCandidates:geo.BORDER_FOCUS.length,
    borderPlayable:Object.fromEntries([1,2,3].map((x,i)=>[['easy','medium','hard'][i],playableBorders(x)])),
  },
  discovery:{
    streetPanoramaLocations:street.length,streetFallbackFaceFiles:street.length*4,
    drone360PilotLocations:drone360.length,drone360FallbackFaceFiles:drone360.length*4,
    droneGalleryLocations:eligibleAlbums.length,
    droneGalleryPhotoFiles:eligibleAlbums.reduce((n,x)=>n+x.images.length,0),
    droneGalleryCountries:new Set(eligibleAlbums.map(x=>x.country)).size,
    pendingGalleryAlbums:gallery.collections.length-eligibleAlbums.length,
    historyLocations:history.length,historyQuestions:history.reduce((n,x)=>n+x.questions.length,0),
    historyByDifficulty:countHistoryByDifficulty,
    historySupplementaryPhotoRecords:HISTORY_DETAIL_PHOTOS.length,
  },
};
console.log(JSON.stringify(output,null,2));
if(process.argv.includes('--strict')){
  const fail=[];
  if(street.length<30)fail.push('street eligible locations < 30');
  if(drone360.length<5)fail.push('drone pilot eligible locations < 5');
  if(eligibleAlbums.length<16)fail.push('gallery eligible albums < 16');
  if(history.length<20)fail.push('history eligible locations < 20');
  if(geo.NATURE_POINTS.length<30)fail.push('nature points < 30');
  if(Object.values(output.map.borderPlayable).some(n=>n<5))fail.push('border tier with < 5 rounds');
  if(fail.length){console.error('CONTENT AUDIT FAILED:',fail.join('; '));process.exitCode=1;}
}
