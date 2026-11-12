import { atlasApi } from '@/lib/atlasApi';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowLeft, ArrowRight, Camera, CheckCircle2, Globe2, Lightbulb,
  MapPin, Medal, PlayCircle, RefreshCcw, Trophy, X, XCircle,
} from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { StreetPanorama, type StreetRound } from '@/components/StreetPanorama';
import { StreetPhoto, warmStreetPhoto } from '@/components/StreetPhoto';
import { StreetWorldMap, guessedCorrectCountry } from '@/components/StreetWorldMap';
import { dronePanoramas, type DronePanorama } from '@/data/dronePanoramas';
import { droneHintChoices, droneHintCopy, droneHintText } from '@/lib/droneHints';
import { watchRewardedHeartAd } from '@/lib/rewardedAds';
import { getLocalStreetBest, rememberLocalStreetBest, submitStreetScore } from '@/lib/streetLeaderboard';
import { LocationLeaguePanel } from '@/components/LocationLeaguePanel';
import { backend } from '@/lib/leaderboard';
import { useLanguage } from '@/lib/i18n';
import { localizedCountryName } from '@/lib/countryLanguage';
import { streetLandmarkLabel, streetRegionLabel } from '@/lib/streetHintLocale';
import { STREET_ROUNDS, haversineKm, locationPoints, type Coordinates } from '@/lib/streetLocations';
import { trackPlayEvent } from '@/lib/atlasTelemetry';
import { awardGeoStars, getGeoStars, type GeoAward } from '@/lib/geoRewards';
import { GeoStarRow } from '@/components/GeoStarRow';

type Phase = 'view'|'guess'|'result'|'finish'|'ranking';
type Clue = {level:number;kind:'region'|'landmark'|'choices'|'drone';value?:string;options?:string[]};
// Legacy round type kept so older tour state still renders; no heritage rounds are created.
type HeritagePlace = {id:string;name:string;country:string;fact:string;license:string;licenseUrl:string};
type MixedRound = StreetRound & {source:'street'|'drone'|'heritage'; aerial?:DronePanorama; heritage?:HeritagePlace};
type Reveal = {
  correct:boolean;points:number;actual:Coordinates|null;km:number|null;
  distancePoints:number;countryBonus:number;hintPenalty:number;maxPoints:number;
  country:string;city:string;title:string;fact:string;
  credit:{artist:string;license:string;source:string};
};
type Completed = {
  id:string;country:string;city:string;points:number;correct:boolean;skipped?:boolean;
};
const MAX_ROUND_POINTS=[5000,4200,3400,2500,1500] as const;

export function StreetDetectiveScreen({
  onClose,onGameComplete,playerName,initialView='play',
}:{
  onClose:()=>void;onGameComplete?:()=>void;playerName:string;initialView?:'play'|'ranking';
}) {
  const {language,t}=useLanguage();
  const [phase,setPhase]=useState<Phase>(initialView==='ranking'?'ranking':'view');
  const [rounds,setRounds]=useState<MixedRound[]>([]);
  const [idx,setIdx]=useState(0);
  const [guess,setGuess]=useState<Coordinates|null>(null);
  const [hintCount,setHintCount]=useState(0);
  const [clues,setClues]=useState<Clue[]>([]);
  // A confirmed native reward is reusable if the hint API temporarily fails.
  // A network retry must not demand that the player watch the same ad again.
  const [earnedHintLevel,setEarnedHintLevel]=useState<number|null>(null);
  const [hintBusy,setHintBusy]=useState(false);
  const [hintError,setHintError]=useState('');
  const [reveal,setReveal]=useState<Reveal|null>(null);
  const [factOpen,setFactOpen]=useState(false);
  const [completed,setCompleted]=useState<Completed[]>([]);
  const [ready,setReady]=useState(false);
  const [busy,setBusy]=useState(false);
  const [loading,setLoading]=useState(initialView!=='ranking');
  const [error,setError]=useState('');
  const [showRank,setShowRank]=useState(initialView==='ranking');
  const [saveNote,setSaveNote]=useState('');
  const [saveState,setSaveState]=useState<'idle'|'saving'|'saved'|'error'|'offline'>('idle');
  const [lastFinalScore,setLastFinalScore]=useState(0);
  const [stageAward,setStageAward]=useState<GeoAward|null>(null);
  const [saveError,setSaveError]=useState('');
  const current=rounds[idx];
  const openedAt=useRef(0);
  const completionNotified=useRef(false);
  const score=completed.reduce((total,row)=>total+row.points,0);
  const native=Capacitor.isNativePlatform();

  const newGame=useCallback(async()=>{
    completionNotified.current=false;
    trackPlayEvent({mode:'street',event_type:'mode_start'});
    setLoading(true);setError('');setRounds([]);setIdx(0);setCompleted([]);
    setGuess(null);setReveal(null);setFactOpen(false);setClues([]);setHintCount(0);
    setEarnedHintLevel(null);setHintBusy(false);setHintError('');
    setReady(false);setShowRank(false);setSaveNote('');setPhase('view');
    setSaveState('idle');setLastFinalScore(0);setSaveError('');setStageAward(null);
    try{

      const [streetResponse,aerialResponse]=await Promise.all([
        fetch(atlasApi('/api/street/session'),{cache:'no-store'}),
        fetch(atlasApi('/api/drone/session?v=2'),{cache:'no-store'}),
      ]);
      const street=await streetResponse.json() as {rounds?:StreetRound[];error?:string};
      const aerial=await aerialResponse.json() as {
        rows?:DronePanorama[];media?:Array<{id:string;media:StreetRound['media']}>;error?:string;
      };
      if(!streetResponse.ok||!street.rounds||street.rounds.length!==STREET_ROUNDS)
        throw new Error(street.error||'Sokak görüntüleri hazırlanıyor.');
      if(!aerialResponse.ok||!Array.isArray(aerial.media)||aerial.media.length<2)
        throw new Error(aerial.error||'Hava görüntüleri hazırlanıyor.');
      const mediaById=new Map(aerial.media.map(row=>[row.id,row.media]));
      const vetted=(aerial.rows?.length?aerial.rows:dronePanoramas)
        .filter(row=>mediaById.has(row.id)).sort((a,b)=>a.id.localeCompare(b.id));
      if(vetted.length<2)throw new Error('Doğrulanmış hava görüntüleri bulunamadı.');
      // 3 street + 2 aerial questions per tour.
      // Each new tour advances through verified media instead of replaying the
      // identical five scenes for the entire week.
      const now=new Date();
      const monday=Date.UTC(now.getUTCFullYear(),now.getUTCMonth(),
        now.getUTCDate()-((now.getUTCDay()+6)%7));
      const week=Math.floor(monday/604800000);
      let attempt=0;
      try {
        const stored=Number(localStorage.getItem('globriva-street-tour-rotation-v1')||'0');
        if(Number.isSafeInteger(stored)&&stored>=0)attempt=stored%1000000;
      } catch { /* storage is optional */ }
      const rotation=week+attempt;
      const ground=[0,1].map(n=>({
        ...street.rounds![(rotation+n)%street.rounds!.length],source:'street' as const,
      }));
      const sky=[0,1].map(n=>{
        const row=vetted[(rotation+n)%vetted.length];
        return {id:'aerial:'+row.id,ticket:'',source:'drone' as const,aerial:row,
          media:mediaById.get(row.id)!,credit:{artist:row.artist,license:row.license,source:row.source}};
      });
      const thirdStreet:MixedRound={
        ...street.rounds![(rotation+2)%street.rounds!.length],source:'street',
      };
      const mixed:MixedRound[]=[ground[0],sky[0],thirdStreet,ground[1],sky[1]];
      warmStreetPhoto(mixed[0]);
      setRounds(mixed);
      try { localStorage.setItem('globriva-street-tour-rotation-v1',String(attempt+1)); }
      catch { /* storage is optional */ }
    }catch(e){setError(e instanceof Error?e.message:'Fotoğraf arşivi yüklenemedi.');}
    finally{setLoading(false);}
  },[]);
  useEffect(()=>{if(initialView==='play')void newGame();},[initialView,newGame]);
  useEffect(()=>{
    if(ready&&idx+1<rounds.length&&rounds[idx+1].source!=='heritage')
      warmStreetPhoto(rounds[idx+1]); // Never pre-download the full 360° photo.
  },[ready,idx,rounds]);
  useEffect(()=>{
    if(!current)return;
    openedAt.current=performance.now();
    trackPlayEvent({mode:'street',event_type:'question_shown',question_id:current.id});
  },[current?.id]);

  const close=()=>{
    trackPlayEvent({mode:'street',event_type:'mode_exit',detail:phase});
    onClose();
  };

  const confirm=async()=>{
    if(busy||hintBusy||!ready||!current||!guess||phase!=='guess')return;
    setBusy(true);setError('');
    try{

      let data:Reveal;
      if(current.source==='heritage'&&current.heritage){
        const place=current.heritage;
        const found=guessedCorrectCountry(guess,place.country);
        if(found===null)throw new Error('Bu ülkenin harita sınırı doğrulanamadı.');
        const points=found?5000:0;
        data={actual:null,km:null,correct:found,points,distancePoints:0,
          countryBonus:points,hintPenalty:0,maxPoints:5000,
          country:place.country,city:'',title:place.name,
          fact:language==='tr'?place.fact:'Explore the architecture and history of this landmark.',
          credit:current.credit};
      }else if(current.source==='drone'&&current.aerial){
        const aerial=current.aerial;
        const actual={lat:aerial.lat,lng:aerial.lng};
        const km=haversineKm(guess,actual);
        const correct=guessedCorrectCountry(guess,aerial.country)===true;
        const distancePoints=Math.max(locationPoints(km),correct?3100:0);
        const points=Math.min(distancePoints,MAX_ROUND_POINTS[hintCount]);
        data={actual,km,correct,points,distancePoints,countryBonus:0,
          hintPenalty:Math.max(0,distancePoints-points),maxPoints:MAX_ROUND_POINTS[hintCount],
          country:aerial.country,city:aerial.city,
          title:language==='tr'?'Havadan görünüm':'Aerial view',fact:aerial.fact,
          credit:current.credit};
      }else{
        const response=await fetch(atlasApi('/api/street/guess'),{
          method:'POST',headers:{'Content-Type':'application/json'},
          body:JSON.stringify({ticket:current.ticket,guess,hintsUsed:hintCount}),
        });
        const result=await response.json() as Reveal & {error?:string};
        if(!response.ok||typeof result.correct!=='boolean'||!Number.isInteger(result.points))
          throw new Error(result.error||'Konum tahmini hesaplanamadı.');
        data=result;
      }
      trackPlayEvent({mode:'street',event_type:'street_guess',question_id:current.id,
        duration_ms:openedAt.current?performance.now()-openedAt.current:undefined});
      setReveal(data);
      setCompleted(prev=>[...prev,{...data,id:current.id}]);
      setPhase('result');
    }catch(e){setError(e instanceof Error?e.message:'Tahmin gönderilemedi.');}
    finally{setBusy(false);}
  };
  const unlockHint=async()=>{
    if(!current||hintBusy||busy||!ready||(phase!=='view'&&phase!=='guess')||hintCount>=(current.source==='drone'?3:4))return;
    const level=hintCount+1;
    setHintBusy(true);setHintError('');
    try{
      if(earnedHintLevel!==level&&native){
        // This existing native AdMob helper returns true ONLY if its SDK
        // gives the reward. Closing, failed loading or lack of consent is not enough.
        const rewarded=await watchRewardedHeartAd();
        if(!rewarded){
          setHintError(t('Reklam tamamlanmadı. İpucu açılmadı.'));
          return;
        }
        setEarnedHintLevel(level);
      }

      let data:Clue;
      if(current.source==='drone'&&current.aerial){
        const aerial=current.aerial;
        if(level===3){
          const options=aerial.choices?.length===4?[...aerial.choices]:[...droneHintChoices(aerial.id)];
          if(options.length!==4)throw new Error('İpucu şu anda yüklenemedi.');
          data={level,kind:'choices',options};
        }else{
          // Use curated locale-specific hints for the original aerial set, and
          // verified editorial metadata when the aerial library grows.
          let value=droneHintText(aerial.id,level,language);
          if(!value&&level===1&&aerial.regionCode){
            try{value=new Intl.DisplayNames([language],{type:'region'}).of(aerial.regionCode)??'';}
            catch{value='';}
          }
          if(!value&&level===2)value=aerial.hint?.[language]||aerial.hint?.en||
            aerial.photoFocus?.[language]||aerial.photoFocus?.en||'';
          if(!value)throw new Error('İpucu şu anda yüklenemedi.');
          data={level,kind:'drone',value};
        }
      }else{
        const response=await fetch(atlasApi('/api/street/hint'),{
          method:'POST',headers:{'Content-Type':'application/json'},
          body:JSON.stringify({ticket:current.ticket,level}),
        });
        const result=await response.json() as Partial<Clue> & {error?:string};
        if(!response.ok||result.level!==level||!result.kind||
          (result.kind==='choices'?(!Array.isArray(result.options)||result.options.length!==4):!result.value))
          throw new Error(result.error||'İpucu şu anda yüklenemedi.');
        data={level,kind:result.kind,value:result.value,options:result.options};
      }
      setClues(old=>[...old,{level,kind:data.kind as Clue['kind'],value:data.value,options:data.options}]);
      setHintCount(level);
      setEarnedHintLevel(null);
      trackPlayEvent({mode:'street',event_type:'hint',question_id:current.id,detail:String(level)});
    }catch(e){
      setHintError(e instanceof Error?t(e.message):t('İpucu şu anda yüklenemedi.'));
    }finally{setHintBusy(false);}
  };

  const saveOnline=async(finalScore:number)=>{
    if(!backend){setSaveState('offline');return;}
    setSaveState('saving');setSaveError('');
    try{await submitStreetScore(playerName,finalScore);setSaveState('saved');}
    catch(e){setSaveError(e instanceof Error?e.message:'Skor kaydedilemedi.');setSaveState('error');}
  };
  const finishGame=(rows:Completed[])=>{
    const points=rows.reduce((total,row)=>total+row.points,0);
    setStageAward(awardGeoStars('street','tour',points,STREET_ROUNDS*5000,rows.length===STREET_ROUNDS));
    const best=rememberLocalStreetBest(points);
    setLastFinalScore(points);
    setSaveNote(t('Cihaz rekorun:')+' '+best.toLocaleString(language)+' '+t('puan')+'.');
    setPhase('finish');
    if(!completionNotified.current){
      completionNotified.current=true;
      void saveOnline(points);
      onGameComplete?.();
    }
  };
  const resetForNext=()=>{
    setIdx(i=>i+1);setGuess(null);setClues([]);setHintCount(0);
    setEarnedHintLevel(null);setHintBusy(false);setHintError('');
    setReveal(null);setFactOpen(false);setReady(false);setError('');setPhase('view');
  };
  const advance=()=>{
    if(completed.length>=STREET_ROUNDS)finishGame(completed);
    else resetForNext();
  };
  const skipBroken=()=>{
    if(!current||(phase!=='view'&&phase!=='guess'))return;
    trackPlayEvent({mode:'street',event_type:'panorama_skipped',question_id:current.id});
    const next:Completed[]=[...completed,{id:current.id,skipped:true,
      city:'',country:'',correct:false,points:0}];
    setCompleted(next);
    if(next.length>=STREET_ROUNDS)finishGame(next);
    else resetForNext();
  };
  const banner=(message:string)=>(
    <section className="street-card p-5 text-center">
      <Camera className="mx-auto mb-3 h-9 w-9 text-[#ffba94]"/>
      <h2 className="text-lg font-black">{t('Sokak Dedektifi hazırlanıyor')}</h2>
      <p className="mt-3 text-sm leading-6 text-blue-100/80">{t(message)}</p>
      <button type="button" className="street-secondary mt-4 w-full" onClick={()=>{void newGame();}}>
        <RefreshCcw className="h-4 w-4"/> {t('Yeniden kontrol et')}
      </button>
    </section>
  );
  const clueText=(clue:Clue)=>{
    if(clue.kind==='region')return streetRegionLabel(clue.value??'',language);
    if(clue.kind==='landmark')return streetLandmarkLabel(clue.value??'',language);
    if(clue.kind==='drone')return clue.value??'';
    return '';
  };
  const hintNames=[
    t('Kıta ipucu'),t('Bölge ipucu'),t('Kültür ipucu'),t('4 ülke seçeneği'),
  ];
  const availableHints=current?.source==='drone'?3:4;
  const displayedHintNames=current?.source==='drone'?[...droneHintCopy[language].labels]:hintNames;
  const hintsPanel=()=>{
    if(current?.source==='heritage'||(phase!=='view'&&phase!=='guess'))return null;
    return <section className="street-card space-y-3 p-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-sm font-black">
          <Lightbulb className="h-4 w-4 text-amber-200"/> {t('İpuçları')}
        </h2>
        <span className="text-xs font-extrabold text-amber-200">
          {t('Bu tur:')} {MAX_ROUND_POINTS[hintCount].toLocaleString(language)} {t('puan')}
        </span>
      </div>
      {clues.length>0&&<div className="space-y-2">
        {clues.map(clue=><div key={clue.level} className="rounded-xl border border-amber-200/20 bg-amber-200/10 px-3 py-2 text-xs text-amber-50">
          <span className="mr-2 font-extrabold">{displayedHintNames[clue.level-1]}:</span>
          {clue.kind==='choices'&&clue.options?(
            <div className="mt-2 grid grid-cols-2 gap-2" aria-label={t('Dördüncü ipucunun ülke seçenekleri')}>
              {clue.options.map(country=><div key={country} className="rounded-xl border border-amber-200/20 bg-[#1a3d57] px-2 py-2 text-center font-bold">
                {localizedCountryName(country,language)}
              </div>)}
            </div>
          ):<strong>{clueText(clue)}</strong>}
        </div>)}
      </div>}
      {hintCount<availableHints?(
        <button type="button" disabled={!ready||hintBusy||busy}
          onClick={()=>{void unlockHint();}}
          className="street-secondary w-full disabled:opacity-50">
          {native?<PlayCircle className="h-4 w-4"/>:<Lightbulb className="h-4 w-4"/>}
          {hintBusy?t('İpucu hazırlanıyor...'):earnedHintLevel===hintCount+1?t('İpucunu tekrar yükle'):
            native?t('Reklam izle ve ipucunu aç'):t('İpucunu aç')}
          <span className="ml-1 text-amber-200">
            {displayedHintNames[hintCount]} · -{(MAX_ROUND_POINTS[hintCount]-MAX_ROUND_POINTS[hintCount+1]).toLocaleString(language)}
          </span>
        </button>
      ):<p className="text-xs font-semibold text-blue-100/70">{language==='tr'?'Tüm ipuçları açıldı.':'All hints revealed.'}</p>}
      {!native&&hintCount<availableHints&&<p className="text-[11px] text-blue-100/65">
        {t('Web önizlemesinde reklam gösterilmez; mobil uygulamada ödüllü reklam gerekir.')}
      </p>}
      {hintError&&<p role="alert" className="text-xs font-semibold text-orange-200">{hintError}</p>}
    </section>;
  };

  return (
    <div className="globriva-screen street-screen fixed inset-0 z-[65] overflow-y-auto overscroll-contain text-white">
      <main className="globriva-content mx-auto min-h-full w-full max-w-[600px] px-4 pb-10 pt-[max(16px,env(safe-area-inset-top))]">
        <header className="mb-4 flex items-center gap-3">
          <button type="button" onClick={close} aria-label={t('Ana ekrana dön')} className="street-round-button">
            <ArrowLeft className="h-5 w-5"/>
          </button>
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#ffab88] text-[#253859]">
            <Camera className="h-5 w-5"/>
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="text-[19px] font-black leading-tight">{t('Sokak Dedektifi')}</h1>
            <p className="text-[11px] text-blue-200/80">{t('Fotoğrafa bak, ülkedeki konumu işaretle!')}</p>
          </div>
          <button type="button" onClick={()=>setShowRank(v=>!v)} aria-label={t('Dünya Sıralaması')} className="street-round-button">
            <Trophy className="h-5 w-5 text-[#ffd58c]"/>
          </button>
          <button type="button" onClick={close} aria-label={t('Kapat')} className="street-round-button">
            <X className="h-4 w-4"/>
          </button>
        </header>

        {showRank||phase==='ranking'?(
          <LocationLeaguePanel mode="street" playerName={playerName}
            onBack={()=>{setShowRank(false);if(phase==='ranking')void newGame();}}/>
        ):phase==='finish'?(
          <div className="space-y-4">
            <section className="street-card p-5 text-center">
              <Medal className="mx-auto mb-3 h-12 w-12 text-[#ffce7d]"/>
              <p className="text-sm font-bold text-blue-100/80">{t('Ülke turunu tamamladın!')}</p>
              <h2 className="my-3 text-[42px] font-black text-[#ffda96] tabular-nums">{score.toLocaleString(language)}</h2>
              <p className="font-bold">/ 25.000 {t('puan')}</p>
              <div className="mt-4 rounded-2xl border border-amber-300/30 bg-amber-300/10 px-3 py-3" aria-live="polite">
                <div className="text-xs font-extrabold tracking-widest text-amber-200">{language==='tr'?'SOKAK İZLERİ · YILDIZLAR':'STREET TRAILS · STARS'}</div>
                <div className="mt-2"><GeoStarRow count={stageAward?.current ?? getGeoStars('street','tour')} large animated={Boolean(stageAward?.gained)}/></div>
                <p className="mt-2 text-[11px] text-slate-200">{language==='tr'?'Puanın %70/%80/%90 eşiklerini geçtikçe yıldız kazanırsın.':'Earn stars at 70/80/90% of the possible points.'}</p>
                {stageAward?.newBadges.map(b=><p key={b.id} className="mt-2 rounded-lg bg-amber-300/10 p-2 text-xs font-bold text-amber-100">{b.icon} {language==='tr'?'Yeni rozet: ':'New badge: '}{language==='tr'?b.tr:b.en}</p>)}
              </div>
              <p className="mt-3 rounded-xl bg-white/5 px-3 py-2 text-xs leading-5 text-blue-100">{saveNote}</p>
              <div aria-live="polite" className="mt-2 rounded-xl bg-white/5 p-3 text-xs text-blue-100">
                {saveState==='saving'?t('Skorun dünya ligine kaydediliyor...'):saveState==='saved'?t('Dünya ve haftalık lige kaydedildi!'):
                  saveState==='offline'?t('Cihaz skorun saklandı. Dünya ligi için Supabase bağlantısı bekleniyor.'):
                  saveState==='error'?saveError:t('Skor kaydı hazırlanıyor...')}
                {saveState==='error'&&<button type="button" className="street-secondary mt-2 w-full"
                  onClick={()=>{void saveOnline(lastFinalScore);}}>{t('Kaydı tekrar dene')}</button>}
              </div>
            </section>
            <section className="street-card space-y-2 p-4">
              {completed.map((row,i)=><div key={row.id} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-3 text-xs">
                <span className="font-black text-amber-200">{i+1}.</span>
                <span className="min-w-0 flex-1 truncate">
                  {row.skipped?t('Görüntü açılamadı'):`${localizedCountryName(row.country,language)} · ${row.city}`}
                </span>
                <span className={row.correct?'font-bold text-emerald-200':'text-orange-200'}>
                  {row.skipped?t('Geçildi'):row.correct?t('Doğru'):t('Yanlış')}
                </span>
                <strong className="text-emerald-200">+{row.points.toLocaleString(language)}</strong>
              </div>)}
            </section>
            <button type="button" className="street-secondary w-full" onClick={()=>setShowRank(true)}>
              <Trophy className="h-4 w-4"/> {t('Dünya sıralamasını gör')}
            </button>
            <button type="button" className="street-primary w-full" onClick={()=>{void newGame();}}>
              <RefreshCcw className="h-4 w-4"/> {t('Yeni dünya turu')}
            </button>
          </div>
        ):loading?banner('Lisanslı fotoğraf arşivi kontrol ediliyor...'):
          !current?banner(error||'Doğrulanmış konum fotoğrafları hazırlanıyor.'):(
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
              <span className="flex items-center gap-2 text-sm font-black">
                <Globe2 className="h-4 w-4 text-emerald-200"/> {t('Tur')} {idx+1}/{STREET_ROUNDS} <span className="rounded-full bg-cyan-300/10 px-2 py-0.5 text-[10px] text-cyan-100">{current.source==='heritage'?'🏛️':current.source==='drone'?'🚁':'📷'} {current.source==='heritage'?(language==='tr'?'360° Tarihi Mekân':'360° Historic Site'):current.source==='drone'?(language==='tr'?'Havadan':'Aerial'):(language==='tr'?'Sokak':'Street')}</span>
              </span>
              <span className="text-sm font-black tabular-nums text-[#ffda96]">
                {score.toLocaleString(language)} {t('puan')}
              </span>
            </div>

            {phase==='view'&&(
              <>
                <div className="street-card overflow-hidden p-2">
                  <div className={current.source==='heritage'?'h-[min(52dvh,450px)] min-h-[275px]':'h-[min(38dvh,305px)] min-h-[205px]'}>
                    {current.source==='heritage'?<StreetPanorama key={current.id} round={current} onSkip={skipBroken}
                      skipLabel={language==='tr'?'Başka 360° mekân dene (puan kaybı yok)':'Try another 360° place (no score penalty)'}
                      onReady={()=>{setReady(true);setError('')}}
                      onError={message=>setError(message)}/>:<StreetPhoto key={current.id} round={current} onSkip={skipBroken}
                      onReady={()=>{
                        trackPlayEvent({mode:'street',event_type:'panorama_ready',question_id:current.id,
                          duration_ms:openedAt.current?performance.now()-openedAt.current:undefined});
                        setReady(true);setError('');
                      }}
                      onError={message=>{
                        trackPlayEvent({mode:'street',event_type:'panorama_error',question_id:current.id,detail:message});
                        setError(message);
                      }}/>}
                  </div>
                  <p className="px-2 py-2 text-[11px] text-blue-100/75">
                    {current.source==='heritage'?(language==='tr'?'360° görüntüyü parmağınla döndür, hangi ülkede olduğunu bul.':'Rotate the 360° view and find the country.'):current.source==='drone'?(language==='tr'?'Hava görüntüsündeki araziyi ve yapıları incele.':'Explore the landscape and buildings from above.'):t('Fotoğrafı dört yönden incele; tam konuma yaklaşmaya çalış.')}
                  </p>
                </div>
                {hintsPanel()}
                {error&&<p role="alert" className="text-xs text-orange-200">{t(error)}</p>}
                <button type="button" disabled={!ready||busy||hintBusy}
                  onClick={()=>setPhase('guess')} className="street-primary w-full disabled:opacity-50">
                  <MapPin className="h-4 w-4"/> {t('Dünya haritasında konum seç')}
                  <ArrowRight className="h-4 w-4"/>
                </button>
              </>
            )}

            {phase==='guess'&&(
              <>
                <section className="street-card space-y-3 p-3">
                  <h2 className="text-base font-black">{t('Sence fotoğraf hangi ülkeden?')}</h2>
                  <p className="text-xs leading-5 text-blue-100/75">
                    {current.source==='heritage'?(language==='tr'?'Bu tarihî mekân hangi ülkede? Haritada ülkenin herhangi bir yerine dokun.':'Which country is this historic landmark in? Tap anywhere inside the country.'):t('Fotoğrafın gerçek konumuna yaklaşmaya çalış. Ülkeyi doğru bulursan ekstra puan kazanırsın.')}
                  </p>
                  <StreetWorldMap guess={guess} actual={null} onGuess={setGuess}/>
                  <button type="button" disabled={!ready||!guess||hintBusy||busy}
                    onClick={()=>{void confirm();}} className="street-primary w-full disabled:opacity-50">
                    <MapPin className="h-4 w-4"/>
                    {busy?t('Hesaplanıyor...'):t('Konumu onayla')}
                    <ArrowRight className="h-4 w-4"/>
                  </button>
                  <button type="button" className="street-secondary w-full" onClick={()=>{setReady(false);setError('');setPhase('view')}}>
                    <Camera className="h-4 w-4"/> {t('Fotoğrafa tekrar bak')}
                  </button>
                </section>
                {hintsPanel()}
                {error&&<p role="alert" className="text-xs text-orange-200">{t(error)}</p>}
              </>
            )}

            {phase==='result'&&reveal&&(
              <section className="street-card space-y-3 p-5 text-center" aria-live="polite">
                {reveal.correct
                  ?<CheckCircle2 className="mx-auto h-12 w-12 text-emerald-300"/>
                  :<XCircle className="mx-auto h-12 w-12 text-orange-300"/>}
                <h2 className="text-xl font-black">
                  {reveal.correct?t('Ülkeyi doğru buldun!'):t('Ülke tahminin farklı çıktı.')}
                </h2>
                <p className="text-[32px] font-black text-amber-200">
                  +{reveal.points.toLocaleString(language)} {t('puan')}
                </p>
                <div className="space-y-1 rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-left text-xs text-blue-100">
                  {reveal.km===null?<p>{language==='tr'?'360° tarihî mekân sorusu: sadece ülke doğruluğu puanlanır.':'Historic 360° question: only the country is scored.'}</p>:<p className="flex justify-between gap-2"><span>{t('Gerçek konuma uzaklığın')}</span><strong>{new Intl.NumberFormat(language,{maximumFractionDigits:1}).format(reveal.km)} km</strong></p>}
                  {reveal.km!==null&&<p className="flex justify-between gap-2"><span>{t('Mesafe puanı')}</span><strong>+{reveal.distancePoints.toLocaleString(language)}</strong></p>}
                  <p className="flex justify-between gap-2"><span>{reveal.km===null?(language==='tr'?'Doğru ülke puanı':'Country points'):t('Doğru ülke bonusu')}</span><strong className="text-emerald-200">+{reveal.countryBonus.toLocaleString(language)}</strong></p>
                  {reveal.km!==null&&<p className="flex justify-between gap-2"><span>{t('İpucu puan kesintisi')}</span><strong className="text-orange-200">−{reveal.hintPenalty.toLocaleString(language)}</strong></p>}
                </div>
                <p className="text-sm text-blue-100/80">{t('Doğru ülke:')}</p>
                <p className="text-2xl font-black text-emerald-200">
                  {localizedCountryName(reveal.country,language)}
                </p>
                <p className="text-xs text-blue-100/75">{reveal.city?reveal.city+' · ':''}{t(reveal.title)}</p>
                <StreetWorldMap guess={guess} actual={reveal.actual} onGuess={()=>{}} locked/>
                <button type="button" onClick={()=>{setFactOpen(true);}} aria-haspopup="dialog" className="mx-auto inline-flex min-h-10 items-center gap-2 rounded-full border border-cyan-200/50 bg-white/10 px-4 text-sm font-black text-cyan-100"><span className="text-lg" aria-hidden="true">ⓘ</span>{t('Ülke ve konum hakkında bilgi')}</button>
                <p className="text-[11px] leading-5 text-blue-100/65">
                  {t('Görüntü:')} {reveal.credit.artist} · {reveal.credit.license} ·{' '}
                  <a href={reveal.credit.source} target="_blank" rel="noopener noreferrer"
                    className="underline underline-offset-2">{t('Kaynak / lisans')}</a>
                  {current.source==='heritage'&&current.heritage&&<a href={current.heritage.licenseUrl} target="_blank" rel="noopener noreferrer" className="ml-2 underline underline-offset-2">{current.heritage.license}</a>}
                </p>
                <button type="button" onClick={advance} className="street-primary mt-3 min-h-12 w-full"
                  aria-label={t('Sonraki konuma geç')}>
                  {t('Sonraki konuma geç')} <ArrowRight className="h-4 w-4"/>
                </button>
              </section>
            )}
          </div>
        )}
        {phase==='result'&&reveal&&factOpen&&(
          <div className="fixed inset-0 z-[180] flex items-center justify-center bg-[#071328]/90 p-4 backdrop-blur-sm" role="presentation" onClick={()=>setFactOpen(false)}>
            <section role="dialog" aria-modal="true" aria-labelledby="streetFactTitle" onClick={e=>e.stopPropagation()} className="w-full max-w-md rounded-[23px] border border-amber-200/35 bg-gradient-to-b from-[#22445b] to-[#0b2037] p-5 shadow-2xl">
              <div className="mb-3 flex items-center justify-between text-xs font-black uppercase tracking-wider text-amber-200"><span>✦ Globriva · {t('Keşif notu')}</span><button autoFocus type="button" aria-label={t('Kapat')} onClick={()=>setFactOpen(false)} className="grid h-10 w-10 place-items-center rounded-full border border-white/20 bg-white/10 text-xl">×</button></div>
              <h3 id="streetFactTitle" className="text-xl font-black">{localizedCountryName(reveal.country,language)}</h3>
              <p className="mt-1 text-sm font-semibold text-cyan-200">{reveal.city?reveal.city+' · ':''}{t(reveal.title)}</p>
              <p className="mt-4 text-sm leading-6 text-blue-50">{t(reveal.fact)}</p>
              <a href={reveal.credit.source} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block text-xs font-bold text-amber-200 underline">{t('Fotoğraf kaynağı ve lisansı')}</a>
            </section>
          </div>
        )}
        <p className="mt-5 text-center text-[11px] text-blue-200/65">
          {language==='tr'?'Sokak, drone ve 360° tarihî mekânlar · 5 karma konum sorusu':'Street, aerial and 360° historical places · 5 mixed location questions'}
          {phase==='finish'?' · '+t('Cihaz rekorun:')+' '+getLocalStreetBest().toLocaleString(language):''}
        </p>
      </main>
    </div>
  );
}
