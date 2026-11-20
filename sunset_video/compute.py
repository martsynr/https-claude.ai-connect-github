import sys,csv,json,numpy as np
sys.path.insert(0,sys.argv[1]+"/src")
from sun import sunset_utc_min
S=sys.argv[1]
rows=list(csv.DictReader(open(S+"/data/UA20.csv")))
names=[r['name'] for r in rows]; lon=np.array([float(r['lon']) for r in rows]); lat=np.array([float(r['lat']) for r in rows])
t=sunset_utc_min(lat,lon,2026,11,20)+120  # Kyiv time UTC+2
o=np.argsort(t)
f=lambda m: f"{int(m//60):02d}:{int(m%60):02d}:{int(round((m*60)%60)):02d}"
for i in list(o[:8])+['...']+list(o[-8:]):
    if i=='...': print('...'); continue
    print(f(t[i]), names[i], lat[i], lon[i])
print("diff min", t[o[-1]]-t[o[0]])
# check vs Kyiv
k=names.index('Київ') if 'Київ' in names else None; print('Kyiv',f(t[k]) if k is not None else None)
