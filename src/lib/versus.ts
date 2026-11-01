
import { backend, getPlayerId } from '@/lib/leaderboard';

export interface VsQuestion {
  id: string;
  topic: string;
  question: string;
  choices: string[];
}

export interface VsAnswer {
  selected: number;
  correct: boolean;
  correctIndex: number;
}

export interface VsRoom {
  code: string;
  status: 'waiting' | 'active' | 'finished';
  expired: boolean;
  hostName: string;
  guestName: string | null;
  isHost: boolean;
  questions: VsQuestion[];
  myAnswers: VsAnswer[];
  myScore: number;
  otherScore: number;
  otherCount: number;
  /** Present when the server exposes a reportable opponent identity. */
  otherPlayerId?: string | null;
}

const assertBackend = () => {
  if (!backend) throw new Error('VS sunucusu bu sürümde bağlanamadı. Sayfayı yenileyip tekrar dene.');
  return backend;
};

export function normalizeVsCode(input: string): string {
  return input.toUpperCase().trim().replace(/[^A-F0-9]/g, '').slice(0, 12);
}

const DEFAULT_INVITE_ORIGIN = 'https://atlas-arena-tau.vercel.app';

// Accept a normal universal link, /invite.html?vs=CODE, or globriva://vs/CODE.
// The current visible domain is deliberately not assumed to be shareable
// (StackBlitz's generated preview addresses often are not public).
export function inviteCodeFromAnyUrl(raw: string): string {
  if (!raw) return '';
  try {
    const url = new URL(raw);
    const direct = normalizeVsCode(url.searchParams.get('vs') || url.searchParams.get('code') || '');
    if (direct.length === 12) return direct;
    const parts = url.pathname.split('/').filter(Boolean);
    const pathCode = normalizeVsCode(parts[parts.length - 1] || '');
    if (pathCode.length === 12 && (parts.includes('invite') || parts.includes('vs'))) return pathCode;
    if (url.protocol === 'globriva:' && url.hostname === 'vs') {
      const code = normalizeVsCode(parts[0] || '');
      return code.length === 12 ? code : '';
    }
  } catch { /* Malformed deep links are ignored. */ }
  return '';
}

export function inviteCodeFromUrl(): string {
  if (typeof window === 'undefined') return '';
  return inviteCodeFromAnyUrl(window.location.href);
}

export function makeVsLink(code: string): string {
  const invite = normalizeVsCode(code);
  if (invite.length !== 12) throw new Error('Davet kodu geçersiz.');
  const configured = import.meta.env.VITE_VS_SHARE_ORIGIN?.trim();
  const base = (configured || DEFAULT_INVITE_ORIGIN).replace(/\/+$/, '');
  const url = new URL(base);
  if (url.protocol !== 'https:') throw new Error('Davet bağlantısı HTTPS kullanmalıdır.');
  url.pathname = '/invite.html';
  url.search = '';
  url.hash = '';
  url.searchParams.set('vs', invite);
  return url.toString();
}

export async function createVsRoom(name: string): Promise<string> {
  const client = assertBackend();
  await getPlayerId();
  const { data, error } = await client.rpc('geo_vs_create', { p_name: name.trim() });
  if (error) throw error;
  if (typeof data !== 'string' || !/^[A-F0-9]{12}$/.test(data)) throw new Error('Oda kodu alınamadı.');
  return data;
}

export async function joinVsRoom(code: string, name: string): Promise<string> {
  const client = assertBackend();
  await getPlayerId();
  const { data, error } = await client.rpc('geo_vs_join', {
    p_code: normalizeVsCode(code), p_name: name.trim(),
  });
  if (error) throw error;
  if (typeof data !== 'string') throw new Error('Davet kodu doğrulanamadı.');
  return data;
}

export async function fetchVsRoom(code: string): Promise<VsRoom> {
  const client = assertBackend();
  await getPlayerId();
  const { data, error } = await client.rpc('geo_vs_state', { p_code: normalizeVsCode(code) });
  if (error) throw error;
  if (!data || typeof data !== 'object' || !Array.isArray(data.questions)) {
    throw new Error('Maç bilgileri alınamadı.');
  }
  return data as VsRoom;
}

export async function sendVsAnswer(code: string, questionIndex: number, choiceIndex: number): Promise<VsAnswer> {
  const client = assertBackend();
  const { data, error } = await client.rpc('geo_vs_answer', {
    p_code: normalizeVsCode(code),
    p_question_index: questionIndex,
    p_choice_index: choiceIndex,
  });
  if (error) throw error;
  return {
    selected: choiceIndex,
    correct: Boolean(data?.correct),
    correctIndex: Number(data?.correctIndex),
  };
}

export function userFriendlyVsError(error: unknown): string {
  const message = error instanceof Error ? error.message
    : error && typeof error === 'object' && 'message' in error
      ? String(error.message) : String(error ?? 'Bilinmeyen hata');
  if (/Failed to fetch|NetworkError|fetch failed/i.test(message)) {
    return 'Sunucuya bağlanılamadı. İnternetini ve Supabase bağlantısını kontrol et.';
  }
  return message;
}
