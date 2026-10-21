import { allowAtlasNativeCors } from '../../server/street/core.mjs';
import { approvedDroneMedia } from '../../server/drone/approved.mjs';
import { readyDronePhotoIds } from '../../server/drone/photo-ready.mjs';

const MIN_LIVE_PHOTOS = 50;
const MAX_LIVE_PHOTOS = 2000;
const ID_RE = /^[a-z0-9][a-z0-9-]{3,60}$/;

// App-store binaries continue to work with the existing five verified photos
// until the remote collection contains at least fifty complete, approved rounds.
function fallback() {
  const ready = new Set(readyDronePhotoIds);
  return approvedDroneMedia.filter(row => ready.has(row.id)).map(row => ({
    id: row.id,
    media: {
      mode: 'multires',
      base: '/drone-photos/' + row.id,
      staticBase: '/drone-photos/' + row.id,
      config: row.multires,
    },
  }));
}
function validRow(row) {
  if (!row || typeof row !== 'object' || Array.isArray(row)) return false;
  const safeText = (v, limit = 500) => typeof v === 'string' && v.trim().length > 0 && v.length <= limit;
  if (!ID_RE.test(row.id || '') || !safeText(row.country, 100) ||
      !safeText(row.city, 140) || !safeText(row.artist, 300) ||
      !safeText(row.fact, 700) || !safeText(row.source, 700) ||
      !safeText(row.license, 60) || !safeText(row.licenseUrl, 250) ||
      !['easy','medium','hard'].includes(row.difficulty)) return false;
  if (!/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/i.test(row.source) ||
      !/^https:\/\/creativecommons\.org\/licenses\/|^https:\/\/creativecommons\.org\/publicdomain\//i.test(row.licenseUrl)) return false;
  if (!Number.isFinite(row.lat) || row.lat < -90 || row.lat > 90 ||
      !Number.isFinite(row.lng) || row.lng < -180 || row.lng > 180) return false;
  if (typeof row.regionCode !== 'string' || !/^(?:00[29]|0[0-9]{2}|1[0-9]{2})$/.test(row.regionCode)) return false;
  if (!row.hint || !safeText(row.hint.tr, 220) || !safeText(row.hint.en, 220) ||
      !row.photoFocus || !safeText(row.photoFocus.tr, 220) ||
      !safeText(row.photoFocus.en, 220)) return false;
  if (!Array.isArray(row.choices) || row.choices.length !== 4 ||
      !row.choices.every(x => safeText(x, 100)) ||
      new Set(row.choices).size !== 4 || !row.choices.includes(row.country)) return false;
  return true;
}
async function liveGallery() {
  const base = process.env.STREET_R2_PUBLIC_BASE_URL?.replace(/\/+$/, '');
  if (!base || !/^https:\/\/[a-z0-9.-]+(?::443)?$/i.test(base)) return null;
  const url = base + '/drone-live/catalog-v1.json?t=' + Math.floor(Date.now() / 60000);
  const timeout = AbortSignal.timeout(4500);
  try {
    const response = await fetch(url, { signal: timeout, cache: 'no-store' });
    if (!response.ok) return null;
    const text = await response.text();
    if (text.length > 1200000) return null;
    const manifest = JSON.parse(text);
    if (manifest.version !== 1 || !Array.isArray(manifest.photos) ||
        manifest.photos.length < MIN_LIVE_PHOTOS || manifest.photos.length > MAX_LIVE_PHOTOS) return null;
    const rows = manifest.photos.filter(row => row.approved === true && validRow(row));
    if (rows.length < MIN_LIVE_PHOTOS || new Set(rows.map(x => x.id)).size !== rows.length ||
        new Set(rows.map(x => x.country)).size < 10) return null;
    // Whitelist only game content: editorial flags or future private fields
    // can never become part of a public player response.
    const publicRows = rows.map(row => ({
      id:row.id, country:row.country, city:row.city, fact:row.fact,
      lat:row.lat, lng:row.lng, artist:row.artist, license:row.license,
      licenseUrl:row.licenseUrl, source:row.source,
      difficulty:row.difficulty, regionCode:row.regionCode,
      hint:row.hint, photoFocus:row.photoFocus, choices:row.choices,
    }));
    return {
      rows: publicRows,
      media: rows.map(row => {
        const staticBase = base + '/drone-live/photos/' + row.id;
        return {
          id: row.id,
          media: {
            mode: 'multires',
            base: staticBase,
            staticBase,
            config: {
              path: '/%l/%s%y_%x', extension: 'jpg',
              tileResolution: 512, maxLevel: 1, cubeResolution: 900,
            },
          },
        };
      }),
    };
  } catch {
    return null; // An unavailable CDN never takes down the five-photo pilot.
  }
}

export default async function handler(req, res) {
  if (allowAtlasNativeCors(req, res)) return;
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (req.method !== 'GET') return res.status(405).json({error: 'Method not allowed'});
  const live = await liveGallery();
  if (live) return res.status(200).json({...live, origin: 'live'});
  const media = fallback();
  if (media.length < 5) return res.status(503).json({
    error: 'Dron görüntülerinin güvenli kopyaları hazırlanıyor. Biraz sonra tekrar dene.',
  });
  return res.status(200).json({media, origin: 'pilot'});
}
