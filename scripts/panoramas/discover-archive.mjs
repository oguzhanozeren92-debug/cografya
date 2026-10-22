#!/usr/bin/env node
/**
 * Globriva's Wikimedia Commons candidate finder.
 * This is DISCOVERY only, not a licensed-media publishing tool. Nothing becomes
 * playable until visual/projection/place/license review and R2 upload succeed.
 * Usage: node scripts/panoramas/discover-archive.mjs --out=reports/candidates.json
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),'../..');
const targets=[
  {country:'Lüksemburg',query:'Luxembourg 360 panorama'},
  {country:'Belçika',query:'Bruges Belgium 360 panorama'},
  {country:'Hollanda',query:'Netherlands street panorama 360'},
  {country:'Slovenya',query:'Ljubljana Slovenia 360 panorama'},
  {country:'Karadağ',query:'Montenegro Kotor 360 panorama'},
  {country:'Estonya',query:'Tallinn Estonia 360 panorama'},
  {country:'Letonya',query:'Riga Latvia 360 panorama'},
  {country:'Andorra',query:'Andorra 360 panorama'},
  {country:'Malta',query:'Valletta Malta 360 panorama'},
  {country:'Kuzey Makedonya',query:'Skopje North Macedonia 360 panorama'},
];
const validLicenses=new Set(['CC BY 2.0','CC BY 3.0','CC BY 4.0',
  'CC BY-SA 2.0','CC BY-SA 3.0','CC BY-SA 4.0','CC0','Public domain']);
const output=[];
const warnings=[];
for(const target of targets){
  const params=new URLSearchParams({
    action:'query',format:'json',generator:'search',
    gsrsearch:target.query,gsrnamespace:'6',gsrlimit:'25',
    prop:'imageinfo',iiprop:'url|size|extmetadata',iiurlwidth:'480'
  });
  try {
    const response=await fetch('https://commons.wikimedia.org/w/api.php?'+params,{
      headers:{'User-Agent':'GlobrivaArchiveCandidateDiscovery/1.0 (educational geography game)'},
      signal:AbortSignal.timeout(18000),
    });
    if(!response.ok)throw new Error('Commons HTTP '+response.status);
    const data=await response.json();
    for(const page of Object.values(data.query?.pages??{})){
      const image=page.imageinfo?.[0];
      if(!image)continue;
      const license=image.extmetadata?.LicenseShortName?.value??'';
      if(!validLicenses.has(license))continue;
      if(image.width<1600||image.height<800)continue;
      const aspect=image.width/image.height;
      // A 2:1 frame is only a clue. Projection and location need manual proof.
      if(aspect<1.72||aspect>2.35)continue;
      if(!/\.jpe?g$/i.test(page.title))continue;
      const score=Math.round(Math.min(20,image.width/450)+
        Math.min(15,image.height/280)+
        Math.max(0,20-Math.abs(2-aspect)*75));
      output.push({
        countrySearchHint:target.country,title:page.title,
        source:'https://commons.wikimedia.org/wiki/'+encodeURIComponent(page.title).replaceAll('%3A',':'),
        license,width:image.width,height:image.height,aspect:Number(aspect.toFixed(3)),score,
        thumbnailUrl:image.thumburl??null, originalImageUrl:image.url??null,
        countryVerified:false,coordinatesVerified:false,visualQualityReviewed:false,
        panoramaProjectionReviewed:false,attributionVerified:false,
        status:'candidate_only_not_published',
      });
    }
  }catch(error){
    warnings.push(target.country+': '+(error instanceof Error?error.message:String(error)));
  }
}
const groups=targets.map(t=>{
  const candidates=output.filter(x=>x.countrySearchHint===t.country).sort((a,b)=>b.score-a.score);
  return {country:t.country,query:t.query,total:candidates.length,shortlist:candidates.slice(0,6)};
});
const report={
  created:new Date().toISOString(),source:'Wikimedia Commons MediaWiki API',
  disclaimer:'Search relevance does NOT verify location, 360 projection, original authorship, or gameplay quality. Do not mark reviewed flags true automatically.',
  countriesSearched:targets.length,matchingImages:output.length,
  countriesWithSuggestions:groups.filter(g=>g.total>0).length,groups,warnings,
};
const pathArg=process.argv.find(x=>x.startsWith('--out='));
if(pathArg){
  const path=resolve(ROOT,pathArg.slice(6));
  mkdirSync(dirname(path),{recursive:true});
  writeFileSync(path,JSON.stringify(report,null,2)+'\n','utf8');
  console.log('Saved: '+path);
}
console.log(JSON.stringify({countriesSearched:report.countriesSearched,
  countriesWithSuggestions:report.countriesWithSuggestions,
  matchingImages:report.matchingImages,
  bestCandidates:groups.map(g=>({country:g.country,count:g.total,
    top:g.shortlist[0]?.title??null})),warnings},null,2));
