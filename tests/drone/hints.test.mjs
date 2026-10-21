import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DRONE_HINT_TOTAL,droneHintCopy,droneHintText,droneHintChoices,
  dronePhotoFocus,droneHintPoints,
} from '../../src/lib/droneHints.ts';
import { dronePanoramas } from '../../src/data/dronePanoramas.ts';

const languages=['tr','en','es','de','fr','pt','ru','zh','ja'];
test('third hint offers four plausible countries and never reveals one answer',()=>{
  assert.equal(DRONE_HINT_TOTAL,3);
  assert.equal(dronePanoramas.length,5);
  for(const photo of dronePanoramas){
    const choices=droneHintChoices(photo.id);
    assert.equal(choices.length,4);
    assert.equal(new Set(choices).size,4);
    assert.ok(choices.includes(photo.country));
    for(const language of languages){
      const copy=droneHintCopy[language];
      assert.equal(copy.labels.length,3);
      assert.ok(copy.labels[2]);
      assert.equal(droneHintText(photo.id,3,language),'');
      assert.ok(droneHintText(photo.id,1,language));
      assert.ok(droneHintText(photo.id,2,language));
      assert.ok(dronePhotoFocus(photo.id,language));
    }
  }
});
test('points remain predictable, capped and penalized by unlocked clues',()=>{
  assert.deepEqual([0,1,2,3].map(level=>droneHintPoints(5000,level)),[5000,4000,3000,2000]);
  assert.equal(droneHintPoints(5000,99),2000);
  assert.equal(droneHintPoints(0,0),0);
  assert.equal(droneHintPoints(3100,2),1860);
});
test('five geolocated licensed photos have difficulty tiers and supporting notes',()=>{
  const levels=new Set(dronePanoramas.map(row=>row.difficulty));
  assert.deepEqual([...levels].sort(),['easy','hard','medium']);
  assert.ok(dronePanoramas.every(row=>Number.isFinite(row.lat)&&Number.isFinite(row.lng)));
  assert.ok(dronePanoramas.every(row=>row.source.startsWith('https://commons.wikimedia.org/')));
});
