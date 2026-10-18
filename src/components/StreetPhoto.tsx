import { useEffect, useRef, useState } from 'react';
import { AlertCircle, ChevronLeft, ChevronRight, RefreshCcw, SkipForward } from 'lucide-react';
import type { StreetRound, PanoramaMedia } from '@/components/StreetPanorama';

/**
 * Lightweight, static photo player. Uses the already-published cube-face JPEGs
 * from the licensed Pannellum archive; does not download Pannellum or WebGL tiles.
 * Direction arrows change among ordinary square photos, not a 360° canvas.
 */
const FACES=['f','r','b','l'] as const;
const LABELS=['Ön','Sağ','Arka','Sol'];
function photoUrl(media:PanoramaMedia, face:string):string {
  if(media.mode==='equirectangular')return media.image;
  const template=media.config.fallbackPath ?? '/fallback/%s';
  const filename=template.replace('%s',face).replace(/^\/+/,'');
  const extension=media.config.extension.replace(/[^a-z0-9]/gi,'') || 'jpg';
  return media.base.replace(/\/+$/,'')+'/'+filename+'.'+extension;
}
export function warmStreetPhoto(round?:StreetRound):void {
  if(!round||typeof window==='undefined')return;
  const url=photoUrl(round.media,'f');
  if(!/^https:\/\//.test(url))return;
  const preview=new Image();
  preview.decoding='async';
  preview.src=url;
}
export function StreetPhoto({
  round,onReady,onError,onSkip,
}:{
  round:StreetRound;
  onReady:()=>void;
  onError:(message:string)=>void;
  onSkip?:()=>void;
}) {
  const [face,setFace]=useState(0);
  const [retry,setRetry]=useState(0);
  const [state,setState]=useState<'loading'|'ready'|'error'>('loading');
  const [failure,setFailure]=useState('');
  const readyFired=useRef(false);
  const handlers=useRef({onReady,onError,onSkip});
  handlers.current={onReady,onError,onSkip};
  useEffect(()=>{
    readyFired.current=false;
    setFace(0);setState('loading');setFailure('');
  },[round.id,round.media]);
  useEffect(()=>{
    if(state!=='loading')return;
    const timeout=setTimeout(()=>{
      setState('error');
      const msg='Fotoğraf açılamadı. Tekrar dene veya bu turu geç.';
      setFailure(msg);handlers.current.onError(msg);
    },7500);
    return()=>clearTimeout(timeout);
  },[round.id,face,retry,state]);

  const handleLoad=()=>{
    setState('ready');setFailure('');
    if(!readyFired.current){
      readyFired.current=true;
      handlers.current.onReady();
    }
  };
  const handleError=()=>{
    if(face!==0&&readyFired.current){
      setFace(0); // A secondary angle is optional; return to already-cached front photo.
      setState('loading');
      return;
    }
    const msg='Fotoğraf indirilemedi. Tekrar dene veya bu turu geç.';
    setFailure(msg);setState('error');handlers.current.onError(msg);
  };
  const changeFace=(delta:number)=>{
    if(state!=='ready')return;
    setFace(v=>(v+delta+FACES.length)%FACES.length);
    setState('loading');
  };
  const src=photoUrl(round.media,FACES[face]);
  return (
    <div className="relative h-full w-full overflow-hidden rounded-[20px] bg-[#112b45]">
      {state!=='error'&&(
        <img key={round.id+'-'+face+'-'+retry} src={src} alt="Konumdan bir fotoğraf; çevreyi inceleyip haritada tahmin et."
          decoding="async" loading="eager" fetchPriority="high" draggable={false}
          className="h-full w-full object-cover select-none"
          onLoad={handleLoad} onError={handleError}/>
      )}
      {state==='loading'&&<div role="status"
        className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-[#0b2341]/90 px-4 py-2 text-xs font-bold text-white">
        Fotoğraf açılıyor...
      </div>}
      {state==='ready'&&round.media.mode==='multires'&&(
        <>
          <button type="button" aria-label="Fotoğrafta sola bak" onClick={()=>changeFace(-1)}
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full border border-white/30 bg-[#0b2341]/75 p-2.5 text-white">
            <ChevronLeft className="h-5 w-5"/>
          </button>
          <button type="button" aria-label="Fotoğrafta sağa bak" onClick={()=>changeFace(1)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full border border-white/30 bg-[#0b2341]/75 p-2.5 text-white">
            <ChevronRight className="h-5 w-5"/>
          </button>
          <span className="pointer-events-none absolute bottom-2 right-3 rounded-full bg-[#0b2341]/75 px-2.5 py-1 text-[10px] font-bold text-white">
            {LABELS[face]} görünüş
          </span>
        </>
      )}
      {state==='error'&&(
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#112b45] p-5 text-center">
          <AlertCircle className="h-8 w-8 text-[#ffba94]"/>
          <p className="text-sm font-bold text-white">{failure}</p>
          <button type="button" className="street-primary w-full max-w-[260px]"
            onClick={()=>{setRetry(x=>x+1);setFace(0);setState('loading');}}>
            <RefreshCcw className="h-4 w-4"/> Tekrar dene
          </button>
          {onSkip&&<button type="button" className="street-secondary w-full max-w-[260px]"
            onClick={()=>handlers.current.onSkip?.()}>
            <SkipForward className="h-4 w-4"/> Bu turu geç (0 puan)
          </button>}
        </div>
      )}
    </div>
  );
}
