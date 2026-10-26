#!/usr/bin/env node
/**
 * Open Content Collector v1. Shared, cautious research pipeline for Globriva / EraAtlas.
 * Source-backed image bytes, provenance, deduplication and editable question drafts.
 * NEVER adds draft material to a playable question bank or grants editorial approval.
 * Only Node 22 built-ins; safe to run unattended in GitHub Actions.
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import assert from "node:assert/strict";

const APP = process.env.CONTENT_APP;
if (!["globriva", "eraatlas"].includes(APP)) throw new Error("Set CONTENT_APP=globriva or eraatlas");
const DIR = "data/open-content";
const MEDIA = APP === "globriva" ? "public/open-content/photos" : "media/open-content";
const DAY = process.env.CONTENT_DATE || new Date().toISOString().slice(0, 10);
if (!/^\d{4}-\d{2}-\d{2}$/.test(DAY)) throw new Error("Bad CONTENT_DATE");
const dayNo = Math.floor(Date.parse(DAY + "T00:00:00Z") / 86400000);
const pause = ms => new Promise(ok => setTimeout(ok, ms));
const hash = s => crypto.createHash("sha256").update(String(s)).digest("hex").slice(0, 16);
const read = (p, fallback) => fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, "utf8")) : fallback;
const save = (p, data) => { fs.mkdirSync(path.dirname(p), {recursive:true}); fs.writeFileSync(p, JSON.stringify(data,null,2) + "\n"); };
const clean = s => String(s || "").replace(/<[^>]*>/g," ").replace(/&amp;/g,"&").replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/\s+/g," ").trim().slice(0,240);
const norm = s => clean(s).normalize("NFKC").toLocaleLowerCase("tr").replace(/\s+/g," ").trim();
const warnings = [];
const stamp = new Date().toISOString();

async function jsonAt(url) {
  for (let a=0; a<3; a++) {
    try {
      const r = await fetch(url, {headers:{"User-Agent":"Globriva-EraAtlas-OpenContent/1.0 (https://github.com/oguzhanozeren92-debug; curated educational app)","Accept":"application/json"},signal:AbortSignal.timeout(22000)});
      if (r.status === 429 || r.status === 503) { await pause(2500*(a+1)); continue; }
      if (!r.ok) throw new Error("HTTP " + r.status);
      return await r.json();
    } catch(e) { if (a===2) throw e; await pause(1100*(a+1)); }
  }
  throw new Error("API exhausted");
}
function jpegDimensions(buf) {
  if (buf.length < 100 || buf[0]!==0xff || buf[1]!==0xd8 || buf[2]!==0xff) return null;
  for(let i=2;i+8<buf.length;) {
    if(buf[i]!==255) {i++;continue;}
    while(buf[i]===255)i++;
    const marker=buf[i++];
    if(marker===0xd9 || marker===0xda)break;
    if(marker===0xd8 || marker===0x01 || (marker>=0xd0&&marker<=0xd7))continue;
    const len=buf.readUInt16BE(i);if(len<2||i+len>buf.length)break;
    if([0xc0,0xc1,0xc2,0xc3,0xc5,0xc6,0xc7,0xc9,0xca,0xcb,0xcd,0xce,0xcf].includes(marker)){
      return {height:buf.readUInt16BE(i+3),width:buf.readUInt16BE(i+5)};
    }
    i+=len;
  }
  return null;
}
async function verifiedJpeg(url) {
  const u = new URL(url);
  const allowed = APP==="globriva" ? ["upload.wikimedia.org","thumb.wikimedia.org"] : ["images.metmuseum.org","www.artic.edu"];
  if(u.protocol!=="https:" || !allowed.includes(u.hostname))throw new Error("Untrusted image host");
  const r=await fetch(url,{signal:AbortSignal.timeout(25000),headers:{"User-Agent":"Globriva-EraAtlas-OpenContent/1.0"}});
  if(!r.ok)throw new Error("Image HTTP " + r.status);
  const mime=r.headers.get("content-type") || "";
  if(!/image\/jpeg|image\/jpg|application\/octet-stream/i.test(mime))throw new Error("Not JPEG: " + mime);
  if(Number(r.headers.get("content-length")||0)>6000000)throw new Error("Image over size cap");
  const chunks=[];let size=0;
  for await (const part of r.body) {
    size+=part.length;if(size>6000000)throw new Error("Image over size cap");
    chunks.push(part);
  }
  if(size<16000)throw new Error("Truncated/small JPEG");
  const buf=Buffer.concat(chunks),dim=jpegDimensions(buf);
  if(!dim || dim.width<700 || dim.height<400)throw new Error("Invalid or too small JPEG");
  return {buf,dim,checksum:crypto.createHash("sha256").update(buf).digest("hex")};
}
const state=read(DIR+"/state.json",{schemaVersion:1,seen:[]});
const output=read(DIR+"/candidates.json",{schemaVersion:1,project:APP,candidates:[]});
const drafts=read(DIR+"/question-drafts.json",{schemaVersion:1,project:APP,questions:[]});
const seen=new Set(state.seen||[]);
for(const c of output.candidates||[])seen.add(c.id);
const hashes=new Set((output.candidates||[]).map(c=>c.sha256).filter(Boolean));
const questionTexts=new Set((drafts.questions||[]).map(q=>norm(q.question?.tr)).filter(Boolean));
const fresh=[],newQuestions=[];
function options(answer, pool, salt) {
 const other=[...new Set(pool)].filter(x=>x!==answer);
 if(other.length<3)return null;
 other.sort((a,b)=>hash(salt+a).localeCompare(hash(salt+b)));
 const arr=[answer,...other.slice(0,3)];
 arr.sort((a,b)=>hash(salt+a+"!").localeCompare(hash(salt+b+"!")));
 return {choices:arr,correctIndex:arr.indexOf(answer)};
}
async function archive(candidate,url,q) {
 if(seen.has(candidate.id))return false;
 const {buf,dim,checksum}=await verifiedJpeg(url);
 if(hashes.has(checksum))return false;
 const location=MEDIA+"/"+candidate.id.toLowerCase()+".jpg";
 fs.mkdirSync(path.dirname(location),{recursive:true});
 fs.writeFileSync(location,buf);
 const complete={...candidate,assetPath:location,sha256:checksum,imageWidth:dim.width,imageHeight:dim.height,
   archiveVerifiedAt:stamp,rightsStatus:"source_metadata_checked",visualReview:false,locationReview:false,
   questionReview:false,published:false,playable:false};
 fresh.push(complete);seen.add(candidate.id);hashes.add(checksum);
 if(q && !questionTexts.has(norm(q.question.tr))) {
   newQuestions.push({...q,imageCandidateId:candidate.id,assetPath:location,
     status:"review_required_not_playable",playable:false});
   questionTexts.add(norm(q.question.tr));
 }
 return true;
}
const CC = new Set(["CC0","CC0 1.0","Public domain","CC BY 2.0","CC BY 3.0","CC BY 4.0","CC BY-SA 3.0","CC BY-SA 4.0"]);
function licenseOk(s) {return CC.has(clean(s));}
function geoKm(a,b,c,d) {
 const r=Math.PI/180, x=Math.sin((c-a)*r/2)**2+Math.cos(a*r)*Math.cos(c*r)*Math.sin((d-b)*r/2)**2;
 return 12742*Math.asin(Math.sqrt(Math.min(1,Math.max(0,x))));
}
async function globriva() {
 const plan=read("data/globriva-world-coverage-plan.json",{candidates:[]});
 const rows=plan.candidates || [];
 const regions=["Africa","South America","East Asia","Southeast Asia","South Asia","Oceania","West Asia"];
 const targets=regions.map((region,i)=>{
   const group=rows.filter(x=>x.region===region);
   return group.length ? group[(dayNo+i*3)%group.length] : null;
 }).filter(Boolean);
 const countries=[...new Set(rows.map(x=>x.country).filter(Boolean))];
 const oldGallery=read("data/globriva-world-gallery-60.json",{cities:[]});
 const oldTitles=new Set(oldGallery.cities.flatMap(x=>x.photos||[]).map(x=>norm(x.commons_title)));
 const existingDiscovery=read("panoramas/daily-discovery/pending.json",{pending:[]});
 for(const x of existingDiscovery.pending||[])if(x.title)oldTitles.add(norm(x.title));
 let count=0;
 for(const target of targets.slice(0,5)) {
   if(count>=5)break;
   await pause(1100);
   try {
    const params=new URLSearchParams({action:"query",format:"json",generator:"geosearch",
      ggscoord:String(target.lat)+"|"+String(target.lng),ggsradius:"5000",ggsnamespace:"6",ggslimit:"25",
      prop:"imageinfo|coordinates",iiprop:"url|size|mime|sha1|extmetadata",iiurlwidth:"1000",
      iiextmetadatafilter:"LicenseShortName|LicenseUrl|Artist|ImageDescription"});
    const res=await jsonAt("https://commons.wikimedia.org/w/api.php?"+params);
    const pages=Object.values(res.query?.pages||{}).sort((a,b)=>String(a.title).localeCompare(String(b.title)));
    for(const p of pages) {
     if(count>=5)break;
     const im=p.imageinfo?.[0], position=p.coordinates?.[0];
     if(!im||!position||!Number.isFinite(position.lat)||!Number.isFinite(position.lon))continue;
     if(geoKm(target.lat,target.lng,position.lat,position.lon)>5)continue;
     if(im.width<1800||im.height<900||im.width/im.height<1.2)continue;
     if(!/image\/jpeg/i.test(im.mime||""))continue;
     if(!/^File:.*\.jpe?g$/i.test(p.title)||/logo|flag|map|diagram|collage|interior|indoors|poster|watermark/i.test(p.title))continue;
     if(oldTitles.has(norm(p.title)))continue;
     const ex=im.extmetadata||{},meta=k=>clean(ex[k]?.value);
     const license=meta("LicenseShortName"),credit=meta("Artist");
     if(!licenseOk(license)||!credit)continue;
     const id="GB-COM-"+hash(p.title);
     if(seen.has(id))continue;
     const choices=options(target.country,countries.filter(x=>x!==target.country),id);
     if(!choices)continue;
     const source="https://commons.wikimedia.org/wiki/"+p.title.replace(/ /g,"_");
     const cand={id,provider:"Wikimedia Commons",sourcePage:source,commonsTitle:p.title,
       cameraGps:{lat:position.lat,lng:position.lon},targetCity:target.city,targetCountry:target.country,
       region:target.region,license,licenseUrl:meta("LicenseUrl"),credit,description:meta("ImageDescription"),
       sourceSha1:im.sha1,reviewReason:"GPS belongs to camera, not necessarily the depicted landmark; city and scene require editorial validation"};
     const quiz={id:"GQ-"+hash(p.title),category:"visual-geography",difficulty:"medium",
       question:{tr:"Bu fotoğrafın çekildiği şehrin bulunduğu ülke hangisidir?"},
       choices:{tr:choices.choices},correctIndex:choices.correctIndex,
       explanation:{tr:"Kaynak görüntünün konum kaydı "+target.city+" çevresini gösteriyor; yer ve fotoğraf editör tarafından doğrulanmalıdır."},
       factSource:source,qaStatus:"GPS_preliminary_location_and_visual_review_required"};
     try {if(await archive(cand,im.thumburl||im.url,quiz))count++;}
     catch(e){warnings.push({source:id,error:String(e).slice(0,150)});}
    }
   }catch(e){warnings.push({target:target.city,error:String(e).slice(0,180)});}
 }
}
const CULTURES=new Map([
 ["egyptian","Antik Mısır"],["greek","Antik Yunan"],["roman","Roma"],
 ["japan","Japon"],["japanese","Japon"],["china","Çin"],["chinese","Çin"],
 ["moche","Moche"],["maya","Maya"],["inca","İnka"],["aztec","Aztek"],
 ["olmec","Olmek"],["etruscan","Etrüsk"],["assyrian","Asur"],["persian","Pers"],
 ["korean","Kore"],["india","Hint"],["indian","Hint"],["byzantine","Bizans"]
]);
function cultureOf(s) {return CULTURES.get(norm(s))||null;}
async function eraatlas() {
 const prior=read("data/arkeolog-vitrin.json",{items:[]});
 const old=read("data/gorsel-adaylari-2026-10-26.json",{candidates:[]});
 const existing=new Set([...(prior.items||[]).map(x=>"EA-MET-"+x.objectId),
   ...(old.candidates||[]).map(x=>String(x.id||"").replace(/^MET-/,"EA-MET-"))]);
 const terms=["ancient African sculpture","Egyptian statue","Roman bronze","Greek terracotta",
   "Peruvian pottery","Japanese sculpture","Chinese ceramic","Korean ceramics","Maya sculpture","Indian sculpture"];
 const term=terms[dayNo%terms.length];
 const params=new URLSearchParams({q:term,hasImages:"true",limit:"45",offset:String((dayNo%4)*40)});
 try{
  const search=await jsonAt("https://collectionapi.metmuseum.org/public/collection/v1.1/search?"+params);
  for(const objectID of (search.objectIDs||[]).slice(0,22)){
   if(fresh.length>=4)break;
   const id="EA-MET-"+objectID;
   if(existing.has(id)||seen.has(id))continue;
   await pause(330);
   try{
    const o=await jsonAt("https://collectionapi.metmuseum.org/public/collection/v1/objects/"+objectID);
    if(o.isPublicDomain!==true||!o.primaryImageSmall)continue;
    if(new URL(o.primaryImageSmall).hostname!=="images.metmuseum.org")continue;
    const culture=cultureOf(o.culture);
    if(!culture||!o.objectDate||!o.title)continue;
    const answer=options(culture,[...new Set(CULTURES.values())],id);
    if(!answer)continue;
    const url="https://www.metmuseum.org/art/collection/search/"+objectID;
    const candidate={id,provider:"The Metropolitan Museum of Art",objectID,sourcePage:url,
     title:o.title,objectDate:o.objectDate,cultureSource:o.culture,cultureTr:culture,
     medium:o.medium||"",license:"Public Domain / Met Open Access",credit:"The Metropolitan Museum of Art",
     reviewReason:"Metadata and JPEG checked; cultural interpretation, 4 choices and visual answer leakage require review"};
    const quiz={id:"EQ-"+objectID,category:"artifacts",difficulty:"medium",
     question:{tr:"Müze kaydına göre fotoğraftaki eser hangi kültürle ilişkilidir?"},
     choices:{tr:answer.choices},correctIndex:answer.correctIndex,
     explanation:{tr:"The Met koleksiyon kaydında kültür: "+o.culture+"; tarihleme: "+o.objectDate+"."},
     factSource:url,qaStatus:"official_museum_field_fact_checked_question_draft"};
    await archive(candidate,o.primaryImageSmall,quiz);
   }catch(e){warnings.push({source:id,error:String(e).slice(0,150)});}
  }
 }catch(e){warnings.push({provider:"met",error:String(e).slice(0,160)});}
 // AIC official IIIF images: public-domain metadata; no speculative question is generated.
 const keywords=["egyptian statue","west african mask","greek vase","japanese pottery","korean sculpture","mesoamerican art"];
 const keyword=keywords[dayNo%keywords.length];
 const paramsA={q:keyword,query:{term:{is_public_domain:true}},limit:16,
   fields:"id,title,image_id,is_public_domain,date_display,place_of_origin,artwork_type_title"};
 try{
  await pause(1300);
  const s=await jsonAt("https://api.artic.edu/api/v1/artworks/search?params="+encodeURIComponent(JSON.stringify(paramsA)));
  const iiif=s.config?.iiif_url||"https://www.artic.edu/iiif/2";
  if(new URL(iiif).hostname!=="www.artic.edu")throw new Error("Unexpected IIIF host");
  for(const a of s.data||[]){
   if(fresh.length>=6)break;
   if(a.is_public_domain!==true||!a.image_id||!a.id)continue;
   const id="EA-AIC-"+a.id;
   if(seen.has(id))continue;
   try{
    await archive({id,provider:"Art Institute of Chicago",sourcePage:"https://www.artic.edu/artworks/"+a.id,
     objectID:a.id,title:a.title,date:a.date_display,placeOfOrigin:a.place_of_origin,
     license:"Public Domain / AIC Open Access",credit:"Art Institute of Chicago",
     reviewReason:"Confirmed public-domain metadata and decoded image; needs museum fact and question review"},
     iiif+"/"+encodeURIComponent(a.image_id)+"/full/843,/0/default.jpg",null);
   }catch(e){warnings.push({source:id,error:String(e).slice(0,160)});}
  }
 }catch(e){warnings.push({provider:"aic",error:String(e).slice(0,160)});}
}
function tests(){
 assert(licenseOk("CC BY-SA 4.0"));
 assert(!licenseOk("CC BY-NC 4.0"));
 assert.equal(cultureOf("Egyptian"),"Antik Mısır");
 assert.equal(cultureOf("possibly Roman"),null);
 assert.equal(options("Peru",["Şili","Meksika","Çin"],"a").choices.length,4);
 assert(geoKm(0,0,0,0)<0.001);
 console.log("Open Content collector self-test OK");
}
if(process.argv.includes("--self-test"))tests();
else {
 if(APP==="globriva")await globriva();else await eraatlas();
 const candidates=[...output.candidates,...fresh].slice(-450);
 const qs=[...drafts.questions,...newQuestions].slice(-450);
 save(DIR+"/candidates.json",{schemaVersion:1,project:APP,updatedAt:stamp,
   note:"Archived images are not published or playable until visual + factual editorial QA",candidates});
 save(DIR+"/question-drafts.json",{schemaVersion:1,project:APP,updatedAt:stamp,
   note:"Draft-only: cannot be loaded as a player question bank",questions:qs});
 save(DIR+"/state.json",{schemaVersion:1,updatedAt:stamp,seen:[...seen].slice(-12000)});
 const summary={project:APP,date:DAY,newArchivedImages:fresh.length,newQuestionDrafts:newQuestions.length,
    totalCandidates:candidates.length,totalDrafts:qs.length,
    newIds:fresh.map(x=>x.id),warnings,publishedNow:0,playableNow:0};
 save(DIR+"/latest.json",summary);
 console.log(JSON.stringify(summary,null,2));
}