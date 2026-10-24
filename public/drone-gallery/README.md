# Globriva — GitHub-based photo gallery

The gallery is stored in `public/drone-gallery/` and delivered by Vercel; no Cloudflare R2 keys are needed.

## Photo file formats

An album has 3 or 4 numbered photographs: `1.jpg`, `2.jpg`, `3.jpg` (or `.webp`). The **file extension is set independently for each photograph** in `catalog-v2.json` under `images[].format`; never assume all files are WebP. A round can be played only after its entire album is verified and `approved:true`.

The gallery service exposes `/api/drone/session?v=2`. It requires at least 50 approved, unique image sources from at least 10 countries. Older clients keep the 5-panorama pilot fallback by calling the endpoint without `v=2`.

## Importing the four missing albums

The workflow `../../.github/workflows/import-missing-gallery.yml` uses `scripts/panoramas/import-missing-commons-gallery.py` and covers:
- `album-017`: Prague
- `album-018`: Venice
- `album-019`: Vienna
- `album-020`: Lisbon

It checks the original Wikimedia Commons file URL, author credit, exact Creative Commons license, resolution, image download and WebP signature, **before** marking an entire album approved. If any image fails validation, that album stays unapproved. On execution, it writes `reports/globriva-gallery-import.json` with actual successes and blockers and commits the verified files to GitHub.

No use of Photoshop, stock images, or AI-generated stand-ins. Image credit/Commons links remain attached to every question.

## Release check

Run `npm run gallery:audit` for a structural integrity report and `npm run gallery:release-check` before considering a new build. Editor-review the images, photographer attribution and any share-alike obligations. Confirm all live HTTP image URLs through `/gallery-review.html`. GitHub commit does not by itself guarantee the latest image assets have been deployed to the production domain.

A native app update is only necessary when the already installed binary does not support the versioned gallery API or its `gallery` media mode.
