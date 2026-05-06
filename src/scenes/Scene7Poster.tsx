import React, { useMemo, useEffect, useRef } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, HEIGHT, WIDTH } from "../constants";
import { FONT_ANTON, FONT_SPACE_MONO } from "../fonts";

type Particle = {
  tx: number;
  ty: number;
  c: string;
  s: number;
  ang: number;
  rad: number;
};

type Phase = "swirlIn" | "settle" | "read" | "swirlOut";

const PHASE_END = {
  swirlIn: 0.30,
  settle: 0.40,
  read: 0.78,
  // swirlOut runs from 0.78 to 1.0
} as const;

function mulberry32(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = t;
    r = Math.imul(r ^ (r >>> 15), r | 1);
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

const POSTER_WIDTH = 520;
const POSTER_HEIGHT = 560;
const POSTER_X = (WIDTH - POSTER_WIDTH) / 2;
const POSTER_Y = (HEIGHT - POSTER_HEIGHT) / 2;
const STEP = 7;

const SHATTER_PALETTE = [
  COLORS.ink,
  COLORS.c2,
  COLORS.c3,
  COLORS.paper,
  COLORS.c1,
  "#888",
];

function createParticles(): Particle[] {
  const rnd = mulberry32(91011);
  const out: Particle[] = [];
  for (let y = 0; y < POSTER_HEIGHT; y += STEP) {
    for (let x = 0; x < POSTER_WIDTH; x += STEP) {
      out.push({
        tx: POSTER_X + x,
        ty: POSTER_Y + y,
        c: SHATTER_PALETTE[Math.floor(rnd() * SHATTER_PALETTE.length)],
        s: STEP - 1,
        ang: rnd() * Math.PI * 2,
        rad: rnd() * 400 + 200,
      });
    }
  }
  return out;
}

const Poster: React.FC<{ opacity: number }> = ({ opacity }) => (
  <div
    style={{
      position: "absolute",
      left: "50%",
      top: "50%",
      transform: "translate(-50%, -50%)",
      width: POSTER_WIDTH,
      height: POSTER_HEIGHT,
      background: COLORS.ink,
      color: COLORS.paper,
      padding: 36,
      borderRadius: 18,
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      boxShadow: `18px 18px 0 ${COLORS.c1}`,
      opacity,
    }}
  >
    <div>
      <div
        style={{
          fontFamily: FONT_SPACE_MONO,
          fontSize: 13,
          letterSpacing: "0.3em",
          textTransform: "uppercase",
          color: COLORS.c3,
        }}
      >
        vol. 07 — pixel poster
      </div>
      <div
        style={{
          fontFamily: FONT_ANTON,
          fontSize: 200,
          lineHeight: 1,
          color: COLORS.c2,
          marginTop: 12,
        }}
      >
        07
      </div>
    </div>
    <div>
      <div
        style={{
          fontFamily: FONT_ANTON,
          fontSize: 60,
          lineHeight: 0.95,
          letterSpacing: "-1px",
        }}
      >
        DESIGN
        <br />
        IN
        <br />
        MOTION
      </div>
    </div>
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "end",
        fontFamily: FONT_SPACE_MONO,
        fontSize: 12,
        letterSpacing: "0.2em",
        textTransform: "uppercase",
        color: "#888",
      }}
    >
      <span>tokyo · 2026</span>
      <span>↗ 30s loop</span>
    </div>
  </div>
);

const ParticleCanvas: React.FC<{
  particles: Particle[];
  phase: Phase;
  lt: number;
  alpha: number;
}> = ({ particles, phase, lt, alpha }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const frame = useCurrentFrame();

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    if (alpha <= 0) return;
    ctx.globalAlpha = alpha;

    for (const p of particles) {
      let dx: number;
      let dy: number;
      if (phase === "swirlIn") {
        const k = 1 - Math.pow(1 - lt, 3);
        const sx = 640 + Math.cos(p.ang) * p.rad * 1.5;
        const sy = 360 + Math.sin(p.ang) * p.rad * 1.5;
        dx = sx + (p.tx - sx) * k;
        dy = sy + (p.ty - sy) * k;
      } else if (phase === "settle") {
        dx = p.tx + Math.sin(lt * 8 + p.tx * 0.05) * 1.5;
        dy = p.ty + Math.cos(lt * 8 + p.ty * 0.05) * 1.5;
      } else {
        // swirlOut — eased radial spiral outward
        const k = lt;
        const ang = p.ang + lt * Math.PI * 1.5;
        const r = k * p.rad * 1.6;
        dx = p.tx + Math.cos(ang) * r;
        dy = p.ty + Math.sin(ang) * r;
      }
      ctx.fillStyle = p.c;
      ctx.fillRect(dx, dy, p.s, p.s);
    }

    ctx.globalAlpha = 1;
  }, [frame, particles, phase, lt, alpha]);

  return (
    <canvas
      ref={ref}
      width={WIDTH}
      height={HEIGHT}
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
    />
  );
};

export const Scene7Poster: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const particles = useMemo(createParticles, []);

  const t = frame / durationInFrames;
  let phase: Phase;
  let lt: number;
  if (t < PHASE_END.swirlIn) {
    phase = "swirlIn";
    lt = t / PHASE_END.swirlIn;
  } else if (t < PHASE_END.settle) {
    phase = "settle";
    lt = (t - PHASE_END.swirlIn) / (PHASE_END.settle - PHASE_END.swirlIn);
  } else if (t < PHASE_END.read) {
    phase = "read";
    lt = (t - PHASE_END.settle) / (PHASE_END.read - PHASE_END.settle);
  } else {
    phase = "swirlOut";
    lt = (t - PHASE_END.read) / (1 - PHASE_END.read);
  }

  let posterOpacity = 0;
  if (phase === "swirlIn") {
    posterOpacity = lt * 0.2;
  } else if (phase === "settle") {
    posterOpacity = 0.2 + 0.8 * lt;
  } else if (phase === "read") {
    posterOpacity = 1;
  } else {
    posterOpacity = Math.max(0, 1 - lt * 1.6);
  }

  let particleAlpha: number;
  if (phase === "swirlIn") {
    particleAlpha = 1;
  } else if (phase === "settle") {
    particleAlpha = 1 - lt;
  } else if (phase === "read") {
    particleAlpha = 0;
  } else {
    particleAlpha = Math.min(1, lt * 1.6);
  }

  return (
    <AbsoluteFill style={{ background: COLORS.c3, overflow: "hidden" }}>
      <Poster opacity={posterOpacity} />
      <ParticleCanvas
        particles={particles}
        phase={phase}
        lt={lt}
        alpha={particleAlpha}
      />
    </AbsoluteFill>
  );
};
