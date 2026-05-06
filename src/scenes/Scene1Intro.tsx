import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../constants";
import { FONT_ANTON, FONT_SPACE_MONO } from "../fonts";

const LETTERS: { ch: string; color: string }[] = [
  { ch: "P", color: COLORS.paper },
  { ch: "O", color: COLORS.c2 },
  { ch: "P", color: COLORS.c1 },
  { ch: "!", color: COLORS.paper },
];

const Letter: React.FC<{ index: number; letter: { ch: string; color: string } }> = ({
  index,
  letter,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // each letter delayed
  const localDelay = Math.round(index * (90 / 1000) * fps);
  const f = frame - localDelay;
  const progress = spring({
    frame: f,
    fps,
    config: { damping: 9, stiffness: 160, mass: 1 },
    durationInFrames: Math.round(0.9 * fps),
  });

  // Match keyframes:
  //  0%  → translateY(120%)  rotate(-30deg) scale(.4) opacity 0
  //  55% → translateY(-20%)  rotate(8deg)   scale(1.15)
  //  100%→ translateY(0)     rotate(0)      scale(1)
  const ty = interpolate(progress, [0, 0.55, 1], [120, -20, 0]);
  const rot = interpolate(progress, [0, 0.55, 1], [-30, 8, 0]);
  const scale = interpolate(progress, [0, 0.55, 1], [0.4, 1.15, 1]);
  const opacity = interpolate(progress, [0, 0.4], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <span
      style={{
        display: "inline-block",
        transformOrigin: "50% 50%",
        transform: `translateY(${ty}%) rotate(${rot}deg) scale(${scale})`,
        opacity,
        color: letter.color,
      }}
    >
      {letter.ch}
    </span>
  );
};

const Blob: React.FC<{
  left?: number | string;
  top?: number | string;
  right?: number | string;
  bottom?: number | string;
  size: number;
  color: string;
}> = ({ left, top, right, bottom, size, color }) => (
  <div
    style={{
      position: "absolute",
      left,
      top,
      right,
      bottom,
      width: size,
      height: size,
      borderRadius: "50%",
      background: color,
      filter: "blur(40px)",
      opacity: 0.7,
    }}
  />
);

export const Scene1Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // animated grid
  const gridPos = (frame * (40 / fps)) % 40;

  // sub fade in
  const subProgress = interpolate(
    frame,
    [Math.round(0.6 * fps), Math.round(1.4 * fps)],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill
      style={{
        background: "radial-gradient(ellipse at 30% 30%, #2a1058 0%, #0e0c1f 60%)",
        overflow: "hidden",
      }}
    >
      {/* grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          backgroundPosition: `${gridPos}px ${gridPos}px`,
        }}
      />

      <Blob left={-100} top={-100} size={500} color={COLORS.c1} />
      <Blob right={-120} bottom={-120} size={600} color={COLORS.c3} />
      <Blob right="30%" top="10%" size={300} color={COLORS.c2} />

      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontFamily: FONT_ANTON,
            fontSize: 240,
            lineHeight: 0.85,
            color: COLORS.paper,
            letterSpacing: "-2px",
          }}
        >
          {LETTERS.map((l, i) => (
            <React.Fragment key={i}>
              <Letter index={i} letter={l} />
              {i === 2 ? " " : null}
            </React.Fragment>
          ))}
        </div>

        <div
          style={{
            marginTop: 8,
            fontFamily: FONT_SPACE_MONO,
            fontSize: 14,
            color: COLORS.c2,
            textTransform: "uppercase",
            opacity: subProgress,
            letterSpacing: `${interpolate(subProgress, [0, 1], [0, 0.4])}em`,
          }}
        >
          a kinetic motion reel · 30s loop
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
