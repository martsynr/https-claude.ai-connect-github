# Sheet style: the light flat cartoon look

A second house look next to the cinematic GrowKaz stickman. It comes from the user's character sheets: warm cream paper, flat soft colours, thin dark ink outlines on everything, friendly cartoon people with skin, clothes and faces. First used in `projects/kukurudza-selekciya` ("Сто років селекції кукурудзи"), which is the reference project for this look.

## Switch it on
- `config.json` → `"style": "sheet"`. The style turns off glow (`glow()` and text glow become no-ops), vignette, grain and bloom, and `veil()` becomes a paper-coloured wash instead of a dark one. All moods become light: cream/pale-blue skies, `key` = sun yellow `#ffd34d`, `grass` `#78b45f`, `floor` (soil) `#c99a66`.
- Characters: `import { drawFigure, bigFace, POSES, posesAt, breathe } from '/engine/sheet2d.js'` (or a one-line `scenes/fig.js` that re-exports it) instead of `/engine/rig2d.js`. Same call signatures.
- Cast presets: `FARMER = { sheet: 'farmer' }`, `BREEDER = { sheet: 'breeder' }`. To recolour, edit `PAL` from sheet2d in the project (e.g. `PAL.farmer.cap = '#3a6ea5'`). Outfits without `sheet` still draw as classic stick figures.

## Characters (from the user's sheets: `sheet-characters/farmer.jpg`, `sheet-characters/breeder.jpg`)
- **Farmer:** bald under a green cap (brim points the way he faces), full black beard, ears, yellow T-shirt, blue overalls with bib and straps, brown boots. Prop: `'radio'` (walkie-talkie).
- **Breeder / scientist:** brown side-swept hair, round glasses, green knee-length lab coat with a pale collar, dark green trousers, dark shoes. Prop: `'tablet'` (a chart on screen).
- Faces: dot eyes, simple ink mouth, brows only when the expression needs them. Supported `expr`: neutral, smile, happy, joy, surprised, shocked, awe, scared, worried, sad, nervous, angry, determined, thinking, confused, smirk. `blink` and `look` work as in rig2d.
- `bigFace(g, cx, cy, r, {outfit, expr, blink, look, rimSide})` draws head + shoulders reaching the frame bottom; `rimSide` acts as the facing (−1 faces right).
- No rim light: outlines do that job. A soft ink contact shadow grounds every figure.

## Sets and graphics
- Everything is flat fill + ink outline (`S().ink` `#2b2622`, 3–4 px at 1080p; 1.5–2 px for small details). No gradients on objects, no glow, no dark veils. Only the sky may be a soft two-stop gradient.
- Helpers in sheet2d: `skyFlat(g, M)` (sky + outlined sun + clouds), `flatSun`, `cloud`, `hillsFlat`, `groundFlat`, `outlined(g, w)` (stroke the current path in ink).
- Depth comes from overlap and `blurLayer` (blurred near/far layers still work and look good), not from darkness.
- Diagrams: `UI.blueprint()` becomes cream paper with a faint blue grid; draw line art in `UI.bpStroke()` (ink blue `#2f6f9a`). Highlights in `S().ui.gold` (amber `#d98c12`), warnings in `ui.accent` (`#d9553a`), positive in `ui.good` (`#4f9a48`). `ui.cream` is ink here, so "cream" labels read as dark text.
- Avoid hard-coded light colours (`#fff…`, pale yellows) for text or shapes: they vanish on cream. Avoid dark backdrops (`shade(x, -0.6)`) and `rgba(0,0,0,.x)` veils: use `S().paper`, mood colours or a light wash.
- Captions stay white with a dark stroke; they read on both light and mid-tone scenes.

## Checklist (in addition to render-qc.md)
- [ ] Every object has an ink outline; nothing glows.
- [ ] No near-black areas except outlines, beards, tyres and tablet screens.
- [ ] Text is dark or amber on light, never white/cream on cream.
- [ ] Characters match the sheets: cap colour, beard, overalls; hair, glasses, green coat.
