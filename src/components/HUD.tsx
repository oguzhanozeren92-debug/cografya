import { ArrowLeft, Heart, Flame, Star, Clapperboard, Plus } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

interface HUDProps {
  score: number;
  lives: number;
  streak: number;
  round: number;
  canEarnHeart: boolean;
  adBusy: boolean;
  onWatchHeart: () => void;
  onExit: () => void;
  compact?: boolean;
}

export function HUD({ score, lives, streak, round, canEarnHeart, adBusy, onWatchHeart, onExit, compact=false }: HUDProps) {
  const {language,t}=useLanguage();
  return (
    <div className={'game-hud relative z-10 flex min-w-0 items-center justify-between ' + (compact ? 'gap-1.5 px-3 py-1.5' : 'gap-2 px-4 py-3 sm:px-6 sm:py-4')}>
      <div className={'glass-panel flex items-center gap-1.5 ' + (compact?'px-2.5 py-1.5':'gap-2 px-4 py-2')}>
        <button type="button" onClick={onExit} aria-label={t('Ana menüye dön')} title={t('Ana menüye dön')} className="game-hud-back flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/15 bg-white/5 text-slate-100 transition-colors hover:bg-white/15 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300">
          <ArrowLeft className="h-4 w-4" strokeWidth={2.6} />
        </button>
        <span className="h-5 w-px shrink-0 bg-white/15" aria-hidden="true" />
        <Star className="h-4 w-4 shrink-0 text-amber-400" />
        <span className="text-lg font-bold text-white tabular-nums">{score.toLocaleString(language)}</span>
      </div>

      <div className={'glass-panel flex items-center gap-1 ' + (compact?'px-2 py-1.5':'gap-1.5 px-3 py-2')}>
        {Array.from({ length: 3 }).map((_, i) => (
          <Heart
            key={i}
            className={`h-4 w-4 transition-all ${i < lives ? 'fill-red-500 text-red-500' : 'text-slate-600'}`}
          />
        ))}
        {canEarnHeart && (
          <button type="button" onClick={onWatchHeart} disabled={adBusy} aria-label={t("Ödüllü reklamla bir can kazan")} title={t("Reklam izle, +1 can")} className="heart-reward-pill ml-1 flex h-8 items-center gap-0.5 rounded-lg border border-amber-300/40 bg-amber-400/15 px-2 text-xs font-bold text-amber-200 transition active:scale-95 disabled:opacity-40">
            <Clapperboard className="h-3.5 w-3.5" /><Plus className="h-3 w-3" />1
          </button>
        )}
      </div>

      <div className={'glass-panel flex items-center gap-2 ' + (compact?'px-2.5 py-1.5':'gap-3 px-4 py-2')}>
        <div className="flex items-center gap-1.5">
          <Flame className={`h-4 w-4 ${streak >= 2 ? 'text-orange-400' : 'text-slate-500'}`} />
          <span className="text-sm font-semibold text-slate-300 tabular-nums">{streak}</span>
        </div>
        <div className="h-4 w-px bg-white/10" />
        <span className="text-sm text-slate-400">{t('Tur')} {round}</span>
      </div>
    </div>
  );
}