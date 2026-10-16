import { useCallback, useEffect, useRef, useState } from 'react';
import type { GamePhase, QuestionType, RoundResult, LeaderboardEntry } from '@/types';
import { COUNTRY_DATA, COUNTRIES_BY_DIFFICULTY, VALID_COUNTRY_IDS } from '@/data/countries';
import { fetchLeaderboard, saveGlobalScore } from '@/lib/leaderboard';

const MAX_LIVES = 3;
const BASE_POINTS = 100;
const STREAK_BONUS = 50;

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getAvailableDifficulties(round: number): (1 | 2 | 3)[] {
  if (round <= 5) return [1];
  if (round <= 12) return [1, 2];
  return [1, 2, 3];
}

function pickCountryId(round: number, recentIds: string[]): string {
  const difficulties = getAvailableDifficulties(round);
  const pool: string[] = [];
  for (const d of difficulties) {
    pool.push(...COUNTRIES_BY_DIFFICULTY[d]);
  }
  const available = pool.filter((id) => !recentIds.includes(id));
  return pickRandom(available.length > 0 ? available : pool);
}

function generateOptions(
  countryId: string,
  questionType: QuestionType,
  round: number,
): string[] {
  const meta = COUNTRY_DATA[countryId];
  const correct = questionType === 'country' ? meta.nameTr : meta.capitalTr;

  const difficulties = getAvailableDifficulties(round);
  const pool: string[] = [];
  for (const d of difficulties) {
    for (const id of COUNTRIES_BY_DIFFICULTY[d]) {
      if (id === countryId) continue;
      const m = COUNTRY_DATA[id];
      const val = questionType === 'country' ? m.nameTr : m.capitalTr;
      if (val !== correct) pool.push(val);
    }
  }

  const wrongAnswers = shuffle(pool).slice(0, 3);

  if (wrongAnswers.length < 3) {
    const allVals = VALID_COUNTRY_IDS
      .filter((id) => id !== countryId)
      .map((id) => questionType === 'country' ? COUNTRY_DATA[id].nameTr : COUNTRY_DATA[id].capitalTr)
      .filter((v) => v !== correct && !wrongAnswers.includes(v));
    while (wrongAnswers.length < 3) {
      const extra = pickRandom(allVals);
      if (extra && !wrongAnswers.includes(extra)) wrongAnswers.push(extra);
    }
  }

  return shuffle([correct, ...wrongAnswers]);
}

export function useGame() {
  const [phase, setPhase] = useState<GamePhase>('idle');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(MAX_LIVES);
  const [streak, setStreak] = useState(0);
  const [round, setRound] = useState(1);
  const [currentCountryId, setCurrentCountryId] = useState<string | null>(null);
  const [currentQuestionType, setCurrentQuestionType] = useState<QuestionType>('country');
  const [currentOptions, setCurrentOptions] = useState<string[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [roundResults, setRoundResults] = useState<RoundResult[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  const recentIdsRef = useRef<string[]>([]);

  const [leaderboardError, setLeaderboardError] = useState('');
  const refreshLeaderboard = useCallback(async () => {
    try {
      const rows = await fetchLeaderboard();
      setLeaderboard(rows);
      setLeaderboardError('');
    } catch {
      setLeaderboardError('Dünya sıralamasına bağlanılamadı.');
    }
  }, []);
  useEffect(() => { void refreshLeaderboard(); }, [refreshLeaderboard]);

  const start = useCallback(() => {
    setScore(0);
    setLives(MAX_LIVES);
    setStreak(0);
    setRound(1);
    setRoundResults([]);
    recentIdsRef.current = [];
    startRound(1);
  }, []);

  const startRound = useCallback((roundNum: number) => {
    const countryId = pickCountryId(roundNum, recentIdsRef.current);
    recentIdsRef.current = [countryId, ...recentIdsRef.current].slice(0, 8);

    const questionType: QuestionType = roundNum >= 4 && Math.random() < 0.4 ? 'capital' : 'country';
    const options = generateOptions(countryId, questionType, roundNum);
    const meta = COUNTRY_DATA[countryId];
    const answer = questionType === 'country' ? meta.nameTr : meta.capitalTr;

    setCurrentCountryId(countryId);
    setCurrentQuestionType(questionType);
    setCurrentOptions(options);
    setCurrentAnswer(answer);
    setSelectedAnswer(null);
    setPhase('spinning');
  }, []);

  const onSpinEnd = useCallback(() => {
    setPhase('question');
  }, []);

  const onAnswer = useCallback(
    (answer: string) => {
      if (phase !== 'question') return;
      setSelectedAnswer(answer);
      const isCorrect = answer === currentAnswer;
      const meta = currentCountryId ? COUNTRY_DATA[currentCountryId] : null;

      if (isCorrect) {
        const difficulty = meta ? meta.difficulty : 1;
        const points = BASE_POINTS * difficulty + STREAK_BONUS * streak;
        setScore((s) => s + points);
        setStreak((s) => s + 1);
      } else {
        setLives((l) => l - 1);
        setStreak(0);
      }

      if (meta && currentCountryId) {
        setRoundResults((prev) => [
          ...prev,
          {
            countryId: currentCountryId,
            countryName: meta.nameTr,
            questionType: currentQuestionType,
            correctAnswer: currentAnswer,
            selectedAnswer: answer,
            isCorrect,
          },
        ]);
      }

      setPhase('feedback');
    },
    [phase, currentAnswer, currentCountryId, currentQuestionType, streak],
  );

  const onContinue = useCallback(() => {
    if (lives <= 0) {
      setPhase('gameover');
      return;
    }
    const nextRound = round + 1;
    setRound(nextRound);
    startRound(nextRound);
  }, [lives, round, startRound]);

  // Cevap seçildiği an sonuç gösterilir; kısa bir süre sonra otomatik ilerler.
  useEffect(() => {
    if (phase !== 'feedback') return;
    const timeout = window.setTimeout(() => {
      onContinue();
    }, 1250);
    return () => window.clearTimeout(timeout);
  }, [phase, onContinue]);

  const restart = useCallback(() => {
    void refreshLeaderboard();
    setPhase('idle');
  }, [refreshLeaderboard]);

  const saveScore = useCallback(async (name: string) => {
    await saveGlobalScore(name, score, roundResults.filter((r) => r.isCorrect).length, roundResults.length);
    await refreshLeaderboard();
  }, [score, roundResults, refreshLeaderboard]);

  const correctCount = roundResults.filter((r) => r.isCorrect).length;

  return {
    phase,
    score,
    lives,
    streak,
    round,
    currentCountryId,
    currentQuestionType,
    currentOptions,
    currentAnswer,
    selectedAnswer,
    roundResults,
    leaderboard,
    leaderboardError,
    refreshLeaderboard,
    correctCount,
    start,
    onSpinEnd,
    onAnswer,
    onContinue,
    restart,
    saveScore,
  };
}
