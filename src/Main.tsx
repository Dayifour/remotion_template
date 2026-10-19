import React from "react";
import { AbsoluteFill, Html5Audio, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Captions, Flash, Grain, useVertical } from "./components/Fx";
import { Cart } from "./scenes/Cart";
import { Confirm } from "./scenes/Confirm";
import { Cta } from "./scenes/Cta";
import { Hook } from "./scenes/Hook";
import { Pay } from "./scenes/Pay";
import { Reveal } from "./scenes/Reveal";
import { Shop } from "./scenes/Shop";
import { Track } from "./scenes/Track";
import { WhatsApp } from "./scenes/WhatsApp";
import { Web } from "./scenes/Web";
import { SFX } from "./sfx";
import { SceneId, SCENES } from "./timing";

export type MainProps = { subtitles: boolean; sfx: boolean; music: boolean };

const COMPONENTS: Record<SceneId, React.FC> = {
  hook: Hook,
  reveal: Reveal,
  web: Web,
  shop: Shop,
  cart: Cart,
  whatsapp: WhatsApp,
  confirm: Confirm,
  track: Track,
  pay: Pay,
  cta: Cta,
};

const IN = 9; // frames d'entrée (la scène suivante arrive pendant que la précédente sort)
const OUT = 9;

/**
 * Raccord « zoom-through » : la scène sortante accélère vers la caméra en se floutant,
 * l'entrante arrive de loin et se met au point — toujours sur un premier temps.
 */
const SceneWrap: React.FC<{ id: SceneId; from: number; to: number; first: boolean; last: boolean }> = ({ id, from, to, first, last }) => {
  const f = useCurrentFrame();
  if (f < from - (first ? 0 : IN) || f >= to + (last ? 0 : OUT)) return null;
  const Comp = COMPONENTS[id];
  // l'entrée « hook → reveal » est un iris géré par la scène elle-même
  const custom = id === "reveal";
  const pin = first || custom ? 1 : interpolate(f, [from - IN, from + 2], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const pout = last ? 0 : interpolate(f, [to - 2, to + OUT], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const ease = (x: number) => 1 - Math.pow(1 - x, 3);
  const a = ease(pin);
  const b = pout * pout;
  const scale = (0.86 + 0.14 * a) * (1 + b * 0.35);
  const blur = (1 - a) * 18 + b * 22;
  return (
    <AbsoluteFill style={{ transform: `scale(${scale})`, filter: blur > 0.3 ? `blur(${blur}px)` : undefined, opacity: Math.min(1, a * 1.4) * (1 - b) }}>
      <Comp />
    </AbsoluteFill>
  );
};

export const Main: React.FC<MainProps> = ({ subtitles, sfx, music }) => {
  const v = useVertical();
  const ids = Object.keys(SCENES) as SceneId[];
  return (
    <AbsoluteFill style={{ background: "#0b1020" }}>
      {ids.map((id, i) => (
        <SceneWrap key={id} id={id} from={SCENES[id][0]} to={SCENES[id][1]} first={i === 0} last={i === ids.length - 1} />
      ))}
      {ids.slice(2).map((id) => (
        <Flash key={id} at={SCENES[id][0]} strength={0.35} />
      ))}
      <Flash at={SCENES.reveal[0]} strength={0.9} />
      <Grain />
      {subtitles && <Captions bottom={v ? 330 : 70} size={v ? 54 : 44} />}
      {music && <Html5Audio src={staticFile("audio/mix.wav")} />}
      {sfx &&
        SFX.map((s, i) => (
          <Sequence key={i} from={Math.max(0, s.at)} durationInFrames={60} layout="none">
            <Html5Audio src={staticFile(s.src)} volume={s.vol} />
          </Sequence>
        ))}
    </AbsoluteFill>
  );
};
