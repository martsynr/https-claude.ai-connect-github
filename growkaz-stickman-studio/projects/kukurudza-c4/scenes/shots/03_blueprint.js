// shots/03_blueprint.js — the explainer diagrams: photosynthesis, the turbo, photorespiration, Kranz anatomy, stomata, water, energy.
import { E, V, S, registerShot, ease, prog, key, clamp, lerp, seg, circle, ring, rr, poly, glow, alpha, mix, text, FONTS } from '/engine/core.js';
import { POSES } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { co2, o2, sugar, packet, crossSection, stoma, cornPlant } from '../sets/corn.js';
import { wt } from './01_field.js';
import { battery } from './02_cell.js';

const bp = () => UI.bpStroke(), gold = () => S().ui.gold, cream = () => S().ui.cream;
function push(g, t, info, z0 = 1, z1 = 1.06) { const z = lerp(z0, z1, ease.inOut(t / info.dur)); g.translate(E.W / 2, E.H / 2); g.scale(z, z); g.translate(-E.W / 2, -E.H / 2); }
function label(g, str, x, y, a = 1, size = V(40, 46), color = cream()) { text(g, str, x, y, { size, color, font: FONTS.ui, weight: 900, spacing: 3, alpha: a }); }
function leafIcon(g, x, y, s, col) { g.save(); g.translate(x, y); g.scale(s, s); g.strokeStyle = col; g.lineWidth = 6; g.beginPath(); g.moveTo(-180, 120); g.quadraticCurveTo(-120, -160, 160, -170); g.quadraticCurveTo(120, 90, -180, 120); g.stroke(); seg(g, [[-180, 120], [150, -160]], 4, col); for (let i = 1; i < 6; i++) { const k = i / 6, px = lerp(-180, 150, k), py = lerp(120, -160, k); seg(g, [[px, py], [px + 40, py + 50]], 3, alpha(col, 0.7)); seg(g, [[px, py], [px - 30, py - 50]], 3, alpha(col, 0.7)); } g.restore(); }

// s07 — leaf + CO2 drifting in
registerShot('s07', { draw(g, t, info) {
  UI.blueprint(g); g.save(); push(g, t, info);
  const tC = wt('вуглекислий', info, 3.77), cx = E.W / 2, cy = E.H * V(0.45, 0.42);
  leafIcon(g, cx, cy, V(1.2, 1.4), bp());
  label(g, 'УСІ РОСЛИНИ', cx, E.H * V(0.14, 0.15), ease.out(prog(t, 0.2, 0.6)));
  for (let i = 0; i < 6; i++) { const k = ease.out(prog(t, tC + i * 0.12, tC + 1.2 + i * 0.12)); if (k <= 0) continue; const y = cy - 220 + i * 90; co2(g, lerp(-80, cx - 120 + (i % 2) * 140, k), y, 26, k); }
  label(g, 'CO2', cx - V(300, 330), cy - V(330, 380), ease.out(prog(t, tC, tC + 0.4)), V(54, 60), gold());
  g.restore();
} });

// s08 — sun rays → sugar
registerShot('s08', { draw(g, t, info) {
  UI.blueprint(g); g.save(); push(g, t, info);
  const cx = E.W / 2, cy = E.H * V(0.45, 0.42), tS = wt('цукор', info, 2.3);
  leafIcon(g, cx, cy, V(1.2, 1.4), bp());
  const sx = E.W * 0.82, sy = E.H * 0.12; circle(g, sx, sy, 60, gold()); glow(g, sx, sy, 220, gold(), 0.4);
  for (let i = 0; i < 5; i++) { const k = ease.out(prog(t, 0.2 + i * 0.1, 1.0 + i * 0.1)); seg(g, [[sx - 40 - i * 20, sy + 50], [lerp(sx - 40 - i * 20, cx - 60 + i * 40, k), lerp(sy + 50, cy - 60, k)]], 4, alpha(gold(), 0.7)); }
  const p = ease.outBack(prog(t, tS - 0.2, tS + 0.3)); if (p > 0) { sugar(g, cx, cy + V(330, 420), 110 * p); label(g, 'ЦУКОР', cx, cy + V(450, 540), clamp(p), V(52, 60), gold()); }
  g.restore();
} });

// s10 — blueprint corn plant with a spinning turbine; ТУРБО
registerShot('s10', { draw(g, t, info) {
  UI.blueprint(g); g.save(); push(g, t, info);
  const tT = wt('турбонаддув', info, 2.2), cx = E.W / 2, base = E.H * V(0.85, 0.75);
  g.save(); g.globalAlpha = 0.9; cornPlant(g, cx, base, V(720, 1000), { sway: 0, seed: 4, color: alpha(bp(), 0.5), leaves: 8, w: 10 }); g.restore();
  const on = ease.outBack(prog(t, tT - 0.2, tT + 0.3)), ty = base - V(420, 560), R = 110 * on;
  if (on > 0) { circle(g, cx, ty, R * 1.15, '#061a12'); ring(g, cx, ty, R * 1.15, 6, gold()); glow(g, cx, ty, R * 3, gold(), 0.35);
    const sp = t * (t > tT ? 14 : 2); for (let i = 0; i < 6; i++) { const a = sp + i * Math.PI / 3; g.save(); g.translate(cx, ty); g.rotate(a); g.fillStyle = gold(); g.beginPath(); g.ellipse(R * 0.5, 0, R * 0.5, R * 0.16, 0.3, 0, 7); g.fill(); g.restore(); } circle(g, cx, ty, R * 0.18, '#fff6d8');
    text(g, 'ТУРБО', cx, E.H * V(0.13, 0.12), { size: V(110, 130), color: gold(), glow: 30, glowColor: 'rgba(255,140,40,.8)', alpha: clamp(on), spacing: 6 }); }
  g.restore();
} });

// s11 — grid of plants: most grey, a few gold
registerShot('s11', { draw(g, t, info) {
  UI.blueprint(g); g.save(); push(g, t, info);
  const cols = 8, rows = 9, cw = E.W * 0.86 / cols, x0 = E.W * 0.07 + cw / 2, y0 = E.H * V(0.2, 0.17), rh = E.H * V(0.075, 0.062);
  const gold3 = [5, 22, 47, 63], tB = wt('більшості', info, 1.1);
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) { const i = r * cols + c, k = ease.out(prog(t, i * 0.01, 0.3 + i * 0.01)); const lit = gold3.includes(i) && t > tB; const x = x0 + c * cw, y = y0 + r * rh;
    g.save(); g.globalAlpha *= k; const col = lit ? gold() : alpha(bp(), 0.35); seg(g, [[x, y + 30], [x, y - 30]], 4, col); seg(g, [[x, y + 6], [x - 22, y - 14]], 4, col); seg(g, [[x, y - 6], [x + 22, y - 26]], 4, col); if (lit) glow(g, x, y, 60, gold(), 0.4); g.restore(); }
  label(g, 'БІЛЬШІСТЬ РОСЛИН — БЕЗ ТУРБО', E.W / 2, E.H * V(0.1, 0.09), ease.out(prog(t, tB, tB + 0.4)), V(36, 38));
  g.restore();
} });

// s18 — «ФОТОДИХАННЯ» card
registerShot('s18', { draw(g, t, info) {
  UI.blueprint(g); g.save(); push(g, t, info, 1.04, 1.0);
  const tF = wt('фотодиханням', info, 0.9), p = ease.outBack(prog(t, tF - 0.2, tF + 0.3));
  o2(g, E.W / 2 - 150, E.H * 0.3, 40, clamp(p)); text(g, '→', E.W / 2, E.H * 0.3, { size: 80, color: cream(), font: FONTS.ui, weight: 900, alpha: clamp(p) }); g.save(); g.globalAlpha *= clamp(p); FX.rings(g, E.W / 2 + 150, E.H * 0.3, t, { count: 2, r0: 20, r1: 80, color: '#ff6b5a', a: 0.6 }); g.restore();
  g.save(); g.translate(E.W / 2, E.H * 0.43); g.scale(0.85 + 0.15 * clamp(p), 0.85 + 0.15 * clamp(p)); text(g, 'ФОТОДИХАННЯ', 0, 0, { size: V(96, 104), color: gold(), glow: 30, glowColor: 'rgba(255,140,40,.8)', alpha: clamp(p), spacing: 3 }); g.restore();
  label(g, 'втрата енергії', E.W / 2, E.H * 0.5, ease.out(prog(t, tF + 0.4, tF + 0.8)), V(36, 40), '#ff8a7a');
  g.restore();
} });

// s21 — Kranz cross-section; outer ring lights up
registerShot('s21', { draw(g, t, info) {
  UI.blueprint(g); g.save(); push(g, t, info);
  const tO = wt('зовнішніх', info, 0.3), o = ease.inOut(prog(t, tO, tO + 0.6));
  const { cx, cy, R } = crossSection(g, t, { outer: o });
  label(g, 'РОЗРІЗ ЛИСТКА', cx, E.H * V(0.1, 0.1), ease.out(prog(t, 0, 0.4)));
  UI.callout(g, t, { at: [cx + R * 0.9, cy - R * 0.6], to: [cx + R * 0.3, cy + R * 1.35], str: 'ЗОВНІШНІ КЛІТИНИ', start: tO + 0.2, color: gold() });
  g.restore();
} });

// s24 — four carbon atoms light up
registerShot('s24', { draw(g, t, info) {
  UI.blueprint(g); g.save(); push(g, t, info);
  const t4 = wt('чотирма', info, 1.78), cy = E.H * 0.4, dx = V(200, 210), x0 = E.W / 2 - dx * 1.5;
  for (let i = 0; i < 3; i++) seg(g, [[x0 + i * dx + 50, cy], [x0 + (i + 1) * dx - 50, cy]], 8, alpha(bp(), 0.6));
  for (let i = 0; i < 4; i++) { const on = ease.outBack(prog(t, t4 + i * 0.25, t4 + i * 0.25 + 0.3)), x = x0 + i * dx; circle(g, x, cy, 52, '#0b1a12'); ring(g, x, cy, 52, 6, on > 0 ? gold() : alpha(bp(), 0.6)); if (on > 0) { glow(g, x, cy, 110, gold(), 0.35 * on); } text(g, 'C', x, cy + 2, { size: 56, color: on > 0 ? gold() : alpha(bp(), 0.7), font: FONTS.ui, weight: 900 }); }
  const n = Math.min(4, Math.max(0, Math.floor((t - t4) / 0.25) + 1));
  text(g, String(n), E.W / 2, E.H * 0.58, { size: V(180, 200), color: gold(), font: FONTS.ui, weight: 900, glow: 26, glowColor: alpha(gold(), 0.6), alpha: ease.out(prog(t, t4, t4 + 0.2)) });
  label(g, 'АТОМИ ВУГЛЕЦЮ', E.W / 2, E.H * 0.66, ease.out(prog(t, t4 + 0.6, t4 + 1)));
  label(g, 'СПЕЦІАЛЬНА МОЛЕКУЛА', E.W / 2, E.H * V(0.16, 0.2), ease.out(prog(t, 0.1, 0.5)));
  g.restore();
} });

// s26 — parcels travel inward
registerShot('s26', { draw(g, t, info) {
  UI.blueprint(g); g.save(); push(g, t, info);
  const { cx, cy, R } = crossSection(g, t, { outer: 0.4, inner: ease.inOut(prog(t, 2.2, 3.2)) });
  for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2 + 0.2, k = ease.inOut(prog(t, 0.3 + i * 0.12, 1.8 + i * 0.12)); const r = lerp(R, R * 0.5, k); packet(g, cx + Math.cos(a) * r, cy + Math.sin(a) * r, 64, clamp(t * 2)); }
  UI.callout(g, t, { at: [cx - R * 0.45, cy + R * 0.25], to: [cx - R * 0.6, cy + R * 1.35], str: 'НАВКОЛО ЖИЛКИ', start: wt('навколо', info, 3.68) - 0.1, color: gold() });
  label(g, 'ВГЛИБ', cx, E.H * V(0.1, 0.1), ease.out(prog(t, 0.2, 0.6)));
  g.restore();
} });

// s29 — ordinary air (few CO2) vs the inner cell (many)
registerShot('s29', { draw(g, t, info) {
  UI.blueprint(g); g.save(); push(g, t, info);
  const tA = wt('повітрі', info, 5.74), tM = wt('кілька', info, 3.36);
  const box = (x, y, w, h, n, lab, col, a, seed) => { rr(g, x - w / 2, y - h / 2, w, h, 24); g.strokeStyle = alpha(col, 0.8 * a); g.lineWidth = 5; g.stroke(); g.save(); g.beginPath(); g.rect(x - w / 2, y - h / 2, w, h); g.clip(); for (let i = 0; i < n; i++) { const px = x - w / 2 + 40 + ((i * 97 + seed) % (w - 80)) + Math.sin(t + i) * 8, py = y - h / 2 + 40 + ((i * 61 + seed * 3) % (h - 80)) + Math.cos(t * 0.8 + i) * 8; co2(g, px, py, 18, a); } g.restore(); label(g, lab, x, y + h / 2 + 50, a, V(34, 38), col); };
  const w = V(420, 440), h = V(520, 460), yA = E.H * V(0.42, 0.28), yB = E.H * V(0.42, 0.6);
  const xA = V(E.W / 2 - 260, E.W / 2), xB = V(E.W / 2 + 260, E.W / 2);
  box(xB, yB, w, h, Math.round(4 + 40 * ease.inOut(prog(t, 0.3, tM + 0.6))), 'ЖИЛКА КУКУРУДЗИ', gold(), 1, 7);
  box(xA, yA, w, h, 5, 'ЗВИЧАЙНЕ ПОВІТРЯ', bp(), ease.out(prog(t, tA - 1.5, tA - 0.8)) || 0.35, 3);
  const p = ease.outBack(prog(t, tM - 0.1, tM + 0.3)); if (p > 0) text(g, '× кілька разів', E.W - V(200, 230), V(E.H * 0.18, yB - h / 2 - 50), { size: V(46, 48), color: gold(), font: FONTS.ui, weight: 900, alpha: clamp(p), glow: 16, glowColor: alpha(gold(), 0.5) });
  g.restore();
} });

// s31 — the pump cycle; +1 bonus
registerShot('s31', { draw(g, t, info) {
  UI.blueprint(g); g.save(); push(g, t, info);
  const cx = E.W / 2, cy = E.H * 0.4, R = V(260, 300);
  for (let i = 0; i < 4; i++) { const a0 = t * 1.6 + i * Math.PI / 2; g.strokeStyle = alpha(gold(), 0.8); g.lineWidth = 10; g.lineCap = 'round'; g.beginPath(); g.arc(cx, cy, R, a0, a0 + 1.1); g.stroke(); const ax = cx + Math.cos(a0 + 1.1) * R, ay = cy + Math.sin(a0 + 1.1) * R; circle(g, ax, ay, 14, gold()); }
  packet(g, cx, cy, 120); label(g, 'НАСОС', cx, cy + R + 80, 1);
  const tO = wt('перевагу', info, 1.78), p = ease.outBack(prog(t, tO - 0.3, tO + 0.1));
  if (p > 0) UI.badge(g, { str: '+1 ПЕРЕВАГА', a: clamp(p), size: V(38, 44) });
  g.restore();
} });

// leaf surface background with cells
function epidermis(g, t, s = 1) { const c = bp(); for (let r = 0; r < 14; r++) for (let k = 0; k < 6; k++) { const x = (k + (r % 2) * 0.5) * 220 * s - 60, y = r * 150 * s - 40; rr(g, x, y, 200 * s, 130 * s, 40 * s); g.strokeStyle = alpha(c, 0.18); g.lineWidth = 3; g.stroke(); } }

// s32 — stomata open; label ПРОДИХ
registerShot('s32', { draw(g, t, info) {
  UI.blueprint(g); g.save(); push(g, t, info, 1.0, 1.12); epidermis(g, t);
  const tP = wt('продихи', info, 4.6), open = ease.inOut(prog(t, 0.6, 2.2));
  const pts = [[0.3, 0.3], [0.72, 0.42], [0.36, 0.6], [0.68, 0.75]];
  pts.forEach(([x, y], i) => stoma(g, E.W * x, E.H * y, V(150, 170), open * (0.8 + 0.2 * Math.sin(t * 2 + i)), { color: '#3f8a52', rim: bp() }));
  UI.callout(g, t, { at: [E.W * 0.72, E.H * 0.42 - 80], to: [E.W * 0.6, E.H * 0.2], str: 'ПРОДИХ', start: tP - 0.1, color: gold() });
  label(g, 'КРИХІТНІ ПОРИ', E.W / 2, E.H * V(0.1, 0.1), ease.out(prog(t, 2.8, 3.2)));
  g.restore();
} });

// s33 — water vapour drifts out of a stoma
registerShot('s33', { draw(g, t, info) {
  UI.blueprint(g); g.save(); push(g, t, info, 1.0, 1.05); epidermis(g, t, 1.6);
  const cx = E.W / 2, cy = E.H * 0.55; stoma(g, cx, cy, V(380, 420), 0.9, { color: '#3f8a52', rim: bp() });
  for (let i = 0; i < 14; i++) { const k = ((t * 0.5 + i / 14) % 1), x = cx + Math.sin(i * 3.1 + t) * 60 * k, y = cy - k * E.H * 0.42, r = 10 + 14 * k; g.fillStyle = alpha('#9fd8ff', 0.7 * (1 - k)); g.beginPath(); g.moveTo(x, y - r * 1.4); g.quadraticCurveTo(x + r, y, x, y + r); g.quadraticCurveTo(x - r, y, x, y - r * 1.4); g.fill(); }
  label(g, 'ВОДА', cx, E.H * V(0.12, 0.1), ease.out(prog(t, 0.6, 1.0)), V(60, 70), '#9fd8ff');
  g.restore();
} });

// s34 — wheat wide open vs corn barely open
registerShot('s34', { draw(g, t, info) {
  UI.blueprint(g); g.save(); push(g, t, info);
  const a = ease.out(prog(t, 0.2, 0.7)), yA = E.H * V(0.42, 0.3), yB = E.H * V(0.42, 0.6), xA = V(E.W * 0.28, E.W / 2), xB = V(E.W * 0.72, E.W / 2);
  g.save(); g.globalAlpha *= a; stoma(g, xA, yA, V(230, 240), 1.0, { color: '#8a7a3a', rim: '#ffe6a0' }); stoma(g, xB, yB, V(230, 240), 0.3 + 0.05 * Math.sin(t * 2), { color: '#3f8a52', rim: bp() }); g.restore();
  label(g, 'ПШЕНИЦЯ', xA, yA + V(190, 200), a, V(40, 44), '#ffe6a0'); label(g, 'КУКУРУДЗА', xB, yB + V(190, 200), a, V(40, 44), gold());
  label(g, 'широко відкриті', xA, yA - V(180, 190), ease.out(prog(t, 1.2, 1.6)), V(30, 32)); label(g, 'ледь відкриті', xB, yB - V(180, 190), ease.out(prog(t, 1.8, 2.2)), V(30, 32));
  g.restore();
} });

// s35 — water bars: wheat vs corn ≈ half
registerShot('s35', { draw(g, t, info) {
  UI.blueprint(g); g.save(); push(g, t, info);
  const tH = wt('вдвічі', info, 0.78), ui = S().ui, bx = E.W / 2 - V(380, 400), bw = V(760, 800);
  label(g, 'ВОДА НА ГРАМ УРОЖАЮ', E.W / 2, E.H * V(0.2, 0.22), ease.out(prog(t, 0, 0.4)), V(40, 42));
  [['ПШЕНИЦЯ', 1.0, '#9fd8ff'], ['КУКУРУДЗА', 0.5, gold()]].forEach(([lab, v, col], i) => {
    const q = ease.out(prog(t, i ? tH - 0.1 : 0.2, i ? tH + 0.7 : 1.0)), y = E.H * V(0.42, 0.36) + i * V(180, 200);
    label(g, lab, E.W / 2, y - V(56, 60), q, V(36, 40), col);
    rr(g, bx, y - 26, bw, 52, 26); g.fillStyle = alpha(col, 0.12); g.fill(); if (q > 0) { rr(g, bx, y - 26, Math.max(52, bw * v * q), 52, 26); g.fillStyle = col; g.fill(); }
    for (let k = 0; k < Math.round(8 * v * q); k++) { const x = bx + 40 + k * 90, yy = y + 70; g.fillStyle = alpha('#9fd8ff', 0.8); g.beginPath(); g.moveTo(x, yy - 18); g.quadraticCurveTo(x + 13, yy + 4, x, yy + 12); g.quadraticCurveTo(x - 13, yy + 4, x, yy - 18); g.fill(); }
  });
  const p = ease.outBack(prog(t, tH, tH + 0.4)); if (p > 0) text(g, '½', E.W / 2, E.H * V(0.82, 0.68), { size: V(130, 150), color: gold(), font: FONTS.ui, weight: 900, alpha: clamp(p), glow: 24, glowColor: alpha(gold(), 0.6) });
  g.restore();
} });

// s37 — the pump eats energy
registerShot('s37', { draw(g, t, info) {
  UI.blueprint(g); g.save(); push(g, t, info);
  const cx = E.W / 2, cy = E.H * 0.33, R = V(200, 220), tE = wt('енергію', info, 1.37);
  for (let i = 0; i < 4; i++) { const a0 = t * 2 + i * Math.PI / 2; g.strokeStyle = alpha(gold(), 0.8); g.lineWidth = 10; g.lineCap = 'round'; g.beginPath(); g.arc(cx, cy, R, a0, a0 + 1.1); g.stroke(); }
  packet(g, cx, cy, 100); label(g, 'НАСОС', cx, cy + R + 70, 1);
  const lvl = 1 - 0.65 * ease.inOut(prog(t, tE - 0.3, info.dur)); battery(g, cx, E.H * 0.6, V(420, 460), V(150, 160), lvl, lvl > 0.5 ? S().ui.good : '#ff6b5a');
  for (let i = 0; i < 5; i++) { const k = ((t * 1.2 + i / 5) % 1); circle(g, cx, lerp(E.H * 0.6 - 90, cy + R + 20, k), 9, alpha(S().ui.good, 1 - k)); }
  label(g, 'ЕНЕРГІЯ', cx, E.H * 0.6 + V(120, 130), 1);
  g.restore();
} });
