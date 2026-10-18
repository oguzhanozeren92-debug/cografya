#!/usr/bin/env python3
"""Export verified, lightweight licensed cube-face JPGs to Atlas's own origin."""
import io, json, os, re
from pathlib import Path
import boto3
from botocore.config import Config
from PIL import Image, ImageOps

ROOT=Path(__file__).resolve().parents[2]
APPROVED=ROOT/'server/street/approved.mjs'
READY=ROOT/'server/street/photo-ready.mjs'
DEST=ROOT/'public/street-photos'
FACES='frbl'

def read_catalog():
    raw=APPROVED.read_text(encoding='utf8')
    m=re.search(r'export const approvedPanoramas\s*=\s*(\[[\s\S]*\]);',raw)
    if not m:raise ValueError('Approved panorama catalog cannot be parsed')
    return json.loads(m.group(1))

def main():
    client=boto3.client('s3',region_name='auto',
      endpoint_url='https://'+os.environ['R2_ACCOUNT_ID']+'.r2.cloudflarestorage.com',
      aws_access_key_id=os.environ['R2_ACCESS_KEY_ID'],
      aws_secret_access_key=os.environ['R2_SECRET_ACCESS_KEY'],
      config=Config(signature_version='s3v4',retries={'max_attempts':4}))
    bucket=os.environ.get('R2_BUCKET','atlas-arena')
    approved=read_catalog()
    print('REVIEWED PANORAMAS:',len(approved),flush=True)
    verified=[];errors=[]
    for number,item in enumerate(approved,1):
        if not item.get('approved') or item.get('mode')!='multires':continue
        panorama_id=item['id']
        path=item['path'].rstrip('/')
        template=item['multires'].get('fallbackPath','/fallback/%s')
        ext=item['multires'].get('extension','jpg')
        if ext.lower()!='jpg':
            errors.append(panorama_id+': unexpected extension '+ext);continue
        results={}
        try:
            for face in FACES:
                filename=template.replace('%s',face).lstrip('/')+'.'+ext
                key=path+'/'+filename
                response=client.get_object(Bucket=bucket,Key=key)
                data=response['Body'].read()
                with Image.open(io.BytesIO(data)) as im:
                    im.load()
                    if im.width<250 or im.height<250:
                        raise ValueError('Fallback too small: '+key)
                    image=ImageOps.exif_transpose(im).convert('RGB')
                    image.thumbnail((900,900),Image.Resampling.LANCZOS)
                    with io.BytesIO() as out:
                        image.save(out,'JPEG',quality=76,optimize=True,progressive=True)
                        results[face]=out.getvalue()
            folder=DEST/panorama_id
            folder.mkdir(parents=True,exist_ok=True)
            for face,data in results.items():
                (folder/(face+'.jpg')).write_bytes(data)
            verified.append(panorama_id)
            print(f'PHOTO {number}/{len(approved)} OK {panorama_id}: {sum(len(v) for v in results.values())//1024} KiB',flush=True)
        except Exception as exc:
            errors.append(panorama_id+': '+str(exc)[:160])
            print('PHOTO NOT READY:',errors[-1],flush=True)
    if len(verified)<5:
        raise RuntimeError('Need >=5 verified galleries, got '+str(len(verified)))
    READY.write_text(
      '// Verified R2 gallery IDs; images served by Atlas Vercel CDN.\n'
      'export const approvedPhotoIds = '+json.dumps(sorted(verified),indent=2)+';\n',
      encoding='utf8')
    print(f'READY_STATIC_PHOTOS: {len(verified)}/{len(approved)}; errors: {len(errors)}',flush=True)
    for err in errors:print('MISSING:',err,flush=True)
    if errors:print('Missing entries excluded from active game until gallery verified.',flush=True)

if __name__=='__main__':
    main()
