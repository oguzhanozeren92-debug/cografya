#!/usr/bin/env python3
"""Download missing 3-photo Commons albums after verifying media, credit and CC license.
Album changes are atomic: errors leave the album pending. Never overwrites media.
"""
import json, re, html, io, time, sys, urllib.parse, urllib.request, urllib.error, unicodedata
from datetime import datetime, timezone
from pathlib import Path
from html.parser import HTMLParser
from PIL import Image, ImageOps

ROOT=Path(__file__).resolve().parents[2]
FILE=ROOT/'public/drone-gallery/catalog-v2.json'
REPORT=ROOT/'reports/globriva-gallery-import.json'
IDS={'album-017','album-018','album-019','album-020'}
AGENT='GlobrivaGallery/1.0 (educational photo licensing audit; Wikimedia Commons)'
Image.MAX_IMAGE_PIXELS=35000000
class Plain(HTMLParser):
 def __init__(self): super().__init__(); self.parts=[]
 def handle_data(self,v): self.parts.append(v)
def clean(v):
 p=Plain();p.feed(str(v or ''));return ' '.join(html.unescape(' '.join(p.parts)).split())
def norm(v):
 return ' '.join(re.sub(r'[^\w]+',' ',unicodedata.normalize('NFKD',clean(v)).casefold()).split())
def load(url,size=22000000):
 if not url.startswith(('https://commons.wikimedia.org/','https://upload.wikimedia.org/')):
  raise ValueError('Unexpected image origin')
 last=None
 for trial in range(4):
  try:
   req=urllib.request.Request(url,headers={'User-Agent':AGENT,'Accept':'application/json,image/*;q=0.9,*/*;q=0.5'})
   with urllib.request.urlopen(req,timeout=55) as res:
    if not res.url.startswith(('https://commons.wikimedia.org/','https://upload.wikimedia.org/')):
     raise ValueError('Untrusted redirect')
    buf=res.read(size+1)
    if len(buf)>size:raise ValueError('Source too large')
    return buf
  except (urllib.error.HTTPError,urllib.error.URLError,TimeoutError) as e:
   last=e
   if isinstance(e,urllib.error.HTTPError) and e.code not in (429,500,502,503,504):break
   time.sleep(2*(trial+1))
 raise RuntimeError('Download failed: '+str(last))
def verify(p):
 source=p['source']
 if not source.startswith('https://commons.wikimedia.org/wiki/File:'):raise ValueError('Invalid Commons page')
 title=urllib.parse.unquote(source.split('/wiki/',1)[1]).replace('_',' ')
 if not title.startswith('File:') or '/' in title or '\\' in title:raise ValueError('Unsafe title')
 params=urllib.parse.urlencode({'action':'query','format':'json','prop':'imageinfo',
   'iiprop':'url|size|mime|extmetadata','iiurlwidth':1450,'titles':title,'redirects':'1'})
 obj=json.loads(load('https://commons.wikimedia.org/w/api.php?'+params,2000000))
 pages=list(obj.get('query',{}).get('pages',{}).values())
 info=pages[0].get('imageinfo',[None])[0] if len(pages)==1 else None
 if not info or info.get('mime')!='image/jpeg':raise ValueError('Missing JPEG')
 if info.get('width',0)<950 or info.get('height',0)<600:raise ValueError('Image resolution too low')
 meta=info.get('extmetadata',{})
 license=clean(meta.get('LicenseShortName',{}).get('value'))
 author=clean(meta.get('Artist',{}).get('value'))
 if license!=p['license'] or license not in ('CC BY-SA 4.0','CC BY-SA 3.0'):
  raise ValueError('License mismatch '+license+' vs '+p['license'])
 stated=norm(p['artist']); observed=norm(author)
 if not stated or not observed or (stated not in observed and observed not in stated):
  raise ValueError('Photographer mismatch '+p['artist']+' / '+author)
 licenseurl=clean(meta.get('LicenseUrl',{}).get('value')).rstrip('/')
 if licenseurl and licenseurl!=p['licenseUrl'].rstrip('/'):raise ValueError('License URL mismatch')
 url=info.get('thumburl') or info.get('url')
 if not url or not url.startswith('https://upload.wikimedia.org/'):raise ValueError('Invalid media URL')
 return url,{'page':source,'photographer':p['artist'],'license':license}
def album_download(a):
 if len(a['images'])!=3 or len({p['source'] for p in a['images']})!=3:
  raise ValueError('Each new album requires three independent photos')
 media=[];checks=[]
 for i,p in enumerate(a['images'],1):
  url,meta=verify(p)
  data=load(url)
  with Image.open(io.BytesIO(data)) as pic:
   im=ImageOps.exif_transpose(pic).convert('RGB')
   if im.width<650 or im.height<500:raise ValueError('Downloaded photo too small')
   im.thumbnail((1600,1200),Image.Resampling.LANCZOS)
   out=io.BytesIO();im.save(out,format='WEBP',quality=86,method=5)
   encoded=out.getvalue()
  if len(encoded)<8000 or encoded[:4]!=b'RIFF' or encoded[8:12]!=b'WEBP':
   raise ValueError('WebP conversion failed')
  media.append(encoded);checks.append(dict(meta,filename=f'{i}.webp',bytes=len(encoded)))
  print(a['id'],i,'of',len(a['images']),'validated',flush=True)
 folder=ROOT/'public/drone-gallery/photos'/a['id']
 folder.mkdir(parents=True,exist_ok=True)
 for i in range(len(media)):
  if (folder/f'{i+1}.webp').exists():raise ValueError('Refusing to overwrite file')
 for i,content in enumerate(media,1):(folder/f'{i}.webp').write_bytes(content)
 a['approved']=True
 a['approvalBasis']='owner_authorized_2026-10-24_commons_api_artist_license_and_download'
 for p in a['images']:
  p['format']='webp'
  p['derivativeNote']='Original Commons photo resized and converted to WebP for the game.'
 return checks
def main():
 data=json.loads(FILE.read_text())
 result={'checkedAt':datetime.now(timezone.utc).isoformat(),'ready':[],'failed':[]}
 for a in data['collections']:
  if a.get('id') not in IDS or a.get('approved'):continue
  print('Checking',a['id'],a['city'],flush=True)
  try:result['ready'].append({'album':a['id'],'city':a['city'],'photos':album_download(a)})
  except Exception as exc:
   result['failed'].append({'album':a['id'],'error':str(exc)[:350]})
   print('BLOCKED:',a['id'],str(exc),flush=True)
 if result['ready']:
  data['updated']=datetime.now(timezone.utc).date().isoformat()
  FILE.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
 REPORT.parent.mkdir(parents=True,exist_ok=True)
 REPORT.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
 print('Added',len(result['ready']),'albums; blocked',len(result['failed']),flush=True)
 if not result['ready'] and result['failed']:sys.exit(1)
if __name__=='__main__':main()
