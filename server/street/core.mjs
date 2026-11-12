import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import { approvedPanoramas } from './approved.mjs';
import { approvedPhotoIds } from './photo-ready.mjs';
import { COUNTRY_HINTS, STREET_PLAYABLE_IDS, STREET_PLAYABLE_SOURCE_IDS, STREET_EASY_IDS } from './country-mode.mjs';

const SECRET = process.env.STREET_SESSION_SECRET ?? '';
export const ROUNDS = 5;
export const MAX_PER_ROUND = 5000;
export const configured = () => SECRET.length >= 32 &&
  /^https:\/\/[^/]+\/?$/.test(process.env.STREET_R2_PUBLIC_BASE_URL || '');

// Only the installed app's webview origins may call HTTPS game functions
// cross-origin. Browser access on the Vercel domain remains same-origin.
export function allowAtlasNativeCors(req,res){
  const origin=req.headers?.origin??req.headers?.Origin??'';
  const allowed=new Set(['capacitor://localhost','ionic://localhost','http://localhost','https://localhost']);
  if(allowed.has(origin)){
    res.setHeader('Access-Control-Allow-Origin',origin);
    res.setHeader('Vary','Origin');
    res.setHeader('Access-Control-Allow-Methods','GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers','Content-Type');
    res.setHeader('Access-Control-Max-Age','3600');
  }
  if(req.method==='OPTIONS'){
    if(!allowed.has(origin))return res.status(403).end();
    return res.status(204).end();
  }
  return false;
}
export function send(res, status, data) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.status(status).json(data);
}
function mac(value) { return createHmac('sha256', SECRET).update(value).digest('base64url'); }
// Generic signed token: base64url(JSON) + '.' + HMAC. Every token carries a
// kind so a ticket can never be replayed as a receipt or a tour token.
export function signToken(kind, data, ttlMs = 45 * 60 * 1000) {
  const body = { ...data, k: kind, expiry: Date.now() + ttlMs };
  const payload = Buffer.from(JSON.stringify(body)).toString('base64url');
  return payload + '.' + mac(payload);
}
export function readToken(token, kind) {
  if (typeof token !== 'string' || token.length > 2000) return null;
  const [payload, signature, excess] = token.split('.');
  if (!payload || !signature || excess || signature.length !== 43) return null;
  const expected = Buffer.from(mac(payload));
  const supplied = Buffer.from(signature);
  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) return null;
  try {
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (!Number.isFinite(decoded.expiry) || decoded.expiry < Date.now()) return null;
    if ((decoded.k ?? 't') !== kind) return null;
    return decoded;
  } catch { return null; }
}
// Round ticket. `tour` binds the ticket to one played tour, `nonce` makes it single-use.
export function ticketFor(id, tour = null) {
  return signToken('t', { id, tour, nonce: randomUUID() });
}
export function parseTicket(ticket) {
  const t = readToken(ticket, 't');
  return t && typeof t.id === 'string' && typeof t.nonce === 'string' ? t : null;
}
export function validateTicket(ticket) {
  const t = parseTicket(ticket);
  return t ? approvedPanoramas.find(x => x.id === t.id) ?? null : null;
}
export function publicRound(row, tour = null) {
  const publicBase = process.env.STREET_R2_PUBLIC_BASE_URL.replace(/\/$/, '');
  // Never expose GPS, city, country, street name or identifying EXIF.
  const media = row.mode === 'multires'
    ? { mode: 'multires', base: publicBase + '/' + row.path.replace(/^\/+|\/+$/g, ''),
      staticBase: '/street-photos/' + row.id, config: row.multires }
    : { mode: 'equirectangular', image: publicBase + '/' + row.path.replace(/^\/+/, '') };
  return {
    id: row.id, media, ticket: ticketFor(row.id, tour),
    credit: { artist: row.artist, license: row.license, source: row.source },
    // Neither answer options nor clue data are shipped before a rewarded hint.
  };
}
export function chooseRounds(tour = null) {
  const ready = new Set(approvedPhotoIds);
  // Only show curated and successfully synced photos, never random interiors or
  // nondescript forest paths. Reserve the fifth round for a modest challenge.
  const pool = approvedPanoramas.filter(x=>x.approved === true &&
    ready.has(x.id) && (STREET_PLAYABLE_IDS.has(x.id) || STREET_PLAYABLE_SOURCE_IDS.has(x.sourceId)) && COUNTRY_HINTS[x.country]);
  // Each player gets the SAME five-country weekly challenge from Monday UTC.
  // Start on 26 Oct 2026, so the current week's existing results stay comparable.
  const today = new Date();
  const monday = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(),
    today.getUTCDate() - ((today.getUTCDay() + 6) % 7)));
  const weekly = monday.toISOString().slice(0, 10) >= '2026-10-26';
  let random = Math.random;
  if (weekly) {
    const key = 'globriva-street-five:' + monday.toISOString().slice(0, 10);
    let seed = 2166136261;
    for (let i = 0; i < key.length; i++) {
      seed = Math.imul(seed ^ key.charCodeAt(i), 16777619);
    }
    random = () => {
      seed = (seed + 0x6D2B79F5) >>> 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const shuffle = items => {
    // Canonical sorting keeps each week's result independent of catalog order.
    const sorted = weekly ? [...items].sort((a, b) => a.id.localeCompare(b.id)) : [...items];
    for (let i = sorted.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [sorted[i], sorted[j]] = [sorted[j], sorted[i]];
    }
    return sorted;
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
  return chosen.length === ROUNDS ? chosen.map(row => publicRound(row, tour)) : null;
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
