// shots/01_style_samples.js — three representative shots: Troyer chart (data), era-trial field (wide set), farmer close-up (bigFace).
import { E, V, S, registerShot, mood, layer, blurLayer, ease, prog, key, clamp, lerp, seg, circle, rr, poly, glow, alpha, mix, shade, text, FONTS, rng } from '/engine/core.js';
import { drawFigure, POSES, posesAt, breathe, bigFace } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { field, cornPlant } from '../sets/corn.js';
import { FARMER, SCIENTIST } from '../cast.js';

const gold = () => S().ui.gold, cream = () => S().ui.cream, bp = () => UI.bpStroke();
const label = (g, str, x, y, o = {}) => text(g, str, x, y, { size: V(40, 44), color: cream(), font: FONTS.ui, weight: 900, spacing: 2, ...o });

// approximate US average corn yield, t/ha (open-pollinated plateau → double-cross → single-cross)
function yieldAt(y) {
  const r = rng(Math.floor(y / 3) * 7 + 3), wob = (r() - 0.5) * 0.45;
  if (y < 1937) return 1.6 + wob * 0.35;
  if (y < 1956) return 1.6 + (y - 1937) * 0.063 + wob * 0.4;
  return 2.8 + (y - 1956) * 0.12 + wob * 0.9;
}

// s01 — Troyer's yield chart draws on
registerShot('s01', { draw(g, t, info) {
  UI.blueprint(g);
  const z = lerp(1, 1.05, ease.inOut(t / info.dur)); g.save(); g.translate(E.W / 2, E.H / 2); g.scale(z, z); g.translate(-E.W / 2, -E.H / 2);
  const x0 = V(220, 150), x1 = E.W - V(160, 90), y0 = E.H * V(0.82, 0.7), y1 = E.H * V(0.22, 0.27);
  const X = (yr) => lerp(x0, x1, (yr - 1866) / (2024 - 1866)), Y = (v) => lerp(y0, y1, v / 12);
  const aIn = ease.out(prog(t, 0, 0.6));
  label(g, 'ВРОЖАЙНІСТЬ КУКУРУДЗИ · США', E.W / 2, E.H * V(0.1, 0.14), { alpha: aIn, size: V(46, 50) });
  label(g, 'за А. Ф. Тройєром', E.W / 2, E.H * V(0.1, 0.14) + V(56, 62), { alpha: aIn * 0.7, size: V(28, 32), color: bp() });
  // era bands
  const eras = [[1866, 1937, 'ВІЛЬНЕ\nЗАПИЛЕННЯ'], [1937, 1956, 'ПОДВІЙНІ'], [1956, 2024, 'ПРОСТІ ГІБРИДИ']];
  eras.forEach(([a, b, s], i) => { const k = ease.out(prog(t, 0.4 + i * 0.15, 1 + i * 0.15)); if (i % 2 === 0) { g.fillStyle = alpha(bp(), 0.06 * k); g.fillRect(X(a), y1, X(b) - X(a), y0 - y1); }
    s.split('\n').forEach((ln, j) => label(g, ln, (X(a) + X(b)) / 2, y1 + V(50, 60) + j * V(34, 36), { size: V(24, 26), color: alpha(bp(), 0.9), alpha: k, spacing: 1 })); });
  // axes + ticks
  seg(g, [[x0, y1 - 30], [x0, y0], [x1 + 20, y0]], 4, alpha(bp(), 0.9 * aIn));
  for (let v = 0; v <= 12; v += 4) { seg(g, [[x0 - 14, Y(v)], [x0, Y(v)]], 3, bp()); label(g, String(v), x0 - 28, Y(v), { size: V(30, 32), align: 'right', color: bp(), alpha: aIn }); if (v) seg(g, [[x0, Y(v)], [x1, Y(v)]], 1, alpha(bp(), 0.15)); }
  [1870, 1920, 1970, 2020].forEach(yr => { seg(g, [[X(yr), y0], [X(yr), y0 + 14]], 3, bp()); label(g, String(yr), X(yr), y0 + V(44, 48), { size: V(28, 30), color: bp(), alpha: aIn }); });
  label(g, 'т/га', x0, y1 - V(56, 60), { size: V(28, 30), color: bp(), alpha: aIn });
  // the line
  const rev = ease.inOut(prog(t, 0.5, 4.4)), yrEnd = lerp(1866, 2024, rev); if (rev > 0) {
    g.strokeStyle = gold(); g.lineWidth = 7; g.lineJoin = 'round'; g.beginPath();
    for (let yr = 1866; yr <= yrEnd; yr += 3) { const px = X(yr), py = Y(yieldAt(yr)); yr === 1866 ? g.moveTo(px, py) : g.lineTo(px, py); } g.stroke();
    const tx = X(yrEnd), ty = Y(yieldAt(Math.floor(yrEnd))); circle(g, tx, ty, 12, '#fff6d8'); glow(g, tx, ty, 90, gold(), 0.5);
    UI.readout(g, { value: `${Math.max(1.6, yieldAt(Math.floor(yrEnd))).toFixed(1).replace('.', ',')} т/га`, x: tx - 20, y: ty - V(60, 70), align: 'right', size: V(46, 52) });
  }
  // hybrid bend callout
  UI.callout(g, t, { at: [X(1937), Y(1.7)], to: [X(1937) - V(20, 10), Y(5.5)], str: 'ГІБРИДИ', color: gold(), start: 2.0, size: V(36, 40) });
  g.restore();
} });

// small sign on a post
function sign(g, x, y, str, M) {
  seg(g, [[x, y], [x, y - V(150, 190)]], 8, shade(M.floor, -0.3));
  rr(g, x - V(110, 120), y - V(230, 280), V(220, 240), V(90, 100), 10); g.fillStyle = '#f1e6cc'; g.fill(); g.strokeStyle = alpha(M.rim, 0.7); g.lineWidth = 3; g.stroke();
  text(g, str, x, y - V(185, 230), { size: V(40, 44), color: '#2a2418', font: FONTS.ui, weight: 900 });
}

// s02 — the era trial: old vs new hybrids side by side
registerShot('s02', { draw(g, t, info) {
  const cam = { z: lerp(1.0, 1.06, ease.inOut(t / info.dur)), x: lerp(-20, 20, t / info.dur) };
  const { GY, M, plant } = field(g, t, cam, { mood: 'golden', grow: 0.3 });
  const mid = E.W / 2, ox = V(240, 0);
  layer(g, cam, 1, (g) => {
    const r = rng(9), base = GY + V(70, 110);
    // old hybrid: sparse, shorter, many barren plants, some leaning
    for (let i = 0; i < 6; i++) { const x = mid - V(820, 520) + i * V(110, 75) + ox * 0; const h = V(330, 380) * (0.75 + r() * 0.25);
      cornPlant(g, x, base, h, { sway: Math.sin(t * 1.2 + i) * 8 + (i === 2 ? 40 : 0), seed: 50 + i, color: mix(plant, '#8a7a3a', 0.45), rim: alpha(M.rim, 0.35), ear: i % 3 === 0, leaves: 5, w: 9 }); }
    // new hybrid: dense, upright, every plant with an ear
    for (let i = 0; i < 11; i++) { const x = mid + V(80, 50) + i * V(70, 45); const h = V(460, 560) * (0.95 + r() * 0.1);
      cornPlant(g, x, base, h, { sway: Math.sin(t * 1.2 + i) * 6, seed: 80 + i, color: shade(plant, 0.25), rim: alpha(M.rim, 0.8), ear: true, leaves: 7, w: 10 }); }
    sign(g, mid - V(420, 300), base + 10, '1930-ті', M);
    sign(g, mid + V(420, 300), base + 10, '2000-ні', M);
  });
  layer(g, cam, 1.1, (g) => {
    const fy = GY + V(250, 330), rim = { color: M.rim, dir: [-1, -0.3] };
    drawFigure(g, { x: mid - V(120, 120), y: fy, s: V(1.5, 1.7), facing: 1, outfit: SCIENTIST, pose: breathe(posesAt(t, [[0, 'explain'], [1.6, 'point']]), t), expr: 'smile', talk: t > 1 && t < 4 ? 0.6 : 0, blink: (t % 3.1) > 3.0, rim });
    drawFigure(g, { x: mid + V(150, 160), y: fy + 10, s: V(1.5, 1.7), facing: -1, outfit: FARMER, pose: breathe(posesAt(t, [[0, 'crossArms'], [3.2, 'think']]), t), expr: t > 3.2 ? 'surprised' : 'thinking', look: [-0.6, -0.3], blink: (t % 2.7) > 2.6, rim });
  });
  FX.dust(g, t);
  UI.bigLine(g, t, { str: 'ОДНЕ ПОЛЕ · РІЗНІ ДЕСЯТИЛІТТЯ', y: E.H * V(0.12, 0.14), dur: info.dur, size: V(64, 58) });
} });

// s03 — giant face: farmer realises the difference is in the seed
registerShot('s03', { draw(g, t, info) {
  const cam = { z: 1.15, y: V(-60, -160) };
  const M = mood('golden');
  blurLayer(g, 10, (g) => field(g, t, cam, { mood: 'golden' }), cam, 0.6);
  g.fillStyle = alpha(M.dark, 0.25); g.fillRect(0, 0, E.W, E.H);
  bigFace(g, E.W / 2, E.H * V(0.6, 0.55), V(300, 340) * (1 + 0.03 * t), { outfit: FARMER, expr: t > 0.6 ? 'awe' : 'thinking', look: [0.2, -0.2], blink: (t % 2.9) > 2.8, rimColor: M.rim, rimSide: -1 });
  const p = ease.outBack(prog(t, 0.9, 1.4));
  if (p > 0) { g.save(); g.translate(E.W / 2, E.H * V(0.14, 0.16)); g.scale(0.85 + 0.15 * clamp(p), 0.85 + 0.15 * clamp(p));
    text(g, 'ПОЛОВИНА ПРИРОСТУ', 0, 0, { size: V(70, 76), color: cream(), glow: 18, glowColor: alpha(gold(), 0.5), alpha: clamp(p), spacing: 2 });
    text(g, '— ГЕНЕТИКА', 0, V(90, 96), { size: V(86, 96), color: gold(), glow: 30, glowColor: alpha(gold(), 0.8), alpha: clamp(p), spacing: 3 }); g.restore(); }
  for (let i = 0; i < 5; i++) { const a = 0.5 + 0.5 * Math.sin(t * 3 + i * 1.7); FX.sparkle(g, E.W * (0.15 + i * 0.17), E.H * V(0.3, 0.3) + Math.sin(i * 2.3) * V(80, 120), 14 + 8 * a, gold(), 0.5 * a * clamp(p)); }
} });
