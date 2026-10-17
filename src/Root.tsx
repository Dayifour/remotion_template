import React from "react";
import { Composition } from "remotion";
import { Presentation, PresentationProps } from "./Presentation";
import { FPS, HEIGHT, WIDTH } from "./theme";
import { TOTAL_FRAMES } from "./timeline";

const defaultProps: PresentationProps = {
  voice: true,
  sfx: true,
  music: true,
  musicSrc: "music/bed.wav",
  musicVolume: 0.45,
  duckDb: -12,
  ctaLabel: "Espace professionnel",
  url: "douminidouman.cloud",
  subtitles: true,
  design: "classique",
};

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="Presentation"
      component={Presentation}
      durationInFrames={TOTAL_FRAMES}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
      defaultProps={defaultProps}
    />
    {/* Même film, design « Nuit » : le thème sombre du site DouminiDouman */}
    <Composition
      id="PresentationNuit"
      component={Presentation}
      durationInFrames={TOTAL_FRAMES}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
      defaultProps={{ ...defaultProps, design: "nuit" as const }}
    />
  </>
);
