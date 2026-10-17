import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame } from "remotion";
import { AudioLayers, AudioOptions } from "./AudioLayers";
import { Subtitles } from "./components/Kit";
import { Mask, SceneShell, ToneGate, WIPE_SLANT } from "./components/Scene";
import { DoumiTrack, PLACES } from "./DoumiTrack";
import { easeInOut, mix, progress } from "./ease";
import { Closing } from "./scenes/Closing";
import { Cta, CTA_CENTER } from "./scenes/Cta";
import { Discover } from "./scenes/Discover";
import { Hook } from "./scenes/Hook";
import { Kitchen } from "./scenes/Kitchen";
import { Manage } from "./scenes/Manage";
import { Menu } from "./scenes/Menu";
import { Order, PHONE } from "./scenes/Order";
import { Pilot } from "./scenes/Pilot";
import { Tracking } from "./scenes/Tracking";
import { brand, Design, HEIGHT, setDesign, Tone, WIDTH } from "./theme";
import { HALF, sections, SectionId, T_FRAMES } from "./timeline";

export type PresentationProps = AudioOptions & {
  ctaLabel: string;
  url: string;
  subtitles: boolean;
  /** « classique » (thème clair du site) ou « nuit » (thème sombre du site). */
  design: Design;
};

// Ton de chaque scène : clair, sombre, ou manchette orange (le design « nuit » assombrit les scènes claires)
const TONES: Record<SectionId, Tone> = {
  hook: "brand",
  discover: "light",
  menu: "light",
  order: "light",
  tracking: "light",
  kitchen: "dark",
  manage: "light",
  pilot: "dark",
  closing: "brand",
  cta: "light",
};

// Transitions : masques et raccords plutôt que des fondus
const MASKS: Record<SectionId, Mask> = {
  hook: { kind: "none" },
  // iris qui s'ouvre depuis Doumi : il « emmène » le spectateur
  discover: { kind: "iris", x: PLACES.hook.x, y: PLACES.hook.y - 160 },
  menu: { kind: "wipe" },
  order: { kind: "iris", x: 1500, y: 500 },
  // raccord : l'écran du téléphone s'ouvre sur le suivi de commande
  tracking: { kind: "rect", x: PHONE.x + 14, y: PHONE.y + 14, w: PHONE.w - 28, h: PHONE.h - 28, r: 44 },
  kitchen: { kind: "wipe" },
  manage: { kind: "iris", x: 1545, y: 300 },
  pilot: { kind: "wipe" },
  closing: { kind: "iris", x: PLACES.pilot.x, y: PLACES.pilot.y - 160 },
  // iris qui s'ouvre sur le cœur du logo
  cta: { kind: "iris", ...CTA_CENTER },
};

const SCENES: { id: SectionId; el: (p: PresentationProps) => React.ReactNode }[] = [
  { id: "hook", el: () => <Hook /> },
  { id: "discover", el: () => <Discover /> },
  { id: "menu", el: () => <Menu /> },
  { id: "order", el: () => <Order /> },
  { id: "tracking", el: () => <Tracking /> },
  { id: "kitchen", el: () => <Kitchen /> },
  { id: "manage", el: () => <Manage /> },
  { id: "pilot", el: () => <Pilot /> },
  { id: "closing", el: () => <Closing /> },
  { id: "cta", el: (p) => <Cta ctaLabel={p.ctaLabel} url={p.url} /> },
];

/** Liserés accompagnant les masques (anneau d'iris, bord du balayage, contour du raccord). */
const TransitionAccents: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
      {SCENES.slice(1).map(({ id }, i) => {
        const f = frame - (sections[id].from - HALF);
        if (f < 0 || f > T_FRAMES) return null;
        const p = progress(f, 0, T_FRAMES, easeInOut);
        const fade = 1 - progress(f, T_FRAMES * 0.6, T_FRAMES * 0.4, easeInOut);
        const mask = MASKS[id];
        const accent = i % 2 ? brand.yellow : brand.orange;
        if (mask.kind === "iris") {
          const r = p * Math.hypot(WIDTH, HEIGHT);
          return (
            <div
              key={id}
              style={{
                position: "absolute",
                left: mask.x - r,
                top: mask.y - r,
                width: r * 2,
                height: r * 2,
                borderRadius: "50%",
                border: `${mix(p, 16, 4)}px solid ${accent}`,
                boxSizing: "border-box",
                opacity: fade,
              }}
            />
          );
        }
        if (mask.kind === "wipe") {
          const e = mix(p, -WIPE_SLANT, WIDTH + WIPE_SLANT);
          const band = 28;
          return (
            <div
              key={id}
              style={{
                position: "absolute",
                inset: 0,
                background: `linear-gradient(90deg, ${brand.yellow}, ${brand.orange})`,
                clipPath: `polygon(${e + WIPE_SLANT}px 0px, ${e + WIPE_SLANT + band}px 0px, ${e - WIPE_SLANT + band}px ${HEIGHT}px, ${e - WIPE_SLANT}px ${HEIGHT}px)`,
              }}
            />
          );
        }
        if (mask.kind === "rect") {
          // contour qui suit exactement le rectangle du masque
          const left = mix(p, mask.x, 0);
          const top = mix(p, mask.y, 0);
          const right = mix(p, WIDTH - (mask.x + mask.w), 0);
          const bottom = mix(p, HEIGHT - (mask.y + mask.h), 0);
          return (
            <div
              key={id}
              style={{
                position: "absolute",
                left,
                top,
                width: WIDTH - left - right,
                height: HEIGHT - top - bottom,
                borderRadius: mix(p, mask.r, 0),
                border: `${mix(p, 7, 2)}px solid ${brand.orange}`,
                boxSizing: "border-box",
                opacity: fade,
              }}
            />
          );
        }
        return null;
      })}
    </>
  );
};

export const Presentation: React.FC<PresentationProps> = (props) => {
  setDesign(props.design);
  return (
    <AbsoluteFill style={{ background: brand.night }}>
      {SCENES.map(({ id, el }) => {
        const s = sections[id];
        return (
          <Sequence key={id} name={id} from={s.from - HALF} durationInFrames={s.frames + T_FRAMES}>
            <SceneShell mask={MASKS[id]} frames={s.frames} tone={TONES[id]}>
              {el(props)}
            </SceneShell>
          </Sequence>
        );
      })}
      <ToneGate tone="dark">
        <TransitionAccents />
        <DoumiTrack allDark={props.design === "nuit"} />
        {props.subtitles && <Subtitles />}
      </ToneGate>
      <AudioLayers {...props} />
    </AbsoluteFill>
  );
};
