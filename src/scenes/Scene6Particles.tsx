import React, { useMemo, useEffect, useRef } from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, HEIGHT, WIDTH } from "../constants";
import { FONT_ANTON, FONT_SPACE_MONO } from "../fonts";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  c: string;
};

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

const PALETTE = [
  COLORS.c1,
  COLORS.c2,
  COLORS.c3,
  COLORS.c4,
  COLORS.c5,
  COLORS.c6,
];

function createInitialParticles(): Particle[] {
  const rnd = mulberry32(73);
  const arr: Particle[] = [];
  for (let i = 0; i < 450; i++) {
    arr.push({
      x: rnd() * WIDTH,
      y: rnd() * HEIGHT,
      vx: (rnd() - 0.5) * 1.6,
      vy: (rnd() - 0.5) * 1.6,
      r: rnd() * 3 + 1,
      c: PALETTE[Math.floor(rnd() * PALETTE.length)],
    });
  }
  return arr;
}

const ParticleField: React.FC = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // To get a stable but evolving pattern that doesn't accumulate state across worker boundaries,
  // we re-simulate from the seed up to the current frame each render. This is O(N * frame) per
  // render — bounded because the scene runs only ~3.6s × 60fps = 216 frames.
  const particles = useMemo(() => {
    const init = createInitialParticles();
    return init.map((p) => ({ ...p }));
  }, []);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Re-simulate from t=0 to current frame.
    const sim: Particle[] = particles.map((p) => ({ ...p }));
    ctx.fillStyle = "rgba(10,5,30,0.18)";
    // Background fill once for trail look (Remotion frames are independent — pure persistence look)
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    for (let f = 0; f <= frame; f++) {
      const t = f / fps;
      const beat = (t * 2.5) % 1;
      const pulse = 1 + Math.sin(beat * Math.PI * 2) * 0.4;
      for (const p of sim) {
        const dx = 640 - p.x;
        const dy = 360 - p.y;
        const d = Math.sqrt(dx * dx + dy * dy) + 0.1;
        p.vx += (dx / d) * 0.04 * pulse + (dy / d) * 0.05;
        p.vy += (dy / d) * 0.04 * pulse - (dx / d) * 0.05;
        p.vx *= 0.96;
        p.vy *= 0.96;
        p.x += p.vx;
        p.y += p.vy;
      }
    }

    // Draw trails: faint persistence by overlaying repeated alpha fills using last-N snapshots.
    // Simpler: clear and draw current positions only.
    const t = frame / fps;
    const beat = (t * 2.5) % 1;
    const pulse = 1 + Math.sin(beat * Math.PI * 2) * 0.4;
    ctx.fillStyle = "rgba(10,5,30,0.6)";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    for (const p of sim) {
      ctx.beginPath();
      ctx.fillStyle = p.c;
      ctx.shadowBlur = 10;
      ctx.shadowColor = p.c;
      ctx.arc(p.x, p.y, p.r * pulse, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
  }, [frame, fps, particles]);

  return (
    <canvas
      ref={ref}
      width={WIDTH}
      height={HEIGHT}
      style={{ position: "absolute", inset: 0 }}
    />
  );
};

const PopLetter: React.FC<{ letter: string; index: number }> = ({ letter, index }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const delay = Math.round(index * (60 / 1000) * fps);
  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 9, stiffness: 160, mass: 1 },
    durationInFrames: Math.round(0.6 * fps),
  });
  const ty = interpolate(progress, [0, 0.6, 1], [60, -15, 0]);
  const scale = interpolate(progress, [0, 0.6, 1], [0.4, 1.1, 1]);
  const opacity = interpolate(progress, [0, 0.4], [0, 1], {
    extrapolateRight: "clamp",
  });
  return (
    <span
      style={{
        display: "inline-block",
        transform: `translateY(${ty}%) scale(${scale})`,
        opacity,
        color: "#fff",
      }}
    >
      {letter}
    </span>
  );
};

export const Scene6Particles: React.FC = () => {
  const text = "PARTICLES";
  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(ellipse at 50% 60%, #1a0540 0%, #000 70%)",
        overflow: "hidden",
      }}
    >
      <ParticleField />
      <AbsoluteFill
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          textAlign: "center",
        }}
      >
        <h3
          style={{
            fontFamily: FONT_ANTON,
            fontSize: 160,
            lineHeight: 0.9,
            letterSpacing: "-2px",
            color: "#fff",
            mixBlendMode: "difference",
            margin: 0,
          }}
        >
          {text.split("").map((c, i) => (
            <PopLetter key={i} letter={c} index={i} />
          ))}
        </h3>
        <p
          style={{
            fontFamily: FONT_SPACE_MONO,
            fontSize: 14,
            letterSpacing: "0.4em",
            color: COLORS.c3,
            textTransform: "uppercase",
            marginTop: 14,
          }}
        >
          thousands of pixels in motion
        </p>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
