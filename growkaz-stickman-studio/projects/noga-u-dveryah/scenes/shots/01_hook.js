// shots/01_hook.js — the cold open: YOU on strings, nodding "yes" without noticing.
import { E, V, registerShot, mood, layer, blurLayer, veil, ease, prog, key, clamp, lerp } from '/engine/core.js';
import { drawFigure, POSES, breathe, bigFace } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import { suburb, spots, strings } from '../sets/suburb.js';
import { YOU } from '../cast.js';

// centre the camera on a world point drawn at `depth`
export const camOn = (px, py, z, depth = 0.9) => ({ z, x: (px - E.W / 2) / depth, y: (py - E.H / 2) / depth });
export const handPts = (o) => { const p = o.pose, f = o.facing ?? 1, s = o.s; return [[o.x + f * s * p.hF[0], o.y + s * p.hF[1]], [o.x + f * s * p.hB[0], o.y + s * p.hB[1]], [o.x + f * s * p.head[0], o.y + s * (p.head[1] - 30)]]; };
export const PUPPET = { ...POSES.stand, eF: [24, -146], hF: [40, -124], eB: [-22, -146], hB: [-36, -124] };

// s01 — "Тобою керують через маленьке «так»."  YOU in the doorway on glowing strings, nods on «так»
registerShot('s01', { draw(g, t, info) {
  const sp = spots(), M = mood('night');
  const cam = camOn(sp.doorX, sp.GY - V(230, 290), lerp(V(1.5, 1.45), V(1.62, 1.6), ease.inOut(t / info.dur)));
  suburb(g, t, cam, { mood: 'night', door: 0.9 });
  const nod = key(t, [[2.5, 0], [2.68, 1], [2.95, 0.1], [3.1, 0.8], [3.35, 0]]);
  const pose = { ...breathe(PUPPET, t), head: [3 + 6 * nod, -208 + 8 * nod] };
  const o = { x: sp.doorX, y: sp.GY, s: V(1.25, 1.3), facing: -1, outfit: YOU, pose, expr: t > 2.6 ? 'smile' : 'neutral', look: [-0.3, nod * 0.6], blink: (t % 3.1) > 3.0, rim: { color: M.practical, dir: [0.2, -1] } };
  layer(g, cam, 0.9, (g) => { drawFigure(g, o); strings(g, handPts(o), t, { a: ease.out(prog(t, 0.2, 1.2)), barY: sp.GY - V(720, 760) }); });
  FX.dust(g, t, { count: 40, color: '#ffe2bd', a: 0.3 });
} });

// s02 — "І ти навіть не помічаєш."  giant face, calm and unaware; the strings rise out of frame
registerShot('s02', { draw(g, t, info) {
  const sp = spots(), M = mood('night');
  blurLayer(g, 14, (g) => suburb(g, t, camOn(sp.doorX - 60, sp.GY - 330, 2.0), { mood: 'night', door: 0.9 })); veil(g, '#0a0c18', 0.35);
  const r = V(300, 330) * (1 + 0.035 * t), cx = E.W / 2 + V(60, 0), cy = E.H * V(0.6, 0.5);
  const tug = ease.out(prog(t, info.dur - 0.7, info.dur - 0.3)) * 18;
  bigFace(g, cx, cy - tug, r, { outfit: YOU, expr: t > 1.4 ? 'smile' : 'neutral', look: [-0.25, 0.1], blink: (t % 2.9) > 2.8, rimColor: M.practical, rimSide: 1 });
  strings(g, [[cx - r * 0.55, cy - r * 0.85 - tug], [cx + r * 0.55, cy - r * 0.85 - tug]], t, { barY: -30 });
  FX.dust(g, t, { count: 30, color: '#ffe2bd', a: 0.25 });
} });
