import { useEffect, useRef, useState } from 'react';
import { Trophy, RotateCcw, CheckCircle2, MapPinned } from 'lucide-react';
import type { LeaderboardEntry, GameMode } from '@/types';

interface GameOverScreenProps {
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  leaderboard: LeaderboardEntry[];
  mode: GameMode;
  onSave: () => Promise<void>;
  playerName: string;
  onRestart: () => void;
  onViewWeekly: (mode: GameMode) => void;
  onExplore: () => void;
}

export function GameOverScreen({
  score,
  correctAnswers,
  totalQuestions,
  leaderboard,
  onSave,
  mode,
  playerName,
  onRestart,
  onViewWeekly,
  onExplore,
}: GameOverScreenProps) {
  const [saveState, setSaveState] = useState<'saving' | 'saved' | 'error'>('saving');
  const [saveError, setSaveError] = useState('');
  const save = async () => {
    setSaveState('saving');
    try { await onSave(); setSaveState('saved'); }
    catch { setSaveError('Skorun kaydı tamamlanamadı. Haftalık sıralama için Supabase kurulumunu ve bağlantını kontrol et.'); setSaveState('error'); }
  };
  const submittedRef = useRef(false);
  useEffect(() => { if (submittedRef.current) return; submittedRef.current = true; void save(); }, []);

  const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center px-4 py-6 overflow-y-auto">
      <div className="w-full max-w-md animate-pop-in glass-panel p-6 my-auto">
        <div className="mb-4 text-center">
          <div className="mb-2 inline-flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/20">
            <Trophy className="h-7 w-7 text-amber-400" />
          </div>
          <h2 className="text-2xl font-bold text-white">{mode === 'flags' ? 'Bayrak Arenası Tamamlandı' : mode === 'clues' ? 'İpucu Arenası Tamamlandı' : 'Oyun Bitti'}</h2>
          <p className="mt-1 text-xs font-bold tracking-wider text-amber-300">{mode === 'flags' ? '🚩 BAYRAK LİGİ' : mode === 'clues' ? '💡 İPUCU LİGİ' : '🌍 KARIŞIK LİG'}</p>
        </div>

        <div className="mb-5 grid grid-cols-3 gap-2">
          <div className="rounded-xl bg-white/5 p-3 text-center">
            <div className="text-2xl font-bold text-white tabular-nums">{score}</div>
            <div className="text-xs text-slate-400 mt-0.5">Skor</div>
          </div>
          <div className="rounded-xl bg-white/5 p-3 text-center">
            <div className="text-2xl font-bold text-emerald-400 tabular-nums">{correctAnswers}/{totalQuestions}</div>
            <div className="text-xs text-slate-400 mt-0.5">Doğru</div>
          </div>
          <div className="rounded-xl bg-white/5 p-3 text-center">
            <div className="text-2xl font-bold text-blue-400 tabular-nums">%{accuracy}</div>
            <div className="text-xs text-slate-400 mt-0.5">Başarı</div>
          </div>
        </div>

        <div className="mb-4 rounded-lg bg-white/5 px-3 py-3 text-center text-sm text-slate-200">
          <span className="font-semibold text-blue-300">{playerName}</span>
          {saveState === 'saving' && <p className="mt-1 text-slate-400">Skorun dünya sıralamasına gönderiliyor...</p>}
          {saveState === 'saved' && <p className="mt-1 text-emerald-400"><CheckCircle2 className="mr-1 inline h-4 w-4"/>Skorun kaydedildi!</p>}
          {saveState === 'error' && <div className="mt-2"><p className="text-rose-400">{saveError}</p><button onClick={() => void save()} className="mt-2 rounded-lg bg-blue-600 px-3 py-2 text-white">Tekrar Dene</button></div>}
        </div>

        {mode === 'mixed' && leaderboard.length > 0 && (
          <div className="mb-5">
            <div className="mb-2 flex items-center gap-2 text-amber-400">
              <Trophy className="h-4 w-4" />
              <span className="text-xs font-semibold tracking-wider uppercase">Dünya Sıralaması</span>
            </div>
            <div className="max-h-40 space-y-1.5 overflow-y-auto pr-1">
              {leaderboard.slice(0, 10).map((entry, i) => (
                <div
                  key={entry.id}
                  className={`flex items-center justify-between rounded-lg px-3 py-1.5 text-sm ${
                    saveState === 'saved' && entry.player_name === playerName && entry.score === score
                      ? 'bg-blue-500/15 border border-blue-500/30'
                      : 'bg-white/5'
                  }`}
                >
                  <span className="flex items-center gap-2 text-slate-300">
                    <span className={`font-bold w-5 ${i === 0 ? 'text-amber-400' : i === 1 ? 'text-slate-300' : i === 2 ? 'text-orange-400' : 'text-slate-500'}`}>
                      {i + 1}
                    </span>
                    {entry.player_name}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">{entry.correct_answers}/{entry.total_questions}</span>
                    <span className="font-semibold text-white">{entry.score}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <button onClick={onExplore} className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-5 py-3 font-bold text-cyan-200 hover:bg-cyan-500/20"><MapPinned className="h-5 w-5" /> Keşif Haritamı Gör</button>
        <button onClick={() => onViewWeekly(mode)} className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl border border-amber-400/40 bg-amber-500/15 px-5 py-3 font-bold text-amber-200 hover:bg-amber-500/25"><Trophy className="h-5 w-5" />{mode === 'flags' ? 'Bayrak Ligi Sıralaması' : mode === 'clues' ? 'İpucu Ligi Sıralaması' : 'Karışık Lig Sıralaması'}</button>
        <button
          onClick={onRestart}
          className="group flex w-full items-center justify-center gap-2 rounded-xl bg-white/10 px-6 py-3 font-semibold text-white transition-all hover:bg-white/20 active:scale-[0.98]"
        >
          <RotateCcw className="h-5 w-5 transition-transform group-hover:rotate-[-180deg] duration-500" />
          Ana Menüye Dön
        </button>
      </div>
    </div>
  );
}