export function GeoStarRow({ count, large = false, animated = false }: { count: number; large?: boolean; animated?: boolean }) {
  return <span className={'inline-flex items-center justify-center '+(large?'gap-2.5':'gap-1')} aria-label={count+' / 3 yıldız'}>
    {[1,2,3].map(i=><span key={i} aria-hidden="true"
      className={'inline-block leading-none '+(large?'text-[clamp(43px,12vw,61px)]':'text-xl')+' '+(i<=count?'text-[#ffcf63] drop-shadow-[0_0_9px_rgba(248,191,66,.5)]':'text-[#627287]/70')+(animated&&i<=count?' geo-star-pop':'')}
      style={animated?{animationDelay:(i-1)*.23+'s'}:undefined}>★</span>)}
  </span>;
}
