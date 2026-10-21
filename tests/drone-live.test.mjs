import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import handler from '../api/drone/session.js';

const originalFetch=globalThis.fetch;
const originalUrl=process.env.STREET_R2_PUBLIC_BASE_URL;
process.env.STREET_R2_PUBLIC_BASE_URL='https://static.example.org';

after(()=>{
  globalThis.fetch=originalFetch;
  if(originalUrl===undefined)delete process.env.STREET_R2_PUBLIC_BASE_URL;
  else process.env.STREET_R2_PUBLIC_BASE_URL=originalUrl;
});
function response() {
  const headers={};
  return {statusCode:0,body:null,headers,
    setHeader(k,v){headers[k]=v;},
    status(n){this.statusCode=n;return this;},
    json(x){this.body=x;return this;},
    end(){return this;},
  };
}
const request={method:'GET',headers:{}};
const countries=['Avusturya','Almanya','İsviçre','İtalya','Fransa','İspanya','Portekiz','Polonya','Belçika','Hollanda','Danimarka','İsveç'];
const photo=i=>({
  id:'air-live-'+String(i).padStart(3,'0'),
  country:countries[i%countries.length],city:'Example Place',lat:47.5,lng:13.6,
  artist:'Example Author',license:'CC BY-SA 4.0',
  licenseUrl:'https://creativecommons.org/licenses/by-sa/4.0/',
  source:'https://commons.wikimedia.org/wiki/File:Example.jpg',
  fact:'Lakeside town in the Alps.',difficulty:'easy',regionCode:'150',
  hint:{tr:'Dağlık bölgede bir yerleşim.',en:'A town in a mountain region.'},
  photoFocus:{tr:'Dağlara ve göle bak.',en:'Examine the lake and mountains.'},
  choices:[countries[i%countries.length],...countries.filter(x=>x!==countries[i%countries.length]).slice(0,3)],approved:true,
});

test('falls back to five built-in safe pictures on R2 outage',async()=>{
  globalThis.fetch=async()=>{throw new Error('network down')};
  const res=response();await handler(request,res);
  assert.equal(res.statusCode,200);
  assert.equal(res.body.origin,'pilot');
  assert.equal(res.body.media.length,5);
  assert.equal(res.headers['Cache-Control'],'no-store');
});

test('49 approved images are staged, not made live',async()=>{
  globalThis.fetch=async()=>({ok:true,text:async()=>JSON.stringify({
    version:1,photos:Array.from({length:49},(_,i)=>photo(i)),
  })});
  const res=response();await handler(request,res);
  assert.equal(res.body.origin,'pilot');
  assert.equal(res.body.rows,undefined);
});

test('50 complete licensed photos are remotely playable',async()=>{
  globalThis.fetch=async()=>({ok:true,text:async()=>JSON.stringify({
    version:1,photos:Array.from({length:50},(_,i)=>photo(i)),
  })});
  const res=response();await handler(request,res);
  assert.equal(res.body.origin,'live');
  assert.equal(res.body.rows.length,50);
  assert.equal(res.body.media.length,50);
  assert.ok(res.body.media[0].media.staticBase.startsWith('https://static.example.org/drone-live/photos/'));
  assert.equal(res.body.rows[0].approved,undefined);
});

test('incomplete imagery metadata never activates a live catalog',async()=>{
  const photos=Array.from({length:50},(_,i)=>photo(i));
  photos[11].choices=['İtalya','Almanya','İsviçre','Fransa'];
  globalThis.fetch=async()=>({ok:true,text:async()=>JSON.stringify({version:1,photos})});
  const res=response();await handler(request,res);
  assert.equal(res.body.origin,'pilot');
});


const galleryCollection=i=>({
  id:'album-'+String(i).padStart(4,'0'),
  country:countries[i%countries.length],city:'Example City',lat:45,lng:12,
  fact:'A recognizable city scene.',difficulty:'easy',regionCode:'150',
  hint:{tr:'Şehirde nehir veya kuleler var.',en:'City with a river or towers.'},
  photoFocus:{tr:'Binalara dikkat et.',en:'Study the buildings.'},
  choices:[countries[i%countries.length],...countries.filter(x=>x!==countries[i%countries.length]).slice(0,3)],
  approved:true,
  images:Array.from({length:4},(_,k)=>({
    artist:'Licensed photographer',license:'CC BY-SA 4.0',
    licenseUrl:'https://creativecommons.org/licenses/by-sa/4.0/',
    source:'https://commons.wikimedia.org/wiki/File:Example'+i+'_'+k+'.jpg',
  })),
});
const v2request={method:'GET',headers:{},query:{v:'2'}};
const galleryResponse=collections=>({ok:true,text:async()=>JSON.stringify({version:2,collections})});

test('a photo album catalog with fewer than 50 real photos remains staged',async()=>{
  globalThis.fetch=async()=>galleryResponse(Array.from({length:12},(_,i)=>galleryCollection(i)));
  const res=response();await handler(v2request,res);
  assert.equal(res.statusCode,200);
  assert.equal(res.body.origin,'pilot');
});

test('thirteen four-image albums create a live 52-image library',async()=>{
  globalThis.fetch=async()=>galleryResponse(Array.from({length:13},(_,i)=>galleryCollection(i)));
  const res=response();await handler(v2request,res);
  assert.equal(res.statusCode,200);
  assert.equal(res.body.origin,'live-gallery');
  assert.equal(res.body.imageCount,52);
  assert.equal(res.body.rows.length,13);
  assert.equal(res.body.media[0].media.mode,'gallery');
  assert.equal(res.body.media[0].media.images.length,4);
  assert.ok(res.body.media[0].media.images[0].url.endsWith('/1.jpg'));
  assert.ok(res.body.media[0].media.images[0].credit.source.includes('commons.wikimedia.org'));
});

test('duplicate or uncredited gallery image rejects activation',async()=>{
  const albums=Array.from({length:13},(_,i)=>galleryCollection(i));
  albums[1].images[0].source=albums[0].images[0].source;
  globalThis.fetch=async()=>galleryResponse(albums);
  const res=response();await handler(v2request,res);
  assert.equal(res.body.origin,'pilot');
});

test('old versions without v=2 never receive unrecognized gallery media',async()=>{
  globalThis.fetch=async()=>galleryResponse(Array.from({length:13},(_,i)=>galleryCollection(i)));
  const res=response();await handler(request,res);
  assert.equal(res.body.origin,'pilot');
  assert.equal(res.body.media.every(x=>x.media.mode==='multires'),true);
});
