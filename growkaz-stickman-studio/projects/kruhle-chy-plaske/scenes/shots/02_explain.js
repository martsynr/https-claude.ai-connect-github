// shots/02_explain.js — diagrams: one hybrid / two shapes, ear zones, sorting sieves, DNA, seed quality, seed disc, vacuum, singulator.
import { E, V, registerShot, ease, prog, clamp, lerp, rng, text, FONTS } from '/engine/core.js';
import { paper, ear, kernel, kernelFlat, kernelRound, seedDisc, gauge, pill, big, check, arrow, ln, dot, box, cap, pop, fadeIn, C, ZONE } from '../sets/world.js';
import { wt } from './01_story.js';

const zoom = (g, t, info, z0 = 1, z1 = 1.06, cy = E.H * 0.45) => { const z = lerp(z0, z1, ease.inOut(t / info.dur)); g.translate(E.W / 2, cy); g.scale(z, z); g.translate(-E.W / 2, -cy); };

// s07 — one hybrid, two shapes
registerShot('s07', { draw(g, t, info) {
  paper(g, true); g.save(); zoom(g, t, info);
  const tG = wt('гібрида', info, 1.9), tR = wt('круглим', info, 3.3), tF = wt('пласким', info, 4.0);
  ear(g, E.W / 2, 1250, 860, {});
  pill(g, 'ОДИН ГІБРИД', E.W / 2, 250, { sc: pop(t, tG - 0.15), size: 54, fill: C.light });
  for (const [x, t0, round, lab] of [[165, tR, true, 'КРУГЛЕ'], [915, tF, false, 'ПЛАСКЕ']]) { const p = pop(t, t0 - 0.1); if (p <= 0) continue; arrow(g, [E.W / 2 + (x < 540 ? -160 : 160), 820], [x + (x < 540 ? 110 : -110), 820], C.blue, 6); kernel(round, g, x, 820, 190 * p); pill(g, lab, x, 980, { sc: p, size: 38 }); }
  g.restore();
} });

// shared ear for s09/s10, with side labels
function zoneLabel(g, z, L, base, str, round, p, side = 1) { if (p <= 0) return; const [k0, k1] = ZONE[z], y = base - L * (k0 + k1) / 2; const x = E.W / 2 + side * 330; pill(g, str, x, y - 70, { sc: p, size: 36 }); kernel(round, g, x, y + 50, 110 * p); }

// s09 — tip and base: rounder
registerShot('s09', { draw(g, t, info) {
  paper(g, true); g.save(); zoom(g, t, info, 1, 1.04);
  const tT = wt('верхівці', info, 0.5), tB = wt('основи', info, 1.5), tK = wt('кругліше', info, 2.4), L = 1000, base = 1360;
  ear(g, E.W / 2, base, L, { zones: { tip: fadeIn(t, tT - 0.1), base: fadeIn(t, tB - 0.1) } });
  zoneLabel(g, 'tip', L, base, 'ВЕРХІВКА', true, pop(t, tT), 1); zoneLabel(g, 'base', L, base, 'ОСНОВА', true, pop(t, tB), 1);
  big(g, 'КРУГЛЕ', E.W / 2 - 300, 860, { sc: pop(t, tK - 0.1), size: 80, color: C.blue });
  g.restore();
} });

// s10 — middle: squeezed, flat
registerShot('s10', { draw(g, t, info) {
  paper(g, true); g.save(); zoom(g, t, info, 1.04, 1.08);
  const tM = wt('посередині', info, 0.25), tS = wt('тісно', info, 1.45), tP = wt('пласке', info, 2.1), L = 1000, base = 1360, sq = ease.inOut(prog(t, tS - 0.2, tS + 0.4)) * (0.8 + 0.2 * Math.sin(t * 10));
  ear(g, E.W / 2, base, L, { zones: { mid: fadeIn(t, tM - 0.1) }, squeeze: sq });
  if (t > tS - 0.3) { const p = ease.out(prog(t, tS - 0.3, tS)), y = base - L * 0.46; for (const sd of [-1, 1]) arrow(g, [E.W / 2 + sd * lerp(520, 400, p), y], [E.W / 2 + sd * lerp(420, 280, p), y], C.red, 10); pill(g, 'ТІСНО', E.W / 2 - 330, y - 110, { sc: pop(t, tS), size: 36, fill: '#fde2dc' }); }
  zoneLabel(g, 'mid', L, base, 'ПЛАСКЕ', false, pop(t, tP - 0.1), 1);
  g.restore();
} });

// s14 — sorting: kernels fall through sieves into four bins by shape and size
registerShot('s14', { draw(g, t, info) {
  paper(g, true); g.save(); zoom(g, t, info, 1, 1.04);
  const tFr = wt('фракції', info, 1.3), tF = wt('формою', info, 2.05), tR = wt('розміром', info, 2.7);
  // hopper
  g.beginPath(); g.moveTo(330, 300); g.lineTo(750, 300); g.lineTo(580, 470); g.lineTo(500, 470); g.closePath(); ln(g, [[330, 300], [750, 300]], 4); ln(g, [[330, 300], [500, 470], [580, 470], [750, 300]], 4); g.fillStyle = C.steel; g.fill(); ln(g, [[330, 300], [500, 470], [580, 470], [750, 300], [330, 300]], 4);
  // sieves
  for (const [y, w] of [[700, 820], [930, 900]]) { box(g, E.W / 2 - w / 2, y, w, 26, 6, '#ffffff'); for (let x = E.W / 2 - w / 2 + 30; x < E.W / 2 + w / 2 - 10; x += 40) dot(g, x, y + 13, 7, '#9aa3ab', 0); }
  // bins
  const bins = [[170, false, 1], [405, false, 0.7], [675, true, 1], [910, true, 0.7]];
  for (const [x] of bins) { g.beginPath(); g.moveTo(x - 105, 1130); g.lineTo(x - 90, 1360); g.lineTo(x + 90, 1360); g.lineTo(x + 105, 1130); ln(g, [[x - 105, 1130], [x - 90, 1360], [x + 90, 1360], [x + 105, 1130]], 5); g.fillStyle = 'rgba(180,211,238,.35)'; g.fill(); }
  // stream of kernels
  const R = rng(3);
  for (let i = 0; i < 60; i++) { const b = Math.floor(R() * 4), ph = (t * 0.55 + R()) % 1, [bx, round, sz] = bins[b]; const p = ease.inOut(ph);
    const x = ph < 0.3 ? lerp(540, lerp(540, bx, 0.4), ph / 0.3) : lerp(lerp(540, bx, 0.4), bx, (ph - 0.3) / 0.7), y = lerp(430, 1330 - R() * 60, ph); kernel(round, g, x + Math.sin(i) * 12, y, 46 * sz, { rot: ph * 6 + i }); }
  for (let b = 0; b < 4; b++) { const [x, round, sz] = bins[b], Rr = rng(10 + b); for (let k = 0; k < 7; k++) kernel(round, g, x - 60 + (k % 4) * 40 + (Math.floor(k / 4) % 2) * 20, 1335 - Math.floor(k / 4) * 40, 46 * sz, { rot: Rr() * 6 }); }
  pill(g, 'ФРАКЦІЇ', E.W / 2, 180, { sc: pop(t, tFr - 0.1), size: 50, fill: C.light });
  pill(g, 'ПЛАСКЕ', 290, 1080, { sc: pop(t, tF - 0.1), size: 34 }); pill(g, 'КРУГЛЕ', 790, 1080, { sc: pop(t, tF), size: 34 });
  for (const [x, , sz] of bins) { const p = pop(t, tR - 0.1 + (x / 4000)); if (p > 0) text(g, sz === 1 ? 'ВЕЛИКЕ' : 'МАЛЕ', x, 1420, { size: 30, color: C.blue, font: FONTS.ui, weight: 900, alpha: clamp(p) }); }
  g.restore();
} });

// s15 — same genes: a DNA helix joins round and flat
registerShot('s15', { draw(g, t, info) {
  paper(g, true); g.save(); zoom(g, t, info, 1, 1.05);
  const tG = wt('гібрида', info, 1.85), tN = wt('генів', info, 4.0), y = 760, x0 = 330, x1 = 750, draw = ease.inOut(prog(t, 0.3, 1.8));
  for (const [x, round] of [[175, true], [905, false]]) { dot(g, x, y, 150, round ? C.light : '#f1ead8'); kernel(round, g, x, y, 210, { rot: Math.sin(t * 1.4 + x) * 0.05 }); }
  const xe = lerp(x0, x1, draw);
  for (let x = x0; x < xe; x += 30) { const ph = (x - x0) / 60 + t * 2, ya = y + Math.sin(ph) * 70, yb = y - Math.sin(ph) * 70; if (Math.abs(Math.sin(ph)) > 0.25) ln(g, [[x, ya], [x, yb]], 4, '#9aa3ab'); }
  for (const [sgn, col] of [[1, C.blue], [-1, C.olive]]) { g.strokeStyle = col; g.lineWidth = 12; g.lineCap = 'round'; g.beginPath(); for (let x = x0; x <= xe; x += 6) { const yy = y + sgn * Math.sin((x - x0) / 60 + t * 2) * 70; x === x0 ? g.moveTo(x, yy) : g.lineTo(x, yy); } g.stroke(); }
  pill(g, 'ОДИН ГІБРИД', E.W / 2, 330, { sc: pop(t, tG - 0.15), size: 54, fill: C.light });
  pill(g, 'ТІ САМІ ГЕНИ', E.W / 2, 1110, { sc: pop(t, tN - 0.15), size: 54, fill: '#ffe2b0' });
  g.restore();
} });

// s16 — same seed quality: matching ticks
registerShot('s16', { draw(g, t, info) {
  paper(g, true); g.save(); zoom(g, t, info, 1, 1.04);
  const tQ = wt('посівними', info, 1.3), card = pop(t, 0.05, 0.4);
  g.save(); g.translate(E.W / 2, 800); g.scale(card, card); g.translate(-E.W / 2, -800);
  box(g, 90, 300, 900, 1060, 40, '#ffffff', 5);
  kernelRound(g, 640, 480, 130); kernelFlat(g, 860, 480, 130);
  const rows = ['СХОЖІСТЬ', 'ЕНЕРГІЯ', 'ЧИСТОТА', 'ГЕНЕТИКА'];
  rows.forEach((r, i) => { const y = 690 + i * 165, a = fadeIn(t, 0.4 + i * 0.25); ln(g, [[140, y - 82], [940, y - 82]], 3, '#dde3e8'); text(g, r, 150, y, { size: 46, color: '#3d434a', font: FONTS.ui, weight: 900, align: 'left', alpha: a }); check(g, 640, y, 40, pop(t, 0.6 + i * 0.25)); check(g, 860, y, 40, pop(t, 0.7 + i * 0.25)); });
  g.restore();
  pill(g, 'ПОСІВНІ ЯКОСТІ', E.W / 2, 210, { sc: pop(t, tQ - 0.2), size: 52, fill: C.light });
  g.restore();
} });

// s19 — seed disc matched to the kernel size
registerShot('s19', { draw(g, t, info) {
  paper(g, true); g.save(); zoom(g, t, info, 1, 1.05);
  const tD = wt('висівний', info, 0.55), tS = wt('розмір', info, 1.6), rot = t * 0.9;
  seedDisc(g, E.W / 2, 760, 400, rot, { n: 22, round: true, fill: (i, a) => (Math.sin(a) < 0.3 ? 1 : 0) });
  pill(g, 'ВИСІВНИЙ ДИСК', E.W / 2, 230, { sc: pop(t, tD - 0.15), size: 52, fill: C.light });
  const p = pop(t, tS - 0.15); if (p > 0) { g.save(); g.translate(E.W / 2, 1310); g.scale(p, p); dot(g, 0, 0, 150, '#ffffff', 5); dot(g, 0, 0, 92, '#59636c'); kernelRound(g, 0, 0, 150); ln(g, [[-110, 125], [110, 125]], 5, C.blue); ln(g, [[-110, 110], [-110, 140]], 5, C.blue); ln(g, [[110, 110], [110, 140]], 5, C.blue); g.restore(); pill(g, 'ОТВІР = ЗЕРНО', E.W / 2, 1090, { sc: p, size: 38 }); }
  g.restore();
} });

// s20 — vacuum gauge into the green
registerShot('s20', { draw(g, t, info) {
  paper(g, true); g.save(); zoom(g, t, info, 1.02, 1.08);
  const tV = wt('вакуум', info, 0.75), v = lerp(0.2, 0.66, ease.outBack(prog(t, tV - 0.3, tV + 0.5))) + 0.01 * Math.sin(t * 20);
  gauge(g, E.W / 2, 820, 330, v);
  pill(g, 'ВАКУУМ', E.W / 2, 300, { sc: pop(t, tV - 0.2), size: 56, fill: C.light });
  check(g, E.W / 2 + 280, 1100, 48, pop(t, tV + 0.5));
  g.restore();
} });

// s21 — the singulator knocks the double off
registerShot('s21', { draw(g, t, info) {
  paper(g, true); g.save(); zoom(g, t, info, 1, 1.04);
  const cx = E.W / 2, cy = 1330, R = 640, rot = -t * 0.35, sa = -Math.PI / 2;                  // singulator at the top of the disc
  seedDisc(g, cx, cy, R, rot, { n: 30, round: true, fill: (i, a) => { const d = ((a - sa) % (Math.PI * 2) + Math.PI * 3) % (Math.PI * 2) - Math.PI; return d > 0.02 ? 2 : d > -1.2 ? 1 : 0; } });
  const sx = cx, sy = cy - R * 0.83; g.save(); g.translate(sx + 20, sy - 70); box(g, -40, -40, 80, 90, 10, C.olive); for (let k = 0; k < 3; k++) ln(g, [[-30 + k * 30, 50], [-24 + k * 30, 74]], 8); g.restore();
  const ph = (t * 1.2) % 1; kernelRound(g, sx - 30 - ph * 260, sy - 60 - Math.sin(ph * Math.PI) * 180 + ph * 200, 120, { rot: ph * 8, a: 1 - ph });
  pill(g, 'СКИДАЧ ДВІЙНИКІВ', E.W / 2, 230, { sc: pop(t, 0.05), size: 50, fill: C.light });
  text(g, '2 → 1', E.W / 2, 400, { size: 70, color: C.red, font: FONTS.ui, weight: 900, alpha: fadeIn(t, 0.4) });
  g.restore();
} });
