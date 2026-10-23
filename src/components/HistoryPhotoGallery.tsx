import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink, Images, Maximize2, X } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

type Localized={tr:string;en:string};
export type HistoryGalleryImage={
  id:string;
  caption:Localized;
  url:string;
  credit:{artist:string;license:string;licenseUrl?:string;source:string};
};
export function HistoryPhotoGallery({images,caseId}:{
  images:HistoryGalleryImage[];caseId:string;
}){
  const {language}=useLanguage();
  const tr=language==='tr';
  const [index,setIndex]=useState<number|null>(null);
  const [broken,setBroken]=useState<Record<string,boolean>>({});

  useEffect(()=>{setIndex(null);setBroken({});},[caseId]);
  useEffect(()=>{
    if(index===null)return;
    const old=document.body.style.overflow;
    document.body.style.overflow='hidden';
    const keys=(e:KeyboardEvent)=>{
      if(e.key==='Escape')setIndex(null);
      if(e.key==='ArrowRight')setIndex(x=>x===null?null:(x+1)%images.length);
      if(e.key==='ArrowLeft')setIndex(x=>x===null?null:(x-1+images.length)%images.length);
    };
    window.addEventListener('keydown',keys);
    return()=>{document.body.style.overflow=old;window.removeEventListener('keydown',keys);};
  },[index,images.length]);
  const clean=images.filter(x=>x?.url?.startsWith('https://commons.wikimedia.org/')||
    x?.url?.startsWith('https://upload.wikimedia.org/')||
    x?.url?.startsWith('https://thumb.wikimedia.org/'));
  const current=index===null?null:clean[index]??null;
  if(clean.length===0)return null;

  return (
    <>
      <section className="rounded-2xl border border-amber-200/20 bg-[#172d43] p-3">
        <div className="mb-2 flex items-start justify-between gap-2">
          <div>
            <h2 className="flex items-center gap-2 text-sm font-black text-amber-100">
              <Images className="h-4 w-4 text-amber-200"/>
              {tr?'Görsel İpuçları':'Visual clues'}
            </h2>
            <p className="mt-1 text-[11px] leading-4 text-blue-100/70">
              {tr?'Panoramadan farklı detayları incele. Fotoğrafa dokunup büyüt.':
                'Examine details beyond the panorama. Tap a photo to enlarge it.'}
            </p>
          </div>
          <span className="rounded-full border border-white/15 bg-white/10 px-2 py-1 text-[10px] font-extrabold tabular-nums text-white">
            {clean.length} {tr?'foto':'photos'}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {clean.map((item,i)=>(
            <button key={item.id} type="button" onClick={()=>setIndex(i)}
              className="group min-w-0 overflow-hidden rounded-xl border border-amber-200/20 bg-[#0b2137] text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300">
              <div className="relative aspect-[4/3] overflow-hidden bg-[#102d46]">
                {!broken[item.id]?(
                  <img src={item.url} alt={item.caption[tr?'tr':'en']}
                    loading="lazy" decoding="async"
                    onError={()=>setBroken(v=>({...v,[item.id]:true}))}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"/>
                ):(
                  <div className="grid h-full place-items-center px-2 text-center text-[10px] text-orange-100">
                    {tr?'Fotoğraf yüklenemedi':'Image unavailable'}
                  </div>
                )}
                <Maximize2 className="absolute right-2 top-2 h-6 w-6 rounded-md bg-black/65 p-1 text-white"/>
              </div>
              <div className="px-2 py-2">
                <p className="min-h-8 text-[11px] font-bold leading-4 text-white">
                  {item.caption[tr?'tr':'en']}
                </p>
                <p className="mt-1 truncate text-[9px] text-amber-100/75">
                  {item.credit.artist} · {item.credit.license}
                </p>
              </div>
            </button>
          ))}
        </div>
      </section>
      {current&&index!==null&&(
        <div className="fixed inset-0 z-[160] flex flex-col bg-[#061629]/98 text-white"
          role="dialog" aria-modal="true" aria-label={tr?'Fotoğraf detayını büyüt':'Enlarged historical photo'}>
          <div className="flex items-center justify-between px-4 pb-2 pt-[max(12px,env(safe-area-inset-top))]">
            <span className="text-xs font-black text-amber-100">{index+1} / {clean.length}</span>
            <button type="button" onClick={()=>setIndex(null)}
              aria-label={tr?'Fotoğrafı kapat':'Close photo'}
              className="grid h-10 w-10 place-items-center rounded-full border border-white/25 bg-white/10">
              <X className="h-5 w-5"/>
            </button>
          </div>
          <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-auto p-3">
            <img src={current.url} alt={current.caption[tr?'tr':'en']}
              className="max-h-full max-w-full select-none object-contain"
              draggable={false}/>
            {clean.length>1&&(
              <>
                <button type="button" aria-label={tr?'Önceki fotoğraf':'Previous photo'}
                  className="absolute left-2 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-black/70"
                  onClick={()=>setIndex((index-1+clean.length)%clean.length)}>
                  <ChevronLeft className="h-6 w-6"/>
                </button>
                <button type="button" aria-label={tr?'Sonraki fotoğraf':'Next photo'}
                  className="absolute right-2 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-black/70"
                  onClick={()=>setIndex((index+1)%clean.length)}>
                  <ChevronRight className="h-6 w-6"/>
                </button>
              </>
            )}
          </div>
          <div className="space-y-1 border-t border-white/10 bg-[#0a2138] px-4 pb-[max(18px,env(safe-area-inset-bottom))] pt-3">
            <p className="text-sm font-black">{current.caption[tr?'tr':'en']}</p>
            <p className="text-[11px] text-blue-100/80">
              {current.credit.artist} · {current.credit.license}
            </p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] font-bold text-amber-200">
              <a href={current.credit.source} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1 underline">
                <ExternalLink className="h-3 w-3"/>{tr?'Görsel kaynağı':'Image source'}
              </a>
              {current.credit.licenseUrl&&(
                <a href={current.credit.licenseUrl} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 underline">
                  {tr?'Lisans şartları':'License terms'}
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
