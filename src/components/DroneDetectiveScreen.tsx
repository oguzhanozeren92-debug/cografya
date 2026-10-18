import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, Compass, MapPin, RefreshCcw, Trophy, X } from 'lucide-react';
import { StreetPanorama, type StreetRound } from '@/components/StreetPanorama';
import { StreetWorldMap } from '@/components/StreetWorldMap';
import { dronePanoramas, type DronePanorama } from '@/data/dronePanoramas';
import { haversineKm, locationPoints, type Coordinates } from '@/lib/streetLocations';
import { trackPlayEvent } from '@/lib/atlasTelemetry';

type Phase = 'view' | 'guess' | 'result' | 'finish';
type Answer = { id: string; city: string; country: string; km: number; points: number };
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

export function DroneDetectiveScreen({ onClose }: { onClose: () => void }) {
  const [rows, setRows] = useState(shuffled);
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('view');
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  const [guess, setGuess] = useState<Coordinates | null>(null);
  const [answered, setAnswered] = useState<Answer[]>([]);
  const [distance, setDistance] = useState<number | null>(null);
  const [roundPoints, setRoundPoints] = useState(0);
  const [best, setBest] = useState(getBest);
  const current = rows[index];
  const panoramaStart=useRef(0);
  useEffect(()=>{trackPlayEvent({mode:'drone',event_type:'mode_start'});},[]);
  useEffect(()=>{panoramaStart.current=performance.now();trackPlayEvent({mode:'drone',event_type:'question_shown',question_id:current.id});},[current.id]);
  const close=()=>{trackPlayEvent({mode:'drone',event_type:'mode_exit',detail:phase});onClose();};
  const score = answered.reduce((sum, item) => sum + item.points, 0);
  const panorama = useMemo<StreetRound>(() => ({
    id: current.id,
    ticket: '',
    media: { mode: 'equirectangular', image: current.image },
    credit: { artist: current.artist, license: current.license, source: current.source },
  }), [current]);

  const restart = () => {
    setRows(shuffled()); setIndex(0); setPhase('view'); setReady(false);
    setError(''); setGuess(null); setAnswered([]); setDistance(null); setRoundPoints(0);
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
  const next = () => {
    if (index === rows.length - 1) {
      setBest(saveBest(score));
      setPhase('finish');
    } else {
      setIndex(n => n + 1); setPhase('view'); setGuess(null);
      setDistance(null); setRoundPoints(0); setReady(false); setError('');
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
            <h1 className="text-[19px] font-black leading-tight">Drone'dan Konumu Bul</h1>
            <p className="text-[11px] text-blue-200/80">Havadan 360° keşfet · Dünyada işaretle</p>
          </div>
          <button type="button" onClick={close} aria-label="Kapat" className="street-round-button">
            <X className="h-4 w-4" />
          </button>
        </header>
        {phase === 'finish' ? (
          <div className="space-y-4">
            <section className="street-card p-5 text-center">
              <Trophy className="mx-auto mb-3 h-12 w-12 text-amber-300" />
              <p className="text-sm font-bold text-blue-100/80">Drone turunu bitirdin!</p>
              <h2 className="my-3 text-[42px] font-black text-[#ffda96] tabular-nums">{score.toLocaleString('tr-TR')}</h2>
              <p className="font-bold">/ {rows.length * 5000} puan</p>
              <p className="mt-3 text-sm text-emerald-200">Cihaz rekoru: {best.toLocaleString('tr-TR')}</p>
            </section>
            <section className="street-card space-y-2 p-4">
              {answered.map((answer, i) => (
                <div key={answer.id} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-3 text-xs">
                  <span className="font-black text-amber-200">{i + 1}.</span>
                  <span className="min-w-0 flex-1 truncate">{answer.city}, {answer.country}</span>
                  <span>{formatKm(answer.km)} km</span>
                  <strong className="text-emerald-200">+{answer.points}</strong>
                </div>
              ))}
            </section>
            <button type="button" onClick={restart} className="street-primary w-full">
              <RefreshCcw className="h-4 w-4" /> Tekrar uç
            </button>
            <button type="button" onClick={close} className="street-secondary w-full">Ana ekrana dön</button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
              <span className="text-sm font-black">🚁 Konum {index + 1}/{rows.length}</span>
              <span className="text-sm font-black text-[#ffda96]">{score.toLocaleString('tr-TR')} puan</span>
            </div>
            {(phase === 'view' || phase === 'guess') && (
              <section className="street-card overflow-hidden p-2">
                <div className={phase === 'guess' ? 'h-[175px]' : 'h-[min(49dvh,380px)] min-h-[245px]'}>
                  <StreetPanorama key={current.id} round={panorama}
                    onReady={()=>{
                      trackPlayEvent({mode:'drone',event_type:'panorama_ready',question_id:current.id,duration_ms:panoramaStart.current?performance.now()-panoramaStart.current:undefined});
                      setReady(true);setError('');
                    }}
                    onError={message=>{
                      trackPlayEvent({mode:'drone',event_type:'panorama_error',question_id:current.id,detail:message.includes('9 saniyede')?'timeout':'viewer_error'});
                      setError(message);setReady(false);
                    }}/>
                </div>
                <div className="space-y-1 px-2 py-2 text-[11px] leading-5 text-blue-100/90">
                  <div>
                    Fotoğraf: {current.artist} · <a href={current.licenseUrl} target="_blank" rel="noopener noreferrer" className="underline">{current.license}</a>
                    {' '}· <a href={current.source} target="_blank" rel="noopener noreferrer" className="underline">Wikimedia Commons kaynağı</a>
                  </div>
                  <p className="text-blue-200/65">Kaynak görsel aynen gösterilir; 360° panorama ve fotoğraftaki gökyüzü dijital birleştirmeler içerebilir.</p>
                </div>
              </section>
            )}
            {error && <p role="alert" className="rounded-xl border border-amber-300/40 bg-amber-950/20 p-3 text-sm text-amber-100">
              {error} İnternet bağlantını kontrol et veya kaynak bağlantısını aç.
            </p>}
            {phase === 'view' && (
              <section className="street-card space-y-3 p-4">
                <h2 className="font-black">Sence burası neresi? 🚁</h2>
                <p className="text-sm leading-6 text-blue-100/75">Parmağınla 360° dön. Kıyıları, binaları, dağları ve araziyi incele. Sonra konumu haritada seç.</p>
                <button type="button" disabled={!ready} onClick={() => setPhase('guess')}
                  className="street-primary w-full disabled:opacity-50">
                  <MapPin className="h-5 w-5" /> Haritada tahmin et <ArrowRight className="h-4 w-4" />
                </button>
              </section>
            )}
            {(phase === 'guess' || phase === 'result') && (
              <div className="space-y-3">
                {phase === 'result' && distance !== null && (
                  <section className="street-card space-y-1 p-4 text-center">
                    <CheckCircle2 className="mx-auto mb-1 h-7 w-7 text-emerald-300" />
                    <p className="text-sm text-blue-100/80">Gerçek konuma uzaklığın</p>
                    <p className="text-[32px] font-black text-[#ffbb91]">{formatKm(distance)} km</p>
                    <p className="text-[25px] font-black text-[#8df3c0]">+{roundPoints.toLocaleString('tr-TR')} puan</p>
                    <p className="pt-1 text-base font-black">{current.city}, {current.country}</p>
                    <p className="text-xs leading-5 text-blue-100/75">{current.fact}</p>
                  </section>
                )}
                <section className="street-card space-y-3 p-3">
                  {phase === 'guess' && <p className="px-1 text-xs text-blue-100/80">Haritaya dokun; yakınlaştırıp sürükleyerek ayrıntılı konum seçebilirsin.</p>}
                  <StreetWorldMap guess={guess}
                    actual={phase === 'result' ? { lat: current.lat, lng: current.lng } : null}
                    onGuess={setGuess} locked={phase === 'result'} />
                  {phase === 'guess' ? (
                    <>
                      <button type="button" disabled={!guess} onClick={confirm} className="street-primary w-full disabled:opacity-50">
                        <MapPin className="h-4 w-4" /> Tahminimi onayla
                      </button>
                      <button type="button" onClick={() => setPhase('view')} className="street-secondary w-full">
                        Panoramaya tekrar bak
                      </button>
                    </>
                  ) : (
                    <button type="button" onClick={next} className="street-primary w-full">
                      {index === rows.length - 1 ? 'Sonuçları gör' : 'Sonraki drone konumu'} <ArrowRight className="h-4 w-4" />
                    </button>
                  )}
                </section>
              </div>
            )}
          </div>
        )}
        <p className="mt-5 text-center text-[11px] leading-5 text-blue-200/65">
          Ücretsiz 5 konumluk pilot · Commons açık lisanslı hava fotoğrafları · Puanlar yalnızca bu cihazda saklanır.
          Resmî sıralama ve R2 arşivi henüz bu modda etkin değil.
        </p>
      </main>
    </div>
  );
}
