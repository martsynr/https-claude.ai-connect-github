// sets/plant.js — the seed plant: hall, the ten machines, cyclones, elevators; plus kernels, cobs, the dark "insert" table,
// lab, warehouse, soil cross-section and the blueprint globe.
import { measure, E, V, S, mood, layer, blurLayer, backdrop, rr, seg, circle, ring, poly, linGrad, radGrad, glow, alpha, shade, mix, text, FONTS, ease, prog, clamp, lerp, rng, key } from '/engine/core.js';
import { bagFace, logo } from './brand.js';
import * as FX from '/engine/fx2d.js';

export const GY = () => E.H * V(0.8, 0.68);
export const SP = 700;                                // spacing between machines along the line
export const GREEN = '#2f9e5b', PANEL = '#dfe3e8', PLY = '#c9a46a', STEEL = '#9aa4b2', RED = '#b8322a';

// ---------- small things ----------
// a corn kernel (wedge shape). o: {col, embryo 0..1 (glow), rot, flat (0 round .. 1 flat), crack 0..1, hollow, gloss}
export function kernel(g, x, y, s = 40, o = {}) {
  const { col = '#f2b640', embryo = 0, rot = 0, flat = 0.4, crack = 0, hollow = 0, gloss = 0, a = 1 } = o;
  g.save(); g.globalAlpha *= a; g.translate(x, y); g.rotate(rot); const w = s * (0.62 + flat * 0.2), h = s * (0.9 - flat * 0.15);
  g.fillStyle = col; g.beginPath(); g.moveTo(0, h * 0.55); g.quadraticCurveTo(-w * 0.62, h * 0.2, -w * 0.5, -h * 0.25); g.quadraticCurveTo(-w * 0.35, -h * 0.55, 0, -h * 0.55);
  g.quadraticCurveTo(w * 0.35, -h * 0.55, w * 0.5, -h * 0.25); g.quadraticCurveTo(w * 0.62, h * 0.2, 0, h * 0.55); g.fill();
  g.fillStyle = 'rgba(255,255,255,.22)'; g.beginPath(); g.ellipse(-w * 0.18, -h * 0.25, w * 0.14, h * 0.16, -0.4, 0, 7); g.fill();
  if (hollow > 0) { g.fillStyle = alpha('#2a1408', hollow); g.beginPath(); g.ellipse(w * 0.05, -h * 0.05, w * 0.22, h * 0.3, 0.3, 0, 7); g.fill(); seg(g, [[w * 0.05, -h * 0.1], [w * 0.25, -h * 0.4]], s * 0.06, alpha('#2a1408', hollow)); }
  const em = [0, h * 0.18];
  g.fillStyle = mix(col, '#fff3c4', 0.35); g.beginPath(); g.ellipse(em[0], em[1], w * 0.2, h * 0.24, 0, 0, 7); g.fill();
  if (embryo > 0) { glow(g, em[0], em[1], s * 0.9, '#ffd47e', 0.55 * embryo); g.fillStyle = alpha('#fff2b0', embryo); g.beginPath(); g.ellipse(em[0], em[1], w * 0.2, h * 0.24, 0, 0, 7); g.fill(); }
  if (crack > 0) { g.strokeStyle = '#2a1408'; g.lineWidth = Math.max(1.2, s * 0.035); g.beginPath(); const pts = [[-w * 0.1, -h * 0.5], [w * 0.05, -h * 0.3], [-w * 0.08, -h * 0.1], [w * 0.1, h * 0.1], [-w * 0.02, h * 0.35]]; const n = Math.max(1, Math.floor(crack * (pts.length - 1)) + 1); g.moveTo(...pts[0]); for (let i = 1; i <= Math.min(n, pts.length - 1); i++) g.lineTo(...pts[i]); g.stroke(); }
  if (gloss > 0) { g.fillStyle = alpha('#ffffff', 0.5 * gloss); g.beginPath(); g.ellipse(w * 0.18, -h * 0.3, w * 0.1, h * 0.12, 0.4, 0, 7); g.fill(); circle(g, w * 0.3, h * 0.42, s * 0.08 * gloss, alpha('#ff9a8a', 0.8 * gloss)); }
  g.restore();
}
// a corn cob seen from the side. o: {rot, husk 0..1, mold, kc (kernel colour), cobc, wet}
export function cob(g, x, y, len = 220, o = {}) {
  const { rot = 0, husk = 0, mold = 0, kc = '#f2b640', cobc = null, wet = 0, a = 1, rim = null } = o; const w = len * 0.24;
  g.save(); g.globalAlpha *= a; g.translate(x, y); g.rotate(rot);
  if (cobc) { g.fillStyle = cobc; rr(g, len / 2 - 6, -w * 0.18, 26, w * 0.36, 8); g.fill(); }
  g.fillStyle = shade(kc, -0.3); g.beginPath(); g.ellipse(0, 0, len / 2, w / 2, 0, 0, 7); g.fill();
  const cols = 12, rows = 4; for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) { const u = (i + 0.5) / cols - 0.5, v = (j + 0.5) / rows - 0.5, ww = Math.sqrt(Math.max(0, 1 - 4 * u * u)); if (ww < 0.15) continue; const px = u * len * 0.94, py = v * w * 0.9 * ww; g.fillStyle = mix(kc, '#fff3d0', 0.12 * (1 - Math.abs(v) * 2)); rr(g, px - len / cols * 0.42, py - w * 0.11 * ww, len / cols * 0.84, w * 0.2 * ww, 4); g.fill(); }
  if (mold > 0) { const r = rng(9); for (let i = 0; i < 9; i++) { const px = (r() - 0.5) * len * 0.8, py = (r() - 0.5) * w * 0.6; g.fillStyle = alpha(i % 2 ? '#5a7a5a' : '#c8d4c0', 0.75 * mold); g.beginPath(); g.ellipse(px, py, 10 + r() * 16, 6 + r() * 9, r() * 3, 0, 7); g.fill(); } }
  if (husk > 0) { for (let k = 0; k < 3; k++) { const sd = k - 1; g.fillStyle = mix('#b9a46a', '#7d8a4a', k * 0.3); g.globalAlpha = a * clamp(husk); g.beginPath(); g.moveTo(-len * 0.55, sd * w * 0.12); g.quadraticCurveTo(-len * 0.1, sd * w * 0.9 - w * 0.2, len * 0.5, sd * w * 0.25); g.quadraticCurveTo(0, sd * w * 0.2 + w * 0.25, -len * 0.55, sd * w * 0.12); g.fill(); } g.globalAlpha = a; for (let s2 = -2; s2 <= 2; s2++) seg(g, [[len * 0.5, 0], [len * 0.62, s2 * 6]], 2, alpha('#d9b46a', 0.8 * husk)); }
  if (wet > 0) for (let i = 0; i < 6; i++) { const px = -len * 0.35 + i * len * 0.14, py = w * 0.2 + ((i * 37) % 11); circle(g, px, py, 4 + (i % 3), alpha('#bfe3ff', 0.75 * wet)); }
  if (rim) { g.strokeStyle = alpha(rim, 0.6); g.lineWidth = 3; g.beginPath(); g.ellipse(0, 0, len / 2, w / 2, 0, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); }
  g.restore();
}
export const RED_SEED = '#c8322c';

// ---------- machine building blocks ----------
function boxS(g, x, y, w, h, col, M, r = 6) { rr(g, x, y, w, h, r); g.fillStyle = linGrad(g, x, y, x, y + h, [shade(col, 0.08), shade(col, -0.25)]); g.fill(); seg(g, [[x + r, y + 1.5], [x + w - r, y + 1.5]], 3, alpha(M.rim, 0.55)); }
function legs(g, x, y, w, h, col) { for (const lx of [x + 10, x + w - 22]) { g.fillStyle = col; g.fillRect(lx, y, 12, h); } }
function lamp(g, x, y, on, col = '#7dffb0') { circle(g, x, y, 7, on ? col : '#333a44'); if (on) glow(g, x, y, 26, col, 0.6); }
function spin(g, x, y, r, a, col, n = 4) { ring(g, x, y, r, 4, col); for (let i = 0; i < n; i++) { const b = a + i * Math.PI * 2 / n; seg(g, [[x, y], [x + Math.cos(b) * r, y + Math.sin(b) * r]], 4, col); } }

// each machine: draw(g, x(center), y(ground), t, M, o) ; returns {w, h, top}
export const MACHINES = {
  husk: { name: 'КАЧАНООЧИСНА МАШИНА', w: 470, h: 330, draw(g, x, y, t, M, o) {
    const G = mix(GREEN, M.wall, 0.25), w = 470, h = 260, x0 = x - w / 2, y0 = y - h - 40;
    legs(g, x0, y0 + h, w, 40, shade(G, -0.4)); boxS(g, x0, y0, w, h, G, M);
    poly(g, [[x0 + 40, y0], [x0 + 150, y0 - 70], [x0 + 300, y0 - 70], [x0 + 330, y0]], shade(G, -0.15));
    rr(g, x0 + 40, y0 + 60, w - 80, 120, 10); g.fillStyle = '#0b0f14'; g.fill();
    for (let i = 0; i < 5; i++) { const cx = x0 + 85 + i * 75; spin(g, cx, y0 + 100, 22, t * 6 * (o.run ? 1 : 0.1), '#8a3a2a', 3); spin(g, cx, y0 + 145, 22, -t * 6 * (o.run ? 1 : 0.1), '#8a3a2a', 3); }
    poly(g, [[x0 + w, y0 + 200], [x0 + w + 90, y0 + 250], [x0 + w + 90, y0 + 262], [x0 + w, y0 + 220]], shade(G, -0.3));
    lamp(g, x0 + w - 30, y0 + 25, o.run);
  } },
  insp: { name: 'ІНСПЕКЦІЙНИЙ КОНВЕЄР', w: 600, h: 200, draw(g, x, y, t, M, o) {
    const w = 600, x0 = x - w / 2, by = y - 110, G = mix('#3a414d', M.wall, 0.2);
    legs(g, x0 + 20, by + 30, w - 40, 80, shade(G, -0.3)); legs(g, x0 + 200, by + 30, 200, 80, shade(G, -0.3));
    rr(g, x0, by, w, 34, 17); g.fillStyle = shade(G, -0.1); g.fill(); rr(g, x0 + 6, by - 4, w - 12, 12, 6); g.fillStyle = '#15181e'; g.fill();
    for (const cx of [x0 + 17, x0 + w - 17]) spin(g, cx, by + 17, 13, t * 5, '#5a6270', 3);
    const sp = o.run ? 70 : 0; for (let i = 0; i < 7; i++) { const px = x0 + 40 + ((i * 90 + t * sp) % (w - 80)); cob(g, px, by - 22, 80, { rot: 0.05, kc: i === 3 ? '#e8e0c8' : '#f2b640', mold: i === 5 ? 0.8 : 0 }); }
    seg(g, [[x - 120, by - 260], [x + 120, by - 260]], 8, '#2a2f38'); for (const lx of [x - 90, x + 90]) { seg(g, [[lx, by - 300], [lx, by - 262]], 3, '#2a2f38'); FX.lightCone(g, lx, by - 255, { len: 260, spread: 0.45, color: M.practical, a: 0.14 }); circle(g, lx, by - 255, 10, M.practical); }
  } },
  dryer: { name: 'КАМЕРНА СУШАРКА', w: 560, h: 520, draw(g, x, y, t, M, o) {
    const w = 540, h = 470, x0 = x - w / 2, y0 = y - h, C = mix('#7d8794', M.wall, 0.35);
    for (let i = 0; i < 3; i++) { const cx = x0 + i * 182; boxS(g, cx, y0, 172, h, C, M, 4); for (let k = 1; k < 9; k++) seg(g, [[cx + 6, y0 + k * 52], [cx + 166, y0 + k * 52]], 2, alpha('#000', 0.25)); rr(g, cx + 50, y0 + h - 120, 72, 90, 6); g.fillStyle = '#1a1d22'; g.fill(); if (o.run) { glow(g, cx + 86, y0 + h - 75, 80, '#ff9a4a', 0.35); rr(g, cx + 56, y0 + h - 114, 60, 78, 4); g.fillStyle = alpha('#ff9a4a', 0.35); g.fill(); } }
    rr(g, x0 - 20, y0 - 40, w + 40, 40, 8); g.fillStyle = shade(C, -0.2); g.fill();
    rr(g, x0 + w + 6, y - 200, 120, 200, 10); g.fillStyle = shade(C, -0.3); g.fill(); spin(g, x0 + w + 66, y - 110, 42, t * (o.run ? 9 : 0.2), '#cfd6dc', 5);
    seg(g, [[x0 + w + 66, y - 200], [x0 + w + 66, y0 - 20]], 26, shade(C, -0.15));
  } },
  shell: { name: 'МОЛОТАРКА', w: 460, h: 330, draw(g, x, y, t, M, o) {
    const G = mix(GREEN, M.wall, 0.3), x0 = x - 210, y0 = y - 270;
    legs(g, x0, y0 + 170, 420, 100, shade(G, -0.4));
    rr(g, x0, y0 + 40, 420, 140, 70); g.fillStyle = linGrad(g, 0, y0 + 40, 0, y0 + 180, [shade(G, 0.1), shade(G, -0.35)]); g.fill(); seg(g, [[x0 + 60, y0 + 43], [x0 + 360, y0 + 43]], 3, alpha(M.rim, 0.5));
    circle(g, x0 + 210, y0 + 110, 52, '#0c1014'); spin(g, x0 + 210, y0 + 110, 46, t * (o.run ? 1.2 : 0.1), '#c9a46a', 6);
    poly(g, [[x0 + 20, y0 + 40], [x0 - 20, y0 - 40], [x0 + 120, y0 - 40], [x0 + 110, y0 + 40]], shade(G, -0.1));
    rr(g, x0 + 360, y0 + 120, 120, 26, 8); g.fillStyle = shade(G, -0.3); g.fill();
    if (o.run) for (let i = 0; i < 10; i++) { const k = ((t * 1.3 + i / 10) % 1); kernel(g, x0 + 180 + (i % 3) * 18, y0 + 190 + k * 80, 14, { a: 1 - k }); }
    rr(g, x0 + 240, y0 - 30, 70, 50, 8); g.fillStyle = '#3a414d'; g.fill(); lamp(g, x0 + 290, y0 - 5, o.run);
  } },
  clean: { name: 'МАШИНА ТОНКОЇ ОЧИСТКИ', w: 600, h: 470, draw(g, x, y, t, M, o) {
    const G = mix(GREEN, M.wall, 0.2), w = 600, h = 420, x0 = x - w / 2, y0 = y - h, sh = o.run ? Math.sin(t * 30) * 2 : 0;
    g.fillStyle = shade(G, -0.15); g.fillRect(x0, y0, 22, h); g.fillRect(x0 + w - 22, y0, 22, h); g.fillRect(x0, y0 + 160, w, 18); g.fillRect(x0, y - 22, w, 22); g.fillRect(x0 + w * 0.55, y0 + 160, 24, h - 160);
    boxS(g, x0, y0, w, 160, G, M); for (const px of [x0 + 150, x0 + 380]) { rr(g, px, y0 + 18, 190, 124, 6); g.fillStyle = shade(PANEL, -0.25); g.fill(); seg(g, [[px + 95, y0 + 20], [px + 95, y0 + 140]], 2, alpha('#000', 0.25)); }
    rr(g, x0 + 30, y0 + 30, 90, 50, 6); g.fillStyle = PLY; g.fill(); rr(g, x0 + 38, y0 + 38, 74, 34, 4); g.fillStyle = '#1a2a22'; g.fill();
    rr(g, x0 + 40 + sh, y0 + 200, w * 0.5 - 30, 170, 6); g.fillStyle = shade(PLY, -0.25); g.fill(); for (let k = 0; k < 3; k++) seg(g, [[x0 + 50 + sh, y0 + 230 + k * 50], [x0 + w * 0.5 + sh, y0 + 250 + k * 50]], 5, alpha('#2a1e10', 0.5));
    rr(g, x0 + w * 0.6, y0 + 210, w * 0.3, 150, 6); g.fillStyle = shade(G, -0.3); g.fill(); for (const cx of [x0 + w * 0.68, x0 + w * 0.8]) circle(g, cx, y0 + 320, 16, '#0c1014');
    lamp(g, x0 + w - 40, y0 + 30, o.run);
  } },
  grade: { name: 'КАЛІБРУВАЛЬНА МАШИНА', w: 540, h: 470, draw(g, x, y, t, M, o) {
    const G = mix(GREEN, M.wall, 0.2), w = 520, h = 380, x0 = x - w / 2, y0 = y - h, sh = o.run ? Math.sin(t * 28) * 2 : 0;
    g.fillStyle = shade(G, -0.1); for (const fx of [x0, x0 + w / 2 - 10, x0 + w - 20]) g.fillRect(fx, y0, 20, h); g.fillRect(x0, y0, w, 20); g.fillRect(x0, y0 + h / 2 - 10, w, 20); g.fillRect(x0, y - 20, w, 20);
    rr(g, x0 + 30 + sh, y0 + 30, w * 0.62, h - 80, 6); g.fillStyle = shade(PLY, -0.2); g.fill(); for (let k = 0; k < 3; k++) seg(g, [[x0 + 40 + sh, y0 + 70 + k * 90], [x0 + w * 0.62 + sh, y0 + 100 + k * 90]], 6, alpha('#2a1e10', 0.45));
    boxS(g, x0 + w - 150, y0 - 90, 170, 110, G, M); rr(g, x0 + w - 130, y0 - 75, 60, 80, 4); g.fillStyle = shade(PANEL, -0.25); g.fill();
    for (let i = 0; i < 4; i++) { const ox = x0 + 70 + i * 60; poly(g, [[ox, y - 20], [ox + 40, y - 20], [ox + 30, y + 6], [ox + 10, y + 6]], shade(G, -0.35)); }
    lamp(g, x0 + w - 40, y0 - 60, o.run);
  } },
  grav: { name: 'ГРАВІТАЦІЙНИЙ СЕПАРАТОР', w: 640, h: 320, draw(g, x, y, t, M, o) {
    const G = mix(GREEN, M.wall, 0.2), x0 = x - 300, y0 = y - 250, sh = o.run ? Math.sin(t * 22) * 3 : 0;
    boxS(g, x0, y0 + 90, 520, 160, G, M); for (let i = 0; i < 3; i++) { const hx = x0 + 120 + i * 140; poly(g, [[hx - 50, y0 + 200], [hx + 50, y0 + 200], [hx + 18, y + 4], [hx - 18, y + 4]], shade(G, -0.25)); circle(g, hx, y0 + 150, 16, '#0c1014'); }
    g.save(); g.translate(sh, 0); poly(g, [[x0 - 20, y0 + 40], [x0 + 520, y0 + 90], [x0 + 520, y0 + 110], [x0 - 20, y0 + 60]], STEEL); seg(g, [[x0 - 20, y0 + 40], [x0 + 520, y0 + 90]], 3, alpha(M.rim, 0.6)); g.restore();
    rr(g, x0 + 530, y0 + 20, 90, 230, 8); g.fillStyle = shade(G, -0.1); g.fill(); rr(g, x0 + 545, y0 + 40, 60, 40, 4); g.fillStyle = '#163a2a'; g.fill(); if (o.run) glow(g, x0 + 575, y0 + 60, 50, '#7dffb0', 0.3);
    circle(g, x0 + 575, y0 + 190, 34, '#2c5a72'); lamp(g, x0 + 600, y0 + 110, o.run);
  } },
  treat: { name: 'ПОРЦІЙНИЙ ПРОТРУЮВАЧ', w: 520, h: 520, draw(g, x, y, t, M, o) {
    const R = mix(RED, M.wall, 0.25), x0 = x - 230, y0 = y - 470, St = mix('#c3ccd6', M.wall, 0.3);
    g.fillStyle = shade(R, -0.2); for (const fx of [x0, x0 + 300, x0 + 440]) g.fillRect(fx, y0, 16, 470); g.fillRect(x0, y0 + 230, 456, 14);
    boxS(g, x0 + 20, y0, 270, 160, St, M, 4); for (let k = 1; k < 4; k++) seg(g, [[x0 + 20 + k * 67, y0 + 4], [x0 + 20 + k * 67, y0 + 156]], 2, alpha('#000', 0.18));
    poly(g, [[x0 + 90, y0 + 160], [x0 + 220, y0 + 160], [x0 + 180, y0 + 230], [x0 + 130, y0 + 230]], shade(St, -0.2));
    circle(g, x0 + 155, y0 + 320, 92, shade(St, -0.1)); ring(g, x0 + 155, y0 + 320, 92, 6, alpha(M.rim, 0.4)); rr(g, x0 + 105, y0 + 290, 100, 60, 10); g.fillStyle = '#f2c21a'; g.fill(); text(g, 'mix', x0 + 155, y0 + 321, { size: 30, color: '#1a1a1a', font: FONTS.ui, weight: 900 });
    if (o.run) for (let i = 0; i < 8; i++) { const a = t * 3 + i * 0.8; circle(g, x0 + 155 + Math.cos(a) * 60, y0 + 320 + Math.sin(a) * 60, 6, alpha(RED_SEED, 0.7)); }
    boxS(g, x0 + 330, y0 + 60, 120, 200, shade(PANEL, -0.15), M, 4); lamp(g, x0 + 360, y0 + 90, o.run, '#ff5a3a'); lamp(g, x0 + 390, y0 + 90, o.run); rr(g, x0 + 350, y0 + 120, 80, 50, 4); g.fillStyle = '#163a2a'; g.fill();
    rr(g, x0 + 330, y - 120, 100, 120, 6); g.fillStyle = '#2c5a9a'; g.fill(); circle(g, x0 + 380, y - 60, 26, '#163a6a');
  } },
  fbd: { name: 'СУШАРКА ПСЕВДОЗРІДЖЕНОГО ШАРУ', w: 680, h: 330, draw(g, x, y, t, M, o) {
    const G = mix(GREEN, M.wall, 0.2), x0 = x - 330, y0 = y - 300, sh = o.run ? Math.sin(t * 26) * 2 : 0;
    boxS(g, x0, y0, 150, 300, G, M); rr(g, x0 + 30, y0 + 30, 80, 110, 4); g.fillStyle = shade(PANEL, -0.25); g.fill();
    g.save(); g.translate(sh, 0); poly(g, [[x0 + 150, y0 + 70], [x0 + 660, y0 + 50], [x0 + 660, y0 + 150], [x0 + 150, y0 + 170]], G); for (let i = 0; i < 4; i++) { const wx = x0 + 190 + i * 115; rr(g, wx, y0 + 80 - i * 4, 80, 26, 4); g.fillStyle = PLY; g.fill(); rr(g, wx + 6, y0 + 84 - i * 4, 68, 18, 3); g.fillStyle = o.run ? alpha('#ff9a7a', 0.6) : '#1a2a22'; g.fill(); }
    rr(g, x0 + 150, y0 + 160, 510, 50, 4); g.fillStyle = shade(PLY, -0.2); g.fill(); g.restore();
    for (const lx of [x0 + 220, x0 + 420, x0 + 620]) { seg(g, [[lx, y0 + 210], [lx - 20, y]], 10, shade(G, -0.3)); }
    rr(g, x0 + 300, y - 90, 160, 70, 10); g.fillStyle = '#2c5a72'; g.fill(); lamp(g, x0 + 120, y0 + 20, o.run);
  } },
  bag: { name: 'ВАГОВИЙ ДОЗАТОР', w: 560, h: 520, draw(g, x, y, t, M, o) {
    const St = mix('#c3ccd6', M.wall, 0.3), x0 = x - 270, y0 = y - 500, Or = mix('#e2683a', M.wall, 0.25);
    g.fillStyle = shade(St, -0.35); for (const fx of [x0 + 20, x0 + 230]) g.fillRect(fx, y0 + 60, 14, 440); g.strokeStyle = Or; g.lineWidth = 6; g.strokeRect(x0, y0 + 40, 270, 120);
    boxS(g, x0 + 60, y0 + 100, 150, 130, St, M, 4); poly(g, [[x0 + 60, y0 + 230], [x0 + 210, y0 + 230], [x0 + 160, y0 + 290], [x0 + 110, y0 + 290]], shade(St, -0.2));
    rr(g, x0 + 150, y0 + 130, 46, 30, 4); g.fillStyle = '#0c1a12'; g.fill(); text(g, '80k', x0 + 173, y0 + 146, { size: 20, color: '#7dffb0', font: FONTS.ui, weight: 900 });
    const fill = o.run ? 0.5 + 0.5 * Math.sin(t * 2) : 0.6; bagFace(g, x0 + 85, y - 150, 100, 150, { r: 12, fill, dim: 0.15 });
    rr(g, x0 + 270, y - 70, 280, 34, 17); g.fillStyle = '#3a414d'; g.fill(); for (let i = 0; i < 2; i++) bagFace(g, x0 + 300 + i * 120, y - 190, 90, 120, { r: 10, dim: 0.15 });
    rr(g, x0 + 470, y - 300, 60, 120, 6); g.fillStyle = Or; g.fill(); seg(g, [[x0 + 500, y - 180], [x0 + 470, y - 190]], 6, '#5a6270'); legs(g, x0 + 290, y - 36, 240, 36, '#2a2f38');
  } },
};
export const LINE = ['husk', 'insp', 'dryer', 'shell', 'clean', 'grade', 'grav', 'treat', 'fbd', 'bag'];

// bucket elevator (background, between machines)
function elevator(g, x, y, h, M) { const C = mix('#d8cdb2', M.wall, 0.55); g.fillStyle = shade(C, -0.1); g.fillRect(x - 26, y - h, 22, h); g.fillRect(x + 4, y - h, 22, h); rr(g, x - 40, y - h - 60, 110, 70, 10); g.fillStyle = C; g.fill(); seg(g, [[x + 70, y - h - 30], [x + 260, y - h + 120]], 22, shade(C, -0.2)); }
// cyclone + duct (o.k = drop-in progress, o.run)
export function cyclone(g, x, y, t, M, o = {}) { const C = mix('#c3ccd6', M.wall, 0.35); boxS(g, x - 70, y - 300, 140, 200, C, M, 10); poly(g, [[x - 70, y - 100], [x + 70, y - 100], [x + 18, y], [x - 18, y]], shade(C, -0.2)); rr(g, x - 26, y - 360, 52, 60, 6); g.fillStyle = shade(C, -0.1); g.fill(); seg(g, [[x - 70, y - 260], [x - 220, y - 260], [x - 220, y - 60]], 30, shade(C, -0.3));
  if (o.run) for (let i = 0; i < 5; i++) { const a = t * 6 + i * 1.3, k = ((t * 0.6 + i / 5) % 1); circle(g, x + Math.cos(a) * (60 - k * 40), y - 260 + k * 220, 4, alpha('#d8cdb2', 0.6)); } }

// ---------- the hall ----------
// o: {n (#machines built), focus (index at screen centre), drop (index animating in), tDrop, run, haze, cyclones (0..1 drop-in), label}
export function hall(g, t, cam, o = {}) {
  const M = mood('interiorCool'), Y = GY(), CX = E.W / 2, n = o.n ?? 1, focus = o.focus ?? n - 1;
  const X = (i) => CX + (i - focus) * SP;
  layer(g, cam, 0.35, (g) => {
    backdrop(g, [shade(M.wall, -0.35), shade(M.wall, -0.1)]);
    for (let i = -6; i < 14; i++) { const wx = CX + i * 380 - focus * SP * 0.35 - 150; rr(g, wx, Y - 760, 220, 380, 6); g.fillStyle = linGrad(g, 0, Y - 760, 0, Y - 380, [mix(M.sky[0], '#9fc4ff', 0.35), M.sky[1]]); g.fill(); for (let k = 1; k < 3; k++) seg(g, [[wx + k * 73, Y - 760], [wx + k * 73, Y - 380]], 4, shade(M.wall, -0.3)); seg(g, [[wx, Y - 570], [wx + 220, Y - 570]], 4, shade(M.wall, -0.3)); }
    for (let i = -6; i < 14; i++) { const wx = CX + i * 380 - focus * SP * 0.35 - 150; FX.godRays(g, wx + 110, Y - 600, { count: 3, angle: Math.PI * 0.62, spread: 0.25, len: 700, a: 0.035, color: '#cfe0ff', t }); }
    g.fillStyle = shade(M.wall, -0.45); g.fillRect(-E.W * 2, Y - 860, E.W * 6, 30); for (let i = -10; i < 30; i++) seg(g, [[i * 160 - E.W, Y - 830], [i * 160 + 80 - E.W, Y - 900]], 6, shade(M.wall, -0.45));
  });
  layer(g, cam, 0.7, (g) => { for (let i = -1; i <= n; i++) if (i >= 0 && i < n && i % 2 === 0) elevator(g, X(i) + SP / 2 - 60 + (X(i) - CX) * -0.3, Y - 40, 560, M); });
  layer(g, cam, 0.9, (g) => {
    g.fillStyle = linGrad(g, 0, Y, 0, Y + 400, [shade(M.floor, 0.1), shade(M.dark, -0.2)]); g.fillRect(-E.W * 3, Y - 2, E.W * 8, E.H);
    for (let i = 0; i < 5; i++) seg(g, [[-E.W * 3, Y + 20 + i * i * 18], [E.W * 5, Y + 20 + i * i * 18]], 2, alpha('#000', 0.18));
    seg(g, [[-E.W * 3, Y + 60], [E.W * 5, Y + 60]], 6, alpha('#f2c21a', 0.25));
  });
  layer(g, cam, 0.95, (g) => {
    for (let i = 0; i < n; i++) {
      const m = MACHINES[LINE[i]]; let dy = 0, sc = 1, a = 1;
      if (i === o.drop) { const k = prog(t, o.tDrop ?? 0.35, (o.tDrop ?? 0.35) + 0.55); dy = (1 - ease.outBack(k)) * -700; a = k > 0 ? 1 : 0; }
      if (a <= 0) continue;
      FX.pool(g, X(i), Y + 8, m.w * 0.6, 40, '#000', 0);
      g.fillStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.ellipse(X(i), Y + 6, m.w * 0.55, 16, 0, 0, 7); g.fill();
      g.save(); g.translate(0, dy); m.draw(g, X(i), Y, t, M, { run: o.run ?? true }); g.restore();
      if (i < n - 1 && i !== o.drop) { seg(g, [[X(i) + m.w / 2 - 10, Y - 40], [X(i + 1) - MACHINES[LINE[i + 1]].w / 2 + 10, Y - 40]], 14, shade(M.wall, -0.2)); }
    }
    if (o.cyclones != null) { const k = ease.outBack(prog(t, o.tCyc ?? 0.3, (o.tCyc ?? 0.3) + 0.6)); if (k > 0) for (const i of [4, 5, 6]) if (i < n) cyclone(g, X(i) + 40, Y - 560 + (1 - k) * -600, t, M, { run: true }); if (k > 0) seg(g, [[X(4) - 300, Y - 860 + (1 - k) * -600], [X(6) + 200, Y - 860 + (1 - k) * -600]], 34, shade(M.wall, -0.1)); }
  });
  // drop-in dust puff + label
  if (o.drop != null) {
    const tD = (o.tDrop ?? 0.35) + 0.5, m = MACHINES[LINE[o.drop]];
    layer(g, cam, 0.95, (g) => {
      const k = prog(t, tD, tD + 1.0); if (k > 0 && k < 1) for (let i = 0; i < 18; i++) { const dir = i % 2 ? 1 : -1, sp = 0.4 + (i * 37 % 10) / 10; circle(g, X(o.drop) + dir * (m.w * 0.4 + k * 240 * sp), Y - 10 - k * 60 * sp + (i % 3) * 10, 18 + k * 40, alpha('#b8b0a0', 0.35 * (1 - k))); }
      const la = ease.outBack(prog(t, tD + 0.1, tD + 0.5)); if (la > 0) { const ly = Y - m.h - 110; g.save(); g.translate(X(o.drop), ly); g.scale(la, la);
        const str = o.label ?? m.name, tw = measure(g, str, 30, FONTS.ui, 900) + str.length * 1, wl = tw + 110; rr(g, -wl / 2, -34, wl, 68, 34); g.fillStyle = 'rgba(10,16,24,.85)'; g.fill(); g.strokeStyle = alpha(S().ui.gold, 0.8); g.lineWidth = 3; g.stroke();
        circle(g, -wl / 2 + 34, 0, 24, S().ui.gold); text(g, String(o.num ?? o.drop + 1), -wl / 2 + 34, 2, { size: 30, color: '#1a1408', font: FONTS.ui, weight: 900 });
        text(g, str, -wl / 2 + 70 + tw / 2, 2, { size: 30, color: S().ui.cream, font: FONTS.ui, weight: 900, spacing: 1 }); g.restore(); }
    });
  }
  FX.dust(g, t, { count: 50, color: '#cfe0ff', a: 0.25 });
  if (o.haze) { g.save(); g.fillStyle = alpha('#b8b0a0', 0.5 * o.haze); g.fillRect(0, 0, E.W, E.H); g.restore(); FX.dust(g, t, { count: Math.round(220 * o.haze), color: '#e8dcc0', a: 0.6 * o.haze, seed: 9 }); }
  return { GY: Y, CX, M, X };
}

// ---------- the dark insert table ----------
export function velvet(g, t, cam, o = {}) {
  const M = mood(o.mood || 'interiorWarm'), tint = o.tint || M.key;
  layer(g, cam, 0.5, (g) => { backdrop(g, [shade(M.dark, -0.55), shade(M.dark, -0.2)]); glow(g, E.W / 2 + (o.lx ?? 0), E.H * 0.42, E.W * 0.55, tint, 0.18); });
  layer(g, cam, 0.8, (g) => { g.fillStyle = linGrad(g, 0, E.H * 0.62, 0, E.H, [shade(M.dark, -0.3), shade(M.dark, -0.6)]); g.fillRect(-E.W, E.H * 0.62, E.W * 3, E.H); FX.pool(g, E.W / 2 + (o.lx ?? 0), E.H * 0.7, 560, 90, tint, 0.22); });
  FX.dust(g, t, { count: 40, color: '#ffe2bd', a: 0.25 });
  return { M, tint };
}

// ---------- lab ----------
export function lab(g, t, cam, o = {}) {
  const M = mood('interiorCool'), Y = GY(), CX = E.W / 2;
  layer(g, cam, 0.4, (g) => { backdrop(g, [shade(M.wall, -0.2), shade(M.wall, 0.05)]); FX.windowFrame ? null : null;
    rr(g, CX - 760, Y - 640, 520, 330, 8); g.fillStyle = linGrad(g, 0, Y - 640, 0, Y - 310, ['#bcd6ff', '#7d9ccf']); g.fill(); for (let k = 1; k < 3; k++) seg(g, [[CX - 760 + k * 173, Y - 640], [CX - 760 + k * 173, Y - 310]], 6, shade(M.wall, -0.3)); FX.godRays(g, CX - 500, Y - 470, { count: 5, angle: Math.PI * 0.65, spread: 0.35, len: 900, a: 0.05, color: '#dfeaff', t });
    for (let s = 0; s < 3; s++) { seg(g, [[CX + 120, Y - 560 + s * 120], [CX + 820, Y - 560 + s * 120]], 8, shade(M.wall, -0.35)); for (let j = 0; j < 7; j++) { const bx = CX + 150 + j * 95, by = Y - 560 + s * 120; rr(g, bx, by - 50, 34, 50, 6); g.fillStyle = alpha(['#9fe0ff', '#ffd47e', '#7dffb0', '#ff9a8a'][(j + s) % 4], 0.55); g.fill(); } }
  });
  layer(g, cam, 0.85, (g) => { g.fillStyle = linGrad(g, 0, Y, 0, Y + 300, [shade(M.floor, 0.15), M.dark]); g.fillRect(-E.W, Y - 2, E.W * 3, E.H); rr(g, -E.W, Y - 170, E.W * 3, 26, 6); g.fillStyle = '#dfe6ee'; g.fill(); g.fillStyle = shade(M.wall, -0.3); g.fillRect(-E.W, Y - 144, E.W * 3, 144);
    for (const bx of [CX - 600, CX + 380]) { rr(g, bx, Y - 420, 210, 250, 10); g.fillStyle = shade('#cfd6dc', -0.25); g.fill(); rr(g, bx + 18, Y - 400, 174, 150, 8); g.fillStyle = alpha(bx < CX ? '#ffb070' : '#9fe0ff', 0.5); g.fill(); glow(g, bx + 105, Y - 325, 160, bx < CX ? '#ffb070' : '#9fe0ff', 0.25); }
  });
  FX.dust(g, t, { count: 30, color: '#dfeaff', a: 0.2 });
  return { GY: Y - 170, FLOOR: Y, CX, M };
}

// ---------- warehouse ----------
export function bagStack(g, x, y, cols, rows, M, o = {}) { for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) { const bx = x + c * 92 + (r % 2) * 20, by = y - 22 - r * 58; bagFace(g, bx, by - 58, 88, 60, { r: 14, zoom: 1.0, dim: 0.12 + r * 0.03 + (o.dim ?? 0) }); } g.fillStyle = '#6a4a2a'; g.fillRect(x - 6, y - 22, cols * 92 + 30, 22); }
export function warehouse(g, t, cam, o = {}) {
  const M = mood('interiorWarm'), Y = GY(), CX = E.W / 2;
  layer(g, cam, 0.4, (g) => { backdrop(g, [shade(M.dark, -0.2), shade(M.wall, -0.2)]); for (let i = -3; i < 6; i++) { const lx = CX + i * 420; seg(g, [[lx, Y - 900], [lx, Y - 720]], 3, '#1a1414'); poly(g, [[lx - 40, Y - 720], [lx + 40, Y - 720], [lx + 20, Y - 700], [lx - 20, Y - 700]], '#2a2020'); FX.lightCone(g, lx, Y - 700, { len: 700, spread: 0.55, color: M.practical, a: 0.12 }); glow(g, lx, Y - 700, 60, M.practical, 0.5); }
    for (let i = -3; i < 5; i++) bagStack(g, CX + i * 520 - 200, Y - 120, 4, 5, M); });
  layer(g, cam, 0.85, (g) => { g.fillStyle = linGrad(g, 0, Y, 0, Y + 300, [shade(M.floor, 0.05), M.dark]); g.fillRect(-E.W, Y - 2, E.W * 3, E.H); for (let i = -3; i < 6; i++) FX.pool(g, CX + i * 420, Y + 20, 260, 40, M.practical, 0.2); });
  FX.dust(g, t, { count: 40, color: '#ffe2bd', a: 0.3 });
  return { GY: Y, CX, M };
}

// ---------- soil cross-section ----------
export function soil(g, t, cam, o = {}) {
  const M = mood('night'), Y = E.H * 0.26, CX = E.W / 2;
  layer(g, cam, 0.3, (g) => { backdrop(g, M.sky); FX.stars(g, t, { count: 80, area: [-E.W, -E.H, E.W * 3, E.H * 1.2] }); });
  layer(g, cam, 0.8, (g) => { g.fillStyle = linGrad(g, 0, Y, 0, E.H * 1.4, ['#3a2a22', '#1a120e', '#0d0806']); g.fillRect(-E.W, Y, E.W * 3, E.H * 2); const r = rng(5); for (let i = 0; i < 120; i++) circle(g, -E.W + r() * E.W * 3, Y + 20 + r() * E.H, 3 + r() * 9, alpha(r() < 0.5 ? '#4a3a30' : '#20160f', 0.7)); for (let i = -10; i < 20; i++) seg(g, [[i * 120, Y], [i * 120 + 30, Y - 30 - (i % 3) * 14]], 5, '#2a3a22'); });
  FX.snow(g, t, { count: 40, color: '#dfeaff' });
  return { M, Y, CX };
}

// ---------- blueprint globe ----------
export function globe(g, cx, cy, R, t, o = {}) {
  const bp = S().ui.blueprint, rot = o.rot ?? t * 0.05;
  circle(g, cx, cy, R, alpha(bp, 0.08)); ring(g, cx, cy, R, 4, alpha(bp, 0.8));
  for (let k = -2; k <= 2; k++) { g.strokeStyle = alpha(bp, 0.3); g.lineWidth = 2; g.beginPath(); g.ellipse(cx, cy + k * R * 0.38, Math.sqrt(1 - (k * 0.38) ** 2) * R, R * 0.06, 0, 0, 7); g.stroke(); }
  for (let k = 0; k < 6; k++) { const ph = ((rot + k / 6) % 1) * Math.PI; g.strokeStyle = alpha(bp, 0.3); g.beginPath(); g.ellipse(cx, cy, Math.abs(Math.cos(ph)) * R, R, 0, 0, 7); g.stroke(); }
}
