// engine/sheet2d.js — the "sheet" look: flat outlined cartoon characters + flat set helpers.
// Pair with style "sheet" (config.json → "style": "sheet"). Characters come from the user's character sheets:
//   FARMER  = { sheet: 'farmer' }   bearded farmer: green cap, yellow tee, blue overalls, brown boots (prop: 'radio')
//   BREEDER = { sheet: 'breeder' }  scientist/breeder: brown hair, round glasses, green lab coat (prop: 'tablet')
// drawFigure / bigFace keep the rig2d signatures (pose, facing, expr, blink, look, prop, alpha, rot);
// outfits without `sheet` fall through to the classic rig2d stick figure. Recolour a preset by editing PAL in a project.
import { E, S, V, lerp, rr, alpha, shade, rng } from '/engine/core.js';
import { drawFigure as rigFigure, bigFace as rigFace } from '/engine/rig2d.js';
export { POSES, posesAt, breathe, walkPose, headPos } from '/engine/rig2d.js';

const INK = '#2b2622', LW = 3.2;
export const PAL = {
  skin: '#f6d9bd', skinD: '#e9c3a0',
  farmer: { cap: '#5aa04e', capD: '#3f8038', beard: '#2b2622', tee: '#f6cf5a', overall: '#4f86c0', overallD: '#3f6fa3', boot: '#a8642c' },
  breeder: { hair: '#4a3427', coat: '#78ae7a', coatD: '#5f9461', pants: '#3f5a44', shoe: '#2f3a30' },
};

// outlined thick polyline
function limb(g, pts, w, col) {
  g.lineCap = 'round'; g.lineJoin = 'round';
  const path = () => { g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]); };
  path(); g.strokeStyle = INK; g.lineWidth = w + LW * 2; g.stroke();
  path(); g.strokeStyle = col; g.lineWidth = w; g.stroke();
}
function blob(g, pts, col, close = true) { g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]); if (close) g.closePath(); g.fillStyle = col; g.fill(); g.lineWidth = LW; g.strokeStyle = INK; g.lineJoin = 'round'; g.stroke(); }
function disc(g, x, y, r, col) { g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = col; g.fill(); g.lineWidth = LW; g.strokeStyle = INK; g.stroke(); }
const L = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];

// ---- face (drawn in head space: centre 0,0, radius R, x mirrored by facing) ----
function face(g, R, who, expr = 'neutral', blink = false, side = 0.22, look = [0, 0]) {
  const ox = R * side + look[0] * R * 0.06, oy = look[1] * R * 0.05, ex = R * 0.3, ey = -R * 0.05 + oy, er = R * 0.085;
  const glasses = who === 'breeder', ink = INK;
  // brows
  const browY = ey - R * (glasses ? 0.36 : 0.3), bw = R * 0.18;
  const brow = (x, tilt) => { g.beginPath(); g.moveTo(x - bw, browY + tilt * R * 0.08); g.lineTo(x + bw, browY - tilt * R * 0.08); g.lineWidth = LW * 1.1; g.strokeStyle = ink; g.lineCap = 'round'; g.stroke(); };
  const B = { worried: [-1, 1], sad: [-1, 1], nervous: [-1, 1], scared: [-1, 1], cry: [-1, 1], angry: [1, -1], determined: [0.7, -0.7], thinking: [0.6, -0.2], confused: [-0.8, 0.3], surprised: [-0.3, 0.3], shocked: [-0.4, 0.4], awe: [-0.3, 0.3], smirk: [0.4, -0.1] }[expr];
  if (B) { brow(ox - ex, -B[0]); brow(ox + ex, B[1]); }
  // eyes
  for (const s of [-1, 1]) {
    const x = ox + s * ex;
    if (blink) { g.beginPath(); g.moveTo(x - er, ey); g.lineTo(x + er, ey); g.lineWidth = LW; g.strokeStyle = ink; g.stroke(); }
    else { g.beginPath(); g.arc(x + look[0] * er * 0.4, ey + look[1] * er * 0.4, (['surprised', 'shocked', 'awe'].includes(expr) ? 1.25 : 1) * er, 0, Math.PI * 2); g.fillStyle = ink; g.fill(); }
    if (glasses) { g.beginPath(); g.arc(x, ey, R * 0.24, 0, Math.PI * 2); g.lineWidth = LW * 1.1; g.strokeStyle = ink; g.stroke(); }
  }
  if (glasses) { g.beginPath(); g.moveTo(ox - ex + R * 0.24, ey); g.lineTo(ox + ex - R * 0.24, ey); g.moveTo(ox + ex + R * 0.24, ey); g.lineTo(R * 0.98, ey - R * 0.04); g.moveTo(ox - ex - R * 0.24, ey); g.lineTo(-R * 0.92, ey - R * 0.04); g.lineWidth = LW; g.strokeStyle = ink; g.stroke(); }
  // mouth
  const my = R * 0.42 + oy, mx = ox, mw = R * 0.2;
  g.lineWidth = LW * 1.1; g.strokeStyle = ink; g.lineCap = 'round'; g.beginPath();
  if (['smile', 'happy'].includes(expr)) { g.arc(mx, my - mw * 0.6, mw, 0.25 * Math.PI, 0.75 * Math.PI); g.stroke(); }
  else if (['joy', 'cheer'].includes(expr)) { g.arc(mx, my - mw * 0.3, mw, 0, Math.PI); g.closePath(); g.fillStyle = '#fff'; g.fill(); g.stroke(); }
  else if (['surprised', 'shocked', 'awe', 'scared'].includes(expr)) { g.ellipse(mx, my, mw * 0.4, mw * 0.55, 0, 0, Math.PI * 2); g.fillStyle = ink; g.fill(); }
  else if (['worried', 'sad', 'nervous', 'cry', 'angry'].includes(expr)) { g.arc(mx, my + mw * 0.7, mw * 0.8, 1.2 * Math.PI, 1.8 * Math.PI); g.stroke(); }
  else if (['smirk', 'thinking', 'confused'].includes(expr)) { g.moveTo(mx - mw * 0.7, my + (expr === 'smirk' ? 0 : mw * 0.15)); g.quadraticCurveTo(mx, my + mw * 0.15, mx + mw * 0.8, my - mw * 0.3); g.stroke(); }
  else { g.moveTo(mx - mw * 0.7, my); g.lineTo(mx + mw * 0.7, my); g.stroke(); }
}

// ---- head (head space; f = facing so caps/hair turn) ----
function head(g, R, who, o) {
  const p = PAL, side = o.front ? 0 : 0.22;
  if (who === 'farmer') {
    for (const s of [-1, 1]) disc(g, s * R * 0.98, R * 0.08, R * 0.17, p.skin);               // ears
    disc(g, 0, 0, R, p.skin);
    // beard: lower crescent hugging the jaw, mouth window
    g.save(); g.beginPath(); g.arc(0, 0, R, 0, Math.PI * 2); g.clip();
    g.beginPath(); g.moveTo(-R * 1.05, R * 0.02); g.quadraticCurveTo(-R * 0.6, R * 0.32, R * side - R * 0.32, R * 0.3); g.quadraticCurveTo(R * side, R * 0.2, R * side + R * 0.32, R * 0.3); g.quadraticCurveTo(R * 0.6, R * 0.32, R * 1.05, R * 0.02); g.lineTo(R * 1.1, R * 1.2); g.lineTo(-R * 1.1, R * 1.2); g.closePath(); g.fillStyle = p.farmer.beard; g.fill();
    g.beginPath(); g.ellipse(R * side, R * 0.44, R * 0.26, R * 0.13, 0, 0, Math.PI * 2); g.fillStyle = p.skin; g.fill();
    g.restore();
    g.beginPath(); g.arc(0, 0, R, 0, Math.PI * 2); g.lineWidth = LW; g.strokeStyle = INK; g.stroke();
    face(g, R, who, o.expr, o.blink, side, o.look || [0, 0]);
    // cap: crown + brim toward facing (+x)
    blob(g, [[-R * 1.02, -R * 0.28], [-R * 0.95, -R * 0.8], [-R * 0.45, -R * 1.12], [R * 0.25, -R * 1.14], [R * 0.85, -R * 0.85], [R * 1.02, -R * 0.3]], p.farmer.cap);
    blob(g, [[R * 0.1, -R * 0.32], [R * 1.0, -R * 0.36], [R * 1.42, -R * 0.26], [R * 1.4, -R * 0.14], [R * 0.95, -R * 0.12], [R * 0.1, -R * 0.2]], p.farmer.capD);
    disc(g, -R * 0.1, -R * 1.14, R * 0.08, p.farmer.cap);
  } else {
    disc(g, 0, 0, R, p.skin);
    face(g, R, who, o.expr, o.blink, side, o.look || [0, 0]);
    // hair: cap of hair with side-swept fringe toward the face side
    blob(g, [[-R * 1.0, R * 0.1], [-R * 1.03, -R * 0.45], [-R * 0.7, -R * 0.92], [0, -R * 1.06], [R * 0.7, -R * 0.9], [R * 0.98, -R * 0.45], [R * 0.75, -R * 0.55], [R * 0.3, -R * 0.42], [-R * 0.25, -R * 0.62], [-R * 0.55, -R * 0.35], [-R * 0.78, R * 0.05]], p.breeder.hair);
  }
}

function prop(g, kind, x, y) {
  if (kind === 'tablet') { g.save(); g.translate(x, y - 8); g.rotate(-0.15); rr(g, -26, -34, 52, 68, 7); g.fillStyle = '#4a4e56'; g.fill(); g.lineWidth = LW; g.strokeStyle = INK; g.stroke(); rr(g, -19, -26, 38, 52, 3); g.fillStyle = '#6a7078'; g.fill(); g.beginPath(); g.moveTo(-14, 16); g.lineTo(-4, 2); g.lineTo(4, 8); g.lineTo(14, -14); g.strokeStyle = '#d6dbe0'; g.lineWidth = 2.5; g.stroke(); g.restore(); }
  if (kind === 'radio') { g.save(); g.translate(x, y); rr(g, -11, -34, 22, 40, 5); g.fillStyle = '#c4c6c8'; g.fill(); g.lineWidth = LW; g.strokeStyle = INK; g.stroke(); rr(g, -7, -28, 14, 9, 2); g.fillStyle = '#8a9a8a'; g.fill(); g.beginPath(); g.moveTo(-5, -34); g.lineTo(-5, -50); g.lineWidth = 4; g.strokeStyle = INK; g.stroke(); g.restore(); }
}

function body(g, p, who, o) {
  const P = PAL, F = who === 'farmer' ? P.farmer : P.breeder;
  const legCol = who === 'farmer' ? F.overall : F.pants, footCol = who === 'farmer' ? F.boot : F.shoe;
  const foot = (k, f, near) => { limb(g, [p.hip, k, f], 19, near ? legCol : shade(legCol, -0.12)); rr(g, f[0] - 10, f[1] - 13, 34, 15, 6); g.fillStyle = near ? footCol : shade(footCol, -0.1); g.fill(); g.lineWidth = LW; g.strokeStyle = INK; g.stroke(); };
  const arm = (e, h, near) => {
    if (who === 'farmer') { limb(g, [p.sh, e, h], 8.5, near ? P.skin : P.skinD); limb(g, [p.sh, L(p.sh, e, 0.55)], 17, near ? F.tee : shade(F.tee, -0.1)); }
    else limb(g, [p.sh, e, L(e, h, 0.82)], 15, near ? F.coat : F.coatD);
    disc(g, h[0], h[1], 7.5, near ? P.skin : P.skinD);
  };
  foot(p.kB, p.fB, false); arm(p.eB, p.hB, false);
  const dx = p.sh[0] - p.hip[0];
  if (who === 'farmer') {
    blob(g, [[p.sh[0] - 17, p.sh[1] - 4], [p.sh[0] + 17, p.sh[1] - 4], [p.hip[0] + 16, p.hip[1] - 10], [p.hip[0] - 16, p.hip[1] - 10]], F.tee);
    blob(g, [[p.hip[0] - 18, p.hip[1] + 6], [p.hip[0] - 16, p.hip[1] - 40], [L(p.sh, p.hip, 0.3)[0] - 12, L(p.sh, p.hip, 0.3)[1]], [L(p.sh, p.hip, 0.3)[0] + 12, L(p.sh, p.hip, 0.3)[1]], [p.hip[0] + 16, p.hip[1] - 40], [p.hip[0] + 18, p.hip[1] + 6]], F.overall);
    rr(g, L(p.sh, p.hip, 0.45)[0] - 7, L(p.sh, p.hip, 0.45)[1], 14, 10, 3); g.lineWidth = LW * 0.8; g.strokeStyle = INK; g.stroke();
    for (const s of [-1, 1]) { g.beginPath(); g.moveTo(p.sh[0] + s * 11, p.sh[1] - 2); g.lineTo(L(p.sh, p.hip, 0.3)[0] + s * 9, L(p.sh, p.hip, 0.3)[1]); g.lineWidth = 6; g.strokeStyle = INK; g.stroke(); g.lineWidth = 3; g.strokeStyle = F.overall; g.stroke(); }
  } else {
    const kn = L(p.kF, p.kB, 0.5), hem = [kn[0], kn[1] + 6];
    blob(g, [[p.sh[0] - 18, p.sh[1] - 4], [p.sh[0] + 18, p.sh[1] - 4], [p.hip[0] + 21 + dx * 0.1, p.hip[1]], [hem[0] + 24, hem[1]], [hem[0] - 24, hem[1]], [p.hip[0] - 21, p.hip[1]]], F.coat);
    g.beginPath(); g.moveTo(p.sh[0] + 4, p.sh[1]); g.lineTo(hem[0] + 4, hem[1]); g.lineWidth = LW * 0.8; g.strokeStyle = INK; g.stroke();
    blob(g, [[p.sh[0] - 9, p.sh[1] - 3], [p.sh[0] + 4, p.sh[1] + 26], [p.sh[0] + 11, p.sh[1] - 3]], '#a9cfa8');
  }
  foot(p.kF, p.fF, true);
  if (who === 'breeder') { const kn = L(p.kF, p.kB, 0.5); blob(g, [[p.hip[0] - 21, p.hip[1] - 6], [p.hip[0] + 21, p.hip[1] - 6], [kn[0] + 24, kn[1] + 6], [kn[0] - 24, kn[1] + 6]], F.coat); }
  if (o.prop) prop(g, o.prop, p.hF[0] + 4, p.hF[1]);
  arm(p.eF, p.hF, true);
}

export function drawFigure(g, o) {
  const who = o.outfit?.sheet; if (!who) return rigFigure(g, o);
  const p = o.pose || POSES_STAND, s = o.s ?? 1, f = o.facing ?? 1, R = 34;
  g.save(); if (o.alpha != null) g.globalAlpha *= o.alpha;
  if (o.shadow !== false) { g.fillStyle = 'rgba(43,38,34,.16)'; g.beginPath(); g.ellipse(o.x, o.y + 2, 40 * s, 7 * s, 0, 0, Math.PI * 2); g.fill(); }
  g.translate(o.x, o.y); g.scale(f * s, s); if (o.rot) { g.translate(p.hip[0], p.hip[1]); g.rotate(o.rot); g.translate(-p.hip[0], -p.hip[1]); }
  body(g, p, who, o);
  const hx = lerp(p.sh[0], p.head[0], 1.1), hy = p.sh[1] - R * 1.05 + (p.head[1] + 208) * 0.6;
  g.save(); g.translate(hx, hy); head(g, R, who, { expr: o.expr, blink: o.blink, look: o.look ? [o.look[0] * f, o.look[1]] : [0, 0] }); g.restore();
  g.restore();
}
const POSES_STAND = { head: [3, -208], sh: [0, -174], hip: [0, -100], eF: [9, -137], hF: [13, -101], eB: [-7, -136], hB: [-9, -100], kF: [6, -50], fF: [3, 0], kB: [-6, -50], fB: [-11, 0] };

// giant close-up: head + shoulders. o.rimSide (-1/1) is used as facing
export function bigFace(g, cx, cy, r, o = {}) {
  const who = o.outfit?.sheet; if (!who) return rigFace(g, cx, cy, r, o);
  const f = o.facing ?? (o.rimSide ? -o.rimSide : 1), k = r / 34 * 0.72, P = PAL;
  g.save(); g.translate(cx, cy); g.scale(f * k, k); if (o.tilt) g.rotate(o.tilt);
  // shoulders
  if (who === 'farmer') { blob(g, [[-62, 30], [62, 30], [96, 230], [-96, 230]], P.farmer.tee); blob(g, [[-30, 52], [30, 52], [40, 232], [-40, 232]], P.farmer.overall); for (const s of [-1, 1]) { g.beginPath(); g.moveTo(s * 22, 30); g.lineTo(s * 24, 54); g.lineWidth = 7; g.strokeStyle = INK; g.stroke(); g.lineWidth = 3.5; g.strokeStyle = P.farmer.overall; g.stroke(); } }
  else { blob(g, [[-64, 30], [64, 30], [98, 230], [-98, 230]], P.breeder.coat); blob(g, [[-12, 30], [0, 66], [12, 30]], '#a9cfa8'); g.beginPath(); g.moveTo(0, 66); g.lineTo(0, 230); g.lineWidth = LW; g.strokeStyle = INK; g.stroke(); }
  disc(g, 0, 26, 12, P.skin);
  head(g, 34, who, { expr: o.expr, blink: o.blink, look: o.look ? [o.look[0] * f, o.look[1]] : [0, 0] });
  g.restore();
}

// ---------- flat set helpers (sheet style: flat fills + ink outlines, no glow) ----------
const ink = () => S().ink || INK;
export function outlined(g, w = 3) { g.lineWidth = w; g.strokeStyle = ink(); g.lineJoin = 'round'; g.lineCap = 'round'; g.stroke(); }
export function flatSun(g, x, y, r, col) { g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = col || '#ffd34d'; g.fill(); outlined(g, 3); }
export function cloud(g, x, y, s = 1, col = '#ffffff') { g.save(); g.translate(x, y); g.scale(s, s); g.beginPath(); g.moveTo(-120, 30); g.arc(-70, 10, 50, Math.PI * 0.9, Math.PI * 1.75); g.arc(5, -15, 65, Math.PI * 1.15, Math.PI * 1.9); g.arc(80, 10, 45, Math.PI * 1.3, Math.PI * 0.1); g.lineTo(-120, 30); g.closePath(); g.fillStyle = col; g.fill(); outlined(g, 3); g.restore(); }
export function hillsFlat(g, y, amp, col, seed = 3) { const R = rng(seed); g.beginPath(); g.moveTo(-E.W, E.H * 2); g.lineTo(-E.W, y); for (let x = -E.W; x <= E.W * 2; x += 120) g.lineTo(x, y - Math.abs(Math.sin(x * 0.003 + seed)) * amp - R() * 10); g.lineTo(E.W * 2, E.H * 2); g.closePath(); g.fillStyle = col; g.fill(); outlined(g, 3); }
export function groundFlat(g, y, col) { g.fillStyle = col; g.fillRect(-E.W, y, E.W * 3, E.H * 2); g.beginPath(); g.moveTo(-E.W, y); g.lineTo(E.W * 2, y); outlined(g, 3); }
// simple outdoor backdrop: sky gradient from mood, outlined sun and clouds; returns nothing (draw inside a layer at depth ~0.1)
export function skyFlat(g, M, o = {}) { const { sun = [E.W * 0.25, E.H * V(0.2, 0.25)], clouds = 4, seed = 5 } = o; g.fillStyle = (() => { const gr = g.createLinearGradient(0, 0, 0, E.H); M.sky.forEach((c, i) => gr.addColorStop(i / (M.sky.length - 1), c)); return gr; })(); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3); if (sun) flatSun(g, sun[0], sun[1], V(70, 80), M.key); const R = rng(seed); for (let i = 0; i < clouds; i++) cloud(g, -E.W * 0.3 + i * V(700, 520) + R() * 200, E.H * V(0.12, 0.1) + R() * 240, V(1, 1.1) * (0.8 + R() * 0.4)); }
