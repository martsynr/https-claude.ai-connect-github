// shots/01_intro.js — hook: yield ×7, the same cob, the density secret (s01–s13).
import { E, V, S, registerShot, mood, layer, blurLayer, veil, backdrop, ease, prog, clamp, lerp, shake, wordTime, seg, circle, ring, rr, poly, glow, alpha, shade, mix, linGrad, text, FONTS } from '/engine/core.js';
import { drawFigure, POSES, posesAt, breathe, bigFace } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { field, fieldGround, cornPlant, cob, plot, sack, OLD, NEW } from '../sets/corn.js';
import { FARMER } from '../cast.js';

export const wt = (w, info, fb) => (wordTime(w, info.shot.start) ?? info.shot.start + fb) - info.shot.start;
export const S1 = () => V(1.3, 1.9);
export const push = (g, t, info, z0 = 1, z1 = 1.06) => { const z = lerp(z0, z1, ease.inOut(t / info.dur)); g.translate(E.W / 2, E.H / 2); g.scale(z, z); g.translate(-E.W / 2, -E.H / 2); };
export const label = (g, str, x, y, a = 1, size = V(44, 52), color = S().ui.cream) => text(g, str, x, y, { size, color, font: FONTS.ui, weight: 900, spacing: 3, alpha: a, glow: 12, glowColor: 'rgba(0,0,0,.6)' });

// dark macro backdrop for cob inserts
export function macroBg(g, t, tint = '#3a2a10') {
  const M = mood('golden'); backdrop(g, [shade(M.sky[0], -0.75), shade(tint, -0.4)]);
  blurLayer(g, 16, (g) => { for (let i = 0; i < 5; i++) cornPlant(g, E.W * (i * 0.25), E.H * 1.05, E.H * 0.9, { sway: Math.sin(t + i) * 10, seed: 40 + i, color: shade(M.grass, -0.7), rim: alpha(M.rim, 0.4), leaves: 8, w: 22 }); });
  glow(g, E.W * 0.75, E.H * 0.2, E.W * 0.7, M.key, 0.18); FX.dust(g, t, { count: 40, color: '#ffe2bd', a: 0.35 });
}

// s01 — golden field, FARMER at the edge
registerShot('s01', { draw(g, t, info) {
  const u = ease.inOut(t / info.dur), cam = { z: lerp(1.0, 1.08, u), x: lerp(20, -20, u), y: V(-40, -100) };
  const { GY, M, plant } = field(g, t, cam, { mood: 'golden', grow: 1.15 });
  layer(g, cam, 1, (g) => {
    drawFigure(g, { x: E.W / 2 + V(120, 120), y: GY + V(80, 120), s: S1(), facing: -1, outfit: FARMER, pose: breathe(POSES.relaxed, t), expr: 'neutral', look: [-0.7, -0.4], rim: { color: M.rim, dir: [-0.6, -0.8] } });
  });
  layer(g, cam, 1.6, (g) => { cornPlant(g, -V(20, 40), E.H + 100, E.H * 0.85, { sway: Math.sin(t) * 12, seed: 2, color: shade(plant, -0.5), rim: M.rim, leaves: 8, w: 20 }); });
  FX.dust(g, t, { count: 50, color: '#ffe2bd', a: 0.4 });
} });

// s02 — data card ×7
registerShot('s02', { draw(g, t, info) {
  blurLayer(g, 12, (g) => field(g, t, { z: 1.2 + 0.03 * t }, { mood: 'golden' })); veil(g, '#08100a', 0.45);
  const tR = wt('рази', info, 2.9);
  UI.dataCard(g, t, { title: 'УРОЖАЙНІСТЬ', subtitle: 'КУКУРУДЗИ · 100 РОКІВ', from: 1, to: 7, decimals: 0, unit: '×', start: 0.3, dur: Math.max(1, tR - 0.3), labels: [[0, '1925'], [1, '2025']], shape: 2.2, total: info.dur });
} });

// shared: a pile of grain sacks; n = number shown, k = reveal 0..1
function sacks(g, x, y, n, k, s = 1) { const per = 4; for (let i = 0; i < n; i++) { const a = clamp(k * n - i); if (a <= 0) continue; const row = Math.floor(i / per), col = i % per, w = per - row * 0.5; const xx = x + (col - (Math.min(per, n - row * per) - 1) / 2) * 110 * s + row * 0, yy = y - row * 96 * s - (1 - ease.outBack(a)) * 80; sack(g, xx, yy, s, a); } }

// s03 — 1925: sparse, droopy, sepia; 1.5 sacks
registerShot('s03', { draw(g, t, info) {
  const cam = { z: lerp(1.0, 1.05, t / info.dur), y: V(-40, -90) };
  const { GY, M, plant } = field(g, t, cam, { mood: 'dusk', grow: 0.75 });
  const tP = wt('півтори', info, 2.9);
  layer(g, cam, 1, (g) => {
    for (let i = 0; i < 3; i++) cornPlant(g, E.W * (0.12 + i * 0.38), GY + 70, V(520, 560), { sway: Math.sin(t + i) * 10, seed: 60 + i, color: shade(plant, -0.15), rim: M.rim, ...OLD, leaves: 7 });
    const k = ease.out(prog(t, tP - 0.2, tP + 0.6));
    if (k > 0) { sack(g, E.W / 2 - V(40, 50), GY + V(200, 110), V(1.2, 1.5), k); g.save(); g.beginPath(); g.rect(0, 0, E.W / 2 + V(110, 135), E.H); g.clip(); sack(g, E.W / 2 + V(110, 135), GY + V(200, 110), V(1.2, 1.5), k); g.restore(); }
  });
  g.save(); g.globalCompositeOperation = 'color'; g.fillStyle = 'rgba(140,100,60,.55)'; g.fillRect(0, 0, E.W, E.H); g.restore();
  UI.readout(g, { label: '1925', value: '1,5 т/га', x: E.W / 2, y: E.H * V(0.16, 0.14), align: 'center', size: V(90, 110), a: ease.out(prog(t, tP - 0.1, tP + 0.3)) });
  FX.dust(g, t, { count: 40, color: '#ffe2bd', a: 0.35 });
} });

// s04 — today: tall dense field, 10 sacks
registerShot('s04', { draw(g, t, info) {
  const cam = { z: lerp(1.04, 1.1, t / info.dur), y: V(-40, -90) };
  const { GY, M, plant } = field(g, t, cam, { mood: 'golden', grow: 1.25 });
  const tD = wt('десять', info, 2.6);
  layer(g, cam, 1, (g) => {
    for (let i = 0; i < 7; i++) cornPlant(g, E.W * (0.02 + i * 0.16), GY + 40 + (i % 2) * 20, V(640, 760), { sway: Math.sin(t + i) * 8, seed: 70 + i, color: shade(plant, -0.1), rim: M.rim, ...NEW, leaves: 8 });
    sacks(g, E.W / 2, GY + V(200, 0), 10, ease.inOut(prog(t, 0.4, tD + 0.2)), V(1.0, 1.15));
  });
  UI.readout(g, { label: 'СЬОГОДНІ', value: '10+ т/га', x: E.W / 2, y: E.H * V(0.16, 0.14), align: 'center', size: V(90, 110), a: ease.out(prog(t, tD - 0.1, tD + 0.3)) });
  FX.dust(g, t, { count: 50, color: '#ffe2bd', a: 0.4 });
} });

// s05 — giant face, thinking; thought cob inflates
registerShot('s05', { draw(g, t, info) {
  const M = mood('golden'); blurLayer(g, 14, (g) => field(g, t, { z: 1.6, y: -200 }, { mood: 'golden' })); veil(g, '#0a0806', 0.35);
  bigFace(g, E.W / 2 - V(120, 60), E.H * V(0.62, 0.6), V(300, 330) * (1 + 0.03 * t), { outfit: FARMER, expr: 'thinking', look: [0.6, -0.6], blink: (t % 2.9) > 2.8, rimColor: M.rim, rimSide: -1 });
  const k = ease.outBack(prog(t, 0.6, 1.8)), bx = E.W / 2 + V(330, 200), by = E.H * V(0.25, 0.25);
  for (let i = 0; i < 3; i++) circle(g, E.W / 2 + V(120, 60) + i * 50, E.H * V(0.45, 0.43) - i * 60, 10 + i * 6, alpha('#f4efe6', 0.85 * clamp(k)));
  circle(g, bx, by, V(150, 200), alpha('#f4efe6', 0.9 * clamp(k)));
  if (k > 0) cob(g, bx, by, V(140, 180) * (0.6 + 0.6 * k), { husk: false, glowA: 0, tilt: 0.3 });
  if (t > 1.4) text(g, '?', bx + V(120, 170), by - V(110, 160), { size: V(90, 110), color: S().ui.gold, glow: 20, glowColor: 'rgba(255,140,40,.8)', alpha: ease.out(prog(t, 1.4, 1.7)) });
} });

// s06 — cob macro, kernels popping '+', question mark
registerShot('s06', { draw(g, t, info) {
  macroBg(g, t); g.save(); push(g, t, info, 1.0, 1.08);
  const cx = E.W / 2, cy = E.H * 0.45, L = V(700, 1000);
  cob(g, cx, cy, L, { tilt: 0.18 });
  const tZ = wt('зерен', info, 0.7);
  for (let i = 0; i < 6; i++) { const k = ease.outBack(prog(t, tZ + i * 0.18, tZ + 0.4 + i * 0.18)); if (k <= 0) continue; const a = i * 1.1, x = cx + Math.cos(a) * V(280, 300), y = cy + Math.sin(a) * V(320, 430); g.save(); g.translate(x, y); g.scale(k, k); text(g, '+1', 0, 0, { size: V(54, 64), color: S().ui.gold, font: FONTS.ui, weight: 900, glow: 16, glowColor: 'rgba(255,140,40,.8)' }); g.restore(); }
  g.restore();
  label(g, 'БІЛЬШЕ ЗЕРЕН?', E.W / 2, E.H * V(0.12, 0.1), ease.out(prog(t, tZ, tZ + 0.4)), V(60, 72), S().ui.gold);
} });

// s07 — FLASH. blueprint: 1925 cob = 2025 cob
registerShot('s07', { draw(g, t, info) {
  UI.blueprint(g); g.save(); push(g, t, info, 1.0, 1.05);
  const bp = UI.bpStroke(), gold = S().ui.gold, tN = wt('змінився', info, 3.0), L = V(560, 760), cy = E.H * 0.45, dx = V(260, 240);
  const a1 = ease.out(prog(t, 0.1, 0.6)), a2 = ease.out(prog(t, 0.6, 1.1));
  g.globalAlpha = a1; cob(g, E.W / 2 - dx, cy, L, { outline: bp }); label(g, '1925', E.W / 2 - dx, cy + L / 2 + V(70, 90), 1, V(48, 56), bp);
  g.globalAlpha = a2; cob(g, E.W / 2 + dx, cy, L, { outline: bp }); label(g, '2025', E.W / 2 + dx, cy + L / 2 + V(70, 90), 1, V(48, 56), bp);
  g.globalAlpha = 1;
  const k = ease.outBack(prog(t, tN - 0.1, tN + 0.3));
  if (k > 0) { g.save(); g.translate(E.W / 2, cy); g.scale(k, k); text(g, '=', 0, 0, { size: V(150, 180), color: gold, glow: 30, glowColor: 'rgba(255,140,40,.85)' }); g.restore();
    seg(g, [[E.W / 2 - dx - V(140, 150), cy - L / 2], [E.W / 2 + dx + V(140, 150), cy - L / 2]], 2, alpha(gold, 0.6 * clamp(k))); seg(g, [[E.W / 2 - dx - V(140, 150), cy + L / 2], [E.W / 2 + dx + V(140, 150), cy + L / 2]], 2, alpha(gold, 0.6 * clamp(k))); }
  g.restore();
  label(g, 'КАЧАН НЕ ЗМІНИВСЯ', E.W / 2, E.H * V(0.1, 0.1), ease.out(prog(t, tN, tN + 0.4)), V(54, 60), gold);
} });

// s08 — rows highlight sweep; labels
registerShot('s08', { draw(g, t, info) {
  macroBg(g, t); g.save(); push(g, t, info, 1.05, 1.12);
  const tR = wt('ряди', info, 0.7), tS = wt('сотень', info, 2.4);
  cob(g, E.W / 2, E.H * 0.47, V(760, 1050), { tilt: -0.1, hl: clamp((t - tR + 0.3) / 1.6) });
  g.restore();
  label(g, 'ТІ САМІ РЯДИ', E.W / 2, E.H * V(0.1, 0.09), ease.out(prog(t, tR - 0.1, tR + 0.3)), V(54, 64));
  UI.readout(g, { value: 'СОТНІ ЗЕРЕН', x: E.W / 2, y: E.H * V(0.9, 0.86), align: 'center', size: V(64, 80), a: ease.out(prog(t, tS - 0.1, tS + 0.3)) });
} });

// s09 — FARMER shrugs; "ЯК?"
registerShot('s09', { draw(g, t, info) {
  const cam = { z: lerp(1.25, 1.32, ease.inOut(t / info.dur)), y: 0 };
  const { GY, M, plant } = field(g, t, cam, { mood: 'golden' });
  const tY = wt('вдалося', info, 1.1);
  layer(g, cam, 1, (g) => drawFigure(g, { x: E.W / 2, y: GY + 20, s: S1(), facing: 1, outfit: FARMER, pose: breathe(posesAt(t, [[0, POSES.think], [tY - 0.2, POSES.shrug]]), t), expr: t > tY ? 'confused' : 'thinking', blink: (t % 3.1) > 3.0, rim: { color: M.rim, dir: [-0.6, -0.8] } }));
  layer(g, cam, 1.6, (g) => cornPlant(g, E.W + V(30, 20), E.H + 100, E.H * 0.8, { sway: Math.sin(t) * 10, seed: 9, color: shade(plant, -0.5), rim: M.rim, w: 20 }));
  const k = ease.outBack(prog(t, tY, tY + 0.4)); if (k > 0) { g.save(); g.translate(E.W / 2, E.H * V(0.2, 0.2)); g.scale(k, k); text(g, 'ЯК?', 0, 0, { size: V(150, 180), color: S().ui.gold, glow: 36, glowColor: 'rgba(255,140,40,.85)', spacing: 6 }); g.restore(); }
  FX.dust(g, t, { count: 40, color: '#ffe2bd', a: 0.35 });
} });

// s10 — one lone plant on a bare hill at dusk
registerShot('s10', { draw(g, t, info) {
  const M = mood('dusk'), GY = fieldGround(), cam = { z: lerp(1.0, 1.08, ease.inOut(t / info.dur)), y: 0 };
  layer(g, cam, 0.1, (g) => { backdrop(g, M.sky); FX.sun(g, E.W / 2 + V(60, 40), GY - V(260, 380), V(70, 90), '#fff0d8', M.key, 5); FX.godRays(g, E.W / 2 + V(60, 40), GY - V(260, 380), { count: 12, angle: Math.PI / 2, spread: Math.PI * 1.6, len: 1600, a: 0.06, t }); });
  layer(g, cam, 0.5, (g) => { FX.hills(g, { y: GY - V(60, 80), amp: 30, color: shade(M.dark, -0.1), seed: 2 }); g.fillStyle = shade(M.dark, -0.1); g.fillRect(-E.W, GY - V(40, 60), E.W * 3, E.H); });
  layer(g, cam, 0.9, (g) => { g.fillStyle = linGrad(g, 0, GY, 0, GY + 600, [shade(M.floor, -0.2), shade(M.dark, -0.4)]); g.beginPath(); g.moveTo(-E.W, GY + 80); g.quadraticCurveTo(E.W / 2, GY - 60, E.W * 2, GY + 80); g.lineTo(E.W * 2, E.H * 2); g.lineTo(-E.W, E.H * 2); g.fill(); FX.pool(g, E.W / 2, GY - 6, V(260, 300), 50, M.key, 0.35); });
  layer(g, cam, 1, (g) => cornPlant(g, E.W / 2, GY - 6, V(560, 700), { sway: Math.sin(t) * 10, seed: 4, color: shade(M.grass, -0.6), rim: M.rim, leaves: 8, earGlow: 0.6 }));
  FX.dust(g, t, { count: 40, color: '#ffd9b0', a: 0.35 });
} });

// s11 — pull out from one plant to a packed field
registerShot('s11', { draw(g, t, info) {
  const u = ease.inOut(prog(t, 0, info.dur * 0.9)), cam = { z: lerp(2.3, 1.0, u), y: lerp(-180, V(-40, -60), u) };
  const { GY, M, plant } = field(g, t, cam, { mood: 'golden', grow: 1.1 });
  const tP = wt('полі', info, 2.6);
  layer(g, cam, 1, (g) => { for (let r = 0; r < 3; r++) for (let i = 0; i < 9; i++) { const x = E.W * (-0.1 + i * 0.15) + r * 40; cornPlant(g, x, GY + 40 + r * V(90, 120), V(600, 700) * (1 - r * 0.05), { sway: Math.sin(t + i + r) * 8, seed: 100 + r * 10 + i, color: shade(plant, -0.08 - r * 0.15), rim: M.rim, ...NEW, leaves: 8 }); } });
  FX.dust(g, t, { count: 50, color: '#ffe2bd', a: 0.4 });
  if (t > tP - 0.2) UI.bigLine(g, t - tP + 0.2, { str: 'ГУСТОТА', dur: info.dur - tP + 0.4, y: E.H * V(0.16, 0.14) });
} });

// shared hectare scene (top-down)
function hectare(g, t, info, n, lbl, count, tag) {
  const M = mood('golden'); backdrop(g, [shade(M.floor, -0.55), shade(M.dark, -0.5)]);
  g.save(); push(g, t, info, 1.0, 1.05);
  const size = V(760, 900), cy = E.H * 0.52;
  plot(g, E.W / 2, cy, size, n.count, { reveal: n.reveal, shuffle: !!n.shuffle, soil: shade(M.floor, -0.3), plant: mix(M.grass, '#7ad06a', 0.3), seed: 9, r: V(26, 30), label: lbl });
  g.restore();
  UI.readout(g, { label: tag, value: count, x: E.W / 2, y: E.H * V(0.12, 0.17), align: 'center', size: V(88, 110) });
  FX.dust(g, t, { count: 30, color: '#ffe2bd', a: 0.25 });
}
const fmt = (v) => Math.round(v).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

// s12 — 1 ha, 30 000
registerShot('s12', { draw(g, t, info) {
  const tT = wt('тисяч', info, 3.0), k = ease.inOut(prog(t, 0.3, tT));
  hectare(g, t, info, { count: 30, reveal: k }, '1 ГЕКТАР', fmt(30000 * k), '100 РОКІВ ТОМУ');
} });

// s13 — 80 000 → 90 000
registerShot('s13', { draw(g, t, info) {
  const t8 = wt('вісімдесят', info, 1.6), t9 = wt("дев'яносто", info, 3.0);
  const v = t < t8 ? lerp(30000, 80000, ease.inOut(prog(t, 0.2, t8 + 0.3))) : lerp(80000, 90000, ease.inOut(prog(t, t9 - 0.1, t9 + 0.4)));
  hectare(g, t, info, { count: 90, reveal: v / 90000, shuffle: true }, '1 ГЕКТАР', fmt(v), 'СЬОГОДНІ');
} });
