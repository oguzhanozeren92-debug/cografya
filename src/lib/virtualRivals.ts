/** Fictional opponents for an explicitly labelled practice leaderboard.
 * These entries never enter Supabase, user metrics or official rankings.
 * The scores are deterministic for a given league and week, not fake activity.
 */
import type { GameMode } from '@/types';
export type RivalMode = GameMode | 'street' | 'drone';
export interface VirtualRival {
  id: string;
  name: string;
  flag: string;
  score: number;
}
const PROFILES = [
  {name:'MikaNova',flag:'🇯🇵'},
  {name:'CarlosV',flag:'🇪🇸'},
  {name:'SofiaK',flag:'🇵🇹'},
  {name:'LenaNord',flag:'🇩🇪'},
  {name:'ArjunSky',flag:'🇮🇳'},
  {name:'EmmaMaple',flag:'🇨🇦'},
  {name:'NoahRidge',flag:'🇦🇺'},
  {name:'ElifAtlas',flag:'🇹🇷'},
  {name:'LucasRio',flag:'🇧🇷'},
  {name:'NoraFjord',flag:'🇳🇴'},
  {name:'AmaraQuest',flag:'🇿🇦'},
  {name:'MateoSur',flag:'🇦🇷'},
] as const;
// Two notably strong rivals; most intentionally hold accessible mid-table scores.
const WEEKLY_POINTS = [6700,5200,3500,3130,2900,2650,2380,2100,1810,1590,1260,940];
const LOCATION_POINTS = [18800,16400,12600,11200,10100,9200,8300,7500,6400,5500,4400,3050];
function hash(text:string):number {
  let value=2166136261;
  for(let i=0;i<text.length;i++){
    value=Math.imul(value^text.charCodeAt(i),16777619);
  }
  return value>>>0;
}
export function getVirtualRivals(mode:RivalMode,seed:string):VirtualRival[]{
  const isLocation=mode==='street'||mode==='drone';
  const baseline=isLocation?LOCATION_POINTS:WEEKLY_POINTS;
  const leagueSeed=hash(mode+'|'+seed);
  return baseline.map((points,index)=>{
    // Stable shuffle: changes with league/week but not with page refresh.
    const profile=PROFILES[(index+(leagueSeed%PROFILES.length))%PROFILES.length];
    const jitter=(hash(mode+'|'+seed+'|'+index)%201)-100;
    const score=Math.max(0,points+jitter*(isLocation?6:3));
    return {id:mode+'-rival-'+index,name:profile.name,flag:profile.flag,score};
  }).sort((a,b)=>b.score-a.score);
}
