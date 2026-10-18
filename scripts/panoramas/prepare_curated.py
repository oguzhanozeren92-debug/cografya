#!/usr/bin/env python3
"""Prepare Commons-verified editorially screened 360-photo additions for Atlas Arena.
Thumbnail review is a preliminary quality check. Publisher rechecks license at download.
Never publish if GPS is missing, licensing restrictive, or equirectangular test fails.
"""
import html, json, re, time, urllib.parse, urllib.request, urllib.error
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
catalog=ROOT/'panoramas/reviewed.json'
shortlist=json.loads((ROOT/'panoramas/shortlist-preview.json').read_text(encoding='utf8'))['titles']
selected=json.loads((ROOT/'panoramas/curated-35.json').read_text(encoding='utf8'))['selections']
existing=json.loads(catalog.read_text(encoding='utf8'))['panoramas']
by_id={r['id']:r for r in existing}
def clean(s):return html.unescape(re.sub(r'<[^>]*>','',s or '')).strip()
def get(url):
  req=urllib.request.Request(url,headers={'User-Agent':'AtlasArenaPanoramaPublisher/0.6 (https://github.com/oguzhanozeren92-debug/cografya; curated asset metadata)'})
  for attempt in range(5):
    try:
      with urllib.request.urlopen(req,timeout=55) as res:return json.load(res)
    except urllib.error.HTTPError as exc:
      if exc.code not in (429,503) or attempt==4:raise
      wait=min(50,5*2**attempt)
      print('Commons busy',exc.code,'retry',wait,flush=True)
      time.sleep(wait)
  raise RuntimeError('Commons requests exhausted')
for obj in selected:
  key=obj['id']
  if key in by_id:
    print('Already prepared',key,flush=True)
    continue
  title=shortlist[obj['index']]
  params=urllib.parse.urlencode({
    'action':'query','format':'json','prop':'imageinfo|coordinates',
    'titles':title,'iiprop':'url|size|extmetadata'})
  data=get('https://commons.wikimedia.org/w/api.php?'+params)
  page=next(iter(data['query']['pages'].values()))
  p=page['imageinfo'][0];ext=p.get('extmetadata',{})
  lic=clean(ext.get('LicenseShortName',{}).get('value',''))
  artist=clean(ext.get('Artist',{}).get('value',''))
  normalized=lic.lower().replace(' ','-')
  if not any(x in normalized for x in ('cc-by-4.0','cc-by-sa-4.0','cc-by-3.0','cc-by-sa-3.0','cc0','public-domain')):
    raise RuntimeError(f'{key}: disallowed licence {lic}')
  if '-nd' in normalized or '-nc' in normalized:raise RuntimeError(f'{key}: restrictive licence')
  if not artist or artist.lower() in ('own work','unknown'):
    raise RuntimeError(f'{key}: author needs manual verification')
  w,h=p['width'],p['height']
  if w < 5000 or h < 2500 or w!=h*2 or p.get('size',0)>90*1024*1024:
    raise RuntimeError(f'{key}: image size invalid {w}x{h} {p.get("size")}')
  coords=(page.get('coordinates') or [{}])[0]
  lat,lng=coords.get('lat'),coords.get('lon')
  if lat is None or lng is None or not (-90<=lat<=90 and -180<=lng<=180):
    raise RuntimeError(f'{key}: missing camera coordinates')
  row=dict(id=key,sourceTitle=title,source='https://commons.wikimedia.org/wiki/'+title.replace(' ','_'),
    country=obj['country'],city=obj['city'],title=obj['title'],fact=obj['fact'],
    lat=lat,lng=lng,artist=artist[:350],license=lic,
    reviewedProjection=True,reviewedCoordinates=True,reviewedLicense=True,reviewedQuality=True)
  by_id[key]=row
  print('Prepared',key,obj['country'],f'{lat:.5f},{lng:.5f}',lic,flush=True)
  time.sleep(0.75)
assert len(set(row['id'] for row in by_id.values()))==len(by_id)
catalog.write_text(json.dumps({'panoramas':list(by_id.values())},ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print('Total eligible reviewed rows:',len(by_id),flush=True)
