import { createTikTokStyleCaptions, type Caption } from "@remotion/captions";
import { loadFont } from "@remotion/fonts";
import { AbsoluteFill, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

// Fonts live in public/fonts so rendering works offline.
const fontFamily = "Inter";
loadFont({ family: fontFamily, url: staticFile("fonts/Inter-ExtraBold.woff2"), weight: "800" });

// Replace with your own captions (e.g. from @remotion/install-whisper-cpp or an SRT
// parsed with parseSrt() from @remotion/captions). Times are in milliseconds.
export const demoCaptions: Caption[] = [
  { text: "Three.js", startMs: 500, endMs: 1300, timestampMs: 900, confidence: 1 },
  { text: " meets", startMs: 1300, endMs: 2000, timestampMs: 1650, confidence: 1 },
  { text: " Remotion.", startMs: 2000, endMs: 3200, timestampMs: 2600, confidence: 1 },
  { text: " Animated", startMs: 4000, endMs: 4800, timestampMs: 4400, confidence: 1 },
  { text: " 3D", startMs: 4800, endMs: 5400, timestampMs: 5100, confidence: 1 },
  { text: " videos", startMs: 5400, endMs: 6200, timestampMs: 5800, confidence: 1 },
  { text: " in", startMs: 6200, endMs: 6600, timestampMs: 6400, confidence: 1 },
  { text: " code.", startMs: 6600, endMs: 8000, timestampMs: 7300, confidence: 1 },
];

const Page: React.FC<{ tokens: { text: string; fromMs: number; toMs: number }[] }> = ({ tokens }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const nowMs = (frame / fps) * 1000;
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 120 }}>
      <div style={{ fontFamily, fontSize: 84, fontWeight: 800, color: "white", textShadow: "0 6px 24px rgba(0,0,0,.6)", whiteSpace: "pre" }}>
        {tokens.map((t) => {
          const active = nowMs >= t.fromMs && nowMs < t.toMs;
          return (
            <span key={t.fromMs} style={{ color: active ? "#ffd84d" : "white" }}>
              {t.text}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export const Captions: React.FC<{ captions: Caption[] }> = ({ captions }) => {
  const { fps } = useVideoConfig();
  const { pages } = createTikTokStyleCaptions({ captions, combineTokensWithinMilliseconds: 1200 });
  return (
    <>
      {pages.map((page, i) => {
        const next = pages[i + 1];
        const from = Math.round((page.startMs / 1000) * fps);
        const to = Math.round(((next?.startMs ?? page.startMs + page.durationMs) / 1000) * fps);
        if (to <= from) return null;
        // Tokens inside a Sequence see a local frame, so offset times accordingly.
        const tokens = page.tokens.map((t) => ({ text: t.text, fromMs: t.fromMs - page.startMs, toMs: t.toMs - page.startMs }));
        return (
          <Sequence key={i} from={from} durationInFrames={to - from}>
            <Page tokens={tokens} />
          </Sequence>
        );
      })}
    </>
  );
};
