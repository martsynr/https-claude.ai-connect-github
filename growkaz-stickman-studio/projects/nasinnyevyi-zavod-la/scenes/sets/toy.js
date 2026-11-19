// sets/toy.js (line-art variant) — routes the stick-figure rig to the front-view line-art people.
import { E } from '/engine/core.js';
import { person } from './people.js';
const who = (of = {}) => (of.top === 'labcoat' ? 'breeder' : 'farmer');
function arm(sh, el, hd) { const a1 = Math.atan2(Math.abs(el[0] - sh[0]), el[1] - sh[1]), b = Math.atan2(Math.abs(hd[0] - el[0]), hd[1] - el[1]); return [Math.max(0.06, a1), b - Math.max(0.06, a1)]; }
export function laFigure(g, o) {
  const p = o.pose, of = o.outfit || {}, s = (o.s ?? 1) * 0.38;
  const armR = p ? arm(p.sh, p.eF, p.hF) : undefined, armL = p ? arm(p.sh, p.eB, p.hB) : undefined;
  person(g, { who: who(of), x: o.x, y: o.y, s, expr: o.expr, blink: o.blink, look: o.look, armR, armL, alpha: o.alpha });
}
export function laFace(g, cx, cy, r, o = {}) { const s = r / 58; person(g, { who: who(o.outfit), x: cx, y: cy + 648 * s, s, expr: o.expr, blink: o.blink, look: o.look }); }
E.figureRenderer = { drawFigure: laFigure, bigFace: laFace };
