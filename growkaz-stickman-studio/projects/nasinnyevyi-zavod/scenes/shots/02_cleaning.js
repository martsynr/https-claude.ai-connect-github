// shots/02_cleaning.js — s24–s39: fine cleaner, grader, gravity separator, cyclones.
import { E, V, S, registerShot, mood, layer, blurLayer, veil, ease, prog, clamp, lerp, shake, seg, circle, ring, rr, poly, glow, alpha, shade, mix, text, FONTS, rng } from '/engine/core.js';
import { drawFigure, POSES, posesAt, breathe } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { kernel, cob, velvet, hall } from '../sets/plant.js';
import { FARMER } from '../cast.js';
import { wt, gold, cream, bp, coral, push, label, title, tick, cross, hallShot } from './_h.js';

const KC = '#f2b640';
function chunk(g, x, y, s, rot) { g.save(); g.translate(x, y); g.rotate(rot); rr(g, -s, -s * 0.45, s * 2, s * 0.9, s * 0.35); g.fillStyle = '#e6d8b8'; g.fill(); g.restore(); }
function flake(g, x, y, s, rot, a = 1) { g.save(); g.translate(x, y); g.rotate(rot); g.fillStyle = alpha('#d8c69a', a); g.beginPath(); g.ellipse(0, 0, s, s * 0.3, 0, 0, 7); g.fill(); g.restore(); }

// s24 — fine cleaner (#5)
hallShot('s24', { n: 5, fx: E.W / 2 - 440 });

// s25 — aspiration channel
registerShot('s25', { draw(g, t, info) {
  UI.blueprint(g); g.save(); push(g, t, info, 1.0, 1.06);
  const cx = E.W / 2, top = E.H * 0.12, bot = E.H * 0.92, tP = wt('пил', info, 1.6);
  g.strokeStyle = bp(); g.lineWidth = 6; g.strokeRect(cx - 160, top, 320, bot - top); seg(g, [[cx + 160, top + 60], [cx + 560, top + 60]], 6, bp()); seg(g, [[cx + 160, top + 160], [cx + 560, top + 160]], 6, bp());
  for (let i = 0; i < 14; i++) { const k = ((t * 0.8 + i / 14) % 1); kernel(g, cx - 80 + (i % 4) * 50, top + 40 + k * (bot - top - 60), 40, { rot: i + t * 3 }); }
  for (let i = 0; i < 26; i++) { const k = ((t * 0.9 + i / 26) % 1), x = cx - 120 + (i * 37 % 240), y = lerp(bot - 80, top + 110, k); const xx = k > 0.75 ? lerp(x, cx + 520, (k - 0.75) * 4) : x; if (i % 2) flake(g, xx, y, 18, t * 5 + i, 0.9); else circle(g, xx, y, 4, alpha('#d8c69a', 0.8)); }
  for (let i = 0; i < 5; i++) { const y = bot - ((t * 300 + i * 120) % (bot - top - 120)); poly(g, [[cx - 200, y], [cx - 180, y - 30], [cx - 160, y]], alpha(gold(), 0.7)); poly(g, [[cx + 200, y], [cx + 180, y - 30], [cx + 160, y]], alpha(gold(), 0.7)); }
  label(g, 'ПОТІК ПОВІТРЯ', cx - 460, E.H * 0.5, ease.out(prog(t, 0.3, 0.7)), 40, gold());
  label(g, 'ПИЛ І ЛУСКА', cx + 400, top + 110, ease.out(prog(t, tP, tP + 0.3)), 38, cream());
  g.restore();
} });

// sieve deck shared by s26/s27. mode: 0 upper, 1 lower
function sieves(g, t, info, mode) {
  UI.blueprint(g); g.save(); push(g, t, info, mode ? 1.06 : 1.0, mode ? 1.12 : 1.06, mode ? -60 : 0);
  const x0 = E.W * 0.12, x1 = E.W * 0.88, yA0 = E.H * 0.3, yA1 = E.H * 0.42, yB0 = E.H * 0.58, yB1 = E.H * 0.7, sh = Math.sin(t * 24) * 4;
  const deck = (ya, yb, hl) => { g.save(); g.translate(sh, 0); seg(g, [[x0, ya], [x1, yb]], hl ? 8 : 5, hl ? gold() : bp()); for (let i = 0; i < 24; i++) { const u = i / 24; seg(g, [[lerp(x0, x1, u), lerp(ya, yb, u) - 6], [lerp(x0, x1, u), lerp(ya, yb, u) + 6]], 3, alpha(bp(), 0.6)); } g.restore(); };
  deck(yA0, yA1, mode === 0); deck(yB0, yB1, mode === 1);
  for (let i = 0; i < 4; i++) { const k = ((t * 0.25 + i / 4) % 1); chunk(g, lerp(x0, x1 + 140, k), lerp(yA0, yA1, k) - 26, 30, k * 2); }
  for (let i = 0; i < 16; i++) { const k = ((t * 0.3 + i / 16) % 1), x = lerp(x0, x1, k * 0.9 + (i % 3) * 0.03), y = lerp(yA0, yA1, k * 0.9); const fall = (k * 10 % 1); kernel(g, x, lerp(y + 10, lerp(yB0, yB1, k * 0.9) - 20, Math.min(1, fall * 1.4)), 30, { rot: i }); }
  for (let i = 0; i < 9; i++) { const k = ((t * 0.35 + i / 9) % 1), x = lerp(x0 + 100, x1 - 100, (i + 0.5) / 9), y = lerp(yB0, yB1, (i + 0.5) / 9); const kk = (k * 3) % 1; kernel(g, x, y + 10 + kk * 220, 18, { rot: i, crack: i % 2 ? 1 : 0, a: 1 - kk }); }
  for (let i = 0; i < 6; i++) { const k = ((t * 0.3 + i / 6) % 1); kernel(g, lerp(x0, x1 + 120, k), lerp(yB0, yB1, k) - 22, 34, { rot: k * 4, embryo: 0.4 }); }
  label(g, 'ВЕРХНЄ РЕШЕТО', x1 - 160, yA1 - 100, mode === 0 ? 1 : 0.4, 34, mode === 0 ? gold() : cream());
  label(g, 'НИЖНЄ РЕШЕТО', x1 - 160, yB1 + 80, mode === 1 ? 1 : 0.4, 34, mode === 1 ? gold() : cream());
  g.restore();
}
registerShot('s26', { draw(g, t, info) { sieves(g, t, info, 0); const tS = wt('стрижнів', info, 3.0); UI.callout(g, t, { at: [E.W * 0.82, E.H * 0.34], to: [E.W * 0.68, E.H * 0.14], str: 'ШМАТКИ СТРИЖНІВ', start: tS - 0.4, color: cream() }); } });
registerShot('s27', { draw(g, t, info) { sieves(g, t, info, 1); UI.callout(g, t, { at: [E.W * 0.5, E.H * 0.84], to: [E.W * 0.3, E.H * 0.9], str: 'БИТІ Й ДРІБНІ', start: 0.8, color: coral() }); } });

// s28 — clean kernels flowing with a sparkle sweep
registerShot('s28', { draw(g, t, info) {
  const cam = { z: lerp(1.0, 1.05, t / info.dur), x: lerp(-20, 20, t / info.dur) }; velvet(g, t, cam);
  layer(g, cam, 1, (g) => { for (let i = 0; i < 40; i++) { const k = ((t * 0.25 + i / 40) % 1), x = lerp(-100, E.W + 100, k), y = E.H * 0.55 + Math.sin(i * 2.3) * 70; kernel(g, x, y, 60, { rot: i * 0.7 + t, embryo: 0.3 }); } });
  const sx = lerp(-200, E.W + 200, prog(t, 0.2, 1.6)); glow(g, sx, E.H * 0.55, 260, '#fff6d8', 0.35); FX.sparkle(g, sx, E.H * 0.5, 40, '#ffffff', 0.9);
  tick(g, E.W / 2, E.H * 0.2, 50, ease.outBack(prog(t, 0.3, 0.7)));
} });

// s29 — different sizes and shapes
registerShot('s29', { draw(g, t, info) {
  const cam = { z: lerp(1.0, 1.06, t / info.dur) }; velvet(g, t, cam);
  const specs = [[150, 0.8], [110, 0.2], [170, 0.3], [95, 0.9], [130, 0.5]];
  layer(g, cam, 1, (g) => specs.forEach(([s, f], i) => { const x = E.W / 2 + (i - 2) * 260, a = ease.outBack(prog(t, 0.05 + i * 0.1, 0.4 + i * 0.1)); if (a > 0) kernel(g, x, E.H * 0.6 - s * 0.1, s * 1.6 * a, { flat: f }); }));
  UI.dimension(g, t, { x1: E.W / 2 + 120 - 520, y1: E.H * 0.82, x2: E.W / 2 - 120 - 520 + 240, y2: E.H * 0.82, str: '?', start: 0.5 });
  label(g, 'РІЗНИЙ РОЗМІР', E.W / 2, E.H * 0.15, ease.out(prog(t, 0.3, 0.6)), 50, gold());
} });

// s30 — grader (#6)
hallShot('s30', { n: 6, fx: E.W / 2 - 420 });

// grader cascade diagram. stage 0: big/small split, 1: four streams
function cascade(g, t, info, stage) {
  UI.blueprint(g); g.save(); push(g, t, info, stage ? 1.04 : 1.0, stage ? 1.1 : 1.05);
  const cx = E.W / 2, y0 = E.H * 0.2, yS = E.H * 0.38, yL = E.H * 0.62, yB = E.H * 0.88;
  seg(g, [[cx - 360, yS], [cx + 360, yS + 40]], stage ? 5 : 9, stage ? bp() : gold());
  seg(g, [[cx - 640, yL], [cx - 60, yL + 34]], stage ? 9 : 5, stage ? gold() : bp()); seg(g, [[cx + 60, yL], [cx + 640, yL + 34]], stage ? 9 : 5, stage ? gold() : bp());
  for (let i = 0; i < 8; i++) { const k = ((t * 0.7 + i / 8) % 1); kernel(g, cx - 300 + (i % 3) * 30, lerp(y0 - 60, yS - 30, k), 36, { rot: i }); }
  for (let i = 0; i < 10; i++) { const k = ((t * 0.6 + i / 10) % 1), big = i % 2 === 0; const xs = big ? lerp(cx - 300, cx + 300, k) : cx - 200 + (i * 31 % 300); const y = big ? lerp(yS - 26, yS + 14, k) : lerp(yS + 30, yL - 40, k); kernel(g, big ? (k > 0.9 ? lerp(cx + 300, cx + 360, (k - 0.9) * 10) : xs) : xs, y, big ? 44 : 28, { rot: i + k * 3 }); }
  const outs = [[cx - 560, 'ВЕЛИКІ ПЛОСКІ'], [cx - 200, 'ВЕЛИКІ КРУГЛІ'], [cx + 200, 'ДРІБНІ ПЛОСКІ'], [cx + 560, 'ДРІБНІ КРУГЛІ']];
  if (stage) outs.forEach(([x, nm], i) => { const a = ease.outBack(prog(t, 0.6 + i * 0.25, 1.0 + i * 0.25)); if (a <= 0) return; for (let j = 0; j < 4; j++) { const k = ((t * 0.8 + j / 4) % 1); kernel(g, x, lerp(yL + 60, yB - 40, k), (i % 2 ? 26 : 36) * (i < 2 ? 1.2 : 0.85), { flat: i % 2 ? 0.1 : 0.9, rot: j }); } label(g, nm, x, yB + 10, a, 28, gold()); });
  else { label(g, 'ВЕЛИКЕ', cx + 470, yS + 40, ease.out(prog(t, wt('велике', info, 2.6), wt('велике', info, 2.6) + 0.3)), 40, gold()); label(g, 'ДРІБНЕ', cx - 470, yL - 70, ease.out(prog(t, wt('дрібне', info, 3.3), wt('дрібне', info, 3.3) + 0.3)), 40, gold()); }
  label(g, stage ? 'ДВА НИЖНІ ЯРУСИ' : 'ВЕРХНІЙ ЯРУС', cx, E.H * 0.12, 1, 44, cream());
  g.restore();
}
registerShot('s31', { draw(g, t, info) { cascade(g, t, info, 0); } });
registerShot('s32', { draw(g, t, info) { cascade(g, t, info, 1); } });

// s33 — four bins fill; counter 4
registerShot('s33', { draw(g, t, info) {
  const cam = { z: lerp(1.0, 1.06, ease.inOut(t / info.dur)) }; velvet(g, t, cam, { mood: 'interiorCool', tint: '#2b7fd0' });
  const tB = wt('бункер', info, 3.4), cols = ['ВЕЛИКІ ПЛОСКІ', 'ВЕЛИКІ КРУГЛІ', 'ДРІБНІ ПЛОСКІ', 'ДРІБНІ КРУГЛІ'];
  layer(g, cam, 1, (g) => cols.forEach((nm, i) => { const x = E.W / 2 + (i - 1.5) * 380, y = E.H * 0.84, h = 380, f = ease.inOut(prog(t, 0.3 + i * 0.2, tB + 0.3));
    rr(g, x - 140, y - h, 280, h, 18); g.fillStyle = alpha('#2b7fd0', 0.08); g.fill(); g.strokeStyle = alpha('#2b7fd0', 0.6); g.lineWidth = 4; g.stroke();
    g.save(); g.beginPath(); rr(g, x - 140, y - h * f, 280, h * f, 18); g.clip(); g.fillStyle = mix(KC, '#000', 0.25); g.fillRect(x - 150, y - h, 300, h); for (let j = 0; j < 24; j++) kernel(g, x - 110 + (j % 6) * 44, y - 20 - Math.floor(j / 6) * 40, 34 * (i < 2 ? 1.1 : 0.8), { flat: i % 2 ? 0.1 : 0.9, rot: j }); g.restore();
    for (let j = 0; j < 3; j++) { const k = ((t * 1.2 + j / 3) % 1); kernel(g, x, lerp(y - h - 120, y - h * f, k), 30, { rot: j + t }); }
    label(g, nm, x, y + 40, 1, 26, cream()); }));
  const n = Math.min(4, Math.max(0, Math.floor((t - 0.2) / 0.3) + 1)); text(g, String(n), E.W / 2, E.H * 0.17, { size: 150, color: gold(), font: FONTS.ui, weight: 900, glow: 26, glowColor: alpha(gold(), 0.6), alpha: ease.out(prog(t, 0.1, 0.3)) });
  label(g, 'ФРАКЦІЇ', E.W / 2 + 190, E.H * 0.18, ease.out(prog(t, 0.4, 0.7)), 44, cream());
} });

// s34 — X-ray reveals bad insides
registerShot('s34', { draw(g, t, info) {
  const cam = { z: lerp(1.0, 1.05, t / info.dur) }; velvet(g, t, cam, { mood: 'interiorCool', tint: '#2b7fd0' });
  const tA = wt('але', info, 3.0), tS = wt('шкідником', info, 4.6), tZ = wt('зародку', info, 6.0), sx = lerp(-100, E.W + 100, ease.inOut(prog(t, tA - 0.2, tA + 2.2)));
  const bad = { 1: 'bug', 4: 'noemb', 5: 'bug' };
  for (let i = 0; i < 7; i++) { const x = E.W / 2 + (i - 3) * 230, y = E.H * 0.55, b = bad[i], rev = x < sx;
    kernel(g, x, y, 190, { embryo: rev && !b ? 0.7 : 0.25, hollow: rev && b === 'bug' ? 1 : 0, col: rev && b === 'noemb' ? '#b89a6a' : KC });
    if (rev && b) { ring(g, x, y, 120, 5, coral()); if (b === 'noemb') cross(g, x, y + 30, 26, 1); } }
  g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = alpha('#2b7fd0', 0.25); g.fillRect(sx - 6, 0, 12, E.H); glow(g, sx, E.H * 0.55, 200, '#2b7fd0', 0.3); g.restore();
  label(g, 'ОДНАКОВІ ЗОВНІ', E.W / 2, E.H * 0.16, ease.out(prog(t, 0.2, 0.6)) * (1 - ease.out(prog(t, tS - 0.2, tS))), 48, cream());
  label(g, 'ПОТОЧЕНІ ШКІДНИКОМ', E.W / 2 - 330, E.H * 0.85, ease.out(prog(t, tS, tS + 0.3)), 36, coral());
  label(g, 'БЕЗ ЗАРОДКА', E.W / 2 + 420, E.H * 0.85, ease.out(prog(t, tZ - 0.1, tZ + 0.2)), 36, coral());
} });

// s35 — gravity separator (#7)
hallShot('s35', { n: 7, fx: E.W / 2 - 470 });

// s36 — the deck from above, shaking; zones
registerShot('s36', { draw(g, t, info) {
  UI.blueprint(g); g.save(); push(g, t, info, 1.0, 1.05);
  const sk = Math.sin(t * 20) * 5, x0 = E.W * 0.15 + sk, y0 = E.H * 0.16, w = E.W * 0.7, h = E.H * 0.62, tV = wt('важкі', info, 1.3), tL = wt('легкі', info, 4.6);
  g.strokeStyle = bp(); g.lineWidth = 6; g.strokeRect(x0, y0, w, h);
  const zones = [['#3fb950', 0.0, 0.45], ['#2b7fd0', 0.45, 0.68], ['#ff6f61', 0.68, 1.0]];
  zones.forEach(([c, a0, a1], i) => { const on = i === 0 ? ease.out(prog(t, tV, tV + 0.5)) : i === 2 ? ease.out(prog(t, tL, tL + 0.5)) : 0.4; g.fillStyle = alpha(c, 0.08 + 0.12 * on); g.fillRect(x0 + w * a0, y0, w * (a1 - a0), h); });
  const r = rng(4); for (let i = 0; i < 70; i++) { const heavy = r() < 0.7, ph = r(), k = ((t * 0.2 + ph) % 1); const x = heavy ? lerp(x0 + w * 0.5, x0 + w * 0.06, k) : lerp(x0 + w * 0.5, x0 + w * 0.94, k), y = lerp(y0 + 30, y0 + h - 30, (r() + k * 0.4) % 1); kernel(g, x, y, heavy ? 30 : 24, { rot: i, col: heavy ? KC : '#b89a6a', hollow: heavy ? 0 : 0.8 }); }
  for (let i = 0; i < 3; i++) { const yy = y0 + h * (0.2 + i * 0.3); poly(g, [[x0 + w * 0.45, yy], [x0 + w * 0.25, yy - 18], [x0 + w * 0.25, yy + 18]], alpha('#3fb950', 0.6)); poly(g, [[x0 + w * 0.6, yy], [x0 + w * 0.8, yy - 18], [x0 + w * 0.8, yy + 18]], alpha('#ff6f61', 0.6)); }
  label(g, 'ПОВНОЦІННІ', x0 + w * 0.22, y0 + h + 60, ease.out(prog(t, tV, tV + 0.3)), 40, '#1f9d55');
  label(g, 'У ВІДХОДИ', x0 + w * 0.84, y0 + h + 60, ease.out(prog(t, tL, tL + 0.3)), 40, coral());
  label(g, 'ДЕКА ХИТАЄТЬСЯ', E.W / 2, E.H * 0.1, 1, 42, gold());
  g.restore();
} });

// s37 — everything runs; dust haze; FARMER coughs
hallShot('s37', { n: 7, drop: false, haze: 0.55, z0: 0.62, z1: 0.66, x0: -150, x1: 80, y: -60, fx: E.W / 2 - 340, s: 1.4, poses: [[0, 'facepalm'], [0.9, 'wave'], [1.4, 'facepalm']], expr: 'worried', focus: 3 });

// s38 — cyclones drop in
hallShot('s38', { n: 7, drop: false, cyclones: 1, tCyc: 0.4, z0: 0.7, z1: 0.74, x0: 820, x1: 940, y: -220, focus: 3, fx: E.W / 2 - 340, s: 1.3, poses: [[0, 'stand'], [0.7, 'pointUp']], expr: 'smile', extra: (g, t) => {
  const a = ease.outBack(prog(t, 1.0, 1.4)); if (a > 0) { g.save(); g.translate(E.W / 2, 90); g.scale(a, a); rr(g, -220, -34, 440, 68, 34); g.fillStyle = S().ui.card; g.fill(); g.strokeStyle = alpha(gold(), 0.8); g.lineWidth = 3; g.stroke(); text(g, 'ВЕНТЦИКЛОНИ', 0, 2, { size: 34, color: cream(), font: FONTS.ui, weight: 900 }); g.restore(); }
} });

// s39 — cyclone section
registerShot('s39', { draw(g, t, info) {
  UI.blueprint(g); g.save(); push(g, t, info, 1.0, 1.06);
  const cx = E.W / 2, y0 = E.H * 0.18, y1 = E.H * 0.55, y2 = E.H * 0.86, R = 220, tC = wt('цех', info, 2.8);
  g.strokeStyle = bp(); g.lineWidth = 6; g.beginPath(); g.moveTo(cx - R, y0); g.lineTo(cx - R, y1); g.lineTo(cx - 40, y2); g.moveTo(cx + R, y0); g.lineTo(cx + R, y1); g.lineTo(cx + 40, y2); g.stroke();
  seg(g, [[cx - R - 300, y0 + 60], [cx - R, y0 + 60]], 6, bp()); seg(g, [[cx - 60, y0 - 100], [cx - 60, y0 + 160]], 5, bp()); seg(g, [[cx + 60, y0 - 100], [cx + 60, y0 + 160]], 5, bp());
  for (let i = 0; i < 40; i++) { const k = ((t * 0.35 + i / 40) % 1), y = lerp(y0 + 60, y2 - 30, k), rr2 = lerp(R - 30, 40, Math.max(0, (y - y1) / (y2 - y1))), a = t * 7 + i * 0.9; const x = cx + Math.cos(a) * rr2 * (i % 2 ? 1 : 0.95); circle(g, x, y + Math.sin(a) * 12, 5, alpha('#d8c69a', 0.85)); }
  for (let i = 0; i < 6; i++) { const k = ((t * 0.6 + i / 6) % 1); g.strokeStyle = alpha(gold(), 0.7 * Math.sin(k * Math.PI)); g.lineWidth = 5; g.beginPath(); g.ellipse(cx, lerp(y1 - 40, y0 - 40, k), lerp(50, 40, k), 14, 0, 0, 7); g.stroke(); }
  for (let i = 0; i < 3; i++) { const k = ((t * 0.5 + i / 3) % 1); poly(g, [[cx - 14, y0 - 40 - k * 120], [cx + 14, y0 - 40 - k * 120], [cx, y0 - 70 - k * 120]], alpha('#2b7fd0', 1 - k)); }
  poly(g, [[cx - 60, y2 + 10], [cx + 60, y2 + 10], [cx + 90, y2 + 70], [cx - 90, y2 + 70]], alpha('#d8c69a', 0.5));
  label(g, 'ЧИСТЕ ПОВІТРЯ', cx + 330, y0 - 60, ease.out(prog(t, 0.6, 1.0)), 36, '#2b7fd0'); label(g, 'ПИЛ', cx + 230, y2 + 40, ease.out(prog(t, 1.0, 1.4)), 36, cream());
  tick(g, E.W - 240, E.H * 0.5, 50, ease.outBack(prog(t, tC - 0.2, tC + 0.2)));
  g.restore();
} });
