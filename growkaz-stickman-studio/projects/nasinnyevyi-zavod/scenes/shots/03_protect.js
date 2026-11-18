// shots/03_protect.js — s40–s57: 3D recap, soil threats, treater, fluid-bed dryer, weighing and bagging.
import { E, V, S, registerShot, mood, layer, blurLayer, veil, ease, prog, clamp, lerp, shake, seg, circle, ring, rr, poly, glow, alpha, shade, mix, text, FONTS, rng, linGrad } from '/engine/core.js';
import { drawFigure, POSES, posesAt, breathe, bigFace } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { kernel, velvet, hall, soil, warehouse, bagStack, RED_SEED, GREEN } from '../sets/plant.js';
import { FARMER } from '../cast.js';
import { wt, gold, cream, bp, coral, push, label, title, tick, cross, hallShot } from './_h.js';

const KC = '#f2b640';

// ---------- 3D plant (shared with s67) ----------
export function buildPlant3D(T, o = {}) {
  const M = mood('interiorCool'), st = T.stage({ mood: 'interiorCool', fov: 38, fog: [18, 70], keyPos: [-10, 14, 8], keyIntensity: 2.2, ambient: 1.2 });
  st.add(T.ground(120, 60, M.floor, T.tiles(M.floor, 10, [30, 15])));
  st.add(T.box(80, 12, 0.5, shade(M.wall, -0.2), 0, 6, -8));
  for (let x = -30; x <= 30; x += 5) { const w = T.windowPane(2.6, 4, { glowColor: '#bcd6ff', cols: 3, rows: 2, power: 0.9 }); w.position.set(x, 6.5, -7.7); st.add(w); const s = T.shaft(2.6, 9, '#cfe0ff', 0.05); s.position.set(x, 4, -5); s.rotation.x = -0.6; st.add(s); }
  const G = mix(GREEN, M.wall, 0.15), P = '#dfe3e8', R = '#b8322a', St = '#aab4c0';
  const line = [[-15, 'g', 2.2, 1.8], [-12, 'b', 3.2, 0.9], [-9, 'dry', 3, 3.8], [-6, 'g', 2.2, 1.8], [-3, 'clean', 3, 2.8], [0, 'g', 2.8, 2.6], [3, 'grav', 3.6, 1.6], [6, 'treat', 2.4, 3.0], [9, 'fbd', 3.8, 1.6], [12, 'bag', 2.4, 3.0]];
  for (const [x, k, w, h] of line) {
    const col = k === 'treat' ? R : k === 'dry' || k === 'bag' ? St : k === 'b' ? '#3a414d' : G;
    st.add(T.box(w, h, 2, col, x, h / 2, 0));
    if (k === 'clean' || k === 'g') st.add(T.box(w * 0.8, h * 0.3, 0.05, P, x, h * 0.78, 1.02));
    if (k === 'treat') st.add(T.cyl(0.8, 0.8, 0.5, St, x, 1.6, 1.1, 20));
    if (k === 'bag') for (let i = 0; i < 3; i++) st.add(T.box(0.7, 0.5, 0.5, '#ece6d6', x + 2 + (i % 2) * 0.8, 0.25 + Math.floor(i / 2) * 0.5, 0.6));
  }
  for (const x of [-10.5, -4.5, 1.5, 7.5]) { st.add(T.box(0.8, 9, 0.6, '#cbbf9f', x, 4.5, -2.2)); st.add(T.box(1.4, 0.9, 0.9, '#cbbf9f', x + 0.3, 9.2, -2.2)); }
  for (const x of [-3, 0, 3]) { st.add(T.cyl(0.7, 0.7, 2.2, St, x + 0.5, 7, 0.4, 20)); st.add(T.cone(0.7, 1.2, St, x + 0.5, 5.3, 0.4, 20)); }
  st.add(T.box(9, 0.6, 0.6, '#8a94a2', 0.5, 8.4, 0.4));
  const me = T.figure3D(FARMER, { rim: M.rim, pose: o.pose || POSES.stand }); me.position.set(o.fx ?? 1.5, 0, 2.6); me.rotation.y = -Math.PI / 2; st.add(me);
  return { stage: st, me };
}

registerShot('s40', { kind: '3d',
  init(T) { return buildPlant3D(T, { fx: 1.5 }); },
  draw(s, t, info, T) { T.orbit(s.stage.camera, t, { target: [0, 2, 0], radius: 17, height: [7, 6], from: -0.55, to: -0.25, dur: info.dur }); },
  overlay(g, t, info) { tick(g, E.W - 140, 140, 46, ease.outBack(prog(t, 0.6, 1.0))); label(g, 'ЧИСТЕ Й ВІДКАЛІБРОВАНЕ', E.W / 2, E.H - 90, ease.out(prog(t, 0.4, 0.8)), 44, gold()); },
});

// s41 — underground: wireworms & fungus close in on a seed
function wireworm(g, x, y, t, s, dir = 1) { for (let i = 0; i < 9; i++) { const px = x - dir * i * 16 * s, py = y + Math.sin(t * 5 - i * 0.7) * 6 * s; circle(g, px, py, 11 * s, i === 0 ? '#a8501a' : mix('#e08a3a', '#c86a2a', (i % 2) * 0.5)); } circle(g, x + dir * 6 * s, y - 3 * s, 2.5 * s, '#1a0a04'); }
registerShot('s41', { draw(g, t, info) {
  const cam = { z: lerp(1.0, 1.12, ease.inOut(t / info.dur)), y: 40 }; const { Y } = soil(g, t, cam);
  const tG = wt('грибки', info, 1.8), tD = wt('дротяники', info, 2.3), sx = E.W / 2, sy = E.H * 0.6;
  layer(g, cam, 1, (g) => {
    kernel(g, sx, sy, 140, { rot: 0.4, embryo: 0.5 }); glow(g, sx, sy, 220, '#ffd47e', 0.12);
    const fk = ease.inOut(prog(t, tG - 0.6, tG + 1.2)); if (fk > 0) for (let i = 0; i < 9; i++) { const a = i * 0.7 + 3.4, r0 = 520, r1 = lerp(r0, 120, fk); g.strokeStyle = alpha('#e8eef0', 0.55); g.lineWidth = 3; g.beginPath(); g.moveTo(sx + Math.cos(a) * r0, sy + Math.sin(a) * r0 * 0.6); g.quadraticCurveTo(sx + Math.cos(a + 0.3) * (r0 + r1) / 2, sy + Math.sin(a + 0.3) * (r0 + r1) * 0.3, sx + Math.cos(a) * r1, sy + Math.sin(a) * r1 * 0.6); g.stroke(); }
    const wk = ease.inOut(prog(t, tD - 1.0, info.dur)); wireworm(g, lerp(-60, sx - 230, wk), sy + 120, t, 1.6, 1); wireworm(g, lerp(E.W + 60, sx + 240, wk), sy - 80, t + 1, 1.4, -1);
  });
  label(g, 'ГРИБКИ', E.W / 2 - 420, E.H * 0.9, ease.out(prog(t, tG, tG + 0.3)), 44, '#e8eef0'); label(g, 'ДРОТЯНИКИ', E.W / 2 + 420, E.H * 0.9, ease.out(prog(t, tD, tD + 0.3)), 44, '#e08a3a');
} });

// s42 — treater (#8)
hallShot('s42', { n: 8, fx: E.W / 2 - 400 });

// s43 — weigh hopper fills to the portion
registerShot('s43', { draw(g, t, info) {
  const cam = { z: lerp(1.0, 1.06, ease.inOut(t / info.dur)) }; velvet(g, t, cam, { mood: 'interiorCool', tint: '#9fd0ff' });
  const cx = E.W / 2 - 200, f = ease.inOut(prog(t, 0.2, 1.6)), shut = t > 1.6;
  layer(g, cam, 1, (g) => {
    poly(g, [[cx - 220, E.H * 0.2], [cx + 220, E.H * 0.2], [cx + 80, E.H * 0.62], [cx - 80, E.H * 0.62]], '#3a4250'); g.save(); g.beginPath(); g.moveTo(cx - 220, E.H * 0.2); g.lineTo(cx + 220, E.H * 0.2); g.lineTo(cx + 80, E.H * 0.62); g.lineTo(cx - 80, E.H * 0.62); g.clip(); g.fillStyle = '#c98a2a'; g.fillRect(cx - 240, lerp(E.H * 0.62, E.H * 0.26, f), 480, E.H); g.restore();
    seg(g, [[cx - 90, E.H * 0.64], [cx + (shut ? 90 : -10), E.H * 0.64]], 12, shut ? '#7dffb0' : '#5a6270');
    if (!shut) for (let i = 0; i < 12; i++) { const k = ((t * 1.6 + i / 12) % 1); kernel(g, cx + Math.sin(i * 2) * 30, lerp(-40, E.H * 0.3, k), 26, { rot: i + t * 4 }); }
    rr(g, E.W / 2 + 160, E.H * 0.34, 420, 200, 20); g.fillStyle = '#0c1a12'; g.fill(); g.strokeStyle = alpha('#7dffb0', 0.5); g.lineWidth = 4; g.stroke();
    rr(g, E.W / 2 + 200, E.H * 0.44, 340, 40, 20); g.fillStyle = alpha('#7dffb0', 0.15); g.fill(); rr(g, E.W / 2 + 200, E.H * 0.44, 340 * f, 40, 20); g.fillStyle = '#7dffb0'; g.fill();
    label(g, 'ПОРЦІЯ', E.W / 2 + 370, E.H * 0.39, 1, 40, '#7dffb0'); tick(g, E.W / 2 + 370, E.H * 0.6, 36, ease.outBack(prog(t, 1.6, 1.9)));
  });
  label(g, 'ВАГИ', cx, E.H * 0.12, ease.out(prog(t, 0.1, 0.4)), 48, gold());
} });

// s44 — three dosing tanks
registerShot('s44', { draw(g, t, info) {
  const cam = { z: lerp(1.0, 1.05, t / info.dur), x: lerp(-20, 20, t / info.dur) }; velvet(g, t, cam, { mood: 'interiorCool', tint: '#9fd0ff' });
  const tN = wt('Насос', info, 0.1), names = [['ФУНГІЦИД', '#4aa0ff', 'фунгіцид'], ['ІНСЕКТИЦИД', '#f2c21a', 'інсектицид'], ['БАРВНИК', '#e2483a', 'барвник']];
  layer(g, cam, 1, (g) => {
    const px = E.W / 2 + 560, py = E.H * 0.6; rr(g, px - 90, py - 90, 180, 180, 30); g.fillStyle = '#2c5a9a'; g.fill(); const pulse = 1 + 0.08 * Math.sin(t * 10); circle(g, px, py, 50 * pulse, '#163a6a'); label(g, 'НАСОС', px, py + 140, ease.out(prog(t, tN, tN + 0.3)), 36, cream());
    names.forEach(([nm, c, w], i) => { const tt = wt(w, info, 1.6 + i), on = ease.outBack(prog(t, tt - 0.1, tt + 0.3)), x = E.W / 2 - 560 + i * 360, y = E.H * 0.62;
      rr(g, x - 100, y - 260, 200, 300, 24); g.fillStyle = alpha(c, 0.12 + 0.2 * clamp(on)); g.fill(); g.strokeStyle = alpha(c, 0.4 + 0.6 * clamp(on)); g.lineWidth = 5; g.stroke(); rr(g, x - 90, y - 140, 180, 170, 18); g.fillStyle = alpha(c, 0.55 * clamp(on) + 0.15); g.fill();
      if (on > 0) { glow(g, x, y - 80, 220, c, 0.25 * clamp(on)); seg(g, [[x, y + 40], [x, y + 120], [px - 90, y + 120], [px - 90, py + 40]], 8, alpha(c, 0.8)); const k = ((t * 1.5 + i * 0.3) % 1); circle(g, lerp(x, px - 90, k), y + 120, 10, c); }
      label(g, nm, x, y - 300, clamp(on) * 0.8 + 0.2, 32, on > 0 ? c : cream()); });
  });
} });

// s45 — mixing cylinder, mist, seeds turn red
registerShot('s45', { draw(g, t, info) {
  UI.blueprint(g); g.save(); push(g, t, info, 1.0, 1.06);
  const cx = E.W / 2, cy = E.H * 0.52, R = 330, red = ease.inOut(prog(t, 1.0, wt('кожну', info, 4.5) + 0.6));
  ring(g, cx, cy, R, 8, bp()); circle(g, cx, cy, R, alpha(bp(), 0.06)); g.save(); g.translate(cx, cy); g.rotate(t * 1.6); for (let i = 0; i < 6; i++) { g.rotate(Math.PI / 3); seg(g, [[R * 0.7, 0], [R - 8, 0]], 6, alpha(bp(), 0.5)); } g.restore();
  for (let i = 0; i < 9; i++) { const a = -t * 4 + i * 0.7; seg(g, [[cx, cy], [cx + Math.cos(a) * 150, cy + Math.sin(a) * 150]], 3, alpha('#ffb0a0', 0.3)); circle(g, cx + Math.cos(a) * (60 + ((t * 200 + i * 40) % 140)), cy + Math.sin(a) * (60 + ((t * 200 + i * 40) % 140)), 4, alpha('#ff8a7a', 0.6)); }
  circle(g, cx, cy, 34, gold()); glow(g, cx, cy, 120, '#ff8a7a', 0.3);
  for (let i = 0; i < 30; i++) { const a = t * 1.6 + i * 0.21, r = R - 50 - (i % 3) * 42, x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r; const me = clamp(red * 1.3 - (i / 30) * 0.3); kernel(g, x, y, 40, { rot: a + i, col: mix(KC, RED_SEED, me) }); }
  label(g, 'ЗМІШУВАЛЬНИЙ ЦИЛІНДР', cx, E.H * 0.11, 1, 42, gold()); label(g, 'ДРІБНИЙ ТУМАН', cx + R + 230, cy - 120, ease.out(prog(t, wt('туманом', info, 2.4), wt('туманом', info, 2.4) + 0.3)), 36, '#ff9a8a');
  g.restore();
} });

// s46 — 20 s cycle
registerShot('s46', { draw(g, t, info) {
  const cam = { z: lerp(1.0, 1.05, t / info.dur) }; velvet(g, t, cam, { mood: 'interiorCool', tint: '#ff8a7a' });
  const cx = E.W / 2 - 250, cy = E.H * 0.5, k = clamp(t / (info.dur - 0.4));
  ring(g, cx, cy, 200, 26, alpha(cream(), 0.12)); g.strokeStyle = gold(); g.lineWidth = 26; g.lineCap = 'round'; g.beginPath(); g.arc(cx, cy, 200, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * k); g.stroke();
  text(g, String(Math.max(0, Math.round(20 * (1 - k)))), cx, cy - 10, { size: 150, color: gold(), font: FONTS.ui, weight: 900, glow: 20, glowColor: alpha(gold(), 0.6) }); label(g, 'СЕКУНД', cx, cy + 110, 1, 36);
  const n = 1 + Math.floor(k * 2.99); for (let i = 0; i < 3; i++) { const x = E.W / 2 + 220 + i * 170, on = i < n; rr(g, x - 60, cy - 70, 120, 140, 18); g.fillStyle = on ? alpha(RED_SEED, 0.85) : alpha(cream(), 0.08); g.fill(); if (on) for (let j = 0; j < 6; j++) kernel(g, x - 34 + (j % 3) * 34, cy - 20 + Math.floor(j / 3) * 44, 30, { col: '#e2483a', rot: j }); }
  label(g, 'ПОРЦІЇ', E.W / 2 + 390, cy - 130, 1, 36, cream());
} });

// s47 — wet glossy red seeds, two stick
registerShot('s47', { draw(g, t, info) {
  const cam = { z: lerp(1.0, 1.1, ease.inOut(t / info.dur)) }; velvet(g, t, cam, { tint: '#ff8a7a' });
  layer(g, cam, 1, (g) => { const r = rng(3); for (let i = 0; i < 9; i++) kernel(g, 260 + r() * (E.W - 520), E.H * 0.35 + r() * E.H * 0.45, 120, { col: RED_SEED, gloss: 1, rot: r() * 6 });
    const k = ease.inOut(prog(t, 0.8, 2.0)), cx = E.W / 2, cy = E.H * 0.52; kernel(g, cx - lerp(220, 70, k), cy, 230, { col: RED_SEED, gloss: 1, rot: -0.4 }); kernel(g, cx + lerp(220, 70, k), cy + 10, 230, { col: RED_SEED, gloss: 1, rot: 0.5 });
    if (k > 0.8) { seg(g, [[cx - 10, cy - 40], [cx + 10, cy - 30]], 10, alpha('#ff9a8a', 0.8)); circle(g, cx, cy + 70 + ((t * 80) % 60), 8, alpha('#ff9a8a', 0.8)); } });
  label(g, 'ВОЛОГЕ Й ЛИПКЕ', E.W / 2, E.H * 0.13, ease.out(prog(t, 0.6, 1.0)), 52, '#ff9a8a');
} });

// s48 — planter disc catches a stuck pair
registerShot('s48', { draw(g, t, info) {
  UI.blueprint(g); g.save(); push(g, t, info, 1.0, 1.06);
  const cx = E.W * 0.32, cy = E.H * 0.52, R = 300, tD = wt('дві', info, 2.4), a0 = t * 0.9;
  ring(g, cx, cy, R, 8, bp()); circle(g, cx, cy, R, alpha(bp(), 0.06)); circle(g, cx, cy, 30, bp());
  for (let i = 0; i < 16; i++) { const a = a0 + i * Math.PI / 8, x = cx + Math.cos(a) * (R - 40), y = cy + Math.sin(a) * (R - 40); ring(g, x, y, 24, 4, alpha(bp(), 0.8)); const dbl = i === 3 && t > tD - 1.2; kernel(g, x, y, 34, { col: RED_SEED, rot: a }); if (dbl) { kernel(g, x + 18, y + 10, 34, { col: RED_SEED, rot: a + 1 }); if (t > tD) ring(g, x + 9, y + 5, 46, 5, coral()); } }
  const fy = E.H * 0.78; seg(g, [[E.W * 0.55, fy], [E.W * 0.95, fy]], 6, alpha(bp(), 0.6));
  for (let i = 0; i < 7; i++) { const x = E.W * 0.58 + i * 56; kernel(g, x, fy - 24, 30, { col: RED_SEED }); if (i === 4 && t > tD) { kernel(g, x + 16, fy - 26, 30, { col: RED_SEED, rot: 1 }); } }
  cross(g, E.W * 0.58 + 4 * 56 + 8, fy - 100, 36, ease.outBack(prog(t, tD, tD + 0.3)));
  label(g, 'ДИСК СІВАЛКИ', cx, E.H * 0.11, 1, 42, gold()); label(g, 'ДВІ ЗАМІСТЬ ОДНІЄЇ', E.W * 0.75, E.H * 0.62, ease.out(prog(t, tD, tD + 0.3)), 38, coral());
  g.restore();
} });

// s49 — fluid-bed dryer (#9)
hallShot('s49', { n: 9, fx: E.W / 2 - 470 });

// fluid bed diagram; mode 0 drying, 1 last screen
function fluidBed(g, t, info, mode) {
  UI.blueprint(g); g.save(); push(g, t, info, mode ? 1.1 : 1.0, mode ? 1.16 : 1.05, mode ? -220 : 0);
  const x0 = E.W * 0.08, x1 = E.W * 0.92, y = E.H * 0.62, sh = Math.sin(t * 26) * 4;
  seg(g, [[x0 + sh, y], [x1 + sh, y]], 8, bp()); for (let i = 0; i < 40; i++) seg(g, [[lerp(x0, x1, i / 40) + sh, y - 6], [lerp(x0, x1, i / 40) + sh, y + 6]], 3, alpha(bp(), 0.6));
  for (let s2 = 1; s2 < 4; s2++) seg(g, [[lerp(x0, x1, s2 / 4), y - 10], [lerp(x0, x1, s2 / 4), y + 40]], 4, alpha(bp(), 0.5));
  for (let i = 0; i < 12; i++) { const x = lerp(x0, x1 * 0.97, (i + 0.5) / 12), k = ((t * 1.2 + i * 0.17) % 1); poly(g, [[x - 14, y + 120 - k * 70], [x + 14, y + 120 - k * 70], [x, y + 90 - k * 70]], alpha('#ffb070', 0.8 * Math.sin(k * Math.PI))); }
  for (let i = 0; i < 26; i++) { const k = ((t * 0.12 + i / 26) % 1), x = lerp(x0 + 40, x1 * 0.75, k), hop = Math.abs(Math.sin(t * 8 + i)) * 40; kernel(g, x, y - 26 - hop, 36, { col: RED_SEED, gloss: 1 - k, rot: i + t * 2 }); }
  for (let i = 0; i < 3; i++) { const k = ((t * 0.2 + i / 3) % 1), x = lerp(x1 * 0.78, x1 + 200, k), yy = y - 30 + Math.max(0, k - 0.6) * 300; kernel(g, x, yy, 40, { col: '#a82a24', rot: 0.4 }); kernel(g, x + 26, yy + 6, 40, { col: '#a82a24', rot: -0.6 }); }
  label(g, mode ? 'ГРУДКИ Й ЗЛИПЛІ ПАРИ' : 'ПЛІВКА ВИСИХАЄ', mode ? x1 - 260 : E.W / 2, mode ? y + 150 : E.H * 0.18, ease.out(prog(t, mode ? 1.4 : 0.6, mode ? 1.8 : 1.0)), 40, mode ? coral() : gold());
  label(g, 'ПОВІТРЯ', E.W * 0.2, y + 160, ease.out(prog(t, 1.0, 1.4)), 34, '#ffb070');
  g.restore();
}
registerShot('s50', { draw(g, t, info) { fluidBed(g, t, info, 0); } });
registerShot('s51', { draw(g, t, info) { fluidBed(g, t, info, 1); } });

// s52 — dry red seeds pouring; three ticks
registerShot('s52', { draw(g, t, info) {
  const cam = { z: lerp(1.0, 1.05, t / info.dur) }; velvet(g, t, cam, { tint: '#ff9a8a' });
  layer(g, cam, 1, (g) => { for (let i = 0; i < 30; i++) { const k = ((t * 0.8 + i / 30) % 1); kernel(g, E.W * 0.3 + Math.sin(i * 2.2) * 60, lerp(-60, E.H * 0.82, k), 44, { col: RED_SEED, rot: i + t * 3 }); } poly(g, [[E.W * 0.3 - 360, E.H * 0.88], [E.W * 0.3, E.H * 0.66], [E.W * 0.3 + 360, E.H * 0.88]], '#8a2420'); });
  const w = [['чисте', 'ЧИСТЕ'], ['протруєне', 'ПРОТРУЄНЕ'], ['сухе', 'СУХЕ']];
  w.forEach(([wd, nm], i) => { const tt = wt(wd, info, 0.6 + i * 0.7), a = ease.outBack(prog(t, tt - 0.1, tt + 0.25)), y = E.H * 0.3 + i * 170; tick(g, E.W * 0.55, y, 40, a); if (a > 0) text(g, nm, E.W * 0.55 + 70, y, { size: 52, color: cream(), font: FONTS.ui, weight: 900, spacing: 3, align: 'left', alpha: clamp(a) }); });
} });

// s53 — balance: same count, different weight
registerShot('s53', { draw(g, t, info) {
  const cam = { z: lerp(1.0, 1.05, t / info.dur) }; velvet(g, t, cam, { mood: 'interiorCool', tint: '#9fd0ff' });
  const tM = wt('масу', info, 2.4), tilt = 0.16 * ease.outElastic(prog(t, tM - 0.6, tM + 0.4)), cx = E.W / 2, cy = E.H * 0.36;
  seg(g, [[cx, E.H * 0.86], [cx, cy]], 16, '#5a6270'); poly(g, [[cx - 120, E.H * 0.88], [cx + 120, E.H * 0.88], [cx + 60, E.H * 0.84], [cx - 60, E.H * 0.84]], '#3a414d');
  g.save(); g.translate(cx, cy); g.rotate(-tilt); seg(g, [[-460, 0], [460, 0]], 14, '#8a94a2'); circle(g, 0, 0, 18, '#cfd6dc');
  for (const sd of [-1, 1]) { const px = sd * 440; g.save(); g.translate(px, 0); g.rotate(tilt); seg(g, [[0, 0], [-120, 200]], 3, '#8a94a2'); seg(g, [[0, 0], [120, 200]], 3, '#8a94a2'); rr(g, -150, 200, 300, 26, 13); g.fillStyle = '#8a94a2'; g.fill(); for (let j = 0; j < 9; j++) kernel(g, -100 + (j % 5) * 50 + (Math.floor(j / 5)) * 25, 180 - Math.floor(j / 5) * 34, sd < 0 ? 52 : 34, { flat: sd < 0 ? 0.9 : 0.1, rot: j }); g.restore(); }
  g.restore();
  label(g, 'ВЕЛИКІ', cx - 440, E.H * 0.82, 1, 40, cream()); label(g, 'ДРІБНІ', cx + 440, E.H * 0.82, 1, 40, cream()); label(g, 'РІЗНА МАСА', cx, E.H * 0.12, ease.out(prog(t, tM, tM + 0.3)), 52, gold());
} });

// s54 — weigh doser & bagging (#10)
hallShot('s54', { n: 10, fx: E.W / 2 - 430 });

// s55 — 1000-kernel mass per fraction
registerShot('s55', { draw(g, t, info) {
  UI.blueprint(g); g.save(); push(g, t, info, 1.0, 1.06);
  const tT = wt('тисячі', info, 0.8), cx = E.W * 0.27, cy = E.H * 0.52;
  for (let i = 0; i < 100; i++) { const a = ease.out(prog(t, 0.1 + i * 0.008, 0.3 + i * 0.008)); if (a <= 0) continue; kernel(g, cx - 225 + (i % 10) * 50, cy - 250 + Math.floor(i / 10) * 46, 34 * a, { rot: (i % 3) * 0.3 }); }
  title(g, '1000 ЗЕРЕН', cx, E.H * 0.1, ease.out(prog(t, tT, tT + 0.3)), 56);
  const fr = [['ВЕЛИКІ ПЛОСКІ', 1.0], ['ВЕЛИКІ КРУГЛІ', 0.86], ['ДРІБНІ ПЛОСКІ', 0.7], ['ДРІБНІ КРУГЛІ', 0.58]];
  fr.forEach(([nm, v], i) => { const y = E.H * 0.28 + i * 150, a = ease.out(prog(t, 0.8 + i * 0.25, 1.2 + i * 0.25)); if (a <= 0) return; label(g, nm, E.W * 0.68, y - 40, a, 30, cream()); rr(g, E.W * 0.55, y - 10, 520, 34, 17); g.fillStyle = alpha(bp(), 0.15); g.fill(); rr(g, E.W * 0.55, y - 10, 520 * v * a, 34, 17); g.fillStyle = gold(); g.fill(); });
  label(g, 'МАСА', E.W * 0.68, E.H * 0.16, ease.out(prog(t, 0.6, 1.0)), 44, gold());
  g.restore();
} });

// s56 — bag fills to 80 000 = one sowing unit
registerShot('s56', { draw(g, t, info) {
  const cam = { z: lerp(1.0, 1.07, ease.inOut(t / info.dur)) }; velvet(g, t, cam, { mood: 'interiorCool', tint: '#9fd0ff' });
  const t8 = wt('вісімдесят', info, 1.6), tU = wt('посівну', info, 4.6), f = ease.inOut(prog(t, 0.1, t8 + 1.0)), cx = E.W * 0.32;
  layer(g, cam, 1, (g) => { poly(g, [[cx - 160, E.H * 0.05], [cx + 160, E.H * 0.05], [cx + 50, E.H * 0.25], [cx - 50, E.H * 0.25]], '#5a6270');
    if (f < 1) for (let i = 0; i < 14; i++) { const k = ((t * 1.8 + i / 14) % 1); kernel(g, cx + Math.sin(i * 2) * 26, lerp(E.H * 0.26, E.H * 0.82 - 300 * f, k), 26, { col: RED_SEED, rot: i + t * 4 }); }
    rr(g, cx - 180, E.H * 0.42, 360, 420, 40); g.fillStyle = '#ece6d6'; g.fill(); g.save(); g.beginPath(); rr(g, cx - 180, E.H * 0.42, 360, 420, 40); g.clip(); g.fillStyle = alpha('#000', 0.08); g.fillRect(cx - 200, E.H * 0.42, 400, 420 * (1 - f)); g.restore();
    rr(g, cx - 110, E.H * 0.56, 220, 130, 10); g.fillStyle = '#ffffff'; g.fill(); seg(g, [[cx - 80, E.H * 0.6], [cx + 80, E.H * 0.6]], 6, alpha(GREEN, 0.9)); seg(g, [[cx - 80, E.H * 0.63], [cx + 40, E.H * 0.63]], 4, alpha('#555', 0.6)); });
  const n = Math.round(80000 * ease.out(prog(t, 0.1, t8 + 0.8)) / 10) * 10;
  text(g, n.toLocaleString('uk-UA').replace(/ /g, ' '), E.W * 0.7, E.H * 0.4, { size: 150, color: gold(), font: FONTS.ui, weight: 900, glow: 24, glowColor: alpha(gold(), 0.6) });
  label(g, 'НАСІНИН', E.W * 0.7, E.H * 0.52, 1, 44, cream());
  const a = ease.outBack(prog(t, tU - 0.2, tU + 0.2)); if (a > 0) { g.save(); g.translate(E.W * 0.7, E.H * 0.72); g.scale(a, a); rr(g, -300, -50, 600, 100, 50); g.fillStyle = 'rgba(10,16,24,.85)'; g.fill(); g.strokeStyle = gold(); g.lineWidth = 4; g.stroke(); text(g, '1 ПОСІВНА ОДИНИЦЯ', 0, 2, { size: 44, color: gold(), font: FONTS.ui, weight: 900 }); g.restore(); }
} });

// s57 — giant face: but what about germination?
registerShot('s57', { draw(g, t, info) {
  const M = mood('interiorWarm'); blurLayer(g, 14, (g) => warehouse(g, t, { z: 1.4, y: -100 })); veil(g, '#0a0608', 0.35);
  bigFace(g, E.W * 0.42, E.H * 0.6, 320 * (1 + 0.03 * t), { outfit: FARMER, expr: 'thinking', look: [0.5, -0.4], blink: (t % 2.7) > 2.6, rimColor: M.rim, rimSide: -1 });
  const a = ease.outBack(prog(t, 0.4, 0.8)); if (a > 0) { g.save(); g.translate(E.W * 0.76, E.H * 0.34); g.scale(a, a); text(g, '?', 0, 0, { size: 260, color: gold(), font: FONTS.ui, weight: 900, glow: 30, glowColor: alpha(gold(), 0.6) }); g.restore(); label(g, 'СХОЖІСТЬ', E.W * 0.76, E.H * 0.58, clamp(a), 52, cream()); }
} });
