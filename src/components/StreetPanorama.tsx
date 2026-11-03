import { useEffect, useRef, useState } from 'react';
import { RefreshCcw, SkipForward, AlertCircle, Maximize2, Minimize2 } from 'lucide-react';
import 'pannellum/build/pannellum.css';

export type PanoramaMedia =
  | { mode:'gallery'; images: Array<{url:string;credit:{artist:string;license:string;licenseUrl:string;source:string}}> }
  | { mode:'equirectangular'; image:string }
  | { mode:'multires'; base:string; staticBase?:string; config: {
      path:string; fallbackPath?:string; extension:string;
      tileResolution:number; maxLevel:number; cubeResolution:number;
    } };
export interface StreetRound {
  id:string;
  ticket:string;
  countryOptions?:string[];
  hints?:{region:string;landmark:string};
  media:PanoramaMedia;
  credit:{artist:string;license:string;source:string};
}
interface Viewer {
  destroy():void;
  on(event:string,fn:()=>void):void;
  isLoaded?():boolean;
  resize?():void;
}
declare global { interface Window {
  pannellum?:{viewer:(element:HTMLElement,config:Record<string,unknown>)=>Viewer};
}}
// Pannellum now ships inside the app bundle. iOS/Safari no longer needs an
// extra third-party CDN request to start the interactive 360° renderer.
let libraryPromise:Promise<void>|null=null;
function ensurePannellum():Promise<void> {
  if (window.pannellum?.viewer) return Promise.resolve();
  if (libraryPromise) return libraryPromise;
  libraryPromise=import('pannellum/build/pannellum.js')
    .then(()=>{
      if(!window.pannellum?.viewer)throw new Error('360° görüntüleyici başlatılamadı.');
    })
    .catch((error:unknown)=>{
      libraryPromise=null;
      throw error;
    });
  return libraryPromise;
}
// Only the next round's small front-face image is warmed. Full 360° images
// are NEVER preloaded: they can be large and cause mobile WebGL jank.
export function warmStreetViewer():void {
  if(typeof window==='undefined')return;
  void ensurePannellum().catch(()=>{/* The in-game error screen handles failure. */});
}
export function warmStreetPreview(round?:StreetRound):void {
  if(!round||typeof window==='undefined')return;
  const src=round.media.mode==='gallery' ? (round.media.images[0]?.url ?? '')
    : round.media.mode==='multires' ? round.media.base+'/fallback/f.jpg' : round.media.image;
  if(!/^https:\/\//.test(src))return;
  const img=new Image();
  img.decoding='async';
  img.src=src;
}

const MAX_WAIT_MS=18000;

export function StreetPanorama({
  round,onReady,onError,onSkip,skipLabel,
}:{
  round:StreetRound;
  onReady:()=>void;
  onError:(message:string)=>void;
  onSkip?:()=>void;
  skipLabel?:string;
}) {
  const container=useRef<HTMLDivElement>(null);
  const activeViewer=useRef<Viewer|null>(null);
  const [fullscreen,setFullscreen]=useState(false);
  const callbacks=useRef({onReady,onError,onSkip});
  callbacks.current={onReady,onError,onSkip};
  const [retry,setRetry]=useState(0);
  const [state,setState]=useState<'loading'|'ready'|'error'>('loading');
  const [failure,setFailure]=useState('');
  useEffect(()=>{
    if(!fullscreen)return;
    const previous=document.body.style.overflow;
    document.body.style.overflow='hidden';
    const onKey=(event:KeyboardEvent)=>{if(event.key==='Escape')setFullscreen(false)};
    window.addEventListener('keydown',onKey);
    return()=>{document.body.style.overflow=previous;window.removeEventListener('keydown',onKey)};
  },[fullscreen]);
  useEffect(()=>{
    const frame=requestAnimationFrame(()=>{try{activeViewer.current?.resize?.()}catch{/* viewer optional */}});
    return()=>cancelAnimationFrame(frame);
  },[fullscreen]);
  useEffect(()=>{
    let active=true,done=false;
    let viewer:Viewer|null=null;
    let checkTimer:ReturnType<typeof setInterval>|undefined;
    let timeoutTimer:ReturnType<typeof setTimeout>|undefined;
    setState('loading');setFailure('');
    const succeed=()=>{
      if(!active||done)return;
      done=true;
      if(timeoutTimer)clearTimeout(timeoutTimer);
      if(checkTimer)clearInterval(checkTimer);
      setState('ready');callbacks.current.onReady();
    };
    const fail=(message:string)=>{
      if(!active||done)return;
      done=true;
      if(timeoutTimer)clearTimeout(timeoutTimer);
      if(checkTimer)clearInterval(checkTimer);
      setState('error');setFailure(message);callbacks.current.onError(message);
      // Hide Pannellum's internal English error box behind our own accessible UI.
      // Deferring destruction avoids mutating Pannellum during its error callback.
      queueMicrotask(()=>{try{viewer?.destroy();viewer=null;activeViewer.current=null;}catch{/* ignore */}});
    };
    timeoutTimer=setTimeout(()=>fail('360° görüntü 18 saniyede yüklenmedi. Yeniden dene.'),MAX_WAIT_MS);
    void (async()=>{
      const media=round.media;
      // The signed session already supplies validated multiRes metadata.
      // Avoid an extra sequential config.json roundtrip before starting playback.
      await ensurePannellum();
      if(!active||done||!container.current||!window.pannellum)return;
      const options:Record<string,unknown>={
        type:media.mode==='multires'?'multires':'equirectangular',
        autoLoad:true,showControls:true,showFullscreenCtrl:false,
        showZoomCtrl:true,mouseZoom:true,keyboardZoom:true,
        hfov:100,minHfov:45,maxHfov:120,
        compass:false,hotSpotDebug:false,draggable:true,friction:0.16,
        backgroundColor:[13/255,33/255,59/255],
      };
      if(media.mode==='gallery')throw new Error('Fotoğraf albümleri için fotoğraf görüntüleyiciyi kullan.');
      if(media.mode==='equirectangular')options.panorama=media.image;
      else options.multiRes={...media.config,basePath:media.base};
      viewer=window.pannellum.viewer(container.current,options);
      activeViewer.current=viewer;
      viewer.on('load',succeed);
      viewer.on('error',()=>fail(media.mode==='multires'
        ? '360° görüntü parçaları indirilemedi. Tekrar dene veya bu turu geç.'
        : '360° fotoğraf açılamadı. Tekrar dene veya bu turu geç.'));
      // Some browsers may finish their initial render before the load listener attaches.
      if(viewer.isLoaded?.()===true)succeed();
      if(!done)checkTimer=setInterval(()=>{if(viewer?.isLoaded?.()===true)succeed();},350);
    })().catch((e:unknown)=>{
      if(!active||done)return;
      const msg=e instanceof Error?e.message:'Panorama indirilemedi.';
      fail(/Failed to fetch|NetworkError|Load failed/i.test(msg)
        ? 'R2 bağlantısı veya CORS engellendi. Tekrar dene ya da bu turu geç.' : msg);
    });
    return()=>{
      active=false;
      if(timeoutTimer)clearTimeout(timeoutTimer);
      if(checkTimer)clearInterval(checkTimer);
      try{viewer?.destroy();}catch{/* Viewer was already unmounted */}
      activeViewer.current=null;
    };
  },[round.id,round.media,retry]);

  return (
    <div className={fullscreen
      ? 'fixed inset-0 z-[180] h-[100dvh] w-screen overflow-hidden bg-[#0c2946]'
      : 'relative h-full w-full overflow-hidden rounded-[20px] bg-[#0c2946]'}>
      <div ref={container} className="h-full w-full" aria-label="360 derece panorama; parmağınla dönerek etrafına bak"/>
      {state==='loading'&&(
        <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-end overflow-hidden bg-[#102c49] pb-6 text-center text-sm font-bold text-blue-100" role="status">
          {round.media.mode==='multires'&&(
            <img src={round.media.base+'/fallback/f.jpg'} alt="" aria-hidden="true"
              className="absolute inset-0 h-full w-full object-cover opacity-60 blur-[3px]"
              draggable={false} decoding="async"/>
          )}
          <span className="relative z-10 rounded-full bg-[#0b2341]/85 px-4 py-2">
            360° açılıyor...
          </span>
        </div>
      )}
      {state==='ready'&&<button type="button"
        onClick={()=>setFullscreen(x=>!x)}
        className={'absolute right-3 z-30 grid min-h-11 min-w-11 place-items-center rounded-xl border border-amber-200/50 bg-[#091c34]/90 text-amber-100 '+(fullscreen?'top-[max(18px,env(safe-area-inset-top))]':'top-3')}
        aria-label={fullscreen?'Panoramayı küçült':'Panoramayı tam ekrana büyüt'}>
        {fullscreen?<Minimize2 className="h-5 w-5"/>:<Maximize2 className="h-5 w-5"/>}
      </button>}
      {state==='error'&&(
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-[#0c2946]/95 p-5 text-center">
          <AlertCircle className="h-8 w-8 text-[#ffba94]"/>
          <p className="text-sm font-bold leading-6 text-blue-50">{failure}</p>
          <button type="button" className="street-primary w-full max-w-[260px]" onClick={()=>setRetry(n=>n+1)}>
            <RefreshCcw className="h-4 w-4"/> Tekrar dene
          </button>
          {onSkip&&<button type="button" className="street-secondary w-full max-w-[260px]" onClick={()=>callbacks.current.onSkip?.()}>
            <SkipForward className="h-4 w-4"/> {skipLabel??'Bu turu geç (0 puan)'}
          </button>}
        </div>
      )}
    </div>
  );
}
