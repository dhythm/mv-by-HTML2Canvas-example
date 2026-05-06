import React, { useMemo, useRef, useEffect } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, HEIGHT, WIDTH } from "../constants";
import { FONT_ANTON, FONT_NOTO_JP, FONT_SPACE_MONO } from "../fonts";

type Particle = {
  tx: number;
  ty: number;
  vx: number;
  vy: number;
  c: string;
  s: number;
};

type Phase = "assemble" | "settle" | "read" | "explode";

// Phase boundaries — the "read" window is where the card must be perfectly legible.
const PHASE_END = {
  assemble: 0.30,
  settle: 0.40,
  read: 0.78,
  // explode runs from 0.78 to 1.0
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

const SHATTER_PALETTE = [
  COLORS.c1,
  COLORS.c2,
  COLORS.c3,
  COLORS.c4,
  COLORS.c5,
  COLORS.c6,
  "#ffffff",
];

const CARD_WIDTH = 520;
const CARD_HEIGHT = 320;
const CARD_X = (WIDTH - CARD_WIDTH) / 2;
const CARD_Y = (HEIGHT - CARD_HEIGHT) / 2;
const STEP = 8;

function createParticles(): Particle[] {
  const rnd = mulberry32(31337);
  const out: Particle[] = [];
  for (let y = 0; y < CARD_HEIGHT; y += STEP) {
    for (let x = 0; x < CARD_WIDTH; x += STEP) {
      out.push({
        tx: CARD_X + x,
        ty: CARD_Y + y,
        vx: (rnd() - 0.5) * 30,
        vy: (rnd() - 0.5) * 30,
        c: SHATTER_PALETTE[Math.floor(rnd() * SHATTER_PALETTE.length)],
        s: STEP - 1,
      });
    }
  }
  return out;
}

const Card: React.FC<{ opacity: number; scale: number }> = ({ opacity, scale }) => {
  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        transform: `translate(-50%, -50%) scale(${scale})`,
        width: CARD_WIDTH,
        padding: "36px 40px",
        borderRadius: 24,
        background: "#fff",
        color: COLORS.ink,
        boxShadow: `0 30px 60px rgba(0,0,0,0.5), 0 0 0 4px ${COLORS.c2} inset`,
        fontFamily: FONT_NOTO_JP,
        opacity,
      }}
    >
      <span
        style={{
          display: "inline-block",
          background: COLORS.c1,
          color: "#fff",
          fontFamily: FONT_SPACE_MONO,
          fontSize: 11,
          letterSpacing: "0.2em",
          padding: "6px 10px",
          borderRadius: 6,
          textTransform: "uppercase",
        }}
      >
        FEATURE / 003
      </span>
      <h2
        style={{
          fontFamily: FONT_ANTON,
          fontSize: 64,
          lineHeight: 1,
          margin: "14px 0 10px",
          letterSpacing: "-1px",
        }}
      >
        SHATTER
        <br />
        EFFECT
      </h2>
      <div style={{ display: "flex", gap: 10, marginTop: 24, flexWrap: "wrap" }}>
        {["#html2canvas", "#particles", "#kinetic"].map((tag) => (
          <span
            key={tag}
            style={{
              background: COLORS.ink,
              color: "#fff",
              padding: "6px 12px",
              borderRadius: 999,
              fontFamily: FONT_SPACE_MONO,
              fontSize: 11,
            }}
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
};

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
      if (phase === "assemble") {
        // From scattered start (offset by velocity + drop), settle to target.
        const k = 1 - Math.pow(1 - lt, 3);
        const sx = p.tx + p.vx * 50;
        const sy = p.ty + p.vy * 50 + 240;
        dx = sx + (p.tx - sx) * k;
        dy = sy + (p.ty - sy) * k;
      } else if (phase === "settle") {
        // Hover near target with tiny jitter while fading out.
        dx = p.tx + Math.sin(lt * 6 + p.tx * 0.05) * 1.2;
        dy = p.ty + Math.cos(lt * 6 + p.ty * 0.05) * 1.2;
      } else {
        // explode — burst outward from target, accelerating.
        const k = lt * lt;
        dx = p.tx + p.vx * 50 * k + Math.sin(p.ty * 0.02 + lt * 4) * 30 * k;
        dy = p.ty + p.vy * 50 * k + 220 * k * k;
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
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
      }}
    />
  );
};

export const Scene3Shatter: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const particles = useMemo(createParticles, []);

  const t = frame / durationInFrames;
  let phase: Phase;
  let lt: number;
  if (t < PHASE_END.assemble) {
    phase = "assemble";
    lt = t / PHASE_END.assemble;
  } else if (t < PHASE_END.settle) {
    phase = "settle";
    lt = (t - PHASE_END.assemble) / (PHASE_END.settle - PHASE_END.assemble);
  } else if (t < PHASE_END.read) {
    phase = "read";
    lt = (t - PHASE_END.settle) / (PHASE_END.read - PHASE_END.settle);
  } else {
    phase = "explode";
    lt = (t - PHASE_END.read) / (1 - PHASE_END.read);
  }

  // Card visibility — dim during assemble (background to particles), full during read.
  let cardOpacity = 0;
  let cardScale = 1;
  if (phase === "assemble") {
    cardOpacity = lt * 0.2;
    cardScale = 0.92 + 0.06 * lt;
  } else if (phase === "settle") {
    cardOpacity = 0.2 + 0.8 * lt;
    cardScale = 0.98 + 0.02 * lt;
  } else if (phase === "read") {
    cardOpacity = 1;
    cardScale = 1 + Math.sin(lt * Math.PI * 2) * 0.003;
  } else {
    // explode — fade out card so particles read as the destruction itself
    cardOpacity = Math.max(0, 1 - lt * 1.6);
    cardScale = 1 + lt * 0.06;
  }

  // Particle alpha — strong during entry, gone during read, ramps back up for explode.
  let particleAlpha: number;
  if (phase === "assemble") {
    particleAlpha = 1;
  } else if (phase === "settle") {
    particleAlpha = 1 - lt;
  } else if (phase === "read") {
    particleAlpha = 0;
  } else {
    particleAlpha = Math.min(1, lt * 1.6);
  }

  // Tagline appears once we're solidly into the read phase.
  const readStart = Math.round(PHASE_END.settle * durationInFrames);
  const readEnd = Math.round(PHASE_END.read * durationInFrames);
  const msgOpacity = interpolate(
    frame,
    [readStart + 6, readStart + 22, readEnd - 6, readEnd + 4],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(135deg,#0e0c1f 0%, #1a1240 100%)",
        overflow: "hidden",
      }}
    >
      <Card opacity={cardOpacity} scale={cardScale} />
      <ParticleCanvas
        particles={particles}
        phase={phase}
        lt={lt}
        alpha={particleAlpha}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 64,
          textAlign: "center",
          fontFamily: FONT_SPACE_MONO,
          fontSize: 12,
          letterSpacing: "0.4em",
          color: COLORS.c2,
          textTransform: "uppercase",
          opacity: msgOpacity,
        }}
      >
        CAPTURING DOM ▸ EXPLODING PIXELS ▸ REBUILDING
      </div>
    </AbsoluteFill>
  );
};
