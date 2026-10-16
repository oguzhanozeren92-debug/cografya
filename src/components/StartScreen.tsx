import { lazy, Suspense, useState } from 'react';
import {
  ArrowRight, CalendarCheck, Check, ChevronRight, Compass, Crown, Flame,
  Flag, Globe2, Lightbulb, MapPinned, Pencil, Play, Search,
  ShieldCheck, Sparkles, Trophy, UserRound, Volume2, VolumeX,
} from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { motion, useReducedMotion } from 'motion/react';
import { DAILY_TOTAL, getDailyDate, getStreakForDay, loadDailyProgress } from '@/lib/dailyChallenge';
import { getDiscoveredCountries } from '@/lib/discovery';
import { VALID_COUNTRY_IDS } from '@/data/countries';
import { playGameSound } from '@/lib/gameFx';
import { HomePlanet } from '@/components/HomePlanet';
import type { GameMode, LeaderboardEntry } from '@/types';

interface StartScreenProps {
  onStart: (mode: GameMode) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onAdPrivacy?: () => void;
  onViewWeekly: (mode: GameMode) => void;
  onDaily: () => void;
  onExplore: () => void;
  leaderboard: LeaderboardEntry[];
  playerName: string;
  onNameChange: (name: string) => Promise<void>;
  leaderboardError: string;
}

const arenaModes: GameMode[] = ['mixed', 'flags', 'clues'];
const ArenaParticles = lazy(() => import('@/components/ArenaParticles'));


export function StartScreen({
  onStart, soundEnabled, onToggleSound, onAdPrivacy, onViewWeekly, onDaily,
  onExplore, leaderboard, playerName, onNameChange, leaderboardError,
}: StartScreenProps) {
  const reduceMotion = useReducedMotion();
  const [editing, setEditing] = useState(!playerName);
  const [selectedMode, setSelectedMode] = useState<GameMode>('mixed');
  const [name, setName] = useState(playerName);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const today = getDailyDate();
  const dailyProgress = loadDailyProgress(today);
  const foundCount = getDiscoveredCountries().length;
  const streak = getStreakForDay(today);
  const progressPercent = Math.round(foundCount / VALID_COUNTRY_IDS.length * 100);

  const save = async () => {
    if (!name.trim() || busy) return;
    setBusy(true);
    try {
      await onNameChange(name);
      setEditing(false);
      setError('');
    } catch {
      setError('Takma ad kaydedilemedi. Tekrar dene.');
    } finally {
      setBusy(false);
    }
  };

  const selectMode = (mode: GameMode) => {
    setSelectedMode(mode);
    playGameSound('select');
  };

  const entrance = (index: number) => reduceMotion
    ? {}
    : { initial: { opacity: 0, y: 13 }, animate: { opacity: 1, y: 0 }, transition: { delay: index * .055, duration: .32 } };

  return (
    <div className="atlas-home fixed inset-0 z-20 overflow-y-auto overscroll-contain text-white">
      <main className="atlas-home-inner mx-auto w-full max-w-[490px] px-4 sm:px-5">
        <header className="atlas-home-topbar flex items-center justify-between gap-2">
          <div className="atlas-home-brand flex min-w-0 items-center gap-2.5">
            <span className="atlas-home-brand-icon" aria-hidden="true"><Globe2 className="h-6 w-6" strokeWidth={1.8} /></span>
            <span className="atlas-home-brand-name">ATLAS <strong>ARENA</strong></span>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button type="button" onClick={onToggleSound}
              title={soundEnabled ? 'Sesleri kapat' : 'Sesleri aç'}
              aria-label={soundEnabled ? 'Oyun sesini kapat' : 'Oyun sesini aç'}
              aria-pressed={soundEnabled} className="atlas-home-topbutton">
              {soundEnabled ? <Volume2 className="h-4.5 w-4.5" /> : <VolumeX className="h-4.5 w-4.5" />}
            </button>
            <button type="button" onClick={() => { setName(playerName); setEditing(value => !value); }}
              aria-label="Oyuncu adını düzenle" className="atlas-home-profile flex max-w-[128px] items-center gap-1.5">
              <UserRound className="h-4 w-4 shrink-0 text-cyan-200" />
              <span className="truncate">{playerName || 'İsim seç'}</span>
              <Pencil className="h-3 w-3 shrink-0 text-white/50" />
            </button>
          </div>
        </header>

        <motion.section {...entrance(0)} className="atlas-home-hero relative isolate overflow-hidden">
          <div className="atlas-home-hero-grid" aria-hidden="true" />
          {!reduceMotion && <Suspense fallback={null}><ArenaParticles /></Suspense>}
          <HomePlanet />
          <div className="atlas-home-hero-content relative z-10">
            <span className="atlas-home-eyebrow"><Sparkles className="h-3.5 w-3.5" /> OYUN ZAMANI</span>
            <h1 className="atlas-home-hero-title">DÜNYA<br /><span>SENİN!</span></h1>
            <p className="atlas-home-hero-caption">Keşfet. Yarış. Kazan.</p>
          </div>
          <div className="atlas-home-hero-footer relative z-10 flex items-center gap-2">
            <span className="atlas-home-hero-chip"><Globe2 className="h-3.5 w-3.5" /> 3 ARENA</span>
            <span className="atlas-home-hero-chip atlas-home-hero-chip-gold"><Trophy className="h-3.5 w-3.5" /> ZİRVE SENİ BEKLİYOR</span>
          </div>
        </motion.section>

        {editing && (
          <motion.form {...entrance(1)} onSubmit={event => { event.preventDefault(); void save(); }}
            className="atlas-home-nickname mt-3 rounded-2xl border border-amber-200/30 bg-[#142241]/90 p-3">
            <label htmlFor="atlas-name" className="mb-2 block text-xs font-extrabold tracking-wide text-amber-200">
              {playerName ? 'OYUNCU ADINI DÜZENLE' : 'MACERAYA BAŞLAMAK İÇİN TAKMA AD SEÇ'}
            </label>
            <div className="flex gap-2">
              <input id="atlas-name" maxLength={20} value={name} autoComplete="nickname"
                onChange={event => setName(event.target.value)} placeholder="Takma adın"
                className="min-w-0 flex-1 rounded-xl border border-white/15 bg-white/10 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-400 focus:border-amber-300/70" />
              <button type="submit" disabled={busy || !name.trim()} className="rounded-xl bg-amber-300 px-4 text-sm font-black text-[#13233c] disabled:opacity-50">
                {busy ? '...' : 'KAYDET'}
              </button>
            </div>
            {error && <p className="mt-2 text-xs text-rose-300" role="alert">{error}</p>}
          </motion.form>
        )}

        <motion.div {...entrance(1)} className="atlas-home-stats mt-3 grid grid-cols-2 gap-2">
          <button type="button" onClick={onExplore} className="atlas-home-stat group flex items-center gap-2.5 text-left">
            <span className="atlas-home-stat-icon"><Compass className="h-5 w-5" /></span>
            <span className="min-w-0 flex-1">
              <strong>{foundCount}<span className="text-[13px] text-blue-200/60">/{VALID_COUNTRY_IDS.length}</span></strong>
              <small>ÜLKE KEŞFEDİLDİ</small>
              <span className="atlas-home-progress"><i style={{ width: `${progressPercent}%` }} /></span>
            </span>
          </button>
          <button type="button" onClick={onDaily} className="atlas-home-stat flex items-center gap-2.5 text-left">
            <span className="atlas-home-stat-icon atlas-home-stat-fire"><Flame className="h-5 w-5" /></span>
            <span className="min-w-0 flex-1">
              <strong>{streak}<span className="ml-1 text-[13px] text-amber-100/65">gün</span></strong>
              <small>GÜNLÜK SERİ</small>
              <span className="text-[10px] font-bold text-amber-200/70">{dailyProgress.answers.length}/{DAILY_TOTAL} görev</span>
            </span>
          </button>
        </motion.div>

        <div className="atlas-home-section-title mt-5 mb-2.5 flex items-center justify-between gap-2">
          <h2>ARENANI SEÇ</h2>
          <span><span className="atlas-home-live-dot" /> 3 OYUN MODU</span>
        </div>

        <div className="atlas-home-modes grid grid-cols-2 gap-2.5" role="group" aria-label="Oyun modu seçimi">
          {arenaModes.map((mode, index) => {
            const selected = selectedMode === mode;
            const mixed = mode === 'mixed';
            const flags = mode === 'flags';
            const label = mixed ? 'KARIŞIK' : flags ? 'BAYRAKLAR' : 'İPUCU AVI';
            const subtitle = mixed ? 'Harita · Başkent' : flags ? 'Bayrağı tahmin et' : 'Bilgiden ülkeyi bul';
            return (
              <motion.button type="button" key={mode} {...entrance(index + 2)}
                whileTap={reduceMotion ? undefined : { scale: .965 }}
                onClick={() => selectMode(mode)} aria-pressed={selected}
                className={`atlas-home-mode atlas-home-mode-${mode} ${mode === 'clues' ? 'col-span-2' : ''} ${selected ? 'atlas-home-mode-active' : ''}`}>
                <span className="atlas-home-mode-shine" aria-hidden="true" />
                <span className="atlas-home-mode-art" aria-hidden="true">
                  {mixed ? <Globe2 className="h-11 w-11" strokeWidth={1.25} /> : flags
                    ? <span className="atlas-home-flags">🇹🇷<span>🇯🇵</span>🇧🇷</span>
                    : <span className="atlas-home-clue-art"><Search className="h-9 w-9" /><Lightbulb className="h-5 w-5" /></span>}
                </span>
                <span className="atlas-home-mode-copy">
                  <strong>{label}</strong><small>{subtitle}</small>
                </span>
                <span className="atlas-home-mode-check" aria-hidden="true">
                  {selected ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : <ArrowRight className="h-3.5 w-3.5" />}
                </span>
              </motion.button>
            );
          })}
        </div>

        <motion.button {...entrance(5)} type="button" whileTap={reduceMotion ? undefined : { scale: .97 }}
          disabled={!playerName || editing} onClick={() => onStart(selectedMode)}
          className="atlas-home-start mt-3 flex w-full items-center justify-center gap-3 disabled:cursor-not-allowed disabled:opacity-55">
          <span className="atlas-home-play-symbol"><Play className="h-5 w-5 fill-current" /></span>
          <strong>{!playerName ? 'ÖNCE TAKMA AD SEÇ' : 'OYUNA BAŞLA'}</strong>
          <ChevronRight className="ml-auto h-6 w-6" />
        </motion.button>

        <div className="atlas-home-section-title mt-5 mb-2.5 flex items-center justify-between">
          <h2>MACERAYA DEVAM</h2>
          <span>GÖREVLER & KEŞİF</span>
        </div>

        <div className="atlas-home-quick grid grid-cols-2 gap-2.5">
          <button type="button" onClick={onDaily} className="atlas-home-quick-card atlas-home-quick-daily">
            <span className="atlas-home-quick-bubble"><CalendarCheck className="h-6 w-6" /></span>
            <strong>GÜNLÜK 10</strong>
            <small>{dailyProgress.answers.length === DAILY_TOTAL ? 'Tamamlandı ✓' : `${dailyProgress.answers.length}/${DAILY_TOTAL} tamamlandı`}</small>
            <span className="atlas-home-quick-arrow"><ArrowRight className="h-4 w-4" /></span>
          </button>
          <button type="button" onClick={onExplore} className="atlas-home-quick-card atlas-home-quick-explore">
            <span className="atlas-home-quick-bubble"><MapPinned className="h-6 w-6" /></span>
            <strong>KEŞİF HARİTAM</strong>
            <small>%{progressPercent} keşfedildi</small>
            <span className="atlas-home-quick-arrow"><ArrowRight className="h-4 w-4" /></span>
          </button>
        </div>

        <button type="button" onClick={() => onViewWeekly(selectedMode)}
          className="atlas-home-league mt-3 flex w-full items-center gap-3 text-left">
          <span className="atlas-home-league-cup"><Trophy className="h-7 w-7" /></span>
          <span className="min-w-0 flex-1">
            <strong>HAFTALIK LİG</strong>
            <small>{leaderboard.length ? `Lider: ${leaderboard[0].player_name}` : 'Karışık · Bayrak · İpucu'}</small>
          </span>
          <ChevronRight className="h-5 w-5 shrink-0 text-amber-200" />
        </button>

        {leaderboardError && (
          <p className="atlas-home-offline mt-2 text-center text-[10px] text-slate-500">
            <Crown className="mr-1 inline h-3 w-3" /> Çevrim içi sıralama şu an görüntülenemiyor.
          </p>
        )}

        {Capacitor.isNativePlatform() && onAdPrivacy && (
          <button type="button" onClick={onAdPrivacy}
            className="mx-auto mt-4 flex items-center gap-1.5 px-3 py-2 text-xs text-slate-400">
            <ShieldCheck className="h-4 w-4" /> Reklam gizlilik tercihleri
          </button>
        )}
      </main>
    </div>
  );
}
