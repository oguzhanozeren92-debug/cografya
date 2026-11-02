import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const catalogue=JSON.parse(read('src/data/heritage360.json'));
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
    assert.match(place.license,/^CC(?:0 1\.0| BY(?:-SA)? [234]\.0)$/);
    assert.match(place.licenseUrl,/^https:\/\/creativecommons\.org\//);
    assert.match(place.sourceUrl,/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
  }
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
test('photo API is allowlisted, bounds response size and never accepts arbitrary URLs',()=>{
  assert.match(proxy,/new Map\(catalog\.places\.map/);
  assert.match(proxy,/MAX_SIZE=3_900_000/);
  assert.match(proxy,/image_too_large/);
  assert.doesNotMatch(proxy,/req\.query\.url/);
});
