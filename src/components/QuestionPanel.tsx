import { useEffect, useState } from 'react';
import { Check, X, MapPin, Building2, Flag, Sparkles } from 'lucide-react';
import { getCountryFlag } from '@/data/flags';
import type { GamePhase, QuestionType } from '@/types';

interface QuestionPanelProps {
  questionType: QuestionType;
  countryId: string | null;
  round: number;
  options: string[];
  selectedAnswer: string | null;
  correctAnswer: string;
  phase: GamePhase;
  onAnswer: (answer: string) => void;
}

const difficulty = (round: number) => round <= 5 ? 'KOLAY' : round <= 12 ? 'ORTA' : 'ZOR';

export function QuestionPanel({
  questionType, countryId, round, options, selectedAnswer, correctAnswer, phase, onAnswer,
}: QuestionPanelProps) {
  const [flagLoadFailed, setFlagLoadFailed] = useState(false);
  useEffect(() => { setFlagLoadFailed(false); }, [countryId]);
  const isFeedback = phase === 'feedback';
  const isFlag = questionType === 'flag';
  const isCountry = questionType === 'country';
  const flag = countryId ? getCountryFlag(countryId) : null;

  return (
    <div className={'relative z-10 w-full px-4 pb-5 animate-slide-up ' + (isFlag ? 'max-w-xl' : '')}>
      <div className={'glass-panel mx-auto max-w-2xl p-4 sm:p-5 ' + (isFlag ? 'flag-question-panel' : '')}>
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <div className={'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ' + (isFlag ? 'bg-amber-400/20 text-amber-300' : isCountry ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400')}>
              {isFlag ? <Flag className="h-5 w-5" /> : isCountry ? <MapPin className="h-5 w-5" /> : <Building2 className="h-5 w-5" />}
            </div>
            <h2 className="text-base font-bold text-white sm:text-lg">
              {isFlag ? 'Bu bayrak hangi ülkeye ait?' : isCountry ? 'Bu hangi ülke?' : 'Bu ülkenin başkenti neresi?'}
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
