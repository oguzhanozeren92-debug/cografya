import { lazy, Suspense, useRef, useState } from 'react';
import {
  ArrowRight, Bell, Camera, CalendarCheck, ChevronRight, Compass, Flag, Globe2, Landmark,
  Lightbulb, MapPinned, Pencil, Play, ShieldCheck, Sparkles,
  Trophy, UserRound, Volume2, VolumeX, Swords,
} from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { motion, useReducedMotion } from 'motion/react';
import { DAILY_TOTAL, getDailyDate, loadDailyProgress } from '@/lib/dailyChallenge';
import { getDiscoveredCountries } from '@/lib/discovery';
import { VALID_COUNTRY_IDS } from '@/data/countries';
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
  onHistory: () => void;
  onGeoDiscovery: (mode: 'nature'|'islands'|'borders') => void;
  onVersus: () => void;
}

const ArenaParticles = lazy(() => import('@/components/ArenaParticles'));

export function StartScreen({
  onStart, soundEnabled, onToggleSound, onAdPrivacy, onViewWeekly,
  onDaily, onExplore, leaderboard, playerName, onNameChange, leaderboardError, onNotifications, onStreet, onStreetLeaderboard, onDrone, onHistory, onGeoDiscovery, onVersus,
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
  const [queuedHistory, setQueuedHistory] = useState(false);
  const [queuedGeoMode,setQueuedGeoMode] = useState<'nature'|'islands'|'borders'|null>(null);
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

  const startHistory = () => {
    if (!canPlay) {
      setQueuedHistory(true);
      setEditing(true);
      nameInputRef.current?.focus();
      return;
    }
    onHistory();
  };

  const startGeoDiscovery = (mode: 'nature'|'islands'|'borders') => {
    if (!canPlay) {
      setQueuedGeoMode(mode);
      setEditing(true);
      nameInputRef.current?.focus();
      return;
    }
    onGeoDiscovery(mode);
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
      if (queuedHistory) {
        setQueuedHistory(false);
        onHistory();
      }
      if (queuedGeoMode) {
        onGeoDiscovery(queuedGeoMode);
        setQueuedGeoMode(null);
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
    <div className="globriva-screen atlas-home atlas-home-refresh atlas-home-cozy atlas-home-illustrated fixed inset-0 z-20 overflow-y-auto overscroll-contain text-white">
      <AtlasHomeBackdrop />
      <style>{`
        .atlas-home-illustrated .globriva-explore-hero {
          position: relative;
          min-height: 290px;
          padding: 16px 16px 16px;
          border: 1.5px solid rgba(255,255,255,.91);
          border-radius: 29px;
          isolation: isolate;
          background: linear-gradient(92deg,rgba(255,247,228,.30) 0%,rgba(255,234,192,.09) 48%,rgba(16,156,202,.05) 100%),
                      url('/globriva-hero-atmosphere.webp') center / cover no-repeat,
                      linear-gradient(115deg,#fff2d6,#2aadd5);
          box-shadow: 0 17px 35px rgba(0,11,38,.25), inset 0 2px rgba(255,255,255,.72);
        }
        .atlas-home-illustrated .globriva-explore-hero::before {
          content: '';
          position: absolute;
          inset: 0;
          z-index: 0;
          border-radius: inherit;
          pointer-events: none;
          opacity: 1;
          background: radial-gradient(circle at 76% 51%,rgba(29,208,255,.30),transparent 40%),
                      linear-gradient(90deg,rgba(255,245,218,.18),transparent 62%);
        }
        .atlas-home-illustrated .globriva-explore-hero::after {
          content: '';
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: 1;
          z-index: 0;
          background: linear-gradient(180deg,rgba(255,255,255,.15),transparent 45%,rgba(233,178,123,.10));
          border-radius: inherit;
        }
        .globriva-explore-hero .aa-hero-stars { opacity: .42; pointer-events:none; }
        .atlas-home-cozy .globriva-explore-hero .aa-hero-copy {
          position: relative;
          z-index: 12;
          min-height: 216px;
          width: 65%;
          pointer-events: none;
        }
        .atlas-home-cozy .globriva-explore-hero .aa-kicker {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 11px;
          color: #b44030;
          font-size: 10px;
          font-weight: 950;
          letter-spacing: -.005em;
          background: rgba(255,253,247,.92);
          box-shadow: 0 4px 13px rgba(174,100,46,.15);
          border: 1px solid rgba(255,255,255,.9);
        }
        .atlas-home-cozy .globriva-explore-hero .aa-hero-copy h1 {
          margin: 20px 0 0;
          color: #153755;
          font-size: clamp(35px,9vw,49px);
          line-height: .98;
          letter-spacing: -.055em;
          font-weight: 1000;
          text-shadow: 0 2px 0 rgba(255,255,255,.08);
        }
        .atlas-home-cozy .globriva-explore-hero .aa-hero-copy h1 span {
          color: #ed5c44;
          background: linear-gradient(110deg,#ff624b 10%,#f64e62 62%,#f4a223);
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .atlas-home-cozy .globriva-explore-hero .aa-hero-copy p {
          margin-top: 12px;
          color: #224b68;
          font-size: 12px;
          font-weight: 800;
          line-height: 1.43;
          text-shadow: 0 1px rgba(255,255,255,.43);
        }
        .atlas-home-illustrated .globriva-explore-hero .aa-hero-bottom {
          position: relative;
          z-index: 20;
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          align-items: center;
          padding-top: 2px;
        }
        .globriva-explore-hero .globriva-hero-action {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          min-height: 42px;
          padding: 9px 11px;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,.97);
          background: rgba(255,255,255,.93);
          color: #163c61;
          font-size: 11px;
          font-weight: 900;
          white-space: nowrap;
          box-shadow: 0 5px 13px rgba(85,92,132,.16), inset 0 1px rgba(255,255,255,.90);
          transition: transform .16s ease, box-shadow .16s ease;
          cursor: pointer;
        }
        .globriva-explore-hero .globriva-hero-action:active { transform: scale(.96); }
        .globriva-explore-hero .globriva-hero-action:hover { box-shadow:0 8px 16px rgba(53,115,151,.23); }
        .globriva-explore-hero .globriva-hero-action:focus-visible { outline:3px solid #1769a2;outline-offset:3px; }
        .globriva-explore-hero .globriva-hero-action svg { flex-shrink:0; }
        .globriva-explore-hero .globriva-hero-float {
          position: absolute;
          top: 51px;
          left: 55%;
          z-index: 6;
          color: #fff9dc;
          pointer-events:none;
          opacity: .93;
          filter: drop-shadow(0 0 6px rgba(255,183,77,.9));
          animation: globriva-hero-hover 5s ease-in-out infinite;
        }
        @keyframes globriva-hero-hover { 0%,100%{transform:translateY(0) rotate(-9deg)} 50%{transform:translateY(-7px) rotate(-4deg)} }
        @media (max-width:380px) {
          .atlas-home-illustrated .globriva-explore-hero {min-height: 274px; padding:14px 12px 13px;}
          .atlas-home-cozy .globriva-explore-hero .aa-hero-copy {min-height:210px;width:69%;}
          .atlas-home-cozy .globriva-explore-hero .aa-hero-copy h1 {font-size:32px;margin-top:19px;}
          .atlas-home-cozy .globriva-explore-hero .aa-hero-copy p {font-size:11px;}
          .globriva-explore-hero .globriva-hero-action {font-size:10px;min-height:38px;padding:7px 9px;}
        }
        @media (prefers-reduced-motion:reduce) {
          .globriva-explore-hero .globriva-hero-float {animation:none;}
          .globriva-explore-hero .globriva-hero-action {transition:none;}
        }

        /* The approved PNG/WebP screenshots carried a 22px strip of dark
           page background at their top. Crop that strip inside the real
           interactive button (no replacement artwork or duplicate buttons). */
        .atlas-home-illustrated .globriva-art-crop {
          position: relative;
          display: block;
          box-sizing: border-box;
          width: 100%;
          min-width: 0;
          height: auto;
          padding: 0 !important;
          overflow: hidden;
          isolation: isolate;
          border: 1.5px solid rgba(255,255,255,.94) !important;
          border-radius: 22px !important;
          background-clip: padding-box;
          line-height: 0;
          -webkit-mask-image: -webkit-radial-gradient(white, black);
        }
        .atlas-home-illustrated .globriva-art-crop-daily { aspect-ratio: 431 / 162; }
        .atlas-home-illustrated .globriva-art-crop-explore { aspect-ratio: 419 / 162; }
        .atlas-home-illustrated .globriva-art-crop-league { aspect-ratio: 862 / 94; }
        .atlas-home-illustrated .globriva-art-crop > img {
          position: absolute !important;
          inset: 0 !important;
          display: block !important;
          width: 100% !important;
          height: 100% !important;
          max-width: none !important;
          margin: 0 !important;
          padding: 0 !important;
          border: 0 !important;
          object-fit: cover !important;
          object-position: center bottom !important;
        }
        .atlas-home-illustrated .globriva-art-crop > span {
          z-index: 2;
          line-height: 1.15;
        }
        @media (max-width: 380px) {
          .atlas-home-illustrated .globriva-art-crop { border-radius: 19px !important; }
        }
      `}</style>
      <main className="globriva-content atlas-home-inner aa-page mx-auto w-full max-w-[490px] px-4 sm:px-5">
        <header className="atlas-home-topbar flex items-center justify-between gap-2">
          <div className="atlas-home-brand flex min-w-0 items-center gap-2.5">
            <span className="atlas-home-brand-icon overflow-hidden" aria-hidden="true">
              <img
                src="/globriva-logo.png"
                alt=""
                width={39}
                height={39}
                draggable={false}
                className="h-full w-full rounded-[13px] object-cover"
              />
            </span>
            <span className="atlas-home-brand-name">Glo<strong>briva</strong></span>
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

        <motion.section {...entrance(0)} className="aa-hero globriva-explore-hero relative isolate overflow-hidden">
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
          <span className="globriva-hero-float" aria-hidden="true"><Sparkles className="h-6 w-6" /></span>
          {!reduceMotion && (
            <FxErrorBoundary>
              <Suspense fallback={null}><ArenaParticles /></Suspense>
            </FxErrorBoundary>
          )}
          <div className="aa-hero-copy relative z-10">
            <span className="aa-kicker"><Sparkles className="h-3.5 w-3.5" /> {t('Bir dünya macera!')}</span>
            <h1>{t('Hadi,')}<br /><span>{t('keşfe çık!')}</span></h1>
            <p>{t('Dünyayı döndür, durdur,')}<br />{t('ülkeyi bul, puanı kap!')}</p>
          </div>
          <div className="aa-hero-bottom">
            <button
              type="button"
              onClick={() => startOrAskName('mixed')}
              aria-label={t('Dünya turu')}
              className="globriva-hero-action touch-manipulation"
            >
              <span aria-hidden="true">🌍</span>
              <span>{t('Dünya turu')}</span>
              <ArrowRight className="h-4 w-4 text-[#3686b7]" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={onVersus}
              aria-label={t('Arkadaşlarınla yarış')}
              className="globriva-hero-action touch-manipulation"
            >
              <span aria-hidden="true">🏆</span>
              <span>{t('Arkadaşlarınla yarış')}</span>
              <ArrowRight className="h-4 w-4 text-[#d99736]" aria-hidden="true" />
            </button>
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
          <div className="mt-2 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => startOrAskName('flags')}
              aria-label={t('Bayrak oyunu')}
              className="group relative isolate flex min-h-[218px] flex-col overflow-hidden rounded-[27px] border border-[#ffd6a9]/70 bg-[#e6a66d] p-3 text-left text-white shadow-[0_12px_28px_rgba(15,16,54,.28)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_18px_34px_rgba(245,151,93,.32)] active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-200 sm:min-h-[236px] sm:p-4"
            >
              <img
                src="/game-cards/bayrak-oyunu.webp"
                alt=""
                loading="lazy"
                draggable={false}
                className="pointer-events-none absolute inset-0 -z-10 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
              />
              <span aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-[#3b231d]/15 via-transparent to-[#071c31]/55" />
              <span className="flex w-full items-start justify-between gap-1.5">
                <span className="inline-flex min-h-8 items-center gap-1 rounded-full border border-white/65 bg-white/90 px-2 py-1 text-[9px] font-black tracking-[.02em] text-[#9b5235] shadow-sm sm:px-2.5 sm:text-[10px]">
                  <Flag className="h-3 w-3 shrink-0" />
                  {t('KLASİK MOD')}
                </span>
                <span aria-hidden="true" className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-white/70 bg-white/90 text-[#334262] shadow-sm transition-transform group-hover:translate-x-0.5 sm:h-9 sm:w-9">
                  <ArrowRight className="h-4 w-4" />
                </span>
              </span>
              <span className="mt-auto block w-full pt-14 drop-shadow-[0_2px_4px_rgba(0,0,0,.5)]">
                <strong className="block text-[19px] font-black leading-[1.08] tracking-[-.02em] sm:text-[22px]">{t('Bayrak oyunu')}</strong>
                <small className="mt-1.5 block text-[11px] font-bold leading-snug text-white/95 sm:text-xs">{t('Bayrağa bak, ülkeyi bil')}</small>
              </span>
            </button>

            <button
              type="button"
              onClick={() => startOrAskName('clues')}
              aria-label={t('Gizemli ülke')}
              className="group relative isolate flex min-h-[218px] flex-col overflow-hidden rounded-[27px] border border-[#d9c5ff]/80 bg-[#7162d8] p-3 text-left text-white shadow-[0_12px_28px_rgba(15,16,54,.28)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_18px_34px_rgba(128,109,250,.30)] active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-200 sm:min-h-[236px] sm:p-4"
            >
              <img
                src="/game-cards/gizemli-ulke.webp"
                alt=""
                loading="lazy"
                draggable={false}
                className="pointer-events-none absolute inset-0 -z-10 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
              />
              <span aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-[#251d64]/15 via-transparent to-[#0d1145]/65" />
              <span className="flex w-full items-start justify-between gap-1.5">
                <span className="inline-flex min-h-8 items-center gap-1 rounded-full border border-white/65 bg-white/90 px-2 py-1 text-[9px] font-black tracking-[.02em] text-[#6650b0] shadow-sm sm:px-2.5 sm:text-[10px]">
                  <Sparkles className="h-3 w-3 shrink-0" />
                  {t('YENİ NESİL İPUCU')}
                </span>
                <span aria-hidden="true" className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-white/70 bg-white/90 text-[#334262] shadow-sm transition-transform group-hover:translate-x-0.5 sm:h-9 sm:w-9">
                  <ArrowRight className="h-4 w-4" />
                </span>
              </span>
              <span className="mt-auto block w-full pt-14 drop-shadow-[0_2px_4px_rgba(0,0,0,.55)]">
                <strong className="block text-[19px] font-black leading-[1.08] tracking-[-.02em] sm:text-[22px]">{t('Gizemli ülke')}</strong>
                <small className="mt-1.5 block text-[11px] font-bold leading-snug text-white/95 sm:text-xs">{t('İpuçlarından ülkeyi tahmin et')}</small>
              </span>
            </button>
          </div>


          {language === 'tr' ? (
            <>
              <button type="button" onClick={onVersus} aria-label={t('Arkadaşlarınla yarış')} className="relative mt-3 block w-full overflow-hidden rounded-[24px] border border-white/25 bg-[#132947] text-left shadow-[0_12px_25px_rgba(0,5,25,.25)] transition-[transform,filter] duration-150 hover:brightness-[1.04] active:scale-[.985] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200">
                <img src="/game-cards/approved-vs.webp" width={865} height={209} alt="" draggable={false} loading="lazy" className="pointer-events-none block h-auto w-full select-none" />
                
              </button>
              <button type="button" onClick={startDrone} aria-label={t("Drone'dan Konumu Bul")} className="relative mt-3 block w-full overflow-hidden rounded-[24px] border border-white/25 bg-[#132947] text-left shadow-[0_12px_25px_rgba(0,5,25,.25)] transition-[transform,filter] duration-150 hover:brightness-[1.04] active:scale-[.985] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200">
                <img src="/game-cards/approved-drone.webp" width={865} height={329} alt="" draggable={false} loading="lazy" className="pointer-events-none block h-auto w-full select-none" />
                
              </button>
              <a
                href="/world-play.html"
                aria-label="Dünya Keşfi: 20 yeni şehir ve 60 gerçek fotoğraf"
                className="group mt-3 flex w-full items-center justify-between gap-4 rounded-[22px] border border-amber-200/65 bg-gradient-to-r from-[#163a4c] via-[#1a4a56] to-[#3a4d53] px-5 py-4 text-left text-white shadow-[0_12px_24px_rgba(0,5,25,.26)] transition-transform active:scale-[.985] focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-200"
              >
                <span className="flex min-w-0 items-center gap-3">
                  <span className="text-3xl" aria-hidden="true">🌍</span>
                  <span className="min-w-0">
                    <small className="block text-[10px] font-extrabold tracking-[.12em] text-amber-200">YENİ · DÜNYA TURU</small>
                    <strong className="mt-1 block text-lg font-black leading-tight">Dünyanın Neresindesin?</strong>
                    <small className="mt-1 block text-xs font-semibold text-white/80">20 şehir · 60 gerçek fotoğraf · 7 bölge</small>
                  </span>
                </span>
                <ChevronRight className="h-6 w-6 shrink-0 text-amber-200"/>
              </a>
              <div className="relative mt-3 w-full overflow-hidden rounded-[24px] border border-white/25 bg-[#142c4d] shadow-[0_14px_28px_rgba(0,7,26,.27)]">
                <img src="/game-cards/approved-street.webp" width={863} height={389} alt="" loading="lazy" draggable={false} className="pointer-events-none block h-auto w-full select-none" />
                <button type="button" onClick={startStreet} aria-label={t('Sokak Dedektifi oyununa başla')} className="absolute inset-x-0 top-0 z-10 h-[79%] touch-manipulation focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-amber-200">
                  <span className="sr-only">{t('Sokak Dedektifi')}</span>
                </button>
                <button type="button" onClick={onStreetLeaderboard} aria-label={t('Sokak Dedektifi dünya sıralaması')} className="absolute inset-x-0 bottom-0 z-10 h-[21%] touch-manipulation focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-amber-200">
                  <span className="sr-only">{t('Sokak Dedektifi dünya sıralaması')}</span>
                </button>
              </div>
            </>
          ) : (
            <>


          <button type="button" onClick={onVersus}
            className="mt-3 flex w-full items-center gap-4 overflow-hidden rounded-[23px] border border-rose-200/40 bg-gradient-to-r from-[#ffbd89] via-[#ff9697] to-[#d8a8ff] px-4 py-4 text-left text-[#202742] shadow-[0_14px_35px_rgba(220,108,183,.22)] transition hover:brightness-105 active:scale-[0.99]">
            <span aria-hidden="true" className="grid h-14 w-14 shrink-0 place-items-center rounded-[18px] bg-white/35 shadow-inner"><Swords className="h-9 w-9" /></span>
            <span className="min-w-0 flex-1"><small className="block text-[10px] font-black tracking-[.11em]">YENİ · 1'E 1 MEYDAN OKUMA</small><strong className="mt-1 block text-xl font-black leading-tight">Arkadaşınla VS At!</strong><span className="mt-1 block text-xs font-semibold leading-4">Davet et, aynı 10 soruda karşılaş, kazananı gör.</span></span>
            <ChevronRight className="h-6 w-6 shrink-0" />
          </button>

          <div className="globriva-drone-stage mt-3 overflow-hidden rounded-[23px] border border-emerald-200/40 bg-gradient-to-br from-[#176c7c] via-[#174b69] to-[#172e53] shadow-[0_12px_26px_rgba(0,7,27,.24)]">
            <button type="button" onClick={startDrone}
              className="globriva-drone-button flex min-h-[116px] w-full items-center gap-3 px-3 py-4 text-left text-white">
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

          <div className="street-entry globriva-street-stage mt-3 overflow-hidden rounded-[23px]">
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
            </>
          )}
        </motion.section>

        <motion.section {...entrance(3)} className="mt-3">
          <button type="button" onClick={startHistory}
            aria-label={language === 'tr' ? 'Medeniyet Dedektifi oyununu başlat' : 'Play Civilization Detective'}
            className="group relative isolate flex min-h-[137px] w-full items-center overflow-hidden rounded-[24px] border border-amber-200/70 bg-[#4c3e4f] px-4 py-4 text-left text-white shadow-[0_14px_30px_rgba(2,10,30,.3)] transition-all duration-200 hover:brightness-110 active:scale-[.985] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-200">
            <img src="/street-photos/p19737b3c805ad373c5e91276/f.jpg"
              alt="" aria-hidden="true" draggable={false} loading="lazy"
              className="pointer-events-none absolute inset-0 -z-10 h-full w-full object-cover object-center opacity-75 transition-transform duration-500 group-hover:scale-[1.05]"/>
            <span aria-hidden="true"
              className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-[#25172c]/95 via-[#3c2a42]/85 to-[#2d334c]/30"/>
            <span aria-hidden="true"
              className="mr-3 grid h-14 w-14 shrink-0 place-items-center rounded-[18px] border border-amber-200/60 bg-amber-200/15 text-amber-100 backdrop-blur-sm">
              <Landmark className="h-8 w-8"/>
            </span>
            <span className="min-w-0 flex-1">
              <small className="mb-1 block text-[10px] font-black tracking-[.10em] text-amber-200">
                {language === 'tr' ? 'YENİ · 360° TARİH MACERASI' : 'NEW · 360° HISTORY ADVENTURE'}
              </small>
              <strong className="block text-[clamp(17px,4.5vw,23px)] font-black leading-tight">
                {language === 'tr' ? 'Medeniyet Dedektifi' : 'Civilization Detective'}
              </strong>
              <span className="mt-1 block max-w-[250px] text-[11px] font-semibold leading-4 text-white/90">
                {language === 'tr' ? '8 tarihî mekân · 24 soru · 20 mekânlık tarih arşivi!'
                  : '8 historical sites · 24 questions · 20-site heritage library!'}
              </span>
            </span>
            <ChevronRight className="ml-1 h-6 w-6 shrink-0 text-amber-100"/>
          </button>
        </motion.section>

        <motion.section {...entrance(4)} className="mt-4">
          <h2 className="aa-section-heading">{language==='tr'?'Yeni Coğrafya Oyunları':'New Geography Games'}</h2>
          <p className="mt-1 text-xs font-semibold text-slate-300">{language==='tr'?'Dünyayı yeni gözlerle keşfet!':'Discover the world in new ways!'}</p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {([
              {id:'nature',emoji:'🏞️',tr:'Doğa Dedektifi',en:'Nature Detective',subTr:'Dağ, nehir ve göller',subEn:'Mountains, rivers, lakes',photo:'/game-cards/approved-drone.webp',tone:'bg-[#9ce6d8]',glow:'from-[#fff7d7] via-[#edfff2]'},
              {id:'islands',emoji:'🏝️',tr:'Ada Avcısı',en:'Island Hunter',subTr:'Siluetlerden ada bul',subEn:'Find islands by shape',photo:'/game-cards/approved-explore.webp',tone:'bg-[#99e9ec]',glow:'from-[#e5faff] via-[#fff4cc]'},
              {id:'borders',emoji:'🌐',tr:'Sınır Dedektifi',en:'Border Detective',subTr:'Komşuları keşfet',subEn:'Discover the neighbors',photo:'/game-cards/bayrak-oyunu.webp',tone:'bg-[#f6d5a1]',glow:'from-[#fff5df] via-[#f6faff]'},
            ] as const).map(item=><button key={item.id} type="button" onClick={()=>startGeoDiscovery(item.id)}
              aria-label={language==='tr'?item.tr:item.en}
              className={'group relative isolate flex min-h-[180px] flex-col overflow-hidden rounded-[22px] border-[1.5px] border-white/90 text-left shadow-[0_12px_27px_rgba(0,12,30,.22)] transition-all duration-200 hover:brightness-[1.03] active:scale-[.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-200 '+item.tone}>
              <img src={item.photo} draggable={false} loading="lazy" alt=""
                className="pointer-events-none absolute inset-0 -z-10 h-full w-full select-none object-cover object-center" aria-hidden="true"/>
              <span aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-t from-white/100 via-white/75 to-white/0"/>
              <span className="relative ml-3 mt-3 grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-white/80 bg-white/75 text-2xl shadow-md backdrop-blur-sm" aria-hidden="true">{item.emoji}</span>
              <span className="relative mt-auto w-full px-3 pb-4 pt-8">
                <strong className="block text-[clamp(13px,3.7vw,17px)] font-black leading-[1.15] text-[#123d54]">{language==='tr'?item.tr:item.en}</strong>
                <small className="mt-1.5 block text-[10px] font-bold leading-4 text-[#436278]">{language==='tr'?item.subTr:item.subEn}</small>
              </span>
              <ChevronRight className="absolute bottom-4 right-2.5 h-4 w-4 text-[#346887]" aria-hidden="true"/>
            </button>)}
          </div>
        </motion.section>

        <motion.section {...entrance(4)} className="mt-5">
          <h2 className="aa-section-heading">{t('Her gün yeni bir macera')}</h2>
          {language === 'tr' ? (
            <div className="mt-2 grid grid-cols-2 gap-3">
              <button type="button" onClick={onDaily} aria-label={t('Günlük 10 soru')} className="globriva-art-crop globriva-art-crop-daily relative block w-full overflow-hidden rounded-[22px] border border-white/25 bg-[#f9dda6] text-left shadow-[0_10px_22px_rgba(0,8,30,.24)] transition-[transform,filter] duration-150 active:scale-[.98] hover:brightness-[1.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-200">
                <img src="/game-cards/approved-daily.webp" width={431} height={184} alt="" draggable={false} loading="lazy" className="pointer-events-none block h-auto w-full select-none" />
                {completed > 0 && <span className="absolute bottom-[4%] left-[7%] rounded-md bg-[#ffe7bb] px-1 py-[1px] text-[clamp(9px,2.5vw,12px)] font-semibold text-[#687782]">{completed}/{DAILY_TOTAL} {t('tamamlandı')}</span>}
              </button>
              <button type="button" onClick={onExplore} aria-label={t('Keşif haritası')} className="globriva-art-crop globriva-art-crop-explore relative block w-full overflow-hidden rounded-[22px] border border-white/25 bg-[#b0eee4] text-left shadow-[0_10px_22px_rgba(0,8,30,.24)] transition-[transform,filter] duration-150 active:scale-[.98] hover:brightness-[1.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200">
                <img src="/game-cards/approved-explore.webp" width={419} height={184} alt="" draggable={false} loading="lazy" className="pointer-events-none block h-auto w-full select-none" />
                {found > 0 && <span className="absolute bottom-[4%] left-[7%] rounded-md bg-[#c6f3e9] px-1 py-[1px] text-[clamp(9px,2.5vw,12px)] font-semibold text-[#647787]">{found}/{VALID_COUNTRY_IDS.length} {t('ülke keşfedildi')}</span>}
              </button>
            </div>
          ) : (
          <div className="aa-quick-grid mt-2 grid grid-cols-2 gap-3">
            <button type="button" onClick={onDaily} className="aa-quick aa-daily globriva-daily-art">
              <CalendarCheck className="h-6 w-6 text-amber-200" />
              <strong>{t('Günlük 10 soru')}</strong>
              <small>{completed}/{DAILY_TOTAL} {t('tamamlandı')}</small>
            </button>
            <button type="button" onClick={onExplore} className="aa-quick aa-map globriva-explore-art">
              <MapPinned className="h-6 w-6 text-cyan-200" />
              <strong>{t('Keşif haritası')}</strong>
              <small>{found}/{VALID_COUNTRY_IDS.length} {t('ülke keşfedildi')}</small>
            </button>
          </div>
          )}
        </motion.section>

        {language === 'tr' ? (
          <motion.button {...entrance(4)} type="button" onClick={() => onViewWeekly('mixed')} aria-label={t('Haftalık sıralama')} className="globriva-art-crop globriva-art-crop-league relative mt-3 block w-full overflow-hidden rounded-[22px] border border-white/25 bg-[#f6c9ed] text-left shadow-[0_12px_25px_rgba(0,8,30,.24)] transition-[transform,filter] duration-150 hover:brightness-[1.03] active:scale-[.985] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-200">
            <img src="/game-cards/approved-league.webp" width={862} height={116} alt="" loading="lazy" draggable={false} className="pointer-events-none block h-auto w-full select-none" />
          </motion.button>
        ) : (
        <motion.button {...entrance(4)} type="button"
          onClick={() => onViewWeekly('mixed')}
          className="aa-league globriva-league-art mt-3 flex w-full items-center gap-3 text-left">
          <span className="aa-league-icon"><Trophy className="h-6 w-6" /></span>
          <span className="min-w-0 flex-1">
            <strong>{t('Haftalık sıralama')}</strong>
            <small>{leaderboard.length ? t('Zirvedeki oyuncuları gör') : t('Arkadaşlarınla yarış, zirveye çık')}</small>
          </span>
          <ChevronRight className="h-5 w-5 shrink-0" />
        </motion.button>
        )}

        {leaderboardError && (
          <p className="mt-2 text-center text-[11px] text-blue-200/70">
            <Flag className="mr-1 inline h-3 w-3" /> {t('Çevrim içi sıralama şu an görüntülenemiyor.')}
          </p>
        )}
        <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-slate-300">
          <a href="/privacy.html"
            className="inline-flex min-h-[44px] items-center gap-1.5 px-2 py-2 underline underline-offset-4">
            <ShieldCheck className="h-4 w-4" /> {language === 'tr' ? 'Gizlilik Politikası' : 'Privacy Policy'}
          </a>
          <a href="/support.html"
            className="inline-flex min-h-[44px] items-center px-2 py-2 underline underline-offset-4">
            {language === 'tr' ? 'Destek ve Veri Silme' : 'Support & Data Deletion'}
          </a>
        </div>
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
