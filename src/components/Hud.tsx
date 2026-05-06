import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { FONT_SPACE_MONO } from "../fonts";
import { SCENES, TOTAL_FRAMES, sceneFrameRanges } from "../constants";

const baseHud: React.CSSProperties = {
  position: "absolute",
  fontFamily: FONT_SPACE_MONO,
  fontSize: 12,
  letterSpacing: "0.1em",
  color: "#fff",
  mixBlendMode: "difference",
  zIndex: 50,
  pointerEvents: "none",
};

export const Hud: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const ranges = sceneFrameRanges(fps);
  const active = ranges.find(
    (r) => frame >= r.start && frame < r.start + r.duration
  ) ?? ranges[ranges.length - 1];
  const sceneIdx = SCENES.findIndex((s) => s.id === active.id);

  const seconds = Math.min(frame / fps, TOTAL_FRAMES / fps);
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(Math.floor(seconds % 60)).padStart(2, "0");

  // REC dot blinks once per second
  const dotOn = Math.floor(frame / (fps / 2)) % 2 === 0;

  return (
    <>
      <div
        style={{
          ...baseHud,
          left: 24,
          top: 20,
          display: "flex",
          gap: 18,
          alignItems: "center",
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "#ff2e63",
            opacity: dotOn ? 1 : 0,
            display: "inline-block",
          }}
        />
        <span>REC</span>
        <span>{`${mm}:${ss} / 00:30`}</span>
        <span>● 1280×720</span>
        <span>● 60FPS</span>
      </div>

      <div
        style={{
          ...baseHud,
          right: 24,
          top: 20,
          letterSpacing: "0.15em",
        }}
      >
        {`SCENE ${String(sceneIdx + 1).padStart(2, "0")} / 08`}
      </div>

      <div
        style={{
          ...baseHud,
          left: 24,
          bottom: 20,
          fontSize: 11,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
        }}
      >
        {active.label}
      </div>

      <div
        style={{
          position: "absolute",
          left: 24,
          right: 24,
          bottom: 14,
          height: 2,
          background: "rgba(255,255,255,0.15)",
          zIndex: 49,
          pointerEvents: "none",
        }}
      >
        <i
          style={{
            display: "block",
            height: "100%",
            width: `${Math.min(100, (frame / TOTAL_FRAMES) * 100)}%`,
            background: "#fff",
            mixBlendMode: "difference",
          }}
        />
      </div>
    </>
  );
};
