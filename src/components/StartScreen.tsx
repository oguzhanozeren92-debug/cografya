import { lazy, Suspense, useRef, useState } from 'react';
import {
  ArrowRight, CalendarCheck, ChevronRight, Compass, Flag, Globe2,
  Lightbulb, MapPinned, Pencil, Play, ShieldCheck, Sparkles,
  Trophy, UserRound, Volume2, VolumeX,
} from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { motion, useReducedMotion } from 'motion/react';
import { DAILY_TOTAL, getDailyDate, loadDailyProgress } from '@/lib/dailyChallenge';
import { getDiscoveredCountries } from '@/lib/discovery';
import { VALID_COUNTRY_IDS } from '@/data/countries';
import { HomePlanet } from '@/components/HomePlanet';
import { FxErrorBoundary } from '@/components/FxErrorBoundary';
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

const ArenaParticles = lazy(() => import('@/components/ArenaParticles'));

export function StartScreen({
  onStart, soundEnabled, onToggleSound, onAdPrivacy, onViewWeekly,
  onDaily, onExplore, leaderboard, playerName, onNameChange, leaderboardError,
}: StartScreenProps) {
  const reduceMotion = useReducedMotion();
  const [editing, setEditing] = useState(!playerName);
  const [name, setName] = useState(playerName);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [queuedMode, setQueuedMode] = useState<GameMode | null>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const completed = loadDailyProgress(getDailyDate()).answers.length;
  const found = getDiscoveredCountries().length;
  const canPlay = Boolean(playerName) && !editing;

  const startOrAskName = (mode: GameMode) => {
    if (!canPlay) {
      setQueuedMode(mode);
      setEditing(true);
      nameInputRef.current?.focus();
      return;
    }
    onStart(mode);
  };

  const save = async () => {
    if (!name.trim() || busy) return;
    setBusy(true);
    try {
      await onNameChange(name.trim());
      setEditing(false);
      if (queuedMode) {
        const mode = queuedMode;
        setQueuedMode(null);
        onStart(mode);
      }
      setError('');
    } catch {
      setError('Takma ad kaydedilemedi. Lütfen tekrar dene.');
    } finally {
      setBusy(false);
    }
  };

  const revealName = () => {
    setName(playerName);
    setEditing(true);
  };

  const entrance = (index: number) => reduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 12 },
        animate: { opacity: 1, y: 0 },
        transition: { delay: index * 0.06, duration: 0.3 },
      };

  return (
    <div className="atlas-home atlas-home-refresh atlas-home-cozy fixed inset-0 z-20 overflow-y-auto overscroll-contain text-white">
      <main className="atlas-home-inner aa-page mx-auto w-full max-w-[490px] px-4 sm:px-5">
        <header className="atlas-home-topbar flex items-center justify-between gap-2">
          <div className="atlas-home-brand flex min-w-0 items-center gap-2.5">
            <span className="atlas-home-brand-icon" aria-hidden="true">
              <Globe2 className="h-6 w-6" strokeWidth={1.8} />
            </span>
            <span className="atlas-home-brand-name">Atlas <strong>Arena</strong></span>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button type="button" onClick={onToggleSound}
              aria-label={soundEnabled ? 'Oyun sesini kapat' : 'Oyun sesini aç'}
              aria-pressed={soundEnabled} className="atlas-home-topbutton">
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>
            <button type="button" onClick={revealName} aria-label="Oyuncu adını düzenle"
              className="atlas-home-profile flex max-w-[128px] items-center gap-1.5">
              <UserRound className="h-4 w-4 shrink-0 text-cyan-200" />
              <span className="truncate">{playerName || 'Takma adım'}</span>
              <Pencil className="h-3 w-3 shrink-0 text-white/50" />
            </button>
          </div>
        </header>

        <motion.section {...entrance(0)} className="aa-hero relative isolate overflow-hidden">
          <div className="aa-hero-stars" aria-hidden="true" />
          {!reduceMotion && (
            <FxErrorBoundary>
              <Suspense fallback={null}><ArenaParticles /></Suspense>
            </FxErrorBoundary>
          )}
          <HomePlanet />
          <div className="aa-hero-copy relative z-10">
            <span className="aa-kicker"><Sparkles className="h-3.5 w-3.5" /> Bir dünya macera!</span>
            <h1>Hadi,<br /><span>keşfe çık!</span></h1>
            <p>Dünyayı döndür, durdur,<br />ülkeyi bul, puanı kap!</p>
          </div>
          <div className="aa-hero-bottom relative z-10">
            <span>🌍 Dünya turu</span>
            <span>🏆 Arkadaşlarınla yarış</span>
          </div>
        </motion.section>

        {editing && (
          <motion.form {...entrance(1)}
            onSubmit={event => { event.preventDefault(); void save(); }}
            className="aa-name mt-3 p-3">
            <label htmlFor="atlas-name" className="mb-2 block text-xs font-bold text-amber-200">
              {playerName ? 'Takma adını değiştirelim mi?' : 'Seni nasıl çağıralım? 😊'}
            </label>
            <div className="flex gap-2">
              <input ref={nameInputRef} id="atlas-name" maxLength={20} value={name}
                autoComplete="nickname" placeholder="Takma adını yaz"
                onChange={event => setName(event.target.value)}
                className="min-w-0 flex-1 rounded-xl border border-white/20 bg-white/10 px-3 py-2.5 text-sm text-white outline-none focus:border-amber-300" />
              <button type="submit" disabled={busy || !name.trim()}
                className="rounded-xl bg-amber-300 px-4 text-sm font-black text-[#182541] disabled:opacity-50">
                {busy ? '...' : 'Kaydet'}
              </button>
            </div>
            {error && <p className="mt-2 text-xs text-rose-200" role="alert">{error}</p>}
          </motion.form>
        )}

        <motion.button {...entrance(1)} type="button"
          whileTap={reduceMotion ? undefined : { scale: .97 }}
          onClick={() => startOrAskName('mixed')}
          className="aa-play mt-3 flex w-full items-center gap-3 text-left">
          <span className="aa-play-icon"><Play className="h-6 w-6 fill-current" /></span>
          <span className="min-w-0 flex-1">
            <strong>Oyuna başla!</strong>
            <small>{canPlay ? 'Karışık dünya turu seni bekliyor' : 'Bir takma ad seç, macera başlasın'}</small>
          </span>
          <ChevronRight className="h-7 w-7 shrink-0" strokeWidth={3} />
        </motion.button>

        <motion.section {...entrance(2)} className="mt-5">
          <h2 className="aa-section-heading">Başka ne oynayalım?</h2>
          <div className="aa-mode-grid mt-2 grid grid-cols-2 gap-3">
            <button type="button" onClick={() => startOrAskName('flags')}
              className="aa-mode aa-flags text-left">
              <span className="aa-mode-illustration" aria-hidden="true">🇹🇷 🇯🇵</span>
              <strong>Bayrak oyunu</strong>
              <small>Bayrağa bak, ülkeyi bil</small>
              <span className="aa-mode-arrow" aria-hidden="true"><ArrowRight className="h-4 w-4" /></span>
            </button>
            <button type="button" onClick={() => startOrAskName('clues')}
              className="aa-mode aa-clues text-left">
              <span className="aa-mode-illustration" aria-hidden="true"><Lightbulb className="h-10 w-10" /></span>
              <strong>Gizemli ülke</strong>
              <small>İpuçlarından ülkeyi tahmin et</small>
              <span className="aa-mode-arrow" aria-hidden="true"><ArrowRight className="h-4 w-4" /></span>
            </button>
          </div>
        </motion.section>

        <motion.section {...entrance(3)} className="mt-5">
          <h2 className="aa-section-heading">Her gün yeni bir macera</h2>
          <div className="aa-quick-grid mt-2 grid grid-cols-2 gap-3">
            <button type="button" onClick={onDaily} className="aa-quick aa-daily">
              <CalendarCheck className="h-6 w-6 text-amber-200" />
              <strong>Günlük 10 soru</strong>
              <small>{completed}/{DAILY_TOTAL} tamamlandı</small>
            </button>
            <button type="button" onClick={onExplore} className="aa-quick aa-map">
              <MapPinned className="h-6 w-6 text-cyan-200" />
              <strong>Keşif haritası</strong>
              <small>{found}/{VALID_COUNTRY_IDS.length} ülke keşfedildi</small>
            </button>
          </div>
        </motion.section>

        <motion.button {...entrance(4)} type="button"
          onClick={() => onViewWeekly('mixed')}
          className="aa-league mt-3 flex w-full items-center gap-3 text-left">
          <span className="aa-league-icon"><Trophy className="h-6 w-6" /></span>
          <span className="min-w-0 flex-1">
            <strong>Haftalık sıralama</strong>
            <small>{leaderboard.length ? 'Zirvedeki oyuncuları gör' : 'Arkadaşlarınla yarış, zirveye çık'}</small>
          </span>
          <ChevronRight className="h-5 w-5 shrink-0" />
        </motion.button>

        {leaderboardError && (
          <p className="mt-2 text-center text-[11px] text-blue-200/70">
            <Flag className="mr-1 inline h-3 w-3" /> Çevrim içi sıralama şu an görüntülenemiyor.
          </p>
        )}
        {Capacitor.isNativePlatform() && onAdPrivacy && (
          <button type="button" onClick={onAdPrivacy}
            className="mx-auto mt-4 flex items-center gap-1.5 px-3 py-2 text-xs text-slate-300">
            <ShieldCheck className="h-4 w-4" /> Reklam gizlilik tercihleri
          </button>
        )}
      </main>
    </div>
  );
}
