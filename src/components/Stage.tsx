import React from "react";
import { AbsoluteFill } from "remotion";
import { COLORS } from "../constants";

export const Stage: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AbsoluteFill style={{ background: COLORS.bg, overflow: "hidden" }}>
      {children}
    </AbsoluteFill>
  );
};
