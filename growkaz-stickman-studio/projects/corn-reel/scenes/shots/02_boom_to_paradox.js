// shots/02 — s13–s25: the boom, the catch (mule / F2 / seed every year), the paradox.
import { E, V, S, registerShot, mood, layer, blurLayer, veil, ease, prog, clamp, lerp, wordTime, shake, seg, circle, ring, rr, poly, glow, alpha, shade, mix, text, rng, FONTS } from '/engine/core.js';
import { drawFigure, POSES, posesAt, breathe, walkPose, bigFace } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { field, lab, pasture, cornPlant, cornEar, equine, GROUND } from '../sets/world.js';
import { yieldChart } from '../sets/charts.js';
import { FARMER, DOC } from '../cast.js';

const wt = (w, info, fb) => (wordTime(w, info.shot.start - 0.3) ?? info.shot.start + fb) - info.shot.start;
const pop = (t, at) => ease.outBack(prog(t, at, at + 0.35));
const big = (g, str, y, o = {}) => text(g, str, o.x ?? 0, y, { size: o.size || 120, color: o.color || S().ui.gold, glow: 30, glowColor: alpha(o.color || S().ui.gold, 0.7), spacing: 3, alpha: o.a ?? 1, font: o.font || FONTS.title, weight: o.weight || 700 });
const label = (g, str, x, y, o = {}) => text(g, str, x, y, { size: o.size || 44, color: o.color || S().ui.cream, font: FONTS.ui, weight: 900, spacing: 2, alpha: o.a ?? 1, glow: o.glow || 0, glowColor: alpha(o.color || S().ui.cream, 0.6) });

// s13 — 3D: lush hybrid field, the farmer stands in it
registerShot('s13', {
  kind: '3d',
  init(T) {
    const M = mood('golden');
    const st = T.stage({ mood: 'golden', fov: 55, fog: [10, 40], keyPos: [10, 6, -8], keyIntensity: 3, ambient: 1.8 });
    st.add(T.ground(80, 80, '#3a2a1c'));
    const r = rng(11), stalk = '#3f7a32', leaf = '#4f9a3c', tas = '#d8b860';
    for (let i = -9; i <= 9; i++) for (let j = -9; j <= 9; j++) {
      if (Math.abs(i) <= 1 && Math.abs(j) <= 1) continue;
      const x = i * 0.9 + (r() - 0.5) * 0.15, z = j * 0.7 + (r() - 0.5) * 0.15, h = 2.2 + r() * 0.3;
      st.add(T.cyl(0.03, 0.05, h, stalk, x, h / 2, z, 5));
      for (let k = 0; k < 2; k++) { const lf = T.box(0.9, 0.03, 0.14, leaf, x, h * (0.45 + k * 0.25), z); lf.rotation.y = r() * 6.28; lf.rotation.z = (k ? 1 : -1) * 0.35; st.add(lf); }
      st.add(T.cone(0.08, 0.3, tas, x, h + 0.1, z, 5));
      if (r() > 0.4) st.add(T.cyl(0.07, 0.06, 0.32, '#e8c45a', x + 0.06, h * 0.55, z, 6));
    }
    const farmer = T.figure3D(FARMER, { rim: M.rim, pose: POSES.cheer }); st.add(farmer);
    return { stage: st, farmer };
  },
  draw(s, t, info, T) { T.orbit(s.stage.camera, t, { target: [0, 1.4, 0], radius: 6.5, height: [4.5, 3.2], from: -1.1, to: -0.3, dur: info.dur }); },
  overlay(g, t, info) { const k = pop(t, 0.6); g.save(); g.translate(E.W / 2, E.H * 0.16); g.scale(k, k); big(g, 'ВСЕ ЗМІНИЛОСЯ', 0, { size: 84 }); g.restore(); },
});

// s14 — the yield line rockets to 10 t/ha
registerShot('s14', { draw(g, t, info) {
  g.save(); const z = 1.04 - 0.03 * t; g.translate(E.W / 2, E.H / 2); g.scale(z, z); g.translate(-E.W / 2, -E.H / 2);
  UI.blueprint(g);
  yieldChart(g, t, { upTo: lerp(1930, 2004, ease.inOut(prog(t, 0.1, 1.4))), hot: true });
  g.restore();
  const v = lerp(1.5, 10, ease.inOut(prog(t, 0.1, 1.4)));
  UI.readout(g, { value: v.toFixed(1).replace('.', ',') + ' т/га', x: E.W / 2, y: E.H * 0.68, align: 'center', size: 110, a: ease.out(prog(t, 0, 0.3)) });
  label(g, '×6,6', E.W / 2, E.H * 0.74, { color: S().ui.gold, size: 48, a: ease.out(prog(t, 1.4, 1.7)) });
} });

// s15 — the planted area shrinks
registerShot('s15', { draw(g, t, info) {
  UI.blueprint(g); const c = UI.bpStroke(), ui = S().ui;
  const k = ease.inOut(prog(t, 0.4, 1.4)), sc = lerp(1, Math.sqrt(0.78), k);
  const W = 760 * sc, H = 760 * sc, x = E.W / 2 - W / 2, y = E.H * 0.42 - H / 2;
  g.setLineDash([12, 10]); g.strokeStyle = alpha(c, 0.5); g.lineWidth = 3; g.strokeRect(E.W / 2 - 380, E.H * 0.42 - 380, 760, 760); g.setLineDash([]);
  g.fillStyle = alpha('#3f8a3a', 0.55); g.fillRect(x, y, W, H);
  for (let i = 0; i < 12; i++) seg(g, [[x + (i + 0.5) * W / 12, y + 10], [x + (i + 0.5) * W / 12, y + H - 10]], 6, alpha('#9fe08a', 0.7));
  g.strokeStyle = '#9fe08a'; g.lineWidth = 4; g.strokeRect(x, y, W, H);
  label(g, 'ПЛОЩА ПОСІВІВ', E.W / 2, E.H * 0.12, { color: c, size: 52 });
  const a = wt('скоротилась', info, 1.3); const kk = pop(t, a - 0.3);
  g.save(); g.translate(E.W / 2, E.H * 0.42); g.scale(kk, kk); big(g, '−22%', 0, { size: 150, color: ui.accent, font: FONTS.ui, weight: 900 }); g.restore();
} });

// s16 — the breeder: "but there's a catch"
registerShot('s16', { draw(g, t, info) {
  blurLayer(g, 14, (g) => lab(g, t, { z: 1.6, x: 120, y: -200 })); veil(g, '#120a10', 0.35);
  const M = mood('interiorWarm'), r = 320 * (1 + 0.04 * t);
  bigFace(g, E.W / 2, E.H * 0.47, r, { outfit: DOC, expr: t < 0.6 ? 'thinking' : 'smirk', look: [-0.4, -0.2], rimColor: M.rim, rimSide: 1, blink: (t % 2.7) > 2.6 });
  const k = pop(t, 0.3); g.save(); g.translate(E.W / 2, E.H * 0.13); g.scale(k, k); big(g, 'НЮАНС', 0, { size: 110, color: S().ui.accent }); g.restore();
} });

// s17 — the mule leaves no foal
registerShot('s17', { draw(g, t, info) {
  const cam = { z: 1.1 + 0.05 * t, x: -10 * t };
  const { GY, M } = pasture(g, t, cam);
  layer(g, cam, 1, (g) => {
    equine(g, E.W / 2 - 120, GY + 40, 1.3, { kind: 'mule', facing: 1, t, rim: M.rim });
    g.save(); g.setLineDash([10, 10]); g.globalAlpha = 0.7; g.strokeStyle = M.rim; g.lineWidth = 4;
    const fx = E.W / 2 + 290, fy = GY + 40; g.beginPath(); g.ellipse(fx, fy - 70, 50, 24, 0, 0, 7); g.stroke();
    for (const lx of [-30, 30]) { g.beginPath(); g.moveTo(fx + lx, fy - 60); g.lineTo(fx + lx, fy); g.stroke(); }
    g.beginPath(); g.moveTo(fx + 40, fy - 80); g.lineTo(fx + 66, fy - 130); g.stroke(); g.beginPath(); g.ellipse(fx + 76, fy - 134, 22, 12, 0.5, 0, 7); g.stroke(); g.restore();
    const a = wt('відтворює', info, 0.9), k = ease.out(prog(t, a, a + 0.25));
    if (k > 0) { const c = S().ui.accent, d = 90 * k; seg(g, [[fx - d, fy - 160 * 0.5 - d], [fx + d, fy - 80 + d]], 12, c); seg(g, [[fx + d, fy - 80 - d], [fx - d, fy - 80 + d]], 12, c); }
  });
  label(g, 'МУЛ', E.W / 2 - 120, GY + 150, { size: 54, a: ease.out(prog(t, 0.1, 0.4)) });
  FX.dust(g, t, { count: 30, color: '#ffd9b0', a: 0.35 });
} });

// s18 — sow the hybrid's own grain: the field splits (F1 even -> F2 ragged)
registerShot('s18', { draw(g, t, info) {
  const cam = { z: 1.2 + 0.04 * t, y: -40 };
  const { GY, M } = field(g, t, cam);
  const a = wt('розщепиться', info, 2.1) - 0.1, k = ease.out(prog(t, a, a + 0.5));
  const r = rng(31);
  layer(g, cam, 1, (g) => {
    for (let i = -4; i <= 4; i++) { const v = 0.45 + r() * 0.9, hv = r(); cornPlant(g, E.W / 2 + i * 115, GY + 80, lerp(520, 520 * v, k), { t, seed: 500 + i, health: lerp(1, 0.55 + hv * 0.45, k), lit: M.rim }); }
  });
  veil(g, '#000', 0.15);
  label(g, k < 0.5 ? 'ГІБРИД · 1-ШЕ ПОКОЛІННЯ' : 'ВЛАСНЕ ЗЕРНО · 2-ГЕ ПОКОЛІННЯ', E.W / 2, E.H * 0.15, { size: 46, color: k < 0.5 ? S().ui.gold : S().ui.accent, glow: 16 });
  if (t > a) { label(g, 'УРОЖАЙ ↓', E.W / 2, E.H * 0.22, { size: 64, color: S().ui.accent, a: ease.out(prog(t, a + 0.3, a + 0.6)), glow: 16 }); }
} });

// s19 — buying new seed every year
registerShot('s19', { draw(g, t, info) {
  const cam = { z: 1.15, x: 30 * t, y: 20 };
  const { GY, M } = field(g, t, cam);
  const s = 1.7, x = E.W / 2 - 160 + 60 * t;
  layer(g, cam, 1, (g) => {
    const p = walkPose(t * Math.PI * 2 * 0.5);
    drawFigure(g, { x, y: GY + 40, s, facing: 1, outfit: FARMER, pose: { ...p, hF: [20, -178], eF: [26, -150], hB: [14, -180], eB: [6, -150] }, expr: 'determined', rim: { color: M.rim, dir: [1, -0.4], w: 5 } });
    const bx = x + 10, by = GY + 40 - 225 * s; rr(g, bx - 80, by - 50, 160, 100, 24); g.fillStyle = '#c8a878'; g.fill(); g.fillStyle = '#a88858'; g.fillRect(bx - 80, by + 20, 160, 10);
    text(g, 'НАСІННЯ', bx, by - 4, { size: 30, color: '#3a2a1a', font: FONTS.ui, weight: 900 });
  });
  const yr = 1937 + Math.min(3, Math.floor(t / 0.55));
  UI.badge(g, { str: String(yr), size: 64, a: ease.out(prog(t, 0, 0.3)), x: E.W - 80, y: 200 });
  label(g, 'ЩОРОКУ — НОВЕ', E.W / 2, E.H * 0.15, { size: 52, color: S().ui.gold, glow: 16, a: ease.out(prog(t, 0.6, 0.9)) });
  FX.dust(g, t, { count: 35, color: '#ffe2bd', a: 0.3 });
} });

// s20 — balance: the lost harvest outweighs the seed bill
registerShot('s20', { draw(g, t, info) {
  UI.blueprint(g); const c = UI.bpStroke(), ui = S().ui;
  const a = wt('коштує', info, 0.9), ang = lerp(0, 0.28, ease.outBack(prog(t, a - 0.2, a + 0.4)));
  const px = E.W / 2, py = E.H * 0.3, L = 380;
  poly(g, [[px, py], [px - 70, E.H * 0.62], [px + 70, E.H * 0.62]], alpha(c, 0.25)); seg(g, [[px - 160, E.H * 0.62], [px + 160, E.H * 0.62]], 8, c);
  const ends = [-1, 1].map((s) => [px + s * L * Math.cos(ang), py + s * L * Math.sin(ang)]);
  seg(g, [ends[0], ends[1]], 10, c); circle(g, px, py, 16, ui.gold);
  ends.forEach(([ex, ey], i) => {
    seg(g, [[ex, ey], [ex - 90, ey + 150]], 3, alpha(c, 0.8)); seg(g, [[ex, ey], [ex + 90, ey + 150]], 3, alpha(c, 0.8));
    g.strokeStyle = c; g.lineWidth = 6; g.beginPath(); g.moveTo(ex - 120, ey + 150); g.quadraticCurveTo(ex, ey + 210, ex + 120, ey + 150); g.stroke();
    if (i === 0) { rr(g, ex - 50, ey + 70, 100, 80, 18); g.fillStyle = '#c8a878'; g.fill(); label(g, 'НАСІННЯ', ex, ey + 250, { size: 40 }); }
    else { for (let k = 0; k < 5; k++) cornEar(g, ex - 60 + (k % 3) * 60, ey + 140 - Math.floor(k / 3) * 40, 90, { rot: -0.2 + k * 0.1 }); label(g, 'НЕДОБІР', ex, ey + 250, { size: 40, color: ui.accent }); }
  });
  label(g, 'ДОРОЖЧЕ', E.W / 2 + 140, E.H * 0.15, { size: 64, color: ui.accent, glow: 18, a: ease.out(prog(t, a + 0.3, a + 0.6)) });
} });

// s21 — paradox: the old varieties fade from the fields
registerShot('s21', { draw(g, t, info) {
  const cam = { z: 1.05 + 0.05 * t, y: -20 };
  const ghost = lerp(1, 0.25, ease.inOut(prog(t, 1.0, 2.4)));
  const { GY, M } = field(g, t, cam, { mood: 'dusk', ghost });
  layer(g, cam, 1, (g) => { for (let i = -3; i <= 3; i++) cornPlant(g, E.W / 2 + i * 150, GY + 60, 400 + ((i * 37) % 5) * 40, { t, seed: 700 + i, a: ghost, lit: M.rim }); });
  const k = pop(t, 0.15); g.save(); g.translate(E.W / 2, E.H * 0.16); g.scale(k, k); big(g, 'ПАРАДОКС', 0, { size: 120 }); g.restore();
  label(g, 'СОРТИ ЗНИКЛИ З ПОЛІВ', E.W / 2, E.H * 0.24, { size: 42, a: ease.out(prog(t, 1.3, 1.6)) });
  FX.dust(g, t, { count: 40, color: '#ffd9b0', a: 0.3 });
} });

// s22 — but not from the genes
registerShot('s22', { draw(g, t, info) {
  UI.blueprint(g); const ui = S().ui;
  const cx = E.W / 2, y0 = E.H * 0.1, y1 = E.H * 0.7, n = 26;
  for (let i = 0; i <= n; i++) {
    const y = lerp(y0, y1, i / n), ph = i * 0.5 + t * 2.2, a = Math.sin(ph) * 190, b = -a, depth = Math.cos(ph);
    seg(g, [[cx + a, y], [cx + b, y]], 4, alpha(ui.cream, 0.25 + 0.2 * Math.abs(depth)));
    circle(g, cx + a, y, 13 + 4 * depth, depth > 0 ? ui.gold : shade(ui.gold, -0.4)); circle(g, cx + b, y, 13 - 4 * depth, depth < 0 ? ui.cream : shade(ui.cream, -0.5));
  }
  glow(g, cx, E.H * 0.4, 420, ui.gold, 0.18);
  const k = pop(t, 0.5); g.save(); g.translate(cx, E.H * 0.4); g.scale(k, k); big(g, 'ГЕНИ', 0, { size: 130 }); g.restore();
} });

// s23 — 87% from five old varieties
registerShot('s23', { draw(g, t, info) {
  UI.blueprint(g); const ui = S().ui;
  const segs = [['REID YELLOW DENT', 51, ui.gold], ['MINNESOTA 13', 13, '#9fe08a'], ['LANCASTER SURE CROP', 13, '#7fd0d6'], ['NORTHWESTERN DENT', 5, '#ff9a6a'], ['LEAMING', 5, '#d8a0ff']];
  const cx = E.W / 2, cy = E.H * 0.3, R = 250, p = ease.inOut(prog(t, 0.2, 2.2)) * 87;
  ring(g, cx, cy, R, 70, alpha(ui.cream, 0.08));
  let acc = 0; for (const [, v, col] of segs) { const a0 = acc, a1 = Math.min(acc + v, p); if (a1 > a0) { g.strokeStyle = col; g.lineWidth = 70; g.lineCap = 'butt'; g.beginPath(); g.arc(cx, cy, R, -Math.PI / 2 + a0 / 100 * 6.283, -Math.PI / 2 + a1 / 100 * 6.283); g.stroke(); } acc += v; }
  text(g, Math.round(p) + '%', cx, cy, { size: 130, color: ui.gold, font: FONTS.ui, weight: 900, glow: 24, glowColor: alpha(ui.gold, 0.6) });
  label(g, 'ГЕНІВ ГІБРИДІВ США', cx, cy + 100, { size: 30, color: alpha(ui.cream, 0.8) });
  const wf = wt("п'яти", info, 3.5);
  segs.forEach(([n, v, col], i) => { const y = E.H * 0.53 + i * 62, a = ease.out(prog(t, 1.0 + i * 0.25, 1.3 + i * 0.25)); circle(g, 140, y, 14, col);
    text(g, n, 175, y, { size: 36, color: ui.cream, font: FONTS.ui, weight: 900, align: 'left', alpha: a }); text(g, v + '%', E.W - 120, y, { size: 40, color: col, font: FONTS.ui, weight: 900, align: 'right', alpha: a }); });
  label(g, '5 СТАРИХ СОРТІВ', cx, E.H * 0.47, { size: 50, color: ui.gold, glow: 16, a: ease.out(prog(t, wf - 0.1, wf + 0.3)) });
} });

// s24 — an old ear in the farmer's hands
registerShot('s24', { draw(g, t, info) {
  blurLayer(g, 14, (g) => field(g, t, { z: 1.6, x: 100, y: -150 })); veil(g, '#120a10', 0.3);
  const cx = E.W / 2, cy = E.H * 0.45 + Math.sin(t * 1.2) * 6, s = 1 + 0.04 * t;
  g.save(); g.translate(cx, cy); g.scale(s, s); g.translate(-cx, -cy);
  const ink = S().ink;
  for (const sd of [-1, 1]) { seg(g, [[cx + sd * 200, cy + 60], [cx + sd * 520, cy + 700]], 120, ink); circle(g, cx + sd * 210, cy + 50, 85, ink); seg(g, [[cx + sd * 280, cy + 20], [cx + sd * 120, cy - 40]], 34, ink); }
  cornEar(g, cx, cy - 10, 560, { rot: -0.08, glowA: 0.35 });
  for (const sd of [-1, 1]) { for (let i = 0; i < 3; i++) seg(g, [[cx + sd * 170, cy + 50 - i * 34], [cx + sd * 90, cy + 40 - i * 40]], 30, ink); seg(g, [[cx + sd * 230, cy + 120], [cx + sd * 600, cy + 760]], 6, alpha('#ffd36a', 0.6)); }
  g.restore();
  label(g, 'СТАРИЙ СОРТ', cx, E.H * 0.16, { size: 60, color: S().ui.gold, glow: 18, a: ease.out(prog(t, 0.3, 0.6)) });
  FX.dust(g, t, { count: 40, color: '#ffe2bd', a: 0.35 });
} });

// s25 — the foundation: hybrid field grows from an old ear in the soil
registerShot('s25', { draw(g, t, info) {
  const cam = { z: 1.15 - 0.1 * ease.inOut(t / info.dur), y: 60 - 40 * t };
  const { GY, M } = field(g, t, cam);
  layer(g, cam, 1, (g) => {
    g.fillStyle = linGrad2(g, GY + 70, GY + 600); g.fillRect(-E.W, GY + 70, E.W * 3, 900);
    const ey = GY + 260; cornEar(g, E.W / 2, ey, 760, { glowA: 0.4 });
    for (let i = -3; i <= 3; i++) { const x = E.W / 2 + i * 105; seg(g, [[x, GY + 70], [x + Math.sin(i) * 20, ey - 40]], 3, alpha('#ffd36a', 0.5)); cornPlant(g, x, GY + 70, 520, { t, seed: 800 + i, lit: S().ui.gold }); }
  });
  const k = pop(t, 0.4); g.save(); g.translate(E.W / 2, E.H * 0.14); g.scale(k, k); big(g, 'ФУНДАМЕНТ', 0, { size: 116 }); g.restore();
  FX.dust(g, t, { count: 50, color: '#ffe2bd', a: 0.35 });
} });
function linGrad2(g, y0, y1) { const gr = g.createLinearGradient(0, y0, 0, y1); gr.addColorStop(0, '#3a2414'); gr.addColorStop(1, '#140a06'); return gr; }
