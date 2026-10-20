import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import { approvedPanoramas } from './approved.mjs';
import { approvedPhotoIds } from './photo-ready.mjs';
import { COUNTRY_HINTS, STREET_PLAYABLE_IDS, STREET_EASY_IDS } from './country-mode.mjs';

const SECRET = process.env.STREET_SESSION_SECRET ?? '';
export const ROUNDS = 5;
export const MAX_PER_ROUND = 5000;
export const configured = () => SECRET.length >= 32 &&
  /^https:\/\/[^/]+\/?$/.test(process.env.STREET_R2_PUBLIC_BASE_URL || '');

export function send(res, status, data) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.status(status).json(data);
}
function mac(value) { return createHmac('sha256', SECRET).update(value).digest('base64url'); }
export function ticketFor(id) {
  const expiry = Date.now() + 45 * 60 * 1000;
  const payload = Buffer.from(JSON.stringify({ id, expiry, nonce: randomUUID() })).toString('base64url');
  return payload + '.' + mac(payload);
}
export function validateTicket(ticket) {
  if (typeof ticket !== 'string' || ticket.length > 1000) return null;
  const [payload, signature, excess] = ticket.split('.');
  if (!payload || !signature || excess || signature.length !== 43) return null;
  const expected = Buffer.from(mac(payload));
  const supplied = Buffer.from(signature);
  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) return null;
  try {
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (typeof decoded.id !== 'string' || !Number.isFinite(decoded.expiry) || decoded.expiry < Date.now()) return null;
    return approvedPanoramas.find(x => x.id === decoded.id) ?? null;
  } catch { return null; }
}
export function publicRound(row) {
  const publicBase = process.env.STREET_R2_PUBLIC_BASE_URL.replace(/\/$/, '');
  // Never expose GPS, city, country, street name or identifying EXIF.
  const media = row.mode === 'multires'
    ? { mode: 'multires', base: publicBase + '/' + row.path.replace(/^\/+|\/+$/g, ''),
      staticBase: '/street-photos/' + row.id, config: row.multires }
    : { mode: 'equirectangular', image: publicBase + '/' + row.path.replace(/^\/+/, '') };
  return {
    id: row.id, media, ticket: ticketFor(row.id),
    credit: { artist: row.artist, license: row.license, source: row.source },
    // Neither answer options nor clue data are shipped before a rewarded hint.
  };
}
export function chooseRounds() {
  const ready = new Set(approvedPhotoIds);
  // Only show curated and successfully synced photos, never random interiors or
  // nondescript forest paths. Reserve the fifth round for a modest challenge.
  const pool = approvedPanoramas.filter(x=>x.approved === true &&
    ready.has(x.id) && STREET_PLAYABLE_IDS.has(x.id) && COUNTRY_HINTS[x.country]);
  const shuffle = items => {
    for(let i=items.length-1;i>0;i--){
      const j=Math.floor(Math.random()*(i+1));
      [items[i],items[j]]=[items[j],items[i]];
    }
    return items;
  };
  const easy=shuffle(pool.filter(row=>STREET_EASY_IDS.has(row.id)));
  const medium=shuffle(pool.filter(row=>!STREET_EASY_IDS.has(row.id)));
  const chosen=[],used=new Set();
  function addDistinct(rows,amount){
    for(const item of rows){
      if(chosen.length>=amount)break;
      if(used.has(item.country))continue;
      chosen.push(item);used.add(item.country);
    }
  }
  addDistinct(easy,4);
  addDistinct(medium,ROUNDS);
  if(chosen.length<ROUNDS)addDistinct(easy,ROUNDS);
  return chosen.length === ROUNDS ? chosen.map(publicRound) : null;
}
export function distanceKm(a, b) {
  const rad = Math.PI / 180, dLat = (b.lat - a.lat) * rad, dLon = (b.lng - a.lng) * rad;
  const q = Math.sin(dLat / 2) ** 2 +
    Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLon / 2) ** 2;
  return 6371.0088 * 2 * Math.atan2(Math.sqrt(q), Math.sqrt(Math.max(0, 1 - q)));
}
export const scoreKm = km => {
  if(!Number.isFinite(km)||km<0)return 0;
  const steps=[[0,5000],[10,4900],[50,4500],[100,4000],[250,3000],[500,1800],[1000,600],[2000,100],[3000,0]];
  for(let i=1;i<steps.length;i++){
    const [maxKm,maxPoints]=steps[i];
    if(km<=maxKm){
      const [minKm,minPoints]=steps[i-1];
      return Math.round(minPoints+(maxPoints-minPoints)*(km-minKm)/(maxKm-minKm));
    }
  }
  return 0;
};
