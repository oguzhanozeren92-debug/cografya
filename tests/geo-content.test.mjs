import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { createRequire } from 'node:module';
import ts from 'typescript';
import { neighbors } from 'topojson-client';
import { HISTORY_CASES } from '../server/history/curated.mjs';
import { HISTORY_MEDIUM_CASES } from '../server/history/curated-medium.mjs';
import { HISTORY_EXPANDED_CASES } from '../server/history/curated-expanded.mjs';
import { HISTORY_DETAIL_PHOTOS } from '../server/history/detail-photos.mjs';
import { approvedPanoramas } from '../server/street/approved.mjs';
import { approvedPhotoIds } from '../server/street/photo-ready.mjs';

const root=resolve(import.meta.dirname||new URL('..',import.meta.url).pathname,'..');
const require=createRequire(import.meta.url);
const world=require('world-atlas/countries-110m.json');
const load=async(path)=>{
  const source=readFileSync(resolve(root,path),'utf8');
  const compiled=ts.transpileModule(source,{compilerOptions:{
    module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022,
  }});
  return import('data:text/javascript;base64,'+Buffer.from(compiled.outputText).toString('base64'));
};
const [geo,clues,countries]=await Promise.all([
  load('src/data/geoDiscoveryModes.ts'),load('src/data/countryClues.ts'),
  load('src/data/countries.ts'),
]);
const normalize=s=>String(s||'').toLocaleLowerCase('tr-TR')
  .normalize('NFKD').replace(/[\u0300-\u036f]/g,'')
  .replace(/[^\p{L}\p{N}]+/gu,' ').trim();
const allHistory=[...HISTORY_CASES,...HISTORY_MEDIUM_CASES,...HISTORY_EXPANDED_CASES];
const currentIds=new Set(approvedPhotoIds);
const photosByCase=new Map();
for(const p of HISTORY_DETAIL_PHOTOS){
  const list=photosByCase.get(p.caseId)||[];
  list.push(p);photosByCase.set(p.caseId,list);
}

test('30 unique natural rounds, 10 per level, with safe coordinates and real fact links',()=>{
  assert.equal(geo.NATURE_POINTS.length,30);
  assert.equal(new Set(geo.NATURE_POINTS.map(x=>x.id)).size,30);
  for(const level of [1,2,3])assert.equal(geo.NATURE_POINTS.filter(x=>x.level===level).length,10);
  for(const p of geo.NATURE_POINTS){
    assert.ok(Number.isFinite(p.lat)&&Math.abs(p.lat)<=90,p.id+' lat');
    assert.ok(Number.isFinite(p.lon)&&Math.abs(p.lon)<=180,p.id+' lon');
    assert.ok(p.clue.length>35&&p.clueEn.length>35,p.id+' bilingual clue');
    assert.ok(!normalize(p.clue).includes(normalize(p.name)),p.id+' pre-answer name leak');
  }
  for(const id of ['iguazu','ngorongoro','halong','atitlan','uyuni','roraima',
    'okavango','wulingyuan','turkana','socotra','tsingy','namib']){
    const p=geo.NATURE_POINTS.find(x=>x.id===id);
    assert.ok(p,'missing '+id);
    assert.match(p.sourceUrl,/^https:\/\/(?:whc\.unesco\.org|science\.nasa\.gov|www\.britannica\.com)\//);
  }
});

test('country clue expansion uses real country IDs, correct tiers and never names the answer',()=>{
  const cards=Object.values(clues.COUNTRY_CLUES);
  assert.equal(cards.length,72);
  assert.equal(new Set(cards.map(x=>x.countryId)).size,cards.length);
  for(const id of ['152','170','192','218','050','450','834','418','242']){
    const c=clues.COUNTRY_CLUES[id],country=countries.COUNTRY_DATA[id];
    assert.ok(c&&country,id+' missing country or clue');
    assert.equal(c.difficulty,country.difficulty,id+' wrong tier');
    assert.equal(c.clues.length,3);
    assert.ok(c.fact.length>=35);
    for(const clue of c.clues){
      assert.ok(clue.length>=25,id+' short clue');
      assert.ok(!normalize(clue).includes(normalize(country.nameTr)),id+' answer revealed');
    }
  }
});

test('heritage: 20 unique playable cases, 60 questions and no answers in pre-quiz clues/captions',()=>{
  assert.equal(allHistory.length,20);
  assert.equal(new Set(allHistory.map(x=>x.id)).size,20);
  const approved=new Set(approvedPanoramas.filter(x=>x.approved).map(x=>x.id));
  for(const c of allHistory){
    assert.ok(currentIds.has(c.panoramaId)&&approved.has(c.panoramaId),c.id+' unapproved 360');
    assert.equal(c.questions.length,3,c.id+' quiz count');
    assert.match(c.sourceUrl,/^https:\/\//);
    const before=[c.clue,...(photosByCase.get(c.id)||[]).map(p=>p.caption)];
    for(const q of c.questions){
      assert.equal(q.options.length,4);
      assert.ok(q.correct>=0&&q.correct<4);
      assert.ok(q.explanation.tr.length>=20&&q.explanation.en.length>=20);
      for(const lang of ['tr','en']){
        const answer=normalize(q.options[q.correct][lang]);
        if(answer.length<4)continue;
        for(const p of before){
          assert.ok(!normalize(p[lang]).includes(answer),
            c.id+' '+lang+' answer '+answer+' leaked in clue/gallery');
        }
      }
    }
  }
});

test('supplementary history images have unique source files and mandatory author/license',()=>{
  const seen=new Set();
  for(const p of HISTORY_DETAIL_PHOTOS){
    assert.ok(allHistory.some(x=>x.id===p.caseId),p.caseId+' orphan photo');
    assert.ok(p.artist?.trim()&&p.license?.trim());
    assert.match(p.source,/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
    assert.ok(p.caption.tr&&p.caption.en);
    assert.ok(!seen.has(p.source),'reused Commons photo '+p.source);
    seen.add(p.source);
  }
});

test('approved street panorama fallback faces exist for all 37 entries',()=>{
  const approved=approvedPanoramas.filter(x=>x.approved&&currentIds.has(x.id));
  assert.equal(approved.length,37);
  for(const p of approved)for(const face of ['f','r','b','l']){
    assert.ok(existsSync(resolve(root,'public/street-photos',p.id,face+'.jpg')),
      p.id+'/'+face+' missing');
  }
});

test('border and island targets are backed by the actual Natural Earth geometry',()=>{
  const geos=world.objects.countries.geometries;
  const id=x=>String(x).padStart(3,'0');
  const shapeIds=new Set(geos.map(x=>id(x.id)));
  const adj=new Map(geos.map((g,i)=>[id(g.id),
    new Set((neighbors(geos)[i]||[]).map(j=>id(geos[j].id)))]));
  const playableIslands=geo.ISLAND_COUNTRIES.filter(x=>shapeIds.has(x.id));
  assert.ok(playableIslands.length>=12,'insufficient playable silhouettes');
  const focus=geo.BORDER_FOCUS.filter(x=>shapeIds.has(x)&&countries.COUNTRY_DATA[x]&&adj.get(x)?.size);
  assert.ok(focus.length>=30,'insufficient border geometry');
  assert.equal(new Set(geo.BORDER_FOCUS).size,geo.BORDER_FOCUS.length);
});
