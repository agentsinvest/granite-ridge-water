import os
import json,re,glob,os,sys
from datetime import date,timedelta
S=os.environ.get('OCR_WORK', 'raw/invoices/ocr')
A=json.load(open(sys.argv[1] if len(sys.argv)>1 else f'{S}/assembled.json'))
ACCT={'meter-1':'8651','meter-2':'8671','meter-3':'8681','meter-4':'8661'}
existing={}
for p in glob.glob('data/bills/meter-*/*.md'):
    t=open(p).read(); f=dict(re.findall(r'^(\w+): (.*)$',t.split('---')[1],re.M)); existing[(f['meter'],f['bill_date'])]=p
def bp(m):
    return [(a.strip(),b.strip(),int(c)) for a,b,c in (l.split('|')[1:4] for l in open(f'data/billing-periods/{m}.md') if l.startswith('| 20'))]
D=date.fromisoformat
def other_name(label):
    l=label.lower()
    if 'mandate' in l: return 'Other fees'
    if 'late' in l: return 'Late fee charge'
    if 'delinq' in l: return 'Delinquent letter charge'
    if 'tax' in l: return 'Tax on late fee'
    return None
written=[];skipped=[]
for r in A['good']:
    m=r['meter']; bd=r['bill_date']
    if (m,bd) in existing: skipped.append((m,bd,'exists')); continue
    notes=[]; review=False
    # period
    ps=pe=None; psrc=None; wf=None
    P=[q for q in bp(m) if q[1]<bd and (D(bd)-D(q[1])).days<=40]
    if P and bd>='2023-10-01': wf=P[-1]
    kgal=r.get('kgal'); gsrc=None; grange=None
    if r.get('kgal_from_drought') is not None: gsrc='water drought charge ($0.08 per thousand gallons above 3,000)'
    elif r.get('kgal_from_reads') is not None: gsrc='meter reads on the bill'
    if wf:
        ps,pe=wf[0],wf[1]; psrc=f'Matched to the Waterfluence read period ending before the bill date ({wf[2]} thousand gallons).'
        if kgal is None:
            rng=r.get('kgal_range_from_superfund')
            if not rng or rng[0]-1<=wf[2]<=rng[1]+1: kgal=wf[2]; gsrc='Waterfluence read period (consistent with the Superfund charge)'
        elif kgal!=wf[2]: notes.append(f'Waterfluence shows {wf[2]} thousand gallons for this period; the bill gives {kgal}.'); review=True
    elif len(r.get('read_dates') or [])==2:
        e,s_=r['read_dates']
        try:
            if 20<= (D(e)-D(s_)).days <=40 and 3<=(D(bd)-D(e)).days<=40:
                ps=(D(s_)+timedelta(days=1)).isoformat(); pe=e; psrc='City meter read dates on the bill (start is the day after the previous read).'
        except Exception: pass
    if kgal is None:
        grange=r.get('kgal_range_from_superfund')
        if grange: notes.append(f'Gallons not read exactly; the Superfund charge implies {grange[0]},000 to {grange[1]},000 gallons.')
        review=True
    month=(pe[:7] if pe else (D(bd)-timedelta(days=14)).isoformat()[:7])
    path=f'data/bills/{m}/{month}.md'
    if os.path.exists(path) or path in [w[0] for w in written]:
        skipped.append((m,bd,'month collision '+month)); continue
    items=[(n,v) for n,v in r['items']]
    if not any(n=='Water drought' for n,_ in items): items.insert(2,('Water drought',0.0)) if r['n_lines']==5 else None
    oth=[]
    for lab,v in r['other']:
        n=other_name(lab)
        if n is None: notes.append(f'Unrecognized other charge "{lab}" ${v:.2f} on the bill.'); review=True; n=lab or 'Other charge'
        oth.append((n,v))
    ot=r.get('other_total')
    if ot is None: ot=round(sum(v for _,v in oth),2)
    elif abs(sum(v for _,v in oth)-ot)>0.005:
        notes.append(f'Other charges listed (${sum(v for _,v in oth):.2f}) do not add to the printed other total (${ot:.2f}); the printed total is used.'); review=True
        oth=[('Other fees',ot)] if not oth else oth
    total=round(r['total_water']+ot,2)
    if r.get('warn'): notes.append('Check: '+r['warn'].strip()+'.'); review=True
    f2=lambda x:f'{x:.2f}'
    fm=[ '---',f'meter: {m}',f'bill_date: {bd}',f'period_start: {ps or "null"}',f'period_end: {pe or "null"}']
    fm.append(f'period_source: "{psrc or "Not known: the read dates could not be read from the scanned bill."}"')
    fm+=[f"read_start: {r.get('read_start') or 'null'}",f"read_end: {r.get('read_end') or 'null'}"]
    fm.append(f'gallons: {kgal*1000 if kgal is not None else "null"}')
    if gsrc and kgal is not None: fm.append(f'gallons_source: "{gsrc}"')
    if grange and kgal is None: fm.append(f'gallons_range: [{grange[0]*1000}, {grange[1]*1000}]')
    fm+=['amount_due: null',f'printed_total: {f2(total)}','reconciled: pending',f'needs_review: {"true" if review else "false"}']
    if r.get('meter_number'): fm.append(f'meter_number_last4: "{r["meter_number"][-4:]}"')
    if r.get('usage_code'): fm.append(f'usage_code: "{r["usage_code"].replace(" ","")}"')
    fm.append(f'ocr_page: {r["page"]}')
    fm.append(f'source: "City of Mesa bill dated {bd}, account ...{ACCT[m]}; read by OCR from Invoices (1)_opt (1).pdf page {r["page"]}. Accepted because the charge lines add up exactly to the printed total water charges."')
    if kgal is None or not pe: fm.append('todo: "Read the meter reads and read dates from the scanned bill page to fill the period and gallons."')
    fm.append('---')
    body=['','Line items read from the City bill.','','| Line item | Amount |','|---|---|']
    body+= [f'| {n} | {f2(v)} |' for n,v in items]
    body+= [f'| {n} | {f2(v)} |' for n,v in oth]
    body+=['',f'Total water charges (City bill): {f2(r["total_water"])}. Total other charges: {f2(ot)}.','',f'Notes: {" ".join(notes) if notes else "None."}','']
    written.append((path,'\n'.join(fm+body)))
for path,txt in written:
    os.makedirs(os.path.dirname(path),exist_ok=True); open(path,'w').write(txt)
print('written',len(written),'skipped',len(skipped))
import collections
print(collections.Counter(s[2].split()[0] for s in skipped))
for s in skipped:
    if s[2]!='exists': print(' ',s)
