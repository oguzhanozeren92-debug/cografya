# Globriva GitHub-based photo gallery

Media is stored in this repository and delivered through Vercel, not Cloudflare R2.

Each album folder uses `1.webp`, `2.webp`, `3.webp`, optionally `4.webp`.

The server loads `/drone-gallery/catalog-v2.json`. `approved` must remain false until photos really exist here AND visual/place/license checks pass. Game requires 50 different source photos and >= 10 countries, 3-4 photos per album. No store release is needed when new GitHub commits trigger Vercel deployments.

Do not include GitHub tokens or R2 credentials in this folder.
