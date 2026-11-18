# video-studio — Three.js + Remotion

## Commands
| Command | What it does |
|---|---|
| `npm run dev` | Opens Remotion Studio (live preview + timeline) at http://localhost:3000 |
| `npm run render` | Renders `Main` to `out/video.mp4` |
| `npm run still` | Renders one frame to `out/still.png` |
| `npm run typecheck` | TypeScript check |

## Layout
- `src/Root.tsx` — compositions (size, fps, duration)
- `src/Main.tsx` — stacks the 3D scene, captions and audio
- `src/Scene.tsx` — Three.js scene via `<ThreeCanvas>` (@react-three/fiber + drei)
- `src/Captions.tsx` — word-highlight captions via `@remotion/captions`
- `public/` — audio, images, fonts (reference with `staticFile("name")`)

## Rules for 3D in Remotion
- Drive **all** motion from `useCurrentFrame()` — never `useFrame()`, `clock`, or drei `speed`, or frames will flicker/differ between renders.
- Use `<ThreeCanvas>` from `@remotion/three`, not `<Canvas>`.
- Load GLTF models with `useGLTF(staticFile("model.glb"))`; textures with `useTexture`.

## Audio
Put a file in `public/` (e.g. `music.mp3`), set `HAS_AUDIO = true` in `src/Main.tsx`.

## Captions
Edit `demoCaptions`, or load an `.srt` with `parseSrt()` from `@remotion/captions`.
For automatic transcription: `npm i @remotion/install-whisper-cpp` (see remotion.dev/docs/install-whisper-cpp).
