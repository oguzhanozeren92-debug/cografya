#!/usr/bin/env python3
"""Publish editor-approved aerial 360 JPG galleries directly to the R2 live catalog.

No Vercel rebuild, Git commit, Codemagic build or app-store review is required
when new *content* is added after a compatible app version ships.
Only publicly licensed, previously reviewed, geolocated panoramas are eligible.
"""
import argparse
import io
import json
import os
import re
import sys
import tempfile
import subprocess
from pathlib import Path

import boto3
from botocore.exceptions import ClientError
from PIL import Image, ImageOps
from boto3.s3.transfer import TransferConfig

sys.path.insert(0, str(Path(__file__).resolve().parent))
from publish import check_commons_license, download, fail

ROOT = Path(__file__).resolve().parents[2]
CATALOG = ROOT / 'panoramas/drone-live-candidates.json'
GENERATOR = Path('/tmp/pannellum/utils/multires/generate.py')
KEY = 'drone-live/catalog-v1.json'
FACES = 'frbl'
MIN_WIDTH = 5000
Image.MAX_IMAGE_PIXELS = 150_000_000

def validate(row):
    required = ('id', 'sourceTitle', 'source', 'country', 'city', 'fact',
                'lat', 'lng', 'artist', 'license', 'licenseUrl', 'difficulty',
                'regionCode', 'hint', 'photoFocus', 'choices',
                'reviewedProjection', 'reviewedCoordinates',
                'reviewedLicense', 'reviewedQuality')
    if any(key not in row for key in required):
        fail('Missing candidate metadata: ' + str(row.get('id', '<no id>')))
    id = row['id']
    if not isinstance(id, str) or not re.fullmatch(r'[a-z0-9][a-z0-9-]{3,60}', id):
        fail('Unsafe candidate ID')
    if not all(row.get(key) is True for key in required if key.startswith('reviewed')):
        fail(id + ': four human-review approvals are mandatory')
    for key in ('sourceTitle','source','country','city','fact','artist','license','licenseUrl'):
        if not isinstance(row[key], str) or not row[key].strip() or len(row[key]) > 700:
            fail(id + ': invalid ' + key)
    if row['difficulty'] not in ('easy','medium','hard'):
        fail(id + ': difficulty must be easy, medium or hard')
    if not re.fullmatch(r'\d{3}', str(row['regionCode'])):
        fail(id + ': invalid UN M49 region code')
    if not row['source'].startswith('https://commons.wikimedia.org/wiki/File:'):
        fail(id + ': Commons credit URL required')
    if not row['licenseUrl'].startswith('https://creativecommons.org/'):
        fail(id + ': valid Commons license URL required')
    if not isinstance(row['lat'], (float,int)) or not -90 <= row['lat'] <= 90:
        fail(id + ': bad latitude')
    if not isinstance(row['lng'], (float,int)) or not -180 <= row['lng'] <= 180:
        fail(id + ': bad longitude')
    for key in ('hint','photoFocus'):
        value = row[key]
        if not isinstance(value,dict) or not all(isinstance(value.get(lang),str)
            and 4 <= len(value[lang]) <= 220 for lang in ('tr','en')):
            fail(id + ': Turkish and English ' + key + ' required')
    choices = row['choices']
    if not isinstance(choices,list) or len(choices)!=4 or len(set(choices))!=4 or row['country'] not in choices:
        fail(id + ': four distinct plausible countries, including target, required')
    if any(not isinstance(c,str) or len(c)>100 for c in choices):
        fail(id + ': invalid choice')
    return id

def client():
    for name in ('R2_ACCOUNT_ID','R2_ACCESS_KEY_ID','R2_SECRET_ACCESS_KEY'):
        if not os.environ.get(name):fail('Missing GitHub Actions secret ' + name)
    return boto3.client('s3',
        endpoint_url='https://' + os.environ['R2_ACCOUNT_ID'] + '.r2.cloudflarestorage.com',
        aws_access_key_id=os.environ['R2_ACCESS_KEY_ID'],
        aws_secret_access_key=os.environ['R2_SECRET_ACCESS_KEY'],
        region_name='auto',
        config=boto3.session.Config(signature_version='s3v4',
             retries={'max_attempts':4,'mode':'standard'}))

def current_manifest(s3, bucket):
    try:
        response = s3.get_object(Bucket=bucket, Key=KEY)
        manifest = json.loads(response['Body'].read())
    except ClientError as exc:
        if exc.response.get('Error',{}).get('Code') not in ('NoSuchKey','404','NotFound'):
            raise
        manifest = {'version':1,'photos':[]}
    if manifest.get('version') != 1 or not isinstance(manifest.get('photos'),list):
        fail('Unexpected existing live manifest: refusing to overwrite')
    if len(manifest['photos']) != len({x['id'] for x in manifest['photos']}):
        fail('Duplicate ID in existing live manifest')
    return manifest

def publish(row, s3, bucket):
    photo_id = validate(row)
    remote = check_commons_license(row)
    with tempfile.TemporaryDirectory(prefix='globriva-live-') as temp:
        root=Path(temp)
        source=root/'source.jpg'
        width,height,size=download(remote,source)
        with Image.open(source) as image:
            if width < MIN_WIDTH or height < 2500 or width != 2*height:
                fail(photo_id + ': source must be a 5000x2500+ real 2:1 panorama')
            optimized=root/'optimized.jpg'
            if width > 8192:
                scaled=image.resize((8192,4096),Image.Resampling.LANCZOS)
                scaled.convert('RGB').save(optimized,format='JPEG',quality=83,optimize=True)
                scaled.close()
            else:
                image.convert('RGB').save(optimized,format='JPEG',quality=83,optimize=True)
        directory=root/'tiles'
        subprocess.run(['python3',str(GENERATOR),str(optimized),'-o',str(directory),
              '-s','512','-q','75','-f','900'],timeout=750,check=True)
        faces={}
        for face in FACES:
            path=directory/'fallback'/(face+'.jpg')
            if not path.exists():fail(photo_id + ': missing generated face '+face)
            with Image.open(path) as original:
                frame=ImageOps.exif_transpose(original).convert('RGB')
                if min(frame.size) < 500:fail(photo_id + ': undersized cube face')
                buf=io.BytesIO()
                frame.save(buf,format='JPEG',quality=80,optimize=True,progressive=True)
                faces[face]=buf.getvalue()
                if len(faces[face]) < 4000:fail(photo_id + ': empty cube face '+face)
        for face,data in faces.items():
            key='drone-live/photos/'+photo_id+'/'+face+'.jpg'
            s3.upload_fileobj(io.BytesIO(data),bucket,key,
                ExtraArgs={'ContentType':'image/jpeg',
                    'CacheControl':'public,max-age=31536000,immutable'},
                Config=TransferConfig(use_threads=False))
            head=s3.head_object(Bucket=bucket,Key=key)
            if head['ContentLength'] != len(data):
                fail(photo_id + ': upload could not be verified for '+face)
        # Only after four successful HEAD checks is a photo eligible for the manifest.
        entry={field:row[field] for field in (
             'id','country','city','fact','lat','lng','artist','license',
             'licenseUrl','source','difficulty','regionCode','hint','photoFocus','choices')}
        entry['approved']=True
        print('VERIFIED',photo_id, width,'x',height,
              'source-bytes',size,'preview-bytes',sum(map(len,faces.values())),flush=True)
        return entry

def write_manifest(s3,bucket,manifest):
    blob=json.dumps(manifest,ensure_ascii=False,separators=(',',':')).encode('utf-8')
    s3.put_object(Bucket=bucket,Key=KEY,Body=blob,
                  ContentType='application/json; charset=utf-8',
                  CacheControl='no-store,no-cache,must-revalidate')
    verify=json.loads(s3.get_object(Bucket=bucket,Key=KEY)['Body'].read())
    if len(verify['photos']) != len(manifest['photos']):fail('R2 manifest verification failed')

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--ids',required=True,
         help='Comma-separated editorially approved photo IDs, up to ten per run')
    args=parser.parse_args()
    ids=[x.strip() for x in args.ids.split(',') if x.strip()]
    if not 1 <= len(ids) <= 10 or len(set(ids))!=len(ids):
        fail('Specify 1-10 unique approved photo IDs per run')
    rows=json.loads(CATALOG.read_text(encoding='utf-8'))['panoramas']
    by_id={x['id']:x for x in rows}
    if len(by_id)!=len(rows):fail('Duplicate candidate ID')
    for id in ids:
        if id not in by_id:fail('Unknown candidate ID: '+id)
        validate(by_id[id])
    if not GENERATOR.exists():fail('Pannellum generator not installed')
    s3=client()
    bucket=os.environ.get('R2_BUCKET','atlas-arena')
    manifest=current_manifest(s3,bucket)
    already={x['id'] for x in manifest['photos']}
    failures=[]
    for id in ids:
        if id in already:
            print('Already published (immutable ID):',id,flush=True)
            continue
        try:
            entry=publish(by_id[id],s3,bucket)
            manifest['photos'].append(entry)
            # Checkpoint after each fully validated upload; interrupted batches are resumable.
            write_manifest(s3,bucket,manifest)
            already.add(id)
            print('LIVE CATALOG',len(manifest['photos']),
                  'approved photographs; activation at 50',flush=True)
        except Exception as exc:
            failures.append(id+': '+repr(exc))
            print('FAILED:',failures[-1],flush=True)
    print('TOTAL READY:',len(manifest['photos']),'/ 50 required for mobile activation',flush=True)
    if failures:fail('Some uploads need review: '+'; '.join(failures))

if __name__=='__main__':
    main()
