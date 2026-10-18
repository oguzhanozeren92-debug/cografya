import { Heart, Flame, Star, Clapperboard, Plus } from 'lucide-react';

interface HUDProps {
  score: number;
  lives: number;
  streak: number;
  round: number;
  canEarnHeart: boolean;
  adBusy: boolean;
  onWatchHeart: () => void;
  compact?: boolean;
}

export function HUD({ score, lives, streak, round, canEarnHeart, adBusy, onWatchHeart, compact=false }: HUDProps) {
  return (
    <div className={'relative z-10 flex items-center justify-between ' + (compact ? 'gap-1.5 px-3 py-1.5' : 'px-4 py-3 sm:px-6 sm:py-4')}>
      <div className={'glass-panel flex items-center gap-1.5 ' + (compact?'px-2.5 py-1.5':'gap-2 px-4 py-2')}>
        <Star className="h-4 w-4 text-amber-400" />
        <span className="text-lg font-bold text-white tabular-nums">{score}</span>
      </div>

      <div className={'glass-panel flex items-center gap-1 ' + (compact?'px-2 py-1.5':'gap-1.5 px-3 py-2')}>
        {Array.from({ length: 3 }).map((_, i) => (
          <Heart
            key={i}
            className={`h-4 w-4 transition-all ${i < lives ? 'fill-red-500 text-red-500' : 'text-slate-600'}`}
          />
        ))}
        {canEarnHeart && (
          <button type="button" onClick={onWatchHeart} disabled={adBusy} aria-label="Ödüllü reklamla bir can kazan" title="Reklam izle, +1 can" className="heart-reward-pill ml-1 flex h-8 items-center gap-0.5 rounded-lg border border-amber-300/40 bg-amber-400/15 px-2 text-xs font-bold text-amber-200 transition active:scale-95 disabled:opacity-40">
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
        <span className="text-sm text-slate-400">Tur {round}</span>
      </div>
    </div>
  );
}