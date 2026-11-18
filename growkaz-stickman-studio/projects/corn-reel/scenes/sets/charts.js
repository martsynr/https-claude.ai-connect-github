// sets/charts.js — the US corn-yield chart on blueprint (Troyer 2006, Fig. 1), t/ha by year.
import { E, V, S, seg, circle, glow, alpha, text, lerp, clamp, FONTS } from '/engine/core.js';
import * as UI from '/engine/ui2d.js';

const DATA = [[1865, 1.5], [1875, 1.6], [1885, 1.45], [1895, 1.65], [1905, 1.55], [1915, 1.6], [1925, 1.5], [1933, 1.4], [1940, 1.9], [1950, 2.4], [1960, 3.4], [1970, 4.9], [1980, 6.3], [1990, 7.3], [2000, 8.6], [2004, 10.06]];
export function yieldChart(g, t, o = {}) {
  const { upTo = 1930, hot = false } = o; const ui = S().ui, c = UI.bpStroke();
  const x0 = V(220, 150), x1 = E.W - V(140, 90), yb = E.H * V(0.72, 0.6), yt = E.H * V(0.18, 0.2);
  const X = (yr) => lerp(x0, x1, (yr - 1865) / (2005 - 1865)), Y = (v) => lerp(yb, yt, v / 11);
  seg(g, [[x0, yt - 20], [x0, yb], [x1, yb]], 3, alpha(c, 0.7));
  for (const v of [0, 2, 4, 6, 8, 10]) { seg(g, [[x0 - 10, Y(v)], [x1, Y(v)]], 1, alpha(c, 0.12)); text(g, String(v), x0 - 26, Y(v), { size: V(26, 30), color: alpha(c, 0.8), font: FONTS.ui, weight: 800, align: 'right' }); }
  text(g, 'Т/ГА', x0, yt - 50, { size: V(26, 30), color: alpha(c, 0.8), font: FONTS.ui, weight: 900, align: 'left', spacing: 2 });
  for (const yr of [1865, 1930, 2004]) text(g, String(yr), X(yr), yb + V(36, 44), { size: V(28, 34), color: alpha(c, 0.85), font: FONTS.ui, weight: 900 });
  // polyline up to `upTo`
  const pts = []; for (let i = 0; i < DATA.length; i++) { const [yr, v] = DATA[i]; if (yr <= upTo) pts.push([X(yr), Y(v)]); else { const [py, pv] = DATA[i - 1]; const k = (upTo - py) / (yr - py); pts.push([X(upTo), Y(lerp(pv, v, k))]); break; } }
  const split = pts.findIndex((p, i) => DATA[i] && DATA[i][0] > 1933);
  const flat = split < 0 ? pts : pts.slice(0, split + 1), up = split < 0 ? [] : pts.slice(split);
  if (flat.length > 1) seg(g, flat, 7, c);
  if (up.length > 1) seg(g, up, 9, ui.gold);
  const tip = pts[pts.length - 1]; if (tip) { glow(g, tip[0], tip[1], 70, hot ? ui.gold : c, 0.8); circle(g, tip[0], tip[1], 9, '#ffffff'); }
  return { X, Y, tip, x0, x1, yb, yt };
}
