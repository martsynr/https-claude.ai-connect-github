// shots/01_field.js — the field: night hook, growth, wheat vs corn, the C4 title, the price, cold, the patient farmer, end screen.
import { E, V, S, registerShot, mood, layer, blurLayer, veil, backdrop, ease, prog, key, clamp, lerp, shake, wordTime, seg, circle, ring, rr, poly, glow, alpha, shade, mix, linGrad, text, FONTS } from '/engine/core.js';
import { drawFigure, POSES, posesAt, breathe, bigFace } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { field, fieldGround, cornPlant, wheatPatch, thermometer } from '../sets/corn.js';
import { FARMER, CAST } from '../cast.js';

export const wt = (w, info, fb) => (wordTime(w, info.shot.start) ?? info.shot.start + fb) - info.shot.start;
const LISTEN = { ...POSES.stand, eF: [-4, -176], hF: [8, -200] };                         // hand cupped to the ear
const S1 = () => V(1.3, 1.9);
function fireflies(g, t, n = 24, seed = 3) { for (let i = 0; i < n; i++) { const x = (i * 263 + seed * 97) % E.W + Math.sin(t * 0.7 + i) * 40, y = E.H * 0.35 + ((i * 151) % (E.H * 0.4)) + Math.cos(t * 0.6 + i * 2) * 30, a = 0.4 + 0.6 * Math.abs(Math.sin(t * 2 + i)); glow(g, x, y, 22, '#e8ff9a', 0.5 * a); circle(g, x, y, 2.5, alpha('#f6ffd0', a)); } }

// s01 — night field, moon, fireflies
registerShot('s01', { draw(g, t, info) {
  const u = ease.inOut(t / info.dur), cam = { z: lerp(1.0, 1.08, u), y: lerp(-40, 0, u) };
  const { GY, M, plant } = field(g, t, cam, { mood: 'night' });
  layer(g, cam, 1, (g) => { cornPlant(g, E.W * 0.12, GY + 120, V(900, 1100), { sway: Math.sin(t) * 12, seed: 5, color: shade(plant, -0.2), rim: M.rim }); cornPlant(g, E.W * 0.9, GY + 160, V(950, 1150), { sway: Math.sin(t + 1) * 14, seed: 8, color: shade(plant, -0.2), rim: M.rim }); });
  fireflies(g, t);
} });

// s02 — FARMER listening among the stalks; stalks inch up
registerShot('s02', { draw(g, t, info) {
  const cam = { z: lerp(1.2, 1.28, ease.inOut(t / info.dur)), y: 0 };
  const { GY, M, plant } = field(g, t, cam, { mood: 'night', grow: 1 + 0.04 * t });
  const tL = wt('почути', info, 1.4), s = S1();
  layer(g, cam, 1, (g) => {
    cornPlant(g, E.W / 2 - V(260, 250), GY + 10, V(620, 640) * (1 + 0.03 * t), { sway: Math.sin(t) * 10, seed: 3, color: plant, rim: M.rim });
    drawFigure(g, { x: E.W / 2 + V(40, 30), y: GY, s, facing: -1, outfit: FARMER, pose: breathe(posesAt(t, [[0, POSES.stand], [tL - 0.3, LISTEN]]), t), expr: t > tL ? 'awe' : 'neutral', look: [-0.7, -0.4], rim: { color: M.rim, dir: [0.6, -0.8] } });
    if (t > tL) FX.rings(g, E.W / 2 + V(40, 30) - 12 * s, GY - 205 * s, t - tL, { count: 3, r0: 20, r1: 140, speed: 0.9, color: '#e8ff9a', a: 0.5 });
    cornPlant(g, E.W / 2 + V(330, 300), GY + 30, V(660, 700) * (1 + 0.03 * t), { sway: Math.sin(t + 2) * 10, seed: 9, color: plant, rim: M.rim });
  });
  fireflies(g, t, 18, 7);
} });

// s03 — giant face, smirk: just a saying
registerShot('s03', { draw(g, t) {
  const M = mood('night'); blurLayer(g, 14, (g) => field(g, t, { z: 1.6, y: -200 }, { mood: 'night' })); veil(g, '#060a14', 0.35);
  bigFace(g, E.W / 2, E.H * V(0.6, 0.52), V(300, 330) * (1 + 0.03 * t), { outfit: FARMER, expr: t > 0.4 ? 'smirk' : 'smile', look: [0.3, 0], blink: (t % 2.9) > 2.8, rimColor: M.rim, rimSide: -1 });
  fireflies(g, t, 10, 2);
} });

// s04 — golden day: a measuring pole beside a growing stalk
registerShot('s04', { draw(g, t, info) {
  const cam = { z: lerp(1.05, 1.12, ease.inOut(t / info.dur)), y: V(-80, -180) };
  const { GY, M, plant } = field(g, t, cam, { mood: 'golden' });
  const tCm = wt('сантиметрів', info, 3.8), grow = ease.inOut(prog(t, 0.6, info.dur)), h = V(560, 620) + grow * 70;
  layer(g, cam, 1, (g) => {
    const x = E.W / 2 - V(40, 30); cornPlant(g, x, GY + 10, h, { sway: Math.sin(t) * 8, seed: 4, color: plant, rim: M.rim, leaves: 8 });
    const px = x + V(200, 180), top = GY + 10 - V(700, 760); rr(g, px - 14, top, 28, GY + 10 - top, 6); g.fillStyle = '#e8d6b0'; g.fill();
    for (let k = 0; k <= 14; k++) { const y = GY + 10 - k * (GY + 10 - top) / 14; seg(g, [[px - 14, y], [px + (k % 2 ? 0 : 8), y]], 3, '#5a4630'); }
    seg(g, [[x + 6, GY + 10 - h], [px - 18, GY + 10 - h]], 3, alpha(S().ui.gold, 0.9));
    UI.dimension(g, t, { x1: px + 50, y1: GY + 10 - h + grow * 70, x2: px + 50, y2: GY + 10 - h, str: '+ см', start: tCm - 0.2 });
  });
  UI.readout(g, { label: 'ЗА ДОБУ', value: '+ кілька см', x: E.W / 2, y: E.H * V(0.16, 0.14), align: 'center', a: ease.out(prog(t, tCm - 0.1, tCm + 0.3)) });
  FX.dust(g, t, { count: 40, color: '#ffe2bd', a: 0.35 });
} });

// s05 — wheat in front, tall corn behind; FARMER shrugs
registerShot('s05', { draw(g, t, info) {
  const cam = { z: lerp(1.0, 1.05, t / info.dur), x: lerp(30, -30, t / info.dur), y: 0 };
  const { GY, M, plant } = field(g, t, cam, { mood: 'golden', wheat: 1 });
  layer(g, cam, 1, (g) => {
    wheatPatch(g, t, { x0: -E.W, x1: E.W * 2, y: GY + V(230, 230), h: V(230, 270), color: mix(M.key, M.floor, 0.3), seed: 2 });
    drawFigure(g, { x: E.W / 2, y: GY + V(260, 150), s: S1(), facing: 1, outfit: FARMER, pose: breathe(posesAt(t, [[0, POSES.stand], [1.6, POSES.shrug]]), t), expr: t > 1.6 ? 'confused' : 'thinking', rim: { color: M.rim, dir: [-0.6, -0.8] } });
  });
  FX.dust(g, t, { count: 30, color: '#ffe2bd', a: 0.3 });
} });

// s06 — "Чому?"
registerShot('s06', { draw(g, t, info) {
  blurLayer(g, 12, (g) => field(g, t, { z: 1.2 + 0.05 * t }, { mood: 'golden' })); veil(g, '#08100a', 0.45);
  const a = ease.outBack(prog(t, 0.05, 0.4)), sc = 0.8 + 0.2 * a;
  g.save(); g.translate(E.W / 2, E.H * 0.42); g.scale(sc, sc); text(g, 'ЧОМУ?', 0, 0, { size: V(180, 200), color: S().ui.gold, glow: 40, glowColor: 'rgba(255,140,40,.85)', alpha: clamp(a), spacing: 6 }); g.restore();
} });

// s09 — low-angle hero corn against the sun
registerShot('s09', { draw(g, t, info) {
  const M = mood('golden'), cam = { z: lerp(1.0, 1.06, t / info.dur), r: 0.02 }; const GY = fieldGround();
  layer(g, cam, 0.1, (g) => { backdrop(g, M.sky); FX.sun(g, E.W * 0.38, E.H * 0.42, 80, '#fff6e0', M.key, 6); FX.godRays(g, E.W * 0.38, E.H * 0.42, { count: 14, angle: Math.PI / 2, spread: Math.PI * 2, len: 1600, a: 0.08, t }); });
  layer(g, cam, 1, (g) => { const c = shade(M.grass, -0.65); cornPlant(g, E.W * 0.55, E.H + 200, E.H * 1.05, { sway: Math.sin(t) * 18, seed: 12, color: c, rim: M.rim, leaves: 9, w: 26 }); cornPlant(g, E.W * 0.08, E.H + 200, E.H * 0.8, { sway: Math.sin(t + 1) * 14, seed: 13, color: shade(c, -0.2), rim: M.rim, w: 20 }); });
  FX.lensStreak(g, E.W * 0.38, E.H * 0.42, E.W * 1.6, '#ffe0b0', 0.3); FX.dust(g, t, { count: 50, color: '#ffe2bd', a: 0.45 });
} });

// s12 — FARMER holds up a leaf and leans in; camera dives
registerShot('s12', { draw(g, t, info) {
  const tIn = wt('всередину', info, 3.7), dive = ease.in(prog(t, tIn - 0.2, info.dur));
  const cam = { z: lerp(1.25, 1.35, ease.inOut(prog(t, 0, tIn))) + dive * 1.8, x: dive * V(140, 120), y: -dive * 120 };
  const { GY, M, plant } = field(g, t, cam, { mood: 'golden' });
  const s = S1(), x = E.W / 2 - V(100, 90);
  const hold = { ...POSES.stand, eF: [24, -160], hF: [52, -196], eB: [-6, -138], hB: [-8, -100] };
  layer(g, cam, 1, (g) => {
    drawFigure(g, { x, y: GY, s, facing: 1, outfit: FARMER, pose: breathe(posesAt(t, [[0, POSES.relaxed], [0.8, hold]]), t), expr: 'awe', look: [0.8, -0.6], blink: (t % 3.1) > 3.0, rim: { color: M.rim, dir: [-0.6, -0.8] } });
    const k = ease.out(prog(t, 0.6, 1.3)), hx = x + 52 * s, hy = GY - 196 * s;
    g.save(); g.globalAlpha *= k; g.translate(hx, hy); g.rotate(-0.5); g.fillStyle = mix(plant, '#7fd06a', 0.35); g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(110, -90, 260, -40); g.quadraticCurveTo(120, -20, 0, 14); g.fill();
    seg(g, [[0, 6], [250, -38]], 3, alpha('#d8ffb0', 0.6)); glow(g, 140, -40, 160, '#c6ff3d', 0.2 + 0.4 * dive); g.restore();
  });
  FX.dust(g, t, { count: 40, color: '#ffe2bd', a: 0.35 });
} });

// s20 — FLASH. heroic corn in golden light
registerShot('s20', { draw(g, t, info) {
  const cam = { z: lerp(1.0, 1.08, ease.out(t / info.dur)), y: V(-60, -120) };
  const { GY, M, plant } = field(g, t, cam, { mood: 'golden', grow: 1.15 });
  layer(g, cam, 1, (g) => { for (const [x, h, sd] of [[0.15, 1.0, 1], [0.5, 1.12, 2], [0.85, 0.95, 3]]) cornPlant(g, E.W * x, GY + 80, V(700, 900) * h, { sway: Math.sin(t * 1.3 + sd) * 16, seed: sd * 7, color: shade(plant, -0.1), rim: M.rim, leaves: 9, w: 16 }); });
  FX.sparkle(g, E.W * 0.5, GY + 80 - V(700, 1008), 40, S().ui.gold, 0.6 + 0.4 * Math.sin(t * 6)); FX.dust(g, t, { count: 50, color: '#ffe2bd', a: 0.45 });
} });

// s25 — big "C4" title over the field
registerShot('s25', { draw(g, t, info) {
  blurLayer(g, 8, (g) => field(g, t, { z: 1.1 + 0.03 * t, y: -60 }, { mood: 'golden' })); veil(g, '#06100a', 0.4);
  const tC = wt('це-чотири', info, 1.1);
  UI.titleCard(g, t, { lines: ['ЗВІДСИ НАЗВА', 'С4'], sub: 'РОСЛИНИ', dur: info.dur, y: E.H * 0.4 });
  if (t > tC) FX.rings(g, E.W / 2, E.H * 0.4, t - tC, { count: 3, r0: 100, r1: 560, speed: 0.8, color: S().ui.gold, a: 0.4 });
} });

// s36 — dusk wind: the price
registerShot('s36', { draw(g, t, info) {
  const cam = { z: lerp(1.2, 1.28, t / info.dur), y: 0, r: -0.01 };
  const { GY, M, plant } = field(g, t, cam, { mood: 'dusk' });
  layer(g, cam, 1, (g) => drawFigure(g, { x: E.W / 2, y: GY + 20, s: S1(), facing: -1, outfit: FARMER, pose: breathe(POSES.crossArms, t), expr: 'worried', look: [-0.2, -0.9], rim: { color: M.rim, dir: [0.7, -0.7] } }));
  FX.dust(g, t, { count: 50, color: '#ffd9b0', a: 0.35 });
} });

// s38 — hot sunny field: corn shoots up fast
registerShot('s38', { draw(g, t, info) {
  const grow = ease.inOut(prog(t, 0.2, info.dur)), cam = { z: 1.02, y: V(-60, -140) - grow * 60 };
  const { GY, M, plant } = field(g, t, cam, { mood: 'golden', grow: 0.6 + 0.5 * grow });
  layer(g, cam, 1, (g) => { for (let i = 0; i < 5; i++) cornPlant(g, E.W * (0.1 + i * 0.2), GY + 60 + (i % 2) * 40, V(260, 300) + grow * V(520, 640), { sway: Math.sin(t * 1.5 + i) * 10, seed: 30 + i, color: plant, rim: M.rim, leaves: 8 }); });
  g.save(); g.globalCompositeOperation = 'soft-light'; g.fillStyle = 'rgba(255,140,40,.1)'; g.fillRect(0, 0, E.W, E.H); g.restore();
  FX.speedLines(g, t, { cx: E.W / 2, cy: E.H * 0.2, count: 30, a: 0.12 }); FX.dust(g, t, { count: 40, color: '#fff2c8', a: 0.4 });
} });

// shared cold field: young sprouts, frost, snow
function coldField(g, t, cam) {
  const { GY, M, plant } = field(g, t, cam, { mood: 'storm', grow: 0.25 });
  layer(g, cam, 0.95, (g) => { g.fillStyle = alpha('#dfe8ff', 0.18); g.fillRect(-E.W, GY - 6, E.W * 3, 40); });
  return { GY, M, plant };
}
function sprout(g, x, y, s, t, shiver, M) {
  const dx = Math.sin(t * 40) * 3 * shiver; g.save(); g.translate(x + dx, y); g.scale(s, s);
  seg(g, [[0, 0], [0, -70]], 6, '#3f7a3a'); g.fillStyle = '#4f9a48'; g.beginPath(); g.moveTo(0, -50); g.quadraticCurveTo(-40, -90, -70, -60); g.quadraticCurveTo(-30, -60, 0, -44); g.fill(); g.beginPath(); g.moveTo(0, -64); g.quadraticCurveTo(40, -110, 66, -86); g.quadraticCurveTo(30, -80, 0, -58); g.fill();
  seg(g, [[-60, -62], [-30, -60]], 3, alpha('#e8f2ff', 0.8)); seg(g, [[60, -86], [30, -80]], 3, alpha('#e8f2ff', 0.8)); g.restore();
}

// s39 — cold blue night, frost and snow
registerShot('s39', { draw(g, t, info) {
  const cam = { z: lerp(1.05, 1.12, t / info.dur), y: V(-40, -100) };
  const { GY, M } = coldField(g, t, cam);
  layer(g, cam, 1, (g) => { for (let i = 0; i < 7; i++) sprout(g, E.W * (0.05 + i * 0.15), GY + 50 + (i % 2) * 60, V(1.2, 1.4), t + i, 1, M); });
  FX.snow(g, t, { count: 160, speed: 70 }); FX.fog(g, GY - 100, 300, '#9fb4e8', 0.25);
} });

// s40 — FARMER crouches by shivering sprouts; clock
registerShot('s40', { draw(g, t, info) {
  const cam = { z: lerp(1.25, 1.3, t / info.dur), y: 0 };
  const { GY, M } = coldField(g, t, cam);
  layer(g, cam, 1, (g) => {
    drawFigure(g, { x: E.W / 2 - V(140, 150), y: GY + 40, s: S1(), facing: 1, outfit: FARMER, pose: breathe(POSES.crouch, t), expr: 'sad', look: [0.7, 0.6], rim: { color: M.rim, dir: [0.4, -1] } });
    for (let i = 0; i < 3; i++) sprout(g, E.W / 2 + V(80, 70) + i * V(130, 120), GY + 60, V(1.4, 1.5), t + i, 1, M);
  });
  FX.clock(g, E.W - V(140, 160), E.H * V(0.16, 0.14), V(60, 70), t * 4);
  FX.snow(g, t, { count: 120, speed: 60 });
} });

// s41 — dawn: FARMER on a seed sack, arms crossed, patient
registerShot('s41', { draw(g, t, info) {
  const cam = { z: lerp(1.2, 1.25, t / info.dur), y: 0 };
  const { GY, M } = field(g, t, cam, { mood: 'dusk', grow: 0 });
  layer(g, cam, 1, (g) => {
    const x = E.W / 2, s = S1();
    g.fillStyle = '#c9b48a'; rr(g, x - 70 * s, GY - 80 * s, 140 * s, 84 * s, 22 * s); g.fill(); g.fillStyle = 'rgba(0,0,0,.2)'; g.fillRect(x - 70 * s, GY - 40 * s, 140 * s, 8 * s);
    text(g, 'НАСІННЯ', x, GY - 30 * s, { size: 20 * s, color: '#5a4630', font: FONTS.ui, weight: 900 });
    drawFigure(g, { x: x - 10, y: GY - 70 * s, s, facing: 1, outfit: FARMER, pose: breathe({ ...POSES.sit, eF: [14, -150], hF: [-14, -140], eB: [-12, -150], hB: [16, -142] }, t), expr: 'smirk', look: [0.6, 0], blink: (t % 3.2) > 3.1, rim: { color: M.rim, dir: [-0.6, -0.8] }, shadow: false });
  });
  FX.dust(g, t, { count: 40, color: '#ffd9b0', a: 0.35 });
} });

// s42 — soil thermometer rises to +10°, a sprout pops
registerShot('s42', { draw(g, t, info) {
  const t10 = wt('десяти', info, 3.07), val = lerp(3, 10, ease.inOut(prog(t, 0.3, t10))) + 1.2 * ease.out(prog(t, t10, info.dur));
  const cam = { z: lerp(1.3, 1.36, t / info.dur), y: 0 };
  const { GY, M } = field(g, t, cam, { mood: 'golden', grow: 0 });
  layer(g, cam, 1, (g) => {
    g.fillStyle = shade(M.floor, -0.35); g.fillRect(-E.W, GY + 40, E.W * 3, E.H);
    thermometer(g, E.W / 2 - V(120, 140), GY - V(20, 60), V(480, 520), val);
    const pop = ease.outBack(prog(t, t10, t10 + 0.5));
    if (pop > 0) { g.save(); g.translate(E.W / 2 + V(170, 170), GY + 40); g.scale(pop * 1.6, pop * 1.6); seg(g, [[0, 0], [0, -70]], 6, '#4f9a48'); g.fillStyle = '#6ac25e'; g.beginPath(); g.moveTo(0, -50); g.quadraticCurveTo(-40, -95, -72, -66); g.quadraticCurveTo(-30, -62, 0, -44); g.fill(); g.beginPath(); g.moveTo(0, -64); g.quadraticCurveTo(44, -112, 70, -88); g.quadraticCurveTo(30, -80, 0, -58); g.fill(); g.restore();
      FX.rings(g, E.W / 2 + V(170, 170), GY - 40, t - t10, { count: 2, r0: 30, r1: 200, speed: 1.4, color: S().ui.gold, a: 0.5 }); }
  });
  UI.readout(g, { value: '+10 °C', x: E.W / 2, y: E.H * V(0.16, 0.13), align: 'center', size: V(90, 110), a: ease.out(prog(t, t10 - 0.1, t10 + 0.3)) });
  FX.dust(g, t, { count: 30, color: '#ffe2bd', a: 0.3 });
} });

// s43 — end screen
registerShot('s43', { draw(g, t, info) {
  const ui = S().ui, M = mood('golden');
  g.fillStyle = linGrad(g, 0, 0, 0, E.H, [shade(M.sky[0], -0.4), shade(M.wall, -0.3), shade(M.grass, -0.6)]); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
  glow(g, E.W / 2, E.H * 0.9, E.W * 0.5, M.key, 0.25); FX.dust(g, t, { count: 40, color: '#ffe2bd', a: 0.3 });
  const a1 = ease.out(prog(t, 0.2, 0.8)), qy = V(150, 360);
  text(g, 'Коли ти сієш', E.W / 2, qy - V(0, 50), { size: V(64, 72), font: FONTS.serif, weight: 900, italic: true, color: ui.cream, alpha: a1, glow: 18, glowColor: 'rgba(255,170,90,.5)' });
  text(g, 'кукурудзу?', E.W / 2, qy + V(70, 50), { size: V(64, 72), font: FONTS.serif, weight: 900, italic: true, color: ui.gold, alpha: a1, glow: 18, glowColor: 'rgba(255,170,90,.5)' });
  text(g, 'Напиши регіон і дату в коментарях', E.W / 2, qy + V(150, 150), { size: V(30, 34), color: alpha(ui.cream, 0.75), font: FONTS.ui, weight: 800, alpha: ease.out(prog(t, 0.5, 1.0)) });
  const by = V(380, 680);
  UI.bubble(g, E.W / 2 - V(260, 210), by, { w: V(110, 130), h: V(60, 70) });
  const sp = ease.outBack(prog(t, 0.6, 1.1)); g.save(); g.translate(E.W / 2 + V(70, 70), by); g.scale(sp, sp);
  rr(g, -190, -40, 380, 80, 40); g.fillStyle = '#e0302a'; g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.moveTo(-150, -16); g.lineTo(-150, 16); g.lineTo(-122, 0); g.closePath(); g.fill();
  text(g, 'Підписатися', 22, 2, { size: 36, color: '#fff', font: FONTS.ui, weight: 900 }); g.restore();
  const n = CAST.length, gap = V(170, 200), y0 = E.H - V(170, 520), GY = y0;
  cornPlant(g, E.W / 2 - gap * 1.9, GY + 10, V(380, 460), { sway: Math.sin(t) * 8, seed: 4, color: shade(M.grass, -0.55), rim: M.rim });
  cornPlant(g, E.W / 2 + gap * 1.9, GY + 10, V(400, 480), { sway: Math.sin(t + 1) * 8, seed: 6, color: shade(M.grass, -0.55), rim: M.rim });
  CAST.forEach((of, i) => { const k = ease.out(prog(t, 0.3 + i * 0.1, 0.7 + i * 0.1)); drawFigure(g, { x: E.W / 2 + (i - (n - 1) / 2) * gap, y: y0 + (1 - k) * 40, s: V(1.0, 1.15), facing: 1, outfit: of, pose: breathe(i ? POSES.wave : POSES.relaxed, t, 1, i), expr: 'smile', alpha: k, blink: (t % (2.9 + i * 0.3)) > 2.8 + i * 0.3, rim: { color: M.rim, dir: [0, -1] } }); });
} });
