import { backend, getPlayerId } from '@/lib/leaderboard';
import type { StreetRank } from '@/lib/streetLeaderboard';

export async function fetchDroneLeaders(period:'all'|'weekly'):Promise<StreetRank[]>{
  if(!backend)throw new Error('Dünya ligi için Supabase bağlantısı gerekiyor.');
  const table=period==='all'?'geo_drone_best':'geo_drone_weekly';
  let query=backend.from(table)
    .select('player_id,player_name,score,updated_at')
    .order('score',{ascending:false}).order('updated_at',{ascending:true}).limit(100);
  if(period==='weekly'){
    const now=new Date();
    const midnight=Date.UTC(now.getUTCFullYear(),now.getUTCMonth(),now.getUTCDate());
    const monday=new Date(midnight-((now.getUTCDay()+6)%7)*86400000).toISOString().slice(0,10);
    query=query.eq('week_start',monday);
  }
  const {data,error}=await query;
  if(error)throw new Error('Dron dünya sıralaması henüz kurulmadı veya bağlantı kesildi.');
  return (data??[]) as StreetRank[];
}
export async function submitDroneScore(playerName:string,score:number):Promise<void>{
  if(!backend)throw new Error('Dünya ligi için Supabase bağlantısı gerekiyor.');
  const name=playerName.trim().slice(0,20);
  if(!name)throw new Error('Dünya sıralamasına katılmak için takma ad belirle.');
  if(!Number.isInteger(score)||score<0||score>25000)throw new Error('Geçersiz tur skoru.');
  await getPlayerId();
  const {error}=await backend.rpc('geo_submit_drone_score',{
    p_player_name:name,p_score:score,p_rounds:5,
  });
  if(error)throw new Error('Dron dünya sıralaması henüz kurulmamış veya sunucuya ulaşılamıyor.');
}
