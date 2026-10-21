import { useEffect, useState } from 'react';
import { Award, RefreshCw, Trophy, Users } from 'lucide-react';
import { backend } from '@/lib/leaderboard';
import { fetchStreetLeaders, type StreetRank } from '@/lib/streetLeaderboard';
import { fetchDroneLeaders } from '@/lib/droneLeaderboard';
import { useLanguage } from '@/lib/i18n';
import { mixRankings, mixedCopy } from '@/lib/rankingMix';
import { getWeekStart } from '@/lib/weeklyLeaderboard';

type LocationMode='street'|'drone';
export function LocationLeaguePanel({
  mode,playerName,onBack,
}:{
  mode:LocationMode;playerName:string;onBack:()=>void;
}){
  const {language,t}=useLanguage();
  const [period,setPeriod]=useState<'all'|'weekly'>('weekly');
  const [rows,setRows]=useState<StreetRank[]>([]);
  const [me,setMe]=useState<string|null>(null);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState('');
  const [reload,setReload]=useState(0);
  useEffect(()=>{
    let active=true;
    setLoading(true);setError('');
    if(!backend){
      setLoading(false);
      setError('Supabase bağlantısı henüz ayarlanmadı. Cihaz rekorun yine saklanıyor.');
      return()=>{active=false;};
    }
    void Promise.all([
      (mode==='street'?fetchStreetLeaders:fetchDroneLeaders)(period),
      backend.auth.getSession(),
    ]).then(([leaders,session])=>{
      if(!active)return;
      setRows(leaders);
      setMe(session.data.session?.user.id??null);
    }).catch((e:unknown)=>{
      if(!active)return;
      setRows([]);
      setError(e instanceof Error?e.message:t('Sıralama okunamadı.'));
    }).finally(()=>{if(active)setLoading(false);});
    return()=>{active=false;};
  },[mode,period,reload]);
  const displayRows=mixRankings(rows,mode,period==='weekly'?getWeekStart():'all-time',entry=>entry.player_id);
  const myIndex=me?displayRows.findIndex(x=>x.real?.player_id===me):-1;
  const copy=mixedCopy[language];
  return <section className="street-card space-y-4 p-4 sm:p-5">
    <div className="flex items-start gap-3">
      <Trophy className="h-8 w-8 shrink-0 text-amber-300"/>
      <div className="min-w-0 flex-1">
        <h2 className="text-lg font-black">{t(mode==='street'?'Sokak Dedektifi':'Dron Dedektifi')} {t('Dünya Ligi')}</h2>
        <p className="mt-1 text-xs text-blue-100/70">{t('Şifresiz, takma adlı yarışma. Her oyuncunun en yüksek 5 turluk skoru listelenir.')}</p>
      </div>
      <button type="button" onClick={()=>setReload(x=>x+1)} aria-label={t("Sıralamayı yenile")} className="street-round-button">
        <RefreshCw className={'h-4 w-4'+(loading?' animate-spin':'')}/>
      </button>
    </div>
    <div className="flex gap-2 rounded-xl border border-white/10 bg-black/20 p-1">
      <button type="button" onClick={()=>setPeriod('weekly')} className={'flex-1 rounded-lg px-3 py-2 text-xs font-bold '+(period==='weekly'?'bg-white/20 text-white':'text-blue-200')}>{t('Bu hafta')}</button>
      <button type="button" onClick={()=>setPeriod('all')} className={'flex-1 rounded-lg px-3 py-2 text-xs font-bold '+(period==='all'?'bg-white/20 text-white':'text-blue-200')}>{t('Tüm zamanlar')}</button>
    </div>
    {me&&<div className="flex items-center gap-3 rounded-xl border border-cyan-300/25 bg-cyan-300/10 p-3">
      <Award className="h-5 w-5 text-cyan-200"/>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] text-cyan-200">{copy.rank}</p>
        <p className="truncate text-sm font-bold">{playerName||t('Gezgin')}</p>
      </div>
      <strong className="text-lg text-amber-200">{myIndex>=0?'#'+(myIndex+1):'—'}</strong>
    </div>}
    {loading?<p className="py-8 text-center text-sm text-blue-200">{t('Sıralama yükleniyor...')}</p>:
      error?<p role="alert" className="rounded-xl border border-amber-400/30 bg-amber-400/5 p-4 text-sm text-amber-100">{error}</p>:
      <div>
        <p className="mb-3 text-[11px] leading-5 text-blue-100/70">{copy.note}</p>
        <div className="max-h-[52dvh] space-y-2 overflow-y-auto">
          {displayRows.map((player,index)=><div key={player.id} className={'flex items-center gap-2 rounded-xl border p-3 '+(me&&player.real?.player_id===me?'border-cyan-300/40 bg-cyan-300/10':'border-white/10 bg-white/5')}>
            <span className={'w-8 shrink-0 text-center font-black '+(index===0?'text-amber-300':'text-slate-300')}>{index+1}.</span>
            {player.flag && <span className="shrink-0 text-base">{player.flag}</span>}
            <span className="min-w-0 flex-1 truncate text-sm font-semibold">{player.player_name}</span>
            {player.virtual && <span className="shrink-0 rounded bg-cyan-200/15 px-1 text-[9px] font-bold text-cyan-100">{copy.label}</span>}
            <span className="shrink-0 text-sm font-black text-amber-100">{player.score.toLocaleString(language)}</span>
          </div>)}
        </div>
      </div>}
    <p className="text-center text-[11px] text-blue-200/65">{t("Her pazartesi 00.00 UTC'de haftalık lig yenilenir. Para ödüllü resmî yarışmalar için anti-hile denetimi ayrıca gereklidir.")}</p>
    <button type="button" className="street-primary w-full" onClick={onBack}>{t('Oyuna dön')}</button>
  </section>;
}
