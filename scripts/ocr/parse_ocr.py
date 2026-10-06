import re,sys,json,glob
AMT=r'\$\s*([\d,]*\.\s?\d\d)\b'
def money(s): return float(s.replace(',','').replace(' ',''))
DATE=r'(\d\d)/(\d\d)/(\d\d)'
def iso(m): return f'20{m[2]}-{m[0]}-{m[1]}'
def parse_pages(files):
    pages=[]
    for f in files:
        n=int(re.search(r'p(\d+)\.txt',f).group(1)); txt=open(f,errors='ignore').read()
        bd=re.search(r'Bill Date:?\s*'+DATE,txt)
        import os
        hf=f.replace('/txt/p','/hdr/h')
        if not bd and os.path.exists(hf):
            bd=re.search(r'Bill Date:?\s*'+DATE,open(hf,errors='ignore').read())
        pg=re.search(r'Page:?\s*(\d)\s*(?:of|o[fl]|\D{0,3})\s*(\d)',txt)
        pages.append(dict(n=n,txt=txt,bill_date=iso(bd.groups()) if bd else None,pg=(int(pg.group(1)),int(pg.group(2))) if pg else None))
    # fill missing bill dates from a previous page of the same bill (continuation)
    for i,p in enumerate(pages):
        if p['bill_date'] is None and i>0 and pages[i-1]['bill_date']:
            p['bill_date']=pages[i-1]['bill_date']; p['date_from']='previous page'
    blocks=[]
    for p in pages:
        acct=None; cur=None; in_other=False; recent=[]
        for raw in p['txt'].splitlines():
            line=raw.strip(); recent=(recent+[line])[-6:]
            m=re.search(r'Account Number:?\s*9557\s?14[\s\-]*3048(\d\d)',line)
            if m: acct='3048'+m.group(1)
            m=re.match(r'^[^\w]*(?:(\d{6,7})\s+)?Water System Service Charge.*?'+AMT+r'\s*$',line)
            if m:
                wtr=[l for l in recent[:-1] if re.search(r'W[TI][RF]',l)]
                rd=[iso(x) for x in re.findall(DATE,' '.join(wtr))][:2]
                mn=m.group(1) or (re.findall(r'\b(\d{6,7})\b',' '.join(wtr)) or [None])[0]
                cur={'page':p['n'],'bill_date':p['bill_date'],'date_from':p.get('date_from','header'),'acct_label':acct,'meter':mn,'amounts':[money(m.group(2))],'labels':['Service charge'],'other':[],'usage_code':None,'read_dates':rd,'read_row':' | '.join(wtr)}
                blocks.append(cur); in_other=False; continue
            if cur is None: continue
            if re.match(r'^\W*Other Fees',line): in_other=True; continue
            am=re.search(AMT+r'\s*-?\s*$',line)
            if not am: continue
            v=money(am.group(1)); label=line[:am.start()].strip()
            if in_other:
                if re.search(r'Total Other',label): cur['other_total']=v; in_other=False; cur=None
                else: cur['other'].append((re.sub(r'[\s.,:;]+$','',re.sub(r'\.{3,}.*','',label)),v))
                continue
            if len(cur['amounts'])>=8: continue
            c=re.search(r'Usage Charge\s*\(([^)]+)\)',label)
            if c: cur['usage_code']=c.group(1)
            cur['amounts'].append(v); cur['labels'].append(re.sub(r'\.{3,}.*','',label).strip())
    return blocks
