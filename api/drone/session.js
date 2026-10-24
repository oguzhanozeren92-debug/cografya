import { allowAtlasNativeCors } from '../../server/street/core.mjs';
import { approvedDroneMedia } from '../../server/drone/approved.mjs';
import { readyDronePhotoIds } from '../../server/drone/photo-ready.mjs';

const MIN_LIVE_PHOTOS = 50;
const MAX_LIVE_PHOTOS = 2000;
const ID_RE = /^[a-z0-9][a-z0-9-]{3,60}$/;

// App-store binaries continue to work with the existing five verified photos
// until GitHub's reviewed collection contains enough complete rounds.
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


const GALLERY_MIN_IMAGES = 50; // Fifty INDIVIDUAL photos, not 50 panoramas.
const GALLERY_MIN_COUNTRIES = 10;
const GALLERY_PATH = '/drone-gallery/catalog-v2.json';
const safeText = (v, limit = 500) => typeof v === 'string' && v.trim().length > 0 && v.length <= limit;
const isCommons = url => /^https:\/\/commons\.wikimedia\.org\/wiki\/File:/i.test(url || '');
const isCc = url => /^https:\/\/creativecommons\.org\/(?:licenses|publicdomain)\//i.test(url || '');
function validGalleryCollection(row) {
  if (!row || typeof row !== 'object' || !ID_RE.test(row.id || '')) return false;
  if (!safeText(row.country,100) || !safeText(row.city,140) ||
      !safeText(row.fact,700) || !['easy','medium','hard'].includes(row.difficulty)) return false;
  if (!Number.isFinite(row.lat) || row.lat < -90 || row.lat > 90 ||
      !Number.isFinite(row.lng) || row.lng < -180 || row.lng > 180 ||
      !/^\d{3}$/.test(row.regionCode || '')) return false;
  if (!row.hint || !safeText(row.hint.tr,220) || !safeText(row.hint.en,220) ||
      !row.photoFocus || !safeText(row.photoFocus.tr,220) || !safeText(row.photoFocus.en,220)) return false;
  if (!Array.isArray(row.choices) || row.choices.length !== 4 ||
      !row.choices.every(x=>safeText(x,100)) ||
      new Set(row.choices).size !== 4 || !row.choices.includes(row.country)) return false;
  if (!Array.isArray(row.images) || row.images.length < 3 || row.images.length > 4) return false;
  return row.images.every(photo => photo && safeText(photo.artist,300) &&
      safeText(photo.license,60) && isCc(photo.licenseUrl) && isCommons(photo.source) &&
      (photo.format === undefined || photo.format === 'jpg' || photo.format === 'webp'));
}

async function photoGallery(base) {
  try {
    const response = await fetch(base + GALLERY_PATH + '?t=' + Math.floor(Date.now()/60000),
       {signal:AbortSignal.timeout(4500),cache:'no-store'});
    if (!response.ok) return null;
    const raw = await response.text();
    if (raw.length > 1200000) return null;
    const manifest = JSON.parse(raw);
    if (manifest.version !== 2 || !Array.isArray(manifest.collections) ||
        manifest.collections.length < 5 || manifest.collections.length > 600) return null;
    // Only editor-approved albums are eligible. Pending albums are intentionally
    // excluded: 16 complete albums can supply 50+ photos while four remain under review.
    const approved = manifest.collections.filter(x => x.approved === true);
    const collections = approved.filter(validGalleryCollection);
    if (collections.length < 5 || collections.length !== approved.length ||
        new Set(collections.map(x => x.id)).size !== collections.length ||
        new Set(collections.map(x => x.country)).size < GALLERY_MIN_COUNTRIES ||
        new Set(collections.flatMap(x => x.images.map(image => image.source))).size !==
          collections.reduce((sum,x)=>sum+x.images.length,0) ||
        collections.reduce((sum,x)=>sum+x.images.length,0) < GALLERY_MIN_IMAGES) return null;

    // Serve every verified image but vary the opening angle per session.
    // Retain original file indices: rotating cards must never fabricate 1.jpg/1.webp.
    // The app still sees one location per album, not three near-identical rounds.
    const imageCount=collections.reduce((sum,x)=>sum+x.images.length,0);
    const rounds=collections.map(row=>{
      const indexed=row.images.map((pic,index)=>({pic,fileIndex:index+1}));
      const start=Math.floor(Math.random()*indexed.length);
      return {row,images:indexed.slice(start).concat(indexed.slice(0,start))};
    });
    return {
      origin:'live-gallery',
      imageCount,
      rows:rounds.map(({row,images}) => ({
        id:row.id,city:row.city,country:row.country,lat:row.lat,lng:row.lng,
        artist:images[0].pic.artist,license:images[0].pic.license,
        licenseUrl:images[0].pic.licenseUrl,source:images[0].pic.source,
        fact:row.fact,difficulty:row.difficulty,regionCode:row.regionCode,
        hint:row.hint,photoFocus:row.photoFocus,choices:row.choices,
      })),
      media:rounds.map(({row,images}) => ({
        id:row.id,media:{mode:'gallery',images:images.map(({pic,fileIndex})=>({
          url:base+'/drone-gallery/photos/'+row.id+'/'+fileIndex+'.'+(pic.format === 'webp' ? 'webp' : 'jpg'),
          credit:{artist:pic.artist,license:pic.license,licenseUrl:pic.licenseUrl,source:pic.source},
        }))},
      })),
    };
  }catch{return null;}
}

export default async function handler(req, res) {
  if (allowAtlasNativeCors(req, res)) return;
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (req.method !== 'GET') return res.status(405).json({error: 'Method not allowed'});
  // v=2 opt-in prevents older App Store binaries from seeing a new media type.
  const galleryCapable = String(req.query?.v ?? '') === '2';
  // Read assets from this exact deployment first. This lets preview/staging
  // builds validate their own gallery instead of accidentally fetching an
  // outdated catalog from the production alias. Fall back to the canonical
  // production host when VERCEL_URL is unavailable (e.g. local development).
  const productionGalleryOrigin = 'https://atlas-arena-tau.vercel.app';
  const vercelHost = process.env.VERCEL_URL || '';
  const deployedGalleryOrigin =
    /^[a-z0-9-]+(?:\.[a-z0-9-]+)*\.vercel\.app$/i.test(vercelHost)
      ? 'https://' + vercelHost : '';
  const galleryOrigins = [...new Set([deployedGalleryOrigin,productionGalleryOrigin].filter(Boolean))];
  if (galleryCapable) {
    for (const origin of galleryOrigins) {
      const local = await photoGallery(origin);
      if (local) return res.status(200).json({...local, origin: 'github-gallery'});
    }
  }
  // Keep the old R2 integration as an explicit optional rollback only. Missing R2
  // never slows GitHub-backed v2 clients or breaks the built-in five-photo pilot.
  if (process.env.GLOBRIVA_R2_FALLBACK === '1') {
    const cdn = process.env.STREET_R2_PUBLIC_BASE_URL?.replace(/\/+$/,'');
    if (galleryCapable && cdn && /^https:\/\/[a-z0-9.-]+(?::443)?$/i.test(cdn)) {
      const gallery = await photoGallery(cdn);
      if (gallery) return res.status(200).json(gallery);
    }
    const live = await liveGallery();
    if (live) return res.status(200).json({...live, origin: 'live'});
  }
  const media = fallback();
  if (media.length < 5) return res.status(503).json({
    error: 'Dron görüntülerinin güvenli kopyaları hazırlanıyor. Biraz sonra tekrar dene.',
  });
  return res.status(200).json({media, origin: 'pilot'});
}
