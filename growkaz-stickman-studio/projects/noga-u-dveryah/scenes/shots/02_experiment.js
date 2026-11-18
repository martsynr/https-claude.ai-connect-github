// shots/02_experiment.js — Freedman & Fraser, 1966: the giant lawn sign, the tiny window card, 17% vs 76%.
import { E, V, S, registerShot, mood, layer, blurLayer, veil, ease, prog, key, clamp, lerp, shake, wordTime, seg, circle, ring, rr, glow, alpha, mix, text, FONTS } from '/engine/core.js';
import { drawFigure, POSES, posesAt, breathe, walkPose } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { suburb, spots, bigSign, smallSign } from '../sets/suburb.js';
import { camOn } from './01_hook.js';
import { YOU, FREEDMAN, FRASER, NEIGHBOR } from '../cast.js';

const wt = (w, info, fb) => (wordTime(w, info.shot.start) ?? info.shot.start + fb) - info.shot.start;   // word time inside the shot
const neighbourWall = (M) => mix(M.wall, M.grass, 0.45);

// s03 — "1966 рік."  title card over a dusk street
registerShot('s03', { draw(g, t, info) {
  const sp = spots(), u = ease.inOut(t / info.dur);
  suburb(g, t, { z: lerp(1.0, 0.94, u), y: lerp(-40, -90, u), x: -60 }, { mood: 'dusk', door: 0 });
  FX.dust(g, t, { count: 30, color: '#ffd9b0', a: 0.35 });
  UI.titleCard(g, t, { lines: ['1966'], sub: 'КАЛІФОРНІЯ', dur: info.dur, y: E.H * V(0.35, 0.3) });
} });

// s04 — "Психологи Фрідман і Фрейзер"  the two psychologists walk the sidewalk with clipboards
registerShot('s04', { draw(g, t, info) {
  const sp = spots(), M = mood('dusk'), cam = { z: V(1.0, 1.05), x: lerp(-40, 20, t / info.dur), y: V(60, 120) };
  suburb(g, t, cam, { mood: 'dusk', door: 0 });
  const y = sp.GY + V(170, 300), s = V(1.0, 1.15), rim = { color: M.rim, dir: [0.6, -0.8] };
  const x1 = E.W * V(0.3, 0.12) + t * 160 * s, x2 = x1 - V(190, 230);
  const fA = { x: x1, y, s, facing: 1, outfit: FREEDMAN, pose: walkPose(t * Math.PI * 2 * 0.9), prop: 'paper', expr: 'smile', rim };
  const fB = { x: x2, y, s, facing: 1, outfit: FRASER, pose: walkPose(t * Math.PI * 2 * 0.9 + 1.6), prop: 'paper', expr: 'smile', rim, blink: (t % 3.3) > 3.2 };
  layer(g, cam, 1, (g) => { drawFigure(g, fB); drawFigure(g, fA); });
  layer(g, cam, 1, (g) => {
    UI.callout(g, t, { at: [x1 + 4 * s, y - 250 * s], to: [x1 + V(120, 120), y - 250 * s - V(130, 200)], str: 'ФРІДМАН', start: wt('Фрідман', info, 0.8) });
    UI.callout(g, t, { at: [x2 + 4 * s, y - 250 * s], to: [x2 - V(60, 40), y - 250 * s - V(250, 360)], str: 'ФРЕЙЗЕР', start: wt('Фрейзер', info, 1.6) });
  });
  FX.dust(g, t, { count: 30, color: '#ffd9b0', a: 0.3 });
} });

// s05 — "просять людей поставити на газоні величезний щит"  the request at the door; a dashed giant sign appears
registerShot('s05', { draw(g, t, info) {
  const sp = spots(), M = mood('dusk'), cam = camOn(sp.doorX - V(160, 140), sp.GY - V(200, 260), lerp(V(1.25, 1.3), V(1.33, 1.38), ease.inOut(t / info.dur)));
  suburb(g, t, cam, { mood: 'dusk', door: 0.85 });
  const tBig = wt('величезний', info, 2.2), s = V(1.15, 1.2), rim = { color: M.practical, dir: [0.8, -0.6] };
  layer(g, cam, 0.9, (g) => {
    drawFigure(g, { x: sp.doorX, y: sp.GY, s, facing: -1, outfit: YOU, pose: breathe(POSES.stand, t, 1, 2), expr: t > tBig + 0.15 ? 'surprised' : 'neutral', blink: (t % 3.1) > 3.0, rim });
    drawFigure(g, { x: sp.doorX - V(250, 260), y: sp.GY + 10, s, facing: 1, outfit: FREEDMAN, pose: breathe(posesAt(t, [[0, POSES.talk], [1.2, POSES.explain], [tBig - 0.3, POSES.point]]), t, 1, 4), prop: 'paper', expr: 'smile', rim: { color: M.rim, dir: [-0.7, -0.6] } });
  });
  layer(g, cam, 1.05, (g) => bigSign(g, sp.CX - V(260, 150), sp.GY + V(330, 470), V(0.7, 0.62), { ghost: ease.out(prog(t, tBig, tBig + 0.5)) }));
  FX.dust(g, t, { count: 30, color: '#ffd9b0', a: 0.3 });
} });

// s06 — "«Їдь обережно»."  the ugly sign slams into the lawn and blocks the window
registerShot('s06', { draw(g, t, info) {
  const sp = spots(), land = 0.22, k = ease.in(prog(t, 0, land));
  const [sx, sy] = shake(t, 22 * (1 - prog(t, land, land + 0.7)), 18);
  const cam = { ...camOn(sp.winX + sp.winW / 2 + 60, sp.GY - V(260, 330), lerp(1.12, 1.18, t / info.dur)), r: -0.015 };
  g.save(); g.translate(sx, sy);
  suburb(g, t, cam, { mood: 'dusk', door: 0 });
  layer(g, cam, 0.95, (g) => bigSign(g, sp.winX + sp.winW / 2 + 40, sp.GY + V(80, 110) - (1 - k) * 1100, V(0.82, 0.78), { mood: 'dusk' }));
  g.restore();
  if (t > land) FX.dust(g, t - land, { count: 60, color: '#e8d4b0', a: 0.5 * (1 - prog(t, land, land + 1.4)) });
} });

// shared blueprint row of line figures; lit = how many are filled (fractional)
function people(g, n, lit, cols, x0, y0, dx, dy, s) {
  const c = UI.bpStroke(), gold = S().ui.gold;
  for (let i = 0; i < n; i++) {
    const x = x0 + (i % cols) * dx, y = y0 + Math.floor(i / cols) * dy, on = clamp(lit - i);
    UI.lineFigure(g, { x, y, s, pose: POSES.stand, color: alpha(c, 0.35) });
    if (on > 0) { g.save(); g.globalAlpha *= on; glow(g, x, y - 110 * s, 120 * s, gold, 0.35); UI.lineFigure(g, { x, y, s, pose: POSES.cheer, color: gold }); g.restore(); }
  }
}
const pct = (g, v, y, color, label) => {
  text(g, Math.round(v) + '%', E.W / 2, y, { size: V(150, 170), color, font: FONTS.ui, weight: 900, glow: 26, glowColor: alpha(color, 0.6) });
  if (label) text(g, label, E.W / 2, y - V(120, 135), { size: V(34, 38), color: alpha(S().ui.cream, 0.8), font: FONTS.ui, weight: 900, spacing: 3 });
};

// s07 — "Погоджуються менше ніж двоє з десяти."  10 figures, fewer than 2 light up → 17%
registerShot('s07', { draw(g, t, info) {
  UI.blueprint(g); const z = 1 + 0.04 * t; g.save(); g.translate(E.W / 2, E.H / 2); g.scale(z, z); g.translate(-E.W / 2, -E.H / 2);
  const t2 = wt('двоє', info, 1.6), p = ease.inOut(prog(t, t2 - 0.2, t2 + 0.9));
  text(g, 'ВЕЛИКИЙ ЩИТ ОДРАЗУ', E.W / 2, E.H * V(0.14, 0.17), { size: V(44, 50), color: S().ui.cream, font: FONTS.ui, weight: 900, spacing: 3, alpha: ease.out(prog(t, 0, 0.4)) });
  people(g, 10, 1.7 * p, 5, E.W / 2 - V(560, 380), E.H * V(0.42, 0.37), V(280, 190), V(260, 280), V(0.95, 1.05));
  pct(g, 17 * p, E.H * V(0.82, 0.66), S().ui.accent, 'ПОГОДИЛИСЯ');
  g.restore();
} });

// s08 — "Але іншим двома тижнями раніше"  golden afternoon, the neighbour's house, a different visit
registerShot('s08', { draw(g, t, info) {
  const sp = spots(), M = mood('golden'), cam = camOn(sp.doorX - V(140, 120), sp.GY - V(240, 300), lerp(V(1.0, 1.05), V(1.1, 1.15), ease.inOut(t / info.dur)));
  suburb(g, t, cam, { mood: 'golden', door: 0.85, wall: neighbourWall(M) });
  const s = V(1.0, 1.05);
  layer(g, cam, 0.9, (g) => {
    drawFigure(g, { x: sp.doorX, y: sp.GY, s, facing: -1, outfit: NEIGHBOR, pose: breathe(POSES.relaxed, t, 1, 5), expr: 'smile', blink: (t % 3.4) > 3.3, rim: { color: M.practical, dir: [0.8, -0.6] } });
    drawFigure(g, { x: sp.doorX - V(240, 250), y: sp.GY + 10, s, facing: 1, outfit: FRASER, pose: breathe(POSES.holdFront, t, 1, 6), prop: 'paper', expr: 'smile', rim: { color: M.rim, dir: [-0.8, -0.5] } });
  });
  FX.dust(g, t, { count: 40, color: '#ffe2bd', a: 0.35 });
  FX.lensStreak(g, E.W / 2, E.H * 0.25, E.W * 1.4, '#ffe0b0', 0.16);
  UI.badge(g, { str: '−2 ТИЖНІ', a: ease.out(prog(t, wt('двома', info, 1.4) - 0.1, wt('двома', info, 1.4) + 0.3)) });
} });

// s09 — "дали крихітну табличку для вікна «Будь обережним водієм»."  insert: the tiny card goes into the window
registerShot('s09', { draw(g, t, info) {
  const sp = spots(), M = mood('golden'), z = lerp(V(2.2, 2.6), V(2.35, 2.75), t / info.dur);
  const cam = camOn(sp.winX + sp.winW / 2, sp.winY + sp.winH / 2 + 20, z);
  const t0 = wt('крихітну', info, 0.3), placed = ease.inOut(prog(t, t0, t0 + 1.0)), away = ease.inOut(prog(t, t0 + 1.4, t0 + 2.2));
  suburb(g, t, cam, { mood: 'golden', door: 0, wall: neighbourWall(M), small: false });
  layer(g, cam, 0.9, (g) => {
    const cs = V(0.55, 0.6), tx = sp.winX + sp.winW * 0.12, ty = sp.winY + sp.winH * 0.14;
    const x = lerp(sp.winX + sp.winW + 60, tx, placed), y = lerp(ty + 90, ty, placed);
    g.save(); g.beginPath(); g.rect(sp.winX, sp.winY, sp.winW, sp.winH); g.clip();
    smallSign(g, x, y, cs, ease.out(prog(t, t0 - 0.1, t0 + 0.2)));
    const hx = x + 150 * cs + 30 + away * 260, hy = y + 50 * cs;                        // the neighbour's hand (blue sleeve)
    seg(g, [[hx + 20, hy + 6], [hx + 400, hy + 60]], 30, NEIGHBOR.color);
    seg(g, [[hx - 6, hy], [hx + 30, hy + 4]], 20, '#0e0b12'); circle(g, hx - 6, hy - 4, 11, '#0e0b12');
    g.restore();
    if (placed >= 1) glow(g, tx + 75 * cs, ty + 48 * cs, 90, '#fff6e0', 0.35 * (0.6 + 0.4 * Math.sin(t * 4)));
  });
  FX.dust(g, t, { count: 30, color: '#ffe2bd', a: 0.3 });
} });

// s10 — "І з них на великий щит"  two weeks later: the card in the window, Freedman returns; the big ask appears
registerShot('s10', { draw(g, t, info) {
  const sp = spots(), M = mood('dusk'), cam = camOn(sp.CX - V(20, 40), sp.GY - V(220, 240), lerp(V(1.05, 1.1), V(1.12, 1.18), ease.inOut(t / info.dur)));
  suburb(g, t, cam, { mood: 'dusk', door: 0.85, wall: neighbourWall(M), small: 1 });
  const tBig = wt('великий', info, 1.4), s = V(1.0, 1.05);
  layer(g, cam, 0.9, (g) => {
    glow(g, sp.winX + sp.winW * 0.12 + 45, sp.winY + sp.winH * 0.14 + 30, 110, '#fff6e0', 0.3);
    drawFigure(g, { x: sp.doorX, y: sp.GY, s, facing: -1, outfit: NEIGHBOR, pose: breathe(POSES.relaxed, t, 1, 5), expr: t > tBig + 0.5 ? 'smile' : 'neutral', rim: { color: M.practical, dir: [0.8, -0.6] } });
    drawFigure(g, { x: sp.doorX - V(240, 250), y: sp.GY + 10, s, facing: 1, outfit: FREEDMAN, pose: breathe(posesAt(t, [[0, POSES.talk], [tBig - 0.2, POSES.point]]), t, 1, 4), prop: 'paper', expr: 'smile', rim: { color: M.rim, dir: [-0.7, -0.6] } });
  });
  layer(g, cam, 1.05, (g) => bigSign(g, sp.CX - V(260, 150), sp.GY + V(330, 470), V(0.7, 0.62), { ghost: ease.out(prog(t, tBig, tBig + 0.5)) }));
  FX.dust(g, t, { count: 30, color: '#ffd9b0', a: 0.3 });
} });

// s11 — "погодилися майже троє з чотирьох."  4 figures, 3 light up → 76%; bars 17% vs 76%
registerShot('s11', { draw(g, t, info) {
  UI.blueprint(g); const z = 1.03 - 0.03 * t; g.save(); g.translate(E.W / 2, E.H / 2); g.scale(z, z); g.translate(-E.W / 2, -E.H / 2);
  const t3 = wt('троє', info, 1.0), p = ease.inOut(prog(t, t3 - 0.4, t3 + 0.9)), ui = S().ui;
  text(g, 'ПІСЛЯ МАЛЕНЬКОЇ ТАБЛИЧКИ', E.W / 2, E.H * V(0.14, 0.13), { size: V(42, 46), color: ui.cream, font: FONTS.ui, weight: 900, spacing: 2, alpha: ease.out(prog(t, 0.1, 0.5)) });
  people(g, 4, 3.04 * p, 4, E.W / 2 - V(420, 330), E.H * V(0.42, 0.3), V(280, 220), 0, V(1.0, 1.0));
  pct(g, 76 * p, E.H * V(0.62, 0.45), ui.gold, null);
  const rows = [['ОДРАЗУ', 0.17, ui.accent], ['ПІСЛЯ ТАБЛИЧКИ', 0.76, ui.gold]], bx = E.W / 2 - V(450, 400), bw = V(900, 800);
  rows.forEach(([lab, v, col], i) => {
    const q = ease.out(prog(t, 1.2 + i * 0.35, 2.0 + i * 0.35)), y = E.H * V(0.75, 0.56) + i * V(90, 110);
    text(g, lab, bx, y - V(34, 40), { size: V(26, 30), color: alpha(ui.cream, 0.85), font: FONTS.ui, weight: 900, align: 'left', spacing: 2, alpha: q });
    rr(g, bx, y - 14, bw, 28, 14); g.fillStyle = alpha(col, 0.15); g.fill();
    if (q > 0) { rr(g, bx, y - 14, Math.max(28, bw * v * q), 28, 14); g.fillStyle = col; g.fill(); text(g, Math.round(100 * v * q) + '%', bx + bw, y - V(34, 40), { size: V(30, 34), color: col, font: FONTS.ui, weight: 900, align: 'right' }); }
  });
  g.restore();
} });
