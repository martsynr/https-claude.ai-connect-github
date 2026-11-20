// sets/world.js — flat line-art world on near-white paper: sky, field, barn, seed plant, and props (kernels, ear, bag, tractor+planter, seed disc, gauge).
import { E, V, layer, rr, ease, prog, clamp, lerp, rng, text, FONTS } from '/engine/core.js';
import { OL } from './person.js';

export const BG = '#f8f9fa';
export const C = { cloud: '#c6def2', cloudDk: '#97bfe0', blue: '#4f7fae', light: '#b4d3ee', olive: '#c8c24e', leaf: '#dcebc4', leafDk: '#9cc45a', soil: '#e7d6b8', soilDk: '#cdb48c', steel: '#d5dbe0', steelDk: '#9aa3ab', yellow: '#f6c445', crown: '#fbe08a', germ: '#fff6dc', orange: '#e3a21a', red: '#e0573a', green: '#6aa84f', sun: '#ffe9a8' };
export const GROUND = () => E.H * V(0.8, 0.68);
export let LW = 4;
export const setLW = (w) => { LW = w; };

// ---------- primitives ----------
export function fs(g, fill, w = LW) { if (fill) { g.fillStyle = fill; g.fill(); } if (w) { g.strokeStyle = OL; g.lineWidth = w; g.lineJoin = 'round'; g.lineCap = 'round'; g.stroke(); } }
export function ln(g, pts, w = LW, col = OL) { g.strokeStyle = col; g.lineWidth = w; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); g.moveTo(...pts[0]); for (const p of pts.slice(1)) g.lineTo(...p); g.stroke(); }
export function box(g, x, y, w, h, r, fill, lw = LW) { rr(g, x, y, w, h, r); fs(g, fill, lw); }
export function dot(g, x, y, r, fill, lw = LW) { g.beginPath(); g.arc(x, y, r, 0, 7); fs(g, fill, lw); }
export function cap(g, pts, w, fill, lw = LW) { ln(g, pts, w + lw * 2, OL); ln(g, pts, w, fill); }

export function paper(g, grid = false) { g.fillStyle = BG; g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3); if (grid) { g.strokeStyle = '#e9edf1'; g.lineWidth = 2; for (let x = -E.W; x < E.W * 2; x += 60) { g.beginPath(); g.moveTo(x, -E.H); g.lineTo(x, E.H * 2); g.stroke(); } for (let y = -E.H; y < E.H * 2; y += 60) { g.beginPath(); g.moveTo(-E.W, y); g.lineTo(E.W * 2, y); g.stroke(); } } }

export function cloud(g, x, y, w, o = {}) {
  const { top = C.cloud, bot = C.cloudDk } = o, h = w * 0.36;
  const shape = () => { g.beginPath(); g.moveTo(x - w / 2, y); g.arc(x - w * 0.3, y - h * 0.1, h * 0.42, Math.PI, Math.PI * 1.75); g.arc(x - w * 0.02, y - h * 0.45, h * 0.62, Math.PI * 1.1, Math.PI * 1.9); g.arc(x + w * 0.28, y - h * 0.15, h * 0.5, Math.PI * 1.25, Math.PI * 2); g.lineTo(x + w / 2, y); g.closePath(); };
  shape(); g.fillStyle = top; g.fill(); g.save(); shape(); g.clip(); g.fillStyle = bot; g.beginPath(); g.ellipse(x - w * 0.3, y + h * 0.05, w * 0.32, h * 0.38, 0, 0, 7); g.fill(); g.restore();
  g.strokeStyle = bot; g.lineWidth = 3; g.beginPath(); g.moveTo(x - w / 2, y); g.lineTo(x + w / 2, y); g.stroke();
}
export function birds(g, t, o = {}) { const { x = E.W * 0.2, y = E.H * 0.1, n = 2 } = o; for (let i = 0; i < n; i++) { const bx = x + i * 110 + t * 30, by = y + i * 70 + Math.sin(t + i) * 8, f = Math.sin(t * 6 + i * 2) * 8; ln(g, [[bx - 26, by - 8 + f], [bx, by], [bx + 26, by - 10 + f]], 3.5, i ? '#7a828a' : OL); } }
export function sky(g, t, o = {}) {
  const { storm = false, seed = 2, clouds = 3, birdsOn = !storm } = o; const R = rng(seed);
  for (let i = 0; i < clouds; i++) { const cx = ((R() * E.W * 1.2 + t * (12 + i * 5)) % (E.W * 1.4)) - E.W * 0.2, cy = E.H * (0.08 + R() * 0.22), w = V(260, 300) * (0.7 + R() * 0.6) * (storm ? 1.6 : 1); cloud(g, cx, cy, w, storm ? { top: '#b9c4d0', bot: '#8e9cab' } : {}); }
  if (birdsOn) birds(g, t, { x: E.W * 0.12, y: E.H * 0.1 });
}
export function sun(g, x, y, r, t = 0, hot = 0) {
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2 + t * 0.15, r0 = r * 1.35, r1 = r * (1.75 + 0.25 * hot + 0.08 * Math.sin(t * 3 + i)); ln(g, [[x + Math.cos(a) * r0, y + Math.sin(a) * r0], [x + Math.cos(a) * r1, y + Math.sin(a) * r1]], 5, hot ? C.orange : '#e8c35a'); }
  dot(g, x, y, r, hot ? '#ffd27a' : C.sun);
}
export function tuft(g, x, y, s = 1) { ln(g, [[x - 10 * s, y], [x - 16 * s, y - 22 * s]], 3); ln(g, [[x, y], [x + 2 * s, y - 28 * s]], 3); ln(g, [[x + 10 * s, y], [x + 18 * s, y - 20 * s]], 3); }
export function groundLine(g, y, seed = 3) { ln(g, [[-E.W, y], [E.W * 2, y]], LW); const R = rng(seed); for (let i = 0; i < 14; i++) tuft(g, -E.W * 0.2 + R() * E.W * 1.4, y - 2, 0.8 + R() * 0.5); }

// ---------- corn plant (line art). x,y base, h height
export function cornPlant(g, x, y, h, o = {}) {
  const { sway = 0, seed = 1, ear = h > 260, tassel = h > 200, leaves = 6 } = o, R = rng(seed), w = Math.max(5, h * 0.02);
  const P = (k) => [x + sway * k * k, y - h * k];
  for (let i = 0; i < leaves; i++) {
    const k = 0.14 + (i / leaves) * 0.72, [bx, by] = P(k), sd = i % 2 ? 1 : -1, len = h * (0.4 - k * 0.2) * (0.85 + R() * 0.3);
    const tip = [bx + sd * len, by + len * 0.25], c1 = [bx + sd * len * 0.5, by - len * 0.4];
    g.beginPath(); g.moveTo(bx, by); g.quadraticCurveTo(c1[0], c1[1], tip[0], tip[1]); g.quadraticCurveTo(c1[0] + sd * 4, c1[1] + len * 0.25, bx, by + w * 3); g.closePath(); fs(g, C.leaf, LW * 0.8);
    ln(g, [[bx, by + w], [lerp(bx, tip[0], 0.6), lerp(by, tip[1], 0.4) - len * 0.08]], 2.5, C.leafDk);
  }
  g.beginPath(); g.moveTo(x - w / 2, y); g.quadraticCurveTo(x + sway * 0.25 - w / 2, y - h * 0.5, P(1)[0] - w * 0.3, P(1)[1]); g.lineTo(P(1)[0] + w * 0.3, P(1)[1]); g.quadraticCurveTo(x + sway * 0.25 + w / 2, y - h * 0.5, x + w / 2, y); g.closePath(); fs(g, C.leaf, LW * 0.8);
  if (ear) { const [ex, ey] = P(0.5); g.save(); g.translate(ex + w, ey); g.rotate(0.35); g.beginPath(); g.ellipse(0, 0, w * 1.6, h * 0.075, 0, 0, 7); fs(g, C.yellow, LW * 0.8); g.beginPath(); g.moveTo(-w * 1.6, 0); g.quadraticCurveTo(-w * 1.8, -h * 0.05, 0, -h * 0.085); g.quadraticCurveTo(-w * 0.4, -h * 0.02, -w * 1.6, h * 0.06); fs(g, C.leaf, LW * 0.7); g.restore(); }
  if (tassel) { const [tx, ty] = P(1); for (let s = -2; s <= 2; s++) ln(g, [[tx, ty], [tx + s * h * 0.022, ty - h * 0.07 + Math.abs(s) * h * 0.02]], 3, '#b8a24a'); }
}
export function cornRow(g, t, o = {}) {
  const { x0 = -E.W * 0.6, x1 = E.W * 1.6, y, h = 420, step = 120, seed = 3, grow = 1, wind = 1 } = o, R = rng(seed);
  for (let x = x0, i = 0; x < x1; x += step * (0.8 + R() * 0.4), i++) { const hh = h * (0.85 + R() * 0.3) * grow; cornPlant(g, x, y, hh, { sway: (Math.sin(t * 1.1 + i * 0.7) * 8 + 4) * wind * (hh / 400), seed: seed * 100 + i, ear: grow > 0.7 && hh > 260, tassel: grow > 0.6 }); }
}

// ---------- FIELD. o: {grow 0..1, weather 'sun'|'hot'|'storm', soil}
export function field(g, t, cam, o = {}) {
  const GY = GROUND(), CX = E.W / 2, grow = o.grow ?? 1, wx = o.weather || 'sun';
  layer(g, cam, 0.1, (g) => { paper(g); if (wx === 'storm') g.fillStyle = 'rgba(150,170,190,.18)', g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3); if (wx !== 'storm') sun(g, CX + V(380, 300), GY - V(560, 980), V(60, 64) * (wx === 'hot' ? 1.4 : 1), t, wx === 'hot' ? 1 : 0); sky(g, t, { storm: wx === 'storm', clouds: wx === 'storm' ? 6 : wx === 'hot' ? 1 : 3 }); });
  layer(g, cam, 0.3, (g) => { ln(g, [[-E.W, GY - V(130, 190)], [E.W * 2, GY - V(130, 190)]], 3, '#9aa3ab'); const R = rng(8); for (let x = -E.W * 0.5; x < E.W * 1.5; x += 46) { const hh = 50 + R() * 26; ln(g, [[x, GY - V(130, 190)], [x + 3, GY - V(130, 190) - hh]], 3, '#9aa3ab'); ln(g, [[x + 2, GY - V(130, 190) - hh * 0.6], [x + 16, GY - V(130, 190) - hh * 0.4]], 3, '#9aa3ab'); } });
  layer(g, cam, 0.6, (g) => { if (grow > 0.05) cornRow(g, t, { y: GY - V(50, 70), h: V(380, 470) * grow, seed: 21, wind: wx === 'storm' ? 2.5 : 1, grow }); });
  layer(g, cam, 0.9, (g) => {
    g.fillStyle = '#fbf7ef'; g.fillRect(-E.W, GY, E.W * 3, E.H * 2);
    for (let i = 0; i < 7; i++) { const y = GY + 30 + i * i * 16 + i * 12; for (let x = -E.W + (i % 2) * 60; x < E.W * 2; x += 140) ln(g, [[x, y], [x + 70 + i * 6, y]], 3 + i * 0.4, C.soilDk); }
    groundLine(g, GY);
  });
  if (wx === 'storm') { const R = rng(9); g.save(); for (let i = 0; i < 70; i++) { const x = R() * E.W * 1.2 - E.W * 0.1, y = ((R() * E.H + t * 900) % (E.H * 1.1)) - 60; ln(g, [[x, y], [x - 10, y + 40]], 3, C.cloudDk); } g.restore(); }
  return { GY, CX };
}

// ---------- BARN (light storehouse: open doorway onto the sunny yard, pallets of bags)
export function barn(g, t, cam, o = {}) {
  const GY = GROUND(), CX = E.W / 2, dx = o.doorX ?? CX, dw = V(520, 560), dh = V(560, 760);
  layer(g, cam, 0.5, (g) => {
    g.fillStyle = '#f4efe6'; g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
    for (let x = -E.W; x < E.W * 2; x += 90) ln(g, [[x, -E.H], [x, GY]], 2, '#e2d8c6');
    ln(g, [[-E.W, GY - dh - 140], [E.W * 2, GY - dh - 140]], LW); ln(g, [[-E.W, GY - dh - 170], [E.W * 2, GY - dh - 170]], LW);
    g.save(); rr(g, dx - dw / 2, GY - dh, dw, dh, 0); g.clip(); g.fillStyle = '#eaf4fb'; g.fillRect(dx - dw, GY - dh, dw * 2, dh);
    sun(g, dx + dw * 0.22, GY - dh * 0.72, 36, t); cloud(g, dx - dw * 0.15 + Math.sin(t * 0.2) * 20, GY - dh * 0.55, 220);
    ln(g, [[dx - dw, GY - dh * 0.24], [dx + dw, GY - dh * 0.24]], 3, '#9aa3ab'); cornRow(g, t, { x0: dx - dw * 0.6, x1: dx + dw * 0.6, y: GY - dh * 0.2, h: dh * 0.32, step: 60, seed: 9, wind: 0.6 });
    g.fillStyle = '#fbf7ef'; g.fillRect(dx - dw, GY - dh * 0.14, dw * 2, dh); g.restore();
    box(g, dx - dw / 2, GY - dh, dw, dh, 0, null, LW * 1.4);
    box(g, dx - dw / 2 - 30, GY - dh - 30, dw + 60, 30, 4, '#d9c3a0');
    for (const [px, n] of [[dx - dw / 2 - V(300, 230), 3], [dx + dw / 2 + V(300, 230), 2]]) { box(g, px - V(200, 160), GY - 26, V(400, 320), 26, 3, '#d9c3a0'); for (let r = 0; r < n; r++) for (let c = -1; c <= 1; c++) seedBag(g, px + c * V(120, 96) + (r % 2) * 24, GY - 26 - r * V(118, 100), V(118, 94), V(120, 102)); }
  });
  layer(g, cam, 0.9, (g) => { g.fillStyle = '#efe6d6'; g.fillRect(-E.W, GY, E.W * 3, E.H * 2); ln(g, [[-E.W, GY], [E.W * 2, GY]], LW); g.fillStyle = 'rgba(255,248,225,.7)'; g.beginPath(); g.moveTo(dx - dw / 2, GY); g.lineTo(dx + dw / 2, GY); g.lineTo(dx + dw * 0.85, GY + V(420, 620)); g.lineTo(dx - dw * 0.85, GY + V(420, 620)); g.closePath(); g.fill(); });
  return { GY, CX };
}

// ---------- SEED PLANT: hoppers, conveyor with kernels
export function factory(g, t, cam) {
  const GY = GROUND(), CX = E.W / 2, belt = GY - V(150, 190), speed = 150;
  layer(g, cam, 0.4, (g) => {
    paper(g); g.fillStyle = '#eef2f5'; g.fillRect(-E.W, -E.H, E.W * 3, GY + E.H);
    for (let i = -3; i < 7; i++) { const x = i * V(360, 300); box(g, x, GY - V(900, 1320), V(240, 200), V(150, 180), 6, '#ffffff'); ln(g, [[x + V(120, 100), GY - V(900, 1320)], [x + V(120, 100), GY - V(750, 1140)]], 3); }
    for (let i = -2; i < 4; i++) { const x = CX + i * V(420, 340), top = GY - V(720, 980), cone = GY - V(460, 720), neck = GY - V(330, 560);
      ln(g, [[x - 100, cone], [x - 100, GY]], 8, C.steelDk); ln(g, [[x + 100, cone], [x + 100, GY]], 8, C.steelDk);
      box(g, x - 110, top, 220, cone - top, 10, C.steel); g.beginPath(); g.moveTo(x - 110, cone); g.lineTo(x + 110, cone); g.lineTo(x + 24, neck); g.lineTo(x - 24, neck); g.closePath(); fs(g, C.steel);
      box(g, x - 14, neck, 28, belt - 24 - neck, 4, C.steelDk); ln(g, [[x - 110, top + 50], [x + 110, top + 50]], 3);
      const R = rng(i + 20); for (let k = 0; k < 4; k++) { const y = ((t * 260 + k * 30 + R() * 40) % (belt - neck - 20)) + neck + 10; kernel(k % 2, g, x + (R() - 0.5) * 8, y, 22, { rot: t * 4 + k }); } }
  });
  layer(g, cam, 0.85, (g) => {
    g.fillStyle = '#e4e9ee'; g.fillRect(-E.W, GY, E.W * 3, E.H * 2); ln(g, [[-E.W, GY], [E.W * 2, GY]], LW);
    for (let x = -E.W; x < E.W * 2; x += 300) ln(g, [[x, belt + 36], [x, GY]], 10, C.steelDk);
    box(g, -E.W, belt, E.W * 3, 36, 12, '#7a828a'); for (let x = -E.W + ((t * speed) % 80); x < E.W * 2; x += 80) ln(g, [[x, belt + 8], [x, belt + 28]], 3, '#b9c0c6');
    const R = rng(4); for (let i = 0; i < 70; i++) { const x = ((R() * E.W * 1.6 + t * speed) % (E.W * 1.6)) - E.W * 0.3; kernel(R() < 0.5, g, x, belt - 14 - R() * 6, 30, { rot: R() * 6 }); }
  });
  return { GY, CX, belt };
}

// ---------- kernels (x,y centre; s = height)
export function kernelFlat(g, x, y, s, o = {}) {
  const { rot = 0, a = 1 } = o, lw = Math.max(2.5, Math.min(6, s * 0.03)) / s;
  g.save(); g.globalAlpha *= a; g.translate(x, y); g.rotate(rot); g.scale(s, s);
  const body = () => { g.beginPath(); g.moveTo(-0.4, -0.48); g.quadraticCurveTo(0, -0.38, 0.4, -0.48); g.lineTo(0.37, 0.08); g.quadraticCurveTo(0.2, 0.42, 0.06, 0.5); g.lineTo(-0.06, 0.5); g.quadraticCurveTo(-0.2, 0.42, -0.37, 0.08); g.closePath(); };
  body(); g.fillStyle = C.yellow; g.fill(); g.save(); body(); g.clip(); g.fillStyle = C.crown; g.fillRect(-0.5, -0.6, 1, 0.3); g.restore();
  body(); fs(g, null, lw); g.beginPath(); g.ellipse(0, 0.1, 0.15, 0.25, 0, 0, 7); fs(g, C.germ, lw * 0.8);
  g.restore();
}
export function kernelRound(g, x, y, s, o = {}) {
  const { rot = 0, a = 1 } = o, lw = Math.max(2.5, Math.min(6, s * 0.03)) / s;
  g.save(); g.globalAlpha *= a; g.translate(x, y); g.rotate(rot); g.scale(s, s);
  const body = () => { g.beginPath(); g.moveTo(0, -0.46); g.bezierCurveTo(0.34, -0.46, 0.46, -0.15, 0.42, 0.06); g.bezierCurveTo(0.38, 0.3, 0.16, 0.44, 0.04, 0.5); g.lineTo(-0.04, 0.5); g.bezierCurveTo(-0.16, 0.44, -0.38, 0.3, -0.42, 0.06); g.bezierCurveTo(-0.46, -0.15, -0.34, -0.46, 0, -0.46); g.closePath(); };
  body(); g.fillStyle = C.yellow; g.fill(); g.save(); body(); g.clip(); g.fillStyle = C.crown; g.beginPath(); g.ellipse(-0.12, -0.2, 0.22, 0.16, -0.4, 0, 7); g.fill(); g.restore();
  body(); fs(g, null, lw); g.beginPath(); g.ellipse(0, 0.12, 0.12, 0.2, 0, 0, 7); fs(g, C.germ, lw * 0.8);
  g.restore();
}
export const kernel = (round, ...a) => (round ? kernelRound : kernelFlat)(...a);

// ---------- ear of corn, tip up. x centre, y base, L length. o: {zones:{tip,mid,base}, squeeze, husk}
export function earHW(L, k) { const W = L * 0.17; if (k < 0.1) return W * (0.78 + k * 2.2); if (k > 0.62) return W * lerp(1, 0.3, Math.pow((k - 0.62) / 0.38, 1.4)); return W; }
export const zoneOf = (k) => (k > 0.72 ? 'tip' : k < 0.2 ? 'base' : 'mid');
export const ZONE = { tip: [0.72, 1], mid: [0.2, 0.72], base: [0, 0.2] };
export function ear(g, x, y, L, o = {}) {
  const { zones = {}, squeeze = 0, husk = 0, rows = 18, cols = 6, lw = 3 } = o;
  for (const [z, [k0, k1]] of Object.entries(ZONE)) { const a = zones[z] || 0; if (a <= 0) continue; const W = L * 0.17 * 1.5; g.fillStyle = `rgba(180,211,238,${0.55 * a})`; rr(g, x - W, y - L * k1 - 6, W * 2, L * (k1 - k0) + 12, 24); g.fill(); g.setLineDash([14, 10]); g.strokeStyle = `rgba(79,127,174,${a})`; g.lineWidth = 4; g.stroke(); g.setLineDash([]); }
  box(g, x - L * 0.05, y - 4, L * 0.1, L * 0.09, 8, '#d9c3a0', lw);
  if (husk > 0) for (const sd of [-1, 1]) { g.beginPath(); g.moveTo(x, y + 10); g.quadraticCurveTo(x + sd * L * 0.42 * husk, y - L * 0.2, x + sd * L * (0.16 + 0.3 * husk), y - L * 0.78); g.quadraticCurveTo(x + sd * L * 0.22 * husk, y - L * 0.3, x + sd * L * 0.03, y - 8); g.closePath(); fs(g, C.leaf, lw); }
  for (let r = 0; r < rows; r++) {
    const k0 = r / rows, k1 = (r + 1) / rows, km = (k0 + k1) / 2, hw = earHW(L, km), z = zoneOf(km), yy = y - L * k1, hh = L / rows, sq = z === 'mid' ? squeeze : 0;
    for (let c = 0; c < cols; c++) {
      const a0 = -Math.PI / 2 + (c / cols) * Math.PI, a1 = -Math.PI / 2 + ((c + 1) / cols) * Math.PI, xa = x + Math.sin(a0) * hw, xb = x + Math.sin(a1) * hw, w = xb - xa;
      const round = z !== 'mid', pad = (round ? 0.1 : 0.04) + sq * 0.06, rad = round ? Math.min(w, hh) * 0.48 : Math.min(w, hh) * 0.14;
      const px = xa + w * pad, pw = w * (1 - 2 * pad), py = yy + hh * 0.06, ph = hh * 0.88; if (pw < 2) continue;
      box(g, px, py, pw, ph, rad, (c === 0 || c === cols - 1) ? '#eab43a' : C.yellow, lw);
    }
  }
}

// ---------- seed bag (x centre, y floor)
export function seedBag(g, x, y, w, h, o = {}) {
  const { open = 0, round = true, lw = LW * 0.8 } = o;
  g.beginPath(); g.moveTo(x - w / 2, y); g.lineTo(x - w * 0.45, y - h); g.lineTo(x + w * 0.45, y - h); g.lineTo(x + w / 2, y); g.closePath(); fs(g, '#ffffff', lw);
  box(g, x - w * 0.47, y - h * 0.62, w * 0.94, h * 0.22, 2, C.light, lw);
  kernelFlat(g, x, y - h * 0.3, h * 0.14);
  if (open > 0) {
    g.beginPath(); g.ellipse(x, y - h, w * 0.45, h * 0.08 * open + 2, 0, 0, 7); fs(g, '#7a6a52', lw);
    const R = rng(7); for (let i = 0; i < 22; i++) kernel(round, g, x + (R() - 0.5) * w * 0.7, y - h - (R() - 0.3) * h * 0.08 * open, h * 0.1, { rot: R() * 6, a: open });
  } else box(g, x - w * 0.47, y - h - h * 0.06, w * 0.94, h * 0.08, 3, '#eef0f2', lw);
}

// ---------- tractor + planter (side view facing right). x = rear wheel centre, y ground
export function tractor(g, x, y, s, o = {}) {
  const { spin = 0 } = o; g.save(); g.translate(x, y); g.scale(s, s); const lw = LW / s;
  ln(g, [[-60, -76], [-520, -76]], 16 + lw * 2); ln(g, [[-60, -76], [-520, -76]], 16, C.steelDk);
  for (let i = 0; i < 3; i++) { const ux = -230 - i * 115; ln(g, [[ux, -100], [ux, -44]], 10, OL); box(g, ux - 40, -196, 80, 96, 10, C.olive, lw); box(g, ux - 46, -204, 92, 16, 6, '#aea73a', lw); dot(g, ux + 6, -24, 22, '#ffffff', lw); dot(g, ux + 6, -24, 7, C.steelDk, lw); }
  box(g, -40, -214, 300, 112, 18, C.blue, lw); box(g, 120, -194, 160, 82, 14, C.light, lw); for (let i = 0; i < 4; i++) ln(g, [[150 + i * 30, -182], [150 + i * 30, -126]], lw);
  box(g, -32, -384, 154, 172, 16, null, lw * 1.2); box(g, -16, -366, 120, 140, 10, '#e6f1fa', lw);
  ln(g, [[215, -214], [215, -290]], 14 + lw * 2); ln(g, [[215, -214], [215, -290]], 14, C.steelDk);
  for (const [wx, R] of [[0, 120], [222, 66]]) { dot(g, wx, -R + 10, R, '#59636c', lw); dot(g, wx, -R + 10, R * 0.58, '#ffffff', lw); dot(g, wx, -R + 10, R * 0.18, C.steelDk, lw); for (let k = 0; k < 4; k++) { const a = k / 4 * Math.PI * 2 + spin; ln(g, [[wx + Math.cos(a) * R * 0.2, -R + 10 + Math.sin(a) * R * 0.2], [wx + Math.cos(a) * R * 0.56, -R + 10 + Math.sin(a) * R * 0.56]], lw); } }
  g.restore();
}

// ---------- seed disc. fill(i, a) → 0 empty | 1 | 2 (double)
export function seedDisc(g, x, y, R, rot, o = {}) {
  const { n = 22, fill = () => 1, round = false } = o;
  dot(g, x, y, R, C.steel); dot(g, x, y, R * 0.66, null, 3); dot(g, x, y, R * 0.18, C.steelDk);
  for (let k = 0; k < 6; k++) { const a = rot + k / 6 * Math.PI * 2; dot(g, x + Math.cos(a) * R * 0.34, y + Math.sin(a) * R * 0.34, R * 0.04, '#ffffff', 3); }
  for (let i = 0; i < n; i++) { const a = rot + i / n * Math.PI * 2, cx = x + Math.cos(a) * R * 0.83, cy = y + Math.sin(a) * R * 0.83, f = fill(i, a); dot(g, cx, cy, R * 0.05, '#59636c', 3); if (f >= 1) kernel(round, g, cx, cy, R * 0.14, { rot: a + Math.PI / 2 }); if (f >= 2) kernel(round, g, cx + Math.cos(a) * R * 0.11 + Math.sin(a) * R * 0.04, cy + Math.sin(a) * R * 0.11, R * 0.14, { rot: a + Math.PI / 2 + 0.7 }); }
}

// ---------- vacuum gauge (v 0..1)
export function gauge(g, x, y, R, v) {
  const a0 = Math.PI * 0.8, a1 = Math.PI * 2.2, ang = lerp(a0, a1, v);
  dot(g, x, y, R * 1.08, C.steel); dot(g, x, y, R, '#ffffff');
  g.lineCap = 'butt'; g.lineWidth = R * 0.12; g.strokeStyle = C.green; g.beginPath(); g.arc(x, y, R * 0.78, lerp(a0, a1, 0.55), lerp(a0, a1, 0.75)); g.stroke(); g.strokeStyle = C.red; g.beginPath(); g.arc(x, y, R * 0.78, lerp(a0, a1, 0.86), a1); g.stroke();
  for (let i = 0; i <= 10; i++) { const a = lerp(a0, a1, i / 10), r1 = R * (i % 5 ? 0.6 : 0.56); ln(g, [[x + Math.cos(a) * R * 0.66, y + Math.sin(a) * R * 0.66], [x + Math.cos(a) * r1, y + Math.sin(a) * r1]], i % 5 ? 3 : 5); }
  cap(g, [[x - Math.cos(ang) * R * 0.12, y - Math.sin(ang) * R * 0.12], [x + Math.cos(ang) * R * 0.7, y + Math.sin(ang) * R * 0.7]], 8, C.red); dot(g, x, y, R * 0.08, OL);
}

// ---------- graphics
export function pill(g, str, x, y, o = {}) { const { a = 1, size = V(46, 52), color = OL, fill = '#ffffff', sc = 1 } = o; if (a <= 0) return; g.save(); g.globalAlpha *= clamp(a); g.translate(x, y); g.scale(sc, sc); g.font = `900 ${size}px "${FONTS.ui}"`; const w = g.measureText(str).width + size * 1.2; box(g, -w / 2, -size * 0.85, w, size * 1.7, size * 0.85, fill); text(g, str, 0, 2, { size, color, font: FONTS.ui, weight: 900, spacing: 1 }); g.restore(); }
export function big(g, str, x, y, o = {}) { const { a = 1, size = V(120, 130), color = C.blue, sc = 1 } = o; if (a <= 0) return; g.save(); g.globalAlpha *= clamp(a); g.translate(x, y); g.scale(sc, sc); text(g, str, 0, 0, { size, color, font: FONTS.title, weight: 700, stroke: size * 0.12, strokeColor: '#ffffff', spacing: 2 }); g.restore(); }
export function check(g, x, y, s, a = 1) { if (a <= 0) return; g.save(); g.globalAlpha *= clamp(a); dot(g, x, y, s, C.green); ln(g, [[x - s * 0.45, y], [x - s * 0.1, y + s * 0.35], [x + s * 0.5, y - s * 0.35]], s * 0.2, '#ffffff'); g.restore(); }
export function arrow(g, a, b, col = C.blue, w = 8) { ln(g, [a, b], w, col); const an = Math.atan2(b[1] - a[1], b[0] - a[0]), h = w * 3; g.fillStyle = col; g.beginPath(); g.moveTo(b[0] + Math.cos(an) * h * 0.6, b[1] + Math.sin(an) * h * 0.6); g.lineTo(b[0] + Math.cos(an + 2.5) * h, b[1] + Math.sin(an + 2.5) * h); g.lineTo(b[0] + Math.cos(an - 2.5) * h, b[1] + Math.sin(an - 2.5) * h); g.closePath(); g.fill(); }
export const pop = (t, t0, d = 0.35) => ease.outBack(prog(t, t0, t0 + d));
export const fadeIn = (t, t0, d = 0.3) => ease.out(prog(t, t0, t0 + d));
