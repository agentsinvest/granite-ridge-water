import os
import json,sys,re,glob,collections
from datetime import date,timedelta
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from parse_ocr import parse_pages
S=os.environ.get('OCR_WORK', 'raw/invoices/ocr')
TXT=sys.argv[1] if len(sys.argv)>1 else 'txt'; OUT=sys.argv[2] if len(sys.argv)>2 else 'assembled.json'
B=parse_pages(sorted(glob.glob(f'{S}/{TXT}/p*.txt')))
MET={'2008300':'meter-1','361424':'meter-1','2004031':'meter-2','361425':'meter-2','2004706':'meter-3','353703':'meter-3','1185793':'meter-4','353676':'meter-4'}
ACC={'304865':'meter-1','304867':'meter-2','304868':'meter-3','304866':'meter-4'}
NAMES=['Service charge','Excess usage charge','Water drought','Superfund charge','Total taxes']
r2=lambda x: round(x+1e-9,2)
D=lambda s: date.fromisoformat(s)
# known bill dates (from headers)
known_dates=sorted({b['bill_date'] for b in B if b['bill_date'] and b['date_from']=='header'})
def reads_from_row(row, meter_no, sf):
    ints=[int(x) for x in re.findall(r'(?<![\d/.])(\d{1,6})(?![\d/.])',row) if x!=meter_no]
    best=None
    for i,a in enumerate(ints):
        for j,b in enumerate(ints):
            if j<=i or a<b: continue
            c=a-b
            if c>3000: continue
            if c in ints[j+1:]:
                if sf is None or abs(round(0.0065*c+1e-9,2)-sf)<=0.011:
                    best=(a,b,c); break
        if best: break
    return best
good={};bad=[]
for b in B:
    m=MET.get(b['meter']) or ACC.get(b['acct_label'] or '')
    a=b['amounts']; rec=dict(meter=m,meter_number=b['meter'],bill_date=b['bill_date'],date_from=b['date_from'],amounts=a,labels=b['labels'],other=b['other'],other_total=b.get('other_total'),usage_code=b['usage_code'],read_dates=b['read_dates'],read_row=b['read_row'],page=b['page'])
    # structure: first k amounts sum to amount k (total), k=5 normally; allow k=4..7 for bills with extra/missing lines
    sol=None
    for k in range(3,min(len(a),8)):
        if abs(sum(a[:k])-a[k])<0.005 and a[k]>=max(a[:k]): sol=k; break
    rec['n_lines']=sol
    # date sanity from read dates
    if rec['read_dates']:
        try:
            end=D(rec['read_dates'][0])
            if False:
                cands=[d for d in known_dates if 5<=(D(d)-end).days<=40]
                if cands: rec['bill_date']=cands[0]; rec['date_from']='read date'
                elif rec['bill_date']: rec['date_warn']='bill date far from read date'
        except Exception: pass
    if sol is None or not m or not rec['bill_date']:
        rec['why']='no sum' if sol is None else ('no meter' if not m else 'no date'); bad.append(rec); continue
    items=list(zip(rec['labels'][:sol],a[:sol])); rec['total_water']=a[sol]
    if sol==5: items=[(NAMES[i],v) for i,(_,v) in enumerate(items)]
    rec['items']=items
    # gallons from drought charge when the standard 5-line structure is present
    if sol==5 and items[2][1]>0:
        rec['kgal_from_drought']=round(items[2][1]/0.08+3)
        k=rec['kgal_from_drought']
        if abs(items[3][1]-round(0.0065*k+1e-9,2))>0.011: rec['warn']='superfund does not match drought gallons'
    sf=dict(items).get('Superfund charge') if sol==5 else (a[2] if sol==4 else None)
    rr=reads_from_row(rec['read_row'] or '', b['meter'], sf)
    if rr: rec['read_end'],rec['read_start'],rec['kgal_from_reads']=rr
    k1=rec.get('kgal_from_drought'); k2=rec.get('kgal_from_reads')
    if k1 is not None and k2 is not None and k1!=k2: rec['warn']=(rec.get('warn') or '')+' reads vs drought disagree'
    rec['kgal']=k1 if k1 is not None else k2
    if rec['kgal'] is None and sf is not None:
        lo=(sf-0.005)/0.0065; hi=(sf+0.005)/0.0065
        rec['kgal_range_from_superfund']=[int(lo)+1,int(hi)]
    if sol==4: rec['items']=[('Service charge',a[0]),('Excess usage charge',a[1]),('Superfund charge',a[2]),('Total taxes',a[3])]
    key=(m,rec['bill_date'])
    if key in good:
        if abs(good[key]['total_water']-rec['total_water'])>0.005: rec['why']='conflicting duplicate'; rec['other_version']=good[key]['total_water']; bad.append(rec)
    else: good[key]=rec
json.dump({'good':[v for k,v in sorted(good.items())],'bad':bad,'known_dates':known_dates},open(f'{S}/{OUT}','w'),indent=1)
print('blocks',len(B),'good',len(good),'bad',len(bad),collections.Counter(r['why'] for r in bad))
print('bill dates (header)',len(known_dates),known_dates[0],'to',known_dates[-1])
miss=[(d,mm) for d in known_dates for mm in ['meter-1','meter-2','meter-3','meter-4'] if (mm,d) not in good]
print('missing meter-bills',len(miss))
print('line structures',collections.Counter(r['n_lines'] for r in good.values()))
print('warnings',collections.Counter(r.get('warn') for r in good.values()))
print('gallons known',sum(1 for r in good.values() if r.get('kgal') is not None),'range only',sum(1 for r in good.values() if r.get('kgal') is None and r.get('kgal_range_from_superfund')))
