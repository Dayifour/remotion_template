import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { easeInOut, mix, progress } from "../ease";
import { HALF, T_FRAMES } from "../timeline";
import { applyTone, HEIGHT, Tone, WIDTH } from "../theme";

/** Frame relative au début « officiel » de la section (0 = coupe). */
export const useSceneFrame = () => useCurrentFrame() - HALF;

export type Mask =
  | { kind: "none" }
  | { kind: "iris"; x: number; y: number }
  | { kind: "rect"; x: number; y: number; w: number; h: number; r: number }
  | { kind: "wipe" };

const DIAG = Math.hypot(WIDTH, HEIGHT);
export const WIPE_SLANT = 340;

/** Géométrie du masque d'entrée pour une progression p (0..1). */
export const maskClip = (mask: Mask, p: number): string | undefined => {
  if (mask.kind === "none" || p >= 1) return undefined;
  if (mask.kind === "iris") return `circle(${p * DIAG}px at ${mask.x}px ${mask.y}px)`;
  if (mask.kind === "rect") {
    const top = mix(p, mask.y, 0);
    const left = mix(p, mask.x, 0);
    const right = mix(p, WIDTH - (mask.x + mask.w), 0);
    const bottom = mix(p, HEIGHT - (mask.y + mask.h), 0);
    return `inset(${top}px ${right}px ${bottom}px ${left}px round ${mix(p, mask.r, 0)}px)`;
  }
  const e = mix(p, -WIPE_SLANT, WIDTH + WIPE_SLANT);
  return `polygon(0px 0px, ${e + WIPE_SLANT}px 0px, ${e - WIPE_SLANT}px ${HEIGHT}px, 0px ${HEIGHT}px)`;
};

/**
 * Applique la palette du ton donné avant de rendre ses enfants. React rend les
 * sous-arbres dans l'ordre, en profondeur : chaque scène lit donc ses propres couleurs.
 */
export const ToneGate: React.FC<{ tone: Tone; children: React.ReactNode }> = ({ tone, children }) => {
  applyTone(tone);
  return <>{children}</>;
};

/**
 * Enveloppe de scène : masque d'entrée (la scène suivante se découvre au-dessus
 * de la précédente) + léger zoom de profondeur en entrée comme en sortie.
 */
export const SceneShell: React.FC<{ mask: Mask; frames: number; tone: Tone; children: React.ReactNode }> = ({
  mask,
  frames,
  tone,
  children,
}) => {
  const f = useCurrentFrame();
  const pin = mask.kind === "none" ? 1 : progress(f, 0, T_FRAMES, easeInOut);
  const pout = progress(f, frames, T_FRAMES, easeInOut);
  const scale = mix(pin, 1.06, 1) * mix(pout, 1, 1.05);
  return (
    <AbsoluteFill style={{ clipPath: maskClip(mask, pin), overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${scale})` }}>
        <ToneGate tone={tone}>{children}</ToneGate>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
