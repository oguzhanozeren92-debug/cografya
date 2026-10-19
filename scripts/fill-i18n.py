#!/usr/bin/env python3
"""One-time, build-time translation of missing Atlas UI phrases.
Existing hand-reviewed phrases are NEVER overwritten. No translation API is used at runtime.
Raises on failure rather than committing a partially translated dictionary.
"""
import json
import os
import re
import time
from pathlib import Path
from urllib.parse import urlencode
from urllib.request import Request, urlopen

PATH = Path('src/lib/i18nStrings.ts')
SOURCE = PATH.read_text(encoding='utf-8')
POS = SOURCE.index('=', SOURCE.index('export const translations'))
DICTIONARIES = json.loads(SOURCE[POS + 1:].strip().rstrip(';').strip())
TARGETS = {'es':'es', 'de':'de','fr':'fr','pt':'pt','ru':'ru','zh':'zh-CN','ja':'ja'}
KEYS = list(DICTIONARIES['en'])

def fetch(q, target):
    url = 'https://translate.googleapis.com/translate_a/single?' + urlencode({
        'client':'gtx','sl':'tr','tl':target,'dt':'t','q':q
    })
    req=Request(url,headers={'User-Agent':'Mozilla/5.0 AtlasArenaLocalization/1.0'})
    for attempt in range(5):
        try:
            with urlopen(req,timeout=28) as response:
                raw=json.loads(response.read().decode('utf-8'))
            value=''.join(part[0] for part in raw[0] if part and isinstance(part[0],str))
            if not value.strip():
                raise ValueError('Empty translation')
            return value
        except Exception:
            if attempt == 4:
                raise
            time.sleep(2**attempt)
    raise AssertionError('No translation returned')

def one(text,target):
    value=fetch(text,target).strip()
    if len(value)>600 or not value:
        raise ValueError('Suspicious translation size')
    return value

def batch(texts,target):
    marker = lambda i:'__AA'+str(i)+'__'
    payload='\n'.join(marker(i)+'\n'+text for i,text in enumerate(texts))
    try:
        translated=fetch(payload,target)
        chunks=re.split(r'__AA\s*(\d+)\s*__',translated,flags=re.I)
        result={}
        for i in range(1,len(chunks)-1,2):
            result[int(chunks[i])]=chunks[i+1].strip()
        if len(result)==len(texts) and all(result.get(i) for i in range(len(texts))):
            return [result[i] for i in range(len(texts))]
        print('Batch separators changed; retrying items individually',flush=True)
    except Exception as ex:
        print('Batch failed; retrying separately:',str(ex)[:120],flush=True)
    return [one(key,target) for key in texts]

def source_geographic_facts():
    # Street facts are an approved, versioned JSON catalogue.
    street = Path('server/street/approved.mjs').read_text(encoding='utf-8')
    match = re.search(r'export const approvedPanoramas\s*=\s*(\[[\s\S]*?\]);', street)
    if not match:
        raise ValueError('Approved street facts not found')
    street_facts = [row['fact'] for row in json.loads(match.group(1))]
    # Drone facts are five literal strings within the reviewed pilot catalogue.
    drone = Path('src/data/dronePanoramas.ts').read_text(encoding='utf-8')
    drone_facts = re.findall(r"\bfact:\s*'([^'\n]+)'", drone)
    if len(street_facts) != 37 or len(drone_facts) != 5:
        raise ValueError(f'Expected 37+5 reviewed location facts; got {len(street_facts)}+{len(drone_facts)}')
    return list(dict.fromkeys(street_facts + drone_facts))

def run():
    fact_keys=source_geographic_facts()
    missing_english=[key for key in fact_keys if key not in DICTIONARIES['en']]
    print('Location fact translations missing in English:',len(missing_english),flush=True)
    for index in range(0,len(missing_english),10):
        keys=missing_english[index:index+10]
        values=batch(keys,'en')
        for key,value in zip(keys,values):
            DICTIONARIES['en'][key]=value
        time.sleep(.35)
    keys=list(DICTIONARIES['en'])
    for language,target in TARGETS.items():
        missing=[key for key in keys if key not in DICTIONARIES[language]]
        print(language,'missing',len(missing),flush=True)
        for index in range(0,len(missing),10):
            current=missing[index:index+10]
            translation=batch(current,target)
            if len(translation)!=len(current):
                raise ValueError('Translation alignment error: '+language)
            for key,value in zip(current,translation):
                if not value.strip() or len(value)>600:
                    raise ValueError('Suspicious phrase for '+key)
                DICTIONARIES[language][key]=value
            if index % 50==0:
                print(language,':',min(index+10,len(missing)),'/',len(missing),flush=True)
            time.sleep(.35)
    for language in TARGETS:
        missing=[key for key in keys if not DICTIONARIES[language].get(key)]
        if missing:
            raise ValueError(language+' still missing '+str(len(missing))+' translations')
    PATH.write_text(SOURCE[:POS+1]+' '+json.dumps(DICTIONARIES,ensure_ascii=False,indent=2)+';\n',encoding='utf-8')
    print('Translated all',len(keys),'interface and geographic-fact phrases into all 8 locale dictionaries.',flush=True)

if __name__=='__main__':run()
