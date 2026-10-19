import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
const VictoryBadge = lazy(() => import('@/components/VictoryBadge'));
import { motion, useReducedMotion } from 'motion/react';
import { celebrateGame, playGameSound } from '@/lib/gameFx';
import { FxErrorBoundary } from '@/components/FxErrorBoundary';
import { ArrowLeft, Check, Compass, Flame, Flag, Gift, LockKeyhole, Sparkles, Trophy, X } from 'lucide-react';
import { COUNTRY_DATA } from '@/data/countries';
import { useLanguage } from '@/lib/i18n';
import { localizedCountryById, localizedAnswer } from '@/lib/countryLanguage';
import { getCountryFlag } from '@/data/flags';
import { discoverCountry } from '@/lib/discovery';
import { analyticsQuestionId, trackPlayEvent } from '@/lib/atlasTelemetry';
import {
  DAILY_TOTAL, getDailyDate, getDailyQuestions, getStreakForDay,
  loadDailyProgress, saveDailyAnswer,
} from '@/lib/dailyChallenge';

interface Props { onClose: () => void; onExplore: () => void; onGameComplete?: () => void; }

export function DailyChallengeScreen({ onClose, onExplore, onGameComplete }: Props) {
  const reduceMotion = useReducedMotion();
  const {language,t}=useLanguage();
  const day = useMemo(getDailyDate, []);
  const questions = useMemo(() => getDailyQuestions(day), [day]);
  const [progress, setProgress] = useState(() => loadDailyProgress(day));
  const [selected, setSelected] = useState<string | null>(null);
  const [dateExpired, setDateExpired] = useState(false);
  const busy = useRef(false);
  const questionOpenedAt = useRef(0);
  const index = progress.answers.length;
  const complete = index >= DAILY_TOTAL;
  const question = questions[Math.min(index, DAILY_TOTAL - 1)];
  const correct = progress.answers.filter((answer, i) => answer === questions[i].answer).length;
  const streak = getStreakForDay(day);
  const flag = getCountryFlag(question.countryId);

  useEffect(()=>{ trackPlayEvent({mode:'daily',event_type:'mode_start'}); },[]);
  useEffect(()=>{
    if(complete)return;
    questionOpenedAt.current=performance.now();
    trackPlayEvent({mode:'daily',event_type:'question_shown',
      question_id:analyticsQuestionId(question.countryId,question.type)});
  },[complete,question.countryId,question.type]);
  const close=()=>{ trackPlayEvent({mode:'daily',event_type:'mode_exit'}); onClose(); };
  const answer = (choice: string) => {
    if (busy.current || complete || selected !== null) return;
    if (getDailyDate() !== day) { setDateExpired(true); return; }
    busy.current = true;
    trackPlayEvent({mode:'daily',event_type:'answer',
      question_id:analyticsQuestionId(question.countryId,question.type),
      correct:choice===question.answer,
      option_index:question.options.indexOf(choice),
      duration_ms:questionOpenedAt.current?performance.now()-questionOpenedAt.current:undefined});
    setSelected(choice);
    if (choice === question.answer) discoverCountry(question.countryId);
    playGameSound(choice === question.answer ? 'correct' : 'wrong');
    // Save immediately so an accidental close/refresh cannot repeat an answered question.
    const updated = saveDailyAnswer(day, choice);
    window.setTimeout(() => {
      setProgress(updated);
      if (updated.answers.length === DAILY_TOTAL) {
        trackPlayEvent({mode:'daily',event_type:'daily_complete'});
        onGameComplete?.();
        playGameSound('victory');
        void celebrateGame('daily');
      }
      setSelected(null);
      busy.current = false;
    }, 1050);
  };

  return (
    <div className="daily-screen fixed inset-0 z-50 overflow-y-auto overscroll-contain text-white" role="dialog" aria-modal="true" aria-label={t("Günlük dünya görevi")}>
      <div className="mx-auto max-w-2xl px-4 pb-12 pt-5 sm:px-7">
        <header className="mb-4 flex items-center justify-between gap-3">
          <button className="weekly-nav-button gap-2" onClick={close}><ArrowLeft className="h-4 w-4" /> {t('GERİ DÖN')}</button>
          <span className="rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1.5 text-[11px] font-bold text-amber-200">{t('HER GÜN YENİ GÖREV')}</span>
        </header>
        <section className="daily-hero relative mb-4 overflow-hidden rounded-[26px] border border-cyan-300/25 p-6 shadow-2xl sm:p-8">
          <div className="relative z-10">
            <div className="mb-3 flex items-center gap-2 text-xs font-black tracking-[.19em] text-cyan-200"><Sparkles className="h-4 w-4" /> {t('DÜNYA GÖREVİ')}</div>
            <h1 className="max-w-[290px] text-3xl font-black leading-tight sm:text-4xl">{t('Bugünün')}<br /><span className="text-amber-300">{t('10 Sorusu')}</span></h1>
            <p className="mt-3 max-w-[295px] text-sm text-slate-200">{t('Herkes aynı ülkeleri çözüyor. Her doğru cevapla keşif haritan büyüyor!')}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="daily-chip"><Flame className="h-4 w-4 text-orange-400" /> {streak} {t('gün seri')}</span>
              <span className="daily-chip"><Gift className="h-4 w-4 text-amber-300" /> {t('Günlük başarı')}</span>
            </div>
          </div>
        </section>
        <section className="mb-4 rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="mb-3 flex items-center justify-between gap-2 text-sm"><strong>{complete ? t('Görev tamamlandı!') : `${t('Soru')} ${index + 1} / ${DAILY_TOTAL}`}</strong><span className="font-bold text-emerald-300">{correct} {t('Doğru')}</span></div>
          <div className="grid grid-cols-10 gap-1.5" aria-label="Günlük ilerleme">
            {questions.map((q, i) => <div key={q.countryId} title={`${i + 1}. soru`} className={'h-2.5 rounded-full ' + (i < progress.answers.length ? progress.answers[i] === q.answer ? 'bg-emerald-400' : 'bg-rose-400' : i === index ? 'bg-amber-300/85' : 'bg-white/15')} />)}
          </div>
          <div className="mt-2 flex justify-between text-[11px] text-slate-400"><span>{t('İlk 4 kolay')}</span><span>{t('Son 2 zor')}</span></div>
        </section>
        {complete ? (
          <motion.section initial={reduceMotion ? false : { opacity: 0, y: 25, scale: .94 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: 'spring', duration: .62, bounce: .25 }} className="daily-finish rounded-3xl border border-amber-400/30 p-7 text-center shadow-2xl">
            <FxErrorBoundary fallback={<Trophy className="mx-auto mb-3 h-14 w-14 text-amber-300" />}>
              <Suspense fallback={<Trophy className="mx-auto mb-3 h-14 w-14 text-amber-300" />}>
                <VictoryBadge size={95} />
              </Suspense>
            </FxErrorBoundary>
            <div className="text-xs font-black tracking-[.25em] text-amber-300">{t('GÜNLÜK GÖREV TAMAMLANDI')}</div>
            <h2 className="mt-2 text-3xl font-black">{correct} / {DAILY_TOTAL}</h2>
            <p className="mt-2 text-sm text-slate-300">{correct === DAILY_TOTAL ? t('Mükemmel! Bütün cevapların doğru.') : t('Görev bitti! Yeni sorular yarın UTC 00.00’da açılacak.')}</p>
            <div className="my-5 flex justify-center gap-3 text-3xl" aria-label="Başarı yıldızları">
              {[0, 1, 2].map(i => <span key={i} className={correct >= [4, 7, 10][i] ? 'text-amber-300' : 'text-slate-600'}>★</span>)}
            </div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-xl bg-orange-400/10 px-4 py-2 font-bold text-orange-200"><Flame className="h-5 w-5" /> {streak} {t('günlük seri')}</div>
            <button onClick={onExplore} className="weekly-play-button flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 font-black"><Compass className="h-5 w-5" /> {t('Keşif Haritamı Aç')}</button>
          </motion.section>
        ) : (
          <section className="daily-question relative overflow-hidden rounded-3xl border border-white/15 px-4 pb-5 pt-4 sm:px-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <span className="flex items-center gap-2 text-xs font-black tracking-widest text-cyan-200"><Flag className="h-4 w-4" /> {question.type === 'flag' ? t('BAYRAK SORUSU') : t('BAŞKENT SORUSU')}</span>
              <span className={'rounded-lg px-2 py-1 text-[10px] font-black ' + (question.difficulty === 1 ? 'bg-emerald-400/15 text-emerald-300' : question.difficulty === 2 ? 'bg-amber-400/15 text-amber-300' : 'bg-rose-400/15 text-rose-300')}>{question.difficulty === 1 ? t('KOLAY') : question.difficulty === 2 ? t('ORTA') : t('ZOR')}</span>
            </div>
            <div className="daily-flag-frame mb-5 flex min-h-44 flex-col items-center justify-center rounded-2xl p-4 text-center">
              {flag ? <img src={flag.url} alt="Tahmin edeceğin ülkenin bayrağı" className="max-h-32 w-full max-w-56 object-contain drop-shadow-xl" onError={event => { event.currentTarget.style.display = 'none'; event.currentTarget.nextElementSibling?.classList.remove('hidden'); }} /> : null}
              <span className={'text-7xl ' + (flag ? 'hidden' : '')} role="img" aria-label="Bayrak">{flag?.emoji ?? '🌍'}</span>
              {question.type === 'capital' && <p className="mt-3 text-lg font-black text-white">{localizedCountryById(question.countryId,language)}</p>}
            </div>
            <h2 className="mb-4 text-center text-lg font-black">{question.type === 'capital' ? t('Bu ülkenin başkenti hangisi?') : t('Bu bayrak hangi ülkeye ait?')}</h2>
            <div className="grid gap-2 sm:grid-cols-2">
              {question.options.map((option, optionIndex) => {
                const isCorrect = option === question.answer;
                const classes = selected === null ? 'border-white/15 bg-white/5 hover:bg-white/15' : isCorrect ? 'border-emerald-400 bg-emerald-400/20' : selected === option ? 'border-rose-400 bg-rose-400/20' : 'border-white/10 bg-white/5 opacity-50';
                return <motion.button key={option} initial={reduceMotion ? false : { opacity: 0, y: 8 }} animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, x: selected === option && !isCorrect ? [0,-7,6,-3,0] : 0, scale: selected !== null && isCorrect ? [1, 1.035, 1] : 1 }} transition={{ duration: selected === null ? .24 : .32, delay: selected === null ? optionIndex * .045 : 0 }} whileTap={reduceMotion || selected !== null ? undefined : { scale: .97 }} disabled={selected !== null} onClick={() => answer(option)} className={'flex min-h-[56px] items-center justify-between gap-2 rounded-xl border px-4 py-3 text-left text-sm font-bold transition ' + classes}>
                  <span>{localizedAnswer(option,question.type,language)}</span>{selected !== null && isCorrect && <Check className="h-5 w-5 shrink-0 text-emerald-300" />}{selected === option && !isCorrect && <X className="h-5 w-5 shrink-0 text-rose-300" />}
                </motion.button>;
              })}
            </div>
            {selected !== null && <p className={'mt-4 text-center text-sm font-bold ' + (selected === question.answer ? 'text-emerald-300' : 'text-rose-300')}>{selected === question.answer ? t('Doğru! Haritanda yeni bir ülke keşfettin.') : `${t('Doğru cevap:')} ${localizedAnswer(question.answer,question.type,language)}`}</p>}
            <p className="mt-4 flex items-center justify-center gap-2 text-center text-[11px] text-slate-400"><LockKeyhole className="h-3 w-3" /> {t('Günlük görev her gün sadece bir kez tamamlanır')}</p>
          </section>
        )}
        {dateExpired && <div className="fixed inset-x-4 bottom-5 z-[60] mx-auto max-w-md rounded-2xl border border-amber-300/40 bg-slate-900 p-4 text-center text-sm font-bold text-amber-200">{t('Yeni gün başladı! Ana menüye dönüp günlük görevi yeniden aç.')}</div>}
      </div>
    </div>
  );
}