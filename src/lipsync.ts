import { useMemo } from "react";
import { getWaveformPortion, MediaUtilsAudioData, useAudioData } from "@remotion/media-utils";
import { staticFile } from "remotion";
import { FPS } from "./theme";
import { cues } from "./timeline";

/**
 * Synchronisation labiale de Doumi : on lit l'amplitude réelle de chaque
 * réplique (une valeur par frame), puis on applique une attaque rapide et un
 * relâchement doux pour que la bouche « articule ».
 */
const envelope = (data: MediaUtilsAudioData, frames: number) => {
  const raw = getWaveformPortion({
    audioData: data,
    startTimeInSeconds: 0,
    durationInSeconds: frames / FPS,
    numberOfSamples: frames,
  }).map((b) => b.amplitude);
  const out: number[] = [];
  let prev = 0;
  for (const v of raw) {
    const gated = Math.max(0, (v - 0.1) / 0.75); // coupe le souffle / le silence
    const shaped = Math.min(1, Math.pow(gated, 0.8));
    prev = shaped > prev ? shaped : prev * 0.55 + shaped * 0.45;
    out.push(prev);
  }
  return out;
};

export const useTalk = () => {
  // la liste des répliques est statique : l'ordre des hooks est stable
  const datas = cues.map((c) => useAudioData(staticFile(c.file))); // eslint-disable-line react-hooks/rules-of-hooks
  const ready = datas.every(Boolean);
  const envelopes = useMemo(
    () => (ready ? cues.map((c, i) => envelope(datas[i]!, c.frames)) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ready],
  );
  return (frame: number) => {
    if (!envelopes) return 0;
    const i = cues.findIndex((c) => frame >= c.from && frame < c.from + c.frames);
    if (i < 0) return 0;
    return envelopes[i][frame - cues[i].from] ?? 0;
  };
};
