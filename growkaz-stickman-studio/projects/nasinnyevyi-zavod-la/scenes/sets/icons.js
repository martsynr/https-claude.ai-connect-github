// sets/icons.js — the client's corn icons (input/icons/*.svg), preloaded and tinted on demand.
// icon(g, name, x, y, h, {rot, color, a}) draws the icon centred at (x, y), height h.
const NAMES = ['cob_leaves', 'cob_husk', 'cob_husk_line', 'cob_section', 'sack'];
const load = async (n) => {
  try { const svg = await (await fetch(new URL(`../../input/icons/${n}.svg`, import.meta.url).href)).text();
    return await new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg); });
  } catch { return null; }
};
export const ICONS = Object.fromEntries(await Promise.all(NAMES.map(async (n) => [n, await load(n)])));
const cache = new Map();
function tinted(name, color, px) {
  const key = `${name}|${color}|${px}`; if (cache.has(key)) return cache.get(key);
  const img = ICONS[name]; if (!img) return null;
  const c = document.createElement('canvas'); c.width = c.height = px; const x = c.getContext('2d');
  x.drawImage(img, 0, 0, px, px); x.globalCompositeOperation = 'source-in'; x.fillStyle = color; x.fillRect(0, 0, px, px);
  if (cache.size > 400) cache.clear(); cache.set(key, c); return c;
}
export function icon(g, name, x, y, h, o = {}) {
  const { rot = 0, color = '#e8a51e', a = 1 } = o, k = Math.min(2048, Math.max(64, Math.round(h * 1.2 / 64) * 64));
  const c = tinted(name, color, k); if (!c) return false;
  g.save(); g.globalAlpha *= a; g.translate(x, y); g.rotate(rot); g.drawImage(c, -h / 2, -h / 2, h, h); g.restore(); return true;
}
