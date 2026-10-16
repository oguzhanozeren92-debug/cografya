import type { GameMode, WeeklyLeaderboardEntry } from '@/types';
import { backend } from '@/lib/leaderboard';

export interface MyWeeklyStanding {
  entry: WeeklyLeaderboardEntry;
  rank: number;
}

/** Every Monday at 00:00 UTC starts a new competition. */
export function getWeekStart(weekOffset = 0): string {
  const now = new Date();
  const monday = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const weekday = (now.getUTCDay() + 6) % 7;
  return new Date(monday - weekday * 86400000 + weekOffset * 604800000).toISOString().slice(0, 10);
}

export function getWeekLabel(weekOffset = 0): string {
  const start = new Date(getWeekStart(weekOffset) + 'T00:00:00Z');
  const end = new Date(start.getTime() + 6 * 86400000);
  const label = (date: Date) => date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', timeZone: 'UTC' });
  return label(start) + ' – ' + label(end);
}

export function getTimeToReset(): string {
  const nextMonday = new Date(getWeekStart(1) + 'T00:00:00Z');
  const ms = Math.max(0, nextMonday.getTime() - Date.now());
  const days = Math.floor(ms / 86400000);
  const hours = Math.floor((ms % 86400000) / 3600000);
  return days > 0 ? days + ' gün ' + hours + ' saat' : hours + ' saat ' + Math.floor((ms % 3600000) / 60000) + ' dk';
}

const columns = 'id, player_id, player_name, mode, score, correct_answers, total_questions, games_played, week_start, updated_at';

export async function fetchWeeklyLeaderboard(mode: GameMode = 'mixed', weekOffset = 0): Promise<WeeklyLeaderboardEntry[]> {
  if (!backend) throw new Error('Supabase bağlantısı henüz yapılandırılmamış.');
  const { data, error } = await backend.from('geo_weekly_leaderboard')
    .select(columns)
    .eq('mode', mode)
    .eq('week_start', getWeekStart(weekOffset))
    .order('score', { ascending: false })
    .order('updated_at', { ascending: true })
    .limit(100);
  if (error) throw error;
  return (data ?? []) as WeeklyLeaderboardEntry[];
}

export async function fetchMyWeeklyStanding(mode: GameMode = 'mixed', weekOffset = 0): Promise<MyWeeklyStanding | null> {
  if (!backend) return null;
  const { data: sessionData, error: authError } = await backend.auth.getSession();
  if (authError || !sessionData.session?.user.id) return null;
  const { data, error } = await backend.from('geo_weekly_leaderboard')
    .select(columns)
    .eq('mode', mode)
    .eq('week_start', getWeekStart(weekOffset))
    .eq('player_id', sessionData.session.user.id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const entry = data as WeeklyLeaderboardEntry;
  const { count, error: countError } = await backend.from('geo_weekly_leaderboard')
    .select('player_id', { count: 'exact', head: true })
    .eq('mode', mode)
    .eq('week_start', getWeekStart(weekOffset))
    .gt('score', entry.score);
  if (countError) throw countError;
  return { entry, rank: (count ?? 0) + 1 };
}

export async function submitWeeklyScore(name: string, score: number, correct: number, total: number, mode: GameMode): Promise<void> {
  if (!backend) throw new Error('Supabase bağlantısı henüz yapılandırılmamış.');
  const { error } = await backend.rpc('geo_submit_weekly_score', {
    p_player_name: name.trim().slice(0, 20),
    p_score: score,
    p_correct_answers: correct,
    p_total_questions: total,
    p_mode: mode,
  });
  if (error) throw error;
}
