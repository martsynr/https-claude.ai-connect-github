// sets/world.js — corn plants, ears, equines and the four locations (field, drought, lab, pasture).
import { E, V, mood, layer, backdrop, rr, seg, circle, poly, linGrad, glow, alpha, shade, mix, rng, clamp, lerp } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';

export const GROUND = () => E.H * V(0.8, 0.68);
const GREEN = '#4f9a3c', DRY = '#9a7840', DEAD = '#6e5636';

// One corn plant standing at (x, y) with height h. health 1 = lush green, 0 = dry brown and drooping.
export function cornPlant(g, x, y, h, o = {}) {
  const { t = 0, health = 1, seed = 1, ear = true, a = 1, tint = null, lit = '#ffd36a', w = 1 } = o;
  const r = rng(seed); const sway = Math.sin(t * 1.3 + seed * 1.7) * h * 0.012 * health;
  let col = health >= 0.5 ? mix(DRY, GREEN, (health - 0.5) * 2) : mix(DEAD, DRY, health * 2);
  if (tint) col = mix(col, tint, 0.55);
  const dark = shade(col, -0.35), droop = 1 - health;
  g.save(); g.globalAlpha *= a;
  const top = [x + sway, y - h];
  seg(g, [[x, y], [x + sway * 0.5, y - h * 0.5], top], Math.max(3, h * 0.028 * w), dark);
  // leaves: alternate sides, arch up then hang; droop pulls the tips to the ground
  for (let i = 0; i < 6; i++) {
    const k = 0.18 + i * 0.12, side = i % 2 ? 1 : -1, lx = x + sway * k, ly = y - h * k;
    const len = h * (0.42 - i * 0.03) * (0.9 + r() * 0.2), up = h * (0.12 - droop * 0.2);
    const tipx = lx + side * len, tipy = ly - up + h * droop * 0.35 + len * 0.15;
    g.strokeStyle = i % 2 ? col : shade(col, -0.12); g.lineWidth = Math.max(2.5, h * 0.035 * w); g.lineCap = 'round';
    g.beginPath(); g.moveTo(lx, ly); g.quadraticCurveTo(lx + side * len * 0.45, ly - up * 1.6, tipx, tipy); g.stroke();
  }
  // ear in husk + silk
  if (ear) { const ex = x + sway * 0.55 + h * 0.035, ey = y - h * 0.52; g.save(); g.translate(ex, ey); g.rotate(0.35);
    g.fillStyle = shade(col, 0.05); g.beginPath(); g.ellipse(0, 0, h * 0.03, h * 0.09, 0, 0, 7); g.fill();
    g.fillStyle = health > 0.4 ? '#e8c45a' : '#b08a4a'; g.beginPath(); g.ellipse(h * 0.006, -h * 0.03, h * 0.018, h * 0.05, 0, 0, 7); g.fill();
    seg(g, [[0, -h * 0.09], [h * 0.02, -h * 0.13]], 2, '#c98a5a'); g.restore(); }
  // tassel
  for (let j = -2; j <= 2; j++) seg(g, [top, [top[0] + j * h * 0.03 + droop * h * 0.04, top[1] - h * 0.07 + Math.abs(j) * h * 0.02 + droop * h * 0.05]], 2, health > 0.4 ? '#d8b860' : '#8a7048');
  // rim light on the sun side
  seg(g, [[x + 2, y - h * 0.2], [top[0] + 2, top[1] + h * 0.05]], 1.5, alpha(lit, 0.55 * health + 0.15));
  g.restore();
}

// A big corn ear lying horizontally (kernels grid), centred on (x, y), length L
export function cornEar(g, x, y, L, o = {}) {
  const { rot = 0, color = '#f0c34a', husk = '#7a9a4a', glowA = 0 } = o; const H = L * 0.3;
  g.save(); g.translate(x, y); g.rotate(rot);
  if (glowA) glow(g, 0, 0, L * 0.9, color, glowA);
  g.fillStyle = husk; g.beginPath(); g.moveTo(-L * 0.62, 0); g.quadraticCurveTo(-L * 0.2, -H * 0.9, L * 0.1, -H * 0.2); g.quadraticCurveTo(-L * 0.2, H * 0.9, -L * 0.62, 0); g.fill();
  g.fillStyle = shade(color, -0.15); g.beginPath(); g.ellipse(0, 0, L / 2, H / 2, 0, 0, 7); g.fill();
  const cols = 14, rows = 5;
  for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
    const u = (i + 0.5) / cols * 2 - 1, v = (j + 0.5) / rows * 2 - 1, taper = Math.sqrt(Math.max(0, 1 - u * u));
    const kx = u * L / 2 * 0.92, ky = v * H / 2 * taper * 0.85, kr = L * 0.026 * (0.5 + 0.5 * taper);
    circle(g, kx, ky, kr, mix(color, '#ffffff', 0.12 - Math.abs(v) * 0.15)); circle(g, kx - kr * 0.3, ky - kr * 0.35, kr * 0.35, alpha('#fff6d0', 0.6));
  }
  g.restore();
}

// Horse / donkey / mule silhouette, standing on y, facing +1 (right) or -1. Drawn twice: rim offset, then ink.
export function equine(g, x, y, s, o = {}) {
  const { kind = 'horse', facing = 1, t = 0, rim = '#ffc68a', ink = '#0a0d0b', head = 0 } = o;
  const ear = kind === 'horse' ? 16 : kind === 'mule' ? 34 : 44, tall = kind === 'donkey' ? 0.8 : kind === 'mule' ? 0.92 : 1;
  const shape = (col) => {
    g.save(); g.translate(x, y); g.scale(s * facing, s * tall);
    const by = -120, nod = Math.sin(t * 1.4) * 4 + head;
    g.fillStyle = col; g.beginPath(); g.ellipse(0, by, 92, 40, 0, 0, 7); g.fill();
    for (const [lx, ph] of [[-62, 0], [-44, 1], [52, 2], [70, 3]]) seg(g, [[lx, by + 10], [lx + Math.sin(t + ph) * 2, -2]], 15, col);
    seg(g, [[60, by - 10], [104, by - 82 + nod]], 34, col);
    g.save(); g.translate(112, by - 88 + nod); g.rotate(0.55); g.fillStyle = col; g.beginPath(); g.ellipse(18, 6, 46, 19, 0, 0, 7); g.fill(); g.restore();
    seg(g, [[100, by - 100 + nod], [96 - ear * 0.15, by - 100 - ear + nod]], 9, col);
    seg(g, [[-90, by - 8], [-108, by + 40], [-104, by + 70]], kind === 'horse' ? 12 : 6, col);
    if (kind !== 'horse') circle(g, -104, by + 72, 9, col);
    g.restore();
  };
  g.save(); g.translate(-4 * facing, -4); shape(rim); g.restore(); shape(ink);
  g.save(); g.fillStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.ellipse(x, y + 2, 120 * s, 12 * s, 0, 0, 7); g.fill(); g.restore();
}

// ── FIELD: corn field at golden hour ─────────────────────────────────────────
export function field(g, t, cam, o = {}) {
  const M = mood(o.mood || 'golden'), GY = GROUND(), CX = E.W / 2, ghost = o.ghost ?? 1;
  layer(g, cam, 0.12, (g) => {
    backdrop(g, M.sky);
    FX.sun(g, CX + V(520, 260), GY - V(380, 560), V(70, 80), '#fff3dc', M.key, 5);
    FX.godRays(g, CX + V(520, 260), GY - V(380, 560), { count: 12, angle: Math.PI * 0.75, spread: Math.PI * 0.9, len: 1800, a: 0.05, t });
    FX.clouds(g, { y: GY - V(800, 1200), h: 160, color: '#fff0c8', a: 0.14, seed: 3 });
  });
  layer(g, cam, 0.3, (g) => FX.hills(g, { seed: 4, y: GY - V(170, 240), amp: 50, color: shade(M.grass, -0.45), freq: 0.003 }));
  layer(g, cam, 0.5, (g) => {               // far rows: dense silhouettes
    g.fillStyle = shade(M.grass, -0.5); g.fillRect(-E.W, GY - V(120, 170), E.W * 3, E.H);
    for (let i = 0, x = -E.W; x < E.W * 2; x += 26, i++) cornPlant(g, x, GY - V(100, 150), V(110, 150), { t, seed: i, ear: false, health: o.health ?? 1, tint: shade(M.grass, -0.55), a: 0.9 * ghost, w: 1.4 });
  });
  layer(g, cam, 0.75, (g) => {              // mid rows
    for (let i = 0, x = -E.W; x < E.W * 2; x += 62, i++) cornPlant(g, x + (i % 2) * 20, GY - V(40, 70), V(250, 330), { t, seed: i + 50, health: o.health ?? 1, tint: shade(M.grass, -0.3), a: ghost, lit: M.rim });
  });
  layer(g, cam, 0.9, (g) => {               // ground with furrows
    g.fillStyle = linGrad(g, 0, GY - 40, 0, GY + 700, [shade(M.floor, 0.05), shade(M.dark, -0.2)]); g.fillRect(-E.W, GY - 40, E.W * 3, E.H * 2);
    for (let k = 0; k < 7; k++) { const yy = GY - 20 + k * k * 9 + k * 14; seg(g, [[-E.W, yy], [E.W * 2, yy]], 2 + k * 0.6, alpha('#000', 0.18)); }
    FX.pool(g, CX + V(200, 120), GY + 20, 600, 80, M.key, 0.18);
  });
  return { GY, CX, M };
}

// ── DROUGHT: same farmland, scorched ─────────────────────────────────────────
export function drought(g, t, cam, o = {}) {
  const M = { ...mood('day'), sky: ['#e8c48a', '#c8803e', '#8a4a22'], key: '#fff6d8', rim: '#ffe2a0', floor: '#7a5a38', dark: '#3a2618', grass: '#7a6a3a' };
  const GY = GROUND(), CX = E.W / 2;
  layer(g, cam, 0.12, (g) => {
    backdrop(g, M.sky);
    FX.sun(g, CX - V(300, 150), GY - V(700, 1050), V(110, 130), '#ffffff', '#fff2c0', 6);
    FX.godRays(g, CX - V(300, 150), GY - V(700, 1050), { count: 16, angle: Math.PI / 2, spread: Math.PI * 1.4, len: 2200, a: 0.07, t });
  });
  layer(g, cam, 0.3, (g) => FX.hills(g, { seed: 9, y: GY - V(150, 210), amp: 40, color: '#9a6a44', freq: 0.003 }));
  layer(g, cam, 0.55, (g) => {
    g.fillStyle = '#7a5434'; g.fillRect(-E.W, GY - V(110, 150), E.W * 3, E.H);
    for (let i = 0, x = -E.W; x < E.W * 2; x += 40, i++) cornPlant(g, x, GY - V(90, 130), V(120, 160), { t, seed: i, ear: false, health: o.farHealth ?? 0.1, tint: '#5a3a24', a: 0.9 });
  });
  layer(g, cam, 0.9, (g) => {
    g.fillStyle = linGrad(g, 0, GY - 40, 0, GY + 700, ['#8a6440', '#4a2e1c']); g.fillRect(-E.W, GY - 40, E.W * 3, E.H * 2);
    const r = rng(77); g.strokeStyle = 'rgba(40,22,12,.55)'; g.lineCap = 'round';
    for (let i = 0; i < 60; i++) { let x = -E.W + r() * E.W * 3, y = GY + r() * 700; g.lineWidth = 1.5 + r() * 2.5; g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 4; k++) { x += (r() - 0.5) * 140; y += (r() - 0.3) * 40; g.lineTo(x, y); } g.stroke(); }
  });
  g.save(); g.fillStyle = 'rgba(40,16,4,.22)'; g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3); g.restore();
  // heat haze bands
  for (let i = 0; i < 4; i++) { const y = GY - V(140, 200) + i * 26 + Math.sin(t * 2 + i) * 6; g.fillStyle = alpha('#fff4d6', 0.06); g.fillRect(-E.W, y, E.W * 3, 10); }
  return { GY, CX, M };
}

// ── LAB: breeder's greenhouse lab ────────────────────────────────────────────
export function lab(g, t, cam, o = {}) {
  const M = mood('interiorWarm'), GY = GROUND(), CX = E.W / 2;
  layer(g, cam, 0.35, (g) => {
    g.fillStyle = linGrad(g, 0, -E.H, 0, GY, [M.dark, M.wall]); g.fillRect(-E.W, -E.H, E.W * 3, GY + E.H * 2);
    const wx = CX - V(420, 400), wy = GY - V(620, 1000), ww = V(840, 800), wh = V(420, 640);
    FX.windowFrame(g, { x: wx, y: wy, w: ww, h: wh, cols: 4, rows: 2, frame: shade(M.wall, -0.55), bar: 10 }, (g, x, y, w, h) => {
      g.fillStyle = linGrad(g, 0, y, 0, y + h, ['#3a6a4a', '#9ac06a', '#f2d88a']); g.fillRect(x, y, w, h);
      FX.sun(g, x + w * 0.7, y + h * 0.55, 50, '#fff7e6', M.key, 4);
      for (let i = 0; i < 18; i++) cornPlant(g, x + i * (w / 17), y + h, h * 0.45, { t, seed: i + 300, ear: false, tint: '#2a4a30', a: 0.8 });
    });
    FX.godRays(g, CX + V(160, 160), GY - V(460, 700), { count: 10, angle: Math.PI * 0.62, spread: 0.7, len: 1400, a: 0.05, t });
  });
  layer(g, cam, 0.7, (g) => {
    FX.counter(g, { x: CX - V(600, 520), y: GY - 30, w: V(1200, 1040), h: 120, color: shade(M.wall, -0.45), top: shade(M.wall, -0.2), doors: 8 });
    FX.screen(g, { x: CX + V(330, 250), y: GY - 280, w: 150, h: 100, glowC: '#9fe08a', a: 0.22 }, (g, x, y, w, h) => { g.strokeStyle = '#9fe08a'; g.lineWidth = 3; g.beginPath(); for (let i = 0; i <= 20; i++) g.lineTo(x + 10 + i * 6.5, y + h - 14 - Math.pow(i / 20, 2) * (h - 30) - Math.sin(i + t * 2) * 2); g.stroke(); });
    g.fillStyle = linGrad(g, 0, GY - 30, 0, GY + 600, [shade(M.floor, 0.1), M.dark]); g.fillRect(-E.W, GY - 30, E.W * 3, E.H * 2);
    FX.floorLines(g, GY - 30, GY + 600, 'rgba(0,0,0,.2)', 0.07);
    FX.pool(g, CX, GY + 10, 420, 70, M.key, 0.22);
  });
  return { GY, CX, M };
}

// ── PASTURE: fenced pasture at dusk ──────────────────────────────────────────
export function pasture(g, t, cam, o = {}) {
  const M = mood('dusk'), GY = GROUND(), CX = E.W / 2;
  layer(g, cam, 0.12, (g) => { backdrop(g, M.sky); FX.sun(g, CX, GY - V(260, 420), V(80, 95), '#fff3dc', M.key, 5); FX.godRays(g, CX, GY - V(260, 420), { count: 14, angle: -Math.PI / 2, spread: Math.PI * 1.6, len: 1800, a: 0.05, t }); });
  layer(g, cam, 0.3, (g) => FX.hills(g, { seed: 12, y: GY - V(140, 200), amp: 60, color: shade(M.grass, -0.5), freq: 0.004 }));
  layer(g, cam, 0.6, (g) => {
    g.fillStyle = shade(M.grass, -0.45); g.fillRect(-E.W, GY - V(90, 120), E.W * 3, E.H);
    FX.tree(g, CX - V(700, 420), GY - V(90, 120), 1.6, shade(M.dark, -0.2)); FX.tree(g, CX + V(760, 480), GY - V(90, 120), 1.3, shade(M.dark, -0.2));
  });
  layer(g, cam, 0.8, (g) => {
    g.fillStyle = linGrad(g, 0, GY - 60, 0, GY + 700, [shade(M.grass, -0.3), shade(M.dark, -0.2)]); g.fillRect(-E.W, GY - 60, E.W * 3, E.H * 2);
    const fy = GY - 70, fc = shade(M.dark, -0.3);
    for (let x = -E.W; x < E.W * 2; x += 180) seg(g, [[x, fy], [x, fy - 120]], 12, fc);
    seg(g, [[-E.W, fy - 95], [E.W * 2, fy - 95]], 8, fc); seg(g, [[-E.W, fy - 45], [E.W * 2, fy - 45]], 8, fc);
    seg(g, [[-E.W, fy - 99], [E.W * 2, fy - 99]], 2, alpha(M.rim, 0.5));
    FX.pool(g, CX, GY + 30, 600, 90, M.key, 0.2);
  });
  return { GY, CX, M };
}
