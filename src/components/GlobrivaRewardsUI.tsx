import { useEffect, useState } from 'react';
import { Award, Bell, Compass, Globe2, House, Play, ShieldCheck, Trophy, UserRound, Volume2, VolumeX } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import { nicknameError, deleteMyPlayerData } from '@/lib/playerSafety';
import { GeoStarRow } from '@/components/GeoStarRow';
import { DISCOVERY_EVENT } from '@/lib/discovery';
import { GEO_REWARDS_CHANGED, GEO_REWARD_SECTIONS, getGeoBadges, getGeoRewardOverview, type GeoRewardLevel } from '@/lib/geoRewards';

export type GlobrivaHomeTab = 'home' | 'awards' | 'profile';

export function GlobrivaBottomNav({
  active, onHome, onExplore, onPlay, onAwards, onProfile,
}: {
  active: GlobrivaHomeTab;
  onHome: () => void;
  onExplore: () => void;
  onPlay: () => void;
  onAwards: () => void;
  onProfile: () => void;
}) {
  const { t } = useLanguage();
  const options = [
    { id:'home', label:t('Ana Sayfa'), icon:House, onClick:onHome },
    { id:'explore', label:t('Keşfet'), icon:Compass, onClick:onExplore },
    { id:'play', label:t('Oyna'), icon:Play, onClick:onPlay },
    { id:'awards', label:t('Başarılar'), icon:Award, onClick:onAwards },
    { id:'profile', label:t('Profil'), icon:UserRound, onClick:onProfile },
  ] as const;
  return <nav aria-label={t('Alt gezinme menüsü')} className="globriva-bottom-nav fixed inset-x-0 bottom-0 z-[45] border-t border-white/15 bg-[#06172c]/95 px-1.5 pt-2 text-white shadow-[0_-12px_35px_rgba(0,14,33,.4)] backdrop-blur-xl">
    <div className="mx-auto grid w-full max-w-[650px] grid-cols-5 gap-0.5">
      {options.map(item=>{
        const Icon=item.icon;
        const isActive=item.id===active;
        return <button key={item.id} type="button" aria-current={isActive?'page':undefined} aria-label={item.label}
          onClick={item.onClick} className={'flex min-w-0 min-h-[53px] flex-col items-center justify-center gap-0.5 rounded-[14px] px-0.5 text-[10px] font-extrabold tracking-tight transition-colors active:scale-[.97] '+(isActive?'bg-[#163c62] text-[#ffe09c]':'text-[#c1d2e2] hover:bg-white/10')}>
          <Icon size={21} strokeWidth={isActive?2.6:2} fill={item.id==='play'?'currentColor':'none'} />
          <span className="block w-full truncate text-center">{item.label}</span>
        </button>;
      })}
    </div>
  </nav>;
}

function useRewardSnapshot() {
  const [snapshot, setSnapshot] = useState(() => ({ overview: getGeoRewardOverview(), badges: getGeoBadges() }));
  useEffect(() => {
    const refresh = () => setSnapshot({ overview: getGeoRewardOverview(), badges: getGeoBadges() });
    window.addEventListener(GEO_REWARDS_CHANGED, refresh);
    window.addEventListener(DISCOVERY_EVENT, refresh);
    return () => {
      window.removeEventListener(GEO_REWARDS_CHANGED, refresh);
      window.removeEventListener(DISCOVERY_EVENT, refresh);
    };
  }, []);
  return snapshot;
}

const LEVEL_LABELS: Record<GeoRewardLevel,{tr:string;en:string}> = {
  easy:{tr:'İlk Rota / Kolay',en:'First Route / Easy'},
  medium:{tr:'Kıtalar Arası / Orta',en:'Across Continents / Medium'},
  hard:{tr:'Dünya Turu / Zor',en:'World Tour / Hard'},
  tour:{tr:'Dünya Turu',en:'World Tour'},
  daily:{tr:'Günlük Rota',en:'Daily Route'},
};

export function GlobrivaAwardsScreen() {
  const { t } = useLanguage();
  const { overview, badges } = useRewardSnapshot();
  const earned = badges.filter(x=>x.unlocked).length;
  return <main className="globriva-awards-screen fixed inset-0 z-20 overflow-x-hidden overflow-y-auto overscroll-contain bg-[#061629] text-white">
    <div className="mx-auto w-full max-w-[590px] px-4 pb-36 pt-[calc(24px+env(safe-area-inset-top))]">
      <section className="relative isolate overflow-hidden rounded-[27px] border border-[#9bdcec]/30 bg-gradient-to-br from-[#154875] via-[#173b63] to-[#112944] px-5 py-6 shadow-2xl">
        <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-14 -z-10 h-52 w-52 rounded-full bg-cyan-300/15 blur-[25px]" />
        <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[.17em] text-cyan-200"><Compass className="h-4 w-4"/>{t('Globriva · Kaşif Defteri')}</div>
        <h1 className="mt-2 text-3xl font-black">{t('Başarılarım')}</h1>
        <p className="mt-2 max-w-[330px] text-xs leading-5 text-slate-200">{t('Her keşif yeni bir iz bırakır. Aşamaları tamamla, yıldızlarını biriktir ve coğrafya rozetlerini aç.')}</p>
        <div className="mt-5 grid grid-cols-3 gap-2">
          {[{n:overview.stars,label:t('Yıldız'),icon:'★'},
            {n:overview.clearedStages,label:t('Aşama'),icon:'🧭'},
            {n:earned,label:t('Rozet'),icon:'🏅'}].map(item=>
            <div key={item.label} className="rounded-2xl border border-white/15 bg-white/10 px-2 py-3 text-center backdrop-blur">
              <span className="text-base" aria-hidden="true">{item.icon}</span>
              <strong className="mt-0.5 block text-2xl font-black tabular-nums">{item.n}</strong>
              <small className="block text-[10px] font-bold text-slate-200">{item.label}</small>
            </div>)}
        </div>
      </section>

      <section className="mt-6">
        <div className="flex items-center justify-between gap-2"><h2 className="flex items-center gap-2 text-lg font-black"><Award className="h-5 w-5 text-amber-300"/>{t('Keşif Rozetleri')}</h2><small className="text-xs font-bold text-cyan-200">{earned}/{badges.length}</small></div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {badges.map(badge=><article key={badge.id} className={'min-h-[147px] rounded-[20px] border p-3 text-center '+(badge.unlocked?'border-amber-300/45 bg-gradient-to-b from-[#354b60] to-[#15283d]':'border-white/10 bg-[#14253a]/65')}>
            <span className={'mx-auto grid h-12 w-12 place-items-center rounded-[16px] border text-2xl '+(badge.unlocked?'border-amber-300/40 bg-amber-300/15':'border-white/10 bg-black/15 grayscale opacity-40')} aria-hidden="true">{badge.icon}</span>
            <h3 className={'mt-2 text-sm font-black leading-4 '+(badge.unlocked?'text-amber-100':'text-slate-300')}>{t(badge.tr)}</h3>
            <p className="mt-1.5 text-[10px] leading-4 text-slate-300">{t(badge.detailTr)}</p>
            {!badge.unlocked && <span className="mt-1.5 block text-[9px] font-bold text-slate-400">{t('Henüz kilitli')}</span>}
          </article>)}
        </div>
      </section>

      <section className="mt-7">
        <h2 className="flex items-center gap-2 text-lg font-black"><Trophy className="h-5 w-5 text-amber-300"/>{t('Yolculuk Yıldızları')}</h2>
        <p className="mt-1 text-xs text-slate-300">{t('Tamamlanan bir aşamada %70 = ★, %80 = ★★, %90 ve üzeri = ★★★. Tekrarda en iyi skor korunur.')}</p>
        <div className="mt-3 space-y-3">
          {GEO_REWARD_SECTIONS.map(section=><article key={section.id} className="overflow-hidden rounded-[21px] border border-white/10 bg-[#102942]">
            <div className="flex items-center gap-3 border-b border-white/10 bg-white/[.035] px-4 py-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/15 bg-[#1b4b69] text-xl" aria-hidden="true">{section.icon}</span>
              <div className="min-w-0 flex-1"><h3 className="truncate text-sm font-black">{t(section.tr)}</h3><small className="text-[10px] font-semibold text-slate-300">{section.id==='daily'?(t('Her gün bir tur')):section.id==='street'||section.id==='drone'?(t('5 konumlu tur')):section.id==='heritage'?(t('Kolay · Orta')):['nature','islands','borders'].includes(section.id)?(t('Kolay · Orta · Zor')):(t('Her 10 soruda yeni rota'))}</small></div>
            </div>
            <div className="space-y-1 px-3 py-2">
              {section.levels.map(level=>{
                const star=overview.stages.find(x=>x.mode===section.id&&x.level===level)?.stars||0;
                return <div key={level} className="flex min-h-9 items-center justify-between gap-2 rounded-xl px-2 py-1">
                  <span className="text-[11px] font-semibold text-slate-200">{t(LEVEL_LABELS[level].tr)}</span>
                  <GeoStarRow count={star}/>
                </div>;
              })}
            </div>
          </article>)}
        </div>
      </section>
    </div>
  </main>;
}

export function GlobrivaProfileScreen({
  playerName, onNameChange, soundEnabled, onToggleSound, onNotifications, onAdPrivacy,
}: {
  playerName:string;
  onNameChange:(value:string)=>Promise<void>;
  soundEnabled:boolean;
  onToggleSound:()=>void;
  onNotifications?:()=>void;
  onAdPrivacy?:()=>void;
}) {
  const { t, language }=useLanguage();
  const [name,setName]=useState(playerName);
  const [deleteOpen,setDeleteOpen]=useState(false);
  const [deleting,setDeleting]=useState(false);
  const [deleteError,setDeleteError]=useState('');
  const deleteLabel=language==='tr'?'Oyuncu hesabımı ve verilerimi sil':'Delete my player account and data';
  const [saving,setSaving]=useState(false);
  const [message,setMessage]=useState('');
  const { overview }=useRewardSnapshot();
  const save=async()=>{
    const value=name.trim().slice(0,20);
    if(saving)return;
    const invalid=nicknameError(value,language);
    if(invalid){setMessage(invalid);return;}
    setSaving(true);setMessage('');
    try { await onNameChange(value); setMessage(t('Takma adın kaydedildi.')); }
    catch { setMessage(t('Takma ad kaydedilemedi.')); }
    finally { setSaving(false); }
  };
  return <main className="fixed inset-0 z-20 overflow-x-hidden overflow-y-auto overscroll-contain bg-[#061629] text-white">
    <div className="mx-auto max-w-[590px] px-4 pb-36 pt-[calc(24px+env(safe-area-inset-top))]">
      <header className="rounded-[24px] border border-white/15 bg-gradient-to-br from-[#1b5679] to-[#0e2845] p-5">
        <div className="flex items-center gap-3"><span className="grid h-14 w-14 place-items-center rounded-2xl border border-cyan-200/30 bg-cyan-200/10"><UserRound size={30} className="text-cyan-100"/></span>
          <div><div className="text-[10px] font-black uppercase tracking-widest text-cyan-200">{t('Globriva · Gezgin Kartı')}</div><h1 className="text-2xl font-black">{playerName|| (t('Yeni Kâşif'))}</h1></div></div>
        <div className="mt-5 grid grid-cols-3 gap-2 text-center">
          {[[overview.stars,t('Yıldız')],[overview.countries,t('Ülke')],[overview.clearedStages,t('Aşama')]].map(([value,label])=><div key={label} className="rounded-xl bg-white/10 p-3"><strong className="block text-xl font-black tabular-nums">{value}</strong><small className="text-[10px] font-semibold text-slate-200">{label}</small></div>)}
        </div>
      </header>
      <section className="mt-5 rounded-[20px] border border-white/10 bg-[#102b43] p-4">
        <h2 className="mb-3 flex items-center gap-2 font-black"><UserRound size={18}/>{t('Takma Adım')}</h2>
        <form onSubmit={event=>{event.preventDefault();void save();}} className="flex gap-2">
          <input value={name} onChange={e=>setName(e.target.value)} maxLength={20} aria-label={t('Takma ad')} className="min-w-0 flex-1 rounded-xl border border-white/20 bg-[#091e31] px-3 py-3 text-sm text-white outline-none focus:border-cyan-300"/>
          <button disabled={saving} type="submit" className="rounded-xl bg-[#b8ebf2] px-4 text-xs font-black text-[#0e2b43] disabled:opacity-50">{saving?'...':t('Kaydet')}</button>
        </form>
        {message&&<p className="mt-2 text-xs text-cyan-200" role="status">{message}</p>}
      </section>
      <section className="mt-4 space-y-2 rounded-[20px] border border-white/10 bg-[#102b43] p-3">
        <button type="button" onClick={onToggleSound} className="flex min-h-12 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-bold hover:bg-white/10">
          {soundEnabled?<Volume2 className="text-cyan-200"/>:<VolumeX className="text-slate-300"/>}<span className="flex-1">{t('Oyun Sesleri')}</span><span className="text-xs text-cyan-200">{soundEnabled?(t('Açık')):(t('Kapalı'))}</span>
        </button>
        {onNotifications&&<button type="button" onClick={onNotifications} className="flex min-h-12 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-bold hover:bg-white/10"><Bell className="text-cyan-200"/>{t('Bildirimler')}</button>}
        {onAdPrivacy&&<button type="button" onClick={onAdPrivacy} className="flex min-h-12 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-bold hover:bg-white/10"><ShieldCheck className="text-cyan-200"/>{t('Reklam Gizliliği')}</button>}
      </section>
      <section className="mt-4 grid grid-cols-2 gap-3">
        <a href="/privacy.html" className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-4 text-center text-xs font-bold"><ShieldCheck size={16}/>{t('Gizlilik')}</a>
        <a href="/support.html" className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-4 text-center text-xs font-bold"><Globe2 size={16}/>{t('Destek')}</a>
      </section>
      <section className="mt-4 rounded-2xl border border-rose-300/20 bg-[#102b43] p-4">
        <h2 className="text-sm font-black text-rose-100">{language==='tr'?'Hesap ve veri yönetimi':'Account and data'}</h2>
        <p className="mt-2 text-xs leading-5 text-slate-300">{language==='tr'?'Bu işlem anonim oyuncu hesabını, çevrim içi puanlarını, sıralama kayıtlarını ve cihazdaki oyun ilerlemeni kalıcı olarak siler.':'This permanently deletes your anonymous player account, online scores and leaderboard entries, and locally saved game progress.'}</p>
        {!deleteOpen?<button type="button" onClick={()=>setDeleteOpen(true)} className="mt-3 w-full rounded-xl border border-rose-300/40 px-4 py-3 text-sm font-bold text-rose-200">{deleteLabel}</button>
        :<div className="mt-3 space-y-2"><p className="text-xs text-rose-200">{language==='tr'?'Kalıcı silmeyi onaylıyor musun?':'Confirm permanent deletion?'}</p>
          <button type="button" disabled={deleting} onClick={()=>{setDeleteOpen(false);setDeleteError('')}} className="w-full rounded-xl bg-white/10 p-3 text-sm font-semibold">{language==='tr'?'Vazgeç':'Cancel'}</button>
          <button type="button" disabled={deleting} onClick={async()=>{setDeleting(true);setDeleteError('');try{await deleteMyPlayerData();window.location.reload()}catch{setDeleteError(language==='tr'?'Hesap silinemedi. İnternet bağlantını kontrol et veya destek ile iletişime geç.':'Could not delete the account. Check your connection or contact support.');setDeleting(false)}}} className="w-full rounded-xl bg-rose-400 p-3 text-sm font-bold text-[#141c2b] disabled:opacity-60">{deleting?'...':deleteLabel}</button>
        </div>}
        {deleteError&&<p role="alert" className="mt-2 text-xs text-rose-200">{deleteError}</p>}
      </section>
    </div>
  </main>;
}
