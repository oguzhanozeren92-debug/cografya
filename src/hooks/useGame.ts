import { useCallback, useEffect, useRef, useState } from 'react';
import type { GameMode, GamePhase, QuestionType, RoundResult, LeaderboardEntry } from '@/types';
import { COUNTRY_DATA, COUNTRIES_BY_DIFFICULTY, VALID_COUNTRY_IDS } from '@/data/countries';
import { fetchLeaderboard, saveGlobalScore } from '@/lib/leaderboard';
import { submitWeeklyScore } from '@/lib/weeklyLeaderboard';
import { discoverCountry } from '@/lib/discovery';

export const MAX_LIVES = 3;
export const MAX_REWARDED_HEARTS_PER_RUN = 1;
const BASE_POINTS = 100;
const STREAK_BONUS = 50;

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Guaranteed difficulty progression: first 5 easy, 6–12 medium, 13+ hard. */
export function getRoundDifficulty(round: number): 1 | 2 | 3 {
  return round <= 5 ? 1 : round <= 12 ? 2 : 3;
}

function pickCountryId(round: number, recentIds: string[]): string {
  const tier = getRoundDifficulty(round);
  const pool = COUNTRIES_BY_DIFFICULTY[tier];
  const available = pool.filter(id => !recentIds.includes(id));
  const selection = available.length > 0 ? available : pool;
  return selection[Math.floor(Math.random() * selection.length)];
}

function generateOptions(countryId: string, questionType: QuestionType, round: number): string[] {
  const label = (id: string) => questionType === 'capital' ? COUNTRY_DATA[id].capitalTr : COUNTRY_DATA[id].nameTr;
  const answer = label(countryId);
  const difficulty = getRoundDifficulty(round);
  // Harder questions also have increasingly unfamiliar distractors.
  const sameTier = shuffle(COUNTRIES_BY_DIFFICULTY[difficulty].filter(id => id !== countryId));
  const other = shuffle(VALID_COUNTRY_IDS.filter(id => id !== countryId && COUNTRY_DATA[id].difficulty !== difficulty));
  const choices = new Set<string>();
  for (const id of [...sameTier, ...other]) {
    const candidate = label(id);
    if (candidate !== answer) choices.add(candidate);
    if (choices.size === 3) break;
  }
  return shuffle([answer, ...choices]);
}

export function useGame() {
  const [mode, setMode] = useState<GameMode>('mixed');
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
  const [leaderboardError, setLeaderboardError] = useState('');
  const [rewardedHeartsUsed, setRewardedHeartsUsed] = useState(0);
  const rewardedUsedRef = useRef(false);
  const gameRunRef = useRef(0);
  const recentIdsRef = useRef<string[]>([]);

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

  const startRound = useCallback((roundNum: number, gameMode: GameMode) => {
    const countryId = pickCountryId(roundNum, recentIdsRef.current);
    recentIdsRef.current = [countryId, ...recentIdsRef.current].slice(0, 8);
    // The mixed mode gradually introduces capitals and flags without changing its league.
    const roll = Math.random();
    const questionType: QuestionType = gameMode === 'flags' ? 'flag'
      : roundNum >= 4 && roll < 0.35 ? 'capital'
      : roundNum >= 6 && roll < 0.62 ? 'flag'
      : 'country';
    const options = generateOptions(countryId, questionType, roundNum);
    const meta = COUNTRY_DATA[countryId];
    const answer = questionType === 'capital' ? meta.capitalTr : meta.nameTr;
    setCurrentCountryId(countryId);
    setCurrentQuestionType(questionType);
    setCurrentOptions(options);
    setCurrentAnswer(answer);
    setSelectedAnswer(null);
    // Flag questions show the banner immediately. Geography questions retain the spinning globe.
    setPhase(questionType === 'flag' ? 'question' : 'spinning');
  }, []);

  const start = useCallback((gameMode: GameMode = 'mixed') => {
    gameRunRef.current += 1;
    rewardedUsedRef.current = false;
    setRewardedHeartsUsed(0);
    setMode(gameMode);
    setScore(0);
    setLives(MAX_LIVES);
    setStreak(0);
    setRound(1);
    setRoundResults([]);
    recentIdsRef.current = [];
    startRound(1, gameMode);
  }, [startRound]);

  const onSpinEnd = useCallback(() => {
    setPhase(current => current === 'spinning' ? 'question' : current);
  }, []);

  const onAnswer = useCallback((answer: string) => {
    if (phase !== 'question') return;
    setSelectedAnswer(answer);
    const isCorrect = answer === currentAnswer;
    const meta = currentCountryId ? COUNTRY_DATA[currentCountryId] : null;
    if (isCorrect) {
      if (currentCountryId) discoverCountry(currentCountryId);
      const points = BASE_POINTS * (meta?.difficulty ?? 1) + STREAK_BONUS * streak;
      setScore(value => value + points);
      setStreak(value => value + 1);
    } else {
      setLives(value => value - 1);
      setStreak(0);
    }
    if (meta && currentCountryId) {
      setRoundResults(previous => [...previous, {
        countryId: currentCountryId,
        countryName: meta.nameTr,
        questionType: currentQuestionType,
        correctAnswer: currentAnswer,
        selectedAnswer: answer,
        isCorrect,
      }]);
    }
    setPhase('feedback');
  }, [phase, currentAnswer, currentCountryId, currentQuestionType, streak]);

  const onContinue = useCallback(() => {
    if (lives <= 0) { setPhase(rewardedUsedRef.current ? 'gameover' : 'revive'); return; }
    const nextRound = round + 1;
    setRound(nextRound);
    startRound(nextRound, mode);
  }, [lives, round, mode, startRound]);

  useEffect(() => {
    if (phase !== 'feedback') return;
    const timeout = window.setTimeout(onContinue, 1250);
    return () => window.clearTimeout(timeout);
  }, [phase, onContinue]);

  // This function is called only after the native rewarded SDK has confirmed the reward.
  // The run token and a synchronous ref prevent delayed/double reward callbacks from
  // giving extra lives after a restart or multiple taps.
  const grantRewardedHeart = useCallback((expectedRun: number): boolean => {
    if (expectedRun !== gameRunRef.current || rewardedUsedRef.current ||
      (phase !== 'revive' && phase !== 'question')) return false;
    rewardedUsedRef.current = true;
    setRewardedHeartsUsed(1);
    setLives(value => Math.min(MAX_LIVES, value + 1));
    if (phase === 'revive') {
      const nextRound = round + 1;
      setRound(nextRound);
      startRound(nextRound, mode);
    }
    return true;
  }, [phase, mode, round, startRound]);

  const abandonRun = useCallback(() => {
    setPhase(current => current === 'revive' ? 'gameover' : current);
  }, []);

  const restart = useCallback(() => {
    void refreshLeaderboard();
    gameRunRef.current += 1;
    setPhase('idle');
  }, [refreshLeaderboard]);

  const saveScore = useCallback(async (name: string) => {
    const correct = roundResults.filter(result => result.isCorrect).length;
    // The legacy lifetime table is only for the established mixed game.
    if (mode === 'mixed') await saveGlobalScore(name, score, correct, roundResults.length);
    await submitWeeklyScore(name, score, correct, roundResults.length, mode);
    await refreshLeaderboard();
  }, [mode, score, roundResults, refreshLeaderboard]);

  return {
    mode, phase, score, lives, streak, round, currentCountryId, currentQuestionType,
    rewardedHeartsUsed, gameRunId: gameRunRef.current, grantRewardedHeart, abandonRun,
    currentOptions, currentAnswer, selectedAnswer, roundResults, leaderboard,
    leaderboardError, refreshLeaderboard,
    correctCount: roundResults.filter(r => r.isCorrect).length,
    start, onSpinEnd, onAnswer, onContinue, restart, saveScore,
  };
}