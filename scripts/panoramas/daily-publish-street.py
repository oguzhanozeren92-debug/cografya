#!/usr/bin/env python3
"""Conservative unattended Street release: one previously editor-reviewed OUTDOOR
360 panorama each day, then verify all four JPG faces from R2.
Never auto-publish the newly-discovered unreviewed candidates.
"""
import argparse
import json
import os
import re
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2]
APPROVED=ROOT/'server/street/approved.mjs'
READY=ROOT/'server/street/photo-ready.mjs'
REVIEWED=ROOT/'panoramas/reviewed.json'
OUT=ROOT/'panoramas/daily-discovery/street-publish-status.json'
# 2026-10-26 Commons/API + thumbnail-reviewed, five DIFFERENT countries.
# Do not include Dresden tram (interior), Oulu night (too dark), or generic
# garden imagery. Publisher still checks source license and uploads tiles
# before updating the approved catalog. One set/day max.
SELECTED=[
    'ca-niagara-falls-002',             # Canada — iconic falls
    'uz-tashkent-museum-outside-002',   # Uzbekistan — museum exterior
    'is-gullfoss-waterfall-002',        # Iceland — distinctive waterfall
    'dk-copenhagen-tower-002',          # Denmark — city from tower
    'am-yerevan-gallery-night-002',     # Armenia — illuminated monument
]

def read_catalog():
    text=APPROVED.read_text(encoding='utf8')
    m=re.search(r'export const approvedPanoramas\s*=\s*(\[[\s\S]*\]);',text)
    if not m:raise RuntimeError('Cannot parse approved Street catalog')
    return json.loads(m.group(1))

def ready_ids():
    text=READY.read_text(encoding='utf8')
    m=re.search(r'export const approvedPhotoIds\s*=\s*(\[[\s\S]*?\]);',text)
    return set(json.loads(m.group(1))) if m else set()

def candidates():
    existing={p.get('sourceId') for p in read_catalog()}
    data=json.loads(REVIEWED.read_text(encoding='utf8'))['panoramas']
    byid={p['id']:p for p in data}
    out=[]
    for ident in SELECTED:
        row=byid.get(ident)
        if not row or ident in existing:continue
        if not all(row.get(k) is True for k in
            ('reviewedProjection','reviewedCoordinates','reviewedLicense','reviewedQuality')):continue
        out.append(ident)
    return out

def write(info):
    OUT.parent.mkdir(parents=True,exist_ok=True)
    OUT.write_text(json.dumps(info,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
    print('STREET_PUBLISH_REPORT',json.dumps(info,ensure_ascii=False),flush=True)

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--probe',action='store_true')
    args=parser.parse_args()
    pending=candidates()
    incomplete=len(ready_ids())<len(read_catalog())
    if args.probe:
        print('true' if (pending or incomplete) else 'false')
        return
    beforeReady=ready_ids()
    info={'date':datetime.now(timezone.utc).date().isoformat(),
        'editoriallyApprovedOutdoorPending':len(pending),
        'publishedTodayPanoramas':0,'activatedTodayPanoramas':0,
        'readyTotalPanoramas':len(ready_ids()),'errors':[]}
    if not all(os.getenv(k) for k in
      ('R2_ACCOUNT_ID','R2_ACCESS_KEY_ID','R2_SECRET_ACCESS_KEY')):
        info['errors'].append('R2 credentials not configured')
        write(info);return
    for ident in pending:
        if info['publishedTodayPanoramas']>=1:break
        try:
            subprocess.run([
              sys.executable,str(ROOT/'scripts/panoramas/publish.py'),
              '--ids',ident],cwd=ROOT,check=True,timeout=1200)
            info['publishedTodayPanoramas']+=1
        except Exception as e:
            info['errors'].append(ident+': '+str(e)[:180])
    if info['publishedTodayPanoramas'] or incomplete:
        try:
            subprocess.run([
              sys.executable,str(ROOT/'scripts/panoramas/sync_street_photos.py')],
              cwd=ROOT,check=True,timeout=900)
        except Exception as e:
            info['errors'].append('Static photo sync: '+str(e)[:180])
    afterIds=ready_ids()
    info['activatedTodayPanoramas']=len(afterIds-beforeReady)
    info['readyTotalPanoramas']=len(afterIds)
    write(info)

if __name__=='__main__':main()
