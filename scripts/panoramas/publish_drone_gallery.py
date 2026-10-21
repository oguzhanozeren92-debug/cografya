#!/usr/bin/env python3
"""Publish 3–4 distinct, individually credited location photos per playable round.

Source: editorially reviewed Wikimedia Commons files. Output: compressed JPG
assets and an atomic-ish R2 catalog checkpoint after ALL photos of a round
passed upload/HEAD checks. No Vercel or App Store build on content updates.
"""
import argparse
import io
import json
import os
import re
import sys
from pathlib import Path

import boto3
from botocore.exceptions import ClientError
from PIL import Image, ImageOps

sys.path.insert(0, str(Path(__file__).resolve().parent))
from publish import check_commons_license, fail

ROOT = Path(__file__).resolve().parents[2]
CANDIDATES = ROOT / 'panoramas/drone-gallery-candidates.json'
KEY = 'drone-gallery/catalog-v2.json'
Image.MAX_IMAGE_PIXELS = 100_000_000
ALLOWED = ('CC BY 2.0', 'CC BY 3.0', 'CC BY 4.0',
           'CC BY-SA 3.0', 'CC BY-SA 4.0', 'CC0', 'Public domain')

def verify(row):
    ident=row.get('id')
    if not isinstance(ident,str) or not re.fullmatch(r'[a-z][a-z0-9-]{4,60}',ident):
        fail('Unsafe gallery ID')
    if not all(row.get(k) is True for k in ('reviewedLocation','reviewedQuality')):
        fail(ident + ': location and gameplay composition require human approval')
    if not isinstance(row.get('images'),list) or len(row['images']) not in (3,4):
        fail(ident + ': supply 3–4 independent source photos')
    if row.get('difficulty') not in ('easy','medium','hard') or not re.fullmatch(r'\\d{3}',str(row.get('regionCode',''))):
        fail(ident + ': invalid difficulty/continent')
    if not isinstance(row.get('lat'),(int,float)) or not -90<=row['lat']<=90:
        fail(ident + ': invalid latitude')
    if not isinstance(row.get('lng'),(int,float)) or not -180<=row['lng']<=180:
        fail(ident + ': invalid longitude')
    for k in ('country','city','fact'):
        if not isinstance(row.get(k),str) or len(row[k])<3 or len(row[k])>700:
            fail(ident + ': incomplete ' + k)
    for k in ('hint','photoFocus'):
        if not isinstance(row.get(k),dict) or not all(isinstance(row[k].get(lang),str)
            and 5<=len(row[k][lang])<=220 for lang in ('tr','en')):
            fail(ident + ': bilingual hints and photo guidance required')
    cs=row.get('choices')
    if not isinstance(cs,list) or len(cs)!=4 or len(set(cs))!=4 or row['country'] not in cs:
        fail(ident + ': need 4 distinct country options including answer')
    sources=set()
    for p in row['images']:
        if not isinstance(p,dict):fail(ident + ': invalid photo record')
        if not all(p.get(k) is True for k in ('reviewedVisual','reviewedLicense','reviewedPlace')):
            fail(ident + ': each individual photo must be approved')
        for k in ('sourceTitle','source','artist','license','licenseUrl'):
            if not isinstance(p.get(k),str) or not p[k].strip() or len(p[k])>800:
                fail(ident + ': missing photo ' + k)
        if p['license'] not in ALLOWED:
            fail(ident + ': unsupported license ' + p['license'])
        if not p['source'].startswith('https://commons.wikimedia.org/wiki/File:'):
            fail(ident + ': must link to original Commons file')
        if not p['licenseUrl'].startswith('https://creativecommons.org/'):
            fail(ident + ': missing CC deed URL')
        if p['source'] in sources:fail(ident + ': duplicate photo')
        sources.add(p['source'])
    return ident

def r2():
    for key in ('R2_ACCOUNT_ID','R2_ACCESS_KEY_ID','R2_SECRET_ACCESS_KEY'):
        if not os.environ.get(key):fail('Missing R2 GitHub secret '+key)
    return boto3.client('s3',region_name='auto',
        endpoint_url='https://'+os.environ['R2_ACCOUNT_ID']+'.r2.cloudflarestorage.com',
        aws_access_key_id=os.environ['R2_ACCESS_KEY_ID'],
        aws_secret_access_key=os.environ['R2_SECRET_ACCESS_KEY'],
        config=boto3.session.Config(signature_version='s3v4',
            retries={'max_attempts':4,'mode':'standard'}))

def load_catalog(client,bucket):
    try:
        manifest=json.loads(client.get_object(Bucket=bucket,Key=KEY)['Body'].read())
    except ClientError as e:
        if e.response.get('Error',{}).get('Code') not in ('NoSuchKey','404','NotFound'):raise
        manifest={'version':2,'collections':[]}
    if manifest.get('version')!=2 or not isinstance(manifest.get('collections'),list):
        fail('Unexpected existing R2 gallery manifest: refusing overwrite')
    ids=[r['id'] for r in manifest['collections']]
    if len(ids)!=len(set(ids)):fail('Duplicate existing album IDs')
    return manifest

def compressed_jpeg(url):
    import urllib.request
    request=urllib.request.Request(url,headers={'User-Agent':'GlobrivaGalleryPublisher/1.0 (licensed editorial photo ingester)'})
    with urllib.request.urlopen(request,timeout=95) as remote:
        # Limit raw files, and prevent decompression bombs via Pillow limits.
        raw=remote.read(26*1024*1024+1)
        if len(raw)>26*1024*1024:fail('Original image too large for publisher')
    with Image.open(io.BytesIO(raw)) as original:
        original.verify()
    with Image.open(io.BytesIO(raw)) as original:
        frame=ImageOps.exif_transpose(original)
        if min(frame.size)<650 or max(frame.size)<1100:
            fail('Not enough image resolution for a quality game photo')
        frame.thumbnail((1800,1800),Image.Resampling.LANCZOS)
        out=io.BytesIO()
        frame.convert('RGB').save(out,'JPEG',quality=83,optimize=True,progressive=True)
    result=out.getvalue()
    if len(result)<8000:fail('Suspiciously empty JPEG output')
    return result

def publish_collection(row,client,bucket):
    ident=verify(row)
    # First license-check each source; no object writes until all licenses pass.
    sources=[check_commons_license(p) for p in row['images']]
    encoded=[compressed_jpeg(url) for url in sources]
    for i,raw in enumerate(encoded,1):
        key='drone-gallery/photos/'+ident+'/'+str(i)+'.jpg'
        client.put_object(Bucket=bucket,Key=key,Body=raw,
            ContentType='image/jpeg',
            CacheControl='public,max-age=31536000,immutable')
        head=client.head_object(Bucket=bucket,Key=key)
        if head.get('ContentLength')!=len(raw):
            fail(ident+': uploaded image HEAD size mismatch #'+str(i))
    record={key:row[key] for key in
        ('id','country','city','fact','lat','lng','difficulty','regionCode',
         'hint','photoFocus','choices')}
    record['images']=[{key:pic[key] for key in ('artist','license','licenseUrl','source')}
                      for pic in row['images']]
    record['approved']=True
    print('PHOTO ALBUM VERIFIED',ident,'PHOTOS',len(encoded),
          'TOTAL KB',sum(map(len,encoded))//1024,flush=True)
    return record

def save(client,bucket,manifest):
    body=json.dumps(manifest,ensure_ascii=False,separators=(',',':')).encode()
    if len(body)>1150000:fail('Gallery catalog exceeds server size limit')
    client.put_object(Bucket=bucket,Key=KEY,Body=body,
        ContentType='application/json; charset=utf-8',
        CacheControl='no-cache,no-store,must-revalidate')
    loaded=json.loads(client.get_object(Bucket=bucket,Key=KEY)['Body'].read())
    if loaded!=manifest:fail('R2 gallery manifest read-back mismatch')

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--ids',required=True,help='Up to 10 editorially approved collection IDs')
    args=parser.parse_args()
    ids=[x.strip() for x in args.ids.split(',') if x.strip()]
    if not 1<=len(ids)<=10 or len(ids)!=len(set(ids)):
        fail('Provide 1–10 distinct album IDs')
    rows=json.loads(CANDIDATES.read_text(encoding='utf-8'))['collections']
    lookup={r['id']:r for r in rows}
    if len(lookup)!=len(rows):fail('Duplicate gallery candidate ID')
    for ident in ids:
        if ident not in lookup:fail('Unknown photo collection '+ident)
        verify(lookup[ident])
    client=r2()
    bucket=os.environ.get('R2_BUCKET','atlas-arena')
    manifest=load_catalog(client,bucket)
    published={r['id'] for r in manifest['collections']}
    for ident in ids:
        if ident in published:
            print('Already published (immutable album ID):',ident,flush=True)
            continue
        record=publish_collection(lookup[ident],client,bucket)
        manifest['collections'].append(record)
        save(client,bucket,manifest)
        published.add(ident)
        print('VERIFIED INDIVIDUAL PHOTO COUNT:',
            sum(len(x['images']) for x in manifest['collections']),'/ 50',flush=True)
    total=sum(len(x['images']) for x in manifest['collections'])
    print('GALLERY STATUS:',len(manifest['collections']),
          'albums',total,'photos. Automatic activation requires 50 and 10 countries.',flush=True)

if __name__=='__main__':
    main()
