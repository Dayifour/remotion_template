import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { basePose, Doumi, DoumiPose } from "./components/Doumi";
import { easeInOut, pop } from "./ease";
import { useTalk } from "./lipsync";
import { FPS } from "./theme";
import { cue, cueEnd, cueStart, HALF, SECTION_ORDER, sections, SectionId, TOTAL_FRAMES, wordAt } from "./timeline";

/**
 * Piste d'animation de Doumi, narrateur du film. Il vit sur un calque
 * persistant au-dessus des scènes et assure la continuité à travers les coupes.
 * Les gestes sont décrits séquence par séquence avec de petits « verbes »
 * (pointer, présenter, réfléchir, saluer…) qui posent des images-clés easées.
 */

type Key = [number, number];

/** Interpolation easée entre images-clés (frames absolues). */
const track = (frame: number, keys: Key[], easing = easeInOut) => {
  const sorted = [...keys].sort((a, b) => a[0] - b[0]);
  const xs: number[] = [];
  const ys: number[] = [];
  for (const [x, y] of sorted) {
    if (xs.length && x <= xs[xs.length - 1]) continue; // images-clés strictement croissantes
    xs.push(x);
    ys.push(y);
  }
  if (xs.length === 1) return ys[0];
  return interpolate(frame, xs, ys, { easing, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
};

const S = (id: SectionId) => sections[id].from;
/** Frames absolues : mot prononcé, début et fin d'une réplique. */
const w = (cueId: string, word: string, nth = 0) => S(cue(cueId).section) + wordAt(cueId, word, nth);
const cs = (id: string) => S(cue(id).section) + cueStart(id);
const ce = (id: string) => S(cue(id).section) + cueEnd(id);

type Place = { x: number; y: number; s: number };
// Emplacements (pieds) — l'accueil est centré, puis Doumi laisse la place au contenu
export const PLACES: Record<SectionId | "intro", Place> = {
  intro: { x: 960, y: 900, s: 1.45 },
  hook: { x: 1000, y: 1010, s: 0.86 },
  discover: { x: 140, y: 1012, s: 0.76 },
  menu: { x: 175, y: 1012, s: 0.78 },
  order: { x: 1700, y: 1012, s: 0.8 },
  tracking: { x: 1030, y: 1012, s: 0.8 },
  kitchen: { x: 1690, y: 1012, s: 0.82 },
  manage: { x: 1730, y: 1012, s: 0.8 },
  pilot: { x: 1700, y: 1012, s: 0.8 },
  closing: { x: 1735, y: 1012, s: 0.85 },
  cta: { x: 1610, y: 990, s: 1.0 },
};

type Hop = { from: Place; to: Place; start: number; end: number };
const HOPS: Hop[] = [
  // dans la séquence 1 : du centre vers sa place quand la question arrive
  { from: PLACES.intro, to: PLACES.hook, start: cs("hook") - 16, end: cs("hook") + 6 },
  ...SECTION_ORDER.slice(1).map((id, i) => ({
    from: PLACES[SECTION_ORDER[i]],
    to: PLACES[id],
    start: S(id) - HALF - 2,
    end: S(id) + HALF + 6,
  })),
];
export const POP_IN = 8; // apparition de Doumi (frame absolue)
export const LANDINGS = HOPS.map((h) => h.end);

const blinkAt = (frame: number) => {
  // clignement toutes les ~3,2 s, décalé pour ne pas sembler mécanique
  const phase = (frame + 23) % 97;
  const extra = (frame + 23) % 211;
  const curve = [0, 0.6, 1, 0.6, 0];
  if (phase < 5) return curve[phase];
  if (extra >= 40 && extra < 45) return curve[extra - 40];
  return 0;
};

// ---------------------------------------------------------------------------
// Chorégraphie (calculée une fois)
const REST = { arm: 14, elbow: 8 };
type Arm = { arm: Key[]; elbow: Key[] };
const L: Arm = { arm: [[0, REST.arm]], elbow: [[0, REST.elbow]] };
const R: Arm = { arm: [[0, REST.arm]], elbow: [[0, REST.elbow]] };
const look = { x: [[0, 0]] as Key[], y: [[0, 0]] as Key[] };
const face = {
  browL: [[0, 0]] as Key[],
  browR: [[0, 0]] as Key[],
  smile: [[0, 0.8]] as Key[],
  eyeOpen: [[0, 1]] as Key[],
  mouthOpen: [[0, 0]] as Key[],
};
const hat: Key[] = [[0, 0]];
const bounces: number[] = [];
const waves: [number, number][] = [];

/** Tient une pose d'un bras entre deux instants, avec entrée/sortie easées. */
const pose = (side: Arm, from: number, to: number, arm: number, elbow: number, ease = 8) => {
  side.arm.push([from - ease, REST.arm], [from, arm], [to, arm], [to + ease + 2, REST.arm]);
  side.elbow.push([from - ease, REST.elbow], [from, elbow], [to, elbow], [to + ease + 2, REST.elbow]);
};
const pointRight = (from: number, to: number) => pose(R, from, to, 100, -8);
const pointLeft = (from: number, to: number) => pose(L, from, to, 100, -8);
const handsOpen = (from: number, to: number) => {
  pose(L, from, to, 58, 62);
  pose(R, from, to, 58, 62);
};
const thinking = (from: number, to: number) => pose(R, from, to, 8, -118);
const handOnHeart = (from: number, to: number) => pose(L, from, to, 12, -78);
const wave = (from: number, to: number) => {
  pose(R, from, to, 150, 22, 10);
  waves.push([from, to]);
};
/** Coup de toque : la toque se soulève, puis se repose avec un petit rebond. */
const hatTip = (from: number, to: number) => {
  hat.push([from - 8, 0], [from + 4, 1], [to, 1], [to + 8, -0.08], [to + 13, 0]);
};
/** Geste de présentation (bras qui s'ouvre vers le contenu) + petit saut. */
const present = (side: Arm, at: number) => {
  side.arm.push([at - 5, 60], [at + 5, 128], [at + 24, 104], [at + 40, REST.arm]);
  side.elbow.push([at - 5, 10], [at + 5, -8], [at + 24, 0], [at + 40, REST.elbow]);
  bounces.push(at);
};
const lookAt = (from: number, to: number, x: number, y = 0) => {
  look.x.push([from - 6, 0], [from, x], [to, x], [to + 8, 0]);
  look.y.push([from - 6, 0], [from, y], [to, y], [to + 8, 0]);
};
const expr = (from: number, to: number, e: { brow?: number; smile?: number; eye?: number; mouth?: number }) => {
  const k = (arr: Key[], v: number, base: number) => arr.push([from - 6, base], [from, v], [to, v], [to + 8, base]);
  if (e.brow !== undefined) {
    k(face.browL, e.brow, 0);
    k(face.browR, e.brow, 0);
  }
  if (e.smile !== undefined) k(face.smile, e.smile, 0.8);
  if (e.eye !== undefined) k(face.eyeOpen, e.eye, 1);
  if (e.mouth !== undefined) k(face.mouthOpen, e.mouth, 0);
};

// 1 — accueil : coup de toque sur « Bonjour », salut de la main, main sur le cœur ; puis se pose la question
hatTip(w("intro", "Bonjour") - 4, w("intro", "Moi") + 2);
wave(POP_IN + 12, w("intro", "Moi") - 2);
handOnHeart(w("intro", "Moi") + 2, ce("intro") + 4);
bounces.push(w("intro", "Doumini"));
lookAt(cs("hook") + 6, w("hook", "Quel") - 2, -1, -0.3);
thinking(w("hook", "Quel") - 2, ce("hook") + 10);
expr(w("hook", "Quel"), ce("hook") + 8, { brow: 0.6, smile: 0.35 });
lookAt(w("hook", "Quel"), ce("hook") + 8, 0.8, -0.6);

// 2 — découvrir : montre la recherche et la carte de Bamako
pointRight(w("discover", "montre") - 2, w("discover", "Bamako") + 12);
lookAt(w("discover", "montre"), ce("discover"), 1, -0.2);
bounces.push(w("discover", "Bamako"));
expr(w("discover", "prix") - 2, ce("discover") + 6, { smile: 1 });

// 3 — la page du restaurant : présente la page, s'émerveille des photos
pointRight(w("menu", "page") - 2, w("menu", "plats") + 10);
lookAt(cs("menu"), ce("menu"), 1, -0.3);
expr(w("menu", "photos") - 2, w("menu", "photos") + 16, { mouth: 0.7, eye: 1.2, brow: 0.6 });
bounces.push(w("menu", "avis"));

// 4 — commander : désigne le téléphone, se réjouit de l'envoi ; mains ouvertes sur « sans compte »
pointLeft(w("order1", "scanne") - 3, w("order1", "commande") + 8);
lookAt(w("order1", "scanne"), ce("order1") + 6, -1, -0.1);
bounces.push(w("order1", "commande") + 6);
handsOpen(w("order2", "Sans") - 2, w("order2", "installer") + 10);
present(L, w("order2", "espèces") - 4);
lookAt(w("order2", "Sans"), ce("order2"), -0.8, -0.2);

// 5 — suivi : suit les étapes de la commande, ravi à « l'assiette »
pointLeft(w("tracking", "suivi") - 2, w("tracking", "direct") + 8);
lookAt(cs("tracking"), ce("tracking") + 6, -1, -0.2);
bounces.push(w("tracking", "l'assiette"));
expr(w("tracking", "l'assiette") - 2, ce("tracking") + 12, { smile: 1, eye: 1.1 });

// 6 — côté restaurant : surpris par la notification, montre la commande qui avance
pointLeft(w("kitchen", "commande") - 2, w("kitchen", "réel") + 10);
lookAt(cs("kitchen"), ce("kitchen"), -1, -0.3);
expr(w("kitchen", "notification") - 3, w("kitchen", "notification") + 14, { brow: 0.8, eye: 1.25, mouth: 0.45 });
present(L, w("kitchen", "avancer") - 4);

// 7 — gestion : présente l'apparence, les QR codes, l'équipe
present(L, w("manage", "l'apparence") - 4);
present(L, w("manage", "imprime") - 4);
present(L, w("manage", "invite") - 4);
lookAt(cs("manage"), ce("manage"), -1, -0.3);

// 8 — pilotage : désigne les chiffres, puis mains ouvertes sur « plusieurs établissements »
pointLeft(w("pilot", "ventes") - 2, w("pilot", "visibilité") + 12);
lookAt(cs("pilot"), ce("pilot"), -1, -0.2);
handsOpen(w("pilot", "plusieurs") - 2, ce("pilot") + 8);
expr(w("pilot", "plusieurs"), ce("pilot") + 8, { smile: 1 });

// 9 — bénéfices : présente chaque carte
lookAt(cs("closing"), ce("closing") + 10, -1, -0.3);
present(L, w("closing", "visibles") - 6);
present(L, w("closing", "rapide") - 4);
present(L, w("closing", "reviennent") - 4);
expr(w("closing", "reviennent"), ce("closing") + 10, { smile: 1, eye: 1.1 });

// 10 — conclusion : mains ouvertes sur la signature, puis coup de toque et salut jusqu'à la fin
lookAt(cs("cta"), w("cta", "Rendez") - 4, -1, -0.4);
handsOpen(w("cta", "Bamako") - 2, w("cta", "commande", 0) + 12);
hatTip(w("cta", "Rendez") - 2, TOTAL_FRAMES - 14);
wave(w("cta", "Rendez") + 4, TOTAL_FRAMES - 6);

export const poseAt = (f: number, talk: number, allDark = false): DoumiPose => {
  const p: DoumiPose = { ...basePose };

  // ---------- position / échelle ----------
  const xKeys: Key[] = [[0, PLACES.intro.x]];
  const yKeys: Key[] = [[0, PLACES.intro.y]];
  const sKeys: Key[] = [[0, PLACES.intro.s]];
  for (const h of HOPS) {
    xKeys.push([h.start, h.from.x], [h.end, h.to.x]);
    yKeys.push([h.start, h.from.y], [h.end, h.to.y]);
    sKeys.push([h.start, h.from.s], [h.end, h.to.s]);
  }
  p.x = track(f, xKeys);
  p.y = track(f, yKeys);
  p.scale = track(f, sKeys);

  // arc de saut + écrasement/étirement (anticipation → étirement → réception)
  let squash = 1;
  let shadow = 1;
  for (const h of HOPS) {
    if (f >= h.start && f <= h.end) {
      const e = easeInOut((f - h.start) / (h.end - h.start));
      p.y -= Math.sin(Math.PI * e) * 120;
      shadow = 1 - Math.sin(Math.PI * e) * 0.7;
    }
    if (f > h.start - 8 && f < h.end + 14) {
      squash *= track(f, [
        [h.start - 7, 1],
        [h.start, 0.84],
        [h.start + 5, 1.12],
        [h.end - 4, 1.05],
        [h.end + 1, 0.86],
        [h.end + 7, 1.04],
        [h.end + 12, 1],
      ]);
    }
  }

  // ---------- apparition : ombre d'abord (anticipation), puis pop avec dépassement ----------
  const s = pop(f, POP_IN, 9, 190);
  const velocity = s - pop(f - 1, POP_IN, 9, 190);
  const appear = f < POP_IN ? 0 : s;
  p.scale *= Math.max(0, appear);
  p.y += (1 - Math.min(1, appear)) * 90;
  squash *= f < POP_IN ? 1 : 1 + Math.max(-0.2, Math.min(0.3, velocity * 3.2));
  shadow *= track(f, [
    [0, 0],
    [POP_IN, 0.9],
    [POP_IN + 10, 1],
  ]);
  p.opacity = f < POP_IN ? 0 : 1;

  // respiration (boucle continue) + petit rebond quand il parle
  squash *= 1 + 0.012 * Math.sin((f / FPS) * Math.PI * 1.1) + talk * 0.022;
  p.tilt = 1.4 * Math.sin((f / FPS) * Math.PI * 0.7);

  // petits sauts d'enthousiasme
  for (const c of bounces) {
    if (f < c - 8 || f > c + 18) continue;
    p.y -= track(f, [
      [c - 4, 0],
      [c + 3, 18],
      [c + 11, 0],
    ]);
    squash *= track(f, [
      [c - 6, 1],
      [c - 2, 0.91],
      [c + 3, 1.06],
      [c + 11, 0.96],
      [c + 16, 1],
    ]);
  }

  // ---------- visage ----------
  p.lookX = track(f, look.x);
  p.lookY = track(f, look.y);
  p.browL = track(f, face.browL);
  p.browR = track(f, face.browR);
  p.smile = track(f, face.smile);
  p.eyeOpen = track(f, face.eyeOpen);
  p.mouthOpen = track(f, face.mouthOpen);

  // ---------- toque ----------
  p.hatLift = track(f, hat);
  p.hatTilt = 3 * Math.sin((f / FPS) * Math.PI * 0.9 + 0.6) * (1 - Math.min(1, Math.abs(p.hatLift)));

  // ---------- bras ----------
  p.armL = track(f, L.arm);
  p.elbowL = track(f, L.elbow);
  p.armR = track(f, R.arm);
  p.elbowR = track(f, R.elbow);
  for (const [from, to] of waves) {
    if (f < from || f > to) continue;
    const env = track(f, [
      [from, 0],
      [from + 10, 1],
      [to - 10, 1],
      [to, 0],
    ]);
    p.elbowR += env * 26 * Math.sin(((f - from) / FPS) * Math.PI * 2 * 1.5);
  }

  // halo sur fonds sombres
  const DARK: SectionId[] = ["kitchen", "pilot"];
  const glowKeys: Key[] = [];
  for (const id of SECTION_ORDER) {
    const v = DARK.includes(id) || (allDark && id !== "hook" && id !== "closing") ? 1 : 0;
    glowKeys.push([S(id) - HALF, glowKeys.length ? glowKeys[glowKeys.length - 1][1] : v], [S(id) + HALF, v]);
  }
  p.glow = track(f, glowKeys);

  p.talk = talk;
  p.squash = squash;
  p.shadow = shadow;
  const landing = LANDINGS.find((l) => f >= l && f < l + 5);
  const landingBlink = landing !== undefined ? [0, 0.6, 1, 0.6, 0][f - landing] : 0;
  p.blink = p.eyeOpen > 1.15 ? 0 : Math.max(blinkAt(f), landingBlink);
  return p;
};

export const DoumiTrack: React.FC<{ allDark?: boolean }> = ({ allDark = false }) => {
  const frame = useCurrentFrame();
  const talkAt = useTalk();
  return <Doumi pose={poseAt(frame, talkAt(frame), allDark)} size={330} />;
};
