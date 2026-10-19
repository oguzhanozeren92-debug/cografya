import { useMemo, useRef, useState, type PointerEvent } from 'react';
import { geoContains, geoInterpolate, geoNaturalEarth1, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import { LocateFixed, Minus, Plus } from 'lucide-react';
import world from 'world-atlas/countries-110m.json';
import type { Coordinates } from '@/lib/streetLocations';
import { useLanguage } from '@/lib/i18n';

type Shape = {id?:string|number;geometry:unknown;type:string;properties?:{name?:string}};
const W=1000,H=540;
const topology=world as unknown as {objects:{countries:unknown}};
const countries=(feature(topology as never,topology.objects.countries as never) as unknown as {features:Shape[]}).features;
const projection=geoNaturalEarth1().fitExtent([[13,12],[W-13,H-12]],
  {type:'FeatureCollection',features:countries} as never);
const worldPath=geoPath(projection);
const outlines=countries.map((country,i)=>({key:String(country.id??i),d:worldPath(country as never)??''})).filter(x=>x.d);
const position=(p:Coordinates):[number,number]|null=>projection([p.lng,p.lat]) as [number,number]|null;
const COUNTRY_NUMERIC_IDS: Record<string,number> = {
  'Kamboçya':116, 'Gürcistan':268, 'Fransa':250, 'Almanya':276,
  'Brezilya':76, 'Hindistan':356, 'İspanya':724, 'Avusturya':40,
  'Meksika':484, 'Japonya':392, 'Arjantin':32, 'Slovenya':705,
  'Ermenistan':51, 'Kanada':124, 'Letonya':428, 'Estonya':233,
  'Avustralya':36, 'Birleşik Krallık':826,
};
/** Feedback only: score is always computed from distance on the server. */
export function guessedCorrectCountry(guess:Coordinates|null,country:string):boolean|null {
  if(!guess)return null;
  const id=COUNTRY_NUMERIC_IDS[country];
  if(!id)return null;
  const polygon=countries.find(feature=>Number(feature.id)===id);
  if(!polygon)return null;
  return geoContains(polygon as never,[guess.lng,guess.lat]);
}


export function StreetWorldMap({
  guess,actual,onGuess,locked,
}:{
  guess:Coordinates|null;actual?:Coordinates|null;
  onGuess:(point:Coordinates)=>void;locked?:boolean;
}) {

  const {t}=useLanguage();
  // Pointer events support both mouse-drag and true iOS/Android two-finger pinch.
  // Keep the active view in a ref to avoid stale React render values during gestures.
  const [view,setView]=useState({zoom:1,cx:W/2,cy:H/2});
  const liveView=useRef(view);
  const touches=useRef(new Map<number,{x:number;y:number}>());
  const drag=useRef<{x:number;y:number;cx:number;cy:number;moved:boolean}|null>(null);
  const pinch=useRef<{distance:number;zoom:number;anchorX:number;anchorY:number}|null>(null);
  const pinchUsed=useRef(false);
  const zoom=view.zoom;
  const vw=W/zoom,vh=H/zoom;
  const cx=Math.min(W-vw/2,Math.max(vw/2,view.cx));
  const cy=Math.min(H-vh/2,Math.max(vh/2,view.cy));
  const viewX=cx-vw/2,viewY=cy-vh/2;
  const guessXY=guess?position(guess):null;
  const actualXY=actual?position(actual):null;
  const line=useMemo(()=>{
    if(!guess||!actual)return '';
    const interp=geoInterpolate([guess.lng,guess.lat],[actual.lng,actual.lat]);
    const coords=Array.from({length:41},(_,i)=>interp(i/40));
    return worldPath({type:'LineString',coordinates:coords} as never)??'';
  },[actual?.lat,actual?.lng,guess?.lat,guess?.lng]);

  const clamp=(zoom:number,cx:number,cy:number)=>{
    const nextZoom=Math.max(1,Math.min(8,zoom));
    const halfW=W/nextZoom/2,halfH=H/nextZoom/2;
    return {zoom:nextZoom,cx:Math.max(halfW,Math.min(W-halfW,cx)),
      cy:Math.max(halfH,Math.min(H-halfH,cy))};
  };
  const updateView=(zoom:number,cx:number,cy:number)=>{
    const next=clamp(zoom,cx,cy);
    liveView.current=next;setView(next);
  };
  const zoomBy=(factor:number)=>{
    const current=liveView.current;
    const next=current.zoom*factor;
    updateView(next,current.cx,current.cy);
  };
  const mapPoint=(e:PointerEvent<SVGSVGElement>)=>{
    const rect=e.currentTarget.getBoundingClientRect();
    return {x:e.clientX,y:e.clientY,rect};
  };
  const startPinch=(rect:DOMRect)=>{
    const [a,b]=[...touches.current.values()];
    if(!a||!b)return;
    const distance=Math.hypot(a.x-b.x,a.y-b.y);
    const midpointX=(a.x+b.x)/2,midpointY=(a.y+b.y)/2;
    const current=liveView.current;
    const width=W/current.zoom,height=H/current.zoom;
    pinch.current={distance:Math.max(8,distance),zoom:current.zoom,
      anchorX:current.cx-width/2+(midpointX-rect.left)/rect.width*width,
      anchorY:current.cy-height/2+(midpointY-rect.top)/rect.height*height};
    pinchUsed.current=true;
    drag.current=null;
  };
  const down=(e:PointerEvent<SVGSVGElement>)=>{
    if(e.pointerType==='mouse'&&e.button!==0)return;
    e.currentTarget.setPointerCapture(e.pointerId);
    touches.current.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(touches.current.size===1){
      const v=liveView.current;
      drag.current={x:e.clientX,y:e.clientY,cx:v.cx,cy:v.cy,moved:false};
      pinchUsed.current=false;
    }else if(touches.current.size===2){
      startPinch(e.currentTarget.getBoundingClientRect());
    }
  };
  const move=(e:PointerEvent<SVGSVGElement>)=>{
    if(!touches.current.has(e.pointerId))return;
    touches.current.set(e.pointerId,{x:e.clientX,y:e.clientY});
    const rect=e.currentTarget.getBoundingClientRect();
    if(touches.current.size>=2){
      const [a,b]=[...touches.current.values()];
      if(!a||!b)return;
      if(!pinch.current)startPinch(rect);
      const p=pinch.current;
      if(!p)return;
      const distance=Math.hypot(a.x-b.x,a.y-b.y);
      const nextZoom=Math.max(1,Math.min(8,p.zoom*distance/p.distance));
      const width=W/nextZoom,height=H/nextZoom;
      const midX=(a.x+b.x)/2,midY=(a.y+b.y)/2;
      updateView(nextZoom,
        p.anchorX-(midX-rect.left)/rect.width*width+width/2,
        p.anchorY-(midY-rect.top)/rect.height*height+height/2);
      return;
    }
    const p=drag.current;
    if(!p||pinchUsed.current)return;
    const dx=e.clientX-p.x,dy=e.clientY-p.y;
    if(Math.abs(dx)+Math.abs(dy)>7)p.moved=true;
    if(p.moved){
      const v=liveView.current;
      const width=W/v.zoom,height=H/v.zoom;
      updateView(v.zoom,p.cx-dx/rect.width*width,p.cy-dy/rect.height*height);
    }
  };
  const up=(e:PointerEvent<SVGSVGElement>)=>{
    const wasTracked=touches.current.has(e.pointerId);
    const oneFingerTap=wasTracked && touches.current.size===1 &&
      !pinchUsed.current && !drag.current?.moved &&
      Math.abs(e.clientX-(drag.current?.x??e.clientX))<8 &&
      Math.abs(e.clientY-(drag.current?.y??e.clientY))<8;
    touches.current.delete(e.pointerId);
    if(touches.current.size===0){
      drag.current=null;pinch.current=null;pinchUsed.current=false;
    }else if(touches.current.size===1){
      pinch.current=null;drag.current=null;
    }
    if(!oneFingerTap||locked)return;
    const {x,y,rect}=mapPoint(e);
    const v=liveView.current;
    const width=W/v.zoom,height=H/v.zoom;
    const px=v.cx-width/2+(x-rect.left)/rect.width*width;
    const py=v.cy-height/2+(y-rect.top)/rect.height*height;
    const result=projection.invert?.([px,py]);
    if(!result||!Number.isFinite(result[0])||!Number.isFinite(result[1]))return;
    onGuess({lng:Math.max(-180,Math.min(180,result[0])),
      lat:Math.max(-85,Math.min(85,result[1]))});
  };
  const cancel=(e:PointerEvent<SVGSVGElement>)=>{
    touches.current.delete(e.pointerId);
    drag.current=null;pinch.current=null;pinchUsed.current=true;
    if(touches.current.size===0)pinchUsed.current=false;
  };
  return (
    <div className="street-map relative overflow-hidden rounded-[20px] border border-[#5c839e]/55 bg-[#102944]">
      <svg viewBox={[viewX,viewY,vw,vh].join(' ')} preserveAspectRatio="none"
        className="block h-[min(54dvh,420px)] min-h-[330px] w-full select-none"
        style={{touchAction:'none',cursor:locked?'default':'crosshair'}}
        role="application" aria-label={t("Dünya haritası. İki parmakla yakınlaştır, bir parmakla sürükle, dokunarak konum seç.")}
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
        {locked?'🟠 '+t('Tahmin')+' · 🟢 '+t('Gerçek konum'):guess?'📍 '+t('Tahminin seçildi'):'🌍 '+t('Haritada bir yere dokun')}
      </div>
      <div className="absolute right-3 top-3 flex flex-col gap-2">
        <button type="button" onClick={()=>zoomBy(1.6)} aria-label={t("Haritayı yakınlaştır")} className="street-map-button"><Plus className="h-4 w-4"/></button>
        <button type="button" onClick={()=>zoomBy(1/1.6)} aria-label={t("Haritayı uzaklaştır")} className="street-map-button"><Minus className="h-4 w-4"/></button>
        <button type="button" onClick={()=>updateView(1,W/2,H/2)} aria-label={t("Haritayı sıfırla")} className="street-map-button"><LocateFixed className="h-4 w-4"/></button>
      </div>
    </div>
  );
}
