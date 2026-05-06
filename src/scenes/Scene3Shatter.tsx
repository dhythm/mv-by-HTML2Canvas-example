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

// Deterministic pseudo-random so particles are stable across frames + render workers.
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
      <p style={{ fontSize: 14, lineHeight: 1.6, color: "#444" }}>
        html2canvasでDOM要素をピクセル化、何百もの粒子に分裂させて再構築。リアルなレイアウトをそのまま破壊できる。
      </p>
      <div style={{ display: "flex", gap: 10, marginTop: 18, flexWrap: "wrap" }}>
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
  phase: "in" | "hold" | "explode" | "reform";
  lt: number;
}> = ({ particles, phase, lt }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const frame = useCurrentFrame();

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    for (const p of particles) {
      let dx = p.tx;
      let dy = p.ty;
      if (phase === "in") {
        const k = 1 - Math.pow(1 - lt, 3);
        dx = p.tx + (1 - k) * p.vx * 30;
        dy = p.ty + (1 - k) * p.vy * 30 + (1 - k) * 200;
      } else if (phase === "hold") {
        dx = p.tx + Math.sin(lt * 6 + p.tx * 0.05) * 1.2;
        dy = p.ty + Math.cos(lt * 6 + p.ty * 0.05) * 1.2;
      } else if (phase === "explode") {
        const k = lt * lt;
        dx = p.tx + p.vx * 40 * k + Math.sin(p.ty * 0.02 + lt * 4) * 30 * k;
        dy = p.ty + p.vy * 40 * k + 200 * k * k;
      } else {
        const k = 1 - Math.pow(1 - lt, 3);
        const sx = p.tx + p.vx * 40 + Math.sin(p.ty * 0.02 + 4) * 30;
        const sy = p.ty + p.vy * 40 + 200;
        dx = sx + (p.tx - sx) * k;
        dy = sy + (p.ty - sy) * k;
      }
      ctx.fillStyle = p.c;
      ctx.fillRect(dx, dy, p.s, p.s);
    }
  }, [frame, particles, phase, lt]);

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
  const { fps, durationInFrames } = useVideoConfig();
  const particles = useMemo(createParticles, []);

  // total scene duration in frames is durationInFrames (set by Sequence)
  const t = frame / durationInFrames;
  let phase: "in" | "hold" | "explode" | "reform";
  let lt: number;
  if (t < 0.15) {
    phase = "in";
    lt = t / 0.15;
  } else if (t < 0.45) {
    phase = "hold";
    lt = (t - 0.15) / 0.3;
  } else if (t < 0.8) {
    phase = "explode";
    lt = (t - 0.45) / 0.35;
  } else {
    phase = "reform";
    lt = (t - 0.8) / 0.2;
  }

  // Card visibility:
  //  in:    fade-in to full
  //  hold:  full
  //  explode: fade-out
  //  reform: fade back in
  let cardOpacity = 0;
  let cardScale = 1;
  if (phase === "in") {
    cardOpacity = lt;
    cardScale = 0.92 + 0.08 * lt;
  } else if (phase === "hold") {
    cardOpacity = 1;
    cardScale = 1 + Math.sin(lt * Math.PI * 2) * 0.005;
  } else if (phase === "explode") {
    cardOpacity = Math.max(0, 1 - lt * 1.4);
    cardScale = 1 + lt * 0.05;
  } else {
    cardOpacity = lt;
    cardScale = 0.96 + 0.04 * lt;
  }

  const msgOpacity = interpolate(
    frame,
    [Math.round(0.6 * fps), Math.round(1.0 * fps)],
    [0, 1],
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
      <ParticleCanvas particles={particles} phase={phase} lt={lt} />
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
