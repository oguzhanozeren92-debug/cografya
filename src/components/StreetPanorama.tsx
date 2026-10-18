import { useEffect, useRef, useState } from 'react';
import type { Coordinates, StreetLocation } from '@/lib/streetLocations';

export type GoogleMaps = {
  maps: {
    StreetViewSource: { OUTDOOR: string };
    Map: new (element: HTMLElement, options: Record<string,unknown>) => {
      addListener(event:string, handler:(e:{latLng?:{lat():number;lng():number}})=>void):{remove():void};
      setZoom(level:number):void;
      getZoom():number|undefined;
    };
    Marker: new (options:Record<string,unknown>) => {setMap(value:null):void};
    Polyline: new (options:Record<string,unknown>) => {setMap(value:null):void};
    StreetViewService: new () => {
      getPanorama(req: { location: Coordinates; radius: number; source: string }): Promise<{
        data: { location?: { pano?: string; latLng?: { lat():number; lng():number } } }
      }>;
    };
    StreetViewPanorama: new (element:HTMLElement, options:Record<string,unknown>) => {
      setVisible(visible:boolean):void;
    };
  };
};
declare global { interface Window { google?: GoogleMaps } }
let loader:Promise<void>|null=null;
function ensureGoogleStreetView(key:string):Promise<void> {
  if(window.google?.maps?.StreetViewService) return Promise.resolve();
  if(loader)return loader;
  loader=new Promise((resolve,reject)=>{
    const script=document.createElement('script');
    script.src='https://maps.googleapis.com/maps/api/js?key='+encodeURIComponent(key)+'&v=weekly&loading=async';
    script.async=true;
    script.onerror=()=>reject(new Error('Google Street View yüklenemedi. Bağlantıyı ve Maps API anahtarını kontrol et.'));
    script.onload=()=> {
      if(window.google?.maps?.StreetViewService)resolve();
      else reject(new Error('Google Maps anahtarı reddedildi veya Street View kullanılamıyor.'));
    };
    document.head.appendChild(script);
  }).catch((error:unknown)=>{loader=null;throw error});
  return loader;
}
export async function getGoogleMaps(key:string):Promise<GoogleMaps> {
  await ensureGoogleStreetView(key);
  if (!window.google) throw new Error('Google Maps kullanılamıyor.');
  return window.google;
}

export interface StreetPanoramaProps {
  location:StreetLocation;
  apiKey:string;
  onReady:(p:Coordinates)=>void;
  onError:(reason:string)=>void;
}
export function StreetPanorama({location,apiKey,onReady,onError}:StreetPanoramaProps) {
  const element=useRef<HTMLDivElement>(null);
  const [loading,setLoading]=useState(true);
  useEffect(()=>{
    let cancelled=false;
    let panorama:{setVisible(visible:boolean):void}|null=null;
    setLoading(true);
    void ensureGoogleStreetView(apiKey).then(async ()=>{
      const g=window.google;
      if(!g)throw new Error('Google Street View açılamadı.');
      const service=new g.maps.StreetViewService();
      const result=await service.getPanorama({
        location:{lat:location.lat,lng:location.lng},
        radius:140,
        source:g.maps.StreetViewSource.OUTDOOR,
      });
      if(cancelled)return;
      const data=result.data.location;
      const point=data?.latLng;
      if(!point || !element.current)throw new Error('Bu bölgede kullanılabilir sokak görüntüsü bulunamadı. Başka bir konum deneyelim.');
      panorama=new g.maps.StreetViewPanorama(element.current,{
        pano:data?.pano,
        position:{lat:point.lat(),lng:point.lng()},
        pov:{heading:location.heading,pitch:0},
        zoom:0,
        visible:true,
        addressControl:false,
        linksControl:false,
        clickToGo:false,
        fullscreenControl:false,
        enableCloseButton:false,
        showRoadLabels:false,
        motionTracking:false,
        motionTrackingControl:false,
        panControl:false,
        zoomControl:true,
      });
      setLoading(false);
      onReady({lat:point.lat(),lng:point.lng()});
    }).catch((e:unknown)=>{
      if(!cancelled){
        setLoading(false);
        onError(e instanceof Error ? e.message : 'Sokak görüntüsü açılmadı.');
      }
    });
    return ()=>{cancelled=true;panorama?.setVisible(false)};
    // The owner mounts this view with a location-id key, one panorama per round.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[location.id,apiKey]);
  return (
    <div className="street-pano-frame relative h-full w-full overflow-hidden rounded-[22px] bg-[#112340]">
      <div ref={element} className="absolute inset-0" aria-label="Google Street View 360 derece sokak görüntüsü"/>
      {loading && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-[#0d2342] text-[#def4ff]">
          <span className="h-10 w-10 animate-spin rounded-full border-[3px] border-[#9ddde6] border-t-transparent"/>
          <span className="text-sm font-bold">Sokak görüntüsü hazırlanıyor...</span>
        </div>
      )}
    </div>
  );
}
