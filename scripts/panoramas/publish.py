#!/usr/bin/env python3
"""Publish ONLY explicitly reviewed 360° panoramas as Pannellum multires tiles in R2.

This script is designed to run in GitHub Actions with short-lived workspace
files and GitHub Secrets for R2 (never commit credentials). A batch may have
at most 10 photos. It updates server/street/approved.mjs only after successful
uploads. An R2 bucket + public custom domain are prerequisites.
"""
import argparse
import html
import json
import os
import re
import subprocess
import tempfile
import urllib.parse
import urllib.request
from pathlib import Path

import boto3
from PIL import Image

Image.MAX_IMAGE_PIXELS = 150_000_000
ROOT = Path(__file__).resolve().parents[2]
APPROVED = ROOT / "server/street/approved.mjs"
REVIEWED = ROOT / "panoramas/reviewed.json"
AGENT = "AtlasArenaPanoramaPublisher/0.1 (reviewed-license media importer)"
def fail(message):
    raise RuntimeError(message)
def get_json(url):
    with urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": AGENT}), timeout=40) as response:
        return json.load(response)
def check_commons_license(row):
    title = row["sourceTitle"]
    params = urllib.parse.urlencode({
        "action":"query", "format":"json", "prop":"imageinfo", "titles":title,
        "iiprop":"url|size|extmetadata",
    })
    pages = get_json("https://commons.wikimedia.org/w/api.php?" + params)["query"]["pages"]
    pic = next(iter(pages.values())).get("imageinfo",[{}])[0]
    info = pic.get("extmetadata",{})
    licence = html.unescape(re.sub("<[^>]*>", "", info.get("LicenseShortName",{}).get("value",""))).strip()
    normalized = licence.lower().replace(" ", "-")
    if not any(t in normalized for t in ("cc-by-4.0","cc-by-sa-4.0","cc-by-3.0","cc-by-sa-3.0","cc0","public-domain")):
        fail(f"Unsupported or missing license for {title}: {licence}")
    if "-nc" in normalized or "-nd" in normalized:
        fail(f"Noncommercial / no-derivatives asset forbidden: {title}")
    if row["license"].lower().replace(" ", "-") != normalized:
        fail(f"License changed since review for {title}. Re-review required.")
    url=pic.get("url","")
    target=urllib.parse.urlparse(url)
    if target.scheme!="https" or target.hostname not in ("upload.wikimedia.org","commons.wikimedia.org"):
        fail("Image source URL is not an official Wikimedia host.")
    return url
def download(url, output):
    req = urllib.request.Request(url, headers={"User-Agent":AGENT})
    max_bytes = 90*1024*1024
    with urllib.request.urlopen(req, timeout=120) as src, open(output, "wb") as dst:
        total=0
        while True:
            chunk=src.read(1024*1024)
            if not chunk: break
            total+=len(chunk)
            if total>max_bytes: fail("File too large. Inspect panorama manually.")
            dst.write(chunk)
    with Image.open(output) as img:
        width,height=img.size
        if width<5000 or height<2500 or abs(width/height-2)>.04:
            fail(f"Image is not a full high-res 2:1 spherical equirectangular panorama: {width}x{height}")
        img.verify()
    return width,height,total
def read_approved():
    data=APPROVED.read_text(encoding="utf8")
    match=re.search(r"export const approvedPanoramas\s*=\s*(\[[\s\S]*\]);",data)
    if not match: fail("Cannot parse private approved.mjs catalog.")
    return json.loads(match.group(1))
def write_approved(records):
    sorted_rows=sorted(records,key=lambda row:row["id"])
    APPROVED.write_text("// Verified, editor-approved panoramas. Coordinates stay SERVER SIDE.\n"
                        "export const approvedPanoramas = "
                        + json.dumps(sorted_rows,ensure_ascii=False,indent=2)+";\n",encoding="utf8")
def publish(row, client, bucket, generator):
    ID=row["id"]
    if not re.fullmatch(r"[a-z0-9][a-z0-9-]{3,60}",ID): fail("Invalid panorama ID")
    required=("sourceTitle","country","city","title","fact","lat","lng",
              "artist","license","source","reviewedProjection",
              "reviewedCoordinates","reviewedLicense","reviewedQuality")
    for field in required:
        if field not in row or row[field] in ("",None,False):fail(f"{ID}: missing human-reviewed {field}")
    if not (-90<=row["lat"]<=90 and -180<=row["lng"]<=180): fail("Invalid latitude/longitude.")
    if not row["source"].startswith("https://commons.wikimedia.org/wiki/File:"):
        fail("Attribution source must link to the specific Commons file page.")
    remote=check_commons_license(row)
    with tempfile.TemporaryDirectory(prefix="atlas-pano-") as temp:
        root=Path(temp)
        image=root/"source.jpg"
        w,h,n=download(remote,image)
        tiles=root/"tiles"
        subprocess.run(["python3",str(generator),str(image),"-o",str(tiles),
                        "-s","512","-q","72","-f","768"],check=True)
        conf=json.loads((tiles/"config.json").read_text())
        multires=conf["multiRes"]
        expected=("path","extension","tileResolution","maxLevel","cubeResolution")
        if any(k not in multires for k in expected):fail("Invalid Pannellum generator config.")
        bytes_out=0;files=0
        for filepath in tiles.rglob("*"):
            if not filepath.is_file() or filepath.suffix.lower() not in (".jpg",".jpeg",".json"): continue
            relative=filepath.relative_to(tiles).as_posix()
            key=f"panoramas/{ID}/{relative}"
            props={"ContentType":"application/json" if filepath.suffix==".json" else "image/jpeg",
                   "CacheControl":"public, max-age=31536000, immutable"}
            client.upload_file(str(filepath),bucket,key,ExtraArgs=props)
            bytes_out+=filepath.stat().st_size;files+=1
        if files<12: fail("Suspiciously few panorama tiles were generated.")
        print(f"Published {ID}: original {w}x{h}, downloaded {n/1024**2:.1f} MiB, "
              f"R2 tiles {bytes_out/1024**2:.1f} MiB in {files} objects")
        return {
            "id":ID,"approved":True,"mode":"multires",
            "path":f"panoramas/{ID}","multires":multires,
            "country":row["country"],"city":row["city"],
            "title":row["title"],"fact":row["fact"],
            "lat":row["lat"],"lng":row["lng"],
            "artist":row["artist"],"license":row["license"],"source":row["source"],
        }
def main():
    parser=argparse.ArgumentParser()
    parser.add_argument("--ids",required=True,help="Comma-separated approved panorama IDs (max 10)")
    parser.add_argument("--generator",default="/tmp/pannellum/utils/multires/generate.py")
    args=parser.parse_args()
    ids=[x.strip() for x in args.ids.split(",") if x.strip()]
    if len(ids)<1 or len(ids)>10 or len(ids)!=len(set(ids)):
        fail("Specify 1–10 distinct approved IDs.")
    reviewed=json.loads(REVIEWED.read_text(encoding="utf8"))["panoramas"]
    by_id={row["id"]:row for row in reviewed}
    current=read_approved()
    existing={x["id"] for x in current}
    needed=[i for i in ids if i not in existing]
    if not needed:
        print("All requested IDs are already published; nothing to do.")
        return
    for i in needed:
        if i not in by_id:fail(f"Not approved for publication: {i}")
    account=os.environ["R2_ACCOUNT_ID"]
    client=boto3.client("s3",
        endpoint_url=f"https://{account}.r2.cloudflarestorage.com",
        aws_access_key_id=os.environ["R2_ACCESS_KEY_ID"],
        aws_secret_access_key=os.environ["R2_SECRET_ACCESS_KEY"],
        region_name="auto")
    bucket=os.environ.get("R2_BUCKET","atlas-arena")
    generator=Path(args.generator)
    if not generator.is_file():fail("Pannellum generator not found.")
    # Publish and record one by one. If a later upload fails, earlier successful
    # records remain written locally and can be committed on a rerun.
    for i in needed:
        current.append(publish(by_id[i],client,bucket,generator))
        write_approved(current)
    print(f"Private server catalog now contains {len(current)} approved panoramas.")
if __name__=="__main__":main()
