import { COUNTRIES_BY_DIFFICULTY, COUNTRY_DATA, VALID_COUNTRY_IDS } from '@/data/countries';
import type { QuestionType } from '@/types';
import { backend, getPlayerId } from '@/lib/leaderboard';

const DAILY_KEY = 'geo-daily-challenge-v1';
const STREAK_KEY = 'geo-daily-streak-v1';
export const DAILY_TOTAL = 10;

export interface DailyQuestion {
  countryId: string;
  type: Extract<QuestionType, 'capital' | 'flag'>;
  answer: string;
  options: string[];
  difficulty: 1 | 2 | 3;
}

export interface DailyProgress {
  date: string;
  answers: string[];
  finishedAt?: string;
}

export interface DailyStreak { lastCompletedDate: string; count: number; }

/** Deterministic date: everyone gets the same ten questions for a UTC date. */
export const getDailyDate = () => new Date().toISOString().slice(0, 10);

function hash(text: string): number {
  let n = 2166136261;
  for (let i = 0; i < text.length; i++) { n ^= text.charCodeAt(i); n = Math.imul(n, 16777619); }
  return n >>> 0;
}

function generator(seed: number): () => number {
  let a = seed >>> 0;
  return () => { a += 0x6D2B79F5; let t = a; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}

function seededShuffle<T>(list: T[], random: () => number): T[] {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function getDailyQuestions(day: string): DailyQuestion[] {
  const random = generator(hash('cografya-daily-v1-' + day));
  // Progressively harder and no duplicate countries within the ten questions.
  const tiers: Array<1 | 2 | 3> = [1, 1, 1, 1, 2, 2, 2, 2, 3, 3];
  const pools = {
    1: seededShuffle(COUNTRIES_BY_DIFFICULTY[1], random),
    2: seededShuffle(COUNTRIES_BY_DIFFICULTY[2], random),
    3: seededShuffle(COUNTRIES_BY_DIFFICULTY[3], random),
  };
  return tiers.map((tier, i) => {
    const id = pools[tier].shift()!;
    const type: DailyQuestion['type'] = i % 3 === 1 ? 'capital' : 'flag';
    const answer = type === 'capital' ? COUNTRY_DATA[id].capitalTr : COUNTRY_DATA[id].nameTr;
    const distractors = new Set<string>();
    const candidates = seededShuffle(VALID_COUNTRY_IDS.filter(candidate => candidate !== id), random);
    for (const candidate of candidates) {
      if (COUNTRY_DATA[candidate].difficulty !== tier) continue;
      const value = type === 'capital' ? COUNTRY_DATA[candidate].capitalTr : COUNTRY_DATA[candidate].nameTr;
      if (value !== answer) distractors.add(value);
      if (distractors.size === 3) break;
    }
    if (distractors.size < 3) {
      for (const candidate of candidates) {
        const value = type === 'capital' ? COUNTRY_DATA[candidate].capitalTr : COUNTRY_DATA[candidate].nameTr;
        if (value !== answer) distractors.add(value);
        if (distractors.size === 3) break;
      }
    }
    return { countryId: id, type, answer, difficulty: tier, options: seededShuffle([answer, ...distractors], random) };
  });
}

export function loadDailyProgress(day: string): DailyProgress {
  try {
    const value = JSON.parse(localStorage.getItem(DAILY_KEY) || 'null') as DailyProgress | null;
    if (value?.date === day && Array.isArray(value.answers)) {
      const questions = getDailyQuestions(day);
      const answers: string[] = [];
      for (const [index, answer] of value.answers.slice(0, DAILY_TOTAL).entries()) {
        if (typeof answer !== 'string' || !questions[index].options.includes(answer)) break;
        answers.push(answer);
      }
      return { date: day, answers, finishedAt: answers.length === DAILY_TOTAL ? value.finishedAt : undefined };
    }
  } catch { /* Invalid or disabled storage -> start fresh. */ }
  return { date: day, answers: [] };
}

export function getDailyStreak(): DailyStreak {
  try {
    const value = JSON.parse(localStorage.getItem(STREAK_KEY) || 'null') as DailyStreak | null;
    if (value && typeof value.lastCompletedDate === 'string' && Number.isInteger(value.count) && value.count >= 0) return value;
  } catch { /* empty streak */ }
  return { lastCompletedDate: '', count: 0 };
}

export function getStreakForDay(day: string): number {
  const streak = getDailyStreak();
  const previous = new Date(`${day}T00:00:00Z`);
  previous.setUTCDate(previous.getUTCDate() - 1);
  return streak.lastCompletedDate === day || streak.lastCompletedDate === previous.toISOString().slice(0, 10) ? streak.count : 0;
}

export function saveDailyAnswer(day: string, answer: string): DailyProgress {
  const previous = loadDailyProgress(day);
  const questions = getDailyQuestions(day);
  if (previous.answers.length >= DAILY_TOTAL || !questions[previous.answers.length]?.options.includes(answer)) return previous;
  const answers = [...previous.answers, answer];
  const complete = answers.length === DAILY_TOTAL;
  const next: DailyProgress = { date: day, answers, finishedAt: complete ? new Date().toISOString() : undefined };
  try { localStorage.setItem(DAILY_KEY, JSON.stringify(next)); } catch { /* local-only session */ }
  if (complete) {
    const old = getDailyStreak();
    const yesterday = new Date(`${day}T00:00:00Z`);
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    const prevDay = yesterday.toISOString().slice(0, 10);
    const count = old.lastCompletedDate === day ? old.count : old.lastCompletedDate === prevDay ? old.count + 1 : 1;
    try { localStorage.setItem(STREAK_KEY, JSON.stringify({ lastCompletedDate: day, count })); } catch { /* session-only */ }
    const correct = answers.filter((choice, index) => choice === questions[index].answer).length;
    void syncDailyResult(day, correct);
  }
  return next;
}

async function syncDailyResult(day: string, correct: number) {
  if (!backend) return;
  try {
    const playerId = await getPlayerId();
    await backend.from('geo_daily_results').upsert({ player_id: playerId, day_key: day, correct_answers: correct }, { onConflict: 'player_id,day_key' });
  } catch { /* Daily challenge remains functional before database setup. */ }
}