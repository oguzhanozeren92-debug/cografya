// Ranked Street Detective: server-side scoring, single-use tickets and a signed
// final score. The client never decides its own points.
//
// Flow
//   1. /api/street/session      -> 5 street tickets + tourToken (all bound to one tour id)
//   2. /api/street/aerial-ticket -> tickets for the 2 aerial (gallery) rounds of that tour
//   3. /api/street/hint          -> registers each hint against the ticket nonce
//   4. /api/street/guess         -> scores once per ticket and returns a signed receipt
//   5. /api/street/finish        -> 5 receipts of one tour -> signed score certificate
//   6. Supabase geo_submit_street_country_score_v2 verifies the certificate (HMAC)
//      and accepts each tour only once.
import { createHmac, randomUUID } from 'node:crypto';
import { signToken, readToken, ticketFor } from './core.mjs';

export const ROUND_LIMIT = 5;
export const AERIAL_MAX_POINTS = [5000, 4200, 3400, 2500, 1500];

export function newTour() {
  const tour = randomUUID();
  return { tour, tourToken: signToken('tour', { tour }, 90 * 60 * 1000) };
}
export function readTour(token) {
  const t = readToken(token, 'tour');
  return t && typeof t.tour === 'string' ? t.tour : null;
}
export function receiptFor(ticket, points, ranked) {
  return signToken('r', { tour: ticket.tour ?? null, nonce: ticket.nonce, id: ticket.id, points, ranked }, 3 * 60 * 60 * 1000);
}
export function readReceipt(token) {
  const r = readToken(token, 'r');
  return r && typeof r.nonce === 'string' && Number.isInteger(r.points) ? r : null;
}

// ---- single-use claims (Supabase, anon key + security-definer RPC) ----
function supabase() {
  const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').replace(/\/+$/, '');
  const key = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
  return /^https:\/\/[a-z0-9-]+\.supabase\.(co|in)$/.test(url) && key ? { url, key } : null;
}
/**
 * Registers one use of a ticket nonce.
 *   kind 'guess'   -> { ok, hints }  ok=false when this ticket was already guessed
 *   kind 'hint1..' -> { ok:true, hints }
 * Returns null when the claim store is unreachable or not installed yet; callers
 * then still let the game continue but mark the round as unranked.
 */
export async function claim(nonce, kind) {
  const db = supabase();
  if (!db) return null;
  try {
    const res = await fetch(db.url + '/rest/v1/rpc/geo_street_ticket_use', {
      method: 'POST',
      headers: { apikey: db.key, Authorization: 'Bearer ' + db.key, 'Content-Type': 'application/json' },
      body: JSON.stringify({ p_nonce: nonce, p_kind: kind }),
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return null;
    const value = await res.json();
    if (!Number.isInteger(value)) return null;
    return value < 0 ? { ok: false, hints: 0 } : { ok: true, hints: value };
  } catch {
    return null;
  }
}

// ---- aerial (photo gallery) rounds, scored with the same catalogue the game shows ----
let aerialCache = { at: 0, rows: null };
export async function aerialRows() {
  if (aerialCache.rows && Date.now() - aerialCache.at < 5 * 60 * 1000) return aerialCache.rows;
  const host = process.env.VERCEL_URL || '';
  const origins = [...new Set([
    /^[a-z0-9-]+(?:\.[a-z0-9-]+)*\.vercel\.app$/i.test(host) ? 'https://' + host : '',
    'https://atlas-arena-tau.vercel.app',
  ].filter(Boolean))];
  for (const origin of origins) {
    try {
      const res = await fetch(origin + '/drone-gallery/catalog-v2.json?t=' + Math.floor(Date.now() / 60000),
        { signal: AbortSignal.timeout(4500), cache: 'no-store' });
      if (!res.ok) continue;
      const doc = await res.json();
      const rows = new Map();
      for (const row of doc.collections ?? []) {
        if (row?.approved === true && typeof row.id === 'string' && Number.isFinite(row.lat) && Number.isFinite(row.lng))
          rows.set(row.id, { id: row.id, lat: row.lat, lng: row.lng, country: row.country, city: row.city, fact: row.fact });
      }
      if (rows.size) { aerialCache = { at: Date.now(), rows }; return rows; }
    } catch { /* try next origin */ }
  }
  return aerialCache.rows ?? new Map();
}
export function aerialTicket(id, tour) {
  return ticketFor('aerial:' + id, tour);
}

// ---- final certificate, verified inside Postgres with the same secret ----
export function certificate(tour, score) {
  const secret = process.env.GEO_SCORE_SECRET || '';
  if (secret.length < 32) return null;
  const exp = Math.floor(Date.now() / 1000) + 30 * 60;
  const sig = createHmac('sha256', secret).update(tour + '|' + score + '|' + exp).digest('hex');
  return { tour, score, exp, sig };
}
