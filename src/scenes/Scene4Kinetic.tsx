import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../constants";
import { FONT_ANTON } from "../fonts";

const Stripes: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const period = 3 * fps;
  const pos = ((frame % period) / period) * 60;
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background:
          "repeating-linear-gradient(45deg, transparent 0 30px, rgba(0,0,0,0.08) 30px 60px)",
        backgroundPosition: `${pos}px ${pos}px`,
      }}
    />
  );
};

const SpinShape: React.FC<{
  style: React.CSSProperties;
  durationSec: number;
  fromDeg: number;
  toDeg: number;
}> = ({ style, durationSec, fromDeg, toDeg }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const period = durationSec * fps;
  const t = (frame % period) / period;
  const deg = fromDeg + (toDeg - fromDeg) * t;
  return (
    <div
      style={{
        ...style,
        transform: `rotate(${deg}deg)`,
        position: "absolute",
        willChange: "transform",
      }}
    />
  );
};

const Bounce: React.FC<{ style: React.CSSProperties }> = ({ style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const period = 0.6 * fps;
  const t = (frame % period) / period;
  // ease-in-out: y goes 0 → -60 → 0, scale 1 → 1.1 → 1
  const ease = (Math.sin(t * Math.PI * 2 - Math.PI / 2) + 1) / 2; // 0..1..0
  const y = -60 * ease;
  const scale = 1 + 0.1 * ease;
  return (
    <div
      style={{
        ...style,
        position: "absolute",
        transform: `translateY(${y}px) scale(${scale})`,
        willChange: "transform",
      }}
    />
  );
};

const Shake: React.FC<{ style: React.CSSProperties }> = ({ style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const period = 0.6 * fps; // alternate full cycle = 0.3s + 0.3s
  const t = (frame % period) / period;
  const deg = Math.sin(t * Math.PI * 2) * 8;
  return (
    <div
      style={{
        ...style,
        position: "absolute",
        transform: `rotate(${deg}deg)`,
        willChange: "transform",
      }}
    />
  );
};

const Pulse: React.FC<{ style: React.CSSProperties }> = ({ style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const period = 3.2 * fps;
  const t = (frame % period) / period; // 0..1
  // cubic-bezier(.6,0,.4,1) approximated as smoothstep-ish
  const e = t * t * (3 - 2 * t);
  const scale = 1 + (60 - 1) * e;
  return (
    <div
      style={{
        ...style,
        position: "absolute",
        transform: `translate(-50%, -50%) scale(${scale})`,
        willChange: "transform",
      }}
    />
  );
};

export const Scene4Kinetic: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // BOOM letter pop (entrance)
  const progress = spring({
    frame,
    fps,
    config: { damping: 9, stiffness: 160, mass: 1 },
    durationInFrames: Math.round(0.8 * fps),
  });
  const ty = 0;
  const rot = interpolate(progress, [0, 0.5, 1], [-10, 2, 0]);
  const scale = interpolate(progress, [0, 0.5, 1], [0.4, 1.15, 1]);
  const opacity = interpolate(progress, [0, 0.4], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ background: COLORS.c1, overflow: "hidden" }}>
      <Stripes />

      {/* yellow circle, top-left, slow spin */}
      <SpinShape
        style={{
          left: 80,
          top: 80,
          width: 180,
          height: 180,
          background: COLORS.c2,
          borderRadius: "50%",
        }}
        durationSec={1.8}
        fromDeg={0}
        toDeg={720}
      />

      {/* cyan circle, top-right, bounce */}
      <Bounce
        style={{
          right: 60,
          top: 60,
          width: 240,
          height: 240,
          background: COLORS.c3,
          borderRadius: "50%",
        }}
      />

      {/* purple rounded square, bottom-left, shake */}
      <Shake
        style={{
          left: 60,
          bottom: 60,
          width: 200,
          height: 200,
          background: COLORS.c4,
          borderRadius: 30,
        }}
      />

      {/* green triangle, bottom-right, reverse spin */}
      <SpinShape
        style={{
          right: 120,
          bottom: 90,
          width: 0,
          height: 0,
          borderLeft: "120px solid transparent",
          borderRight: "120px solid transparent",
          borderBottom: `200px solid ${COLORS.c5}`,
        }}
        durationSec={2.2}
        fromDeg={0}
        toDeg={-360}
      />

      {/* center pulse dot */}
      <Pulse
        style={{
          left: "50%",
          top: "50%",
          width: 60,
          height: 60,
          background: COLORS.ink,
          borderRadius: "50%",
        }}
      />

      <AbsoluteFill
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            fontFamily: FONT_ANTON,
            fontSize: 300,
            lineHeight: 0.85,
            color: COLORS.paper,
            letterSpacing: "-6px",
            textAlign: "center",
            mixBlendMode: "difference",
            position: "relative",
            zIndex: 5,
            transform: `scale(${scale}) rotate(${rot}deg) translateY(${ty}px)`,
            opacity,
          }}
        >
          B&nbsp;O&nbsp;O&nbsp;M
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
