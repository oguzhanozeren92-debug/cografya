import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowLeft, ArrowRight, Check, CheckCircle2, Clock3, Copy, Crown,
  Link2, Loader2, RefreshCcw, Send, ShieldCheck, Swords, Trophy, Users, XCircle, MessageCircle,
} from 'lucide-react';
import {
  createVsRoom, fetchVsRoom, inviteCodeFromUrl, joinVsRoom,
  makeVsLink, normalizeVsCode, sendVsAnswer, userFriendlyVsError,
  type VsRoom,
} from '@/lib/versus';
import { COUNTRY_DATA } from '@/data/countries';

interface Props {
  playerName: string;
  initialInviteCode?: string;
  onNameChange: (name: string) => Promise<void>;
  onClose: () => void;
}

export function GlobrivaVersusScreen({ playerName, initialInviteCode = '', onNameChange, onClose }: Props) {
  const [name, setName] = useState(playerName);
  const [inviteInput, setInviteInput] = useState(() => normalizeVsCode(initialInviteCode || inviteCodeFromUrl()));
  const [roomCode, setRoomCode] = useState('');
  const [room, setRoom] = useState<VsRoom | null>(null);
  const [busy, setBusy] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [choice, setChoice] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [answerInfoOpen, setAnswerInfoOpen] = useState(false);
  const [answerInfoRead, setAnswerInfoRead] = useState(false);
  const [copied, setCopied] = useState(false);
  const autoJoined = useRef(false);

  const refresh = useCallback(async (code: string) => {
    const latest = await fetchVsRoom(code);
    setRoom(latest);
  }, []);

  useEffect(() => {
    if (!roomCode) return;
    let active = true;
    let polling = false;
    const tick = async () => {
      if (polling || !active) return;
      polling = true;
      try {
        const latest = await fetchVsRoom(roomCode);
        if (active) {
          setRoom(latest);
          setError('');
        }
      } catch (cause) {
        if (active) setError(userFriendlyVsError(cause));
      } finally { polling = false; }
    };
    void tick();
    const timer = window.setInterval(() => { void tick(); }, 2200);
    return () => { active = false; window.clearInterval(timer); };
  }, [roomCode]);

  const enterRoom = useCallback(async (asHost: boolean, supplied?: string) => {
    if (busy) return;
    const clean = name.trim().slice(0, 20);
    if (clean.length < 2) {
      setError('Önce en az 2 karakterli bir takma ad yaz.');
      return;
    }
    const code = normalizeVsCode(supplied || inviteInput);
    if (!asHost && code.length !== 12) {
      setError('12 karakterli VS davet kodunu gir.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await onNameChange(clean);
      const result = asHost ? await createVsRoom(clean) : await joinVsRoom(code, clean);
      setRoomCode(result);
      setRoom(await fetchVsRoom(result));
      setChoice(null);
      setShowFeedback(false);setAnswerInfoOpen(false);setAnswerInfoRead(false);
    } catch (cause) {
      setError(userFriendlyVsError(cause));
    } finally {
      setBusy(false);
    }
  }, [busy, inviteInput, name, onNameChange]);

  // An invitation URL opens the VS interface directly. With a saved nickname,
  // the invited player joins without having to type the code again.
  useEffect(() => {
    const code = normalizeVsCode(initialInviteCode || inviteCodeFromUrl());
    if (!code || code.length !== 12 || !name.trim() || roomCode || autoJoined.current) return;
    autoJoined.current = true;
    void enterRoom(false, code);
  }, [enterRoom, name, roomCode, initialInviteCode]);

  const share = async () => {
    if (!roomCode) return;
    const url = makeVsLink(roomCode);
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Globriva VS daveti', text: '10 soruluk Globriva VS maçına davetlisin!', url });
        return;
      }
    } catch (cause) {
      if (cause instanceof DOMException && cause.name === 'AbortError') return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      setError('Bağlantı otomatik kopyalanamadı. Ekrandaki oda kodunu paylaşabilirsin.');
    }
  };

  const whatsappInvite = () => {
    if (!roomCode) return;
    const url = makeVsLink(roomCode);
    const message = `🌍 Globriva’da VS atmaya var mısın?\nAynı 10 coğrafya sorusunda yarışalım! 🏆\n${url}\n\nDavet kodu: ${roomCode}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    // WhatsApp web/app resolver chooses the installed client if possible.
    // On mobile web, this opens WhatsApp's recipient picker.
    const opened = window.open(whatsappUrl, '_blank');
    if (opened) opened.opener = null;
    else window.location.assign(whatsappUrl);
  };

  const copyInvite = async () => {
    if (!roomCode) return;
    try {
      await navigator.clipboard.writeText(makeVsLink(roomCode));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setError('Bağlantı kopyalanamadı. Davet kodunu arkadaşına iletebilirsin.');
    }
  };

  const submit = async () => {
    if (!room || choice === null || sending || showFeedback) return;
    setSending(true);
    setError('');
    try {
      await sendVsAnswer(roomCode, room.myAnswers.length, choice);
      await refresh(roomCode);
      setShowFeedback(true);setAnswerInfoOpen(false);setAnswerInfoRead(false);
    } catch (cause) {
      setError(userFriendlyVsError(cause));
      await refresh(roomCode).catch(() => undefined);
    } finally { setSending(false); }
  };

  useEffect(() => {
    if(!showFeedback||answerInfoOpen)return;
    const timer=window.setTimeout(()=>{
      setShowFeedback(false);setChoice(null);setAnswerInfoRead(false);
    },answerInfoRead?1700:4400);
    return ()=>window.clearTimeout(timer);
  },[showFeedback,answerInfoOpen,answerInfoRead]);

  const leave = () => {
    if (inviteCodeFromUrl()) {
      const url = new URL(window.location.href);
      url.searchParams.delete('vs');
      window.history.replaceState({}, '', url.pathname + url.search + url.hash);
    }
    onClose();
  };

  const finishedMine = Boolean(room && room.myAnswers.length >= room.questions.length);
  const finishedBoth = Boolean(room && room.status === 'finished');
  const currentIndex = room?.myAnswers.length || 0;
  const question = room?.questions[currentIndex];
  const previousAnswer = room?.myAnswers[currentIndex - 1];
  const otherName = room?.isHost ? room.guestName : room?.hostName;
  const myName = room?.isHost ? room.hostName : room?.guestName;
  const winning = room && room.myScore > room.otherScore;
  const draw = room && room.myScore === room.otherScore;
  const previousQuestion = room?.questions[currentIndex - 1];
  const correctLabel = previousQuestion?.choices[previousAnswer?.correctIndex ?? -1] || '';
  const countryInfo = Object.values(COUNTRY_DATA).find(c =>
    c.nameTr.toLocaleLowerCase('tr-TR') === correctLabel.toLocaleLowerCase('tr-TR')) || null;

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-[#07152d] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_5%,rgba(47,201,217,.20),transparent_42%),radial-gradient(circle_at_95%_30%,rgba(146,85,249,.24),transparent_43%)]" />
      <main className="relative mx-auto w-full max-w-xl px-4 pb-12 pt-5 sm:px-6">
        <header className="mb-5 flex items-center justify-between gap-3">
          <button type="button" onClick={leave} className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-sm font-bold">
            <ArrowLeft className="h-4 w-4" /> Geri dön
          </button>
          <span className="inline-flex items-center gap-2 rounded-full border border-rose-300/35 bg-rose-300/10 px-4 py-2 text-sm font-black text-rose-200">
            <Swords className="h-5 w-5" /> GL<span className="text-rose-400">O</span>BRIVA VS
          </span>
        </header>

        {!roomCode ? (
          <section className="rounded-[28px] border border-white/15 bg-[#142748] p-5 shadow-2xl sm:p-7">
            <div className="mb-5 flex flex-col items-center text-center">
              <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-[#ffac85] to-[#ed6895] shadow-lg">
                <Swords className="h-9 w-9 text-[#142748]" />
              </div>
              <h1 className="mt-4 text-3xl font-black">Arkadaşınla VS at!</h1>
              <p className="mt-2 max-w-sm text-sm leading-6 text-blue-200">İki kişi, aynı sırayla 10 soru. Her doğru cevap 100 puan. En yüksek puanı alan kazanır.</p>
            </div>
            <label className="mb-1.5 block text-xs font-bold text-blue-200" htmlFor="vs-player">Takma adın</label>
            <input id="vs-player" value={name} onChange={event => setName(event.target.value.slice(0, 20))}
              maxLength={20} placeholder="Gezgin adını yaz" autoComplete="nickname"
              className="mb-4 w-full rounded-2xl border border-white/20 bg-[#0b1932] px-4 py-3.5 text-white outline-none focus:border-cyan-300" />
            <button type="button" disabled={busy} onClick={() => { void enterRoom(true); }}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#ffb17d] to-[#ff7e92] px-5 py-4 text-base font-black text-[#18223e] disabled:opacity-50">
              {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Swords className="h-5 w-5" />} Yeni VS odası oluştur
            </button>
            <div className="my-5 flex items-center gap-3 text-xs text-blue-300/70"><div className="h-px flex-1 bg-white/15" />veya davete katıl<div className="h-px flex-1 bg-white/15" /></div>
            <label className="mb-1.5 block text-xs font-bold text-blue-200" htmlFor="vs-code">Davet kodu</label>
            <input id="vs-code" value={inviteInput} maxLength={12}
              onChange={event => setInviteInput(normalizeVsCode(event.target.value))}
              placeholder="12 karakterli kod" autoCapitalize="characters"
              className="w-full rounded-2xl border border-white/20 bg-[#0b1932] px-4 py-3.5 font-mono text-lg tracking-[0.16em] text-white outline-none focus:border-cyan-300" />
            <button type="button" disabled={busy || inviteInput.length !== 12}
              onClick={() => { void enterRoom(false); }}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-cyan-200/40 bg-cyan-200/10 px-5 py-3.5 font-black text-cyan-100 disabled:opacity-50">
              <Link2 className="h-5 w-5" /> Davete katıl
            </button>
            <p className="mt-5 flex gap-2 text-xs leading-5 text-blue-300/80"><ShieldCheck className="h-4 w-4 shrink-0" /> Rakibinle yalnızca takma adın, soru sayın ve puanın paylaşılır.</p>
          </section>
        ) : !room ? (
          <div className="flex h-64 flex-col items-center justify-center gap-3 text-blue-200"><Loader2 className="h-9 w-9 animate-spin" />Oda yükleniyor...</div>
        ) : room.expired ? (
          <div className="rounded-3xl border border-amber-200/25 bg-[#142748] p-8 text-center"><Clock3 className="mx-auto mb-3 h-12 w-12 text-amber-300" /><h2 className="text-xl font-black">Davet süresi dolmuş</h2><p className="mt-2 text-sm text-blue-200">Yeni bir VS maçı başlatabilirsin.</p></div>
        ) : (
          <>
            <div className="mb-5 rounded-[26px] border border-white/15 bg-[#132747] p-4 sm:p-5">
              <div className="flex items-center justify-between gap-2 text-xs font-black uppercase tracking-[.16em] text-cyan-200">
                <span>VS • {room.code}</span>
                <span className="flex items-center gap-1.5"><Users className="h-4 w-4" /> {room.guestName ? '2/2' : '1/2'} oyuncu</span>
              </div>
              <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-center">
                <div className="rounded-2xl bg-cyan-300/10 p-3"><div className="truncate text-xs font-bold text-cyan-200">{myName}</div><div className="mt-1 text-3xl font-black">{room.myScore}</div><small className="text-[11px] text-cyan-100/70">{room.myAnswers.length}/10</small></div>
                <span className="text-xl font-black text-rose-300">VS</span>
                <div className="rounded-2xl bg-rose-300/10 p-3"><div className="truncate text-xs font-bold text-rose-200">{otherName || 'Rakip bekleniyor'}</div><div className="mt-1 text-3xl font-black">{room.otherScore}</div><small className="text-[11px] text-rose-100/70">{room.otherCount}/10</small></div>
              </div>
            </div>

            {room.status === 'waiting' ? (
              <section className="rounded-[28px] border border-amber-300/25 bg-[#142748] p-5 text-center sm:p-7">
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-amber-300/10"><Clock3 className="h-8 w-8 text-amber-300" /></div>
                <h2 className="mt-4 text-2xl font-black">Rakibini bekliyorsun!</h2>
                <p className="mt-2 text-sm leading-6 text-blue-200">Bu bağlantıyı WhatsApp’tan arkadaşına gönder. Katıldığında maç ikiniz için başlayacak.</p>
                <button type="button" onClick={whatsappInvite}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-5 py-4 font-black text-[#062817] shadow-lg shadow-[#25D366]/10 active:scale-[0.99]">
                  <MessageCircle className="h-5 w-5" /> WhatsApp’tan davet gönder
                </button>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <button type="button" onClick={() => { void copyInvite(); }}
                    className="flex items-center justify-center gap-2 rounded-2xl border border-white/25 bg-white/10 px-3 py-3 text-sm font-black">
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copied ? 'Kopyalandı' : 'Linki kopyala'}
                  </button>
                  <button type="button" onClick={() => { void share(); }}
                    className="flex items-center justify-center gap-2 rounded-2xl border border-white/25 bg-white/10 px-3 py-3 text-sm font-black">
                    <Send className="h-4 w-4" /> Diğer uygulamalar
                  </button>
                </div>
                <div className="mt-4 flex items-center justify-center gap-2 text-sm text-blue-200"><Copy className="h-4 w-4" /> Kod: <span className="font-mono font-bold tracking-widest text-white">{room.code}</span></div>
                <p className="mt-3 text-xs leading-5 text-blue-200/75">Uygulama yüklüyse Universal Link / App Link kurulumundan sonra doğrudan VS açılır. Yüklü değilse davet sayfasından tarayıcıyla katılabilir.</p>
              </section>
            ) : finishedMine ? (
              <section className="rounded-[28px] border border-amber-300/25 bg-[#142748] p-7 text-center">
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-amber-300/10"><Trophy className="h-9 w-9 text-amber-300" /></div>
                <h2 className="mt-4 text-2xl font-black">{finishedBoth ? (draw ? 'Berabere!' : winning ? 'Kazandın! 🏆' : 'Bu kez rakibin kazandı') : 'Soruları bitirdin!'}</h2>
                <p className="mt-2 text-sm leading-6 text-blue-200">{finishedBoth ? `Skor: ${room.myScore} - ${room.otherScore}` : `Rakibin ${room.otherCount}/10 soruda. Sonuç için bekleniyor.`}</p>
                {!finishedBoth && <Loader2 className="mx-auto mt-5 h-5 w-5 animate-spin text-cyan-300" />}
                {finishedBoth && <div className="mt-5 flex items-center justify-center gap-2 text-sm font-semibold text-amber-200"><Crown className="h-5 w-5" /> Dostça rekabetin kazananı belli!</div>}
                <button type="button" onClick={leave} className="mt-6 w-full rounded-xl bg-white/10 px-4 py-3 font-bold">Ana menüye dön</button>
              </section>
            ) : question ? (
              <section className="rounded-[28px] border border-white/15 bg-[#142748] p-5 sm:p-7">
                <div className="flex items-center justify-between gap-3 text-xs font-black text-cyan-200"><span>{question.topic}</span><span>SORU {currentIndex + 1}/10</span></div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-purple-400 transition-all" style={{ width: `${currentIndex * 10}%` }} /></div>
                <h2 className="my-6 text-xl font-black leading-relaxed sm:text-2xl">{question.question}</h2>
                <div className="space-y-3">
                  {question.choices.map((option, index) => (
                    <button key={index} type="button" disabled={sending || showFeedback}
                      onClick={() => setChoice(index)}
                      className={`flex w-full items-center gap-3 rounded-2xl border p-3.5 text-left text-sm font-bold transition sm:text-base ${choice === index ? 'border-cyan-200 bg-cyan-200/20' : 'border-white/15 bg-white/5 hover:border-white/35'}`}>
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/10">{'ABCD'[index]}</span><span>{option}</span>
                    </button>
                  ))}
                </div>
                <button type="button" disabled={choice === null || sending} onClick={() => { void submit(); }}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#ffb17d] to-[#ff7e92] p-4 font-black text-[#15223d] disabled:opacity-40">
                  {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />} Cevapla
                </button>
              </section>
            ) : null}

            {showFeedback && previousAnswer && !finishedMine && (
              <div className="fixed inset-x-4 bottom-5 z-10 mx-auto max-w-lg rounded-2xl border border-white/20 bg-[#0e2744] p-4 shadow-2xl">
                <div className="flex items-center gap-2 font-black">{previousAnswer.correct ? <CheckCircle2 className="text-emerald-300" /> : <XCircle className="text-rose-300" />}{previousAnswer.correct ? 'Doğru! +100 puan' : 'Yanlış cevap'}</div>
                <p className="mt-1 text-xs text-blue-200">Doğru cevap: {room.questions[currentIndex - 1]?.choices[previousAnswer.correctIndex]}</p>
                <button type="button" onClick={() => { setAnswerInfoOpen(true);setAnswerInfoRead(true); }} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-cyan-300/35 bg-cyan-300/10 p-3 text-sm font-black text-cyan-100" aria-haspopup="dialog"><span className="text-lg">ⓘ</span> Doğru cevap hakkında bilgi</button>
                <p className="mt-2 text-center text-[11px] text-blue-200/70">Sıradaki soru otomatik açılacak.</p>
              </div>
            )}
          </>
        )}

        {showFeedback&&answerInfoOpen&&previousQuestion&&(
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#051228]/90 p-4 backdrop-blur-sm" onClick={()=>setAnswerInfoOpen(false)} role="presentation">
            <section onClick={event=>event.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="vsFactTitle" className="w-full max-w-md rounded-[23px] border border-cyan-200/35 bg-gradient-to-b from-[#1e3d53] to-[#0b213c] p-5 shadow-2xl">
              <div className="mb-3 flex items-center justify-between gap-3 text-xs font-black tracking-wider text-cyan-200"><span>✦ GLOBRIVA · BİLGİ KARTI</span><button type="button" autoFocus aria-label="Kapat" className="grid h-10 w-10 place-items-center rounded-full border border-white/20 bg-white/10 text-xl" onClick={()=>setAnswerInfoOpen(false)}>×</button></div>
              <h3 id="vsFactTitle" className="text-xl font-black">{correctLabel}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-200">{previousQuestion.question}</p>
              {countryInfo?<p className="mt-3 rounded-xl border border-amber-200/20 bg-amber-200/5 p-3 text-sm text-amber-100">Bu ülkenin başkenti: <strong>{countryInfo.capitalTr}</strong>.</p>:<p className="mt-3 rounded-xl bg-white/5 p-3 text-sm text-slate-100"><span className="font-bold text-amber-200">Konu: </span>{previousQuestion.topic}</p>}
              <p className="mt-4 text-xs text-blue-100/65">Kapatınca oyun otomatik devam eder.</p>
            </section>
          </div>
        )}
        {error && (
          <div role="alert" className="mt-4 rounded-2xl border border-rose-300/40 bg-rose-400/10 p-4 text-sm leading-6 text-rose-100">
            {error}
            {roomCode && <button type="button" onClick={() => { void refresh(roomCode); }} className="mt-2 flex items-center gap-2 font-bold"><RefreshCcw className="h-4 w-4" />Yeniden dene</button>}
          </div>
        )}
      </main>
    </div>
  );
}
