#!/usr/bin/env python3
"""Import owner-approved albums from panoramas/drone-gallery-candidates.json into the
GitHub/Vercel gallery (public/drone-gallery).

For every photo: Commons API lookup, licence must be one we accept, credited artist must
match the Commons "Artist" field, image is downloaded, resized and stored as WebP.
An album is added to catalog-v2.json only when ALL of its photos pass. Existing files and
albums are never overwritten. Usage: import-commons-albums.py --ids album-023,album-024
"""
import argparse, html, io, json, re, sys, time, unicodedata, urllib.error, urllib.parse, urllib.request
from datetime import datetime, timezone
from html.parser import HTMLParser
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[2]
CANDIDATES = ROOT / 'panoramas/drone-gallery-candidates.json'
CATALOG = ROOT / 'public/drone-gallery/catalog-v2.json'
REPORT = ROOT / 'reports/globriva-gallery-import.json'
AGENT = 'GlobrivaGallery/1.1 (educational photo licensing audit; Wikimedia Commons)'
ALLOWED = {
    'CC BY 2.0': 'https://creativecommons.org/licenses/by/2.0/',
    'CC BY 3.0': 'https://creativecommons.org/licenses/by/3.0/',
    'CC BY 4.0': 'https://creativecommons.org/licenses/by/4.0/',
    'CC BY-SA 2.0': 'https://creativecommons.org/licenses/by-sa/2.0/',
    'CC BY-SA 2.5': 'https://creativecommons.org/licenses/by-sa/2.5/',
    'CC BY-SA 3.0': 'https://creativecommons.org/licenses/by-sa/3.0/',
    'CC BY-SA 4.0': 'https://creativecommons.org/licenses/by-sa/4.0/',
    'CC0': 'https://creativecommons.org/publicdomain/zero/1.0/',
    'Public domain': 'https://creativecommons.org/publicdomain/mark/1.0/',
}
CATALOG_KEYS = ('id', 'country', 'city', 'lat', 'lng', 'regionCode', 'difficulty', 'fact',
                'hint', 'photoFocus', 'choices')
Image.MAX_IMAGE_PIXELS = 120_000_000


class Plain(HTMLParser):
    def __init__(self):
        super().__init__(); self.parts = []

    def handle_data(self, v):
        self.parts.append(v)


def clean(v):
    p = Plain(); p.feed(str(v or '')); return ' '.join(html.unescape(' '.join(p.parts)).split())


def tokens(v):
    v = unicodedata.normalize('NFKD', clean(v)).encode('ascii', 'ignore').decode().casefold()
    return {t for t in re.split(r'[^a-z0-9]+', v) if len(t) >= 3}


def load(url, size=40_000_000):
    if not url.startswith(('https://commons.wikimedia.org/', 'https://upload.wikimedia.org/')):
        raise ValueError('Unexpected origin')
    last = None
    for trial in range(4):
        try:
            req = urllib.request.Request(url, headers={'User-Agent': AGENT})
            with urllib.request.urlopen(req, timeout=60) as res:
                if not res.url.startswith(('https://commons.wikimedia.org/', 'https://upload.wikimedia.org/')):
                    raise ValueError('Untrusted redirect')
                buf = res.read(size + 1)
                if len(buf) > size:
                    raise ValueError('Source too large')
                return buf
        except (urllib.error.HTTPError, urllib.error.URLError, TimeoutError) as e:
            last = e
            if isinstance(e, urllib.error.HTTPError) and e.code not in (429, 500, 502, 503, 504):
                break
            time.sleep(3 * (trial + 1))
    raise RuntimeError('Download failed: ' + str(last))


def verify(p):
    source = p['source']
    if not source.startswith('https://commons.wikimedia.org/wiki/File:'):
        raise ValueError('Invalid Commons page')
    title = urllib.parse.unquote(source.split('/wiki/', 1)[1]).replace('_', ' ')
    params = urllib.parse.urlencode({'action': 'query', 'format': 'json', 'prop': 'imageinfo',
                                     'iiprop': 'url|size|mime|extmetadata', 'iiurlwidth': 1600,
                                     'titles': title, 'redirects': '1'})
    obj = json.loads(load('https://commons.wikimedia.org/w/api.php?' + params, 3_000_000))
    pages = list(obj.get('query', {}).get('pages', {}).values())
    info = pages[0].get('imageinfo', [None])[0] if len(pages) == 1 else None
    if not info:
        raise ValueError('File not found on Commons: ' + title)
    if info.get('mime') not in ('image/jpeg', 'image/png'):
        raise ValueError('Unsupported type ' + str(info.get('mime')))
    if info.get('width', 0) < 1100 and info.get('height', 0) < 1100:
        raise ValueError(f"Too small {info.get('width')}x{info.get('height')}")
    meta = info.get('extmetadata', {})
    license = clean(meta.get('LicenseShortName', {}).get('value'))
    if license not in ALLOWED:
        raise ValueError('License not accepted: ' + license)
    author = clean(meta.get('Artist', {}).get('value'))
    if not (tokens(p['artist']) & tokens(author)):
        raise ValueError(f"Photographer mismatch: catalogue '{p['artist']}' vs Commons '{author}'")
    url = info.get('thumburl') or info.get('url')
    if not url or not url.startswith('https://upload.wikimedia.org/'):
        raise ValueError('Invalid media URL')
    return url, license, f"{info.get('width')}x{info.get('height')}"


def album_files(a):
    if not 3 <= len(a['images']) <= 4 or len({p['source'] for p in a['images']}) != len(a['images']):
        raise ValueError('Album needs 3-4 distinct photos')
    if not (a.get('reviewedLocation') and a.get('reviewedQuality') and all(
            p.get('reviewedVisual') and p.get('reviewedLicense') and p.get('reviewedPlace') for p in a['images'])):
        raise ValueError('Album or photo not owner-approved')
    out, checks, records = [], [], []
    for i, p in enumerate(a['images'], 1):
        url, license, size = verify(p)
        with Image.open(io.BytesIO(load(url))) as pic:
            im = ImageOps.exif_transpose(pic).convert('RGB')
            im.thumbnail((1600, 1200), Image.Resampling.LANCZOS)
            buf = io.BytesIO(); im.save(buf, format='WEBP', quality=86, method=5)
        data = buf.getvalue()
        if len(data) < 8000 or data[:4] != b'RIFF' or data[8:12] != b'WEBP':
            raise ValueError('WebP conversion failed')
        out.append(data)
        records.append({'format': 'webp', 'artist': p['artist'], 'license': license,
                        'licenseUrl': ALLOWED[license], 'source': p['source'],
                        'derivativeNote': 'Original Commons photo resized and converted to WebP for the game.',
                        'reviewedVisual': True, 'reviewedLicense': True, 'reviewedPlace': True})
        checks.append({'page': p['source'], 'license': license, 'original': size, 'bytes': len(data)})
        print(a['id'], i, 'ok', license, size, flush=True)
    return out, records, checks


def main():
    ap = argparse.ArgumentParser(); ap.add_argument('--ids', required=True); args = ap.parse_args()
    ids = [x.strip() for x in args.ids.split(',') if x.strip()]
    if not ids or len(ids) > 15 or not all(re.fullmatch(r'album-\d{3}', x) for x in ids):
        sys.exit('Give 1-15 ids like album-023')
    cands = {c['id']: c for c in json.loads(CANDIDATES.read_text())['collections']}
    catalog = json.loads(CATALOG.read_text())
    have = {c['id'] for c in catalog['collections']}
    used = {p['source'] for c in catalog['collections'] for p in c['images']}
    result = {'checkedAt': datetime.now(timezone.utc).isoformat(), 'ready': [], 'failed': []}
    for ident in ids:
        try:
            if ident in have:
                raise ValueError('Already in catalog')
            a = cands.get(ident)
            if not a:
                raise ValueError('Not in candidates file')
            if used & {p['source'] for p in a['images']}:
                raise ValueError('A photo is already used by another album')
            files, records, checks = album_files(a)
            folder = ROOT / 'public/drone-gallery/photos' / ident
            if folder.exists() and any(folder.iterdir()):
                raise ValueError('Photo folder already exists')
            folder.mkdir(parents=True, exist_ok=True)
            for i, data in enumerate(files, 1):
                (folder / f'{i}.webp').write_bytes(data)
            row = {k: a[k] for k in CATALOG_KEYS}
            row.update({'approved': True, 'reviewedLocation': True, 'reviewedQuality': True,
                        'images': records,
                        'approvalBasis': a.get('approvalBasis', 'owner_authorized') + '+commons_api_verified_import'})
            catalog['collections'].append(row)
            used |= {p['source'] for p in records}
            result['ready'].append({'album': ident, 'city': a['city'], 'photos': checks})
        except Exception as exc:
            result['failed'].append({'album': ident, 'error': str(exc)[:400]})
            print('BLOCKED', ident, exc, flush=True)
    if result['ready']:
        catalog['updated'] = datetime.now(timezone.utc).date().isoformat()
        CATALOG.write_text(json.dumps(catalog, ensure_ascii=False, indent=2) + '\n')
    REPORT.parent.mkdir(parents=True, exist_ok=True)
    REPORT.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
    print('Added', len(result['ready']), 'albums; blocked', len(result['failed']), flush=True)
    if not result['ready']:
        sys.exit(1)


if __name__ == '__main__':
    main()
