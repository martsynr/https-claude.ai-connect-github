// shots/01 — s01–s12: the flat 70 years, the "mule corn" cross, the drought test.
import { E, V, S, registerShot, mood, layer, blurLayer, veil, ease, prog, clamp, lerp, key, wordTime, shake, seg, circle, ring, rr, poly, glow, alpha, shade, mix, text, rng, FONTS } from '/engine/core.js';
import { drawFigure, POSES, posesAt, breathe, walkPose, bigFace } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { field, drought, lab, pasture, cornPlant, cornEar, equine, GROUND } from '../sets/world.js';
import { yieldChart } from '../sets/charts.js';
import { FARMER, DOC } from '../cast.js';

const wt = (w, info, fb) => (wordTime(w, info.shot.start - 0.3) ?? info.shot.start + fb) - info.shot.start;
const pop = (t, at) => ease.outBack(prog(t, at, at + 0.35));
const big = (g, str, y, o = {}) => text(g, str, o.x ?? 0, y, { size: o.size || 120, color: o.color || S().ui.gold, glow: 30, glowColor: alpha(o.color || S().ui.gold, 0.7), spacing: 3, alpha: o.a ?? 1, font: o.font || FONTS.title, weight: o.weight || 700 });

// s01 — hook: years tick by, the field never changes
registerShot('s01', { draw(g, t, info) {
  const cam = { z: 1.02 + 0.08 * ease.inOut(t / info.dur), y: -10 * t };
  const { GY, M } = field(g, t, cam);
  layer(g, cam, 1, (g) => { for (let i = -3; i <= 3; i++) cornPlant(g, E.W / 2 + i * 150, GY + 40, 520, { t, seed: 900 + i, lit: M.rim }); });
  FX.dust(g, t, { count: 40, color: '#ffe2bd', a: 0.35 });
  veil(g, '#000', 0.25);
  const yr = Math.round(lerp(1865, 1935, ease.inOut(prog(t, 0.1, 2.6))));
  text(g, String(yr), E.W / 2, E.H * 0.13, { size: 92, color: S().ui.cream, font: FONTS.ui, weight: 900, glow: 16, glowColor: 'rgba(0,0,0,.6)' });
  const a1 = wt('років', info, 0.6), a2 = wt('ріс', info, 2.6);
  g.save(); g.translate(E.W / 2, E.H * 0.25); const s1 = pop(t, a1); g.scale(s1, s1); big(g, '70 РОКІВ', 0, { size: 128 }); g.restore();
  g.save(); g.translate(E.W / 2, E.H * 0.34); const s2 = pop(t, a2 - 0.1); g.scale(s2, s2); big(g, '0 ПРИРОСТУ', 0, { size: 96, color: S().ui.accent }); g.restore();
} });

// s02 — the farmer sows his own seed
registerShot('s02', { draw(g, t, info) {
  const cam = { z: 1.15, x: -40 + 30 * t, y: 40 };
  const { GY, M } = field(g, t, cam);
  const s = 1.7, x = E.W / 2 - 210 + 70 * t;
  layer(g, cam, 1, (g) => {
    const p = walkPose(t * Math.PI * 2 * 0.55);
    const throwK = (t * 0.55) % 1; const arm = throwK > 0.5 && throwK < 0.8;
    const pose = arm ? { ...p, hF: [52, -150], eF: [28, -160] } : p;
    drawFigure(g, { x, y: GY + 30, s, facing: 1, outfit: FARMER, pose, expr: 'neutral', rim: { color: M.rim, dir: [1, -0.4], w: 5 } });
    rr(g, x - 38 * s, GY + 30 - 140 * s, 34 * s, 48 * s, 10 * s); g.fillStyle = '#8a6a4a'; g.fill(); seg(g, [[x - 30 * s, GY + 30 - 138 * s], [x + 2, GY + 30 - 172 * s]], 4, '#5a4030');
    const r = rng(5);
    for (let i = 0; i < 40; i++) { const t0 = (i * 0.09) % 2.9, dt = t - t0; if (dt < 0 || dt > 0.9) continue; const sx = x - 200 + i * 9 + 70 * t0 + 30 * s, sy = GY + 30 - 150 * s; const vx = 120 + r() * 160, vy = -140 - r() * 80;
      circle(g, sx + vx * dt, sy + vy * dt + 0.5 * 900 * dt * dt, 4, '#f2d36a'); }
  });
  blurLayer(g, 10, (g) => { for (let i = 0; i < 3; i++) cornPlant(g, E.W * (0.1 + i * 0.42), E.H * 1.02, 900, { t, seed: 40 + i, tint: '#102010' }); }, cam, 1.7);
  FX.dust(g, t, { count: 35, color: '#ffe2bd', a: 0.3 });
} });

// s03 — flat yield line 1865–1930, readout 1,5 t/ha
registerShot('s03', { draw(g, t, info) {
  g.save(); const z = 1 + 0.04 * t; g.translate(E.W / 2, E.H / 2); g.scale(z, z); g.translate(-E.W / 2, -E.H / 2);
  UI.blueprint(g);
  const upTo = lerp(1865, 1930, ease.inOut(prog(t, 0.1, 1.6)));
  const ch = yieldChart(g, t, { upTo });
  g.restore();
  const at = wt('півтори', info, 1.6);
  UI.readout(g, { value: '1,5 т/га', x: E.W / 2, y: E.H * 0.67, align: 'center', size: 96, a: ease.out(prog(t, at, at + 0.3)) });
  text(g, 'ЩОРОКУ ТЕ САМЕ', E.W / 2, E.H * 0.73, { size: 40, color: S().ui.cream, font: FONTS.ui, weight: 900, spacing: 3, alpha: ease.out(prog(t, at + 0.4, at + 0.8)) });
} });

// s04 — the breeder studies an ear
registerShot('s04', { draw(g, t, info) {
  const cam = { z: 1.08 + 0.06 * ease.inOut(t / info.dur), x: -20 };
  const { GY, M } = lab(g, t, cam);
  layer(g, cam, 1, (g) => {
    const s = 1.75, x = E.W / 2 - 60;
    drawFigure(g, { x, y: GY + 20, s, facing: 1, outfit: DOC, pose: breathe(POSES.holdFront, t), expr: t > 1.2 ? 'smile' : 'thinking', look: [0.6, 0.3], rim: { color: M.rim, dir: [0, -1], w: 5 } });
    cornEar(g, x + 40 * s, GY + 20 - 158 * s, 110, { rot: -0.5, glowA: 0.25 });
    for (let i = 0; i < 2; i++) { const px = E.W / 2 + 240 + i * 130; rr(g, px - 34, GY - 74, 68, 56, 8); g.fillStyle = '#6a3a2a'; g.fill(); cornPlant(g, px, GY - 74, 190 + i * 30, { t, seed: 70 + i, ear: false, lit: M.rim }); }
  });
  blurLayer(g, 12, (g) => { g.fillStyle = 'rgba(30,50,30,.85)'; rr(g, -60, E.H * 0.72, 300, 700, 40); g.fill(); }, cam, 1.7);
  FX.dust(g, t, { count: 40 });
} });

// s05 — horse + donkey
registerShot('s05', { draw(g, t, info) {
  const cam = { z: 1.05 + 0.05 * t, x: 10 * t };
  const { GY, M } = pasture(g, t, cam);
  layer(g, cam, 1, (g) => {
    equine(g, E.W / 2 - 250, GY + 40, 1.25, { kind: 'horse', facing: 1, t, rim: M.rim });
    equine(g, E.W / 2 + 250, GY + 40, 1.1, { kind: 'donkey', facing: -1, t: t + 1, rim: M.rim });
  });
  const at = wt('конем', info, 1.2) - 0.1; const k = pop(t, at);
  g.save(); g.translate(E.W / 2, GY - 330); g.scale(k, k); glow(g, 0, 0, 160, S().ui.gold, 0.6); big(g, '+', 0, { size: 200 }); g.restore();
  text(g, 'КІНЬ', E.W / 2 - 260, GY + 140, { size: 50, color: S().ui.cream, font: FONTS.ui, weight: 900, spacing: 3, alpha: ease.out(prog(t, at - 0.3, at)) });
  text(g, 'ОСЕЛ', E.W / 2 + 260, GY + 140, { size: 50, color: S().ui.cream, font: FONTS.ui, weight: 900, spacing: 3, alpha: ease.out(prog(t, at + 0.2, at + 0.5)) });
  FX.dust(g, t, { count: 30, color: '#ffd9b0', a: 0.35 });
} });

// s06 — blueprint: two distant lines cross
function bpPlant(g, x, y, h, c, k = 1) {
  seg(g, [[x, y], [x, y - h * k]], 5, c);
  for (let i = 0; i < 4; i++) { const yy = y - h * (0.25 + i * 0.17) * k, sd = i % 2 ? 1 : -1; g.strokeStyle = c; g.lineWidth = 4; g.beginPath(); g.moveTo(x, yy); g.quadraticCurveTo(x + sd * h * 0.2, yy - h * 0.12, x + sd * h * 0.32 * k, yy + h * 0.02); g.stroke(); }
}
registerShot('s06', { draw(g, t, info) {
  UI.blueprint(g); const c = UI.bpStroke(), gold = S().ui.gold;
  const A = [E.W * 0.24, E.H * 0.36], B = [E.W * 0.76, E.H * 0.36], X = [E.W / 2, E.H * 0.55];
  bpPlant(g, A[0], A[1], 260, c); bpPlant(g, B[0], B[1], 230, c);
  text(g, 'ЛІНІЯ A', A[0], A[1] + 50, { size: 44, color: c, font: FONTS.ui, weight: 900, spacing: 2 });
  text(g, 'ЛІНІЯ B', B[0], B[1] + 50, { size: 44, color: c, font: FONTS.ui, weight: 900, spacing: 2 });
  const k = ease.inOut(prog(t, 0.1, 0.8));
  g.setLineDash([14, 12]);
  for (const P of [A, B]) seg(g, [[P[0], P[1] + 90], [lerp(P[0], X[0], k), lerp(P[1] + 90, X[1], k)]], 4, alpha(gold, 0.9));
  g.setLineDash([]);
  const s = pop(t, 0.8); g.save(); g.translate(X[0], X[1]); g.scale(s, s); glow(g, 0, 0, 180, gold, 0.6); big(g, '×', 0, { size: 220 }); g.restore();
  text(g, 'ДАЛЕКІ ЛІНІЇ', E.W / 2, E.H * 0.16, { size: 56, color: S().ui.cream, font: FONTS.title, spacing: 4, alpha: ease.out(prog(t, 0.2, 0.5)) });
} });

// s07 — the hybrid outgrows both parents
registerShot('s07', { draw(g, t, info) {
  const cam = { z: 1.35 + 0.05 * t, y: -60 };
  const { GY, M } = lab(g, t, cam);
  veil(g, '#000', 0.2);
  const k = ease.outBack(prog(t, 0.2, 1.3));
  layer(g, cam, 1, (g) => {
    const xs = [E.W / 2 - 300, E.W / 2, E.W / 2 + 300], hs = [300, lerp(300, 700, k), 280];
    xs.forEach((x, i) => { rr(g, x - 60, GY - 110, 120, 90, 10); g.fillStyle = '#6a3a2a'; g.fill(); cornPlant(g, x, GY - 110, hs[i], { t, seed: 10 + i, health: i === 1 ? 1 : 0.75, lit: i === 1 ? S().ui.gold : M.rim, w: i === 1 ? 1.4 : 1 }); });
    if (t > 0.3) { glow(g, E.W / 2, GY - 110 - hs[1] * 0.6, 340, S().ui.gold, 0.25 * k); FX.rings(g, E.W / 2, GY - 110 - hs[1] * 0.6, t - 0.3, { count: 3, r0: 80, r1: 460, speed: 1.2, color: '#fff3c0', a: 0.4 }); }
  });
  const ts = pop(t, 0.9); g.save(); g.translate(E.W / 2, E.H * 0.13); g.scale(ts, ts); big(g, 'ГІБРИД', 0, { size: 110 }); g.restore();
  text(g, 'СИЛЬНІШИЙ ЗА ОБОХ БАТЬКІВ', E.W / 2, E.H * 0.2, { size: 40, color: S().ui.cream, font: FONTS.ui, weight: 900, spacing: 2, alpha: ease.out(prog(t, 1.3, 1.6)) });
} });

// s08 — the drought
registerShot('s08', { draw(g, t, info) {
  const cam = { z: 1.0 + 0.06 * ease.inOut(t / info.dur), x: -20 * t };
  const { GY, M } = drought(g, t, cam);
  layer(g, cam, 1, (g) => {
    for (let i = -4; i <= 4; i++) if (Math.abs(i) > 1) cornPlant(g, E.W / 2 + i * 120, GY + 60, 360, { t, seed: 200 + i, health: 0.25, ear: false });
    drawFigure(g, { x: E.W / 2, y: GY + 60, s: 1.3, facing: -1, outfit: FARMER, pose: breathe(POSES.think, t), expr: 'worried', rim: { color: M.rim, dir: [-0.6, -1], w: 5 } });
  });
  FX.dust(g, t, { count: 80, color: '#e8c08a', a: 0.45 });
  const s = pop(t, 0.3); g.save(); g.translate(E.W / 2, E.H * 0.2); g.scale(s, s); big(g, 'ПОСУХА', 0, { size: 140, color: '#ff5a32' }); g.restore();
} });

// s09 — 1934 and 1936 slam in
registerShot('s09', { draw(g, t, info) {
  const a1 = wt('четвертого', info, 1.2) - 0.25, a2 = wt('шостого', info, 2.7) - 0.25;
  const sh = t > a1 ? shake(t, 14 * (1 - prog(t, a1, a1 + 0.4)), 30) : [0, 0], sh2 = t > a2 ? shake(t, 14 * (1 - prog(t, a2, a2 + 0.4)), 30, 3) : [0, 0];
  const cam = { z: 1.12 + 0.05 * t, x: sh[0] + sh2[0], y: sh[1] + sh2[1] - 40 };
  const { GY } = drought(g, t, cam);
  layer(g, cam, 1, (g) => { for (let i = -4; i <= 4; i++) cornPlant(g, E.W / 2 + i * 140, GY + 80, 420, { t, seed: 230 + i, health: 0.3 - t * 0.04, ear: false }); });
  FX.dust(g, t, { count: 70, color: '#e8c08a', a: 0.45 });
  veil(g, '#2a1408', 0.2);
  for (const [str, at, y] of [['1934', a1, 0.18], ['1936', a2, 0.32]]) { const k = clamp(prog(t, at, at + 0.18)); if (k <= 0) continue; const sc = lerp(1.8, 1, ease.out(k)); g.save(); g.translate(E.W / 2, E.H * y); g.scale(sc, sc); big(g, str, 0, { size: 170, color: '#ff5a32', a: k, font: FONTS.ui, weight: 900 }); g.restore(); }
} });

// s10 — fields wither
registerShot('s10', { draw(g, t, info) {
  const cam = { z: 1.5 + 0.06 * t, y: -120 };
  const { GY } = drought(g, t, cam);
  const h = lerp(0.55, 0.05, ease.inOut(prog(t, 0, info.dur)));
  layer(g, cam, 1, (g) => { for (let i = -2; i <= 2; i++) cornPlant(g, E.W / 2 + i * 210, GY + 70, 560, { t, seed: 260 + i, health: h, ear: true }); });
  FX.dust(g, t, { count: 90, color: '#e8c08a', a: 0.5 });
} });

// s11 — the farmer notices
registerShot('s11', { draw(g, t, info) {
  blurLayer(g, 14, (g) => drought(g, t, { z: 1.6, x: -150, y: -160 })); veil(g, '#1a0c06', 0.35);
  const r = 330 * (1 + 0.05 * t);
  bigFace(g, E.W / 2, E.H * 0.47, r, { outfit: FARMER, expr: t < 0.35 ? 'worried' : 'surprised', look: [0.5, 0], rimColor: '#ffe2a0', rimSide: -1 });
  FX.dust(g, t, { count: 40, color: '#e8c08a', a: 0.35 });
} });

// s12 — split: sort plants dead, hybrids still green (the climax beat)
registerShot('s12', { draw(g, t, info) {
  const half = (side, health, label, col) => {
    g.save(); g.beginPath(); g.rect(side < 0 ? 0 : E.W / 2, 0, E.W / 2, E.H); g.clip();
    const cam = { z: 1.25 + 0.03 * t, x: side * 40, y: -60 };
    const { GY } = drought(g, t, cam);
    layer(g, cam, 1, (g) => { for (let i = -3; i <= 3; i++) cornPlant(g, E.W / 2 + side * E.W * 0.25 + i * 110, GY + 70, side < 0 ? 380 : 520, { t, seed: 300 + i, health, ear: side > 0 }); });
    g.restore();
    text(g, label, E.W / 2 + side * E.W * 0.25, E.H * 0.18, { size: 64, color: col, font: FONTS.title, spacing: 3, glow: 20, glowColor: alpha(col, 0.6), alpha: ease.out(prog(t, side < 0 ? 0.2 : 0.5, (side < 0 ? 0.2 : 0.5) + 0.3)) });
  };
  half(-1, lerp(0.25, 0.0, prog(t, 0, 1.5)), 'СОРТ', '#ff5a32');
  half(1, 0.85, 'ГІБРИД', S().ui.gold);
  seg(g, [[E.W / 2, 0], [E.W / 2, E.H]], 6, '#fff3d0'); glow(g, E.W / 2, E.H * 0.45, 260, '#fff3d0', 0.25);
  FX.dust(g, t, { count: 60, color: '#e8c08a', a: 0.35 });
  const a = wt('останніми', info, 1.0);
  text(g, 'ГИНУТЬ ОСТАННІМИ', E.W * 0.75, E.H * 0.24, { size: 34, color: S().ui.cream, font: FONTS.ui, weight: 900, spacing: 1, alpha: ease.out(prog(t, a, a + 0.3)) });
} });
