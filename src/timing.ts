import tl from "./audio/timeline.json";
import { Easing, interpolate, spring } from "remotion";
import { FPS } from "./theme";

/**
 * Tout le montage découle de src/audio/timeline.json (scripts/build_audio.py) :
 * les mesures du beat et l'instant exact de chaque mot de la voix off.
 */
export const DURATION = Math.round(tl.duration * FPS);
export const BAR = tl.barPeriod * FPS; // frames par mesure
export const BEAT = BAR / 4;

/** Frame absolue du début de la mesure n (n peut être fractionnaire : 4.5 = 3e temps). */
export const bar = (n: number) => {
  const i = Math.floor(n);
  const a = tl.downbeats[i];
  const b = tl.downbeats[i + 1] ?? a + tl.barPeriod;
  return Math.round((a + (n - i) * (b - a)) * FPS);
};

export type Line = (typeof tl.lines)[number];
export const lines = tl.lines;
export const line = (id: string) => {
  const l = tl.lines.find((x) => x.id === id);
  if (!l) throw new Error(`Réplique inconnue : ${id}`);
  return l;
};
export const lineStart = (id: string) => Math.round(line(id).start * FPS);
export const lineEnd = (id: string) => Math.round(line(id).end * FPS);

/** Frame absolue où un mot est prononcé (préfixe, sans accents ni casse). */
const plain = (s: string) =>
  s
    .replace(/^(l|d|qu|j|n|s|c)['’]/i, "") // élisions : « l'équipe » se cherche « équipe »
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
export const word = (id: string, w: string, nth = 0) => {
  const m = line(id).words.filter((x) => plain(x.text).startsWith(plain(w)))[nth];
  if (!m) throw new Error(`Mot « ${w} » introuvable dans ${id}`);
  return Math.round(m.start * FPS);
};

/** Découpage en scènes, calé sur les mesures (le drop tombe à la mesure 4). */
export const SCENES = {
  hook: [0, bar(4)],
  reveal: [bar(4), bar(6)],
  web: [bar(6), bar(10)],
  shop: [bar(10), bar(14)],
  cart: [bar(14), bar(18)],
  whatsapp: [bar(18), bar(22)],
  confirm: [bar(22), bar(28)],
  track: [bar(28), bar(36)],
  pay: [bar(36), bar(40)],
  cta: [bar(40), DURATION],
} as const;
export type SceneId = keyof typeof SCENES;

// ——— courbes ———
export const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
export const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);
export const easeIn = Easing.bezier(0.55, 0, 0.8, 0.2);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const prog = (f: number, start: number, dur: number, easing = easeOut) =>
  interpolate(f, [start, start + dur], [0, 1], { ...clamp, easing });
export const mix = (p: number, a: number, b: number) => a + (b - a) * p;
export const pop = (f: number, start: number, damping = 12, stiffness = 180) =>
  spring({ frame: f - start, fps: FPS, config: { damping, stiffness, mass: 0.8 } });

/** Pulsation sur chaque temps (1 au temps, décroît ensuite) — fait respirer l'image avec le beat. */
export const beatPulse = (f: number, every = 1) => {
  const len = BEAT * every;
  const ph = ((f - bar(0)) % len + len) % len;
  return Math.exp(-ph / (len * 0.22));
};
