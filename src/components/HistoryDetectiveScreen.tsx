import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2, Clock3, Compass, Landmark,
  RefreshCcw, ShieldCheck, Trophy, XCircle } from 'lucide-react';
import type { PanoramaMedia, StreetRound } from '@/components/StreetPanorama';
import { HistoryCubePanorama } from '@/components/HistoryCubePanorama';
import { HistoryPhotoGallery, type HistoryGalleryImage } from '@/components/HistoryPhotoGallery';
import { StreetPhoto } from '@/components/StreetPhoto';
import { atlasApi } from '@/lib/atlasApi';
import { useLanguage } from '@/lib/i18n';

type Localized = {tr:string;en:string};
type Question = {
  prompt:Localized;
  options:Localized[];
  correct:number;
  explanation:Localized;
};
type HistoryCase = {
  id:string;
  monument:Localized;
  place:Localized;
  era:Localized;
  tradition:Localized;
  purpose:Localized;
  clue:Localized;
  fact:Localized;
  sourceUrl:string;
  questions:Question[];
  gallery?:HistoryGalleryImage[];
  media:PanoramaMedia;
  credit:{artist:string;license:string;licenseUrl:string;source:string};
};
type Stage='inspect'|'quiz'|'reveal'|'finish';
type Result={id:string;name:string;points:number;correct:number};
const POINTS=[400,350,250];
const BEST_KEY='globriva-history-best-five-v1';
function localBest(){
  try{
    const value=Number(localStorage.getItem(BEST_KEY)||0);
    return Number.isFinite(value)?Math.max(0,value):0;
  }catch{return 0;}
}
const format=(n:number)=>n.toLocaleString('tr-TR');

export function HistoryDetectiveScreen({
  onClose,onGameComplete,
}:{
  onClose:()=>void;
  onGameComplete?:()=>void;
}){
  const {language}=useLanguage();
  const tr=language==='tr';
  const text=(trText:string,enText:string)=>tr?trText:enText;
  const localized=(value:Localized)=>value[tr?'tr':'en'];
  const [cases,setCases]=useState<HistoryCase[]>([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState('');
  const [retry,setRetry]=useState(0);
  const [index,setIndex]=useState(0);
  const [stage,setStage]=useState<Stage>('inspect');
  const [ready,setReady]=useState(false);
  const [useStatic,setUseStatic]=useState(false);
  const [photoError,setPhotoError]=useState('');
  const [questionIndex,setQuestionIndex]=useState(0);
  const [picked,setPicked]=useState<number|null>(null);
  const [roundPoints,setRoundPoints]=useState(0);
  const [correctCount,setCorrectCount]=useState(0);
  const [results,setResults]=useState<Result[]>([]);
  const [seconds,setSeconds]=useState(0);
  const [best,setBest]=useState(localBest);
  const [run,setRun]=useState(0);
  const completedRef=useRef(false);

  useEffect(()=>{
    const controller=new AbortController();
    setLoading(true);
    setError('');
    void (async()=>{
      try{
        const response=await fetch(atlasApi('/api/history/session'),{
          signal:controller.signal,cache:'no-store',
        });
        const json=await response.json() as {cases?:HistoryCase[];error?:string};
        if(!response.ok||!Array.isArray(json.cases)||json.cases.length!==5 ||
          json.cases.some(entry=>entry.questions.length!==3)){
          throw new Error(json.error||'Historical gallery is not ready.');
        }
        if(!controller.signal.aborted){
          setCases(json.cases);
          setLoading(false);
        }
      }catch(e){
        if(!controller.signal.aborted){
          setError(e instanceof Error?e.message:'Historical gallery unavailable.');
          setLoading(false);
        }
      }
    })();
    return()=>controller.abort();
  },[retry]);

  useEffect(()=>{
    if(stage!=='quiz')return;
    const timer=window.setInterval(()=>setSeconds(s=>s+1),1000);
    return()=>window.clearInterval(timer);
  },[stage,index]);

  const active=cases[index];
  const score=results.reduce((sum,row)=>sum+row.points,0)+roundPoints;
  const question=active?.questions[questionIndex];
  // Question bank uses canonical options, but players see a different
  // position each time so 'always tap A' can never game the score.
  const choiceOrder=useMemo(()=>{
    const order=[0,1,2,3];
    for(let i=order.length-1;i>0;i--){
      const j=Math.floor(Math.random()*(i+1));
      [order[i],order[j]]=[order[j],order[i]];
    }
    return order;
  },[active?.id,questionIndex,run]);
  const round:StreetRound|undefined=active?{
    id:active.id,ticket:'',media:active.media,credit:active.credit,
  }:undefined;
  const photoReady=()=>{
    setReady(true);
    setPhotoError('');
  };
  const photoFailed=(message:string)=>{
    setPhotoError(message);
    setReady(false);
    if(!useStatic)setUseStatic(true); // A local four-angle copy is the fallback.
  };
  const answer=(choice:number)=>{
    if(!question||picked!==null||stage!=='quiz')return;
    setPicked(choice);
    if(choice===question.correct){
      setRoundPoints(v=>v+POINTS[questionIndex]);
      setCorrectCount(v=>v+1);
    }
  };
  const nextQuestion=()=>{
    if(picked===null)return;
    if(questionIndex===2){
      setStage('reveal');
    }else{
      setQuestionIndex(v=>v+1);
      setPicked(null);
    }
  };
  const skip=()=>{
    // If both immersive and offline-safe photographs fail, players can
    // complete the set without inventing historical answers or points.
    setRoundPoints(0);
    setCorrectCount(0);
    setStage('reveal');
  };
  const advance=()=>{
    if(!active)return;
    const row:Result={id:active.id,name:localized(active.monument),
      points:roundPoints,correct:correctCount};
    const next=[...results,row];
    setResults(next);
    if(next.length===cases.length){
      const total=next.reduce((sum,item)=>sum+item.points,0);
      const nextBest=Math.max(best,total);
      setBest(nextBest);
      try{localStorage.setItem(BEST_KEY,String(nextBest));}catch{/* optional */}
      setRoundPoints(0);
      setStage('finish');
      if(!completedRef.current){
        completedRef.current=true;
        onGameComplete?.();
      }
      return;
    }
    setIndex(v=>v+1);
    setStage('inspect');
    setReady(false);
    setUseStatic(false);
    setPhotoError('');
    setQuestionIndex(0);
    setPicked(null);
    setRoundPoints(0);
    setCorrectCount(0);
    setSeconds(0);
  };
  const restart=()=>{
    completedRef.current=false;
    setRun(v=>v+1);
    setIndex(0);
    setStage('inspect');
    setReady(false);
    setUseStatic(false);
    setPhotoError('');
    setQuestionIndex(0);
    setPicked(null);
    setRoundPoints(0);
    setCorrectCount(0);
    setResults([]);
    setSeconds(0);
  };

  return (
    <div className="fixed inset-0 z-[70] overflow-y-auto overscroll-contain bg-[#07182c] text-white">
      <main className="mx-auto min-h-[100dvh] w-full max-w-[650px] px-3 pb-[max(24px,env(safe-area-inset-bottom))] pt-[max(14px,env(safe-area-inset-top))] sm:px-5">
        <header className="mb-3 flex items-center gap-3">
          <button type="button" aria-label={text('Ana menüye dön','Back to menu')} onClick={onClose}
            className="street-round-button"><ArrowLeft className="h-5 w-5"/></button>
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-amber-200/40 bg-amber-300/15 text-amber-200">
            <Landmark className="h-6 w-6"/>
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-[19px] font-black leading-tight">
              {text('Medeniyet Dedektifi','Civilization Detective')}
            </h1>
            <p className="text-[11px] font-semibold text-amber-100/75">
              {text('Tarihî izleri 360° keşfet','Explore history in 360°')}
            </p>
          </div>
          <span className="rounded-xl border border-amber-200/30 bg-amber-200/10 px-3 py-2 text-xs font-black tabular-nums text-amber-100">
            {format(score)} / 5.000
          </span>
        </header>

        {loading?(
          <div className="street-card p-8 text-center text-blue-100" role="status">
            {text('Lisanslı tarihî panoramalar hazırlanıyor...','Preparing licensed historical panoramas...')}
          </div>
        ):error?(
          <section className="street-card space-y-4 p-6 text-center">
            <XCircle className="mx-auto h-10 w-10 text-amber-200"/>
            <p role="alert" className="text-sm">{error}</p>
            <button type="button" onClick={()=>setRetry(v=>v+1)} className="street-primary w-full">
              <RefreshCcw className="h-4 w-4"/>{text('Tekrar dene','Retry')}
            </button>
          </section>
        ):stage==='finish'?(
          <section className="space-y-4">
            <div className="street-card space-y-3 p-6 text-center">
              <Trophy className="mx-auto h-14 w-14 text-amber-300"/>
              <p className="text-xs font-extrabold uppercase tracking-widest text-amber-100/80">
                {text('Beş tarihî dosya tamamlandı','Five history cases completed')}
              </p>
              <h2 className="text-4xl font-black tabular-nums text-amber-200">{format(score)}</h2>
              <p className="text-sm text-blue-100/80">
                {text('5.000 üzerinden tur puanın','Your score out of 5,000')}
              </p>
              <p className="text-sm font-extrabold text-emerald-200">
                {text('Cihaz rekorun','Device best')}: {format(best)}
              </p>
            </div>
            <div className="street-card space-y-2 p-4">
              {results.map((row,i)=>(
                <div key={row.id} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
                  <span className="font-black text-amber-200">{i+1}.</span>
                  <span className="min-w-0 flex-1">
                    <strong className="block truncate text-sm">{row.name}</strong>
                    <small className="text-blue-100/65">{row.correct}/3 {text('doğru','correct')}</small>
                  </span>
                  <strong className="tabular-nums text-emerald-200">{row.points}</strong>
                </div>
              ))}
            </div>
            <button type="button" className="street-primary w-full" onClick={restart}>
              <RefreshCcw className="h-4 w-4"/>{text('Tekrar oyna','Play again')}
            </button>
            <button type="button" className="street-secondary w-full" onClick={onClose}>
              {text('Ana menü','Main menu')}
            </button>
          </section>
        ):active&&round?(
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-2xl border border-amber-200/20 bg-[#20354d] px-4 py-3 text-sm">
              <span className="flex items-center gap-2 font-black text-amber-100">
                <Compass className="h-4 w-4"/>
                {text('Dosya','Case')} {index+1}/{cases.length}
              </span>
              <span className="flex items-center gap-2 text-xs font-bold text-blue-100/75">
                <Clock3 className="h-4 w-4"/>{Math.floor(seconds/60)}:{String(seconds%60).padStart(2,'0')}
              </span>
            </div>

            {stage==='inspect'&&(
              <>
                <section className="street-card overflow-hidden p-2">
                  <div className="relative h-[min(48dvh,400px)] min-h-[245px]">
                    {!useStatic&&active.media.mode==='multires'?(
                      <HistoryCubePanorama key={active.id+'-'+run} id={active.id} media={active.media}
                        onReady={photoReady} onError={photoFailed}/>
                    ):(
                      <StreetPhoto key={active.id+'-static-'+run} round={round}
                        onReady={photoReady} onError={message=>{
                          setPhotoError(message);setReady(false);
                        }}
                        onSkip={skip}/>
                    )}
                  </div>
                  <p className="px-2 py-2 text-center text-[11px] font-semibold leading-5 text-blue-100/80">
                    {useStatic
                      ?text('Yedek görseller: oklarla dört yöne bak, tam ekranda ayrıntıları büyüt.',
                        'Backup images: use arrows to look in four directions and zoom in fullscreen.')
                      :text('360° panorama: parmağınla döndür, yakınlaş ve mimariyi incele.',
                        '360° panorama: drag to turn, zoom and inspect the architecture.')}
                  </p>
                </section>
                {photoError&&useStatic&&(
                  <p className="text-center text-xs text-amber-200">
                    {text('360° görüntü açılmadı; dört yönlü yedek fotoğraflara geçildi.',
                      '360° viewer unavailable; showing four-angle photo backup.')}
                  </p>
                )}
                <section className="rounded-2xl border border-amber-200/20 bg-amber-200/10 px-4 py-3">
                  <p className="mb-1 flex items-center gap-2 text-xs font-black text-amber-200">
                    <BookOpen className="h-4 w-4"/>{text('Dedektif notu','Detective note')}
                  </p>
                  <p className="text-[13px] leading-5 text-blue-50">{localized(active.clue)}</p>
                </section>
                <HistoryPhotoGallery key={active.id} caseId={active.id} images={active.gallery??[]}/>
                <button type="button" disabled={!ready}
                  onClick={()=>setStage('quiz')} className="street-primary w-full disabled:cursor-not-allowed disabled:opacity-45">
                  {text('Üç soruyu çöz','Solve three questions')} <ArrowRight className="h-5 w-5"/>
                </button>
                {!useStatic&&(
                  <button type="button" className="street-secondary w-full" onClick={()=>{
                    setUseStatic(true);setReady(false);setPhotoError('');
                  }}>
                    {text('Dört yönlü fotoğraflarla incele','Use four-angle photo view')}
                  </button>
                )}
              </>
            )}

            {stage==='quiz'&&question&&(
              <section className="street-card space-y-3 p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-full border border-amber-200/30 bg-amber-200/10 px-3 py-1 text-[11px] font-black text-amber-200">
                    {text('Soru','Question')} {questionIndex+1}/3
                  </span>
                  <span className="text-xs font-extrabold text-emerald-200">
                    +{POINTS[questionIndex]} {text('puan','points')}
                  </span>
                </div>
                <h2 className="py-1 text-lg font-black leading-6">{localized(question.prompt)}</h2>
                <div className="space-y-2">
                  {choiceOrder.map((optionIndex,i)=>{
                    const option=question.options[optionIndex];
                    const answered=picked!==null;
                    const correct=optionIndex===question.correct;
                    const selected=picked===optionIndex;
                    return (
                      <button key={optionIndex} type="button" disabled={answered} onClick={()=>answer(optionIndex)}
                        className={'flex min-h-[49px] w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-sm font-bold transition '+
                          (answered&&correct?'border-emerald-300/80 bg-emerald-300/20 text-emerald-50':
                            answered&&selected?'border-rose-300/70 bg-rose-300/15 text-rose-100':
                            'border-white/15 bg-white/5 text-blue-50 active:scale-[.99] hover:bg-white/10')}>
                        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-white/10 text-xs">{'ABCD'[i]}</span>
                        <span className="min-w-0 flex-1">{localized(option)}</span>
                        {answered&&correct&&<CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-300"/>}
                        {answered&&selected&&!correct&&<XCircle className="h-5 w-5 shrink-0 text-rose-300"/>}
                      </button>
                    );
                  })}
                </div>
                {picked!==null&&(
                  <>
                    <div aria-live="polite" className="rounded-xl border border-white/10 bg-black/20 p-3">
                      <p className={'mb-1 text-sm font-black '+(picked===question.correct?'text-emerald-200':'text-orange-200')}>
                        {picked===question.correct?text('Doğru!','Correct!'):text('Yanlış cevap','Wrong answer')}
                      </p>
                      <p className="text-xs leading-5 text-blue-100/90">{localized(question.explanation)}</p>
                    </div>
                    <button type="button" className="street-primary w-full" onClick={nextQuestion}>
                      {questionIndex===2?text('Tarihî bilgiyi keşfet','Reveal the history'):text('Sonraki soru','Next question')}
                      <ArrowRight className="h-4 w-4"/>
                    </button>
                  </>
                )}
                <button type="button" className="street-secondary w-full" onClick={()=>{
                  setReady(false);setStage('inspect');
                }}>
                  {text('Panoramaya tekrar bak','Inspect panorama again')}
                </button>
              </section>
            )}

            {stage==='reveal'&&(
              <section className="street-card space-y-4 p-5">
                <div className="text-center">
                  <ShieldCheck className="mx-auto mb-2 h-9 w-9 text-amber-200"/>
                  <p className="text-xs font-black uppercase tracking-[.14em] text-amber-200">
                    {text('Tarihî dosya çözüldü','Historical case solved')}
                  </p>
                  <h2 className="mt-2 text-xl font-black">{localized(active.monument)}</h2>
                  <p className="mt-1 text-xs text-blue-100/70">{localized(active.place)}</p>
                  <p className="mt-2 text-[28px] font-black text-emerald-200">
                    +{roundPoints} / 1.000
                  </p>
                  <p className="text-xs text-blue-100/75">{correctCount}/3 {text('doğru cevap','correct answers')}</p>
                </div>
                <div className="space-y-3 rounded-xl border border-amber-200/20 bg-amber-200/10 p-4 text-xs leading-5">
                  <div><strong className="text-amber-200">{text('Kültür / gelenek:','Culture / tradition:')}</strong>
                    <p className="text-blue-50">{localized(active.tradition)}</p></div>
                  <div><strong className="text-amber-200">{text('Dönem:','Period:')}</strong>
                    <p className="text-blue-50">{localized(active.era)}</p></div>
                  <div><strong className="text-amber-200">{text('Yapılış amacı:','Original purpose:')}</strong>
                    <p className="text-blue-50">{localized(active.purpose)}</p></div>
                  <p className="border-t border-amber-200/20 pt-3 text-blue-50">{localized(active.fact)}</p>
                </div>
                <div className="space-y-1 text-[11px] leading-5 text-blue-100/75">
                  <p>{text('360° fotoğraf','360° photo')}: {active.credit.artist} · {active.credit.license}</p>
                  <p className="flex flex-wrap gap-x-4">
                    <a href={active.credit.source} target="_blank" rel="noopener noreferrer"
                      className="font-semibold underline underline-offset-2">{text('Fotoğraf kaynağı','Photo source')}</a>
                    <a href={active.credit.licenseUrl} target="_blank" rel="noopener noreferrer"
                      className="font-semibold underline underline-offset-2">{text('Görsel lisansı','Image license')}</a>
                    <a href={active.sourceUrl} target="_blank" rel="noopener noreferrer"
                      className="font-semibold underline underline-offset-2">{text('Tarihî bilgi kaynağı','History reference')}</a>
                  </p>
                </div>
                <button type="button" className="street-primary w-full" onClick={advance}>
                  {index===cases.length-1?text('Sonuçlarımı gör','View my results'):text('Sonraki tarihî mekân','Next historical landmark')}
                  <ArrowRight className="h-4 w-4"/>
                </button>
              </section>
            )}
          </div>
        ):null}
        <p className="mt-5 text-center text-[10px] leading-5 text-blue-100/50">
          {text('Gerçek lisanslı tarihî panoramalar · 5 mekân · 15 soru · Öğrenme modu',
            'Authentic licensed historical panoramas · 5 sites · 15 questions · Learning mode')}
        </p>
      </main>
    </div>
  );
}
