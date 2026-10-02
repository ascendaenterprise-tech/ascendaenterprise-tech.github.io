#!/usr/bin/env python3
"""Pull quotes from Yahoo Finance for every symbol in yahoo_symbols.json and write yahoo_quotes.json.
Standard library only. Run by .github/workflows/yahoo.yml every 5 minutes, or by hand: python tools/pull_yahoo.py"""
import json, sys, time, pathlib, datetime, urllib.request, urllib.parse
from concurrent.futures import ThreadPoolExecutor
ROOT = pathlib.Path(__file__).resolve().parent.parent
UA = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36'}

def fetch(sym, rng='range=1d&interval=5m&includePrePost=true'):
    url = 'https://query1.finance.yahoo.com/v8/finance/chart/' + urllib.parse.quote(sym) + '?' + rng
    last = None
    for attempt in range(3):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=20) as r:
                d = json.loads(r.read().decode())
            res = (d.get('chart') or {}).get('result')
            if not res: raise RuntimeError(str((d.get('chart') or {}).get('error'))[:120])
            rec = build(res[0])
            if len(rec['spark']) < 5 and rng.startswith('range=1d'):   # market not open yet today: use the last two sessions
                try: rec['spark'] = fetch(sym, 'range=2d&interval=15m')['spark']
                except Exception: pass
            return rec
        except Exception as e:
            last = e; time.sleep(1 + attempt)
    raise last

def build(r):
    m = r['meta']; q = (r.get('indicators', {}).get('quote') or [{}])[0]
    closes = [c for c in (q.get('close') or []) if c is not None]
    spark = closes if len(closes) <= 120 else [closes[int(i * (len(closes) - 1) / 119)] for i in range(120)]
    return dict(p=m.get('regularMarketPrice'), pc=m.get('chartPreviousClose') or m.get('previousClose'),
                h=m.get('regularMarketDayHigh'), l=m.get('regularMarketDayLow'), t=m.get('regularMarketTime'),
                st=m.get('marketState'), ccy=m.get('currency'), spark=[round(c, 6) for c in spark])

def main():
    syms = json.loads((ROOT / 'yahoo_symbols.json').read_text())
    tl = json.loads((ROOT / 'tools' / 'terminal_list.json').read_text()) if (ROOT / 'tools' / 'terminal_list.json').exists() and (ROOT / 'terminal.html').exists() else []
    syms = sorted(set(syms) | {x[0] for x in tl})
    out = {}; bad = []
    def one(s):
        try: return s, fetch(s)
        except Exception as e: return s, str(e)
    with ThreadPoolExecutor(6) as ex:
        for s, v in ex.map(one, syms):
            if isinstance(v, dict) and v.get('p') is not None: out[s] = v
            else: bad.append((s, v if isinstance(v, str) else 'no price'))
    for s, why in bad: print('  FAILED', s, why)
    print(f'{len(out)} of {len(syms)} symbols ok')
    if not out:
        print('nothing fetched; leaving the old file in place'); sys.exit(1)
    # keep the last good value for a symbol that failed this time
    path = ROOT / 'yahoo_quotes.json'
    try: old = json.loads(path.read_text()).get('quotes', {})
    except Exception: old = {}
    for s in syms:
        if s not in out and s in old: out[s] = old[s]
    doc = dict(source='Yahoo Finance', asof=datetime.datetime.now(datetime.timezone.utc).isoformat(timespec='seconds'), quotes=out)
    path.write_text(json.dumps(doc, separators=(',', ':')))
    print('wrote', path)
    if tl:   # same file the local terminal reads (quotes.json), so terminal.html shows Yahoo prices on the public site
        q = {}
        for ysym, tsym, name, grp in tl:
            v = out.get(ysym)
            if v: q[ysym] = dict(price=v['p'], prev=v['pc'], chg=(round((v['p'] / v['pc'] - 1) * 100, 3) if v['p'] and v['pc'] else None),
                                 day=(datetime.datetime.fromtimestamp(v['t'], datetime.timezone.utc).strftime('%Y-%m-%d %H:%M UTC') if v.get('t') else None),
                                 state=v.get('st'), ccy=v.get('ccy'), name=name, group=grp, kind='yahoo', term=tsym)
            else: q[ysym] = dict(name=name, group=grp, kind='yahoo', term=tsym, error='no data')
        (ROOT / 'quotes.json').write_text(json.dumps(dict(source='Yahoo Finance', asof_utc=doc['asof'], quotes=q), separators=(',', ':')))
        print('wrote quotes.json')

if __name__ == '__main__': main()
