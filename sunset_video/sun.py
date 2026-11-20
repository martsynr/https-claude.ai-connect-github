import numpy as np, math
def sunset_utc_min(lat, lon, y, m, d, h0=-0.833):
    """NOAA algorithm, returns sunset in minutes UTC (vectorised, iterated)."""
    lat=np.asarray(lat,float); lon=np.asarray(lon,float)
    a=(14-m)//12; yy=y+4800-a; mm=m+12*a-3
    jdn=d+(153*mm+2)//5+365*yy+yy//4-yy//100+yy//400-32045
    t_utc=np.full(lat.shape, 15*60.0)
    for _ in range(4):
        jd=jdn-0.5+t_utc/1440.0
        T=(jd-2451545.0)/36525
        L0=(280.46646+T*(36000.76983+0.0003032*T))%360
        M=357.52911+T*(35999.05029-0.0001537*T)
        e=0.016708634-T*(0.000042037+0.0000001267*T)
        Mr=np.radians(M)
        C=np.sin(Mr)*(1.914602-T*(0.004817+0.000014*T))+np.sin(2*Mr)*(0.019993-0.000101*T)+np.sin(3*Mr)*0.000289
        tl=L0+C; om=125.04-1934.136*T
        lam=tl-0.00569-0.00478*np.sin(np.radians(om))
        eps0=23+(26+(21.448-T*(46.815+T*(0.00059-T*0.001813)))/60)/60
        eps=eps0+0.00256*np.cos(np.radians(om))
        dec=np.degrees(np.arcsin(np.sin(np.radians(eps))*np.sin(np.radians(lam))))
        yv=np.tan(np.radians(eps/2))**2
        L0r=np.radians(L0)
        eqt=4*np.degrees(yv*np.sin(2*L0r)-2*e*np.sin(Mr)+4*e*yv*np.sin(Mr)*np.cos(2*L0r)-0.5*yv*yv*np.sin(4*L0r)-1.25*e*e*np.sin(2*Mr))
        cosH=(np.sin(np.radians(h0))-np.sin(np.radians(lat))*np.sin(np.radians(dec)))/(np.cos(np.radians(lat))*np.cos(np.radians(dec)))
        H=np.degrees(np.arccos(cosH))
        t_utc=720-4*(lon-H)-eqt
    return t_utc
