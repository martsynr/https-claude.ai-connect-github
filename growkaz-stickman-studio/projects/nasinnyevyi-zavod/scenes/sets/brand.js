// sets/brand.js — the client's logo and bag artwork (input/logo.png, input/bag.jpg), preloaded before any shot draws.
import { rr, alpha, linGrad } from '/engine/core.js';
const load = (u) => new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = u; });
export const LOGO = await load(new URL('../../input/logo.png', import.meta.url).href);
export const BAG = await load(new URL('../../input/bag.jpg', import.meta.url).href);
const FOCUS = [539, 1130];                      // centre of the white diamond on the bag artwork

// the bag face: artwork cropped to the w×h box (cover), clipped to a rounded rect, with soft volume shading.
// o: {r, dim 0..1 (darken for mood), fill 0..1 (empty top part sags darker)}
export function bagFace(g, x, y, w, h, o = {}) {
  const { r = Math.min(w, h) * 0.14, dim = 0, fill = 1 } = o;
  g.save(); rr(g, x, y, w, h, r); g.clip();
  if (BAG) { const iw = BAG.width, ih = BAG.height, k = Math.max(w / iw, h / ih) * (o.zoom ?? 1), sw = w / k, sh = h / k;
    const sx = Math.min(Math.max(FOCUS[0] - sw / 2, 0), iw - sw), sy = Math.min(Math.max(FOCUS[1] - sh / 2, 0), ih - sh);
    g.drawImage(BAG, sx, sy, sw, sh, x, y, w, h); } else { g.fillStyle = '#2f8a3a'; g.fillRect(x, y, w, h); }
  g.fillStyle = linGrad(g, x, 0, x + w, 0, [alpha('#000', 0.35), alpha('#000', 0), alpha('#fff', 0.08), alpha('#000', 0.3)]); g.fillRect(x, y, w, h);
  if (fill < 1) { g.fillStyle = alpha('#000', 0.45); g.fillRect(x, y, w, h * (1 - fill)); }
  if (dim > 0) { g.fillStyle = alpha('#000', dim); g.fillRect(x, y, w, h); }
  g.restore();
}
// the logo centred at (x, y), height h. o: {a, white (draw on a white rounded plate)}
export function logo(g, x, y, h, o = {}) {
  if (!LOGO) return; const w = h * LOGO.width / LOGO.height; g.save(); g.globalAlpha *= o.a ?? 1;
  if (o.plate) { rr(g, x - w / 2 - h * 0.12, y - h / 2 - h * 0.12, w + h * 0.24, h * 1.24, h * 0.18); g.fillStyle = '#ffffff'; g.fill(); }
  g.drawImage(LOGO, x - w / 2, y - h / 2, w, h); g.restore();
}
