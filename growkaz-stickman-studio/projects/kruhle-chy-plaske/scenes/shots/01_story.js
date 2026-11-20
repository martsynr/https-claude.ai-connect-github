// shots/01_story.js — the story beats: Ivan, the field, the barn, the bag, the agronomist, weather, the plant, the planter, the test run, the end.
import { E, V, registerShot, layer, ease, prog, clamp, lerp, shake, wordTime, text, FONTS } from '/engine/core.js';
import { person } from '../sets/person.js';
import { field, barn, factory, paper, tractor, seedBag, kernel, kernelFlat, kernelRound, ear, pill, big, check, arrow, ln, dot, box, cap, pop, fadeIn, C, GROUND, sun } from '../sets/world.js';

export const wt = (w, info, fb) => { const v = wordTime(w, info.shot.start); return (v == null ? info.shot.start + fb : v) - info.shot.start; };
const push = (t, info, z0 = 1, z1 = 1.07, extra = {}) => ({ z: lerp(z0, z1, ease.inOut(t / info.dur)), ...extra });
const blink = (t, p = 3.1) => (t % p) > p - 0.12;

// s01 — spring field, Ivan by his planter. ТОРІК
registerShot('s01', { draw(g, t, info) {
  const cam = push(t, info, 1.0, 1.08, { x: lerp(-20, 20, t / info.dur) }); const { GY } = field(g, t, cam, { grow: 0 });
  layer(g, cam, 0.85, (g) => tractor(g, 690, GY - 6, 0.62));
  layer(g, cam, 1, (g) => person(g, 280, GY + 70, 0.86, { who: 'ivan', t, armR: [[0, 'down'], [0.4, 'stop']], expr: 'smile', blink: blink(t) }));
  pill(g, 'ТОРІК', E.W / 2, V(200, 250), { sc: pop(t, 0.1), size: V(54, 60) });
} });

// s02 — ripe corn behind, Ivan orders again on the phone
registerShot('s02', { draw(g, t, info) {
  const cam = push(t, info, 1.05, 1.12); const { GY } = field(g, t, cam, { grow: 1 });
  const tO = wt('замовив', info, 2.2);
  layer(g, cam, 1, (g) => person(g, 540, GY + 60, 0.9, { who: 'ivan', t, armR: 'phone', propR: 'phone', armL: 'down', expr: t > tO ? 'happy' : 'smile', blink: blink(t, 2.7) }));
  for (let k = 0; k < 3; k++) { const ph = (t * 1.2 + k / 3) % 1; g.strokeStyle = `rgba(79,127,174,${0.8 * (1 - ph)})`; g.lineWidth = 4; g.beginPath(); g.arc(E.W / 2 + 190, GY - 560, 30 + ph * 70, -1.1, 0.3); g.stroke(); }
  pill(g, 'ЦЬОГО РОКУ', E.W / 2, V(200, 230), { sc: pop(t, 0.2), size: V(46, 50) });
  pill(g, 'ТОЙ САМИЙ ГІБРИД', E.W / 2, V(320, 360), { sc: pop(t, tO - 0.1), size: V(46, 52), fill: C.light }); check(g, E.W / 2 + V(330, 330), V(320, 360), 34, fadeIn(t, tO + 0.2));
} });

// s03 — barn: the new bag opens, round seed inside
registerShot('s03', { draw(g, t, info) {
  const cam = push(t, info, 1.0, 1.1, { x: lerp(0, 40, t / info.dur) }); const { GY } = barn(g, t, cam, { doorX: E.W / 2 - 60 });
  const tI = wt('інше', info, 2.2), open = ease.inOut(prog(t, 0.5, 1.4)), jolt = t > tI ? shake(t - tI, 6 * (1 - prog(t, tI, tI + 0.5))) : [0, 0];
  layer(g, cam, 1, (g) => person(g, 300 + (jolt[0] || 0), GY + 50, 0.88, { who: 'ivan', t, armR: [[0, 'down'], [0.5, 'reach'], [tI, 'stop']], armL: [[0, 'down'], [tI, 'stop']], expr: t > tI ? 'shocked' : 'thinking', look: [0.8, 0.6], blink: blink(t) }));
  layer(g, cam, 1.1, (g) => seedBag(g, 770, GY + 110, 300, 320, { open, round: true }));
  if (t > tI) for (let k = 0; k < 3; k++) { const a = -0.9 + k * 0.4; ln(g, [[300 + Math.cos(a) * 140, GY - 700 + Math.sin(a) * 140], [300 + Math.cos(a) * 190, GY - 700 + Math.sin(a) * 190]], 6, C.red); }
} });

// s04 — flat (last year) vs round (this year)
registerShot('s04', { draw(g, t, info) {
  paper(g); const tP = wt('пласке', info, 0.7), tK = wt('кругле', info, 2.0), y = E.H * 0.42, z = lerp(1, 1.05, t / info.dur);
  g.save(); g.translate(E.W / 2, y); g.scale(z, z); g.translate(-E.W / 2, -y);
  for (const [x, t0, round, lab] of [[275, tP, false, 'ТОРІК'], [805, tK, true, 'ЦЬОГОРІЧ']]) {
    const p = pop(t, t0 - 0.15); if (p <= 0) continue;
    dot(g, x, y, 230 * p, round ? C.light : '#f1ead8'); kernel(round, g, x, y, 300 * p, { rot: Math.sin(t * 1.5) * 0.06 });
    pill(g, lab, x, y - 310, { sc: p, size: V(46, 50) }); text(g, round ? 'КРУГЛЕ' : 'ПЛАСКЕ', x, y + 300, { size: 58, color: C.blue, font: FONTS.ui, weight: 900, alpha: clamp(p) });
  }
  big(g, '≠', E.W / 2, y, { a: fadeIn(t, tK + 0.1), size: 120, color: C.red });
  g.restore();
} });

// s05 — giant face, shocked. НАДУРИЛИ?
registerShot('s05', { draw(g, t, info) {
  paper(g); const sh = shake(t, 5 * (1 - prog(t, 0, 0.6)));
  for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2 + t * 0.2; ln(g, [[E.W / 2 + Math.cos(a) * 520, E.H * 0.5 + Math.sin(a) * 520], [E.W / 2 + Math.cos(a) * 1400, E.H * 0.5 + Math.sin(a) * 1400]], 26, i % 2 ? '#eef4fa' : '#f6efe0'); }
  person(g, 540 + sh[0], 3150 + sh[1], 3.2 * (1 + 0.03 * t), { who: 'ivan', t, expr: 'shocked', look: [0, -0.2] });
  big(g, 'НАДУРИЛИ?', E.W / 2, E.H * 0.16, { sc: pop(t, 0.05, 0.3), size: 128, color: C.red });
} });

// s06 — the agronomist steps in: "don't jump to conclusions"
registerShot('s06', { draw(g, t, info) {
  const cam = push(t, info, 1.04, 1.1); const { GY } = barn(g, t, cam, { doorX: E.W / 2 + 80 });
  const k = ease.out(prog(t, 0, 0.55));
  layer(g, cam, 1, (g) => {
    person(g, 260, GY + 60, 0.86, { who: 'ivan', t, armL: 'stop', armR: 'down', expr: t > 1.1 ? 'thinking' : 'worried', look: [0.8, 0], blink: blink(t) });
    person(g, lerp(1250, 790, k), GY + 60, 0.88, { who: 'agro', t, bob: 1 + 3 * (1 - k), armR: [[0, 'down'], [0.5, 'up']], expr: 'smile', look: [-0.6, 0], blink: blink(t, 2.8) });
  });
  pill(g, 'НЕ ПОСПІШАЙТЕ!', E.W / 2, V(220, 260), { sc: pop(t, 0.6), size: V(46, 52), fill: C.light });
} });

// s08 — macro ear with husk peeled; a magnifier slides along it
registerShot('s08', { draw(g, t, info) {
  paper(g, true); const u = ease.inOut(t / info.dur), cam = { z: 1.05, y: lerp(-120, 120, u) };
  const tC = wt('частини', info, 1.7);
  layer(g, cam, 1, (g) => { ear(g, E.W / 2, 1660, 1300, { husk: 1, lw: 4, rows: 22, cols: 7 }); });
  const my = lerp(520, 1350, ease.inOut(prog(t, tC - 0.3, info.dur))), mx = E.W / 2 + 40, a = fadeIn(t, tC - 0.4);
  if (a > 0) { g.save(); g.globalAlpha *= a; cap(g, [[mx + 130, my + 130], [mx + 260, my + 260]], 34, '#7a828a'); g.beginPath(); g.arc(mx, my, 180, 0, 7); g.fillStyle = 'rgba(205,228,246,.35)'; g.fill(); g.strokeStyle = '#3d434a'; g.lineWidth = 16; g.stroke(); g.restore(); }
  pill(g, 'ЗВІДКИ ЗЕРНО?', E.W / 2, V(200, 230), { sc: pop(t, 0.3), size: V(46, 52) });
} });

// s11 — heat year
registerShot('s11', { draw(g, t, info) {
  const cam = push(t, info, 1.0, 1.06); const { GY } = field(g, t, cam, { grow: 1, weather: 'hot' });
  layer(g, cam, 1, (g) => person(g, 540, GY + 60, 0.86, { who: 'ivan', t, armR: 'phone', armL: 'down', expr: 'worried', look: [0.4, -0.6], blink: blink(t) }));
  for (let i = 0; i < 4; i++) { const x = 160 + i * 250, y = GY - 140 - ((t * 60 + i * 40) % 120); g.strokeStyle = 'rgba(227,162,26,.6)'; g.lineWidth = 4; g.beginPath(); g.moveTo(x, y); g.bezierCurveTo(x + 20, y - 30, x - 20, y - 60, x, y - 90); g.stroke(); }
  pill(g, 'СПЕКА', E.W / 2, V(200, 240), { sc: pop(t, 0.15), size: V(50, 56), fill: '#ffe2b0' });
} });

// s12 — storm year
registerShot('s12', { draw(g, t, info) {
  const sh = t > 0.75 && t < 1.1 ? shake(t, 6) : [0, 0]; const cam = push(t, info, 1.04, 1.1, { x: sh[0], y: sh[1] }); const { GY } = field(g, t, cam, { grow: 1, weather: 'storm' });
  if (t > 0.7 && t < 1.15) { g.save(); g.translate(760, 220); g.beginPath(); g.moveTo(0, 0); g.lineTo(-60, 200); g.lineTo(-10, 200); g.lineTo(-70, 420); g.lineTo(60, 160); g.lineTo(5, 160); g.lineTo(50, 0); g.closePath(); g.fillStyle = '#ffe27a'; g.fill(); g.strokeStyle = '#3d434a'; g.lineWidth = 4; g.stroke(); g.restore(); }
  layer(g, cam, 1, (g) => person(g, 540, GY + 60, 0.86, { who: 'ivan', t, armL: 'up', armR: 'up', handL: 'spread', handR: 'spread', expr: 'worried', look: [0, -0.8], blink: blink(t) }));
  pill(g, 'ЗЛИВИ', E.W / 2, V(200, 240), { sc: pop(t, 0.1), size: V(50, 56), fill: C.light });
  pill(g, 'ЩОРОКУ ПО-РІЗНОМУ', E.W / 2, V(320, 360), { sc: pop(t, wt('щороку', info, 1.1) - 0.1), size: V(42, 46) });
} });

// s13 — the seed plant
registerShot('s13', { draw(g, t, info) {
  const cam = push(t, info, 1.0, 1.06, { x: lerp(-40, 40, t / info.dur) }); const { GY } = factory(g, t, cam);
  layer(g, cam, 1, (g) => person(g, 860, GY + 120, 0.8, { who: 'agro', t, armL: 'hold', propL: 'tablet', armR: 'down', expr: 'smile', look: [-0.6, 0], blink: blink(t) }));
  pill(g, 'ЗАВОД', E.W / 2, V(200, 230), { sc: pop(t, 0.1), size: V(46, 50) });
  pill(g, 'КАЛІБРУВАННЯ', E.W / 2, V(320, 350), { sc: pop(t, wt('калібрують', info, 1.5) - 0.1), size: V(50, 56), fill: C.light });
} });

// s17 — agronomist medium close-up, finger up
registerShot('s17', { draw(g, t, info) {
  const cam = push(t, info, 1.0, 1.05); field(g, t, cam, { grow: 1 }); g.fillStyle = 'rgba(248,249,250,.55)'; g.fillRect(0, 0, E.W, E.H);
  person(g, 520, 2060, 1.9, { who: 'agro', t, armR: [[0, 'down'], [0.2, 'up']], expr: 'determined', blink: blink(t) });
  pill(g, 'ПАМ’ЯТАЙТЕ!', E.W / 2, V(200, 230), { sc: pop(t, 0.3), size: V(52, 58), fill: '#ffe2b0' });
} });

// s18 — new fraction = new planter setup; Ivan with a wrench
registerShot('s18', { draw(g, t, info) {
  const cam = push(t, info, 1.02, 1.08, { x: lerp(30, -30, t / info.dur) }); const { GY } = field(g, t, cam, { grow: 0 });
  const tF = wt('фракція', info, 0.5), tN = wt('налаштування', info, 2.0);
  layer(g, cam, 0.95, (g) => tractor(g, 760, GY - 10, 0.8));
  layer(g, cam, 1, (g) => person(g, 200, GY + 90, 0.8, { who: 'ivan', t, armR: [[0, 'down'], [tN - 0.4, 'wrench']], propR: t > tN - 0.5 ? 'wrench' : null, expr: t > tN ? 'determined' : 'thinking', look: [0.8, 0.3], blink: blink(t) }));
  if (t > tN) { const p = 0.5 + 0.5 * Math.sin(t * 8); dot(g, 760 - 0.8 * 230, GY - 10 - 0.8 * 150, 70, `rgba(246,196,69,${0.25 + 0.2 * p})`, 0); }
  pill(g, 'НОВА ФРАКЦІЯ', E.W / 2, V(200, 230), { sc: pop(t, tF - 0.1), size: V(46, 50), fill: C.light });
  pill(g, '= НОВЕ НАЛАШТУВАННЯ', E.W / 2, V(320, 350), { sc: pop(t, tN - 0.1), size: V(44, 48), fill: '#ffe2b0' });
} });

// s22 — the test run: seeds in the soil, evenly spaced, ✓
registerShot('s22', { draw(g, t, info) {
  const cam = push(t, info, 1.0, 1.05); const { GY } = field(g, t, cam, { grow: 0 });
  const tP = wt('пробний', info, 1.8), sy = GY + 30;
  layer(g, cam, 1, (g) => {
    box(g, -100, GY - 30, E.W + 200, 130, 0, '#f1e4cc'); ln(g, [[-100, GY - 30], [E.W + 100, GY - 30]], 4);
    for (let i = 0; i < 6; i++) { const x = 140 + i * 160, a = fadeIn(t, 0.2 + i * 0.18); if (a > 0) kernelRound(g, x, sy, 64, { a, rot: 0.2 }); if (i < 5 && t > tP) { const p = ease.out(prog(t, tP + i * 0.06, tP + 0.4 + i * 0.06)); ln(g, [[x + 40, sy + 55], [lerp(x + 40, x + 120, p), sy + 55]], 4, C.blue); ln(g, [[x + 40, sy + 45], [x + 40, sy + 65]], 4, C.blue); if (p >= 1) ln(g, [[x + 120, sy + 45], [x + 120, sy + 65]], 4, C.blue); } }
    person(g, 760, GY - 40, 0.8, { who: 'ivan', t, armL: 'hold', propL: 'tablet', armR: [[0, 'down'], [tP + 0.4, 'up']], expr: t > tP + 0.4 ? 'happy' : 'thinking', look: [-0.6, 0.6], blink: blink(t) });
  });
  pill(g, 'ПРОБНИЙ ВИСІВ', E.W / 2, V(200, 240), { sc: pop(t, tP - 0.2), size: V(50, 56), fill: C.light }); check(g, E.W / 2, V(340, 380), 46, pop(t, tP + 0.5));
} });

// s23 — end: which do you like more?
registerShot('s23', { draw(g, t, info) {
  paper(g); const tR = wt('кругленьке', info, 2.7), tF = wt('пласке', info, 3.65), z = lerp(1, 1.04, t / info.dur);
  g.save(); g.translate(E.W / 2, E.H / 2); g.scale(z, z); g.translate(-E.W / 2, -E.H / 2);
  const qa = fadeIn(t, 0.1, 0.5);
  text(g, 'А вам яке', E.W / 2, 230, { size: 84, font: FONTS.serif, weight: 900, italic: true, color: '#3d434a', alpha: qa });
  text(g, 'більше подобається?', E.W / 2, 330, { size: 74, font: FONTS.serif, weight: 900, italic: true, color: '#3d434a', alpha: qa });
  for (const [x, t0, round, lab] of [[290, tR, true, 'КРУГЛЕНЬКЕ'], [790, tF, false, 'ПЛАСКЕ']]) { const p = pop(t, t0 - 0.2); if (p <= 0) continue; dot(g, x, 680, 190 * p, round ? C.light : '#f1ead8'); kernel(round, g, x, 680, 250 * p, { rot: Math.sin(t * 2 + x) * 0.1 }); pill(g, lab, x, 930, { sc: p, size: 44 }); }
  big(g, 'чи', E.W / 2, 690, { a: fadeIn(t, tR + 0.3), size: 70, color: '#7a828a' });
  const ca = pop(t, tF + 0.5); if (ca > 0) { g.save(); g.translate(E.W / 2, 1110); g.scale(ca, ca); box(g, -300, -60, 600, 120, 40, '#ffffff'); g.beginPath(); g.moveTo(-200, 58); g.lineTo(-230, 110); g.lineTo(-150, 58); g.fillStyle = '#ffffff'; g.fill(); text(g, 'Пишіть у коментарях', 0, 2, { size: 44, color: C.blue, font: FONTS.ui, weight: 900 }); g.restore(); }
  person(g, 290, 1830, 0.78, { who: 'ivan', t, armR: [[0, 'down'], [tR, 'up']], expr: 'happy', blink: blink(t) });
  person(g, 790, 1830, 0.78, { who: 'agro', t, armL: [[0, 'down'], [tF, 'up']], expr: 'smile', blink: blink(t, 2.8) });
  g.restore();
} });
