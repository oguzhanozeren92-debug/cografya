# Open Content: Globriva + EraAtlas

This repository contains a new **candidate-only** open-media collector. It does not
modify the playable bank, change navigation, or automatically release any question.

## How it works

1. GitHub Actions `.github/workflows/open-content.yml` invokes
   `scripts/open-content.mjs` daily or on manual workflow dispatch.
2. Images and original provider fields are requested from official APIs.
3. License flags, provenance URLs, explicit rights status, image host,
   JPEG decoding/dimensions, file size and SHA-256 duplication are checked.
4. Candidate media are cached in the repository and question **drafts** are
   written with a factual source link and four options when appropriate.
5. No draft is part of the live game until human checks the image content,
   correct depicted location/culture, attribution, question answer, distractors,
   and potential clues visible in the image.

## Local execution

```bash
# In cografya use: CONTENT_APP=globriva
# In eraatlas use: CONTENT_APP=eraatlas
CONTENT_APP=globriva node scripts/open-content.mjs --self-test
CONTENT_APP=globriva node scripts/open-content.mjs
```

Requires Node.js 22+ and outbound HTTPS. No API keys are needed for the
current providers. API errors are reported; they do not create fake data.

## Files

- `data/open-content/question-drafts.json` — initial editorial drafts +
  new source-derived candidate quizzes.
- `data/open-content/candidates.json` — licensed image candidates and
  factual provenance; file bytes are archived when successfully fetched.
- `data/open-content/state.json` — persistent de-duplication keys.
- `data/open-content/latest.json` — most recent totals and errors.
- public/open-content/photos/ — original resized/cached JPEG files, **not live game assets**.

## Providers and controls

Sources: Wikimedia Commons geosearch with a precise camera geotag. City and country are only preliminary until the photographed subject is independently validated.

Wikimedia photos can require CC BY or CC BY-SA attribution and link to the
license; redistribution conditions must be honored. The Met public-domain
flag and AIC public-domain field are checked per object. Museum metadata is
not a substitute for actual image review or reliable question editing.

A failed GitHub Actions job means **nothing was fetched or published**.
Check the Actions job status and `latest.json` for the last successful run
before reporting new photos as available.
