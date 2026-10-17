import manifest from "./audio/voice-manifest.json";
import { FPS } from "./theme";

/**
 * Le montage découle du manifeste voix : chaque section dure au moins sa cible,
 * et s'allonge si les répliques + le temps de lecture (≥ 1,2 s) l'exigent.
 */
export type SectionId =
  | "hook"
  | "discover"
  | "menu"
  | "order"
  | "tracking"
  | "kitchen"
  | "manage"
  | "pilot"
  | "closing"
  | "cta";

type Line = (typeof manifest.lines)[number];
const line = (id: string): Line => {
  const l = manifest.lines.find((x) => x.id === id);
  if (!l) throw new Error(`Réplique absente du manifeste : ${id}`);
  return l;
};

export const HOLD = 1.2; // tenue minimale d'un message après son arrivée
export const TRANSITION = 0.6; // durée des masques entre scènes (chevauchement)

/**
 * Plan de montage : pour chaque section, ses répliques et le silence (s) qui
 * précède chacune — la première attend que l'image amorce son mouvement.
 */
const PLAN: { id: SectionId; target: number; tail?: number; cues: { id: string; lead: number }[] }[] = [
  // 1 — accroche : Doumi apparaît, salue, puis pose la question du soir
  {
    id: "hook",
    target: 9,
    cues: [
      { id: "intro", lead: 1.1 },
      { id: "hook", lead: 0.55 },
    ],
  },
  { id: "discover", target: 7.5, cues: [{ id: "discover", lead: 0.5 }] }, // 2 — découvrir
  { id: "menu", target: 7.2, cues: [{ id: "menu", lead: 0.5 }] }, // 3 — la page du restaurant
  {
    id: "order", // 4 — scanner, choisir, commander
    target: 11,
    cues: [
      { id: "order1", lead: 0.6 },
      { id: "order2", lead: 0.5 },
    ],
  },
  { id: "tracking", target: 5.6, cues: [{ id: "tracking", lead: 0.45 }] }, // 5 — suivi en direct
  { id: "kitchen", target: 8.2, cues: [{ id: "kitchen", lead: 0.5 }] }, // 6 — côté restaurant
  { id: "manage", target: 7.6, cues: [{ id: "manage", lead: 0.5 }] }, // 7 — gestion
  { id: "pilot", target: 7.8, cues: [{ id: "pilot", lead: 0.5 }] }, // 8 — pilotage
  { id: "closing", target: 6.4, cues: [{ id: "closing", lead: 0.45 }] }, // 9 — bénéfices
  { id: "cta", target: 9, tail: 1.6, cues: [{ id: "cta", lead: 0.7 }] }, // 10 — logo et signature
];

/** Décalage (s) de chaque réplique dans sa section. */
const offsets: Record<string, number> = {};
const needed: Record<string, number> = {};
for (const s of PLAN) {
  let t = 0;
  let prevEnd = 0;
  for (const c of s.cues) {
    t = prevEnd + c.lead;
    offsets[c.id] = t;
    prevEnd = t + line(c.id).speechEnd;
  }
  needed[s.id] = prevEnd + HOLD + (s.tail ?? 0);
}

export const sections = (() => {
  let t = 0;
  const out = {} as Record<SectionId, { start: number; duration: number; from: number; frames: number }>;
  for (const s of PLAN) {
    const duration = Math.max(s.target, needed[s.id]);
    out[s.id] = { start: t, duration, from: Math.round(t * FPS), frames: Math.round(duration * FPS) };
    t += duration;
  }
  return out;
})();

export const SECTION_ORDER: SectionId[] = PLAN.map((s) => s.id);
export const TOTAL_FRAMES = SECTION_ORDER.reduce((n, id) => n + sections[id].frames, 0);

/** Répliques positionnées dans le temps absolu (frames). */
export type Cue = {
  id: string;
  file: string;
  section: SectionId;
  from: number; // frame absolue de début de l'audio
  frames: number;
  speechEnd: number; // frame absolue de fin de parole
  words: { text: string; at: number; end: number }[]; // frames RELATIVES à la section
  captions: { text: string; at: number }[]; // sous-titres (texte affiché), frames ABSOLUES
};

export const cues: Cue[] = manifest.lines.map((l) => {
  const section = l.section as SectionId;
  const local = offsets[l.id];
  const abs = sections[section].start + local;
  return {
    id: l.id,
    file: l.file,
    section,
    from: Math.round(abs * FPS),
    frames: Math.ceil(l.duration * FPS),
    speechEnd: Math.round((abs + l.speechEnd) * FPS),
    words: l.words.map((w) => ({
      text: w.text,
      at: Math.round((local + w.start) * FPS),
      end: Math.round((local + w.end) * FPS),
    })),
    captions: l.captions.map((c) => ({ text: c.text, at: Math.round((abs + c.start) * FPS) })),
  };
});

export const cue = (id: string) => {
  const c = cues.find((x) => x.id === id);
  if (!c) throw new Error(`Réplique inconnue : ${id}`);
  return c;
};

/** Frame (relative à la section) où un mot est prononcé (`nth` = n-ième occurrence). */
export const wordAt = (cueId: string, word: string, nth = 0) => {
  const matches = cue(cueId).words.filter((w) => w.text.toLowerCase().startsWith(word.toLowerCase()));
  const m = matches[nth];
  if (!m) throw new Error(`Mot « ${word} » introuvable dans ${cueId}`);
  return m.at;
};

/** Frame relative à la section où la réplique commence / finit. */
export const cueStart = (id: string) => cue(id).from - sections[cue(id).section].from;
export const cueEnd = (id: string) => cue(id).speechEnd - sections[cue(id).section].from;

/** Frames de transition (masques) et demi-fenêtre de chevauchement. */
export const T_FRAMES = Math.round(TRANSITION * FPS);
export const HALF = Math.round(T_FRAMES / 2);
