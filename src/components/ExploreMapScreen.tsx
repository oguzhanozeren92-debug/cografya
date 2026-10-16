import { useEffect, useMemo, useState } from 'react';
import { geoEqualEarth, geoGraticule10, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import worldData from 'world-atlas/countries-110m.json';
import { ArrowLeft, CheckCircle2, Compass, Flag, Globe2, MapPinned, Sparkles, Trophy, ZoomIn, ZoomOut } from 'lucide-react';
import { COUNTRY_DATA, VALID_COUNTRY_IDS } from '@/data/countries';
import { getCountryFlag } from '@/data/flags';
import { DISCOVERY_EVENT, getDiscoveredCountries, syncDiscoveries } from '@/lib/discovery';

interface Props { onClose: () => void; onDaily: () => void; }
interface CountryShape { id?: string | number; type: string; geometry: unknown; properties: { name?: string }; }
const topo = worldData as unknown as { objects: { countries: unknown } };
const features = (feature(topo as never, topo.objects.countries as never) as unknown as { features: CountryShape[] }).features;
const projection = geoEqualEarth().fitExtent([[20, 15], [880, 455]], { type: 'Sphere' } as never);
const path = geoPath(projection);
const graticule = geoGraticule10();
const formatId = (id: string | number) => String(id).padStart(3, '0');

export function ExploreMapScreen({ onClose, onDaily }: Props) {
  const [discovered, setDiscovered] = useState<string[]>(getDiscoveredCountries);
  const [selected, setSelected] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [showAll, setShowAll] = useState(false);
  const discoveredSet = useMemo(() => new Set(discovered), [discovered]);
  const total = VALID_COUNTRY_IDS.length;
  const earned = discovered.filter(id => COUNTRY_DATA[id]);
  const percentage = Math.round(earned.length / total * 100);
  useEffect(() => {
    const refresh = () => setDiscovered(getDiscoveredCountries());
    window.addEventListener(DISCOVERY_EVENT, refresh);
    window.addEventListener('storage', refresh);
    void syncDiscoveries();
    return () => { window.removeEventListener(DISCOVERY_EVENT, refresh); window.removeEventListener('storage', refresh); };
  }, []);

  const selectedMeta = selected ? COUNTRY_DATA[selected] : null;
  const selectedFlag = selected ? getCountryFlag(selected) : null;
  const selectedDiscovered = Boolean(selected && discoveredSet.has(selected));
  const recent = earned.slice(-6).reverse();

  return <div className="explore-screen fixed inset-0 z-50 overflow-y-auto overscroll-contain text-white" role="dialog" aria-modal="true" aria-label="Dünya keşif haritası">
    <div className="mx-auto max-w-3xl px-4 pb-12 pt-5 sm:px-7">
      <header className="mb-4 flex items-center justify-between">
        <button className="weekly-nav-button gap-2" onClick={onClose}><ArrowLeft className="h-4 w-4" /> Geri</button>
        <span className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1.5 text-[11px] font-black tracking-wide text-cyan-200">KEŞİF GÜNLÜĞÜ</span>
      </header>
      <section className="explore-hero relative mb-4 overflow-hidden rounded-[26px] border border-cyan-300/25 p-6 sm:p-8">
        <div className="relative z-10">
          <div className="mb-2 flex items-center gap-2 text-xs font-black tracking-[.18em] text-cyan-200"><Compass className="h-4 w-4" /> DÜNYANI KEŞFET</div>
          <h1 className="text-3xl font-black sm:text-4xl">Dünya <span className="text-cyan-300">Haritam</span></h1>
          <p className="mt-2 max-w-sm text-sm text-slate-200">Doğru bildiğin ülkeler haritada parlasın. Yeni ülkeler öğren, dünyayı renklendir!</p>
          <div className="mt-5 flex items-end gap-3"><strong className="text-4xl font-black text-white">{earned.length}<span className="text-xl text-cyan-200">/{total}</span></strong><span className="mb-1 text-xs font-bold text-slate-300">ülke keşfedildi</span></div>
          <div className="mt-2 h-2.5 max-w-xs overflow-hidden rounded-full bg-white/20"><div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-amber-300 transition-all" style={{ width: `${percentage}%` }} /></div>
        </div>
      </section>
      <section className="explore-map-frame relative mb-4 overflow-hidden rounded-3xl border border-white/15 p-3 sm:p-5">
        <div className="mb-3 flex items-center justify-between gap-2 px-1"><span className="flex items-center gap-2 text-sm font-black"><Globe2 className="h-4 w-4 text-cyan-300" /> Keşif Atlası</span><span className="text-[11px] text-slate-300">{percentage}% tamamlandı</span></div>
        <div className="relative overflow-hidden rounded-xl border border-white/10 bg-[#091a32]">
          <svg viewBox="0 0 900 470" className="w-full select-none" role="img" aria-label={`Dünya haritası, ${earned.length} ülke keşfedildi`}>
            <defs>
              <radialGradient id="mapSea" cx="50%" cy="45%" r="65%"><stop stopColor="#163c63" /><stop offset="1" stopColor="#06152a" /></radialGradient>
              <filter id="discoveryGlow"><feGaussianBlur stdDeviation="2" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            </defs>
            <rect x="0" y="0" width="900" height="470" fill="url(#mapSea)" />
            <g transform={`translate(${450 * (1 - zoom)} ${235 * (1 - zoom)}) scale(${zoom})`} style={{ transition: 'transform .3s ease' }}>
              <path d={path(graticule) ?? ''} fill="none" stroke="#36638a" strokeWidth=".6" opacity=".38" />
              {features.map((country, i) => {
                const id = formatId(country.id ?? '');
                const geometry = path(country as never);
                if (!geometry) return null;
                const valid = Boolean(COUNTRY_DATA[id]);
                const unlocked = discoveredSet.has(id);
                const active = selected === id;
                return <path key={id + i} d={geometry} fill={active ? '#ffd477' : unlocked ? '#38d5c7' : valid ? '#2e4f73' : '#233b58'} stroke={active ? '#fff4cc' : unlocked ? '#a3fff1' : '#102943'} strokeWidth={active ? 1.9 : .68} opacity={valid ? 1 : .65} className={valid ? 'cursor-pointer transition-colors duration-300' : ''} filter={unlocked ? 'url(#discoveryGlow)' : undefined}
                  onClick={() => { if (valid) setSelected(id); }}>
                    {valid && <title>{COUNTRY_DATA[id].nameTr} · {unlocked ? 'Keşfedildi' : 'Keşfedilmedi'}</title>}
                  </path>;
              })}
            </g>
          </svg>
          <div className="absolute bottom-2 left-2 flex flex-wrap gap-2 rounded-lg bg-[#061329]/85 px-3 py-2 text-[10px] font-bold text-slate-200"><span className="flex items-center gap-1"><i className="h-2.5 w-2.5 rounded-sm bg-cyan-400" /> Keşfedilen</span><span className="flex items-center gap-1"><i className="h-2.5 w-2.5 rounded-sm bg-slate-500" /> Bekleyen</span></div>
          <div className="absolute right-2 top-2 flex flex-col gap-1"><button onClick={() => setZoom(z => Math.min(2.5, Math.round((z + .5) * 10) / 10))} className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900/90 text-white" aria-label="Haritayı yakınlaştır"><ZoomIn className="h-4 w-4" /></button><button onClick={() => setZoom(z => Math.max(1, Math.round((z - .5) * 10) / 10))} className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900/90 text-white" aria-label="Haritayı uzaklaştır"><ZoomOut className="h-4 w-4" /></button></div>
        </div>
        <p className="mt-3 text-center text-[11px] text-slate-400">Ülkeye dokunarak bilgi kartını açabilirsin. Haritayı + / − ile yakınlaştır.</p>
      </section>
      {selected && selectedMeta && <section className={'mb-4 flex items-center gap-4 rounded-2xl border p-4 ' + (selectedDiscovered ? 'border-cyan-300/35 bg-cyan-300/10' : 'border-white/15 bg-white/5')}>
        <div className="flex h-16 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-slate-900/60 p-2">{selectedFlag ? <img src={selectedFlag.url} alt={`${selectedMeta.nameTr} bayrağı`} className="max-h-12 w-full object-contain" /> : <Flag className="h-7 w-7 text-slate-400" />}</div>
        <div className="min-w-0 flex-1"><div className="truncate font-black">{selectedMeta.nameTr}</div><div className="mt-1 text-xs text-slate-300">Başkent: {selectedMeta.capitalTr}</div><div className={'mt-1 flex items-center gap-1 text-xs font-bold ' + (selectedDiscovered ? 'text-emerald-300' : 'text-slate-400')}>{selectedDiscovered ? <CheckCircle2 className="h-3.5 w-3.5" /> : <MapPinned className="h-3.5 w-3.5" />}{selectedDiscovered ? 'Keşfedildi' : 'Henüz keşfedilmedi'}</div></div>
        <button onClick={() => setSelected(null)} className="text-sm text-slate-400" aria-label="Kartı kapat">✕</button>
      </section>}
      <section className="mb-4 rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="mb-3 flex items-center justify-between"><h2 className="flex items-center gap-2 font-black"><Trophy className="h-5 w-5 text-amber-300" /> Keşif Rozetleri</h2><span className="text-xs text-slate-400">{earned.length}/{total}</span></div>
        <div className="grid grid-cols-3 gap-2">{[10, 50, total].map(target => <div key={target} className={'rounded-xl border p-3 text-center ' + (earned.length >= target ? 'border-amber-300/35 bg-amber-300/10' : 'border-white/10 bg-slate-900/30')}><span className="text-2xl">{target === 10 ? '🥉' : target === 50 ? '🥈' : '🏆'}</span><p className="mt-1 text-xs font-black">{target} ülke</p><p className={'mt-1 text-[10px] ' + (earned.length >= target ? 'text-amber-200' : 'text-slate-400')}>{earned.length >= target ? 'Kazanıldı' : 'Kilitli'}</p></div>)}</div>
      </section>
      <section className="mb-5 rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="mb-3 flex items-center justify-between"><h2 className="flex items-center gap-2 font-black"><Sparkles className="h-5 w-5 text-cyan-300" /> Keşfettiklerin</h2>{earned.length > 6 && <button onClick={() => setShowAll(v => !v)} className="text-xs font-bold text-cyan-300">{showAll ? 'Daha az' : 'Tümünü gör'}</button>}</div>
        {earned.length ? <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{(showAll ? [...earned].reverse() : recent).map(id => {
          const flag = getCountryFlag(id);
          return <button key={id} onClick={() => { setSelected(id); document.querySelector('.explore-map-frame')?.scrollIntoView({ behavior: 'smooth' }); }} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-2 py-3 text-left text-xs font-bold hover:bg-white/10">{flag ? <img src={flag.url} alt="" className="h-7 w-10 shrink-0 object-contain" /> : '🌍'}<span className="truncate">{COUNTRY_DATA[id].nameTr}</span></button>;
        })}</div> : <p className="py-4 text-center text-sm text-slate-400">Henüz keşfedilmiş ülke yok. İlk ülkeni doğru bilerek haritanı renklendir!</p>}
      </section>
      <button onClick={onDaily} className="weekly-play-button flex w-full items-center justify-center gap-2 rounded-xl py-4 font-black"><Compass className="h-5 w-5" /> Günlük 10 Soruyu Oyna</button>
    </div>
  </div>;
}