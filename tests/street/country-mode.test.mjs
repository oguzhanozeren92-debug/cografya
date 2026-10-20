import test from 'node:test';
import assert from 'node:assert/strict';
import { approvedPanoramas } from '../../server/street/approved.mjs';
import { COUNTRY_HINTS, STREET_PLAYABLE_IDS, countryAnswerPoints } from '../../server/street/country-mode.mjs';

process.env.STREET_SESSION_SECRET='unit-test-secret-minimum-32-characters-long';
process.env.STREET_R2_PUBLIC_BASE_URL='https://example.invalid';

const { chooseRounds, validateTicket }=await import('../../server/street/core.mjs');
const { default:guessHandler }=await import('../../api/street/guess.js');

const invoke=(body,method='POST')=>{
  let status=0,bodyOut=null;
  const res={
    headers:{},
    setHeader(key,value){this.headers[key]=value;},
    status(value){status=value;return this;},
    json(value){bodyOut=value;return this;}
  };
  guessHandler({method,body},res);
  return {status,body:bodyOut};
};

test('all curated photos have a licensed source, a complete country clue and local imagery',()=>{
  const selected=approvedPanoramas.filter(row=>STREET_PLAYABLE_IDS.has(row.id));
  assert.ok(selected.length>=15);
  for(const row of selected){
    assert.ok(row.approved===true);
    assert.ok(COUNTRY_HINTS[row.country],row.country);
    assert.ok(row.source.startsWith('https://commons.wikimedia.org/'));
    assert.ok(COUNTRY_HINTS[row.country].landmark);
  }
});

test('country-first sessions contain 5 different locations, 4 valid options and no coordinates',()=>{
  for(let i=0;i<20;i++){
    const rounds=chooseRounds();
    assert.equal(rounds?.length,5);
    const answerCountries=rounds.map(round=>validateTicket(round.ticket)?.country);
    assert.equal(new Set(answerCountries).size,5);
    for(const round of rounds){
      const selected=validateTicket(round.ticket);
      assert.ok(STREET_PLAYABLE_IDS.has(round.id));
      assert.ok(selected);
      assert.equal(round.countryOptions.length,4);
      assert.equal(new Set(round.countryOptions).size,4);
      assert.ok(round.countryOptions.includes(selected.country));
      assert.ok(round.hints.region);
      assert.ok(round.hints.landmark);
      assert.equal(round.lat,undefined);
      assert.equal(round.city,undefined);
      assert.equal(round.country,undefined);
    }
  }
});

test('right country gives full credit; first and second clue reduce possible points',()=>{
  const round=chooseRounds()[0];
  const correct=validateTicket(round.ticket).country;
  const wrong=round.countryOptions.find(x=>x!==correct);
  for(const [hintsUsed,expected] of [[0,5000],[1,3500],[2,2000]]){
    const response=invoke({ticket:round.ticket,countryGuess:correct,hintsUsed});
    assert.equal(response.status,200);
    assert.equal(response.body.correct,true);
    assert.equal(response.body.points,expected);
    assert.equal(response.body.country,correct);
  }
  const incorrect=invoke({ticket:round.ticket,countryGuess:wrong,hintsUsed:0});
  assert.equal(incorrect.status,200);
  assert.equal(incorrect.body.correct,false);
  assert.equal(incorrect.body.points,0);
});

test('invalid hints, forged tickets and unrecognised countries are rejected',()=>{
  const round=chooseRounds()[0];
  assert.equal(invoke({ticket:round.ticket,countryGuess:round.countryOptions[0],hintsUsed:-1}).status,400);
  assert.equal(invoke({ticket:round.ticket,countryGuess:round.countryOptions[0],hintsUsed:9}).status,400);
  assert.equal(invoke({ticket:round.ticket,countryGuess:'Atlantis',hintsUsed:0}).status,400);
  assert.equal(invoke({ticket:round.ticket+'tampered',countryGuess:round.countryOptions[0]}).status,400);
  assert.throws(()=>countryAnswerPoints(true,99),RangeError);
});
