// shots/01_harvest.js — s01–s23: harvest in ears, husker, inspection, drying, shelling, the heap.
import { E, V, S, registerShot, mood, layer, blurLayer, veil, backdrop, ease, prog, key, clamp, lerp, shake, seg, circle, ring, rr, poly, glow, alpha, shade, mix, linGrad, text, FONTS } from '/engine/core.js';
import { drawFigure, POSES, posesAt, breathe, bigFace } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { field, cornPlant, cornRow, thermometer } from '../sets/corn.js';
import { kernel, cob, velvet, hall, MACHINES, LINE, GREEN } from '../sets/plant.js';
import { FARMER, WORKER } from '../cast.js';
import { wt, gold, cream, bp, coral, push, label, title, tick, cross, hallShot } from './_h.js';

const HOLD = { ...POSES.stand, eF: [24, -170], hF: [44, -214] };            // cob raised high
const HOLDLOW = { ...POSES.holdFront };

function combine(g, x, y, s, col, o = {}) {      // side view, facing right
  g.save(); g.translate(x, y); g.scale(s, s);
  const c = col, d = shade(col, -0.35);
  rr(g, -260, -300, 360, 190, 18); g.fillStyle = linGrad(g, 0, -300, 0, -110, [shade(c, 0.1), d]); g.fill();
  rr(g, -40, -420, 150, 130, 12); g.fillStyle = shade(c, -0.15); g.fill(); rr(g, -24, -404, 118, 80, 8); g.fillStyle = alpha('#bfe3ff', 0.5); g.fill();
  rr(g, -250, -380, 150, 90, 10); g.fillStyle = shade(c, -0.25); g.fill();
  seg(g, [[-250, -330], [-340, -380]], 22, d);
  for (const [wx, r] of [[-170, 95], [60, 70]]) { circle(g, wx, -r, r, '#141414'); circle(g, wx, -r, r * 0.45, '#3a3a3a'); }
  if (o.snouts) { for (let i = 0; i < 4; i++) poly(g, [[110, -150 + i * 0], [300 + i * 6, -110], [300 + i * 6, -96], [110, -120]], shade(c, -0.05 - i * 0.08)); rr(g, 100, -190, 60, 100, 8); g.fillStyle = d; g.fill(); }
  else { rr(g, 100, -200, 230, 90, 10); g.fillStyle = d; g.fill(); const a = o.t * 8; for (let i = 0; i < 5; i++) { const b = a + i * 1.25; seg(g, [[215, -155], [215 + Math.cos(b) * 70, -155 + Math.sin(b) * 70]], 8, '#c9a46a'); } ring(g, 215, -155, 70, 5, alpha('#c9a46a', 0.6)); }
  g.restore();
}

// s01 — golden field, FARMER raises a cob
registerShot('s01', { draw(g, t, info) {
  const u = ease.inOut(t / info.dur), cam = { z: lerp(1.04, 1.12, u), x: lerp(-30, 10, u), y: -40 };
  const { GY, M, plant } = field(g, t, cam, { mood: 'golden' });
  layer(g, cam, 1, (g) => {
    cornPlant(g, E.W / 2 - 330, GY + 20, 640, { sway: Math.sin(t) * 8, seed: 3, color: plant, rim: M.rim });
    const p = posesAt(t, [[0, 'holdFront'], [0.5, HOLD]]), x = E.W / 2 + 40, s = 1.6;
    drawFigure(g, { x, y: GY, s, facing: -1, outfit: FARMER, pose: breathe(p, t, 1, 2), expr: t > 0.6 ? 'happy' : 'smile', look: [-0.3, -0.6], rim: { color: M.rim, dir: [-0.8, -0.4] } });
    const hx = x - p.hF[0] * s, hy = GY + p.hF[1] * s; cob(g, hx - 10, hy - 50, 150, { rot: -1.25, husk: 0, rim: M.rim }); glow(g, hx - 10, hy - 50, 160, gold(), 0.25 * clamp(t - 0.5));
    cornPlant(g, E.W / 2 + 380, GY + 40, 700, { sway: Math.sin(t + 1) * 8, seed: 8, color: plant, rim: M.rim });
  });
  FX.dust(g, t, { count: 50, color: '#ffe2bd', a: 0.35 });
} });

// s02 — ЗЕРНО vs НАСІННЯ
registerShot('s02', { draw(g, t, info) {
  const cam = { z: lerp(1, 1.05, t / info.dur) }; velvet(g, t, cam);
  const tZ = wt('зерно', info, 0.3), tN = wt('насіння', info, 1.4), xl = E.W / 2 - 300, xr = E.W / 2 + 300, y = E.H * 0.47;
  layer(g, cam, 1, (g) => {
    const a = ease.outBack(prog(t, tZ - 0.1, tZ + 0.3)); if (a > 0) { kernel(g, xl, y, 260 * a, { col: '#c99a3a', embryo: 0 }); label(g, 'ЗЕРНО', xl, y + 220, a, 52, alpha(cream(), 0.7)); }
    const b = ease.outBack(prog(t, tN - 0.2, tN + 0.3)); if (b > 0) { kernel(g, xr, y, 260 * b, { embryo: clamp((t - tN) * 2) }); title(g, 'НАСІННЯ', xr, y + 220, b, 64); FX.sparkle(g, xr + 60, y - 90, 30 * b, '#fff6d8', 0.8); }
  });
} });

// s03 — ordinary combine smashes kernels
registerShot('s03', { draw(g, t, info) {
  const sk = shake(t, 6, 14, 3), cam = { z: 1.08, x: lerp(-60, 60, t / info.dur) + sk[0], y: -30 + sk[1] };
  const { GY, M, plant } = field(g, t, cam, { mood: 'golden' });
  const tT = wt('травмує', info, 1.6);
  layer(g, cam, 0.97, (g) => {
    combine(g, E.W / 2 - 150 + t * 40, GY + 20, 1.25, mix('#b8322a', M.wall, 0.25), { t });
    if (t > tT - 0.4) for (let i = 0; i < 14; i++) { const k = ((t - tT + 0.4) * 0.9 + i / 14) % 1, ang = -0.9 + (i % 5) * 0.12; const x = E.W / 2 + 330 + t * 40 + Math.cos(ang) * k * 600, y = GY - 220 + Math.sin(ang) * k * 400 + k * k * 300; kernel(g, x, y, 34, { rot: k * 9 + i, crack: 1, col: '#e8a83a' }); }
  });
  const a = ease.outBack(prog(t, tT, tT + 0.35)); if (a > 0) { UI.badge(g, { str: 'ТРАВМИ ЗАРОДКІВ', x: E.W - 80, y: 120, color: coral(), size: 46, a: clamp(a) }); }
  FX.dust(g, t, { count: 90, color: '#ffe2bd', a: 0.5 });
} });

// s04 — the ear harvester, whole cobs drop in its hopper
registerShot('s04', { draw(g, t, info) {
  const u = ease.inOut(t / info.dur), cam = { z: lerp(1.0, 1.06, u), x: lerp(-20, 40, u), y: -30 };
  const { GY, M, plant } = field(g, t, cam, { mood: 'golden' });
  const tK = wt('спеціальний', info, 1.4), tC = wt('качанах', info, 3.6);
  layer(g, cam, 0.97, (g) => {
    combine(g, E.W / 2 + 120, GY + 20, 1.15, mix(GREEN, M.wall, 0.2), { snouts: true, t });
    for (let i = 0; i < 6; i++) { const k = ((t * 0.8 + i / 6) % 1); if (t < tK) break; cob(g, E.W / 2 - 60 + Math.sin(i) * 30, GY - 520 + k * 120, 70, { rot: 0.4 + i, a: 1 - k * 0.3 }); }
  });
  layer(g, cam, 1, (g) => drawFigure(g, { x: E.W / 2 - 480, y: GY, s: 1.3, facing: 1, outfit: FARMER, pose: breathe(posesAt(t, [[0, 'stand'], [tK - 0.2, 'point']]), t), expr: t > tK ? 'happy' : 'neutral', rim: { color: M.rim, dir: [-0.8, -0.4] } }));
  const a = ease.outBack(prog(t, tC - 0.2, tC + 0.2)); if (a > 0) { g.save(); g.translate(E.W / 2, 120); g.scale(a, a); title(g, 'ЗБИРАННЯ В КАЧАНАХ', 0, 0, 1, 64); g.restore(); }
  FX.dust(g, t, { count: 50, color: '#ffe2bd', a: 0.35 });
} });

// s05 — cob in its husk, trapped droplets
registerShot('s05', { draw(g, t, info) {
  const cam = { z: lerp(1.0, 1.08, ease.inOut(t / info.dur)), x: 20 }; velvet(g, t, cam);
  const tO = wt('обгортках', info, 0.7), tS = wt('сушіння', info, 2.2);
  layer(g, cam, 1, (g) => { cob(g, E.W / 2, E.H * 0.5, 620, { rot: -0.12, husk: 1 }); for (let i = 0; i < 9; i++) { const x = E.W / 2 - 220 + i * 55, y = E.H * 0.5 + Math.sin(i * 2.1) * 30 + Math.sin(t * 2 + i) * 3; circle(g, x, y, 9, alpha('#bfe3ff', 0.8)); glow(g, x, y, 24, '#bfe3ff', 0.3); } });
  UI.callout(g, t, { at: [E.W / 2 + 120, E.H * 0.43], to: [E.W / 2 + 330, E.H * 0.22], str: 'ОБГОРТКА', start: tO, color: gold() });
  const a = ease.out(prog(t, tS - 0.1, tS + 0.3)); label(g, 'ВОЛОГА ЗАЛИШАЄТЬСЯ', E.W / 2, E.H * 0.84, a, 42, '#9fd0ff');
} });

// s06 — hall, #1 husker drops in
hallShot('s06', { n: 1, x0: -80, x1: 0 });

// s07 — blueprint: rollers rip husk
registerShot('s07', { draw(g, t, info) {
  UI.blueprint(g); g.save(); push(g, t, info, 1.0, 1.07);
  const cx = E.W / 2, cy = E.H * 0.6, tH = wt('зривають', info, 3.2), tR = wt('крутяться', info, 0.9);
  for (let i = 0; i < 2; i++) { const x = cx + (i ? 120 : -120), dir = i ? -1 : 1; circle(g, x, cy, 110, alpha(bp(), 0.12)); ring(g, x, cy, 110, 6, bp()); for (let k = 0; k < 8; k++) { const a = t * 3 * dir + k * Math.PI / 4; seg(g, [[x + Math.cos(a) * 60, cy + Math.sin(a) * 60], [x + Math.cos(a) * 104, cy + Math.sin(a) * 104]], 8, alpha(gold(), 0.8)); }
    const ar = ease.out(prog(t, tR, tR + 0.5)); if (ar > 0) { g.strokeStyle = alpha(gold(), ar); g.lineWidth = 6; g.beginPath(); g.arc(x, cy, 150, dir > 0 ? -2.6 : -0.5, dir > 0 ? -1.6 : -1.5 + 0.0, dir < 0); g.stroke(); } }
  const k = ease.inOut(prog(t, tH - 0.6, tH + 0.6));
  cob(g, cx, cy - 170, 460, { husk: 1 - k, kc: '#f2b640' });
  for (let i = 0; i < 4; i++) { const kk = ease.out(prog(t, tH - 0.3 + i * 0.12, tH + 0.9 + i * 0.12)); if (kk <= 0) continue; g.save(); g.translate(cx + (i - 1.5) * 120, cy - 120 + kk * 380); g.rotate(kk * (i % 2 ? 3 : -3)); g.globalAlpha *= 1 - kk * 0.6; g.fillStyle = '#b9a46a'; g.beginPath(); g.ellipse(0, 0, 90, 22, 0, 0, 7); g.fill(); g.restore(); }
  label(g, 'ГУМОВІ ВАЛЬЦІ', cx, E.H * 0.12, ease.out(prog(t, 0.1, 0.5)), 46, gold());
  g.restore();
} });

// s08 — row of cobs: mouldy, odd kernel colour, odd cob colour
registerShot('s08', { draw(g, t, info) {
  const cam = { z: lerp(1.0, 1.05, ease.inOut(t / info.dur)), x: lerp(-40, 40, t / info.dur) }; velvet(g, t, cam);
  const tH = wt('хворі', info, 1.5), tN = wt('нетипові', info, 2.3), tZ = wt('зерна', info, 4.2), tS = wt('стрижня', info, 5.0);
  const specs = [{}, { mold: 1, t: tH }, {}, { kc: '#efe6cf', t: tZ }, {}, { cobc: '#8a2a2a', kc: '#e8b050', t: tS }];
  layer(g, cam, 1, (g) => specs.forEach((sp, i) => { const x = E.W / 2 + (i - 2.5) * 260, y = E.H * 0.52 + (i % 2) * 30; cob(g, x, y, 230, { rot: -1.45 + (i % 3) * 0.08, mold: sp.mold ? clamp((t - sp.t) * 2) : 0, kc: sp.kc, cobc: sp.cobc });
    if (sp.t != null && t > sp.t) { const a = ease.outBack(prog(t, sp.t, sp.t + 0.35)); ring(g, x, y, 150 * a, 6, coral()); glow(g, x, y, 200, coral(), 0.15 * a); } }));
  label(g, 'ХВОРІ', E.W / 2 - 390, E.H * 0.17, ease.out(prog(t, tH, tH + 0.3)), 44, coral());
  label(g, 'НЕТИПОВІ', E.W / 2 + 260, E.H * 0.17, ease.out(prog(t, tN, tN + 0.3)), 44, coral());
} });

// s09 — inspection conveyor pops in; workers flank it
hallShot('s09', { n: 2, fx: E.W / 2 - 420, s: 1.15, extra: (g, t, info, ctx, cam) => {
  layer(g, cam, 1, (g) => { for (const [x, f, sd] of [[E.W / 2 - 120, 1, 1], [E.W / 2 + 160, -1, 2]]) { const k = ease.out(prog(t, 1.0 + sd * 0.15, 1.5 + sd * 0.15)); if (k <= 0) continue; drawFigure(g, { x, y: ctx.GY + 70, s: 1.0, facing: f, outfit: WORKER, alpha: k, pose: breathe(posesAt(t, [[0, 'stand'], [1.4, 'reach'], [2.0, 'holdFront']]), t, 1, sd), expr: 'neutral', blink: (t % (2.8 + sd * 0.3)) > 2.7, rim: { color: ctx.M.rim, dir: [-0.6, -0.8] } }); } });
} });

// s10 — gloved hand plucks a mouldy cob
registerShot('s10', { draw(g, t, info) {
  const M = mood('interiorCool'), cam = { z: lerp(1.05, 1.0, t / info.dur) };
  blurLayer(g, 10, (g) => hall(g, t, { z: 1.6, y: -260 }, { n: 2, focus: 1, drop: null }), null); veil(g, '#060a14', 0.35);
  const tP = wt('підозрілий', info, 2.3), by = E.H * 0.66;
  layer(g, cam, 1, (g) => {
    rr(g, -100, by, E.W + 200, 60, 20); g.fillStyle = '#1a1d22'; g.fill(); for (let i = 0; i < 20; i++) seg(g, [[((i * 120 - t * 140) % (E.W + 240)) - 120, by + 4], [((i * 120 - t * 140) % (E.W + 240)) - 120, by + 56]], 3, '#2a2f38');
    for (let i = 0; i < 6; i++) { const isBad = i === 3, base = E.W - ((i * 330 + t * 140) % (E.W + 400)) + 100; let x = base, y = by - 40, rot = 0;
      if (isBad) { const k = ease.inOut(prog(t, tP - 0.4, tP + 0.5)); x = lerp(base, E.W / 2 + 40, k); y = lerp(by - 40, by - 360, k); rot = k * -0.5; if (k > 0) { const hx = x + 30, hy = y - 40; seg(g, [[hx + 200, hy - 400], [hx + 40, hy - 60]], 70, '#141418'); circle(g, hx, hy, 58, '#f2c21a'); circle(g, hx - 40, hy + 30, 26, '#e0b012'); } }
      cob(g, x, y, 240, { rot, mold: isBad ? 1 : 0, rim: M.rim }); }
  });
  label(g, 'ВРУЧНУ', E.W / 2, E.H * 0.12, ease.out(prog(t, wt('вручну', info, 0.6), wt('вручну', info, 0.6) + 0.3)), 52, gold());
} });

// s11 — FARMER with a wet cob
registerShot('s11', { draw(g, t, info) {
  const u = ease.inOut(t / info.dur), cam = { z: lerp(1.25, 1.33, u), x: 40, y: 40 };
  const { GY, M } = field(g, t, cam, { mood: 'dusk' });
  const tV = wt('вологим', info, 2.5);
  layer(g, cam, 1, (g) => { const s = 1.7, x = E.W / 2 - 120, p = POSES.holdFront; drawFigure(g, { x, y: GY, s, facing: 1, outfit: FARMER, pose: breathe(p, t), expr: t > tV ? 'surprised' : 'thinking', look: [0.5, 0.4], rim: { color: M.rim, dir: [-0.8, -0.4] } });
    const hx = x + p.hF[0] * s + 40, hy = GY + p.hF[1] * s; cob(g, hx, hy, 190, { rot: 0.1, wet: 1, rim: M.rim });
    for (let i = 0; i < 4; i++) { const k = ((t * 0.9 + i / 4) % 1); circle(g, hx - 60 + i * 40, hy + 30 + k * 260, 6, alpha('#bfe3ff', 1 - k)); } });
  FX.dust(g, t, { count: 40, color: '#ffe2bd', a: 0.3 });
} });

// s12 — kernel 1/3 water
registerShot('s12', { draw(g, t, info) {
  UI.blueprint(g); g.save(); push(g, t, info, 1.0, 1.06);
  const cx = E.W / 2 - 200, cy = E.H * 0.5, k = ease.inOut(prog(t, 0.2, 1.4));
  kernel(g, cx, cy, 520, { col: alpha('#f2b640', 0.25) });
  g.save(); g.beginPath(); g.rect(cx - 300, cy + 260 - 520 * 0.333 * k * 1.5, 600, 600); g.clip(); kernel(g, cx, cy, 520, { col: alpha('#4aa0ff', 0.7) }); g.restore();
  const a = ease.outBack(prog(t, 0.6, 1.0)); if (a > 0) { title(g, '1/3', E.W / 2 + 330, cy - 60, a, 160); label(g, 'ВАГИ — ВОДА', E.W / 2 + 330, cy + 70, a, 46, '#9fd0ff'); }
  g.restore();
} });

// s13 — heap heats & moulds
registerShot('s13', { draw(g, t, info) {
  const cam = { z: lerp(1.0, 1.08, ease.inOut(t / info.dur)) }; velvet(g, t, cam, { tint: '#ff7a3a' });
  const tG = wt('загрівається', info, 0.9), tP = wt('пліснявіє', info, 1.8), heat = ease.inOut(prog(t, tG - 0.3, tG + 1.2));
  layer(g, cam, 1, (g) => { for (let i = 0; i < 16; i++) { const r = i < 7 ? 0 : i < 12 ? 1 : 2, c = i < 7 ? i : i < 12 ? i - 7 : i - 12, n = [7, 5, 4][r]; cob(g, E.W / 2 - 50 + (c - (n - 1) / 2) * 130, E.H * 0.72 - r * 60, 200, { rot: 0.2 * ((i % 3) - 1), mold: clamp((t - tP) * 1.5) * ((i * 7) % 3 === 0 ? 1 : 0.3), kc: mix('#f2b640', '#d06a3a', heat * 0.4) }); }
    for (let i = 0; i < 10; i++) { const k = ((t * 0.7 + i / 10) % 1); seg(g, [[E.W / 2 - 400 + i * 80 + Math.sin(t * 4 + i) * 10, E.H * 0.55 - k * 260], [E.W / 2 - 400 + i * 80 + Math.sin(t * 4 + i + 1) * 10, E.H * 0.5 - k * 260]], 4, alpha('#ff9a4a', 0.4 * heat * (1 - k))); } });
  thermometer(g, E.W - 260, E.H * 0.78, 520, lerp(6, 20, heat));
  label(g, 'ГРІЄТЬСЯ', E.W - 260, E.H * 0.12, ease.out(prog(t, tG, tG + 0.3)), 40, coral());
} });

// s14 — chamber dryer drops in (#3)
hallShot('s14', { n: 3, fx: E.W / 2 - 430 });

// s15 — kernel embryo dies in hot air
registerShot('s15', { draw(g, t, info) {
  const cam = { z: lerp(1.0, 1.1, ease.inOut(t / info.dur)) }; velvet(g, t, cam, { tint: '#ff5a3a' });
  const tD = wt('гине', info, 2.0), dead = ease.inOut(prog(t, tD - 0.6, tD + 0.3));
  for (let i = 0; i < 12; i++) { const k = ((t * 1.2 + i / 12) % 1), y = E.H * 0.25 + i * 50; seg(g, [[-100 + k * 900, y], [k * 900 + 60, y + Math.sin(t * 6 + i) * 20]], 6, alpha('#ff5a3a', 0.5 * (1 - k))); }
  kernel(g, E.W / 2 + 140, E.H * 0.5, 460, { embryo: 1 - dead, col: mix('#f2b640', '#8a6a4a', dead) });
  label(g, 'ЗАРОДОК', E.W / 2 + 140, E.H * 0.86, ease.out(prog(t, 0.3, 0.6)), 44, mix(gold(), '#8a8a8a', dead));
  cross(g, E.W / 2 + 140, E.H * 0.56, 60, ease.outBack(prog(t, tD, tD + 0.3)));
} });

// s16 — control dial; warm not hot; clock spins; ДОВГО
hallShot('s16', { n: 3, drop: false, fx: E.W / 2 - 430, z0: 1.15, z1: 1.2, x0: -120, x1: -100, poses: [[0, 'stand'], [0.5, 'reach']], expr: 'determined', extra: (g, t, info, ctx) => {
  const tT = wt('температуру', info, 1.0), tD = wt('довго', info, 3.4);
  const cx = 300, cy = 220; rr(g, cx - 170, cy - 130, 340, 260, 20); g.fillStyle = 'rgba(10,16,24,.85)'; g.fill();
  const v = lerp(0.9, 0.45, ease.inOut(prog(t, tT - 0.2, tT + 0.8))); for (let i = 0; i <= 20; i++) { const a = Math.PI * (1 + i / 20); seg(g, [[cx + Math.cos(a) * 110, cy + 40 + Math.sin(a) * 110], [cx + Math.cos(a) * 128, cy + 40 + Math.sin(a) * 128]], 5, i > 14 ? coral() : i > 6 ? '#ffb070' : '#9fd0ff'); }
  const na = Math.PI * (1 + v); seg(g, [[cx, cy + 40], [cx + Math.cos(na) * 100, cy + 40 + Math.sin(na) * 100]], 7, cream()); circle(g, cx, cy + 40, 12, cream());
  label(g, 'ТЕПЛЕ, НЕ ГАРЯЧЕ', cx, cy - 90, ease.out(prog(t, tT, tT + 0.3)), 30, '#ffb070');
  const a = ease.outBack(prog(t, tD - 0.6, tD - 0.2)); if (a > 0) { FX.clock(g, E.W - 260, 230, 110 * a, t * 2 * (t > tD - 0.6 ? 6 : 1)); title(g, 'ДОВГО', E.W - 260, 400, a, 64); }
} });

// s17 — dryer airflow: up then reverse down
registerShot('s17', { draw(g, t, info) {
  UI.blueprint(g); g.save(); push(g, t, info, 1.0, 1.05);
  const tR = wt('реверсом', info, 2.3), down = t > tR, cx = E.W / 2, x0 = cx - 360, y0 = E.H * 0.2, w = 720, h = 620;
  g.strokeStyle = bp(); g.lineWidth = 6; g.strokeRect(x0, y0, w, h); for (let k = 1; k < 3; k++) seg(g, [[x0, y0 + k * h / 3], [x0 + w, y0 + k * h / 3]], 3, alpha(bp(), 0.4));
  for (let r = 0; r < 3; r++) for (let c = 0; c < 6; c++) cob(g, x0 + 70 + c * 116, y0 + 110 + r * h / 3, 90, { rot: (c + r) % 2 ? 0.3 : -0.3, kc: alpha('#f2b640', 0.6) });
  for (let i = 0; i < 7; i++) { const x = x0 + 50 + i * 104, k = ((t * 0.9 + i * 0.13) % 1), y = down ? y0 + k * h : y0 + h - k * h, d = down ? 1 : -1; const col = down ? '#ffb070' : '#ff8a4a'; seg(g, [[x, y], [x, y + 50 * d]], 6, alpha(col, 0.9 * Math.sin(k * Math.PI))); poly(g, [[x - 14, y + 50 * d], [x + 14, y + 50 * d], [x, y + 72 * d]], alpha(col, 0.9 * Math.sin(k * Math.PI))); }
  label(g, down ? 'РЕВЕРС: ЗГОРИ' : 'ЗНИЗУ', cx, E.H * 0.1, 1, 48, gold());
  g.restore();
} });

// s18 — three layer moisture bars equalise
registerShot('s18', { draw(g, t, info) {
  UI.blueprint(g); g.save(); push(g, t, info, 1.0, 1.05);
  const tR = wt('рівномірно', info, 2.0), names = ['ВЕРХНІЙ ШАР', 'СЕРЕДНІЙ', 'НИЖНІЙ'], starts = [0.95, 0.75, 0.55];
  names.forEach((nm, i) => { const y = E.H * 0.3 + i * 170, v = lerp(starts[i], 0.3, ease.inOut(prog(t, 0.2, tR + 0.2))); label(g, nm, 380, y, 1, 34); rr(g, 600, y - 30, 900, 60, 30); g.fillStyle = alpha(bp(), 0.15); g.fill(); rr(g, 600, y - 30, 900 * v, 60, 30); g.fillStyle = '#4aa0ff'; g.fill(); });
  tick(g, E.W / 2, E.H * 0.86, 44, ease.outBack(prog(t, tR, tR + 0.3)));
  label(g, 'ВОЛОГА', E.W / 2, E.H * 0.13, 1, 48, gold());
  g.restore();
} });

// s19 — moisture meter into green zone
registerShot('s19', { draw(g, t, info) {
  const cam = { z: lerp(1.0, 1.06, t / info.dur) }; velvet(g, t, cam, { tint: '#9fd0ff' });
  const cx = E.W / 2, cy = E.H * 0.6, v = lerp(0.95, 0.3, ease.inOut(prog(t, 0.1, 1.6)));
  rr(g, cx - 330, cy - 330, 660, 480, 40); g.fillStyle = '#1a2230'; g.fill(); ring(g, cx, cy, 2, 1, '#000');
  for (let i = 0; i <= 30; i++) { const a = Math.PI * (1 + i / 30); seg(g, [[cx + Math.cos(a) * 230, cy + Math.sin(a) * 230], [cx + Math.cos(a) * 270, cy + Math.sin(a) * 270]], 8, i < 11 ? '#3fb950' : i < 20 ? '#f2c21a' : coral()); }
  const na = Math.PI * (1 + v); seg(g, [[cx, cy], [cx + Math.cos(na) * 220, cy + Math.sin(na) * 220]], 10, cream()); circle(g, cx, cy, 20, cream());
  label(g, 'ВОЛОГІСТЬ', cx, cy - 300, 1, 40);
  const ok = t > 1.6; circle(g, cx + 250, cy + 100, 22, ok ? '#3fb950' : '#2a2f38'); if (ok) glow(g, cx + 250, cy + 100, 70, '#3fb950', 0.5);
  label(g, 'OK', cx + 180, cy + 102, ok ? 1 : 0.3, 36, ok ? '#7dffb0' : cream());
} });

// s20 — FREEZE: impact cracks a kernel on the cob
registerShot('s20', { draw(g, t, info) {
  const cam = { z: lerp(1.0, 1.12, ease.inOut(t / info.dur)), r: 0.02 * Math.sin(t * 0.5) }; velvet(g, t, cam, { tint: '#9fd0ff', mood: 'interiorCool' });
  const tU = wt('удар', info, 2.0), tM = wt('мікротріщину', info, 3.6);
  layer(g, cam, 1, (g) => {
    cob(g, E.W / 2 - 100, E.H * 0.56, 900, { rot: 0.0 });
    kernel(g, E.W / 2 + 60, E.H * 0.44, 220, { crack: ease.inOut(prog(t, tU, tM + 0.2)), embryo: 0.4 });
    const k = ease.in(prog(t, tU - 0.7, tU)); g.save(); g.translate(E.W / 2 + 320 - k * 160, E.H * 0.18 + k * 60); g.rotate(-0.6); rr(g, -40, -260, 80, 300, 16); g.fillStyle = '#2a2f38'; g.fill(); rr(g, -70, 20, 140, 70, 14); g.fillStyle = '#5a6270'; g.fill(); g.restore();
    if (t > tU) { FX.rings(g, E.W / 2 + 80, E.H * 0.36, t - tU, { count: 3, r0: 30, r1: 200, color: '#dfeaff', a: 0.5 }); FX.drops(g, t, { count: 40 }); }
  });
  g.save(); g.globalCompositeOperation = 'soft-light'; g.fillStyle = 'rgba(80,140,255,.3)'; g.fillRect(0, 0, E.W, E.H); g.restore();
  const a = ease.outBack(prog(t, tM - 0.1, tM + 0.3)); if (a > 0) UI.badge(g, { str: 'МІКРОТРІЩИНА', x: E.W - 80, y: 120, color: coral(), size: 50, a: clamp(a) });
} });

// s21 — sheller drops in (#4) + ПОВІЛЬНО
hallShot('s21', { n: 4, fx: E.W / 2 - 400, extra: (g, t, info) => {
  const tP = wt('повільно', info, 2.4), a = ease.outBack(prog(t, tP - 0.1, tP + 0.3)); if (a > 0) UI.readout(g, { label: 'ОБЕРТИ', value: 'ПОВІЛЬНО', x: E.W - 100, y: E.H - 120, align: 'right', a: clamp(a) });
} });

// s22 — golden stream into a heap
registerShot('s22', { draw(g, t, info) {
  const cam = { z: lerp(1.0, 1.06, t / info.dur), y: lerp(-20, 20, t / info.dur) }; velvet(g, t, cam);
  layer(g, cam, 1, (g) => { const cx = E.W / 2, by = E.H * 0.8; poly(g, [[cx - 520, by], [cx, by - 260 - t * 20], [cx + 520, by]], '#c98a2a'); for (let i = 0; i < 70; i++) { const u = ((i * 0.6180339) % 1), x = cx + (u - 0.5) * 900 * (1 - (i % 7) / 9), y = by - 10 - (1 - Math.abs(u - 0.5) * 2) * (220 + t * 18) * ((i % 5) / 5 + 0.2); kernel(g, x, y, 34, { rot: i }); }
    for (let i = 0; i < 26; i++) { const k = ((t * 1.4 + i / 26) % 1); kernel(g, cx + Math.sin(i * 3) * 18, k * (by - 280), 30, { rot: i + t * 4 }); } });
  FX.sparkle(g, E.W / 2 + 120, E.H * 0.45, 26, '#fff6d8', 0.6 + 0.4 * Math.sin(t * 5));
} });

// s23 — heap close-up with the junk labelled
registerShot('s23', { draw(g, t, info) {
  const cam = { z: lerp(1.05, 1.12, ease.inOut(t / info.dur)), x: lerp(-30, 30, t / info.dur) }; velvet(g, t, cam);
  const tV = wt('ворох', info, 1.6), tP = wt('пил', info, 2.2), tL = wt('луска', info, 2.8), tS = wt('шматки', info, 3.5), tB = wt('биті', info, 4.6);
  layer(g, cam, 1, (g) => {
    const cx = E.W / 2, by = E.H * 0.86; poly(g, [[cx - 800, by], [cx, by - 380], [cx + 800, by]], '#8a6a3a');
    for (let i = 0; i < 90; i++) { const u = ((i * 0.6180339) % 1), x = cx + (u - 0.5) * 1300, y = by - 20 - (1 - Math.abs(u - 0.5) * 2) * 340 * (((i * 7) % 10) / 10); kernel(g, x, y, 46, { rot: i, crack: i % 9 === 0 ? 1 : 0 }); }
    for (let i = 0; i < 8; i++) { g.save(); g.translate(cx - 500 + i * 140, by - 120 - (i % 3) * 60); g.rotate(i); g.fillStyle = '#d8c69a'; g.beginPath(); g.ellipse(0, 0, 46, 12, 0, 0, 7); g.fill(); g.restore(); }
    for (let i = 0; i < 5; i++) { rr(g, cx - 380 + i * 190, by - 180 - (i % 2) * 70, 70, 30, 12); g.fillStyle = '#e6d8b8'; g.fill(); }
  });
  FX.dust(g, t, { count: Math.round(lerp(40, 160, clamp(t - tP))), color: '#d8c69a', a: 0.45 });
  const a = ease.outBack(prog(t, tV - 0.1, tV + 0.3)); if (a > 0) { g.save(); g.translate(E.W / 2, 110); g.scale(a, a); title(g, 'ВОРОХ', 0, 0, 1, 90, coral()); g.restore(); }
  UI.callout(g, t, { at: [E.W / 2 - 520, E.H * 0.35], to: [E.W / 2 - 700, E.H * 0.25], str: 'ПИЛ', start: tP, color: cream() });
  UI.callout(g, t, { at: [E.W / 2 - 360, E.H * 0.64], to: [E.W / 2 - 640, E.H * 0.5], str: 'ЛУСКА', start: tL, color: cream() });
  UI.callout(g, t, { at: [E.W / 2 + 250, E.H * 0.66], to: [E.W / 2 + 560, E.H * 0.42], str: 'ШМАТКИ СТРИЖНІВ', start: tS, color: cream() });
  UI.callout(g, t, { at: [E.W / 2 + 60, E.H * 0.7], to: [E.W / 2 + 420, E.H * 0.6], str: 'БИТІ ЗЕРНА', start: tB, color: coral() });
} });
