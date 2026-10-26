import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, X, Info, MapPin, Building2, Flag, Sparkles, Lightbulb, LockKeyhole, BookOpen, Search } from 'lucide-react';
import { getCountryFlag } from '@/data/flags';
import { COUNTRY_DATA } from '@/data/countries';
import { EXTRA_COUNTRY_KNOWLEDGE } from '@/data/countryKnowledge';
import { getCountryClue } from '@/data/countryClues';
import { motion, useReducedMotion } from 'motion/react';
import { playGameSound } from '@/lib/gameFx';
import type { GamePhase, QuestionType } from '@/types';
import { useLanguage } from '@/lib/i18n';
import { localizedAnswer } from '@/lib/countryLanguage';
import { localizedClueCard } from '@/lib/clueLanguage';

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
  answerInfoOpen: boolean;
  onAnswerInfoOpenChange: (open: boolean) => void;
}

const difficulty = (round: number) => round <= 5 ? 'KOLAY' : round <= 12 ? 'ORTA' : 'ZOR';

export function QuestionPanel({
  questionType, countryId, round, revealedClues, onRevealClue, options, selectedAnswer, correctAnswer, phase, onAnswer,
  answerInfoOpen, onAnswerInfoOpenChange,
}: QuestionPanelProps) {
  const reduceMotion = useReducedMotion();
  const {language,t}=useLanguage();
  const [flagLoadFailed, setFlagLoadFailed] = useState(false);
  useEffect(() => { setFlagLoadFailed(false); }, [countryId]);
  const isFeedback = phase === 'feedback';
  const isFlag = questionType === 'flag';
  const isClue = questionType === 'clue';
  const isCountry = questionType === 'country';
  const originalClue = isClue ? getCountryClue(countryId) : null;
  const clue = originalClue ? localizedClueCard(originalClue,language) : null;
  const flag = countryId ? getCountryFlag(countryId) : null;
  const country = countryId ? COUNTRY_DATA[countryId] : null;
  const learningCard = countryId ? getCountryClue(countryId) : null;
  const learningFact = learningCard ? localizedClueCard(learningCard, language).fact : countryId ? EXTRA_COUNTRY_KNOWLEDGE[countryId] : null;
  useEffect(() => {
    if (!answerInfoOpen) return;
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onAnswerInfoOpenChange(false);
    };
    window.addEventListener('keydown', onEscape);
    return () => window.removeEventListener('keydown', onEscape);
  }, [answerInfoOpen, onAnswerInfoOpenChange]);

  return (
    <div className={'relative z-10 mx-auto w-full min-w-0 animate-slide-up ' + (isClue ? 'clue-compact-shell max-w-xl px-3 pb-3' : 'px-4 pb-5 ' + (isFlag ? 'max-w-xl' : ''))}>
      <motion.div key={countryId ?? 'none'} initial={reduceMotion ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .28 }} className={'glass-panel mx-auto max-w-2xl ' + (isClue ? 'clue-question-panel clue-compact-layout p-3 sm:p-4' : 'p-4 sm:p-5 ' + (isFlag ? 'flag-question-panel' : ''))}>
        <div className={(isClue ? 'mb-2 ' : 'mb-4 ') + 'flex items-center justify-between gap-2'}>
          <div className="flex min-w-0 items-center gap-2">
            <div className={'flex shrink-0 items-center justify-center rounded-xl ' + (isClue ? 'h-7 w-7 ' : 'h-9 w-9 ') + (isFlag ? 'bg-amber-400/20 text-amber-300' : isClue ? 'bg-violet-400/20 text-violet-200' : isCountry ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400')}>
              {isFlag ? <Flag className="h-5 w-5" /> : isClue ? <Search className="h-5 w-5" /> : isCountry ? <MapPin className="h-5 w-5" /> : <Building2 className="h-5 w-5" />}
            </div>
            <h2 className={(isClue ? 'text-[14px] sm:text-base ' : 'text-base sm:text-lg ') + 'font-bold leading-snug text-white'}>
              {t(isFlag ? 'Bu bayrak hangi ülkeye ait?' : isClue ? 'Hangi ülke?' : isCountry ? 'Bu hangi ülke?' : 'Bu ülkenin başkenti neresi?')}
            </h2>
          </div>
          <span className={'shrink-0 rounded-lg border px-2 py-1 text-[10px] font-black tracking-wide ' + (round <= 5 ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300' : round <= 12 ? 'border-amber-400/30 bg-amber-400/10 text-amber-300' : 'border-rose-400/30 bg-rose-400/10 text-rose-300')}>{t(difficulty(round))}</span>
        </div>

        {isFlag && (
          <div className="flag-stage relative mb-5 overflow-hidden rounded-2xl border border-white/15 p-5 text-center sm:p-7">
            <div className="flag-stars pointer-events-none absolute inset-0" aria-hidden="true" />
            <p className="relative mb-4 flex items-center justify-center gap-1.5 text-[10px] font-black tracking-[.2em] text-amber-200/80"><Sparkles className="h-3.5 w-3.5" /> {t('BAYRAK ARENASI')}</p>
            <div className="relative mx-auto flex h-[145px] w-full max-w-[290px] items-center justify-center rounded-xl border border-white/10 bg-white/5 p-3 shadow-[0_12px_40px_rgba(0,0,0,.35)] sm:h-[185px]">
              {flag && !flagLoadFailed ? (
                <img key={countryId} src={flag.url} onError={() => setFlagLoadFailed(true)} alt={t("Bu bayrak hangi ülkeye ait?")} className="h-full w-full object-contain drop-shadow-[0_8px_14px_rgba(0,0,0,.6)]" draggable={false} />
              ) : (
                <span aria-label={t("Bayrak")} role="img" className="text-7xl drop-shadow-xl">{flag?.emoji ?? '🏳️'}</span>
              )}
            </div>
            {isFeedback && <p className="relative mt-4 font-bold text-amber-100">{localizedAnswer(correctAnswer,questionType,language)}</p>}
          </div>
        )}

        {isClue && clue && (
          <div className="clue-stage relative mb-2 overflow-hidden rounded-[18px] border border-violet-300/25 p-2.5 sm:p-3">
            <div className="clue-stage-glow pointer-events-none absolute inset-0" aria-hidden="true" />
            <div className="relative mb-2 flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 text-[11px] font-black tracking-[.07em] text-violet-200"><span className="grid h-6 w-6 place-items-center rounded-full bg-violet-300/15 text-base">?</span> {t('GİZEMLİ ÜLKE')}</span>
              <span className="rounded-full border border-amber-300/30 bg-amber-200/10 px-2 py-1 text-[10px] font-black text-amber-200" >{t('Puan')} %{100-(revealedClues-1)*25} · #{String(round).padStart(2, '0')}</span>
            </div>
            <div className="relative space-y-1.5">
              {clue.clues.map((hint, index) => {
                const unlocked = index < revealedClues || isFeedback;
                return (
                  <div key={index} className={'clue-fact ' + (unlocked ? 'clue-fact-open' : 'clue-fact-locked')}>
                    <span className="clue-fact-index">{String(index + 1).padStart(2, '0')}</span>
                    <span className="min-w-0 flex-1 text-[13px] leading-relaxed">{unlocked ? hint : t('Bu ipucu henüz kilitli')}</span>
                    {!unlocked && <LockKeyhole className="h-4 w-4 shrink-0 text-slate-400" />}
                    {unlocked && <Sparkles className="h-4 w-4 shrink-0 text-amber-200/70" />}
                  </div>
                );
              })}
            </div>
            {!isFeedback && revealedClues < 3 && (
              <button type="button" onClick={() => { playGameSound('hint'); onRevealClue(); }} className="clue-reveal-button relative mt-2 flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-extrabold">
                <Lightbulb className="h-4 w-4" /> {t('Sonraki İpucunu Aç')} <span className="text-[10px] font-semibold text-violet-100/70">(-%25 puan)</span>
              </button>
            )}
            {isFeedback && (
              <div className="clue-learning relative mt-4 rounded-xl border border-emerald-300/20 bg-emerald-300/10 p-3">
                <p className="mb-1 flex items-center gap-1.5 text-xs font-black text-emerald-200"><BookOpen className="h-4 w-4" /> {t('BİLİYOR MUYDUN?')}</p>
                <p className="text-xs leading-relaxed text-slate-100">{clue.fact}</p>
              </div>
            )}
          </div>
        )}

        <div className={'grid grid-cols-1 sm:grid-cols-2 ' + (isClue ? 'gap-1.5' : 'gap-2.5')}>
          {options.map((option, index) => {
            const selected = selectedAnswer === option;
            const correct = option === correctAnswer;
            let classes = 'option-btn';
            if (isFeedback) classes += correct ? (selected ? ' option-btn-correct option-btn-correct-picked' : ' option-btn-correct') : selected ? ' option-btn-wrong' : ' option-btn-disabled';
            return (
              <div key={option} className="relative min-w-0">
              <motion.button type="button" initial={reduceMotion ? false : { opacity: 0, y: 8 }} animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, x: isFeedback && selected && !correct ? [0, -8, 7, -4, 0] : 0, scale: isFeedback && correct ? [1, 1.035, 1] : 1 }} transition={{ duration: isFeedback ? .32 : .24, delay: isFeedback ? 0 : index * .045 }} whileTap={reduceMotion || isFeedback ? undefined : { scale: .97 }} onClick={() => !isFeedback && onAnswer(option)} disabled={isFeedback} className={classes + (isClue ? ' clue-option-btn' : '') + (isFeedback && correct ? ' pr-12' : '')}>
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium">{localizedAnswer(option,questionType,language)}</span>
                  {isFeedback && correct && <span className="answer-correct-badge mr-9" aria-label={t("Doğru cevap")}><Check className="h-4 w-4" strokeWidth={3.5} /></span>}
                  {isFeedback && selected && !correct && <X className="h-5 w-5 shrink-0 text-red-400" />}
                </div>
              </motion.button>
              {isFeedback && correct && (
                <button type="button" onClick={() => onAnswerInfoOpenChange(true)} aria-label={t('Doğru cevap hakkında bilgi')} title={t('Bilgi kartını aç')} className="absolute right-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-cyan-300/60 bg-[#143744] text-cyan-100 shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300">
                  <Info className="h-[19px] w-[19px]" strokeWidth={2.4} />
                </button>
              )}
              </div>
            );
          })}
        </div>
        {isFeedback && <div className="mt-4 flex items-center gap-2 font-semibold">
          {selectedAnswer === correctAnswer ? <><Check className="h-5 w-5 text-emerald-400" /><span className="text-emerald-400" >{t('Doğru! Harika gidiyorsun.')}</span></> : <><X className="h-5 w-5 text-red-400" /><span className="text-rose-300" >{t('Yanlış! Doğru cevap:')} {localizedAnswer(correctAnswer,questionType,language)}</span></>}
        </div>}
      </motion.div>
      {isFeedback && answerInfoOpen && country && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#04101b]/85 p-4 backdrop-blur-sm" role="presentation" onClick={() => onAnswerInfoOpenChange(false)}>
          <section role="dialog" aria-modal="true" aria-labelledby="globriva-answer-fact-title" onClick={event => event.stopPropagation()} className="w-full max-w-md overflow-hidden rounded-[24px] border border-cyan-300/30 bg-gradient-to-b from-[#173547] to-[#081926] p-5 text-slate-100 shadow-[0_24px_80px_rgba(0,0,0,.8)]">
            <div className="mb-4 flex items-center justify-between gap-3">
              <p className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[.16em] text-cyan-200"><BookOpen className="h-4 w-4" /> {t('KEŞİF NOTU')}</p>
              <button type="button" autoFocus onClick={() => onAnswerInfoOpenChange(false)} aria-label={t('Kapat')} className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white"><X className="h-5 w-5" /></button>
            </div>
            <div className="mb-4 flex items-center gap-3">
              <span className="text-4xl" aria-hidden="true">{flag?.emoji ?? '🌍'}</span>
              <h3 id="globriva-answer-fact-title" className="text-2xl font-black leading-tight text-white">{localizedAnswer(country.nameTr, 'country', language)}</h3>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <p className="text-[11px] font-bold uppercase tracking-wider text-cyan-200">{t('Başkent')}</p>
              <p className="mt-1 text-lg font-bold text-white">{localizedAnswer(country.capitalTr, 'capital', language)}</p>
            </div>
            {learningFact && <p className="mt-4 rounded-2xl border border-amber-200/20 bg-amber-200/5 p-4 text-sm leading-relaxed text-slate-100"><span className="mb-1 block text-[11px] font-black uppercase tracking-wider text-amber-200">{t('BİLİYOR MUYDUN?')}</span>{learningFact}</p>}
            <p className="mt-4 text-center text-xs text-slate-400">{t('Kapatınca sorular otomatik devam eder.')}</p>
          </section>
        </div>, document.body
      )}
    </div>
  );
}
