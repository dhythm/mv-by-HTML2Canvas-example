import React from "react";
import { Composition } from "remotion";
import { PopMotionReel } from "./PopMotionReel";
import { FPS, HEIGHT, TOTAL_FRAMES, WIDTH } from "./constants";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="PopMotionReel"
      component={PopMotionReel}
      durationInFrames={TOTAL_FRAMES}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
    />
  );
};
