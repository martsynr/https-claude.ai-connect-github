// shots/03_outro.js — stalks & roots, stay-green, grain fill, hybrids, ×3 density, the rest, outro (s28–s39).
import { E, V, S, registerShot, mood, layer, blurLayer, veil, backdrop, ease, prog, clamp, lerp, shake, rng, seg, circle, ring, rr, poly, glow, alpha, shade, mix, linGrad, text, FONTS } from '/engine/core.js';
import { drawFigure, POSES, posesAt, breathe, bigFace } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { field, fieldGround, cornPlant, cob, plot, tractor, car, roots, OLD, NEW } from '../sets/corn.js';
import { FARMER, BREEDER, CAST } from '../cast.js';
import { wt, S1, push, label, macroBg } from './01_intro.js';

const gold = () => S().ui.gold, bp = () => UI.bpStroke();

// s28 — storm: modern plants bend but stand; root cutaway
registerShot('s28', { draw(g, t, info) {
  const cam = { z: lerp(1.05, 1.1, t / info.dur), y: V(-40, 330) };
  const { GY, M, plant } = field(g, t, cam, { mood: 'storm' });
  const tS = wt('стебла', info, 1.2), tK = wt('коріння', info, 1.9), rk = ease.out(prog(t, tK - 0.2, tK + 0.8));
  layer(g, cam, 1, (g) => {
    g.fillStyle = shade(M.dark, -0.5); g.fillRect(-E.W, GY + 60, E.W * 3, E.H);
    for (let i = 0; i < 4; i++) { const x = E.W * (0.12 + i * 0.25), wind = 40 + 30 * Math.sin(t * 2.2 + i);
      if (rk > 0) { glow(g, x, GY + 180, 160, gold(), 0.15 * rk); roots(g, x, GY + 60, V(260, 360), rk, gold(), 10 + i); }
      cornPlant(g, x, GY + 60, V(640, 720), { sway: wind, seed: 700 + i, color: shade(plant, -0.1), rim: M.rim, ...NEW, w: 16, leaves: 8 }); }
  });
  UI.callout(g, t, { at: [E.W * 0.37 + 10, GY - cam.y - V(120, 260)], to: [E.W * 0.5, E.H * 0.24], str: 'МІЦНЕ СТЕБЛО', start: tS - 0.2, size: V(40, 48) });
  label(g, 'КОРІННЯ', E.W / 2, E.H * V(0.9, 0.68), ease.out(prog(t, tK, tK + 0.4)), V(50, 60), gold());
  FX.rain(g, t, { count: 160 }); if ((t % 3.3) < 0.08) { g.fillStyle = 'rgba(230,240,255,.25)'; g.fillRect(0, 0, E.W, E.H); }
} });

// s29 — autumn: old browns, modern stays green
registerShot('s29', { draw(g, t, info) {
  const cam = { z: lerp(1.15, 1.2, t / info.dur), y: 0 };
  const { GY, M, plant } = field(g, t, cam, { mood: 'dusk' });
  const tZ = wt('зеленим', info, 2.6), d = ease.inOut(prog(t, 0.3, tZ + 0.3));
  layer(g, cam, 1, (g) => {
    cornPlant(g, E.W * 0.27, GY + 40, V(700, 800), { sway: Math.sin(t) * 6, seed: 801, color: shade(plant, 0.05), rim: M.rim, ...OLD, w: 16, leaves: 8, dry: d });
    glow(g, E.W * 0.73, GY - V(300, 360), V(260, 300), '#7ad06a', 0.18 * d);
    cornPlant(g, E.W * 0.73, GY + 40, V(700, 800), { sway: Math.sin(t + 1) * 6, seed: 802, color: mix(plant, '#4f9a48', 0.5), rim: M.rim, ...NEW, w: 16, leaves: 8 });
  });
  label(g, 'СТАРИЙ', E.W * 0.27, GY + V(110, 120), 1, V(40, 46), alpha(S().ui.cream, 0.8));
  label(g, 'ГІБРИД', E.W * 0.73, GY + V(110, 120), 1, V(40, 46), '#9fe08a');
  label(g, 'ДОВШЕ ЗЕЛЕНЕ', E.W / 2, E.H * V(0.1, 0.12), ease.out(prog(t, tZ - 0.2, tZ + 0.3)), V(56, 64), '#9fe08a');
  FX.dust(g, t, { count: 40, color: '#ffd9b0', a: 0.35 });
} });

// s30 — kernels fill gold
registerShot('s30', { draw(g, t, info) {
  macroBg(g, t); g.save(); push(g, t, info, 1.0, 1.08);
  const tO = wt('останнього', info, 1.7), f = ease.inOut(prog(t, 0.2, tO + 0.4));
  cob(g, E.W / 2, E.H * 0.47, V(760, 1050), { tilt: 0.12, fill: 0.15 + 0.85 * f, glowA: 0.15 + 0.25 * f });
  g.restore();
  label(g, 'ДО ОСТАННЬОГО ДНЯ', E.W / 2, E.H * V(0.1, 0.09), ease.out(prog(t, tO - 0.1, tO + 0.3)), V(54, 60), gold());
} });

// s31 — ГІБРИДИ
registerShot('s31', { draw(g, t, info) {
  blurLayer(g, 12, (g) => field(g, t, { z: 1.2 + 0.05 * t, y: -60 }, { mood: 'golden' })); veil(g, '#06100a', 0.5);
  const a = ease.outBack(prog(t, 0.02, 0.35)); g.save(); g.translate(E.W / 2, E.H * 0.42); g.scale(0.8 + 0.2 * a, 0.8 + 0.2 * a); text(g, 'ГІБРИДИ', 0, 0, { size: V(150, 170), color: gold(), glow: 40, glowColor: 'rgba(255,140,40,.85)', alpha: clamp(a), spacing: 6 }); g.restore();
  FX.rings(g, E.W / 2, E.H * 0.42, t, { count: 3, r0: 100, r1: 600, speed: 0.9, color: gold(), a: 0.4 });
} });

// s32 — line A × line B → stronger hybrid
registerShot('s32', { draw(g, t, info) {
  UI.blueprint(g); g.save(); push(g, t, info, 1.0, 1.04);
  const tX = wt('двох', info, 0.8), tP = wt('потомство', info, 2.5), tS = wt('сильніше', info, 3.1);
  const pb = E.H * 0.4, pa = ease.out(prog(t, 0.1, 0.6)), pb2 = ease.out(prog(t, 0.4, 0.9));
  g.globalAlpha = pa; cornPlant(g, E.W * 0.22, pb, V(380, 420), { seed: 11, color: alpha(bp(), 0.85), ...NEW, w: 8, leaves: 6 }); g.globalAlpha = pb2; cornPlant(g, E.W * 0.78, pb, V(360, 400), { seed: 12, color: alpha(bp(), 0.85), ...NEW, w: 8, leaves: 6 }); g.globalAlpha = 1;
  label(g, 'ЛІНІЯ А', E.W * 0.22, pb + V(50, 50), pa, V(36, 42), bp()); label(g, 'ЛІНІЯ Б', E.W * 0.78, pb + V(50, 50), pb2, V(36, 42), bp());
  const kx = ease.outBack(prog(t, tX, tX + 0.4)); if (kx > 0) { g.save(); g.translate(E.W / 2, pb - V(200, 220)); g.scale(kx, kx); text(g, '×', 0, 0, { size: V(140, 160), color: gold(), glow: 24, glowColor: 'rgba(255,140,40,.8)' }); g.restore(); }
  const ka = ease.out(prog(t, tP - 0.4, tP + 0.2)); if (ka > 0) { seg(g, [[E.W * 0.3, pb + V(90, 90)], [lerp(E.W * 0.3, E.W * 0.45, ka), lerp(pb + 90, pb + 220, ka)]], 4, gold()); seg(g, [[E.W * 0.7, pb + V(90, 90)], [lerp(E.W * 0.7, E.W * 0.55, ka), lerp(pb + 90, pb + 220, ka)]], 4, gold()); }
  const kc = ease.outBack(prog(t, tP - 0.1, tP + 0.5)), cbase = E.H * 0.86, glowK = ease.out(prog(t, tS, tS + 0.6));
  if (kc > 0) { glow(g, E.W / 2, cbase - V(320, 360), V(380, 420) * (0.6 + 0.4 * glowK), gold(), 0.25 * glowK); cornPlant(g, E.W / 2, cbase, V(560, 620) * kc, { seed: 13, color: mix(bp(), gold(), 0.6 * glowK), ...NEW, w: 12, leaves: 8, earGlow: glowK }); }
  g.restore();
  label(g, 'СИЛЬНІШЕ ЗА БАТЬКІВ', E.W / 2, E.H * V(0.1, 0.1), ease.out(prog(t, tS, tS + 0.4)), V(50, 58), gold());
} });

// s33 — the same cob
registerShot('s33', { draw(g, t, info) {
  macroBg(g, t); g.save(); push(g, t, info, 1.1, 1.0);
  cob(g, E.W / 2, E.H * 0.47, V(760, 1050), { tilt: -0.12 });
  g.restore();
  const tS = wt('самий', info, 1.5);
  label(g, 'ТОЙ САМИЙ КАЧАН', E.W / 2, E.H * V(0.1, 0.09), ease.out(prog(t, tS - 0.3, tS + 0.2)), V(56, 64), gold());
} });

// s34 — 1 m²: 3 plants then 9 plants; ×3
registerShot('s34', { draw(g, t, info) {
  const M = mood('golden'); backdrop(g, [shade(M.floor, -0.55), shade(M.dark, -0.5)]);
  g.save(); push(g, t, info, 1.0, 1.04);
  const tM = wt('метрі', info, 1.5), t3 = wt('втричі', info, 3.36), sz = V(420, 440), cy = E.H * 0.42;
  const a1 = ease.out(prog(t, 0.1, 0.5)), a2 = ease.out(prog(t, tM - 0.2, tM + 0.3));
  g.globalAlpha = a1; plot(g, E.W * 0.27, cy, sz, 3, { soil: shade(M.floor, -0.3), plant: mix(M.grass, '#7ad06a', 0.3), r: V(46, 48), label: 'ТОДІ · 1 м²', seed: 3 });
  g.globalAlpha = a2; plot(g, E.W * 0.73, cy, sz, 9, { reveal: ease.inOut(prog(t, tM, t3)), shuffle: true, soil: shade(M.floor, -0.3), plant: mix(M.grass, '#7ad06a', 0.3), r: V(46, 48), label: 'ЗАРАЗ · 1 м²', seed: 4 });
  g.globalAlpha = 1; g.restore();
  const k = ease.outBack(prog(t, t3 - 0.1, t3 + 0.3)); if (k > 0) { g.save(); g.translate(E.W / 2, E.H * 0.65); g.scale(k, k); text(g, '≈ ×3', 0, 0, { size: V(150, 170), color: gold(), glow: 36, glowColor: 'rgba(255,140,40,.85)', spacing: 4 }); g.restore(); }
  FX.dust(g, t, { count: 30, color: '#ffe2bd', a: 0.25 });
} });

// s35 — the rest: fertiliser, machinery, care
registerShot('s35', { draw(g, t, info) {
  const cam = { z: lerp(1.1, 1.15, t / info.dur), x: lerp(30, -30, t / info.dur) };
  const { GY, M, plant } = field(g, t, cam, { mood: 'dusk' });
  layer(g, cam, 1, (g) => { tractor(g, lerp(-E.W * 0.3, E.W * 0.85, t / info.dur), GY + V(90, 120), V(1.0, 1.2), t, shade(M.dark, -0.6), M.practical); });
  layer(g, cam, 1.5, (g) => { for (let i = 0; i < 3; i++) cornPlant(g, -E.W * 0.05 + i * E.W * 0.55, E.H + 80, V(800, 900), { sway: Math.sin(t + i) * 10, seed: 900 + i, color: shade(plant, -0.5), rim: M.rim, ...NEW, w: 18 }); });
  const items = [['добрива', 'ДОБРИВА', 1.4], ['техніка', 'ТЕХНІКА', 2.0], ['догляд', 'ДОГЛЯД', 3.6]];
  items.forEach(([w, s, fb], i) => { const tw = wt(w, info, fb), k = ease.outBack(prog(t, tw - 0.15, tw + 0.25)); if (k <= 0) return; g.save(); g.translate(E.W / 2, E.H * (0.1 + i * 0.07)); g.scale(k, k); text(g, '+ ' + s, 0, 0, { size: V(56, 64), color: gold(), font: FONTS.ui, weight: 900, glow: 16, glowColor: 'rgba(255,140,40,.7)', spacing: 3 }); g.restore(); });
  FX.dust(g, t, { count: 50, color: '#ffd9b0', a: 0.4 });
} });

// s36 — a car drives past the field
registerShot('s36', { draw(g, t, info) {
  const u = t / info.dur, cam = { z: 1.12, x: lerp(-40, 40, u), y: V(-30, -60) };
  const { GY, M, plant } = field(g, t, cam, { mood: 'golden', grow: 1.15 });
  const cx = lerp(-E.W * 0.4, E.W * 0.55, ease.out(prog(t, 0, info.dur)));
  layer(g, cam, 0.95, (g) => { g.fillStyle = shade(M.road || M.dark, -0.2); g.fillRect(-E.W, GY + V(120, -60), E.W * 3, V(140, 150)); for (let x = -E.W; x < E.W * 2; x += 160) seg(g, [[x, GY + V(190, 15)], [x + 80, GY + V(190, 15)]], 5, alpha('#f4efe6', 0.5)); });
  layer(g, cam, 1, (g) => car(g, cx, GY + V(220, 55), V(1.0, 1.15), t, shade(M.dark, -0.6), M.practical));
  layer(g, cam, 1.6, (g) => cornPlant(g, E.W + 20, E.H + 120, E.H * 0.9, { sway: Math.sin(t) * 10, seed: 950, color: shade(plant, -0.55), rim: M.rim, ...NEW, w: 20 }));
  FX.dust(g, t, { count: 50, color: '#ffe2bd', a: 0.4 }); FX.lensStreak(g, E.W * 0.3, E.H * 0.3, E.W * 1.6, '#ffe0b0', 0.2);
} });

// s37 — giant face: awe
registerShot('s37', { draw(g, t, info) {
  const M = mood('golden'); blurLayer(g, 14, (g) => field(g, t, { z: 1.5, y: -150 }, { mood: 'golden', grow: 1.2 })); veil(g, '#0a0806', 0.3);
  const tP = wt('просто', info, 1.5);
  bigFace(g, E.W / 2, E.H * V(0.6, 0.55), V(300, 340) * (1 + 0.03 * t), { outfit: FARMER, expr: t < 0.8 ? 'surprised' : t < tP ? 'awe' : 'smile', look: [-0.4, -0.3], blink: (t % 2.7) > 2.6, rimColor: M.rim, rimSide: 1 });
  FX.dust(g, t, { count: 40, color: '#ffe2bd', a: 0.4 });
} });

// s38 — 3D: dense golden corn field orbit + title
registerShot('s38', { kind: '3d',
  init(T) {
    const { THREE } = T, M = mood('golden');
    const st = T.stage({ mood: 'golden', fov: V(40, 58), fog: [14, 60], fogColor: M.sky[M.sky.length - 1], keyPos: [-10, 9, 8], keyIntensity: 3.2, ambient: 2.0 });
    st.add(T.ground(140, 140, shade(M.floor, 0.05)));
    const N = 46, step = 0.75, R = rng(21), count = N * N;
    const stalkGeo = new THREE.CylinderGeometry(0.025, 0.04, 1, 5), leafGeo = new THREE.ConeGeometry(0.14, 1, 3);
    const stalks = new THREE.InstancedMesh(stalkGeo, T.mat(shade(M.grass, -0.1), { flat: true }), count);
    const leaves = new THREE.InstancedMesh(leafGeo, T.mat(mix(M.grass, '#b8d070', 0.2), { flat: true }), count * 6);
    const tassels = new THREE.InstancedMesh(new THREE.ConeGeometry(0.05, 0.3, 4), T.mat(mix(M.grass, '#c9a860', 0.5), { flat: true }), count);
    const m = new THREE.Object3D(); let li = 0;
    for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
      const k = i * N + j, x = (i - N / 2) * step + (R() - 0.5) * 0.15, z = (j - N / 2) * step * 0.6 + (R() - 0.5) * 0.1, h = 2.2 + R() * 0.5;
      m.position.set(x, h / 2, z); m.rotation.set(0, 0, 0); m.scale.set(1, h, 1); m.updateMatrix(); stalks.setMatrixAt(k, m.matrix);
      m.position.set(x, h + 0.12, z); m.scale.set(1, 1, 1); m.updateMatrix(); tassels.setMatrixAt(k, m.matrix);
      for (let l = 0; l < 6; l++) { const yy = h * (0.25 + l * 0.11), a = l * 2.4 + R(), len = 0.9 - l * 0.08; m.position.set(x + Math.cos(a) * len * 0.3, yy + len * 0.38, z + Math.sin(a) * len * 0.3); m.rotation.set(Math.sin(a) * 0.6, 0, -Math.cos(a) * 0.6); m.scale.set(1, len, 0.22); m.updateMatrix(); leaves.setMatrixAt(li++, m.matrix); }
    }
    for (const im of [stalks, leaves, tassels]) { im.castShadow = false; im.receiveShadow = true; im.instanceMatrix.needsUpdate = true; st.add(im); }
    const sun = T.sphere(2.2, T.basic('#fff1d0'), -40, 9, -60); st.add(sun);
    return { stage: st };
  },
  draw(s, t, info, T) { T.dolly(s.stage.camera, t, [[0, { pos: [-5, 4.6, 12], look: [0, 1.8, -6] }], [info.dur, { pos: [4, 5.6, 8], look: [0, 1.4, -8] }]]); },
  overlay(g, t, info) {
    const tS = wt('селекції', info, 1.2);
    UI.titleCard(g, t - tS + 0.6, { lines: ['СТО РОКІВ', 'СЕЛЕКЦІЇ'], dur: info.dur - tS + 0.6, y: E.H * V(0.4, 0.3) });
    FX.dust(g, t, { count: 40, color: '#ffe2bd', a: 0.35 });
  } });

// s39 — end screen
registerShot('s39', { draw(g, t, info) {
  const ui = S().ui, M = mood('golden');
  g.fillStyle = linGrad(g, 0, 0, 0, E.H, [shade(M.sky[0], -0.4), shade(M.wall, -0.3), shade(M.grass, -0.6)]); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
  glow(g, E.W / 2, E.H * 0.9, E.W * 0.5, M.key, 0.25); FX.dust(g, t, { count: 40, color: '#ffe2bd', a: 0.3 });
  const a1 = ease.out(prog(t, 0.2, 0.8)), qy = V(150, 360);
  text(g, 'Скільки рослин', E.W / 2, qy - V(0, 50), { size: V(64, 72), font: FONTS.serif, weight: 900, italic: true, color: ui.cream, alpha: a1, glow: 18, glowColor: 'rgba(255,170,90,.5)' });
  text(g, 'на гектар у вас?', E.W / 2, qy + V(70, 50), { size: V(64, 72), font: FONTS.serif, weight: 900, italic: true, color: ui.gold, alpha: a1, glow: 18, glowColor: 'rgba(255,170,90,.5)' });
  text(g, 'Напишіть у коментарях', E.W / 2, qy + V(150, 150), { size: V(30, 34), color: alpha(ui.cream, 0.75), font: FONTS.ui, weight: 800, alpha: ease.out(prog(t, 0.5, 1.0)) });
  const by = V(380, 680);
  UI.bubble(g, E.W / 2 - V(260, 210), by, { w: V(110, 130), h: V(60, 70) });
  const sp = ease.outBack(prog(t, 0.6, 1.1)); g.save(); g.translate(E.W / 2 + V(70, 70), by); g.scale(sp, sp);
  rr(g, -190, -40, 380, 80, 40); g.fillStyle = '#e0302a'; g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.moveTo(-150, -16); g.lineTo(-150, 16); g.lineTo(-122, 0); g.closePath(); g.fill();
  text(g, 'Підписатися', 22, 2, { size: 36, color: '#fff', font: FONTS.ui, weight: 900 }); g.restore();
  const n = CAST.length, gap = V(200, 240), y0 = E.H - V(170, 520);
  cornPlant(g, E.W / 2 - gap * 1.5, y0 + 10, V(380, 460), { sway: Math.sin(t) * 8, seed: 4, color: shade(M.grass, -0.55), rim: M.rim, ...NEW });
  cornPlant(g, E.W / 2 + gap * 1.5, y0 + 10, V(400, 480), { sway: Math.sin(t + 1) * 8, seed: 6, color: shade(M.grass, -0.55), rim: M.rim, ...NEW });
  CAST.forEach((of, i) => { const k = ease.out(prog(t, 0.3 + i * 0.1, 0.7 + i * 0.1)); drawFigure(g, { x: E.W / 2 + (i - (n - 1) / 2) * gap, y: y0 + (1 - k) * 40, s: V(1.0, 1.15), facing: 1, outfit: of, pose: breathe(i ? POSES.wave : POSES.relaxed, t, 1, i), expr: 'smile', alpha: k, blink: (t % (2.9 + i * 0.3)) > 2.8 + i * 0.3, rim: { color: M.rim, dir: [0, -1] } }); });
} });
