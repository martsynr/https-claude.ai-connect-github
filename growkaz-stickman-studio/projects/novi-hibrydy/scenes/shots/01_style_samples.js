// shots/01_style_samples.js — the character-sheet cartoon look: Troyer chart, era-trial field, farmer close-up.
// Pictures go in draw(); every word goes in ui() (drawn after the look, always crisp).
import { E, V, registerShot, layer, ease, prog, clamp, lerp, text, measure, FONTS, rng } from '/engine/core.js';
import { drawFigure, posesAt, breathe, bigFace } from '/engine/rig2d.js';
import { toonField, toonCorn, toonGround, ofill, INK, CREAM } from '../sets/toon.js';
import { FARMER, SCIENTIST } from '../cast.js';

const YEL = '#f6c945', GREEN = '#3e8e41', WHITE = '#ffffff';

// outlined label card, slightly tilted
function tag(g, str, x, y, o = {}) {
  const { size = V(40, 44), bg = WHITE, color = INK, tilt = 0, a = 1, align = 'center' } = o; if (a <= 0) return;
  const w = measure(g, str, size, FONTS.ui, 900) + size * 0.9, h = size * 1.5, x0 = align === 'left' ? x : align === 'right' ? x - w : x - w / 2;
  g.save(); g.globalAlpha *= clamp(a); g.translate(x0 + w / 2, y); g.rotate(tilt);
  g.beginPath(); g.roundRect(-w / 2 + 6, -h / 2 + 8, w, h, h * 0.3); g.fillStyle = INK; g.fill();
  g.beginPath(); g.roundRect(-w / 2, -h / 2, w, h, h * 0.3); ofill(g, bg, 4);
  text(g, str, 0, 2, { size, color, font: FONTS.ui, weight: 900, spacing: 1 }); g.restore();
}

// approximate US average corn yield, t/ha
function yieldAt(y) {
  const r = rng(Math.floor(y / 3) * 7 + 3), wob = (r() - 0.5) * 0.45;
  if (y < 1937) return 1.6 + wob * 0.35;
  if (y < 1956) return 1.6 + (y - 1937) * 0.063 + wob * 0.4;
  return 2.8 + (y - 1956) * 0.12 + wob * 0.9;
}
function chart(g, t, info) {
  const z = lerp(1, 1.04, ease.inOut(t / info.dur)); g.translate(E.W / 2, E.H / 2); g.scale(z, z); g.translate(-E.W / 2, -E.H / 2);
  const x0 = V(220, 165), x1 = E.W - V(160, 110), y0 = E.H * V(0.82, 0.68), y1 = E.H * V(0.22, 0.27);
  return { x0, x1, y0, y1, X: (yr) => lerp(x0, x1, (yr - 1866) / (2024 - 1866)), Y: (v) => lerp(y0, y1, v / 12), rev: ease.inOut(prog(t, 0.5, 4.4)) };
}
const ERAS = [[1866, 1937, 'ВІЛЬНЕ ЗАПИЛЕННЯ', '#f3e6cf'], [1937, 1956, 'ПОДВІЙНІ', '#fbe3a0'], [1956, 2024, 'ПРОСТІ ГІБРИДИ', '#d9ecc9']];

// s01 — Troyer's yield chart on a cream sheet
registerShot('s01', {
  draw(g, t, info) {
    g.fillStyle = CREAM; g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
    g.save(); const { y0, y1, X, Y, x0, x1, rev } = chart(g, t, info);
    // card
    g.beginPath(); g.roundRect(x0 - V(110, 100) + 8, y1 - V(110, 100) + 10, x1 - x0 + V(170, 140), y0 - y1 + V(220, 200), 34); g.fillStyle = INK; g.fill();
    g.beginPath(); g.roundRect(x0 - V(110, 100), y1 - V(110, 100), x1 - x0 + V(170, 140), y0 - y1 + V(220, 200), 34); ofill(g, WHITE, 5);
    ERAS.forEach(([a, b, , c], i) => { const k = ease.out(prog(t, 0.4 + i * 0.15, 1 + i * 0.15)); g.save(); g.globalAlpha *= k; g.fillStyle = c; g.fillRect(X(a), y1, X(b) - X(a), y0 - y1); g.restore(); });
    g.strokeStyle = 'rgba(29,26,23,.15)'; g.lineWidth = 3; for (let v = 4; v <= 12; v += 4) { g.beginPath(); g.moveTo(x0, Y(v)); g.lineTo(x1, Y(v)); g.stroke(); }
    g.strokeStyle = INK; g.lineWidth = 6; g.lineCap = 'round'; g.beginPath(); g.moveTo(x0, y1 - 30); g.lineTo(x0, y0); g.lineTo(x1 + 20, y0); g.stroke();
    if (rev > 0) { const yrEnd = lerp(1866, 2024, rev), pts = []; for (let yr = 1866; yr <= yrEnd; yr += 3) pts.push([X(yr), Y(yieldAt(yr))]);
      for (const [lw, col] of [[22, INK], [12, GREEN]]) { g.strokeStyle = col; g.lineWidth = lw; g.lineJoin = 'round'; g.lineCap = 'round'; g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.stroke(); }
      const tx = X(yrEnd), ty = Y(yieldAt(Math.floor(yrEnd))); g.beginPath(); g.arc(tx, ty, 18, 0, 7); ofill(g, YEL, 5);
      // little corn plant riding the line, growing with the yield
      toonCorn(g, tx, ty - 16, 50 + yieldAt(Math.floor(yrEnd)) * 10, { sway: Math.sin(t * 3) * 4, seed: 7, leaves: 4, lw: 2.5, ear: yrEnd > 1945 }); }
    g.restore();
  },
  ui(g, t, info) {
    g.save(); const { y0, y1, X, Y, x0, rev } = chart(g, t, info); const aIn = ease.out(prog(t, 0, 0.6));
    tag(g, 'ВРОЖАЙНІСТЬ КУКУРУДЗИ · США', E.W / 2, E.H * V(0.08, 0.1), { a: aIn, size: V(44, 46), tilt: -0.015 });
    tag(g, 'за А. Ф. Тройєром', E.W / 2, E.H * V(0.08, 0.1) + V(88, 92), { a: aIn, size: V(28, 30), bg: YEL, tilt: 0.02 });
    ERAS.forEach(([a, b, s], i) => { const k = ease.out(prog(t, 0.4 + i * 0.15, 1 + i * 0.15)); s.split(' ').forEach((w, j) => text(g, w, (X(a) + X(b)) / 2, y1 + V(44, 50) + j * V(34, 36), { size: V(24, 26), color: INK, font: FONTS.ui, weight: 900, alpha: k * 0.8, spacing: 1 })); });
    for (let v = 0; v <= 12; v += 4) text(g, String(v), x0 - 26, Y(v), { size: V(30, 32), color: INK, font: FONTS.ui, weight: 900, align: 'right', alpha: aIn });
    [1870, 1920, 1970, 2020].forEach(yr => text(g, String(yr), X(yr), y0 + V(42, 46), { size: V(28, 30), color: INK, font: FONTS.ui, weight: 900, alpha: aIn }));
    text(g, 'т/га', x0, y1 - V(56, 60), { size: V(28, 30), color: INK, font: FONTS.ui, weight: 900, alpha: aIn });
    if (rev > 0) { const yrEnd = lerp(1866, 2024, rev), tx = X(yrEnd), ty = Y(yieldAt(Math.floor(yrEnd))), right = tx > E.W * 0.55;
      tag(g, `${Math.max(1.6, yieldAt(Math.floor(yrEnd))).toFixed(1).replace('.', ',')} т/га`, tx + (right ? -40 : 30), ty + V(70, 76), { size: V(40, 44), bg: YEL, align: right ? 'right' : 'left', tilt: -0.03 }); }
    const k = ease.outBack(prog(t, 2.0, 2.5)); if (k > 0.01) { g.strokeStyle = INK; g.lineWidth = 5; g.beginPath(); g.moveTo(X(1937), Y(2.1)); g.lineTo(X(1937) - V(40, 30), Y(4.4)); g.stroke(); tag(g, 'ГІБРИДИ', X(1937) - V(40, 30), Y(5.0), { size: V(36, 40), a: clamp(k), tilt: 0.04 }); }
    g.restore();
  },
});

const cam02 = (t, info) => ({ z: lerp(1.0, 1.06, ease.inOut(t / info.dur)), x: lerp(-20, 20, t / info.dur) });
const POST = (g, x, y) => { g.beginPath(); g.roundRect(x - 7, y - V(170, 210), 14, V(180, 220), 4); ofill(g, '#a0602c', 4); };

// s02 — the era trial: old vs new hybrids side by side
registerShot('s02', {
  draw(g, t, info) {
    const cam = cam02(t, info); const { GY } = toonField(g, t, cam, { grow: 0.32 }); const mid = E.W / 2;
    layer(g, cam, 1, (g) => {
      const r = rng(9), base = GY + V(80, 120);
      for (let i = 0; i < 6; i++) { const x = mid - V(820, 520) + i * V(110, 78); toonCorn(g, x, base, V(320, 370) * (0.72 + r() * 0.25), { sway: Math.sin(t * 1.2 + i) * 7 + (i === 2 ? 36 : 0), seed: 50 + i, color: '#b7b35e', leaves: 4, lw: 3.5, barren: i % 3 !== 0 }); }
      for (let i = 0; i < 11; i++) { const x = mid + V(80, 50) + i * V(70, 46); toonCorn(g, x, base, V(470, 560) * (0.95 + r() * 0.1), { sway: Math.sin(t * 1.2 + i) * 5, seed: 80 + i, color: '#5fa84c', leaves: 7, lw: 3.5 }); }
      POST(g, mid - V(420, 300), base + 10); POST(g, mid + V(420, 300), base + 10);
    });
    layer(g, cam, 1.1, (g) => {
      const fy = GY + V(300, 420);
      drawFigure(g, { x: mid - V(150, 170), y: fy, s: V(1.9, 2.3), facing: 1, outfit: SCIENTIST, pose: breathe(posesAt(t, [[0, 'explain'], [1.6, 'point']]), t), expr: 'smile', talk: t > 1 && t < 4 ? 0.6 : 0, blink: (t % 3.1) > 3.0, prop: 'tablet' });
      drawFigure(g, { x: mid + V(180, 200), y: fy + 10, s: V(1.9, 2.3), facing: -1, outfit: FARMER, pose: breathe(posesAt(t, [[0, 'crossArms'], [3.2, 'think']]), t), expr: t > 3.2 ? 'surprised' : 'thinking', look: [-0.6, -0.3], blink: (t % 2.7) > 2.6 });
    });
  },
  ui(g, t, info) {
    const cam = cam02(t, info), mid = E.W / 2, base = toonGround() + V(80, 120);
    layer(g, cam, 1, (g) => { tag(g, '1930-ті', mid - V(420, 300), base - V(230, 270), { size: V(42, 46), tilt: -0.04 }); tag(g, '2000-ні', mid + V(420, 300), base - V(230, 270), { size: V(42, 46), tilt: 0.035, bg: YEL }); });
    tag(g, 'ОДНЕ ПОЛЕ', E.W / 2, E.H * V(0.09, 0.1), { size: V(60, 64), a: ease.out(prog(t, 0.2, 0.7)), tilt: -0.02 });
    tag(g, 'РІЗНІ ДЕСЯТИЛІТТЯ', E.W / 2, E.H * V(0.09, 0.1) + V(104, 112), { size: V(48, 52), a: ease.out(prog(t, 0.5, 1.0)), bg: YEL, tilt: 0.025 });
  },
});

// s03 — close-up: the farmer realises the difference is in the seed
registerShot('s03', {
  draw(g, t, info) {
    toonField(g, t, { z: 1.15, y: V(-60, -160) }, { grow: 1 });
    g.fillStyle = 'rgba(251,243,228,.35)'; g.fillRect(0, 0, E.W, E.H);
    bigFace(g, E.W / 2, E.H * V(0.6, 0.56), V(300, 330) * (1 + 0.03 * t), { outfit: FARMER, expr: t > 0.6 ? 'surprised' : 'thinking', look: [0.2, -0.2], blink: (t % 2.9) > 2.8 });
  },
  ui(g, t, info) {
    const p = ease.outBack(prog(t, 0.9, 1.4)); if (p <= 0.01) return;
    tag(g, 'ПОЛОВИНА ПРИРОСТУ', E.W / 2, E.H * V(0.12, 0.13), { size: V(62, 66), a: clamp(p), tilt: -0.02 });
    tag(g, '— ГЕНЕТИКА', E.W / 2, E.H * V(0.12, 0.13) + V(118, 126), { size: V(80, 86), a: clamp(ease.out(prog(t, 1.2, 1.6))), bg: YEL, tilt: 0.03 });
  },
});
