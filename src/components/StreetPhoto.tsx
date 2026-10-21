import { useEffect, useRef, useState } from 'react';
import { AlertCircle, ChevronLeft, ChevronRight, Maximize2, Minimize2, Minus, Plus, RefreshCcw, SkipForward } from 'lucide-react';
import type { StreetRound, PanoramaMedia } from '@/components/StreetPanorama';
import { useLanguage } from '@/lib/i18n';

/**
 * Lightweight, static photo player. Uses the already-published cube-face JPEGs
 * from the licensed Pannellum archive; does not download Pannellum or WebGL tiles.
 * Direction arrows change among ordinary square photos, not a 360° canvas.
 */
const FACES=['f','r','b','l'] as const;
const LABELS=['Ön','Sağ','Arka','Sol'];
function photoUrl(media:PanoramaMedia, face:string, index=0):string {
  if(media.mode==='gallery')return media.images[index]?.url || '';
  if(media.mode==='equirectangular')return media.image;
  if(media.staticBase)return media.staticBase.replace(/\/+$/,'')+'/'+face+'.jpg';
  const template=media.config.fallbackPath ?? '/fallback/%s';
  const filename=template.replace('%s',face).replace(/^\/+/,'');
  const extension=media.config.extension.replace(/[^a-z0-9]/gi,'') || 'jpg';
  return media.base.replace(/\/+$/,'')+'/'+filename+'.'+extension;
}
export function warmStreetPhoto(round?:StreetRound):void {
  if(!round||typeof window==='undefined')return;
  const url=photoUrl(round.media,'f');
  if(!/^https:\/\//.test(url)&&!url.startsWith('/'))return;
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
  const {t}=useLanguage();
  const [face,setFace]=useState(0);
  const gallery=round.media.mode==='gallery';
  const totalPhotos=gallery?round.media.images.length:FACES.length;
  const [retry,setRetry]=useState(0);
  const [state,setState]=useState<'loading'|'ready'|'error'>('loading');
  const [failure,setFailure]=useState('');
  const [fullscreen,setFullscreen]=useState(false);
  const [zoom,setZoom]=useState(1);
  const readyFired=useRef(false);
  const handlers=useRef({onReady,onError,onSkip});
  handlers.current={onReady,onError,onSkip};
  useEffect(()=>{
    if(!fullscreen)return;
    const previous=document.body.style.overflow;
    document.body.style.overflow='hidden';
    const onKey=(event:KeyboardEvent)=>{if(event.key==='Escape')setFullscreen(false);};
    window.addEventListener('keydown',onKey);
    return()=>{document.body.style.overflow=previous;window.removeEventListener('keydown',onKey);};
  },[fullscreen]);
  useEffect(()=>{
    readyFired.current=false;
    setFace(0);setState('loading');setFailure('');setFullscreen(false);setZoom(1);
  },[round.id,round.media]);
  useEffect(()=>{
    if(state!=='loading')return;
    const timeout=setTimeout(()=>{
      setState('error');
      const msg=t('Fotoğraf açılamadı. Tekrar dene veya bu turu geç.');
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
    if(!gallery&&face!==0&&readyFired.current){
      setFace(0); // A secondary angle is optional; return to already-cached front photo.
      setState('loading');
      return;
    }
    const msg=t('Fotoğraf indirilemedi. Tekrar dene veya bu turu geç.');
    setFailure(msg);setState('error');handlers.current.onError(msg);
  };
  const changeFace=(delta:number)=>{
    if(state!=='ready')return;
    setFace(v=>(v+delta+totalPhotos)%totalPhotos);
    setZoom(1);
    setState('loading');
  };
  const src=photoUrl(round.media,FACES[face] || 'f',face);
  return (
    <div className={fullscreen
      ? 'fixed inset-0 z-[120] h-[100dvh] w-screen overflow-hidden bg-[#071426]'
      : 'relative h-full w-full overflow-hidden rounded-[20px] bg-[#112b45]'}>
      {state!=='error'&&(
        <img key={round.id+'-'+face+'-'+retry} src={src} alt={t("Konumdan bir fotoğraf; çevreyi inceleyip haritada tahmin et.")}
          decoding="async" loading="eager" fetchPriority="high" draggable={false}
          className={fullscreen?'h-full w-full object-contain select-none transition-transform duration-150':'h-full w-full object-cover select-none'}
          style={fullscreen?{transform:'scale('+zoom+')'}:undefined}
          onLoad={handleLoad} onError={handleError}/>
      )}
      {state==='loading'&&<div role="status"
        className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-[#0b2341]/90 px-4 py-2 text-xs font-bold text-white">
        {t('Fotoğraf açılıyor...')}
      </div>}
      {state==='ready'&&(
        <button type="button" onClick={()=>{setFullscreen(v=>!v);setZoom(1);}}
          aria-label={t(fullscreen?'Tam ekrandan çık':'Fotoğrafı tam ekran göster')}
          className="absolute right-3 top-[max(12px,env(safe-area-inset-top))] z-30 rounded-full border border-white/30 bg-[#0b2341]/90 p-2.5 text-white">
          {fullscreen?<Minimize2 className="h-5 w-5"/>:<Maximize2 className="h-5 w-5"/>}
        </button>
      )}
      {fullscreen&&state==='ready'&&(
        <div className="absolute bottom-[max(20px,env(safe-area-inset-bottom))] left-1/2 z-30 flex -translate-x-1/2 items-center gap-3 rounded-full border border-white/20 bg-[#0b2341]/90 px-3 py-2 text-white">
          <button type="button" aria-label={t("Uzaklaştır")} disabled={zoom<=1} onClick={()=>setZoom(v=>Math.max(1,Math.round((v-0.25)*100)/100))} className="p-2 disabled:opacity-40"><Minus className="h-5 w-5"/></button>
          <span className="min-w-[45px] text-center text-xs font-bold">{Math.round(zoom*100)}%</span>
          <button type="button" aria-label={t("Yakınlaştır")} disabled={zoom>=2.5} onClick={()=>setZoom(v=>Math.min(2.5,Math.round((v+0.25)*100)/100))} className="p-2 disabled:opacity-40"><Plus className="h-5 w-5"/></button>
        </div>
      )}
      {state==='ready'&&(round.media.mode==='multires'||(gallery&&totalPhotos>=2))&&(
        <>
          <button type="button" aria-label={t("Fotoğrafta sola bak")} onClick={()=>changeFace(-1)}
            className="absolute z-20 left-2 top-1/2 -translate-y-1/2 rounded-full border border-white/30 bg-[#0b2341]/75 p-2.5 text-white">
            <ChevronLeft className="h-5 w-5"/>
          </button>
          <button type="button" aria-label={t("Fotoğrafta sağa bak")} onClick={()=>changeFace(1)}
            className="absolute z-20 right-2 top-1/2 -translate-y-1/2 rounded-full border border-white/30 bg-[#0b2341]/75 p-2.5 text-white">
            <ChevronRight className="h-5 w-5"/>
          </button>
          <span className="pointer-events-none absolute bottom-2 right-3 rounded-full bg-[#0b2341]/75 px-2.5 py-1 text-[10px] font-bold text-white">
            {gallery ? `${t('Fotoğraf')} ${face+1}/${totalPhotos}` : `${t(LABELS[face])} ${t('görünüş')}`}
          </span>
        </>
      )}
      {state==='error'&&(
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#112b45] p-5 text-center">
          <AlertCircle className="h-8 w-8 text-[#ffba94]"/>
          <p className="text-sm font-bold text-white">{failure}</p>
          <button type="button" className="street-primary w-full max-w-[260px]"
            onClick={()=>{setRetry(x=>x+1);setFace(0);setState('loading');}}>
            <RefreshCcw className="h-4 w-4"/> {t('Tekrar dene')}
          </button>
          {onSkip&&<button type="button" className="street-secondary w-full max-w-[260px]"
            onClick={()=>handlers.current.onSkip?.()}>
            <SkipForward className="h-4 w-4"/> {t('Bu turu geç (0 puan)')}
          </button>}
        </div>
      )}
    </div>
  );
}
