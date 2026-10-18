#!/usr/bin/env python3
"""Stage five editor-selected 360° drone panoramas in Cloudflare R2.

A manifest entry is added only after the Commons licence, 2:1 projection,
tile generation, uploads and representative R2 HEAD requests succeed.
Wikimedia URLs are used only once, during publisher ingestion, never in-game.
"""
import json
import os
import sys
import tempfile
import subprocess
import time
import urllib.request
import urllib.error
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

from PIL import Image
import boto3
from boto3.s3.transfer import TransferConfig

sys.path.insert(0, str(Path(__file__).resolve().parent))
from publish import check_commons_license, download, fail

ROOT=Path(__file__).resolve().parents[2]
CATALOG=ROOT/'panoramas/drone-approved.json'
MANIFEST=ROOT/'server/drone/approved.mjs'
GENERATOR=Path('/tmp/pannellum/utils/multires/generate.py')
BUCKET=os.environ.get('R2_BUCKET','atlas-arena')
Image.MAX_IMAGE_PIXELS=150_000_000

def load_manifest():
    content=MANIFEST.read_text(encoding='utf-8')
    start=content.index('export const approvedDroneMedia = ')+len('export const approvedDroneMedia = ')
    return json.loads(content[start:].strip().removesuffix(';'))

def write_manifest(rows):
    MANIFEST.parent.mkdir(parents=True,exist_ok=True)
    MANIFEST.write_text(
      '// Verified drone panoramas: licence, 2:1 image and R2 tiles checked.\n'
      'export const approvedDroneMedia = '
      +json.dumps(sorted(rows,key=lambda x:x['id']),ensure_ascii=False,indent=2)+';\n',
      encoding='utf8'
    )

def main():
    if not GENERATOR.exists():fail('Pannellum multires generator missing')
    rows=json.loads(CATALOG.read_text(encoding='utf8'))['panoramas']
    if len(rows)!=5 or len(set(x['id'] for x in rows))!=5:fail('Expected five unique, approved drone panoramas')
    client=boto3.client('s3',region_name='auto',
      endpoint_url='https://'+os.environ['R2_ACCOUNT_ID']+'.r2.cloudflarestorage.com',
      aws_access_key_id=os.environ['R2_ACCESS_KEY_ID'],
      aws_secret_access_key=os.environ['R2_SECRET_ACCESS_KEY'],
      config=boto3.session.Config(signature_version='s3v4',retries={'max_attempts':4,'mode':'standard'}))
    existing=load_manifest()
    uploaded={x['id'] for x in existing}
    errors=[]
    for row in rows:
      id=row['id']
      if id in uploaded:
        print('Already verified and published:',id,flush=True)
        continue
      started=time.monotonic()
      print('VERIFYING '+id+' / '+row['sourceTitle'],flush=True)
      try:
        image_url=check_commons_license(row)
        with tempfile.TemporaryDirectory(prefix='atlas-drone-') as temp:
          folder=Path(temp)
          original=folder/'source.jpg'
          width,height,bytes_in=download(image_url,original)
          with Image.open(original) as im:
            if im.width!=im.height*2 or im.width<5000 or im.height<2500:
              fail(f'Not a genuine 2:1 spherical panorama {id}: {im.size}')
            # For mobile, keep sufficient detail with a bounded texture budget.
            reduced=folder/'optimized.jpg'
            if im.width>8192:
              scaled=im.resize((8192,4096),Image.Resampling.LANCZOS)
              scaled.convert('RGB').save(reduced,format='JPEG',quality=82,optimize=True)
              scaled.close()
            else:
              im.convert('RGB').save(reduced,format='JPEG',quality=82,optimize=True)
          tiles=folder/'tiles'
          subprocess.run(['python3',str(GENERATOR),str(reduced),'-o',str(tiles),
            '-s','512','-q','72','-f','768'],check=True,timeout=700)
          data=json.loads((tiles/'config.json').read_text())
          config=data['multiRes']
          required=('path','extension','tileResolution','maxLevel','cubeResolution')
          if any(k not in config for k in required):fail('Incomplete multires metadata '+id)
          files=[p for p in tiles.rglob('*') if p.is_file() and p.suffix.lower() in ('.jpg','.jpeg','.json')]
          if len(files)<12:fail('Unexpectedly few R2 tiles for '+id)
          transfer=TransferConfig(use_threads=False)
          def send(path):
            key=f'drone/{id}/'+path.relative_to(tiles).as_posix()
            headers={'ContentType':'application/json' if path.suffix=='.json' else 'image/jpeg',
                     'CacheControl':'public,max-age=86400'}
            client.upload_file(str(path),BUCKET,key,ExtraArgs=headers,Config=transfer)
            return key
          print(f'UPLOAD {id}: {len(files)} tiles; source {width}x{height}; bytes {bytes_in}',flush=True)
          tile_names=[]
          with ThreadPoolExecutor(max_workers=12) as pool:
            futures=[pool.submit(send,p) for p in files]
            for i, f in enumerate(as_completed(futures),1):
              tile_names.append(f.result())
              if i%100==0 or i==len(files):
                print(f'UPLOAD {id}: {i}/{len(files)} ({time.monotonic()-started:.1f}s)',flush=True)
          # Check manifest and random actual face tile, not just upload calls.
          keys=['drone/'+id+'/config.json']+[n for n in tile_names if n.endswith('.jpg')][:2]
          for key in keys:
            response=client.head_object(Bucket=BUCKET,Key=key)
            if response.get('ContentLength',0)<100:fail('R2 incomplete object '+key)
          existing.append({'id':id,'multires':config,'tileCount':len(files)})
          uploaded.add(id)
          write_manifest(existing)
          print('VERIFIED '+id+' uploaded in %.1fs'%(time.monotonic()-started),flush=True)
      except Exception as exc:
        errors.append(id+': '+repr(exc))
        print('FAILED '+errors[-1],flush=True)
    if len(existing)<5 or errors:
      fail(f'Drone archive not fully ready. Uploaded {len(existing)}/5. Failures: {errors}')
    print('DRONE ARCHIVE READY: 5/5 verified R2 panoramas',flush=True)

if __name__=='__main__':
    main()
