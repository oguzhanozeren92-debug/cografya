#!/usr/bin/env python3
"""Import Globriva photo bytes from the *existing public* R2 bucket into GitHub.

No Cloudflare or GitHub personal tokens are used. A GitHub Actions runner can
reach the public R2 URLs, while this workspace cannot. Media is staged only:
the game's approval flags remain false until editorial visual review.
"""
from __future__ import annotations

import hashlib
import json
import os
import pathlib
import sys
import urllib.error
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parents[2]
CANDIDATES = ROOT / "panoramas/drone-gallery-candidates.json"
TARGET = ROOT / "public/drone-gallery/photos"
R2_BASE = "https://pub-b3a9d7c95b2449c1a1532fb5b389ef88.r2.dev"
MAX_BYTES = 8 * 1024 * 1024
MIN_BYTES = 2 * 1024


def is_webp(payload: bytes) -> bool:
    return len(payload) >= 12 and payload[:4] == b"RIFF" and payload[8:12] == b"WEBP"


def load_bytes(url: str) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": "GlobrivaGalleryImport/1.0 (personal media archive)"})
    with urllib.request.urlopen(req, timeout=12) as response:
        if response.status != 200:
            raise ValueError(f"HTTP {response.status}")
        size = response.headers.get("Content-Length")
        if size and int(size) > MAX_BYTES:
            raise ValueError("File exceeds size limit")
        raw = response.read(MAX_BYTES + 1)
    if not (MIN_BYTES <= len(raw) <= MAX_BYTES):
        raise ValueError("Image size outside expected range")
    if not is_webp(raw):
        raise ValueError("Not WebP or invalid WebP header")
    return raw


def main() -> int:
    data = json.loads(CANDIDATES.read_text(encoding="utf-8"))
    imported, already, unavailable = [], [], []
    for album in data["collections"]:
        album_id = album["id"]
        if not (len(album_id) == 9 and album_id.startswith("album-") and album_id[-3:].isdigit()):
            raise ValueError(f"Unexpected album ID: {album_id}")
        for index, _photo in enumerate(album["images"], start=1):
            relative = f"{album_id}/{index}.webp"
            dest = TARGET / relative
            if dest.is_file():
                payload = dest.read_bytes()
                if not is_webp(payload):
                    raise ValueError(f"Existing file does not have a WebP header: {relative}")
                already.append(relative)
                continue
            url = f"{R2_BASE}/drone-gallery/photos/{relative}"
            try:
                raw = load_bytes(url)
            except (urllib.error.HTTPError, urllib.error.URLError, TimeoutError, ValueError, OSError) as exc:
                unavailable.append({"key": relative, "reason": str(exc)[:125]})
                print(f"Missing {relative}: {exc}", flush=True)
                continue
            dest.parent.mkdir(parents=True, exist_ok=True)
            dest.write_bytes(raw)
            sha = hashlib.sha256(raw).hexdigest()[:16]
            imported.append({"key": relative, "bytes": len(raw), "sha256_prefix": sha})
            print(f"Imported {relative}: {len(raw)} bytes / SHA256 {sha}", flush=True)
    summary = {
        "status": "media-import-only",
        "imported": imported,
        "already_present": len(already),
        "missing": unavailable,
        "total_candidates": len(imported) + len(already) + len(unavailable),
        "approval_changed": False,
    }
    print("RESULT: " + json.dumps(summary, ensure_ascii=False), flush=True)
    if not imported:
        print("No new WebP images fetched; nothing to commit.", flush=True)
    # No visual/place/license approval is inferred from file presence.
    return 0


if __name__ == "__main__":
    sys.exit(main())
