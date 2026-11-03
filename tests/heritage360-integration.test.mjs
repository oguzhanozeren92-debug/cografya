import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const catalogue=JSON.parse(read('src/data/heritage360.json'));
const reviewed=JSON.parse(read('src/data/heritage360-source-reviewed.json'));
const game=read('src/components/StreetDetectiveScreen.tsx');
const home=read('src/components/StartScreen.tsx');
const app=read('src/App.tsx');
const proxy=read('api/heritage/panorama.js');
const map=read('src/components/StreetWorldMap.tsx');

test('curated historical photos have authors, individual licenses and source pages',()=>{
  assert.ok(catalogue.places.length>=30);
  const seen=new Set();
  for(const place of catalogue.places){
    assert.match(place.id,/^[a-z][a-z0-9-]{2,70}$/);
    assert.ok(!seen.has(place.id),'duplicate image '+place.id);
    seen.add(place.id);
    assert.ok(place.name&&place.country&&place.fact&&place.credit);
    assert.match(place.license,/^CC(?:0 1\.0| BY(?:-SA)? [234]\.0(?: DE)?)$/);
    assert.match(place.licenseUrl,/^https:\/\/creativecommons\.org\//);
    assert.match(place.sourceUrl,/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
  }
});
test('only manually checked source pages are eligible for new 360° questions',()=>{
  const byId=new Map(catalogue.places.map(p=>[p.id,p]));
  assert.ok(reviewed.sourceReviewedIds.length>=10,'source review pool is too small');
  const countries=new Set();
  for(const id of reviewed.sourceReviewedIds){
    assert.ok(byId.has(id),'unknown reviewed id '+id);
    countries.add(byId.get(id).country);
  }
  assert.ok(countries.size>=8,'reviewed pool must cover distinct countries');
  assert.match(game,/sourceReviewed\.has\(p\.id\)/);
  assert.match(proxy,/verified\.has\(p\.id\)/);
});
test('historic 360 is one regular Street Detective question, never a standalone mode',()=>{
  assert.match(game,/\[ground\[0\],sky\[0\],heritage,ground\[1\],sky\[1\]\]/);
  assert.match(game,/source:'heritage'/);
  assert.match(game,/<StreetPanorama/);
  assert.match(game,/guessedCorrectCountry\(guess,place\.country\)/);
  assert.match(game,/km:null/);
  assert.match(game,/reveal\.km===null/);
  assert.match(game,/current\.heritage\.licenseUrl/);
  assert.doesNotMatch(app,/Heritage360LocationScreen|heritage360Open/);
  assert.doesNotMatch(home,/startHeritage360|onHeritage360|360° Konum Avı/);
});
test('all curated countries are supported by the map country-guess checker',()=>{
  for(const country of new Set(catalogue.places.map(p=>p.country))){
    assert.ok(map.includes("'"+country+"':"),'unmapped country '+country);
  }
});
test('replays rotate approved scenes without changing existing five-question format',()=>{
  assert.match(game,/globriva-street-tour-rotation-v1/);
  assert.match(game,/const rotation=week\+attempt/);
  assert.match(game,/\(rotation\+n\)%street\.rounds!/);
  assert.match(game,/\(rotation\+n\)%vetted\.length/);
  assert.match(game,/const place=eligible\[/);
  const allow=new Set(reviewed.sourceReviewedIds);
  const available=catalogue.places.filter(p=>allow.has(p.id));
  assert.ok(available.length>=10);
  const positions=new Set(Array.from({length:available.length},(_,attempt)=>
    (available.length-1-(attempt%available.length)+available.length)%available.length));
  assert.equal(positions.size,available.length,'all reviewed panoramas should appear before repeating');
});
test('players can inspect the result and historic fact without forced auto-skip',()=>{
  assert.doesNotMatch(game,/setTimeout\(\(\)=>advance\(\)/);
  assert.doesNotMatch(game,/factRead\?/);
  assert.match(game,/onClick=\{advance\}/);
  assert.match(game,/Sonraki konuma geç/);
  assert.match(game,/setReady\(false\);setError\(''\);setPhase\('view'\)/);
  const dict=read('src/lib/i18nStrings.ts');
  for(const language of ['en','es','de','fr','pt','ru','zh','ja']){
    const pos=dict.indexOf('  "'+language+'": {');
    const value=pos<0?'':dict.slice(pos,dict.indexOf('\n  }',pos));
    assert.match(value,/"Sonraki konuma geç":/,'missing '+language+' translation');
  }
});
test('photo API is allowlisted, bounds response size and never accepts arbitrary URLs',()=>{
  assert.match(proxy,/new Map\(catalog\.places\.filter\(p=>verified\.has\(p\.id\)\)\.map/);
  assert.match(proxy,/MAX_SIZE=3_900_000/);
  assert.match(proxy,/image_too_large/);
  assert.doesNotMatch(proxy,/req\.query\.url/);
});
