// shots/01_style_samples.js — three representative shots: Troyer chart (data), era-trial field (wide set), farmer close-up (bigFace).
// Pictures go in draw(); every word goes in ui(), which the player draws after the look (paper cut-out), so text stays crisp.
import { E, V, S, registerShot, mood, layer, blurLayer, ease, prog, clamp, lerp, seg, circle, rr, glow, alpha, mix, shade, text, measure, FONTS, rng } from '/engine/core.js';
import { drawFigure, posesAt, breathe, bigFace } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { field, cornPlant } from '../sets/corn.js';
import { FARMER, SCIENTIST } from '../cast.js';

const gold = () => S().ui.gold, cream = () => S().ui.cream, bp = () => UI.bpStroke();
const INK = '#2a2420', PAPER = '#f4efe4';

// a word on a strip of paper glued onto the scene: slight tilt, drop shadow
function tag(g, str, x, y, o = {}) {
  const { size = V(40, 44), bg = PAPER, color = INK, tilt = 0, a = 1, padX = 0.45, align = 'center', font = FONTS.ui } = o; if (a <= 0) return;
  const w = measure(g, str, size, font, 900) + size * padX * 2, h = size * 1.45, x0 = align === 'left' ? x : align === 'right' ? x - w : x - w / 2;
  g.save(); g.globalAlpha *= clamp(a); g.translate(x0 + w / 2, y); g.rotate(tilt);
  g.shadowColor = 'rgba(0,0,0,.35)'; g.shadowBlur = 8; g.shadowOffsetX = 3; g.shadowOffsetY = 5;
  g.fillStyle = bg; g.beginPath(); g.moveTo(-w / 2, -h / 2 + 2); g.lineTo(w / 2 - 3, -h / 2); g.lineTo(w / 2, h / 2 - 2); g.lineTo(-w / 2 + 2, h / 2); g.closePath(); g.fill();
  g.shadowColor = 'transparent'; text(g, str, 0, 2, { size, color, font, weight: 900, spacing: 1.5 }); g.restore();
}

// approximate US average corn yield, t/ha (open-pollinated plateau → double-cross → single-cross)
function yieldAt(y) {
  const r = rng(Math.floor(y / 3) * 7 + 3), wob = (r() - 0.5) * 0.45;
  if (y < 1937) return 1.6 + wob * 0.35;
  if (y < 1956) return 1.6 + (y - 1937) * 0.063 + wob * 0.4;
  return 2.8 + (y - 1956) * 0.12 + wob * 0.9;
}
// shared chart geometry + gentle push-in (applied in both draw and ui so they line up)
function chart(g, t, info) {
  const z = lerp(1, 1.05, ease.inOut(t / info.dur)); g.translate(E.W / 2, E.H / 2); g.scale(z, z); g.translate(-E.W / 2, -E.H / 2);
  const x0 = V(220, 150), x1 = E.W - V(160, 90), y0 = E.H * V(0.82, 0.7), y1 = E.H * V(0.22, 0.27);
  return { x0, x1, y0, y1, X: (yr) => lerp(x0, x1, (yr - 1866) / (2024 - 1866)), Y: (v) => lerp(y0, y1, v / 12), rev: ease.inOut(prog(t, 0.5, 4.4)) };
}
const ERAS = [[1866, 1937, 'ВІЛЬНЕ ЗАПИЛЕННЯ'], [1937, 1956, 'ПОДВІЙНІ'], [1956, 2024, 'ПРОСТІ ГІБРИДИ']];

// s01 — Troyer's yield chart draws on
registerShot('s01', {
  draw(g, t, info) {
    UI.blueprint(g); g.save(); const { y0, y1, X, Y, x0, x1, rev } = chart(g, t, info); const aIn = ease.out(prog(t, 0, 0.6));
    ERAS.forEach(([a, b], i) => { const k = ease.out(prog(t, 0.4 + i * 0.15, 1 + i * 0.15)); g.fillStyle = alpha(i === 1 ? gold() : bp(), (i === 1 ? 0.12 : 0.07 + 0.05 * i) * k); g.fillRect(X(a), y1, X(b) - X(a), y0 - y1); });
    seg(g, [[x0, y1 - 30], [x0, y0], [x1 + 20, y0]], 6, alpha(bp(), 0.9 * aIn));
    for (let v = 4; v <= 12; v += 4) seg(g, [[x0, Y(v)], [x1, Y(v)]], 2, alpha(bp(), 0.18));
    if (rev > 0) { const yrEnd = lerp(1866, 2024, rev);
      g.strokeStyle = gold(); g.lineWidth = 12; g.lineJoin = 'round'; g.lineCap = 'round'; g.beginPath();
      for (let yr = 1866; yr <= yrEnd; yr += 3) { const px = X(yr), py = Y(yieldAt(yr)); yr === 1866 ? g.moveTo(px, py) : g.lineTo(px, py); } g.stroke();
      const tx = X(yrEnd), ty = Y(yieldAt(Math.floor(yrEnd))); circle(g, tx, ty, 16, '#fff6d8'); glow(g, tx, ty, 90, gold(), 0.5); }
    g.restore();
  },
  ui(g, t, info) {
    g.save(); const { y0, y1, X, Y, x0, rev } = chart(g, t, info); const aIn = ease.out(prog(t, 0, 0.6));
    tag(g, 'ВРОЖАЙНІСТЬ КУКУРУДЗИ · США', E.W / 2, E.H * V(0.1, 0.13), { a: aIn, size: V(44, 48), tilt: -0.015 });
    tag(g, 'за А. Ф. Тройєром', E.W / 2, E.H * V(0.1, 0.13) + V(80, 86), { a: aIn, size: V(28, 30), bg: '#e9d9b8', tilt: 0.02 });
    ERAS.forEach(([a, b, s], i) => { const k = ease.out(prog(t, 0.4 + i * 0.15, 1 + i * 0.15)); const words = s.split(' ');
      words.forEach((w, j) => text(g, w, (X(a) + X(b)) / 2, y1 + V(44, 50) + j * V(34, 36), { size: V(24, 26), color: cream(), font: FONTS.ui, weight: 900, alpha: k, spacing: 1 })); });
    for (let v = 0; v <= 12; v += 4) text(g, String(v), x0 - 26, Y(v), { size: V(30, 32), color: cream(), font: FONTS.ui, weight: 900, align: 'right', alpha: aIn });
    [1870, 1920, 1970, 2020].forEach(yr => text(g, String(yr), X(yr), y0 + V(42, 46), { size: V(28, 30), color: cream(), font: FONTS.ui, weight: 900, alpha: aIn }));
    text(g, 'т/га', x0, y1 - V(56, 60), { size: V(28, 30), color: cream(), font: FONTS.ui, weight: 900, alpha: aIn });
    if (rev > 0) { const yrEnd = lerp(1866, 2024, rev), tx = X(yrEnd), ty = Y(yieldAt(Math.floor(yrEnd)));
      const right = tx > E.W * 0.55; tag(g, `${Math.max(1.6, yieldAt(Math.floor(yrEnd))).toFixed(1).replace('.', ',')} т/га`, tx + (right ? -30 : 10), ty - V(70, 80), { size: V(42, 46), bg: gold(), align: right ? 'right' : 'left', tilt: -0.03 }); }
    const k = ease.outBack(prog(t, 2.0, 2.5)); if (k > 0.01) { seg(g, [[X(1937), Y(1.8)], [X(1937) - V(30, 20), Y(4.6)]], 4, cream()); tag(g, 'ГІБРИДИ', X(1937) - V(30, 20), Y(5.2), { size: V(36, 40), a: clamp(k), tilt: 0.04, bg: '#ffffff' }); }
    g.restore();
  },
});

// field camera for s02 (shared by draw and ui)
const cam02 = (t, info) => ({ z: lerp(1.0, 1.06, ease.inOut(t / info.dur)), x: lerp(-20, 20, t / info.dur) });

// s02 — the era trial: old vs new hybrids side by side
registerShot('s02', {
  draw(g, t, info) {
    const cam = cam02(t, info);
    const { GY, M, plant } = field(g, t, cam, { mood: 'golden', grow: 0.3 });
    const mid = E.W / 2;
    layer(g, cam, 1, (g) => {
      const r = rng(9), base = GY + V(70, 110);
      // old hybrid: sparse, shorter, many barren plants, one leaning
      for (let i = 0; i < 6; i++) { const x = mid - V(820, 520) + i * V(110, 75); const h = V(330, 380) * (0.75 + r() * 0.25);
        cornPlant(g, x, base, h, { sway: Math.sin(t * 1.2 + i) * 8 + (i === 2 ? 40 : 0), seed: 50 + i, color: mix(plant, '#8a7a3a', 0.45), rim: alpha(M.rim, 0.35), ear: i % 3 === 0, leaves: 5, w: 9 }); }
      // new hybrid: dense, upright, every plant with an ear
      for (let i = 0; i < 11; i++) { const x = mid + V(80, 50) + i * V(70, 45); const h = V(460, 560) * (0.95 + r() * 0.1);
        cornPlant(g, x, base, h, { sway: Math.sin(t * 1.2 + i) * 6, seed: 80 + i, color: shade(plant, 0.25), rim: alpha(M.rim, 0.8), ear: true, leaves: 7, w: 10 }); }
      for (const sx of [mid - V(420, 300), mid + V(420, 300)]) seg(g, [[sx, base + 10], [sx, base - V(150, 190)]], 8, shade(M.floor, -0.3));
    });
    layer(g, cam, 1.1, (g) => {
      const fy = GY + V(250, 330), rim = { color: M.rim, dir: [-1, -0.3] };
      drawFigure(g, { x: mid - V(120, 120), y: fy, s: V(1.5, 1.7), facing: 1, outfit: SCIENTIST, pose: breathe(posesAt(t, [[0, 'explain'], [1.6, 'point']]), t), expr: 'smile', talk: t > 1 && t < 4 ? 0.6 : 0, blink: (t % 3.1) > 3.0, rim });
      drawFigure(g, { x: mid + V(150, 160), y: fy + 10, s: V(1.5, 1.7), facing: -1, outfit: FARMER, pose: breathe(posesAt(t, [[0, 'crossArms'], [3.2, 'think']]), t), expr: t > 3.2 ? 'surprised' : 'thinking', look: [-0.6, -0.3], blink: (t % 2.7) > 2.6, rim });
    });
    FX.dust(g, t);
  },
  ui(g, t, info) {
    const cam = cam02(t, info), GY = E.H * V(0.8, 0.68), mid = E.W / 2, base = GY + V(70, 110);
    layer(g, cam, 1, (g) => { tag(g, '1930-ті', mid - V(420, 300), base - V(200, 240), { size: V(42, 46), tilt: -0.04 }); tag(g, '2000-ні', mid + V(420, 300), base - V(200, 240), { size: V(42, 46), tilt: 0.035 }); });
    const a = ease.out(prog(t, 0.2, 0.7)); tag(g, 'ОДНЕ ПОЛЕ', E.W / 2, E.H * V(0.1, 0.12), { size: V(60, 64), a, tilt: -0.02 });
    tag(g, 'РІЗНІ ДЕСЯТИЛІТТЯ', E.W / 2, E.H * V(0.1, 0.12) + V(100, 108), { size: V(48, 52), a: ease.out(prog(t, 0.5, 1.0)), bg: gold(), tilt: 0.025 });
  },
});

// s03 — giant face: farmer realises the difference is in the seed
registerShot('s03', {
  draw(g, t, info) {
    const cam = { z: 1.15, y: V(-60, -160) }, M = mood('golden');
    blurLayer(g, 10, (g) => field(g, t, cam, { mood: 'golden' }), cam, 0.6);
    g.fillStyle = alpha(M.dark, 0.25); g.fillRect(0, 0, E.W, E.H);
    bigFace(g, E.W / 2, E.H * V(0.6, 0.57), V(300, 340) * (1 + 0.03 * t), { outfit: FARMER, expr: t > 0.6 ? 'awe' : 'thinking', look: [0.2, -0.2], blink: (t % 2.9) > 2.8, rimColor: M.rim, rimSide: -1 });
  },
  ui(g, t, info) {
    const p = ease.outBack(prog(t, 0.9, 1.4)); if (p <= 0) return;
    tag(g, 'ПОЛОВИНА ПРИРОСТУ', E.W / 2, E.H * V(0.13, 0.15), { size: V(62, 68), a: clamp(p), tilt: -0.02 });
    tag(g, '— ГЕНЕТИКА', E.W / 2, E.H * V(0.13, 0.15) + V(112, 122), { size: V(80, 88), a: clamp(ease.out(prog(t, 1.2, 1.6))), bg: gold(), tilt: 0.03 });
  },
});
