import { useCallback, useEffect, useState } from 'react';
import {
  ArrowLeft, ArrowRight, Camera, ChevronRight, Globe2, MapPin,
  Medal, RefreshCcw, Trophy, X,
} from 'lucide-react';
import { StreetPanorama, type StreetRound } from '@/components/StreetPanorama';
import { StreetWorldMap } from '@/components/StreetWorldMap';
import { getLocalStreetBest, rememberLocalStreetBest } from '@/lib/streetLeaderboard';
import { STREET_ROUNDS, type Coordinates } from '@/lib/streetLocations';

type Phase = 'view' | 'guess' | 'result' | 'finish' | 'ranking';
type Reveal = {
  actual:Coordinates;km:number;points:number;
  country:string;city:string;title:string;fact:string;
  credit:{artist:string;license:string;source:string};
};
type Completed = (Reveal & {id:string;guess:Coordinates;skipped?:false}) |
  {id:string;skipped:true;city:string;country:string;points:0;km:null};
const fmt=(value:number)=>new Intl.NumberFormat('tr-TR',{maximumFractionDigits:value<10?1:0}).format(value);

export function StreetDetectiveScreen({
  onClose,initialView='play',
}:{
  onClose:()=>void;playerName:string;initialView?:'play'|'ranking';
}) {
  const [phase,setPhase]=useState<Phase>(initialView==='ranking'?'ranking':'view');
  const [rounds,setRounds]=useState<StreetRound[]>([]);
  const [idx,setIdx]=useState(0);
  const [guess,setGuess]=useState<Coordinates|null>(null);
  const [reveal,setReveal]=useState<Reveal|null>(null);
  const [completed,setCompleted]=useState<Completed[]>([]);
  const [ready,setReady]=useState(false);
  const [busy,setBusy]=useState(false);
  const [loading,setLoading]=useState(initialView!=='ranking');
  const [error,setError]=useState('');
  const [showRank,setShowRank]=useState(initialView==='ranking');
  const [saveNote,setSaveNote]=useState('');
  const current=rounds[idx];
  const score=completed.reduce((sum,r)=>sum+r.points,0);

  const newGame=useCallback(async()=>{
    setLoading(true);setError('');setRounds([]);
    setIdx(0);setCompleted([]);setGuess(null);setReveal(null);
    setReady(false);setShowRank(false);setSaveNote('');setPhase('view');
    try{
      const response=await fetch('/api/street/session',{cache:'no-store'});
      const data=await response.json() as {rounds?:StreetRound[];error?:string};
      if(!response.ok || !Array.isArray(data.rounds) || data.rounds.length!==STREET_ROUNDS)
        throw new Error(data.error || 'Henüz yeterli lisanslı 360° konum bulunmuyor.');
      setRounds(data.rounds);
    }catch(e){
      setError(e instanceof Error?e.message:'Konum arşivi yüklenemedi.');
    }finally{setLoading(false);}
  },[]);
  useEffect(()=>{if(initialView==='play')void newGame();},[initialView,newGame]);
  const confirm=async()=>{
    if(busy||!current||!guess||phase!=='guess')return;
    setBusy(true);setError('');
    try{
      const response=await fetch('/api/street/guess',{
        method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({ticket:current.ticket,guess}),
      });
      const data=await response.json() as Reveal & {error?:string};
      if(!response.ok || !Number.isFinite(data.points))throw new Error(data.error||'Tahmin hesaplanamadı.');
      setReveal(data);
      setCompleted(prev=>[...prev,{...data,id:current.id,guess}]);
      setPhase('result');
    }catch(e){setError(e instanceof Error?e.message:'Tahmin hesabı başarısız.');}
    finally{setBusy(false);}
  };
  const finishGame=(list:Completed[])=>{
    const finalScore=list.reduce((total,row)=>total+row.points,0);
    const best=rememberLocalStreetBest(finalScore);
    setSaveNote('Cihaz rekorun: '+best.toLocaleString('tr-TR')+' puan. Rekabetçi online skor doğrulaması henüz açılmadı.');
    setPhase('finish');
  };
  const resetForNext=()=>{
    setIdx(n=>n+1);setGuess(null);setReveal(null);setReady(false);setError('');setPhase('view');
  };
  const advance=()=>{
    if(completed.length>=STREET_ROUNDS)finishGame(completed);
    else resetForNext();
  };
  const skipBroken=()=>{
    if(!current||(phase!=='view'&&phase!=='guess'))return;
    const next:Completed[]=[...completed,{id:current.id,skipped:true,city:'Panorama yüklenemedi',country:'',points:0,km:null}];
    setCompleted(next);
    if(next.length>=STREET_ROUNDS)finishGame(next);
    else resetForNext();
  };
  const banner=(message:string)=>(
    <section className="street-card p-5 text-center">
      <Camera className="mx-auto mb-3 h-9 w-9 text-[#ffba94]"/>
      <h2 className="text-lg font-black">Sokak Dedektifi hazırlanıyor</h2>
      <p className="mt-3 text-sm leading-6 text-blue-100/80">{message}</p>
      <button type="button" className="street-secondary mt-4 w-full" onClick={()=>{void newGame();}}>
        <RefreshCcw className="h-4 w-4"/> Yeniden kontrol et
      </button>
    </section>
  );
  return (
    <div className="street-screen fixed inset-0 z-[65] overflow-y-auto overscroll-contain text-white">
      <main className="mx-auto min-h-full w-full max-w-[600px] px-4 pb-10 pt-[max(16px,env(safe-area-inset-top))]">
        <header className="mb-4 flex items-center gap-3">
          <button type="button" onClick={onClose} aria-label="Ana ekrana dön" className="street-round-button"><ArrowLeft className="h-5 w-5"/></button>
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#ffab88] text-[#253859]"><Camera className="h-5 w-5"/></span>
          <div className="min-w-0 flex-1">
            <h1 className="text-[19px] font-black leading-tight">Sokak Dedektifi</h1>
            <p className="text-[11px] text-blue-200/80">360° bak, dünyadan konumu tahmin et!</p>
          </div>
          <button type="button" onClick={()=>setShowRank(!showRank)} aria-label="Dedektifler Ligi" className="street-round-button"><Trophy className="h-5 w-5 text-[#ffd58c]"/></button>
          <button type="button" onClick={onClose} aria-label="Kapat" className="street-round-button"><X className="h-4 w-4"/></button>
        </header>
        {showRank||phase==='ranking'?(
          <section className="street-card space-y-3 p-5">
            <Medal className="h-10 w-10 text-amber-300"/>
            <h2 className="text-xl font-black">Dedektifler Ligi</h2>
            <p className="text-sm leading-6 text-blue-100/80">
              Ayrı dünya ve haftalık sıralama sistemi hazırlanıyor. Fotoğraf konumu ve puan sunucuda doğrulanmadan yarış skorlarını yayına almayacağız.
            </p>
            <button type="button" className="street-primary w-full" onClick={()=>{setShowRank(false);if(phase==='ranking')void newGame();}}>
              <ChevronRight className="h-4 w-4"/> {rounds.length?'Oyuna dön':'Yeni tur başlat'}
            </button>
          </section>
        ):phase==='finish'?(
          <div className="space-y-4">
            <section className="street-card p-5 text-center">
              <Medal className="mx-auto mb-3 h-12 w-12 text-[#ffce7d]"/>
              <p className="text-sm font-bold text-blue-100/80">Dünya turunu tamamladın!</p>
              <h2 className="my-3 text-[42px] font-black text-[#ffda96] tabular-nums">{score.toLocaleString('tr-TR')}</h2>
              <p className="font-bold">/ 25.000 puan</p>
              <p className="mt-3 rounded-xl bg-white/5 px-3 py-2 text-xs leading-5 text-blue-100">{saveNote}</p>
            </section>
            <section className="street-card space-y-2 p-4">
              {completed.map((r,i)=><div key={r.id} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-3 text-xs">
                <span className="font-black text-amber-200">{i+1}.</span>
                <span className="min-w-0 flex-1 truncate">{r.city}, {r.country}</span>
                <span>{r.skipped?'Geçildi':fmt(r.km)+' km'}</span>
                <strong className="text-emerald-200">+{r.points}</strong>
              </div>)}
            </section>
            <button type="button" className="street-primary w-full" onClick={()=>{void newGame();}}><RefreshCcw className="h-4 w-4"/> Yeni dünya turu</button>
          </div>
        ):loading?banner('Doğrulanmış panorama arşivi kontrol ediliyor...'):!current?banner(error||'İlk 5 doğrulanmış 360° fotoğraf R2 arşivine yüklenince oyun açılacak.'):(
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
              <span className="flex items-center gap-2 text-sm font-black"><Globe2 className="h-4 w-4 text-emerald-200"/> Tur {idx+1}/{STREET_ROUNDS}</span>
              <span className="text-sm font-black tabular-nums text-[#ffda96]">{score.toLocaleString('tr-TR')} puan</span>
            </div>
            {(phase==='view'||phase==='guess')&&(
              <div className="street-card overflow-hidden p-2">
                <div className={phase==='guess'?'h-[170px]':'h-[min(48dvh,380px)] min-h-[245px]'}>
                  <StreetPanorama key={current.id} round={current}
                    onReady={()=>{setReady(true);setError('');}} onError={setError} onSkip={skipBroken}/>
                </div>
                <div className="px-2 py-2 text-[11px] text-blue-100/85">
                  Görüntü: {current.credit.artist} · {current.credit.license} ·
                  {' '}<a href={current.credit.source} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">Kaynak / lisans</a>
                </div>
              </div>
            )}
            {error&&phase==='guess'&&<p className="rounded-xl border border-amber-300/40 bg-amber-950/20 p-3 text-sm text-amber-100" role="alert">{error}</p>}
            {phase==='view'&&(
              <section className="street-card space-y-3 p-4">
                <h2 className="font-black">Sence burası neresi? 🕵️</h2>
                <p className="text-sm leading-6 text-blue-100/75">Etrafına bak. Mimariyi, tabelaları ve çevreyi incele. Ardından haritada konumunu işaretle.</p>
                <button type="button" disabled={!ready} onClick={()=>setPhase('guess')} className="street-primary w-full disabled:opacity-50">
                  <MapPin className="h-5 w-5"/> Dünya haritasında tahmin et <ChevronRight className="h-5 w-5"/>
                </button>
              </section>
            )}
            {(phase==='guess'||phase==='result')&&(
              <div className="space-y-3">
                {phase==='result'&&reveal&&(
                  <section className="street-card space-y-1 p-4 text-center">
                    <p className="text-sm text-blue-100/80">Gerçek konuma uzaklığın</p>
                    <p className="text-[32px] font-black text-[#ffbb91]">{fmt(reveal.km)} km</p>
                    <p className="text-[25px] font-black text-[#8df3c0]">+{reveal.points.toLocaleString('tr-TR')} puan</p>
                    <p className="pt-1 text-base font-black">{reveal.city}, {reveal.country}</p>
                    <p className="text-xs leading-5 text-blue-100/75">{reveal.fact}</p>
                  </section>
                )}
                <section className="street-card space-y-3 p-3">
                  {phase==='guess'&&<p className="px-1 text-xs text-blue-100/80">Haritaya dokunarak konum seç. Yakınlaştırabilir ve sürükleyebilirsin.</p>}
                  <StreetWorldMap guess={guess} actual={phase==='result'?reveal?.actual:null}
                    onGuess={setGuess} locked={phase==='result'}/>
                  {phase==='guess'?(
                    <>
                      <button type="button" disabled={!guess||busy} onClick={()=>{void confirm();}} className="street-primary w-full disabled:opacity-50">
                        <MapPin className="h-5 w-5"/> {busy?'Hesaplanıyor...':'Tahmini onayla'} <ArrowRight className="h-4 w-4"/>
                      </button>
                      <button type="button" className="street-secondary w-full" onClick={()=>setPhase('view')}>Panoramaya tekrar bak</button>
                    </>
                  ):<button type="button" onClick={advance} className="street-primary w-full">
                    {completed.length===STREET_ROUNDS?'Sonuçlarımı gör':'Sonraki konum'} <ArrowRight className="h-4 w-4"/>
                  </button>}
                </section>
              </div>
            )}
          </div>
        )}
        <p className="mt-5 text-center text-[11px] text-blue-200/65">
          360° arşiv: lisanslı panoramalar · Depolama: Cloudflare R2 · Tahmin haritası: açık coğrafi veri
          {phase==='finish'?' · En iyi skor: '+getLocalStreetBest().toLocaleString('tr-TR'):''}
        </p>
      </main>
    </div>
  );
}
