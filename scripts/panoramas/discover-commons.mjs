#!/usr/bin/env node
/**
 * Globriva — licensed Wikimedia Commons discovery (editorial candidates only).
 *
 * Examples:
 *   node scripts/panoramas/discover-commons.mjs --term "Kathmandu skyline" --limit 25
 *   node scripts/panoramas/discover-commons.mjs --term "Cape Town panorama" --limit 40
 *
 * This reads existing source URLs to avoid repeats. It does NOT change the game,
 * gallery catalog, approval flags, R2 or published content.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const args=process.argv.slice(2);
function arg(flag,fallback=''){const i=args.indexOf(flag);return i>=0?args[i+1]??fallback:fallback;}
const term=arg('--term').trim();
const limit=Math.min(50,Math.max(1,Number(arg('--limit','30'))||30));
if(!term||term.length<4||term.length>140){
 console.error('Usage: node scripts/panoramas/discover-commons.mjs --term "Kathmandu skyline" [--limit 30]');
 process.exit(2);
}
const existing=JSON.parse(fs.readFileSync(path.join(root,'panoramas/drone-gallery-candidates.json'),'utf8'));
const used=new Set(existing.collections.flatMap(c=>c.images.map(p=>decodeURIComponent(p.source.split('File:')[1]||'').replaceAll('_',' ').normalize('NFC').toLowerCase())));
const endpoint=new URL('https://commons.wikimedia.org/w/api.php');
const query={action:'query',format:'json',formatversion:'2',generator:'search',gsrsearch:term,gsrnamespace:'6',gsrlimit:String(limit),prop:'imageinfo',iiprop:'url|size|extmetadata',iiextmetadatafilter:'LicenseShortName|LicenseUrl|Artist|ObjectName',origin:'*'};
for(const [key,value] of Object.entries(query))endpoint.searchParams.set(key,value);
const response=await fetch(endpoint,{headers:{'User-Agent':'GlobrivaSourceScout/1.0 (GitHub oguzhanozeren92-debug/cografya; noncommercial metadata review)'}});
if(!response.ok)throw Error('Commons metadata API HTTP '+response.status);
const json=await response.json();
const accepted=new Set(['CC BY 2.0','CC BY 3.0','CC BY 4.0','CC BY-SA 3.0','CC BY-SA 4.0','CC0','Public domain']);
const decodeHTML=(x)=>String(x||'').replace(/<[^>]+>/g,' ').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/\s+/g,' ').trim();
const proposals=[];
const skipped={duplicate:0,license:0,dimension:0,format:0};
for(const page of json.query?.pages||[]){
 const info=page.imageinfo?.[0],title=page.title||'',meta=info?.extmetadata||{};
 const normalized=title.slice(5).replaceAll('_',' ').normalize('NFC').toLowerCase();
 if(used.has(normalized)){skipped.duplicate++;continue;}
 if(!/^File:.*\.jpe?g$/i.test(title)||!/^image\/jpeg$/i.test(info?.mime||'image/jpeg')){skipped.format++;continue;}
 if(!info||Math.min(info.width||0,info.height||0)<650||Math.max(info.width||0,info.height||0)<1100){skipped.dimension++;continue;}
 const license=decodeHTML(meta.LicenseShortName?.value);
 if(!accepted.has(license)){skipped.license++;continue;}
 const url='https://commons.wikimedia.org/wiki/'+encodeURIComponent(title.replaceAll(' ','_')).replace(/%3A/i,':');
 const sourceTitle=title;const artist=decodeHTML(meta.Artist?.value).slice(0,180);
 if(!artist){skipped.license++;continue;}
 proposals.push({sourceTitle,source:url,artist,license,licenseUrl:decodeHTML(meta.LicenseUrl?.value),width:info.width,height:info.height,
   suggestedFor:term,reviewedVisual:false,reviewedLicense:false,reviewedPlace:false,
   editorialStatus:'unreviewed_discovery_no_location_approval',note:'Verify real place, uniqueness, image quality and Commons rights manually before adding to an album.'});
}
console.log(JSON.stringify({term,discovered:proposals.length,skipped,proposals},null,2));
