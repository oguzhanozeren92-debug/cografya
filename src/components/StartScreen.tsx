import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import {
  ArrowRight, Bell, Camera, CalendarCheck, ChevronRight, Compass, Flag, Gamepad2, Globe2, Landmark,
  Lightbulb, Mountain, Pencil, Play, ShieldCheck, Sparkles,
  Trophy, UserRound, Volume2, VolumeX, Swords,
} from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { motion, useReducedMotion } from 'motion/react';
import { DAILY_TOTAL, getDailyDate, loadDailyProgress } from '@/lib/dailyChallenge';
import { getDiscoveredCountries } from '@/lib/discovery';
import { VALID_COUNTRY_IDS } from '@/data/countries';
import { AtlasHomeBackdrop } from '@/components/AtlasHomeBackdrop';
import { GeoDiscoveryArt } from '@/components/GeoDiscoveryArt';
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
  onHistory: () => void;
  onGeoDiscovery: (mode: 'nature'|'islands'|'borders') => void;
  onVersus: () => void;
}

const ArenaParticles = lazy(() => import('@/components/ArenaParticles'));

export function StartScreen({
  onStart, soundEnabled, onToggleSound, onAdPrivacy, onViewWeekly,
  onDaily, onExplore, leaderboard, playerName, onNameChange, leaderboardError, onNotifications, onStreet, onStreetLeaderboard, onHistory, onGeoDiscovery, onVersus,
}: StartScreenProps) {
  const reduceMotion = useReducedMotion();
  const { language, setLanguage, t } = useLanguage();
  const [editing, setEditing] = useState(!playerName);
  const [name, setName] = useState(playerName);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [queuedMode, setQueuedMode] = useState<GameMode | null>(null);
  const [queuedStreet, setQueuedStreet] = useState(false);
  const [queuedHistory, setQueuedHistory] = useState(false);
  const [queuedGeoMode,setQueuedGeoMode] = useState<'nature'|'islands'|'borders'|null>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const [heroIndex, setHeroIndex] = useState(0);
  const [heroInteracted, setHeroInteracted] = useState(false);
  const heroTouchStart = useRef<{ x: number; y: number } | null>(null);
  const suppressHeroTap = useRef(false);
  const heroTapReset = useRef<number | null>(null);
  const heroSlides = [
    { id: 'welcome', tr: 'Dünya Turu', en: 'World Tour', shortTr: 'Dünya', shortEn: 'Tour' },
    { id: 'nature', tr: 'Doğa Dedektifi', en: 'Nature Detective', shortTr: 'Doğa', shortEn: 'Nature' },
    { id: 'islands', tr: 'Ada Avcısı', en: 'Island Hunter', shortTr: 'Ada', shortEn: 'Islands' },
    { id: 'borders', tr: 'Sınır Dedektifi', en: 'Border Detective', shortTr: 'Sınır', shortEn: 'Borders' },
  ] as const;
  useEffect(() => {
    if (heroInteracted || reduceMotion) return;
    const timer = window.setInterval(() => setHeroIndex(previous => (previous + 1) % heroSlides.length), 6500);
    return () => window.clearInterval(timer);
  }, [heroInteracted, reduceMotion]);
  useEffect(() => () => { if (heroTapReset.current !== null) window.clearTimeout(heroTapReset.current); }, []);
  const chooseHero = (next: number) => {
    setHeroInteracted(true);
    setHeroIndex((next + heroSlides.length) % heroSlides.length);
  };
  const onHeroTouchStart = (event: import('react').TouchEvent<HTMLDivElement>) => {
    const point = event.touches[0];
    if (point) heroTouchStart.current = { x: point.clientX, y: point.clientY };
  };
  const onHeroTouchEnd = (event: import('react').TouchEvent<HTMLDivElement>) => {
    const start = heroTouchStart.current;
    heroTouchStart.current = null;
    const point = event.changedTouches[0];
    if (!start || !point) return;
    const dx = point.clientX - start.x;
    const dy = point.clientY - start.y;
    if (Math.abs(dx) < 38 || Math.abs(dx) <= Math.abs(dy) * 1.25) return;
    suppressHeroTap.current = true;
    if (heroTapReset.current !== null) window.clearTimeout(heroTapReset.current);
    heroTapReset.current = window.setTimeout(() => { suppressHeroTap.current = false; }, 500);
    chooseHero(heroIndex + (dx < 0 ? 1 : -1));
  };
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

        /* The same top hero behaves as EraAtlas: a swipeable, timed visual showcase. */
        .globriva-hero-viewport {
          width: 100%;
          min-width: 0;
          height: 290px;
          overflow: hidden;
          border-radius: 29px;
          touch-action: pan-y;
          box-shadow: 0 17px 35px rgba(0,11,38,.25);
        }
        .globriva-hero-track {
          display: flex;
          flex-wrap: nowrap;
          height: 100%;
          width: 100%;
          transition: transform .43s cubic-bezier(.22,.72,.22,1);
          will-change: transform;
        }
        .globriva-hero-slide {
          position: relative;
          flex: 0 0 100%;
          width: 100%;
          min-width: 0;
          height: 100%;
          overflow: hidden;
          border-radius: 29px;
        }
        .atlas-home-illustrated .globriva-explore-hero.globriva-hero-slide { min-height: 0; height: 100%; }
        .globriva-feature-slide {
          position: relative;
          isolation: isolate;
          display: flex;
          flex-direction: column;
          justify-content: center;
          border: 1.5px solid rgba(255,255,255,.8);
          color: white;
          background: #0b3446;
        }
        .globriva-feature-nature { background: radial-gradient(ellipse at 85% 20%,#82e7b780,transparent 53%),linear-gradient(120deg,#063b43,#135f5a 55%,#55b3a0); }
        .globriva-feature-islands { background: radial-gradient(ellipse at 85% 25%,#c5f3de68,transparent 60%),linear-gradient(120deg,#073c5a,#126e8b 56%,#41b7bd); }
        .globriva-feature-borders { background: radial-gradient(ellipse at 85% 20%,#dfb5e45b,transparent 55%),linear-gradient(120deg,#19213d,#414b88 60%,#8c78ac); }
        .globriva-feature-slide .feature-art {
          position: absolute; z-index: 0; inset: 0; pointer-events: none;
          transform: scale(1.22) translateX(9%); opacity: .9;
        }
        .globriva-feature-slide .feature-art svg { display: block; }
        .globriva-feature-slide::after {
          content: ''; position: absolute; inset: 0; z-index: 1; pointer-events: none;
          background: linear-gradient(90deg,rgba(4,22,34,.94) 0%,rgba(6,32,45,.85) 32%,rgba(6,29,47,.20) 87%);
        }
        .globriva-feature-slide .feature-copy {
          position: relative; z-index: 4; display: flex; flex-direction: column;
          align-items: flex-start; justify-content: flex-end; gap: 9px;
          height: 100%; max-width: 76%; padding: 28px 18px 24px;
        }
        .globriva-feature-slide .feature-copy strong {font-size:clamp(26px,7vw,35px);font-weight:1000;line-height:1.05;letter-spacing:-.04em;text-shadow:0 3px 12px #001c2a;}
        .globriva-feature-slide .feature-copy small {max-width:250px;font-size:12px;line-height:1.45;font-weight:700;color:#e8fbfb;}
        .globriva-feature-slide .feature-label {
          border:1px solid #fff7; border-radius:999px; padding:6px 10px;
          background:#05283799; color:#e3f5fb; font-size:10px;
          letter-spacing:.08em; font-weight:900; backdrop-filter:blur(6px);
        }
        .globriva-feature-slide .feature-cta {
          display: inline-flex; align-items: center; gap: 7px; min-height: 37px;
          padding: 8px 13px; border-radius: 999px; background: #fff0d3;
          color:#15394a; font-size:12px; font-weight:900;
        }
        .globriva-feature-slide .feature-new {
          position:absolute;right:13px;top:55px;z-index:5;
          padding:6px 12px; border-radius:999px; transform:rotate(5deg);
          color:#15303e;background:#ffe08c;border:1px solid #fff9c5;
          font-size:10px;font-weight:1000;letter-spacing:.09em;
          box-shadow:0 6px 15px #001d3566;
        }
        .globriva-hero-pagination {display:flex;align-items:center;justify-content:center;gap:10px;margin-top:9px;min-height:24px;}
        .globriva-hero-pagination button {width:9px;height:9px;padding:0;border:0;border-radius:99px;background:#6e7f93;transition:width .2s,background .2s;}
        .globriva-hero-pagination button[aria-current="true"] {width:27px;background:#f8d27e;}
        .globriva-hero-pagination .hero-hint {font-size:10px;color:#bcd4e8;font-weight:800;letter-spacing:.02em;}
        @media(max-width:380px) {
          .globriva-hero-viewport {height:274px;border-radius:25px;}
          .globriva-hero-slide {border-radius:25px;}
          .globriva-feature-slide .feature-copy {padding:28px 13px 18px;max-width:81%;}
          .globriva-feature-slide .feature-copy strong {font-size:27px;}
          .globriva-feature-slide .feature-copy small {font-size:11px;}
        }
        @media(prefers-reduced-motion:reduce) {.globriva-hero-track{transition:none;will-change:auto;}}

        /* Globriva premium geography covers — real scenic photo with an in-app
           SVG fallback, so slow/offline image requests never leave a blank tile. */
        .globriva-feature-slide .feature-art {
          transform: none; opacity: 1; overflow: hidden;
        }
        .globriva-feature-slide .feature-art svg { z-index: 0; }
        .globriva-feature-slide .feature-photo {
          display: block; position: absolute; inset: 0; z-index: 1;
          width: 100%; height: 100%; object-fit: cover;
          filter: saturate(1.25) contrast(1.12) brightness(.95);
        }
        .globriva-feature-slide .feature-photo-nature { object-position: 57% 47%; }
        .globriva-feature-slide .feature-photo-islands { object-position: 53% 58%; }
        .globriva-feature-slide .feature-photo-borders {
          object-position: 58% 52%;
          filter: saturate(.90) contrast(1.10) brightness(.91);
        }
        .globriva-feature-slide::after {
          background:
            linear-gradient(0deg, rgba(4,17,33,.65), transparent 42%),
            linear-gradient(90deg, rgba(3,17,32,.97) 0%,rgba(4,25,43,.92) 31%,rgba(5,29,47,.60) 57%,rgba(4,29,47,.12) 100%);
        }
        .globriva-feature-slide .feature-copy {
          max-width: 83%; padding-bottom: 21px;
        }
        .globriva-feature-slide .feature-copy strong {
          text-shadow: 0 3px 15px rgba(0,0,0,.72),0 1px 3px rgba(0,0,0,.5);
        }
        .globriva-feature-slide .feature-copy small {
          max-width: 258px; text-shadow: 0 2px 7px rgba(0,0,0,.7);
        }
        .globriva-feature-slide .feature-label {
          border-color: rgba(255,241,199,.78);
          background: rgba(4,24,45,.78); color:#fff3d5;
        }
        .globriva-feature-slide .feature-cta {
          background: linear-gradient(135deg,#fff2d3,#ffd887);
          box-shadow:0 5px 18px rgba(0,0,0,.24), inset 0 1px rgba(255,255,255,.88);
        }
        .globriva-feature-slide .feature-new {
          background: linear-gradient(135deg,#fff1b9,#ffcd71);
          box-shadow: 0 4px 16px rgba(0,0,0,.33);
        }

        /* Game-mode launcher: unmistakably four playable entries, not a promo slider. */
        .globriva-game-selector-head {
          display:flex;align-items:center;justify-content:space-between;gap:8px;
          margin:0 2px 10px;min-width:0;
        }
        .globriva-game-selector-heading {
          display:inline-flex;align-items:center;gap:7px;min-width:0;
          color:#ffecbb;font-weight:950;font-size:clamp(13px,3.5vw,16px);
          letter-spacing:.015em;text-shadow:0 2px 10px rgba(0,0,0,.32);
        }
        .globriva-game-selector-count {
          display:inline-flex;align-items:center;flex-shrink:0;
          padding:6px 8px;border:1px solid rgba(248,212,129,.55);
          border-radius:999px;background:rgba(12,38,68,.86);
          color:#fce3aa;font-weight:900;font-size:9px;letter-spacing:.02em;
        }
        .globriva-feature-slide .feature-label {
          display:inline-flex;align-items:center;gap:6px;
          color:#ffe3a1;
        }
        .globriva-feature-slide .feature-cta {
          min-height:43px;padding:9px 14px;font-weight:1000;
          font-size:12px;letter-spacing:.035em;
          border:1px solid rgba(255,255,255,.78);
          transition:transform .18s ease,box-shadow .18s ease;
        }
        .globriva-feature-slide button:active .feature-cta {transform:scale(.97);}
        .globriva-mode-picker-caption {
          display:flex;align-items:center;justify-content:space-between;
          gap:8px;margin:10px 2px 6px;font-size:10px;
          font-weight:800;color:#e2eeff;letter-spacing:.006em;
        }
        .globriva-mode-picker-caption > span:first-child {
          display:inline-flex;align-items:center;gap:5px;min-width:0;
        }
        .globriva-mode-picker-caption > span:last-child {font-variant-numeric:tabular-nums;color:#ffe5a5;}
        .globriva-hero-mode-list {
          display:grid;grid-template-columns:repeat(4,minmax(0,1fr));
          align-items:stretch;gap:7px;
        }
        .globriva-hero-mode-list button {
          position:relative;display:flex;align-items:center;justify-content:center;gap:4px;
          min-width:0;min-height:35px;padding:7px 3px;
          background:rgba(12,37,66,.93);
          border:1px solid rgba(167,207,233,.42);
          border-radius:11px;color:#dceaf8;
          font-size:clamp(9px,2.5vw,11px);font-weight:900;
          cursor:pointer;transition:background .2s,border-color .2s,transform .15s;
          white-space:nowrap;
        }
        .globriva-hero-mode-list button[aria-current="true"] {
          border-color:#fff0b8;background:linear-gradient(130deg,#ffe9a6,#ffbf66);
          color:#1a3350;box-shadow:0 5px 18px rgba(255,193,91,.19);
        }
        .globriva-hero-mode-list button:active {transform:scale(.95);}
        .globriva-hero-mode-list button:focus-visible {outline:2px solid #fff4ca;outline-offset:2px;}
        .globriva-mode-new-dot {
          display:inline-block;flex-shrink:0;width:5px;height:5px;
          background:#ffdc86;border-radius:50%;
        }
        .globriva-hero-mode-list button[aria-current="true"] .globriva-mode-new-dot {background:#704916;}
        @media(max-width:380px){
          .globriva-game-selector-heading {font-size:12px;}
          .globriva-game-selector-count {font-size:8px;padding:5px 7px;}
          .globriva-mode-picker-caption {font-size:9px;}
          .globriva-hero-mode-list {gap:5px;}
          .globriva-hero-mode-list button {min-height:33px;}
          .globriva-feature-slide .feature-cta {padding:8px 11px;}
        }
        @media(prefers-reduced-motion:reduce){
          .globriva-feature-slide .feature-cta,.globriva-hero-mode-list button {transition:none;}
        }
        /* A world-adventure banner rather than a generic orange CTA. The
           picture is already bundled locally for dependable mobile display. */
        .atlas-home-illustrated .aa-play {
          position:relative; isolation:isolate; overflow:hidden;
          border:1.5px solid rgba(255,227,166,.84);
          background:
            linear-gradient(94deg,rgba(7,29,55,.97) 0%,rgba(10,46,73,.94) 43%,rgba(16,74,100,.67) 100%),
            url('/globriva-hero-atmosphere.webp') 66% 46% / cover no-repeat,
            #102f4c;
          box-shadow:0 13px 31px rgba(2,16,44,.37),inset 0 1px rgba(255,255,255,.23);
          color: #fff8e8; padding:13px 16px; min-height:83px; gap:14px;
        }
        .atlas-home-illustrated .aa-play::after {
          content:''; position:absolute; pointer-events:none; z-index:-1;
          width:162px; height:162px; right:-26px; top:-49px;
          border:1px solid rgba(255,238,182,.19); border-radius:50%;
          box-shadow:0 0 0 20px rgba(255,255,255,.035),0 0 0 53px rgba(255,255,255,.025);
        }
        .atlas-home-illustrated .aa-play-icon {
          width:52px;height:52px;border-radius:16px;
          color:#193858; background:linear-gradient(145deg,#fff4c9,#ffc56d);
          border:1px solid rgba(255,255,255,.81);
          box-shadow:0 7px 19px rgba(3,12,28,.25);
        }
        .atlas-home-illustrated .aa-play strong {
          font-size:clamp(21px,5.3vw,27px);letter-spacing:-.015em;
        }
        .atlas-home-illustrated .aa-play small { color:#c9e7ed;font-size:11px; }
        .atlas-home-illustrated .aa-play .aa-play-kicker {
          display:block;color:#ffdd9a;font-size:9px;font-weight:900;
          letter-spacing:.13em;margin-bottom:5px;
        }
        .atlas-home-illustrated .aa-section-heading {
          color:#fff8e9;font-size:clamp(17px,4.7vw,21px);
          font-weight:950;letter-spacing:-.02em;
          text-shadow:0 2px 13px rgba(0,0,0,.23);
        }
        .atlas-home-illustrated .globriva-game-tile {
          border-color:rgba(255,255,255,.61);
          box-shadow:0 15px 31px rgba(0,9,32,.31),inset 0 1px rgba(255,255,255,.2);
        }
        .atlas-home-illustrated .globriva-game-tile .globriva-game-tile-photo {
          filter:saturate(1.12) contrast(1.04);
        }
        .atlas-home-illustrated .globriva-game-tile strong {
          text-shadow:0 3px 10px rgba(0,0,0,.75);
        }
        @media(max-width:380px) {
          .globriva-feature-slide .feature-copy {max-width:84%;padding-bottom:17px;}
          .atlas-home-illustrated .aa-play {padding:11px 12px;gap:10px;}
          .atlas-home-illustrated .aa-play-icon {width:46px;height:46px;}
          .atlas-home-illustrated .aa-play .aa-play-kicker {font-size:8px;}
        }


        /* Each approved WebP contains its own dark screenshot strip above
           the illustrated tile. Crop it *inside* one consistent button frame.
           Use the same geometry for every locale and keep readable overlays. */
        .atlas-home-illustrated .globriva-art-crop {
          position: relative;
          display: flex;
          box-sizing: border-box;
          width: 100%;
          min-width: 0;
          height: auto;
          padding: 8px !important;
          overflow: hidden;
          isolation: isolate;
          border: 0 !important;
          border-radius: 22px !important;
          background-clip: padding-box;
          box-shadow: 0 10px 22px rgba(0,8,30,.24) !important;
          -webkit-mask-image: -webkit-radial-gradient(white, black);
        }
        /* A painted outline avoids the extra 1.5px layout inset and the
           hairline seam between a rounded frame and a rasterized image. */
        .atlas-home-illustrated .globriva-art-crop::after {
          content: '';
          position: absolute;
          inset: 0;
          z-index: 5;
          border: 1.5px solid rgba(255,255,255,.92);
          border-radius: inherit;
          pointer-events: none;
        }
        .atlas-home-illustrated .globriva-art-crop-daily { aspect-ratio: 431 / 162; }
        .atlas-home-illustrated .globriva-art-crop-explore { aspect-ratio: 419 / 162; }
        .atlas-home-illustrated .globriva-art-crop-league {
          aspect-ratio: 862 / 116;
          padding: 0 16px !important;
        }
        /* The Turkish approved league image has a baked-in ~20px dark top
           strip. Other-language illustration does not: crop only the former. */
        .atlas-home-illustrated .globriva-art-crop-league-approved { aspect-ratio: 862 / 94; }
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
          pointer-events: none;
        }
        .atlas-home-illustrated .globriva-art-crop-league:not(.globriva-art-crop-league-approved) > img {
          object-position: center center !important;
        }
        .atlas-home-illustrated .globriva-art-crop > span {
          position: relative;
          z-index: 2;
          min-width: 0;
          max-height: 100%;
          line-height: 1.15;
          white-space: normal;
          overflow-wrap: anywhere;
        }
        .atlas-home-illustrated .globriva-art-crop > span.absolute {
          position: absolute;
        }
        @media (max-width: 380px) {
          .atlas-home-illustrated .globriva-art-crop { border-radius: 19px !important; padding: 6px !important; }
          .atlas-home-illustrated .globriva-art-crop-league { padding: 0 10px !important; }
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
          <div className="flex min-w-0 shrink-0 items-center gap-1.5 sm:gap-2">
            <label className="atlas-home-language-picker flex h-9 shrink-0 items-center gap-1 rounded-xl border border-white/25 bg-[#102f4b]/80 px-1.5 text-[11px] font-extrabold text-white" title={t('Dil')}>
              <Globe2 className="h-4 w-4 shrink-0 text-cyan-200" aria-hidden="true" />
              <select value={language} onChange={event=>setLanguage(event.target.value as Language)}
                aria-label={t('Dil')} className="w-[35px] min-w-0 bg-transparent text-[11px] font-extrabold uppercase text-white outline-none">
                {availableLanguages.map(([code,label])=><option key={code} value={code} className="bg-[#0c2946] text-white">{code.toUpperCase()} · {label}</option>)}
              </select>
            </label>
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

        <motion.section {...entrance(0)} className="relative min-w-0">
          <div className="globriva-game-selector-head">
            <span className="globriva-game-selector-heading">
              <Gamepad2 size={18} strokeWidth={2.5}/>
              {t('OYUN MODUNU SEÇ')}
            </span>
            <span className="globriva-game-selector-count">
              {t('4 AYRI OYUN')}
            </span>
          </div>
          <div className="globriva-hero-viewport"
            aria-label={t('Kaydırılabilir yeni oyunlar')}
            onTouchStart={onHeroTouchStart} onTouchEnd={onHeroTouchEnd} onTouchCancel={() => { heroTouchStart.current = null; }}>
            <div className="globriva-hero-track" style={{transform:`translateX(-${heroIndex * 100}%)`}}>
            <div className="aa-hero globriva-explore-hero globriva-hero-slide relative isolate overflow-hidden">

          <div className="aa-hero-stars" aria-hidden="true" />
          <span className="globriva-hero-float" aria-hidden="true"><Sparkles className="h-6 w-6" /></span>
          {!reduceMotion && (
            <FxErrorBoundary>
              <Suspense fallback={null}><ArenaParticles /></Suspense>
            </FxErrorBoundary>
          )}
          <div className="aa-hero-copy relative z-10">
            <span className="aa-kicker"><Gamepad2 className="h-3.5 w-3.5" /> {`${t('OYUN MODU')} · 01`}</span>
            <h1>{t('Dünya')}<br /><span>{t('Turu')}</span></h1>
            <p>{t('Karışık coğrafya sorularında yarış.')}</p>
          </div>
          <div className="aa-hero-bottom">
            <button
              type="button"
              onClick={() => startOrAskName('mixed')}
              aria-label={t('Dünya turu')}
              className="globriva-hero-action touch-manipulation"
            >
              <Play size={17} fill="currentColor" aria-hidden="true" />
              <span>{t('OYUNU BAŞLAT')}</span>
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
            </div>

            <div className="globriva-hero-slide globriva-feature-slide globriva-feature-nature">
              <div className="feature-art" aria-hidden="true">
                <GeoDiscoveryArt mode="nature" />
                <img className="feature-photo feature-photo-nature"
                  src="https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1150&q=85"
                  alt="" loading="eager" decoding="async"
                  onError={event => { event.currentTarget.style.display = 'none'; }} />
              </div>
              <span className="feature-new">{t('YENİ')}</span>
              <button type="button" className="relative z-[3] block h-full w-full cursor-pointer text-left touch-manipulation"
                aria-label={`${t('Doğa Dedektifi')} · ${t('OYUNU BAŞLAT')}`}
                onClick={() => { if (!suppressHeroTap.current) startGeoDiscovery('nature'); }}>
                <span className="feature-copy">
                  <span className="feature-label"><Gamepad2 size={13}/>{`${t('OYUN MODU')} · 02`}</span>
                  <strong>{t('Doğa Dedektifi')}</strong>
                  <small>{t('Dağlar, nehirler ve dünya doğasının sırlarını keşfet.')}</small>
                  <span className="feature-cta"><Play size={16} fill="currentColor" />{language==='tr'?'OYUNU BAŞLAT':'PLAY NOW'}<ArrowRight size={16}/></span>
                </span>
              </button>
            </div>
            <div className="globriva-hero-slide globriva-feature-slide globriva-feature-islands">
              <div className="feature-art" aria-hidden="true">
                <GeoDiscoveryArt mode="islands" />
                <img className="feature-photo feature-photo-islands"
                  src="https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=1150&q=85"
                  alt="" loading="eager" decoding="async"
                  onError={event => { event.currentTarget.style.display = 'none'; }} />
              </div>
              <span className="feature-new">{t('YENİ')}</span>
              <button type="button" className="relative z-[3] block h-full w-full cursor-pointer text-left touch-manipulation"
                aria-label={`${t('Ada Avcısı')} · ${t('OYUNU BAŞLAT')}`}
                onClick={() => { if (!suppressHeroTap.current) startGeoDiscovery('islands'); }}>
                <span className="feature-copy">
                  <span className="feature-label"><Gamepad2 size={13}/>{`${t('OYUN MODU')} · 03`}</span>
                  <strong>{t('Ada Avcısı')}</strong>
                  <small>{t('Gerçek ada silüetlerinden konumları tahmin et.')}</small>
                  <span className="feature-cta"><Play size={16} fill="currentColor" />{language==='tr'?'OYUNU BAŞLAT':'PLAY NOW'}<ArrowRight size={16}/></span>
                </span>
              </button>
            </div>
            <div className="globriva-hero-slide globriva-feature-slide globriva-feature-borders">
              <div className="feature-art" aria-hidden="true">
                <GeoDiscoveryArt mode="borders" />
                <img className="feature-photo feature-photo-borders"
                  src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=1150&q=85"
                  alt="" loading="eager" decoding="async"
                  onError={event => { event.currentTarget.style.display = 'none'; }} />
              </div>
              <span className="feature-new">{t('YENİ')}</span>
              <button type="button" className="relative z-[3] block h-full w-full cursor-pointer text-left touch-manipulation"
                aria-label={`${t('Sınır Dedektifi')} · ${t('OYUNU BAŞLAT')}`}
                onClick={() => { if (!suppressHeroTap.current) startGeoDiscovery('borders'); }}>
                <span className="feature-copy">
                  <span className="feature-label"><Gamepad2 size={13}/>{`${t('OYUN MODU')} · 04`}</span>
                  <strong>{t('Sınır Dedektifi')}</strong>
                  <small>{t('Haritada komşu ülkeleri keşfet, sınırları çöz.')}</small>
                  <span className="feature-cta"><Play size={16} fill="currentColor" />{language==='tr'?'OYUNU BAŞLAT':'PLAY NOW'}<ArrowRight size={16}/></span>
                </span>
              </button>
            </div>
            </div>
          </div>
          <div className="globriva-mode-picker-caption">
            <span><Gamepad2 size={13}/>{t('Her kart ayrı bir oyun · Dokun, hemen oyna')}</span>
            <span>{heroIndex + 1}/{heroSlides.length}</span>
          </div>
          <nav className="globriva-hero-mode-list" aria-label={t('Oyun modunu seç')}>
            {heroSlides.map((slide,index)=>(
              <button key={slide.id} type="button" onClick={()=>chooseHero(index)} aria-current={heroIndex===index}
                aria-label={`${t(slide.tr)} · ${index+1}/${heroSlides.length}`}>
                {t(slide.shortTr)}
                {index > 0 && <span className="globriva-mode-new-dot" aria-hidden="true"/>}
              </button>
            ))}
          </nav>
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
            <span className="aa-play-kicker">{t('DÜNYA TURU · KEŞİF ARENASI')}</span>
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
              className="globriva-game-tile group relative isolate flex min-h-[218px] flex-col overflow-hidden rounded-[27px] border border-[#ffd6a9]/70 bg-[#e6a66d] p-3 text-left text-white shadow-[0_12px_28px_rgba(15,16,54,.28)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_18px_34px_rgba(245,151,93,.32)] active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-200 sm:min-h-[236px] sm:p-4"
            >
              <img
                src="/game-cards/bayrak-oyunu.webp"
                alt=""
                loading="lazy"
                draggable={false}
                className="globriva-game-tile-photo pointer-events-none absolute inset-0 -z-10 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
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
              className="globriva-game-tile group relative isolate flex min-h-[218px] flex-col overflow-hidden rounded-[27px] border border-[#d9c5ff]/80 bg-[#7162d8] p-3 text-left text-white shadow-[0_12px_28px_rgba(15,16,54,.28)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_18px_34px_rgba(128,109,250,.30)] active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-200 sm:min-h-[236px] sm:p-4"
            >
              <img
                src="/game-cards/gizemli-ulke.webp"
                alt=""
                loading="lazy"
                draggable={false}
                className="globriva-game-tile-photo pointer-events-none absolute inset-0 -z-10 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
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



          {/* One shared illustrated layout for every language; imagery and interaction never change with locale. */}
          <button type="button" onClick={onVersus} aria-label={t('Arkadaşlarınla yarış')}
            className="group relative mt-3 flex min-h-[112px] w-full items-center gap-3 overflow-hidden rounded-[24px] border border-white/60 bg-gradient-to-r from-[#ffbb89] via-[#fa9097] to-[#dbaaf8] px-4 py-4 text-left text-[#202742] shadow-[0_12px_25px_rgba(0,5,25,.25)] transition-transform active:scale-[.985]">
            <img src="/game-cards/approved-vs.webp" alt="" draggable={false} loading="lazy"
              className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-[.12] blur-[3px]" />
            <span aria-hidden="true" className="relative grid h-14 w-14 shrink-0 place-items-center rounded-[18px] border border-white/40 bg-white/35 shadow-inner"><Swords className="h-8 w-8" /></span>
            <span className="relative min-w-0 flex-1">
              <small className="block text-[10px] font-black tracking-[.12em]">{t('YENİ · 1’E 1 MEYDAN OKUMA')}</small>
              <strong className="mt-1 block text-[clamp(17px,4.5vw,22px)] font-black leading-tight">{t('Arkadaşınla VS At!')}</strong>
              <span className="mt-1 block text-xs font-semibold leading-4">{t('Davet et, aynı 10 soruda karşılaş, kazananı gör.')}</span>
            </span>
            <ChevronRight className="relative h-6 w-6 shrink-0" />
          </button>

          {/* One shared game: street photography and aerial panoramas alternate in a five-round tour. */}
          <section className="relative mt-3 space-y-2" aria-label={t('Sokak Dedektifi')}>
            <button type="button" onClick={startStreet}
              aria-label={t('Sokak Dedektifi oyununa başla')}
              className="group relative flex min-h-[192px] w-full items-end overflow-hidden rounded-[24px] border border-cyan-200/60 bg-[#123d5c] px-4 pb-5 pt-4 text-left text-white shadow-[0_14px_30px_rgba(2,10,30,.35)] transition-transform active:scale-[.985] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-100">
              <span aria-hidden="true" className="pointer-events-none absolute inset-0 grid grid-cols-2">
                <img src="/game-cards/street-cinematic.svg" alt="" loading="lazy" draggable={false}
                  className="h-full w-full object-cover object-center" />
                <img src="/game-cards/drone-cinematic.svg" alt="" loading="lazy" draggable={false}
                  className="h-full w-full object-cover object-center" />
              </span>
              <span aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#06152e]/95 via-[#081e38]/75 to-[#102b4d]/10" />
              <span aria-hidden="true" className="pointer-events-none absolute left-1/2 top-3 h-[52%] w-px bg-white/20" />
              <span className="relative z-10 min-w-0 flex-1">
                <span className="mb-2 inline-flex items-center gap-2 rounded-full border border-cyan-100/40 bg-[#06304c]/80 px-3 py-1.5 text-[10px] font-black text-cyan-100">
                  <Camera className="h-3.5 w-3.5 shrink-0" />
                  {t('TEK OYUN · SOKAK + HAVADAN')}
                </span>
                <strong className="block text-[clamp(21px,5.5vw,28px)] font-black leading-tight">{t('Sokak Dedektifi')}</strong>
                <span className="mt-1 block max-w-[300px] text-[12px] font-semibold leading-5 text-blue-100">
                  {t('5 turda sokak ve drone görüntülerinden konum tahmin et.')}
                </span>
              </span>
              <span aria-hidden="true" className="relative z-10 ml-2 grid h-10 w-10 shrink-0 place-items-center rounded-full border border-cyan-100/50 bg-[#0a3c5b]/70">
                <ArrowRight className="h-5 w-5 text-cyan-100" />
              </span>
            </button>
            <button type="button" onClick={onStreetLeaderboard}
              className="relative flex min-h-12 w-full items-center justify-between gap-3 rounded-[16px] border border-cyan-200/25 bg-[#071b37]/90 px-3 py-2 text-xs font-bold text-cyan-100">
              <span className="flex min-w-0 items-center gap-2">
                <Trophy className="h-4 w-4 shrink-0 text-amber-300" />{t('Sokak Dedektifi dünya sıralaması')}
              </span>
              <ArrowRight className="h-4 w-4 shrink-0" />
            </button>
          </section>
        </motion.section>

        <motion.section {...entrance(3)} className="mt-3">
          <button type="button" onClick={startHistory}
            aria-label={t('Medeniyet Dedektifi')}
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
                {t('YENİ · 360° TARİH MACERASI')}
              </small>
              <strong className="block text-[clamp(17px,4.5vw,23px)] font-black leading-tight">
                {t('Medeniyet Dedektifi')}
              </strong>
              <span className="mt-1 block max-w-[250px] text-[11px] font-semibold leading-4 text-white/90">
                {t('8 tarihî mekân · 24 soru · 20 mekânlık tarih arşivi!')}
              </span>
            </span>
            <ChevronRight className="ml-1 h-6 w-6 shrink-0 text-amber-100"/>
          </button>
        </motion.section>


        <motion.section {...entrance(4)} className="mt-5">
          <h2 className="aa-section-heading">{t('Her gün yeni bir macera')}</h2>

          <div className="mt-2 grid grid-cols-2 gap-3">
            <button type="button" onClick={onDaily} aria-label={t('Günlük 10 soru')}
              className="globriva-art-crop globriva-art-crop-daily relative flex min-w-0 items-end bg-[#f7d99d] text-left text-[#153850] active:scale-[.98]">
              <img src={language==='tr'?'/game-cards/approved-daily.webp':'/game-cards/daily-cinematic.svg'}
                alt="" width={431} height={184} draggable={false} loading="lazy"
                className="pointer-events-none absolute inset-0 h-full w-full object-cover object-bottom" />
              {language!=='tr' && <span className="relative z-10 max-w-[83%] rounded-lg border border-[#fffdf0]/70 bg-[#fff1cf]/95 px-2.5 py-1.5 text-[clamp(11px,2.55vw,15px)] font-black leading-tight text-[#334c65] shadow-[0_2px_7px_rgba(81,57,35,.12)]">{t('Günlük 10 soru')}</span>}
              {completed > 0 && <span className="absolute right-1.5 top-1.5 z-10 rounded-md border border-[#faf6e9]/70 bg-[#ffe7bb]/95 px-1.5 py-1 text-[10px] font-bold text-[#647787] shadow-sm">{completed}/{DAILY_TOTAL}</span>}
            </button>
            <button type="button" onClick={onExplore} aria-label={t('Keşif haritası')}
              className="globriva-art-crop globriva-art-crop-explore relative flex min-w-0 items-end bg-[#a4e7dc] text-left text-[#153850] active:scale-[.98]">
              <img src={language==='tr'?'/game-cards/approved-explore.webp':'/game-cards/explore-cinematic.svg'}
                alt="" width={419} height={184} draggable={false} loading="lazy"
                className="pointer-events-none absolute inset-0 h-full w-full object-cover object-bottom" />
              {language!=='tr' && <span className="relative z-10 max-w-[85%] rounded-lg border border-[#ebfff8]/80 bg-[#d9fff5]/95 px-2.5 py-1.5 text-[clamp(11px,2.55vw,15px)] font-black leading-tight text-[#334c65] shadow-[0_2px_7px_rgba(25,84,71,.12)]">{t('Keşif haritası')}</span>}
              {found > 0 && <span className="absolute right-1.5 top-1.5 z-10 rounded-md border border-[#ebfff8]/70 bg-[#c6f3e9]/95 px-1.5 py-1 text-[10px] font-bold text-[#647787] shadow-sm">{found}/{VALID_COUNTRY_IDS.length}</span>}
            </button>
          </div>
        </motion.section>


        <motion.button {...entrance(4)} type="button" onClick={() => onViewWeekly('mixed')} aria-label={t('Haftalık sıralama')}
          className={`globriva-art-crop globriva-art-crop-league relative mt-3 flex w-full items-center bg-[#f2c6df] text-left text-[#28445d] active:scale-[.985] ${language==='tr'?'globriva-art-crop-league-approved':''}`}>
          <img src={language==='tr'?'/game-cards/approved-league.webp':'/game-cards/league-cinematic.svg'}
            alt="" width={862} height={116} draggable={false} loading="lazy"
            className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center" />
          {language!=='tr' && <span className="relative z-10 flex max-w-[78%] items-center gap-2.5 rounded-xl border border-[#fffaf8]/70 bg-[#fff0f7]/95 px-3 py-2 text-[clamp(13px,3.2vw,18px)] font-black leading-tight text-[#28445d] shadow-[0_2px_8px_rgba(98,62,95,.12)]"><Trophy className="h-5 w-5 shrink-0" />{t('Haftalık sıralama')}</span>}
        </motion.button>

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
