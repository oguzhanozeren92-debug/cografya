import { useEffect, useRef, useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import { getGoogleMaps, type GoogleMaps } from '@/components/StreetPanorama';
import type { Coordinates } from '@/lib/streetLocations';

type MapInstance=InstanceType<GoogleMaps['maps']['Map']>;
type Marker=InstanceType<GoogleMaps['maps']['Marker']>;
type Polyline=InstanceType<GoogleMaps['maps']['Polyline']>;

export function StreetWorldMap({
  guess,actual,onGuess,locked,apiKey,
}:{
  guess:Coordinates|null;
  actual?:Coordinates|null;
  onGuess:(point:Coordinates)=>void;
  locked?:boolean;
  apiKey:string;
}) {
  const element=useRef<HTMLDivElement>(null);
  const map=useRef<MapInstance|null>(null);
  const googleMaps=useRef<GoogleMaps|null>(null);
  const onGuessRef=useRef(onGuess);
  const lockedRef=useRef(Boolean(locked));
  const [ready,setReady]=useState(false);
  const [error,setError]=useState('');
  onGuessRef.current=onGuess;
  lockedRef.current=Boolean(locked);

  useEffect(()=>{
    let cancelled=false;
    let clickHandler:{remove():void}|null=null;
    void getGoogleMaps(apiKey).then(google=>{
      if(cancelled||!element.current)return;
      const instance=new google.maps.Map(element.current,{
        center:{lat:16,lng:10},zoom:2,minZoom:2,maxZoom:16,
        streetViewControl:false,
        fullscreenControl:false,
        mapTypeControl:false,
        rotateControl:false,
        scaleControl:true,
        zoomControl:false,
        gestureHandling:'greedy',
        clickableIcons:false,
        backgroundColor:'#173856',
        styles:[
          {featureType:'water',elementType:'geometry',stylers:[{color:'#163e63'}]},
          {featureType:'landscape',elementType:'geometry',stylers:[{color:'#5a8c78'}]},
          {featureType:'administrative.country',elementType:'geometry.stroke',stylers:[{color:'#d0e4db'},{weight:1}]},
          {featureType:'poi',stylers:[{visibility:'off'}]},
          {featureType:'road',stylers:[{visibility:'off'}]},
          {elementType:'labels.text.fill',stylers:[{color:'#213c4f'}]},
          {elementType:'labels.text.stroke',stylers:[{color:'#d9e8cf'}]},
        ],
      });
      googleMaps.current=google;
      map.current=instance;
      clickHandler=instance.addListener('click',event=>{
        if(lockedRef.current||!event.latLng)return;
        onGuessRef.current({lat:event.latLng.lat(),lng:event.latLng.lng()});
      });
      setReady(true);
    }).catch((e:unknown)=>{
      if(!cancelled)setError(e instanceof Error?e.message:'Google haritası açılamadı.');
    });
    return()=>{cancelled=true;clickHandler?.remove();map.current=null;googleMaps.current=null;};
  },[apiKey]);

  useEffect(()=>{
    if(!ready||!googleMaps.current||!map.current)return;
    const google=googleMaps.current,m=map.current;
    const marks:(Marker|Polyline)[]=[];
    if(guess)marks.push(new google.maps.Marker({
      map:m,position:guess,title:'Senin tahminin',
      icon:'https://maps.google.com/mapfiles/ms/icons/orange-dot.png',
    }));
    if(actual)marks.push(new google.maps.Marker({
      map:m,position:actual,title:'Gerçek konum',
      icon:'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
    }));
    if(actual&&guess)marks.push(new google.maps.Polyline({
      map:m,path:[guess,actual],geodesic:true,
      strokeColor:'#fff0a2',strokeOpacity:.95,strokeWeight:3,
    }));
    return()=>{for(const mark of marks)mark.setMap(null)};
  },[guess?.lat,guess?.lng,actual?.lat,actual?.lng,ready]);

  return (
    <div className="street-map relative overflow-hidden rounded-[20px] border border-[#5c839e]/55 bg-[#102944]">
      <div ref={element} className="h-[min(45dvh,355px)] min-h-[244px] w-full"
        role="application" aria-label="Google dünya haritası. Dokunarak konum tahmin et, iki parmakla veya artı eksi tuşlarıyla yakınlaştır."/>
      {!ready&&<div className="pointer-events-none absolute inset-0 grid place-items-center bg-[#143551] p-5 text-center text-sm font-bold text-white">
        {error||'Google dünya haritası hazırlanıyor...'}
      </div>}
      {ready&&<div className="pointer-events-none absolute right-3 top-3 rounded-lg bg-[#0d2945]/85 px-2 py-1 text-[10px] font-bold text-white">
        {locked?'🟠 Tahmin · 🟢 Gerçek':guess?'📍 Tahmin seçildi':'Haritada dokunarak işaretle'}
      </div>}
      <div className="absolute right-3 top-10 flex flex-col gap-2">
        <button type="button" onClick={()=>map.current?.setZoom(Math.min(16,(map.current.getZoom()??2)+1))}
          aria-label="Yakınlaştır" className="street-map-button"><Plus className="h-4 w-4"/></button>
        <button type="button" onClick={()=>map.current?.setZoom(Math.max(2,(map.current.getZoom()??2)-1))}
          aria-label="Uzaklaştır" className="street-map-button"><Minus className="h-4 w-4"/></button>
      </div>
    </div>
  );
}
