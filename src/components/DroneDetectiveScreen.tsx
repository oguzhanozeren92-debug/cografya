import { atlasApi } from '@/lib/atlasApi';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, Compass, Lightbulb, MapPin, PlayCircle, RefreshCcw, Trophy, X } from 'lucide-react';
import { type StreetRound, type PanoramaMedia } from '@/components/StreetPanorama';
import { StreetPhoto, warmStreetPhoto } from '@/components/StreetPhoto';
import { StreetWorldMap, guessedCorrectCountry } from '@/components/StreetWorldMap';
import { dronePanoramas, type DronePanorama } from '@/data/dronePanoramas';
import { Capacitor } from '@capacitor/core';
import { watchRewardedHeartAd } from '@/lib/rewardedAds';
import { haversineKm, locationPoints, type Coordinates } from '@/lib/streetLocations';
import { trackPlayEvent } from '@/lib/atlasTelemetry';
import { submitDroneScore } from '@/lib/droneLeaderboard';
import { LocationLeaguePanel } from '@/components/LocationLeaguePanel';
import { backend } from '@/lib/leaderboard';
import { useLanguage } from '@/lib/i18n';
import { localizedCountryName } from '@/lib/countryLanguage';
import { DRONE_HINT_TOTAL, droneHintCopy, droneHintText, droneHintPoints, droneHintChoices, dronePhotoFocus } from '@/lib/droneHints';

type Phase = 'view' | 'guess' | 'result' | 'finish';
type Answer = { id: string; city: string; country: string; km: number | null; points: number; skipped?: boolean; hintsUsed?: number };
const BEST_KEY = 'atlas-arena-drone-demo-best-v1';
const formatKm = (n: number) => new Intl.NumberFormat('tr-TR', {
  maximumFractionDigits: n < 10 ? 1 : 0,
}).format(n);
function shuffled(catalog: DronePanorama[] = dronePanoramas): DronePanorama[] {
  // Weekly league: one fixed set of five photos for everyone (Monday UTC).
  // Use the current shuffle through 25 Oct to preserve existing weekly scores.
  const today = new Date();
  const monday = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(),
    today.getUTCDate() - ((today.getUTCDay() + 6) % 7)));
  const weekly = monday.toISOString().slice(0, 10) >= '2026-10-26';
  const items = weekly
    ? [...catalog].sort((a, b) => a.id.localeCompare(b.id))
    : [...catalog];
  let random = Math.random;
  if (weekly) {
    const key = 'globriva-drone-five:' + monday.toISOString().slice(0, 10);
    let seed = 2166136261;
    for (let i = 0; i < key.length; i++) {
      seed = Math.imul(seed ^ key.charCodeAt(i), 16777619);
    }
    random = () => {
      seed = (seed + 0x6D2B79F5) >>> 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  // Keep a five-round game even when the remote library grows beyond 50.
  // Prefer different countries and progress from easier scenes to harder ones.
  const selected: DronePanorama[]=[];
  const usedCountries=new Set<string>();
  for(const item of items){
    if(selected.length>=5)break;
    if(usedCountries.has(item.country))continue;
    selected.push(item);usedCountries.add(item.country);
  }
  for(const item of items){
    if(selected.length>=5)break;
    if(!selected.some(row=>row.id===item.id))selected.push(item);
  }
  const difficulty={easy:0,medium:1,hard:2};
  return selected.sort((a,b)=>difficulty[a.difficulty]-difficulty[b.difficulty]);
}
function getBest(): number {
  try { return Number(localStorage.getItem(BEST_KEY)) || 0; }
  catch { return 0; }
}
function saveBest(score: number): number {
  const best = Math.max(score, getBest());
  try { localStorage.setItem(BEST_KEY, String(best)); } catch { /* Storage is optional. */ }
  return best;
}

export function DroneDetectiveScreen({ onClose, onGameComplete, playerName }: { onClose: () => void; onGameComplete?: () => void; playerName: string }) {
  const {language,t}=useLanguage();
  const [catalog,setCatalog] = useState<DronePanorama[]>(dronePanoramas);
  const [rows, setRows] = useState(shuffled);
  const [mediaById,setMediaById]=useState<Record<string,PanoramaMedia>>({});
  const [assetLoading,setAssetLoading]=useState(true);
  const [assetError,setAssetError]=useState('');
  const [assetsRetry,setAssetsRetry]=useState(0);
  useEffect(()=>{
    let active=true;
    const run=async()=>{
      setAssetLoading(true);setAssetError('');
      try{
        const response=await fetch(atlasApi('/api/drone/session?v=2'),{cache:'no-store'});
        const body=await response.json() as {media?:Array<{id:string;media:PanoramaMedia}>;rows?:DronePanorama[];error?:string};
        if(!response.ok||!body.media||body.media.length<5){
          throw new Error(body.error||t('Fotoğraf arşivi henüz hazır değil.'));
        }
        const map=Object.fromEntries(body.media.map(r=>[r.id,r.media]));
        const catalog=body.rows?.length ? body.rows : dronePanoramas;
        if(catalog.some(row=>!map[row.id]))throw new Error(t('Bazı fotoğraflar henüz doğrulanmadı.'));
        if(active){setCatalog(catalog);setRows(shuffled(catalog));setIndex(0);setMediaById(map);setAssetLoading(false);}
      }catch(e){if(active){setAssetLoading(false);setAssetError(e instanceof Error?e.message:t('Görüntüler yüklenemedi.'));}}
    };
    void run();
    return()=>{active=false;};
  },[assetsRetry]);
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('view');
  const [factOpen,setFactOpen]=useState(false);
  const [factRead,setFactRead]=useState(false);
  const [hintCount, setHintCount] = useState(0);
  const [hintBusy,setHintBusy]=useState(false);
  const [hintError,setHintError]=useState('');
  const hintBusyRef=useRef(false);
  const roundTokenRef=useRef(0);
  const native=Capacitor.isNativePlatform();
  const cancelPendingHint=()=>{
    roundTokenRef.current+=1;
    hintBusyRef.current=false;
    setHintBusy(false);
    setHintError('');
  };
  const [ready, setReady] = useState(false);
  const [guess, setGuess] = useState<Coordinates | null>(null);
  const [answered, setAnswered] = useState<Answer[]>([]);
  const [distance, setDistance] = useState<number | null>(null);
  const [roundPoints, setRoundPoints] = useState(0);
  const [best, setBest] = useState(getBest);
  const [showRank,setShowRank]=useState(false);
  const [saveState,setSaveState]=useState<'idle'|'saving'|'saved'|'error'|'offline'>('idle');
  const [saveError,setSaveError]=useState('');
  const [finalScore,setFinalScore]=useState(0);
  const current = rows[index];
  const hintCopy = droneHintCopy[language];
  const panoramaStart=useRef(0);
  const completionNotified=useRef(false);
  useEffect(()=>{trackPlayEvent({mode:'drone',event_type:'mode_start'});},[]);
  useEffect(()=>{panoramaStart.current=performance.now();trackPlayEvent({mode:'drone',event_type:'question_shown',question_id:current.id});},[current.id]);
  const close=()=>{cancelPendingHint();trackPlayEvent({mode:'drone',event_type:'mode_exit',detail:phase});onClose();};
  const score = answered.reduce((sum, item) => sum + item.points, 0);
  const panorama = useMemo<StreetRound>(() => ({
    id: current.id,
    ticket: '',
    media: mediaById[current.id] ?? { mode: 'equirectangular', image: '' },
    credit: { artist: current.artist, license: current.license, source: current.source },
  }), [current,mediaById]);

  const saveOnline=async(points:number)=>{
    if(!backend){setSaveState('offline');return;}
    setSaveState('saving');setSaveError('');
    try{
      await submitDroneScore(playerName,points);
      setSaveState('saved');
    }catch(e){
      setSaveError(e instanceof Error?e.message:'Skor kaydedilemedi.');
      setSaveState('error');
    }
  };
  const finishDrone=(allAnswers:Answer[])=>{
    const points=allAnswers.reduce((sum,row)=>sum+row.points,0);
    setBest(saveBest(points));
    setFinalScore(points);
    setPhase('finish');
    if(!completionNotified.current){
      completionNotified.current=true;
      void saveOnline(points);
      onGameComplete?.();
    }
  };
  const restart = () => {
    cancelPendingHint();
    completionNotified.current=false;
    setRows(shuffled(catalog)); setIndex(0); setPhase('view'); setReady(false);
    setGuess(null); setAnswered([]); setDistance(null); setRoundPoints(0);setHintCount(0);
    setSaveState('idle');setSaveError('');setFinalScore(0);setShowRank(false);
  };
  const confirm = () => {
    if (!guess || hintBusyRef.current || phase !== 'guess') return;
    const km = haversineKm(guess, { lat: current.lat, lng: current.lng });
    // Country identification is the aim: do not force users to pinpoint a
    // random park or garden to earn a decent score.
    const inCorrectCountry=guessedCorrectCountry(guess,current.country)===true;
    const base=Math.max(locationPoints(km),inCorrectCountry?3100:0);
    const points=droneHintPoints(base,hintCount);
    trackPlayEvent({mode:'drone',event_type:'street_guess',question_id:current.id,duration_ms:panoramaStart.current?performance.now()-panoramaStart.current:undefined});
    setDistance(km);
    setRoundPoints(points);
    setAnswered(previous => [...previous, {
      id: current.id, city: current.city, country: current.country, km, points, hintsUsed: hintCount,
    }]);
    setPhase('result');
  };
  const skipBroken=()=>{
    cancelPendingHint();
    trackPlayEvent({mode:'drone',event_type:'panorama_skipped',question_id:current.id});
    const skipped:Answer={id:current.id,city:current.city,country:current.country,km:null,points:0,skipped:true};
    const allAnswers=[...answered,skipped];
    setAnswered(allAnswers);
    if(index===rows.length-1){
      finishDrone(allAnswers);
    }else{
      setIndex(n=>n+1);setPhase('view');setReady(false);
      setGuess(null);setDistance(null);setRoundPoints(0);setHintCount(0);
    }
  };
  useEffect(()=>{
    if(mediaById[current.id] && index+1<rows.length){
      const next=rows[index+1];
      warmStreetPhoto({id:next.id,ticket:'',media:mediaById[next.id],
        credit:{artist:next.artist,license:next.license,source:next.source}});
    }
  },[index,current.id,rows,mediaById]);
  const next = () => {
    cancelPendingHint();
    if (index === rows.length - 1) {
      finishDrone(answered);
    } else {
      setIndex(n => n + 1); setPhase('view'); setGuess(null);
      setDistance(null); setRoundPoints(0); setReady(false); setHintCount(0);
      setFactOpen(false);setFactRead(false);
    }
  };
  useEffect(()=>{
    if(phase!=='result'||factOpen)return;
    const timeout=window.setTimeout(()=>next(),factRead?1700:4400);
    return ()=>window.clearTimeout(timeout);
  },[phase,index,factOpen,factRead,answered.length]);
  const unlockHint = async () => {
    if (!ready || hintBusyRef.current ||
      (phase !== 'view' && phase !== 'guess') || hintCount >= DRONE_HINT_TOTAL) return;
    const nextLevel=hintCount+1;
    const token=roundTokenRef.current;
    hintBusyRef.current=true;
    setHintBusy(true);
    setHintError('');
    try {
      // First hint is free. Further hints require a verified AdMob reward
      // in the native app. Dismissal, failure or lack of consent never unlocks.
      if(nextLevel>1 && native){
        const earned=await watchRewardedHeartAd();
        if(!earned)throw new Error(hintCopy.adFailed);
      }
      if(roundTokenRef.current!==token)return;
      setHintCount(nextLevel);
      trackPlayEvent({mode:'drone',event_type:'hint',question_id:current.id,detail:String(nextLevel)});
    } catch {
      if(roundTokenRef.current===token)setHintError(hintCopy.adFailed);
    } finally {
      if(roundTokenRef.current===token){
        hintBusyRef.current=false;
        setHintBusy(false);
      }
    }
  };
  const hintsPanel = () => (
    <section className="street-card space-y-2 p-3" aria-label={t('İpuçları')}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-1.5 text-sm font-black">
          <Lightbulb className="h-4 w-4 text-amber-200" /> {t('İpuçları')}
        </h2>
        <span className="text-[11px] font-bold text-amber-200">
          {hintCopy.maxPoints}: {droneHintPoints(5000,hintCount).toLocaleString(language)} {t('puan')}
        </span>
      </div>
      {hintCount > 0 && (
        <ol className="space-y-1.5" aria-live="polite">
          {Array.from({length:hintCount},(_,i)=>{
            const level = i + 1;
            return <li key={level} className="rounded-xl border border-amber-200/20 bg-amber-200/10 px-3 py-2 text-xs leading-5 text-amber-50">
              <strong className="mr-1 text-amber-200">{level}. {hintCopy.labels[i]}:</strong>
              {level===3 ? (
                <div className="mt-2 grid grid-cols-2 gap-2" aria-label={hintCopy.fourChoices}>
                  {(current.choices?.length===4 ? current.choices : droneHintChoices(current.id)).map(country=>
                    <span key={country} className="rounded-lg border border-amber-200/25 bg-[#173653] px-2 py-2 text-center font-bold">
                      {localizedCountryName(country,language)}
                    </span>
                  )}
                </div>
              ) : level===2 && current.hint
                ? (current.hint[language] || current.hint.en || current.hint.tr || '')
                : level===1 && current.regionCode
                  ? new Intl.DisplayNames([language==='zh'?'zh-CN':language==='pt'?'pt-BR':language,'en'],{type:'region'}).of(current.regionCode)
                  : droneHintText(current.id,level,language)}
            </li>;
          })}
        </ol>
      )}
      {hintCount < DRONE_HINT_TOTAL ? (
        <button type="button" onClick={()=>{void unlockHint();}} disabled={!ready||hintBusy}
          className="street-secondary w-full disabled:opacity-50">
          {native && hintCount>=1 ? <PlayCircle className="h-4 w-4 text-amber-200"/> : <Lightbulb className="h-4 w-4 text-amber-200"/>}
          {hintBusy ? hintCopy.loadingAd : native && hintCount>=1 ? hintCopy.watchAd : hintCopy.unlock}
          <span className="text-xs text-amber-200">({hintCount + 1}/{DRONE_HINT_TOTAL}) · −20%</span>
        </button>
      ) : <p className="text-xs font-semibold text-blue-100/75">{hintCopy.allUsed}</p>}
      {!native && hintCount>=1 && hintCount<DRONE_HINT_TOTAL &&
        <p className="text-[11px] text-blue-100/65">{hintCopy.preview}</p>}
      {hintError && <p className="text-xs font-semibold text-orange-200" role="alert">{hintError}</p>}
    </section>
  );
  return (
    <div className="globriva-screen street-screen fixed inset-0 z-[66] overflow-y-auto overscroll-contain text-white">
      <main className="globriva-content mx-auto min-h-full w-full max-w-[600px] px-4 pb-10 pt-[max(16px,env(safe-area-inset-top))]">
        <header className="mb-4 flex items-center gap-3">
          <button type="button" onClick={close} aria-label="Ana ekrana dön" className="street-round-button">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-200 text-[#20445a]">
            <Compass className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="text-[19px] font-black leading-tight">{t("Drone'dan Konumu Bul")}</h1>
            <p className="text-[11px] text-blue-200/80">{t('Havadan keşfet · Dünyada işaretle')}</p>
          </div>
          <button type="button" onClick={()=>setShowRank(v=>!v)} aria-label="Dron dünya ligi" className="street-round-button"><Trophy className="h-5 w-5 text-amber-300"/></button>
          <button type="button" onClick={close} aria-label="Kapat" className="street-round-button">
            <X className="h-4 w-4" />
          </button>
        </header>
        {showRank?(
          <LocationLeaguePanel mode="drone" playerName={playerName} onBack={()=>setShowRank(false)}/>
        ):assetLoading||assetError ? (
          <section className="street-card mx-auto max-w-lg space-y-3 p-6 text-center">
            <Compass className="mx-auto h-10 w-10 text-cyan-200"/>
            <h2 className="text-lg font-black">{t('Dron görüntü arşivi')}</h2>
            <p className="text-sm leading-6 text-blue-100/80">
              {assetLoading?t('Lisanslı görüntüler hazırlanıyor...'):assetError}
            </p>
            {!assetLoading&&<button type="button" className="street-primary w-full"
              onClick={()=>setAssetsRetry(x=>x+1)}>
              <RefreshCcw className="h-4 w-4"/> {t('Tekrar kontrol et')}
            </button>}
            <button type="button" className="street-secondary w-full" onClick={close}>{t('Ana menüye dön')}</button>
          </section>
        ) : phase === 'finish' ? (
          <div className="space-y-4">
            <section className="street-card p-5 text-center">
              <Trophy className="mx-auto mb-3 h-12 w-12 text-amber-300" />
              <p className="text-sm font-bold text-blue-100/80">Drone turunu bitirdin!</p>
              <h2 className="my-3 text-[42px] font-black text-[#ffda96] tabular-nums">{score.toLocaleString('tr-TR')}</h2>
              <p className="font-bold">/ {rows.length * 5000} {t('puan')}</p>
              <p className="mt-3 text-sm text-emerald-200">{t('Cihaz rekoru:')} {best.toLocaleString(language)}</p>
              <div aria-live="polite" className="mt-3 rounded-xl bg-white/5 px-3 py-3 text-xs text-blue-100">
                {saveState==='saving'?t('Skorun dünya ligine kaydediliyor...'):saveState==='saved'?t('Dünya ve haftalık lige kaydedildi!'):
                  saveState==='offline'?t('Cihaz rekorun saklandı. Dünya ligine bağlantı bekleniyor.'):
                  saveState==='error'?saveError:t('Skor kaydı hazırlanıyor...')}
                {saveState==='error'&&<button type="button" className="street-secondary mt-2 w-full" onClick={()=>{void saveOnline(finalScore);}}>{t('Kaydı tekrar dene')}</button>}
              </div>
            </section>
            <section className="street-card space-y-2 p-4">
              {answered.map((answer, i) => (
                <div key={answer.id} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-3 text-xs">
                  <span className="font-black text-amber-200">{i + 1}.</span>
                  <span className="min-w-0 flex-1 truncate">{answer.city}, {localizedCountryName(answer.country,language)}</span>
                  <span>{answer.skipped?t('Görüntü açılamadı'):formatKm(answer.km!)+' km'}</span>
                  {answer.hintsUsed ? <span className="text-amber-200" title={hintCopy.usedLabel}>💡{answer.hintsUsed}</span> : null}
                  <strong className="text-emerald-200">+{answer.points}</strong>
                </div>
              ))}
            </section>
            <button type="button" onClick={()=>setShowRank(true)} className="street-secondary w-full"><Trophy className="h-4 w-4"/> {t('Dünya sıralamasını gör')}</button>
            <button type="button" onClick={restart} className="street-primary w-full">
              <RefreshCcw className="h-4 w-4" /> {t('Tekrar uç')}
            </button>
            <button type="button" onClick={close} className="street-secondary w-full">{t('Ana ekrana dön')}</button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
              <span className="text-sm font-black">🚁 {t('Konum')} {index + 1}/{rows.length}</span>
              <span className="text-sm font-black text-[#ffda96]">{score.toLocaleString(language)} {t('puan')}</span>
            </div>
            {(phase === 'view' || phase === 'guess') && (
              <section className="street-card overflow-hidden p-2">
                <div className="h-[min(35dvh,275px)] min-h-[205px]">
                  <StreetPhoto key={current.id} round={panorama}
                    onReady={()=>{
                      trackPlayEvent({mode:'drone',event_type:'panorama_ready',question_id:current.id,duration_ms:panoramaStart.current?performance.now()-panoramaStart.current:undefined});
                      setReady(true);
                    }}
                    onError={message=>{
                      trackPlayEvent({mode:'drone',event_type:'panorama_error',question_id:current.id,detail:message.includes('açılamadı')?'timeout':'photo_error'});
                      setReady(false);
                    }}
                    onSkip={skipBroken}/>
                </div>
                <p className="px-2 pt-2 text-[11px] text-blue-100/75">{t('Fotoğrafı büyütebilir, sağ-sol oklarıyla diğer fotoğraflara geçebilirsin. Kaynak ve lisanslar tahminden sonra gösterilir.')}</p>
                <p className="mx-2 mb-1 mt-2 rounded-lg border border-cyan-200/15 bg-cyan-200/10 px-3 py-2 text-xs leading-5 text-blue-50">
                  <Compass className="mr-1 inline h-3.5 w-3.5 text-cyan-200"/>
                  <strong className="mr-1 text-cyan-100">{hintCopy.photoGuideLabel}:</strong>
                  {current.photoFocus?.[language] || current.photoFocus?.en || current.photoFocus?.tr || dronePhotoFocus(current.id,language)}
                </p>
              </section>
            )}
            {(phase === 'view' || phase === 'guess') && hintsPanel()}
            {phase === 'view' && (
              <section className="street-card space-y-3 p-4">
                <h2 className="font-black">{t('Sence burası neresi? 🚁')}</h2>
                <p className="text-sm leading-6 text-blue-100/75">{t('Dört yöne bak, fotoğrafı tam ekranda büyüt. Kıyıları, binaları, dağları ve araziyi incele. Sonra konumu haritada seç.')}</p>
                <button type="button" disabled={!ready||hintBusy} onClick={() => setPhase('guess')}
                  className="street-primary w-full disabled:opacity-50">
                  <MapPin className="h-5 w-5" /> {t('Haritada tahmin et')} <ArrowRight className="h-4 w-4" />
                </button>
              </section>
            )}
            {(phase === 'guess' || phase === 'result') && (
              <div className="space-y-3">
                {phase === 'result' && distance !== null && (
                  <section className="street-card space-y-1 p-4 text-center">
                    <CheckCircle2 className="mx-auto mb-1 h-7 w-7 text-emerald-300" />
                    <p className="text-sm text-blue-100/80">{t('Gerçek konuma uzaklığın')}</p>
                    <p className="text-[32px] font-black text-[#ffbb91]">{formatKm(distance)} km</p>
                    <p className="text-[25px] font-black text-[#8df3c0]">+{roundPoints.toLocaleString(language)} {t('puan')}</p>
                    <p className="pt-1 text-base font-black">{current.city}, {localizedCountryName(current.country,language)}</p>
                    {guessedCorrectCountry(guess,current.country)!==null&&(
                      <p className="text-sm font-bold text-[#ffdc95]">
                        {guessedCorrectCountry(guess,current.country)?t('Ülkeyi doğru buldun!'):t('Ülke tahminin farklı çıktı.')}
                      </p>
                    )}
                    <button type="button" onClick={()=>{setFactOpen(true);setFactRead(true)}} aria-haspopup="dialog" className="inline-flex min-h-10 items-center gap-2 rounded-full border border-cyan-200/50 bg-cyan-200/10 px-4 text-xs font-black text-cyan-100"><span className="text-lg" aria-hidden="true">ⓘ</span>{t('Bu konum hakkında bilgi')}</button>
                    {panorama.media.mode==='gallery' ? (
                      <div className="pt-3 space-y-1 text-[11px] leading-5 text-blue-100/70">
                        {panorama.media.images.map((photo,i)=>(
                          <p key={photo.url}>
                            {t('Fotoğraf')} {i+1}: {photo.credit.artist} ·{' '}
                            <a href={photo.credit.licenseUrl} target="_blank" rel="noopener noreferrer" className="underline">{photo.credit.license}</a> ·{' '}
                            <a href={photo.credit.source} target="_blank" rel="noopener noreferrer" className="underline">Kaynak</a>
                          </p>
                        ))}
                      </div>
                    ) : (
                      <p className="pt-3 text-[11px] leading-5 text-blue-100/70">
                        {t('Fotoğraf:')} {current.artist} · <a href={current.licenseUrl} target="_blank" rel="noopener noreferrer" className="underline">{current.license}</a>
                        {' '}· <a href={current.source} target="_blank" rel="noopener noreferrer" className="underline">Kaynak / lisans</a>
                      </p>
                    )}
                  </section>
                )}
                <section className="street-card space-y-3 p-3">
                  {phase === 'guess' && <p className="px-1 text-xs text-blue-100/80">{t('Haritaya dokun; yakınlaştırıp sürükleyerek ayrıntılı konum seçebilirsin.')}</p>}
                  <StreetWorldMap guess={guess}
                    actual={phase === 'result' ? { lat: current.lat, lng: current.lng } : null}
                    onGuess={setGuess} locked={phase === 'result'} />
                  {phase === 'guess' ? (
                    <>
                      <button type="button" disabled={!guess||hintBusy} onClick={confirm} className="street-primary w-full disabled:opacity-50">
                        <MapPin className="h-4 w-4" /> {t('Tahminimi onayla')}
                      </button>
                      <button type="button" onClick={() => setPhase('view')} className="street-secondary w-full">
                        {t('Panoramaya tekrar bak')}
                      </button>
                    </>
                  ) : (
                    <p className="text-center text-xs font-semibold text-blue-100/70">{t('Konum otomatik değişecek.')}</p>
                  )}
                </section>
              </div>
            )}
          </div>
        )}
        {phase==='result'&&factOpen&&(
          <div role="presentation" onClick={()=>setFactOpen(false)} className="fixed inset-0 z-[180] flex items-center justify-center bg-[#061323]/90 p-4 backdrop-blur-sm">
            <section role="dialog" aria-modal="true" aria-labelledby="droneFactTitle" onClick={e=>e.stopPropagation()} className="w-full max-w-md rounded-[23px] border border-amber-200/35 bg-gradient-to-b from-[#26475a] to-[#092238] p-5 shadow-2xl">
              <div className="mb-3 flex items-center justify-between text-xs font-black uppercase tracking-wider text-amber-200"><span>✦ Globriva · {t('Keşif notu')}</span><button autoFocus type="button" onClick={()=>setFactOpen(false)} aria-label={t('Kapat')} className="grid h-10 w-10 place-items-center rounded-full border border-white/20 bg-white/10 text-xl">×</button></div>
              <h3 id="droneFactTitle" className="text-xl font-black">{t(current.city)} · {localizedCountryName(current.country,language)}</h3>
              <p className="mt-4 text-sm leading-6 text-blue-50">{t(current.fact)}</p>
              <a href={current.source} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block text-xs font-semibold text-amber-200 underline">{t('Görüntü kaynağı')}</a>
            </section>
          </div>
        )}
        <p className="mt-5 text-center text-[11px] leading-5 text-blue-200/65">
          {t('Lisanslı konum fotoğrafları · Fotoğraflar arasında geçiş ve tam ekran.')}
          {t('Puanlar önce cihazda, Supabase kurulduysa dünya ve haftalık ligde saklanır.')}
        </p>
      </main>
    </div>
  );
}
