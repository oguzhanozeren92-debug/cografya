import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Camera, CheckCircle2, Globe2, HelpCircle, Lightbulb, Medal, RefreshCcw, Trophy, X, XCircle } from 'lucide-react';
import type { StreetRound } from '@/components/StreetPanorama';
import { StreetPhoto, warmStreetPhoto } from '@/components/StreetPhoto';
import { getLocalStreetBest, rememberLocalStreetBest, submitStreetScore } from '@/lib/streetLeaderboard';
import { LocationLeaguePanel } from '@/components/LocationLeaguePanel';
import { backend } from '@/lib/leaderboard';
import { useLanguage } from '@/lib/i18n';
import { localizedCountryName } from '@/lib/countryLanguage';
import { streetLandmarkLabel, streetRegionLabel } from '@/lib/streetHintLocale';
import { STREET_ROUNDS } from '@/lib/streetLocations';
import { trackPlayEvent } from '@/lib/atlasTelemetry';

type Phase = 'guess'|'result'|'finish'|'ranking';
type Reveal = {
  correct:boolean;points:number;country:string;city:string;title:string;fact:string;
  credit:{artist:string;license:string;source:string};
};
type Completed = {
  id:string;country:string;city:string;points:number;correct:boolean;skipped?:boolean;
};
const MAX_ROUND_POINTS=[5000,3500,2000] as const;

export function StreetDetectiveScreen({
  onClose,onGameComplete,playerName,initialView='play',
}:{
  onClose:()=>void;onGameComplete?:()=>void;playerName:string;initialView?:'play'|'ranking';
}) {
  const {language,t}=useLanguage();
  const [phase,setPhase]=useState<Phase>(initialView==='ranking'?'ranking':'guess');
  const [rounds,setRounds]=useState<StreetRound[]>([]);
  const [idx,setIdx]=useState(0);
  const [selectedCountry,setSelectedCountry]=useState<string|null>(null);
  const [hintCount,setHintCount]=useState(0);
  const [reveal,setReveal]=useState<Reveal|null>(null);
  const [completed,setCompleted]=useState<Completed[]>([]);
  const [ready,setReady]=useState(false);
  const [busy,setBusy]=useState(false);
  const [loading,setLoading]=useState(initialView!=='ranking');
  const [error,setError]=useState('');
  const [showRank,setShowRank]=useState(initialView==='ranking');
  const [saveNote,setSaveNote]=useState('');
  const [saveState,setSaveState]=useState<'idle'|'saving'|'saved'|'error'|'offline'>('idle');
  const [lastFinalScore,setLastFinalScore]=useState(0);
  const [saveError,setSaveError]=useState('');
  const current=rounds[idx];
  const openedAt=useRef(0);
  const completionNotified=useRef(false);
  const score=completed.reduce((total,row)=>total+row.points,0);

  const newGame=useCallback(async()=>{
    completionNotified.current=false;
    trackPlayEvent({mode:'street',event_type:'mode_start'});
    setLoading(true);setError('');setRounds([]);
    setIdx(0);setCompleted([]);setSelectedCountry(null);setReveal(null);
    setHintCount(0);setReady(false);setShowRank(false);setSaveNote('');setPhase('guess');
    setSaveState('idle');setLastFinalScore(0);setSaveError('');
    try{
      const response=await fetch('/api/street/session',{cache:'no-store'});
      const data=await response.json() as {rounds?:StreetRound[];error?:string};
      if(!response.ok||!Array.isArray(data.rounds)||data.rounds.length!==STREET_ROUNDS||
        data.rounds.some(row=>!Array.isArray(row.countryOptions)||row.countryOptions.length!==4||!row.hints))
        throw new Error(data.error||'Ülke tahminleri için fotoğraf arşivi hazırlanıyor.');
      warmStreetPhoto(data.rounds[0]);
      setRounds(data.rounds);
    }catch(e){setError(e instanceof Error?e.message:'Fotoğraf arşivi yüklenemedi.');}
    finally{setLoading(false);}
  },[]);
  useEffect(()=>{if(initialView==='play')void newGame();},[initialView,newGame]);
  useEffect(()=>{
    if(ready&&idx+1<rounds.length)warmStreetPhoto(rounds[idx+1]);
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
    if(busy||!ready||!current||!selectedCountry||phase!=='guess')return;
    setBusy(true);setError('');
    try{
      const response=await fetch('/api/street/guess',{
        method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({ticket:current.ticket,countryGuess:selectedCountry,hintsUsed:hintCount}),
      });
      const data=await response.json() as Reveal & {error?:string};
      if(!response.ok||typeof data.correct!=='boolean'||!Number.isInteger(data.points))
        throw new Error(data.error||'Ülke tahmini hesaplanamadı.');
      trackPlayEvent({mode:'street',event_type:'street_guess',question_id:current.id,
        duration_ms:openedAt.current?performance.now()-openedAt.current:undefined});
      setReveal(data);
      setCompleted(prev=>[...prev,{...data,id:current.id}]);
      setPhase('result');
    }catch(e){setError(e instanceof Error?e.message:'Ülke tahmini gönderilemedi.');}
    finally{setBusy(false);}
  };
  const saveOnline=async(finalScore:number)=>{
    if(!backend){setSaveState('offline');return;}
    setSaveState('saving');setSaveError('');
    try{await submitStreetScore(playerName,finalScore);setSaveState('saved');}
    catch(e){setSaveError(e instanceof Error?e.message:'Skor kaydedilemedi.');setSaveState('error');}
  };
  const finishGame=(rows:Completed[])=>{
    const points=rows.reduce((total,row)=>total+row.points,0);
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
    setIdx(i=>i+1);setSelectedCountry(null);setHintCount(0);
    setReveal(null);setReady(false);setError('');setPhase('guess');
  };
  const advance=()=>{
    if(completed.length>=STREET_ROUNDS)finishGame(completed);
    else resetForNext();
  };
  const skipBroken=()=>{
    if(!current||phase!=='guess')return;
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

  return (
    <div className="street-screen fixed inset-0 z-[65] overflow-y-auto overscroll-contain text-white">
      <main className="mx-auto min-h-full w-full max-w-[600px] px-4 pb-10 pt-[max(16px,env(safe-area-inset-top))]">
        <header className="mb-4 flex items-center gap-3">
          <button type="button" onClick={close} aria-label={t('Ana ekrana dön')} className="street-round-button">
            <ArrowLeft className="h-5 w-5"/>
          </button>
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#ffab88] text-[#253859]">
            <Camera className="h-5 w-5"/>
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="text-[19px] font-black leading-tight">{t('Sokak Dedektifi')}</h1>
            <p className="text-[11px] text-blue-200/80">{t('Fotoğrafa bak, doğru ülkeyi bul!')}</p>
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
                <Globe2 className="h-4 w-4 text-emerald-200"/> {t('Tur')} {idx+1}/{STREET_ROUNDS}
              </span>
              <span className="text-sm font-black tabular-nums text-[#ffda96]">
                {score.toLocaleString(language)} {t('puan')}
              </span>
            </div>

            {phase==='guess'&&(
              <>
                <div className="street-card overflow-hidden p-2">
                  <div className="h-[min(40dvh,335px)] min-h-[205px]">
                    <StreetPhoto key={current.id} round={current} onSkip={skipBroken}
                      onReady={()=>{
                        trackPlayEvent({mode:'street',event_type:'panorama_ready',question_id:current.id,
                          duration_ms:openedAt.current?performance.now()-openedAt.current:undefined});
                        setReady(true);setError('');
                      }}
                      onError={message=>{
                        trackPlayEvent({mode:'street',event_type:'panorama_error',question_id:current.id,
                          detail:message});
                        setError(message);
                      }}/>
                  </div>
                  <p className="px-2 py-2 text-[11px] text-blue-100/75">
                    {t('Fotoğrafta dört yöne bakabilir ve tam ekran büyütebilirsin.')}
                  </p>
                </div>

                <section className="street-card space-y-3 p-4">
                  <h2 className="text-lg font-black">{t('Bu fotoğraf hangi ülkede çekilmiş?')}</h2>
                  <p className="text-xs leading-5 text-blue-100/75">
                    {t('Şehir veya haritada nokta bulmana gerek yok. Doğru ülkeyi seçmen yeterli!')}
                  </p>
                  <div className="grid grid-cols-2 gap-2" role="group" aria-label={t('Ülke seçenekleri')}>
                    {(current.countryOptions??[]).map((country,i)=>{
                      const selected=selectedCountry===country;
                      return <button key={country} type="button" disabled={!ready||busy}
                        aria-pressed={selected}
                        onClick={()=>setSelectedCountry(country)}
                        className={`min-h-[64px] rounded-2xl border px-2 py-3 text-center text-sm font-bold leading-5 transition-colors disabled:opacity-50 ${selected
                          ?'border-amber-300 bg-amber-300/20 text-amber-100'
                          :'border-white/15 bg-white/5 text-white hover:border-white/40 hover:bg-white/10'}`}>
                        <span className="mr-1 text-amber-200/80">{String.fromCharCode(65+i)}.</span>
                        {localizedCountryName(country,language)}
                      </button>;
                    })}
                  </div>

                  {hintCount>0&&(
                    <div className="space-y-2 rounded-xl border border-amber-300/25 bg-amber-200/10 p-3 text-sm leading-6 text-amber-50">
                      <p><Lightbulb className="mr-1 inline h-4 w-4"/> {t('Bölge:')} <strong>{streetRegionLabel(current.hints?.region??'150',language)}</strong></p>
                      {hintCount===2&&<p><HelpCircle className="mr-1 inline h-4 w-4"/> {t('Ünlü simge:')} <strong>{streetLandmarkLabel(current.hints?.landmark??'',language)}</strong></p>}
                    </div>
                  )}
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="font-semibold text-blue-100/80">
                      {t('Bu tur kazanılabilecek puan:')} <strong className="text-amber-200">{MAX_ROUND_POINTS[hintCount].toLocaleString(language)}</strong>
                    </span>
                    {hintCount<2&&<button type="button" disabled={!ready||busy}
                      onClick={()=>setHintCount(v=>Math.min(2,v+1))}
                      className="inline-flex items-center gap-1 rounded-xl border border-amber-300/25 bg-amber-300/10 px-3 py-2 font-bold text-amber-100 disabled:opacity-50">
                      <Lightbulb className="h-4 w-4"/> {hintCount===0?t('Bölge ipucunu aç'):t('Kültür ipucunu aç')}
                      <span className="opacity-75">−1.500</span>
                    </button>}
                  </div>
                  {error&&<p role="alert" className="rounded-xl border border-amber-300/40 bg-amber-950/20 p-3 text-xs text-amber-100">{t(error)}</p>}
                  <button type="button" disabled={!ready||!selectedCountry||busy}
                    onClick={()=>{void confirm();}} className="street-primary w-full disabled:opacity-50">
                    {busy?t('Hesaplanıyor...'):t('Ülkeyi onayla')} <ArrowRight className="h-4 w-4"/>
                  </button>
                </section>
              </>
            )}

            {phase==='result'&&reveal&&(
              <section className="street-card space-y-3 p-5 text-center" aria-live="polite">
                {reveal.correct
                  ? <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-300"/>
                  : <XCircle className="mx-auto h-12 w-12 text-orange-300"/>}
                <h2 className="text-xl font-black">
                  {reveal.correct?t('Ülkeyi doğru buldun!'):t('Ülke tahminin farklı çıktı.')}
                </h2>
                <div className="text-[32px] font-black text-amber-200">
                  +{reveal.points.toLocaleString(language)} {t('puan')}
                </div>
                <p className="text-sm text-blue-100/80">{t('Doğru ülke:')}</p>
                <p className="text-2xl font-black text-emerald-200">{localizedCountryName(reveal.country,language)}</p>
                <p className="text-xs text-blue-100/75">{reveal.city}</p>
                <p className="text-sm leading-6 text-blue-100/80">{t(reveal.fact)}</p>
                <p className="text-[11px] leading-5 text-blue-100/65">
                  {t('Görüntü:')} {reveal.credit.artist} · {reveal.credit.license} ·{' '}
                  <a href={reveal.credit.source} target="_blank" rel="noopener noreferrer"
                    className="underline underline-offset-2">{t('Kaynak / lisans')}</a>
                </p>
                <button type="button" onClick={advance} className="street-primary w-full">
                  {completed.length===STREET_ROUNDS?t('Sonuçlarımı gör'):t('Sonraki konum')}
                  <ArrowRight className="h-4 w-4"/>
                </button>
              </section>
            )}
          </div>
        )}
        <p className="mt-5 text-center text-[11px] text-blue-200/65">
          {t('Sokak Dedektifi: ülkeyi bilmen yeterli · İpuçları isteğe bağlıdır.')}
          {phase==='finish'?' · '+t('Cihaz rekorun:')+' '+getLocalStreetBest().toLocaleString(language):''}
        </p>
      </main>
    </div>
  );
}
