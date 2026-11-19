// shots/_h.js — shared helpers for this project's shots (not auto-registered).
import { E, V, S, registerShot, ease, prog, lerp, clamp, wordTime, text, FONTS, alpha, rr, circle, glow, seg } from '/engine/core.js';
import { drawFigure, POSES, posesAt, breathe } from '/engine/rig2d.js';
import * as UI from '/engine/ui2d.js';
import { hall, MACHINES, LINE } from '../sets/plant.js';
import { FARMER } from '../cast.js';
import '../sets/toy.js';

export const wt = (w, info, fb) => { const v = wordTime(w, info.shot.start - 0.05); return (v != null && v < info.shot.end + 0.5 ? v : info.shot.start + fb) - info.shot.start; };
export const gold = () => S().ui.gold, cream = () => S().ui.cream, bp = () => UI.bpStroke(), coral = () => S().ui.accent;
export function push(g, t, info, z0 = 1, z1 = 1.06, dx = 0) { const z = lerp(z0, z1, ease.inOut(t / info.dur)); g.translate(E.W / 2, E.H / 2); g.scale(z, z); g.translate(-E.W / 2 + dx * ease.inOut(t / info.dur), -E.H / 2); }
export function label(g, str, x, y, a = 1, size = 44, color = cream()) { if (a <= 0) return; text(g, str, x, y, { size, color, font: FONTS.ui, weight: 900, spacing: 3, alpha: clamp(a) }); }
export function title(g, str, x, y, a = 1, size = 70, color = gold()) { if (a <= 0) return; text(g, str, x, y, { size, color, glow: 26, glowColor: alpha(color, 0.6), spacing: 3, alpha: clamp(a) }); }
export function tick(g, x, y, s, a, color = '#1f9d55') { if (a <= 0) return; g.save(); g.globalAlpha *= clamp(a); circle(g, x, y, s, alpha(color, 0.2)); glow(g, x, y, s * 2, color, 0.3); seg(g, [[x - s * 0.45, y], [x - s * 0.1, y + s * 0.35], [x + s * 0.5, y - s * 0.4]], s * 0.18, color); g.restore(); }
export function cross(g, x, y, s, a, color = '#ff5a4a') { if (a <= 0) return; g.save(); g.globalAlpha *= clamp(a); seg(g, [[x - s, y - s], [x + s, y + s]], s * 0.25, color); seg(g, [[x + s, y - s], [x - s, y + s]], s * 0.25, color); g.restore(); }

// a machine drop-in shot in the hall. o: {n, label, num, farmer: true|false, pose keys, expr, cam, extra(g,t,info,ctx)}
export function hallShot(id, o) {
  registerShot(id, { draw(g, t, info) {
    const u = ease.inOut(t / info.dur), n = o.n, m = MACHINES[LINE[n - 1]];
    const cam = { z: lerp(o.z0 ?? 1.0, o.z1 ?? 1.07, u), x: lerp(o.x0 ?? -50, o.x1 ?? 30, u), y: o.y ?? -40 };
    const tDrop = o.tDrop ?? 0.35;
    const ctx = hall(g, t, cam, { n, drop: o.drop === false ? null : n - 1, tDrop, label: o.label, num: o.num, run: o.run ?? true, haze: o.haze, cyclones: o.cyclones, tCyc: o.tCyc, focus: o.focus });
    if (o.farmer !== false) {
      const fx = o.fx ?? (E.W / 2 - m.w / 2 - 120);
      import_layer(g, cam, () => drawFigure(g, { x: fx, y: ctx.GY, s: o.s ?? 1.25, facing: o.facing ?? 1, outfit: FARMER,
        pose: breathe(posesAt(t, o.poses ?? [[0, 'stand'], [tDrop + 0.5, 'point'], [tDrop + 2.0, 'relaxed']]), t, 1, 3), expr: o.expr ?? (t > tDrop + 0.6 ? 'smile' : 'determined'),
        blink: (t % 3.1) > 3.0, look: [0.6, -0.3], rim: { color: ctx.M.rim, dir: [-0.6, -0.8] } }));
    }
    if (o.extra) o.extra(g, t, info, ctx, cam);
  } });
}
import { layer } from '/engine/core.js';
function import_layer(g, cam, fn) { layer(g, cam, 1, fn); }
