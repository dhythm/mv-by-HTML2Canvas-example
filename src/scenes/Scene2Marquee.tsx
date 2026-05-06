import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../constants";
import { FONT_ANTON, FONT_REGGAE } from "../fonts";

type Row = {
  words: string[];
  top: number;
  color: string;
  background?: string;
  font: "anton" | "reggae";
  fontSize: number;
  durationSec: number;
  reverse: boolean;
  letterSpacing?: string;
};

const ROWS: Row[] = [
  {
    words: ["POP", "KINETIC", "BOLD", "JUICY", "NEON", "SNAP", "FAST", "FRESH"],
    top: 60,
    color: COLORS.ink,
    font: "anton",
    fontSize: 120,
    durationSec: 8,
    reverse: false,
    letterSpacing: "-1px",
  },
  {
    words: ["MOTION", "DESIGN", "REEL", "2026", "LOOP", "INFINITE"],
    top: 220,
    color: COLORS.c1,
    background: COLORS.ink,
    font: "anton",
    fontSize: 120,
    durationSec: 6,
    reverse: true,
    letterSpacing: "-1px",
  },
  {
    words: ["カラフル", "ポップ", "爆速", "リズム", "元気", "色あそび", "最高"],
    top: 380,
    color: COLORS.ink,
    font: "reggae",
    fontSize: 130,
    durationSec: 10,
    reverse: false,
    letterSpacing: "0",
  },
  {
    words: ["HTML2CANVAS", "PIXEL", "SHATTER", "PARTICLES", "TYPE"],
    top: 540,
    color: COLORS.paper,
    background: COLORS.c4,
    font: "anton",
    fontSize: 120,
    durationSec: 5,
    reverse: true,
    letterSpacing: "-1px",
  },
];

const CHIP_COLORS = [
  COLORS.c1,
  COLORS.c3,
  COLORS.c4,
  COLORS.c5,
  COLORS.c6,
  COLORS.ink,
];

const Marquee: React.FC<{ row: Row }> = ({ row }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fontFamily = row.font === "reggae" ? FONT_REGGAE : FONT_ANTON;
  const totalFramesForRoll = row.durationSec * fps;
  const cycle = (frame % totalFramesForRoll) / totalFramesForRoll; // 0..1
  // translateX 0 → -50% (looped)
  const tx = (row.reverse ? cycle : -cycle) * 50;

  const chipsOnce = row.words.map((w, i) => (
    <span
      key={`${w}-${i}`}
      style={{ display: "inline-flex", alignItems: "center", gap: 14 }}
    >
      {w}
      <i
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          background: CHIP_COLORS[i % CHIP_COLORS.length],
          display: "inline-block",
          flex: "none",
        }}
      />
    </span>
  ));

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: row.top,
        height: 140,
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
        fontFamily,
        fontSize: row.fontSize,
        letterSpacing: row.letterSpacing,
        textTransform: "uppercase",
        whiteSpace: "nowrap",
        color: row.color,
        background: row.background,
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 48,
          transform: `translateX(${tx}%)`,
          willChange: "transform",
        }}
      >
        {chipsOnce}
        {chipsOnce}
        {chipsOnce}
      </div>
    </div>
  );
};

export const Scene2Marquee: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: COLORS.c2, overflow: "hidden" }}>
      {ROWS.map((r, i) => (
        <Marquee key={i} row={r} />
      ))}
    </AbsoluteFill>
  );
};
