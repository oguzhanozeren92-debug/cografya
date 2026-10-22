#!/usr/bin/env python3
"""Publish *only* fully editor-reviewed 3-4 photo Drone albums to Cloudflare R2.
No auto-approval. Publish individual albums atomically through the existing
license/photography checks; retain historical pilot photos on failure.
"""
import json
import os
from datetime import datetime, timezone
from pathlib import Path
from publish_drone_gallery import (
    ROOT, CANDIDATES, verify, r2, load_catalog,
    publish_collection, save,
)

OUT = ROOT / 'panoramas/daily-discovery/drone-publish-status.json'
MAX_ALBUMS_PER_DAY = 3

def main():
    rows = json.loads(CANDIDATES.read_text(encoding='utf8'))['collections']
    eligible, blocked = [], []
    for row in rows:
        try:
            verify(row)
            eligible.append(row)
        except Exception as exc:
            blocked.append({'id':row.get('id'), 'reason':str(exc)[:140]})
    summary = {
        'date':datetime.now(timezone.utc).date().isoformat(),
        'eligibleReviewedAlbums':len(eligible),
        'waitingEditorialReview':len(blocked),
        'publishedTodayAlbums':0, 'publishedTodayPhotos':0,
        'readyTotalAlbums':None, 'readyTotalPhotos':None,
        'activated':False, 'errors':[],
    }
    def write():
        OUT.parent.mkdir(parents=True, exist_ok=True)
        OUT.write_text(json.dumps(summary,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
        print('DRONE_PUBLISH_REPORT',json.dumps(summary,ensure_ascii=False),flush=True)

    if not all(os.getenv(k) for k in ('R2_ACCOUNT_ID','R2_ACCESS_KEY_ID','R2_SECRET_ACCESS_KEY')):
        summary['errors'].append('R2 credentials are not configured; no media were uploaded.')
        write()
        return
    try:
        client = r2()
        bucket=os.getenv('R2_BUCKET','atlas-arena')
        manifest=load_catalog(client,bucket)
        before={r['id'] for r in manifest['collections']}
        for row in eligible:
            if row['id'] in before: continue
            if summary['publishedTodayAlbums'] >= MAX_ALBUMS_PER_DAY:break
            try:
                record=publish_collection(row,client,bucket)
                manifest['collections'].append(record)
                save(client,bucket,manifest)
                before.add(row['id'])
                summary['publishedTodayAlbums'] += 1
                summary['publishedTodayPhotos'] += len(row['images'])
            except Exception as exc:
                summary['errors'].append(str(row['id'])+': '+str(exc)[:200])
        summary['readyTotalAlbums']=len(manifest['collections'])
        summary['readyTotalPhotos']=sum(len(row['images']) for row in manifest['collections'])
        summary['activated']=(summary['readyTotalPhotos']>=50 and
          len({row['country'] for row in manifest['collections']})>=10)
    except Exception as exc:
        summary['errors'].append('R2 connection/catalog: '+str(exc)[:200])
    write()

if __name__=='__main__':main()
