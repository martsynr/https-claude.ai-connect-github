import { Audio } from "@remotion/media";
import { loadFont } from "@remotion/fonts";
import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// ---------- fonts (Inter, Cyrillic + Latin subsets) ----------
const CYR = "U+0301,U+0400-045F,U+0490-0491,U+04B0-04B1,U+2116";
const LAT =
  "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD";
for (const w of [500, 700, 800, 900]) {
  loadFont({ family: "Inter", url: staticFile(`hammer/fonts/inter-cyrillic-${w}-normal.woff2`), weight: String(w), unicodeRange: CYR });
  loadFont({ family: "Inter", url: staticFile(`hammer/fonts/inter-latin-${w}-normal.woff2`), weight: String(w), unicodeRange: LAT });
}

// ---------- brand ----------
const C = {
  green: "#00923F",
  dark: "#0B5E2E",
  lime: "#95C11F",
  yellow: "#F4B90E",
  ink: "#1D1D1B",
  grey: "#CFCFCF",
  paper: "#FFFFFF",
};
const FONT = "Inter, sans-serif";
export const FPS = 30;

// ---------- helpers ----------
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = Easing.bezier(0.22, 1, 0.36, 1);

const useSpring = (delay = 0, damping = 14) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: f - delay, fps, config: { damping, mass: 0.8 } });
};

/** Slide-up + fade in at `delay`. */
const Rise: React.FC<{ delay?: number; dist?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({
  delay = 0,
  dist = 60,
  children,
  style,
}) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [delay, delay + 18], [0, 1], { ...clamp, easing: ease });
  return <div style={{ opacity: p, transform: `translateY(${(1 - p) * dist}px)`, ...style }}>{children}</div>;
};

/** Wraps a scene: wipe-in from the right and fade-out at the end. */
const Scene: React.FC<{ dur: number; bg: string; children: React.ReactNode }> = ({ dur, bg, children }) => {
  const f = useCurrentFrame();
  const inP = interpolate(f, [0, 14], [0, 1], { ...clamp, easing: ease });
  const out = interpolate(f, [dur - 10, dur], [1, 0], clamp);
  return (
    <AbsoluteFill
      style={{
        background: bg,
        clipPath: `inset(0 0 0 ${(1 - inP) * 100}%)`,
        opacity: out,
        fontFamily: FONT,
        color: C.ink,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

/** Green top band + lime stripe like the product card. */
const Bands: React.FC<{ y?: number }> = ({ y = 0 }) => {
  const f = useCurrentFrame();
  const w = interpolate(f, [0, 22], [0, 100], { ...clamp, easing: ease });
  return (
    <>
      <div style={{ position: "absolute", top: y, left: 0, height: 70, width: `${w}%`, background: C.green, borderBottomRightRadius: 50 }} />
      <div style={{ position: "absolute", top: y + 70, right: 0, height: 18, width: `${w}%`, background: C.lime }} />
    </>
  );
};

const Title: React.FC<{ children: React.ReactNode; delay?: number; color?: string; size?: number }> = ({
  children,
  delay = 6,
  color = C.ink,
  size = 72,
}) => (
  <Rise delay={delay}>
    <div style={{ fontSize: size, fontWeight: 800, lineHeight: 1.08, color, letterSpacing: -1 }}>{children}</div>
  </Rise>
);

// =====================================================================
// 1. Intro
// =====================================================================
const Intro: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const logo = useSpring(4, 10);
  const words = ["ДМС", "Хаммер"];
  const zoom = interpolate(f, [0, dur], [1.15, 1.0]);
  return (
    <Scene dur={dur} bg={C.green}>
      <AbsoluteFill style={{ transform: `scale(${zoom})` }}>
        <Img src={staticFile("hammer/cob.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "60% 50%" }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,146,63,0.92) 0%, rgba(0,146,63,0.55) 45%, rgba(11,94,46,0.95) 100%)" }} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", padding: 70 }}>
        <div
          style={{
            width: 330,
            height: 330,
            transform: `scale(${logo}) rotate(${(1 - logo) * -40}deg)`,
            filter: "drop-shadow(0 20px 40px rgba(0,0,0,.35))",
            marginBottom: 70,
          }}
        >
          <Img src={staticFile("hammer/logo.png")} style={{ width: "100%", height: "100%", clipPath: "polygon(50% 1%, 99% 50%, 50% 99%, 1% 50%)" }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          {words.map((w, i) => {
            const s = spring({ frame: f - 18 - i * 9, fps: FPS, config: { damping: 12, mass: 0.9 } });
            return (
              <div
                key={w}
                style={{
                  fontSize: i === 0 ? 150 : 190,
                  fontWeight: 900,
                  fontStyle: "italic",
                  color: C.paper,
                  lineHeight: 1,
                  letterSpacing: -4,
                  transform: `translateX(${(1 - s) * (i ? 900 : -900)}px) skewX(-6deg)`,
                  textShadow: "0 10px 30px rgba(0,0,0,.35)",
                }}
              >
                {w}
              </div>
            );
          })}
        </div>
        <Rise delay={42} style={{ marginTop: 60 }}>
          <div style={{ background: C.dark, color: C.paper, fontSize: 44, fontWeight: 600, padding: "22px 40px", borderRadius: 18, textAlign: "center" }}>
            простий модифікований гібрид кукурудзи
          </div>
        </Rise>
      </AbsoluteFill>
    </Scene>
  );
};

// =====================================================================
// 2. FAO + photo
// =====================================================================
const Fao: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const zoom = interpolate(f, [0, dur], [1.0, 1.18]);
  const pan = interpolate(f, [0, dur], [0, -60]);
  const zones = [
    ["Степ", "118 днів"],
    ["Лісостеп", "120 днів"],
    ["Полісся", "123 дні"],
  ];
  const n = Math.round(interpolate(f, [16, 50], [0, 360], { ...clamp, easing: ease }));
  return (
    <Scene dur={dur} bg={C.paper}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1150, overflow: "hidden" }}>
        <Img
          src={staticFile("hammer/cob.jpg")}
          style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${zoom}) translateX(${pan}px)` }}
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0) 60%, rgba(255,255,255,1) 100%)" }} />
      </div>
      <div style={{ position: "absolute", top: 1060, left: 70, right: 70 }}>
        <Rise delay={8}>
          <div
            style={{
              background: C.yellow,
              borderRadius: 40,
              padding: "40px 50px",
              display: "flex",
              alignItems: "center",
              gap: 40,
              boxShadow: "0 20px 50px rgba(0,0,0,.15)",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 150, fontWeight: 900, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{n}</div>
              <div style={{ fontSize: 64, fontWeight: 900 }}>FAO</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14, flex: 1 }}>
              {zones.map(([z, d], i) => (
                <Rise key={z} delay={30 + i * 8} dist={30}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 46, fontWeight: 500 }}>
                    <span>{z}</span>
                    <span style={{ fontWeight: 800 }}>{d}</span>
                  </div>
                </Rise>
              ))}
            </div>
          </div>
        </Rise>
        <Rise delay={60} style={{ marginTop: 60, textAlign: "center" }}>
          <div style={{ display: "inline-block", background: C.lime, color: C.paper, fontSize: 64, fontWeight: 800, padding: "18px 56px", borderRadius: 999 }}>
            середньостиглий
          </div>
        </Rise>
      </div>
    </Scene>
  );
};

// =====================================================================
// 3. Yield potential
// =====================================================================
const Yield: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const v = interpolate(f, [10, 60], [0, 16.9], { ...clamp, easing: Easing.out(Easing.cubic) });
  const pop = spring({ frame: f - 60, fps: FPS, config: { damping: 8 } });
  const scale = 1 + 0.08 * Math.sin(Math.min(pop, 1) * Math.PI);
  const rot = interpolate(f, [0, dur], [-14, -8]);
  return (
    <Scene dur={dur} bg={C.yellow}>
      <div
        style={{
          position: "absolute",
          left: -200,
          bottom: -120,
          width: 1500,
          height: 820,
          transform: `rotate(${rot}deg)`,
          borderRadius: 60,
          overflow: "hidden",
          boxShadow: "0 30px 80px rgba(0,0,0,.3)",
        }}
      >
        <Img src={staticFile("hammer/cob.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
      <AbsoluteFill style={{ padding: "220px 80px 0", alignItems: "flex-start" }}>
        <Title delay={4} size={64}>
          потенціал
          <br />
          врожайності
        </Title>
        <div style={{ display: "flex", alignItems: "baseline", gap: 24, transform: `scale(${scale})`, transformOrigin: "left center", marginTop: 20 }}>
          <span style={{ fontSize: 330, fontWeight: 900, letterSpacing: -12, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
            {v.toFixed(1).replace(".", ",")}
          </span>
          <span style={{ fontSize: 80, fontWeight: 700 }}>т/га</span>
        </div>
        <Rise delay={66}>
          <div style={{ marginTop: 50, background: C.ink, color: C.yellow, fontSize: 48, fontWeight: 800, padding: "16px 34px", borderRadius: 16 }}>
            до 16,9 тонн з гектара
          </div>
        </Rise>
      </AbsoluteFill>
    </Scene>
  );
};

// =====================================================================
// 4. Feature badges
// =====================================================================
const Kernel: React.FC = () => (
  <svg viewBox="0 0 100 120" width={150} height={170}>
    <path d="M18 20 Q50 0 82 20 L76 80 Q50 118 24 80 Z" fill={C.yellow} stroke="#D99A00" strokeWidth={4} />
    <path d="M38 40 Q50 32 62 40 L58 78 Q50 90 42 78 Z" fill="#FFF3C4" />
  </svg>
);
const Rows: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <svg viewBox="-60 -60 120 120" width={190} height={190}>
      {Array.from({ length: 17 }).map((_, i) => {
        const a = (i / 17) * Math.PI * 2;
        const s = interpolate(f, [8 + i, 14 + i], [0, 1], clamp);
        return (
          <ellipse
            key={i}
            cx={Math.cos(a) * 44}
            cy={Math.sin(a) * 44}
            rx={8 * s}
            ry={12 * s}
            transform={`rotate(${(a * 180) / Math.PI + 90} ${Math.cos(a) * 44} ${Math.sin(a) * 44})`}
            fill={C.yellow}
            stroke="#D99A00"
            strokeWidth={2}
          />
        );
      })}
    </svg>
  );
};
const Leaf: React.FC = () => {
  const f = useCurrentFrame();
  const sway = Math.sin(f / 8) * 4;
  return (
    <svg viewBox="0 0 120 120" width={170} height={170}>
      <g transform={`rotate(${sway} 60 110)`}>
        <path d="M60 112 C55 70 40 40 10 18 C55 30 72 70 66 112 Z" fill={C.green} />
        <path d="M62 112 C70 72 90 50 114 40 C88 70 76 92 70 112 Z" fill={C.lime} />
        <ellipse cx={48} cy={52} rx={12} ry={28} transform="rotate(-25 48 52)" fill={C.yellow} />
      </g>
    </svg>
  );
};
const Thermo: React.FC = () => {
  const f = useCurrentFrame();
  const h = interpolate(f, [10, 40], [8, 60], { ...clamp, easing: ease });
  return (
    <svg viewBox="0 0 120 120" width={170} height={170}>
      <rect x={52} y={8} width={22} height={80} rx={11} fill="#fff" stroke={C.ink} strokeWidth={5} />
      <rect x={57} y={88 - h} width={12} height={h} rx={6} fill="#E3262B" />
      <circle cx={63} cy={94} r={18} fill="#E3262B" stroke={C.ink} strokeWidth={5} />
    </svg>
  );
};

const Features: React.FC<{ dur: number }> = ({ dur }) => {
  const items: { icon: React.ReactNode; big: string; small: string }[] = [
    { icon: <Kernel />, big: "Зуб", small: "тип зерна" },
    { icon: <Rows />, big: "16–18", small: "рядів зерна" },
    { icon: <Leaf />, big: "Живий лист", small: "stay-green" },
    { icon: <Thermo />, big: "9–11 °C", small: "температура" },
  ];
  return (
    <Scene dur={dur} bg={C.paper}>
      <Bands />
      <AbsoluteFill style={{ padding: "200px 70px 0" }}>
        <Title delay={6}>
          Що в
          <br />
          <span style={{ color: C.green }}>ДМС Хаммер</span>?
        </Title>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 44, marginTop: 90 }}>
          {items.map((it, i) => (
            <Badge key={it.big} delay={18 + i * 10} {...it} />
          ))}
        </div>
      </AbsoluteFill>
    </Scene>
  );
};
const Badge: React.FC<{ delay: number; icon: React.ReactNode; big: string; small: string }> = ({ delay, icon, big, small }) => {
  const s = useSpring(delay, 11);
  return (
    <div
      style={{
        transform: `scale(${s})`,
        background: "#FFF8E1",
        border: `5px solid ${C.yellow}`,
        borderRadius: 48,
        height: 640,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 18,
      }}
    >
      <div style={{ width: 230, height: 230, borderRadius: "50%", background: C.paper, border: `4px solid ${C.grey}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Sequence from={delay} layout="none">
          {icon}
        </Sequence>
      </div>
      <div style={{ fontSize: 58, fontWeight: 800 }}>{big}</div>
      <div style={{ fontSize: 36, fontWeight: 500, color: "#555" }}>{small}</div>
    </div>
  );
};

// =====================================================================
// 5. Resistance scores
// =====================================================================
const SCORES: [string, number][] = [
  ["Посуха", 9],
  ["Спека", 9],
  ["Пухирчаста сажка", 8],
  ["Летюча сажка", 8],
  ["Кукурудзяний метелик", 9],
  ["Вилягання", 9],
  ["Холодостійкість", 8],
  ["Стартова швидкість", 9],
  ["Вологовіддача", 7],
  ["Висота рослини", 7],
];
const Scores: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  return (
    <Scene dur={dur} bg={C.paper}>
      <Bands />
      <AbsoluteFill style={{ padding: "190px 60px 0" }}>
        <Title delay={4} size={66}>
          Характеристики
          <br />
          та <span style={{ color: C.green }}>стійкість</span>
        </Title>
        <div style={{ marginTop: 50, display: "flex", flexDirection: "column", gap: 22 }}>
          {SCORES.map(([name, score], r) => {
            const d = 16 + r * 9;
            const rowIn = interpolate(f, [d, d + 12], [0, 1], { ...clamp, easing: ease });
            return (
              <div key={name} style={{ opacity: rowIn, transform: `translateX(${(1 - rowIn) * -80}px)`, borderBottom: "3px dashed #ddd", paddingBottom: 18 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 44, fontWeight: 600, marginBottom: 12 }}>
                  <span>{name}</span>
                  <span style={{ fontWeight: 900, color: C.green }}>
                    {Math.round(interpolate(f, [d + 4, d + 4 + score * 2.5], [0, score], clamp))}
                    <span style={{ color: "#aaa", fontWeight: 600 }}>/9</span>
                  </span>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  {Array.from({ length: 9 }).map((_, k) => {
                    const on = k < score;
                    const t = interpolate(f, [d + 4 + k * 2.5, d + 8 + k * 2.5], [0, 1], clamp);
                    return (
                      <div key={k} style={{ flex: 1, height: 30, borderRadius: 15, background: C.grey, overflow: "hidden" }}>
                        {on && <div style={{ width: `${t * 100}%`, height: "100%", background: C.yellow, borderRadius: 15 }} />}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </Scene>
  );
};

// =====================================================================
// 6. Trial yields
// =====================================================================
const TRIALS: [string, string, number][] = [
  ["Миронівка", "Київська обл.", 10.9],
  ["Бучач", "Тернопільська обл.", 12],
  ["Скорики", "Тернопільська обл.", 15.6],
  ["Репуженці", "Чернівецька обл.", 16.2],
];
const Trials: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  return (
    <Scene dur={dur} bg={C.dark}>
      <AbsoluteFill style={{ padding: "200px 70px 0", color: C.paper }}>
        <Title delay={4} color={C.paper}>
          Врожайність
          <br />
          <span style={{ color: C.yellow }}>у полі</span>
        </Title>
        <Rise delay={12}>
          <div style={{ fontSize: 40, fontWeight: 500, opacity: 0.8, marginTop: 16 }}>на 14% вологості, т/га</div>
        </Rise>
        <div style={{ marginTop: 90, display: "flex", flexDirection: "column", gap: 70 }}>
          {TRIALS.map(([town, region, t], i) => {
            const d = 20 + i * 14;
            const p = interpolate(f, [d, d + 30], [0, 1], { ...clamp, easing: ease });
            return (
              <div key={town} style={{ opacity: interpolate(f, [d, d + 8], [0, 1], clamp) }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 18, marginBottom: 16 }}>
                  <span style={{ fontSize: 54, fontWeight: 800 }}>{town}</span>
                  <span style={{ fontSize: 34, fontWeight: 500, opacity: 0.7 }}>{region}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
                  <div style={{ flex: 1, height: 64, background: "rgba(255,255,255,.12)", borderRadius: 32 }}>
                    <div
                      style={{
                        width: `${(t / 16.9) * 100 * p}%`,
                        height: "100%",
                        borderRadius: 32,
                        background: `linear-gradient(90deg, ${C.lime}, ${C.yellow})`,
                      }}
                    />
                  </div>
                  <span style={{ width: 170, textAlign: "right", fontSize: 64, fontWeight: 900, color: C.yellow, fontVariantNumeric: "tabular-nums" }}>
                    {(t * p).toFixed(1).replace(".", ",")}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </Scene>
  );
};

// =====================================================================
// 7. Regions + density
// =====================================================================
const Regions: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const map = useSpring(10, 13);
  const dens: [string, string][] = [
    ["Степ", "40–45"],
    ["Лісостеп", "50–60"],
    ["Полісся", "65–75"],
  ];
  return (
    <Scene dur={dur} bg={C.paper}>
      <Bands />
      <AbsoluteFill style={{ padding: "190px 70px 0" }}>
        <Title delay={4} size={66}>
          Рекомендовані
          <br />
          регіони
        </Title>
        <div style={{ marginTop: 30, transform: `scale(${map})`, transformOrigin: "center top" }}>
          <Img src={staticFile("hammer/map.png")} style={{ width: "100%", mixBlendMode: "multiply" }} />
        </div>
        <Rise delay={26} style={{ textAlign: "center", marginTop: 10 }}>
          <span style={{ fontSize: 64, fontWeight: 900, color: C.green }}>Лісостеп, Полісся</span>
        </Rise>
        <Rise delay={36} style={{ marginTop: 50 }}>
          <div style={{ background: C.yellow, borderRadius: 36, padding: "36px 46px" }}>
            <div style={{ fontSize: 42, fontWeight: 800, marginBottom: 20 }}>Передзбиральна густота</div>
            {dens.map(([z, v], i) => (
              <div
                key={z}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 46,
                  padding: "10px 0",
                  opacity: interpolate(f, [44 + i * 8, 54 + i * 8], [0, 1], clamp),
                }}
              >
                <span style={{ fontWeight: 800 }}>{z}</span>
                <span style={{ fontWeight: 500 }}>
                  <b style={{ fontWeight: 900 }}>{v}</b> тис./га
                </span>
              </div>
            ))}
          </div>
        </Rise>
      </AbsoluteFill>
    </Scene>
  );
};

// =====================================================================
// 8. Outro
// =====================================================================
const Outro: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const logo = useSpring(4, 12);
  const zoom = interpolate(f, [0, dur], [1.05, 1.2]);
  return (
    <Scene dur={dur + 10} bg={C.green}>
      <AbsoluteFill style={{ transform: `scale(${zoom})` }}>
        <Img src={staticFile("hammer/cob.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "70% 50%" }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(11,94,46,.95) 0%, rgba(0,146,63,.75) 50%, rgba(11,94,46,.97) 100%)" }} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", color: C.paper, textAlign: "center", padding: 70 }}>
        <div style={{ width: 260, height: 260, transform: `scale(${logo})`, marginBottom: 50 }}>
          <Img src={staticFile("hammer/logo.png")} style={{ width: "100%", height: "100%", clipPath: "polygon(50% 1%, 99% 50%, 50% 99%, 1% 50%)" }} />
        </div>
        <Rise delay={10}>
          <div style={{ fontSize: 150, fontWeight: 900, fontStyle: "italic", letterSpacing: -4, lineHeight: 1 }}>ДМС Хаммер</div>
        </Rise>
        <Rise delay={22} style={{ marginTop: 40 }}>
          <div style={{ fontSize: 58, fontWeight: 800, color: C.yellow }}>Міцний удар по врожаю</div>
        </Rise>
        <Rise delay={34} style={{ marginTop: 60, display: "flex", gap: 24, justifyContent: "center" }}>
          {["FAO 360", "16,9 т/га", "Лісостеп · Полісся"].map((t) => (
            <div key={t} style={{ background: C.paper, color: C.green, fontSize: 38, fontWeight: 800, padding: "16px 28px", borderRadius: 999, whiteSpace: "nowrap" }}>
              {t}
            </div>
          ))}
        </Rise>
      </AbsoluteFill>
    </Scene>
  );
};

// =====================================================================
// Timeline
// =====================================================================
const S = (sec: number) => Math.round(sec * FPS);
const TIMELINE: [React.FC<{ dur: number }>, number][] = [
  [Intro, S(4.2)],
  [Fao, S(4.6)],
  [Yield, S(4.2)],
  [Features, S(4.8)],
  [Scores, S(6.6)],
  [Trials, S(4.6)],
  [Regions, S(4.6)],
  [Outro, S(3.4)],
];
const OVERLAP = 6;
export const HAMMER_DURATION = TIMELINE.reduce((a, [, d]) => a + d - OVERLAP, 0) + OVERLAP;

export const Hammer: React.FC = () => {
  let at = 0;
  return (
    <AbsoluteFill style={{ background: C.green }}>
      {TIMELINE.map(([Comp, dur], i) => {
        const from = at;
        at += dur - OVERLAP;
        return (
          <Sequence key={i} from={from} durationInFrames={dur}>
            <Comp dur={dur} />
          </Sequence>
        );
      })}
      <Audio src={staticFile("hammer/music.mp3")} volume={(f) => interpolate(f, [HAMMER_DURATION - 45, HAMMER_DURATION], [0.9, 0], clamp)} />
    </AbsoluteFill>
  );
};
