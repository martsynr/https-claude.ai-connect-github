// sets/toy.js — brick-toy characters. Replaces the stick-figure rig for this project via E.figureRenderer:
// yellow cylinder head, trapezoid torso, tube arms with C-hands, block legs, dark outline. Same pose points as the rig.
import { E, S, rr, poly, circle, alpha, shade, mix } from '/engine/core.js';
import { POSES } from '/engine/rig2d.js';

const SKIN = '#f6ca1f', OUT = () => S().ink;
const LEGS = '#3b5a8a';
function stroke(g, w = 3) { g.strokeStyle = OUT(); g.lineWidth = w; g.lineJoin = 'round'; g.lineCap = 'round'; g.stroke(); }
function blockRR(g, x, y, w, h, r, fill, lw = 3) { rr(g, x, y, w, h, r); g.fillStyle = fill; g.fill(); stroke(g, lw); }

function leg(g, hip, foot, col, ox) {
  const a = Math.atan2(foot[0] - hip[0], foot[1] - hip[1]) * 0.9, L = -hip[1];
  g.save(); g.translate(hip[0] + ox, hip[1] + 4); g.rotate(-a);
  blockRR(g, -15, -4, 30, L - 6, 6, col); blockRR(g, -15, L - 16, 40, 14, 5, shade(col, -0.15));
  g.restore();
}
function arm(g, sh, el, hd, col, hand) {
  g.lineCap = 'round'; g.lineJoin = 'round';
  g.strokeStyle = OUT(); g.lineWidth = 22; g.beginPath(); g.moveTo(...sh); g.lineTo(...el); g.lineTo(...hd); g.stroke();
  g.strokeStyle = col; g.lineWidth = 16; g.beginPath(); g.moveTo(...sh); g.lineTo(...el); g.lineTo(...hd); g.stroke();
  circle(g, hd[0], hd[1], 10.5, hand); g.beginPath(); g.arc(hd[0], hd[1], 10.5, 0, 7); stroke(g, 3);
  const a = Math.atan2(hd[1] - el[1], hd[0] - el[0]); g.beginPath(); g.arc(hd[0] + Math.cos(a) * 3, hd[1] + Math.sin(a) * 3, 5, a - 1.1, a + 1.1); g.strokeStyle = shade(hand, -0.35); g.lineWidth = 3.5; g.stroke();
}
function faceFx(g, x, y, k, expr = 'neutral', blink = false, glasses = false) {
  const ink = OUT(), ex = [x - 7 * k, x + 9 * k], ey = y - 5 * k;
  if (blink) for (const e of ex) { g.beginPath(); g.moveTo(e - 3.5 * k, ey); g.lineTo(e + 3.5 * k, ey); g.strokeStyle = ink; g.lineWidth = 2.6 * k; g.stroke(); }
  else for (const e of ex) { circle(g, e, ey, 3.3 * k, ink); circle(g, e + 1 * k, ey - 1.2 * k, 1 * k, '#ffffff'); }
  if (glasses) { g.strokeStyle = ink; g.lineWidth = 2 * k; for (const e of ex) { g.beginPath(); g.arc(e, ey, 6.5 * k, 0, 7); g.stroke(); } }
  const my = y + 8 * k, mx = x + 1 * k; g.strokeStyle = ink; g.lineWidth = 2.6 * k; g.lineCap = 'round'; g.beginPath();
  if (['smile', 'happy', 'joy', 'smirk', 'determined'].includes(expr)) { g.arc(mx, my - 4 * k, 8 * k, 0.35, Math.PI - 0.35); g.stroke(); if (expr === 'joy' || expr === 'happy') { g.fillStyle = ink; g.beginPath(); g.arc(mx, my - 4 * k, 8 * k, 0.35, Math.PI - 0.35); g.closePath(); g.fill(); } }
  else if (['awe', 'surprised', 'shocked', 'scared'].includes(expr)) { g.fillStyle = ink; g.ellipse(mx, my, 3.8 * k, 5 * k, 0, 0, 7); g.fill(); }
  else if (['worried', 'sad', 'nervous', 'cry', 'confused'].includes(expr)) { g.arc(mx, my + 6 * k, 7 * k, Math.PI + 0.5, -0.5); g.stroke(); }
  else { g.moveTo(mx - 5 * k, my); g.lineTo(mx + 5 * k, my); g.stroke(); }
  if (expr === 'determined' || expr === 'angry') { g.beginPath(); g.moveTo(ex[0] - 4 * k, ey - 8 * k); g.lineTo(ex[0] + 4 * k, ey - 6 * k); g.moveTo(ex[1] - 4 * k, ey - 6 * k); g.lineTo(ex[1] + 4 * k, ey - 8 * k); g.stroke(); }
  if (expr === 'thinking' || expr === 'worried') { g.beginPath(); g.moveTo(ex[1] - 4 * k, ey - 8 * k); g.lineTo(ex[1] + 4 * k, ey - 10 * k); g.stroke(); }
}
function cap(g, x, top, w, col, dir = 1) {
  g.beginPath(); g.moveTo(x - w / 2 - 2, top + 10); g.quadraticCurveTo(x - w / 2, top - 16, x, top - 17); g.quadraticCurveTo(x + w / 2, top - 16, x + w / 2 + 2, top + 10); g.closePath(); g.fillStyle = col; g.fill(); stroke(g, 3);
  rr(g, dir > 0 ? x + w * 0.2 : x - w * 0.2 - w * 0.62, top + 4, w * 0.62, 8, 4); g.fillStyle = shade(col, -0.15); g.fill(); stroke(g, 2.5);
  circle(g, x, top - 16, 3.5, shade(col, 0.2));
}

export function toyFigure(g, o) {
  const p = o.pose || POSES.stand, of = o.outfit || {}, s = (o.s ?? 1) * (of.kid ? 0.72 : 1), f = o.facing ?? 1;
  const top = of.top === 'labcoat' ? '#f4f6f8' : of.color || '#5a6a7a', legsC = of.legs || (of.top === 'labcoat' ? '#4a5260' : LEGS), hand = of.gloves || SKIN;
  g.save(); if (o.alpha != null) g.globalAlpha *= o.alpha;
  if (o.shadow !== false) { g.fillStyle = 'rgba(0,0,0,.18)'; g.beginPath(); g.ellipse(o.x, o.y + 2, 38 * s, 7 * s, 0, 0, Math.PI * 2); g.fill(); }
  g.translate(o.x, o.y); g.scale(f * s, s);
  const hip = p.hip, sh = p.sh, hy = hip[1];
  arm(g, [sh[0] - 2, sh[1] + 8], p.eB, p.hB, shade(top, -0.18), shade(hand, -0.1));
  leg(g, [hip[0], hy], p.fB, shade(legsC, -0.2), -12); leg(g, [hip[0], hy], p.fF, legsC, 12);
  blockRR(g, hip[0] - 32, hy - 12, 64, 18, 5, shade(legsC, -0.1));
  poly(g, [[hip[0] - 33, hy - 8], [hip[0] + 33, hy - 8], [sh[0] + 24, sh[1] + 2], [sh[0] - 24, sh[1] + 2]], top); g.beginPath(); g.moveTo(hip[0] - 33, hy - 8); g.lineTo(hip[0] + 33, hy - 8); g.lineTo(sh[0] + 24, sh[1] + 2); g.lineTo(sh[0] - 24, sh[1] + 2); g.closePath(); stroke(g, 3);
  if (of.top === 'labcoat') { g.strokeStyle = alpha(OUT(), 0.5); g.lineWidth = 2.5; g.beginPath(); g.moveTo(sh[0] - 8, sh[1] + 4); g.lineTo(hip[0] + 2, hy - 30); g.lineTo(sh[0] + 14, sh[1] + 4); g.moveTo(hip[0] + 2, hy - 30); g.lineTo(hip[0] + 2, hy - 8); g.stroke(); }
  else { g.fillStyle = alpha('#ffffff', 0.18); g.beginPath(); g.moveTo(hip[0] - 28, hy - 10); g.lineTo(sh[0] - 20, sh[1] + 4); g.lineTo(sh[0] - 10, sh[1] + 4); g.lineTo(hip[0] - 16, hy - 10); g.fill(); }
  const [hx, hcy] = p.head; blockRR(g, hx - 9, sh[1] - 12, 18, 14, 3, SKIN, 2.5);
  blockRR(g, hx - 25, hcy - 23, 50, 46, 12, SKIN); g.fillStyle = alpha('#ffffff', 0.25); rr(g, hx - 20, hcy - 18, 8, 34, 4); g.fill();
  faceFx(g, hx + 6, hcy + 1, 1, o.expr, o.blink, of.face === 'glasses');
  if (of.head === 'cap' || of.head === 'capBack') cap(g, hx, hcy - 23, 52, of.headColor || '#0b8a3e', 1);
  else if (of.head === 'bun') { circle(g, hx - 6, hcy - 28, 12, '#6a4a2a'); g.beginPath(); g.arc(hx - 6, hcy - 28, 12, 0, 7); stroke(g, 3); }
  arm(g, [sh[0] + 2, sh[1] + 8], p.eF, p.hF, top, hand);
  g.restore();
}

export function toyFace(g, cx, cy, r, o = {}) {
  const of = o.outfit || {}, top = of.top === 'labcoat' ? '#f4f6f8' : of.color || '#5a6a7a', k = r / 24, dir = (o.look?.[0] ?? 0.3) >= 0 ? 1 : -1;
  g.save(); g.translate(cx, cy);
  poly(g, [[-r * 1.5, r * 2.2], [r * 1.5, r * 2.2], [r * 1.05, r * 1.0], [-r * 1.05, r * 1.0]], top); g.beginPath(); g.moveTo(-r * 1.5, r * 2.2); g.lineTo(-r * 1.05, r * 1.0); g.lineTo(r * 1.05, r * 1.0); g.lineTo(r * 1.5, r * 2.2); stroke(g, r * 0.04);
  rr(g, -r * 0.4, r * 0.8, r * 0.8, r * 0.3, r * 0.08); g.fillStyle = SKIN; g.fill(); stroke(g, r * 0.04);
  rr(g, -r, -r * 0.95, r * 2, r * 1.85, r * 0.42); g.fillStyle = SKIN; g.fill(); stroke(g, r * 0.05);
  g.fillStyle = alpha('#ffffff', 0.28); rr(g, -r * 0.82, -r * 0.7, r * 0.22, r * 1.3, r * 0.1); g.fill();
  g.save(); g.scale(k, k); faceFx(g, 1.4 * dir, 6, 1.9, o.expr, o.blink, of.face === 'glasses'); g.restore();
  if (of.head === 'cap') { g.save(); g.scale(k * 1.0, k * 1.0); cap(g, 0, -0.95 * 24, 50, of.headColor || '#0b8a3e', dir); g.restore(); }
  g.restore();
}

E.figureRenderer = { drawFigure: toyFigure, bigFace: toyFace };
