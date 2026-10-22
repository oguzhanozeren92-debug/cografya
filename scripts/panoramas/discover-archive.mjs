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
  {country:'Lüksemburg',query:'Luxembourg 360 panorama',lat:49.611,lng:6.131},
  {country:'Belçika',query:'Bruges Belgium 360 panorama',lat:51.209,lng:3.224},
  {country:'Hollanda',query:'Netherlands street panorama 360',lat:52.373,lng:4.893},
  {country:'Slovenya',query:'Ljubljana Slovenia 360 panorama',lat:46.056,lng:14.506},
  {country:'Karadağ',query:'Montenegro Kotor 360 panorama',lat:42.424,lng:18.771},
  {country:'Estonya',query:'Tallinn Estonia 360 panorama',lat:59.437,lng:24.754},
  {country:'Letonya',query:'Riga Latvia 360 panorama',lat:56.950,lng:24.105},
  {country:'Andorra',query:'Andorra 360 panorama',lat:42.507,lng:1.522},
  {country:'Malta',query:'Valletta Malta 360 panorama',lat:35.899,lng:14.514},
  {country:'Kuzey Makedonya',query:'Skopje North Macedonia 360 panorama',lat:41.998,lng:21.426},
];
const validLicenses=new Set(['CC BY 2.0','CC BY 3.0','CC BY 4.0',
  'CC BY-SA 2.0','CC BY-SA 3.0','CC BY-SA 4.0','CC0','Public domain']);
const output=[];
const scenicPhotos=[];
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
        mode:'street-360-candidate',countrySearchHint:target.country,title:page.title,
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
// A separate geotagged discovery pass finds ordinary multi-angle city album
// candidates (not 360 panoramas). A geo search only means the source is NEAR
// a coordinate, not that the photographer/country or drone view is verified.
for(const target of targets){
  const params=new URLSearchParams({
    action:'query',format:'json',generator:'geosearch',
    ggscoord:String(target.lat)+'|'+String(target.lng),
    ggsradius:'10000',ggsnamespace:'6',ggslimit:'50',
    prop:'imageinfo',iiprop:'url|size|extmetadata',iiurlwidth:'480',
  });
  try {
    const response=await fetch('https://commons.wikimedia.org/w/api.php?'+params,{
      headers:{'User-Agent':'GlobrivaArchiveCandidateDiscovery/1.0 (educational geography game)'},
      signal:AbortSignal.timeout(18000),
    });
    if(!response.ok)throw new Error('Commons geo HTTP '+response.status);
    const data=await response.json();
    for(const page of Object.values(data.query?.pages??{})){
      const image=page.imageinfo?.[0];
      if(!image||!/\.jpe?g$/i.test(page.title))continue;
      const license=image.extmetadata?.LicenseShortName?.value??'';
      if(!validLicenses.has(license)||image.width<1400||image.height<750)continue;
      const aspect=image.width/image.height;
      if(aspect<1.18||aspect>3.0)continue;
      const keyword=/aerial|drone|landscape|panorama|cityscape|skyline|old.town|view|scenic|historic|coast/i.test(page.title);
      scenicPhotos.push({
        mode:'multi-angle-gallery-candidate',countrySearchHint:target.country,
        searchedNear:{lat:target.lat,lng:target.lng,radiusMeters:10000},
        title:page.title,
        source:'https://commons.wikimedia.org/wiki/'+encodeURIComponent(page.title).replaceAll('%3A',':'),
        license,width:image.width,height:image.height,aspect:Number(aspect.toFixed(3)),
        thumbnailUrl:image.thumburl??null,originalImageUrl:image.url??null,
        score:Math.round(Math.min(20,image.width/450)+Math.min(15,image.height/280)+(keyword?15:0)),
        countryVerified:false,coordinatesVerified:false,visualQualityReviewed:false,
        aerialViewVerified:false,attributionVerified:false,
        status:'candidate_only_not_published',
      });
    }
  }catch(error){warnings.push(target.country+' geosearch: '+String(error));}
}
const groups=targets.map(t=>{
  const candidates=output.filter(x=>x.countrySearchHint===t.country).sort((a,b)=>b.score-a.score);
  const localScenic=scenicPhotos.filter(x=>x.countrySearchHint===t.country)
    .sort((a,b)=>b.score-a.score);
  return {country:t.country,query:t.query,total:candidates.length,
    shortlist:candidates.slice(0,6),scenicCount:localScenic.length,
    scenicShortlist:localScenic.slice(0,6)};
});
const report={
  created:new Date().toISOString(),source:'Wikimedia Commons MediaWiki API',
  disclaimer:'Search relevance does NOT verify location, 360 projection, original authorship, or gameplay quality. Do not mark reviewed flags true automatically.',
  countriesSearched:targets.length,matchingImages:output.length,
  scenicGalleryCandidates:scenicPhotos.length,
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
  scenicGalleryCandidates:report.scenicGalleryCandidates,
  bestCandidates:groups.map(g=>({country:g.country,count:g.total,
    top:g.shortlist[0]?.title??null,scenicCount:g.scenicCount})),warnings},null,2));
