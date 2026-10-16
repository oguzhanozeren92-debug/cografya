
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { LeaderboardEntry } from '@/types';

const url = import.meta.env.VITE_SUPABASE_URL?.trim();
const key = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

export const backend: SupabaseClient | null =
  url && key ? createClient(url, key) : null;

const NAME_KEY = 'geo-player-name';
const LEGACY_KEY = 'geo-game-leaderboard';

export const getSavedName = (): string =>
  localStorage.getItem(NAME_KEY) || '';

export const setSavedName = (name: string): void => {
  localStorage.setItem(NAME_KEY, name.trim().slice(0, 20));
};

export const getLocalLeaderboard = (): LeaderboardEntry[] => {
  try {
    const parsed = JSON.parse(
      localStorage.getItem(LEGACY_KEY) || '[]'
    ) as LeaderboardEntry[];

    return parsed
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  } catch {
    return [];
  }
};

export async function getPlayerId(): Promise<string> {
  if (!backend) {
    throw new Error('Supabase bağlantı bilgileri eksik.');
  }

  const { data: sessionData, error: sessionError } =
    await backend.auth.getSession();

  if (sessionError) throw sessionError;

  if (sessionData.session?.user.id) {
    return sessionData.session.user.id;
  }

  const { data, error } = await backend.auth.signInAnonymously();

  if (error) throw error;

  if (!data.user) {
    throw new Error('Anonim oyuncu oturumu oluşturulamadı.');
  }

  return data.user.id;
}

export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  if (!backend) {
    throw new Error('Supabase bağlantı bilgileri eksik.');
  }

  const { data, error } = await backend
    .from('geo_leaderboard')
    .select(
      'id, player_name, score, correct_answers, total_questions, created_at, player_id'
    )
    .order('score', { ascending: false })
    .limit(50);

  if (error) throw error;

  return (data || []) as LeaderboardEntry[];
}

export async function saveGlobalScore(
  name: string,
  score: number,
  correctAnswers: number,
  totalQuestions: number
): Promise<void> {
  if (!backend) {
    throw new Error('Supabase bağlantı bilgileri eksik.');
  }

  await getPlayerId();

  const clean = name.trim().slice(0, 20);

  if (!clean) {
    throw new Error('Oyuncu adı boş olamaz.');
  }

  const { error } = await backend.rpc('geo_submit_score', {
    p_player_name: clean,
    p_score: score,
    p_correct_answers: correctAnswers,
    p_total_questions: totalQuestions,
  });

  if (error) throw error;

  setSavedName(clean);
}

export async function changePlayerName(name: string): Promise<void> {
  if (!backend) {
    throw new Error('Supabase bağlantı bilgileri eksik.');
  }

  const playerId = await getPlayerId();
  const clean = name.trim().slice(0, 20);

  if (!clean) {
    throw new Error('Oyuncu adı boş olamaz.');
  }

  const { data: existing, error: readError } = await backend
    .from('geo_leaderboard')
    .select('score')
    .eq('player_id', playerId)
    .maybeSingle();

  if (readError) throw readError;

  if (!existing) {
    // İlk kez giriş yapan oyuncuyu oluştur.
    await saveGlobalScore(clean, 0, 0, 0);
  } else {
    // Mevcut oyuncunun yalnızca takma adını güncelle.
    const { data, error } = await backend
      .from('geo_leaderboard')
      .update({ player_name: clean })
      .eq('player_id', playerId)
      .select('player_id')
      .single();

    if (error) throw error;

    if (!data) {
      throw new Error('Oyuncu profili güncellenemedi.');
    }
  }

  setSavedName(clean);
}
