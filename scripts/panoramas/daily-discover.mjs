#!/usr/bin/env node
/**
 * Globriva daily, incremental photo discovery.
 * Sources: Wikimedia Commons with verified free-license metadata and geotags.
 * Output: persistent deduplicated review queue + each day's report.
 * NOTE: candidate != approved/ready/installed. Quality and place review required.
 * Schedule is owned by .github/workflows/photo-archive-quality.yml.
 */
import {readFileSync,mkdirSync,writeFileSync,existsSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {approvedPanoramas} from '../../server/street/approved.mjs';

const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),'../..');
const STATE=resolve(ROOT,'panoramas/daily-discovery/state.json');
const QUEUE=resolve(ROOT,'panoramas/daily-discovery/pending.json');
const LATEST=resolve(ROOT,'panoramas/daily-discovery/latest.json');
const gallery=JSON.parse(readFileSync(resolve(ROOT,'panoramas/drone-gallery-candidates.json'),'utf8'));
const existing=new Set([
  ...gallery.collections.flatMap(a=>a.images.map(p=>p.sourceTitle)),
  ...approvedPanoramas.map(p=>p.source?.split('/wiki/').pop()).filter(Boolean),
].map(s=>decodeURIComponent(s).replaceAll('_',' ').toLowerCase().replace(/^file:/,'')));
const all=[
  ['Lüksemburg','Luxembourg',49.611,6.131,'Europe'],
  ['Belçika','Bruges',51.209,3.224,'Europe'],
  ['Hollanda','Amsterdam',52.373,4.893,'Europe'],
  ['Andorra','Andorra la Vella',42.507,1.522,'Europe'],
  ['Malta','Valletta',35.899,14.514,'Europe'],
  ['Slovenya','Ljubljana',46.056,14.506,'Europe'],
  ['Karadağ','Kotor',42.424,18.771,'Europe'],
  ['Estonya','Tallinn',59.437,24.754,'Europe'],
  ['Letonya','Riga',56.95,24.105,'Europe'],
  ['Kuzey Makedonya','Skopje',41.998,21.426,'Europe'],
  ['Arnavutluk','Tirana',41.327,19.818,'Europe'],
  ['Bosna-Hersek','Sarajevo',43.857,18.413,'Europe'],
  ['Portekiz','Lisbon',38.716,-9.139,'Europe'],
  ['İspanya','Barcelona',41.386,2.17,'Europe'],
  ['İtalya','Venice',45.44,12.334,'Europe'],
  ['Yunanistan','Athens',37.984,23.727,'Europe'],
  ['Polonya','Krakow',50.062,19.938,'Europe'],
  ['Avusturya','Vienna',48.208,16.373,'Europe'],
  ['İsviçre','Bern',46.948,7.447,'Europe'],
  ['Çekya','Prague',50.087,14.42,'Europe'],
  ['Fransa','Paris',48.858,2.294,'Europe'],
  ['İrlanda','Dublin',53.349,-6.26,'Europe'],
  ['İsveç','Stockholm',59.329,18.068,'Europe'],
  ['Norveç','Bergen',60.392,5.324,'Europe'],
  ['Finlandiya','Helsinki',60.17,24.942,'Europe'],
  ['İzlanda','Reykjavik',64.147,-21.941,'Europe'],
  ['Türkiye','Istanbul',41.009,28.978,'Europe'],
  ['Gürcistan','Tbilisi',41.694,44.801,'Asia'],
  ['Ermenistan','Yerevan',40.179,44.5,'Asia'],
  ['Japonya','Tokyo',35.682,139.759,'Asia'],
  ['Güney Kore','Seoul',37.566,126.978,'Asia'],
  ['Tayland','Bangkok',13.753,100.502,'Asia'],
  ['Hindistan','Jaipur',26.913,75.787,'Asia'],
  ['Vietnam','Hanoi',21.028,105.855,'Asia'],
  ['Endonezya','Bali',-8.409,115.188,'Asia'],
  ['Kamboçya','Phnom Penh',11.556,104.928,'Asia'],
  ['Fas','Marrakesh',31.629,-7.989,'Africa'],
  ['Mısır','Cairo',30.044,31.236,'Africa'],
  ['Güney Afrika','Cape Town',-33.925,18.424,'Africa'],
  ['Kenya','Nairobi',-1.289,36.822,'Africa'],
  ['Tanzanya','Zanzibar',-6.164,39.199,'Africa'],
  ['Meksika','Mexico City',19.432,-99.133,'America'],
  ['ABD','New York City',40.712,-74.005,'America'],
  ['Kanada','Toronto',43.653,-79.383,'America'],
  ['Brezilya','Rio de Janeiro',-22.906,-43.172,'America'],
  ['Arjantin','Buenos Aires',-34.604,-58.381,'America'],
  ['Peru','Cusco',-13.516,-71.978,'America'],
  ['Kolombiya','Cartagena',10.391,-75.479,'America'],
  ['Avustralya','Sydney',-33.859,151.207,'Oceania'],
  ['Yeni Zelanda','Wellington',-41.287,174.776,'Oceania'],
];
const date=process.env.GLOBRIVA_DISCOVERY_DATE || new Date().toISOString().slice(0,10);
if(!/^\d{4}-\d{2}-\d{2}$/.test(date))throw new Error('Invalid date');
const days=Math.floor(Date.parse(date+'T00:00:00Z')/86400000);
const offset=((days%7)+7)%7;
// Rotate research through underserved world regions instead of Europe's index-heavy list.
const coveragePlan=JSON.parse(readFileSync(resolve(ROOT,'data/globriva-world-coverage-plan.json'),'utf8'));
if(coveragePlan.version!==1||coveragePlan.candidates?.length!==20)throw new Error('Missing 20-location world coverage plan');
const continentByRegion={'Africa':'Africa','South America':'America','East Asia':'Asia',
 'Southeast Asia':'Asia','South Asia':'Asia','West Asia':'Asia','Oceania':'Oceania'};
const priorities=coveragePlan.policy.regionsPriority.map((region,index)=>{
 const group=coveragePlan.candidates.filter(x=>x.region===region);
 if(!group.length)throw new Error('Empty region: '+region);
 const row=group[(days+index*13)%group.length];
 return [row.country,row.city,row.lat,row.lng,continentByRegion[region],region];
});
const europe=all.filter(row=>row[4]==='Europe');
const northAmerica=all.filter(row=>row[4]==='America'&&['ABD','Kanada','Meksika'].includes(row[0]));
const targets=[...priorities,europe[days%europe.length],northAmerica[(days+3)%northAmerica.length]];
// Nine searches/day: seven underserved regions + Europe + North America.
if(targets.length!==9||new Set(targets.map(x=>x[1])).size!==9)throw new Error('World scan target collision');
const baseState=existsSync(STATE)?JSON.parse(readFileSync(STATE,'utf8')):{version:1,seen:[],totalNew:0};
const seen=new Set(baseState.seen??[]);
const back=existsSync(QUEUE)?JSON.parse(readFileSync(QUEUE,'utf8')):{version:1,pending:[]};
const pending=back.pending??[];
const now=new Date().toISOString();
const ALLOWED=new Set(['CC BY 2.0','CC BY 3.0','CC BY 4.0','CC BY-SA 2.0',
  'CC BY-SA 3.0','CC BY-SA 4.0','CC0','Public domain']);
const hash=title=>createHash('sha256').update(title.replaceAll('_',' ').toLowerCase()).digest('hex').slice(0,24);
const tidy=s=>String(s||'').replace(/<[^>]*>/g,'').replace(/&amp;/g,'&').trim().slice(0,240);
const newRows=[],warnings=[],stats=[];
function kmBetween(lat1,lon1,lat2,lon2){
 const d=Math.PI/180;const a=Math.sin((lat2-lat1)*d/2)**2+
   Math.cos(lat1*d)*Math.cos(lat2*d)*Math.sin((lon2-lon1)*d/2)**2;
 return 12742*Math.asin(Math.sqrt(Math.max(0,Math.min(1,a))));
}
async function search(target){
 const [country,city,lat,lng,continent,priorityRegion]=target;
 const params=new URLSearchParams({
  action:'query',format:'json',generator:'geosearch',ggscoord:lat+'|'+lng,
  ggsradius:'10000',ggsnamespace:'6',ggslimit:'50',
  prop:'imageinfo|coordinates',iiprop:'url|size|extmetadata',iiurlwidth:'480',
  colimit:'50',
 });
 const resp=await fetch('https://commons.wikimedia.org/w/api.php?'+params,{
  headers:{'User-Agent':'Globriva-GeoPhotoResearch/1.0 (https://github.com/oguzhanozeren92-debug/cografya)'},
  signal:AbortSignal.timeout(18000),
 });
 if(!resp.ok)throw new Error('Wikimedia '+resp.status);
 const data=await resp.json();
 const rows=[];
 for(const page of Object.values(data.query?.pages??{})){
  const info=page.imageinfo?.[0],co=page.coordinates?.[0];
  if(!info||!co||!/\.jpe?g$/i.test(page.title))continue;
  const license=tidy(info.extmetadata?.LicenseShortName?.value);
  const author=tidy(info.extmetadata?.Artist?.value);
  if(!ALLOWED.has(license)||!author||!info.url?.startsWith('https://upload.wikimedia.org/'))continue;
  const w=info.width,h=info.height;
  if(w<1600||h<850||w/h<1.25||w/h>3.1)continue;
  if(!Number.isFinite(co.lat)||!Number.isFinite(co.lon)||kmBetween(lat,lng,co.lat,co.lon)>12)continue;
  const pano=w>=3500&&h>=1750&&Math.abs(w/h-2)<.085;
  const title=page.title.replace(/^File:/,'').replaceAll('_',' ').toLowerCase();
  if(existing.has(title))continue;
  const item={
   key:hash(page.title),title:page.title,source:info.descriptionurl,
   originalUrl:info.url,thumbnailUrl:info.thumburl??null,
   countrySearchHint:country,citySearchHint:city,continent,priorityRegion:priorityRegion||continent,
   sourceCoordinates:{lat:co.lat,lng:co.lon},sourceDistanceKm:Math.round(kmBetween(lat,lng,co.lat,co.lon)*10)/10,
   photographer:author,license,licenseUrl:info.extmetadata?.LicenseUrl?.value?.replace(/<[^>]*>/g,'')??null,
   width:w,height:h,aspect:+(w/h).toFixed(3),
   suggestedMode:pano?'street-panorama':'drone-gallery-photo',
   status:'pending_visual_and_location_review',
   locationVerified:false,visualReviewed:false,projectionVerified:false,
   licenceAttributionReviewed:false,firstSeen:now,
  };
  rows.push(item);
 }
 // Prefer high-resolution, nearby images; diversity is handled by rotation.
 rows.sort((a,b)=>a.sourceDistanceKm-b.sourceDistanceKm||
   (b.width*b.height)-(a.width*a.height));
 return rows.slice(0,20);
}
for(const target of targets){
 try{
  const list=await search(target);
  let added=0;
  for(const entry of list){
   if(seen.has(entry.key))continue;
   seen.add(entry.key);
   newRows.push(entry);
   added++;
  }
  stats.push({country:target[0],city:target[1],region:target[5]||target[4],eligible:list.length,new:added});
 }catch(e){
  warnings.push(target[0]+': '+String(e instanceof Error?e.message:e));
 }
 await new Promise(r=>setTimeout(r,650));
}
const unique=new Map();
for(const p of [...newRows,...pending])if(!unique.has(p.key))unique.set(p.key,p);
const backlog=[...unique.values()].filter(p=>p.status!=='published').slice(0,2000);
const report={
 date,generatedAt:now,targets:stats,regionsSearched:targets.length,rotation:'7 underserved regions + Europe + North America',
 newUniqueCandidates:newRows.length,
 new360Candidates:newRows.filter(x=>x.suggestedMode==='street-panorama').length,
 newGalleryCandidates:newRows.filter(x=>x.suggestedMode==='drone-gallery-photo').length,
 totalSeen:seen.size,pendingReview:backlog.length,uploadedNow:0,activatedNow:0,
 legalNotice:'Geotag + Commons licence checks are preliminary; no image is published until full editorial approval and actual R2 verification.',
 warnings,newCandidates:newRows,
};
for(const path of [STATE,QUEUE,LATEST])mkdirSync(dirname(path),{recursive:true});
writeFileSync(STATE,JSON.stringify({version:1,lastRun:date,seen:[...seen].sort(),totalNew:(baseState.totalNew??0)+newRows.length},null,2)+'\n');
writeFileSync(QUEUE,JSON.stringify({version:1,updatedAt:now,pending:backlog},null,2)+'\n');
writeFileSync(LATEST,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({date,regionsSearched:targets.length,
 newUniqueCandidates:report.newUniqueCandidates,
 new360Candidates:report.new360Candidates,newGalleryCandidates:report.newGalleryCandidates,
 pendingReview:report.pendingReview,totalSeen:report.totalSeen,warnings:report.warnings},null,2));
