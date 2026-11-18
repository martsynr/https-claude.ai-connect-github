// shots/05_defense.js — the defence: ask "would I agree if this were the first time?", then say no. End screen.
import { E, V, S, registerShot, mood, layer, blurLayer, veil, ease, prog, key, clamp, lerp, shake, wordTime, seg, circle, rr, poly, glow, alpha, linGrad, text, FONTS } from '/engine/core.js';
import { drawFigure, POSES, posesAt, breathe, bigFace } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { suburb, spots, strings, bigSign } from '../sets/suburb.js';
import { camOn, handPts, PUPPET } from './01_hook.js';
import { CAST, YOU, MANIP } from '../cast.js';

const wt = (w, info, fb) => (wordTime(w, info.shot.start) ?? info.shot.start + fb) - info.shot.start;

// s17 — "Тож перед великим «так» спитай себе:"  giant face, thinking; looks up at the strings
registerShot('s17', { draw(g, t, info) {
  const sp = spots(), M = mood('night'), tAsk = wt('спитай', info, 2.5);
  blurLayer(g, 14, (g) => suburb(g, t, camOn(sp.doorX - 80, sp.GY - 300, 2.0), { mood: 'night', door: 0.9 })); veil(g, '#0a0c18', 0.35);
  const r = V(300, 330) * (1 + 0.04 * t), cx = E.W / 2 - V(40, 0), cy = E.H * V(0.62, 0.53);
  const up = ease.inOut(prog(t, tAsk - 0.2, tAsk + 0.4));
  bigFace(g, cx, cy, r, { outfit: YOU, expr: 'thinking', look: [0.2 - 0.2 * up, -0.2 - 0.8 * up], tilt: -0.06 * up, blink: (t % 3.3) > 3.2, rimColor: M.practical, rimSide: 1 });
  strings(g, [[cx - r * 0.55, cy - r * 0.85], [cx + r * 0.55, cy - r * 0.85]], t, { barY: -30, a: 0.6 + 0.4 * up });
  FX.dust(g, t, { count: 30, color: '#ffe2bd', a: 0.25 });
} });

// the doorway confrontation (shared by s18 frozen and s19 live)
function doorway(g, t, info, o) {
  const sp = spots(), M = mood('night'), s = V(1.15, 1.2), dx = sp.doorX - sp.doorW / 2;
  const cam = camOn(sp.doorX - V(150, 130), sp.GY - V(230, 280), o.z);
  suburb(g, o.frozen ? 0 : t, cam, { mood: 'night', door: o.door });
  const you = { x: sp.doorX, y: sp.GY, s, facing: -1, outfit: YOU, pose: o.youPose, expr: o.youExpr, blink: (t % 3.1) > 3.0, rim: { color: M.practical, dir: [0.4, -1] } };
  layer(g, cam, 0.9, (g) => {
    drawFigure(g, { x: sp.doorX - V(260, 260), y: sp.GY + 10, s, facing: 1, outfit: MANIP, pose: o.manPose, prop: 'paper', expr: o.manExpr, rim: { color: M.rim, dir: [-0.7, -0.6] } });
    g.save(); g.beginPath(); g.rect(dx, sp.GY - sp.doorH - 10, sp.doorW * o.door + 2, sp.doorH + 40); g.rect(dx - 400, sp.GY - sp.doorH - 400, 400 + 0, sp.doorH + 800); g.clip();
    if (o.door > 0.05) drawFigure(g, you);
    g.restore();
    if (o.door > 0.05 || o.cut > 0) strings(g, handPts(you), t, { barY: sp.GY - V(720, 760), cut: o.cut || 0 });
  });
  layer(g, cam, 1.05, (g) => bigSign(g, sp.CX - V(260, 150), sp.GY + V(330, 470), V(0.7, 0.62), { ghost: o.ghost ?? 0 }));
  return { sp, M };
}

// s18 — "«Якби мене попросили про це вперше — я б погодився?»"  TIME STOP: everything frozen except YOU, thinking
registerShot('s18', { draw(g, t, info) {
  const tFirst = wt('вперше', info, 1.7);
  doorway(g, t, info, { frozen: true, z: lerp(1.3, 1.36, t / info.dur), door: 0.9, youPose: breathe(posesAt(t, [[0, PUPPET], [0.5, POSES.think]]), t), youExpr: 'thinking',
    manPose: POSES.holdFront, manExpr: 'smirk', ghost: 1 });
  FX.drops(g, t, { count: 50, color: '#d8e4ff', rMax: 9, drift: 3 });
  g.save(); g.globalCompositeOperation = 'soft-light'; g.fillStyle = 'rgba(80,120,255,.35)'; g.fillRect(0, 0, E.W, E.H); g.restore();
  FX.rings(g, E.W / 2, E.H * 0.4, t, { count: 3, r0: 120, r1: 620, speed: 0.3, color: '#e8f0ff', a: 0.25 });
  UI.badge(g, { str: 'ВПЕРШЕ?', a: ease.out(prog(t, tFirst - 0.1, tFirst + 0.3)), size: V(40, 48) });
} });

// s19 — "Якщо ні, кажи «ні»."  palm up, the strings snap, the door slams on the manipulator
registerShot('s19', { draw(g, t, info) {
  const tNo = wt('ні', info, 0.8), tNo2 = (wordTime('ні', info.shot.start + tNo + 0.3) ?? info.shot.start + 2.0) - info.shot.start;
  const close = ease.in(prog(t, tNo2, tNo2 + 0.25)), [sx, sy] = shake(t, 16 * (1 - prog(t, tNo2 + 0.25, tNo2 + 0.8)) * (t > tNo2 + 0.25 ? 1 : 0), 20);
  g.save(); g.translate(sx, sy);
  const stop = { ...POSES.reach, eF: [28, -160], hF: [52, -196] };
  doorway(g, t, info, { z: lerp(1.3, 1.38, ease.inOut(t / info.dur)), door: 0.9 * (1 - close), youPose: breathe(posesAt(t, [[0, POSES.think], [tNo - 0.1, stop]]), t), youExpr: 'determined',
    manPose: breathe(posesAt(t, [[0, POSES.holdFront], [tNo2 + 0.3, POSES.handsOnHead]]), t, 1, 7), manExpr: t > tNo2 + 0.3 ? 'shocked' : 'smirk', cut: prog(t, tNo2 - 0.1, tNo2 + 0.5), ghost: 1 - prog(t, tNo2, tNo2 + 0.4) });
  g.restore();
  if (t > tNo2 + 0.2) FX.dust(g, t - tNo2, { count: 50, color: '#ffe2bd', a: 0.45 * (1 - prog(t, tNo2 + 0.2, tNo2 + 1.2)) });
} });

// s20 — end screen: "Підписуйся…"  Ukrainian question, comment bubble, subscribe pill, cast
registerShot('s20', { draw(g, t, info) {
  const ui = S().ui, M = mood('dusk');
  g.fillStyle = linGrad(g, 0, 0, 0, E.H, [M.dark, M.wall, M.ambient]); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
  glow(g, E.W / 2, E.H * 0.9, E.W * 0.5, M.key, 0.25); FX.dust(g, t, { count: 40, color: '#ffe2bd', a: 0.3 });
  const a1 = ease.out(prog(t, 0.2, 0.8)), qy = V(150, 360);
  text(g, 'Яке твоє', E.W / 2, qy - V(0, 50), { size: V(64, 70), font: FONTS.serif, weight: 900, italic: true, color: ui.cream, alpha: a1, glow: 18, glowColor: 'rgba(255,170,90,.5)' });
  text(g, 'маленьке «так»?', E.W / 2, qy + V(70, 50), { size: V(64, 70), font: FONTS.serif, weight: 900, italic: true, color: ui.gold, alpha: a1, glow: 18, glowColor: 'rgba(255,170,90,.5)' });
  const by = V(320, 600);
  UI.bubble(g, E.W / 2 - V(260, 210), by, { w: V(110, 130), h: V(60, 70) });
  const sp = ease.outBack(prog(t, 0.6, 1.1)); g.save(); g.translate(E.W / 2 + V(70, 70), by); g.scale(sp, sp);
  rr(g, -190, -40, 380, 80, 40); g.fillStyle = '#e0302a'; g.fill();
  g.fillStyle = '#fff'; g.beginPath(); g.moveTo(-150, -16); g.lineTo(-150, 16); g.lineTo(-122, 0); g.closePath(); g.fill();
  text(g, 'Підписатися', 22, 2, { size: 36, color: '#fff', font: FONTS.ui, weight: 900 }); g.restore();
  const n = CAST.length, gap = Math.min(V(150, 175), (E.W * 0.85) / Math.max(1, n)), y0 = E.H - V(170, 520);
  CAST.forEach((of, i) => { const k = ease.out(prog(t, 0.3 + i * 0.08, 0.7 + i * 0.08)); drawFigure(g, { x: E.W / 2 + (i - (n - 1) / 2) * gap, y: y0 + (1 - k) * 40, s: V(0.9, 1.0), facing: 1, outfit: of, pose: breathe(POSES.relaxed, t, 1, i), expr: 'smile', alpha: k, blink: (t % (2.9 + i * 0.3)) > 2.8 + i * 0.3, rim: { color: M.rim, dir: [0, -1] } }); });
  text(g, 'Бачиш маніпуляції раніше, ніж вони спрацюють', E.W / 2, E.H - V(70, 300), { size: V(30, 34), color: alpha(ui.cream, 0.7), font: FONTS.ui, weight: 800, alpha: ease.out(prog(t, 1.2, 1.8)) });
} });
