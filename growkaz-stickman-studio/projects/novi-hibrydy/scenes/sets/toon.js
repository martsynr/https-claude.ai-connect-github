// sets/toon.js — flat cartoon field in the character-sheet style: cream sky, outlined sun/clouds/hills, outlined corn, soil band.
import { E, V, layer, rng } from '/engine/core.js';

export const INK = '#1d1a17', CREAM = '#fbf3e4';
export const LW = 4;
export function ofill(g, fill, lw = LW) { g.fillStyle = fill; g.fill(); g.strokeStyle = INK; g.lineWidth = lw; g.lineJoin = 'round'; g.lineCap = 'round'; g.stroke(); }
export const toonGround = () => E.H * V(0.8, 0.68);

// one outlined cartoon corn plant: x,y base; h height. o: {sway, seed, color, ear, leaves, lw}
export function toonCorn(g, x, y, h, o = {}) {
  const { sway = 0, seed = 1, color = '#6fae5c', ear = true, leaves = 6, lw = Math.max(2, h * 0.008), barren = false } = o; const r = rng(seed);
  const top = [x + sway, y - h], P = (k) => [x + sway * k * k, y - h * k], w = Math.max(5, h * 0.03);
  // stalk
  g.beginPath(); g.moveTo(x - w / 2, y); g.quadraticCurveTo(x + sway * 0.25 - w / 2, y - h * 0.5, top[0] - w * 0.3, top[1]); g.lineTo(top[0] + w * 0.3, top[1]); g.quadraticCurveTo(x + sway * 0.25 + w / 2, y - h * 0.5, x + w / 2, y); g.closePath(); ofill(g, color, lw);
  // leaves: outlined curved blades
  for (let i = 0; i < leaves; i++) {
    const k = 0.15 + (i / leaves) * 0.72, [bx, by] = P(k), side = i % 2 ? 1 : -1, len = h * (0.36 - k * 0.16) * (0.85 + r() * 0.3), droop = 0.45 + r() * 0.35;
    const tip = [bx + side * len, by + len * droop * 0.35], c1 = [bx + side * len * 0.45, by - len * 0.42], c2 = [bx + side * len * 0.55, by - len * 0.12];
    g.beginPath(); g.moveTo(bx, by - w * 0.6); g.quadraticCurveTo(c1[0], c1[1], tip[0], tip[1]); g.quadraticCurveTo(c2[0], c2[1], bx, by + w * 0.8); g.closePath(); ofill(g, i % 2 ? color : shadeHex(color, -0.08), lw);
  }
  if (ear && !barren) { const [ex, ey] = P(0.5); g.save(); g.translate(ex + w * 0.7, ey); g.rotate(0.38);
    g.beginPath(); g.ellipse(0, -h * 0.05, w * 1.15, h * 0.085, 0, 0, 7); ofill(g, '#f6cf5c', lw);
    g.beginPath(); g.moveTo(-w * 1.3, h * 0.04); g.quadraticCurveTo(-w * 1.8, -h * 0.06, -w * 0.2, -h * 0.13); g.quadraticCurveTo(-w * 0.5, -h * 0.02, -w * 1.3, h * 0.04); ofill(g, '#8cc26f', lw);
    g.restore(); }
  // tassel
  g.strokeStyle = INK; g.lineWidth = lw * 2.4; g.lineCap = 'round'; const tas = [-2, 0, 2];
  tas.forEach(s => { g.beginPath(); g.moveTo(top[0], top[1]); g.lineTo(top[0] + s * h * 0.022, top[1] - h * 0.06 + Math.abs(s) * h * 0.01); g.stroke(); });
  g.strokeStyle = '#e3b04b'; g.lineWidth = lw * 1.1; tas.forEach(s => { g.beginPath(); g.moveTo(top[0], top[1]); g.lineTo(top[0] + s * h * 0.022, top[1] - h * 0.06 + Math.abs(s) * h * 0.01); g.stroke(); });
}
export function shadeHex(hex, k) { const n = parseInt(hex.slice(1), 16); const f = (v) => Math.round(k < 0 ? v * (1 + k) : v + (255 - v) * k); return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`; }

function cloud(g, x, y, s) { g.beginPath(); g.arc(x, y, 40 * s, Math.PI * 0.9, Math.PI * 1.9); g.arc(x + 55 * s, y - 20 * s, 50 * s, Math.PI * 1.1, Math.PI * 1.95); g.arc(x + 115 * s, y, 38 * s, Math.PI * 1.2, Math.PI * 0.1); g.lineTo(x - 30 * s, y + 25 * s); g.closePath(); ofill(g, '#ffffff', 4); }

// full set. o: {grow (mid-row height), rows}
export function toonField(g, t, cam, o = {}) {
  const GY = toonGround(), CX = E.W / 2;
  layer(g, cam, 0.1, (g) => {
    g.fillStyle = CREAM; g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
    // sun with rays
    const sx = CX - V(380, 230), sy = GY - V(440, 760); g.strokeStyle = INK; g.lineCap = 'round';
    for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2 + t * 0.15, r0 = 95, r1 = 135 + (i % 2) * 18; g.lineWidth = 12; g.beginPath(); g.moveTo(sx + Math.cos(a) * r0, sy + Math.sin(a) * r0); g.lineTo(sx + Math.cos(a) * r1, sy + Math.sin(a) * r1); g.stroke(); g.strokeStyle = '#f6c945'; g.lineWidth = 5; g.stroke(); g.strokeStyle = INK; }
    g.beginPath(); g.arc(sx, sy, 78, 0, 7); ofill(g, '#f6c945', 5);
    cloud(g, CX + V(250, 120) + Math.sin(t * 0.2) * 20, GY - V(520, 900), 1.1); cloud(g, CX - V(650, 450) + Math.sin(t * 0.15 + 1) * 15, GY - V(700, 1150), 0.8);
  });
  layer(g, cam, 0.3, (g) => {
    g.beginPath(); g.moveTo(-E.W, GY - V(150, 200)); for (let x = -E.W; x <= E.W * 2; x += 60) g.lineTo(x, GY - V(150, 200) - 50 - Math.sin(x * 0.004) * 45 - Math.sin(x * 0.011) * 18); g.lineTo(E.W * 2, GY + 200); g.lineTo(-E.W, GY + 200); g.closePath(); ofill(g, '#a9d38f', 4);
    const r = rng(11); for (let x = -E.W + 20; x < E.W * 2; x += 46) toonCorn(g, x + r() * 10, GY - V(130, 175), V(110, 140) * (0.9 + r() * 0.2), { sway: Math.sin(t + x) * 3, seed: x | 0, color: '#86bd6c', ear: false, leaves: 4, lw: 2.2 });
  });
  layer(g, cam, 0.6, (g) => { const r = rng(21), grow = o.grow ?? 1; if (grow <= 0) return;
    for (let x = -E.W + 30, i = 0; x < E.W * 2; x += 82 + r() * 20, i++) toonCorn(g, x, GY - V(40, 55), V(330, 420) * grow * (0.9 + r() * 0.2), { sway: Math.sin(t * 1.1 + i * 0.7) * 7, seed: 300 + i, color: '#74b360', leaves: 6, lw: 3 }); });
  layer(g, cam, 0.9, (g) => {
    g.beginPath(); g.moveTo(-E.W, GY - 6); g.lineTo(E.W * 2, GY - 6); g.lineTo(E.W * 2, E.H * 2); g.lineTo(-E.W, E.H * 2); g.closePath(); ofill(g, '#c99a62', 5);
    g.strokeStyle = '#a97a46'; g.lineWidth = 6; g.lineCap = 'round'; for (let i = 0; i < 5; i++) { const y = GY + 40 + i * i * 26; g.beginPath(); g.moveTo(-E.W, y); g.lineTo(E.W * 2, y); g.stroke(); }
  });
  return { GY, CX };
}
