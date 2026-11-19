// shots/04_control.js — s58–s69: lab, grow-out control in Chile/India, the finished plant.
import { E, V, S, registerShot, mood, layer, blurLayer, veil, backdrop, ease, prog, clamp, lerp, seg, circle, ring, rr, poly, glow, alpha, shade, mix, text, FONTS, rng, linGrad } from '/engine/core.js';
import { drawFigure, POSES, posesAt, breathe } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { field, cornPlant } from '../sets/corn.js';
import { kernel, lab, warehouse, bagStack, hall, globe, RED_SEED, GREEN } from '../sets/plant.js';
import { FARMER, LAB, BREEDER, COURIER } from '../cast.js';
import { bagFace, logo } from '../sets/brand.js';
import { wt, gold, cream, bp, coral, push, label, title, tick, cross } from './_h.js';
import { buildPlant3D } from './03_protect.js';

const THUMB = { ...POSES.stand, eF: [22, -140], hF: [34, -170] };
function sampleBag(g, x, y, s = 1) { rr(g, x - 30 * s, y - 70 * s, 60 * s, 70 * s, 10 * s); g.fillStyle = '#ece6d6'; g.fill(); rr(g, x - 18 * s, y - 50 * s, 36 * s, 18 * s, 3); g.fillStyle = '#fff'; g.fill(); logo(g, x, y - 41 * s, 22 * s); }
function tray(g, x, y, w, col, grow) { rr(g, x - w / 2, y - 30, w, 40, 8); g.fillStyle = shade(col, -0.5); g.fill(); for (let i = 0; i < 8; i++) { const px = x - w / 2 + 24 + i * (w - 48) / 7; kernel(g, px, y - 34, 22, { col: RED_SEED }); const h = 120 * grow * (0.7 + ((i * 37) % 10) / 30); if (h > 4) { seg(g, [[px, y - 40], [px + Math.sin(i) * 6, y - 40 - h]], 5, '#7ed36a'); poly(g, [[px, y - 40 - h * 0.7], [px + 30, y - 52 - h * 0.85], [px + 4, y - 40 - h * 0.6]], '#9be37e'); } } }

// s58 — lab: tech receives a sample bag
registerShot('s58', { draw(g, t, info) {
  const u = ease.inOut(t / info.dur), cam = { z: lerp(1.0, 1.06, u), x: lerp(-40, 20, u), y: -20 }; const { GY, FLOOR, M } = lab(g, t, cam);
  const tP = wt('проби', info, 2.6);
  layer(g, cam, 1, (g) => {
    const give = ease.inOut(prog(t, tP - 0.6, tP + 0.3));
    drawFigure(g, { x: E.W / 2 - 260, y: FLOOR, s: 1.35, facing: 1, outfit: FARMER, pose: breathe(posesAt(t, [[0, 'stand'], [tP - 0.8, 'reach'], [tP + 0.6, 'relaxed']]), t), expr: 'smile', rim: { color: M.rim, dir: [-0.8, -0.5] } });
    drawFigure(g, { x: E.W / 2 + 200, y: FLOOR, s: 1.35, facing: -1, outfit: LAB, pose: breathe(posesAt(t, [[0, 'stand'], [tP - 0.4, 'reach'], [tP + 0.4, 'holdFront']]), t, 1, 4), expr: 'smile', blink: (t % 3.3) > 3.2, rim: { color: M.rim, dir: [-0.8, -0.5] } });
    sampleBag(g, lerp(E.W / 2 - 160, E.W / 2 + 130, give), FLOOR - 1.35 * 175, 1.2);
  });
  const a = ease.outBack(prog(t, 0.4, 0.8)); if (a > 0) { g.save(); g.translate(E.W / 2, 100); g.scale(a, a); title(g, 'ЛАБОРАТОРІЯ', 0, 0, 1, 64); g.restore(); }
} });

// s59 — warm thermostat vs cold chamber, sprouts grow
registerShot('s59', { draw(g, t, info) {
  const M = mood('interiorCool'), tT = wt('термостаті', info, 1.4), tC = wt('холодній', info, 2.4);
  g.fillStyle = linGrad(g, 0, 0, E.W, 0, ['#fff1e0', '#fbe6cf', '#dcecfb', '#eaf4ff']); g.fillRect(0, 0, E.W, E.H); seg(g, [[E.W / 2, 0], [E.W / 2, E.H]], 6, '#9aa8b8');
  const zw = lerp(1.0, 1.05, t / info.dur); g.save(); g.translate(E.W / 2, E.H / 2); g.scale(zw, zw); g.translate(-E.W / 2, -E.H / 2);
  for (const [cx, col, t0, nm] of [[E.W * 0.25, '#e07b1a', tT, 'ТЕРМОСТАТ'], [E.W * 0.75, '#2a9ad0', tC, 'ХОЛОДНА КАМЕРА']]) {
    glow(g, cx, E.H * 0.45, 600, col, 0.18); for (let r = 0; r < 2; r++) tray(g, cx, E.H * 0.48 + r * 230, 560, col, ease.out(prog(t, t0 - 0.3 + r * 0.2, info.dur)) * (col === '#2a9ad0' ? 0.75 : 1));
    label(g, nm, cx, E.H * 0.12, ease.out(prog(t, t0 - 0.2, t0 + 0.2)), 46, col);
  }
  if (t > 0) FX.snow(g, t, { count: 30, color: '#3a6ea5' });
  g.restore();
} });

// s60 — all good: thumbs up + ticks
registerShot('s60', { draw(g, t, info) {
  const cam = { z: lerp(1.15, 1.2, t / info.dur), x: -200, y: 40 }; const { FLOOR, M } = lab(g, t, cam);
  const tZ = wt('Зовні', info, 0.1), tP = wt('показниками', info, 0.9), tC = wt('чудово', info, 1.8);
  layer(g, cam, 1, (g) => drawFigure(g, { x: E.W / 2 - 200, y: FLOOR, s: 1.6, facing: 1, outfit: FARMER, pose: breathe(posesAt(t, [[0, 'stand'], [tC - 0.3, THUMB]]), t), expr: t > tC ? 'happy' : 'smile', rim: { color: M.rim, dir: [-0.8, -0.5] } }));
  const rows = [['ЗОВНІШНІЙ ВИГЛЯД', tZ], ['СХОЖІСТЬ', tP], ['ВОЛОГІСТЬ', tP + 0.3], ['ЧИСТОТА', tP + 0.6]];
  rr(g, E.W * 0.55, E.H * 0.16, 700, 560, 30); g.fillStyle = S().ui.card; g.fill();
  rows.forEach(([nm, tt], i) => { const y = E.H * 0.26 + i * 120; label(g, nm, E.W * 0.55 + 280, y, 1, 36); tick(g, E.W * 0.55 + 600, y, 34, ease.outBack(prog(t, tt, tt + 0.3))); });
} });

// s61 — foreign pollen drifts into the seed field
registerShot('s61', { draw(g, t, info) {
  UI.blueprint(g); g.save(); push(g, t, info, 1.0, 1.06);
  const tZ = wt('засмічення', info, 2.0), base = E.H * 0.82;
  for (let i = 0; i < 9; i++) { const x = E.W * 0.38 + i * 120; cornPlant(g, x, base, 360, { sway: Math.sin(t + i) * 5, seed: i + 3, color: alpha(bp(), 0.55), leaves: 6, w: 6 }); }
  for (let i = 0; i < 3; i++) { const x = E.W * 0.06 + i * 110; cornPlant(g, x, base, 380, { sway: Math.sin(t + i) * 5, seed: i + 30, color: alpha(coral(), 0.6), leaves: 6, w: 6 }); }
  for (let i = 0; i < 40; i++) { const k = ((t * 0.25 + i / 40) % 1), x = lerp(E.W * 0.12, E.W * 0.95, k), y = E.H * 0.3 + Math.sin(i * 1.7 + t) * 100 + k * 160; circle(g, x, y, 5, alpha(coral(), 0.85 * Math.sin(k * Math.PI))); }
  for (let i = 0; i < 6; i++) { const k = ((t * 0.5 + i / 6) % 1); poly(g, [[E.W * 0.3 + k * 220, E.H * 0.25 + i * 10], [E.W * 0.3 + k * 220 - 30, E.H * 0.25 + i * 10 - 14], [E.W * 0.3 + k * 220 - 30, E.H * 0.25 + i * 10 + 14]], alpha(coral(), 0.6 * Math.sin(k * Math.PI))); }
  label(g, 'НАСІННЄВЕ ПОЛЕ', E.W * 0.68, base + 60, 1, 34, cream()); label(g, 'ЧУЖИЙ ПИЛОК', E.W * 0.16, base + 60, ease.out(prog(t, 0.3, 0.7)), 34, coral());
  const a = ease.outBack(prog(t, tZ - 0.1, tZ + 0.3)); if (a > 0) { g.save(); g.translate(E.W * 0.86, E.H * 0.2); g.scale(a, a); text(g, '?', 0, 0, { size: 200, color: coral(), font: FONTS.ui, weight: 900, glow: 26, glowColor: alpha(coral(), 0.6) }); g.restore(); }
  g.restore();
} });

// s62 — snowy Ukraine: sample box handed to courier; plane climbs
registerShot('s62', { draw(g, t, info) {
  const u = ease.inOut(t / info.dur), cam = { z: lerp(1.0, 1.06, u), x: lerp(-20, 40, u), y: -20 }, M = mood('day'), Y = E.H * 0.8, tK = wt('контроль', info, 2.6);
  layer(g, cam, 0.15, (g) => { backdrop(g, ['#8aa0c0', '#c8d6e6', '#e8eef4']); FX.clouds(g, { y: E.H * 0.2, h: 140, color: '#ffffff', a: 0.3, seed: 4 }); });
  layer(g, cam, 0.4, (g) => { FX.hills(g, { y: Y - 120, amp: 50, color: '#d6e0ea', seed: 5 }); for (let i = 0; i < 12; i++) FX.pine(g, i * 220 - 300, Y - 100 + (i % 3) * 10, 0.8, '#5a6a7a'); });
  layer(g, cam, 0.85, (g) => { g.fillStyle = linGrad(g, 0, Y, 0, E.H, ['#eef3f8', '#c8d4e0']); g.fillRect(-E.W, Y - 4, E.W * 3, E.H);
    const pk = ease.in(prog(t, 1.2, info.dur + 0.4)), px = lerp(E.W * 0.78, E.W * 1.25, pk), py = lerp(Y - 40, Y - 520, pk * pk); g.save(); g.translate(px, py); g.rotate(-0.35 * clamp(pk * 3)); rr(g, -150, -22, 300, 44, 22); g.fillStyle = '#e8ecf2'; g.fill(); poly(g, [[-40, 0], [40, 0], [-10, 90], [-40, 90]], '#cfd6dc'); poly(g, [[-150, -10], [-120, -10], [-160, -70], [-180, -70]], '#3a6ea5'); g.restore(); });
  layer(g, cam, 1, (g) => { const give = ease.inOut(prog(t, 0.3, 1.2));
    drawFigure(g, { x: E.W / 2 - 300, y: Y, s: 1.3, facing: 1, outfit: FARMER, pose: breathe(posesAt(t, [[0, 'holdFront'], [0.6, 'reach'], [1.3, 'wave']]), t), expr: 'smile', rim: { color: '#ffffff', dir: [-0.8, -0.5] } });
    drawFigure(g, { x: E.W / 2 + 40, y: Y, s: 1.3, facing: -1, outfit: COURIER, pose: breathe(posesAt(t, [[0, 'reach'], [1.2, 'holdFront']]), t, 1, 2), expr: 'smile', rim: { color: '#ffffff', dir: [-0.8, -0.5] } });
    rr(g, lerp(E.W / 2 - 230, E.W / 2 - 40, give), Y - 260, 90, 70, 8); g.fillStyle = '#c9a46a'; g.fill(); logo(g, lerp(E.W / 2 - 185, E.W / 2 + 5, give), Y - 225, 50, { plate: true }); });
  FX.snow(g, t, { count: 140, color: '#ffffff', speed: 50 });
  const a = ease.outBack(prog(t, tK - 0.5, tK - 0.1)); if (a > 0) { g.save(); g.translate(E.W / 2, 100); g.scale(a, a); title(g, 'ҐРУНТОВИЙ КОНТРОЛЬ', 0, 0, 1, 60); g.restore(); }
} });

// s63 — globe: arcs Ukraine → Chile, India
registerShot('s63', { draw(g, t, info) {
  UI.blueprint(g); g.save(); push(g, t, info, 1.0, 1.06);
  const cx = E.W / 2, cy = E.H * 0.53, R = 380, tC = wt('Чилі', info, 0.3), tI = wt('Індію', info, 0.9), tW = wt('зима', info, 3.2);
  globe(g, cx, cy, R, t);
  const UA = [cx + 40, cy - 190], CL = [cx - 230, cy + 220], IN = [cx + 220, cy - 30];
  const arc = (p0, p1, k, col) => { const mx = (p0[0] + p1[0]) / 2, my = Math.min(p0[1], p1[1]) - 220; g.strokeStyle = col; g.lineWidth = 6; g.setLineDash([16, 12]); g.beginPath(); g.moveTo(...p0); for (let i = 1; i <= 30 * k; i++) { const u = i / 30, x = (1 - u) ** 2 * p0[0] + 2 * (1 - u) * u * mx + u * u * p1[0], y = (1 - u) ** 2 * p0[1] + 2 * (1 - u) * u * my + u * u * p1[1]; g.lineTo(x, y); } g.stroke(); g.setLineDash([]); };
  const kc = ease.inOut(prog(t, tC - 0.6, tC + 0.4)), ki = ease.inOut(prog(t, tI - 0.5, tI + 0.5));
  arc(UA, CL, kc, gold()); arc(UA, IN, ki, gold());
  circle(g, UA[0], UA[1], 16, '#3a6ea5'); FX.sparkle(g, UA[0], UA[1], 30, '#3a6ea5', ease.out(prog(t, tW - 0.2, tW + 0.2)) * 0.9 + 0.1);
  for (const [p, k] of [[CL, kc], [IN, ki]]) if (k > 0.95) { circle(g, p[0], p[1], 18, gold()); glow(g, p[0], p[1], 90, '#e07b1a', 0.5); }
  label(g, 'УКРАЇНА', UA[0] + 20, UA[1] - 50, 1, 34, '#3a6ea5'); label(g, 'ЗИМА', UA[0] + 220, UA[1] - 50, ease.out(prog(t, tW, tW + 0.3)), 34, '#2b7fd0');
  label(g, 'ЧИЛІ', CL[0] - 130, CL[1] + 10, ease.out(prog(t, tC, tC + 0.3)), 40, gold()); label(g, 'ІНДІЯ', IN[0] + 140, IN[1] + 10, ease.out(prog(t, tI, tI + 0.3)), 40, gold());
  label(g, 'ТЕПЛО', E.W / 2, E.H * 0.07, ease.out(prog(t, wt('тепло', info, 1.6), wt('тепло', info, 1.6) + 0.3)), 46, '#e07b1a');
  g.restore();
} });

// s64 — sunny grow-out field; BREEDER walks the rows; ЛЮТИЙ
registerShot('s64', { draw(g, t, info) {
  const u = ease.inOut(t / info.dur), cam = { z: lerp(1.0, 1.06, u), x: lerp(-60, 40, u), y: -30 }; const { GY, M, plant } = field(g, t, cam, { mood: 'day' });
  layer(g, cam, 1, (g) => { for (let i = -3; i < 6; i++) cornPlant(g, E.W / 2 + i * 260 - 100, GY + 30, 520, { sway: Math.sin(t + i) * 8, seed: 40 + i, color: plant, rim: M.rim });
    const ph = t * Math.PI * 2 * 0.9, x = lerp(E.W / 2 - 300, E.W / 2 + 60, prog(t, 0, info.dur)); drawFigure(g, { x, y: GY + 60, s: 1.35, facing: 1, outfit: BREEDER, pose: breathe(posesAt(t, [[0, 'holdFront']]), t), expr: 'thinking', rim: { color: M.rim, dir: [-0.8, -0.5] } }); rr(g, x + 38, GY + 60 - 1.35 * 170, 50, 66, 6); g.fillStyle = '#e8e2d2'; g.fill(); });
  FX.sun(g, E.W * 0.82, E.H * 0.16, 60, '#fff6e0', '#ffd59a', 4);
  const a = ease.outBack(prog(t, 0.2, 0.6)); if (a > 0) { g.save(); g.translate(170, 110); g.scale(a, a); rr(g, -110, -60, 220, 130, 16); g.fillStyle = '#f4efe6'; g.fill(); rr(g, -110, -60, 220, 40, 16); g.fillStyle = coral(); g.fill(); text(g, 'ЛЮТИЙ', 0, 24, { size: 44, color: '#1a1622', font: FONTS.ui, weight: 900 }); g.restore(); }
  label(g, 'ЧИЛІ · ІНДІЯ', E.W / 2, E.H * 0.08, ease.out(prog(t, 0.4, 0.8)), 40, cream());
} });

// s65 — an off-type short plant gets ringed
registerShot('s65', { draw(g, t, info) {
  const cam = { z: lerp(1.1, 1.18, ease.inOut(t / info.dur)), y: -60 }; const { GY, M, plant } = field(g, t, cam, { mood: 'day' });
  const tN = wt('нетипові', info, 0.9);
  layer(g, cam, 1, (g) => { for (let i = -3; i <= 3; i++) { const off = i === 1; cornPlant(g, E.W / 2 + i * 220, GY + 30, off ? 300 : 560, { sway: Math.sin(t + i) * 6, seed: 50 + i, color: off ? mix(plant, '#8a8a3a', 0.4) : plant, rim: M.rim }); if (off && t > tN) { const a = ease.outBack(prog(t, tN, tN + 0.3)); ring(g, E.W / 2 + i * 220, GY - 140, 190 * a, 7, coral()); } }
    drawFigure(g, { x: E.W / 2 - 420, y: GY + 60, s: 1.35, facing: 1, outfit: BREEDER, pose: breathe(posesAt(t, [[0, 'holdFront'], [tN - 0.2, 'point']]), t), expr: t > tN ? 'surprised' : 'thinking', rim: { color: M.rim, dir: [-0.8, -0.5] } }); });
  label(g, 'НЕТИПОВА РОСЛИНА', E.W / 2 + 220, E.H * 0.13, ease.out(prog(t, tN + 0.1, tN + 0.4)), 46, coral());
} });

// s66 — warehouse; stamp ПЕРЕВІРЕНО
registerShot('s66', { draw(g, t, info) {
  const u = ease.inOut(t / info.dur), cam = { z: lerp(1.0, 1.08, u), x: lerp(-30, 30, u) }; const { GY, M } = warehouse(g, t, cam);
  const tP = wt('перевірене', info, 1.6);
  layer(g, cam, 1, (g) => { bagStack(g, E.W / 2 - 380, GY + 40, 8, 5, M, { mark: GREEN }); });
  const k = prog(t, tP - 0.25, tP); if (k > 0) { const s = lerp(2.4, 1, ease.in(k)); g.save(); g.translate(E.W / 2, E.H * 0.42); g.rotate(-0.12); g.scale(s, s); g.globalAlpha *= clamp(k * 2); rr(g, -330, -70, 660, 140, 20); g.fillStyle = 'rgba(8,14,10,.82)'; g.fill(); g.strokeStyle = '#ffffff'; g.lineWidth = 12; g.stroke(); text(g, 'ПЕРЕВІРЕНО', 0, 4, { size: 92, color: '#ffffff', font: FONTS.ui, weight: 900 }); g.restore(); }
  label(g, 'ПЕРЕД ПОСІВНОЮ', E.W / 2, E.H * 0.1, ease.out(prog(t, 0.3, 0.7)), 44, cream());
} });

// s67 — 3D fly-through of the finished plant + title
registerShot('s67', { kind: '3d',
  init(T) { return buildPlant3D(T, { fx: -1, pose: POSES.cheer }); },
  draw(s, t, info, T) { T.dolly(s.stage.camera, t, [[0, { pos: [-20, 4, 12], look: [-6, 2, 0] }], [info.dur, { pos: [4, 6.5, 15], look: [2, 2.5, 0] }]]); },
  overlay(g, t, info) { UI.titleCard(g, t, { lines: ['ВІТАЮ!', 'НАСІННЄВИЙ ЗАВОД'], dur: info.dur + 0.4, y: E.H * 0.24 }); },
});

// s68 — FARMER cheers in front of the whole line
registerShot('s68', { draw(g, t, info) {
  const u = ease.inOut(t / info.dur), cam = { z: lerp(0.62, 0.66, u), x: lerp(1200, 1300, u), y: -120 };
  const ctx = hall(g, t, cam, { n: 10, focus: 4, drop: null, cyclones: 1, tCyc: -5 });
  layer(g, cam, 1, (g) => drawFigure(g, { x: E.W / 2 + 1300, y: ctx.GY + 90, s: 1.9, facing: 1, outfit: FARMER, pose: breathe(posesAt(t, [[0, 'cheer']]), t), expr: 'joy', rim: { color: ctx.M.rim, dir: [-0.6, -0.8] } }));
  FX.sparkle(g, E.W * 0.7, E.H * 0.3, 30, '#fff6d8', 0.5 + 0.5 * Math.sin(t * 4));
  label(g, 'СПРАВЖНЄ НАСІННЯ', E.W / 2, E.H * 0.1, ease.out(prog(t, wt('справжнє', info, 1.2), wt('справжнє', info, 1.2) + 0.3)), 56, gold());
} });

// s69 — the bag label: etiquette, documents, quality seal
registerShot('s69', { draw(g, t, info) {
  const cam = { z: lerp(1.0, 1.08, ease.inOut(t / info.dur)) }; const { M } = warehouse(g, t, { z: 1.0 });
  veil(g, '#ffffff', 0.35);
  const tE = wt('етикеткою', info, 0.4), tD = wt('документами', info, 1.4), tY = wt('якості', info, 3.6);
  layer(g, cam, 1, (g) => { const cx = E.W * 0.3, cy = E.H * 0.55; bagFace(g, cx - 280, cy - 380, 560, 760, { r: 60, zoom: 1.0 });
    const a = ease.outBack(prog(t, tE - 0.1, tE + 0.3)); if (a > 0) { g.save(); g.translate(cx + 130, cy + 250); g.rotate(-0.05); g.scale(a * 0.5, a * 0.5); rr(g, -200, -150, 400, 300, 14); g.fillStyle = '#ffffff'; g.fill(); seg(g, [[-160, -100], [160, -100]], 10, GREEN); for (let i = 0; i < 4; i++) seg(g, [[-160, -40 + i * 50], [lerp(40, 160, i % 2), -40 + i * 50]], 6, alpha('#555', 0.6)); g.restore(); }
    const d = ease.outBack(prog(t, tD - 0.1, tD + 0.3)); if (d > 0) { g.save(); g.translate(E.W * 0.66, E.H * 0.42); g.rotate(0.08); g.scale(d, d); for (let k = 2; k >= 0; k--) { rr(g, -170 + k * 20, -220 + k * 16, 340, 440, 10); g.fillStyle = shade('#f4efe6', -k * 0.08); g.fill(); } logo(g, 0, -150, 80); for (let i = 0; i < 6; i++) seg(g, [[-130, -60 + i * 45], [lerp(60, 130, i % 2), -60 + i * 45]], 6, alpha('#555', 0.5)); g.restore(); }
    const q = ease.outBack(prog(t, tY - 0.2, tY + 0.2)); if (q > 0) { g.save(); g.translate(E.W * 0.78, E.H * 0.7); g.scale(q, q); for (let i = 0; i < 16; i++) { const an = i * Math.PI / 8; poly(g, [[Math.cos(an) * 120, Math.sin(an) * 120], [Math.cos(an + 0.2) * 150, Math.sin(an + 0.2) * 150], [Math.cos(an + 0.4) * 120, Math.sin(an + 0.4) * 120]], gold()); } circle(g, 0, 0, 125, gold()); circle(g, 0, 0, 100, '#c99a3a'); tick(g, 0, 0, 60, 1, '#fff6d8'); glow(g, 0, 0, 260, gold(), 0.3); g.restore(); } });
  label(g, 'ЕТИКЕТКА', E.W * 0.3, E.H * 0.1, ease.out(prog(t, tE, tE + 0.3)), 40, cream()); label(g, 'ДОКУМЕНТИ', E.W * 0.66, E.H * 0.1, ease.out(prog(t, tD, tD + 0.3)), 40, cream()); label(g, 'ЯКІСТЬ', E.W * 0.78, E.H * 0.92, ease.out(prog(t, tY, tY + 0.3)), 44, gold());
} });
