import { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, Trophy, Users } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import type { Language } from '@/lib/i18nStrings';
import { getVirtualRivals, type RivalMode } from '@/lib/virtualRivals';

const COPY: Record<Language,{
  title:string;
  info:string;
  note:string;
  lead:string;
  more:string;
  fewer:string;
  score:string;
}> = {
  tr:{title:'Sanal Rakipler',info:'Antrenman ligi',note:'Bu rakipler sanaldır. Gerçek oyuncu sayılarına ve dünya sıralamasına dahil edilmezler.',lead:'Antrenman sıralaman',more:'Tüm sanal rakipleri göster',fewer:'Listeyi daralt',score:'puan'},
  en:{title:'Virtual Rivals',info:'Practice league',note:'These are simulated opponents, not real players. They do not count toward the live world ranking.',lead:'Your practice position',more:'Show all virtual rivals',fewer:'Show fewer rivals',score:'points'},
  es:{title:'Rivales virtuales',info:'Liga de práctica',note:'Son rivales simulados; no cuentan como jugadores reales ni afectan a la clasificación mundial.',lead:'Tu posición de práctica',more:'Ver todos los rivales virtuales',fewer:'Mostrar menos',score:'puntos'},
  de:{title:'Virtuelle Gegner',info:'Trainingsliga',note:'Das sind simulierte Gegner, keine echten Spieler. Sie zählen nicht zur Weltrangliste.',lead:'Dein Trainingsrang',more:'Alle virtuellen Gegner anzeigen',fewer:'Weniger anzeigen',score:'Punkte'},
  fr:{title:'Adversaires virtuels',info:"Ligue d'entraînement",note:'Ces adversaires sont simulés. Ils ne comptent pas parmi les vrais joueurs ni au classement mondial.',lead:"Ton rang d'entraînement",more:'Voir tous les adversaires',fewer:'Réduire la liste',score:'points'},
  pt:{title:'Rivais virtuais',info:'Liga de treino',note:'Esses rivais são simulados e não contam como jogadores reais nem no ranking mundial.',lead:'Sua posição no treino',more:'Ver todos os rivais virtuais',fewer:'Mostrar menos',score:'pontos'},
  ru:{title:'Виртуальные соперники',info:'Тренировочная лига',note:'Это вымышленные соперники, а не реальные игроки. Они не влияют на мировой рейтинг.',lead:'Ваше место в тренировке',more:'Показать всех соперников',fewer:'Свернуть список',score:'очков'},
  zh:{title:'虚拟对手',info:'练习排行榜',note:'这些是模拟对手，并非真实玩家，不计入真实玩家数量或世界排行榜。',lead:'你的练习排名',more:'显示全部虚拟对手',fewer:'收起列表',score:'分'},
  ja:{title:'バーチャルライバル',info:'練習リーグ',note:'これは架空の対戦相手で、実際のプレイヤー数や世界ランキングには含まれません。',lead:'練習ランキング順位',more:'すべてのライバルを表示',fewer:'表示を減らす',score:'点'},
};

export function VirtualRivals({mode,seed,myScore}:{mode:RivalMode;seed:string;myScore?:number}){
  const {language}=useLanguage();
  const copy=COPY[language];
  const rivals=useMemo(()=>getVirtualRivals(mode,seed),[mode,seed]);
  const [expanded,setExpanded]=useState(false);
  const visible=expanded?rivals:rivals.slice(0,6);
  const practiceRank=typeof myScore==='number'&&myScore>0
    ? 1+rivals.filter(row=>row.score>myScore).length
    : null;
  return <section className="mt-5 rounded-[23px] border border-cyan-300/25 bg-[#12213e]/95 p-3 text-white sm:p-4" aria-label={copy.title}>
    <div className="mb-3 flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="mb-1 text-[10px] font-black uppercase tracking-[.15em] text-cyan-200/80">{copy.info}</p>
        <h3 className="flex items-center gap-2 text-base font-black"><Users className="h-4 w-4 text-cyan-200"/>{copy.title}</h3>
      </div>
      <span className="shrink-0 rounded-full border border-cyan-300/40 bg-cyan-300/10 px-2.5 py-1 text-[10px] font-extrabold text-cyan-100">BOT</span>
    </div>
    <p className="mb-3 text-xs leading-5 text-blue-100/75">{copy.note}</p>
    {practiceRank!==null&&
      <p className="mb-3 flex items-center gap-2 rounded-xl bg-cyan-300/10 px-3 py-2 text-xs font-bold text-cyan-100">
        <Trophy className="h-4 w-4"/>{copy.lead}: #{practiceRank}
      </p>}
    <ol className="space-y-1.5">
      {visible.map((rival,index)=><li key={rival.id} className="flex min-w-0 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5">
        <span className={'w-6 shrink-0 text-xs font-black '+(index<2?'text-amber-200':'text-blue-100/70')}>{index+1}.</span>
        <span className="text-lg" aria-hidden="true">{rival.flag}</span>
        <span className="min-w-0 flex-1 truncate text-sm font-semibold">{rival.name}</span>
        <span className="shrink-0 text-sm font-black tabular-nums text-amber-100">{rival.score.toLocaleString(language)}</span>
      </li>)}
    </ol>
    <button type="button" onClick={()=>setExpanded(value=>!value)}
      className="mt-3 flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-xs font-bold text-blue-50">
      {expanded?<ChevronUp className="h-4 w-4"/>:<ChevronDown className="h-4 w-4"/>}
      {expanded?copy.fewer:copy.more}
    </button>
  </section>;
}
