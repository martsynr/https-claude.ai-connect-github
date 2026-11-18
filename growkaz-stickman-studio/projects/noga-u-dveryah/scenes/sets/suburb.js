// sets/suburb.js — a 1960s house front: lawn, warm window (left), front door with porch lamp (right).
// Value structure: dark wall and lawn; the window, the open door and the porch lamp are the bright accents.
import { E, V, S, mood, layer, backdrop, rr, seg, circle, poly, linGrad, glow, alpha, shade, mix, text, FONTS, ease, prog, clamp } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';

export const suburbGround = () => E.H * V(0.8, 0.68);
// key positions (world units, depth ~0.9) so shots can stage figures at the door / window
export const spots = () => {
  const CX = E.W / 2, GY = suburbGround();
  return { CX, GY, doorX: CX + V(260, 150), doorW: V(170, 190), doorH: V(330, 380), winX: CX - V(330, 330), winY: GY - V(430, 560), winW: V(300, 270), winH: V(250, 300) };
};

export function suburb(g, t, cam, o = {}) {
  const M = mood(o.mood || 'night'), sp = spots(), { CX, GY } = sp;
  const wallBase = o.wall || M.wall, wall = shade(wallBase, -0.32), wallDark = shade(wallBase, -0.6);
  layer(g, cam, 0.12, (g) => {
    backdrop(g, M.sky);
    if ((o.mood || 'night') === 'night') { FX.stars(g, t, { count: 120, area: [-E.W, -E.H, E.W * 3, GY - V(300, 500) + E.H] }); FX.moon(g, CX + V(520, 300), GY - V(760, 1150), 34); }
    else FX.sun(g, CX - V(560, 320), GY - V(520, 820), 54, '#fff3dc', M.key, 5);
    FX.clouds(g, { y: GY - V(800, 1250), h: 160, color: '#ffe7c7', a: 0.08, seed: 4 });
  });
  layer(g, cam, 0.35, (g) => {                                  // neighbour houses + trees far away
    const c = mix(M.sky[0], wallDark, 0.7);
    for (let i = -4; i <= 4; i++) {
      const x = CX + i * 520 - 200, w = 380, h = 220 + (i % 2 ? 40 : 0), y = GY - V(150, 260);
      FX.facade(g, { x, y, w, h, color: c, win: alpha(M.practical, 0.75), dark: shade(c, -0.3), cols: 3, rows: 1, lit: 0.5, seed: 30 + i });
      poly(g, [[x - 30, y - h], [x + w / 2, y - h - 120], [x + w + 30, y - h]], shade(c, -0.15));
      FX.tree(g, x + w + 70, y, 1.3, shade(c, -0.35));
    }
  });
  layer(g, cam, 0.9, (g) => {                                   // the house
    const top = GY - V(640, 820), L = CX - 1400, R = CX + 1400;
    g.fillStyle = linGrad(g, 0, top, 0, GY, [shade(wall, 0.05), wall, wallDark]); g.fillRect(L, top, R - L, GY - top + 4);
    for (let y = top + 40; y < GY; y += 34) { g.fillStyle = alpha('#000000', 0.08); g.fillRect(L, y, R - L, 3); }    // siding lines
    poly(g, [[L, top + 6], [CX - 120, top - V(260, 300)], [R, top + 6]], shade(wallBase, -0.72));                    // roof
    g.fillStyle = shade(wallBase, -0.78); g.fillRect(L, top - 8, R - L, 22);
    // window (left)
    const { winX, winY, winW, winH } = sp;
    glow(g, winX + winW / 2, winY + winH / 2, winW * 1.3, M.practical, 0.22);
    FX.windowFrame(g, { x: winX, y: winY, w: winW, h: winH, cols: 2, rows: 2, frame: wallDark, bar: 10 }, (g, x, y, w, h) => {
      g.fillStyle = linGrad(g, 0, y, 0, y + h, [shade(M.practical, 0.1), M.practical, shade(M.practical, -0.45)]); g.fillRect(x, y, w, h);
      g.fillStyle = alpha(wallDark, 0.85); g.fillRect(x, y + h * 0.72, w, h * 0.28);                                     // sofa back
      circle(g, x + w * 0.78, y + h * 0.3, 14, '#fff6e0'); glow(g, x + w * 0.78, y + h * 0.3, 90, '#fff6e0', 0.5);     // lamp
      if (o.small) smallSign(g, x + w * 0.12, y + h * 0.14, V(0.55, 0.6), o.small === true ? 1 : o.small);
    });
    g.fillStyle = shade(wallDark, -0.2); g.fillRect(winX - 16, winY + winH, winW + 32, 16);                            // sill
    // door (right) + porch
    const { doorX, doorW, doorH } = sp, dx = doorX - doorW / 2;
    g.fillStyle = shade(wallDark, -0.3); g.fillRect(dx - 22, GY - doorH - 22, doorW + 44, doorH + 22);
    FX.door(g, { x: dx, y: GY, w: doorW, h: doorH, color: shade(wallBase, -0.45), open: o.door ?? 0, light: M.practical });
    circle(g, dx + doorW * 0.82, GY - doorH * 0.48, 7, shade(M.practical, -0.2));
    const ly = GY - doorH - 70; rr(g, doorX - 14, ly, 28, 40, 6); g.fillStyle = '#fff1d0'; g.fill();
    glow(g, doorX, ly + 20, 220, M.practical, 0.55);
    FX.lightCone(g, doorX, ly + 30, { angle: Math.PI / 2, spread: 0.55, len: doorH + 200, color: M.practical, a: 0.16 });
    g.fillStyle = shade(wallDark, -0.25); g.fillRect(dx - 50, GY - 12, doorW + 100, 12); g.fillRect(dx - 80, GY - 2, doorW + 160, 10);
  });
  layer(g, cam, 0.95, (g) => {                                  // lawn + path + sidewalk
    g.fillStyle = linGrad(g, 0, GY, 0, GY + V(400, 650), [shade(M.grass, -0.35), shade(M.grass, -0.65), shade(M.dark, -0.3)]); g.fillRect(-E.W, GY, E.W * 3, E.H * 2);
    const { doorX } = sp; poly(g, [[doorX - 70, GY + 8], [doorX + 70, GY + 8], [doorX + 170, E.H + 400], [doorX - 230, E.H + 400]], alpha(shade(M.road, 0.05), 0.85));
    FX.pool(g, doorX, GY + 30, 260, 50, M.practical, 0.28);
    FX.pool(g, sp.winX + sp.winW / 2, GY + 30, 240, 40, M.practical, 0.14);
    for (let i = 0; i < 40; i++) { const x = CX - 1400 + i * 72 + (i % 3) * 13, y = GY + 4 + (i % 4) * 7; seg(g, [[x, y + 14], [x + 4, y]], 3, alpha(shade(M.grass, -0.1), 0.6)); }
  });
  return { GY, CX, M, sp };
}

// tiny card for the window: "БУДЬ ОБЕРЕЖНИМ ВОДІЄМ"
export function smallSign(g, x, y, s = 1, a = 1) {
  g.save(); g.globalAlpha *= a; g.translate(x, y); g.scale(s, s);
  rr(g, 0, 0, 150, 96, 6); g.fillStyle = '#f4efe2'; g.fill(); g.strokeStyle = '#3a6ea5'; g.lineWidth = 5; g.stroke();
  ['БУДЬ', 'ОБЕРЕЖНИМ', 'ВОДІЄМ'].forEach((w, i) => text(g, w, 75, 24 + i * 26, { size: i === 1 ? 19 : 21, color: '#22314d', font: FONTS.ui, weight: 900 }));
  g.restore();
}

// the big ugly lawn sign "ЇДЬ ОБЕРЕЖНО" — crooked hand lettering; x = centre, y = ground
export function bigSign(g, x, y, s = 1, o = {}) {
  const { a = 1, ghost = 0 } = o, M = mood(o.mood || 'night');
  if ('ghost' in o && ghost <= 0) return;                         // a request that hasn't been made yet
  g.save(); g.globalAlpha *= a; g.translate(x, y); g.scale(s, s); g.rotate(-0.025);
  const w = 760, h = 380, top = -560;
  if (ghost > 0) {                                                // dashed blueprint outline (a request, not yet real)
    g.setLineDash([22, 16]); g.strokeStyle = alpha(S().ui.gold, 0.85 * ghost); g.lineWidth = 7;
    g.strokeRect(-w / 2, top, w, h); seg(g, [[-w * 0.3, top + h], [-w * 0.3, 0]], 7, alpha(S().ui.gold, 0.85 * ghost)); seg(g, [[w * 0.3, top + h], [w * 0.3, 0]], 7, alpha(S().ui.gold, 0.85 * ghost));
    g.setLineDash([]); glow(g, 0, top + h / 2, w * 0.6, S().ui.gold, 0.12 * ghost); g.restore(); return;
  }
  for (const px of [-w * 0.3, w * 0.3]) { g.fillStyle = '#2a1d16'; g.fillRect(px - 14, top + h - 10, 28, -top - h + 10); }
  g.fillStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.ellipse(0, 4, w * 0.55, 18, 0, 0, 7); g.fill();
  g.fillStyle = linGrad(g, 0, top, 0, top + h, ['#e9dfc6', '#cdbf9f']); g.fillRect(-w / 2, top, w, h);
  g.strokeStyle = '#5a4630'; g.lineWidth = 10; g.strokeRect(-w / 2, top, w, h);
  g.fillStyle = alpha(M.practical, 0.18); g.fillRect(-w / 2, top, w * 0.4, h);                     // porch light spill
  const lines = [['ЇДЬ', 0], ['ОБЕРЕЖНО', 1]];
  lines.forEach(([str, li]) => {
    const size = li ? 112 : 132, chars = [...str], cw = li ? 82 : 110, x0 = -((chars.length - 1) * cw) / 2;
    chars.forEach((ch, i) => { const r = Math.sin(i * 2.7 + li * 5) * 0.12, dy = Math.sin(i * 1.9 + li) * 10; g.save(); g.translate(x0 + i * cw, top + 120 + li * 150 + dy); g.rotate(r); text(g, ch, 0, 0, { size, color: '#b0281e', font: FONTS.ui, weight: 900 }); g.restore(); });
  });
  g.fillStyle = 'rgba(176,40,30,.7)'; for (const [dx, dy] of [[-170, 70], [40, 64], [210, 214]]) g.fillRect(dx, top + dy + 40, 6, 26);   // paint drips
  g.restore();
}

// glowing puppet strings from the top of the frame to world points (pts: [[x,y],…])
export function strings(g, pts, t, o = {}) {
  const { a = 1, color = S().ui.gold, cut = 0, barY = -60 } = o; if (a <= 0) return;
  const cx = pts.reduce((s, p) => s + p[0], 0) / pts.length + Math.sin(t * 1.3) * 18;
  g.save(); g.globalAlpha *= a;
  seg(g, [[cx - 170, barY], [cx + 170, barY + 10]], 16, '#1a1218'); seg(g, [[cx - 20, barY - 60], [cx + 20, barY + 70]], 16, '#1a1218');
  pts.forEach(([x, y], i) => {
    const top = [cx - 150 + (300 * i) / Math.max(1, pts.length - 1), barY + 6];
    if (cut > 0) {                                                    // snapped: upper half recoils, lower half falls
      const k = ease.out(clamp(cut)); const mid = [(top[0] + x) / 2, (top[1] + y) / 2];
      seg(g, [top, [mid[0], mid[1] - (mid[1] - top[1]) * k]], 2.5, alpha(color, 0.6 * (1 - k)));
      seg(g, [[x, y], [x + 30 * k, y - (y - mid[1]) * (1 - k) + 40 * k]], 2.5, alpha(color, 0.6 * (1 - k)));
      return;
    }
    seg(g, [top, [x, y]], 2.5, alpha(color, 0.55)); glow(g, x, y, 26, color, 0.6);
  });
  g.restore();
}
