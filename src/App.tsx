
import { useGame } from '@/hooks/useGame';
import { Stars } from '@/components/Stars';
import { Globe } from '@/components/Globe';
import { StartScreen } from '@/components/StartScreen';
import { GlobrivaAwardsScreen, GlobrivaBottomNav, GlobrivaProfileScreen, type GlobrivaHomeTab } from '@/components/GlobrivaRewardsUI';
import { awardGeoStars, type GeoBadge, type GeoRewardLevel } from '@/lib/geoRewards';
import { useLanguage } from '@/lib/i18n';
import { GlobrivaVersusScreen } from '@/components/GlobrivaVersusScreen';
import { inviteCodeFromUrl, inviteCodeFromAnyUrl } from '@/lib/versus';
import { App as NativeApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { StreetDetectiveScreen } from '@/components/StreetDetectiveScreen';
import { Heritage360LocationScreen } from '@/components/Heritage360LocationScreen';
import { HistoryDetectiveScreen } from '@/components/HistoryDetectiveScreen';
import { GeoDiscoveryScreen, type GeoDiscoveryMode } from '@/components/GeoDiscoveryScreen';
import { HUD } from '@/components/HUD';
import { QuestionPanel } from '@/components/QuestionPanel';
import { GameOverScreen } from '@/components/GameOverScreen';
import { WeeklyLeaderboardScreen } from '@/components/WeeklyLeaderboardScreen';
import { DailyChallengeScreen } from '@/components/DailyChallengeScreen';
import { ExploreMapScreen } from '@/components/ExploreMapScreen';
import { ReviveScreen } from '@/components/ReviveScreen';
import { NotificationSettings } from '@/components/NotificationSettings';
import { initIosPush, isIosPushSupported, type PushTarget } from '@/lib/iosPush';
import { isRewardedHeartAvailable, initializeRewardedAds, openAdPrivacyOptions, watchRewardedHeartAd } from '@/lib/rewardedAds';
import { onGameFinished, preloadGameBreakAd } from '@/lib/adPlacements';
import { syncDiscoveries } from '@/lib/discovery';
import { celebrateGame, isSoundEnabled, playGameSound, saveSoundEnabled } from '@/lib/gameFx';
import { useEffect, useRef, useState } from 'react';
import type { GameMode } from '@/types';
import { backend, getSavedName, changePlayerName, getPlayerId, setSavedName } from '@/lib/leaderboard';
import { nicknameError } from '@/lib/playerSafety';

function App() {
  const game = useGame();
  const { language, t } = useLanguage();
  const [playerName, setPlayerName] = useState(getSavedName);
  const [homeTab, setHomeTab] = useState<GlobrivaHomeTab>('home');
  const [exitConfirmOpen, setExitConfirmOpen] = useState(false);
  const [rewardToast, setRewardToast] = useState<{ gained:number; stars:number; level:GeoRewardLevel; badges:GeoBadge[] }|null>(null);
  const [weeklyOpen, setWeeklyOpen] = useState(false);
  const [activeInviteCode, setActiveInviteCode] = useState(inviteCodeFromUrl);
  const [versusOpen, setVersusOpen] = useState(() => Boolean(inviteCodeFromUrl()));
  const [dailyOpen, setDailyOpen] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);
  const [streetOpen, setStreetOpen] = useState<'play'|'ranking'|null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [heritage360Open, setHeritage360Open] = useState(false);
  const [geoDiscoveryOpen, setGeoDiscoveryOpen] = useState<GeoDiscoveryMode|null>(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [adBusy, setAdBusy] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(isSoundEnabled);
  const [adError, setAdError] = useState('');
  const adLockRef = useRef(false);
  const lastCountedGameRun = useRef(-1);
  const [rewardedAvailable, setRewardedAvailable] = useState(isRewardedHeartAvailable);
  // Universal Link / App Link: cold launch and already-running app.
  // A domain association + new native build are required for OS routing.
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    let active = true;
    let dispose: (() => Promise<void>) | undefined;
    const handleInvite = (url: string) => {
      const code = inviteCodeFromAnyUrl(url);
      if (!active || !code) return;
      setActiveInviteCode(code);
      setVersusOpen(true);
      setWeeklyOpen(false);
      setDailyOpen(false);
      setExploreOpen(false);
      setHistoryOpen(false);
      setHeritage360Open(false);
      setGeoDiscoveryOpen(null);
      setStreetOpen(null);
    };
    void NativeApp.addListener('appUrlOpen', ({ url }) => handleInvite(url))
      .then(handle => {
        if (!active) void handle.remove();
        else dispose = () => handle.remove();
      })
      .catch(error => console.warn('VS deep link listener:', error));
    void NativeApp.getLaunchUrl()
      .then(result => { if (result?.url) handleInvite(result.url); })
      .catch(error => console.warn('VS launch link:', error));
    return () => { active = false; void dispose?.(); };
  }, []);

  useEffect(() => {
    let mounted = true;
    void initializeRewardedAds().then(ready => { if (mounted) setRewardedAvailable(ready); });
    return () => { mounted = false; };
  }, []);
  const showAdPrivacy = async () => {
    try {
      await openAdPrivacyOptions();
      setRewardedAvailable(await initializeRewardedAds());
    } catch {
      setAdError('Reklam gizlilik tercihleri açılamadı.');
    }
  };
  const watchForHeart = async () => {
    if (adLockRef.current || !rewardedAvailable || game.rewardedHeartsUsed > 0 ||
      (game.phase !== 'question' && game.phase !== 'revive')) return;
    adLockRef.current = true;
    setAdBusy(true);
    setAdError('');
    const runId = game.gameRunId;
    try {
      const earned = await watchRewardedHeartAd();
      if (earned) {
        if (!game.grantRewardedHeart(runId)) setAdError('Bu oyun için can hakkı zaten kullanılmış.');
      } else {
        setAdError('Reklam tamamlanmadı veya şu an gösterilemedi. Can yüklenmedi.');
      }
    } catch {
      setAdError('Reklam şu anda kullanılamıyor.');
    } finally {
      adLockRef.current = false;
      setAdBusy(false);
    }
  };
  useEffect(() => { void syncDiscoveries(); }, []);
  // Warm only a configured native interstitial. Never delay game navigation for ads.
  useEffect(() => { void preloadGameBreakAd(); }, []);
  const [weeklyMode, setWeeklyMode] = useState<GameMode>('mixed');
  useEffect(() => {
    if (!isIosPushSupported()) return;
    let active = true;
    let dispose: (() => void) | undefined;
    const navigate = (target: PushTarget) => {
      if (!active) return;
      if (target === 'daily') { setWeeklyOpen(false); setExploreOpen(false); setDailyOpen(true); }
      if (target === 'weekly') { setDailyOpen(false); setExploreOpen(false); setWeeklyMode('mixed'); setWeeklyOpen(true); }
    };
    void initIosPush(navigate).then(fn => {
      if (active) dispose = fn;
      else fn();
    }).catch(error => console.warn('Atlas push initialization:', error));
    return () => { active = false; dispose?.(); };
  }, []);
  const startGame = (mode: GameMode) => { setExitConfirmOpen(false); setHomeTab('home'); setRewardToast(null); playGameSound('select'); setAdError(''); game.start(mode); };
  const toggleSound = () => {
    const next = !soundEnabled;
    saveSoundEnabled(next);
    setSoundEnabled(next);
    if (next) playGameSound('select');
  };
  const handleAnswer = (answer: string) => {
    if (adBusy) return;
    const isCorrect = answer === game.currentAnswer;
    playGameSound(isCorrect ? 'correct' : 'wrong');
    if (isCorrect && (game.streak + 1) % 5 === 0) void celebrateGame('streak');
    game.onAnswer(answer);
  };
  const openWeekly = (mode: GameMode) => { setWeeklyMode(mode); setWeeklyOpen(true); };
  const updateName = async (name: string) => {
    const invalid=nicknameError(name,language);
    if(invalid)throw new Error(invalid);
    const clean = name.trim().slice(0, 20);
    // A nickname should be enough to play on this device even before Supabase is connected.
    setSavedName(clean);
    setPlayerName(clean);
    if (!backend) return;
    try {
      await getPlayerId();
      await changePlayerName(clean);
      await game.refreshLeaderboard();
    } catch { /* Nickname is saved locally; the cloud league may be unavailable. */ }
  };
  const showGlobe = game.phase === 'gameover' || (game.phase !== 'idle' && game.currentQuestionType !== 'flag' && game.currentQuestionType !== 'clue');
  const showHUD = game.phase !== 'idle' && game.phase !== 'gameover';
  const showQuestion = game.phase === 'question' || game.phase === 'feedback';
  const isMapQuestion = game.currentQuestionType !== 'flag' && game.currentQuestionType !== 'clue';
  const expandingMapQuestion = showQuestion && isMapQuestion;
  const showStart = game.phase === 'idle';
  const showGameOver = game.phase === 'gameover';
  // Endless arena modes earn a stage grade only after a complete 10-question block.
  // This does not change existing lives, scores or weekly ranking rules.
  useEffect(() => {
    const n = game.roundResults.length;
    if (!n || n > 30 || n % 10 !== 0) return;
    const level: GeoRewardLevel = n === 10 ? 'easy' : n === 20 ? 'medium' : 'hard';
    const answers = game.roundResults.slice(-10);
    const award = awardGeoStars(game.mode, level, answers.filter(q => q.isCorrect).length, 10, true);
    if (award.gained > 0 || award.newBadges.length) setRewardToast({ gained: award.gained, stars: award.current, level, badges: award.newBadges });
  }, [game.roundResults, game.mode]);
  useEffect(() => {
    if (!rewardToast) return;
    const timeout = window.setTimeout(() => setRewardToast(null), 3400);
    return () => window.clearTimeout(timeout);
  }, [rewardToast]);
  const navVisible = showStart && !weeklyOpen && !dailyOpen && !exploreOpen && !streetOpen &&
    !historyOpen && !heritage360Open && !geoDiscoveryOpen && !notificationsOpen && !versusOpen;
  useEffect(() => {
    if (game.phase !== 'gameover' || game.gameRunId === 0 ||
        lastCountedGameRun.current === game.gameRunId) return;
    lastCountedGameRun.current = game.gameRunId;
    onGameFinished();
  }, [game.phase,game.gameRunId]);

  return (
    <div className="globriva-app-root relative min-h-[100dvh] w-full min-w-0 overflow-x-hidden bg-space-900">
      <Stars />

      <div className={showGlobe && game.phase !== 'gameover' ? "globriva-game-shell relative z-10 flex h-[100dvh] min-h-0 flex-col" : "relative z-10 flex min-h-screen flex-col"}>
        {showHUD && (
          <HUD score={game.score} lives={game.lives} streak={game.streak} round={game.round}
            canEarnHeart={rewardedAvailable && !adBusy && game.phase === 'question' && game.lives < 3 && game.rewardedHeartsUsed === 0}
            adBusy={adBusy} compact={game.currentQuestionType === 'clue'} onWatchHeart={() => { void watchForHeart(); }}
            onExit={() => setExitConfirmOpen(true)} />
        )}

        {showGlobe && (
          <div className={'atlas-geo-flow ' + (expandingMapQuestion ? 'atlas-geo-flow-quiz' : '')}>
            <div className="atlas-geo-world-stage">
              <div className="atlas-geo-world-frame">
                <Globe
                  targetId={game.currentCountryId}
                  phase={game.phase}
                  onSpinEnd={game.onSpinEnd}
                />
              </div>
              {game.phase === 'locking' && (
                <div className="atlas-geo-lock-notice pointer-events-none" role="status">
                  <span className="atlas-geo-lock-dot" />
                  HEDEF BULUNDU
                  <span className="atlas-geo-lock-underline" />
                </div>
              )}
            </div>
            {expandingMapQuestion && (
              <div className="atlas-geo-questions">
                <QuestionPanel
                  countryId={game.currentCountryId}
                  round={game.round}
                  revealedClues={game.revealedClues}
                  onRevealClue={game.revealNextClue}
                  questionType={game.currentQuestionType}
                  options={game.currentOptions}
                  selectedAnswer={game.selectedAnswer}
                  correctAnswer={game.currentAnswer}
                  phase={game.phase}
                  onAnswer={handleAnswer}
                  answerInfoOpen={game.answerInfoOpen}
                  onAnswerInfoOpenChange={game.onAnswerInfoOpenChange}
                />
              </div>
            )}
          </div>
        )}

        {showQuestion && !isMapQuestion && (
          <div className={'game-question-scroll flex min-h-0 min-w-0 flex-1 justify-center overflow-x-hidden overflow-y-auto overscroll-contain ' + (game.currentQuestionType === 'clue' ? 'pt-1' : 'pt-3')}>
            <QuestionPanel
              countryId={game.currentCountryId}
              round={game.round}
              revealedClues={game.revealedClues}
              onRevealClue={game.revealNextClue}
              questionType={game.currentQuestionType}
              options={game.currentOptions}
              selectedAnswer={game.selectedAnswer}
              correctAnswer={game.currentAnswer}
              phase={game.phase}
              onAnswer={handleAnswer}
              answerInfoOpen={game.answerInfoOpen}
              onAnswerInfoOpenChange={game.onAnswerInfoOpenChange}
            />
          </div>
        )}
      </div>

      {exitConfirmOpen && showHUD && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-[#030817]/85 p-5 backdrop-blur-md"
          role="presentation" onClick={() => setExitConfirmOpen(false)}>
          <section role="dialog" aria-modal="true" aria-labelledby="globriva-exit-title"
            className="w-full max-w-sm rounded-[24px] border border-amber-200/30 bg-gradient-to-b from-[#1b2946] to-[#0b1229] p-6 text-center text-white shadow-[0_20px_70px_rgba(0,0,0,.7)]"
            onClick={event => event.stopPropagation()}>
            <h2 id="globriva-exit-title" className="text-xl font-black">{t('Oyundan çıkılsın mı?')}</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">{t('Bu turdaki ilerlemen kaybolacak.')}</p>
            <div className="mt-6 grid grid-cols-1 gap-2.5">
              <button type="button" autoFocus onClick={() => setExitConfirmOpen(false)}
                className="min-h-12 rounded-xl bg-amber-400 px-4 py-3 font-extrabold text-slate-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
                {t('Oyuna devam et')}
              </button>
              <button type="button" onClick={() => { game.quit(); setExitConfirmOpen(false); setRewardToast(null); setHomeTab('home'); }}
                className="min-h-12 rounded-xl border border-white/20 bg-white/5 px-4 py-3 font-bold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
                {t('Ana menüye dön')}
              </button>
            </div>
          </section>
        </div>
      )}

      {showStart && homeTab === 'home' && (
        <StartScreen soundEnabled={soundEnabled} onToggleSound={toggleSound} onAdPrivacy={() => { void showAdPrivacy(); }} onStart={startGame} onViewWeekly={openWeekly} onDaily={() => setDailyOpen(true)} onExplore={() => setExploreOpen(true)} leaderboard={game.leaderboard} playerName={playerName} onNameChange={updateName} leaderboardError={game.leaderboardError} onNotifications={() => setNotificationsOpen(true)} onStreet={() => setStreetOpen('play')} onStreetLeaderboard={() => setStreetOpen('ranking')} onHistory={() => setHistoryOpen(true)} onHeritage360={() => setHeritage360Open(true)} onGeoDiscovery={mode => setGeoDiscoveryOpen(mode)} onVersus={() => setVersusOpen(true)} />
      )}

      {showStart && homeTab === 'awards' && <GlobrivaAwardsScreen />}
      {showStart && homeTab === 'profile' && (
        <GlobrivaProfileScreen playerName={playerName} onNameChange={updateName}
          soundEnabled={soundEnabled} onToggleSound={toggleSound}
          onNotifications={isIosPushSupported()?()=>setNotificationsOpen(true):undefined}
          onAdPrivacy={Capacitor.isNativePlatform()?()=>{ void showAdPrivacy(); }:undefined} />
      )}

      {versusOpen && (
        <GlobrivaVersusScreen key={activeInviteCode || 'manual'} initialInviteCode={activeInviteCode}
          playerName={playerName} onNameChange={updateName}
          onClose={() => { setVersusOpen(false); setActiveInviteCode(''); }} />
      )}

      {showStart && streetOpen && (
        <StreetDetectiveScreen key={streetOpen} playerName={playerName} onGameComplete={onGameFinished}
          initialView={streetOpen==='ranking'?'ranking':'play'}
          onClose={() => setStreetOpen(null)} />
      )}

      {showStart && heritage360Open && (
        <Heritage360LocationScreen onClose={() => setHeritage360Open(false)} onGameComplete={onGameFinished} />
      )}

      {showStart && historyOpen && (
        <HistoryDetectiveScreen onClose={() => setHistoryOpen(false)}
          onGameComplete={onGameFinished} />
      )}

      {showStart && geoDiscoveryOpen && (
        <GeoDiscoveryScreen key={geoDiscoveryOpen} mode={geoDiscoveryOpen}
          onClose={() => setGeoDiscoveryOpen(null)} onGameComplete={onGameFinished} />
      )}

      {showStart && notificationsOpen && isIosPushSupported() && (
        <NotificationSettings onClose={() => setNotificationsOpen(false)} />
      )}

      {game.phase === 'revive' && (
        <ReviveScreen mode={game.mode} score={game.score} round={game.round}
          available={rewardedAvailable} busy={adBusy} error={adError}
          onWatchAd={() => { void watchForHeart(); }}
          onGiveUp={game.abandonRun} />
      )}

      {showGameOver && (
        <GameOverScreen
          score={game.score}
          correctAnswers={game.correctCount}
          totalQuestions={game.roundResults.length}
          leaderboard={game.leaderboard}
          mode={game.mode}
          onSave={() => game.saveScore(playerName)}
          playerName={playerName}
          onRestart={game.restart}
          onViewWeekly={openWeekly}
          onExplore={() => setExploreOpen(true)}
        />
      )}

      {dailyOpen && (
        <DailyChallengeScreen onClose={() => setDailyOpen(false)} onGameComplete={onGameFinished} onExplore={() => { setDailyOpen(false); setExploreOpen(true); }} />
      )}

      {exploreOpen && (
        <ExploreMapScreen onClose={() => setExploreOpen(false)} onDaily={() => { setExploreOpen(false); setDailyOpen(true); }} />
      )}

      {weeklyOpen && (
        <WeeklyLeaderboardScreen initialMode={weeklyMode} playerName={playerName} onClose={() => setWeeklyOpen(false)} onPlay={(mode) => { setWeeklyOpen(false); startGame(mode); }} />
      )}

      {rewardToast && !showStart && (
        <div className="geo-reward-toast fixed left-1/2 top-[calc(78px+env(safe-area-inset-top))] z-[90] w-[min(92vw,380px)] -translate-x-1/2 rounded-2xl border border-amber-300/50 bg-[#123d55]/95 px-4 py-3 text-center text-sm font-black text-amber-100 shadow-2xl backdrop-blur-xl" role="status">
          <div className="text-2xl tracking-[.20em] text-amber-300" aria-hidden="true">{'★'.repeat(rewardToast.stars)}{'☆'.repeat(3-rewardToast.stars)}</div>
          {rewardToast.gained>0 && <span>+{rewardToast.gained} {language==='tr'?'yeni keşif yıldızı!':'new explorer stars!'} · {rewardToast.level==='easy'?(language==='tr'?'İlk Rota':'First Route'):rewardToast.level==='medium'?(language==='tr'?'Kıtalar Arası':'Across Continents'):(language==='tr'?'Dünya Turu':'World Tour')}</span>}
          {rewardToast.badges.map(b=><div key={b.id} className="mt-1 text-xs text-cyan-100">{b.icon} {language==='tr'?'Yeni rozet: ':'New badge: '}{language==='tr'?b.tr:b.en}</div>)}
        </div>
      )}
      {navVisible && (
        <GlobrivaBottomNav active={homeTab} onHome={()=>setHomeTab('home')}
          onExplore={()=>setExploreOpen(true)}
          onPlay={()=>{ if (!playerName.trim()) { setHomeTab('profile'); return; } startGame('mixed'); }}
          onAwards={()=>setHomeTab('awards')} onProfile={()=>setHomeTab('profile')}/>
      )}
    </div>
  );
}

export default App;
