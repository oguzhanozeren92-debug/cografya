#!/usr/bin/env node
/**
 * Globriva history photo candidate discovery, connected to the Monday archive
 * quality workflow. Read-only; NO automatic approvals or publishing.
 * New approved photos are entered through Supabase history_case_media.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { HISTORY_DETAIL_PHOTOS } from '../../server/history/detail-photos.mjs';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'../..');
const targets=[
  {caseId:'history-yoshinogari',place:'Yoshinogari archaeological site',term:'Yoshinogari historical park moat building'},
  {caseId:'history-soissons',place:'Soissons Cathedral',term:'Soissons Cathedral gothic architecture'},
  {caseId:'history-liechtenstein',place:'Liechtenstein Castle Austria',term:'Burg Liechtenstein Maria Enzersdorf'},
  {caseId:'history-gallery',place:'Alte Nationalgalerie',term:'Alte Nationalgalerie Berlin museum architecture'},
  {caseId:'history-kashveti',place:'Kashveti Church',term:'Kashveti church Tbilisi'},
  {caseId:null,place:'Colosseum Rome',term:'Colosseum Rome interior arches'},
  {caseId:null,place:'Hagia Sophia Istanbul',term:'Hagia Sophia Istanbul interior mosaics'},
  {caseId:null,place:'Machu Picchu',term:'Machu Picchu terraces Peru'},
  {caseId:null,place:'Chichen Itza',term:'Chichen Itza El Castillo pyramid'},
];
const accepted=new Set(['CC0','Public domain','CC BY 2.0','CC BY 3.0','CC BY 4.0',
  'CC BY-SA 2.5','CC BY-SA 3.0','CC BY-SA 4.0']);
const existing=new Set(HISTORY_DETAIL_PHOTOS.map(p=>p.file.toLowerCase()));
const clean=value=>String(value??'').replace(/<[^>]*>/g,' ')
  .replace(/&(?:amp|nbsp|quot);/gi,' ').replace(/\s+/g,' ').trim();
const candidates=[],warnings=[];
for(const target of targets){
  try{
    const p=new URLSearchParams({action:'query',format:'json',
      generator:'search',gsrsearch:target.term,gsrnamespace:'6',gsrlimit:'16',
      prop:'imageinfo',iiprop:'size|url|extmetadata',iiurlwidth:'960'});
    const response=await fetch('https://commons.wikimedia.org/w/api.php?'+p,{
      headers:{'User-Agent':'GlobrivaHistoryArchive/1.0 (https://atlas-arena-tau.vercel.app/)'},
      signal:AbortSignal.timeout(19000),
    });
    if(!response.ok)throw new Error('Commons metadata '+response.status);
    const json=await response.json();
    let added=0;
    for(const page of Object.values(json.query?.pages??{})){
      const file=page.title.replace(/^File:/,'');
      const i=page.imageinfo?.[0];
      if(!i||existing.has(file.toLowerCase())||!/\.jpe?g$/i.test(file))continue;
      const license=i.extmetadata?.LicenseShortName?.value;
      if(!accepted.has(license)||i.width<1200||i.height<700)continue;
      const artist=clean(i.extmetadata?.Artist?.value);
      const desc=clean(i.extmetadata?.ImageDescription?.value);
      if(!artist&&license!=='Public domain')continue;
      candidates.push({
        targetCaseId:target.caseId,searchTarget:target.place,
        fileTitle:file,source:'https://commons.wikimedia.org/wiki/File:'+
          encodeURIComponent(file.replaceAll(' ','_')),
        author:artist,license,width:i.width,height:i.height,
        preview:i.thumburl??null,description:desc.slice(0,270),
        locationReviewed:false,visualReviewed:false,
        rightsReviewed:false,published:false,
      });
      added++;
      if(added>=8)break;
    }
  }catch(e){warnings.push({place:target.place,error:String(e)});}
}
const report={generatedAt:new Date().toISOString(),
  note:'Search relevance is NOT confirmed location, authorship, panorama projection or visual quality. Manual review is required before publishing.',
  targetsSearched:targets.length,candidateCount:candidates.length,
  candidates,warnings};
const out=process.argv.find(a=>a.startsWith('--out='));
if(out){
  const dest=resolve(root,out.slice(6));
  mkdirSync(dirname(dest),{recursive:true});
  writeFileSync(dest,JSON.stringify(report,null,2)+'\n');
  console.log('Saved '+dest);
}
console.log(JSON.stringify({targets:targets.length,candidates:candidates.length,
  byTarget:targets.map(t=>({place:t.place,count:candidates.filter(c=>c.searchTarget===t.place).length})),
  errors:warnings},null,2));
