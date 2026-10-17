import React from "react";
import { Html5Audio, interpolate, Sequence, staticFile } from "remotion";
import { LANDINGS, POP_IN } from "./DoumiTrack";
import { cues, HALF, SECTION_ORDER, sections, TOTAL_FRAMES, wordAt } from "./timeline";

export type AudioOptions = {
  voice: boolean;
  sfx: boolean;
  music: boolean;
  /** Piste musicale (dans /public). Remplacez music/bed.wav par votre morceau. */
  musicSrc: string;
  musicVolume: number;
  /** Atténuation de la musique sous la voix, en dB. */
  duckDb: number;
};

const dbToGain = (db: number) => Math.pow(10, db / 20);
const ATTACK = 6; // frames
const RELEASE = 12;

/** Enveloppe de ducking : 1 quand une voix parle, 0 sinon, avec attaque/relâche easées. */
export const duckAmount = (frame: number) => {
  let d = 0;
  for (const c of cues) {
    const v = interpolate(frame, [c.from - ATTACK, c.from, c.speechEnd, c.speechEnd + RELEASE], [0, 1, 1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    d = Math.max(d, v);
  }
  // lissage (courbe en S) pour éviter tout « pompage » audible
  return d * d * (3 - 2 * d);
};

const Sfx: React.FC<{ at: number; src: string; volume: number }> = ({ at, src, volume }) => (
  <Sequence from={Math.max(0, at)} durationInFrames={60} layout="none">
    <Html5Audio src={staticFile(src)} volume={volume} />
  </Sequence>
);

/** Frame absolue d'un mot prononcé. */
const abs = (cueId: string, word: string, nth = 0) => {
  const c = cues.find((x) => x.id === cueId)!;
  return sections[c.section].from + wordAt(cueId, word, nth);
};

export const AudioLayers: React.FC<AudioOptions> = ({ voice, sfx, music, musicSrc, musicVolume, duckDb }) => {
  const duckGain = dbToGain(duckDb);
  // un whoosh par coupe (alternance plein / doux)
  const whooshes = SECTION_ORDER.slice(1).map((id, i) => ({
    at: sections[id].from - HALF - 8,
    src: i % 2 ? "sfx/whoosh.wav" : "sfx/whoosh-soft.wav",
  }));
  // « tic » discret : épingles de la carte de Bamako, bénéfices, ajouts au panier
  const ticks = [
    ...[0, 4, 8, 12].map((d) => abs("discover", "restaurants") + d),
    ...["visibles", "rapide", "reviennent"].map((x) => abs("closing", x) - 6),
    abs("order1", "choisit") + 2,
    abs("order1", "plats") + 2,
  ];

  return (
    <>
      {voice &&
        cues.map((c) => (
          <Sequence key={c.id} from={c.from} durationInFrames={c.frames + 2} layout="none">
            <Html5Audio src={staticFile(c.file)} volume={1} />
          </Sequence>
        ))}

      {sfx && (
        <>
          {whooshes.map((w) => (
            <Sfx key={w.at} at={w.at} src={w.src} volume={0.5} />
          ))}
          <Sfx at={POP_IN - 1} src="sfx/pop.wav" volume={0.7} />
          {LANDINGS.map((l) => (
            <Sfx key={l} at={l - 1} src="sfx/pop.wav" volume={0.25} />
          ))}
          {ticks.map((t) => (
            <Sfx key={t} at={t} src="sfx/tick.wav" volume={0.5} />
          ))}
          {/* le QR code est lu, la commande part, la cuisine est notifiée */}
          <Sfx at={abs("order1", "code") + 2} src="sfx/scan.wav" volume={0.55} />
          <Sfx at={abs("order1", "commande") + 6} src="sfx/success.wav" volume={0.5} />
          <Sfx at={abs("kitchen", "notification") - 4} src="sfx/ding.wav" volume={0.6} />
          <Sfx at={abs("cta", "Doumini") - 4} src="sfx/success.wav" volume={0.4} />
        </>
      )}

      {music && (
        <Html5Audio
          src={staticFile(musicSrc)}
          volume={(f) => {
            const fade = interpolate(f, [0, 20, TOTAL_FRAMES - 45, TOTAL_FRAMES], [0, 1, 1, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            const duck = 1 - duckAmount(f) * (1 - duckGain);
            return musicVolume * fade * duck;
          }}
        />
      )}
    </>
  );
};
