import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import { approvedPanoramas } from './approved.mjs';

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
      config: row.multires }
    : { mode: 'equirectangular', image: publicBase + '/' + row.path.replace(/^\/+/, '') };
  return {
    id: row.id, media, ticket: ticketFor(row.id),
    credit: { artist: row.artist, license: row.license, source: row.source },
  };
}
export function chooseRounds() {
  const pool = approvedPanoramas.filter(x => x.approved === true);
  for (let i = pool.length - 1; i > 0; i--) {
    const rnd = Math.floor(Math.random() * (i + 1)); [pool[i], pool[rnd]] = [pool[rnd], pool[i]];
  }
  const chosen = [], used = new Set();
  for (const item of pool) {
    if (used.has(item.country)) continue;
    chosen.push(item); used.add(item.country);
    if (chosen.length === ROUNDS) break;
  }
  if (chosen.length < ROUNDS) {
    for (const item of pool) {
      if (!chosen.includes(item)) chosen.push(item);
      if (chosen.length === ROUNDS) break;
    }
  }
  return chosen.length === ROUNDS ? chosen.map(publicRound) : null;
}
export function distanceKm(a, b) {
  const rad = Math.PI / 180, dLat = (b.lat - a.lat) * rad, dLon = (b.lng - a.lng) * rad;
  const q = Math.sin(dLat / 2) ** 2 +
    Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLon / 2) ** 2;
  return 6371.0088 * 2 * Math.atan2(Math.sqrt(q), Math.sqrt(Math.max(0, 1 - q)));
}
export const scoreKm = km => Math.max(0, Math.min(MAX_PER_ROUND, Math.round(MAX_PER_ROUND * Math.exp(-km / 1100))));
