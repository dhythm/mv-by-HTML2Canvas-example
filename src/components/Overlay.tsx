import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { sceneFrameRanges } from "../constants";

const grainSvg = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.6'/></svg>`;

export const Overlay: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Beat flash: pulse at every scene start (sharp cut), and a half-second beat overlay
  const ranges = sceneFrameRanges(fps);
  const sceneStarts = ranges.map((r) => r.start);
  let sceneFlash = 0;
  for (const s of sceneStarts) {
    const dt = frame - s;
    if (dt >= 0 && dt < fps * 0.35) {
      // ease-out from 1 → 0 over 0.35s
      const k = 1 - dt / (fps * 0.35);
      sceneFlash = Math.max(sceneFlash, k);
    }
  }

  // Continuous beat flash every 0.5s, 0.05s decay window
  const beatPeriod = fps * 0.5; // 0.5s
  const beatPos = (frame % beatPeriod) / beatPeriod; // 0..1
  let beatFlash = 0;
  if (beatPos < 0.05 / 0.5) {
    beatFlash = (0.05 / 0.5 - beatPos) * 4;
  }

  const flashOpacity = Math.min(1, sceneFlash + beatFlash);

  // Animated grain: jitter background-position by frame
  const grainShiftX = (frame * 7) % 160;
  const grainShiftY = (frame * 13) % 160;

  return (
    <>
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          zIndex: 54,
          background:
            "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.55) 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          zIndex: 55,
          opacity: 0.18,
          backgroundImage: `url("${grainSvg}")`,
          backgroundPosition: `${grainShiftX}px ${grainShiftY}px`,
          mixBlendMode: "overlay",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          zIndex: 60,
          background: "#fff",
          opacity: flashOpacity,
          mixBlendMode: "overlay",
        }}
      />
    </>
  );
};
