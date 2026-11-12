import { backend, getPlayerId } from '@/lib/leaderboard';
export interface StreetRank {
  player_id: string;
  player_name: string;
  score: number;
  updated_at: string;
}
const LOCAL_KEY='atlas-street-country-best-v1';
export function getLocalStreetBest():number{
  // Preserve the best locally earned score from either former five-round game.
  // The separate online historical leaderboards are left intact.
  try{
    return Math.max(0,...[LOCAL_KEY,'atlas-arena-drone-demo-best-v1'].map(key=>{
      const value=Number(localStorage.getItem(key)||0);
      return Number.isFinite(value)?value:0;
    }));
  }catch{return 0;}
}
export function rememberLocalStreetBest(score:number):number{
  const best=Math.max(getLocalStreetBest(),score);
  try {localStorage.setItem(LOCAL_KEY,String(best));}catch{/* Storage unavailable */}
  return best;
}
export async function fetchStreetLeaders(period:'all'|'weekly'):Promise<StreetRank[]>{
  if(!backend)throw new Error('Sıralama sunucusu bağlı değil.');
  const table=period==='all'?'geo_street_country_best':'geo_street_country_weekly';
  let query=backend.from(table).select('player_id,player_name,score,updated_at')
    .order('score',{ascending:false}).order('updated_at',{ascending:true}).limit(100);
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
export interface StreetScoreCertificate { tour:string; score:number; exp:number; sig:string }
/** Score must come from /api/street/finish: the server signs it and Supabase
 * verifies the signature, so a modified app cannot submit its own number. */
export async function submitStreetScore(playerName:string,cert:StreetScoreCertificate):Promise<void>{
  if(!backend)throw new Error('Dünya sıralaması için Supabase bağlantısı gerekiyor.');
  if(!playerName.trim())throw new Error('Dünya sıralaması için takma ad gerekiyor.');
  if(!cert||!Number.isInteger(cert.score)||cert.score<0||cert.score>25000)throw new Error('Geçersiz tur skoru.');
  await getPlayerId();
  const {error}=await backend.rpc('geo_submit_street_country_score_v2',{
    p_player_name:playerName.trim().slice(0,20),p_tour:cert.tour,p_score:cert.score,
    p_exp:cert.exp,p_sig:cert.sig,
  });
  if(error)throw new Error('Dünya sıralaması henüz kurulmamış veya sunucuya ulaşılamıyor.');
}
