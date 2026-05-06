import React from "react";
import { Sequence, useVideoConfig } from "remotion";
import { Stage } from "./components/Stage";
import { Hud } from "./components/Hud";
import { Overlay } from "./components/Overlay";
import { sceneFrameRanges } from "./constants";
import { Scene1Intro } from "./scenes/Scene1Intro";
import { Scene2Marquee } from "./scenes/Scene2Marquee";
import { Scene3Shatter } from "./scenes/Scene3Shatter";
import { Scene4Kinetic } from "./scenes/Scene4Kinetic";
import { Scene5Quote } from "./scenes/Scene5Quote";
import { Scene6Particles } from "./scenes/Scene6Particles";
import { Scene7Poster } from "./scenes/Scene7Poster";
import { Scene8Outro } from "./scenes/Scene8Outro";

const SCENE_COMPONENTS = {
  s1: Scene1Intro,
  s2: Scene2Marquee,
  s3: Scene3Shatter,
  s4: Scene4Kinetic,
  s5: Scene5Quote,
  s6: Scene6Particles,
  s7: Scene7Poster,
  s8: Scene8Outro,
} as const;

export const PopMotionReel: React.FC = () => {
  const { fps } = useVideoConfig();
  const ranges = sceneFrameRanges(fps);

  return (
    <Stage>
      {ranges.map((r) => {
        const Component = SCENE_COMPONENTS[r.id];
        return (
          <Sequence
            key={r.id}
            from={r.start}
            durationInFrames={r.duration}
            layout="none"
          >
            <Component />
          </Sequence>
        );
      })}
      <Hud />
      <Overlay />
    </Stage>
  );
};
