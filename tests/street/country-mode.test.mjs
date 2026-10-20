import test from 'node:test';
import assert from 'node:assert/strict';
import { approvedPanoramas } from '../../server/street/approved.mjs';
import {
  COUNTRY_HINTS, STREET_PLAYABLE_IDS, STREET_HINT_SCORES,
  scoreStreetGuess, clueForCountry, countryChoices,
} from '../../server/street/country-mode.mjs';
import { isPointInCountry } from '../../server/street/country-map.mjs';
process.env.STREET_SESSION_SECRET='unit-test-secret-minimum-32-characters-long';
process.env.STREET_R2_PUBLIC_BASE_URL='https://example.invalid';
const { chooseRounds,validateTicket }=await import('../../server/street/core.mjs');
const { default:guessHandler }=await import('../../api/street/guess.js');
const { default:hintHandler }=await import('../../api/street/hint.js');
const invoke=(handler,body,method='POST')=>{
  let status=0,response=null;
  const res={setHeader(){},status(value){status=value;return this;},json(value){response=value;return this;}};
  handler({method,body},res);
  return {status,body:response};
};
test('eligible gallery has licensed photos with four increasingly specific clues',()=>{
  const rows=approvedPanoramas.filter(row=>STREET_PLAYABLE_IDS.has(row.id));
  assert.ok(rows.length>=15);
  for(const row of rows){
    assert.equal(row.approved,true);
    assert.ok(COUNTRY_HINTS[row.country]);
    assert.match(row.source,/^https:\/\/commons\.wikimedia\.org\//);
    for(let level=1;level<=3;level++)assert.ok(clueForCountry(row.country,level)?.value);
    const fourth=clueForCountry(row.country,4);
    assert.equal(fourth.kind,'choices');
    assert.equal(fourth.options.length,4);
    assert.equal(new Set(fourth.options).size,4);
    assert.ok(fourth.options.includes(row.country));
  }
});
test('sessions are curated, diversified and do not leak four options before hint',()=>{
  for(let i=0;i<15;i++){
    const rounds=chooseRounds();
    assert.equal(rounds?.length,5);
    const answers=rounds.map(round=>validateTicket(round.ticket)?.country);
    assert.equal(new Set(answers).size,5);
    for(const round of rounds){
      const row=validateTicket(round.ticket);
      assert.ok(row&&STREET_PLAYABLE_IDS.has(round.id));
      assert.equal(round.countryOptions,undefined);
      assert.equal(round.hints,undefined);
      assert.equal(round.country,undefined);
      assert.equal(round.lat,undefined);
      assert.equal(round.city,undefined);
      assert.equal(round.credit?.artist, row.artist);
    }
  }
});
test('country polygon includes Berlin and excludes Paris for Germany',()=>{
  assert.equal(isPointInCountry({lat:52.52,lng:13.405},'Almanya'),true);
  assert.equal(isPointInCountry({lat:48.8566,lng:2.3522},'Almanya'),false);
});
test('exact city distance scores more; right country gives separate +1000 bonus',()=>{
  const perfect=scoreStreetGuess(0,true,0);
  assert.equal(perfect.points,5000);
  assert.equal(perfect.distancePoints,4000);
  assert.equal(perfect.countryBonus,1000);
  const wrongCountry=scoreStreetGuess(0,false,0);
  assert.equal(wrongCountry.points,4000);
  assert.equal(wrongCountry.countryBonus,0);
  assert.ok(scoreStreetGuess(10,true,0).points>scoreStreetGuess(500,true,0).points);
  assert.ok(scoreStreetGuess(100,false,0).points>scoreStreetGuess(2000,false,0).points);
});
test('four paid hints cap points increasingly, even for an exact guess',()=>{
  assert.deepEqual(STREET_HINT_SCORES,[5000,4200,3400,2500,1500]);
  for(let i=0;i<STREET_HINT_SCORES.length;i++){
    const result=scoreStreetGuess(0,true,i);
    assert.equal(result.points,STREET_HINT_SCORES[i]);
    assert.equal(result.hintPenalty,5000-result.points);
  }
  assert.throws(()=>scoreStreetGuess(0,true,5),RangeError);
});
test('hint endpoint returns three textual clues then four plausible countries',()=>{
  const round=chooseRounds()[0];
  const actual=validateTicket(round.ticket).country;
  for(let level=1;level<=4;level++){
    const response=invoke(hintHandler,{ticket:round.ticket,level});
    assert.equal(response.status,200);
    if(level<4){assert.ok(response.body.value);assert.notEqual(response.body.kind,'choices');}
    else{
      assert.equal(response.body.kind,'choices');
      assert.equal(response.body.options.length,4);
      assert.ok(response.body.options.includes(actual));
    }
  }
});
test('nearby points earn more than distant; API uses actual point and bonus',()=>{
  const round=chooseRounds()[0];
  const actual=validateTicket(round.ticket);
  const near=invoke(guessHandler,{ticket:round.ticket,guess:{lat:actual.lat,lng:actual.lng},hintsUsed:0});
  const far=invoke(guessHandler,{ticket:round.ticket,guess:{lat:-60,lng:0},hintsUsed:0});
  assert.equal(near.status,200);
  assert.equal(near.body.km,0);
  assert.equal(near.body.distancePoints,4000);
  assert.ok(near.body.points>far.body.points);
  assert.equal(typeof near.body.correctCountry,'boolean');
  const penalized=invoke(guessHandler,{ticket:round.ticket,guess:{lat:actual.lat,lng:actual.lng},hintsUsed:4});
  assert.equal(penalized.status,200);
  assert.ok(penalized.body.points<near.body.points);
  assert.equal(near.body.country,actual.country);
});
test('invalid coordinates, forged tickets and invalid hint counts are rejected',()=>{
  const ticket=chooseRounds()[0].ticket;
  for(const guess of [{lat:100,lng:1},{lat:0,lng:200},{lat:'0',lng:0},null]){
    assert.equal(invoke(guessHandler,{ticket,guess}).status,400);
  }
  assert.equal(invoke(guessHandler,{ticket,guess:{lat:0,lng:0},hintsUsed:5}).status,400);
  assert.equal(invoke(guessHandler,{ticket:ticket+'bad',guess:{lat:0,lng:0}}).status,400);
  assert.equal(invoke(hintHandler,{ticket,level:5}).status,400);
  assert.equal(countryChoices('Atlantis').length,0);
});
