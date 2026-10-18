#!/usr/bin/env python3
"""Build panorama preview contact sheets for human editorial review. No R2 write."""
import html, io, json, re, time, urllib.request, urllib.parse, urllib.error
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
ROOT=Path(__file__).resolve().parents[2]
titles=json.loads((ROOT/'panoramas/shortlist-preview.json').read_text())['titles']
out=Path('panorama-review')
out.mkdir(exist_ok=True)
def get(url):
  req=urllib.request.Request(url,headers={'User-Agent':'AtlasArenaPanoramaResearch/0.5 (https://github.com/oguzhanozeren92-debug/cografya; review previews)'})
  for attempt in range(5):
    try:
      with urllib.request.urlopen(req,timeout=50) as res:return res.read()
    except urllib.error.HTTPError as e:
      if e.code not in (429,503) or attempt==4:raise
      time.sleep(min(40,5*2**attempt))
  raise RuntimeError('API did not respond')
def clean(t):
  return html.unescape(re.sub(r'<[^>]+>','',t or '')).strip()
rows=[]
for n,title in enumerate(titles):
  try:
    q={'action':'query','format':'json','prop':'imageinfo|coordinates','titles':title,'iiprop':'url|size|extmetadata','iiurlwidth':620}
    dat=json.loads(get('https://commons.wikimedia.org/w/api.php?'+urllib.parse.urlencode(q)))
    page=next(iter(dat['query']['pages'].values()))
    pic=page['imageinfo'][0]
    meta=pic.get('extmetadata',{})
    lic=clean(meta.get('LicenseShortName',{}).get('value',''))
    artist=clean(meta.get('Artist',{}).get('value',''))
    coords=(page.get('coordinates') or [{}])[0]
    w,h=pic['width'],pic['height']
    source='https://commons.wikimedia.org/wiki/'+title.replace(' ','_')
    row={'index':n,'title':title,'source':source,'width':w,'height':h,'bytes':pic.get('size'),
      'license':lic,'artist':artist[:350],'lat':coords.get('lat'),'lng':coords.get('lon'),'thumb_ok':False}
    if w!=h*2 or row['lat'] is None or not pic.get('thumburl'):
      row['reject']='size not equirectangular 2:1 or missing GPS'
    else:
      try:
        raw=get(pic['thumburl'])
        with Image.open(io.BytesIO(raw)) as img:
          thumb=img.convert('RGB')
          thumb.thumbnail((515,258))
          canvas=Image.new('RGB',(530,260),'#111b30')
          canvas.paste(thumb,((530-thumb.width)//2,(260-thumb.height)//2))
          canvas.save(out/f'thumb-{n:02d}.jpg',quality=80)
          row['thumb_ok']=True
      except Exception as e:row['reject']='thumbnail fetch failed '+str(e)[:90]
    rows.append(row)
    print(n,title[:58],lic,'GPS' if row['lat'] is not None else 'noGPS','PREVIEW' if row['thumb_ok'] else 'N/A',flush=True)
  except Exception as e:
    rows.append({'index':n,'title':title,'reject':str(e)[:130],'thumb_ok':False})
    print(n,'ERROR',str(e)[:110],flush=True)
  time.sleep(0.6)
(out/'review-metadata.json').write_text(json.dumps({'items':rows},ensure_ascii=False,indent=2))
FONT='/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
font=ImageFont.truetype(FONT,17)
small=ImageFont.truetype(FONT,13)
for start in range(0,len(rows),12):
  block=rows[start:start+12]
  image=Image.new('RGB',(3*560,4*335),'#0f1726')
  draw=ImageDraw.Draw(image)
  for pos,row in enumerate(block):
    x=(pos%3)*560;y=(pos//3)*335
    picture=out/f'thumb-{row["index"]:02d}.jpg'
    if picture.exists():
      with Image.open(picture) as p:image.paste(p,(x+15,y+10))
    else: draw.rectangle((x+15,y+10,x+545,y+265),fill='#392331')
    label=f'{row["index"]:02d} • '+row['title'].replace('File:','')
    label=label[:48]+'…' if len(label)>49 else label
    draw.text((x+15,y+277),label,font=font,fill='white')
    info=f'{row.get("lat","?")}, {row.get("lng","?")} | {row.get("license","??")}'
    draw.text((x+15,y+302),info[:63],font=small,fill='#b9c8e7')
  image.save(out/f'sheet-{start//12+1:02d}.jpg',quality=87)
print('Preview success:',sum(r['thumb_ok'] for r in rows),'/',len(rows),flush=True)
