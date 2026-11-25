// sets/corn.js — corn field (any mood), wheat patch, the leaf-cell "room", Kranz cross-section, stomata, thermometer.
import { E, V, S, mood, layer, blurLayer, backdrop, rr, seg, circle, ring, poly, linGrad, radGrad, glow, alpha, shade, mix, text, FONTS, ease, prog, clamp, lerp, rng } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';

export const fieldGround = () => E.H * V(0.8, 0.68);

// one corn plant: x,y = base, h = height.
// o: {sway, seed, color, rim, tassel, ear, leaves, w, erect (0 = droopy "palm" leaves .. 1 = upright; undefined = classic),
//     tasselScale, lean (radians, lodging), dry (0..1 browning), barren (draw dashed empty ear slot), earGlow}
export function cornPlant(g, x, y, h, o = {}) {
  const { sway = 0, seed = 1, rim = null, tassel = true, ear = h > 300, leaves = 7, w = Math.max(4, h * 0.018), erect, tasselScale = 1, lean = 0, dry = 0, barren = false, earGlow = 0 } = o;
  const base = mix(o.color || '#4f8a3a', '#78b45f', 0.6), color = dry ? mix(base, '#c9a45a', dry) : base, INK = S().ink, lw = Math.max(1.5, Math.min(3, h / 260));
  const r = rng(seed), top = [x + sway, y - h], P = (k) => [x + sway * k * k, y - h * k];
  g.save(); if (lean) { g.translate(x, y); g.rotate(lean); g.translate(-x, -y); }
  const stalk = () => { g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + sway * 0.25, y - h * 0.5, top[0], top[1]); };
  g.lineCap = 'round'; stalk(); g.strokeStyle = INK; g.lineWidth = w + lw * 2; g.stroke(); stalk(); g.strokeStyle = shade(color, -0.08); g.lineWidth = w; g.stroke();
  for (let i = 0; i < leaves; i++) {
    const k = 0.12 + (i / leaves) * 0.78, [bx, by] = P(k), side = i % 2 ? 1 : -1, len = h * (0.42 - k * 0.22) * (0.85 + r() * 0.3), droop = 0.5 + r() * 0.4;
    let tip, c1;
    if (erect === undefined) { tip = [bx + side * len + sway * 0.3, by - len * 0.15 + len * droop * 0.45]; c1 = [bx + side * len * 0.45, by - len * 0.45]; }
    else {
      const e = clamp(erect), L = len * (1 - 0.15 * e);
      tip = [bx + side * L * lerp(0.95, 0.32, e) + sway * 0.3, by + L * lerp(0.38 + droop * 0.2, -0.92, e)];
      c1 = [bx + side * L * lerp(0.5, 0.1, e), by - L * lerp(0.4, 0.55, e)];
    }
    g.fillStyle = i % 2 ? color : shade(color, 0.08); g.beginPath(); g.moveTo(bx, by); g.quadraticCurveTo(c1[0], c1[1], tip[0], tip[1]); g.quadraticCurveTo(c1[0] + side * 6, c1[1] + len * 0.12, bx, by + w * 2.2); g.closePath(); g.fill(); g.strokeStyle = INK; g.lineWidth = lw; g.lineJoin = 'round'; g.stroke();
  }
  const [ex, ey] = P(0.55);
  if (ear && !barren) {                                            // cob in husk + silk
    g.save(); g.translate(ex + w * 0.6, ey); g.rotate(0.35);
    if (earGlow) glow(g, 0, 0, h * 0.16, S().ui.gold, earGlow * 0.6);
    for (let s = -2; s <= 2; s++) seg(g, [[0, -h * 0.07], [s * 4, -h * 0.07 - 14 - Math.abs(s) * 2]], 2.5, '#c98a3a');
    g.fillStyle = earGlow ? mix('#b8d070', '#f2c24a', earGlow) : '#b8d070'; g.beginPath(); g.ellipse(0, 0, w * 1.3, h * 0.07, 0, 0, 7); g.fill(); g.strokeStyle = INK; g.lineWidth = lw; g.stroke();
    g.restore();
  }
  if (barren) { g.save(); g.translate(ex + w * 0.6, ey); g.rotate(0.35); g.setLineDash([8, 8]); g.strokeStyle = alpha('#ff6b5a', 0.8); g.lineWidth = 3; g.beginPath(); g.ellipse(0, 0, w * 1.3, h * 0.07, 0, 0, 7); g.stroke(); g.setLineDash([]); g.restore(); }
  if (tassel) { const ts = tasselScale, tw = Math.max(1.5, w * 0.35 * Math.sqrt(ts)); for (const [c, ww] of [[INK, tw + lw * 2], ['#d9b45a', tw]]) for (let s = -3; s <= 3; s++) seg(g, [top, [top[0] + s * h * 0.018 * ts, top[1] - h * 0.05 * ts + Math.abs(s) * h * 0.012 * ts]], ww, c); }
  g.restore();
}
export const OLD = { erect: 0, tasselScale: 1.9 };   // 1920s open-pollinated variety: droopy leaves, huge tassel
export const NEW = { erect: 1, tasselScale: 0.6 };   // modern hybrid: upright leaves, small tassel

// a whole row of plants; o.grow (0..1) scales heights; o.fn(i) per-plant overrides
export function cornRow(g, t, o = {}) {
  const { x0 = -E.W, x1 = E.W * 2, y, h = 520, step = 95, color, rim, seed = 3, grow = 1, wind = 1 } = o; const r = rng(seed);
  for (let x = x0, i = 0; x < x1; x += step * (0.8 + r() * 0.4), i++) {
    const hh = h * (0.85 + r() * 0.3) * grow, sway = (Math.sin(t * 1.1 + i * 0.7) * 10 + 6) * wind * (hh / 500);
    cornPlant(g, x, y + r() * 10, hh, { sway, seed: seed * 100 + i, color, rim, leaves: 6 + (i % 3) });
  }
}

export function wheatPatch(g, t, o = {}) {
  const { x0 = -E.W, x1 = E.W * 2, y, h = 220, color = '#c8a050', seed = 7 } = o; const r = rng(seed);
  g.fillStyle = shade(color, -0.45); g.fillRect(x0, y - h * 0.55, x1 - x0, h * 0.6);
  for (let x = x0; x < x1; x += 9) { const hh = h * (0.7 + r() * 0.4), sw = Math.sin(t * 1.4 + x * 0.02) * 8; seg(g, [[x, y], [x + sw, y - hh]], 3, shade(color, -0.2 - r() * 0.2)); g.fillStyle = shade(color, r() * 0.15); g.beginPath(); g.ellipse(x + sw, y - hh - 12, 4, 13, sw * 0.02, 0, 7); g.fill(); }
}

// full field set (flat sheet style). o: {mood, grow, wheat}
export function field(g, t, cam, o = {}) {
  const md = o.mood || 'golden', M = mood(md), GY = fieldGround(), CX = E.W / 2, INK = S().ink;
  const plant = M.grass, far = mix(M.grass, M.sky[1], 0.45);
  layer(g, cam, 0.1, (g) => {
    backdrop(g, M.sky);
    const sx = CX - V(380, 220), sy = GY - V(420, 760);
    if (md !== 'storm') { circle(g, sx, sy, V(70, 80), md === 'night' ? '#f4f0dc' : M.key); g.lineWidth = 3; g.strokeStyle = INK; g.beginPath(); g.arc(sx, sy, V(70, 80), 0, 7); g.stroke(); }
    const R = rng(5); for (let i = 0; i < 4; i++) cloud(g, -E.W * 0.3 + i * V(700, 520) + R() * 200, GY - V(620, 1050) + R() * 240, V(1, 1.1) * (0.8 + R() * 0.4), md === 'storm' ? '#b8c2cc' : '#ffffff');
  });
  layer(g, cam, 0.3, (g) => { hillsFlat(g, GY - V(150, 200), 50, far, 3); cornRow(g, t, { y: GY - V(140, 190), h: V(150, 190), step: 34, color: shade(far, -0.05), seed: 11, wind: 0.4 }); });
  layer(g, cam, 0.6, (g) => cornRow(g, t, { y: GY - V(40, 60), h: V(380, 470) * (o.grow ?? 1), step: 80, color: shade(plant, 0.02), seed: 21 }));
  layer(g, cam, 0.9, (g) => {
    g.fillStyle = M.floor; g.fillRect(-E.W, GY - 4, E.W * 3, E.H * 2);
    seg(g, [[-E.W, GY - 4], [E.W * 2, GY - 4]], 3, INK);
    for (let i = 0; i < 6; i++) { const y = GY + 30 + i * i * 22; seg(g, [[-E.W, y], [E.W * 2, y]], 2 + i * 0.4, alpha(INK, 0.25)); }
    if (o.wheat) wheatPatch(g, t, { x0: -E.W, x1: lerp(-E.W, E.W * 2, o.wheat * 0.55), y: GY + 40, h: V(200, 230), color: '#e2b85a' });
  });
  return { GY, CX, M, plant };
}
export function cloud(g, x, y, s = 1, col = '#ffffff') { g.save(); g.translate(x, y); g.scale(s, s); g.beginPath(); g.moveTo(-120, 30); g.arc(-70, 10, 50, Math.PI * 0.9, Math.PI * 1.75); g.arc(5, -15, 65, Math.PI * 1.15, Math.PI * 1.9); g.arc(80, 10, 45, Math.PI * 1.3, Math.PI * 0.1); g.lineTo(-120, 30); g.closePath(); g.fillStyle = col; g.fill(); g.lineWidth = 3; g.strokeStyle = S().ink; g.stroke(); g.restore(); }
export function hillsFlat(g, y, amp, col, seed = 3) { const R = rng(seed); g.beginPath(); g.moveTo(-E.W, E.H * 2); g.lineTo(-E.W, y); for (let x = -E.W; x <= E.W * 2; x += 120) g.lineTo(x, y - Math.abs(Math.sin(x * 0.003 + seed)) * amp - R() * 10); g.lineTo(E.W * 2, E.H * 2); g.closePath(); g.fillStyle = col; g.fill(); g.lineWidth = 3; g.strokeStyle = S().ink; g.stroke(); }

// molecules: CO2 (grey with two pale O) and O2 (two red balls)
export function co2(g, x, y, r = 22, a = 1) { g.save(); g.globalAlpha *= a; circle(g, x - r * 0.95, y, r * 0.65, '#cfd6dc'); circle(g, x + r * 0.95, y, r * 0.65, '#cfd6dc'); circle(g, x, y, r * 0.8, '#5a6068'); circle(g, x - r * 0.25, y - r * 0.25, r * 0.22, 'rgba(255,255,255,.4)'); g.restore(); }
export function o2(g, x, y, r = 22, a = 1) { g.save(); g.globalAlpha *= a; circle(g, x - r * 0.45, y, r * 0.7, '#e2483a'); circle(g, x + r * 0.45, y, r * 0.7, '#ff6b5a'); circle(g, x + r * 0.25, y - r * 0.25, r * 0.2, 'rgba(255,255,255,.5)'); g.restore(); }
export function sugar(g, x, y, s = 40, a = 1) { g.save(); g.globalAlpha *= a; rr(g, x - s / 2, y - s / 2, s, s, s * 0.15); g.fillStyle = '#fff6e4'; g.fill(); g.fillStyle = 'rgba(255,212,126,.6)'; g.fillRect(x - s / 2, y + s * 0.15, s, s * 0.35); glow(g, x, y, s * 1.4, S().ui.gold, 0.25); g.restore(); }
export function packet(g, x, y, s = 44, a = 1) { g.save(); g.globalAlpha *= a; rr(g, x - s / 2, y - s * 0.4, s, s * 0.8, 8); g.fillStyle = '#5aa0e0'; g.fill(); seg(g, [[x - s / 2, y - s * 0.05], [x + s / 2, y - s * 0.05]], 3, '#2a5a90'); text(g, 'C4', x, y + s * 0.18, { size: s * 0.36, color: '#fff', font: FONTS.ui, weight: 900 }); g.restore(); }

// floating molecules drifting in a box (deterministic). kinds: fraction red (O2)
export function molecules(g, t, o = {}) {
  const { count = 20, area = [0, 0, E.W, E.H], red = 0.2, seed = 4, r = 20, a = 1, speed = 30 } = o; const R = rng(seed);
  for (let i = 0; i < count; i++) {
    const bx = area[0] + R() * area[2], by = area[1] + R() * area[3], ph = R() * 7, isRed = R() < red;
    const x = bx + Math.sin(t * 0.6 + ph) * speed, y = by + Math.cos(t * 0.5 + ph * 1.3) * speed;
    (isRed ? o2 : co2)(g, x, y, r, a);
  }
}

// the inside of a leaf cell: a warm-green room with membrane walls and chloroplast discs; characters stand on GY
export function cell(g, t, cam, o = {}) {
  const M = mood('void'), GY = E.H * V(0.8, 0.68), tint = o.hot ? '#ff7a3a' : S().ui.blueprint;
  layer(g, cam, 0.4, (g) => {
    backdrop(g, [shade(M.sky[0], 0.05), mix(M.sky[1], tint, 0.12)]);
    for (let i = 0; i < 7; i++) { const x = (i - 1) * V(330, 260) + 60, y = GY - V(420, 640) + (i % 2) * 120; g.fillStyle = alpha(mix(tint, '#2a6a3a', 0.6), 0.35); g.beginPath(); g.ellipse(x, y, V(130, 110), V(60, 50), 0.3 * (i % 3 - 1), 0, 7); g.fill(); for (let k = -2; k <= 2; k++) seg(g, [[x - 70, y + k * 14], [x + 70, y + k * 14]], 4, alpha(tint, 0.18)); }
  });
  layer(g, cam, 0.8, (g) => {
    g.strokeStyle = alpha(tint, 0.5); g.lineWidth = 14; rr(g, -40, V(60, 160), E.W + 80, GY - V(60, 160) + 40, 160); g.stroke();
    glow(g, E.W / 2, GY - 300, E.W * 0.7, tint, 0.12);
  });
  layer(g, cam, 0.9, (g) => { g.fillStyle = linGrad(g, 0, GY, 0, GY + 500, [shade(M.floor, 0.12), M.dark]); g.fillRect(-E.W, GY, E.W * 3, E.H); FX.pool(g, E.W / 2, GY + 20, 420, 60, tint, 0.25); });
  if (o.hot) { g.save(); g.globalCompositeOperation = 'soft-light'; g.fillStyle = 'rgba(255,90,30,.35)'; g.fillRect(0, 0, E.W, E.H); g.restore(); }
  return { GY, M, tint };
}

// Kranz anatomy cross-section (blueprint). o: {outer, inner, vein} highlight 0..1
export function crossSection(g, t, o = {}) {
  const c = S().ui.blueprint, gold = S().ui.gold, cx = o.cx ?? E.W / 2, cy = o.cy ?? E.H * V(0.48, 0.4), R = o.R ?? V(300, 380);
  const outer = o.outer || 0, inner = o.inner || 0;
  for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2, x = cx + Math.cos(a) * R, y = cy + Math.sin(a) * R; const col = mix(c, gold, outer); g.fillStyle = alpha(col, 0.1 + 0.15 * outer); g.beginPath(); g.ellipse(x, y, R * 0.17, R * 0.13, a, 0, 7); g.fill(); g.strokeStyle = alpha(col, 0.6 + 0.4 * outer); g.lineWidth = 3; g.stroke(); }
  for (let i = 0; i < 9; i++) { const a = (i / 9) * Math.PI * 2 + 0.2, x = cx + Math.cos(a) * R * 0.5, y = cy + Math.sin(a) * R * 0.5; const col = mix(c, gold, inner); g.fillStyle = alpha(col, 0.12 + 0.2 * inner); g.beginPath(); g.ellipse(x, y, R * 0.19, R * 0.16, a, 0, 7); g.fill(); g.strokeStyle = alpha(col, 0.7 + 0.3 * inner); g.lineWidth = 4; g.stroke(); }
  circle(g, cx, cy, R * 0.26, alpha(c, 0.15)); ring(g, cx, cy, R * 0.26, 4, alpha(c, 0.8));
  for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; ring(g, cx + Math.cos(a) * R * 0.12, cy + Math.sin(a) * R * 0.12, R * 0.06, 2, alpha(c, 0.6)); }
  return { cx, cy, R };
}

// stoma (leaf pore) seen from above: two guard cells around a slit. open 0..1
export function stoma(g, x, y, w, open, o = {}) {
  const col = o.color || '#5fae6a', hl = o.rim || '#d8ffd0';
  for (const s of [-1, 1]) { g.fillStyle = col; g.beginPath(); g.ellipse(x + s * w * (0.22 + 0.12 * open), y, w * 0.26, w * 0.5, 0, 0, 7); g.fill(); g.strokeStyle = alpha(hl, 0.5); g.lineWidth = 3; g.stroke(); }
  g.fillStyle = '#071008'; g.beginPath(); g.ellipse(x, y, Math.max(1.5, w * 0.16 * open), w * 0.38, 0, 0, 7); g.fill();
}

// soil thermometer; val in °C (0..20 scale)
export function thermometer(g, x, y, h, val, o = {}) {
  const gold = S().ui.gold, hot = val >= 10, col = hot ? '#ff5a3a' : '#7fc8ff', top = y - h, k = clamp(val / 20);
  rr(g, x - 24, top, 48, h, 24); g.fillStyle = 'rgba(230,240,255,.18)'; g.fill(); g.strokeStyle = 'rgba(230,240,255,.7)'; g.lineWidth = 4; g.stroke();
  circle(g, x, y + 18, 44, col); glow(g, x, y + 18, 120, col, 0.4);
  rr(g, x - 12, lerp(y, top + 16, k), 24, y - lerp(y, top + 16, k) + 10, 12); g.fillStyle = col; g.fill();
  for (let v = 0; v <= 20; v += 5) { const ty = lerp(y, top + 16, v / 20); seg(g, [[x + 30, ty], [x + (v % 10 ? 46 : 60), ty]], 3, 'rgba(230,240,255,.7)'); if (v % 10 === 0) text(g, v + '°', x + 100, ty, { size: 38, color: v === 10 ? gold : 'rgba(230,240,255,.85)', font: FONTS.ui, weight: 900 }); }
}

// ---------- new for this video ----------
// corn cob close-up (vertical). o: {fill 0..1 (kernels filled from bottom), rows highlight 0..1, husk, outline (blueprint stroke colour), tilt, glowA}
export function cob(g, cx, cy, len, o = {}) {
  const { fill = 1, husk = true, outline = null, tilt = 0, hl = -1, glowA = 0.25, wid = len * 0.34, cols = 8 } = o;
  const ui = S().ui, kern = '#f2c24a', kernD = '#c9902a';
  g.save(); g.translate(cx, cy); g.rotate(tilt);
  const half = len / 2, rad = (v) => wid / 2 * (1 - Math.pow(Math.max(0, (-v - half * 0.35) / (half * 0.65)), 2) * 0.55) * (v > half * 0.8 ? 1 - (v - half * 0.8) / (half * 0.2) * 0.25 : 1);
  const INK = S().ink;
  if (!outline) { g.beginPath(); for (let i = 0; i <= 40; i++) { const v = -half + i / 40 * len; g.lineTo(rad(v) + 3, v); } for (let i = 40; i >= 0; i--) { const v = -half + i / 40 * len; g.lineTo(-rad(v) - 3, v); } g.closePath(); g.fillStyle = '#e8b640'; g.fill(); g.lineWidth = 5; g.strokeStyle = INK; g.stroke(); }
  const rowsN = 26;
  for (let i = 0; i < rowsN; i++) {
    const v = -half + (i + 0.5) * len / rowsN, R = rad(v), k = 1 - (i + 0.5) / rowsN, on = k <= fill + 1e-6;
    for (let c = 0; c < cols; c++) {
      const a0 = -Math.PI / 2 + (c + 0.5) / cols * Math.PI, xx = Math.cos(a0 + Math.PI / 2 - Math.PI / 2) * 0, px = Math.sin((c + 0.5) / cols * Math.PI - Math.PI / 2) * R * 0.92;
      const kw = Math.max(3, R * 2 / cols * Math.cos(((c + 0.5) / cols - 0.5) * Math.PI) * 0.92), kh = len / rowsN * 0.86;
      const isHl = hl >= 0 && Math.abs(c - (hl * (cols + 2) - 1)) < 0.7;
      if (outline) { rr(g, px - kw / 2, v - kh / 2, kw, kh, Math.min(kw, kh) * 0.35); g.strokeStyle = alpha(isHl ? ui.gold : outline, isHl ? 0.95 : 0.55); g.lineWidth = 2; g.stroke(); continue; }
      rr(g, px - kw / 2, v - kh / 2, kw, kh, Math.min(kw, kh) * 0.35);
      g.fillStyle = on ? (isHl ? '#fff3c0' : mix(kern, kernD, Math.abs((c + 0.5) / cols - 0.5) * 1.2)) : '#f3ecd6'; g.fill(); g.lineWidth = 1.8; g.strokeStyle = alpha(INK, on ? 0.85 : 0.35); g.stroke();
      if (on) { g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(px - kw * 0.3, v - kh * 0.35, kw * 0.25, kh * 0.3); }
    }
  }
  if (husk && !outline) { for (const s of [-1, 1]) { g.beginPath(); g.moveTo(s * wid * 0.15, half + 30); g.quadraticCurveTo(s * wid * 1.05, half * 0.25, s * wid * 0.8, -half * 0.25); g.quadraticCurveTo(s * wid * 0.5, half * 0.4, 0, half + 40); g.closePath(); g.fillStyle = s < 0 ? '#78b45f' : '#8cc46e'; g.fill(); g.lineWidth = 4; g.strokeStyle = INK; g.lineJoin = 'round'; g.stroke(); } }
  if (outline) { g.strokeStyle = outline; g.lineWidth = 4; g.beginPath(); for (let i = 0; i <= 40; i++) { const v = -half + i / 40 * len; g.lineTo(rad(v), v); } for (let i = 40; i >= 0; i--) { const v = -half + i / 40 * len; g.lineTo(-rad(v), v); } g.closePath(); g.stroke(); }
  g.restore();
}

// top-down plot: square of side `size` centred at (cx,cy) with n plants on a grid; o.reveal 0..1, o.soil, o.line, o.plant
export function plot(g, cx, cy, size, n, o = {}) {
  const { reveal = 1, soil = '#2a1e16', line = S().ui.cream, plant = '#5fae4a', seed = 9, r = null, label = null, aspect = 1, shuffle = false } = o;
  const rank = Array.from({ length: n }, (_, i) => i); if (shuffle) { const Q = rng(seed + 77); for (let i = n - 1; i > 0; i--) { const j = Math.floor(Q() * (i + 1)); [rank[i], rank[j]] = [rank[j], rank[i]]; } }
  const W = size, H = size * aspect, x0 = cx - W / 2, y0 = cy - H / 2;
  rr(g, x0, y0, W, H, 10); g.fillStyle = soil; g.fill();
  const rows = Math.max(1, Math.round(Math.sqrt(n * H / W))), per = Math.ceil(n / rows), R = rng(seed), pr = r ?? Math.min(W / per, H / rows) * 0.36;
  for (let i = 0, k = 0; i < rows; i++) {
    const yy = y0 + (i + 0.5) * H / rows; seg(g, [[x0 + 8, yy], [x0 + W - 8, yy]], 2, 'rgba(0,0,0,.25)');
    for (let j = 0; j < per && k < n; j++, k++) {
      const a = clamp(reveal * n - rank[k]); if (a <= 0) { R(); R(); continue; }
      const xx = x0 + (j + 0.5) * W / per + (R() - 0.5) * pr * 0.4, y2 = yy + (R() - 0.5) * pr * 0.3, s = pr * ease.outBack(a);
      for (let l = 0; l < 4; l++) { const ang = l * Math.PI / 2 + k; g.beginPath(); g.ellipse(xx + Math.cos(ang) * s * 0.5, y2 + Math.sin(ang) * s * 0.5, s * 0.6, s * 0.18, ang, 0, 7); g.fillStyle = plant; g.fill(); g.lineWidth = 2; g.strokeStyle = S().ink; g.stroke(); }
      circle(g, xx, y2, s * 0.22, shade(plant, 0.3)); g.lineWidth = 2; g.strokeStyle = S().ink; g.beginPath(); g.arc(xx, y2, s * 0.22, 0, 7); g.stroke();
    }
  }
  g.strokeStyle = S().ink; g.lineWidth = 4; rr(g, x0, y0, W, H, 10); g.stroke();
  if (label) text(g, label, cx, y0 - V(40, 50), { size: V(36, 44), color: line, font: FONTS.ui, weight: 900, spacing: 2 });
}

// grain sack (one tonne). x,y = bottom centre
export function sack(g, x, y, s = 1, a = 1) { g.save(); g.globalAlpha *= a; g.translate(x, y); g.scale(s, s); g.fillStyle = '#c9b48a'; g.beginPath(); g.moveTo(-50, 0); g.quadraticCurveTo(-62, -60, -38, -96); g.lineTo(38, -96); g.quadraticCurveTo(62, -60, 50, 0); g.closePath(); g.fill(); g.lineWidth = 3; g.strokeStyle = S().ink; g.stroke(); g.fillStyle = '#a8946a'; g.fillRect(-40, -104, 80, 14); g.strokeRect(-40, -104, 80, 14); g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(-48, -14, 96, 14); text(g, '1 т', 0, -48, { size: 30, color: '#5a4630', font: FONTS.ui, weight: 900 }); g.restore(); }

// side-view tractor (flat). x,y = ground under the rear wheel
export function tractor(g, x, y, s = 1, t = 0) {
  const INK = S().ink, O = () => { g.lineWidth = 3.5; g.strokeStyle = INK; g.stroke(); };
  g.save(); g.translate(x, y); g.scale(s, s); g.lineJoin = 'round';
  rr(g, -40, -170, 210, 72, 10); g.fillStyle = '#d9553a'; g.fill(); O();
  rr(g, -62, -285, 116, 125, 10); g.fillStyle = '#d9553a'; g.fill(); O(); rr(g, -48, -270, 88, 62, 6); g.fillStyle = '#d6ecef'; g.fill(); O();
  rr(g, 112, -238, 14, 70, 4); g.fillStyle = '#5a5450'; g.fill(); O();
  for (const [wx, r] of [[0, 78], [178, 46]]) { g.beginPath(); g.arc(wx, -r, r, 0, 7); g.fillStyle = '#3a3532'; g.fill(); O(); g.beginPath(); g.arc(wx, -r, r * 0.5, 0, 7); g.fillStyle = '#f2c24a'; g.fill(); O(); const a = t * 3; seg(g, [[wx, -r], [wx + Math.cos(a) * r * 0.45, -r + Math.sin(a) * r * 0.45]], 4, INK); }
  g.restore();
}

// side-view car (flat). x,y = ground centre
export function car(g, x, y, s = 1, t = 0, col, lamp, facing = 1) {
  const INK = S().ink, O = () => { g.lineWidth = 3.5; g.strokeStyle = INK; g.stroke(); };
  g.save(); g.translate(x, y); g.scale(s * facing, s); g.lineJoin = 'round';
  g.beginPath(); g.moveTo(-110, -88); g.lineTo(-70, -150); g.lineTo(70, -150); g.lineTo(120, -88); g.closePath(); g.fillStyle = '#4f86c0'; g.fill(); O();
  rr(g, -170, -92, 340, 64, 22); g.fillStyle = '#4f86c0'; g.fill(); O();
  for (const pts of [[[-95, -94], [-62, -140], [-4, -140], [-4, -94]], [[6, -94], [6, -140], [64, -140], [100, -94]]]) { g.beginPath(); pts.forEach((q, i) => i ? g.lineTo(...q) : g.moveTo(...q)); g.closePath(); g.fillStyle = '#d6ecef'; g.fill(); O(); }
  for (const wx of [-105, 105]) { g.beginPath(); g.arc(wx, -30, 32, 0, 7); g.fillStyle = '#3a3532'; g.fill(); O(); g.beginPath(); g.arc(wx, -30, 13, 0, 7); g.fillStyle = '#c9c9c9'; g.fill(); O(); }
  rr(g, 156, -78, 16, 14, 4); g.fillStyle = '#ffd34d'; g.fill(); O();
  g.restore();
}

// roots under the ground: k = strength 0..1
export function roots(g, x, y, h, k = 1, col = '#d8c08a', seed = 5) { col = '#f2e2b8'; const R = rng(seed); for (let i = 0; i < 9; i++) { const a = -0.5 + i / 8, len = h * (0.5 + R() * 0.5) * (0.5 + 0.5 * k); g.strokeStyle = col; g.lineWidth = 3 + 4 * k; g.lineCap = 'round'; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + a * len * 0.4, y + len * 0.35, x + a * len * 0.9, y + len); g.stroke(); } }

// falling pollen grains in a column; land = y where they stop (or null to pass through)
export function pollen(g, t, o = {}) { const { x = E.W / 2, y = 0, w = 200, h = 600, count = 40, seed = 6, a = 1, col = S().ui.gold, speed = 120 } = o; const R = rng(seed); for (let i = 0; i < count; i++) { const px = x + (R() - 0.5) * w + Math.sin(t * 1.5 + i) * 12, py = y + ((R() * h + t * speed * (0.7 + R() * 0.6)) % h); circle(g, px, py, 5, alpha('#e0a020', a)); g.lineWidth = 1.5; g.strokeStyle = alpha(S().ink, a * 0.8); g.beginPath(); g.arc(px, py, 5, 0, 7); g.stroke(); } }
