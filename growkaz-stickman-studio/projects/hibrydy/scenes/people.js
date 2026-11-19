// people.js — flat line-art characters (front view) + scenery for the "hybrids" video.
// person(g, {x, y, s, who:'farmer'|'breeder', expr, blink, talk, armL, armR, propL, propR, look})
//   armL/armR = [upper, fore] angles in radians from hanging straight down (+ = outward/up).
import { rr, circle, poly, alpha, mix, shade } from '/engine/core.js';

export const INK = '#3a3f47', SKIN = '#f6d2ad', LW = 3.4;
export const C = { shirt: '#b9d7f2', plaid: '#7fa8d6', denim: '#4f7fae', boot: '#f4f6f8', cap: '#c9c24a', coat: '#eef0f2', blue: '#b9d7f2', trou: '#8a9098', shoe: '#5a6068', hair: '#a4a9ae', brown: '#8a6a4a', olive: '#c9c24a', sky: '#b7d8f2', skyD: '#8fbfe3' };

const ln = (g, w = LW) => { g.strokeStyle = INK; g.lineWidth = w; g.lineJoin = 'round'; g.lineCap = 'round'; g.stroke(); };
function shape(g, pts, fill) { g.beginPath(); g.moveTo(...pts[0]); for (let i = 1; i < pts.length; i++) g.lineTo(...pts[i]); g.closePath(); if (fill) { g.fillStyle = fill; g.fill(); } ln(g); }
function box(g, x, y, w, h, r, fill) { rr(g, x, y, w, h, r); if (fill) { g.fillStyle = fill; g.fill(); } ln(g); }
function oval(g, x, y, rx, ry, fill) { g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, 7); if (fill) { g.fillStyle = fill; g.fill(); } ln(g); }
function line(g, pts, w = LW, col = INK) { g.beginPath(); g.moveTo(...pts[0]); for (let i = 1; i < pts.length; i++) g.lineTo(...pts[i]); g.strokeStyle = col; g.lineWidth = w; g.lineCap = 'round'; g.lineJoin = 'round'; g.stroke(); }
function limb(g, pts, w, fill) { line(g, pts, w + LW * 2, INK); line(g, pts, w, fill); }
function plaid(g, x0, y0, x1, y1) { g.save(); g.strokeStyle = alpha(C.plaid, 0.75); g.lineWidth = 2; for (let x = x0; x < x1; x += 22) { g.beginPath(); g.moveTo(x, y0); g.lineTo(x, y1); g.stroke(); } for (let y = y0; y < y1; y += 22) { g.beginPath(); g.moveTo(x0, y); g.lineTo(x1, y); g.stroke(); } g.restore(); }

function face(g, o, who) {
  const ey = -652, blink = o.blink, lk = o.look || [0, 0], dx = lk[0] * 5, dy = lk[1] * 3;
  for (const sx of [-20, 20]) { if (blink) line(g, [[sx - 6 + dx, ey], [sx + 6 + dx, ey]], 3); else circle(g, sx + dx, ey + dy, 4.6, INK); }
  const br = o.expr === 'worried' || o.expr === 'thinking' ? 4 : o.expr === 'surprised' || o.expr === 'awe' ? -6 : 0;
  line(g, [[-30, ey - 15 - br], [-12, ey - 18]], 3); line(g, [[12, ey - 18], [30, ey - 15 - (o.expr === 'thinking' ? -4 : br)]], 3);
  line(g, [[2, -646], [-3, -628], [4, -626]], 2.6);
  const talk = o.talk || 0, my = -610;
  if (o.expr === 'surprised' || o.expr === 'awe') oval(g, 0, my, 7, 9 + talk * 3, '#9a4a4a');
  else if (talk > 0.15) { g.beginPath(); g.moveTo(-14, my - 3); g.quadraticCurveTo(0, my + 6 + talk * 10, 14, my - 3); g.closePath(); g.fillStyle = '#9a4a4a'; g.fill(); ln(g, 2.6); }
  else if (o.expr === 'worried' || o.expr === 'sad') line(g, [[-12, my + 2], [0, my - 3], [12, my + 2]], 2.8);
  else if (o.expr === 'neutral' || o.expr === 'thinking') line(g, [[-10, my], [10, my]], 2.8);
  else { g.beginPath(); g.arc(0, my - 14, 16, 0.55, Math.PI - 0.55); ln(g, 2.8); }
  if (who === 'breeder') { g.strokeStyle = shade(C.brown, -0.2); g.lineWidth = 3; for (const sx of [-20, 20]) { g.beginPath(); g.arc(sx, ey, 13, 0, 7); g.stroke(); } line(g, [[-7, ey - 2], [7, ey - 2]], 3, shade(C.brown, -0.2)); }
}

function head(g, o, who) {
  box(g, -15, -598, 30, 34, 6, SKIN);
  for (const sx of [-1, 1]) oval(g, sx * 52, -645, 9, 15, SKIN);
  oval(g, 0, -648, 50, 62, SKIN);
  if (who === 'farmer') {
    g.beginPath(); g.moveTo(-54, -668); g.quadraticCurveTo(-52, -724, 0, -726); g.quadraticCurveTo(54, -724, 56, -668); g.closePath(); g.fillStyle = C.cap; g.fill(); ln(g);
    g.beginPath(); g.moveTo(-58, -668); g.quadraticCurveTo(10, -684, 70, -662); g.quadraticCurveTo(10, -656, -58, -668); g.fillStyle = shade(C.cap, -0.12); g.fill(); ln(g);
    circle(g, 0, -726, 5, shade(C.cap, -0.1)); line(g, [[-20, -722], [-28, -680]], 2, alpha(INK, 0.4)); line(g, [[20, -722], [26, -680]], 2, alpha(INK, 0.4));
  } else {
    g.beginPath(); g.moveTo(-54, -640); g.quadraticCurveTo(-60, -712, -10, -716); g.quadraticCurveTo(40, -722, 54, -690); g.quadraticCurveTo(58, -668, 54, -640); g.lineTo(46, -640); g.quadraticCurveTo(44, -684, 10, -690); g.quadraticCurveTo(-40, -690, -46, -640); g.closePath(); g.fillStyle = C.hair; g.fill(); ln(g);
  }
  face(g, o, who);
}

function arm(g, side, ang, who, prop) {
  const [a1, a2] = ang || [0.08, 0.05], sx = side * (who === 'farmer' ? 70 : 76), sy = -545, L1 = 118, L2 = 112;
  const ex = sx + side * Math.sin(a1) * L1, ey = sy + Math.cos(a1) * L1, b = a1 + a2, hx = ex + side * Math.sin(b) * L2, hy = ey + Math.cos(b) * L2;
  if (who === 'farmer') { limb(g, [[sx, sy], [ex, ey]], 40, C.shirt); limb(g, [[ex, ey], [hx, hy]], 32, SKIN); const cx = ex + side * Math.sin(b) * 8, cy = ey + Math.cos(b) * 8; limb(g, [[ex, ey], [cx, cy]], 36, shade(C.shirt, -0.05)); }
  else { limb(g, [[sx, sy], [ex, ey]], 42, C.coat); limb(g, [[ex, ey], [hx - side * Math.sin(b) * 22, hy - Math.cos(b) * 22]], 40, C.coat); }
  if (prop) prop(g, hx, hy, side);
  oval(g, hx, hy, 17, 19, SKIN);
}

export function person(g, o) {
  const who = o.who || 'farmer', s = o.s ?? 1;
  g.save(); g.translate(o.x, o.y); g.scale(s, s);
  if (o.alpha != null) g.globalAlpha *= o.alpha;
  g.fillStyle = 'rgba(58,63,71,.08)'; g.beginPath(); g.ellipse(0, 4, 90, 9, 0, 0, 7); g.fill();
  if (who === 'farmer') {
    shape(g, [[-60, -340], [-4, -340], [-8, -100], [-56, -100]], C.denim); shape(g, [[4, -340], [60, -340], [56, -100], [8, -100]], C.denim);
    for (const sx of [-1, 1]) { box(g, sx > 0 ? 6 : -60, -112, 54, 112, 8, C.boot); line(g, [[sx > 0 ? 8 : -58, -88], [sx > 0 ? 58 : -8, -88]], 2, alpha(INK, 0.5)); }
    shape(g, [[-72, -556], [72, -556], [66, -330], [-66, -330]], C.shirt); g.save(); g.beginPath(); g.moveTo(-72, -556); g.lineTo(72, -556); g.lineTo(66, -330); g.lineTo(-66, -330); g.closePath(); g.clip(); plaid(g, -80, -560, 80, -320); g.restore();
    shape(g, [[-72, -556], [72, -556], [66, -330], [-66, -330]], null);
    shape(g, [[-48, -470], [48, -470], [52, -330], [-52, -330]], C.denim); box(g, -26, -440, 52, 46, 6, shade(C.denim, 0.08));
    line(g, [[-46, -470], [-52, -556]], 14, INK); line(g, [[-46, -470], [-52, -556]], 8, C.denim); line(g, [[46, -470], [52, -556]], 14, INK); line(g, [[46, -470], [52, -556]], 8, C.denim);
    shape(g, [[-16, -566], [0, -540], [-26, -548]], C.shirt); shape(g, [[16, -566], [0, -540], [26, -548]], C.shirt);
  } else {
    for (const sx of [-1, 1]) { shape(g, [[sx * 4, -330], [sx * 56, -330], [sx * 52, -26], [sx * 8, -26]], C.trou); oval(g, sx * 32, -14, 34, 14, C.shoe); }
    shape(g, [[-78, -560], [78, -560], [92, -250], [-92, -250]], C.coat);
    shape(g, [[-22, -566], [22, -566], [10, -440], [-10, -440]], C.blue); line(g, [[0, -540], [0, -440]], 2, alpha(INK, 0.5));
    shape(g, [[-22, -566], [-6, -470], [-40, -500]], C.coat); shape(g, [[22, -566], [6, -470], [40, -500]], C.coat);
    line(g, [[0, -440], [0, -250]], LW); box(g, -78, -370, 44, 46, 5, C.coat); box(g, 34, -370, 44, 46, 5, C.coat); line(g, [[40, -500], [70, -500]], 2.4);
  }
  head(g, o, who);
  arm(g, -1, o.armL, who, o.propL); arm(g, 1, o.armR, who, o.propR);
  g.restore();
}

// ---------- props (drawn at the hand point, before the hand) ----------
export const rake = (g, x, y) => { line(g, [[x, y - 330], [x - 4, y + 260]], 9, INK); line(g, [[x, y - 330], [x - 4, y + 260]], 4, C.olive); box(g, x - 52, y - 352, 104, 16, 4, C.olive); for (let i = 0; i < 8; i++) line(g, [[x - 46 + i * 13, y - 352], [x - 46 + i * 13, y - 384]], 3); };
export const flask = (g, x, y) => { g.save(); g.translate(x, y - 40); g.beginPath(); g.moveTo(-12, -60); g.lineTo(-12, -24); g.lineTo(-44, 36); g.lineTo(44, 36); g.lineTo(12, -24); g.lineTo(12, -60); g.closePath(); g.fillStyle = '#ffffff'; g.fill(); g.beginPath(); g.moveTo(-30, 8); g.lineTo(30, 8); g.lineTo(44, 36); g.lineTo(-44, 36); g.closePath(); g.fillStyle = C.olive; g.fill(); g.beginPath(); g.moveTo(-12, -60); g.lineTo(-12, -24); g.lineTo(-44, 36); g.lineTo(44, 36); g.lineTo(12, -24); g.lineTo(12, -60); ln(g); line(g, [[-18, -60], [18, -60]], 4); g.restore(); };
export const magnifier = (g, x, y) => { line(g, [[x, y], [x + 6, y - 50]], 10, INK); line(g, [[x, y], [x + 6, y - 50]], 5, '#6a7a8a'); g.beginPath(); g.arc(x + 10, y - 86, 34, 0, 7); g.fillStyle = 'rgba(230,242,252,.9)'; g.fill(); g.strokeStyle = INK; g.lineWidth = 9; g.stroke(); g.strokeStyle = '#8fb0d0'; g.lineWidth = 4; g.stroke(); };
export const clipboard = (g, x, y) => { box(g, x - 40, y - 110, 80, 104, 6, '#c9a46a'); box(g, x - 32, y - 98, 64, 86, 3, '#ffffff'); for (let i = 0; i < 4; i++) line(g, [[x - 24, y - 82 + i * 18], [x + 22 - (i % 2) * 12, y - 82 + i * 18]], 2, alpha(INK, 0.6)); };

// ---------- scenery ----------
export function cloud(g, x, y, s = 1) { g.save(); g.translate(x, y); g.scale(s, s); g.beginPath(); g.moveTo(-90, 20); g.quadraticCurveTo(-92, -10, -60, -12); g.quadraticCurveTo(-50, -52, -6, -46); g.quadraticCurveTo(20, -74, 54, -44); g.quadraticCurveTo(92, -40, 90, 20); g.closePath(); g.fillStyle = C.sky; g.fill(); g.beginPath(); g.moveTo(-90, 20); g.quadraticCurveTo(-92, -10, -60, -12); g.quadraticCurveTo(-40, -10, -36, 20); g.closePath(); g.fillStyle = C.skyD; g.fill(); g.strokeStyle = C.skyD; g.lineWidth = 3; g.beginPath(); g.moveTo(-90, 20); g.lineTo(90, 20); g.stroke(); g.restore(); }
export function bird(g, x, y, s = 1, ph = 0) { const f = Math.sin(ph) * 6; g.beginPath(); g.moveTo(x - 22 * s, y - 8 * s - f); g.quadraticCurveTo(x - 8 * s, y - 14 * s - f, x, y); g.quadraticCurveTo(x + 10 * s, y - 16 * s + f, x + 26 * s, y - 6 * s + f); g.strokeStyle = INK; g.lineWidth = 3; g.lineCap = 'round'; g.stroke(); }
export function ground(g, y, x0 = -200, x1 = 2200) { line(g, [[x0, y], [x1, y]], 3); }
export function grass(g, x, y) { line(g, [[x - 8, y], [x - 12, y - 18]], 2.5); line(g, [[x, y], [x, y - 24]], 2.5); line(g, [[x + 8, y], [x + 14, y - 16]], 2.5); }
// line-art corn plant; h height, o: {cob (0..1), tassel, color, sway}
export function cornLine(g, x, y, h, o = {}) {
  const sw = o.sway || 0, col = o.color || '#9cc46a', top = [x + sw, y - h];
  g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + sw * 0.4, y - h * 0.5, top[0], top[1]); g.strokeStyle = INK; g.lineWidth = 8; g.stroke(); g.strokeStyle = col; g.lineWidth = 3.5; g.stroke();
  for (let i = 0; i < 5; i++) { const k = 0.18 + i * 0.15, px = x + sw * k * k, py = y - h * k, side = i % 2 ? 1 : -1, L = h * (0.34 - k * 0.15); g.beginPath(); g.moveTo(px, py); g.quadraticCurveTo(px + side * L * 0.55, py - L * 0.55, px + side * L, py - L * 0.05 + 8); g.quadraticCurveTo(px + side * L * 0.5, py - L * 0.3, px, py + 10); g.closePath(); g.fillStyle = col; g.fill(); ln(g, 2.6); }
  if (o.tassel !== false) for (let s = -2; s <= 2; s++) line(g, [top, [top[0] + s * 10, top[1] - 24 + Math.abs(s) * 6]], 2.6);
  if (o.cob) { const px = x + sw * 0.3, py = y - h * 0.5, c = o.cob; g.save(); g.translate(px + 12, py); g.rotate(0.35); oval(g, 0, 0, 10 * c + 4, 30 * c + 8, '#f2c94c'); g.restore(); }
}
export function tubes(g, x, y) { box(g, x - 70, y - 10, 140, 10, 2, '#ffffff'); line(g, [[x - 60, y - 70], [x + 60, y - 70]], 3); for (let i = 0; i < 3; i++) { const tx = x - 40 + i * 40; rr(g, tx - 10, y - 110, 20, 100, 10); g.fillStyle = '#ffffff'; g.fill(); ln(g); rr(g, tx - 7, y - 60, 14, 46, 7); g.fillStyle = C.sky; g.fill(); } }
