import { useGame } from '@/hooks/useGame';
import { Stars } from '@/components/Stars';
import { Globe } from '@/components/Globe';
import { StartScreen } from '@/components/StartScreen';
import { StreetDetectiveScreen } from '@/components/StreetDetectiveScreen';
import { DroneDetectiveScreen } from '@/components/DroneDetectiveScreen';
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

function App() {
  const game = useGame();
  const [playerName, setPlayerName] = useState(getSavedName);
  const [weeklyOpen, setWeeklyOpen] = useState(false);
  const [dailyOpen, setDailyOpen] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);
  const [streetOpen, setStreetOpen] = useState<'play'|'ranking'|null>(null);
  const [droneOpen, setDroneOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [adBusy, setAdBusy] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(isSoundEnabled);
  const [adError, setAdError] = useState('');
  const adLockRef = useRef(false);
  const lastCountedGameRun = useRef(-1);
  const [rewardedAvailable, setRewardedAvailable] = useState(isRewardedHeartAvailable);
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
  const startGame = (mode: GameMode) => { playGameSound('select'); setAdError(''); game.start(mode); };
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
            adBusy={adBusy} compact={game.currentQuestionType === 'clue'} onWatchHeart={() => { void watchForHeart(); }} />
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
            />
          </div>
        )}
      </div>

      {showStart && (
        <StartScreen soundEnabled={soundEnabled} onToggleSound={toggleSound} onAdPrivacy={() => { void showAdPrivacy(); }} onStart={startGame} onViewWeekly={openWeekly} onDaily={() => setDailyOpen(true)} onExplore={() => setExploreOpen(true)} leaderboard={game.leaderboard} playerName={playerName} onNameChange={updateName} leaderboardError={game.leaderboardError} onNotifications={() => setNotificationsOpen(true)} onStreet={() => setStreetOpen('play')} onStreetLeaderboard={() => setStreetOpen('ranking')} onDrone={() => setDroneOpen(true)} />
      )}

      {showStart && streetOpen && (
        <StreetDetectiveScreen key={streetOpen} playerName={playerName} onGameComplete={onGameFinished}
          initialView={streetOpen==='ranking'?'ranking':'play'}
          onClose={() => setStreetOpen(null)} />
      )}

      {showStart && droneOpen && (
        <DroneDetectiveScreen playerName={playerName} onClose={() => setDroneOpen(false)} onGameComplete={onGameFinished} />
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
    </div>
  );
}

export default App;