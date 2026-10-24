import { allowAtlasNativeCors } from '../../server/street/core.mjs';
import { approvedPanoramas } from '../../server/street/approved.mjs';
import { approvedPhotoIds } from '../../server/street/photo-ready.mjs';
import { HISTORY_CASES, HISTORY_QUESTION_POINTS } from '../../server/history/curated.mjs';
import { HISTORY_MEDIUM_CASES } from '../../server/history/curated-medium.mjs';
import { HISTORY_DETAIL_PHOTOS } from '../../server/history/detail-photos.mjs';

const PATTERN=/^panoramas\/[a-zA-Z0-9_-]{8,80}$/;
const LICENSE_URL={
  'CC0':'https://creativecommons.org/publicdomain/zero/1.0/',
  'Public domain':'https://creativecommons.org/publicdomain/mark/1.0/',
  'CC BY 2.0':'https://creativecommons.org/licenses/by/2.0/',
  'CC BY 3.0':'https://creativecommons.org/licenses/by/3.0/',
  'CC BY 4.0':'https://creativecommons.org/licenses/by/4.0/',
  'CC BY-SA 2.5':'https://creativecommons.org/licenses/by-sa/2.5/',
  'CC BY-SA 3.0':'https://creativecommons.org/licenses/by-sa/3.0/',
  'CC BY-SA 3.0 de':'https://creativecommons.org/licenses/by-sa/3.0/de/',
  'CC BY-SA 4.0':'https://creativecommons.org/licenses/by-sa/4.0/',
};
const approved=new Map(approvedPanoramas.filter(r=>
  r.approved===true && r.mode==='multires' && approvedPhotoIds.includes(r.id)
).map(r=>[r.id,r]));
const jsonShape=v=>v && typeof v==='object' &&
  typeof v.tr==='string' && typeof v.en==='string';
const trustedPhoto=file=>typeof file==='string'&&
  /^[^/?#]{2,180}\.(?:jpg|jpeg|png|webp)$/i.test(file);
const validCommonsSource=url=>typeof url==='string' &&
  /^https:\/\/commons\.wikimedia\.org\/wiki\/File:/i.test(url);
const photoUrl=file=>'https://commons.wikimedia.org/wiki/Special:FilePath/'+
  encodeURIComponent(file.replaceAll(' ','_'))+'?width=960';
const credit=(artist,license,source)=>({
  artist,license,source,licenseUrl:LICENSE_URL[license]||'',
});
const makeDetail=photo=>({
  id:photo.id || photo.caseId+'-'+photo.order,
  caption:photo.caption,
  url:photoUrl(photo.file),
  credit:credit(photo.artist,photo.license,photo.source),
});
const baseUrl=()=>process.env.STREET_R2_PUBLIC_BASE_URL?.replace(/\/+$/,'')??'';
const canR2=()=>/^https:\/\/[a-z0-9.-]+(?::443)?$/i.test(baseUrl());
const approved360=(panoramaId,panoramaPath)=>{
  const row=panoramaId && approved.get(panoramaId);
  // An approved historical case may use its own externally published R2
  // panorama path; only DB administrators can publish rows (RLS read-only).
  const path=row?.path || (PATTERN.test(panoramaPath||'')?panoramaPath:null);
  if(!path)return null;
  const source=row?.source??null;
  const artist=row?.artist??null;
  const license=row?.license??null;
  const staticBase=row?'/street-photos/'+row.id:null;
  if(canR2())return {
    media:{mode:'multires',base:baseUrl()+'/'+path,staticBase,
      config:row?.multires??{
        path:'/%l/%s%y_%x',fallbackPath:'/fallback/%s',
        extension:'jpg',tileResolution:512,maxLevel:3,cubeResolution:2048,
      }},
    path,source,artist,license,
  };
  // Offline-capable pilot retains its curated static four directions.
  if(staticBase)return {
    media:{mode:'gallery',images:['f','r','b','l'].map(face=>({
      url:staticBase+'/'+face+'.jpg',
      credit:credit(artist,license,source),
    }))},
    path,source,artist,license,
  };
  return null;
};

function curatedCases(){
  return [...HISTORY_CASES,...HISTORY_MEDIUM_CASES].map(row=>{
    const pano=approved360(row.panoramaId);
    if(!pano)return null;
    const author=credit(pano.artist,pano.license,pano.source);
    return {...row,media:pano.media,credit:author,
      gallery:HISTORY_DETAIL_PHOTOS.filter(p=>p.caseId===row.id)
        .sort((a,b)=>a.order-b.order).map(makeDetail)};
  }).filter(Boolean);
}

async function getDatabaseCases(){
  const url=process.env.VITE_SUPABASE_URL?.replace(/\/+$/,'');
  const key=process.env.VITE_SUPABASE_ANON_KEY;
  if(!url||!key||!/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(url))return null;
  const endpoint=url+'/rest/v1/';
  const request=async(path)=>{
    const res=await fetch(endpoint+path,{
      headers:{apikey:key,Authorization:'Bearer '+key},
      signal:AbortSignal.timeout(6500),
    });
    if(!res.ok)throw new Error('History content '+res.status);
    return res.json();
  };
  const [cases,media,questions]=await Promise.all([
    request('history_cases?select=*&status=eq.published&order=position.asc&limit=150'),
    request('history_case_media?select=*&published=eq.true&reviewed=eq.true&order=sort_order.asc&limit=1000'),
    request('history_case_questions?select=*&published=eq.true&order=sort_order.asc&limit=450'),
  ]);
  if(!Array.isArray(cases)||!Array.isArray(media)||!Array.isArray(questions))return null;
  const playable=[];
  for(const row of cases){
    if(!jsonShape(row.monument)||!jsonShape(row.place)||!jsonShape(row.era)||
      !jsonShape(row.tradition)||!jsonShape(row.purpose)||
      !jsonShape(row.clue)||!jsonShape(row.fact)||
      typeof row.id!=='string'||typeof row.source_url!=='string')continue;
    const pano=approved360(row.panorama_id,row.panorama_path);
    if(!pano)continue;
    const owned=media.filter(x=>x.case_id===row.id);
    const main=owned.find(x=>x.kind==='panorama'&&x.artist&&x.license&&x.source_url);
    if(!main)continue;
    const items=owned.filter(x=>['detail','map','plan'].includes(x.kind) &&
      trustedPhoto(x.file_title) && validCommonsSource(x.source_url) &&
      LICENSE_URL[x.license] && typeof x.artist==='string' &&
      jsonShape(x.caption));
    const q=questions.filter(x=>x.case_id===row.id)
      .sort((a,b)=>a.sort_order-b.sort_order).slice(0,3);
    if(q.length!==3 || q.some(x=>
      !jsonShape(x.prompt)||!jsonShape(x.explanation)||
      !Array.isArray(x.options)||x.options.length!==4||
      !x.options.every(jsonShape)||!Number.isInteger(x.correct)||x.correct<0||x.correct>3))continue;
    playable.push({
      id:row.id,monument:row.monument,place:row.place,era:row.era,
      tradition:row.tradition,purpose:row.purpose,clue:row.clue,
      fact:row.fact,sourceUrl:row.source_url,
      region:row.region,difficulty:row.difficulty,
      credit:credit(main.artist,main.license,main.source_url),
      media:pano.media,
      gallery:items.map(x=>makeDetail({
        id:String(x.id),caseId:row.id,order:x.sort_order,
        file:x.file_title,caption:x.caption,artist:x.artist,
        license:x.license,source:x.source_url,
      })),
      questions:q.map(x=>({
        prompt:x.prompt,options:x.options,correct:x.correct,
        explanation:x.explanation,
      })),
    });
  }
  return playable.length>=5?playable:null;
}

function chooseFive(items){
  // Same 5 cases for everyone during a given UTC week; newly published
  // articles join the weekly rotation automatically, no app store update.
  if(items.length<=5)return items.slice(0,5);
  const date=new Date(), day=date.getUTCDay();
  const monday=new Date(Date.UTC(date.getUTCFullYear(),date.getUTCMonth(),
    date.getUTCDate()-((day+6)%7)));
  let seed=2166136261;
  const key=monday.toISOString().slice(0,10);
  for(const c of key)seed=Math.imul(seed^c.charCodeAt(0),16777619);
  const choices=[...items].sort((a,b)=>a.id.localeCompare(b.id));
  for(let i=choices.length-1;i>0;i--){
    seed=(seed+0x6D2B79F5)>>>0;
    let t=Math.imul(seed^(seed>>>15),1|seed);
    t^=t+Math.imul(t^(t>>>7),61|t);
    const v=((t^(t>>>14))>>>0)/4294967296;
    const j=Math.floor(v*(i+1));
    [choices[i],choices[j]]=[choices[j],choices[i]];
  }
  return choices.slice(0,5);
}

export default async function handler(req,res){
  if(allowAtlasNativeCors(req,res))return;
  res.setHeader('Cache-Control','no-store');
  if(req.method!=='GET')return res.status(405).json({error:'Method not allowed'});
  const difficulty=req.query?.difficulty==='medium'?'medium':'easy';
  let cases=null,origin='curated';
  try{
    const database=await getDatabaseCases();
    if(database){
      const matching=database.filter(item=>difficulty==='medium'
        ? item.difficulty===2||item.difficulty==='medium'
        : item.difficulty===1||item.difficulty==='easy'||item.difficulty==null);
      if(matching.length>=5){cases=matching;origin='supabase';}
    }
  }catch(error){
    console.warn('[history] published DB content unreachable; keeping curated pilot',
      error instanceof Error?error.message:String(error));
  }
  if(!cases)cases=curatedCases().filter(item=>difficulty==='medium'?item.difficulty==='medium':item.difficulty!=='medium');
  if(cases.length<5)return res.status(503).json({error:'Tarihî panoramalar henüz hazır değil.'});
  const chosen=chooseFive(cases);
  res.status(200).json({
    version:3,origin,difficulty,questionsPerCase:3,
    totalPublished:cases.length,
    maxPoints:5*HISTORY_QUESTION_POINTS.reduce((a,b)=>a+b,0),
    cases:chosen,
  });
}
