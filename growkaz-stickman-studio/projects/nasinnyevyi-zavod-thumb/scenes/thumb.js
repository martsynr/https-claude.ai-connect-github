// thumb.js — YouTube thumbnail: the plant line behind, FARMER's big excited face, a glowing seed, the MAIS bag, big title.
import { E, S, registerShot, blurLayer, veil, text, FONTS, alpha, glow, rr, poly, seg, linGrad } from '/engine/core.js';
import { bigFace } from '/engine/rig2d.js';
const SRC = '/projects/nasinnyevyi-zavod/scenes';
const { hall, kernel, cob } = await import(`${SRC}/sets/plant.js`);
const { bagFace, logo } = await import(`${SRC}/sets/brand.js`);
const { FARMER } = await import(`${SRC}/cast.js`);
await import(`${SRC}/sets/toy.js`);

registerShot('thumb', { draw(g) {
  const t = 2.2;
  blurLayer(g, 5, (g) => hall(g, t, { z: 0.72, x: 260, y: -60 }, { n: 10, focus: 5, drop: null, cyclones: 1, tCyc: -5 }));
  veil(g, '#ffffff', 0.25);
  g.fillStyle = linGrad(g, 0, 0, E.W, 0, ['rgba(255,255,255,.4)', 'rgba(255,255,255,0)', 'rgba(255,255,255,.3)']); g.fillRect(0, 0, E.W, E.H);
  // the face
  const M = { rim: '#ffd47e' };
  glow(g, 340, 800, 560, '#ffb070', 0.25);
  bigFace(g, 330, 840, 310, { outfit: FARMER, expr: 'awe', look: [0.6, -0.2], rimColor: M.rim, rimSide: 1 });
  // seed → bag
  glow(g, 1030, 560, 320, '#ffd47e', 0.45); cob(g, 1030, 560, 380, { rot: -0.35, rim: '#fff3c4' });
  for (let i = 0; i < 3; i++) poly(g, [[1180 + i * 34, 820], [1206 + i * 34, 852], [1180 + i * 34, 884]], alpha(S().ui.gold, 0.5 + i * 0.25));
  g.save(); g.translate(1520, 690); g.rotate(0.06); glow(g, 0, 0, 520, '#7dffb0', 0.22); g.shadowColor = 'rgba(0,0,0,.6)'; g.shadowBlur = 40; rr(g, -230, -320, 460, 640, 50); g.fillStyle = '#000'; g.fill(); g.shadowBlur = 0; bagFace(g, -230, -320, 460, 640, { r: 50 }); g.restore();
  // title
  text(g, 'НАСІННЄВИЙ ЗАВОД', E.W / 2, 150, { size: 150, color: S().ui.gold, stroke: 16, strokeColor: '#0a0a08', glow: 30, glowColor: 'rgba(255,140,40,.7)', spacing: 2 });
  g.save(); g.translate(E.W / 2 - 40, 300); g.rotate(-0.03); rr(g, -260, -58, 520, 116, 24); g.fillStyle = '#e0302a'; g.fill();
  text(g, '10 МАШИН', 0, 4, { size: 86, color: '#ffffff', font: FONTS.ui, weight: 900, spacing: 2 }); g.restore();
  text(g, 'від качана до мішка', E.W / 2 + 330, 302, { size: 52, color: S().ui.cream, font: FONTS.ui, weight: 900, align: 'left', stroke: 8, strokeColor: '#0a0a08' });
} });
