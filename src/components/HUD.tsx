import { Heart, Flame, Star } from 'lucide-react';

interface HUDProps {
  score: number;
  lives: number;
  streak: number;
  round: number;
}

export function HUD({ score, lives, streak, round }: HUDProps) {
  return (
    <div className="relative z-10 flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
      <div className="glass-panel flex items-center gap-2 px-4 py-2">
        <Star className="h-4 w-4 text-amber-400" />
        <span className="text-lg font-bold text-white tabular-nums">{score}</span>
      </div>

      <div className="glass-panel flex items-center gap-1.5 px-3 py-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Heart
            key={i}
            className={`h-4 w-4 transition-all ${i < lives ? 'fill-red-500 text-red-500' : 'text-slate-600'}`}
          />
        ))}
      </div>

      <div className="glass-panel flex items-center gap-3 px-4 py-2">
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
