export const FPS = 60;
export const WIDTH = 1280;
export const HEIGHT = 720;

export const COLORS = {
  bg: "#0e0c1f",
  c1: "#ff2e63",
  c2: "#ffd23f",
  c3: "#08d9d6",
  c4: "#7c3aed",
  c5: "#22c55e",
  c6: "#ff7a00",
  paper: "#fff7ec",
  ink: "#0e0c1f",
} as const;

export type SceneId = "s1" | "s2" | "s3" | "s4" | "s5" | "s6" | "s7" | "s8";

export type SceneSpec = {
  id: SceneId;
  durationSec: number;
  label: string;
};

export const SCENES: readonly SceneSpec[] = [
  { id: "s1", durationSec: 3.2, label: "INTRO ▸ TITLE" },
  { id: "s2", durationSec: 3.4, label: "TYPE ▸ MARQUEE" },
  { id: "s3", durationSec: 4.6, label: "HTML2CANVAS ▸ SHATTER" },
  { id: "s4", durationSec: 3.2, label: "GEO ▸ KINETIC" },
  { id: "s5", durationSec: 3.6, label: "QUOTE ▸ TYPEWRITER" },
  { id: "s6", durationSec: 3.6, label: "PARTICLE ▸ FIELD" },
  { id: "s7", durationSec: 4.6, label: "HTML2CANVAS ▸ POSTER" },
  { id: "s8", durationSec: 3.8, label: "OUTRO ▸ LOOP" },
] as const;

export const TOTAL_SECONDS = SCENES.reduce((s, x) => s + x.durationSec, 0);
export const TOTAL_FRAMES = Math.round(TOTAL_SECONDS * FPS);

export function sceneFrameRanges(fps: number): {
  id: SceneId;
  start: number;
  duration: number;
  label: string;
}[] {
  let acc = 0;
  return SCENES.map((s) => {
    const duration = Math.round(s.durationSec * fps);
    const start = acc;
    acc += duration;
    return { id: s.id, start, duration, label: s.label };
  });
}
