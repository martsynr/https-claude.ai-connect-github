// shots/04_tactics.js — the "foot in the door" today: the shoe in the gap, the free trial, "got a minute?"
import { E, V, S, registerShot, mood, layer, blurLayer, veil, backdrop, ease, prog, key, clamp, lerp, shake, wordTime, talkAmount, seg, circle, ring, rr, poly, glow, alpha, shade, mix, linGrad, text, FONTS } from '/engine/core.js';
import { drawFigure, POSES, posesAt, breathe } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { YOU, MANIP } from '../cast.js';

const wt = (w, info, fb) => (wordTime(w, info.shot.start) ?? info.shot.start + fb) - info.shot.start;

// s14 — "Це прийом «нога у дверях»:"  a door opens a crack and a black shoe jams into the gap
registerShot('s14', { draw(g, t, info) {
  const M = mood('night'), ui = S().ui, tN = wt('нога', info, 1.16), land = 0.95;
  const [sx, sy] = shake(t, 14 * (1 - prog(t, land, land + 0.5)), 20);
  const cam = { z: lerp(1.15, 1.25, ease.inOut(t / info.dur)), x: sx - 120, y: sy + V(120, 260) };
  const dW = V(520, 600), dH = V(900, 1300), dx = E.W / 2 - dW / 2, GY = E.H * V(0.9, 0.86);
  const open = 0.2 * ease.out(prog(t, 0.05, 0.5));
  layer(g, cam, 0.95, (g) => {
    backdrop(g, [shade(M.wall, -0.5), shade(M.wall, -0.7)]);
    for (let y = 0; y < E.H; y += 34) { g.fillStyle = alpha('#000000', 0.1); g.fillRect(-E.W, y, E.W * 3, 3); }
    g.fillStyle = shade(M.wall, -0.8); g.fillRect(dx - 30, GY - dH - 30, dW + 60, dH + 30);
    FX.door(g, { x: dx, y: GY, w: dW, h: dH, color: shade(M.wall, -0.2), open, light: M.practical });
    FX.lightCone(g, dx + dW * open / 2, GY - dH / 2, { angle: Math.PI / 2 + 0.3, spread: 0.25, len: 900, color: M.practical, a: 0.12 });
    g.fillStyle = linGrad(g, 0, GY, 0, E.H + 200, [shade(M.floor, -0.2), M.dark]); g.fillRect(-E.W, GY, E.W * 3, E.H);
    FX.pool(g, dx + dW * open / 2, GY + 30, 260, 40, M.practical, 0.3);
    // the shoe slides into the gap
    const k = ease.out(prog(t, 0.55, land)), shx = lerp(E.W + 300, dx + dW * open * 0.5 + 40, k), shy = GY - 6;
    seg(g, [[shx + 60, shy - 70], [E.W + 600, shy - 330]], 70, '#141018');                                    // trouser leg
    FX.pool(g, shx, shy + 10, 260, 50, M.practical, 0.45 * k);                                                 // light spilling on the shoe
    g.fillStyle = '#0b090e'; g.beginPath(); g.ellipse(shx, shy - 30, 120, 44, 0, 0, Math.PI * 2); g.fill();     // shoe
    g.strokeStyle = alpha(M.practical, 0.9); g.lineWidth = 6; g.beginPath(); g.ellipse(shx, shy - 30, 120, 44, 0, Math.PI * 1.05, Math.PI * 1.75); g.stroke();
    g.fillStyle = '#1e1a22'; g.fillRect(shx - 120, shy - 8, 240, 14);                                         // sole
    seg(g, [[shx - 70, shy - 60], [shx + 10, shy - 66]], 4, alpha(M.practical, 0.7));                        // rim on the toe
  });
  const a = ease.outBack(prog(t, tN - 0.1, tN + 0.25)), sc = 0.7 + 0.3 * a;
  g.save(); g.translate(E.W * V(0.62, 0.64), E.H * V(0.3, 0.3)); g.scale(sc, sc); g.rotate(-0.04);
  text(g, 'НОГА', 0, -V(60, 70), { size: V(110, 130), color: ui.gold, glow: 30, glowColor: 'rgba(255,120,40,.85)', alpha: clamp(a), spacing: 4 });
  text(g, 'У ДВЕРЯХ', 0, V(60, 70), { size: V(90, 100), color: ui.cream, glow: 26, glowColor: 'rgba(255,120,40,.7)', alpha: clamp(a), spacing: 4 });
  g.restore();
  FX.dust(g, t, { count: 30, color: '#ffe2bd', a: 0.25 });
} });

// s15 — "пробний період «просто вкажи картку»"  the free-trial screen; card digits fill in, a thumb taps
registerShot('s15', { draw(g, t, info) {
  const M = mood('interiorCool'), ui = S().ui, tCard = wt('картку', info, 1.97);
  blurLayer(g, 12, (g) => { backdrop(g, M.sky); FX.skyline(g, { x: -200, y: E.H * 0.7, w: E.W + 400, maxH: 500, color: shade(M.wall, -0.3), windowColor: alpha(M.practical, 0.6), seed: 9 }); }); veil(g, '#060814', 0.45);
  const z = lerp(1.0, 1.06, ease.inOut(t / info.dur)); g.save(); g.translate(E.W / 2, E.H / 2); g.scale(z, z); g.rotate(-0.03); g.translate(-E.W / 2, -E.H / 2);
  const pw = V(520, 600), ph = V(980, 1120), px = E.W / 2 - pw / 2, py = E.H * V(0.05, 0.12);
  glow(g, E.W / 2, py + ph / 2, pw * 1.2, ui.accent, 0.12);
  rr(g, px - 18, py - 18, pw + 36, ph + 36, 70); g.fillStyle = '#07070b'; g.fill();
  rr(g, px, py, pw, ph, 54); g.fillStyle = linGrad(g, 0, py, 0, py + ph, [shade(M.wall, -0.2), shade(M.wall, -0.55)]); g.fill();
  const cx = E.W / 2;
  text(g, 'ПРЕМІУМ', cx, py + ph * 0.12, { size: V(40, 46), color: alpha(ui.cream, 0.75), font: FONTS.ui, weight: 900, spacing: 6 });
  text(g, '30 ДНІВ', cx, py + ph * 0.27, { size: V(104, 120), color: ui.gold, font: FONTS.ui, weight: 900, glow: 24, glowColor: alpha(ui.gold, 0.6) });
  text(g, 'БЕЗКОШТОВНО', cx, py + ph * 0.37, { size: V(48, 56), color: ui.cream, font: FONTS.ui, weight: 900, spacing: 2 });
  text(g, 'просто вкажи картку', cx, py + ph * 0.48, { size: V(30, 34), color: alpha(ui.cream, 0.6), font: FONTS.ui, weight: 800 });
  const fy = py + ph * 0.56, fw = pw * 0.8; rr(g, cx - fw / 2, fy, fw, V(80, 90), 18); g.fillStyle = alpha('#ffffff', 0.08); g.fill(); g.strokeStyle = alpha(ui.cream, 0.3); g.lineWidth = 2; g.stroke();
  const digits = '•••• •••• •••• 4821', n = Math.round(digits.length * ease.inOut(prog(t, 0.5, tCard - 0.1)));
  text(g, digits.slice(0, n) + (Math.floor(t * 3) % 2 && n < digits.length ? '|' : ''), cx - fw / 2 + 28, fy + V(42, 46), { size: V(38, 42), color: ui.cream, font: FONTS.ui, weight: 900, align: 'left', spacing: 2 });
  const by = py + ph * 0.74, bw = pw * 0.8, bh = V(100, 110), press = key(t, [[tCard - 0.05, 0], [tCard + 0.05, 1], [tCard + 0.25, 0]]);
  g.save(); g.translate(cx, by + bh / 2); g.scale(1 - 0.05 * press, 1 - 0.05 * press);
  rr(g, -bw / 2, -bh / 2, bw, bh, bh / 2); g.fillStyle = ui.accent; g.fill(); glow(g, 0, 0, bw * 0.6, ui.accent, 0.25 + 0.3 * press);
  text(g, 'СПРОБУВАТИ', 0, 3, { size: V(42, 46), color: '#0b0b10', font: FONTS.ui, weight: 900, spacing: 2 }); g.restore();
  text(g, 'потім — щомісяця', cx, by + bh + V(50, 56), { size: V(24, 28), color: alpha(ui.cream, 0.35), font: FONTS.ui, weight: 800 });
  // thumb (YOU's sleeve) moves in and taps
  const k = ease.inOut(prog(t, 0.6, tCard)), tx = lerp(E.W + 200, cx + bw * 0.18, k), ty = lerp(E.H + 200, by + bh * 0.62, k) + press * 10;
  seg(g, [[tx + 70, ty + 140], [E.W + 400, E.H + 500]], V(150, 170), YOU.color);
  seg(g, [[tx, ty], [tx + 90, ty + 170]], V(70, 80), '#0e0b12');
  if (t > tCard) FX.rings(g, tx, ty, t - tCard, { count: 2, r0: 20, r1: 160, speed: 1.6, color: ui.cream, a: 0.5 * (1 - prog(t, tCard, tCard + 0.8)) });
  g.restore();
} });

// s16 — "«можна тебе на хвилинку?»"  office: the trench-coat man leans in and taps YOU's shoulder; paper stack grows
registerShot('s16', { draw(g, t, info) {
  const M = mood('interiorCool'), GY = E.H * V(0.8, 0.68), CX = E.W / 2, cam = { z: lerp(1.15, 1.22, t / info.dur), x: -30, y: V(-40, -60) };
  layer(g, cam, 0.5, (g) => {
    g.fillStyle = shade(M.wall, -0.3); g.fillRect(-E.W, -E.H, E.W * 3, GY + E.H);
    FX.windowFrame(g, { x: CX - V(420, 380), y: GY - V(780, 900), w: V(840, 760), h: V(460, 520), cols: 3, rows: 1, frame: shade(M.wall, -0.6), bar: 12, blinds: 30 }, (g, x, y, w, h) => {
      backdrop(g, M.sky, [x, y, w, h]); FX.skyline(g, { x, y: y + h, w, maxH: h * 0.7, color: shade(M.wall, -0.5), windowColor: alpha(M.practical, 0.8), lit: 0.3, seed: 4 });
    });
  });
  layer(g, cam, 0.9, (g) => { g.fillStyle = linGrad(g, 0, GY, 0, GY + 500, [shade(M.floor, 0.05), M.dark]); g.fillRect(-E.W, GY, E.W * 3, E.H); FX.floorLines(g, GY, GY + 600, 'rgba(0,0,0,.25)', 0.08); });
  const s = V(1.35, 1.4), deskX = CX + V(160, 150), deskY = GY - 160 * s * 0.62;
  const talk = talkAmount(info.globalT, 48.0, 49.3), tap = key(t, [[0.05, 0], [0.2, 1], [0.35, 0], [0.5, 1], [0.65, 0]]);
  layer(g, cam, 1, (g) => {
    // desk + monitor + growing paper stack
    g.fillStyle = shade(M.wall, -0.65); g.fillRect(deskX - 200, deskY, 420, 18); g.fillRect(deskX - 180, deskY, 16, GY - deskY); g.fillRect(deskX + 186, deskY, 16, GY - deskY);
    FX.screen(g, { x: deskX - 30, y: deskY - 170, w: 200, h: 140, glowC: M.practical }, () => {});
    const n = 2 + Math.floor(14 * ease.in(prog(t, 0.3, info.dur)));
    for (let i = 0; i < n; i++) { rr(g, deskX - 170 + Math.sin(i * 2.1) * 6, deskY - 12 - i * 11, 120, 10, 2); g.fillStyle = i % 2 ? '#e8e4dc' : '#d8d2c6'; g.fill(); }
    FX.chair(g, CX - V(60, 60), GY, s * 0.9, shade(M.wall, -0.7));
    drawFigure(g, { x: CX - V(40, 40), y: GY, s, facing: 1, outfit: YOU, pose: breathe(POSES.sit, t), expr: t > 0.4 ? 'nervous' : 'neutral', look: [-0.8, 0], rim: { color: M.practical, dir: [1, -0.4] }, shadow: false });
    const mp = { ...POSES.reach, eF: [30, -150 + tap * 6], hF: [70, -150 + tap * 10] };
    drawFigure(g, { x: CX - V(300, 280), y: GY, s, facing: 1, outfit: MANIP, pose: breathe(mp, t, 1, 7), expr: 'smile', talk, rim: { color: M.rim, dir: [-0.6, -0.8] } });
    if (talk > 0) { const hy = GY - 210 * s; FX.rings(g, CX - V(300, 280), hy, t, { count: 3, r0: 40 * s, r1: 90 * s, color: '#e8f0ff', a: 0.35 }); }
  });
  FX.dust(g, t, { count: 30, color: '#cfe0ff', a: 0.25 });
} });
