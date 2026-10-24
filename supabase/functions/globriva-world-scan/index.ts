import "jsr:@supabase/functions-js/edge-runtime.d.ts";
// Public-resource photo discovery for Globriva. Requires a valid project's JWT.
// Read-only: no database, storage, image approval or user data.
const CITIES=[{"id":"01","city":"Cape Town","country":"Güney Afrika","region":"Africa","lat":-33.925,"lng":18.424},{"id":"02","city":"Marakeş","country":"Fas","region":"Africa","lat":31.629,"lng":-7.989},{"id":"03","city":"Zanzibar (Stone Town)","country":"Tanzanya","region":"Africa","lat":-6.163,"lng":39.189},{"id":"04","city":"Nairobi","country":"Kenya","region":"Africa","lat":-1.286,"lng":36.817},{"id":"05","city":"Dakar","country":"Senegal","region":"Africa","lat":14.692,"lng":-17.447},{"id":"06","city":"Buenos Aires","country":"Arjantin","region":"South America","lat":-34.603,"lng":-58.381},{"id":"07","city":"Cusco","country":"Peru","region":"South America","lat":-13.516,"lng":-71.978},{"id":"08","city":"Cartagena","country":"Kolombiya","region":"South America","lat":10.424,"lng":-75.551},{"id":"09","city":"Santiago","country":"Şili","region":"South America","lat":-33.448,"lng":-70.669},{"id":"10","city":"La Paz","country":"Bolivya","region":"South America","lat":-16.5,"lng":-68.15},{"id":"11","city":"Seul","country":"Güney Kore","region":"East Asia","lat":37.566,"lng":126.978},{"id":"12","city":"Kyoto","country":"Japonya","region":"East Asia","lat":35.011,"lng":135.768},{"id":"13","city":"Pekin","country":"Çin","region":"East Asia","lat":39.904,"lng":116.407},{"id":"14","city":"Hong Kong","country":"Çin","region":"East Asia","lat":22.319,"lng":114.169},{"id":"15","city":"Bangkok","country":"Tayland","region":"Southeast Asia","lat":13.752,"lng":100.502},{"id":"16","city":"Hanoi","country":"Vietnam","region":"Southeast Asia","lat":21.028,"lng":105.854},{"id":"17","city":"Singapur","country":"Singapur","region":"Southeast Asia","lat":1.289,"lng":103.85},{"id":"18","city":"Katmandu","country":"Nepal","region":"South Asia","lat":27.717,"lng":85.324},{"id":"19","city":"Petra (Wadi Musa)","country":"Ürdün","region":"West Asia","lat":30.322,"lng":35.478},{"id":"20","city":"Wellington","country":"Yeni Zelanda","region":"Oceania","lat":-41.286,"lng":174.776}];
const VALID=new Set(["CC BY 2.0","CC BY 3.0","CC BY 4.0","CC BY-SA 2.0","CC BY-SA 3.0","CC BY-SA 4.0","CC0","Public domain"]);
const headers={"content-type":"application/json; charset=utf-8","cache-control":"public, max-age=600","access-control-allow-origin":"*","access-control-allow-headers":"authorization,apikey,content-type","access-control-allow-methods":"GET,OPTIONS"};
const send=(obj,status=200)=>new Response(JSON.stringify(obj),{status,headers});
const plain=v=>String(v||"").replace(/<[^>]*>/g," ").replace(/&(?:amp|quot|nbsp);/gi," ").replace(/\s+/g," ").trim().slice(0,160);
function km(a,b,c,d){const rad=Math.PI/180,lat=(c-a)*rad,lon=(d-b)*rad;const v=Math.sin(lat/2)**2+Math.cos(a*rad)*Math.cos(c*rad)*Math.sin(lon/2)**2;return Math.round(12742*Math.atan2(Math.sqrt(v),Math.sqrt(1-v))*10)/10}
Deno.serve(async (req:Request)=>{
 if(req.method==="OPTIONS")return new Response(null,{status:204,headers});
 if(req.method!=="GET")return send({error:"Only GET supported"},405);
 const id=new URL(req.url).searchParams.get("id")||"01";
 if(!/^\d{2}$/.test(id))return send({error:"Invalid city ID"},400);
 const place=CITIES.find(x=>x.id===id);if(!place)return send({error:"Unknown city"},404);
 const url=new URL("https://commons.wikimedia.org/w/api.php");
 const args={action:"query",format:"json",generator:"geosearch",ggscoord:place.lat+"|"+place.lng,ggsradius:"10000",ggsnamespace:"6",ggslimit:"50",prop:"imageinfo|coordinates",iiprop:"url|size|extmetadata",iiurlwidth:"480",colimit:"50"};
 for(const [key,val] of Object.entries(args))url.searchParams.set(key,String(val));
 try{
  const reply=await fetch(url,{headers:{"User-Agent":"GlobrivaWorldResearch/1.0 (https://github.com/oguzhanozeren92-debug/cografya)","Accept":"application/json"},signal:AbortSignal.timeout(14000)});
  if(!reply.ok)throw Error("Commons "+reply.status);
  const json=await reply.json(),pages=Object.values(json.query?.pages||{}),images=[];
  for(const item of pages){
   const picture=item.imageinfo?.[0],pos=item.coordinates?.[0];
   if(!picture||!pos||!/^File:.+\.jpe?g$/i.test(item.title||""))continue;
   const lic=plain(picture.extmetadata?.LicenseShortName?.value),artist=plain(picture.extmetadata?.Artist?.value);
   const meters=km(place.lat,place.lng,pos.lat,pos.lon);
   if(!VALID.has(lic)||!artist||meters>12||picture.width<1600||picture.height<850||
      picture.width/picture.height<1.2||picture.width/picture.height>3.2)continue;
   if(!picture.url?.startsWith("https://upload.wikimedia.org/"))continue;
   images.push({title:item.title,source:picture.descriptionurl,photographer:artist,license:lic,
    licenseUrl:plain(picture.extmetadata?.LicenseUrl?.value),lat:pos.lat,lng:pos.lon,
    distanceKm:meters,width:picture.width,height:picture.height,thumbnail:picture.thumburl||null,
    status:"candidate_needs_editorial_review"});
  }
  images.sort((a,b)=>a.distanceKm-b.distanceKm||b.width*b.height-a.width*a.height);
  return send({ok:true,id:place.id,city:place.city,country:place.country,region:place.region,
   checkedPages:pages.length,found:images.length,candidates:images.slice(0,15),
   notice:"Metadata candidates only; no licensing, location or editorial approval implied."});
 }catch(e){return send({ok:false,id:place.id,city:place.city,error:"Wikimedia search unavailable",reason:String(e.message||e).slice(0,120)},503)}
});
