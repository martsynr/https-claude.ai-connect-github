// shots/02_traits.js — old corn fails in a crowd; traits 1–3: leaves, tassel, timing (s14–s27).
import { E, V, S, registerShot, mood, layer, blurLayer, veil, backdrop, ease, prog, clamp, lerp, shake, seg, circle, ring, rr, poly, glow, alpha, shade, mix, linGrad, text, FONTS } from '/engine/core.js';
import { drawFigure, POSES, posesAt, breathe } from '../fig.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { field, fieldGround, cornPlant, pollen, OLD, NEW } from '../sets/corn.js';
import { FARMER, BREEDER } from '../cast.js';
import { wt, S1, push, label } from './01_intro.js';

const gold = () => S().ui.gold, bp = () => UI.bpStroke();
function check(g, x, y, s, col, a = 1) { g.save(); g.globalAlpha *= a; seg(g, [[x - s * 0.5, y], [x - s * 0.15, y + s * 0.35], [x + s * 0.55, y - s * 0.45]], s * 0.16, col); g.restore(); }
function cross(g, x, y, s, col, a = 1) { g.save(); g.globalAlpha *= a; seg(g, [[x - s / 2, y - s / 2], [x + s / 2, y + s / 2]], s * 0.16, col); seg(g, [[x + s / 2, y - s / 2], [x - s / 2, y + s / 2]], s * 0.16, col); g.restore(); }
function chapter(g, t, info, str, md = 'golden') {
  blurLayer(g, 12, (g) => field(g, t, { z: 1.2 + 0.04 * t, y: -60 }, { mood: md })); veil(g, '#06100a', 0.5);
  const a = ease.outBack(prog(t, 0.05, 0.4)), sc = 0.85 + 0.15 * a;
  g.save(); g.translate(E.W / 2, E.H * 0.42); g.scale(sc, sc); text(g, str, 0, 0, { size: V(130, 150), color: gold(), glow: 40, glowColor: 'rgba(255,140,40,.85)', alpha: clamp(a), spacing: 6 }); g.restore();
}

// s14 — crowded old corn, FARMER worried
registerShot('s14', { draw(g, t, info) {
  const cam = { z: lerp(1.15, 1.22, ease.inOut(t / info.dur)), x: lerp(-20, 20, t / info.dur) };
  const { GY, M, plant } = field(g, t, cam, { mood: 'golden' });
  const tG = wt('густо', info, 2.7), tV = wt('впорається', info, 4.1);
  layer(g, cam, 0.95, (g) => { for (let i = 0; i < 16; i++) cornPlant(g, -E.W * 0.2 + i * V(110, 95), GY + 10, V(560, 620), { sway: Math.sin(t * 1.2 + i) * 8, seed: 200 + i, color: shade(plant, -0.12), rim: M.rim, ...OLD, leaves: 7 }); });
  layer(g, cam, 1, (g) => drawFigure(g, { x: E.W / 2, y: GY + V(60, 90), s: S1(), facing: 1, outfit: FARMER, pose: breathe(posesAt(t, [[0, POSES.relaxed], [tV - 0.3, POSES.handsOnHead]]), t), expr: t > tV ? 'worried' : t > tG ? 'nervous' : 'neutral', look: [-0.3, -0.6], blink: (t % 3.1) > 3.0, rim: { color: M.rim, dir: [-0.6, -0.8] } }));
  layer(g, cam, 1.5, (g) => { for (let i = 0; i < 4; i++) cornPlant(g, -E.W * 0.1 + i * V(420, 380), E.H + 60, V(900, 1100), { sway: Math.sin(t + i) * 10, seed: 230 + i, color: shade(plant, -0.5), rim: M.rim, ...OLD, leaves: 6, w: 18 }); });
  label(g, 'СТАРИЙ СОРТ · ГУСТО', E.W / 2, E.H * V(0.12, 0.12), ease.out(prog(t, tG - 0.2, tG + 0.3)), V(48, 56), gold());
  FX.dust(g, t, { count: 40, color: '#ffe2bd', a: 0.35 });
} });

// s15 — mutual shading: the lower canopy goes dark
registerShot('s15', { draw(g, t, info) {
  const M = mood('golden'), GY = fieldGround(), cam = { z: lerp(1.05, 1.1, t / info.dur), y: 0 }, plant = shade(M.grass, -0.5);
  const tZ = wt('затіняють', info, 0.6), dk = ease.inOut(prog(t, tZ - 0.2, info.dur - 0.2));
  layer(g, cam, 0.1, (g) => { backdrop(g, M.sky); FX.sun(g, E.W / 2, E.H * 0.1, V(70, 90), '#fff3dc', M.key, 5); FX.godRays(g, E.W / 2, E.H * 0.1, { count: 14, angle: Math.PI / 2, spread: 1.2, len: E.H * 0.45, a: 0.08, t }); });
  layer(g, cam, 0.9, (g) => { g.fillStyle = linGrad(g, 0, GY, 0, GY + 600, [shade(M.floor, -0.2), shade(M.dark, -0.4)]); g.fillRect(-E.W, GY, E.W * 3, E.H); });
  layer(g, cam, 1, (g) => { for (let i = 0; i < 9; i++) cornPlant(g, -E.W * 0.1 + i * V(160, 150), GY + 10, V(820, 900), { sway: Math.sin(t + i) * 6, seed: 300 + i, color: shade(plant, -0.05 * (i % 2)), rim: M.rim, ...OLD, leaves: 8, w: 14 }); });
  g.save(); g.fillStyle = linGrad(g, 0, GY - V(560, 620), 0, GY, ['rgba(4,6,10,0)', `rgba(43,38,34,${0.45 * dk})`]); g.fillRect(-E.W, GY - V(560, 620), E.W * 3, V(600, 700)); g.restore();
  label(g, 'ТІНЬ', E.W / 2, GY - V(160, 200), ease.out(prog(t, tZ + 0.4, tZ + 0.8)), V(64, 80), '#2f6f9a');
  FX.dust(g, t, { count: 40, color: '#ffe2bd', a: 0.35 });
} });

// s16 — lodging: plants topple
registerShot('s16', { draw(g, t, info) {
  const sh = shake(t, 10 * (1 - prog(t, 0.2, 0.9))), cam = { z: 1.12, x: sh[0], y: sh[1] };
  const { GY, M, plant } = field(g, t, cam, { mood: 'dusk' });
  layer(g, cam, 1, (g) => { for (let i = 0; i < 7; i++) { const f = ease.in(prog(t, 0.05 + (i % 3) * 0.08, 0.6 + (i % 3) * 0.08)), dir = i % 2 ? 1 : -1; cornPlant(g, E.W * (0.0 + i * 0.17), GY + 40, V(640, 700), { seed: 400 + i, color: shade(plant, -0.1), rim: M.rim, ...OLD, lean: dir * f * (0.9 + (i % 3) * 0.2), w: 13 }); } });
  FX.speedLines(g, t, { cx: E.W / 2, cy: E.H * 0.5, count: 30, a: 0.1 }); FX.dust(g, t, { count: 60, color: '#ffd9b0', a: 0.5 });
} });

// s17 — barren stalks: dashed empty ear slots with red crosses
registerShot('s17', { draw(g, t, info) {
  const cam = { z: lerp(1.0, 1.05, t / info.dur), y: 0 };
  const M = mood('dusk'), GY = fieldGround();
  const { plant } = field(g, t, { z: 1.4, y: -100 }, { mood: 'dusk' }); veil(g, '#0a0608', 0.3);
  const tB = wt('без', info, 2.3);
  layer(g, cam, 1, (g) => { [[0.2, 1], [0.5, 0], [0.8, 1]].forEach(([x, b], i) => { cornPlant(g, E.W * x, E.H * 0.95, E.H * 0.75, { sway: Math.sin(t + i) * 8, seed: 500 + i, color: shade(plant, -0.25), rim: M.rim, ...OLD, leaves: 6, w: 20, barren: !!b, tassel: false });
    if (b) { const k = ease.outBack(prog(t, tB - 0.2 + i * 0.1, tB + 0.2 + i * 0.1)); if (k > 0) cross(g, E.W * x + V(80, 70), E.H * 0.95 - E.H * 0.75 * 0.55 - 10, V(70, 80) * k, '#ff5a4a'); } }); });
  label(g, 'БЕЗ КАЧАНА', E.W / 2, E.H * V(0.12, 0.12), ease.out(prog(t, tB, tB + 0.4)), V(64, 76), '#d9553a');
  FX.dust(g, t, { count: 40, color: '#ffd9b0', a: 0.35 });
} });

// s18 — BREEDER in a test plot; title
registerShot('s18', { draw(g, t, info) {
  const cam = { z: lerp(1.15, 1.22, ease.inOut(t / info.dur)), y: 0 };
  const { GY, M, plant } = field(g, t, cam, { mood: 'golden' });
  layer(g, cam, 0.95, (g) => { for (let i = 0; i < 6; i++) { const x = E.W * (0.05 + i * 0.18); cornPlant(g, x, GY + 10, V(520, 560), { sway: Math.sin(t + i) * 8, seed: 600 + i, color: shade(plant, -0.1), rim: M.rim, ...NEW }); seg(g, [[x + 40, GY + 20], [x + 40, GY - 90]], 5, '#c9b48a'); rr(g, x + 22, GY - 120, 36, 30, 4); g.fillStyle = '#f4efe6'; g.fill(); text(g, String(i + 1), x + 40, GY - 104, { size: 20, color: '#3a2a1a', font: FONTS.ui, weight: 900 }); } });
  layer(g, cam, 1, (g) => drawFigure(g, { x: E.W / 2 - V(40, 40), y: GY + V(60, 80), s: S1(), facing: 1, outfit: BREEDER, prop: 'tablet', pose: breathe(posesAt(t, [[0, POSES.holdFront], [2.2, POSES.explain]]), t), expr: t > 2.2 ? 'smile' : 'thinking', look: [0.6, -0.3], blink: (t % 3.3) > 3.2, rim: { color: M.rim, dir: [-0.6, -0.8] } }));
  UI.titleCard(g, t - 0.4, { lines: ['СЕЛЕКЦІЯ:', 'ЖИТИ В ТІСНОТІ'], dur: info.dur - 0.4, y: E.H * V(0.2, 0.2) });
  FX.dust(g, t, { count: 40, color: '#ffe2bd', a: 0.35 });
} });

registerShot('s19', { draw(g, t, info) { chapter(g, t, info, '1 · ЛИСТЯ'); } });

// blueprint plant helper
function bpPlant(g, t, o) { cornPlant(g, E.W / 2, E.H * V(0.86, 0.74), V(820, 1000), { sway: Math.sin(t) * 6, seed: 7, color: alpha(bp(), 0.85), leaves: 8, w: 12, ...o }); seg(g, [[E.W * 0.1, E.H * V(0.86, 0.74)], [E.W * 0.9, E.H * V(0.86, 0.74)]], 3, alpha(bp(), 0.6)); }
function palm(g, x, y, s, a) { g.save(); g.globalAlpha *= a; g.translate(x, y); g.scale(s, s); g.strokeStyle = gold(); g.lineWidth = 8; g.lineCap = 'round'; g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(20, -100, 0, -200); g.stroke(); for (let i = 0; i < 6; i++) { const d = i < 3 ? -1 : 1, k = (i % 3) * 0.35; g.beginPath(); g.moveTo(0, -200); g.quadraticCurveTo(d * (60 + k * 40), -250 + k * 30, d * (120 + k * 30), -150 + k * 60); g.stroke(); } g.restore(); }

// s20 — old variety: droopy "palm" leaves
registerShot('s20', { draw(g, t, info) {
  UI.blueprint(g); g.save(); push(g, t, info);
  const tP = wt('пальми', info, 2.8);
  bpPlant(g, t, { ...OLD });
  g.restore();
  label(g, 'СТАРИЙ СОРТ', E.W / 2, E.H * V(0.1, 0.1), ease.out(prog(t, 0.1, 0.5)), V(54, 60), bp());
  const k = ease.outBack(prog(t, tP - 0.2, tP + 0.3)); if (k > 0) { palm(g, E.W * 0.82, E.H * V(0.4, 0.3), V(0.8, 1.0) * k, clamp(k)); }
} });

// s21 — leaves rotate up: modern hybrid
registerShot('s21', { draw(g, t, info) {
  UI.blueprint(g); g.save(); push(g, t, info);
  const tU = wt('вгору', info, 2.4), e = ease.inOut(prog(t, 0.5, tU + 0.2));
  bpPlant(g, t, { erect: e, tasselScale: 1.9 });
  for (let i = 0; i < 3; i++) { const k = prog(t, 0.8 + i * 0.2, tU + 0.4); if (k > 0 && k < 1) { const y = E.H * (0.62 - i * 0.12); seg(g, [[E.W / 2 + 160, y], [E.W / 2 + 160, y - 120 * ease.out(k)]], 5, alpha(gold(), 1 - k)); } }
  g.restore();
  label(g, 'СУЧАСНИЙ ГІБРИД', E.W / 2, E.H * V(0.1, 0.1), ease.out(prog(t, 0.1, 0.5)), V(54, 60), gold());
} });

// s22 — light reaches the bottom of an upright canopy
registerShot('s22', { draw(g, t, info) {
  const M = mood('golden'), GY = fieldGround(), cam = { z: lerp(1.05, 1.1, t / info.dur), y: 0 }, plant = shade(M.grass, -0.45);
  const tN = wt('низу', info, 1.7), lit = ease.inOut(prog(t, 0.2, tN + 0.2));
  layer(g, cam, 0.1, (g) => { backdrop(g, M.sky); FX.sun(g, E.W / 2, E.H * 0.1, V(70, 90), '#fff3dc', M.key, 5); FX.godRays(g, E.W / 2, E.H * 0.1, { count: 16, angle: Math.PI / 2, spread: 1.0, len: lerp(E.H * 0.45, E.H * 0.75, lit), a: 0.12, t }); });
  layer(g, cam, 0.9, (g) => { g.fillStyle = linGrad(g, 0, GY, 0, GY + 600, [shade(M.floor, -0.1), shade(M.dark, -0.35)]); g.fillRect(-E.W, GY, E.W * 3, E.H); FX.pool(g, E.W / 2, GY + 20, E.W * 0.6, 60, M.key, 0.4 * lit); });
  layer(g, cam, 1, (g) => { for (let i = 0; i < 9; i++) cornPlant(g, -E.W * 0.1 + i * V(160, 150), GY + 10, V(820, 900), { sway: Math.sin(t + i) * 6, seed: 300 + i, color: mix(plant, '#6aa04a', 0.25 * lit), rim: M.rim, ...NEW, leaves: 8, w: 14 }); });
  FX.dust(g, t, { count: 60, color: '#ffe2bd', a: 0.45 });
} });

// s23 — chapter 2: the tassel against the sky
registerShot('s23', { draw(g, t, info) {
  const M = mood('golden'), cam = { z: lerp(1.0, 1.06, t / info.dur), y: 0 };
  const tK = wt('квітка', info, 1.9);
  layer(g, cam, 0.1, (g) => { backdrop(g, M.sky); FX.sun(g, E.W * 0.25, E.H * 0.55, V(70, 90), '#fff3dc', M.key, 5); FX.clouds(g, { y: E.H * 0.3, h: 160, color: '#ffe7c7', a: 0.1, seed: 5 }); });
  layer(g, cam, 1, (g) => cornPlant(g, E.W * 0.6, E.H * 2.3, E.H * 1.95, { sway: Math.sin(t) * 14, seed: 12, color: shade(M.grass, -0.6), rim: M.rim, leaves: 9, w: 30, tasselScale: 1.6, ear: false }));
  const tx = E.W * 0.6 + Math.sin(t) * 14, ty = E.H * 2.3 - E.H * 1.95;
  UI.callout(g, t, { at: [tx, ty - 40], to: [E.W * 0.22, ty + V(160, 220)], str: 'ВОЛОТЬ', start: tK - 0.3, size: V(44, 54) });
  const a = ease.outBack(prog(t, 0.05, 0.4)); g.save(); g.translate(E.W / 2, E.H * V(0.12, 0.12)); g.scale(0.85 + 0.15 * a, 0.85 + 0.15 * a); text(g, '2 · ВОЛОТЬ', 0, 0, { size: V(110, 120), color: gold(), glow: 36, glowColor: 'rgba(255,140,40,.85)', alpha: clamp(a), spacing: 6 }); g.restore();
  pollen(g, t, { x: tx, y: ty, w: 300, h: E.H * 0.5, count: 30, a: 0.6, speed: 90 });
} });

// s24 — tassel shrinks; less shade; energy flows to the cob
registerShot('s24', { draw(g, t, info) {
  UI.blueprint(g); g.save(); push(g, t, info);
  const tM = wt('меншою', info, 0.9), tZ = wt('затіняє', info, 2.3), tS = wt('сил', info, 4.4);
  const ts = lerp(1.9, 0.6, ease.inOut(prog(t, tM - 0.2, tM + 0.6))), base = E.H * V(0.86, 0.74), H = V(820, 1000), top = [E.W / 2, base - H];
  const sh = lerp(1, 0.3, ease.inOut(prog(t, tM - 0.2, tM + 0.6)));
  g.fillStyle = alpha('#02040a', 0.35 * clamp(t / 0.5)); poly(g, [[top[0], top[1]], [top[0] - 260 * sh, top[1] + 520 * sh], [top[0] + 260 * sh, top[1] + 520 * sh]], alpha('#02040a', 0.35));
  const eg = ease.out(prog(t, tS - 0.3, info.dur));
  cornPlant(g, E.W / 2, base, H, { seed: 7, color: alpha(bp(), 0.85), leaves: 8, w: 12, ...NEW, tasselScale: ts, earGlow: eg });
  seg(g, [[E.W * 0.1, base], [E.W * 0.9, base]], 3, alpha(bp(), 0.6));
  if (t > tS - 0.6) for (let i = 0; i < 8; i++) { const k = ((t - tS + 0.6) * 0.8 + i / 8) % 1, y = lerp(top[1] + 30, base - H * 0.55, k); circle(g, E.W / 2 + Math.sin(i + t * 3) * 6, y, 9, alpha(gold(), 1 - k * 0.5)); glow(g, E.W / 2, y, 30, gold(), 0.3); }
  g.restore();
  label(g, 'МЕНША ВОЛОТЬ', E.W / 2, E.H * V(0.1, 0.1), ease.out(prog(t, tM, tM + 0.4)), V(54, 60), gold());
  if (t > tS) UI.readout(g, { value: 'СИЛИ → КАЧАНУ', x: E.W / 2, y: E.H * V(0.9, 0.17), align: 'center', size: V(50, 56), a: ease.out(prog(t, tS, tS + 0.3)) });
} });

// s25 — chapter 3 + clock
registerShot('s25', { draw(g, t, info) {
  chapter(g, t, info, '3 · ТОЧНІСТЬ');
  FX.clock(g, E.W / 2, E.H * V(0.62, 0.6), V(90, 110), t * 3);
} });

// timing chart: pollen bar and silk bar. off = silk offset (0 = in sync)
function timing(g, t, off, ok) {
  const x0 = E.W * 0.1, x1 = E.W * 0.9, y1 = E.H * 0.3, y2 = E.H * 0.42, len = (x1 - x0) * 0.42;
  seg(g, [[x0, E.H * 0.48], [x1, E.H * 0.48]], 3, alpha(bp(), 0.6)); for (let d = 0; d <= 10; d++) seg(g, [[lerp(x0, x1, d / 10), E.H * 0.48], [lerp(x0, x1, d / 10), E.H * 0.48 + 14]], 3, alpha(bp(), 0.6));
  text(g, 'ДНІ →', x1 - 60, E.H * 0.48 + 50, { size: V(26, 32), color: alpha(bp(), 0.8), font: FONTS.ui, weight: 900 });
  const px = x0 + 20, sx = px + off * len;
  rr(g, px, y1 - 26, len, 52, 26); g.fillStyle = alpha(gold(), 0.85); g.fill(); text(g, 'ПИЛОК', px + len / 2, y1, { size: V(34, 40), color: '#2a1e08', font: FONTS.ui, weight: 900 });
  rr(g, sx, y2 - 26, len, 52, 26); g.fillStyle = alpha('#7ad06a', 0.9); g.fill(); text(g, 'ПРИЙМОЧКИ', sx + len / 2, y2, { size: V(34, 40), color: '#0a2008', font: FONTS.ui, weight: 900 });
  return { px, sx, len, x0, x1, y1, y2 };
}

// s26 — late silks: the gap; pollen falls wasted
registerShot('s26', { draw(g, t, info) {
  UI.blueprint(g); g.save(); push(g, t, info, 1.0, 1.04);
  const tZ = wt('запізнювалася', info, 1.7), tD = wt('даремно', info, 4.7), off = lerp(0.2, 1.15, ease.inOut(prog(t, tZ - 0.3, tZ + 0.8)));
  const r = timing(g, t, off);
  if (off > 1.0) { UI.dimension(g, t, { x1: r.px + r.len, y1: (r.y1 + r.y2) / 2, x2: r.sx, y2: (r.y1 + r.y2) / 2, str: '', color: '#d9553a', start: tZ + 0.6 }); }
  text(g, 'ЗАПІЗНЕННЯ', E.W / 2, E.H * 0.2, { size: V(46, 54), color: '#d9553a', font: FONTS.ui, weight: 900, spacing: 3, alpha: ease.out(prog(t, tZ + 0.6, tZ + 1.0)) });
  pollen(g, t, { x: r.px + r.len / 2, y: E.H * 0.5, w: r.len, h: E.H * 0.22, count: 40, a: 0.9, speed: 110 });
  g.fillStyle = alpha('#c9a860', 0.4 * ease.out(prog(t, tD - 1, tD + 0.5))); g.fillRect(r.x0, E.H * 0.72 - 6, r.len + 40, 12);
  g.restore();
  if (t > tD - 0.1) cross(g, E.W * 0.82, E.H * 0.66, V(70, 80) * ease.outBack(prog(t, tD - 0.1, tD + 0.3)), '#ff5a4a');
} });

// s27 — modern: in sync; pollen lands on silks
registerShot('s27', { draw(g, t, info) {
  UI.blueprint(g); g.save(); push(g, t, info, 1.0, 1.04);
  const tV = wt('вчасно', info, 1.7), off = lerp(1.15, 0.05, ease.inOut(prog(t, 0.2, tV + 0.2)));
  const r = timing(g, t, off), ok = off < 0.3;
  if (ok) { glow(g, r.px + r.len / 2, (r.y1 + r.y2) / 2, r.len * 0.6, gold(), 0.35); for (let i = 0; i < 5; i++) FX.sparkle(g, r.px + r.len * (0.15 + i * 0.18), r.y2 + Math.sin(t * 4 + i) * 10, 22, '#ffffff', 0.5 + 0.4 * Math.sin(t * 6 + i)); }
  pollen(g, t, { x: r.px + r.len / 2, y: r.y1 + 30, w: r.len, h: r.y2 - r.y1 - 40, count: 24, a: 0.9, speed: 80 });
  g.restore();
  const k = ease.outBack(prog(t, tV, tV + 0.4)); if (k > 0) { check(g, E.W / 2, E.H * 0.62, V(140, 160) * k, '#7ad06a'); label(g, 'ВЧАСНО', E.W / 2, E.H * 0.7, clamp(k), V(64, 76), '#4f9a48'); }
  label(g, 'НАВІТЬ У СТРЕСІ', E.W / 2, E.H * 0.14, ease.out(prog(t, tV + 0.8, tV + 1.2)), V(46, 54), gold());
} });
