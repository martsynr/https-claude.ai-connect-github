"""Vertical 9:16 video: how sunrise and nightfall travel across Ukraine on one day."""
import sys, os, csv, json, math, numpy as np
S=sys.argv[1]; sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.path import Path
from matplotlib.patches import PathPatch
import matplotlib.patheffects as pe
from shapely.geometry import shape
from sun import sunset_utc_min, sunrise_utc_min
from multiprocessing import Pool

Y,M,D=2026,12,1; TZ=120; FPS=30
MONTH="грудня"
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
SR=sunrise_utc_min(lat,lon,Y,M,D)+TZ; SS=sunset_utc_min(lat,lon,Y,M,D)+TZ; DL=SS-SR
REGION={}  # oblast labels for extreme points (checked by coordinates)
def fmt(m,sec=True):
    s=int(round(m*60)); h,s=divmod(s,3600); mi,s=divmod(s,60)
    return f"{h:02d}:{mi:02d}:{s:02d}" if sec else f"{h:02d}:{mi:02d}"
def hms(m):
    s=int(round(m*60)); h,s=divmod(s,3600); mi,s=divmod(s,60); return f"{h} год {mi} хв {s} с"
cities=["Харків","Луганськ","Донецьк","Дніпро","Запоріжжя","Сімферополь","Київ","Одеса","Вінниця","Житомир","Львів","Ужгород","Чернігів","Суми","Полтава","Херсон","Луцьк","Чернівці"]
cidx=[max([i for i,n in enumerate(names) if n==c],key=lambda i:r1[i]) for c in cities if c in names]
X0,X1,Y0,Y1=21.9,40.5,44.2,52.5
nx,ny=1400,900
gx,gy=np.meshgrid(np.linspace(X0,X1,nx),np.linspace(Y0,Y1,ny))
GSR=(sunrise_utc_min(gy.ravel(),gx.ravel(),Y,M,D)+TZ).reshape(ny,nx)
GSS=(sunset_utc_min(gy.ravel(),gx.ravel(),Y,M,D)+TZ).reshape(ny,nx)
DAY=np.array([0.95,0.80,0.50]); NIGHT=np.array([0.05,0.08,0.20])
GLOW_SET=np.array([1.0,0.42,0.18]); GLOW_RISE=np.array([1.0,0.55,0.55])
BG="#070b18"; FG="#e9ecf5"; ACC="#ffb347"; ROSE="#ff8f8f"; DIM="#8a93ad"
def ease(x): x=np.clip(x,0,1); return x*x*(3-2*x)

def part(kind):
    ev=SR if kind=="rise" else SS
    iF=int(np.argmin(ev)); iL=int(np.argmax(ev)); tF,tL=ev[iF],ev[iL]
    keys=[(0,tF-16),(3,tF-16),(7,tF),(10,tF),(26,tL),(29,tL),(31,tL+10),(36,tL+10)]
    return dict(kind=kind,ev=ev,grid=GSR if kind=="rise" else GSS,iF=iF,iL=iL,tF=tF,tL=tL,keys=keys,dur=36)
A=part("rise"); B=part("set")
REG={"rise":("Луганщина","Волинь"),"set":("Луганщина","Закарпаття")}
iShort=int(np.argmin(DL)); iLong=int(np.argmax(DL))
FINAL=8
DUR=A["dur"]+B["dur"]+FINAL
def sim(P,v):
    for (a,sa),(b,sb) in zip(P["keys"],P["keys"][1:]):
        if v<=b:
            u=(v-a)/(b-a) if b>a else 1
            if sa!=sb: u=u*u*(3-2*u)
            return sa+(sb-sa)*u
    return P["keys"][-1][1]

def draw_map(fig,P,t,v):
    rise=P["kind"]=="rise"; ev=P["ev"]; grid=P["grid"]; col_acc=ROSE if rise else ACC
    ax=fig.add_axes([0.01,0.39,0.98,0.42]); ax.set_facecolor(BG)
    ax.set_xlim(X0,X1); ax.set_ylim(Y0,Y1); ax.set_aspect(1/math.cos(math.radians(48.5))); ax.axis("off")
    d=t-grid
    dark=ease((-d if rise else d)/38.0)[...,None]
    img=DAY*(1-dark)+NIGHT*dark
    g=np.exp(-(d/6.0)**2)[...,None]*0.75
    img=img*(1-g)+(GLOW_RISE if rise else GLOW_SET)*g
    im=ax.imshow(np.clip(img,0,1),extent=(X0,X1,Y0,Y1),origin="lower",interpolation="bilinear",zorder=1)
    patch=PathPatch(upath,facecolor="none",edgecolor="#cfd6ea",lw=1.2,zorder=5); ax.add_patch(patch); im.set_clip_path(patch)
    ds=t-ev; on=ease((-ds if rise else ds)/12.0)
    col=np.zeros((len(ev),4)); col[:,:3]=np.array([1.0,0.86,0.45]); col[:,3]=0.08+0.8*on
    col[on<0.01,:3]=np.array([0.25,0.2,0.12])
    ax.scatter(lon,lat,s=0.8+1.0*on,c=col,lw=0,zorder=3)
    if P["tF"]-15<t<P["tL"]+3:
        cs=ax.contour(gx,gy,grid,levels=[t],colors=[col_acc],linewidths=2.0,zorder=4)
        for c in cs.collections if hasattr(cs,"collections") else [cs]: c.set_clip_path(patch)
    for i in cidx:
        passed=t>=ev[i]; daylike=passed if rise else not passed
        L=names[i]=="Луганськ"
        lbl=names[i]+(f" {fmt(ev[i],False)}" if passed else "")
        ax.plot(lon[i],lat[i],"o",ms=4,color="#3a2f1a" if daylike else "#ffffff",mec="#000",mew=0.5,zorder=6)
        ax.text(lon[i]+(-0.2 if L else 0.2),lat[i]+0.1,lbl,ha="right" if L else "left",fontsize=9.5,
                color="#2b2414" if daylike else FG,zorder=7,
                path_effects=[pe.withStroke(linewidth=2.2,foreground="#f3dfae" if daylike else BG)])
    def mark(i,a):
        ax.plot(lon[i],lat[i],"o",ms=16,mfc="none",mec=col_acc,mew=2.5,alpha=a,zorder=8)
        ax.plot(lon[i],lat[i],"o",ms=6,color=col_acc,alpha=a,zorder=8)
        east=lon[i]>30
        ax.text(lon[i]+(-0.1 if east else 0.1),lat[i]+(-0.75 if (east and rise) else 0.45 if east else (0.4 if rise else -0.75)),
                names[i],ha="right" if east else "left",fontsize=15,color=col_acc,fontweight="bold",alpha=a,zorder=9,
                path_effects=[pe.withStroke(linewidth=3,foreground=BG)])
    if v>=6.6: mark(P["iF"],min(1,(v-6.6)/0.6))
    if v>=25.6: mark(P["iL"],min(1,(v-25.6)/0.6))
    if v>=29: ax.plot([lon[P["iF"]],lon[P["iL"]]],[lat[P["iF"]],lat[P["iL"]]],"--",color=col_acc,lw=1.6,alpha=min(1,v-29),zorder=7)
    if v<3.5:
        a=1 if v<2.5 else 1-(v-2.5)
        txt="Світанок приходить\nзі сходу" if rise else "Ніч приходить\nзі сходу"
        ax.text(31.2,48.4,txt,fontsize=30,color=FG if rise else "#1d160a",ha="center",va="center",fontweight="bold",alpha=a,zorder=10,
                path_effects=[pe.withStroke(linewidth=4,foreground=BG)] if rise else None)

def card(fig,y,a,title,name,val,col,h=0.075,big=27):
    fig.patches.append(plt.Rectangle((0.06,y),0.88,h,transform=fig.transFigure,figure=fig,fc="#0d1430",ec=col,lw=1.5,alpha=a))
    fig.text(0.09,y+h-0.023,title,fontsize=17,color=DIM,alpha=a)
    fig.text(0.09,y+0.017,name,fontsize=big,color=FG,fontweight="bold",alpha=a)
    fig.text(0.91,y+0.017,val,fontsize=big,color=col,fontweight="bold",ha="right",alpha=a)

def frame(k):
    v=k/FPS
    fig=plt.figure(figsize=(10.8,19.2),dpi=100,facecolor=BG); T=fig.text
    if v<A["dur"]+B["dur"]:
        P,vv=(A,v) if v<A["dur"] else (B,v-A["dur"])
        rise=P["kind"]=="rise"; col=ROSE if rise else ACC; t=sim(P,vv)
        # fade between parts
        T(0.5,0.955,"Як Україна зустрічає світанок" if rise else "Як ніч приходить в Україну",fontsize=34,color=FG,fontweight="bold",ha="center",va="top")
        T(0.5,0.915,f"{D} {MONTH} {Y} · київський час",fontsize=18,color=DIM,ha="center",va="top")
        T(0.5,0.885,fmt(t),fontsize=84,color=col,fontweight="bold",ha="center",va="top",family="DejaVu Sans Mono")
        draw_map(fig,P,t,vv)
        ev=P["ev"]; n=int((ev<=t).sum()); N=len(ev)
        T(0.06,0.375,"Сонце вже зійшло:" if rise else "Сонце вже сіло:",fontsize=18,color=DIM)
        T(0.06,0.348,f"{n:,} з {N:,} населених пунктів".replace(","," "),fontsize=22,color=FG)
        fig.patches.append(plt.Rectangle((0.06,0.33),0.88,0.008,color="#1c2547",transform=fig.transFigure,figure=fig))
        fig.patches.append(plt.Rectangle((0.06,0.33),0.88*n/N,0.008,color=col,transform=fig.transFigure,figure=fig))
        r1n,r2n=REG[P["kind"]]; w="сходить" if rise else "сідає"
        if vv>=6.6: card(fig,0.235,min(1,(vv-6.6)/0.6),f"Сонце {w} найраніше · {r1n}",names[P["iF"]],fmt(P["tF"]),col)
        if vv>=25.6: card(fig,0.145,min(1,(vv-25.6)/0.6),f"Сонце {w} найпізніше · {r2n}",names[P["iL"]],fmt(P["tL"]),col)
        if vv>=29:
            a=min(1,(vv-29)/1)
            T(0.5,0.115,"Різниця",fontsize=20,color=DIM,alpha=a,ha="center")
            T(0.5,0.05,hms(P["tL"]-P["tF"]),fontsize=50,color=col,fontweight="bold",alpha=a,ha="center")
        # cross-fade to black at part edges
        edge=min(vv,P["dur"]-vv)
        if edge<0.5: fig.patches.append(plt.Rectangle((0,0),1,1,transform=fig.transFigure,figure=fig,color=BG,alpha=1-edge/0.5,zorder=100))
    else:
        vv=v-A["dur"]-B["dur"]
        def a_(s): return float(np.clip((vv-s)/0.6,0,1))
        T(0.5,0.94,"Один день України",fontsize=40,color=FG,fontweight="bold",ha="center",va="top",alpha=a_(0))
        T(0.5,0.895,f"{D} {MONTH} {Y}",fontsize=20,color=DIM,ha="center",va="top",alpha=a_(0))
        card(fig,0.73,a_(0.4),"Світанок іде країною","від сходу до заходу",hms(A["tL"]-A["tF"]).replace(" с",""),ROSE,h=0.085,big=24)
        T(0.09,0.715,f"{names[A['iF']]} {fmt(A['tF'],False)}  →  {names[A['iL']]} {fmt(A['tL'],False)}",fontsize=16,color=DIM,alpha=a_(0.4))
        card(fig,0.58,a_(1.2),"Ніч іде країною","від сходу до заходу",hms(B["tL"]-B["tF"]).replace(" с",""),ACC,h=0.085,big=24)
        T(0.09,0.565,f"{names[B['iF']]} {fmt(B['tF'],False)}  →  {names[B['iL']]} {fmt(B['tL'],False)}",fontsize=16,color=DIM,alpha=a_(1.2))
        card(fig,0.40,a_(2.0),"Найкоротший день · Чернігівщина",names[iShort],hms(DL[iShort]).replace(" с",""),"#9fb4ff",h=0.085,big=24)
        card(fig,0.29,a_(2.6),"Найдовший день · Крим",names[iLong],hms(DL[iLong]).replace(" с",""),"#9fb4ff",h=0.085,big=24)
        T(0.5,0.20,f"Різниця у тривалості дня:\n{hms(DL[iLong]-DL[iShort])}",fontsize=26,color=FG,ha="center",va="top",alpha=a_(3.4),linespacing=1.5)
        T(0.5,0.06,"Одна країна. Один час на годиннику.\nАле сонце в кожного своє.",fontsize=22,color=DIM,ha="center",alpha=a_(4.4),linespacing=1.5)
    fig.savefig(f"{S}/frames2/f{k:05d}.png",facecolor=BG); plt.close(fig)

if __name__=="__main__":
    os.makedirs(S+"/frames2",exist_ok=True)
    for P in (A,B): print(P["kind"],names[P["iF"]],fmt(P["tF"]),names[P["iL"]],fmt(P["tL"]),hms(P["tL"]-P["tF"]))
    print("short",names[iShort],hms(DL[iShort]),"long",names[iLong],hms(DL[iLong]))
    ks=[int(a) for a in sys.argv[2:]] or range(int(DUR*FPS))
    with Pool(os.cpu_count()) as p: p.map(frame,ks,chunksize=4)
