#!/usr/bin/env python3
"""Publish five validated drone cube-face JPG previews to Atlas Arena's own domain."""
import io
import json
import os
import re
from pathlib import Path

import boto3
from botocore.config import Config
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[2]
APPROVED = ROOT / 'server/drone/approved.mjs'
READY = ROOT / 'server/drone/photo-ready.mjs'
DEST = ROOT / 'public/drone-photos'
FACES = 'frbl'

def approved():
    raw = APPROVED.read_text(encoding='utf-8')
    match = re.search(r'export const approvedDroneMedia\s*=\s*(\[[\s\S]*?\]);', raw)
    if match is None:
        raise RuntimeError('Cannot parse approved drone catalogue')
    return json.loads(match.group(1))

def main():
    client = boto3.client('s3',
        endpoint_url='https://' + os.environ['R2_ACCOUNT_ID'] + '.r2.cloudflarestorage.com',
        region_name='auto', aws_access_key_id=os.environ['R2_ACCESS_KEY_ID'],
        aws_secret_access_key=os.environ['R2_SECRET_ACCESS_KEY'],
        config=Config(signature_version='s3v4', retries={'max_attempts':4}))
    bucket=os.environ.get('R2_BUCKET','atlas-arena')
    successful=[]
    for item in approved():
        photo_id=item['id']
        frames={}
        try:
            for face in FACES:
                key='drone/' + photo_id + '/fallback/' + face + '.jpg'
                data=client.get_object(Bucket=bucket,Key=key)['Body'].read()
                with Image.open(io.BytesIO(data)) as raw:
                    raw.load()
                    if min(raw.size)<250:
                        raise ValueError('Preview too small')
                    img=ImageOps.exif_transpose(raw).convert('RGB')
                    img.thumbnail((900,900), Image.Resampling.LANCZOS)
                    buffer=io.BytesIO()
                    img.save(buffer,format='JPEG',quality=78,optimize=True,progressive=True)
                    frames[face]=buffer.getvalue()
            folder=DEST/photo_id
            folder.mkdir(parents=True,exist_ok=True)
            for face,data in frames.items():
                (folder/(face+'.jpg')).write_bytes(data)
            successful.append(photo_id)
            print('DRONE READY:',photo_id, 'KB:',sum(map(len,frames.values()))//1024,flush=True)
        except Exception as exc:
            print('DRONE MISSING:',photo_id,str(exc)[:220],flush=True)
    if len(successful)<5:
        raise RuntimeError('Need 5 verified drone image sets; got '+str(len(successful)))
    READY.write_text('// Verified same-origin drone preview galleries.\nexport const readyDronePhotoIds = '+json.dumps(sorted(successful),indent=2)+';\n',encoding='utf-8')
    print('DRONE PHOTO GALLERIES:',len(successful),flush=True)

if __name__=='__main__':
    main()
