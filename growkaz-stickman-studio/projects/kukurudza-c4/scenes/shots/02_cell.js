// shots/02_cell.js — inside the leaf: RUBISCO catches CO2 (and sometimes O2), PEPC packs CO2 into C4 parcels.
import { E, V, S, registerShot, layer, blurLayer, veil, ease, prog, key, clamp, lerp, shake, seg, circle, rr, glow, alpha, text, FONTS } from '/engine/core.js';
import { drawFigure, POSES, posesAt, breathe, bigFace } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { cell, co2, o2, sugar, packet, molecules } from '../sets/corn.js';
import { RUBISCO, PEPC } from '../cast.js';
import { wt } from './01_field.js';

const S2 = () => V(1.45, 2.1);
const CATCH = { ...POSES.stand, eF: [26, -170], hF: [44, -206], eB: [-20, -166], hB: [-30, -200] };   // both hands up
const camF = (t, info, z0 = 1.0, z1 = 1.06) => ({ z: lerp(z0, z1, ease.inOut(t / info.dur)), y: 0 });

// a ball flying on an arc from (x0,y0) to (x1,y1) during [a,b]
function arc(t, a, b, x0, y0, x1, y1, h = 220) { const k = clamp((t - a) / (b - a)); return [lerp(x0, x1, k), lerp(y0, y1, k) - Math.sin(k * Math.PI) * h, k]; }

// s13 — inside a cell; RUBISCO introduced
registerShot('s13', { draw(g, t, info) {
  const cam = camF(t, info, 1.0, 1.1), { GY, tint } = cell(g, t, cam);
  layer(g, cam, 0.7, (g) => molecules(g, t, { count: 14, area: [0, E.H * 0.15, E.W, E.H * 0.4], red: 0.15, seed: 2 }));
  const tR = wt('рубіско', info, 3.5), x = E.W / 2, s = S2();
  layer(g, cam, 1, (g) => {
    drawFigure(g, { x, y: GY, s, facing: -1, outfit: RUBISCO, pose: breathe(posesAt(t, [[0, POSES.relaxed], [tR - 0.3, POSES.wave]]), t), expr: 'happy', blink: (t % 3.0) > 2.9, rim: { color: tint, dir: [0.6, -0.8] } });
    UI.callout(g, t, { at: [x, GY - 240 * s], to: [x + V(160, 170), GY - 240 * s - V(160, 240)], str: 'РУБІСКО', start: tR - 0.1, color: S().ui.gold });
  });
  FX.dust(g, t, { count: 30, color: '#d8ffd0', a: 0.3 });
} });

// s14 — RUBISCO catches CO2 and stacks sugar cubes
registerShot('s14', { draw(g, t, info) {
  const cam = camF(t, info), { GY, tint } = cell(g, t, cam), s = S2(), x = E.W / 2 - V(80, 90), hy = GY - 206 * s;
  const tSug = wt('цукор', info, 4.9), cubes = Math.floor(clamp((t - 0.8) / 0.9, 0, 6));
  layer(g, cam, 1, (g) => {
    const ph = (t % 0.9) / 0.9, catching = ph > 0.75;
    drawFigure(g, { x, y: GY, s, facing: -1, outfit: RUBISCO, pose: breathe(catching ? CATCH : posesAt(ph * 0.9, [[0, POSES.ready], [0.5, CATCH]]), t), expr: 'determined', rim: { color: tint, dir: [0.6, -0.8] } });
    const [bx, by] = arc(ph, 0, 0.75, -60, hy - 300, x - 40 * s, hy, 160); if (ph < 0.75) co2(g, bx, by, 24);
    for (let i = 0; i < cubes; i++) sugar(g, x + V(240, 230) + (i % 3) * 66, GY - 30 - Math.floor(i / 3) * 62, 56);
    if (t > tSug) FX.rings(g, x + V(300, 290), GY - 90, t - tSug, { count: 2, r0: 30, r1: 200, speed: 1.2, color: S().ui.gold, a: 0.5 });
  });
  UI.readout(g, { label: 'CO2 →', value: 'ЦУКОР', x: E.W / 2, y: E.H * V(0.16, 0.14), align: 'center', a: ease.out(prog(t, tSug - 0.1, tSug + 0.3)) });
} });

// s15 — giant face: RUBISCO confused
registerShot('s15', { draw(g, t, info) {
  blurLayer(g, 14, (g) => cell(g, t, { z: 1.5, y: -200 })); veil(g, '#04100a', 0.35);
  const tP = wt('плутає', info, 2.9);
  bigFace(g, E.W / 2, E.H * V(0.6, 0.52), V(300, 330) * (1 + 0.03 * t), { outfit: { ...RUBISCO, head: 'none' }, expr: t > tP ? 'confused' : 'neutral', look: [Math.sin(t * 3) * 0.6, -0.2], tilt: t > tP ? 0.08 : 0, blink: (t % 2.7) > 2.6, rimColor: S().ui.blueprint, rimSide: 1 });
  if (t > tP) { text(g, '?', E.W / 2 + V(260, 280), E.H * V(0.3, 0.28), { size: 160, color: S().ui.gold, glow: 20, glowColor: alpha(S().ui.gold, 0.6), alpha: ease.out(prog(t, tP, tP + 0.3)) }); }
} });

// s16 — RUBISCO grabs a red O2 by mistake
registerShot('s16', { draw(g, t, info) {
  const cam = camF(t, info, 1.05, 1.12), { GY, tint } = cell(g, t, cam), s = S2(), x = E.W / 2, hy = GY - 206 * s;
  const tO = wt('кисень', info, 4.3);
  layer(g, cam, 1, (g) => {
    const got = t > tO;
    drawFigure(g, { x, y: GY, s, facing: -1, outfit: RUBISCO, pose: breathe(posesAt(t, [[0, POSES.ready], [tO - 0.4, CATCH], [tO + 0.6, POSES.handsOnHead]]), t), expr: got ? 'shocked' : 'determined', rim: { color: got ? '#ff5a4a' : tint, dir: [0.6, -0.8] } });
    co2(g, -40 + ((t * 300) % (E.W + 200)), hy - 360, 22, 0.8);
    const [bx, by] = arc(t, tO - 1.1, tO, E.W + 60, hy - 380, x - 40 * s, hy, 140);
    o2(g, got ? x - 40 * s : bx, got ? hy : by, 28);
    if (got) { FX.rings(g, x - 40 * s, hy, t - tO, { count: 3, r0: 30, r1: 260, speed: 1.5, color: '#ff5a4a', a: 0.7 * (1 - prog(t, tO, tO + 1.2)) }); }
  });
  if (t > tO) { g.save(); g.globalCompositeOperation = 'soft-light'; g.fillStyle = `rgba(255,40,30,${0.35 * Math.abs(Math.sin((t - tO) * 6))})`; g.fillRect(0, 0, E.W, E.H); g.restore();
    UI.badge(g, { str: 'O2 !', color: '#ff6b5a', a: ease.out(prog(t, tO, tO + 0.3)) }); }
} });

// s17 — energy battery drains; RUBISCO facepalms
function battery(g, x, y, w, h, level, col) {
  rr(g, x - w / 2, y - h / 2, w, h, 16); g.strokeStyle = alpha('#e8f0ff', 0.85); g.lineWidth = 6; g.stroke(); rr(g, x + w / 2 + 4, y - h * 0.18, 16, h * 0.36, 6); g.fillStyle = alpha('#e8f0ff', 0.85); g.fill();
  const iw = (w - 24) * clamp(level); rr(g, x - w / 2 + 12, y - h / 2 + 12, Math.max(10, iw), h - 24, 10); g.fillStyle = col; g.fill(); glow(g, x - w / 2 + 12 + iw, y, h, col, 0.35);
}
export { battery };
registerShot('s17', { draw(g, t, info) {
  const cam = camF(t, info), { GY, tint } = cell(g, t, cam), s = S2();
  const tE = wt('енергію', info, 1.6), lvl = 1 - 0.7 * ease.inOut(prog(t, tE - 0.2, info.dur - 0.3));
  layer(g, cam, 1, (g) => drawFigure(g, { x: E.W / 2, y: GY, s, facing: -1, outfit: RUBISCO, pose: breathe(posesAt(t, [[0, POSES.stand], [0.5, POSES.facepalm]]), t), expr: 'sad', rim: { color: tint, dir: [0.6, -0.8] } }));
  battery(g, E.W / 2, E.H * V(0.18, 0.17), V(420, 460), V(150, 160), lvl, lvl > 0.5 ? S().ui.good : '#ff6b5a');
  text(g, 'ЕНЕРГІЯ', E.W / 2, E.H * V(0.18, 0.17) - V(120, 130), { size: V(36, 40), color: S().ui.cream, font: FONTS.ui, weight: 900, spacing: 3 });
} });

// s19 — hot cell: more mistakes
registerShot('s19', { draw(g, t, info) {
  const cam = camF(t, info, 1.05, 1.1), { GY } = cell(g, t, cam, { hot: true }), s = S2(), x = E.W / 2, hy = GY - 206 * s;
  layer(g, cam, 0.8, (g) => molecules(g, t * 1.6, { count: 26, area: [0, E.H * 0.12, E.W, E.H * 0.45], red: 0.6, seed: 8, speed: 50 }));
  layer(g, cam, 1, (g) => { const [sx] = shake(t, 4, 6); drawFigure(g, { x: x + sx, y: GY, s, facing: -1, outfit: RUBISCO, pose: breathe(posesAt(t % 1.2, [[0, CATCH], [0.6, POSES.handsOnHead]]), t), expr: 'nervous', rim: { color: '#ff7a3a', dir: [0.6, -0.8] } });
    for (let i = 0; i < 3; i++) { const k = ((t * 0.8 + i / 3) % 1); circle(g, x + 30 + i * 12, hy - 40 + k * 120, 7 * (1 - k), alpha('#bfe6ff', 1 - k)); } });
  for (let i = 0; i < 5; i++) { const y = E.H * (0.2 + i * 0.12) + Math.sin(t * 3 + i) * 10; g.strokeStyle = alpha('#ffb070', 0.15); g.lineWidth = 3; g.beginPath(); for (let x = 0; x <= E.W; x += 20) g.lineTo(x, y + Math.sin(x * 0.03 + t * 5 + i) * 8); g.stroke(); }
  UI.readout(g, { value: 'СПЕКА', x: E.W / 2, y: E.H * V(0.14, 0.12), align: 'center', color: '#ff7a3a', a: ease.out(prog(t, 0.2, 0.6)) });
} });

// s22 — PEPC in an outer cell: grey CO2 caught, red O2 bounces off
registerShot('s22', { draw(g, t, info) {
  const cam = camF(t, info), { GY, tint } = cell(g, t, cam), s = S2(), x = E.W / 2 - V(40, 60), hy = GY - 206 * s;
  const tN = wt('не', info, 1.8);
  layer(g, cam, 1, (g) => {
    drawFigure(g, { x, y: GY, s, facing: -1, outfit: PEPC, pose: breathe(posesAt(t, [[0, CATCH], [tN, POSES.crossArms]]), t), expr: t > tN ? 'smirk' : 'determined', blink: (t % 3.2) > 3.1, rim: { color: tint, dir: [0.6, -0.8] } });
    const [cx, cy, ck] = arc(t, 0, 1.1, -60, hy - 300, x - 40 * s, hy, 120); if (ck < 1) co2(g, cx, cy, 24); else co2(g, x - 40 * s, hy, 24, 1 - prog(t, 1.1, 1.5));
    const hit = tN; const o = t < hit ? arc(t, hit - 1.0, hit, E.W + 60, hy - 300, x + 40 * s, hy - 60, 100) : [x + 40 * s + (t - hit) * 520, hy - 60 - Math.sin(clamp((t - hit) * 2) * Math.PI) * 180 + (t - hit) * 80];
    o2(g, o[0], o[1], 26);
    if (t > hit && t < hit + 0.6) FX.rings(g, x + 40 * s, hy - 60, t - hit, { count: 2, r0: 20, r1: 120, speed: 2, color: '#ff6b5a', a: 0.6 });
  });
  UI.badge(g, { str: 'O2 — НІ', color: '#ff6b5a', a: ease.out(prog(t, tN, tN + 0.3)) });
} });

// s23 — PEPC packs CO2 into a blue C4 parcel
registerShot('s23', { draw(g, t, info) {
  const cam = camF(t, info), { GY, tint } = cell(g, t, cam), s = S2(), x = E.W / 2 - V(120, 140);
  const tP = wt('пакує', info, 3.1), ph = (t % 1.0);
  layer(g, cam, 1, (g) => {
    drawFigure(g, { x, y: GY, s, facing: 1, outfit: PEPC, pose: breathe(posesAt(ph, [[0, POSES.holdFront], [0.5, { ...POSES.holdFront, hF: [40, -150] }]]), t), expr: 'happy', rim: { color: tint, dir: [-0.6, -0.8] } });
    const tbx = x + V(260, 250), tby = GY - 120; rr(g, tbx - 110, tby, 220, 120, 14); g.fillStyle = alpha('#e8f0ff', 0.12); g.fill(); g.strokeStyle = alpha(tint, 0.6); g.lineWidth = 4; g.stroke();
    const n = Math.floor(clamp((t - tP + 0.4) / 0.5, 0, 6)); for (let i = 0; i < n; i++) packet(g, tbx - 66 + (i % 3) * 66, tby - 28 - Math.floor(i / 3) * 56, 54);
    if (t < tP) co2(g, x + 60 * s, GY - 150 * s + Math.sin(t * 4) * 6, 24); else packet(g, x + 60 * s, GY - 150 * s, 60, ease.out(prog(t, tP, tP + 0.3)));
  });
  FX.dust(g, t, { count: 30, color: '#d8ffd0', a: 0.3 });
} });

// s27 — inner cell: a parcel opens and CO2 bursts out
registerShot('s27', { draw(g, t, info) {
  const cam = camF(t, info, 1.0, 1.08), { GY, tint } = cell(g, t, cam), tO = wt('вивільняється', info, 1.76);
  const px = E.W / 2, py = E.H * V(0.42, 0.4), k = ease.out(prog(t, tO, tO + 0.8));
  layer(g, cam, 1, (g) => {
    if (t < tO) packet(g, lerp(-80, px, ease.out(prog(t, 0, tO - 0.2))), py, 110);
    else { for (let i = 0; i < 28; i++) { const a = i * 2.4, d = k * (120 + (i * 37) % 300); co2(g, px + Math.cos(a) * d, py + Math.sin(a) * d * 0.8, 22); } FX.rings(g, px, py, t - tO, { count: 3, r0: 40, r1: 520, speed: 1.0, color: S().ui.gold, a: 0.5 * (1 - prog(t, tO, tO + 1.5)) }); }
  });
  FX.dust(g, t, { count: 30, color: '#d8ffd0', a: 0.3 });
} });

// s28 — RUBISCO in a room packed with CO2, catching happily
registerShot('s28', { draw(g, t, info) {
  const cam = camF(t, info, 1.0, 1.08), { GY, tint } = cell(g, t, cam), s = S2(), tF = wt('переповненій', info, 2.8);
  const crowd = 18 + Math.floor(40 * ease.inOut(prog(t, 0.2, tF + 0.6)));
  layer(g, cam, 0.85, (g) => molecules(g, t, { count: crowd, area: [-60, E.H * 0.1, E.W + 120, GY - E.H * 0.1], red: 0.02, seed: 5, r: 22 }));
  layer(g, cam, 1, (g) => { const ph = (t % 0.6) / 0.6; drawFigure(g, { x: E.W / 2, y: GY, s, facing: ph > 0.5 ? 1 : -1, outfit: RUBISCO, pose: breathe(ph > 0.5 ? CATCH : POSES.cheer, t), expr: 'joy', rim: { color: tint, dir: [0.6, -0.8] } }); });
} });

// s30 — giant face: RUBISCO beaming
registerShot('s30', { draw(g, t, info) {
  blurLayer(g, 12, (g) => { const { GY } = cell(g, t, { z: 1.4, y: -200 }); molecules(g, t, { count: 50, area: [0, 0, E.W, E.H], red: 0, seed: 6 }); }); veil(g, '#04100a', 0.3);
  bigFace(g, E.W / 2, E.H * V(0.6, 0.52), V(300, 330) * (1 + 0.03 * t), { outfit: { ...RUBISCO, head: 'none' }, expr: 'joy', look: [0, -0.1], blink: (t % 2.7) > 2.6, rimColor: S().ui.gold, rimSide: -1 });
  FX.sparkle(g, E.W * 0.72, E.H * 0.3, 40, S().ui.gold, 0.5 + 0.5 * Math.sin(t * 5));
} });
