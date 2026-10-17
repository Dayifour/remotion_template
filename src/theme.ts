import { loadFont as loadBricolage } from "@remotion/google-fonts/BricolageGrotesque";
import { loadFont as loadKarla } from "@remotion/google-fonts/Karla";

/**
 * Identité visuelle officielle DouminiDouman (frontend/app/globals.css).
 * Deux tons de scène : « light » (thème clair du site) et « dark » (thème sombre `.dark`).
 */
const light = {
  bg: "#faf9f7", // --canvas
  bgDeep: "#f1efec", // --canvas-deep
  surface: "#ffffff",
  surfaceMuted: "#f5f3f0",
  ink: "#292622",
  inkMuted: "#625c55",
  inkSubtle: "#807970",
  line: "#dedad4",
  brand: "#ff4b00",
  flame: "#ff3d00",
  brandText: "#a83a00",
  brandSoft: "#fff0ea",
  brandLine: "#f4b7a1",
  gold: "#ffcf00",
  goldSoft: "#fff8cf",
  goldText: "#806600",
  cream: "#fff7ef", // --hero-cream
  heroInk: "#1a1410",
  success: "#3f7a24",
  successSoft: "#e5f1dc",
  danger: "#b3262f",
  white: "#ffffff",
  shadow: "rgba(41, 38, 34, 0.14)",
};
type Palette = typeof light;

const dark: Palette = {
  bg: "#171513",
  bgDeep: "#1d1a17",
  surface: "#24201d",
  surfaceMuted: "#2d2824",
  ink: "#f7f4f0",
  inkMuted: "#c4bdb4",
  inkSubtle: "#978f86",
  line: "#3e3833",
  brand: "#ff3d00",
  flame: "#ff3d00",
  brandText: "#ff8a66",
  brandSoft: "#4a2118",
  brandLine: "#8d402c",
  gold: "#ffcf00",
  goldSoft: "#423711",
  goldText: "#ffcf00",
  cream: "#fff7ef",
  heroInk: "#1a1410",
  success: "#7cc35a",
  successSoft: "#22361a",
  danger: "#ff6b6b",
  white: "#ffffff",
  shadow: "rgba(0, 0, 0, 0.45)",
};

/** Couleurs actives — mutées par `applyTone` selon le design et le ton de la scène en cours. */
export const colors: Palette = { ...light };
/** Couleurs de marque fixes (logo, mascotte), indépendantes du design. */
export const brand = Object.freeze({
  orange: "#ff3d00", // tracés du logo
  orangeUi: "#ff4b00", // boutons du site
  yellow: "#ffcf00",
  cream: "#fff7ef",
  ink: "#292622",
  night: "#171513",
});

export type Design = "classique" | "nuit";
/** « brand » = manchette orange de l'accueil (identique dans les deux designs). */
export type Tone = "light" | "dark" | "brand";
const palettes: Record<Design, Record<Tone, Palette>> = {
  classique: { light, dark, brand: light },
  nuit: { light: dark, dark, brand: light },
};

export const { fontFamily: displayFont } = loadBricolage("normal", {
  weights: ["500", "600", "700", "800"],
  subsets: ["latin", "latin-ext"],
});
export const { fontFamily: fontFamily } = loadKarla("normal", {
  weights: ["400", "500", "600", "700", "800"],
  subsets: ["latin", "latin-ext"],
});

let design: Design = "classique";
let tone: Tone = "light";
export const currentDesign = () => design;
export const currentTone = () => tone;
export const setDesign = (d: Design) => {
  design = d;
};
export const applyTone = (t: Tone) => {
  tone = t;
  Object.assign(colors, palettes[design][t]);
};
/** Le ton effectif de la scène (le design « nuit » assombrit les scènes claires). */
export const isDark = () => palettes[design][tone] === dark;

/** Fond de scène ; `focus` = centre du halo chaud. */
export const sceneBg = (t: Tone, focus = "50% 50%") => {
  if (t === "brand") {
    return `radial-gradient(1100px 760px at ${focus}, #ff7a1f 0%, transparent 70%), linear-gradient(135deg, #ff4b00 0%, #ff5a00 55%, #ff7a12 100%)`;
  }
  if (palettes[design][t] === dark) {
    return `radial-gradient(900px 640px at ${focus}, rgba(255,61,0,0.16), transparent 70%), radial-gradient(800px 560px at 8% 96%, rgba(255,207,0,0.08), transparent 70%), linear-gradient(160deg, #1d1a17 0%, #171513 60%, #110f0d 100%)`;
  }
  return `radial-gradient(900px 640px at ${focus}, rgba(255,75,0,0.07), transparent 70%), radial-gradient(700px 520px at 6% 94%, rgba(255,207,0,0.12), transparent 70%), linear-gradient(160deg, #faf9f7 0%, #f5f3f0 60%, #f1efec 100%)`;
};

export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;
