import { useEffect, useRef, useState } from 'react';

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
}
declare global { interface Window {
  pannellum?:{viewer:(element:HTMLElement,config:Record<string,unknown>)=>Viewer};
}}
let loading:Promise<void>|null=null;
function ensurePannellum() {
  if (window.pannellum?.viewer) return Promise.resolve();
  if (loading) return loading;
  loading = new Promise<void>((resolve,reject)=>{
    const css=document.createElement('link');
    css.rel='stylesheet';
    css.href='https://cdn.jsdelivr.net/npm/pannellum@2.5.7/build/pannellum.css';
    document.head.appendChild(css);
    const js=document.createElement('script');
    js.async=true;
    js.src='https://cdn.jsdelivr.net/npm/pannellum@2.5.7/build/pannellum.js';
    js.onload=()=> window.pannellum?.viewer ? resolve() : reject(new Error('360° görüntüleyici yüklenemedi.'));
    js.onerror=()=>reject(new Error('360° görüntüleyici indirilmedi; bağlantını kontrol et.'));
    document.head.appendChild(js);
  }).catch((err:unknown)=>{loading=null;throw err;});
  return loading;
}
export function StreetPanorama({
  round,onReady,onError,
}:{
  round:StreetRound;
  onReady:()=>void;
  onError:(message:string)=>void;
}) {
  const container=useRef<HTMLDivElement>(null);
  const callbacks=useRef({onReady,onError});
  callbacks.current={onReady,onError};
  const [loadingView,setLoadingView]=useState(true);
  useEffect(()=>{
    let active=true;
    let viewer:Viewer|null=null;
    setLoadingView(true);
    void ensurePannellum().then(()=>{
      if(!active || !container.current || !window.pannellum) return;
      const media=round.media;
      const options:Record<string,unknown>={
        type:media.mode==='multires'?'multires':'equirectangular',
        autoLoad:true,showControls:true,showFullscreenCtrl:false,
        showZoomCtrl:true,mouseZoom:true,keyboardZoom:true,
        hfov:100,minHfov:45,maxHfov:120,
        compass:false,hotSpotDebug:false,
        draggable:true,friction:0.16,
        backgroundColor:[13/255,33/255,59/255],
      };
      if(media.mode==='equirectangular') options.panorama=media.image;
      else options.multiRes={...media.config,basePath:media.base};
      viewer=window.pannellum.viewer(container.current,options);
      viewer.on('load',()=>{if(active){setLoadingView(false);callbacks.current.onReady();}});
      viewer.on('error',()=>{if(active){setLoadingView(false);callbacks.current.onError('360° görüntü indirilemedi. Arşiv dosyasını kontrol et.');}});
    }).catch((e:unknown)=>{
      if(active){setLoadingView(false);callbacks.current.onError(e instanceof Error?e.message:'360° görüntü açılamadı.');}
    });
    return()=>{active=false;try{viewer?.destroy();}catch{/* DOM removed */}};
  },[round.id,round.media]);
  return (
    <div className="relative h-full w-full overflow-hidden rounded-[20px] bg-[#0c2946]">
      <div ref={container} className="h-full w-full" aria-label="360 derece panorama; parmağınla dönerek etrafına bak"/>
      {loadingView&&<div className="pointer-events-none absolute inset-0 z-10 grid place-items-center bg-[#102c49]/90 text-sm font-bold text-blue-100">
        360° panorama yükleniyor...
      </div>}
    </div>
  );
}
