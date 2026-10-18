import { backend, getPlayerId } from '@/lib/leaderboard';
import type { GameMode } from '@/types';

export type AnalyticsMode = GameMode | 'daily' | 'street' | 'drone';
export type EventType =
  | 'mode_start' | 'question_shown' | 'answer' | 'hint' | 'mode_exit'
  | 'panorama_ready' | 'panorama_error' | 'panorama_skipped'
  | 'street_guess' | 'daily_complete';

export interface PlayEvent {
  mode: AnalyticsMode;
  event_type: EventType;
  question_id?: string;
  correct?: boolean;
  duration_ms?: number;
  option_index?: number;
  detail?: string;
}

// Anonymous player identities are not shown to admins. Session id is random and
// used for privacy-preserving funnel counts; no GPS/IP/device ID is collected.
let sessionId: string | null = null;
function getSessionId(): string {
  if (!sessionId) sessionId = crypto.randomUUID();
  return sessionId;
}
let buffer: PlayEvent[] = [];
let timer: ReturnType<typeof setTimeout> | null = null;
let sending = false;
const MAX_BUFFER = 75;
const sanitize = (e: PlayEvent): PlayEvent => ({
  mode: e.mode, event_type: e.event_type,
  ...(e.question_id ? {question_id:e.question_id.slice(0,72)} : {}),
  ...(typeof e.correct==='boolean' ? {correct:e.correct} : {}),
  ...(typeof e.duration_ms==='number' ? {duration_ms:Math.min(120000,Math.max(0,Math.round(e.duration_ms)))} : {}),
  ...(typeof e.option_index==='number' && e.option_index>=0 && e.option_index<=3
    ? {option_index:e.option_index} : {}),
  ...(e.detail ? {detail:e.detail.slice(0,32)} : {}),
});
export function trackPlayEvent(event: PlayEvent): void {
  if(!backend) return;
  buffer.push(sanitize(event));
  if(buffer.length>MAX_BUFFER)buffer=buffer.slice(-MAX_BUFFER);
  if(timer===null)timer=setTimeout(()=>{timer=null;void flushPlayEvents();},1200);
}
export async function flushPlayEvents():Promise<void> {
  if(!backend||sending||buffer.length===0)return;
  sending=true;
  const events=buffer.splice(0,MAX_BUFFER);
  try {
    const playerId=await getPlayerId();
    const {error}=await backend.from('geo_play_events').insert(
      events.map(e=>({...e,session_id:getSessionId(),player_id:playerId})));
    if(error)throw error;
  } catch {
    // Never delay gameplay if offline, unconfigured or migration not yet applied.
    // Analytics is best effort; avoid retry storms on bad credentials.
  } finally {
    sending=false;
    if(buffer.length>0 && timer===null)
      timer=setTimeout(()=>{timer=null;void flushPlayEvents();},2000);
  }
}
export function analyticsQuestionId(countryId:string|null,type:string):string|undefined {
  return countryId ? countryId+':'+type : undefined;
}
