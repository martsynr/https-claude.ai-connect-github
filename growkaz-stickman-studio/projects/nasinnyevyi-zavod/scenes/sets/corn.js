// sets/corn.js — corn field (any mood), wheat patch, the leaf-cell "room", Kranz cross-section, stomata, thermometer.
import { E, V, S, mood, layer, blurLayer, backdrop, rr, seg, circle, ring, poly, linGrad, radGrad, glow, alpha, shade, mix, text, FONTS, ease, prog, clamp, lerp, rng } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';

export const fieldGround = () => E.H * V(0.8, 0.68);

// one corn plant: x,y = base, h = height. o: {sway, seed, color, rim, tassel, ear, leaves, w}
export function cornPlant(g, x, y, h, o = {}) {
  const { sway = 0, seed = 1, color = '#1c2a1a', rim = null, tassel = true, ear = h > 300, leaves = 7, w = Math.max(4, h * 0.018) } = o;
  const r = rng(seed), top = [x + sway, y - h], P = (k) => [x + sway * k * k, y - h * k];
  g.strokeStyle = color; g.lineWidth = w; g.lineCap = 'round'; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + sway * 0.25, y - h * 0.5, top[0], top[1]); g.stroke();
  if (rim) { g.strokeStyle = alpha(rim, 0.55); g.lineWidth = Math.max(1.5, w * 0.25); g.beginPath(); g.moveTo(x + w * 0.4, y); g.quadraticCurveTo(x + sway * 0.25 + w * 0.4, y - h * 0.5, top[0] + w * 0.3, top[1]); g.stroke(); }
  for (let i = 0; i < leaves; i++) {
    const k = 0.12 + (i / leaves) * 0.78, [bx, by] = P(k), side = i % 2 ? 1 : -1, len = h * (0.42 - k * 0.22) * (0.85 + r() * 0.3), droop = 0.5 + r() * 0.4;
    const tip = [bx + side * len + sway * 0.3, by - len * 0.15 + len * droop * 0.45], c1 = [bx + side * len * 0.45, by - len * 0.45];
    g.fillStyle = color; g.beginPath(); g.moveTo(bx, by); g.quadraticCurveTo(c1[0], c1[1], tip[0], tip[1]); g.quadraticCurveTo(c1[0] + side * 6, c1[1] + len * 0.12, bx, by + w * 2.2); g.fill();
    if (rim) { g.strokeStyle = alpha(rim, 0.4); g.lineWidth = 1.5; g.beginPath(); g.moveTo(bx, by); g.quadraticCurveTo(c1[0], c1[1], tip[0], tip[1]); g.stroke(); }
  }
  if (ear) {                                                       // cob in husk + silk
    const [ex, ey] = P(0.55); g.save(); g.translate(ex + w * 0.6, ey); g.rotate(0.35);
    g.fillStyle = mix(color, '#9fb070', 0.35); g.beginPath(); g.ellipse(0, 0, w * 1.3, h * 0.07, 0, 0, 7); g.fill();
    for (let s = -2; s <= 2; s++) seg(g, [[0, -h * 0.07], [s * 4, -h * 0.07 - 14 - Math.abs(s) * 2]], 2, alpha('#d9b46a', 0.8));
    g.restore();
  }
  if (tassel) for (let s = -3; s <= 3; s++) seg(g, [top, [top[0] + s * h * 0.018, top[1] - h * 0.05 + Math.abs(s) * h * 0.012]], Math.max(1.5, w * 0.35), mix(color, '#c9a860', 0.35));
}

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

// full field set. o: {mood, grow, wheat (0..1 = how much of the frame is wheat, from left), fg}
export function field(g, t, cam, o = {}) {
  const md = o.mood || 'golden', M = mood(md), GY = fieldGround(), CX = E.W / 2;
  const plant = shade(M.grass, md === 'night' ? -0.55 : -0.5), far = mix(M.sky[0], plant, 0.55);
  layer(g, cam, 0.1, (g) => {
    backdrop(g, M.sky);
    if (md === 'night' || md === 'storm') { FX.stars(g, t, { count: 160, area: [-E.W, -E.H, E.W * 3, E.H * 1.4] }); FX.moon(g, CX + V(420, 250), GY - V(640, 1050), 42); }
    else { FX.sun(g, CX - V(380, 200), GY - V(420, 700), V(60, 70), '#fff3dc', M.key, 5); FX.godRays(g, CX - V(380, 200), GY - V(420, 700), { count: 12, angle: Math.PI / 2, spread: Math.PI * 1.4, len: 1600, a: 0.05, t }); }
    FX.clouds(g, { y: GY - V(700, 1150), h: 160, color: '#ffe7c7', a: md === 'night' ? 0.04 : 0.1, seed: 5 });
  });
  layer(g, cam, 0.3, (g) => { g.fillStyle = far; g.fillRect(-E.W, GY - V(150, 200), E.W * 3, E.H); FX.hills(g, { y: GY - V(150, 200), amp: 40, color: far, seed: 3 }); cornRow(g, t, { y: GY - V(140, 190), h: V(150, 190), step: 30, color: shade(far, -0.1), seed: 11, wind: 0.4 }); });
  layer(g, cam, 0.6, (g) => cornRow(g, t, { y: GY - V(40, 60), h: V(380, 470) * (o.grow ?? 1), step: 80, color: shade(plant, 0.08), rim: alpha(M.rim, 0.5), seed: 21 }));
  layer(g, cam, 0.9, (g) => {
    g.fillStyle = linGrad(g, 0, GY, 0, GY + 600, [shade(M.floor, -0.15), shade(M.dark, -0.35)]); g.fillRect(-E.W, GY - 4, E.W * 3, E.H * 2);
    for (let i = 0; i < 6; i++) { const y = GY + 30 + i * i * 22; seg(g, [[-E.W, y], [E.W * 2, y]], 3 + i, alpha('#000000', 0.12)); }
    if (o.wheat) wheatPatch(g, t, { x0: -E.W, x1: lerp(-E.W, E.W * 2, o.wheat * 0.55), y: GY + 40, h: V(200, 230), color: mix(M.key, M.floor, 0.35) });
  });
  return { GY, CX, M, plant };
}

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
