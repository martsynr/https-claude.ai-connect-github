// shots/03_mind.js — why it works: the small "yes" rewrites the self-image; refusing means going against yourself.
import { E, V, S, registerShot, mood, layer, backdrop, ease, prog, clamp, lerp, wordTime, seg, circle, ring, rr, glow, alpha, text, FONTS, shade, linGrad } from '/engine/core.js';
import { drawFigure, POSES, posesAt, breathe } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { YOU } from '../cast.js';

const wt = (w, info, fb) => (wordTime(w, info.shot.start) ?? info.shot.start + fb) - info.shot.start;

// s12 — "Маленьке «так» змінює те, ким ти себе вважаєш."  blueprint head: the 'ТАК' card enters, identity label appears
registerShot('s12', { draw(g, t, info) {
  UI.blueprint(g); const c = UI.bpStroke(), ui = S().ui;
  const z = 1 + 0.05 * ease.inOut(t / info.dur); g.save(); g.translate(E.W / 2, E.H / 2); g.scale(z, z); g.translate(-E.W / 2, -E.H / 2);
  const hx = E.W / 2, hy = E.H * V(0.42, 0.36), R = V(230, 250);
  const tYes = wt('так', info, 0.7), tCh = wt('змінює', info, 0.85), tWho = wt('ким', info, 2.2), tSelf = wt('вважаєш', info, 3.35);
  // head + shoulders in line art
  ring(g, hx, hy, R, 6, alpha(c, 0.85));
  g.strokeStyle = alpha(c, 0.85); g.lineWidth = 6; g.beginPath(); g.moveTo(hx - R * 0.35, hy + R * 0.95); g.lineTo(hx - R * 0.35, hy + R * 1.2); g.quadraticCurveTo(hx - R * 1.6, hy + R * 1.3, hx - R * 1.7, hy + R * 2.2); g.moveTo(hx + R * 0.35, hy + R * 0.95); g.lineTo(hx + R * 0.35, hy + R * 1.2); g.quadraticCurveTo(hx + R * 1.6, hy + R * 1.3, hx + R * 1.7, hy + R * 2.2); g.stroke();
  // the small "yes" card flies into the head
  const fly = ease.inOut(prog(t, 0.05, tYes + 0.15)), inside = t > tYes + 0.15;
  if (!inside) {
    const x = lerp(hx - R * 1.6, hx, fly), y = lerp(hy + R * 1.9, hy, fly), s = lerp(1, 0.5, fly);
    g.save(); g.translate(x, y); g.scale(s, s); rr(g, -90, -44, 180, 88, 18); g.fillStyle = ui.gold; g.fill(); glow(g, 0, 0, 160, ui.gold, 0.4);
    text(g, 'ТАК', 0, 4, { size: 56, color: '#1a1408', font: FONTS.ui, weight: 900 }); g.restore();
  } else {
    FX.rings(g, hx, hy, t - tCh, { count: 3, r0: R * 0.2, r1: R * 1.9, speed: 0.7, color: ui.gold, a: 0.5 * (1 - prog(t, tCh + 1.8, tCh + 3)) });
    glow(g, hx, hy, R * 1.1, ui.gold, 0.18 * ease.out(prog(t, tCh, tCh + 0.6)));
  }
  // the new self-image, written inside the head
  const a = ease.out(prog(t, tWho - 0.1, tWho + 0.4));
  text(g, 'Я — ТОЙ,', hx, hy - R * 0.2, { size: V(56, 60), color: ui.gold, font: FONTS.ui, weight: 900, alpha: a, glow: 18, glowColor: alpha(ui.gold, 0.6) });
  text(g, 'ХТО ДОПОМАГАЄ', hx, hy + R * 0.22, { size: V(46, 46), color: ui.gold, font: FONTS.ui, weight: 900, alpha: a, glow: 18, glowColor: alpha(ui.gold, 0.6) });
  UI.callout(g, t, { at: [hx + R * 0.7, hy - R * 0.72], to: [hx + R * 0.95, hy - R * 1.45], str: 'ОБРАЗ СЕБЕ', start: tSelf - 0.15, color: ui.cream });
  g.restore();
} });

// s13 — "А відмовити потім означає піти проти себе."  YOU vs his own reflection, which blocks the way
registerShot('s13', { draw(g, t, info) {
  const M = mood('void'), ui = S().ui, GY = E.H * V(0.8, 0.66), cam = { z: lerp(1.0, 1.07, ease.inOut(t / info.dur)), x: 0 };
  const tNo = wt('відмовити', info, 0.4), tAg = wt('проти', info, 2.6);
  const mx = E.W / 2, mTop = GY - V(620, 760), mW = V(440, 380);
  layer(g, cam, 0.6, (g) => { backdrop(g, M.sky); FX.fog(g, GY - 300, 500, M.fog, 0.35); });
  layer(g, cam, 0.9, (g) => {
    g.fillStyle = linGrad(g, 0, GY, 0, GY + 500, [shade(M.floor, 0.05), M.dark]); g.fillRect(-E.W, GY, E.W * 3, E.H);
    FX.pool(g, mx, GY + 20, 420, 60, ui.blueprint, 0.22);
    rr(g, mx - 10, mTop - 20, 20, GY - mTop + 20, 6); g.fillStyle = shade(M.wall, 0.15); g.fill();             // the mirror's edge (seen from the side)
    glow(g, mx, (mTop + GY) / 2, mW * 0.9, ui.blueprint, 0.22);
  });
  const reach = posesAt(t, [[0, POSES.stand], [tNo, POSES.reach], [tAg, { ...POSES.reach, eF: [26, -150], hF: [56, -170] }]]);
  const s = V(1.5, 1.45), d = V(170, 160), expr = t > tAg ? 'nervous' : t > tNo ? 'worried' : 'neutral';
  layer(g, cam, 1, (g) => {
    drawFigure(g, { x: mx - d, y: GY, s, facing: 1, outfit: YOU, pose: breathe(reach, t), expr, blink: (t % 3.1) > 3.0, rim: { color: ui.blueprint, dir: [1, -0.3] } });
    g.save(); g.globalAlpha = 0.8;
    drawFigure(g, { x: mx + d, y: GY, s, facing: -1, outfit: YOU, pose: breathe(reach, t), expr, blink: (t % 3.1) > 3.0, rim: { color: ui.blueprint, dir: [-1, -0.3] }, shadow: false });
    g.restore();
    if (t > tNo + 0.3) FX.rings(g, mx, GY - 150 * s, t - tNo, { count: 3, r0: 20, r1: 220, speed: 1.2, color: ui.blueprint, a: 0.5 });
  });
  FX.dust(g, t, { count: 40, color: '#cfe0ff', a: 0.3 });
} });
