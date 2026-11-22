// looks.js — "looks": whole-frame drawing techniques applied after a shot is drawn and graded.
// Unlike styles.js (colour palettes), a look changes HOW the frame is drawn: chalk, comic, pixel, paper, watercolor.
// Select with config.json "look": "<id>" or ?look=<id> (render.mjs --look <id> / --looks a,b,c).
// Each look: { name, desc, keepGrain, keepVignette, apply(g, W, H, f) } working on device pixels of the main canvas.

const mkCanvas = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
let TMP = null; const tmp = (w, h) => { if (!TMP || TMP.width !== w || TMP.height !== h) TMP = mkCanvas(w, h); return TMP; };

// deterministic value noise in [0,1)
const hash = (x, y, s = 0) => { let h = (x * 374761393 + y * 668265263 + s * 982451653) | 0; h = (h ^ (h >>> 13)) * 1274126177 | 0; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
function valueNoise(x, y, cell, seed) {
  const gx = Math.floor(x / cell), gy = Math.floor(y / cell), fx = x / cell - gx, fy = y / cell - gy;
  const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
  const a = hash(gx, gy, seed), b = hash(gx + 1, gy, seed), c = hash(gx, gy + 1, seed), d = hash(gx + 1, gy + 1, seed);
  return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy;
}
const lum = (d, i) => 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
function lumaMap(d, W, H) { const L = new Float32Array(W * H); for (let p = 0, i = 0; p < W * H; p++, i += 4) L[p] = lum(d, i); return L; }
function sobel(L, W, H) {
  const G = new Float32Array(W * H);
  for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
    const p = y * W + x, a = L[p - W - 1], b = L[p - W], c = L[p - W + 1], dd = L[p - 1], e = L[p + 1], f = L[p + W - 1], g = L[p + W], h = L[p + W + 1];
    const gx = -a - 2 * dd - f + c + 2 * e + h, gy = -a - 2 * b - c + f + 2 * g + h; G[p] = Math.sqrt(gx * gx + gy * gy);
  } return G;
}
function dilate(M, W, H, r) { if (r < 1) return M; const out = new Float32Array(W * H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { let m = 0; for (let dy = -r; dy <= r; dy++) { const yy = y + dy; if (yy < 0 || yy >= H) continue; for (let dx = -r; dx <= r; dx++) { const xx = x + dx; if (xx < 0 || xx >= W || dx * dx + dy * dy > r * r) continue; const v = M[yy * W + xx]; if (v > m) m = v; } } out[y * W + x] = m; } return out; }
function blurred(g, W, H, px) { const c = tmp(W, H), cg = c.getContext('2d', { willReadFrequently: true }); cg.filter = `blur(${px}px)`; cg.clearRect(0, 0, W, H); cg.drawImage(g.canvas, 0, 0); cg.filter = 'none'; return cg.getImageData(0, 0, W, H).data; }
const clamp255 = v => v < 0 ? 0 : v > 255 ? 255 : v;

export const LOOKS = {
  cinematic: { name: 'Кіно-стікмен', desc: 'базова графіка GrowKaz без змін', keepGrain: true, keepVignette: true, apply() {} },

  // 1. Chalkboard: only the drawing's contours survive, as wobbly chalk on a slate board, with hatched shading.
  chalk: { name: 'Крейдова дошка', desc: 'контури крейдою на зеленій дошці, штрихування замість заливки', keepGrain: false, keepVignette: true,
    apply(g, W, H, f) {
      const k = H / 1920, img = g.getImageData(0, 0, W, H), d = img.data, L = lumaMap(d, W, H), E = sobel(L, W, H);
      const board = [34, 48, 42], wob = Math.max(1, 3 * k), hatch = Math.max(4, 14 * k);
      const out = new Uint8ClampedArray(d.length);
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        const p = y * W + x, i = p * 4;
        // wobble: sample edges from a slightly displaced point (hand tremor), stable over time
        const ox = Math.round((valueNoise(x, y, 40 * k + 1, 3) - 0.5) * 2 * wob), oy = Math.round((valueNoise(x, y, 40 * k + 1, 7) - 0.5) * 2 * wob);
        const sx = Math.min(W - 1, Math.max(0, x + ox)), sy = Math.min(H - 1, Math.max(0, y + oy)), sp = sy * W + sx;
        let e = Math.min(1, Math.max(0, (E[sp] - 60) / 140));
        const grit = valueNoise(x, y, 1.6 * k + 0.6, 11 + (f >> 3) % 3); e *= 0.55 + 0.6 * grit;             // chalk dust breaks the stroke
        const l = L[sp] / 255, hs = ((x + y) % hatch < hatch * 0.18) ? 1 : 0, hs2 = ((x - y + 99999) % hatch < hatch * 0.18) ? 1 : 0;
        const shade = (l > 0.55 ? hs : 0) * 0.35 + (l > 0.78 ? hs2 : 0) * 0.3;                              // hatch only bright areas
        const a = Math.min(1, e + shade * (0.5 + 0.5 * grit));
        const tint = [d[i] * 0.35 + 165, d[i + 1] * 0.35 + 165, d[i + 2] * 0.35 + 165];                     // chalk keeps a pastel hint of colour
        const smudge = valueNoise(x, y, 220 * k + 1, 5) * 14;
        out[i] = board[0] + smudge + (tint[0] - board[0]) * a; out[i + 1] = board[1] + smudge + (tint[1] - board[1]) * a; out[i + 2] = board[2] + smudge + (tint[2] - board[2]) * a; out[i + 3] = 255;
      }
      img.data.set(out); g.putImageData(img, 0, 0);
    } },

  // 2. Comic: flat posterized colour, heavy ink outlines, Ben-Day halftone dots in the shadows.
  comic: { name: 'Комікс', desc: 'плоскі кольори, товстий чорний контур, растрові крапки', keepGrain: false, keepVignette: false,
    apply(g, W, H) {
      const k = H / 1920, img = g.getImageData(0, 0, W, H), d = img.data, L = lumaMap(d, W, H);
      const ink = dilate(sobel(L, W, H).map(v => v > 110 ? 1 : 0), W, H, Math.max(1, Math.round(2.2 * k)));
      const cell = Math.max(5, 16 * k), ang = 0.26, ca = Math.cos(ang), sa = Math.sin(ang);
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        const p = y * W + x, i = p * 4;
        let r = d[i], gg = d[i + 1], b = d[i + 2]; const m = (r + gg + b) / 3;
        r = clamp255(m + (r - m) * 1.6 + 25); gg = clamp255(m + (gg - m) * 1.6 + 25); b = clamp255(m + (b - m) * 1.6 + 25); // punchier, brighter
        const q = v => Math.round(v / 64) * 64; r = q(r); gg = q(gg); b = q(b);
        const l = L[p] / 255;
        const u = (x * ca + y * sa) / cell, v = (-x * sa + y * ca) / cell, du = u - Math.round(u), dv = v - Math.round(v);
        const rad = l < 0.1 ? 0 : Math.max(0, 0.55 - l) * 1.1;                                                              // bigger dots in darker tones
        const dot = du * du + dv * dv < rad * rad ? 0.55 : 1;
        const inked = ink[p] > 0;
        d[i] = inked ? 12 : clamp255(r * dot); d[i + 1] = inked ? 10 : clamp255(gg * dot); d[i + 2] = inked ? 14 : clamp255(b * dot);
      }
      g.putImageData(img, 0, 0);
    } },

  // 3. Pixel art: chunky pixels, limited palette, ordered (Bayer) dithering.
  pixel: { name: 'Піксель-арт', desc: 'великі пікселі, обмежена палітра, дизеринг як у 16-бітних іграх', keepGrain: false, keepVignette: false,
    apply(g, W, H) {
      const bs = Math.max(3, Math.round(H / 135)), w = Math.ceil(W / bs), h = Math.ceil(H / bs);
      const c = tmp(w, h), cg = c.getContext('2d', { willReadFrequently: true }); cg.imageSmoothingEnabled = true; cg.imageSmoothingQuality = 'high'; cg.drawImage(g.canvas, 0, 0, w, h);
      const img = cg.getImageData(0, 0, w, h), d = img.data, B = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const i = (y * w + x) * 4, th = (B[(y & 3) * 4 + (x & 3)] / 16 - 0.5) * 64;
        for (let ch = 0; ch < 3; ch++) { const v = clamp255(d[i + ch] * 1.15 + 8 + th); d[i + ch] = Math.round(v / 85) * 85; } }
      cg.putImageData(img, 0, 0); g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.imageSmoothingEnabled = false; g.drawImage(c, 0, 0, w, h, 0, 0, w * bs, h * bs); g.restore();
    } },

  // 4. Paper cut-out: colours fall into flat paper layers; each brighter layer casts a soft shadow on the one below; fibre texture.
  paper: { name: 'Паперова аплікація', desc: 'шари кольорового паперу з тінями й волокнистою текстурою', keepGrain: false, keepVignette: true,
    apply(g, W, H, f) {
      const k = H / 1920, src = blurred(g, W, H, Math.max(2, 6 * k)), N = W * H, band = new Uint8Array(N), col = new Uint8ClampedArray(N * 3);
      for (let p = 0, i = 0; p < N; p++, i += 4) { const l = lum(src, i), b = Math.min(9, Math.floor(Math.pow(l / 255, 0.6) * 10)); band[p] = b;
        const m = (src[i] + src[i + 1] + src[i + 2]) / 3, s = 1.3, lift = 30 + b * 10;
        col[p * 3] = clamp255(Math.round((m + (src[i] - m) * s) / 40) * 40 + lift); col[p * 3 + 1] = clamp255(Math.round((m + (src[i + 1] - m) * s) / 40) * 40 + lift); col[p * 3 + 2] = clamp255(Math.round((m + (src[i + 2] - m) * s) / 40) * 40 + lift); }
      const off = Math.max(3, Math.round(16 * k)), img = g.getImageData(0, 0, W, H), d = img.data;
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        const p = y * W + x, i = p * 4; let sh = 1;
        for (let s = 1; s <= off; s += Math.max(1, off >> 2)) { const xx = x - s, yy = y - s; if (xx >= 0 && yy >= 0 && band[yy * W + xx] > band[p]) { sh = Math.min(sh, 0.45 + 0.4 * (s / off)); break; } }
        let hl = 1; const xn = x + 1, yn = y + 1; if (xn < W && yn < H && band[yn * W + xn] < band[p]) hl = 1.35;              // cut-edge catch light
        const fib = 0.84 + 0.16 * valueNoise(x, y, 2.2 * k + 0.5, 21) + 0.12 * (valueNoise(x * 0.3, y * 3, 6 * k + 1, 4) - 0.5);
        const m = sh * hl * fib;
        d[i] = clamp255(col[p * 3] * m); d[i + 1] = clamp255(col[p * 3 + 1] * m); d[i + 2] = clamp255(col[p * 3 + 2] * m);
      }
      g.putImageData(img, 0, 0);
    } },

  // 5. Watercolor: soft bleeding washes on warm paper, pigment pooling at the edges, a light pencil underdrawing.
  watercolor: { name: 'Акварель', desc: 'розмиті мазки на теплому папері, пігмент збирається на краях, олівцевий контур', keepGrain: false, keepVignette: false,
    apply(g, W, H) {
      const k = H / 1920, img = g.getImageData(0, 0, W, H), d = img.data, L = lumaMap(d, W, H), Ed = sobel(L, W, H);
      const wash = blurred(g, W, H, Math.max(2, 7 * k)), paper = [246, 238, 222];
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        const p = y * W + x, i = p * 4;
        const bloom = valueNoise(x, y, 90 * k + 1, 13), gran = valueNoise(x, y, 2.5 * k + 0.5, 17);
        let out = [0, 0, 0];
        for (let ch = 0; ch < 3; ch++) {
          const c = Math.pow(wash[i + ch] / 255, 0.6) * 255;                                               // open up the dark, moody frames
          const dens = (1 - c / 255) * (0.8 + 0.2 * bloom) * (0.9 + 0.2 * gran);                          // pigment density, uneven like a real wash
          out[ch] = paper[ch] * (1 - dens) + (c * 0.55) * dens;
        }
        const pool = Math.min(1, Math.max(0, (Ed[p] - 40) / 200));                                          // darker rim where washes meet
        const pencil = Math.min(1, Math.max(0, (Ed[p] - 120) / 160)) * 0.45;
        for (let ch = 0; ch < 3; ch++) d[i + ch] = clamp255(out[ch] * (1 - pool * 0.25) * (1 - pencil) + 70 * pencil);
      }
      g.putImageData(img, 0, 0);
    } },
};

export function applyLook(g, id, W, H, f) { const L = LOOKS[id]; if (!L || id === 'cinematic') return; L.apply(g, W, H, f); }
export const lookOf = (id) => LOOKS[id] || LOOKS.cinematic;
