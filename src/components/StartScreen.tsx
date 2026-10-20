import { lazy, Suspense, useRef, useState } from 'react';
import {
  ArrowRight, Bell, Camera, CalendarCheck, ChevronRight, Compass, Flag, Globe2,
  Lightbulb, MapPinned, Pencil, Play, ShieldCheck, Sparkles,
  Trophy, UserRound, Volume2, VolumeX,
} from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { motion, useReducedMotion } from 'motion/react';
import { DAILY_TOTAL, getDailyDate, loadDailyProgress } from '@/lib/dailyChallenge';
import { getDiscoveredCountries } from '@/lib/discovery';
import { VALID_COUNTRY_IDS } from '@/data/countries';
import { HomePlanet } from '@/components/HomePlanet';
import { AtlasHomeBackdrop } from '@/components/AtlasHomeBackdrop';
import { FxErrorBoundary } from '@/components/FxErrorBoundary';
import { isIosPushSupported } from '@/lib/iosPush';
import type { GameMode, LeaderboardEntry } from '@/types';
import { useLanguage, availableLanguages, type Language } from '@/lib/i18n';

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
  onNotifications?: () => void;
  onStreet: () => void;
  onStreetLeaderboard: () => void;
  onDrone: () => void;
}

const ArenaParticles = lazy(() => import('@/components/ArenaParticles'));

export function StartScreen({
  onStart, soundEnabled, onToggleSound, onAdPrivacy, onViewWeekly,
  onDaily, onExplore, leaderboard, playerName, onNameChange, leaderboardError, onNotifications, onStreet, onStreetLeaderboard, onDrone,
}: StartScreenProps) {
  const reduceMotion = useReducedMotion();
  const { language, setLanguage, t } = useLanguage();
  const [editing, setEditing] = useState(!playerName);
  const [name, setName] = useState(playerName);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [queuedMode, setQueuedMode] = useState<GameMode | null>(null);
  const [queuedStreet, setQueuedStreet] = useState(false);
  const [queuedDrone, setQueuedDrone] = useState(false);
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

  const startStreet = () => {
    if (!canPlay) {
      setQueuedStreet(true);
      setEditing(true);
      nameInputRef.current?.focus();
      return;
    }
    onStreet();
  };

  const startDrone = () => {
    if (!canPlay) {
      setQueuedDrone(true);
      setEditing(true);
      nameInputRef.current?.focus();
      return;
    }
    onDrone();
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
      if (queuedStreet) {
        setQueuedStreet(false);
        onStreet();
      }
      if (queuedDrone) {
        setQueuedDrone(false);
        onDrone();
      }
      setError('');
    } catch {
      setError(t('Takma ad kaydedilemedi. Lütfen tekrar dene.'));
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
    <div className="atlas-home atlas-home-refresh atlas-home-cozy atlas-home-illustrated fixed inset-0 z-20 overflow-y-auto overscroll-contain text-white">
      <AtlasHomeBackdrop />
      <main className="atlas-home-inner aa-page mx-auto w-full max-w-[490px] px-4 sm:px-5">
        <header className="atlas-home-topbar flex items-center justify-between gap-2">
          <div className="atlas-home-brand flex min-w-0 items-center gap-2.5">
            <span className="atlas-home-brand-icon" aria-hidden="true">
              <Globe2 className="h-6 w-6" strokeWidth={1.8} />
            </span>
            <span className="atlas-home-brand-name">Atlas <strong>Arena</strong></span>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {isIosPushSupported() && onNotifications && (
              <button type="button" onClick={onNotifications}
                aria-label={t('Bildirim ayarları')} className="atlas-home-topbutton">
                <Bell className="h-4 w-4" />
              </button>
            )}

            <button type="button" onClick={onToggleSound}
              aria-label={soundEnabled ? t('Oyun sesini kapat') : t('Oyun sesini aç')}
              aria-pressed={soundEnabled} className="atlas-home-topbutton">
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>
            <button type="button" onClick={revealName} aria-label={t('Oyuncu adını düzenle')}
              className="atlas-home-profile flex max-w-[128px] items-center gap-1.5">
              <UserRound className="h-4 w-4 shrink-0 text-cyan-200" />
              <span className="truncate">{playerName || t('Takma adım')}</span>
              <Pencil className="h-3 w-3 shrink-0 text-white/50" />
            </button>
          </div>
        </header>

        <motion.section {...entrance(0)} className="aa-hero relative isolate overflow-hidden">
          <div className="absolute right-3 top-3 z-30">
            <label className="relative flex h-9 max-w-[65px] shrink-0 items-center gap-1 rounded-xl border border-white/20 bg-white/10 px-1.5 text-[10px] font-extrabold text-white" title={t('Dil')}>
              <Globe2 className="h-3.5 w-3.5 shrink-0 text-cyan-200"/>
              <select value={language} onChange={event=>setLanguage(event.target.value as Language)}
                aria-label={t('Dil')} className="w-[34px] min-w-0 appearance-none bg-transparent font-extrabold uppercase text-white outline-none">
                {availableLanguages.map(([code,label])=><option key={code} value={code} className="bg-[#0c2946] text-white">{code.toUpperCase()} · {label}</option>)}
              </select>
            </label>
          </div>
          <div className="aa-hero-stars" aria-hidden="true" />
          {!reduceMotion && (
            <FxErrorBoundary>
              <Suspense fallback={null}><ArenaParticles /></Suspense>
            </FxErrorBoundary>
          )}
          <HomePlanet />
          <div className="aa-hero-copy relative z-10">
            <span className="aa-kicker"><Sparkles className="h-3.5 w-3.5" /> {t('Bir dünya macera!')}</span>
            <h1>{t('Hadi,')}<br /><span>{t('keşfe çık!')}</span></h1>
            <p>{t('Dünyayı döndür, durdur,')}<br />{t('ülkeyi bul, puanı kap!')}</p>
          </div>
          <div className="aa-hero-bottom relative z-10">
            <span>🌍 {t('Dünya turu')}</span>
            <span>🏆 {t('Arkadaşlarınla yarış')}</span>
          </div>
        </motion.section>

        {editing && (
          <motion.form {...entrance(1)}
            onSubmit={event => { event.preventDefault(); void save(); }}
            className="aa-name mt-3 p-3">
            <label htmlFor="atlas-name" className="mb-2 block text-xs font-bold text-amber-200">
              {playerName ? t('Takma adını değiştirelim mi?') : t('Seni nasıl çağıralım? 😊')}
            </label>
            <div className="flex gap-2">
              <input ref={nameInputRef} id="atlas-name" maxLength={20} value={name}
                autoComplete="nickname" placeholder={t('Takma adını yaz')}
                onChange={event => setName(event.target.value)}
                className="min-w-0 flex-1 rounded-xl border border-white/20 bg-white/10 px-3 py-2.5 text-sm text-white outline-none focus:border-amber-300" />
              <button type="submit" disabled={busy || !name.trim()}
                className="rounded-xl bg-amber-300 px-4 text-sm font-black text-[#182541] disabled:opacity-50">
                {busy ? '...' : t('Kaydet')}
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
            <strong>{t('Oyuna başla!')}</strong>
            <small>{canPlay ? t('Karışık dünya turu seni bekliyor') : t('Bir takma ad seç, macera başlasın')}</small>
          </span>
          <ChevronRight className="h-7 w-7 shrink-0" strokeWidth={3} />
        </motion.button>

        <motion.section {...entrance(2)} className="mt-5">
          <h2 className="aa-section-heading">{t('Başka ne oynayalım?')}</h2>
          <div className="aa-mode-grid mt-2 grid grid-cols-2 gap-3">
            <button type="button" onClick={() => startOrAskName('flags')}
              className="aa-mode aa-flags text-left">
              <span className="aa-mode-illustration" aria-hidden="true">🇹🇷 🇯🇵</span>
              <strong>{t('Bayrak oyunu')}</strong>
              <small>{t('Bayrağa bak, ülkeyi bil')}</small>
              <span className="aa-mode-arrow" aria-hidden="true"><ArrowRight className="h-4 w-4" /></span>
            </button>
            <button type="button" onClick={() => startOrAskName('clues')}
              className="aa-mode aa-clues text-left">
              <span className="aa-mode-illustration" aria-hidden="true"><Lightbulb className="h-10 w-10" /></span>
              <strong>{t('Gizemli ülke')}</strong>
              <small>{t('İpuçlarından ülkeyi tahmin et')}</small>
              <span className="aa-mode-arrow" aria-hidden="true"><ArrowRight className="h-4 w-4" /></span>
            </button>
          </div>


          <div className="mt-3 overflow-hidden rounded-[23px] border border-emerald-200/40 bg-gradient-to-br from-[#176c7c] via-[#174b69] to-[#172e53] shadow-[0_12px_26px_rgba(0,7,27,.24)]">
            <button type="button" onClick={startDrone}
              className="flex min-h-[116px] w-full items-center gap-3 px-3 py-4 text-left text-white">
              <span aria-hidden="true" className="grid h-[72px] w-[72px] shrink-0 place-items-center rounded-[18px] border border-white/20 bg-emerald-200/20 text-[32px] shadow-inner">🚁</span>
              <span className="min-w-0 flex-1">
                <small className="block text-[10px] font-black tracking-[.08em] text-emerald-200">
                  {t('ÜCRETSİZ DENEME · 5 HAVA PANORAMASI')}
                </small>
                <strong className="mt-1 block text-lg font-black leading-tight">{t("Drone'dan Konumu Bul")}</strong>
                <span className="mt-1 block text-[11px] font-semibold leading-4 text-blue-100">
                  {t('Havadan 360° bak, haritada tahmin et, kilometreyi öğren!')}
                </span>
              </span>
              <ChevronRight className="h-6 w-6 shrink-0" />
            </button>
          </div>

          <div className="street-entry mt-3 overflow-hidden rounded-[23px]">
            <button type="button" onClick={startStreet} className="street-entry-main flex w-full items-center gap-3 text-left">
              <span className="street-entry-art" aria-hidden="true"><Camera className="h-9 w-9" strokeWidth={1.7}/><span>📍</span></span>
              <span className="min-w-0 flex-1">
                <small className="street-entry-kicker">{t('360° PANORAMA · ARŞİV HAZIRLANIYOR')}</small>
                <strong className="mt-1 block text-lg font-black leading-tight">{t('Sokak Dedektifi')}</strong>
                <span className="mt-1 block text-[11px] font-semibold leading-4">{t('Lisanslı panoramalar geliyor; dünyada yerini bul!')}</span>
              </span>
              <ChevronRight className="h-6 w-6 shrink-0 text-white"/>
            </button>
            <button type="button" onClick={onStreetLeaderboard} className="street-entry-league flex w-full items-center justify-between gap-2 px-4 py-2.5 text-xs font-bold">
              <span className="flex items-center gap-2"><Trophy className="h-4 w-4"/> {t('Sokak Dedektifi dünya sıralaması')}</span>
              <ArrowRight className="h-4 w-4"/>
            </button>
          </div>
        </motion.section>

        <motion.section {...entrance(3)} className="mt-5">
          <h2 className="aa-section-heading">{t('Her gün yeni bir macera')}</h2>
          <div className="aa-quick-grid mt-2 grid grid-cols-2 gap-3">
            <button type="button" onClick={onDaily} className="aa-quick aa-daily">
              <CalendarCheck className="h-6 w-6 text-amber-200" />
              <strong>{t('Günlük 10 soru')}</strong>
              <small>{completed}/{DAILY_TOTAL} {t('tamamlandı')}</small>
            </button>
            <button type="button" onClick={onExplore} className="aa-quick aa-map">
              <MapPinned className="h-6 w-6 text-cyan-200" />
              <strong>{t('Keşif haritası')}</strong>
              <small>{found}/{VALID_COUNTRY_IDS.length} {t('ülke keşfedildi')}</small>
            </button>
          </div>
        </motion.section>

        <motion.button {...entrance(4)} type="button"
          onClick={() => onViewWeekly('mixed')}
          className="aa-league mt-3 flex w-full items-center gap-3 text-left">
          <span className="aa-league-icon"><Trophy className="h-6 w-6" /></span>
          <span className="min-w-0 flex-1">
            <strong>{t('Haftalık sıralama')}</strong>
            <small>{leaderboard.length ? t('Zirvedeki oyuncuları gör') : t('Arkadaşlarınla yarış, zirveye çık')}</small>
          </span>
          <ChevronRight className="h-5 w-5 shrink-0" />
        </motion.button>

        {leaderboardError && (
          <p className="mt-2 text-center text-[11px] text-blue-200/70">
            <Flag className="mr-1 inline h-3 w-3" /> {t('Çevrim içi sıralama şu an görüntülenemiyor.')}
          </p>
        )}
        <a href="https://atlas-arena-tau.vercel.app/privacy.html" target="_blank" rel="noopener noreferrer"
          className="mx-auto mt-3 flex w-fit items-center gap-1.5 px-3 py-2 text-xs text-slate-300 underline underline-offset-4">
          <ShieldCheck className="h-4 w-4" /> {t('Gizlilik Politikası')}
        </a>
        {Capacitor.isNativePlatform() && onAdPrivacy && (
          <button type="button" onClick={onAdPrivacy}
            className="mx-auto mt-4 flex items-center gap-1.5 px-3 py-2 text-xs text-slate-300">
            <ShieldCheck className="h-4 w-4" /> {t('Reklam gizlilik tercihleri')}
          </button>
        )}
      </main>
    </div>
  );
}
