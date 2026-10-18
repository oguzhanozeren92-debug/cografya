import { useMemo, useRef, useState, type PointerEvent } from 'react';
import { geoInterpolate, geoNaturalEarth1, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import { LocateFixed, Minus, Plus } from 'lucide-react';
import world from 'world-atlas/countries-110m.json';
import type { Coordinates } from '@/lib/streetLocations';

type Shape = {id?:string|number;geometry:unknown;type:string;properties?:{name?:string}};
const W=1000,H=540;
const topology=world as unknown as {objects:{countries:unknown}};
const countries=(feature(topology as never,topology.objects.countries as never) as unknown as {features:Shape[]}).features;
const projection=geoNaturalEarth1().fitExtent([[13,12],[W-13,H-12]],
  {type:'FeatureCollection',features:countries} as never);
const worldPath=geoPath(projection);
const outlines=countries.map((country,i)=>({key:String(country.id??i),d:worldPath(country as never)??''})).filter(x=>x.d);
const position=(p:Coordinates):[number,number]|null=>projection([p.lng,p.lat]) as [number,number]|null;

export function StreetWorldMap({
  guess,actual,onGuess,locked,
}:{
  guess:Coordinates|null;actual?:Coordinates|null;
  onGuess:(point:Coordinates)=>void;locked?:boolean;
}) {
  const [zoom,setZoom]=useState(1);
  const [center,setCenter]=useState({x:W/2,y:H/2});
  const pan=useRef<{x:number;y:number;cx:number;cy:number;dragged:boolean}|null>(null);
  const vw=W/zoom,vh=H/zoom;
  const cx=Math.min(W-vw/2,Math.max(vw/2,center.x));
  const cy=Math.min(H-vh/2,Math.max(vh/2,center.y));
  const viewX=cx-vw/2,viewY=cy-vh/2;
  const guessXY=guess?position(guess):null;
  const actualXY=actual?position(actual):null;
  const line=useMemo(()=>{
    if(!guess||!actual)return '';
    const interp=geoInterpolate([guess.lng,guess.lat],[actual.lng,actual.lat]);
    const coords=Array.from({length:41},(_,i)=>interp(i/40));
    return worldPath({type:'LineString',coordinates:coords} as never)??'';
  },[actual?.lat,actual?.lng,guess?.lat,guess?.lng]);

  const zoomBy=(factor:number)=>{
    const next=Math.max(1,Math.min(5,zoom*factor));
    setZoom(next);
    if(next===1)setCenter({x:W/2,y:H/2});
  };
  const down=(e:PointerEvent<SVGSVGElement>)=>{
    if(locked)return;
    e.currentTarget.setPointerCapture(e.pointerId);
    pan.current={x:e.clientX,y:e.clientY,cx,cy,dragged:false};
  };
  const move=(e:PointerEvent<SVGSVGElement>)=>{
    const p=pan.current;
    if(!p||locked)return;
    const dx=e.clientX-p.x,dy=e.clientY-p.y;
    if(Math.abs(dx)+Math.abs(dy)>8)p.dragged=true;
    if(p.dragged){
      const rect=e.currentTarget.getBoundingClientRect();
      setCenter({
        x:Math.max(vw/2,Math.min(W-vw/2,p.cx-dx/rect.width*vw)),
        y:Math.max(vh/2,Math.min(H-vh/2,p.cy-dy/rect.height*vh)),
      });
    }
  };
  const up=(e:PointerEvent<SVGSVGElement>)=>{
    const p=pan.current;pan.current=null;
    if(!p||locked||p.dragged)return;
    const rect=e.currentTarget.getBoundingClientRect();
    const px=viewX+(e.clientX-rect.left)/rect.width*vw;
    const py=viewY+(e.clientY-rect.top)/rect.height*vh;
    const result=projection.invert?.([px,py]);
    if(!result||!Number.isFinite(result[0])||!Number.isFinite(result[1]))return;
    onGuess({lng:Math.max(-180,Math.min(180,result[0])),
      lat:Math.max(-85,Math.min(85,result[1]))});
  };
  const cancel=()=>{pan.current=null;};
  return (
    <div className="street-map relative overflow-hidden rounded-[20px] border border-[#5c839e]/55 bg-[#102944]">
      <svg viewBox={[viewX,viewY,vw,vh].join(' ')} preserveAspectRatio="none"
        className="block h-[min(45dvh,355px)] min-h-[244px] w-full select-none"
        style={{touchAction:'none',cursor:locked?'default':'crosshair'}}
        role="application" aria-label="Dünya tahmin haritası. Dokunup sürükleyerek gez; dokunarak nokta seç."
        onPointerDown={down} onPointerMove={move} onPointerUp={up}
        onPointerCancel={cancel}>
        <rect x="0" y="0" width={W} height={H} fill="#193f62"/>
        {Array.from({length:11},(_,i)=><line key={'h'+i} x1="0" y1={i*54} x2={W} y2={i*54} stroke="#a9d5e0" strokeOpacity=".10"/>)}
        {Array.from({length:19},(_,i)=><line key={'v'+i} x1={i*55.55} y1="0" x2={i*55.55} y2={H} stroke="#a9d5e0" strokeOpacity=".10"/>)}
        <g fill="#699b83" stroke="#b1cbb4" strokeWidth=".65">
          {outlines.map(x=><path key={x.key} d={x.d}/>)}
        </g>
        {line&&<path d={line} stroke="#f6dd85" strokeWidth={3/Math.sqrt(zoom)} strokeDasharray="7 5" fill="none"/>}
        {actualXY&&<g transform={'translate('+actualXY[0]+' '+actualXY[1]+')'}>
          <circle r={11/Math.sqrt(zoom)} fill="#43e1a9" fillOpacity=".24"/>
          <circle r={5.5/Math.sqrt(zoom)} fill="#25d5a0" stroke="white" strokeWidth="2"/>
        </g>}
        {guessXY&&<g transform={'translate('+guessXY[0]+' '+guessXY[1]+')'}>
          <circle r={12/Math.sqrt(zoom)} fill="#ff9479" fillOpacity=".35"/>
          <circle r={6/Math.sqrt(zoom)} fill="#fc796d" stroke="white" strokeWidth="2"/>
        </g>}
      </svg>
      <div className="pointer-events-none absolute bottom-3 left-3 rounded-xl border border-[#bfdae4]/20 bg-[#0c223c]/85 px-3 py-2 text-[11px] font-bold text-white">
        {locked?'🟠 Tahmin  ·  🟢 Gerçek konum':guess?'📍 Tahminin seçildi':'🌍 Haritada bir yere dokun'}
      </div>
      <div className="absolute right-3 top-3 flex flex-col gap-2">
        <button type="button" onClick={()=>zoomBy(1.6)} aria-label="Haritayı yakınlaştır" className="street-map-button"><Plus className="h-4 w-4"/></button>
        <button type="button" onClick={()=>zoomBy(1/1.6)} aria-label="Haritayı uzaklaştır" className="street-map-button"><Minus className="h-4 w-4"/></button>
        <button type="button" onClick={()=>{setZoom(1);setCenter({x:W/2,y:H/2});}} aria-label="Haritayı sıfırla" className="street-map-button"><LocateFixed className="h-4 w-4"/></button>
      </div>
    </div>
  );
}
