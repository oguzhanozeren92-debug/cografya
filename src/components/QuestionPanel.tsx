import { useEffect, useState } from 'react';
import { Check, X, MapPin, Building2, Flag, Sparkles, Lightbulb, LockKeyhole, BookOpen, Search } from 'lucide-react';
import { getCountryFlag } from '@/data/flags';
import { getCountryClue } from '@/data/countryClues';
import type { GamePhase, QuestionType } from '@/types';

interface QuestionPanelProps {
  questionType: QuestionType;
  countryId: string | null;
  round: number;
  revealedClues: number;
  onRevealClue: () => void;
  options: string[];
  selectedAnswer: string | null;
  correctAnswer: string;
  phase: GamePhase;
  onAnswer: (answer: string) => void;
}

const difficulty = (round: number) => round <= 5 ? 'KOLAY' : round <= 12 ? 'ORTA' : 'ZOR';

export function QuestionPanel({
  questionType, countryId, round, revealedClues, onRevealClue, options, selectedAnswer, correctAnswer, phase, onAnswer,
}: QuestionPanelProps) {
  const [flagLoadFailed, setFlagLoadFailed] = useState(false);
  useEffect(() => { setFlagLoadFailed(false); }, [countryId]);
  const isFeedback = phase === 'feedback';
  const isFlag = questionType === 'flag';
  const isClue = questionType === 'clue';
  const isCountry = questionType === 'country';
  const clue = isClue ? getCountryClue(countryId) : null;
  const flag = countryId ? getCountryFlag(countryId) : null;

  return (
    <div className={'relative z-10 w-full px-4 pb-5 animate-slide-up ' + (isFlag || isClue ? 'max-w-xl' : '')}>
      <div className={'glass-panel mx-auto max-w-2xl p-4 sm:p-5 ' + (isFlag ? 'flag-question-panel' : isClue ? 'clue-question-panel' : '')}>
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <div className={'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ' + (isFlag ? 'bg-amber-400/20 text-amber-300' : isClue ? 'bg-violet-400/20 text-violet-200' : isCountry ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400')}>
              {isFlag ? <Flag className="h-5 w-5" /> : isClue ? <Search className="h-5 w-5" /> : isCountry ? <MapPin className="h-5 w-5" /> : <Building2 className="h-5 w-5" />}
            </div>
            <h2 className="text-base font-bold text-white sm:text-lg">
              {isFlag ? 'Bu bayrak hangi ülkeye ait?' : isClue ? 'İpuçları hangi ülkeyi anlatıyor?' : isCountry ? 'Bu hangi ülke?' : 'Bu ülkenin başkenti neresi?'}
            </h2>
          </div>
          <span className={'shrink-0 rounded-lg border px-2 py-1 text-[10px] font-black tracking-wide ' + (round <= 5 ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300' : round <= 12 ? 'border-amber-400/30 bg-amber-400/10 text-amber-300' : 'border-rose-400/30 bg-rose-400/10 text-rose-300')}>{difficulty(round)}</span>
        </div>

        {isFlag && (
          <div className="flag-stage relative mb-5 overflow-hidden rounded-2xl border border-white/15 p-5 text-center sm:p-7">
            <div className="flag-stars pointer-events-none absolute inset-0" aria-hidden="true" />
            <p className="relative mb-4 flex items-center justify-center gap-1.5 text-[10px] font-black tracking-[.2em] text-amber-200/80"><Sparkles className="h-3.5 w-3.5" /> BAYRAK ARENASI</p>
            <div className="relative mx-auto flex h-[145px] w-full max-w-[290px] items-center justify-center rounded-xl border border-white/10 bg-white/5 p-3 shadow-[0_12px_40px_rgba(0,0,0,.35)] sm:h-[185px]">
              {flag && !flagLoadFailed ? (
                <img key={countryId} src={flag.url} onError={() => setFlagLoadFailed(true)} alt="Hangi ülkeye ait olduğunu tahmin edeceğin bayrak" className="h-full w-full object-contain drop-shadow-[0_8px_14px_rgba(0,0,0,.6)]" draggable={false} />
              ) : (
                <span aria-label="Bayrak" role="img" className="text-7xl drop-shadow-xl">{flag?.emoji ?? '🏳️'}</span>
              )}
            </div>
            {isFeedback && <p className="relative mt-4 font-bold text-amber-100">{correctAnswer}</p>}
          </div>
        )}

        {isClue && clue && (
          <div className="clue-stage relative mb-5 overflow-hidden rounded-[22px] border border-violet-300/25 p-4 sm:p-5">
            <div className="clue-stage-glow pointer-events-none absolute inset-0" aria-hidden="true" />
            <div className="relative mb-4 flex items-center justify-between gap-3">
              <span className="flex items-center gap-1.5 text-[10px] font-black tracking-[.15em] text-violet-200"><Search className="h-4 w-4" /> GİZEMLİ ÜLKE DOSYASI</span>
              <span className="rounded-full border border-amber-300/30 bg-amber-200/10 px-3 py-1 text-[10px] font-black text-amber-200">#{String(round).padStart(2, '0')}</span>
            </div>
            <div className="clue-mystery-orb relative mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
              <span className="clue-question-mark text-4xl font-black text-white" aria-hidden="true">?</span>
            </div>
            <div className="relative space-y-2">
              {clue.clues.map((hint, index) => {
                const unlocked = index < revealedClues || isFeedback;
                return (
                  <div key={index} className={'clue-fact ' + (unlocked ? 'clue-fact-open' : 'clue-fact-locked')}>
                    <span className="clue-fact-index">{String(index + 1).padStart(2, '0')}</span>
                    <span className="min-w-0 flex-1 text-[13px] leading-relaxed">{unlocked ? hint : 'Bu ipucu henüz kilitli'}</span>
                    {!unlocked && <LockKeyhole className="h-4 w-4 shrink-0 text-slate-400" />}
                    {unlocked && <Sparkles className="h-4 w-4 shrink-0 text-amber-200/70" />}
                  </div>
                );
              })}
            </div>
            {!isFeedback && revealedClues < 3 && (
              <button type="button" onClick={onRevealClue} className="clue-reveal-button relative mt-4 flex w-full items-center justify-center gap-2 rounded-xl px-3 py-3 text-xs font-extrabold">
                <Lightbulb className="h-4 w-4" /> Sonraki İpucunu Aç <span className="text-[10px] font-semibold text-violet-100/70">(-%25 puan)</span>
              </button>
            )}
            {!isFeedback && <p className="relative mt-3 text-center text-[11px] font-semibold text-violet-100/75">
              Bu soruda puan katsayısı: %{100 - (revealedClues - 1) * 25}
            </p>}
            {isFeedback && (
              <div className="clue-learning relative mt-4 rounded-xl border border-emerald-300/20 bg-emerald-300/10 p-3">
                <p className="mb-1 flex items-center gap-1.5 text-xs font-black text-emerald-200"><BookOpen className="h-4 w-4" /> BİLİYOR MUYDUN?</p>
                <p className="text-xs leading-relaxed text-slate-100">{clue.fact}</p>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {options.map(option => {
            const selected = selectedAnswer === option;
            const correct = option === correctAnswer;
            let classes = 'option-btn';
            if (isFeedback) classes += correct ? ' option-btn-correct' : selected ? ' option-btn-wrong' : ' option-btn-disabled';
            return (
              <button key={option} type="button" onClick={() => !isFeedback && onAnswer(option)} disabled={isFeedback} className={classes}>
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium">{option}</span>
                  {isFeedback && correct && <Check className="h-5 w-5 shrink-0 text-emerald-400" />}
                  {isFeedback && selected && !correct && <X className="h-5 w-5 shrink-0 text-red-400" />}
                </div>
              </button>
            );
          })}
        </div>
        {isFeedback && <div className="mt-4 flex items-center gap-2 font-semibold">
          {selectedAnswer === correctAnswer ? <><Check className="h-5 w-5 text-emerald-400" /><span className="text-emerald-400">Doğru! Harika gidiyorsun.</span></> : <><X className="h-5 w-5 text-red-400" /><span className="text-rose-300">Yanlış! Doğru cevap: {correctAnswer}</span></>}
        </div>}
      </div>
    </div>
  );
}
