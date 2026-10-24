// Globriva Commons world photo research. Read-only: never approves or publishes images.
// Works independently of GitHub Actions runner quotas.
const TARGETS=[{"id":"01","city":"Cape Town","country":"Güney Afrika","region":"Africa","lat":-33.925,"lng":18.424},{"id":"02","city":"Marakeş","country":"Fas","region":"Africa","lat":31.629,"lng":-7.989},{"id":"03","city":"Zanzibar (Stone Town)","country":"Tanzanya","region":"Africa","lat":-6.163,"lng":39.189},{"id":"04","city":"Nairobi","country":"Kenya","region":"Africa","lat":-1.286,"lng":36.817},{"id":"05","city":"Dakar","country":"Senegal","region":"Africa","lat":14.692,"lng":-17.447},{"id":"06","city":"Buenos Aires","country":"Arjantin","region":"South America","lat":-34.603,"lng":-58.381},{"id":"07","city":"Cusco","country":"Peru","region":"South America","lat":-13.516,"lng":-71.978},{"id":"08","city":"Cartagena","country":"Kolombiya","region":"South America","lat":10.424,"lng":-75.551},{"id":"09","city":"Santiago","country":"Şili","region":"South America","lat":-33.448,"lng":-70.669},{"id":"10","city":"La Paz","country":"Bolivya","region":"South America","lat":-16.5,"lng":-68.15},{"id":"11","city":"Seul","country":"Güney Kore","region":"East Asia","lat":37.566,"lng":126.978},{"id":"12","city":"Kyoto","country":"Japonya","region":"East Asia","lat":35.011,"lng":135.768},{"id":"13","city":"Pekin","country":"Çin","region":"East Asia","lat":39.904,"lng":116.407},{"id":"14","city":"Hong Kong","country":"Çin","region":"East Asia","lat":22.319,"lng":114.169},{"id":"15","city":"Bangkok","country":"Tayland","region":"Southeast Asia","lat":13.752,"lng":100.502},{"id":"16","city":"Hanoi","country":"Vietnam","region":"Southeast Asia","lat":21.028,"lng":105.854},{"id":"17","city":"Singapur","country":"Singapur","region":"Southeast Asia","lat":1.289,"lng":103.85},{"id":"18","city":"Katmandu","country":"Nepal","region":"South Asia","lat":27.717,"lng":85.324},{"id":"19","city":"Petra (Wadi Musa)","country":"Ürdün","region":"West Asia","lat":30.322,"lng":35.478},{"id":"20","city":"Wellington","country":"Yeni Zelanda","region":"Oceania","lat":-41.286,"lng":174.776}];
const ALLOWED=new Set(["CC BY 2.0","CC BY 3.0","CC BY 4.0","CC BY-SA 2.0","CC BY-SA 3.0","CC BY-SA 4.0","CC0","Public domain"]);
function plain(s){return String(s||"").replace(/<[^>]*>/g," ").replace(/&(?:amp|nbsp|quot);/ig," ").replace(/\s+/g," ").trim().slice(0,200)}
function distance(lat1,lon1,lat2,lon2){const rad=Math.PI/180,dlat=(lat2-lat1)*rad,dlon=(lon2-lon1)*rad;const a=Math.sin(dlat/2)**2+Math.cos(lat1*rad)*Math.cos(lat2*rad)*Math.sin(dlon/2)**2;return Math.round(6371*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a))*10)/10}
const DATE_RE=/^\d{4}-\d{2}-\d{2}$/;
export default async function handler(req,res){
 res.setHeader("Cache-Control","public, s-maxage=900, stale-while-revalidate=3600");
 if(req.method!=="GET")return res.status(405).json({error:"Only GET supported"});
 const raw=String(req.query?.id||"01");
 if(!/^\d{2}$/.test(raw))return res.status(400).json({error:"Use numeric two-digit city ID"});
 const place=TARGETS.find(x=>x.id===raw);
 if(!place)return res.status(404).json({error:"Unknown coverage-plan city"});
 const api=new URL("https://commons.wikimedia.org/w/api.php");
 const params={action:"query",format:"json",generator:"geosearch",ggscoord:place.lat+"|"+place.lng,
  ggsradius:"10000",ggsnamespace:"6",ggslimit:"50",prop:"imageinfo|coordinates",
  iiprop:"url|size|extmetadata",iiurlwidth:"480",colimit:"50"};
 for(const [key,val] of Object.entries(params))api.searchParams.set(key,val);
 try{
  const r=await fetch(api.toString(),{headers:{"User-Agent":"GlobrivaWorldResearch/1.0 (https://github.com/oguzhanozeren92-debug/cografya)","Accept":"application/json"},signal:AbortSignal.timeout(14500)});
  if(!r.ok)throw new Error("Commons API HTTP "+r.status);
  const payload=await r.json(),pages=Object.values(payload.query?.pages||{}),result=[];
  const seen=new Set();
  for(const page of pages){
   const info=page.imageinfo?.[0],pos=page.coordinates?.[0];if(!info||!pos||!/^File:.+\.jpe?g$/i.test(page.title||""))continue;
   const license=plain(info.extmetadata?.LicenseShortName?.value),artist=plain(info.extmetadata?.Artist?.value);
   const licenceUrl=plain(info.extmetadata?.LicenseUrl?.value),name=String(page.title||"");
   const km=distance(place.lat,place.lng,pos.lat,pos.lon);
   if(!ALLOWED.has(license)||!artist||!info.url?.startsWith("https://upload.wikimedia.org/"))continue;
   if(info.width<1600||info.height<850||info.width/info.height<1.2||info.width/info.height>3.2||km>12)continue;
   if(seen.has(name))continue;seen.add(name);
   result.push({title:name,source:info.descriptionurl||"https://commons.wikimedia.org/wiki/"+encodeURIComponent(name).replace(/%3A/i,":"),
    photographer:artist,license,licenseUrl:licenceUrl,lat:pos.lat,lng:pos.lon,distanceKm:km,
    width:info.width,height:info.height,thumbnail:info.thumburl||null,status:"candidate_needs_editorial_review"});
  }
  result.sort((a,b)=>a.distanceKm-b.distanceKm||b.width*b.height-a.width*a.height);
  return res.status(200).json({ok:true,city:place.city,country:place.country,region:place.region,id:place.id,
   candidates:result.slice(0,15),found:result.length,checkedPages:pages.length,
   notice:"Commons licensing and geotags are preliminary. Photos still require full visual, subject, location and attribution checks before game publication."});
 }catch(e){
  res.setHeader("Cache-Control","no-store");
  return res.status(503).json({ok:false,city:place.city,id:place.id,candidates:[],
    error:"Wikimedia Commons could not be reached",reason:String(e.message||e).slice(0,140)});
 }
}
