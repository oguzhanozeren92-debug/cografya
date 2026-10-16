import { useEffect, useState } from 'react';
import {
  ArrowLeft, ArrowUpRight, Award, CalendarDays, ChevronRight, Crown,
  Globe2, Flag, Lightbulb, Medal, RefreshCw, Rocket, Shield, Sparkles, Star,
  Target, Timer, Trophy, Users,
} from 'lucide-react';
import type { GameMode, WeeklyLeaderboardEntry } from '@/types';
import {
  fetchMyWeeklyStanding, fetchWeeklyLeaderboard, getTimeToReset,
  getWeekLabel, type MyWeeklyStanding,
} from '@/lib/weeklyLeaderboard';

interface WeeklyLeaderboardScreenProps {
  playerName: string;
  onClose: () => void;
  onPlay: (mode: GameMode) => void;
  initialMode: GameMode;
}

const number = new Intl.NumberFormat('tr-TR');

function shortName(name: string): string {
  const parts = name.trim().split(/\s+/);
  return (parts.length > 1 ? parts[0][0] + parts[1][0] : name.slice(0, 2)).toLocaleUpperCase('tr-TR');
}

function PodiumPlayer({ entry, place }: { entry: WeeklyLeaderboardEntry | undefined; place: 1 | 2 | 3 }) {
  const first = place === 1;
  const shade = first ? 'gold' : place === 2 ? 'silver' : 'bronze';
  return (
    <div className={'podium-player podium-player-' + shade}>
      <div className="relative flex justify-center">
        {first && <Crown className="absolute -top-8 h-7 w-7 text-amber-300 drop-shadow-[0_0_12px_rgba(252,211,77,.9)]" fill="currentColor" />}
        <div className={'podium-avatar podium-avatar-' + shade}>
          {entry ? <span>{shortName(entry.player_name)}</span> : <Globe2 className="h-7 w-7 opacity-70" />}
          <div className="podium-medal">{place}</div>
        </div>
      </div>
      <div className="mt-4 min-h-[43px] px-1 text-center">
        <div className="truncate text-[13px] font-extrabold text-white sm:text-sm">{entry?.player_name ?? 'Yerini al'}</div>
        <div className="mt-0.5 text-xs font-bold text-amber-100/75">{entry ? number.format(entry.score) : '—'} <span className="font-medium">puan</span></div>
      </div>
      <div className={'podium-stand podium-stand-' + shade}>
        <span className="podium-stand-number">{place}</span>
        {first && <Star className="absolute right-3 top-3 h-4 w-4 text-amber-100/60" fill="currentColor" />}
      </div>
    </div>
  );
}

export function WeeklyLeaderboardScreen({ playerName, onClose, onPlay, initialMode }: WeeklyLeaderboardScreenProps) {
  const [mode, setMode] = useState<GameMode>(initialMode);
  const [weekOffset, setWeekOffset] = useState<0 | -1>(0);
  const [rows, setRows] = useState<WeeklyLeaderboardEntry[]>([]);
  const [mine, setMine] = useState<MyWeeklyStanding | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    Promise.all([fetchWeeklyLeaderboard(mode, weekOffset), fetchMyWeeklyStanding(mode, weekOffset)])
      .then(([leaderboard, myStanding]) => {
        if (!active) return;
        setRows(leaderboard);
        setMine(myStanding);
      })
      .catch(() => {
        if (!active) return;
        setRows([]);
        setMine(null);
        setError('Haftalık sıralama verileri alınamadı. Supabase bağlantısını ve haftalık tablo kurulumunu kontrol et.');
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [mode, weekOffset, refresh]);

  const topThree = rows.slice(0, 3);
  const remaining = rows.slice(3);
  const dateLabel = getWeekLabel(weekOffset);

  return (
    <div className="weekly-fullscreen fixed inset-0 z-50 overflow-y-auto overscroll-contain text-white" role="dialog" aria-modal="true" aria-label="Haftalık Dünya Sıralaması">
      <div className="weekly-ambient weekly-ambient-left" aria-hidden="true" />
      <div className="weekly-ambient weekly-ambient-right" aria-hidden="true" />

      <div className="relative mx-auto w-full max-w-2xl px-4 pb-12 pt-4 sm:px-7">
        <div className="mb-4 flex items-center justify-between">
          <button onClick={onClose} className="weekly-nav-button flex items-center gap-2" aria-label="Oyuna geri dön">
            <ArrowLeft className="h-4 w-4" /><span className="text-xs font-bold tracking-wide">GERİ DÖN</span>
          </button>
          <span className="flex items-center gap-2 text-[10px] font-extrabold tracking-[.23em] text-blue-200/75">
            {mode === 'flags' ? <Flag className="h-4 w-4 text-amber-300" /> : mode === 'clues' ? <Lightbulb className="h-4 w-4 text-violet-300" /> : <Globe2 className="h-4 w-4 text-cyan-300" />} {mode === 'flags' ? 'BAYRAK LİGİ' : mode === 'clues' ? 'İPUCU LİGİ' : 'DÜNYA LİGİ'}
          </span>
          <button onClick={() => setRefresh(v => v + 1)} className="weekly-nav-button" aria-label="Sıralamayı yenile">
            <RefreshCw className={'h-4 w-4' + (loading ? ' animate-spin' : '')} />
          </button>
        </div>

        <section className={'weekly-hero relative isolate overflow-hidden rounded-[28px] border border-amber-200/25 shadow-[0_22px_75px_rgba(0,0,0,.45)]' + (mode === 'flags' ? ' weekly-hero-flags' : mode === 'clues' ? ' weekly-hero-clues' : '')}>
          <div className="weekly-photo" aria-hidden="true" />
          <div className="weekly-hero-shine" aria-hidden="true" />
          <div className="relative z-10 px-6 pb-7 pt-7 sm:px-8 sm:py-9">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-200/35 bg-amber-200/10 px-3 py-1.5 text-[10px] font-black tracking-[.17em] text-amber-200">
              <Sparkles className="h-3.5 w-3.5" /> HER HAFTA YENİ BİR ŞAMPİYON
            </div>
            <div className="mt-5 flex items-start gap-3">
              <div className="weekly-cup-emblem shrink-0"><Trophy className="h-8 w-8 text-amber-100" strokeWidth={1.8} /></div>
              <div className="max-w-[285px]">
                <h1 className="text-[27px] font-black leading-[1.08] tracking-tight text-white sm:text-4xl">HAFTALIK<br /><span className="weekly-gold-text">{mode === 'flags' ? 'BAYRAK LİGİ' : mode === 'clues' ? 'İPUCU LİGİ' : 'KARIŞIK LİG'}</span></h1>
                <p className="mt-3 max-w-xs text-xs leading-relaxed text-blue-100/85 sm:text-sm">{mode === 'flags' ? 'Bayrakları tanı, puanını yükselt ve Bayrak Ligi şampiyonu ol.' : mode === 'clues' ? 'İpuçlarını çöz, gizemli ülkeleri keşfet ve İpucu Ligi şampiyonu ol.' : 'Ülkeler, başkentler ve bayraklar: hepsi tek yarışta. Dünya liginde zirveye çık.'}</p>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="weekly-hero-pill"><CalendarDays className="h-3.5 w-3.5" /> {dateLabel}</span>
              {weekOffset === 0 && <span className="weekly-hero-pill"><Timer className="h-3.5 w-3.5 text-amber-300" /> {getTimeToReset()} kaldı</span>}
              <span className="weekly-hero-pill"><Users className="h-3.5 w-3.5" /> {rows.length > 99 ? '100+' : rows.length} oyuncu listede</span>
            </div>
          </div>
        </section>

        <div className="mt-5 grid grid-cols-3 gap-1 rounded-2xl border border-amber-300/20 bg-[#071b35] p-1.5" role="tablist" aria-label="Haftalık lig türü">
          <button type="button" role="tab" aria-selected={mode === 'mixed'} onClick={() => setMode('mixed')} className={'weekly-tab ' + (mode === 'mixed' ? 'weekly-tab-selected' : '')}><Globe2 className="h-4 w-4" /> Karışık</button>
          <button type="button" role="tab" aria-selected={mode === 'flags'} onClick={() => setMode('flags')} className={'weekly-tab ' + (mode === 'flags' ? 'weekly-tab-selected' : '')}><Flag className="h-4 w-4" /> Bayrak</button>
          <button type="button" role="tab" aria-selected={mode === 'clues'} onClick={() => setMode('clues')} className={'weekly-tab ' + (mode === 'clues' ? 'weekly-tab-selected' : '')}><Lightbulb className="h-4 w-4" /> İpucu</button>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-white/5 p-1.5" role="tablist" aria-label="Sıralama haftası">
          <button type="button" role="tab" aria-selected={weekOffset === 0} onClick={() => setWeekOffset(0)} className={'weekly-tab' + (weekOffset === 0 ? ' weekly-tab-selected' : '')}>Bu Hafta <ArrowUpRight className="h-4 w-4" /></button>
          <button type="button" role="tab" aria-selected={weekOffset === -1} onClick={() => setWeekOffset(-1)} className={'weekly-tab' + (weekOffset === -1 ? ' weekly-tab-selected' : '')}>Geçen Hafta <Medal className="h-4 w-4" /></button>
        </div>

        <section className="weekly-stage relative mt-5 overflow-hidden rounded-[26px] border border-white/10 px-4 pb-0 pt-7 sm:px-7">
          <div className="weekly-stage-grid" aria-hidden="true" />
          <div className="relative z-10 flex items-center justify-center gap-2 text-center text-[11px] font-black tracking-[.2em] text-amber-200"><Crown className="h-4 w-4" /> ŞAMPİYONLAR PODYUMU <Crown className="h-4 w-4" /></div>
          {loading ? (
            <div className="flex h-56 items-center justify-center gap-3 text-slate-300"><RefreshCw className="h-5 w-5 animate-spin text-cyan-300" /> Podyum hazırlanıyor...</div>
          ) : error ? (
            <div className="flex min-h-[225px] flex-col items-center justify-center gap-3 text-center"><Shield className="h-11 w-11 text-amber-300" /><p className="max-w-[275px] text-sm leading-relaxed text-slate-300">{error}</p><button onClick={() => setRefresh(v => v + 1)} className="rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold">Yeniden Dene</button></div>
          ) : (
            <div className="relative mt-11 grid grid-cols-3 items-end gap-1 sm:gap-3">
              <PodiumPlayer place={2} entry={topThree[1]} />
              <PodiumPlayer place={1} entry={topThree[0]} />
              <PodiumPlayer place={3} entry={topThree[2]} />
            </div>
          )}
        </section>

        <section className="weekly-me mt-5 overflow-hidden rounded-2xl border border-cyan-300/25 p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3"><div className="weekly-me-icon"><Target className="h-6 w-6 text-cyan-100" /></div><div><p className="text-[10px] font-bold tracking-[.16em] text-cyan-200">SENİN SIRAN</p><p className="mt-1 truncate text-sm font-bold text-white">{playerName || 'Yeni gezgin'}</p></div></div>
            <div className="text-right"><p className="text-2xl font-black text-white">{mine ? '#' + number.format(mine.rank) : '—'}</p><p className="text-[10px] text-blue-200/65">{mode === 'flags' ? 'Bayrak ligi' : mode === 'clues' ? 'İpucu ligi' : 'Karışık lig'}</p></div>
          </div>
          <div className="mt-4 grid grid-cols-3 divide-x divide-white/10 rounded-xl border border-white/10 bg-black/20 py-3 text-center">
            <div><div className="text-lg font-black text-amber-200">{number.format(mine?.entry.score ?? 0)}</div><div className="text-[10px] text-slate-300">Haftalık puan</div></div>
            <div><div className="text-lg font-black text-white">{number.format(mine?.entry.correct_answers ?? 0)}</div><div className="text-[10px] text-slate-300">Doğru cevap</div></div>
            <div><div className="text-lg font-black text-white">{number.format(mine?.entry.games_played ?? 0)}</div><div className="text-[10px] text-slate-300">Oyun</div></div>
          </div>
          {!mine && !loading && !error && <p className="mt-3 text-center text-xs text-slate-300">{weekOffset === 0 ? 'Henüz skorun yok. İlk puanlarını kazan!' : 'Geçen hafta henüz skorun bulunmuyor.'}</p>}
        </section>

        <section className="mt-6 rounded-[24px] border border-white/10 bg-[#111a35]/80 p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between"><div className="flex items-center gap-2"><Award className="h-5 w-5 text-amber-300" /><h2 className="text-base font-extrabold">Tüm Sıralama</h2></div><span className="text-[10px] font-bold tracking-wider text-slate-400">İLK 100</span></div>
          {!loading && !error && rows.length === 0 && <div className="weekly-empty">{mode === 'flags' ? <Flag className="h-12 w-12 text-amber-300/70" /> : mode === 'clues' ? <Lightbulb className="h-12 w-12 text-violet-300/70" /> : <Globe2 className="h-12 w-12 text-cyan-300/70" />}<p className="mt-3 font-bold text-white">İlk kaşif sen ol!</p><p className="mt-1 text-sm text-slate-400">Bu hafta henüz kimse puan kazanmadı.</p></div>}
          {!loading && !error && rows.length > 0 && remaining.length === 0 && <p className="rounded-xl bg-white/5 p-4 text-center text-xs text-slate-400">İlk üç oyuncu yukarıdaki podyumda. Yeni rakipler bu listede belirecek.</p>}
          {!loading && !error && remaining.length > 0 && <div className="space-y-2">
            {remaining.map((entry, index) => (
              <div key={entry.id} className={'weekly-ranking-row' + (mine?.entry.player_id === entry.player_id ? ' weekly-ranking-self' : '')}>
                <span className="w-8 shrink-0 text-center text-sm font-black text-slate-300">{index + 4}</span>
                <div className="weekly-mini-avatar">{shortName(entry.player_name)}</div>
                <div className="min-w-0 flex-1"><div className="truncate text-sm font-bold text-white">{entry.player_name}</div><div className="text-[10px] text-slate-400">{entry.correct_answers} doğru • {entry.games_played} oyun</div></div>
                <span className="shrink-0 text-sm font-black text-amber-100">{number.format(entry.score)}</span>
                <ChevronRight className="h-4 w-4 shrink-0 text-white/20" />
              </div>
            ))}
          </div>}
        </section>

        {weekOffset === 0 && <div className="mt-5 rounded-2xl border border-violet-300/20 bg-violet-400/5 p-4 text-center text-xs leading-relaxed text-slate-300"><Sparkles className="mr-1 inline h-4 w-4 text-violet-300" /> Her pazartesi UTC 00.00'da yeni bir hafta başlar. Geçmiş şampiyonlar kaybolmaz.</div>}
        <button disabled={!playerName.trim()} onClick={() => onPlay(mode)} className="weekly-play-button mt-5 flex w-full items-center justify-center gap-3 rounded-2xl px-5 py-4 text-sm font-black tracking-wide disabled:cursor-not-allowed disabled:opacity-50"><Rocket className="h-5 w-5" /> {mode === 'flags' ? 'BAYRAK LİGİNDE OYNA' : mode === 'clues' ? 'İPUCU LİGİNDE OYNA' : 'KARIŞIK LİGDE OYNA'} <ArrowUpRight className="h-5 w-5" /></button>
        {!playerName.trim() && <p className="mt-2 text-center text-xs text-amber-300">Oynamak için geri dönüp bir takma ad seç.</p>}
        <div className="mt-5 flex items-center justify-center gap-2 text-[10px] text-slate-500"><Shield className="h-3.5 w-3.5" /> Şifresiz oyuncu sistemi • Atlas Arena</div>
      </div>
    </div>
  );
}
