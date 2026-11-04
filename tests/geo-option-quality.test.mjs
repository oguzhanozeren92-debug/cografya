import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const screen=fs.readFileSync('src/components/GeoDiscoveryScreen.tsx','utf8');
const data=fs.readFileSync('src/data/geoDiscoveryModes.ts','utf8');
const start=screen.indexOf('const NATURE_OPTION_PEERS=[');
const end=screen.indexOf('] as const;',start);
const sources=data.slice(data.indexOf('export const NATURE_POINTS'),data.indexOf('export const ISLAND_COUNTRIES'));
const points=[...sources.matchAll(/"id":\s*"([^"]+)"/g)].map(match=>match[1]);
const categories=[...screen.slice(start,end).matchAll(/\[([^\[\]]+)\]/g)]
 .map(group=>[...group[1].matchAll(/'([^']+)'/g)].map(m=>m[1]))
 .filter(group=>group.length>=4);

test('66 reviewed natural wonders have comparable geographic answer choices',()=>{
  assert.ok(start>=0&&end>start,'missing explicit peer families');
  assert.equal(points.length,66,'natural wonder inventory unexpectedly changed');
  const known=new Set(points);
  for(const group of categories){
    assert.ok(group.length>=4,'four choices need three same-kind alternatives');
    for(const id of group)assert.ok(known.has(id),'unknown place in peer list '+id);
  }
  for(const id of points){
    const same=categories.find(group=>group.includes(id));
    assert.ok(same&&same.length>=4,'no comparable distractors for '+id);
    assert.equal(new Set(same).size,same.length,'duplicate comparable location in '+id);
  }
  assert.match(screen,/naturePeerIds\(item\.id\)/);
  assert.doesNotMatch(screen,/shuffle\(NATURE_POINTS\.filter\(p=>p\.id!==item\.id\)\)/);
});
test('island silhouettes use similar size and equal difficulty rather than random islands',()=>{
  const section=data.slice(data.indexOf('export const ISLAND_COUNTRIES'));
  const levels=[...section.matchAll(/\{id:"[^"]+",name:"[^"]+",en:"[^"]+",level:([123])\}/g)]
    .map(x=>Number(x[1]));
  assert.ok(levels.length>=20);
  for(const level of [1,2,3])assert.ok(levels.filter(n=>n===level).length>=4);
  assert.match(screen,/closeOutlineAlternatives\(item,sameTier\)/);
  assert.match(screen,/Math\.abs\(Math\.log\(outlineArea/);
});
test('border distractors are actual nearby countries, not unrelated countries around the world',()=>{
  assert.match(screen,/geoCentroid/);
  assert.match(screen,/geoDistance/);
  assert.match(screen,/nearNonNeighbours\(target,non\)/);
  assert.match(screen,/!adj\.get\(target\)\?\.has\(id\)/);
});
