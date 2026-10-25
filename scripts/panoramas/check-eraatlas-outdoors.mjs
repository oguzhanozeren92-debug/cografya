#!/usr/bin/env node
/**
 * Globriva: offline guard for EraAtlas exterior photo candidate handoff.
 * This only validates metadata. It DOES NOT approve, download, publish,
 * geolocate, or prove the outdoor scene / panoramic rendering.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const file = path.join(root, 'data/eraatlas-outdoor-review-2026-10-25.json');
const doc = JSON.parse(fs.readFileSync(file, 'utf8'));
const candidates = Array.isArray(doc.candidates) ? doc.candidates : [];
const deferred = Array.isArray(doc.deferredCandidates) ? doc.deferredCandidates : [];
const errors = [];
const seenIds = new Set();
const seenSources = new Set();
const seenEraIds = new Set();
const commonsFile = /^https:\/\/commons\.wikimedia\.org\/wiki\/File:/;
const supportedLicense = /^(?:CC0 1\.0|CC BY(?:-SA)? [234]\.0)$/;
const licensePage = /^https:\/\/creativecommons\.org\/(?:licenses|publicdomain)\//;
const fail = (valid, message) => { if (!valid) errors.push(message); };

fail(doc.sourceProject === 'EraAtlas' && doc.project === 'Globriva',
  'Wrong project handoff');
fail(doc.currentState === 'OUTDOOR_CANDIDATES_ONLY_NOT_PLAYABLE',
  'Candidate-only safety status changed');
fail(candidates.length > 0, 'No outdoor candidates in queue');
fail(doc.screeningSummary?.keptOutdoorCandidate === candidates.length &&
     doc.screeningSummary?.excludedOrDeferred === deferred.length &&
     doc.screeningSummary?.reviewedBefore === candidates.length + deferred.length &&
     doc.screeningSummary?.addedToPlayable === 0,
  'Review summary counts disagree with candidate inventory');

for (const [section, items] of [['candidate', candidates], ['deferred', deferred]]) {
  for (const item of items) {
    const id = item?.id || '(missing id)';
    fail(typeof item?.id === 'string' && item.id.startsWith('eraatlas-') && !seenIds.has(id),
      id + ': duplicate/missing identifier');
    seenIds.add(id);
    fail(typeof item?.eraAtlasId === 'string' && item.eraAtlasId.length > 2 &&
         !seenEraIds.has(item.eraAtlasId), id + ': repeated EraAtlas place');
    seenEraIds.add(item?.eraAtlasId);
    fail(commonsFile.test(item?.sourceUrl || '') && !seenSources.has(item?.sourceUrl),
      id + ': missing or repeated original Commons file page');
    seenSources.add(item?.sourceUrl);
    fail(Boolean(item?.landmark && item?.country && item?.file),
      id + ': location or original file name is missing');
    fail(item?.playable === false && item?.approved === false,
      id + ': unverified photo must NEVER be activated');
    if (section === 'candidate') {
      const size = item?.reportedDimensions || {};
      fail(size.width >= 2048 && size.height >= 1024 && size.width === size.height * 2,
        id + ': candidate is not 2:1 spherical-ratio source');
      fail(supportedLicense.test(item?.license || '') && licensePage.test(item?.licenseUrl || '') &&
           Boolean(item?.artist), id + ': author or license metadata not ready');
      fail(item?.captureEnvironment === 'outdoor_candidate' &&
           item?.expectedScene === 'outdoor_to_verify' &&
           item?.qaStatus === 'review_required',
        id + ': outdoor editorial review gate is missing');
      fail(item?.sceneVerified !== true || item?.outdoorVisualVerified === true,
        id + ': scene verified without outdoor visual evidence');
    } else {
      fail(item?.qaStatus?.startsWith('excluded_') &&
           ['indoor', 'unverified'].includes(item?.captureEnvironment),
        id + ': excluded/indoor item accidentally moved into candidate pool');
    }
  }
}
const report = {
  project: 'Globriva', sourceProject: 'EraAtlas',
  candidatesAwaitingVisualReview: candidates.length,
  excludedOrDeferred: deferred.length,
  countriesRepresented: new Set(candidates.map(x => x.country)).size,
  playableApprovedFromThisQueue: 0,
  staticMetadataPass: errors.length === 0,
  errors,
  note: '2:1 ratio and licence metadata do not prove true 360, commercial-rights clearance, image availability, location, or suitability. No candidate is published.'
};
console.log(JSON.stringify(report, null, 2));
if (errors.length) process.exitCode = 1;
