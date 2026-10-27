// Source-side metadata verification for App Store photo audit.
// NEVER writes 'reviewed*' or 'approved' to the playable catalogue.
// Network failures are marked UNKNOWN, never assumed successful.
import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const catalog=JSON.parse(fs.readFileSync(path.join(root,'public/drone-gallery/catalog-v2.json'),'utf8'));
const rows=(catalog.collections||[]).flatMap(album=>(album.images||[]).map((p,index)=>({
 album:album.id,photo:index+1,approved:album.approved===true,
 claimedAuthor:p.artist,claimedLicense:p.license,source:p.source,
})));
const stripHtml=s=>String(s||'').replace(/<[^>]*>/g,' ').replace(/&nbsp;|&#160;/gi,' ')
 .replace(/&amp;/gi,'&').replace(/&#39;/g,"'").replace(/&quot;/gi,'"')
 .replace(/\s+/g,' ').trim();
const norm=s=>stripHtml(s).normalize('NFKC').toLowerCase().replace(/[_\s]+/g,' ').trim();
const licence=s=>norm(s).replace(/creative commons |attribution|sharealike|unported|international|generic|cc-|\s+/g,'');
const sourceTitle=url=>{
 try{
  const parsed=new URL(url);
  if(parsed.hostname!=='commons.wikimedia.org')return null;
  const file=decodeURIComponent(parsed.pathname.split('/wiki/')[1]||'');
  return /^File:/i.test(file)?file.replace(/_/g,' '):null;
 }catch{return null}
};
const detailed=[],batchSize=8;
for(let start=0;start<rows.length;start+=batchSize){
 const group=rows.slice(start,start+batchSize);
 const titles=[...new Set(group.map(r=>sourceTitle(r.source)).filter(Boolean))];
 let pages=[],failure='';
 if(titles.length){
  try{
   const endpoint=new URL('https://commons.wikimedia.org/w/api.php');
   for(const [k,v] of Object.entries({action:'query',prop:'imageinfo',iiprop:'extmetadata',
     format:'json',formatversion:'2',redirects:'1',titles:titles.join('|')}))endpoint.searchParams.set(k,v);
   const res=await fetch(endpoint,{headers:{'User-Agent':'GlobrivaStoreMediaAudit/1.0 (tarlapusula@gmail.com)',
     Accept:'application/json'},signal:AbortSignal.timeout(25000)});
   if(!res.ok)throw Error('Commons HTTP '+res.status);
   const response=await res.json();pages=response.query?.pages||[];
  }catch(error){failure=String(error)}
 }
 for(const r of group){
   const title=sourceTitle(r.source);
   const page=title?pages.find(p=>norm(p.title)===norm(title)):null;
   const meta=page?.imageinfo?.[0]?.extmetadata;
   const actualLicense=stripHtml(meta?.LicenseShortName?.value);
   const actualArtist=stripHtml(meta?.Artist?.value);
   const expected=licence(r.claimedLicense),actual=licence(actualLicense);
   const licenceMatches=Boolean(expected&&actual&&(actual===expected||actual.includes(expected)||expected.includes(actual)));
   const authorMatches=Boolean(r.claimedAuthor&&actualArtist&&norm(actualArtist).includes(norm(r.claimedAuthor)));
   const status=(!title)?'INVALID_SOURCE_URL':
     failure?'UNKNOWN_NETWORK':
     !page||page.missing||!meta?'SOURCE_UNAVAILABLE':
     !licenceMatches?'CHECK_LICENSE':
     !authorMatches?'CHECK_AUTHOR':
     'METADATA_MATCH';
   detailed.push({...r,status,pageTitle:page?.title||title,
     CommonsLicense:actualLicense,CommonsArtist:actualArtist,sourceChecked:status==='METADATA_MATCH',
     sourceError:failure||null,
     note:'Metadata matching does not verify the local photo is the same Commons file, its depicted location, or editorial quality.'});
 }
}
const counts=detailed.reduce((a,r)=>({...a,[r.status]:(a[r.status]||0)+1}),{});
const report={generatedAt:new Date().toISOString(),total:detailed.length,counts,
 disclaimer:'Human review of local pixels, location, derivative disclosure, source licence and attribution required. This check does not certify any assets for release.',
 photos:detailed};
const out=path.join(root,'appstore-review');fs.mkdirSync(out,{recursive:true});
fs.writeFileSync(path.join(out,'commons-source-audit.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({total:report.total,counts,report:'appstore-review/commons-source-audit.json'},null,2));
if(process.argv.includes('--strict')&&detailed.some(r=>r.status!=='METADATA_MATCH'))process.exitCode=1;
