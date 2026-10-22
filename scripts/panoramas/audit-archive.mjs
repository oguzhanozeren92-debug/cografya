#!/usr/bin/env node
/**
 * Globriva photo-archive quality audit (read-only).
 * Checks official Commons image metadata and our playable photo counts.
 * It never flags an unreviewed image as approved and NEVER publishes media.
 * node scripts/panoramas/audit-archive.mjs [--live] [--offline] [--strict] [--out=path]
 */
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { approvedDroneMedia } from '../../server/drone/approved.mjs';
import { readyDronePhotoIds } from '../../server/drone/photo-ready.mjs';
import { approvedPanoramas } from '../../server/street/approved.mjs';
import { approvedPhotoIds } from '../../server/street/photo-ready.mjs';
import { STREET_PLAYABLE_IDS, COUNTRY_HINTS } from '../../server/street/country-mode.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const albums = JSON.parse(readFileSync(resolve(ROOT, 'panoramas/drone-gallery-candidates.json'),'utf8')).collections;
const photos = albums.flatMap(album => album.images.map((p,i) => ({
  id: album.id, country: album.country, number: i + 1,
  title: p.sourceTitle, source: p.source, listedLicense: p.license,
  listedArtist: p.artist,
  editorialReview: !!(p.reviewedVisual && p.reviewedLicense && p.reviewedPlace),
})));
const errors = [], warnings = [], seen = new Set(), checked = [];
const plain = value => String(value ?? '').replace(/<[^>]*>/g,' ').replace(/&(?:amp|nbsp|quot);/ig,' ')
  .toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();
for (const pic of photos) {
  if (!pic.title?.startsWith('File:') || !pic.source?.startsWith('https://commons.wikimedia.org/wiki/File:')) {
    errors.push(pic.id + '/' + pic.number + ': incomplete source');
  }
  if (seen.has(pic.source)) errors.push(pic.id + '/' + pic.number + ': reused source');
  seen.add(pic.source);
}
for (const album of albums) {
  if (![3,4].includes(album.images.length)) errors.push(album.id + ': needs 3–4 photos');
  if (!Number.isFinite(album.lat) || !Number.isFinite(album.lng) ||
      Math.abs(album.lat) > 90 || Math.abs(album.lng) > 180) errors.push(album.id + ': invalid GPS');
  if (!['easy','medium','hard'].includes(album.difficulty)) warnings.push(album.id + ': missing difficulty');
  if (!album.reviewedLocation || !album.reviewedQuality || album.images.some(p =>
    !p.reviewedVisual || !p.reviewedLicense || !p.reviewedPlace)) {
    warnings.push(album.id + ': NOT approved; awaiting image, license and location review');
  }
}
if (!process.argv.includes('--offline')) {
  for (let n=0; n<photos.length; n+=20) {
    const group=photos.slice(n,n+20);
    const params=new URLSearchParams({
      action:'query',format:'json',prop:'imageinfo',iiprop:'size|extmetadata',
      redirects:'1',titles:group.map(p=>p.title).join('|'),
    });
    try {
      const url='https://commons.wikimedia.org/w/api.php?'+params.toString();
      const response=await fetch(url,{signal:AbortSignal.timeout(20000),
        headers:{'User-Agent':'GlobrivaArchiveAudit/1.0 (educational game image audit)'}});
      if (!response.ok) throw new Error('Wikimedia HTTP '+response.status);
      const json=await response.json();
      const pages=Object.values(json.query?.pages??{});
      const byTitle=new Map(pages.map(p=>[p.title.replaceAll('_',' ').toLowerCase(),p]));
      for (const pic of group) {
        const page=byTitle.get(pic.title.replaceAll('_',' ').toLowerCase());
        const image=page?.imageinfo?.[0];
        const license=image?.extmetadata?.LicenseShortName?.value??null;
        const matches=!!image && license===pic.listedLicense;
        const credit=image?.extmetadata?.Artist?.value??'';
        const artistMatches=!!credit && plain(credit).includes(plain(pic.listedArtist));
        if (!image) errors.push(pic.id+'/'+pic.number+': file does not exist');
        else if (!matches) errors.push(pic.id+'/'+pic.number+': licensed as '+license+' not '+pic.listedLicense);
        if (image && !artistMatches) errors.push(pic.id+'/'+pic.number+': photographer credit does not match source metadata');
        if (image && (image.width<1200 || image.height<600))
          warnings.push(pic.id+'/'+pic.number+': small image '+image.width+'x'+image.height);
        checked.push({id:pic.id,number:pic.number,source:pic.source,
          found:!!image,licenseMatches:matches,artistMatches,width:image?.width??null,
          height:image?.height??null,editorialReview:pic.editorialReview});
      }
    } catch (error) {
      errors.push('Metadata API: '+String(error));
      for (const pic of group) checked.push({id:pic.id,number:pic.number,
        source:pic.source,found:null,licenseMatches:null,editorialReview:false});
    }
  }
}
const readyDrone=new Set(readyDronePhotoIds), readyStreet=new Set(approvedPhotoIds);
const playableDrone=approvedDroneMedia.filter(row=>readyDrone.has(row.id));
const playableStreet=approvedPanoramas.filter(row=>row.approved===true &&
  readyStreet.has(row.id) && STREET_PLAYABLE_IDS.has(row.id) && COUNTRY_HINTS[row.country]);
const countryStats=Object.fromEntries([...new Set(albums.map(a=>a.country))].sort().map(c=>[c,{
  albums:albums.filter(a=>a.country===c).length,
  photos:photos.filter(p=>p.country===c).length,
}]));
let live=null;
if (process.argv.includes('--live')) {
  live={};
  for (const [mode,path] of [['drone','/api/drone/session?v=2'],['street','/api/street/session']]) {
    try {
      const r=await fetch('https://atlas-arena-tau.vercel.app'+path,{signal:AbortSignal.timeout(12000)});
      const body=await r.json();
      live[mode]={status:r.status,rounds:body.rounds?.length??body.media?.length??0,
        origin:body.origin??null};
    } catch (error) { live[mode]={error:String(error)}; }
  }
}
const approvedAlbums=albums.filter(a=>a.reviewedLocation===true&&a.reviewedQuality===true&&
  a.images.every(p=>p.reviewedVisual&&p.reviewedLicense&&p.reviewedPlace)).length;
const report={
  at:new Date().toISOString(),remoteVerified:!process.argv.includes('--offline'),
  advisory:'Official metadata and links DO NOT replace visual and GPS human review.',
  drone:{live360:playableDrone.length,candidateAlbums:albums.length,
    candidatePhotos:photos.length,candidateCountries:Object.keys(countryStats).length,
    editoriallyApprovedAlbums:approvedAlbums,targetPhotos:50,targetCountries:10},
  street:{photoSets:readyStreet.size,playableLocations:playableStreet.length,
    playableCountries:new Set(playableStreet.map(p=>p.country)).size,
    unselectedSets:readyStreet.size-playableStreet.length},
  countryStats,checked,live,errors,warnings,
};
const out=process.argv.find(arg=>arg.startsWith('--out='));
if(out){
  const target=resolve(ROOT,out.slice(6));mkdirSync(dirname(target),{recursive:true});
  writeFileSync(target,JSON.stringify(report,null,2)+'\n','utf8');
  console.log('Report: '+target);
}
console.log(JSON.stringify({drone:report.drone,street:report.street,live,
  checked:checked.length,licenseMatches:checked.filter(p=>p.licenseMatches).length,
  photographerMatches:checked.filter(p=>p.artistMatches).length,
  errors:errors.length,pendingEditorialAlbums:albums.length-approvedAlbums},null,2));
for(const e of errors)console.error('ERROR',e);
if(process.argv.includes('--strict')&&errors.length)process.exitCode=1;
