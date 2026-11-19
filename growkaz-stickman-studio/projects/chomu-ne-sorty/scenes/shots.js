// shots.js — "Чому фермери не сіють сорти", 9:16 line-art. Stage 1080×1920, ground at GY, captions at ~1517.
import { E, S, registerShot, ease, prog, clamp, lerp, rr, circle, alpha, text, FONTS, wordTime, rng } from '/engine/core.js';
import { person, rake, flask, magnifier, clipboard, cloud, bird, ground, grass, cornLine, tubes, corn, INK, C } from './people.js';
import { bagFace, logo } from './sets/brand.js';

const GY = 1330, CX = 540;
const GREEN = '#6aa84f', AMBER = '#d9952a', RED = '#d9534a', BLUE = '#4f7fae';
const wt = (w, info, fb) => { const v = wordTime(w, info.shot.start - 0.05); return (v != null && v < info.shot.end + 0.5 ? v : info.shot.start + fb) - info.shot.start; };
const pop = (t, t0, d = 0.35) => ease.outBack(prog(t, t0, t0 + d));
const fade = (t, t0, d = 0.3) => ease.out(prog(t, t0, t0 + d));
function push(g, t, info, z0 = 1, z1 = 1.05, cy = 900) { const z = lerp(z0, z1, ease.inOut(t / info.dur)); g.translate(CX, cy); g.scale(z, z); g.translate(-CX, -cy); }
function T(g, str, x, y, size = 64, color = INK, a = 1, o = {}) { if (a <= 0) return; text(g, str, x, y, { size, color, font: o.font || FONTS.title, weight: o.weight || 700, alpha: clamp(a), spacing: o.sp ?? 2, align: o.align || 'center' }); }
function L(g, str, x, y, a = 1, size = 40, color = INK) { T(g, str, x, y, size, color, a, { font: FONTS.ui, weight: 900, sp: 3 }); }
function chip(g, str, x, y, a, color = AMBER, size = 40) { if (a <= 0) return; g.save(); g.translate(x, y); g.scale(a, a); const w = str.length * size * 0.62 + 50; rr(g, -w / 2, -size * 0.8, w, size * 1.6, size * 0.8); g.fillStyle = '#ffffff'; g.fill(); g.strokeStyle = color; g.lineWidth = 4; g.stroke(); T(g, str, 0, 2, size, color, 1, { font: FONTS.ui, weight: 900 }); g.restore(); }
function bg(g, t, o = {}) {
  g.fillStyle = '#fbfcfd'; g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
  if (o.sky !== false) { cloud(g, 180 + Math.sin(t * 0.2) * 10, 520, 0.8); cloud(g, 860 - t * 4, 360, 1.0); if (o.birds !== false) { bird(g, 300, 260, 1, t * 6); bird(g, 380, 320, 1.2, t * 6 + 1); } }
  if (o.ground !== false) { ground(g, GY, -100, 1180); grass(g, 120, GY); grass(g, 980, GY); }
}
const blink = (t, p = 3.1) => (t % p) > p - 0.12;
const cobProp = (g, x, y) => corn(g, 'cob_leaves', x, y - 70, 150);
const bigCob = (g, x, y) => corn(g, 'cob_leaves', x + 10, y - 110, 230);
const bagProp = (g, x, y) => { g.save(); g.translate(x, y - 30); bagFace(g, -110, -150, 220, 300, { r: 26 }); g.restore(); };
const kernelSeed = (g, x, y, s = 1) => { g.save(); g.translate(x, y); g.scale(s, s); g.beginPath(); g.moveTo(0, 12); g.quadraticCurveTo(-12, 4, -9, -8); g.quadraticCurveTo(0, -14, 9, -8); g.quadraticCurveTo(12, 4, 0, 12); g.fillStyle = '#f6dc7a'; g.fill(); g.strokeStyle = INK; g.lineWidth = 2.5; g.stroke(); g.restore(); };
function row(g, t, xs, hs, o = {}) { xs.forEach((x, i) => cornLine(g, x, o.y ?? GY, hs[i], { sway: Math.sin(t * 1.2 + i) * 4, cob: o.cob?.[i] ?? (hs[i] > 300 ? 1 : 0.6), color: o.color?.[i] })); }
function barn(g, x, y) { g.save(); g.translate(x, y); g.beginPath(); g.moveTo(-120, 0); g.lineTo(-120, -170); g.lineTo(0, -260); g.lineTo(120, -170); g.lineTo(120, 0); g.closePath(); g.fillStyle = '#f3e3d0'; g.fill(); g.strokeStyle = INK; g.lineWidth = 3.4; g.stroke(); rr(g, -40, -120, 80, 120, 4); g.fillStyle = '#d9a37a'; g.fill(); g.stroke(); g.beginPath(); g.moveTo(-40, -120); g.lineTo(40, 0); g.moveTo(40, -120); g.lineTo(-40, 0); g.stroke(); g.restore(); }
function basket(g, x, y) { g.save(); g.translate(x, y); for (let i = 0; i < 5; i++) corn(g, 'cob_husk', -60 + i * 30, -60 - (i % 2) * 14, 90, { rot: -0.3 + i * 0.15 }); g.beginPath(); g.moveTo(-90, -50); g.lineTo(90, -50); g.lineTo(70, 0); g.lineTo(-70, 0); g.closePath(); g.fillStyle = '#e8c99a'; g.fill(); g.strokeStyle = INK; g.lineWidth = 3.4; g.stroke(); for (let k = 1; k < 3; k++) { g.beginPath(); g.moveTo(-85 + k * 3, -50 + k * 16); g.lineTo(85 - k * 3, -50 + k * 16); g.stroke(); } g.restore(); }
function star(g, x, y, r, a) { if (a <= 0) return; g.save(); g.globalAlpha *= clamp(a); g.translate(x, y); g.beginPath(); for (let i = 0; i < 10; i++) { const rr2 = i % 2 ? r * 0.45 : r, an = -Math.PI / 2 + i * Math.PI / 5; g.lineTo(Math.cos(an) * rr2, Math.sin(an) * rr2); } g.closePath(); g.fillStyle = '#f6dc7a'; g.fill(); g.strokeStyle = INK; g.lineWidth = 3; g.stroke(); g.restore(); }
function sparkle(g, x, y, r, a) { if (a <= 0) return; g.save(); g.globalAlpha *= clamp(a); g.strokeStyle = AMBER; g.lineWidth = 4; g.lineCap = 'round'; for (let i = 0; i < 8; i++) { const an = i * Math.PI / 4; g.beginPath(); g.moveTo(x + Math.cos(an) * r * 0.5, y + Math.sin(an) * r * 0.5); g.lineTo(x + Math.cos(an) * r, y + Math.sin(an) * r); g.stroke(); } g.restore(); }
function arrow(g, x0, y0, x1, y1, a = 1, col = INK) { if (a <= 0) return; g.save(); g.globalAlpha *= clamp(a); g.strokeStyle = col; g.lineWidth = 4; g.lineCap = 'round'; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); const an = Math.atan2(y1 - y0, x1 - x0); g.beginPath(); g.moveTo(x1, y1); g.lineTo(x1 - Math.cos(an - 0.5) * 22, y1 - Math.sin(an - 0.5) * 22); g.moveTo(x1, y1); g.lineTo(x1 - Math.cos(an + 0.5) * 22, y1 - Math.sin(an + 0.5) * 22); g.stroke(); g.restore(); }
function bar(g, x, y, w, h, k, col, label) { rr(g, x - w / 2, y - h, w, h, 10); g.strokeStyle = INK; g.lineWidth = 3; g.stroke(); const hh = h * k; rr(g, x - w / 2, y - hh, w, hh, 10); g.fillStyle = col; g.fill(); g.stroke(); L(g, label, x, y + 44, 1, 36); }
const F = { who: 'farmer' }, B = { who: 'breeder' };

// c01 — a hundred years ago
registerShot('c01', { draw(g, t, info) { push(g, t, info, 1.0, 1.06); bg(g, t); barn(g, 240, GY); basket(g, 860, GY);
  person(g, { ...F, x: CX + 40, y: GY, s: 0.92, expr: 'smile', blink: blink(t), armR: [0.22, 0.95], propR: rake });
  chip(g, '100 РОКІВ ТОМУ', CX, 230, pop(t, 0.3), BLUE, 46); } });
// c02 — picks the best cob
registerShot('c02', { draw(g, t, info) { push(g, t, info, 1.04, 1.1, 1000); bg(g, t); basket(g, 300, GY);
  const up = ease.inOut(prog(t, 0.4, 1.2)); person(g, { ...F, x: CX + 80, y: GY, s: 0.92, expr: t > 1.2 ? 'happy' : 'thinking', look: [-0.4, -0.2], blink: blink(t), armL: [lerp(0.2, 0.5, up), lerp(0.1, 2.2, up)], propL: cobProp });
  star(g, CX - 120, 720, 40, pop(t, wt('найкращі', info, 1.0))); L(g, 'НАЙКРАЩІ КАЧАНИ', CX, 260, fade(t, wt('найкращі', info, 1.0)), 44, AMBER); } });
// c03 — sowing in spring
registerShot('c03', { draw(g, t, info) { push(g, t, info); bg(g, t); g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.moveTo(80, GY + 40); g.lineTo(1000, GY + 40); g.stroke();
  const sw = Math.sin(t * 5); person(g, { ...F, x: 360, y: GY, s: 0.9, expr: 'smile', blink: blink(t), armR: [0.5 + sw * 0.2, 0.8] });
  for (let i = 0; i < 12; i++) { const k = ((t * 0.9 + i / 12) % 1); kernelSeed(g, lerp(500, 980, (i % 6) / 6 + k * 0.1), lerp(820, GY + 30, k * k), 1.1); }
  for (let i = 0; i < 6; i++) { const k = ease.out(prog(t, 0.8 + i * 0.15, 1.6 + i * 0.15)); if (k > 0) cornLine(g, 560 + i * 80, GY, 70 * k, { tassel: false }); }
  L(g, 'НАВЕСНІ', CX, 260, fade(t, 0.1), 46, GREEN); } });
// c04 — СОРТ
registerShot('c04', { draw(g, t, info) { push(g, t, info, 1.0, 1.04); bg(g, t, { birds: false }); row(g, t, [160, 350, 540, 730, 920], [430, 360, 500, 390, 460]);
  T(g, 'СОРТ', CX, 330, 150, INK, pop(t, 0.1, 0.4)); } });
// c05 — a crowd
registerShot('c05', { draw(g, t, info) { push(g, t, info, 1.02, 1.08); bg(g, t, { birds: false }); const r = rng(5); const xs = [], hs = []; for (let i = 0; i < 9; i++) { xs.push(80 + i * 115); hs.push(250 + r() * 330); } row(g, t, xs, hs);
  T(g, 'НАТОВП', CX, 330, 120, RED, pop(t, wt('натовп', info, 0.9) - 0.1)); } });
// c06 — every plant differs: height marks
registerShot('c06', { draw(g, t, info) { push(g, t, info, 1.04, 1.1); bg(g, t, { birds: false }); const hs = [480, 330, 420, 260, 390], xs = [150, 340, 540, 740, 930]; row(g, t, xs, hs);
  hs.forEach((h, i) => { const a = fade(t, 0.6 + i * 0.25); if (a <= 0) return; g.save(); g.globalAlpha *= a; g.setLineDash([10, 10]); g.strokeStyle = BLUE; g.lineWidth = 3; g.beginPath(); g.moveTo(xs[i] - 70, GY - h); g.lineTo(xs[i] + 70, GY - h); g.stroke(); g.restore(); });
  L(g, 'КОЖНА — ІНША', CX, 300, fade(t, wt('інша', info, 2.6)), 50, BLUE); } });
// c07 — taller, lower, earlier, later
registerShot('c07', { draw(g, t, info) { push(g, t, info); bg(g, t, { birds: false }); const xs = [190, 420, 650, 880], hs = [560, 280, 420, 420]; row(g, t, xs, hs);
  const W = [['вища', 'ВИЩА'], ['нижча', 'НИЖЧА'], ['раніше', 'ЦВІТЕ РАНІШЕ'], ['пізніше', 'ПІЗНІШЕ']];
  W.forEach(([w, s], i) => { const tt = wt(w, info, 0.4 + i), a = pop(t, tt - 0.1); chip(g, s, xs[i], GY - hs[i] - 90 - (i % 2) * 40, a, [GREEN, RED, AMBER, BLUE][i], 30);
    if (i === 2 && t > tt) for (let k = 0; k < 10; k++) { const kk = ((t * 0.6 + k / 10) % 1); circle(g, xs[i] + Math.sin(k * 3 + t) * 40, GY - hs[i] + kk * 160, 4, AMBER); } }); } });
// c08 — mixed cobs, average yield
registerShot('c08', { draw(g, t, info) { push(g, t, info); bg(g, t, { birds: false });
  const sizes = [150, 220, 120, 190, 160]; sizes.forEach((s, i) => corn(g, 'cob_leaves', 150 + i * 195, 980 - s * 0.2, s, { rot: (i - 2) * 0.12 }));
  const k = ease.inOut(prog(t, 0.6, 1.6)) * 0.5; rr(g, 140, 1180, 800, 60, 30); g.strokeStyle = INK; g.lineWidth = 3; g.stroke(); rr(g, 140, 1180, 800 * k, 60, 30); g.fillStyle = AMBER; g.fill(); g.stroke();
  L(g, 'УРОЖАЙ', CX, 1130, 1, 40); L(g, 'СТРОКАТИЙ І ПОСЕРЕДНІЙ', CX, 300, fade(t, wt('строкатий', info, 0.5)), 46, AMBER); } });
// c09 — breeder arrives
registerShot('c09', { draw(g, t, info) { push(g, t, info, 1.04, 1.0); bg(g, t); row(g, t, [130, 260], [420, 300]);
  const x = lerp(1250, 640, ease.out(prog(t, 0, 1.0))); person(g, { ...B, x, y: GY, s: 0.92, expr: 'neutral', blink: blink(t, 2.7), armL: [0.35, 1.9], propL: clipboard });
  L(g, 'СЕЛЕКЦІОНЕР', CX, 260, fade(t, 0.8), 46, BLUE); } });
// c10 — self-pollination over the years
registerShot('c10', { draw(g, t, info) { push(g, t, info, 1.0, 1.06); bg(g, t, { sky: false }); const x = CX, h = 620; cornLine(g, x, GY, h, { cob: 1, sway: 0 });
  for (let i = 0; i < 14; i++) { const k = ((t * 0.5 + i / 14) % 1), an = -1.4 + k * 3.2, R = 190; circle(g, x + 40 + Math.cos(an) * R, GY - h * 0.75 + Math.sin(an) * R * 1.1, 6, AMBER); }
  arrow(g, x + 220, GY - h * 0.6, x + 70, GY - h * 0.5 + 20, 1, AMBER);
  const yr = Math.min(7, 1 + Math.floor(t / 0.55)); chip(g, `РІК ${yr}`, CX, 260, 1, BLUE, 48); L(g, 'ВЛАСНИЙ ПИЛОК', CX, 380, fade(t, wt('пилком', info, 3.0)), 42, AMBER); } });
// c11, c12 — pure line, twins
function pureRow(g, t, h, o = {}) { const xs = [150, 345, 540, 735, 930]; xs.forEach((x, i) => cornLine(g, x, GY, h, { sway: Math.sin(t * 1.2) * 4, cob: o.cob ?? 0.7 })); return xs; }
registerShot('c11', { draw(g, t, info) { push(g, t, info); bg(g, t, { birds: false }); pureRow(g, t, 400); chip(g, 'ЧИСТА ЛІНІЯ', CX, 300, pop(t, wt('лінії', info, 1.4)), GREEN, 52); } });
registerShot('c12', { draw(g, t, info) { push(g, t, info, 1.04, 1.1); bg(g, t, { birds: false }); const xs = pureRow(g, t, 400);
  for (let i = 0; i < 4; i++) { const a = pop(t, 0.4 + i * 0.15); if (a > 0) T(g, '=', (xs[i] + xs[i + 1]) / 2, GY - 220, 80 * a, BLUE); } L(g, 'ЯК БЛИЗНЮКИ', CX, 300, fade(t, wt('близнюки', info, 2.0)), 50, BLUE); } });
// c13 — weak & low
registerShot('c13', { draw(g, t, info) { push(g, t, info); bg(g, t, { birds: false }); const k = ease.inOut(prog(t, 0.2, 1.4)); [130, 290, 450].forEach((x, i) => cornLine(g, x, GY, lerp(400, 210, k), { cob: lerp(0.7, 0.25, k) }));
  person(g, { ...B, x: 800, y: GY, s: 0.9, expr: 'worried', blink: blink(t, 2.7), armL: [0.2, 0.2], armR: [0.35, 1.9], propR: clipboard });
  L(g, 'СЛАБКІ Й НИЗЬКІ', 340, 300, fade(t, wt('слабкі', info, 0.3)), 44, RED); L(g, 'МІЗЕРНИЙ УРОЖАЙ', 340, 380, fade(t, wt('мізерним', info, 2.4)), 40, RED); } });
// c14 — a miracle
registerShot('c14', { draw(g, t, info) { push(g, t, info, 1.05, 1.12, 700); bg(g, t);
  person(g, { ...B, x: CX, y: GY, s: 0.95, expr: 'surprised', blink: false, armL: [0.4, 2.0], propL: flask, armR: [0.45, 2.2] });
  for (let i = 0; i < 4; i++) sparkle(g, CX + [-300, 300, -240, 260][i], [450, 520, 760, 820][i], 50, pop(t, 0.2 + i * 0.12)); T(g, 'ДИВО!', CX, 280, 110, AMBER, pop(t, wt('диво', info, 1.3) - 0.1)); } });
// c15 — A × B → hybrid
registerShot('c15', { draw(g, t, info) { push(g, t, info, 1.0, 1.04); bg(g, t, { sky: false, ground: false });
  const top = 600; ground(g, top, 60, 470); ground(g, top, 610, 1020); cornLine(g, 260, top, 260, { cob: 0.4 }); cornLine(g, 820, top, 260, { cob: 0.4 });
  L(g, 'ЛІНІЯ А', 260, top + 50, 1, 36, BLUE); L(g, 'ЛІНІЯ Б', 820, top + 50, 1, 36, BLUE); T(g, '×', CX, top - 140, 120, RED, pop(t, 0.5));
  arrow(g, CX, top + 40, CX, top + 150, fade(t, 1.6));
  const gk = ease.out(prog(t, 2.0, wt('батьків', info, 5.0))); ground(g, GY, 240, 840); if (gk > 0) cornLine(g, CX, GY, 520 * gk, { cob: gk, sway: 0 });
  chip(g, 'ГІБРИД', CX + 230, GY - 80, pop(t, wt('вищими', info, 4.0)), GREEN, 40); } });
// c16 — heterosis
registerShot('c16', { draw(g, t, info) { push(g, t, info, 1.0, 1.06); bg(g, t, { birds: false }); cornLine(g, 220, GY, 260, { cob: 0.4 }); cornLine(g, 860, GY, 260, { cob: 0.4 }); cornLine(g, CX, GY, 660, { cob: 1.1 });
  T(g, 'ГЕТЕРОЗИС', CX, 330, 110, GREEN, pop(t, wt('гетерозисом', info, 1.0) - 0.15)); } });
// c17 — F1
registerShot('c17', { draw(g, t, info) { push(g, t, info, 1.0, 1.08, 800); bg(g, t, { birds: false, ground: false }); corn(g, 'cob_leaves', CX, 860, 560, { a: fade(t, 0.1) });
  const tF = wt('F1', info, 2.6); g.save(); const a = pop(t, Math.min(tF, info.dur - 0.6) - 0.1); if (a > 0) { g.translate(CX + 250, 560); g.scale(a, a); circle(g, 0, 0, 100, GREEN); g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.arc(0, 0, 100, 0, 7); g.stroke(); T(g, 'F1', 0, 6, 100, '#ffffff'); } g.restore();
  L(g, 'ПЕРШЕ ПОКОЛІННЯ', CX, 260, fade(t, wt('першого', info, 1.6)), 46, GREEN); } });
// c18 — farmer delighted
registerShot('c18', { draw(g, t, info) { push(g, t, info, 1.03, 1.1, 800); bg(g, t); row(g, t, [130, 950], [560, 560]);
  person(g, { ...F, x: CX, y: GY, s: 0.95, expr: 'happy', blink: blink(t), armR: [0.45, 2.3], propR: bigCob, armL: [0.4, 2.2] }); sparkle(g, CX + 240, 520, 60, pop(t, 0.4)); } });
// c19 — yield bars
registerShot('c19', { draw(g, t, info) { push(g, t, info); bg(g, t, { sky: false, birds: false }); const k = ease.out(prog(t, 0.3, 1.6));
  bar(g, 340, GY - 60, 200, 700, 0.42 * k, AMBER, 'СОРТ'); bar(g, 740, GY - 60, 200, 700, 0.85 * k, GREEN, 'ГІБРИД'); L(g, 'УРОЖАЙ', CX, 300, 1, 52); } });
// c20 — uniform field, combine
registerShot('c20', { draw(g, t, info) { push(g, t, info, 1.0, 1.05); bg(g, t); const xs = [100, 240, 380, 520, 660, 800, 940]; xs.forEach((x, i) => cornLine(g, x, GY, 460, { sway: Math.sin(t * 1.2) * 4, cob: 1 }));
  const tc = wt('цвітуть', info, 0.9), td = wt('дозрівають', info, 2.3), tk = wt('комбайном', info, 4.6);
  if (t > tc) for (let k = 0; k < 18; k++) { const kk = ((t * 0.5 + k / 18) % 1); circle(g, xs[k % 7] + Math.sin(k + t) * 30, GY - 460 + kk * 120, 4, AMBER); }
  chip(g, 'ЦВІТУТЬ ОДНОЧАСНО', CX, 240, pop(t, tc), AMBER, 36); chip(g, 'ДОЗРІВАЮТЬ РАЗОМ', CX, 340, pop(t, td), GREEN, 36);
  const cx = lerp(1400, 700, ease.out(prog(t, tk - 0.6, tk + 0.6))); g.save(); g.translate(cx, GY); rr(g, -150, -170, 260, 120, 14); g.fillStyle = '#9cc46a'; g.fill(); g.strokeStyle = INK; g.lineWidth = 3.4; g.stroke(); rr(g, -60, -250, 100, 80, 8); g.fillStyle = '#ffffff'; g.fill(); g.stroke(); rr(g, -260, -120, 110, 60, 8); g.fillStyle = '#c9c24a'; g.fill(); g.stroke(); for (const [wx, r] of [[-90, 50], [60, 40]]) { circle(g, wx, -r, r, '#ffffff'); g.beginPath(); g.arc(wx, -r, r, 0, 7); g.stroke(); circle(g, wx, -r, r * 0.35, INK); } g.restore(); } });
// c21 — trait cards
function card(g, x, y, a, label, col, icon) { if (a <= 0) return; g.save(); g.translate(x, y); g.scale(a, a); rr(g, -150, -110, 300, 220, 24); g.fillStyle = '#ffffff'; g.fill(); g.strokeStyle = col; g.lineWidth = 5; g.stroke(); icon(g); L(g, label, 0, 70, 1, 30, col); g.restore(); }
const sunI = (g) => { circle(g, 0, -30, 34, '#f6dc7a'); g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.arc(0, -30, 34, 0, 7); g.stroke(); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; g.beginPath(); g.moveTo(Math.cos(a) * 44, -30 + Math.sin(a) * 44); g.lineTo(Math.cos(a) * 58, -30 + Math.sin(a) * 58); g.stroke(); } };
const shieldI = (g) => { g.beginPath(); g.moveTo(0, -80); g.lineTo(46, -62); g.quadraticCurveTo(44, -4, 0, 18); g.quadraticCurveTo(-44, -4, -46, -62); g.closePath(); g.fillStyle = '#b7d8f2'; g.fill(); g.strokeStyle = INK; g.lineWidth = 3; g.stroke(); g.beginPath(); g.moveTo(-16, -34); g.lineTo(-4, -20); g.lineTo(20, -50); g.stroke(); };
const clockI = (g) => { circle(g, 0, -30, 46, '#ffffff'); g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.arc(0, -30, 46, 0, 7); g.stroke(); g.beginPath(); g.moveTo(0, -30); g.lineTo(0, -62); g.moveTo(0, -30); g.lineTo(24, -18); g.stroke(); };
registerShot('c21', { draw(g, t, info) { push(g, t, info, 1.0, 1.04); bg(g, t, { birds: false });
  person(g, { ...B, x: CX, y: GY, s: 0.9, expr: 'smile', blink: blink(t, 2.7), armL: [0.4, 2.1], armR: [0.4, 2.1] });
  card(g, 220, 380, pop(t, wt('посухи', info, 2.8) - 0.1), 'ПОСУХА', AMBER, sunI); card(g, 860, 380, pop(t, wt('хвороб', info, 4.4) - 0.1), 'ХВОРОБИ', BLUE, shieldI); card(g, CX, 230, pop(t, wt('раннє', info, 5.4) - 0.1), 'РАННЄ ДОЗРІВАННЯ', GREEN, clockI); } });

// c22–c28 — the Troyer chart (driven by global time so cuts are seamless)
const CH = { x0: 150, x1: 990, y0: 1300, y1: 520, yr0: 1866, yr1: 2024, v1: 12 };
const X = (yr) => lerp(CH.x0, CH.x1, (yr - CH.yr0) / (CH.yr1 - CH.yr0)), Y = (v) => lerp(CH.y0, CH.y1, v / CH.v1);
const ERAS = [ // [from, to, v0, slope t/ha/yr, colour, label]
  [1866, 1935, 1.55, 0.001, '#9aa4ae', 'СОРТИ'], [1936, 1959, 1.5, 0.063, AMBER, 'ПОДВІЙНІ ГІБРИДИ'], [1960, 1995, 3.9, 0.113, GREEN, 'ПРОСТІ ГІБРИДИ'], [1995, 2004, 7.86, 0.207, '#3f8a3a', ''],
];
function seg(g, e, k, dash = false) { if (k <= 0) return; const [a, b, v0, sl, col] = e, yb = lerp(a, b, k); g.save(); if (dash) g.setLineDash([14, 10]); g.strokeStyle = col; g.lineWidth = 9; g.lineCap = 'round'; g.beginPath(); g.moveTo(X(a), Y(v0)); g.lineTo(X(yb), Y(v0 + sl * (yb - a))); g.stroke(); g.restore(); }
function chart(g, gt) {
  const a = fade(gt, 73.5, 0.5); g.save(); g.globalAlpha *= a; g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.moveTo(CH.x0, CH.y1 - 30); g.lineTo(CH.x0, CH.y0); g.lineTo(CH.x1 + 20, CH.y0); g.stroke();
  for (let v = 0; v <= 12; v += 2) { g.globalAlpha = a * 0.25; g.beginPath(); g.moveTo(CH.x0, Y(v)); g.lineTo(CH.x1, Y(v)); g.stroke(); g.globalAlpha = a; T(g, String(v), CH.x0 - 40, Y(v), 30, INK, 1, { font: FONTS.ui, weight: 900, sp: 0 }); }
  for (const yr of [1880, 1920, 1960, 2000]) T(g, String(yr), X(yr), CH.y0 + 40, 30, INK, 1, { font: FONTS.ui, weight: 900, sp: 0 });
  T(g, 'т/га', CH.x0 + 10, CH.y1 - 60, 32, INK, 1, { font: FONTS.ui, weight: 900, sp: 0, align: 'left' }); g.restore();
  T(g, 'УРОЖАЙНІСТЬ КУКУРУДЗИ', CX, 250, 54, INK, a); T(g, 'В США', CX, 320, 54, INK, a); L(g, 'за A. F. Troyer, Crop Science (2006)', CX, 390, a * 0.8, 28, '#6a707a');
  seg(g, ERAS[0], ease.inOut(prog(gt, 80.4, 84.8)));
  const k1 = ease.inOut(prog(gt, 88.6, 92.2)); seg(g, ERAS[1], k1); const k2 = ease.inOut(prog(gt, 92.8, 97.2)); seg(g, ERAS[2], k2); seg(g, ERAS[3], ease.inOut(prog(gt, 97.2, 98.2)));
  const km = ease.inOut(prog(gt, 98.4, 99.6)); if (km > 0) { g.save(); g.setLineDash([12, 12]); g.strokeStyle = '#3f8a3a'; g.lineWidth = 6; g.beginPath(); g.moveTo(X(2004), Y(9.72)); g.lineTo(X(lerp(2004, 2024, km)), Y(lerp(9.72, 11.2, km))); g.stroke(); g.restore(); }
  const lab = (txt, x, y, t0, col) => chip(g, txt, x, y, pop(gt, t0), col, 26);
  lab('СОРТИ', X(1900), Y(1.6) - 70, 81.5, '#7a848e'); lab('ПОДВІЙНІ ГІБРИДИ', X(1928), Y(3.2) - 40, 89.2, AMBER); lab('ПРОСТІ ГІБРИДИ', X(1958), Y(7.2), 94.2, GREEN);
  const p15 = pop(gt, 85.6); if (p15 > 0) { circle(g, X(1930), Y(1.55), 12 * p15, INK); chip(g, '≈1,5 т/га', X(1930), Y(1.55) + 90, p15, INK, 32); }
  const p11 = pop(gt, 99.0); if (p11 > 0) { circle(g, X(2024), Y(11.2), 14 * p11, '#3f8a3a'); chip(g, '11+ т/га', X(2024) - 120, Y(11.2) - 70, p11, '#3f8a3a', 36); chip(g, '×7', X(1990) - 40, Y(11.5), pop(gt, 100.0), RED, 44); }
  const kA = ease.out(prog(gt, 101.8, 102.6)), kS = ease.out(prog(gt, 106.0, 106.8)); if (kA > 0) { const bx = CH.x1 - 30, h = Y(1.6) - Y(11.2); rr(g, bx - 26, Y(1.6) - h / 2 * kA, 52, h / 2 * kA, 10); g.fillStyle = '#b7d8f2'; g.fill(); g.strokeStyle = INK; g.lineWidth = 3; g.stroke(); chip(g, 'ДОБРИВА, ТЕХНІКА ≈ ½', CX - 60, Y(6.6), kA, BLUE, 30);
    if (kS > 0) { rr(g, bx - 26, Y(6.4) - h / 2 * kS, 52, h / 2 * kS, 10); g.fillStyle = '#9cc46a'; g.fill(); g.stroke(); chip(g, 'СЕЛЕКЦІЯ ≈ ½', CX - 60, Y(8.4), kS, GREEN, 34); } }
}
for (const id of ['c22', 'c23', 'c24', 'c25', 'c26', 'c27', 'c28']) registerShot(id, { draw(g, t, info) { const gt = info.globalT; push(g, gt - 73.35, { dur: 35 }, 1.0, 1.04); bg(g, t, { sky: false, ground: false }); chart(g, gt); } });

// c29 — the catch
registerShot('c29', { draw(g, t, info) { push(g, t, info, 1.06, 1.1, 800); bg(g, t); person(g, { ...F, x: CX, y: GY, s: 0.95, expr: 'thinking', blink: blink(t), armR: [0.45, 2.3], propR: bigCob }); T(g, '?', CX - 260, 520, 180, RED, pop(t, 0.1)); } });
// c30 — sowing saved hybrid grain; the miracle vanishes
registerShot('c30', { draw(g, t, info) { push(g, t, info); bg(g, t); const sw = Math.sin(t * 5); person(g, { ...F, x: 340, y: GY, s: 0.9, expr: t > wt('зникає', info, 3.6) ? 'worried' : 'smile', blink: blink(t), armR: [0.5 + sw * 0.2, 0.8] });
  const tz = wt('зникає', info, 3.6); for (let i = 0; i < 10; i++) { const k = ((t * 0.9 + i / 10) % 1); kernelSeed(g, lerp(480, 960, (i % 5) / 5 + k * 0.1), lerp(820, GY + 30, k * k), 1.1); }
  sparkle(g, 760, 640, 80, 1 - fade(t, tz - 0.2, 0.6)); L(g, 'ЗЕРНО З ГІБРИДА', CX, 260, fade(t, 0.3), 44, AMBER); } });
// c31 — F1 → F2
registerShot('c31', { draw(g, t, info) { push(g, t, info, 1.0, 1.04); bg(g, t, { sky: false, ground: false }); ground(g, 700, 340, 740); cornLine(g, CX, 700, 340, { cob: 1, sway: 0 }); chip(g, 'F1', CX + 190, 440, 1, GREEN, 40);
  const xs = [140, 340, 540, 740, 940], hs = [420, 220, 340, 160, 300]; ground(g, GY, 40, 1040);
  xs.forEach((x, i) => { arrow(g, CX, 730, x, 880, fade(t, 0.3 + i * 0.1)); const k = ease.out(prog(t, 0.6 + i * 0.12, 1.4 + i * 0.12)); if (k > 0) cornLine(g, x, GY, hs[i] * 0.95 * k, { cob: 0.3 + (hs[i] / 420) * 0.7 }); });
  chip(g, 'F2', 960, 860, pop(t, 0.8), RED, 40); L(g, 'ОЗНАКИ РОЗХОДЯТЬСЯ', CX, 300, fade(t, wt('розходяться', info, 1.8)), 42, RED); } });
// c32 — crowd again, yield drops
registerShot('c32', { draw(g, t, info) { push(g, t, info); bg(g, t, { birds: false }); const r = rng(9); const xs = [], hs = []; for (let i = 0; i < 9; i++) { xs.push(80 + i * 115); hs.push(200 + r() * 320); } row(g, t, xs, hs);
  const tp = wt('падає', info, 2.6), k = lerp(0.85, 0.5, ease.inOut(prog(t, tp - 0.4, tp + 0.4))); rr(g, 140, 300, 800, 60, 30); g.strokeStyle = INK; g.lineWidth = 3; g.stroke(); rr(g, 140, 300, 800 * k, 60, 30); g.fillStyle = k > 0.6 ? GREEN : RED; g.fill(); g.stroke();
  L(g, 'УРОЖАЙ', CX, 250, 1, 40); arrow(g, 1000, 280, 1000, 400, fade(t, tp), RED); } });
// c33 — seed production field: mother & father rows
registerShot('c33', { draw(g, t, info) { push(g, t, info, 1.0, 1.05); bg(g, t); const xs = [100, 240, 380, 520, 660, 800, 940];
  xs.forEach((x, i) => { const father = i % 3 === 1; cornLine(g, x, GY, father ? 520 : 460, { tassel: father, cob: father ? 0.5 : 1, color: father ? '#b7d8f2' : undefined }); L(g, father ? '♂' : '♀', x, GY + 50, 1, 36, father ? BLUE : RED); });
  for (let k = 0; k < 24; k++) { const kk = ((t * 0.4 + k / 24) % 1), sx = xs[(k % 2) * 3 + 1]; circle(g, sx + (kk - 0.3) * 260 * (k % 2 ? 1 : -1), GY - 520 + kk * 280, 5, AMBER); }
  chip(g, 'ЩОРОКУ — ЗАНОВО', CX, 260, pop(t, wt('щороку', info, 0.8)), GREEN, 44); } });
// c34 — farmer + breeder + MAIS bag
registerShot('c34', { draw(g, t, info) { push(g, t, info, 1.0, 1.05); bg(g, t);
  person(g, { ...F, x: 250, y: GY, s: 0.82, expr: 'smile', blink: blink(t) }); person(g, { ...B, x: 830, y: GY, s: 0.82, expr: 'smile', blink: blink(t, 2.7), armL: [0.3, 1.9], propL: clipboard });
  const a = pop(t, 0.4, 0.5); if (a > 0) { g.save(); g.translate(CX, GY - 200); g.scale(a, a); bagFace(g, -140, -190, 280, 380, { r: 30 }); g.restore(); } } });
// c35 — farmer receives the bag; end card
registerShot('c35', { draw(g, t, info) { push(g, t, info, 1.0, 1.04, 900); bg(g, t);
  person(g, { ...F, x: CX - 60, y: GY, s: 0.95, expr: 'happy', blink: blink(t), armR: [0.3, 1.2], propR: bagProp });
  const a = fade(t, 1.0, 0.6); logo(g, CX, 300, 190, { a }); T(g, 'mais-seeds.com', CX, 470, 44, '#0b8a3e', a, { font: FONTS.ui, weight: 900, sp: 1 }); } });
