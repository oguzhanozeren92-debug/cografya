import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, Compass, Expand, Globe2, Landmark, MapPin, Minimize2, RotateCcw, Trophy, XCircle } from 'lucide-react';
import catalog from '@/data/heritage360.json';
import { StreetPanorama, type StreetRound } from './StreetPanorama';
import { StreetWorldMap, guessedCorrectCountry } from './StreetWorldMap';
import { atlasApi } from '@/lib/atlasApi';
import { useLanguage } from '@/lib/i18n';
import { localizedCountryName } from '@/lib/countryLanguage';
import { heritage360Copy } from '@/lib/heritage360Locale';
import { awardGeoStars, getGeoStars, type GeoAward } from '@/lib/geoRewards';
import { GeoStarRow } from './GeoStarRow';

type Place=(typeof catalog.places)[number];
type Phase='intro'|'view'|'map'|'result'|'finish';
type Point={lat:number;lng:number};
const LENGTH=5,POINTS=1000,BEST_KEY='globriva-heritage360-country-best-v1';
const pool=catalog.places.filter(p=>p.id&&p.name&&p.country&&p.credit&&p.license&&p.file);
function shuffled<T,>(source:readonly T[]):T[]{
  const items=[...source];
  for(let i=items.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[items[i],items[j]]=[items[j],items[i]];}
  return items;
}
function selectPlaces():Place[]{
  // One destination per country per tour, to avoid repetitive church interiors
  // and repeated country guesses. New scenes are favoured across sessions.
  let recent:string[]=[];
  try{const stored=JSON.parse(localStorage.getItem('globriva-heritage360-recent-v1')||'[]');
    if(Array.isArray(stored))recent=stored.filter(x=>typeof x==='string').slice(-25);
  }catch{/* private mode */}
  const seen=new Set(recent),countries=new Set<string>(),selected:Place[]=[];
  for(const place of shuffled(pool).sort((a,b)=>Number(seen.has(a.id))-Number(seen.has(b.id)))){
    if(countries.has(place.country))continue;
    countries.add(place.country);selected.push(place);
    if(selected.length>=LENGTH)break;
  }
  return selected;
}
function remember(id:string){
  try{
    const raw=JSON.parse(localStorage.getItem('globriva-heritage360-recent-v1')||'[]');
    const entries=(Array.isArray(raw)?raw:[]).filter(x=>typeof x==='string'&&x!==id);
    localStorage.setItem('globriva-heritage360-recent-v1',JSON.stringify([...entries,id].slice(-25)));
  }catch{/* optional */}
}
function bestScore():number{
  try{return Math.max(0,Number(localStorage.getItem(BEST_KEY)||0)||0)}catch{return 0}
}
export function Heritage360LocationScreen({onClose,onGameComplete}:{onClose:()=>void;onGameComplete?:()=>void}){
  const {language}=useLanguage(),copy=heritage360Copy[language];
  const [phase,setPhase]=useState<Phase>('intro');
  const [rounds,setRounds]=useState<Place[]>(selectPlaces);
  const [index,setIndex]=useState(0);
  const [guess,setGuess]=useState<Point|null>(null);
  const [ready,setReady]=useState(false);
  const [failure,setFailure]=useState('');
  const [fullscreen,setFullscreen]=useState(false);
  const [answered,setAnswered]=useState(0);
  const [correct,setCorrect]=useState(0);
  const [success,setSuccess]=useState(false);
  const [stars,setStars]=useState<GeoAward|null>(null);
  const [best,setBest]=useState(bestScore);
  const [error,setError]=useState('');
  const failed=useRef(new Set<string>());
  const completed=useRef(false);
  const current=rounds[index];
  const score=correct*POINTS;
  const preview=current?atlasApi('/api/heritage/panorama?id='+encodeURIComponent(current.id)+'&preview=1'):'';
  const round=useMemo<StreetRound|undefined>(()=>current?{
    id:'heritage360:'+current.id,ticket:'',
    media:{mode:'equirectangular',image:atlasApi('/api/heritage/panorama?id='+encodeURIComponent(current.id))},
    credit:{artist:current.credit,license:current.license,source:current.sourceUrl},
  }:undefined,[current?.id]);
  useEffect(()=>{
    if(!fullscreen)return;
    const previous=document.body.style.overflow;
    document.body.style.overflow='hidden';
    const onKey=(event:KeyboardEvent)=>{if(event.key==='Escape')setFullscreen(false);};
    window.addEventListener('keydown',onKey);
    return()=>{document.body.style.overflow=previous;window.removeEventListener('keydown',onKey)};
  },[fullscreen]);
  const restart=()=>{
    completed.current=false;failed.current.clear();setRounds(selectPlaces());setIndex(0);
    setAnswered(0);setCorrect(0);setReady(false);setFailure('');setGuess(null);
    setError('');setStars(null);setSuccess(false);setFullscreen(false);setPhase('view');
  };
  const skipBroken=()=>{
    if(!current)return;
    failed.current.add(current.id);
    setFullscreen(false);setReady(false);setFailure('');setGuess(null);
    const excluded=new Set(rounds.map(p=>p.id));
    const usedCountries=new Set(rounds.filter((_,i)=>i!==index).map(p=>p.country));
    const options=shuffled(pool).filter(p=>!excluded.has(p.id)&&!failed.current.has(p.id));
    const next=options.find(p=>!usedCountries.has(p.country))||options[0];
    if(next){
      setRounds(old=>old.map((p,i)=>i===index?next:p));
    }else{
      setError(copy.error);
      setPhase('intro');
    }
  };
  const evaluate=()=>{
    if(!guess||!current||phase!=='map')return;
    const hit=guessedCorrectCountry(guess,current.country);
    if(hit===null){setError(copy.error);return;}
    setSuccess(hit);
    setAnswered(n=>n+1);
    if(hit)setCorrect(n=>n+1);
    remember(current.id);
    setError('');
    setPhase('result');
  };
  const next=()=>{
    if(index+1>=rounds.length){
      const nextBest=Math.max(best,score);
      setBest(nextBest);
      try{localStorage.setItem(BEST_KEY,String(nextBest))}catch{/* optional */}
      setStars(awardGeoStars('heritage360','tour',correct,rounds.length,answered===rounds.length));
      setPhase('finish');
      if(!completed.current){completed.current=true;onGameComplete?.();}
      return;
    }
    setIndex(i=>i+1);setGuess(null);setReady(false);setFailure('');setSuccess(false);setPhase('view');
  };
  const button='flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-black transition active:scale-[.99]';
  const primary=button+' bg-gradient-to-r from-[#ffe1a4] to-[#f1b969] text-[#251c24] shadow-[0_10px_25px_rgba(0,0,0,.3)]';
  const secondary=button+' border border-amber-200/30 bg-white/10 text-[#f8e6cf]';
  return <section className="globriva-screen fixed inset-0 z-[75] overflow-y-auto overscroll-contain bg-[#071528] text-[#fff1de]">
    <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_55%_0%,rgba(52,112,145,.48),transparent_65%)]"/>
    <main className="globriva-content relative mx-auto min-h-full w-full max-w-[600px] px-4 pb-[max(30px,env(safe-area-inset-bottom))] pt-[max(65px,calc(env(safe-area-inset-top)+15px))]">
      <header className="mb-4 flex items-center gap-3">
        <button type="button" onClick={onClose} className="grid min-h-11 min-w-11 place-items-center rounded-xl border border-amber-200/30 bg-[#102b40]" aria-label={copy.home}><ArrowLeft className="h-5 w-5"/></button>
        <span className="grid h-11 w-11 place-items-center rounded-2xl border border-amber-200/40 bg-[#694b2c]/60"><Compass className="h-6 w-6 text-amber-200"/></span>
        <div className="min-w-0 flex-1"><h1 className="text-[clamp(20px,5.5vw,26px)] font-black leading-tight">{copy.title}</h1>
          <p className="text-[10px] font-black tracking-wider text-amber-200">{copy.tag}</p></div>
        <span className="whitespace-nowrap rounded-full border border-amber-200/25 bg-[#0f2739] px-3 py-2 text-xs font-black text-amber-200">{score.toLocaleString(language)} ★</span>
      </header>
      {phase==='intro'&&<div className="space-y-4">
        <div className="relative h-[min(48dvh,390px)] min-h-[270px] overflow-hidden rounded-[25px] border border-amber-200/45 bg-gradient-to-tr from-[#16314a] to-[#483a43] shadow-[0_20px_35px_rgba(0,0,0,.45)]">
          {preview&&<img src={preview} alt="" className="absolute inset-0 h-full w-full object-cover" onError={e=>{e.currentTarget.style.display='none'}}/>}
          <div className="absolute inset-0 bg-gradient-to-t from-[#061426] via-[#0a2338]/40 to-transparent"/>
          <div className="absolute bottom-5 left-5 right-5"><span className="inline-flex rounded-full border border-amber-200/50 bg-black/45 px-3 py-1 text-xs font-extrabold text-amber-100">360° × {LENGTH}</span>
            <p className="mt-2 text-2xl font-black leading-tight">{copy.intro}</p></div>
        </div>
        <p className="text-center text-xs leading-5 text-blue-100/75">{copy.mapHint}</p>
        <button type="button" className={primary} onClick={restart}>{copy.start}<ArrowRight className="h-5 w-5"/></button>
        {error&&<p className="rounded-xl border border-orange-200/30 bg-orange-200/10 p-3 text-sm">{error}</p>}
        <p className="text-center text-xs text-amber-100/80">{copy.best}: {best.toLocaleString(language)} / {LENGTH*POINTS}</p>
      </div>}
      {(phase==='view'||phase==='map'||phase==='result')&&current&&<>
        <div className="mb-3 flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-extrabold">
          <span><Globe2 className="mr-1.5 inline-block h-4 w-4 text-amber-200"/>{copy.round} {index+1}/{rounds.length}</span>
          <span className="text-amber-200">{copy.explore}</span>
        </div>
        {phase==='view'&&round&&<>
          <div className={fullscreen?'fixed inset-0 z-[150] h-[100dvh] w-screen bg-[#081629] p-0':'relative h-[min(57dvh,510px)] min-h-[280px] overflow-hidden rounded-[23px] border border-amber-200/55 bg-[#112a41]'}>
            <StreetPanorama key={current.id} round={round}
              onReady={()=>{setReady(true);setFailure('')}}
              onError={message=>{setReady(false);setFailure(message)}}/>
            <button type="button" onClick={()=>setFullscreen(x=>!x)}
              className={'absolute right-3 z-20 flex min-h-11 items-center gap-1.5 rounded-xl border border-amber-200/50 bg-[#08192d]/95 px-3 py-2 text-xs font-black '+(fullscreen?'top-[max(22px,env(safe-area-inset-top))]':'top-3')}
              aria-label={fullscreen?copy.back:copy.explore}>
              {fullscreen?<Minimize2 className="h-4 w-4"/>:<Expand className="h-4 w-4"/>}
              {fullscreen?'×':'360°'}
            </button>
          </div>
          {!fullscreen&&<div className="mt-3 space-y-2">
            {failure&&<p role="alert" className="rounded-xl border border-orange-200/30 bg-orange-200/10 p-3 text-xs">{copy.error}</p>}
            <button type="button" disabled={!ready} className={primary+' disabled:cursor-not-allowed disabled:opacity-40'}
              onClick={()=>{setFullscreen(false);setGuess(null);setPhase('map')}}>
              <MapPin className="h-5 w-5"/>{copy.map}<ArrowRight className="h-4 w-4"/>
            </button>
            {failure&&<button type="button" className={secondary} onClick={skipBroken}><RotateCcw className="h-4 w-4"/>{copy.skip}</button>}
            <p className="text-center text-[11px] text-blue-100/75">{copy.noExact}</p>
          </div>}
        </>}
        {phase==='map'&&<div className="space-y-3">
          <div className="rounded-xl border border-amber-200/20 bg-[#122c42] px-3 py-3 text-sm font-bold">{copy.mapHint}</div>
          <StreetWorldMap guess={guess} actual={null} locked={false} onGuess={point=>{setGuess(point);setError('')}}/>
          <button type="button" className={primary+' disabled:opacity-40'} disabled={!guess} onClick={evaluate}>
            <MapPin className="h-5 w-5"/>{copy.confirm}
          </button>
          <button type="button" className={secondary} onClick={()=>{setReady(false);setPhase('view')}}>{copy.back}</button>
          {error&&<p className="text-xs text-orange-200">{error}</p>}
        </div>}
        {phase==='result'&&<div className="space-y-3">
          <section className={'rounded-[22px] border p-5 '+(success?'border-emerald-300/55 bg-[#174a42]':'border-amber-200/50 bg-[#243342]')}>
            {success?<CheckCircle2 className="mb-2 h-9 w-9 text-emerald-200"/>:<XCircle className="mb-2 h-9 w-9 text-orange-200"/>}
            <h2 className="text-2xl font-black">{success?copy.correct:copy.incorrect}</h2>
            <p className="mt-2 font-extrabold text-amber-100">{copy.country}: {localizedCountryName(current.country,language)}</p>
            <p className="mt-1 text-sm text-[#e2ece9]">{copy.place}: {current.name}</p>
            {language==='tr'&&<p className="mt-2 text-xs leading-6 text-[#d5e3e2]">{current.fact}</p>}
            <p className="mt-3 text-lg font-black text-[#ffe0a1]">+{success?POINTS:0} {copy.points}</p>
          </section>
          <div className="rounded-2xl border border-white/15 bg-[#10283a] p-4 text-xs leading-6 text-blue-100">
            <p>{copy.credit}: {current.credit}</p>
            <a href={current.sourceUrl} target="_blank" rel="noopener noreferrer" className="mt-2 block break-words text-amber-200 underline">{copy.source}</a>
            <a href={current.licenseUrl} target="_blank" rel="noopener noreferrer" className="block text-amber-200 underline">{copy.license}: {current.license}</a>
          </div>
          <button type="button" className={primary} onClick={next}>{index+1>=rounds.length?copy.finish:copy.next}<ArrowRight className="h-5 w-5"/></button>
        </div>}
      </>}
      {phase==='finish'&&<div className="space-y-4">
        <section className="rounded-[25px] border border-amber-200/45 bg-gradient-to-b from-[#25485a] to-[#0d2438] p-7 text-center shadow-xl">
          <Trophy className="mx-auto h-12 w-12 text-amber-200"/>
          <h2 className="mt-3 text-xl font-black">{copy.finish}</h2>
          <p className="my-4 text-5xl font-black tabular-nums text-[#ffde9f]">{score.toLocaleString(language)}</p>
          <p className="text-sm font-bold text-blue-100/80">/ {rounds.length*POINTS} {copy.points}</p>
          <div className="mt-4 flex justify-center"><GeoStarRow count={stars?.current??getGeoStars('heritage360','tour')} large animated={Boolean(stars?.gained)}/></div>
          <p className="mt-3 text-xs text-blue-100/70">{copy.best}: {best.toLocaleString(language)}</p>
        </section>
        <button type="button" className={primary} onClick={restart}><RotateCcw className="h-5 w-5"/>{copy.playAgain}</button>
        <button type="button" className={secondary} onClick={onClose}>{copy.home}</button>
      </div>}
    </main>
  </section>;
}
