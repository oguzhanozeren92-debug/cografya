import { Globe2, Play, Trophy, Pencil, UserRound } from 'lucide-react';
import type { GameMode, LeaderboardEntry } from '@/types';
import { useState } from 'react';

interface StartScreenProps {
  onStart: (mode: GameMode) => void;
  onViewWeekly: (mode: GameMode) => void;
  leaderboard: LeaderboardEntry[];
  playerName: string;
  onNameChange: (name: string) => Promise<void>;
  leaderboardError: string;
}

export function StartScreen({ onStart, onViewWeekly, leaderboard, playerName, onNameChange, leaderboardError }: StartScreenProps) {
  const [editing, setEditing] = useState(!playerName);
  const [selectedMode, setSelectedMode] = useState<GameMode>('mixed');
  const [name, setName] = useState(playerName);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const save = async () => {
    if (!name.trim() || busy) return;
    setBusy(true);
    try { await onNameChange(name); setEditing(false); setError(''); }
    catch { setError('Oyuncu adı kaydedilemedi. Bağlantıyı kontrol et.'); }
    finally { setBusy(false); }
  };
  return (
    <div className="fixed inset-0 z-20 flex flex-col items-center justify-end overflow-y-auto px-4 pb-8 pt-16 sm:pt-20">
      <div className="pointer-events-none min-h-4 flex-1" />

      <div className="w-full max-w-md animate-slide-up">
        <div className="glass-panel p-6 text-center">
          <div className="mb-3 flex items-center justify-center gap-2 text-blue-400">
            <Globe2 className="h-6 w-6" />
            <span className="text-sm font-medium tracking-wider uppercase">Coğrafya Oyunu</span>
          </div>
          <h1 className="mb-2 text-3xl font-bold text-white">
            Dünya Coğrafya Bulmaca
          </h1>
          <p className="mb-5 text-sm text-slate-400 leading-relaxed">
            İki ayrı oyun, iki ayrı lig! Dönen dünyada ülkeleri keşfet veya bayrakları tanı.
          </p>

          {editing ? (
            <div className="mb-4 text-left">
              <label className="mb-2 block text-xs text-slate-300">Oyuncu takma adın (şifre yok)</label>
              <div className="flex gap-2">
                <input autoFocus maxLength={20} value={name} onChange={e => setName(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') void save(); }} placeholder="Takma ad seç" className="min-w-0 flex-1 rounded-xl border border-white/15 bg-white/10 px-3 py-3 text-white outline-none focus:border-blue-400" />
                <button disabled={!name.trim() || busy} onClick={() => void save()} className="rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white disabled:opacity-50">{busy ? '...' : 'Kaydet'}</button>
              </div>
              {error && <p className="mt-2 text-xs text-rose-400">{error}</p>}
            </div>
          ) : (
            <button onClick={() => {setName(playerName);setEditing(true);}} className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl bg-white/10 px-3 py-2.5 text-sm text-slate-200"><UserRound className="h-4 w-4" /> {playerName} <Pencil className="h-3.5 w-3.5 opacity-60" /></button>
          )}
          <div className="mb-4 grid grid-cols-2 gap-2 text-left" aria-label="Oyun modu seçimi">
            <button type="button" onClick={() => setSelectedMode('mixed')} aria-pressed={selectedMode === 'mixed'} className={'game-mode-card game-mode-mixed ' + (selectedMode === 'mixed' ? 'game-mode-selected' : '')}>
              <span className="game-mode-art" aria-hidden="true">🌍</span>
              <span className="game-mode-title">KARIŞIK</span>
              <span className="game-mode-subtitle">Ülke + Başkent + Bayrak</span>
              <span className="game-mode-league">🏆 Karışık Ligi</span>
            </button>
            <button type="button" onClick={() => setSelectedMode('flags')} aria-pressed={selectedMode === 'flags'} className={'game-mode-card game-mode-flags ' + (selectedMode === 'flags' ? 'game-mode-selected' : '')}>
              <span className="game-mode-art flex gap-1 text-2xl" aria-hidden="true">🇹🇷 🇯🇵 🇧🇷</span>
              <span className="game-mode-title">BAYRAKLAR</span>
              <span className="game-mode-subtitle">Bayrağı gör, ülkeyi bul</span>
              <span className="game-mode-league">🏆 Bayrak Ligi</span>
            </button>
          </div>
          <p className="mb-3 text-center text-[11px] text-slate-400">5 kolay → 7 orta → ardından zor ülkeler</p>
          <button
            disabled={!playerName || editing}
            onClick={() => onStart(selectedMode)}
            className="group flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 font-semibold text-white transition-all duration-200 hover:bg-blue-500 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Play className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
            {selectedMode === 'flags' ? 'Bayrak Arenasına Gir' : 'Karışık Oyuna Başla'}
          </button>
        </div>

        <button onClick={() => onViewWeekly(selectedMode)} className="weekly-teaser mt-3 flex w-full items-center justify-between overflow-hidden rounded-2xl border border-amber-300/30 px-5 py-5 text-left shadow-xl transition hover:border-amber-300/60 hover:brightness-110">
          <span className="relative z-10 flex flex-col gap-1"><span className="text-[10px] font-black uppercase tracking-[.22em] text-amber-300">YENİ • DÜNYA LİGİ</span><span className="text-lg font-black text-white">İki Ayrı Haftalık Lig</span><span className="text-xs text-slate-200">Karışık ve Bayrak podyumları</span></span>
          <Trophy className="relative z-10 h-12 w-12 shrink-0 text-amber-300 drop-shadow-[0_0_12px_rgba(251,191,36,.5)]" />
        </button>
        {(leaderboard.length > 0 || leaderboardError) && (
          <div className="glass-panel mt-3 p-4">
            <div className="mb-2 flex items-center gap-2 text-amber-400">
              <Trophy className="h-4 w-4" />
              <span className="text-xs font-semibold tracking-wider uppercase">Dünya Sıralaması • İlk 5</span>
            </div>
            {leaderboardError && <p className="mb-2 text-xs text-amber-300">{leaderboardError}</p>}
            <div className="space-y-1.5">
              {leaderboard.slice(0, 5).map((entry, i) => (
                <div key={entry.id} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-slate-300">
                    <span className={`font-bold ${i === 0 ? 'text-amber-400' : i === 1 ? 'text-slate-300' : i === 2 ? 'text-orange-400' : 'text-slate-500'}`}>
                      {i + 1}.
                    </span>
                    <span className="max-w-[175px] truncate">{entry.player_name}</span>
                  </span>
                  <span className="font-semibold text-white">{entry.score}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
