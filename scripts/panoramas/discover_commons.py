#!/usr/bin/env python3
"""Discover Wikimedia Commons 360° candidates. Never auto-publish discovered media.

Requires only Python stdlib. Every candidate must still be manually checked for:
full equirectangular projection, accurate EXIF/photographer GPS, usable license,
street/landscape quality and attribution. Candidate count != approved count.
"""
import argparse
import html
import json
import re
import time
import urllib.parse
import urllib.request
import urllib.error
from pathlib import Path

CATEGORIES = [
    "Category:360° panoramas with equirectangular projection",
    "Category:360° panoramic photographs",
    "Category:360° panoramas of Argentina",
    "Category:360° panoramas of Austria",
    "Category:360° panoramas of Bangladesh",
    "Category:360° panoramas of Belgium",
    "Category:360° panoramas of Georgia (country)",
    "Category:360° panoramas of India",
    "Category:360° panoramas of Mexico",
    "Category:360° panoramas of Romania",
    "Category:360° panoramics in Armenia",
    "Category:360° panoramics in Brazil",
    "Category:360° panoramics in Bulgaria",
    "Category:360° panoramics in Cambodia",
    "Category:360° panoramics in Canada",
    "Category:360° panoramics in China",
    "Category:360° panoramics in the Czech Republic",
    "Category:360° panoramics in Denmark",
    "Category:360° panoramics in Estonia",
    "Category:360° panoramics in Finland",
    "Category:360° panoramics in France",
    "Category:360° panoramics in Germany",
    "Category:360° panoramics in Greece",
    "Category:360° panoramics in Hong Kong",
    "Category:360° panoramics in Iceland",
    "Category:360° panoramics in Israel",
    "Category:360° panoramics in Italy",
    "Category:360° panoramics in Japan",
    "Category:360° panoramics in Latvia",
    "Category:360° panoramics in the Netherlands",
    "Category:360° panoramics in New Zealand",
    "Category:360° panoramics in the Philippines",
    "Category:360° panoramics in Poland",
    "Category:360° panoramics in Portugal",
    "Category:360° panoramics in Russia",
    "Category:360° panoramics in Serbia",
    "Category:360° panoramics in Slovakia",
    "Category:360° panoramics in Slovenia",
    "Category:360° panoramics in South Korea",
    "Category:360° panoramics in Spain",
    "Category:360° panoramics in Sweden",
    "Category:360° panoramics in Switzerland",
    "Category:360° panoramics in Taiwan",
    "Category:360° panoramics in Ukraine",
    "Category:360° panoramics in the United Kingdom",
    "Category:360° panoramics in the United States",
    "Category:360° panoramics in Uzbekistan",
    "Category:Spherical panoramics in South Africa",
    "Category:Spherical panoramas",
    "Category:360° panoramics in Kazakhstan",
    "Category:360° panoramics in Kyrgyzstan",
    "Category:360° panoramics in Norway",
]
API = "https://commons.wikimedia.org/w/api.php"
USER_AGENT = "AtlasArenaPanoramaResearch/0.2 (https://github.com/oguzhanozeren92-debug/cografya; noncommercial metadata research)"
ALLOWED = {"cc-by-4.0", "cc-by-sa-4.0", "cc-by-3.0", "cc-by-sa-3.0", "cc0", "public domain"}
last_request = 0.0
def query(params):
    global last_request
    qs = urllib.parse.urlencode({"action": "query", "format": "json", "maxlag": "5", **params})
    req = urllib.request.Request(API + "?" + qs, headers={"User-Agent": USER_AGENT})
    for attempt in range(5):
        # Be courteous to Wikimedia: pace requests, especially on shared CI runners.
        time.sleep(max(0, 1.6 - (time.monotonic() - last_request)))
        last_request = time.monotonic()
        try:
            with urllib.request.urlopen(req, timeout=45) as resp:
                return json.load(resp)
        except urllib.error.HTTPError as error:
            if error.code not in (429, 503) or attempt == 4:
                raise
            retry = error.headers.get("Retry-After", "")
            delay = max(int(retry) if retry.isdecimal() else 0, min(45, 5 * 2 ** attempt))
            print(f"API busy ({error.code}); retrying after {delay}s", flush=True)
            time.sleep(delay)
    raise RuntimeError("Wikimedia request retry exhausted")
def clean(markup):
    return html.unescape(re.sub(r"<[^>]+>", "", markup or "")).strip()[:350]
def meta(ext, key):
    value = ext.get(key, {})
    return str(value.get("value", "")) if isinstance(value, dict) else ""
def collect(category, seen, max_pages=2):
    cursor = {}
    for page in range(max_pages):
        response = query({
            "generator": "categorymembers",
            "gcmtitle": category,
            "gcmnamespace": 6,
            "gcmlimit": 50,
            "prop": "imageinfo|coordinates",
            "iiprop": "url|size|extmetadata",
            **cursor,
        })
        for item in response.get("query", {}).get("pages", {}).values():
            pic = (item.get("imageinfo") or [{}])[0]
            width, height = pic.get("width", 0), pic.get("height", 0)
            if width < 5000 or height < 2500 or abs(width / height - 2) > .08:
                continue
            ext = pic.get("extmetadata") or {}
            licence = clean(meta(ext, "LicenseShortName"))
            normal = licence.lower().replace(" ", "-").replace("creative-commons-", "")
            if not any(k in normal for k in ALLOWED):
                continue
            if "-nc" in normal or "-nd" in normal:
                continue
            title = item.get("title", "")
            coords = item.get("coordinates") or []
            coord = coords[0] if coords else {}
            source = "https://commons.wikimedia.org/wiki/" + title.replace(" ", "_")
            if title in seen:
                continue
            seen[title] = {
                "title": title, "source": source, "originalUrl": pic.get("url", ""),
                "width": width, "height": height,
                "bytes": pic.get("size", 0),
                "license": licence, "licenseUrl": clean(meta(ext, "LicenseUrl")),
                "author": clean(meta(ext, "Artist")),
                "gps": {"lat": coord.get("lat"), "lng": coord.get("lon")},
                "category": category,
                "status": "candidate-needs-human-review",
                "editorial": {"country": None, "city": None, "landmark": None,
                              "representative": False, "gpsVerified": False,
                              "projectionVerified": False, "licenseReviewed": False},
            }
        cursor = {k:v for k,v in response.get("continue", {}).items() if k in ("gcmcontinue", "continue")}
        if not cursor: break


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--limit", type=int, default=300)
    parser.add_argument("--output", default="panoramas/candidates.json")
    args = parser.parse_args()
    candidates = {}
    for category in CATEGORIES:
        try:
            collect(category, candidates, max_pages=4)
        except Exception as error:
            print(f"WARNING {category}: {error}")
        print(f"{category}: {len(candidates)} unique matching files")
        # Scan all countries before choosing the final list so Europe does not crowd out other regions.
    rows = list(candidates.values())
    # GPS present first. Candidates still require every human quality/legal check.
    rows.sort(key=lambda row: (row["gps"]["lat"] is None, -(row["width"]*row["height"])))
    path = Path(args.output)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps({"target":args.limit, "approved":0,
                                "candidates":rows[:args.limit]},
                               ensure_ascii=False, indent=2), encoding="utf8")
    geotagged = sum(row["gps"]["lat"] is not None for row in rows)
    unique_places = len({(round(row["gps"]["lat"],2),round(row["gps"]["lng"],2))
                         for row in rows if row["gps"]["lat"] is not None and row["gps"]["lng"] is not None})
    print(f"Found {len(rows)} technically plausible assets, {geotagged} geotagged, "
          f"~{unique_places} distinct ~1km locations.", flush=True)
    print("None approved. Review license, photography and precise location before R2 upload.")
if __name__ == "__main__":
    main()
