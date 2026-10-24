// Globriva gallery consistency check. Local file readiness is NOT editorial approval.
import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const catalogFile=path.join(root,'public/drone-gallery/catalog-v2.json');
const doc=JSON.parse(fs.readFileSync(catalogFile,'utf8'));
const albums=Array.isArray(doc.collections)?doc.collections:[];
const issues=[],seenSource=new Set(),albumStats=[];
let stored=0, approvedStored=0, approvedCount=0, invalidApproved=0;
const MIME={jpg:'image/jpeg',webp:'image/webp'};
const commons=/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/i;
const license=/^https:\/\/creativecommons\.org\/(?:licenses|publicdomain)\//i;
function looksLikeImage(buffer,format){
 if(format==='jpg')return buffer.length>8&&buffer[0]===0xff&&buffer[1]===0xd8&&buffer[2]===0xff;
 if(format==='webp')return buffer.length>12&&buffer.toString('ascii',0,4)==='RIFF'&&buffer.toString('ascii',8,12)==='WEBP';
 return false;
}
function err(id,kind,text,approved){
 issues.push({album:id,kind,detail:text,approved});
 if(approved)invalidApproved++;
}
for(const row of albums){
 const isApproved=row.approved===true;
 if(isApproved)approvedCount++;
 const photos=Array.isArray(row.images)?row.images:[];
 let present=0,invalid=0;
 if(photos.length<3||photos.length>4){err(row.id,'photo_count','Each album must have 3 or 4 photos',isApproved);invalid++}
 if(!row.city||!row.country||!row.lat||!row.lng){err(row.id,'metadata','Missing location metadata',isApproved);invalid++}
 photos.forEach((photo,index)=>{
  const fmt=photo?.format;
  const base=path.join(root,'public','drone-gallery','photos',row.id,String(index+1));
  const variants=['jpg','webp'].filter(ext=>fs.existsSync(base+'.'+ext));
  if(variants.length===0){err(row.id,'missing_photo',String(index+1),isApproved);invalid++;return}
  if(variants.length>1){err(row.id,'ambiguous_photo',String(index+1),isApproved);invalid++;return}
  const actual=variants[0],bytes=fs.readFileSync(base+'.'+actual);
  if(fmt!==actual){err(row.id,'wrong_format',String(index+1)+' catalogue='+fmt+' actual='+actual,isApproved);invalid++;return}
  if(bytes.length<8000||!looksLikeImage(bytes,actual)){err(row.id,'bad_image_bytes',String(index+1),isApproved);invalid++;return}
  if(!photo.artist||!photo.license||!commons.test(photo.source||'')||!license.test(photo.licenseUrl||'')){
    err(row.id,'source_metadata',String(index+1),isApproved);invalid++;return
  }
  if(seenSource.has(photo.source)){err(row.id,'duplicate_source',String(index+1),isApproved);invalid++;return}
  seenSource.add(photo.source);
  stored++;present++;if(isApproved)approvedStored++;
 });
 albumStats.push({id:row.id,city:row.city,country:row.country,approved:isApproved,present,expected:photos.length,locallyComplete:invalid===0&&present===photos.length});
}
const readyAlbums=albumStats.filter(x=>x.locallyComplete);
const approvedAlbums=albumStats.filter(x=>x.approved);
const countries=new Set(approvedAlbums.filter(x=>x.locallyComplete).map(x=>x.country)).size;
const releaseCandidate=invalidApproved===0&&approvedStored>=50&&countries>=10;
const output={
 version:1,date:new Date().toISOString(),catalogAlbums:albums.length,catalogPhotos:albums.reduce((n,x)=>n+(x.images?.length||0),0),
 localValidPhotos:stored,completeLocalAlbums:readyAlbums.length,completeLocalPhotos:readyAlbums.reduce((n,x)=>n+x.present,0),
 approvedAlbums:approvedCount,approvedValidPhotos:approvedStored,approvedCountries:countries,
 releaseCandidate,releaseCandidateNote:'Only local structure and editor approval flags. Live CDN accessibility, correct place/subject, licence/attribution and mobile QA still need human verification.',
 issues,albums:albumStats
};
console.log(JSON.stringify(output,null,2));
if(process.argv.includes('--release')&&!releaseCandidate)process.exitCode=1;
if(process.argv.includes('--strict')&&invalidApproved>0)process.exitCode=1;
