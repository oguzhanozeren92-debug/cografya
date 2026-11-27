# Globriva daily content audit — 27 November 2026

Repository: `oguzhanozeren92-debug/cografya`  
Branch: `main`  
Review-only question/image package commit: `91ffda02f92e635cb711f1da807c468c85e3dc5d`

## 1. Loader-linked inventory snapshot

The most recent executable-loader inventory available in the repository's 25 November audit was reused as the baseline. The archive-bot commit on 26 November updated the daily discovery archive, but no loader audit was run this day; figures below are therefore not presented as a fresh execution.

| Pool | Last verified snapshot | Difficulty / status |
|---|---:|---|
| Country entries | 167 | 52 easy / 62 medium / 53 hard |
| Capital variants | 167 | derived from country entries |
| Flag variants | 167 | 168 flag codes, 167 loader matches |
| Country clue cards | 99 | 31 easy / 33 medium / 35 hard |
| Nature map targets | 66 | 22 / 22 / 22 |
| Island silhouette targets | 22 | 6 / 7 / 9 |
| Border focus candidates | 43 | geospatial playable tiers not recomputed |
| Street approved manifest records | 39 | loader eligible: 19 locations / 76 fallback faces |
| Drone pilot | 5 | 20 fallback faces |
| Drone Gallery catalog | 32 albums / 99 photo entries | 28 approved flags / 87 local files; 12 albums editorially reviewed; live publish: 0 |
| New review-only questions | 0 | 9 added |
| New playable questions | 0 | 0 |
| New image-source candidates | 0 | 7 added |
| Newly verified playable images | 0 | 0 |

Pools are separate game modes and are not summed into one misleading question total. Gallery approval flags, local files and editorial review do not imply live or mobile-playable publication.

## 2. New question pack

Added `data/open-content/question-rounds/2026-11-27.json` with 9 bilingual review-only candidates:

- Flag: South Africa's V-shaped design and the interpretation of convergence/unity.
- Culture: Ifugao terrace irrigation and water from mountain-top forests.
- Civilization: Bagan's 11th–13th-century peak.
- Culture/architecture: Aït Benhaddou's fortified earthen ksar.
- Nature: Brahmaputra floodplain dynamics in Kaziranga.
- City/street: Valparaíso's hillside funicular ascensores.
- Civilization: Sankore and Timbuktu's intellectual role.
- Island geography: Spitsbergen and the Svalbard Global Seed Vault.
- Border geography: Iguazú/Iguaçu Falls across Argentina and Brazil.

Each candidate has four bilingual choices, a correct answer index, a short explanation and HTTPS fact sources. Internal JSON/ID/prompt/choice-count/answer-index/source checks passed. Topic/location comparisons against the 24–26 November daily packs found no exact repeats. The full 47-record draft catalog was not retrieved this run, so historical deduplication remains incomplete. All nine are `playable:false`; none is loader-integrated.

## 3. Photo-source candidates

Seven Commons source pages were opened/reviewed for author, stated license, dimensions and subject/location description:

| Candidate | File-page metadata | License | Location notes |
|---|---|---|---|
| Ifugao terraces | 4160×3120; Pogidawako1234 | CC BY-SA 4.0 | subject described; no camera GPS confirmed |
| Bagan temples | 5184×3888; Christophe95 | CC BY-SA 4.0 | camera coordinate listed on Commons |
| Aït Benhaddou | 8000×4499; Kassimi m'bark | CC BY-SA 4.0 | location described; camera GPS not confirmed |
| Kaziranga rhino | 5456×3064; Horshadeep Saikia | CC BY-SA 4.0 | park subject confirmed; camera GPS not confirmed |
| Valparaíso/Ascensor Artillería | 3215×2448; Javier Rubilar | CC BY-SA 2.0 | camera coordinate listed |
| Sankore Mosque, Timbuktu | 2831×1836; upyernoz | CC BY 2.0 | camera and depicted-place coordinates listed |
| Svalbard Seed Vault | 3702×2484; Einar Jørgen Haraldseid | CC BY-SA 2.0 | entrance subject confirmed; camera GPS not confirmed |

All listed licenses permit commercial reuse subject to their respective terms. CC BY requires attribution, a license link and change notice; CC BY-SA also requires compatible ShareAlike licensing for adaptations. Source credits and license URLs are stored in the candidate pack.

Commons source pages were reachable in the research session. Direct-original file HTTP tests, R2/CDN tests and iOS/Android rendering tests were **not** performed. None of the seven candidates is counted as playable or approved for publication.

## 4. Existing image issues and discovery archive

Latest repository status remains the 26 November snapshot:

- Street publishing errors: Gullfoss, Copenhagen and Yerevan (3).
- Drone Gallery HTTP 429 records: 10.
- Album-024: license-change review.
- Album-028: original file too large for the publisher.
- Gallery live publication: 0 albums / 0 photos.

The 26 November discovery archive reported 9 regions searched, 21 new unique pending candidates (20 clustered in Paris and 1 in Cusco), 752 total candidates seen/pending, 0 uploads and 0 activations. Preliminary geotag/licensing checks are not editorial or mobile validation.

No URLs, manifests or publishing status were bypassed or repaired without verification.

## 5. Tests and blockers

- Review-pack JSON and internal validation: **passed**.
- GitHub write and package readback: **passed**.
- Repository Node tests: **not run**.
- Strict loader audit: **not run**.
- TypeScript / Vite build: **not run**.
- Live Commons URL audit and mobile tests: **not run**.

The connected GitHub tool can read and write repository files but does not expose a workflow-dispatch action in this session. Local cloning/download was not established, so npm test/build and loader counts could not be freshly executed. The review-only package is not a test-passing gameplay change and does not alter any player loader.

## 6. Commit

Review-only package commit: `91ffda02f92e635cb711f1da807c468c85e3dc5d`.

No gameplay code, loader, publish manifest or existing panorama asset was changed. No new playable question or image was published.
