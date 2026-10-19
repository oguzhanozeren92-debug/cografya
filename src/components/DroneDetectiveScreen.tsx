import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, Compass, MapPin, RefreshCcw, Trophy, X } from 'lucide-react';
import { type StreetRound, type PanoramaMedia } from '@/components/StreetPanorama';
import { StreetPhoto, warmStreetPhoto } from '@/components/StreetPhoto';
import { StreetWorldMap, guessedCorrectCountry } from '@/components/StreetWorldMap';
import { dronePanoramas, type DronePanorama } from '@/data/dronePanoramas';
import { haversineKm, locationPoints, type Coordinates } from '@/lib/streetLocations';
import { trackPlayEvent } from '@/lib/atlasTelemetry';
import { submitDroneScore } from '@/lib/droneLeaderboard';
import { LocationLeaguePanel } from '@/components/LocationLeaguePanel';
import { backend } from '@/lib/leaderboard';
import { useLanguage } from '@/lib/i18n';
import { localizedCountryName } from '@/lib/countryLanguage';

type Phase = 'view' | 'guess' | 'result' | 'finish';
type Answer = { id: string; city: string; country: string; km: number | null; points: number; skipped?: boolean };
const BEST_KEY = 'atlas-arena-drone-demo-best-v1';
const formatKm = (n: number) => new Intl.NumberFormat('tr-TR', {
  maximumFractionDigits: n < 10 ? 1 : 0,
}).format(n);
function shuffled(): DronePanorama[] {
  const items = [...dronePanoramas];
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
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
        const response=await fetch('/api/drone/session',{cache:'no-store'});
        const body=await response.json() as {media?:Array<{id:string;media:PanoramaMedia}>;error?:string};
        if(!response.ok||!body.media||body.media.length<5){
          throw new Error(body.error||t('Dron 360° arşivi henüz hazır değil.'));
        }
        const map=Object.fromEntries(body.media.map(r=>[r.id,r.media]));
        if(dronePanoramas.some(row=>!map[row.id]))throw new Error(t('Bazı drone panoramaları henüz doğrulanmadı.'));
        if(active){setMediaById(map);setAssetLoading(false);}
      }catch(e){if(active){setAssetLoading(false);setAssetError(e instanceof Error?e.message:t('Görüntüler yüklenemedi.'));}}
    };
    void run();
    return()=>{active=false;};
  },[assetsRetry]);
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('view');
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
  const panoramaStart=useRef(0);
  const completionNotified=useRef(false);
  useEffect(()=>{trackPlayEvent({mode:'drone',event_type:'mode_start'});},[]);
  useEffect(()=>{panoramaStart.current=performance.now();trackPlayEvent({mode:'drone',event_type:'question_shown',question_id:current.id});},[current.id]);
  const close=()=>{trackPlayEvent({mode:'drone',event_type:'mode_exit',detail:phase});onClose();};
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
    completionNotified.current=false;
    setRows(shuffled()); setIndex(0); setPhase('view'); setReady(false);
    setGuess(null); setAnswered([]); setDistance(null); setRoundPoints(0);
    setSaveState('idle');setSaveError('');setFinalScore(0);setShowRank(false);
  };
  const confirm = () => {
    if (!guess || phase !== 'guess') return;
    const km = haversineKm(guess, { lat: current.lat, lng: current.lng });
    const points = locationPoints(km);
    trackPlayEvent({mode:'drone',event_type:'street_guess',question_id:current.id,duration_ms:panoramaStart.current?performance.now()-panoramaStart.current:undefined});
    setDistance(km);
    setRoundPoints(points);
    setAnswered(previous => [...previous, {
      id: current.id, city: current.city, country: current.country, km, points,
    }]);
    setPhase('result');
  };
  const skipBroken=()=>{
    trackPlayEvent({mode:'drone',event_type:'panorama_skipped',question_id:current.id});
    const skipped:Answer={id:current.id,city:current.city,country:current.country,km:null,points:0,skipped:true};
    const allAnswers=[...answered,skipped];
    setAnswered(allAnswers);
    if(index===rows.length-1){
      finishDrone(allAnswers);
    }else{
      setIndex(n=>n+1);setPhase('view');setReady(false);
      setGuess(null);setDistance(null);setRoundPoints(0);
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
    if (index === rows.length - 1) {
      finishDrone(answered);
    } else {
      setIndex(n => n + 1); setPhase('view'); setGuess(null);
      setDistance(null); setRoundPoints(0); setReady(false);
    }
  };
  return (
    <div className="street-screen fixed inset-0 z-[66] overflow-y-auto overscroll-contain text-white">
      <main className="mx-auto min-h-full w-full max-w-[600px] px-4 pb-10 pt-[max(16px,env(safe-area-inset-top))]">
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
                <p className="px-2 py-2 text-[11px] text-blue-100/75">{t('Fotoğrafı büyütebilir, sağ-sol oklarıyla çevreyi inceleyebilirsin. Görselin lisansı tahminden sonra gösterilir.')}</p>
              </section>
            )}
            {phase === 'view' && (
              <section className="street-card space-y-3 p-4">
                <h2 className="font-black">{t('Sence burası neresi? 🚁')}</h2>
                <p className="text-sm leading-6 text-blue-100/75">{t('Dört yöne bak, fotoğrafı tam ekranda büyüt. Kıyıları, binaları, dağları ve araziyi incele. Sonra konumu haritada seç.')}</p>
                <button type="button" disabled={!ready} onClick={() => setPhase('guess')}
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
                    <p className="text-xs leading-5 text-blue-100/75">{current.fact}</p>
                    <p className="pt-3 text-[11px] leading-5 text-blue-100/70">
                      {t('Fotoğraf:')} {current.artist} · <a href={current.licenseUrl} target="_blank" rel="noopener noreferrer" className="underline">{current.license}</a>
                      {' '}· <a href={current.source} target="_blank" rel="noopener noreferrer" className="underline">Kaynak / lisans</a>
                    </p>
                  </section>
                )}
                <section className="street-card space-y-3 p-3">
                  {phase === 'guess' && <p className="px-1 text-xs text-blue-100/80">{t('Haritaya dokun; yakınlaştırıp sürükleyerek ayrıntılı konum seçebilirsin.')}</p>}
                  <StreetWorldMap guess={guess}
                    actual={phase === 'result' ? { lat: current.lat, lng: current.lng } : null}
                    onGuess={setGuess} locked={phase === 'result'} />
                  {phase === 'guess' ? (
                    <>
                      <button type="button" disabled={!guess} onClick={confirm} className="street-primary w-full disabled:opacity-50">
                        <MapPin className="h-4 w-4" /> {t('Tahminimi onayla')}
                      </button>
                      <button type="button" onClick={() => setPhase('view')} className="street-secondary w-full">
                        {t('Panoramaya tekrar bak')}
                      </button>
                    </>
                  ) : (
                    <button type="button" onClick={next} className="street-primary w-full">
                      {index === rows.length - 1 ? t('Sonuçları gör') : t('Sonraki drone konumu')} <ArrowRight className="h-4 w-4" />
                    </button>
                  )}
                </section>
              </div>
            )}
          </div>
        )}
        <p className="mt-5 text-center text-[11px] leading-5 text-blue-200/65">
          {t('Ücretsiz 5 konumluk pilot · Lisanslı gerçek dron görüntüleri · Dört yöne bakış ve tam ekran.')}
          {t('Puanlar önce cihazda, Supabase kurulduysa dünya ve haftalık ligde saklanır.')}
        </p>
      </main>
    </div>
  );
}
