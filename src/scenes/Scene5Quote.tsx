import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../constants";
import { FONT_SPACE_MONO, FONT_ZEN_KAKU } from "../fonts";

type Word = { text: string; color?: string };

const WORDS: Word[] = [
  { text: "動きは" },
  { text: "感情", color: COLORS.c2 },
  { text: "を" },
  { text: "運ぶ", color: COLORS.c1 },
  { text: "。", color: COLORS.c3 },
];

const AnimatedWord: React.FC<{ word: Word; index: number }> = ({ word, index }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Match: delay 200 + index*220 ms, duration 500ms, ease cubic-bezier(.2,.9,.2,1)
  const startFrame = Math.round(((200 + index * 220) / 1000) * fps);
  const durFrames = Math.round(0.5 * fps);

  const local = frame - startFrame;
  const t = interpolate(local, [0, durFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // approximate cubic-bezier(.2,.9,.2,1) with smoothstep-ish out
  const eased = 1 - Math.pow(1 - t, 3);

  const opacity = eased;
  const ty = (1 - eased) * 40;
  const rotX = (1 - eased) * -90;

  return (
    <span
      style={{
        display: "inline-block",
        margin: "0 0.05em",
        opacity,
        transform: `translateY(${ty}px) rotateX(${rotX}deg)`,
        transformOrigin: "bottom",
        textShadow: "6px 6px 0 rgba(0,0,0,0.4)",
        color: word.color,
      }}
    >
      {word.text}
    </span>
  );
};

export const Scene5Quote: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const capOpacity = interpolate(
    frame,
    [Math.round(1.5 * fps), Math.round(2.1 * fps)],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill style={{ background: "#000", color: "#fff", overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 20% 30%, rgba(255,46,99,0.4), transparent 40%), radial-gradient(circle at 80% 70%, rgba(8,217,214,0.4), transparent 40%)",
          filter: "blur(20px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "repeating-linear-gradient(0deg, transparent 0 3px, rgba(255,255,255,0.04) 3px 4px)",
        }}
      />

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
            fontFamily: FONT_ZEN_KAKU,
            fontWeight: 900,
            fontSize: 180,
            lineHeight: 0.95,
            letterSpacing: "-0.02em",
            textAlign: "center",
            maxWidth: 1200,
          }}
        >
          {WORDS.map((w, i) => (
            <AnimatedWord key={i} word={w} index={i} />
          ))}
        </div>
        <div
          style={{
            marginTop: 28,
            fontFamily: FONT_SPACE_MONO,
            fontSize: 14,
            letterSpacing: "0.4em",
            color: "#888",
            textTransform: "uppercase",
            opacity: capOpacity,
          }}
        >
          — motion is the carrier of feeling —
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
