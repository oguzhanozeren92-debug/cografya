import { useEffect, useRef, useState } from 'react';
import { RefreshCcw, SkipForward, AlertCircle } from 'lucide-react';

export type PanoramaMedia =
  | { mode:'equirectangular'; image:string }
  | { mode:'multires'; base:string; config: {
      path:string; fallbackPath?:string; extension:string;
      tileResolution:number; maxLevel:number; cubeResolution:number;
    } };
export interface StreetRound {
  id:string;
  ticket:string;
  media:PanoramaMedia;
  credit:{artist:string;license:string;source:string};
}
interface Viewer {
  destroy():void;
  on(event:string,fn:()=>void):void;
  isLoaded?():boolean;
}
declare global { interface Window {
  pannellum?:{viewer:(element:HTMLElement,config:Record<string,unknown>)=>Viewer};
}}
let libraryPromise:Promise<void>|null=null;
function ensurePannellum():Promise<void> {
  if (window.pannellum?.viewer) return Promise.resolve();
  if (libraryPromise) return libraryPromise;
  libraryPromise = new Promise<void>((resolve,reject)=>{
    const css=document.createElement('link');
    css.rel='stylesheet';
    css.href='https://cdn.jsdelivr.net/npm/pannellum@2.5.7/build/pannellum.css';
    document.head.appendChild(css);
    const js=document.createElement('script');
    js.async=true;
    js.src='https://cdn.jsdelivr.net/npm/pannellum@2.5.7/build/pannellum.js';
    js.onload=()=>window.pannellum?.viewer?resolve():reject(new Error('360° görüntüleyici başlatılamadı.'));
    js.onerror=()=>reject(new Error('360° oynatıcı indirilemedi. İnternet bağlantını kontrol et.'));
    document.head.appendChild(js);
  }).catch((err:unknown)=>{libraryPromise=null;throw err;});
  return libraryPromise;
}
const MAX_WAIT_MS=14000;

export function StreetPanorama({
  round,onReady,onError,onSkip,
}:{
  round:StreetRound;
  onReady:()=>void;
  onError:(message:string)=>void;
  onSkip:()=>void;
}) {
  const container=useRef<HTMLDivElement>(null);
  const callbacks=useRef({onReady,onError,onSkip});
  callbacks.current={onReady,onError,onSkip};
  const [retry,setRetry]=useState(0);
  const [state,setState]=useState<'loading'|'ready'|'error'>('loading');
  const [failure,setFailure]=useState('');
  useEffect(()=>{
    let active=true,done=false;
    let viewer:Viewer|null=null;
    let checkTimer:ReturnType<typeof setInterval>|undefined;
    let timeoutTimer:ReturnType<typeof setTimeout>|undefined;
    const abort=new AbortController();
    setState('loading');setFailure('');
    const succeed=()=>{
      if(!active||done)return;
      done=true;setState('ready');callbacks.current.onReady();
    };
    const fail=(message:string)=>{
      if(!active||done)return;
      done=true;setState('error');setFailure(message);callbacks.current.onError(message);
    };
    timeoutTimer=setTimeout(()=>fail('Panorama 14 saniyede açılamadı. Bağlantını kontrol edip tekrar dene.'),MAX_WAIT_MS);
    void (async()=>{
      const media=round.media;
      // Browser-side check tells us if the R2 address / CORS / uploaded manifest is bad.
      if(media.mode==='multires'){
        const response=await fetch(media.base+'/config.json',{signal:abort.signal,cache:'no-store'});
        if(!response.ok)throw new Error('R2 görüntüsü açılamadı (HTTP '+response.status+').');
        const config=await response.json() as {multiRes?:unknown};
        if(!config.multiRes)throw new Error('R2 panorama manifest dosyası geçersiz.');
      }
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
      if(media.mode==='equirectangular')options.panorama=media.image;
      else options.multiRes={...media.config,basePath:media.base};
      viewer=window.pannellum.viewer(container.current,options);
      viewer.on('load',succeed);
      viewer.on('error',()=>fail('Panorama parçaları indirilemedi. Başka konuma geçebilirsin.'));
      // Some browsers may finish their initial render before the load listener attaches.
      if(viewer.isLoaded?.()===true)succeed();
      checkTimer=setInterval(()=>{if(viewer?.isLoaded?.()===true)succeed();},350);
    })().catch((e:unknown)=>{
      if(!active||done)return;
      const msg=e instanceof Error?e.message:'Panorama indirilemedi.';
      fail(/Failed to fetch|NetworkError|Load failed/i.test(msg)
        ? 'R2 bağlantısı veya CORS engellendi. Tekrar dene ya da bu turu geç.' : msg);
    });
    return()=>{
      active=false;abort.abort();
      if(timeoutTimer)clearTimeout(timeoutTimer);
      if(checkTimer)clearInterval(checkTimer);
      try{viewer?.destroy();}catch{/* Viewer was already unmounted */}
    };
  },[round.id,round.media,retry]);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-[20px] bg-[#0c2946]">
      <div ref={container} className="h-full w-full" aria-label="360 derece panorama; parmağınla dönerek etrafına bak"/>
      {state==='loading'&&(
        <div className="pointer-events-none absolute inset-0 z-10 grid place-items-center bg-[#102c49]/85 p-4 text-center text-sm font-bold text-blue-100" role="status">
          <span>360° panorama hazırlanıyor...</span>
        </div>
      )}
      {state==='error'&&(
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-[#0c2946]/95 p-5 text-center">
          <AlertCircle className="h-8 w-8 text-[#ffba94]"/>
          <p className="text-sm font-bold leading-6 text-blue-50">{failure}</p>
          <button type="button" className="street-primary w-full max-w-[260px]" onClick={()=>setRetry(n=>n+1)}>
            <RefreshCcw className="h-4 w-4"/> Tekrar dene
          </button>
          <button type="button" className="street-secondary w-full max-w-[260px]" onClick={()=>callbacks.current.onSkip()}>
            <SkipForward className="h-4 w-4"/> Bu turu geç (0 puan)
          </button>
        </div>
      )}
    </div>
  );
}
