import React from "react";
import { Composition } from "remotion";
import { Main, MainProps } from "./Main";
import { FPS } from "./theme";
import { DURATION } from "./timing";

const defaults: MainProps = { subtitles: true, sfx: true, music: true };

export const RemotionRoot: React.FC = () => (
  <>
    {/* Format principal : vertical 9:16 (Statut WhatsApp, Facebook, TikTok) — sous-titres incrustés */}
    <Composition id="YelenSugu" component={Main} durationInFrames={DURATION} fps={FPS} width={1080} height={1920} defaultProps={defaults} />
    {/* Remontage 16:9 pour le site — sous-titres en fichier séparé (out/yelen-sugu-16x9.srt) */}
    <Composition id="YelenSugu16x9" component={Main} durationInFrames={DURATION} fps={FPS} width={1920} height={1080} defaultProps={{ ...defaults, subtitles: false }} />
  </>
);
