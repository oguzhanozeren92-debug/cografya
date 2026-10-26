import { useEffect, useMemo, useState } from 'react';
import { geoEqualEarth, geoMercator, geoPath } from 'd3-geo';
import { feature, neighbors } from 'topojson-client';
import worldData from 'world-atlas/countries-110m.json';
import { ArrowLeft, Compass, Mountain, MapPin, Sparkles, Trophy, RotateCcw } from 'lucide-react';
import { COUNTRY_DATA } from '@/data/countries';
import { BORDER_FOCUS, BORDER_SOURCE, ISLAND_COUNTRIES, NATURE_POINTS, NATURE_SOURCE, type NaturePoint } from '@/data/geoDiscoveryModes';
import { useLanguage, type Language } from '@/lib/i18n';
import { awardGeoStars, getGeoStars, type GeoAward, type GeoRewardLevel } from '@/lib/geoRewards';
import { GeoStarRow } from '@/components/GeoStarRow';
import { localizedCountryById } from '@/lib/countryLanguage';

export type GeoDiscoveryMode = 'nature'|'islands'|'borders';
type Level = 1|2|3;
type Option = {id:string; label:string;lat?:number;lon?:number};
type Round = {id:string;prompt:string;promptEn?:string;options:Option[];answer:string;region:string;source:string;target?:string;featureId?:string;level:Level};
type Shape = {id?:string|number;type:string;geometry:unknown;properties?:Record<string,unknown>};
const topo=worldData as unknown as {objects:{countries:{geometries:Array<{id?:string|number}>}}};
const allShapes=(feature(topo as never,topo.objects.countries as never) as unknown as {features:Shape[]}).features;
const ids=(x:unknown)=>String(x).padStart(3,'0');
const shapeById=new Map(allShapes.map(x=>[ids(x.id),x]));
const topology=neighbors(topo.objects.countries.geometries as never);
const adj=new Map(topo.objects.countries.geometries.map((g,i)=>[
  ids(g.id),new Set((topology[i]||[]).map(j=>ids(topo.objects.countries.geometries[j]?.id))),
] as const));
const worldProjection=geoEqualEarth().fitExtent([[15,12],[785,408]],{type:'Sphere'} as never);
const worldPath=geoPath(worldProjection);
const worldShape=worldPath({type:'FeatureCollection',features:allShapes} as never)||'';
const MODES:Record<GeoDiscoveryMode,{tr:string;en:string;subTr:string;subEn:string;icon:string}>={
 nature:{tr:'Doğa Dedektifi',en:'Nature Detective',subTr:'Dünyanın doğal harikalarını haritada bul.',subEn:'Find natural wonders on the world map.',icon:'🏞️'},
 islands:{tr:'Ada Avcısı',en:'Island Hunter',subTr:'Gerçek ülke sınırlarından üretilen ada siluetlerini tanı.',subEn:'Identify real island and archipelago country silhouettes.',icon:'🏝️'},
 borders:{tr:'Sınır Dedektifi',en:'Border Detective',subTr:'Harita verisinden hesaplanan komşulukları çöz.',subEn:'Solve land-border puzzles computed from real map topology.',icon:'🌐'},
};
const shuffle=<T,>(data:readonly T[])=>{
 const x=[...data];for(let i=x.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[x[i],x[j]]=[x[j],x[i]]}
 return x;
};
const nameOf=(id:string,lang:Language)=>localizedCountryById(id,lang)||COUNTRY_DATA[id]?.nameTr||id;
function buildNature(level:Level):Round[]{
 const candidate=NATURE_POINTS.filter(x=>x.level===level);
 return shuffle(candidate).map(item=>{
  const distract=shuffle(NATURE_POINTS.filter(p=>p.id!==item.id)).slice(0,3);
  return {id:item.id,prompt:item.clue,promptEn:item.clueEn,options:shuffle([item,...distract]).map(x=>({id:x.id,label:x.name,lat:x.lat,lon:x.lon})),
   answer:item.id,region:item.region,source:NATURE_SOURCE,level};
 });
}
function buildIsland(level:Level,tr:boolean):Round[]{
 const bank=ISLAND_COUNTRIES.filter(x=>shapeById.has(x.id));
 const active=bank.filter(x=>x.level===level);
 return shuffle(active).map(item=>{
  const other=shuffle(bank.filter(x=>x.id!==item.id)).slice(0,3);
  return {id:item.id,prompt:'Bu ülke veya takımadayı harita siluetinden tanıyabilir misin?',promptEn:'Can you recognize this island country or archipelago from its outline?',
   options:shuffle([item,...other]).map(c=>({id:c.id,label:tr?c.name:c.en})),
   answer:item.id,region:'Gerçek kara silueti · Natural Earth verisi',source:NATURE_SOURCE,featureId:item.id,level};
 });
}
function buildBorders(level:Level,language:Language):Round[]{
 const focus=BORDER_FOCUS.filter(id=>shapeById.has(id)&&COUNTRY_DATA[id]&&adj.get(id)?.size);
 const chunks=level===1?focus.slice(0,14):level===2?focus.slice(14,29):focus.slice(29);
 const pool=focus.filter(x=>shapeById.has(x)&&COUNTRY_DATA[x]);
 return shuffle(chunks).flatMap((target):Round[]=>{
  const links=[...(adj.get(target)||[])].filter(id=>COUNTRY_DATA[id]&&shapeById.has(id));
  const non=pool.filter(id=>id!==target&&!adj.get(target)?.has(id));
  if(!links.length||non.length<3)return [];
  const wrongChoice=level===2&&links.length>=3;
  const answer=wrongChoice?shuffle(non)[0]:shuffle(links)[0];
  const others=wrongChoice?shuffle(links).slice(0,3):shuffle(non).slice(0,3);
  if(others.length!==3)return [];
  return [{id:target,prompt:wrongChoice
    ?'Haritadaki ülkeyle hangisi kara sınırı paylaşmaz?'
    :'Haritada vurgulanan ülkeyle hangisi kara sınırı paylaşır?',
   promptEn:wrongChoice?'Which country does NOT share a land border with the highlighted country?'
    :'Which country shares a land border with the highlighted country?',
   options:shuffle([answer,...others]).map(id=>({id,label:nameOf(id,language)})),
   answer,region:nameOf(target,language),source:BORDER_SOURCE,featureId:target,level}];
 });
}
const storageKey='globriva_geo_new_games_v1';
function loadBest():Record<string,number>{try{return JSON.parse(localStorage.getItem(storageKey)||'{}')||{}}catch{return {}}}
const currentShapePath=(featureId?:string)=>{
 const obj=featureId?shapeById.get(featureId):undefined;
 if(!obj)return '';
 const p=geoMercator().fitExtent([[90,30],[710,378]],obj as never);
 return geoPath(p)(obj as never)||'';
};
function WorldMap({round,onAnswer,picked}: {round:Round;onAnswer:(id:string)=>void;picked:string|null}){
 const isNature=round.options.every(x=>Number.isFinite(x.lat)&&Number.isFinite(x.lon));
 return <div className="relative my-4 overflow-hidden rounded-[21px] border border-cyan-300/35 bg-[#102b49] shadow-[0_18px_40px_rgba(0,5,20,.35)]" style={{aspectRatio:'800 / 420'}}>
   <svg viewBox="0 0 800 420" role="img" aria-label="Natural Earth dünya haritası" className="absolute inset-0 h-full w-full">
     <defs><linearGradient id="geo-new-ocean" x1="0" x2="0" y1="0" y2="1"><stop stopColor="#163f66"/><stop offset="1" stopColor="#082641"/></linearGradient></defs>
     <rect x="0" y="0" width="800" height="420" fill="url(#geo-new-ocean)"/>
     <path d={worldShape} fill="#316c71" stroke="#91bbac" strokeWidth={0.55}/>
     {round.featureId && !isNature && shapeById.get(round.featureId) && <path d={worldPath(shapeById.get(round.featureId) as never)||''} fill="#f5bd64" stroke="#fff7b0" strokeWidth={1.8}/>}
   </svg>
   {isNature&&round.options.map((opt,i)=>{
     const projected=worldProjection([opt.lon!,opt.lat!]);
     if(!projected)return null;
     const chosen=picked!==null,cl=chosen?(opt.id===round.answer?'bg-emerald-500 border-white text-white':opt.id===picked?'bg-rose-500 border-white text-white':'bg-[#a36737] border-white/70 text-white'):'bg-[#e9b65d] border-white text-[#1d2930]';
     return <button key={opt.id} type="button" disabled={chosen} onClick={()=>onAnswer(opt.id)}
       aria-label={'Harita noktası '+String.fromCharCode(65+i)} style={{left:(projected[0]/800*100)+'%',top:(projected[1]/420*100)+'%'}}
       className={'absolute z-10 grid h-8 w-8 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 text-xs font-black shadow-lg shadow-black/60 sm:h-10 sm:w-10 '+cl}>
       {String.fromCharCode(65+i)}</button>;
   })}
   <div className="pointer-events-none absolute bottom-2 left-2 rounded-md bg-[#061425]/80 px-2 py-1 text-[9px] font-bold text-white/85">
     Natural Earth · 1:110m {isNature?'· yaklaşık konumlar':''}
   </div>
 </div>;
}
export function GeoDiscoveryScreen({mode,onClose,onGameComplete}:{
  mode:GeoDiscoveryMode;onClose:()=>void;onGameComplete?:()=>void;
}){
 const {language}=useLanguage();
 const tr=language==='tr';
 const config=MODES[mode];
 const [level,setLevel]=useState<Level|null>(null);
 const [run,setRun]=useState(0);
 const [index,setIndex]=useState(0);
 const [picked,setPicked]=useState<string|null>(null);
 const [infoOpen,setInfoOpen]=useState(false);
 const [infoRead,setInfoRead]=useState(false);
 const [score,setScore]=useState(0);
 const [finished,setFinished]=useState(false);
 const [best,setBest]=useState(loadBest);
 const [stageAward,setStageAward]=useState<GeoAward|null>(null);
 const stageName=(num:Level):GeoRewardLevel=>({1:'easy',2:'medium',3:'hard'} as const)[num];
 const rounds=useMemo(()=>!level?[]:mode==='nature'?buildNature(level):mode==='islands'?buildIsland(level,tr):buildBorders(level,language),[level,mode,run,language,tr]);
 const round=rounds[index];
 const correct=picked!==null&&picked===round?.answer;
 const key=mode+':'+level;
 const start=(newLevel:Level)=>{
  setLevel(newLevel);setRun(x=>x+1);setIndex(0);setPicked(null);setScore(0);setFinished(false);setStageAward(null);setInfoOpen(false);setInfoRead(false);
 };
 const answer=(id:string)=>{
  if(picked!==null||!round)return;
  setPicked(id);setInfoOpen(false);setInfoRead(false);if(id===round.answer)setScore(n=>n+100);
 };
 const next=()=>{
  if(!round||!level)return;
  if(index+1<rounds.length){setIndex(n=>n+1);setPicked(null);setInfoOpen(false);setInfoRead(false);return}
  const finalScore=score;
  const updated={...best,[key]:Math.max(best[key]||0,finalScore)};
  setBest(updated);try{localStorage.setItem(storageKey,JSON.stringify(updated))}catch{}
  setStageAward(awardGeoStars(mode,stageName(level),Math.round(finalScore/100),rounds.length,true));
  setFinished(true);onGameComplete?.();
 };
 // Pause automatic progression whenever the player opens the learning card.
 useEffect(()=>{
  if(picked===null||infoOpen||finished||!round)return;
  const timer=window.setTimeout(()=>next(),infoRead?1700:4400);
  return ()=>window.clearTimeout(timer);
 },[picked,infoOpen,infoRead,index,finished,round,score,best,key]);
 const source=round?.source||NATURE_SOURCE;
 return <div className="fixed inset-0 z-[100] overflow-y-auto overscroll-contain bg-[#061325] text-white" role="dialog" aria-modal="true" aria-label={tr?config.tr:config.en}>
  <div className="mx-auto min-h-[100dvh] w-full max-w-[650px] px-4 pb-[calc(28px+env(safe-area-inset-bottom))] pt-[calc(16px+env(safe-area-inset-top))] sm:px-6">
   <header className="mb-5 flex items-center justify-between gap-3">
     <button type="button" onClick={onClose} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3 text-xs font-bold"><ArrowLeft size={16}/>{tr?'GERİ':'BACK'}</button>
     <span className="text-sm font-black tracking-tight text-amber-200">Glo<span className="text-white">briva</span></span>
     <span className="rounded-full border border-amber-300/25 bg-amber-200/10 px-3 py-2 text-[10px] font-black text-amber-100">{tr?'YENİ KEŞİF':'NEW DISCOVERY'}</span>
   </header>
   <div className="mb-4 flex items-center gap-3">
     <span className="grid h-14 w-14 place-items-center rounded-[19px] border border-amber-300/30 bg-amber-200/10 text-3xl">{config.icon}</span>
     <div><p className="text-[10px] font-extrabold uppercase tracking-[.18em] text-amber-300">ATLAS / {tr?'HARİTA OYUNU':'MAP GAME'}</p>
       <h1 className="text-2xl font-black tracking-tight sm:text-3xl">{tr?config.tr:config.en}</h1></div>
   </div>
   {!level?<><p className="mb-6 text-sm leading-6 text-slate-300">{tr?config.subTr:config.subEn}</p>
      <div className="grid grid-cols-3 gap-2">
       {([1,2,3] as const).map(l=>{
         const available=mode==='nature'?NATURE_POINTS.filter(x=>x.level===l).length:mode==='islands'
           ?ISLAND_COUNTRIES.filter(x=>x.level===l&&shapeById.has(x.id)).length
           :buildBorders(l,language).length;
         return <button key={l} type="button" disabled={available===0} onClick={()=>start(l)}
           className="min-h-[105px] rounded-2xl border border-amber-200/30 bg-gradient-to-br from-[#584530] to-[#202e41] px-2 py-3 text-center disabled:opacity-40">
           <span className="block text-lg font-black">{(tr?['','Kolay','Orta','Zor']:['','Easy','Medium','Hard'])[l]}</span>
           <span className="mt-2 block text-xs font-semibold text-amber-100">{available} {tr?'soru':'questions'}</span>
            <span className="mt-2 block"><GeoStarRow count={getGeoStars(mode,stageName(l))}/></span>
         </button>;
       })}
      </div>
      <p className="mt-6 text-xs leading-5 text-slate-400">{tr?'Her turda doğrulanmış veri ve gerçek harita geometrisi kullanılır. Kaynak oyunda gösterilir.':'Each round uses curated facts and real map geometry; references are provided.'}</p>
      <a href={NATURE_SOURCE} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-xs font-bold text-cyan-200 underline">Natural Earth · Public Domain</a>
     </>:finished?<section className="rounded-[25px] border border-amber-300/30 bg-gradient-to-br from-[#243e4f] to-[#121b32] p-7 text-center">
       <Trophy className="mx-auto mb-3 h-12 w-12 text-amber-300"/>
       <h2 className="text-2xl font-black">{tr?'Tur tamamlandı!':'Round complete!'}</h2>
       <p className="mt-4 text-4xl font-black text-amber-200">{score} / {rounds.length*100}</p>
       <p className="mt-2 text-xs text-slate-300">{tr?'En iyi':'Best'}: {best[key]||0}</p>
        <div className="mt-4 rounded-2xl border border-amber-300/30 bg-[#152d43] p-4" aria-live="polite">
          <div className="text-[10px] font-black uppercase tracking-[.15em] text-amber-200">{tr?'KEŞİF YILDIZLARI':'EXPLORER STARS'}</div>
          <div className="mt-2"><GeoStarRow large animated={Boolean(stageAward?.gained)} count={stageAward?.current ?? getGeoStars(mode,stageName(level))}/></div>
          <p className="mt-2 text-xs text-slate-200">{stageAward?.gained ? (tr?'+ '+stageAward.gained+' yeni yıldız kazandın!':'+ '+stageAward.gained+' new stars earned!') : (tr?'En iyi yıldızların korunur · %70/%80/%90':'Best stars are saved · 70/80/90% threshold')}</p>
          {stageAward?.newBadges.map(b=><div key={b.id} className="mt-2 rounded-lg bg-amber-300/15 px-2 py-2 text-xs font-bold text-amber-100">{b.icon} {tr?'Yeni rozet: ':'New badge: '}{tr?b.tr:b.en}</div>)}
        </div>
       <button type="button" onClick={()=>start(level)} className="mt-6 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-amber-300 font-black text-[#132438]"><RotateCcw size={16}/>{tr?'Yeniden oyna':'Play again'}</button>
       <button type="button" onClick={()=>setLevel(null)} className="mt-3 min-h-12 w-full rounded-xl border border-white/20 bg-white/10 font-bold">{tr?'Seviye seç':'Choose level'}</button>
      </section>:round?<section>
       <div className="flex items-center justify-between gap-3 text-xs font-bold text-slate-300"><span>{(tr?['','Kolay','Orta','Zor']:['','Easy','Medium','Hard'])[level]} · {index+1}/{rounds.length}</span><span>{score} {tr?'puan':'points'}</span></div>
       <div className="my-3 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-amber-300" style={{width:(index/rounds.length*100)+'%'}}/></div>
       <h2 className="my-4 text-lg font-black leading-7">{tr?round.prompt:(round.promptEn||round.prompt)}</h2>
       {mode==='islands'?<div className="relative my-4 h-[230px] overflow-hidden rounded-[22px] border border-cyan-300/35 bg-[radial-gradient(ellipse_at_center,#1d5e79,#0a284b_75%)] sm:h-[300px]">
         <svg viewBox="0 0 800 420" className="h-full w-full" role="img" aria-label="Natural Earth gerçek ülke silueti">
           <path d={currentShapePath(round.featureId)} fill="#8bd2bd" stroke="#d7fff0" strokeWidth={2}/>
         </svg><span className="absolute bottom-2 left-3 text-[10px] font-bold text-white/70">Natural Earth · 110m</span></div>
         :<WorldMap round={round} onAnswer={answer} picked={picked}/>}
       {mode==='nature'&&<p className="mb-3 text-center text-[11px] font-bold text-cyan-100/80">{tr?'Haritadaki A–D noktalarından birine dokun.':'Tap one of the A–D points on the map.'}</p>}
       {mode!=='nature'&&<div className="grid grid-cols-1 gap-2">{round.options.map(opt=>{
         const check=picked!==null,good=check&&opt.id===round.answer,bad=check&&opt.id===picked&&opt.id!==round.answer;
         return <button key={opt.id} type="button" disabled={check} onClick={()=>answer(opt.id)}
           className={'min-h-12 rounded-xl border px-4 py-3 text-left text-sm font-extrabold '+(good?'border-emerald-300 bg-emerald-700/55 text-emerald-50':bad?'border-rose-400 bg-rose-700/45 text-rose-100':'border-white/20 bg-white/10 text-white')}>
           {opt.label}</button>;
       })}</div>}
       {picked!==null&&<div className={'mt-4 rounded-xl border p-4 '+(correct?'border-emerald-400/40 bg-emerald-500/15':'border-rose-400/40 bg-rose-400/15')}>
         <p className="font-black">{correct?(tr?'✓ Doğru cevap!':'✓ Correct!'):(tr?'✕ Bu kez olmadı':'✕ Not this time')}</p>
         <p className="mt-1 text-sm text-slate-200">{mode==='nature'?round.options.find(o=>o.id===round.answer)?.label:mode==='islands'?round.options.find(o=>o.id===round.answer)?.label:round.region+' · '+round.options.find(o=>o.id===round.answer)?.label}</p>
         <a href={source} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-xs font-bold text-cyan-200 underline">{tr?'Harita verisinin kaynağı':'Map data source'} ↗</a>
         <button type="button" onClick={()=>{setInfoOpen(true);setInfoRead(true)}} aria-haspopup="dialog" className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-full border border-cyan-200/50 bg-cyan-300/10 px-4 text-sm font-black text-cyan-100"><span className="text-lg" aria-hidden="true">ⓘ</span>{tr?'Doğru cevap hakkında bilgi':'About this answer'}</button>
         <p className="mt-2 text-[11px] text-slate-300">{tr?'Birazdan otomatik devam edecek.':'Moving on automatically.'}</p>
       </div>}
       <p className="mt-5 text-[10px] leading-4 text-slate-400">{tr?'Kara sınırları 1:110m genel veri setinden hesaplanır; ihtilaflı sınırlar ve küçük adalar farklı haritalarda değişebilir.':'Borders use generalized 1:110m geometry; disputed borders and tiny islands can vary by dataset.'}</p>
      </section>:<div className="rounded-2xl border border-amber-300/20 bg-white/10 p-6 text-sm text-slate-200">
       {tr?'Bu zorluk için yeterli doğrulanmış veri bulunamadı.':'Not enough verified data for this level.'}
       <button onClick={()=>setLevel(null)} className="mt-4 block rounded-xl bg-amber-300 px-4 py-2 font-black text-[#102638]">{tr?'Seviye seç':'Choose level'}</button>
      </div>}
   </div>
 {picked!==null && infoOpen && round && <div className="fixed inset-0 z-[150] flex items-center justify-center bg-[#040e1c]/90 p-4 backdrop-blur-sm" onClick={()=>setInfoOpen(false)} role="presentation">
     <section role="dialog" aria-modal="true" aria-labelledby="geoFactTitle" onClick={e=>e.stopPropagation()} className="w-full max-w-md rounded-[23px] border border-amber-300/40 bg-gradient-to-b from-[#234252] to-[#0c1b31] p-5 shadow-2xl">
       <div className="mb-3 flex items-center justify-between gap-3"><span className="text-xs font-black uppercase tracking-wider text-amber-200">{tr?'✦ KEŞİF NOTU':'✦ DISCOVERY NOTE'}</span><button autoFocus type="button" aria-label={tr?'Kapat':'Close'} onClick={()=>setInfoOpen(false)} className="grid h-10 w-10 place-items-center rounded-full border border-white/20 bg-white/10 text-xl">×</button></div>
       <h3 id="geoFactTitle" className="text-xl font-black">{round.options.find(o=>o.id===round.answer)?.label}</h3>
       <p className="mt-3 text-sm leading-6 text-slate-200">{tr?round.prompt:(round.promptEn||round.prompt)}</p>
       {mode==='borders'&&<p className="mt-3 rounded-xl bg-white/5 p-3 text-sm">{tr?'Haritadaki ülke: ':'Highlighted country: '}{round.region}</p>}
       {mode==='islands'&&COUNTRY_DATA[round.answer]&&<p className="mt-3 rounded-xl bg-white/5 p-3 text-sm">{tr?'Başkent: ':'Capital: '}{COUNTRY_DATA[round.answer].capitalTr}</p>}
       {mode==='nature'&&<p className="mt-3 rounded-xl bg-white/5 p-3 text-sm">{tr?'Bölge: ':'Region: '}{round.region}</p>}
       <a href={source} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block text-xs font-semibold text-cyan-200 underline">{tr?'Bilginin harita kaynağı':'Map data source'}</a>
     </section>
   </div>}
 </div>;
}
