// skins.js — character skins: completely different ways to draw the cast, sharing the same poses, expressions and animation.
// Select with config.json "skin": "<id>" or ?skin=<id> (render.mjs --skin <id>). "stick" (or none) = the original GrowKaz stick figure.
// A skin has figure(g, o, p, of) — drawn in the figure's local space (feet at 0,0, facing +x, stick-figure units: head r≈26 at y≈-208) —
// and portrait(g, r, o) — the giant close-up, drawn centred at 0,0 with head radius r.
import { EXPR } from './rig2d.js';

// ---------- helpers ----------
const lerp = (a, b, k) => a + (b - a) * k;
const shade = (hex, k) => { const n = parseInt(hex.slice(1), 16); let r = n >> 16, g = (n >> 8) & 255, b = n & 255; const f = (v) => Math.round(k < 0 ? v * (1 + k) : v + (255 - v) * k); return `rgb(${f(r)},${f(g)},${f(b)})`; };
const rgba = (hex, a) => { const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; };
const dist = (a, b) => Math.hypot(b[0] - a[0], b[1] - a[1]);
function hashf(i) { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
function circle(g, x, y, r, fill) { g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = fill; g.fill(); }
function rr(g, x, y, w, h, r) { g.beginPath(); g.roundRect(x, y, w, h, r); }
// tapered capsule between two points
function limb(g, a, b, w1, w2, fill) {
  const ang = Math.atan2(b[1] - a[1], b[0] - a[0]), nx = -Math.sin(ang), ny = Math.cos(ang);
  g.beginPath(); g.moveTo(a[0] + nx * w1 / 2, a[1] + ny * w1 / 2); g.lineTo(b[0] + nx * w2 / 2, b[1] + ny * w2 / 2);
  g.arc(b[0], b[1], w2 / 2, ang + Math.PI / 2, ang - Math.PI / 2, true); g.lineTo(a[0] - nx * w1 / 2, a[1] - ny * w1 / 2);
  g.arc(a[0], a[1], w1 / 2, ang - Math.PI / 2, ang + Math.PI / 2, true); g.closePath(); g.fillStyle = fill; g.fill();
}
// rotated rectangle along a→b
function bar(g, a, b, w, fill, round = 2, extra = 0) {
  const ang = Math.atan2(b[1] - a[1], b[0] - a[0]), L = dist(a, b) + extra; g.save(); g.translate(a[0], a[1]); g.rotate(ang); rr(g, -round, -w / 2, L + round, w, round); g.fillStyle = fill; g.fill(); g.restore();
}
function expr(o) { const ex = { ...(EXPR[o.expr] || EXPR.neutral), ...(o.face || {}) }; return { eyes: o.blink ? 'closed' : ex.eyes, brows: ex.brows, mouth: o.talk > 0.05 ? 'talk' : ex.mouth, talk: o.talk || 0, look: o.look || ex.look || [0, 0] }; }
const topColor = (of) => of.top === 'labcoat' ? '#eeeef2' : (of.color || '#d64a33');
const legColor = (of, dflt) => of.legs || dflt;

// generic cartoon features: two eyes, brows, mouth. st: {eye:'dot'|'ball'|'printed', ink, white, scale, front}
function features(g, cx, cy, r, ex, st) {
  const ink = st.ink || '#1a1a1a', k = st.scale || 1, sp = r * (st.front ? 0.34 : 0.3) * k, ey = cy - r * 0.08, look = ex.look;
  const eyes = [cx - sp + (st.front ? 0 : r * 0.08), cx + sp + (st.front ? 0 : r * 0.12)];
  eyes.forEach((x) => {
    if (ex.eyes === 'closed') { g.strokeStyle = ink; g.lineWidth = r * 0.07 * k; g.beginPath(); g.moveTo(x - r * 0.12 * k, ey); g.lineTo(x + r * 0.12 * k, ey); g.stroke(); return; }
    if (ex.eyes === 'happy') { g.strokeStyle = ink; g.lineWidth = r * 0.07 * k; g.beginPath(); g.arc(x, ey + r * 0.05, r * 0.12 * k, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); return; }
    const big = ex.eyes === 'wide' || ex.eyes === 'ring' ? 1.3 : 1;
    if (st.eye === 'ball') { g.fillStyle = st.white || '#fff'; g.beginPath(); g.ellipse(x, ey, r * 0.17 * k * big, r * 0.21 * k * big, 0, 0, 7); g.fill(); circle(g, x + look[0] * r * 0.07 + r * 0.02, ey + look[1] * r * 0.07, r * 0.085 * k, ink); circle(g, x + look[0] * r * 0.07 - r * 0.01, ey + look[1] * r * 0.07 - r * 0.04, r * 0.03 * k, '#fff'); }
    else { circle(g, x + look[0] * r * 0.05, ey + look[1] * r * 0.05, r * 0.1 * k * big, ink); if (st.eye === 'printed') circle(g, x + look[0] * r * 0.05 + r * 0.03, ey + look[1] * r * 0.05 - r * 0.035, r * 0.03 * k, '#fff'); }
  });
  const by = ey - r * (st.eye === 'ball' ? 0.34 : 0.27) * (ex.eyes === 'wide' || ex.eyes === 'ring' ? 1.12 : 1), bw = r * 0.14 * k;
  g.strokeStyle = ink; g.lineWidth = r * 0.06 * k; g.lineCap = 'round';
  const brow = (x, a) => { g.beginPath(); g.moveTo(x - bw, by + a); g.lineTo(x + bw, by - a); g.stroke(); };
  if (ex.brows === 'worried') { brow(eyes[0], -r * 0.05); brow(eyes[1], r * 0.05); }
  else if (ex.brows === 'angry') { brow(eyes[0], r * 0.07); brow(eyes[1], -r * 0.07); }
  else if (ex.brows === 'raised' || ex.brows === 'confused') eyes.forEach((x, i) => { if (ex.brows === 'confused' && i === 0) return brow(x, r * 0.06); g.beginPath(); g.arc(x, by + r * 0.1, r * 0.14 * k, Math.PI * 1.2, Math.PI * 1.8); g.stroke(); });
  else if (st.alwaysBrows) { brow(eyes[0], 0); brow(eyes[1], 0); }
  const mx = (eyes[0] + eyes[1]) / 2, my = cy + r * 0.38, mc = st.mouth || ink;
  g.strokeStyle = mc; g.fillStyle = mc; g.lineWidth = r * 0.07 * k;
  switch (ex.mouth) {
    case 'talk': g.beginPath(); g.ellipse(mx, my, r * 0.14 * k, r * (0.04 + 0.16 * ex.talk) * k, 0, 0, 7); g.fill(); break;
    case 'o': g.beginPath(); g.ellipse(mx, my, r * 0.09 * k, r * 0.13 * k, 0, 0, 7); g.fill(); break;
    case 'oBig': g.beginPath(); g.ellipse(mx, my + r * 0.03, r * 0.13 * k, r * 0.17 * k, 0, 0, 7); g.fill(); break;
    case 'grin': g.beginPath(); g.moveTo(mx - r * 0.26 * k, my - r * 0.05); g.quadraticCurveTo(mx, my + r * 0.36 * k, mx + r * 0.26 * k, my - r * 0.05); g.closePath(); g.fill(); break;
    case 'frown': g.beginPath(); g.arc(mx, my + r * 0.18, r * 0.18 * k, Math.PI + 0.5, Math.PI * 2 - 0.5); g.stroke(); break;
    case 'flat': case 'smallFlat': g.beginPath(); g.moveTo(mx - r * 0.15 * k, my); g.lineTo(mx + r * 0.15 * k, my); g.stroke(); break;
    case 'smirk': g.beginPath(); g.moveTo(mx - r * 0.14 * k, my); g.quadraticCurveTo(mx + r * 0.05, my + r * 0.05, mx + r * 0.2 * k, my - r * 0.09); g.stroke(); break;
    case 'wavy': g.beginPath(); for (let i = 0; i <= 12; i++) { const u = i / 12; g.lineTo(mx - r * 0.2 + u * r * 0.4, my + Math.sin(u * Math.PI * 2) * r * 0.05); } g.stroke(); break;
    default: g.beginPath(); g.arc(mx, my - r * 0.14, r * 0.2 * k, 0.4, Math.PI - 0.4); g.stroke();
  }
}

// ======================================================================================
// 1. PAPER — white paper cut-out puppet with split-pin joints and drop shadows
// ======================================================================================
const PAPER = '#f6f3ec', PAPER_EDGE = '#d9d2c3';
function paperShadow(g, on) { if (on) { g.shadowColor = 'rgba(0,0,0,.38)'; g.shadowBlur = 6; g.shadowOffsetX = 3; g.shadowOffsetY = 5; } else { g.shadowColor = 'transparent'; g.shadowBlur = 0; g.shadowOffsetX = 0; g.shadowOffsetY = 0; } }
function jaggedCircle(g, x, y, r, n, seed) { g.beginPath(); for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2, rr2 = r * (0.97 + 0.05 * hashf(seed + i)); g.lineTo(x + Math.cos(a) * rr2, y + Math.sin(a) * rr2); } g.closePath(); }
function paperPiece(g, a, b, w, fill = PAPER) { paperShadow(g, true); limb(g, a, b, w, w * 0.9, fill); paperShadow(g, false); g.strokeStyle = PAPER_EDGE; g.lineWidth = 0.8; g.stroke(); }
function pin(g, p) { circle(g, p[0], p[1], 2.6, '#b8955a'); circle(g, p[0] - 0.6, p[1] - 0.6, 1, '#f3dca0'); }
function paperCap(g, x, y, r, col, front = false) { paperShadow(g, true); g.fillStyle = col; g.beginPath(); g.ellipse(x, y - r * 0.3, r * 1.02, r * 0.8, 0, Math.PI, Math.PI * 2); g.fill(); g.fillStyle = shade(col, -0.2); if (front) { g.beginPath(); g.ellipse(x, y - r * 0.3, r * 1.2, r * 0.2, 0, 0, Math.PI); g.fill(); } else { rr(g, x + r * 0.1, y - r * 0.42, r * 1.5, r * 0.24, r * 0.08); g.fill(); } paperShadow(g, false); }
const paper = {
  name: 'Білий папір', desc: 'вирізаний з білого паперу герой-маріонетка з кнопками в суглобах',
  figure(g, o, p, of) {
    paperPiece(g, p.hip, p.kB, 13, '#e8e4da'); paperPiece(g, p.kB, p.fB, 12, '#e8e4da'); pin(g, p.kB);
    paperPiece(g, p.sh, p.eB, 11, '#e8e4da'); paperPiece(g, p.eB, p.hB, 10, '#e8e4da'); pin(g, p.eB);
    // torso: white body + coloured paper shirt glued on top
    paperShadow(g, true); g.fillStyle = PAPER; g.beginPath(); g.moveTo(p.sh[0] - 15, p.sh[1] - 4); g.lineTo(p.sh[0] + 15, p.sh[1] - 4); g.lineTo(p.hip[0] + 13, p.hip[1] + 6); g.lineTo(p.hip[0] - 13, p.hip[1] + 6); g.closePath(); g.fill(); paperShadow(g, false);
    if (of.top && of.top !== 'none') { const c = topColor(of), coat = of.top === 'labcoat'; g.fillStyle = coat ? '#ffffff' : shade(c, 0.12); g.beginPath(); g.moveTo(p.sh[0] - 14, p.sh[1] - 1); g.lineTo(p.sh[0] + 14, p.sh[1] - 1); g.lineTo(p.hip[0] + (coat ? 20 : 12), p.hip[1] + (coat ? 40 : 2)); g.lineTo(p.hip[0] - (coat ? 18 : 12), p.hip[1] + (coat ? 40 : 2)); g.closePath(); paperShadow(g, true); g.fill(); paperShadow(g, false); if (coat) { g.strokeStyle = '#cfcfd8'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(p.sh[0] + 3, p.sh[1]); g.lineTo(p.hip[0] + 3, p.hip[1] + 38); g.stroke(); } }
    paperPiece(g, p.hip, p.kF, 13); paperPiece(g, p.kF, p.fF, 12); pin(g, p.kF); pin(g, p.hip);
    paperPiece(g, p.sh, p.eF, 11); paperPiece(g, p.eF, p.hF, 10); pin(g, p.eF); pin(g, p.sh);
    // head
    const [hx, hy] = p.head, r = 26; paperShadow(g, true); jaggedCircle(g, hx, hy, r, 22, 3); g.fillStyle = PAPER; g.fill(); paperShadow(g, false); g.strokeStyle = PAPER_EDGE; g.lineWidth = 0.8; g.stroke();
    if (of.head === 'cap' || of.head === 'capBack') paperCap(g, hx, hy, r, of.headColor || '#d64a33');
    features(g, hx, hy, r, expr(o), { ink: '#2b2622', eye: 'dot' });
    if (of.face === 'glasses') { g.strokeStyle = '#2b2622'; g.lineWidth = 2; for (const dx of [-0.22, 0.42]) { g.beginPath(); g.arc(hx + dx * r, hy - r * 0.08, r * 0.2, 0, 7); g.stroke(); } }
  },
  portrait(g, r, o) {
    const of = o.outfit || {}, ex = expr(o);
    paperShadow(g, true); g.fillStyle = of.top === 'labcoat' ? '#ffffff' : shade(topColor(of), 0.1); g.beginPath(); g.ellipse(0, r * 1.65, r * 1.25, r * 0.85, 0, Math.PI, Math.PI * 2); g.fill();
    g.fillStyle = PAPER; rr(g, -r * 0.22, r * 0.7, r * 0.44, r * 0.4, 4); g.fill();
    jaggedCircle(g, 0, 0, r, 40, 9); g.fillStyle = PAPER; g.fill(); paperShadow(g, false); g.strokeStyle = PAPER_EDGE; g.lineWidth = r * 0.012; g.stroke();
    // subtle paper fibres
    g.save(); g.clip(); for (let i = 0; i < 70; i++) { const x = (hashf(i) - 0.5) * 2 * r, y = (hashf(i + 99) - 0.5) * 2 * r; g.strokeStyle = 'rgba(160,150,130,.12)'; g.lineWidth = 1; g.beginPath(); g.moveTo(x, y); g.lineTo(x + r * 0.08, y + r * 0.02 * (hashf(i + 7) - 0.5)); g.stroke(); } g.restore();
    if (of.head === 'cap' || of.head === 'capBack') paperCap(g, 0, 0, r, of.headColor || '#d64a33', true);
    // cut-out features: a dark layer under the hole, offset = depth
    g.save(); g.translate(r * 0.012, r * 0.02); features(g, 0, 0, r, ex, { ink: '#3a332c', eye: 'dot', front: true, scale: 1 }); g.restore();
    features(g, 0, 0, r, ex, { ink: '#1e1a16', eye: 'dot', front: true, scale: 0.96 });
  },
};

// ======================================================================================
// 2. LEGO-STYLE minifigure — yellow cylinder head with stud, printed face, block body, C-hands
// ======================================================================================
const BRICK_YEL = '#f5c518';
function plastic(g, x, w, base) { const gr = g.createLinearGradient(x, 0, x + w, 0); gr.addColorStop(0, shade(base, -0.25)); gr.addColorStop(0.3, shade(base, 0.12)); gr.addColorStop(0.55, base); gr.addColorStop(1, shade(base, -0.35)); return gr; }
function cHand(g, h, ang) { g.save(); g.translate(h[0], h[1]); g.rotate(ang); g.strokeStyle = BRICK_YEL; g.lineWidth = 4.2; g.beginPath(); g.arc(3, 0, 4.6, 0.7, Math.PI * 2 - 0.7); g.stroke(); g.strokeStyle = 'rgba(255,255,255,.45)'; g.lineWidth = 1.2; g.beginPath(); g.arc(3, 0, 6.2, 3.6, 4.6); g.stroke(); g.restore(); }
function brickHead(g, cx, cy, w, h, of, o, ex, front) {
  // neck, stud, head cylinder
  rr(g, cx - w * 0.22, cy - h / 2 - h * 0.2, w * 0.44, h * 0.24, h * 0.05); g.fillStyle = plastic(g, cx - w * 0.22, w * 0.44, BRICK_YEL); g.fill();
  rr(g, cx - w / 2, cy - h / 2, w, h, w * 0.18); g.fillStyle = plastic(g, cx - w / 2, w, BRICK_YEL); g.fill();
  g.fillStyle = 'rgba(255,255,255,.35)'; rr(g, cx - w * 0.36, cy - h * 0.42, w * 0.1, h * 0.74, w * 0.05); g.fill();
  features(g, cx + (front ? 0 : -w * 0.06), cy + h * 0.02, h * 0.55, ex, { ink: '#151515', eye: 'printed', front, alwaysBrows: true, scale: 0.95 });
  if (of.face === 'glasses') { g.strokeStyle = '#151515'; g.lineWidth = h * 0.04; for (const dx of [-0.17, 0.2]) { g.beginPath(); g.arc(cx + dx * w, cy - h * 0.05, h * 0.13, 0, 7); g.stroke(); } }
  if (of.head === 'cap' || of.head === 'capBack') { const c = of.headColor || '#d64a33'; rr(g, cx - w * 0.56, cy - h * 0.78, w * 1.12, h * 0.42, [w * 0.5, w * 0.5, 2, 2]); g.fillStyle = plastic(g, cx - w * 0.56, w * 1.12, c); g.fill(); rr(g, cx + w * 0.05, cy - h * 0.42, w * 0.8, h * 0.1, h * 0.04); g.fillStyle = shade(c, -0.2); g.fill(); }
  else if (of.head === 'none' || !of.head) { rr(g, cx - w * 0.55, cy - h * 0.72, w * 1.1, h * 0.38, [w * 0.5, w * 0.5, w * 0.1, w * 0.1]); g.fillStyle = plastic(g, cx - w * 0.55, w * 1.1, '#5b3a22'); g.fill(); }
}
const lego = {
  name: 'Конструктор', desc: 'мініфігурка в стилі LEGO: циліндрична жовта голова, корпус-блок, руки-кліпси',
  figure(g, o, p, of) {
    const ex = expr(o), lc = legColor(of, '#2f4f8f'), tc = topColor(of), sc = of.top === 'labcoat' ? '#eeeef2' : tc;
    const hipL = [p.hip[0] - 1, p.hip[1] + 4];
    // legs: rigid blocks swinging from the hip toward the feet
    bar(g, hipL, [p.fB[0], p.fB[1] - 6], 17, shade(lc, -0.3), 2); rr(g, p.fB[0] - 6, p.fB[1] - 9, 20, 9, 2); g.fillStyle = shade(lc, -0.35); g.fill();
    // back arm
    bar(g, p.sh, p.hB, 10, shade(sc, -0.3), 5); cHand(g, p.hB, Math.atan2(p.hB[1] - p.sh[1], p.hB[0] - p.sh[0]));
    // hip block + torso trapezoid
    rr(g, p.hip[0] - 17, p.hip[1] - 4, 34, 10, 2); g.fillStyle = plastic(g, p.hip[0] - 17, 34, lc); g.fill();
    g.beginPath(); g.moveTo(p.sh[0] - 13, p.sh[1] - 4); g.lineTo(p.sh[0] + 13, p.sh[1] - 4); g.lineTo(p.hip[0] + 18, p.hip[1] - 3); g.lineTo(p.hip[0] - 18, p.hip[1] - 3); g.closePath(); g.fillStyle = plastic(g, p.hip[0] - 18, 36, tc); g.fill();
    if (of.top === 'labcoat') { g.strokeStyle = '#9fa0b0'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(p.sh[0] - 5, p.sh[1] - 3); g.lineTo(p.sh[0] + 1, p.sh[1] + 16); g.lineTo(p.sh[0] + 7, p.sh[1] - 3); g.moveTo(p.sh[0] + 1, p.sh[1] + 16); g.lineTo(p.hip[0] + 1, p.hip[1] - 4); g.stroke(); rr(g, p.sh[0] - 1, p.sh[1] + 2, 6, 9, 1); g.fillStyle = '#3a6ea5'; g.fill(); }
    else { g.strokeStyle = 'rgba(0,0,0,.25)'; g.lineWidth = 1.2; g.beginPath(); g.arc(p.sh[0], p.sh[1] - 4, 7, 0.2, Math.PI - 0.2); g.stroke(); }
    // front leg
    bar(g, hipL, [p.fF[0], p.fF[1] - 6], 17, lc, 2); rr(g, p.fF[0] - 6, p.fF[1] - 9, 21, 9, 2); g.fillStyle = shade(lc, -0.1); g.fill();
    g.strokeStyle = 'rgba(255,255,255,.25)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(p.hip[0] - 4, p.hip[1] + 8); g.lineTo(lerp(p.hip[0], p.fF[0], 0.8) - 4, lerp(p.hip[1], p.fF[1], 0.8)); g.stroke();
    // front arm: angled block (shoulder → elbow → hand)
    limb(g, p.sh, p.eF, 11, 10, shade(sc, 0.05)); limb(g, p.eF, p.hF, 10, 9, sc); cHand(g, p.hF, Math.atan2(p.hF[1] - p.eF[1], p.hF[0] - p.eF[0]));
    brickHead(g, p.head[0] - 1, p.head[1] + 2, 36, 32, of, o, ex, false);
  },
  portrait(g, r, o) {
    const of = o.outfit || {}, ex = expr(o), tc = topColor(of);
    g.beginPath(); g.moveTo(-r * 0.75, r * 0.95); g.lineTo(r * 0.75, r * 0.95); g.lineTo(r * 1.25, r * 2.2); g.lineTo(-r * 1.25, r * 2.2); g.closePath(); g.fillStyle = plastic(g, -r * 1.25, r * 2.5, tc); g.fill();
    rr(g, -r * 0.55, r * 0.7, r * 1.1, r * 0.35, r * 0.08); g.fillStyle = plastic(g, -r * 0.55, r * 1.1, BRICK_YEL); g.fill();
    brickHead(g, 0, -r * 0.05, r * 1.75, r * 1.55, of, o, ex, true);
    // the classic stud on top (hidden under a cap)
    if (!(of.head && of.head !== 'none')) { rr(g, -r * 0.36, -r * 1.02, r * 0.72, r * 0.22, r * 0.06); g.fillStyle = plastic(g, -r * 0.36, r * 0.72, BRICK_YEL); g.fill(); }
  },
};

// ======================================================================================
// 3. HUMAN — semi-realistic illustrated person: skin, hair, anatomy, shaded clothes, detailed portrait
// ======================================================================================
const SKIN = '#d9a07a', SKIN_D = '#b97c58', HAIR = '#3b2a1e';
function skinGrad(g, x0, y0, x1, y1, base = SKIN) { const gr = g.createLinearGradient(x0, y0, x1, y1); gr.addColorStop(0, shade(base, 0.12)); gr.addColorStop(0.6, base); gr.addColorStop(1, shade(base, -0.28)); return gr; }
function clothGrad(g, x0, x1, base) { const gr = g.createLinearGradient(x0, 0, x1, 0); gr.addColorStop(0, shade(base, -0.3)); gr.addColorStop(0.35, shade(base, 0.08)); gr.addColorStop(0.7, base); gr.addColorStop(1, shade(base, -0.4)); return gr; }
function realEye(g, x, y, w, ex, lookK) {
  const open = ex.eyes === 'closed' ? 0.06 : ex.eyes === 'happy' ? 0.45 : (ex.eyes === 'wide' || ex.eyes === 'ring') ? 1.25 : 1, h = w * 0.42 * open;
  g.save(); g.beginPath(); g.moveTo(x - w, y); g.quadraticCurveTo(x, y - h * 1.5, x + w, y); g.quadraticCurveTo(x, y + h * 1.1, x - w, y); g.closePath(); g.fillStyle = '#f4efe9'; g.fill(); g.clip();
  const ix = x + ex.look[0] * w * 0.35 * lookK, iy = y + ex.look[1] * w * 0.2;
  const ir = g.createRadialGradient(ix, iy, 0, ix, iy, w * 0.5); ir.addColorStop(0, '#3e2a18'); ir.addColorStop(0.55, '#6a4a2a'); ir.addColorStop(0.95, '#2a1a0e'); circle(g, ix, iy, w * 0.48, ir); circle(g, ix, iy, w * 0.2, '#0b0705'); circle(g, ix + w * 0.15, iy - w * 0.17, w * 0.09, 'rgba(255,255,255,.9)');
  g.fillStyle = 'rgba(80,40,20,.25)'; g.fillRect(x - w, y - h * 1.6, w * 2, h * 0.7); g.restore();
  g.strokeStyle = '#2a1a12'; g.lineWidth = w * 0.13; g.lineCap = 'round'; g.beginPath(); g.moveTo(x - w * 1.05, y + w * 0.02); g.quadraticCurveTo(x, y - h * 1.55, x + w * 1.05, y - w * 0.04); g.stroke();
  g.strokeStyle = 'rgba(120,70,45,.45)'; g.lineWidth = w * 0.06; g.beginPath(); g.moveTo(x - w * 0.8, y - h * 1.5 - w * 0.12); g.quadraticCurveTo(x, y - h * 2.1 - w * 0.12, x + w * 0.85, y - h * 1.4 - w * 0.12); g.stroke();
}
function realMouth(g, x, y, w, ex) {
  const lip = '#a8564a';
  if (ex.mouth === 'talk' || ex.mouth === 'o' || ex.mouth === 'oBig') { const oh = ex.mouth === 'talk' ? w * (0.12 + 0.5 * ex.talk) : ex.mouth === 'oBig' ? w * 0.55 : w * 0.4, ow = ex.mouth === 'talk' ? w : w * 0.55;
    g.fillStyle = '#3a1414'; g.beginPath(); g.ellipse(x, y, ow * 0.8, oh * 0.6, 0, 0, 7); g.fill(); g.strokeStyle = lip; g.lineWidth = w * 0.18; g.stroke(); g.fillStyle = 'rgba(255,255,255,.75)'; if (oh > w * 0.25) { g.fillRect(x - ow * 0.45, y - oh * 0.55, ow * 0.9, oh * 0.18); } return; }
  const curve = ['smile', 'smallSmile', 'grin'].includes(ex.mouth) ? 1 : ex.mouth === 'frown' ? -1 : 0, sm = ex.mouth === 'smirk';
  g.fillStyle = lip; g.beginPath(); g.moveTo(x - w, y - curve * w * 0.15); g.quadraticCurveTo(x - w * 0.3, y - w * 0.28, x, y - w * 0.16); g.quadraticCurveTo(x + w * 0.3, y - w * 0.28, x + w, y - (sm ? w * 0.35 : curve * w * 0.15)); g.quadraticCurveTo(x, y + w * 0.42 + curve * w * 0.15, x - w, y - curve * w * 0.15); g.fill();
  g.strokeStyle = '#5a2620'; g.lineWidth = w * 0.07; g.beginPath(); g.moveTo(x - w, y - curve * w * 0.15); g.quadraticCurveTo(x, y + curve * w * 0.3, x + w, y - (sm ? w * 0.35 : curve * w * 0.15)); g.stroke();
  if (ex.mouth === 'grin') { g.fillStyle = '#f3ece4'; g.beginPath(); g.moveTo(x - w * 0.8, y - w * 0.05); g.quadraticCurveTo(x, y + w * 0.35, x + w * 0.8, y - w * 0.05); g.closePath(); g.fill(); }
  g.fillStyle = 'rgba(255,220,210,.35)'; g.beginPath(); g.ellipse(x, y + w * 0.18, w * 0.4, w * 0.08, 0, 0, 7); g.fill();
}
function realHair(g, cx, cy, r, of, front) {
  if (of.head === 'cap' || of.head === 'capBack') { const c = of.headColor || '#d64a33';
    const gr = g.createLinearGradient(cx - r, cy - r * 1.2, cx + r, cy - r * 0.2); gr.addColorStop(0, shade(c, 0.15)); gr.addColorStop(1, shade(c, -0.35));
    g.fillStyle = gr; g.beginPath(); g.ellipse(cx, cy - r * 0.42, r * 1.08, r * 0.78, 0, Math.PI * 1.0, Math.PI * 2.0); g.fill();
    g.fillStyle = shade(c, -0.3); g.beginPath(); if (front) { g.ellipse(cx, cy - r * 0.4, r * 1.25, r * 0.25, 0, 0, Math.PI); } else { g.moveTo(cx + r * 0.3, cy - r * 0.5); g.quadraticCurveTo(cx + r * 1.4, cy - r * 0.55, cx + r * 1.6, cy - r * 0.32); g.lineTo(cx + r * 0.3, cy - r * 0.32); } g.fill();
    g.strokeStyle = 'rgba(0,0,0,.25)'; g.lineWidth = r * 0.03; g.beginPath(); g.moveTo(cx, cy - r * 1.2); g.lineTo(cx, cy - r * 0.45); g.stroke(); circle(g, cx, cy - r * 1.18, r * 0.06, shade(c, -0.2));
    // hair peeking out at the temples
    g.fillStyle = rgba(HAIR, 0.85); g.beginPath(); g.ellipse(cx - r * 0.8, cy - r * 0.28, r * 0.07, r * 0.16, 0.15, 0, 7); g.fill(); if (front) { g.beginPath(); g.ellipse(cx + r * 0.8, cy - r * 0.28, r * 0.07, r * 0.16, -0.15, 0, 7); g.fill(); }
    return; }
  if (of.head === 'none' || !of.head) { // short side-parted hair
    const gr = g.createLinearGradient(cx, cy - r * 1.2, cx, cy - r * 0.2); gr.addColorStop(0, shade(HAIR, 0.25)); gr.addColorStop(1, HAIR);
    g.fillStyle = gr; g.beginPath(); g.moveTo(cx - r * 1.0, cy - r * 0.05); g.quadraticCurveTo(cx - r * 1.15, cy - r * 1.15, cx - r * 0.1, cy - r * 1.12); g.quadraticCurveTo(cx + r * 1.05, cy - r * 1.1, cx + r * 1.0, cy - r * 0.1); g.quadraticCurveTo(cx + r * 0.6, cy - r * 0.75, cx - r * 0.2, cy - r * 0.62); g.quadraticCurveTo(cx - r * 0.75, cy - r * 0.55, cx - r * 1.0, cy - r * 0.05); g.fill();
    g.strokeStyle = 'rgba(255,230,200,.18)'; g.lineWidth = r * 0.02; for (let i = 0; i < 9; i++) { g.beginPath(); g.moveTo(cx - r * 0.7 + i * r * 0.17, cy - r * 1.05); g.quadraticCurveTo(cx - r * 0.5 + i * r * 0.17, cy - r * 0.85, cx - r * 0.6 + i * r * 0.19, cy - r * 0.62); g.stroke(); }
  }
}
const human = {
  name: 'Реалістична людина', desc: 'намальована людина з анатомією, шкірою, волоссям і світлотінню (ілюстрація, не фото)',
  figure(g, o, p, of) {
    const ex = expr(o), lc = legColor(of, '#3a4a66'), tc = topColor(of), coat = of.top === 'labcoat';
    const shirt = coat ? '#7a9cc0' : tc;
    // back leg + shoe
    limb(g, p.hip, p.kB, 17, 13, shade(lc, -0.35)); limb(g, p.kB, p.fB, 13, 10, shade(lc, -0.35));
    g.fillStyle = '#2a201a'; g.beginPath(); g.ellipse(p.fB[0] + 5, p.fB[1] - 3, 11, 5, 0, 0, 7); g.fill();
    // back arm
    limb(g, p.sh, p.eB, 12, 10, shade(coat ? '#e8e8ee' : shirt, -0.3)); limb(g, p.eB, p.hB, 9, 7, shade(SKIN, -0.25)); circle(g, p.hB[0], p.hB[1], 5, shade(SKIN, -0.25));
    // torso with shading and collar
    const tx = p.hip[0] - 16; g.beginPath(); g.moveTo(p.sh[0] - 14, p.sh[1] - 4); g.quadraticCurveTo(p.sh[0], p.sh[1] - 9, p.sh[0] + 14, p.sh[1] - 4); g.lineTo(p.hip[0] + 14, p.hip[1] + 4); g.lineTo(p.hip[0] - 14, p.hip[1] + 4); g.closePath(); g.fillStyle = clothGrad(g, tx, tx + 32, shirt); g.fill();
    g.strokeStyle = 'rgba(0,0,0,.18)'; g.lineWidth = 1; for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(p.hip[0] - 8 + i * 6, p.hip[1] - 2); g.quadraticCurveTo(p.hip[0] - 4 + i * 6, p.hip[1] - 20, p.hip[0] - 6 + i * 7, p.hip[1] - 34); g.stroke(); }
    // belt + jeans
    rr(g, p.hip[0] - 14, p.hip[1], 28, 5, 1); g.fillStyle = '#2a1e16'; g.fill();
    if (coat) { g.beginPath(); g.moveTo(p.sh[0] - 15, p.sh[1] - 5); g.lineTo(p.sh[0] - 3, p.sh[1] - 5); g.lineTo(p.hip[0] - 2, p.hip[1] + 44); g.lineTo(p.hip[0] - 22, p.hip[1] + 44); g.closePath(); g.fillStyle = clothGrad(g, p.hip[0] - 22, p.hip[0], '#ececf1'); g.fill(); g.beginPath(); g.moveTo(p.sh[0] + 4, p.sh[1] - 5); g.lineTo(p.sh[0] + 15, p.sh[1] - 5); g.lineTo(p.hip[0] + 24, p.hip[1] + 44); g.lineTo(p.hip[0] + 6, p.hip[1] + 44); g.closePath(); g.fill(); }
    // neck
    limb(g, [p.head[0] - 2, p.head[1] + 14], p.sh, 10, 11, skinGrad(g, p.sh[0] - 6, 0, p.sh[0] + 6, 0));
    // front leg + shoe with sole
    limb(g, p.hip, p.kF, 17, 13, clothGrad(g, p.hip[0] - 9, p.hip[0] + 9, lc)); limb(g, p.kF, p.fF, 13, 10, clothGrad(g, p.kF[0] - 7, p.kF[0] + 7, lc));
    g.fillStyle = '#3a2a1e'; g.beginPath(); g.ellipse(p.fF[0] + 6, p.fF[1] - 4, 12, 5.5, 0, 0, 7); g.fill(); g.fillStyle = '#e8e0d2'; g.fillRect(p.fF[0] - 5, p.fF[1] - 1.5, 22, 2);
    // front arm: sleeve + skin forearm + hand
    const sl = coat ? '#f0f0f4' : shirt; limb(g, p.sh, p.eF, 13, 11, clothGrad(g, p.sh[0] - 7, p.sh[0] + 7, sl));
    if (coat) limb(g, p.eF, [lerp(p.eF[0], p.hF[0], 0.75), lerp(p.eF[1], p.hF[1], 0.75)], 11, 10, clothGrad(g, p.eF[0] - 6, p.eF[0] + 6, sl));
    else limb(g, p.eF, p.hF, 9, 7, skinGrad(g, p.eF[0], p.eF[1], p.hF[0], p.hF[1]));
    if (!coat) { limb(g, p.eF, [lerp(p.eF[0], p.hF[0], 0.15), lerp(p.eF[1], p.hF[1], 0.15)], 12, 11, shade(sl, -0.05)); }
    g.fillStyle = SKIN; g.beginPath(); g.ellipse(p.hF[0] + 2, p.hF[1] + 1, 5.5, 4.5, Math.atan2(p.hF[1] - p.eF[1], p.hF[0] - p.eF[0]), 0, 7); g.fill();
    // head: slightly oval skull, ear, nose, eye, mouth (3/4 side view)
    const [hx, hy] = p.head, r = 19;
    g.fillStyle = skinGrad(g, hx - r, hy - r, hx + r, hy + r); g.beginPath(); g.ellipse(hx, hy, r * 0.88, r, 0, 0, 7); g.fill();
    g.beginPath(); g.moveTo(hx + r * 0.4, hy + r * 0.55); g.quadraticCurveTo(hx + r * 0.6, hy + r * 1.05, hx + r * 0.05, hy + r * 1.0); g.lineTo(hx - r * 0.5, hy + r * 0.6); g.fill();
    g.fillStyle = SKIN_D; g.beginPath(); g.ellipse(hx - r * 0.32, hy + r * 0.05, r * 0.16, r * 0.24, 0, 0, 7); g.fill();
    g.fillStyle = SKIN; g.beginPath(); g.moveTo(hx + r * 0.78, hy - r * 0.05); g.lineTo(hx + r * 1.02, hy + r * 0.3); g.lineTo(hx + r * 0.78, hy + r * 0.36); g.fill();
    realHair(g, hx, hy, r, of, false);
    const exs = { ...ex }; realEye(g, hx + r * 0.42, hy - r * 0.08, r * 0.2, exs, 0.4);
    g.strokeStyle = '#3a2216'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(hx + r * 0.25, hy - r * 0.38 - (ex.brows === 'raised' ? 3 : 0)); g.lineTo(hx + r * 0.62, hy - r * 0.42 - (ex.brows === 'raised' ? 3 : 0) + (ex.brows === 'angry' ? 3 : 0)); g.stroke();
    realMouth(g, hx + r * 0.52, hy + r * 0.55, r * 0.17, ex);
    if (of.face === 'glasses') { g.strokeStyle = '#1c1c1c'; g.lineWidth = 1.4; rr(g, hx + r * 0.22, hy - r * 0.25, r * 0.42, r * 0.32, 3); g.stroke(); g.beginPath(); g.moveTo(hx + r * 0.22, hy - r * 0.12); g.lineTo(hx - r * 0.35, hy - r * 0.05); g.stroke(); }
  },
  portrait(g, r, o) {
    const of = o.outfit || {}, ex = expr(o), tc = topColor(of), coat = of.top === 'labcoat';
    // shoulders, shirt with collar, neck with shadow
    const sg = g.createLinearGradient(-r * 1.4, 0, r * 1.4, 0); sg.addColorStop(0, shade(coat ? '#ececf1' : tc, -0.35)); sg.addColorStop(0.45, coat ? '#ececf1' : tc); sg.addColorStop(1, shade(coat ? '#ececf1' : tc, -0.45));
    g.fillStyle = sg; g.beginPath(); g.moveTo(-r * 1.5, r * 2.3); g.quadraticCurveTo(-r * 1.45, r * 1.15, -r * 0.45, r * 1.0); g.lineTo(r * 0.45, r * 1.0); g.quadraticCurveTo(r * 1.45, r * 1.15, r * 1.5, r * 2.3); g.closePath(); g.fill();
    g.fillStyle = skinGrad(g, -r * 0.4, 0, r * 0.4, 0); g.beginPath(); g.moveTo(-r * 0.36, r * 0.6); g.lineTo(r * 0.36, r * 0.6); g.lineTo(r * 0.42, r * 1.12); g.quadraticCurveTo(0, r * 1.3, -r * 0.42, r * 1.12); g.closePath(); g.fill();
    g.fillStyle = 'rgba(80,40,20,.35)'; g.beginPath(); g.ellipse(0, r * 0.72, r * 0.38, r * 0.14, 0, 0, 7); g.fill();
    g.fillStyle = shade(coat ? '#ececf1' : tc, -0.15); g.beginPath(); g.moveTo(-r * 0.45, r * 1.0); g.lineTo(0, r * 1.4); g.lineTo(-r * 0.15, r * 1.6); g.lineTo(-r * 0.6, r * 1.1); g.fill(); g.beginPath(); g.moveTo(r * 0.45, r * 1.0); g.lineTo(0, r * 1.4); g.lineTo(r * 0.15, r * 1.6); g.lineTo(r * 0.6, r * 1.1); g.fill();
    // ears
    for (const s of [-1, 1]) { g.fillStyle = skinGrad(g, s * r * 0.9, -r * 0.2, s * r * 1.05, r * 0.2, SKIN_D); g.beginPath(); g.ellipse(s * r * 0.86, r * 0.02, r * 0.14, r * 0.24, s * 0.2, 0, 7); g.fill(); }
    // face shape with soft 3D shading
    const fg = g.createRadialGradient(-r * 0.25, -r * 0.3, r * 0.1, 0, 0, r * 1.1); fg.addColorStop(0, shade(SKIN, 0.18)); fg.addColorStop(0.55, SKIN); fg.addColorStop(1, shade(SKIN, -0.32));
    g.fillStyle = fg; g.beginPath(); g.moveTo(0, -r * 1.02); g.bezierCurveTo(r * 0.62, -r * 1.02, r * 0.88, -r * 0.6, r * 0.86, -r * 0.05); g.bezierCurveTo(r * 0.84, r * 0.4, r * 0.55, r * 0.78, 0, r * 0.88); g.bezierCurveTo(-r * 0.55, r * 0.78, -r * 0.84, r * 0.4, -r * 0.86, -r * 0.05); g.bezierCurveTo(-r * 0.88, -r * 0.6, -r * 0.62, -r * 1.02, 0, -r * 1.02); g.fill();
    // cheeks, stubble, under-eye
    for (const s of [-1, 1]) { g.fillStyle = 'rgba(200,90,70,.12)'; g.beginPath(); g.ellipse(s * r * 0.45, r * 0.2, r * 0.2, r * 0.12, 0, 0, 7); g.fill(); }
    g.save(); g.globalAlpha = 0.18; for (let i = 0; i < 260; i++) { const a = hashf(i) * Math.PI, rad = r * (0.55 + 0.3 * hashf(i + 3)); const x = Math.cos(a) * rad * 0.9, y = Math.sin(a) * rad * 0.95; if (y < r * 0.35) continue; circle(g, x, y, r * 0.008, '#2a1a10'); } g.restore();
    // eyes + brows
    const browLift = ex.brows === 'raised' || ex.eyes === 'wide' ? -r * 0.06 : 0;
    for (const s of [-1, 1]) {
      realEye(g, s * r * 0.33, -r * 0.12, r * 0.15, ex, 1);
      const tilt = ex.brows === 'angry' ? s * -r * 0.05 : ex.brows === 'worried' ? s * r * 0.05 : 0;
      g.strokeStyle = HAIR; g.lineCap = 'round'; for (let k = 0; k < 4; k++) { g.lineWidth = r * (0.05 - k * 0.008); g.beginPath(); g.moveTo(s * r * 0.15, -r * 0.36 + browLift - tilt + k * r * 0.006); g.quadraticCurveTo(s * r * 0.33, -r * 0.45 + browLift, s * r * 0.53, -r * 0.37 + browLift + tilt); g.stroke(); }
    }
    // nose: bridge shadow, tip highlight, nostrils
    g.strokeStyle = 'rgba(120,60,35,.35)'; g.lineWidth = r * 0.025; g.beginPath(); g.moveTo(r * 0.06, -r * 0.18); g.quadraticCurveTo(r * 0.12, r * 0.12, r * 0.1, r * 0.22); g.stroke();
    g.fillStyle = 'rgba(120,60,35,.28)'; g.beginPath(); g.ellipse(0, r * 0.28, r * 0.16, r * 0.07, 0, 0, 7); g.fill(); g.fillStyle = 'rgba(255,235,215,.45)'; g.beginPath(); g.ellipse(-r * 0.02, r * 0.19, r * 0.05, r * 0.04, 0, 0, 7); g.fill();
    for (const s of [-1, 1]) { g.fillStyle = 'rgba(70,30,20,.55)'; g.beginPath(); g.ellipse(s * r * 0.07, r * 0.29, r * 0.035, r * 0.022, s * 0.3, 0, 7); g.fill(); }
    realMouth(g, 0, r * 0.52, r * 0.2, ex);
    realHair(g, 0, 0, r * 0.98, of, true);
    if (of.face === 'glasses') { g.strokeStyle = '#1c1c1c'; g.lineWidth = r * 0.035; for (const s of [-1, 1]) { rr(g, s * r * 0.33 - r * 0.24, -r * 0.28, r * 0.48, r * 0.32, r * 0.08); g.stroke(); } g.beginPath(); g.moveTo(-r * 0.09, -r * 0.16); g.quadraticCurveTo(0, -r * 0.2, r * 0.09, -r * 0.16); g.stroke(); }
  },
};

// ======================================================================================
// 4. CLAY — plasticine stop-motion puppet: chunky rounded shapes, glossy highlights, thumbprints, goggle eyes
// ======================================================================================
function clayFill(g, x, y, r, base) { const gr = g.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.05, x, y, r * 1.1); gr.addColorStop(0, shade(base, 0.35)); gr.addColorStop(0.5, base); gr.addColorStop(1, shade(base, -0.35)); return gr; }
function thumbprints(g, x, y, r, seed) { g.save(); g.strokeStyle = 'rgba(0,0,0,.07)'; g.lineWidth = r * 0.03; for (let i = 0; i < 3; i++) { const cx = x + (hashf(seed + i) - 0.5) * r, cy = y + (hashf(seed + i + 9) - 0.5) * r; for (let k = 1; k < 5; k++) { g.beginPath(); g.arc(cx, cy, r * 0.06 * k, 0.4 + i, 2.6 + i); g.stroke(); } } g.restore(); }
function clayLimb(g, a, b, w, base) { limb(g, a, b, w, w * 0.92, base); g.strokeStyle = rgba('#ffffff', 0.25); g.lineWidth = w * 0.18; g.beginPath(); g.moveTo(a[0] - w * 0.15, a[1] - w * 0.12); g.lineTo(b[0] - w * 0.15, b[1] - w * 0.12); g.stroke(); }
const CLAY_SKIN = '#e8a77c';
const clay = {
  name: 'Пластилін', desc: 'ліплений із пластиліну персонаж як у stop-motion: м’які об’єми, відблиски, сліди пальців',
  figure(g, o, p, of) {
    const ex = expr(o), lc = legColor(of, '#44557a'), tc = topColor(of);
    clayLimb(g, p.hip, p.kB, 18, shade(lc, -0.3)); clayLimb(g, p.kB, p.fB, 17, shade(lc, -0.3)); g.fillStyle = '#3a2a22'; g.beginPath(); g.ellipse(p.fB[0] + 5, p.fB[1] - 5, 13, 7, 0, 0, 7); g.fill();
    clayLimb(g, p.sh, p.eB, 13, shade(tc, -0.3)); clayLimb(g, p.eB, p.hB, 11, shade(CLAY_SKIN, -0.25)); circle(g, p.hB[0], p.hB[1], 7, shade(CLAY_SKIN, -0.25));
    // body blob
    const bx = (p.sh[0] + p.hip[0]) / 2, by = (p.sh[1] + p.hip[1]) / 2 + 4; g.fillStyle = clayFill(g, bx, by, 34, tc); g.beginPath(); g.ellipse(bx, by, 21, 43, Math.atan2(p.hip[0] - p.sh[0], p.sh[1] - p.hip[1]) * -1, 0, 7); g.fill(); thumbprints(g, bx, by, 34, 4);
    if (of.top === 'labcoat') { g.fillStyle = '#7aa0c8'; g.beginPath(); g.moveTo(bx - 4, p.sh[1]); g.lineTo(bx + 6, p.sh[1]); g.lineTo(bx + 2, p.hip[1]); g.closePath(); g.fill(); }
    clayLimb(g, p.hip, p.kF, 19, lc); clayLimb(g, p.kF, p.fF, 18, lc); g.fillStyle = clayFill(g, p.fF[0] + 6, p.fF[1] - 6, 12, '#4a3428'); g.beginPath(); g.ellipse(p.fF[0] + 6, p.fF[1] - 6, 14, 8, 0, 0, 7); g.fill();
    clayLimb(g, p.sh, p.eF, 14, tc); clayLimb(g, p.eF, p.hF, 12, CLAY_SKIN); g.fillStyle = clayFill(g, p.hF[0], p.hF[1], 9, CLAY_SKIN); g.beginPath(); g.arc(p.hF[0], p.hF[1], 8, 0, 7); g.fill();
    // head: big clay ball, nose blob
    const [hx, hy] = p.head, r = 30; g.fillStyle = clayFill(g, hx, hy, r, CLAY_SKIN); g.beginPath(); g.ellipse(hx, hy, r, r * 0.95, 0, 0, 7); g.fill(); thumbprints(g, hx, hy, r, 11);
    if (of.head === 'cap' || of.head === 'capBack') { const c = of.headColor || '#d64a33'; g.fillStyle = clayFill(g, hx, hy - r * 0.5, r, c); g.beginPath(); g.ellipse(hx, hy - r * 0.35, r * 1.02, r * 0.75, 0, Math.PI, Math.PI * 2); g.fill(); g.beginPath(); g.ellipse(hx + r * 0.9, hy - r * 0.38, r * 0.75, r * 0.16, 0.05, 0, 7); g.fillStyle = shade(c, -0.2); g.fill(); }
    else { g.fillStyle = clayFill(g, hx, hy - r * 0.6, r, '#4a3020'); g.beginPath(); g.ellipse(hx - r * 0.1, hy - r * 0.62, r * 0.95, r * 0.45, -0.1, Math.PI * 0.95, Math.PI * 2.05); g.fill(); }
    features(g, hx + r * 0.05, hy + r * 0.05, r, ex, { ink: '#1a1210', eye: 'ball', white: '#fbf7ef', mouth: '#5a2a22', scale: 1.05 });
    g.fillStyle = clayFill(g, hx + r * 0.6, hy + r * 0.12, r * 0.2, shade(CLAY_SKIN, -0.05)); g.beginPath(); g.ellipse(hx + r * 0.62, hy + r * 0.14, r * 0.2, r * 0.15, 0, 0, 7); g.fill();
    if (of.face === 'glasses') { g.strokeStyle = '#2a2420'; g.lineWidth = 3; for (const dx of [-0.22, 0.42]) { g.beginPath(); g.arc(hx + dx * r, hy - r * 0.03, r * 0.24, 0, 7); g.stroke(); } }
  },
  portrait(g, r, o) {
    const of = o.outfit || {}, ex = expr(o), tc = topColor(of);
    g.fillStyle = clayFill(g, 0, r * 1.7, r * 1.3, tc); g.beginPath(); g.ellipse(0, r * 1.75, r * 1.3, r * 0.9, 0, Math.PI, Math.PI * 2); g.fill(); thumbprints(g, 0, r * 1.4, r, 21);
    g.fillStyle = clayFill(g, 0, 0, r, CLAY_SKIN); g.beginPath(); g.ellipse(0, 0, r, r * 0.95, 0, 0, 7); g.fill(); thumbprints(g, 0, 0, r, 5);
    if (of.head === 'cap' || of.head === 'capBack') { const c = of.headColor || '#d64a33'; g.fillStyle = clayFill(g, -r * 0.2, -r * 0.7, r, c); g.beginPath(); g.ellipse(0, -r * 0.38, r * 1.04, r * 0.76, 0, Math.PI, Math.PI * 2); g.fill(); g.fillStyle = shade(c, -0.22); g.beginPath(); g.ellipse(0, -r * 0.36, r * 1.2, r * 0.2, 0, 0, Math.PI); g.fill(); }
    features(g, 0, r * 0.1, r, ex, { ink: '#1a1210', eye: 'ball', white: '#fbf7ef', mouth: '#5a2a22', front: true, scale: 1.1 });
    g.fillStyle = clayFill(g, 0, r * 0.12, r * 0.14, shade(CLAY_SKIN, -0.05)); g.beginPath(); g.ellipse(0, r * 0.12, r * 0.13, r * 0.1, 0, 0, 7); g.fill();
    g.fillStyle = 'rgba(255,255,255,.35)'; g.beginPath(); g.ellipse(-r * 0.45, -r * 0.45, r * 0.16, r * 0.08, -0.6, 0, 7); g.fill();
  },
};

// ======================================================================================
// 5. FLAT — modern flat-vector explainer character: no outlines, skin tones, simple shapes
// ======================================================================================
const F_SKIN = '#f1b48c', F_HAIR = '#2e2333';
const flat = {
  name: 'Плаский вектор', desc: 'сучасний плаский векторний персонаж як в інфографіці: колір шкіри, зачіска, без контурів',
  figure(g, o, p, of) {
    const ex = expr(o), lc = legColor(of, '#2d3a5c'), tc = topColor(of), coat = of.top === 'labcoat';
    limb(g, p.hip, p.kB, 15, 12, shade(lc, -0.2)); limb(g, p.kB, p.fB, 12, 10, shade(lc, -0.2)); rr(g, p.fB[0] - 4, p.fB[1] - 6, 18, 7, 3); g.fillStyle = '#1e1e2a'; g.fill();
    limb(g, p.sh, p.eB, 11, 10, shade(tc, -0.18)); limb(g, p.eB, p.hB, 9, 8, shade(F_SKIN, -0.12));
    g.fillStyle = tc; g.beginPath(); g.moveTo(p.sh[0] - 15, p.sh[1] - 3); g.quadraticCurveTo(p.sh[0], p.sh[1] - 8, p.sh[0] + 15, p.sh[1] - 3); g.lineTo(p.hip[0] + 15, p.hip[1] + (coat ? 40 : 6)); g.lineTo(p.hip[0] - 15, p.hip[1] + (coat ? 40 : 6)); g.closePath(); g.fill();
    if (coat) { g.fillStyle = '#5b86c4'; g.beginPath(); g.moveTo(p.sh[0] - 5, p.sh[1] - 4); g.lineTo(p.sh[0] + 6, p.sh[1] - 4); g.lineTo(p.hip[0] + 4, p.hip[1] + 2); g.lineTo(p.hip[0] - 3, p.hip[1] + 2); g.closePath(); g.fill(); }
    g.fillStyle = 'rgba(0,0,0,.12)'; g.beginPath(); g.moveTo(p.sh[0] + 4, p.sh[1] - 4); g.lineTo(p.sh[0] + 15, p.sh[1] - 3); g.lineTo(p.hip[0] + 15, p.hip[1] + (coat ? 40 : 6)); g.lineTo(p.hip[0] + 6, p.hip[1] + (coat ? 40 : 6)); g.closePath(); g.fill();
    limb(g, p.hip, p.kF, 15, 12, lc); limb(g, p.kF, p.fF, 12, 10, lc); rr(g, p.fF[0] - 4, p.fF[1] - 6, 19, 7, 3); g.fillStyle = '#26263a'; g.fill();
    limb(g, p.sh, p.eF, 11, 10, coat ? '#f4f4f8' : shade(tc, 0.06)); limb(g, p.eF, p.hF, 9, 8, coat ? '#f4f4f8' : F_SKIN); circle(g, p.hF[0], p.hF[1], 5.5, F_SKIN);
    limb(g, [p.head[0] - 2, p.head[1] + 16], p.sh, 9, 10, shade(F_SKIN, -0.1));
    const [hx, hy] = p.head, r = 22; g.fillStyle = F_SKIN; g.beginPath(); g.ellipse(hx, hy, r * 0.92, r, 0, 0, 7); g.fill();
    circle(g, hx - r * 0.55, hy + r * 0.05, r * 0.2, shade(F_SKIN, -0.08));
    if (of.head === 'cap' || of.head === 'capBack') { const c = of.headColor || '#d64a33'; g.fillStyle = c; g.beginPath(); g.ellipse(hx, hy - r * 0.32, r * 0.98, r * 0.75, 0, Math.PI, Math.PI * 2); g.fill(); rr(g, hx + r * 0.2, hy - r * 0.42, r * 1.25, r * 0.2, r * 0.1); g.fillStyle = shade(c, -0.18); g.fill(); }
    else { g.fillStyle = F_HAIR; g.beginPath(); g.ellipse(hx - r * 0.1, hy - r * 0.45, r * 0.98, r * 0.62, -0.15, Math.PI * 0.92, Math.PI * 2.02); g.fill(); g.beginPath(); g.ellipse(hx - r * 0.75, hy - r * 0.1, r * 0.3, r * 0.45, 0, 0, 7); g.fill(); }
    features(g, hx + r * 0.12, hy + r * 0.05, r, ex, { ink: '#2a1f2e', eye: 'dot', mouth: '#9a3c3c', scale: 0.9 });
    g.strokeStyle = shade(F_SKIN, -0.25); g.lineWidth = 1.6; g.beginPath(); g.moveTo(hx + r * 0.62, hy + r * 0.02); g.lineTo(hx + r * 0.72, hy + r * 0.2); g.lineTo(hx + r * 0.6, hy + r * 0.22); g.stroke();
    if (of.face === 'glasses') { g.strokeStyle = '#2a1f2e'; g.lineWidth = 1.8; for (const dx of [-0.08, 0.5]) { g.beginPath(); g.arc(hx + dx * r, hy - r * 0.05, r * 0.2, 0, 7); g.stroke(); } }
  },
  portrait(g, r, o) {
    const of = o.outfit || {}, ex = expr(o), tc = topColor(of);
    g.fillStyle = tc; g.beginPath(); g.ellipse(0, r * 1.75, r * 1.3, r * 0.9, 0, Math.PI, Math.PI * 2); g.fill();
    g.fillStyle = 'rgba(0,0,0,.1)'; g.beginPath(); g.ellipse(r * 0.3, r * 1.75, r * 1.0, r * 0.9, 0, Math.PI * 1.5, Math.PI * 2); g.lineTo(r * 0.3, r * 1.75); g.fill();
    g.fillStyle = shade(F_SKIN, -0.1); rr(g, -r * 0.28, r * 0.6, r * 0.56, r * 0.5, r * 0.1); g.fill();
    for (const s of [-1, 1]) circle(g, s * r * 0.9, r * 0.05, r * 0.18, shade(F_SKIN, -0.06));
    g.fillStyle = F_SKIN; g.beginPath(); g.ellipse(0, 0, r * 0.9, r, 0, 0, 7); g.fill();
    g.fillStyle = 'rgba(0,0,0,.06)'; g.beginPath(); g.ellipse(r * 0.25, r * 0.1, r * 0.65, r * 0.9, 0, -Math.PI / 2, Math.PI / 2); g.fill();
    if (of.head === 'cap' || of.head === 'capBack') { const c = of.headColor || '#d64a33'; g.fillStyle = c; g.beginPath(); g.ellipse(0, -r * 0.38, r * 0.98, r * 0.78, 0, Math.PI, Math.PI * 2); g.fill(); g.fillStyle = shade(c, -0.18); g.beginPath(); g.ellipse(0, -r * 0.36, r * 1.18, r * 0.18, 0, 0, Math.PI); g.fill(); }
    else { g.fillStyle = F_HAIR; g.beginPath(); g.ellipse(0, -r * 0.55, r * 0.98, r * 0.55, 0, Math.PI * 0.95, Math.PI * 2.05); g.fill(); }
    for (const s of [-1, 1]) { g.fillStyle = 'rgba(230,110,110,.22)'; g.beginPath(); g.ellipse(s * r * 0.48, r * 0.25, r * 0.14, r * 0.08, 0, 0, 7); g.fill(); }
    features(g, 0, r * 0.04, r, ex, { ink: '#2a1f2e', eye: 'dot', mouth: '#9a3c3c', front: true, scale: 0.95, alwaysBrows: true });
    g.strokeStyle = shade(F_SKIN, -0.22); g.lineWidth = r * 0.03; g.beginPath(); g.moveTo(0, r * 0.02); g.lineTo(r * 0.06, r * 0.2); g.lineTo(-r * 0.04, r * 0.22); g.stroke();
  },
};

// ======================================================================================
// 6. CARTOON — flat character-sheet style: bold black outlines, cream-paper palette, simple round heads.
//    Outfit extras: top 'overalls' (color = denim, color2 = shirt), beard: colour, hair: 'bowl', hairColor, boots: colour, shoes: colour.
// ======================================================================================
const C_INK = '#1d1a17', C_SKIN = '#fadcc0', C_LW = 3.2;
function oLimb(g, a, b, w, fill, w2 = w) { limb(g, a, b, w + C_LW * 2, w2 + C_LW * 2, C_INK); limb(g, a, b, w, w2, fill); }
function oFill(g, fill, lw = C_LW) { g.fillStyle = fill; g.fill(); g.strokeStyle = C_INK; g.lineWidth = lw; g.lineJoin = 'round'; g.lineCap = 'round'; g.stroke(); }
function oCircle(g, x, y, r, fill, lw = C_LW) { g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); oFill(g, fill, lw); }
function cartoonEyes(g, cx, cy, r, ex, front) {
  const sp = r * (front ? 0.3 : 0.26), ey = cy - r * 0.02, look = ex.look, xs = front ? [cx - sp, cx + sp] : [cx - sp + r * 0.22, cx + sp + r * 0.22];
  xs.forEach((x, i) => {
    const k = front ? 1 : i === 0 ? 0.85 : 1;
    if (ex.eyes === 'closed') { g.strokeStyle = C_INK; g.lineWidth = r * 0.06; g.beginPath(); g.moveTo(x - r * 0.08, ey); g.lineTo(x + r * 0.08, ey); g.stroke(); return; }
    if (ex.eyes === 'happy') { g.strokeStyle = C_INK; g.lineWidth = r * 0.06; g.beginPath(); g.arc(x, ey + r * 0.04, r * 0.08, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); return; }
    const big = ex.eyes === 'wide' || ex.eyes === 'ring' ? 1.18 : 1;
    g.fillStyle = C_INK; g.beginPath(); g.ellipse(x + look[0] * r * 0.04, ey + look[1] * r * 0.04, r * 0.075 * k * big, r * 0.115 * big, 0, 0, 7); g.fill();
  });
  return xs;
}
function cartoonBrows(g, xs, cy, r, ex) {
  const by = cy - r * 0.24, bw = r * 0.11; g.strokeStyle = C_INK; g.lineWidth = r * 0.055; g.lineCap = 'round';
  const line = (x, a) => { g.beginPath(); g.moveTo(x - bw, by + a); g.lineTo(x + bw, by - a); g.stroke(); };
  if (ex.brows === 'angry') { line(xs[0], r * 0.07); line(xs[1], -r * 0.07); }
  else if (ex.brows === 'worried') { line(xs[0], -r * 0.05); line(xs[1], r * 0.05); }
  else xs.forEach(x => { g.beginPath(); g.arc(x, by + r * (ex.brows === 'raised' || ex.eyes === 'wide' ? 0.12 : 0.16), r * 0.12, Math.PI * 1.25, Math.PI * 1.75); g.stroke(); });
}
function cartoonMouth(g, x, y, r, ex, onBeard) {
  const k = r * 0.13; g.strokeStyle = C_INK; g.fillStyle = C_INK; g.lineWidth = r * 0.05; g.lineCap = 'round';
  if (onBeard) { g.fillStyle = C_SKIN; g.beginPath(); g.ellipse(x, y, k * 1.35, k * (ex.mouth === 'talk' || ex.mouth === 'o' || ex.mouth === 'oBig' ? 1.2 : 0.75), 0, 0, 7); g.fill(); g.fillStyle = C_INK; }
  switch (ex.mouth) {
    case 'talk': g.beginPath(); g.ellipse(x, y, k * 0.8, k * (0.2 + 0.8 * ex.talk), 0, 0, 7); g.fill(); break;
    case 'o': case 'oBig': g.beginPath(); g.ellipse(x, y, k * 0.45, k * 0.65, 0, 0, 7); g.fillStyle = onBeard ? C_INK : C_INK; g.fill(); break;
    case 'grin': g.beginPath(); g.moveTo(x - k, y - k * 0.2); g.quadraticCurveTo(x, y + k * 1.3, x + k, y - k * 0.2); g.closePath(); g.fillStyle = '#ffffff'; g.fill(); g.stroke(); break;
    case 'frown': g.beginPath(); g.arc(x, y + k * 0.7, k * 0.8, Math.PI + 0.5, Math.PI * 2 - 0.5); g.stroke(); break;
    case 'flat': case 'smallFlat': g.beginPath(); g.moveTo(x - k * 0.7, y); g.lineTo(x + k * 0.7, y); g.stroke(); break;
    case 'smirk': g.beginPath(); g.moveTo(x - k * 0.7, y); g.quadraticCurveTo(x + k * 0.2, y + k * 0.3, x + k * 0.9, y - k * 0.4); g.stroke(); break;
    default: g.beginPath(); g.arc(x, y - k * 0.6, k * 0.85, 0.45, Math.PI - 0.45); g.stroke();
  }
}
function cartoonBeard(g, cx, cy, r, col, front) {
  g.save(); g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.clip();
  g.fillStyle = col; g.beginPath(); const sx = front ? 0 : r * 0.2;
  g.moveTo(cx - r * 1.1, cy + r * 0.02); g.lineTo(cx - r * 0.8 + sx, cy + r * 0.12); g.quadraticCurveTo(cx - r * 0.55 + sx, cy + r * 0.5, cx - r * 0.25 + sx, cy + r * 0.24);
  g.quadraticCurveTo(cx + sx, cy + r * 0.14, cx + r * 0.25 + sx, cy + r * 0.24); g.quadraticCurveTo(cx + r * 0.55 + sx, cy + r * 0.5, cx + r * 0.8 + sx, cy + r * 0.12); g.lineTo(cx + r * 1.1, cy + r * 0.02); g.lineTo(cx + r * 1.1, cy + r * 1.2); g.lineTo(cx - r * 1.1, cy + r * 1.2); g.closePath(); g.fill(); g.restore();
}
function cartoonCap(g, cx, cy, r, col, front) {
  g.beginPath(); g.moveTo(cx - r * 0.98, cy - r * 0.22); g.bezierCurveTo(cx - r * 1.0, cy - r * 1.25, cx + r * 1.0, cy - r * 1.25, cx + r * 0.98, cy - r * 0.22); g.closePath(); oFill(g, col);
  g.beginPath(); g.moveTo(cx, cy - r * 1.0); g.quadraticCurveTo(cx + r * 0.25, cy - r * 0.6, cx + r * 0.2, cy - r * 0.24); g.strokeStyle = C_INK; g.lineWidth = C_LW * 0.7; g.stroke();
  oCircle(g, cx, cy - r * 1.0, r * 0.08, col, C_LW * 0.8);
  if (front) { g.beginPath(); g.moveTo(cx - r * 0.95, cy - r * 0.22); g.quadraticCurveTo(cx, cy - r * 0.02, cx + r * 0.95, cy - r * 0.22); g.quadraticCurveTo(cx, cy - r * 0.36, cx - r * 0.95, cy - r * 0.22); oFill(g, shade(col, -0.12)); }
  else { g.beginPath(); g.moveTo(cx + r * 0.6, cy - r * 0.3); g.quadraticCurveTo(cx + r * 1.4, cy - r * 0.42, cx + r * 1.55, cy - r * 0.24); g.quadraticCurveTo(cx + r * 1.1, cy - r * 0.12, cx + r * 0.6, cy - r * 0.18); g.closePath(); oFill(g, shade(col, -0.1)); }
}
function cartoonBowl(g, cx, cy, r, col, front) {
  g.beginPath(); g.moveTo(cx - r * 1.03, cy + (front ? -r * 0.05 : r * 0.25)); g.bezierCurveTo(cx - r * 1.15, cy - r * 1.3, cx + r * 1.15, cy - r * 1.3, cx + r * 1.03, cy - r * 0.2);
  g.quadraticCurveTo(cx + r * 0.6, cy - r * 0.55, cx + r * 0.1, cy - r * 0.55); g.quadraticCurveTo(cx - r * 0.3, cy - r * 0.3, cx - r * 0.6, cy - r * 0.45); g.quadraticCurveTo(cx - r * 0.85, cy - r * 0.2, cx - r * 1.03, cy + (front ? -r * 0.05 : r * 0.25)); g.closePath(); oFill(g, col);
}
function cartoonGlasses(g, xs, cy, r) { g.strokeStyle = C_INK; g.lineWidth = r * 0.055; xs.forEach(x => { g.beginPath(); g.arc(x, cy - r * 0.02, r * 0.19, 0, 7); g.stroke(); }); g.beginPath(); g.moveTo(xs[0] + r * 0.19, cy - r * 0.04); g.lineTo(xs[1] - r * 0.19, cy - r * 0.04); g.stroke(); }
function cartoonHead(g, cx, cy, r, of, ex, front) {
  const ears = front ? [-1, 1] : [-1]; ears.forEach(s => oCircle(g, cx + s * r * (front ? 0.97 : 0.62), cy + r * 0.05, r * 0.17, C_SKIN));
  oCircle(g, cx, cy, r, C_SKIN);
  if (of.beard) cartoonBeard(g, cx, cy, r, of.beard, front);
  if (of.beard) { g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.strokeStyle = C_INK; g.lineWidth = C_LW; g.stroke(); }
  const xs = cartoonEyes(g, cx, cy, r, ex, front); cartoonBrows(g, xs, cy, r, ex);
  cartoonMouth(g, (xs[0] + xs[1]) / 2, cy + r * (of.beard ? 0.42 : 0.4), r, ex, !!of.beard);
  if (of.hair === 'bowl') cartoonBowl(g, cx, cy, r, of.hairColor || '#3e2b22', front);
  if (of.head === 'cap' || of.head === 'capBack') cartoonCap(g, cx, cy, r, of.headColor || '#5a9e4f', front);
  if (of.face === 'glasses') cartoonGlasses(g, xs, cy, r);
}
function cartoonTablet(g, h) { g.save(); g.translate(h[0] + 4, h[1] - 14); g.rotate(-0.15); rr(g, -14, -20, 34, 26, 4); oFill(g, '#3a3f46'); rr(g, -10, -16, 26, 18, 2); g.fillStyle = '#5b636d'; g.fill(); g.strokeStyle = '#9aa3ad'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(-8, -1); g.lineTo(-1, -9); g.lineTo(5, -4); g.lineTo(13, -13); g.stroke(); g.restore(); }
const cartoon = {
  name: 'Мультяшний контур', desc: 'плаский мультяшний стиль з товстим чорним контуром, як на листах персонажів',
  figure(g, o, p, of) {
    const ex = expr(o), over = of.top === 'overalls', coat = of.top === 'labcoat';
    const denim = of.color || '#4f7fbf', shirt = over ? (of.color2 || '#f6cf5c') : (of.color || '#d64a33'), coatC = coat ? (of.color || '#6aa874') : null;
    const pants = over ? denim : (of.legs || '#3d5c45'), foot = of.boots || of.shoes || '#2c3a30';
    const shoe = (fp, back) => { g.save(); g.translate(fp[0], fp[1]); if (of.boots) { g.beginPath(); g.moveTo(-7, -14); g.lineTo(7, -14); g.lineTo(8, -6); g.lineTo(18, -4); g.lineTo(18, 0); g.lineTo(-8, 0); g.closePath(); oFill(g, back ? shade(foot, -0.15) : foot); } else { rr(g, -7, -7, 23, 8, 4); oFill(g, back ? shade(foot, -0.15) : foot); } g.restore(); };
    // back leg + back arm
    const ank = (q) => [q[0], q[1] - 9];
    oLimb(g, p.hip, p.kB, 14, shade(pants, -0.12)); oLimb(g, p.kB, ank(p.fB), 13, shade(pants, -0.12)); shoe(p.fB, true);
    if (coat) { oLimb(g, p.hip, p.kF, 14, pants); oLimb(g, p.kF, ank(p.fF), 13, pants); shoe(p.fF, false); }
    if (coat) { oLimb(g, p.sh, p.eB, 12, shade(coatC, -0.12)); oLimb(g, p.eB, p.hB, 11, shade(coatC, -0.12)); }
    else { oLimb(g, p.sh, p.eB, 4.5, shade(C_SKIN, -0.08)); oLimb(g, p.eB, p.hB, 4.5, shade(C_SKIN, -0.08)); }
    oCircle(g, p.hB[0], p.hB[1], 6, shade(C_SKIN, -0.08));
    if (o.prop === 'tablet' || o.prop?.type === 'tablet') cartoonTablet(g, p.hB);
    // torso
    const sx = p.sh[0], sy = p.sh[1], hx = p.hip[0], hy = p.hip[1];
    if (coat) { g.beginPath(); g.moveTo(sx - 15, sy - 4); g.lineTo(sx + 15, sy - 4); g.lineTo(hx + 22, hy + 42); g.lineTo(hx - 20, hy + 42); g.closePath(); oFill(g, coatC);
      g.beginPath(); g.moveTo(sx - 4, sy - 4); g.lineTo(sx + 2, sy + 16); g.lineTo(sx + 8, sy - 4); g.closePath(); oFill(g, '#9fc9b0', C_LW * 0.7);
      g.strokeStyle = C_INK; g.lineWidth = C_LW * 0.8; g.beginPath(); g.moveTo(sx + 2, sy + 16); g.lineTo(hx + 3, hy + 40); g.stroke(); g.beginPath(); g.moveTo(sx - 8, sy - 3); g.lineTo(sx - 1, sy + 12); g.lineTo(sx - 6, sy + 16); g.stroke(); }
    else { g.beginPath(); g.moveTo(sx - 14, sy - 4); g.quadraticCurveTo(sx, sy - 8, sx + 14, sy - 4); g.lineTo(hx + 14, hy + 4); g.lineTo(hx - 14, hy + 4); g.closePath(); oFill(g, shirt); }
    if (over) { g.beginPath(); g.moveTo(sx - 11, sy + 14); g.lineTo(sx + 12, sy + 14); g.lineTo(hx + 17, hy + 2); g.quadraticCurveTo(hx + 18, hy + 14, hx + 10, hy + 16); g.lineTo(hx - 10, hy + 16); g.quadraticCurveTo(hx - 18, hy + 14, hx - 17, hy + 2); g.closePath(); oFill(g, denim);
      g.strokeStyle = C_INK; g.lineWidth = C_LW; for (const d of [-8, 9]) { g.beginPath(); g.moveTo(sx + d, sy + 15); g.lineTo(sx + d * 0.8, sy - 4); g.stroke(); }
      rr(g, sx - 5, sy + 22, 14, 11, [1, 1, 5, 5]); g.strokeStyle = C_INK; g.lineWidth = C_LW * 0.8; g.stroke(); }
    // front leg
    if (!coat) { oLimb(g, p.hip, p.kF, 14, pants); oLimb(g, p.kF, ank(p.fF), 13, pants); shoe(p.fF, false); }
    // front arm
    if (coat) { oLimb(g, p.sh, p.eF, 12, coatC); oLimb(g, p.eF, p.hF, 11, coatC); }
    else { oLimb(g, p.sh, p.eF, 4.5, C_SKIN); oLimb(g, p.eF, p.hF, 4.5, C_SKIN);
      oLimb(g, p.sh, [lerp(p.sh[0], p.eF[0], 0.55), lerp(p.sh[1], p.eF[1], 0.55)], 14, shirt, 12); }
    oCircle(g, p.hF[0], p.hF[1], 6.5, C_SKIN);
    // neck + head
    oLimb(g, [p.head[0] - 2, p.head[1] + 20], [sx, sy - 2], 8, C_SKIN);
    cartoonHead(g, p.head[0], p.head[1] - 2, 27, of, ex, false);
  },
  portrait(g, r, o) {
    const of = o.outfit || {}, ex = expr(o), over = of.top === 'overalls', coat = of.top === 'labcoat';
    const shirt = over ? (of.color2 || '#f6cf5c') : coat ? '#9fc9b0' : (of.color || '#d64a33');
    // shoulders
    g.beginPath(); g.moveTo(-r * 1.35, r * 2.3); g.quadraticCurveTo(-r * 1.4, r * 1.05, -r * 0.4, r * 0.98); g.lineTo(r * 0.4, r * 0.98); g.quadraticCurveTo(r * 1.4, r * 1.05, r * 1.35, r * 2.3); g.closePath(); oFill(g, coat ? (of.color || '#6aa874') : shirt, r * 0.035);
    if (coat) { g.beginPath(); g.moveTo(-r * 0.4, r * 0.98); g.lineTo(0, r * 1.5); g.lineTo(r * 0.4, r * 0.98); g.closePath(); oFill(g, shirt, r * 0.03); for (const s of [-1, 1]) { g.beginPath(); g.moveTo(s * r * 0.4, r * 0.98); g.lineTo(s * r * 0.15, r * 1.6); g.lineTo(s * r * 0.5, r * 1.3); g.lineTo(s * r * 0.62, r * 1.02); g.closePath(); oFill(g, shade(of.color || '#6aa874', -0.08), r * 0.03); } }
    if (over) { g.beginPath(); g.moveTo(-r * 0.75, r * 1.75); g.lineTo(r * 0.75, r * 1.75); g.lineTo(r * 0.8, r * 2.4); g.lineTo(-r * 0.8, r * 2.4); g.closePath(); oFill(g, of.color || '#4f7fbf', r * 0.035);
      g.strokeStyle = C_INK; g.lineWidth = r * 0.035; for (const s of [-1, 1]) { rr(g, s * r * 0.62 - r * 0.1, r * 1.05, r * 0.2, r * 0.72, r * 0.04); g.fillStyle = of.color || '#4f7fbf'; g.fill(); g.stroke(); } }
    // neck
    rr(g, -r * 0.26, r * 0.7, r * 0.52, r * 0.42, r * 0.1); oFill(g, C_SKIN, r * 0.035);
    // head (front)
    const lw = r * 0.035; const saveLW = C_LW;
    [-1, 1].forEach(s => { g.beginPath(); g.arc(s * r * 0.97, r * 0.05, r * 0.17, 0, 7); oFill(g, C_SKIN, lw); });
    g.beginPath(); g.arc(0, 0, r, 0, 7); oFill(g, C_SKIN, lw);
    if (of.beard) { cartoonBeard(g, 0, 0, r, of.beard, true); g.beginPath(); g.arc(0, 0, r, 0, 7); g.strokeStyle = C_INK; g.lineWidth = lw; g.stroke(); }
    const xs = cartoonEyes(g, 0, 0, r, ex, true); cartoonBrows(g, xs, 0, r, ex);
    cartoonMouth(g, 0, r * (of.beard ? 0.42 : 0.4), r, ex, !!of.beard);
    if (of.hair === 'bowl') { g.save(); g.lineWidth = lw; cartoonBowl(g, 0, 0, r, of.hairColor || '#3e2b22', true); g.restore(); }
    if (of.head === 'cap' || of.head === 'capBack') cartoonCap(g, 0, 0, r, of.headColor || '#5a9e4f', true);
    if (of.face === 'glasses') cartoonGlasses(g, xs, 0, r);
  },
};

export const SKINS = { paper, lego, human, clay, flat, cartoon };
