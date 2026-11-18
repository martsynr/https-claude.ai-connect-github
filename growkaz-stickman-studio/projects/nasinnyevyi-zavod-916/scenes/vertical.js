// vertical.js — the 9:16 cut of "Насіннєвий завод". Loads the 16:9 project's shots while the stage is temporarily
// landscape, then wraps every 2D shot: the landscape frame is drawn off-screen and placed into a vertical layout
// (blurred backdrop, logo + title + machine counter on top, the picture in the middle, captions below).
import { E, S, registerShot, getShot, text, FONTS, alpha, circle, ring, glow, linGrad, ease, prog, clamp } from '/engine/core.js';

const SRC = '/projects/nasinnyevyi-zavod/scenes';
const LAND = { W: 1920, H: 1080, vertical: false };
function swap(to) { const old = { W: E.W, H: E.H, vertical: E.vertical }; Object.assign(E, to); return old; }

const saved = swap(LAND);
try { for (const f of ['01_harvest', '02_cleaning', '03_protect', '04_control']) await import(`${SRC}/shots/${f}.js`); }
finally { Object.assign(E, saved); }
const { logo } = await import(`${SRC}/sets/brand.js`);

// per-shot crop of the landscape frame: cw = width taken (1080..1920), cx = horizontal offset of its centre
const FULL = 1920, CROP = {
  s03: { cw: FULL }, s13: { cw: FULL }, s16: { cw: FULL }, s04: { cw: 1700, cx: -60 }, s08: { cw: FULL }, s09: { cw: 1600, cx: -80 }, s20: { cw: FULL }, s23: { cw: FULL }, s26: { cw: FULL }, s27: { cw: FULL },
  s29: { cw: FULL }, s31: { cw: FULL }, s32: { cw: FULL }, s33: { cw: FULL }, s34: { cw: FULL }, s36: { cw: 1700 }, s37: { cw: 1700 }, s38: { cw: 1700 }, s44: { cw: FULL },
  s46: { cw: 1700 }, s48: { cw: FULL }, s50: { cw: FULL }, s51: { cw: FULL }, s53: { cw: FULL }, s55: { cw: FULL }, s56: { cw: 1700 }, s59: { cw: FULL }, s60: { cw: 1700 },
  s61: { cw: FULL }, s62: { cw: 1600 }, s64: { cw: 1600 }, s65: { cw: 1700 }, s66: { cw: 1700 }, s68: { cw: 1700 }, s69: { cw: FULL }, s52: { cw: 1700 }, s47: { cw: 1700 }, s58: { cw: 1600 },
};
const DROPS = ['s06', 's09', 's14', 's21', 's24', 's30', 's35', 's42', 's49', 's54'];

let off = null, small = null;
function canvases() {
  const w = Math.round(LAND.W * E.PX), h = Math.round(LAND.H * E.PX);
  if (!off || off.width !== w || off.height !== h) { off = document.createElement('canvas'); off.width = w; off.height = h; }
  if (!small) { small = document.createElement('canvas'); small.width = 64; small.height = 36; }
}

function header(g, info) {
  const gt = info.globalT, built = DROPS.filter(id => { const s = E.shots.find(x => x.id === id); return s && gt >= s.start + 0.9; }).length, gold = S().ui.gold;
  logo(g, E.W / 2, 150, 150);
  text(g, 'НАСІННЄВИЙ ЗАВОД', E.W / 2, 290, { size: 56, color: S().ui.cream, glow: 18, glowColor: 'rgba(255,140,60,.5)', spacing: 3 });
  for (let i = 0; i < 10; i++) { const x = E.W / 2 + (i - 4.5) * 72, y = 370, on = i < built;
    circle(g, x, y, 22, on ? gold : alpha(S().ui.cream, 0.12)); if (on) glow(g, x, y, 50, gold, 0.25); else ring(g, x, y, 22, 2, alpha(S().ui.cream, 0.3));
    text(g, String(i + 1), x, y + 2, { size: 24, color: on ? '#1a1408' : alpha(S().ui.cream, 0.5), font: FONTS.ui, weight: 900 }); }
}

function wrap(id, def) {
  registerShot(id, { draw(g, t, info) {
    canvases();
    const og = off.getContext('2d'); og.setTransform(1, 0, 0, 1, 0, 0); og.globalAlpha = 1; og.globalCompositeOperation = 'source-over'; og.filter = 'none';
    og.fillStyle = '#000'; og.fillRect(0, 0, off.width, off.height); og.setTransform(E.PX, 0, 0, E.PX, 0, 0);
    const old = swap(LAND); try { def.draw(og, t, info); } finally { Object.assign(E, old); }
    // blurred backdrop (cover), darkened
    const sg = small.getContext('2d'); sg.drawImage(off, 0, 0, small.width, small.height);
    g.save(); g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high'; const bw = E.H * 16 / 9; g.drawImage(small, (E.W - bw) / 2, 0, bw, E.H);
    g.fillStyle = 'rgba(4,8,6,.55)'; g.fillRect(0, 0, E.W, E.H); g.restore();
    // the picture
    const c = CROP[id] || {}, cw = c.cw ?? 1440, cx = c.cx ?? 0, k = E.W / cw, ph = LAND.H * k, y0 = 820 - ph / 2;
    const sx = (LAND.W / 2 + cx - cw / 2) * E.PX;
    g.save(); g.drawImage(off, sx, 0, cw * E.PX, LAND.H * E.PX, 0, y0, E.W, ph);
    g.fillStyle = linGrad(g, 0, y0, 0, y0 + 60, ['rgba(4,8,6,.6)', 'rgba(4,8,6,0)']); g.fillRect(0, y0, E.W, 60);
    g.fillStyle = linGrad(g, 0, y0 + ph - 60, 0, y0 + ph, ['rgba(4,8,6,0)', 'rgba(4,8,6,.6)']); g.fillRect(0, y0 + ph - 60, E.W, 60); g.restore();
    header(g, info);
  } });
}
for (const s of E.shots) { const def = getShot(s.id); if (def && def.kind !== '3d') wrap(s.id, def); }
