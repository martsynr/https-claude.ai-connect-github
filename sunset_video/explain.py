"""Explanation segment: why the sunrise and sunset lines cross Ukraine at different angles."""
import math, numpy as np, json
import matplotlib.pyplot as plt
import matplotlib.patheffects as pe
from shapely.geometry import shape

BG="#070b18"; FG="#e9ecf5"; ACC="#ffb347"; ROSE="#ff8f8f"; DIM="#8a93ad"
XDUR=40.0
_S=None; LAND=UA=None; UA_RINGS=None
def init(S):
    global _S,LAND,UA,UA_RINGS
    _S=S; m=np.load(S+"/data/masks.npz"); LAND,UA=m["land"],m["ua"]
    g=shape(json.load(open(S+"/data/ua.json")))
    UA_RINGS=[np.array(p.exterior.coords) for p in (g.geoms if g.geom_type=="MultiPolygon" else [g]) if p.area>0.05]
RES=0.2
def ease(x): x=np.clip(x,0,1); return x*x*(3-2*x)

def solar(utc_min, y=2026, m=12, d=1):
    a=(14-m)//12; yy=y+4800-a; mm=m+12*a-3
    jd=d+(153*mm+2)//5+365*yy+yy//4-yy//100+yy//400-32045-0.5+utc_min/1440
    T=(jd-2451545.0)/36525
    L0=(280.46646+T*36000.76983)%360; M=math.radians(357.52911+T*35999.05029); e=0.016708634
    C=math.sin(M)*1.914602+math.sin(2*M)*0.019993
    om=math.radians(125.04-1934.136*T); lam=math.radians(L0+C-0.00569-0.00478*math.sin(om))
    eps=math.radians(23.439291-0.0130042*T+0.00256*math.cos(om))
    dec=math.asin(math.sin(eps)*math.sin(lam)); yv=math.tan(eps/2)**2; L=math.radians(L0)
    eqt=4*math.degrees(yv*math.sin(2*L)-2*e*math.sin(M)+4*e*yv*math.sin(M)*math.cos(2*L))
    lon_s=-(utc_min-720+eqt)/4
    return math.degrees(dec), lon_s
def svec(dec,lon):
    d,l=math.radians(dec),math.radians(lon); return np.array([math.cos(d)*math.cos(l),math.cos(d)*math.sin(l),math.sin(d)])
def ll2v(lat,lon):
    la,lo=np.radians(lat),np.radians(lon); return np.stack([np.cos(la)*np.cos(lo),np.cos(la)*np.sin(lo),np.sin(la)],-1)

LAND_D=np.array([0.42,0.62,0.36]); OCEAN_D=np.array([0.16,0.38,0.66]); UA_D=np.array([0.98,0.82,0.30])
LAND_N=np.array([0.07,0.09,0.13]); OCEAN_N=np.array([0.03,0.05,0.12]); UA_N=np.array([0.30,0.26,0.16])
TWI=np.array([1.0,0.50,0.35])
def surface(lat,lon,s):
    """colour for lat/lon arrays lit by sun vector s"""
    iy=np.clip(((lat+90)/RES).astype(int),0,LAND.shape[0]-1); ix=np.clip(((lon+180)%360/RES).astype(int),0,LAND.shape[1]-1)
    land=LAND[iy,ix][...,None]; ua=UA[iy,ix][...,None]
    day=np.where(ua,UA_D,np.where(land,LAND_D,OCEAN_D)); night=np.where(ua,UA_N,np.where(land,LAND_N,OCEAN_N))
    h=np.degrees(np.arcsin(np.clip((ll2v(lat,lon)*s).sum(-1),-1,1)))
    f=ease((h+6)/7)[...,None]
    c=night*(1-f)+day*f
    tw=np.exp(-((h+2)/2.5)**2)[...,None]*0.45
    return c*(1-tw)+TWI*tw

def basis(lat0,lon0):
    c=ll2v(lat0,lon0); lo=math.radians(lon0); la=math.radians(lat0)
    e=np.array([-math.sin(lo),math.cos(lo),0]); n=np.array([-math.sin(la)*math.cos(lo),-math.sin(la)*math.sin(lo),math.cos(la)])
    return c,e,n
def proj(v,B):
    c,e,n=B; return v@e, v@n, v@c

def globe(ax,utc,lat0,dlon,zoom,cx=0,cy=0):
    dec,ls=solar(utc); s=svec(dec,ls); lon0=ls+dlon; B=basis(lat0,lon0); c,e,n=B
    N=760; r=1/zoom
    xs=np.linspace(cx-r,cx+r,N); X,Yy=np.meshgrid(xs,np.linspace(cy-r,cy+r,N))
    rr=X**2+Yy**2; inside=rr<1; Z=np.sqrt(np.clip(1-rr,0,1))
    P=Z[...,None]*c+X[...,None]*e+Yy[...,None]*n
    lat=np.degrees(np.arcsin(np.clip(P[...,2],-1,1))); lon=np.degrees(np.arctan2(P[...,1],P[...,0]))
    img=surface(lat,lon,s); limb=(0.55+0.45*Z)[...,None]; img=img*limb
    rgba=np.zeros((N,N,4)); rgba[...,:3]=np.clip(img,0,1); rgba[...,3]=inside
    ax.set_xlim(cx-r,cx+r); ax.set_ylim(cy-r,cy+r); ax.set_aspect(1); ax.axis("off")
    ax.add_patch(plt.Circle((0,0),1.04,color="#3b6fd8",alpha=0.18,zorder=0)); ax.add_patch(plt.Circle((0,0),1.015,color="#6d9cff",alpha=0.25,zorder=0))
    ax.imshow(rgba,extent=(cx-r,cx+r,cy-r,cy+r),origin="lower",interpolation="bilinear",zorder=1)
    def line(v,**kw):
        x,y,z=proj(v,B); x=np.where(z>0,x,np.nan); ax.plot(x,np.where(z>0,y,np.nan),**kw)
    for L in range(-180,180,15): line(ll2v(np.linspace(-90,90,181),np.full(181,L)),color="w",lw=0.4,alpha=0.18,zorder=2)
    for P_ in range(-75,90,15): line(ll2v(np.full(361,P_),np.linspace(-180,180,361)),color="w",lw=0.4,alpha=0.18,zorder=2)
    line(ll2v(np.full(361,66.56),np.linspace(-180,180,361)),color="#9fb4ff",lw=1,ls="--",alpha=0.7,zorder=2)
    for ring in UA_RINGS: line(ll2v(ring[:,1],ring[:,0]),color="w",lw=1.6,zorder=4)
    # terminator, split into morning (rose) / evening (orange)
    a=np.cross(s,[0,0,1.0]); a/=np.linalg.norm(a); b=np.cross(s,a)
    t=np.linspace(0,2*np.pi,1441); TP=np.cos(t)[:,None]*a+np.sin(t)[:,None]*b
    morning=(TP[:,0]*s[1]-TP[:,1]*s[0])>0
    x,y,z=proj(TP,B)
    for msk,col in ((morning,ROSE),(~morning,ACC)):
        ok=msk&(z>0); ax.plot(np.where(ok,x,np.nan),np.where(ok,y,np.nan),color=col,lw=3.2,zorder=5,solid_capstyle="round")
    # north pole + axis
    x,y,z=proj(np.array([0,0,1.0]),B)
    ax.plot([x,x*1.25],[y,y*1.25],color="w",lw=2,zorder=6,clip_on=True)
    
    if z>0: ax.plot(x,y,"o",color="w",ms=5,zorder=6)
    ax.text(x*1.27,y*1.27,"Північний полюс",color=FG,fontsize=16,ha="center",va="bottom",zorder=7,clip_on=True,path_effects=[pe.withStroke(linewidth=3,foreground=BG)])
    return s,B

def caption(fig,title,body,a,col):
    fig.text(0.5,0.955,title,fontsize=36,color=FG,fontweight="bold",ha="center",va="top",alpha=a)
    fig.text(0.07,0.27,body,fontsize=25,color=FG,ha="left",va="top",alpha=a,linespacing=1.45,wrap=True)
    fig.patches.append(plt.Rectangle((0.05,0.275),0.006,-0.0001,transform=fig.transFigure,figure=fig))

def legend(fig,y,a):
    fig.lines.append(plt.Line2D([0.07,0.13],[y,y],color=ROSE,lw=4,transform=fig.transFigure,alpha=a))
    fig.text(0.15,y,"лінія світанку",fontsize=20,color=FG,va="center",alpha=a)
    fig.lines.append(plt.Line2D([0.52,0.58],[y,y],color=ACC,lw=4,transform=fig.transFigure,alpha=a))
    fig.text(0.60,y,"лінія заходу",fontsize=20,color=FG,va="center",alpha=a)

def explain_frame(fig,v,ctx):
    """v: seconds since explanation start; ctx: dict with Kyiv sunrise/sunset Kyiv-time minutes etc."""
    def fade(a,b): return float(min(1,(v-a)/0.6,(b-v)/0.6)) if a<=v<=b else 0.0
    if v<4:
        a=fade(0,4)
        fig.text(0.5,0.6,"Чому світанок і ніч\nідуть Україною\nрізними лініями?",fontsize=46,color=FG,fontweight="bold",ha="center",va="center",alpha=a,linespacing=1.3)
        fig.text(0.5,0.42,"Подивімося на всю планету",fontsize=26,color=DIM,ha="center",alpha=a)
        return
    if v<23:
        morning=v<14; a=fade(4,14) if morning else fade(14,23)
        u=(v-4)/10 if morning else (v-14)/9
        kyiv=ctx["sr_utc"] if morning else ctx["ss_utc"]
        utc=kyiv-110+220*u
        zoom=1.0+0.8*ease((u-0.12)/0.35)
        ax=fig.add_axes([0.0,0.32,1.0,0.56]); ax.set_facecolor(BG)
        cy=0.32*ease((u-0.12)/0.35)
        globe(ax,utc,22,-90 if morning else 90,zoom,0,cy)
        ax.text(0.97 if morning else 0.03,0.04,("Сонце →" if morning else "← Сонце"),transform=ax.transAxes,ha="right" if morning else "left",color="#ffd27a",fontsize=22,fontweight="bold")
        ax.text(0.5,0.95,f"Київ {ctx['fmt']((utc+120)%1440)}",transform=ax.transAxes,ha="center",color=FG,fontsize=20,path_effects=[pe.withStroke(linewidth=3,foreground=BG)])
        if morning:
            caption(fig,"Ранок: погляд з космосу",
              "Земна вісь нахилена на 23,4°. 1 грудня\nпівніч відвернута від Сонця — за полярним\nколом ніч триває цілодобово.\n\nТому межа світла нахилена: на півдні\nУкраїни сонце сходить раніше, ніж на півночі.",a,ROSE)
        else:
            caption(fig,"Вечір: інший бік Землі",
              "Обертаючись, Україна виходить до\nпротилежного краю тієї самої межі.\n\nВін нахилений дзеркально: тепер\nпівніч першою поринає в темряву.",a,ACC)
        legend(fig,0.05,a); fig.patches.append(plt.Rectangle((0,0),1,1,transform=fig.transFigure,figure=fig,color=BG,alpha=1-a,zorder=100)); return
    if v<32:
        a=fade(23,32); u=(v-23)/9
        utc=60+16*60*u
        dec,ls=solar(utc); s=svec(dec,ls)
        ax=fig.add_axes([0.02,0.42,0.96,0.42]); ax.axis("off")
        lon=np.linspace(-180,180,1080); lat=np.linspace(-62,85,440); LO,LA=np.meshgrid(lon,lat)
        ax.imshow(np.clip(surface(LA,LO,s),0,1),extent=(-180,180,-62,85),origin="lower",aspect="auto",interpolation="bilinear")
        av=np.cross(s,[0,0,1.0]); av/=np.linalg.norm(av); bv=np.cross(s,av)
        t=np.linspace(0,2*np.pi,4000); TP=np.cos(t)[:,None]*av+np.sin(t)[:,None]*bv
        tl=np.degrees(np.arcsin(TP[:,2])); tn=np.degrees(np.arctan2(TP[:,1],TP[:,0])); mo=(TP[:,0]*s[1]-TP[:,1]*s[0])>0
        ax.scatter(tn[mo],tl[mo],s=3,color=ROSE,zorder=3); ax.scatter(tn[~mo],tl[~mo],s=3,color=ACC,zorder=3)
        ax.add_patch(plt.Rectangle((21.5,44),19,8.6,fill=False,ec="w",lw=1.8,zorder=4))
        ax.text(31,54,"Україна",color=FG,fontsize=15,ha="center",va="bottom",zorder=5,path_effects=[pe.withStroke(linewidth=3,foreground=BG)])
        ax.axhline(66.56,color="#9fb4ff",lw=1,ls="--",alpha=0.7); ax.text(-178,68,"полярне коло",color="#c9d4ff",fontsize=13)
        ax.set_xlim(-180,180); ax.set_ylim(-62,85)
        fig.text(0.5,0.40,f"Київ {ctx['fmt']((utc+120)%1440)}",ha="center",color=DIM,fontsize=20)
        caption(fig,"Уся планета за один день",
          "Ніч на карті світу — це хвиля, що\nрухається на захід. Її східний край —\nсвітанок, західний — захід сонця.\n\nВзимку ці краї нахилені в різні боки.",a,FG)
        legend(fig,0.05,a); fig.patches.append(plt.Rectangle((0,0),1,1,transform=fig.transFigure,figure=fig,color=BG,alpha=1-a,zorder=100)); return
    # both lines over Ukraine through Kyiv
    a=fade(32,40.01)
    ax=fig.add_axes([0.01,0.40,0.98,0.45]); ax.set_facecolor(BG)
    X0,X1,Y0,Y1=ctx["ext"]; ax.set_xlim(X0,X1); ax.set_ylim(Y0,Y1); ax.set_aspect(1/math.cos(math.radians(48.5))); ax.axis("off")
    from matplotlib.patches import PathPatch
    patch=PathPatch(ctx["upath"],facecolor="#1a2448",edgecolor="#cfd6ea",lw=1.2,zorder=1); ax.add_patch(patch)
    gx,gy=ctx["gx"],ctx["gy"]
    l1=min(1,(v-32.6)/1.2); l2=min(1,(v-34.2)/1.2)
    if l1>0:
        cs=ax.contour(gx,gy,ctx["GSR"],levels=[ctx["kyiv_sr"]],colors=[ROSE],linewidths=4,alpha=l1,zorder=3); cs.set_clip_path(patch)
    if l2>0:
        cs=ax.contour(gx,gy,ctx["GSS"],levels=[ctx["kyiv_ss"]],colors=[ACC],linewidths=4,alpha=l2,zorder=3); cs.set_clip_path(patch)
    kx,ky=ctx["kyiv"]; ax.plot(kx,ky,"o",color="w",ms=9,zorder=5); ax.text(kx+0.3,ky+0.25,"Київ",color=FG,fontsize=18,fontweight="bold",zorder=6,path_effects=[pe.withStroke(linewidth=3,foreground=BG)])
    ax.plot([kx,kx],[Y0+0.5,Y1-0.3],ls=":",color="w",lw=1.2,alpha=0.6,zorder=2); ax.text(kx+0.1,Y1-0.5,"меридіан",color=DIM,fontsize=13)
    if l1>0: ax.text(ctx["sr_lbl"][0],ctx["sr_lbl"][1],f"світанок {ctx['fmt'](ctx['kyiv_sr'],False)}",color=ROSE,fontsize=17,fontweight="bold",alpha=l1,ha="center",path_effects=[pe.withStroke(linewidth=3,foreground=BG)])
    if l2>0: ax.text(ctx["ss_lbl"][0],ctx["ss_lbl"][1],f"захід {ctx['fmt'](ctx['kyiv_ss'],False)}",color=ACC,fontsize=17,fontweight="bold",alpha=l2,ha="center",path_effects=[pe.withStroke(linewidth=3,foreground=BG)])
    caption(fig,"Обидві лінії через Київ",
      f"Світанок іде з південного сходу на\nпівнічний захід, ніч — з північного сходу\nна південний захід. Кут між лініями ≈ {ctx['angle']:.0f}°.\n\nВлітку все навпаки: північ раніше\nбачить світанок і пізніше — захід.",a,FG)
    legend(fig,0.05,a)
    fig.patches.append(plt.Rectangle((0,0),1,1,transform=fig.transFigure,figure=fig,color=BG,alpha=1-a,zorder=100))
