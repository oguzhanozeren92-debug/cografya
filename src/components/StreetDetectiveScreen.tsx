import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Camera, ChevronRight, Globe2, MapPin, Medal, RefreshCcw, Trophy, X } from 'lucide-react';
import { StreetPanorama } from '@/components/StreetPanorama';
import { StreetWorldMap } from '@/components/StreetWorldMap';
import {
  haversineKm, locationPoints, pickLocations, STREET_ROUNDS,
  type Coordinates, type StreetLocation,
} from '@/lib/streetLocations';
import {
  fetchStreetLeaders, getLocalStreetBest, rememberLocalStreetBest,
  submitStreetScore, type StreetRank,
} from '@/lib/streetLeaderboard';

type Phase='view'|'guess'|'result'|'finish'|'leaderboard';
type Result={location:StreetLocation;guess:Coordinates;actual:Coordinates;km:number;points:number};
const formatKm=(km:number)=>new Intl.NumberFormat('tr-TR',{maximumFractionDigits:km<10?1:0}).format(km);

export function StreetDetectiveScreen({
  onClose, playerName, initialView='play',
}:{
  onClose:()=>void;
  playerName:string;
  initialView?:'play'|'ranking';
}) {
  const apiKey=import.meta.env.VITE_GOOGLE_MAPS_API_KEY?.trim() || '';
  const [locations,setLocations]=useState<StreetLocation[]>(pickLocations);
  const [cursor,setCursor]=useState(0);
  const [phase,setPhase]=useState<Phase>(initialView==='ranking'?'leaderboard':'view');
  const [results,setResults]=useState<Result[]>([]);
  const [actual,setActual]=useState<Coordinates|null>(null);
  const [guess,setGuess]=useState<Coordinates|null>(null);
  const [panoramaReady,setPanoramaReady]=useState(false);
  const [panoramaError,setPanoramaError]=useState('');
  const [rankPeriod,setRankPeriod]=useState<'all'|'weekly'>('all');
  const [rankData,setRankData]=useState<StreetRank[]>([]);
  const [rankingError,setRankingError]=useState('');
  const [rankBusy,setRankBusy]=useState(false);
  const [saveMessage,setSaveMessage]=useState('');
  const [fromFinish,setFromFinish]=useState(false);
  const current=locations[cursor];
  const total=results.reduce((sum,r)=>sum+r.points,0);
  const last=results[results.length-1];
  const noMore=!current;

  useEffect(()=>{
    if(phase!=='leaderboard'&&phase!=='finish')return;
    let alive=true;
    setRankBusy(true);setRankingError('');
    void fetchStreetLeaders(rankPeriod).then(rows=>{
      if(alive)setRankData(rows);
    }).catch((error:unknown)=>{
      if(alive){setRankData([]);setRankingError(error instanceof Error?error.message:'Sıralama yüklenemedi.');}
    }).finally(()=>{if(alive)setRankBusy(false)});
    return()=>{alive=false};
  },[phase,rankPeriod]);

  const scoreboard=useMemo(()=><div className="space-y-2">
    <div className="flex gap-2 rounded-2xl bg-white/5 p-1">
      <button type="button" className={'street-period '+(rankPeriod==='all'?'street-period-selected':'')}
        onClick={()=>setRankPeriod('all')}>🌎 Dünya</button>
      <button type="button" className={'street-period '+(rankPeriod==='weekly'?'street-period-selected':'')}
        onClick={()=>setRankPeriod('weekly')}>📅 Bu hafta</button>
    </div>
    {rankBusy?<p className="py-8 text-center text-sm text-blue-200">Sıralama yükleniyor...</p>
      :rankingError?<p className="rounded-xl bg-amber-950/40 p-3 text-sm text-amber-100">{rankingError}</p>
      :rankData.length===0?<p className="py-8 text-center text-sm text-blue-100/70">Henüz skor yok. İlk dedektif sen olabilirsin!</p>
      :rankData.map((r,index)=><div key={r.player_id} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-3">
        <span className="w-7 text-center text-lg font-black text-amber-200">{index+1}</span>
        <span className="min-w-0 flex-1 truncate text-sm font-bold">{r.player_name}</span>
        <span className="font-black tabular-nums text-emerald-200">{r.score.toLocaleString('tr-TR')}</span>
      </div>)}
  </div>,[rankPeriod,rankBusy,rankingError,rankData]);

  const nextLocation=()=>{
    setCursor(n=>n+1);
    setGuess(null);
    setActual(null);
    setPanoramaError('');
    setPanoramaReady(false);
    setPhase('view');
  };
  const restart=()=>{
    setLocations(pickLocations());
    setResults([]);setCursor(0);
    setGuess(null);setActual(null);
    setPanoramaError('');setPanoramaReady(false);
    setSaveMessage('');setPhase('view');
  };
  const confirm=()=>{
    if(!guess||!actual||phase!=='guess'||!current)return;
    const km=haversineKm(guess,actual),points=locationPoints(km);
    setResults(prev=>[...prev,{location:current,guess,actual,km,points}]);
    setPhase('result');
  };
  const advance=()=>{
    if(results.length<STREET_ROUNDS){nextLocation();return;}
    const best=rememberLocalStreetBest(total);
    setSaveMessage('Cihaz rekorun: '+best.toLocaleString('tr-TR')+' puan');
    setPhase('finish');
    void submitStreetScore(playerName,total).then(()=> {
      setSaveMessage('Skorun dünya sıralamasına gönderildi. Cihaz rekorun: '+best.toLocaleString('tr-TR'));
    }).catch((e:unknown)=> {
      const reason=e instanceof Error?e.message:'Skor yüklenemedi.';
      setSaveMessage('Skorun cihazda kaydedildi. '+reason);
    });
  };
  const showRank=()=>{setFromFinish(phase==='finish');setPhase('leaderboard');};
  return (
    <div className="street-screen fixed inset-0 z-[65] overflow-y-auto overscroll-contain text-white">
      <div className="mx-auto min-h-full w-full max-w-[600px] px-4 pb-10 pt-[max(16px,env(safe-area-inset-top))]">
        <header className="mb-4 flex items-center gap-3">
          <button type="button" onClick={onClose} aria-label="Ana ekrana dön" className="street-round-button">
            <ArrowLeft className="h-5 w-5"/>
          </button>
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#ffab88] text-[#253859]"><Camera className="h-5 w-5"/></span>
          <div className="min-w-0 flex-1">
            <h1 className="text-[19px] font-black leading-tight">Sokak Dedektifi</h1>
            <p className="text-[11px] text-blue-200/80">Bak, ipucunu yakala, dünyada yerini bul!</p>
          </div>
          <button type="button" onClick={showRank} aria-label="Dünya sıralamasını aç" className="street-round-button"><Trophy className="h-5 w-5 text-[#ffd58c]"/></button>
          <button type="button" onClick={onClose} aria-label="Kapat" className="street-round-button"><X className="h-4 w-4"/></button>
        </header>

        {phase==='leaderboard'?(
          <div className="street-card p-4">
            <div className="mb-4 flex items-center gap-3"><Medal className="h-8 w-8 text-amber-300"/><div><h2 className="text-xl font-black">Dedektifler Ligi</h2><p className="text-xs text-blue-100/70">En iyi 5 turluk skorlar</p></div></div>
            {scoreboard}
            <button type="button" className="street-secondary mt-4 w-full" onClick={()=>setPhase(fromFinish?'finish':'view')}>
              {fromFinish?'Sonucuma dön':'Oyuna dön'}
            </button>
          </div>
        ):phase==='finish'?(
          <div className="space-y-4">
            <section className="street-card p-5 text-center">
              <Medal className="mx-auto mb-3 h-12 w-12 text-[#ffce7d]"/>
              <p className="text-sm font-bold text-blue-100/80">Dünya turunu bitirdin!</p>
              <h2 className="my-3 text-[42px] font-black leading-none text-[#ffda96] tabular-nums">{total.toLocaleString('tr-TR')}</h2>
              <p className="font-bold">/ 25.000 puan</p>
              <p className="mt-3 rounded-xl bg-white/5 px-3 py-2 text-xs text-blue-100">{saveMessage||'Sonucun kaydediliyor...'}</p>
            </section>
            <section className="street-card space-y-2 p-4">
              <h3 className="mb-3 text-sm font-black">Bu turdaki keşiflerin</h3>
              {results.map((r,i)=><div key={r.location.id} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-3 text-xs">
                <span className="font-black text-amber-200">{i+1}.</span><span className="min-w-0 flex-1 truncate">{r.location.city}, {r.location.country}</span>
                <span className="text-blue-200">{formatKm(r.km)} km</span><strong className="text-emerald-200">+{r.points}</strong>
              </div>)}
            </section>
            <button type="button" onClick={showRank} className="street-primary w-full"><Trophy className="h-5 w-5"/> Dünya sıralamasına bak</button>
            <button type="button" onClick={restart} className="street-secondary w-full"><RefreshCcw className="h-4 w-4"/> Yeni tur oyna</button>
          </div>
        ):(
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
              <div className="flex items-center gap-2 text-sm font-black"><Globe2 className="h-4 w-4 text-emerald-200"/> Tur {Math.min(results.length+1,STREET_ROUNDS)}/{STREET_ROUNDS}</div>
              <span className="text-sm font-black tabular-nums text-[#ffda96]">{total.toLocaleString('tr-TR')} puan</span>
            </div>
            {noMore?<section className="street-card p-5"><h2 className="font-black">Konumlar tükendi</h2><p className="mt-2 text-sm text-blue-200">Bu oturumda yeterli sokak görüntüsü bulunamadı. Yeni tur deneyebilirsin.</p>
              <button type="button" onClick={restart} className="street-primary mt-4 w-full">Yeniden dene</button>
            </section>:(
              <>
                {(phase==='view'||phase==='guess')&&(
                  <div className="street-card overflow-hidden p-2">
                    <div className={phase==='guess'?'h-[176px]':'h-[min(49dvh,390px)] min-h-[260px]'}>
                      {apiKey?<StreetPanorama key={current.id} location={current} apiKey={apiKey}
                        onReady={setActual} onError={setPanoramaError}/>:(
                        <div className="flex h-full flex-col items-center justify-center gap-3 rounded-2xl bg-[#133451] p-5 text-center">
                          <Camera className="h-10 w-10 text-[#ffba94]"/>
                          <p className="text-lg font-black">360° Sokak Görüntüsü</p>
                          <p className="text-sm text-blue-100/75">Google Maps API anahtarı bağlandığında gerçek Street View burada açılacak.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {!apiKey?(
                  <section className="street-card p-4">
                    <p className="text-sm font-bold">Google Street View bağlantısı gerekiyor</p>
                    <p className="mt-2 text-xs leading-5 text-blue-100/75">Bu modun gerçek görüntülerini açmak için Google Cloud'da Maps JavaScript API etkinleştirilmeli ve VITE_GOOGLE_MAPS_API_KEY tanımlanmalı. Görüntüler uydurulmayacak.</p>
                    <button className="street-secondary mt-3 w-full" type="button" onClick={showRank}>Dünya sıralamasını gör</button>
                  </section>
                ):panoramaError?(
                  <section className="street-card p-4">
                    <p className="text-sm text-amber-100">{panoramaError}</p>
                    <button type="button" onClick={nextLocation} className="street-primary mt-4 w-full">Başka bir konum getir <ArrowRight className="h-4 w-4"/></button>
                  </section>
                ):phase==='view'?(
                  <section className="street-card space-y-3 p-4">
                    <h2 className="font-black">Sence burası neresi? 🕵️</h2>
                    <p className="text-sm leading-6 text-blue-100/75">Görüntüyü parmağınla çevir. Mimariyi, tabelaları ve çevreyi incele. Hazır olunca dünyadan yerini işaretle!</p>
                    <button type="button" disabled={!panoramaReady} onClick={()=>setPhase('guess')} className="street-primary w-full disabled:opacity-50">
                      <MapPin className="h-5 w-5"/> Dünya haritasında tahmin et <ChevronRight className="h-5 w-5"/>
                    </button>
                  </section>
                ):phase==='guess'||phase==='result'?(
                  <div className="space-y-3">
                    {phase==='result'&&last&&(
                      <section className="street-card p-4 text-center">
                        <p className="text-sm text-blue-100/80">Gerçek konuma uzaklığın</p>
                        <div className="my-1 text-[32px] font-black text-[#ffbb91]">{formatKm(last.km)} km</div>
                        <div className="text-[25px] font-black text-[#8df3c0]">+{last.points.toLocaleString('tr-TR')} puan</div>
                        <div className="mt-2 text-base font-black">{current.city}, {current.country}</div>
                        <p className="mt-1 text-xs leading-5 text-blue-100/75">{current.fact}</p>
                      </section>
                    )}
                    <section className="street-card space-y-3 p-3">
                      {phase==='guess'&&<div className="px-1">
                        <h2 className="font-black">Haritada bir nokta seç</h2>
                        <p className="mt-1 text-xs text-blue-100/75">Google haritasını yakınlaştır, sürükle ve noktaya dokun.</p>
                      </div>}
                      <StreetWorldMap guess={guess} actual={phase==='result'?actual:null}
                        onGuess={setGuess} locked={phase==='result'} apiKey={apiKey}/>
                      {phase==='guess'?(
                        <>
                          <button type="button" disabled={!guess} onClick={confirm} className="street-primary w-full disabled:opacity-50">
                            <MapPin className="h-5 w-5"/> Tahminimi onayla <ArrowRight className="h-5 w-5"/>
                          </button>
                          <button type="button" onClick={()=>setPhase('view')} className="street-secondary w-full">Bir daha etrafa bak</button>
                        </>
                      ):(
                        <button type="button" onClick={advance} className="street-primary w-full">
                          {results.length>=STREET_ROUNDS?'Tur sonucunu gör':'Sonraki konuma geç'} <ArrowRight className="h-5 w-5"/>
                        </button>
                      )}
                    </section>
                  </div>
                ):null}
              </>
            )}
          </div>
        )}
        <p className="mt-5 text-center text-[11px] text-blue-200/65">
          Görüntüler Google Maps Street View tarafından sunulur. Google atıfları görüntüde korunur.
          {phase==='finish'&&' · Cihaz rekorun: '+getLocalStreetBest().toLocaleString('tr-TR')}
        </p>
      </div>
    </div>
  );
}
