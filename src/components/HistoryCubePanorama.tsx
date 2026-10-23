import { useEffect, useRef, useState, type PointerEvent, type WheelEvent } from 'react';
import { Maximize2, Minimize2, Minus, Plus, RefreshCcw, RotateCcw, Move, AlertCircle } from 'lucide-react';
import type { PanoramaMedia } from '@/components/StreetPanorama';
import { useLanguage } from '@/lib/i18n';

// All six REAL cubemap faces from the existing licensed panorama CDN.
// CSS 3D runs in Safari without WebGL, canvas, third-party scripts, or GPU shaders.
const FACES=['f','r','b','l','u','d'] as const;
type Face=typeof FACES[number];
type Pose={yaw:number;pitch:number;zoom:number};
const clamp=(v:number,low:number,high:number)=>Math.max(low,Math.min(high,v));
const urlFor=(media:PanoramaMedia,face:Face)=>media.mode==='multires'
  ?media.base.replace(/\/+$/,'')+'/fallback/'+face+'.jpg':'';
function transformFor(face:Face,d:number):string{
  if(face==='f')return 'translateZ('+(-d)+'px)';
  if(face==='r')return 'translateX('+d+'px) rotateY(-90deg)';
  if(face==='b')return 'translateZ('+d+'px) rotateY(180deg)';
  if(face==='l')return 'translateX('+(-d)+'px) rotateY(90deg)';
  if(face==='u')return 'translateY('+(-d)+'px) rotateX(-90deg)';
  return 'translateY('+d+'px) rotateX(90deg)';
}

export function HistoryCubePanorama({media,id,onReady,onError}:{
  media:PanoramaMedia;id:string;onReady:()=>void;onError:(error:string)=>void;
}){
  const {language}=useLanguage();
  const tr=language==='tr';
  const [width,setWidth]=useState(350);
  const [status,setStatus]=useState<'loading'|'ready'|'error'>('loading');
  const [reload,setReload]=useState(0);
  const [pose,setPose]=useState<Pose>({yaw:0,pitch:0,zoom:1});
  const [fullscreen,setFullscreen]=useState(false);
  const [failure,setFailure]=useState('');
  const viewport=useRef<HTMLDivElement>(null);
  const callbacks=useRef({onReady,onError});
  callbacks.current={onReady,onError};
  const pointers=useRef(new Map<number,{x:number;y:number}>());
  const pinch=useRef<number|null>(null);

  useEffect(()=>{
    if(!viewport.current)return;
    const observer=new ResizeObserver(entries=>{
      const w=entries[0]?.contentRect.width;
      if(w&&Number.isFinite(w))setWidth(clamp(w,220,1000));
    });
    observer.observe(viewport.current);
    return()=>observer.disconnect();
  },[fullscreen]);

  useEffect(()=>{
    if(!fullscreen)return;
    const previous=document.body.style.overflow;
    document.body.style.overflow='hidden';
    const onKey=(e:KeyboardEvent)=>{if(e.key==='Escape')setFullscreen(false);};
    window.addEventListener('keydown',onKey);
    return()=>{document.body.style.overflow=previous;window.removeEventListener('keydown',onKey);};
  },[fullscreen]);

  useEffect(()=>{
    let cancelled=false;
    setStatus('loading');setFailure('');
    if(media.mode!=='multires'){
      const message='Bu kayıt için tam panorama bulunamadı.';
      setStatus('error');setFailure(message);callbacks.current.onError(message);
      return;
    }
    const pending:HTMLImageElement[]=[];
    const timer=window.setTimeout(()=>{
      if(cancelled)return;
      cancelled=true;
      const message='360° görüntü zaman aşımına uğradı.';
      setStatus('error');setFailure(message);callbacks.current.onError(message);
    },22000);
    const tasks=FACES.map(face=>new Promise<void>((resolve,reject)=>{
      const img=new Image();
      pending.push(img);
      img.onload=()=>{
        if(img.naturalWidth<64||img.naturalHeight<64)reject(new Error('Fotoğraf çözünürlüğü yetersiz.'));
        else resolve();
      };
      img.onerror=()=>reject(new Error('Panorama '+face+' yüzü yüklenemedi.'));
      img.decoding='async';
      img.src=urlFor(media,face);
    }));
    void Promise.all(tasks).then(()=>{
      if(cancelled)return;
      window.clearTimeout(timer);
      setStatus('ready');callbacks.current.onReady();
    }).catch((e:unknown)=>{
      if(cancelled)return;
      window.clearTimeout(timer);
      const message=e instanceof Error?e.message:'Panorama yüklenemedi.';
      setStatus('error');setFailure(message);callbacks.current.onError(message);
    });
    return()=>{
      cancelled=true;window.clearTimeout(timer);
      for(const img of pending){img.onload=null;img.onerror=null;}
    };
  },[id,media,reload]);

  const pointerDown=(e:PointerEvent<HTMLDivElement>)=>{
    if(status!=='ready')return;
    e.currentTarget.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(pointers.current.size===2){
      const [a,b]=[...pointers.current.values()];
      pinch.current=Math.hypot(a.x-b.x,a.y-b.y);
    }
  };
  const pointerMove=(e:PointerEvent<HTMLDivElement>)=>{
    const old=pointers.current.get(e.pointerId);
    if(!old||status!=='ready')return;
    pointers.current.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(pointers.current.size>=2){
      const [a,b]=[...pointers.current.values()];
      const distance=Math.hypot(a.x-b.x,a.y-b.y);
      if(pinch.current&&pinch.current>0){
        const ratio=distance/pinch.current;
        setPose(v=>({...v,zoom:clamp(v.zoom*ratio,1,3)}));
      }
      pinch.current=distance;return;
    }
    const dx=e.clientX-old.x,dy=e.clientY-old.y;
    setPose(v=>({...v,yaw:(v.yaw+dx*.30)%360,pitch:clamp(v.pitch-dy*.27,-85,85)}));
  };
  const pointerUp=(e:PointerEvent<HTMLDivElement>)=>{
    pointers.current.delete(e.pointerId);pinch.current=null;
    try{e.currentTarget.releasePointerCapture(e.pointerId);}catch{/* already gone */}
  };
  const wheel=(e:WheelEvent<HTMLDivElement>)=>{
    if(status!=='ready')return;
    e.preventDefault();
    setPose(v=>({...v,zoom:clamp(v.zoom*Math.exp(-e.deltaY*.0015),1,3)}));
  };
  const zoomBy=(value:number)=>setPose(v=>({...v,zoom:clamp(v.zoom+value,1,3)}));
  const depth=width*.52;
  const side=depth*2;
  // Higher perspective means a tighter field of view.
  const perspective=depth*(1+((pose.zoom-1)*.68));

  return (
    <div className={fullscreen
      ?'fixed inset-0 z-[130] h-[100dvh] w-screen overflow-hidden bg-[#081b30]'
      :'relative h-full w-full overflow-hidden rounded-[20px] bg-[#0c2946]'}>
      <div ref={viewport} className="absolute inset-0 overflow-hidden"
        style={{touchAction:'none',perspective:perspective+'px',perspectiveOrigin:'50% 50%',
          cursor:status==='ready'?'grab':'default'}}
        onPointerDown={pointerDown} onPointerMove={pointerMove}
        onPointerUp={pointerUp} onPointerCancel={pointerUp}
        onLostPointerCapture={()=>{pointers.current.clear();pinch.current=null;}}
        onWheel={wheel} role="application"
        aria-label={tr?'360 derece panorama; parmağınla döndür, iki parmakla yakınlaş':'360 degree panorama; drag to turn and pinch to zoom'}>
        {status!=='error'&&media.mode==='multires'&&(
          <div className="absolute left-1/2 top-1/2 h-0 w-0"
            style={{transformStyle:'preserve-3d',
              transform:'rotateX('+pose.pitch+'deg) rotateY('+pose.yaw+'deg)',
              willChange:'transform'}}>
            {FACES.map(face=>(
              <div key={face} className="absolute overflow-hidden"
                style={{left:-depth,top:-depth,width:side,height:side,
                  backfaceVisibility:'visible',transform:transformFor(face,depth)}}>
                <img alt="" aria-hidden="true" draggable={false}
                  src={urlFor(media,face)}
                  className="block h-full w-full select-none object-fill"
                  style={{pointerEvents:'none'}}/>
              </div>
            ))}
          </div>
        )}
      </div>
      {status==='loading'&&(
        <div className="pointer-events-none absolute inset-0 z-10 grid place-items-center bg-[#0c2946]">
          {media.mode==='multires'&&<img src={urlFor(media,'f')} alt="" aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover opacity-70" draggable={false}/>}
          <span className="relative rounded-full border border-white/20 bg-[#081c35]/90 px-4 py-2 text-xs font-bold text-white">
            {tr?'360° görüntü hazırlanıyor…':'Preparing 360° panorama…'}
          </span>
        </div>
      )}
      {status==='ready'&&(
        <>
          <div className="pointer-events-none absolute bottom-3 left-3 z-20 flex items-center gap-1.5 rounded-full bg-[#07182c]/85 px-3 py-1.5 text-[11px] font-bold text-white">
            <Move className="h-3.5 w-3.5 text-amber-200"/>
            {tr?'360° · Kaydırarak keşfet':'360° · Drag to explore'}
          </div>
          <div className="absolute right-2 top-2 z-20 flex flex-col gap-1.5">
            <button type="button" aria-label={tr?'Tam ekran':'Fullscreen'}
              className="street-map-button" onClick={()=>setFullscreen(v=>!v)}>
              {fullscreen?<Minimize2 className="h-4 w-4"/>:<Maximize2 className="h-4 w-4"/>}
            </button>
            <button type="button" aria-label={tr?'Yakınlaştır':'Zoom in'} className="street-map-button"
              onClick={()=>zoomBy(.25)} disabled={pose.zoom>=3}><Plus className="h-4 w-4"/></button>
            <button type="button" aria-label={tr?'Uzaklaştır':'Zoom out'} className="street-map-button"
              onClick={()=>zoomBy(-.25)} disabled={pose.zoom<=1}><Minus className="h-4 w-4"/></button>
            <button type="button" aria-label={tr?'Görünümü sıfırla':'Reset view'} className="street-map-button"
              onClick={()=>setPose({yaw:0,pitch:0,zoom:1})}><RotateCcw className="h-4 w-4"/></button>
          </div>
        </>
      )}
      {status==='error'&&(
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 bg-[#0c2946] p-5 text-center">
          <AlertCircle className="h-7 w-7 text-orange-200"/>
          <p role="alert" className="text-xs font-bold text-blue-100">{failure}</p>
          <button type="button" onClick={()=>setReload(x=>x+1)} className="street-primary w-full max-w-[240px]">
            <RefreshCcw className="h-4 w-4"/>{tr?'Panoramayı tekrar yükle':'Reload panorama'}
          </button>
        </div>
      )}
    </div>
  );
}
