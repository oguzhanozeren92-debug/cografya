import { allowAtlasNativeCors } from '../../server/street/core.mjs';
import { approvedPanoramas } from '../../server/street/approved.mjs';
import { approvedPhotoIds } from '../../server/street/photo-ready.mjs';
import { HISTORY_CASES, HISTORY_QUESTION_POINTS } from '../../server/history/curated.mjs';

// Fixed curated five-case pilot. The source files are already licensed,
// geolocated, approved and published in the Street archive.
const licenseUrl=license=>license==='CC0'
  ?'https://creativecommons.org/publicdomain/zero/1.0/'
  :license==='CC BY-SA 3.0 de'
    ?'https://creativecommons.org/licenses/by-sa/3.0/de/'
    :'https://creativecommons.org/licenses/'+license.toLowerCase().replace('cc ','').replace(' ', '/')+'/';

export default function handler(req,res){
  if(allowAtlasNativeCors(req,res))return;
  res.setHeader('Cache-Control','no-store');
  if(req.method!=='GET')return res.status(405).json({error:'Method not allowed'});
  const approved=new Map(approvedPanoramas.filter(row=>row.approved===true &&
    row.mode==='multires'&&approvedPhotoIds.includes(row.id)).map(row=>[row.id,row]));
  const base=process.env.STREET_R2_PUBLIC_BASE_URL?.replace(/\/+$/,'');
  const can360=Boolean(base && /^https:\/\/[a-z0-9.-]+(?::443)?$/i.test(base));
  const cases=[];
  for(const entry of HISTORY_CASES){
    const row=approved.get(entry.panoramaId);
    if(!row)return res.status(503).json({
      error:'Tarihî panorama arşivinin bir bölümü henüz doğrulanmadı.',
    });
    const staticBase='/street-photos/'+row.id;
    const credit={artist:row.artist,license:row.license,
      licenseUrl:licenseUrl(row.license),source:row.source};
    const media=can360
      ?{mode:'multires',base:base+'/'+row.path,staticBase,config:row.multires}
      :{mode:'gallery',images:['f','r','b','l'].map(face=>({
        url:staticBase+'/'+face+'.jpg',credit,
      }))};
    cases.push({
      ...entry,media,credit,
    });
  }
  res.status(200).json({
    version:1,origin:can360?'360':'four-angle',
    questionsPerCase:3,maxPoints:HISTORY_CASES.length*HISTORY_QUESTION_POINTS.reduce((a,b)=>a+b,0),
    cases,
  });
}
