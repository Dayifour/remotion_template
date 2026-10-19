import { loadFont } from "@remotion/google-fonts/Geist";

/** Identité Yelen Sugu (brief, « Identité visuelle »). Le jaune est banni, sauf les étoiles de notation. */
export const C = {
  brand: "#ff5000",
  brandDeep1: "#f03e00",
  brandDeep2: "#c72e00",
  brandSoft: "#fff4ed",
  green: "#10a37f",
  greenSoft: "#e7f6f1",
  wa: "#25D366",
  waDark: "#075e54",
  ink: "#0f172a",
  gray: "#64748b",
  line: "#e2e8f0",
  bg: "#f8fafc",
  white: "#ffffff",
  // thème sombre de l'application Android (captures)
  appBg: "#1c1c1e",
  appCard: "#232325",
  appLine: "#34343a",
  appText: "#f4f4f5",
  appMuted: "#94a3b8",
  appBrand: "#e53b00",
  night: "#0b1020",
};

const { fontFamily } = loadFont("normal", { weights: ["400", "500", "600", "700", "800", "900"], subsets: ["latin", "latin-ext"] });
export const font = fontFamily;

export const FPS = 30;

/** Montants en FCFA, sans décimales, espace fine comme séparateur de milliers. */
export const fcfa = (n: number) => `${Math.round(n).toLocaleString("fr-FR").replace(/\s/g, " ")} FCFA`;

/** Données de la démonstration (compte de démo, adresse générique — brief, « Contraintes de tournage »). */
export const DEMO = {
  client: "Aminata Diarra",
  phone: "+223 •• •• •• ••",
  city: "ACI 2000",
  address: "ACI 2000, rue 240",
  order: "YL-2908",
  shopPhone: "+223 92 83 97 88",
  site: "yelen-sugu.com",
  products: [
    { id: "galaxy-a55", name: "Smartphone Galaxy A55", price: 185000, img: "products/galaxy-a55.jpg", cat: "Smartphones" },
    { id: "ecouteurs", name: "Écouteurs Bluetooth Pro", price: 25000, img: "products/ecouteurs.jpg", cat: "Audio" },
    { id: "clavier", name: "Clavier sans fil", price: 18500, img: "products/clavier.jpg", cat: "Accessoires" },
    { id: "souris", name: "Souris sans fil", price: 7500, img: "products/souris.jpg", cat: "Accessoires" },
  ],
};
