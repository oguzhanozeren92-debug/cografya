import type { Language } from '@/lib/i18nStrings';
import type { RivalMode } from '@/lib/virtualRivals';
import { getVirtualRivals } from '@/lib/virtualRivals';

export interface DisplayRank<T> {
  id:string;
  player_name:string;
  score:number;
  virtual:boolean;
  flag?:string;
  real?:T;
}
/** Presentation-only blend. Never writes synthetic records to Supabase. */
export function mixRankings<T extends {player_name:string;score:number}>(
  real:readonly T[],mode:RivalMode,seed:string,realId:(v:T)=>string,
):DisplayRank<T>[] {
  const players:DisplayRank<T>[]=real.map(v=>({
    id:'real-'+realId(v),player_name:v.player_name,score:v.score,virtual:false,real:v,
  }));
  const simulated:DisplayRank<T>[]=getVirtualRivals(mode,seed).map(v=>({
    id:v.id,player_name:v.name,score:v.score,flag:v.flag,virtual:true,
  }));
  return [...players,...simulated]
    .sort((a,b)=>b.score-a.score||Number(a.virtual)-Number(b.virtual))
    .slice(0,100);
}
export const mixedCopy:Record<Language,{label:string;note:string;subtitle:string;rank:string}>={
  tr:{label:'Sanal',note:'Gerçek oyuncular ve sanal rakipler puana göre sıralanır. Sanal rakipler gerçek oyuncu sayısına dahil değildir.',subtitle:'Sanal rakip',rank:'Karma sıran'},
  en:{label:'Virtual',note:'Real players and virtual rivals are ranked together by score. Virtual rivals are not counted as real players.',subtitle:'Virtual rival',rank:'Combined rank'},
  es:{label:'Virtual',note:'Jugadores reales y rivales virtuales comparten lista por puntos. Los virtuales no cuentan como jugadores reales.',subtitle:'Rival virtual',rank:'Puesto combinado'},
  de:{label:'Virtuell',note:'Echte Spieler und virtuelle Gegner stehen gemeinsam in der Liste. Virtuelle zählen nicht als echte Spieler.',subtitle:'Virtueller Gegner',rank:'Gemeinsamer Rang'},
  fr:{label:'Virtuel',note:'Les joueurs réels et les adversaires virtuels partagent la liste. Les virtuels ne comptent pas comme joueurs réels.',subtitle:'Adversaire virtuel',rank:'Rang combiné'},
  pt:{label:'Virtual',note:'Jogadores reais e rivais virtuais aparecem juntos por pontos. Virtuais não contam como jogadores reais.',subtitle:'Rival virtual',rank:'Posição combinada'},
  ru:{label:'Вирт.',note:'Настоящие игроки и виртуальные соперники в одном рейтинге. Виртуальные не считаются реальными игроками.',subtitle:'Виртуальный соперник',rank:'Общий ранг'},
  zh:{label:'虚拟',note:'真实玩家与虚拟对手按积分共同排序。虚拟对手不计入真实玩家人数。',subtitle:'虚拟对手',rank:'综合排名'},
  ja:{label:'仮想',note:'実際のプレイヤーと仮想ライバルが同じランキングに並びます。仮想ライバルは実ユーザー数に含まれません。',subtitle:'仮想ライバル',rank:'総合順位'},
};
