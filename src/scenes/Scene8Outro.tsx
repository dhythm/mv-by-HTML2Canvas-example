import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../constants";
import { FONT_ANTON, FONT_SPACE_MONO } from "../fonts";

const Rays: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const period = 8 * fps;
  const deg = ((frame % period) / period) * 360;
  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        width: 1800,
        height: 1800,
        transform: `translate(-50%, -50%) rotate(${deg}deg)`,
        background:
          `repeating-conic-gradient(from 0deg, ${COLORS.c2} 0deg 12deg, transparent 12deg 24deg)`,
        opacity: 0.15,
      }}
    />
  );
};

export const Scene8Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Title pop
  const titleProgress = spring({
    frame,
    fps,
    config: { damping: 9, stiffness: 160, mass: 1 },
    durationInFrames: Math.round(0.7 * fps),
  });
  const tScale = interpolate(titleProgress, [0, 0.55, 1], [0.5, 1.1, 1]);
  const tRot = interpolate(titleProgress, [0, 0.55, 1], [-6, 2, 0]);
  const tOpacity = interpolate(titleProgress, [0, 0.4], [0, 1], {
    extrapolateRight: "clamp",
  });

  const subOpacity = interpolate(
    frame,
    [Math.round(0.6 * fps), Math.round(1.2 * fps)],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const ctaProgress = spring({
    frame: frame - Math.round(0.9 * fps),
    fps,
    config: { damping: 9, stiffness: 160, mass: 1 },
    durationInFrames: Math.round(0.5 * fps),
  });
  const ctaY = interpolate(ctaProgress, [0, 1], [20, 0]);
  const ctaOpacity = interpolate(ctaProgress, [0, 0.4], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ background: COLORS.ink, overflow: "hidden" }}>
      <Rays />
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
            fontSize: 220,
            lineHeight: 0.85,
            letterSpacing: "-2px",
            textAlign: "center",
            color: COLORS.paper,
            position: "relative",
            zIndex: 3,
            transform: `scale(${tScale}) rotate(${tRot}deg)`,
            opacity: tOpacity,
          }}
        >
          <span>THANK</span> <span style={{ color: COLORS.c2 }}>YOU</span>
          <br />
          <span style={{ color: COLORS.c1 }}>SEE</span>{" "}
          <span style={{ color: COLORS.c3 }}>YOU</span>
        </div>
        <div
          style={{
            fontFamily: FONT_SPACE_MONO,
            fontSize: 14,
            letterSpacing: "0.4em",
            color: COLORS.paper,
            textTransform: "uppercase",
            marginTop: 20,
            position: "relative",
            zIndex: 3,
            opacity: subOpacity,
          }}
        >
          ▶ looping back to scene 01 ...
        </div>
        <div
          style={{
            marginTop: 24,
            display: "inline-flex",
            gap: 10,
            fontFamily: FONT_SPACE_MONO,
            fontSize: 12,
            letterSpacing: "0.3em",
            color: COLORS.ink,
            background: COLORS.c2,
            padding: "10px 18px",
            borderRadius: 999,
            textTransform: "uppercase",
            position: "relative",
            zIndex: 3,
            transform: `translateY(${ctaY}px)`,
            opacity: ctaOpacity,
          }}
        >
          PRESS ↻ TO REPLAY
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
