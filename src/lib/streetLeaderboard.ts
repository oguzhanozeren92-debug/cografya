import { backend, getPlayerId } from '@/lib/leaderboard';
export interface StreetRank {
  player_id: string;
  player_name: string;
  score: number;
  updated_at: string;
}
const LOCAL_KEY='atlas-street-best-v1';
export function getLocalStreetBest():number{
  const n=Number(localStorage.getItem(LOCAL_KEY)||0);
  return Number.isFinite(n)?n:0;
}
export function rememberLocalStreetBest(score:number):number{
  const best=Math.max(getLocalStreetBest(),score);
  try {localStorage.setItem(LOCAL_KEY,String(best));}catch{/* Storage unavailable */}
  return best;
}
export async function fetchStreetLeaders(period:'all'|'weekly'):Promise<StreetRank[]>{
  if(!backend)throw new Error('Sıralama sunucusu bağlı değil.');
  const table=period==='all'?'geo_street_best':'geo_street_weekly';
  let query=backend.from(table).select('player_id,player_name,score,updated_at')
    .order('score',{ascending:false}).order('updated_at',{ascending:true}).limit(50);
  if(period==='weekly'){
    const now=new Date();
    const midnight=Date.UTC(now.getUTCFullYear(),now.getUTCMonth(),now.getUTCDate());
    const monday=new Date(midnight-((now.getUTCDay()+6)%7)*86400000).toISOString().slice(0,10);
    query=query.eq('week_start',monday);
  }
  const {data,error}=await query;
  if(error)throw new Error('Sokak Dedektifi dünya sıralaması henüz kurulmamış.');
  return (data??[]) as StreetRank[];
}
export async function submitStreetScore(playerName:string,score:number):Promise<void>{
  if(!backend)throw new Error('Dünya sıralaması için Supabase bağlantısı gerekiyor.');
  if(!playerName.trim())throw new Error('Dünya sıralaması için takma ad gerekiyor.');
  await getPlayerId();
  const {error}=await backend.rpc('geo_submit_street_score',{
    p_player_name:playerName.trim().slice(0,20),p_score:score,p_rounds:5,
  });
  if(error)throw new Error('Dünya sıralaması henüz kurulmamış veya sunucuya ulaşılamıyor.');
}
