import { useGame } from '@/hooks/useGame';
import { Stars } from '@/components/Stars';
import { Globe } from '@/components/Globe';
import { StartScreen } from '@/components/StartScreen';
import { HUD } from '@/components/HUD';
import { QuestionPanel } from '@/components/QuestionPanel';
import { GameOverScreen } from '@/components/GameOverScreen';
import { WeeklyLeaderboardScreen } from '@/components/WeeklyLeaderboardScreen';
import { useState } from 'react';
import type { GameMode } from '@/types';
import { getSavedName, changePlayerName, getPlayerId, setSavedName } from '@/lib/leaderboard';

function App() {
  const game = useGame();
  const [playerName, setPlayerName] = useState(getSavedName);
  const [weeklyOpen, setWeeklyOpen] = useState(false);
  const [weeklyMode, setWeeklyMode] = useState<GameMode>('mixed');
  const openWeekly = (mode: GameMode) => { setWeeklyMode(mode); setWeeklyOpen(true); };
  const updateName = async (name: string) => {
    await getPlayerId();
    await changePlayerName(name);
    setSavedName(name);
    setPlayerName(name.trim().slice(0, 20));
    await game.refreshLeaderboard();
  };
  const showGlobe = game.phase === 'idle' || game.phase === 'gameover' || game.currentQuestionType !== 'flag';
  const showHUD = game.phase !== 'idle' && game.phase !== 'gameover';
  const showQuestion = game.phase === 'question' || game.phase === 'feedback';
  const showStart = game.phase === 'idle';
  const showGameOver = game.phase === 'gameover';

  return (
    <div className="relative min-h-screen overflow-hidden bg-space-900">
      <Stars />

      <div className="relative z-10 flex min-h-screen flex-col">
        {showHUD && (
          <HUD score={game.score} lives={game.lives} streak={game.streak} round={game.round} />
        )}

        {showGlobe && (
          <div className="flex flex-1 items-center justify-center px-4 py-2">
            <div className="relative aspect-square w-full max-w-[min(70vh,500px)]">
              <Globe
                targetId={game.currentCountryId}
                phase={game.phase}
                onSpinEnd={game.onSpinEnd}
              />
            </div>
          </div>
        )}

        {showQuestion && (
          <div className={game.currentQuestionType === 'flag' ? 'flex flex-1 items-center justify-center pt-8' : ''}><QuestionPanel
            countryId={game.currentCountryId}
            round={game.round}
            questionType={game.currentQuestionType}
            options={game.currentOptions}
            selectedAnswer={game.selectedAnswer}
            correctAnswer={game.currentAnswer}
            phase={game.phase}
            onAnswer={game.onAnswer}
          /></div>
        )}
      </div>

      {showStart && (
        <StartScreen onStart={game.start} onViewWeekly={openWeekly} leaderboard={game.leaderboard} playerName={playerName} onNameChange={updateName} leaderboardError={game.leaderboardError} />
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
        />
      )}

      {weeklyOpen && (
        <WeeklyLeaderboardScreen initialMode={weeklyMode} playerName={playerName} onClose={() => setWeeklyOpen(false)} onPlay={(mode) => { setWeeklyOpen(false); game.start(mode); }} />
      )}
    </div>
  );
}

export default App;
