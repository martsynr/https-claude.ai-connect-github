// sets/person.js — front-view flat line-art people (Ivan the farmer, the agronomist) in the reference illustration style.
import { lerp, clamp, ease, prog } from '/engine/core.js';

export const OL = '#3d434a';
export const PAL = {
  skin: '#f7dcbc', ivanShirt: '#b4d3ee', ivanCheck: '#7aa6d2', overall: '#4f7fae', cap: '#c8c24e', capDark: '#aea73a', boot: '#ffffff',
  coat: '#eef0f2', agroShirt: '#bcd7ee', trousers: '#8d949b', shoe: '#6a7078', hair: '#a7adb3', vest: '#8a9d62', vestDk: '#738650', jeans: '#6f93bf', jeansLt: '#9db8d8', gcap: '#7f9a52', gcapDk: '#6a8442', brown: '#8a6a4a', mouth: '#b85a52',
};
let LW = 4;
const P = (g) => { g.beginPath(); };
function fillStroke(g, fill) { if (fill) { g.fillStyle = fill; g.fill(); } g.strokeStyle = OL; g.lineWidth = LW; g.lineJoin = 'round'; g.lineCap = 'round'; g.stroke(); }
function rect(g, x, y, w, h, r, fill) { r = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2); g.beginPath(); g.roundRect ? g.roundRect(x, y, w, h, r) : g.rect(x, y, w, h); fillStroke(g, fill); }
function ell(g, x, y, rx, ry, fill, a0 = 0, a1 = Math.PI * 2) { g.beginPath(); g.ellipse(x, y, rx, ry, 0, a0, a1); fillStroke(g, fill); }
function line(g, pts, w = LW, col = OL) { g.strokeStyle = col; g.lineWidth = w; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); g.moveTo(...pts[0]); for (const p of pts.slice(1)) g.lineTo(...p); g.stroke(); }
function capsule(g, pts, w, fill) { line(g, pts, w + LW * 2, OL); line(g, pts, w, fill); }

// arm poses: [shoulderAngle, elbowBend] (0,0 = hanging straight down; positive = outward / up)
export const ARM = { down: [0.08, 0.05], hold: [0.15, -1.75], stop: [1.3, 1.85], up: [1.4, 1.75], phone: [0.9, 2.6], shrug: [0.3, 1.3], face: [0.9, 2.9], hip: [0.6, -1.9], reach: [0.5, -0.6], wrench: [0.45, -1.2], point: [1.35, 0.15] };
const armAt = (t, keys) => { if (!Array.isArray(keys[0])) return ARM[keys] || keys; let a = ARM[keys[0][1]]; for (let i = 1; i < keys.length; i++) { const [tk, nm] = keys[i], k = ease.inOut(prog(t, tk - 0.15, tk + 0.15)); if (k > 0) a = [lerp(a[0], ARM[nm][0], k), lerp(a[1], ARM[nm][1], k)]; } return a; };

function face(g, o) {
  const { expr = 'neutral', blink = false, look = [0, 0], glasses = false } = o, ey = -588, lx = look[0] * 4, ly = look[1] * 3;
  // brows
  const br = { neutral: [0, 0], smile: [0, 0], happy: [-3, -3], shocked: [-10, -10], worried: [6, -6], determined: [-6, 6], thinking: [-8, 2], sad: [6, -6] }[expr] || [0, 0];
  line(g, [[-30, -606 + br[1]], [-8, -606 + br[0]]], LW * 0.9); line(g, [[8, -606 + br[0]], [30, -606 + br[1]]], LW * 0.9);
  for (const sx of [-19, 19]) { if (blink) line(g, [[sx - 6, ey], [sx + 6, ey]], LW * 0.9); else { g.beginPath(); g.ellipse(sx + lx, ey + ly, expr === 'shocked' ? 5 : 4, expr === 'shocked' ? 7 : 5.5, 0, 0, 7); g.fillStyle = OL; g.fill(); } }
  if (glasses) { for (const sx of [-19, 19]) { g.beginPath(); g.arc(sx, ey, 15, 0, 7); g.strokeStyle = OL; g.lineWidth = LW * 0.8; g.stroke(); } line(g, [[-4, ey - 2], [4, ey - 2]], LW * 0.8); line(g, [[-34, ey - 3], [-48, ey - 6]], LW * 0.8); line(g, [[34, ey - 3], [48, ey - 6]], LW * 0.8); }
  line(g, [[0, -580], [-4, -566], [2, -564]], LW * 0.8);                                              // nose
  const my = -548;
  g.strokeStyle = OL; g.lineWidth = LW * 0.9;
  if (expr === 'smile' || expr === 'thinking') { g.beginPath(); g.arc(expr === 'thinking' ? 6 : 0, my - 10, 14, 0.35, Math.PI - 0.35); g.stroke(); }
  else if (expr === 'happy') { g.beginPath(); g.moveTo(-16, my - 4); g.quadraticCurveTo(0, my + 18, 16, my - 4); g.closePath(); g.fillStyle = PAL.mouth; g.fill(); g.stroke(); }
  else if (expr === 'shocked') { g.beginPath(); g.ellipse(0, my, 9, 12, 0, 0, 7); g.fillStyle = PAL.mouth; g.fill(); g.stroke(); }
  else if (expr === 'worried' || expr === 'sad') { g.beginPath(); g.arc(0, my + 10, 13, Math.PI + 0.5, -0.5); g.stroke(); }
  else if (expr === 'determined') line(g, [[-12, my], [12, my - 2]], LW * 0.9);
  else line(g, [[-10, my], [10, my]], LW * 0.9);
}

function head(g, o) {
  const agro = o.who === 'agro';
  rect(g, -17, -535, 34, 42, 6, PAL.skin);                                                           // neck
  ell(g, -50, -582, 9, 14, PAL.skin); ell(g, 50, -582, 9, 14, PAL.skin);                               // ears
  ell(g, 0, -584, 50, 58, PAL.skin);
  if (agro) {                                                                                          // green baseball cap, sideburns
    for (const sd of [-1, 1]) { g.beginPath(); g.moveTo(sd * 50, -612); g.lineTo(sd * 50, -580); g.lineTo(sd * 43, -586); g.lineTo(sd * 42, -612); g.closePath(); fillStroke(g, PAL.brown); }
    g.beginPath(); g.moveTo(-54, -612); g.bezierCurveTo(-56, -688, 56, -688, 54, -612); g.quadraticCurveTo(0, -620, -54, -612); g.closePath(); fillStroke(g, PAL.gcap);
    line(g, [[0, -672], [0, -618]], LW * 0.7); line(g, [[-30, -662], [-34, -616]], LW * 0.6); line(g, [[30, -662], [34, -616]], LW * 0.6); ell(g, 0, -673, 7, 4, PAL.gcapDk);
    g.beginPath(); g.moveTo(-58, -613); g.quadraticCurveTo(0, -622, 58, -613); g.quadraticCurveTo(0, -592, -58, -613); g.closePath(); fillStroke(g, PAL.gcapDk);
  } else {                                                                                             // flat cap
    line(g, [[-46, -596], [-50, -575]], LW * 0.8); line(g, [[46, -596], [50, -575]], LW * 0.8);
    g.beginPath(); g.moveTo(-56, -598); g.bezierCurveTo(-62, -660, 40, -676, 60, -616); g.lineTo(58, -600); g.closePath(); fillStroke(g, PAL.cap);
    g.beginPath(); g.moveTo(-6, -606); g.quadraticCurveTo(50, -620, 82, -600); g.quadraticCurveTo(50, -590, -6, -598); g.closePath(); fillStroke(g, PAL.capDark);
    ell(g, -2, -652, 6, 4, PAL.capDark);
  }
  face(g, { ...o, glasses: agro });
}

// prop at hand position (hx, hy) with forearm angle fa
function prop(g, name, hx, hy, fa, side) {
  g.save(); g.translate(hx, hy);
  if (name === 'phone') { g.rotate(-side * 0.5); rect(g, -12, -58, 24, 50, 5, '#59636c'); rect(g, -8, -52, 16, 36, 3, '#cfe3f3'); }
  else if (name === 'wrench') { g.rotate(side * 0.6); capsule(g, [[0, 10], [0, -90]], 12, '#aeb6be'); g.beginPath(); g.arc(0, -100, 18, 0.9, Math.PI * 2 + 0.25); g.lineTo(0, -100); g.closePath(); fillStroke(g, '#aeb6be'); }
  else if (name === 'magnifier') { capsule(g, [[0, 6], [side * 4, -50]], 10, '#7a828a'); g.beginPath(); g.arc(side * 8, -84, 30, 0, 7); g.fillStyle = 'rgba(205,228,246,.7)'; g.fill(); g.strokeStyle = OL; g.lineWidth = LW * 1.6; g.stroke(); }
  else if (name === 'tablet') { rect(g, -50, -64, 100, 76, 8, '#59636c'); rect(g, -42, -56, 84, 58, 4, '#e3f0d6'); }
  g.restore();
}

function arm(g, side, ang, o, sleeve, cuff, sh) {
  const [a1, a2] = ang, S = [side * 78, -492 + sh], L1 = 122, L2 = 112;
  const Ep = [S[0] + side * Math.sin(a1) * L1, S[1] + Math.cos(a1) * L1], fa = a1 + a2, H = [Ep[0] + side * Math.sin(fa) * L2, Ep[1] + Math.cos(fa) * L2];
  capsule(g, [S, Ep], 42, sleeve);
  if (cuff) { capsule(g, [Ep, H], 30, PAL.skin); const c = [lerp(S[0], Ep[0], 0.88), lerp(S[1], Ep[1], 0.88)]; capsule(g, [c, Ep], 44, sleeve); }
  else { const m = [lerp(Ep[0], H[0], 0.82), lerp(Ep[1], H[1], 0.82)]; capsule(g, [Ep, m], 40, sleeve); }
  return { H, fa };
}

// a hand with fingers at the wrist H, pointing along the forearm angle fa. mode: open | spread | point | grip
function hand(g, H, fa, side, mode = 'open') {
  const dx = side * Math.sin(fa), dy = Math.cos(fa);
  g.save(); g.translate(H[0], H[1]); g.rotate(Math.atan2(dy, dx) - Math.PI / 2);
  const fx = [-11, -3.5, 4, 11].map(v => v * -side), W = 8.5;                         // index finger sits on the thumb side
  let len = [24, 27, 25, 20], fan = [0, 0, 0, 0];
  if (mode === 'spread') { len = [26, 29, 27, 22]; fan = [-0.22, -0.07, 0.07, 0.22].map(v => v * -side); }
  if (mode === 'point') len = [32, 9, 8, 7];
  if (mode === 'grip') len = [10, 10, 9, 8];
  // thumb (drawn first so the palm overlaps its root)
  const tx = side * 16, thumbTip = mode === 'grip' ? [side * 4, 26] : mode === 'spread' ? [side * 34, 16] : [side * 25, 24];
  capsule(g, [[tx, 4], thumbTip], 9.5, PAL.skin);
  rect(g, -17, -6, 34, 32, 11, PAL.skin);
  for (let i = 3; i >= 0; i--) { const x0 = fx[i], y0 = 20, a = fan[i]; capsule(g, [[x0, y0], [x0 + Math.sin(a) * len[i], y0 + Math.cos(a) * len[i]]], W, PAL.skin); }
  if (mode === 'grip') line(g, [[-14 * side, 22], [14 * side, 22]], LW * 0.6);
  g.restore();
}
const handMode = (t, keys, prop) => { if (prop) return 'grip'; let nm = keys; if (Array.isArray(keys) && Array.isArray(keys[0])) for (const [tk, n] of keys) if (t >= tk) nm = n; if (Array.isArray(nm)) return 'open'; return nm === 'up' ? 'point' : nm === 'stop' || nm === 'shrug' ? 'spread' : 'open'; };

// x, y = feet centre; s = scale (1 ≈ 680 px tall); o = { who:'ivan'|'agro', armL, armR (pose names or keyed [[t,name],…]), expr, blink, look, propL, propR, t, bob, alpha }
export function person(g, x, y, s, o = {}) {
  const { who = 'ivan', t = 0, alpha: a = 1 } = o, agro = who === 'agro';
  const aL = armAt(t, o.armL || 'down'), aR = armAt(t, o.armR || 'down'), bob = (o.bob ?? 1) * Math.sin(t * 2.2 + (agro ? 1 : 0)) * 2.5;
  LW = (4 * Math.max(1, s * 0.75)) / s;
  g.save(); g.globalAlpha *= a; g.translate(x, y); g.scale(s, s);
  // ground shadow
  g.fillStyle = 'rgba(61,67,74,.10)'; g.beginPath(); g.ellipse(0, 0, 110, 12, 0, 0, 7); g.fill();
  if (agro) {
    for (const sd of [-1, 1]) {
      rect(g, sd > 0 ? 0 : -66, -34, 66, 34, 14, PAL.shoe);
      rect(g, sd > 0 ? 3 : -61, -345, 58, 305, 6, PAL.jeans); rect(g, sd > 0 ? 1 : -63, -72, 62, 34, 4, PAL.jeansLt);
      g.setLineDash([7, 7]); line(g, [[sd * 32, -330], [sd * 32, -80]], LW * 0.5, '#4a6a92'); g.setLineDash([]);
      line(g, [[sd * 40, -195], [sd * 22, -190]], LW * 0.5); g.beginPath(); g.moveTo(sd * 54, -340); g.quadraticCurveTo(sd * 44, -308, sd * 22, -300); g.strokeStyle = OL; g.lineWidth = LW * 0.6; g.stroke();
    }
    line(g, [[0, -340], [0, -240]], LW * 0.7);
  } else {
    for (const sd of [-1, 1]) { rect(g, sd > 0 ? 2 : -64, -340, 62, 250, 6, PAL.overall); rect(g, sd > 0 ? 4 : -68, -110, 64, 92, 6, PAL.boot); rect(g, sd > 0 ? -2 : -78, -32, 80, 32, 14, PAL.boot); }
  }
  g.translate(0, bob);
  // torso
  g.beginPath(); g.moveTo(-80, -500); g.quadraticCurveTo(0, -512, 80, -500); g.lineTo(72, -320); g.lineTo(-72, -320); g.closePath(); fillStroke(g, agro ? PAL.agroShirt : PAL.ivanShirt);
  if (!agro) { g.save(); g.clip(); g.strokeStyle = PAL.ivanCheck; g.lineWidth = 3; for (let k = -80; k <= 80; k += 24) { g.beginPath(); g.moveTo(k, -520); g.lineTo(k, -300); g.stroke(); } for (let k = -500; k <= -320; k += 24) { g.beginPath(); g.moveTo(-90, k); g.lineTo(90, k); g.stroke(); } g.restore(); g.beginPath(); g.moveTo(-80, -500); g.quadraticCurveTo(0, -512, 80, -500); g.lineTo(72, -320); g.lineTo(-72, -320); g.closePath(); fillStroke(g, null); }
  // collar
  for (const sd of [-1, 1]) { g.beginPath(); g.moveTo(0, -470); g.lineTo(sd * 34, -506); g.lineTo(sd * 20, -462); g.closePath(); fillStroke(g, agro ? PAL.agroShirt : PAL.ivanShirt); }
  if (agro) {
    // V-neck sweater vest over the shirt
    g.beginPath(); g.moveTo(-28, -502); g.lineTo(0, -430); g.lineTo(28, -502); g.lineTo(66, -496); g.quadraticCurveTo(58, -440, 76, -400); g.lineTo(76, -332); g.lineTo(-76, -332); g.lineTo(-76, -400); g.quadraticCurveTo(-58, -440, -66, -496); g.closePath(); fillStroke(g, PAL.vest);
    rect(g, -78, -342, 156, 24, 4, PAL.vestDk);
    line(g, [[-20, -500], [0, -446], [20, -500]], LW * 0.6, PAL.vestDk);
    for (const sd of [-1, 1]) { g.beginPath(); g.moveTo(0, -468); g.lineTo(sd * 30, -508); g.lineTo(sd * 18, -462); g.closePath(); fillStroke(g, PAL.agroShirt); }
  } else {
    rect(g, -70, -345, 140, 40, 4, PAL.overall);
    rect(g, -50, -440, 100, 110, 6, PAL.overall); rect(g, -24, -420, 48, 40, 6, null);
    for (const sd of [-1, 1]) { capsule(g, [[sd * 44, -434], [sd * 58, -500]], 12, PAL.overall); ell(g, sd * 42, -430, 5, 5, PAL.cap); }
  }
  // arms
  const L = arm(g, -1, aL, o, agro ? PAL.agroShirt : PAL.ivanShirt, !agro, 0), R = arm(g, 1, aR, o, agro ? PAL.agroShirt : PAL.ivanShirt, !agro, 0);
  g.save(); g.translate(0, -515); g.scale(1.14, 1.14); g.translate(0, 515); head(g, o); g.restore();
  if (o.propL) prop(g, o.propL, L.H[0], L.H[1], L.fa, -1);
  if (o.propR) prop(g, o.propR, R.H[0], R.H[1], R.fa, 1);
  hand(g, L.H, L.fa, -1, o.handL || handMode(t, o.armL || 'down', o.propL)); hand(g, R.H, R.fa, 1, o.handR || handMode(t, o.armR || 'down', o.propR));
  g.restore();
  return { hand: (side) => { const H = side < 0 ? L.H : R.H; return [x + H[0] * s, y + (H[1] + bob) * s]; }, head: [x, y + (-584 + bob) * s] };
}
