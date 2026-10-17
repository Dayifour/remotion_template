import { Easing, interpolate, spring } from "remotion";
import { FPS } from "./theme";

// Courbes maison : tout est easé, rien de linéaire hors boucles continues.
export const easeOut = Easing.bezier(0.16, 1, 0.3, 1); // expo-out doux, entrées
export const easeInOut = Easing.bezier(0.65, 0, 0.35, 1); // transitions / masques
export const easeIn = Easing.bezier(0.55, 0, 0.8, 0.2); // sorties

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** 0 → 1 easé entre deux instants (en frames). */
export const progress = (frame: number, start: number, duration: number, easing = easeOut) =>
  interpolate(frame, [start, start + duration], [0, 1], { ...clamp, easing });

export const mix = (p: number, from: number, to: number) => from + (to - from) * p;

/** Ressort avec dépassement (overshoot) — pour les apparitions. */
export const pop = (frame: number, start: number, damping = 11, stiffness = 170) =>
  spring({ frame: frame - start, fps: FPS, config: { damping, stiffness, mass: 0.9 } });

export const sec = (s: number) => Math.round(s * FPS);
