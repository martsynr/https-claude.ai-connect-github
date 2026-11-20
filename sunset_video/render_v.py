import sys, os, csv, json, math, numpy as np
S=sys.argv[1]; sys.path.insert(0,S+"/src")
import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.path import Path
from matplotlib.patches import PathPatch
import matplotlib.patheffects as pe
from shapely.geometry import shape
from sun import sunset_utc_min
from multiprocessing import Pool

Y,M,D=2026,11,20; TZ=120
FPS=30
# ---- data
geom=shape(json.load(open(S+"/data/ua.json")))
polys=list(geom.geoms) if geom.geom_type=="MultiPolygon" else [geom]
verts=[];codes=[]
for p in polys:
    for ring in [p.exterior]+list(p.interiors):
        c=list(ring.coords); verts+=c; codes+=[Path.MOVETO]+[Path.LINETO]*(len(c)-2)+[Path.CLOSEPOLY]
upath=Path(verts,codes)
rows=list(csv.DictReader(open(S+"/data/UA20.csv")))
names=[r['name'] for r in rows]; lon=np.array([float(r['lon']) for r in rows]); lat=np.array([float(r['lat']) for r in rows])
r1=np.array([float(r['r1']) for r in rows])
ss=sunset_utc_min(lat,lon,Y,M,D)+TZ
iF=int(np.argmin(ss)); iL=int(np.argmax(ss))
tF,tL=ss[iF],ss[iL]
def fmt(m,sec=True):
    s=int(round(m*60)); h,s=divmod(s,3600); mi,s=divmod(s,60)
    return f"{h:02d}:{mi:02d}:{s:02d}" if sec else f"{h:02d}:{mi:02d}"
def dist(a,b):
    p1,p2=math.radians(lat[a]),math.radians(lat[b]); dl=math.radians(lon[b]-lon[a])
    return 6371*math.acos(math.sin(p1)*math.sin(p2)+math.cos(p1)*math.cos(p2)*math.cos(dl))
KM=dist(iF,iL); DIFF=tL-tF
cities=["Харків","Луганськ","Донецьк","Дніпро","Запоріжжя","Сімферополь","Київ","Одеса","Вінниця","Житомир","Львів","Ужгород","Чернігів","Суми","Полтава","Херсон","Луцьк","Чернівці"]
cidx=[]
for c in cities:
    cand=[i for i,n in enumerate(names) if n==c]
    if cand: cidx.append(max(cand,key=lambda i:r1[i]))
# raster
X0,X1,Y0,Y1=21.9,40.5,44.2,52.5
nx,ny=1400,900
gx,gy=np.meshgrid(np.linspace(X0,X1,nx),np.linspace(Y0,Y1,ny))
gss=(sunset_utc_min(gy.ravel(),gx.ravel(),Y,M,D)+TZ).reshape(ny,nx)
DAY=np.array([0.95,0.80,0.50]); GLOW=np.array([1.0,0.42,0.18]); NIGHT=np.array([0.05,0.08,0.20])
# ---- schedule (video seconds -> sim minutes)
T0=tF-16
keys=[(0,T0),(3,T0),(7,tF),(10,tF),(28,tL),(31,tL),(33,tL+10),(40,tL+10)]
DUR=keys[-1][0]
def sim(v):
    for (a,sa),(b,sb) in zip(keys,keys[1:]):
        if v<=b:
            u=(v-a)/(b-a) if b>a else 1; u=u*u*(3-2*u) if sa!=sb else u
            return sa+(sb-sa)*u
    return keys[-1][1]
def ease(x): x=np.clip(x,0,1); return x*x*(3-2*x)
BG="#070b18"; FG="#e9ecf5"; ACC="#ffb347"; DIM="#8a93ad"

def frame(k):
    v=k/FPS; t=sim(v)
    fig=plt.figure(figsize=(10.8,19.2),dpi=100,facecolor=BG)
    T=fig.text
    T(0.5,0.955,"Як ніч приходить в Україну",fontsize=36,color=FG,fontweight="bold",ha="center",va="top")
    T(0.5,0.915,f"{D} листопада {Y} · київський час",fontsize=18,color=DIM,ha="center",va="top")
    T(0.5,0.885,fmt(t),fontsize=84,color=ACC,fontweight="bold",ha="center",va="top",family="DejaVu Sans Mono")
    ax=fig.add_axes([0.01,0.39,0.98,0.42]); ax.set_facecolor(BG)
    ax.set_xlim(X0,X1); ax.set_ylim(Y0,Y1); ax.set_aspect(1/math.cos(math.radians(48.5))); ax.axis("off")
    d=t-gss
    dark=ease(d/38.0)[...,None]
    img=DAY*(1-dark)+NIGHT*dark
    g=np.exp(-(d/6.0)**2)[...,None]*0.75
    img=img*(1-g)+GLOW*g
    im=ax.imshow(np.clip(img,0,1),extent=(X0,X1,Y0,Y1),origin="lower",interpolation="bilinear",zorder=1)
    patch=PathPatch(upath,facecolor="none",edgecolor="#cfd6ea",lw=1.2,zorder=5); ax.add_patch(patch); im.set_clip_path(patch)
    ds=t-ss; on=ease(ds/12.0)
    col=np.zeros((len(ss),4)); col[:,:3]=np.array([1.0,0.86,0.45]); col[:,3]=0.08+0.8*on
    col[on<0.01,:3]=np.array([0.25,0.2,0.12])
    ax.scatter(lon,lat,s=0.8+1.0*on,c=col,lw=0,zorder=3)
    if T0+1<t<tL+3:
        cs=ax.contour(gx,gy,gss,levels=[t],colors=[ACC],linewidths=2.0,zorder=4)
        for c in cs.collections if hasattr(cs,"collections") else [cs]: c.set_clip_path(patch)
    for i in cidx:
        set_=t>=ss[i]
        ax.plot(lon[i],lat[i],"o",ms=4,color="#ffffff" if set_ else "#3a2f1a",mec="#000",mew=0.5,zorder=6)
        L=names[i] in ("Луганськ",)
        lbl=names[i]+(f" {fmt(ss[i],False)}" if set_ else "")
        ax.text(lon[i]+(-0.2 if L else 0.2),lat[i]+0.1,lbl,ha="right" if L else "left",fontsize=9.5,color=FG if set_ else "#2b2414",zorder=7,
                path_effects=[pe.withStroke(linewidth=2.2,foreground=BG if set_ else "#f3dfae")])
    def mark(i,a):
        ax.plot(lon[i],lat[i],"o",ms=16,mfc="none",mec=ACC,mew=2.5,alpha=a,zorder=8)
        ax.plot(lon[i],lat[i],"o",ms=6,color=ACC,alpha=a,zorder=8)
        right=lon[i]>30
        ax.text(lon[i]+(-0.1 if right else 0.1),lat[i]+(0.45 if lon[i]>30 else -0.75),names[i],ha="right" if right else "left",fontsize=15,color=ACC,
                fontweight="bold",alpha=a,zorder=9,path_effects=[pe.withStroke(linewidth=3,foreground=BG)])
    aF=min(1,(v-6.6)/0.6); aL=min(1,(v-27.6)/0.6)
    if v>=6.6: mark(iF,aF)
    if v>=27.6: mark(iL,aL)
    if v>=31:
        ax.plot([lon[iF],lon[iL]],[lat[iF],lat[iL]],"--",color=ACC,lw=1.6,alpha=min(1,(v-31)),zorder=7)
    if v<3.5:
        a=1 if v<2.5 else 1-(v-2.5)
        ax.text(31.2,48.4,"Сонце сідає\nзі сходу на захід",fontsize=30,color="#1d160a",ha="center",va="center",fontweight="bold",alpha=a,zorder=10)
    n=int((ss<=t).sum()); N=len(ss)
    T(0.06,0.375,"Сонце вже сіло:",fontsize=18,color=DIM)
    T(0.06,0.348,f"{n:,} з {N:,} населених пунктів".replace(","," "),fontsize=22,color=FG)
    fig.patches.append(plt.Rectangle((0.06,0.33),0.88,0.008,color="#1c2547",transform=fig.transFigure,figure=fig))
    fig.patches.append(plt.Rectangle((0.06,0.33),0.88*n/N,0.008,color=ACC,transform=fig.transFigure,figure=fig))
    def card(y,a,title,i):
        fig.patches.append(plt.Rectangle((0.06,y),0.88,0.075,transform=fig.transFigure,figure=fig,fc="#0d1430",ec=ACC,lw=1.5,alpha=a))
        T(0.09,y+0.052,title,fontsize=17,color=DIM,alpha=a)
        T(0.09,y+0.017,names[i],fontsize=27,color=FG,fontweight="bold",alpha=a)
        T(0.91,y+0.017,fmt(ss[i]),fontsize=27,color=ACC,fontweight="bold",ha="right",alpha=a)
    if v>=6.6: card(0.235,aF,"Сонце сідає найраніше · Луганщина",iF)
    if v>=27.6: card(0.145,aL,"Сонце сідає найпізніше · Закарпаття",iL)
    if v>=31:
        a=min(1,(v-31)/1)
        h=int(DIFF//60); mi=int(DIFF%60); s=int(round((DIFF*60)%60))
        T(0.5,0.115,"Різниця",fontsize=20,color=DIM,alpha=a,ha="center")
        T(0.5,0.05,f"{h} год {mi} хв {s} с",fontsize=50,color=ACC,fontweight="bold",alpha=a,ha="center")
        T(0.5,0.022,f"≈ {KM:.0f} км по прямій · {lon[iF]-lon[iL]:.1f}° довготи",fontsize=16,color=DIM,alpha=a,ha="center")
    fig.savefig(f"{S}/frames/f{k:05d}.png",facecolor=BG); plt.close(fig)

if __name__=="__main__":
    os.makedirs(S+"/frames",exist_ok=True)
    print("first",names[iF],lat[iF],lon[iF],fmt(tF)," last",names[iL],lat[iL],lon[iL],fmt(tL)," diff",DIFF,"km",KM)
    ks=[int(a) for a in sys.argv[2:]] or range(int(DUR*FPS))
    with Pool(os.cpu_count()) as p: p.map(frame,ks,chunksize=4)
