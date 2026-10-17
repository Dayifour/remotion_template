// Rend des images fixes de contrôle (début de chaque section + moments clés).
// Usage : node scripts/render-stills.mjs [frame1 frame2 ...]
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import { build } from "esbuild";
import path from "node:path";
import { mkdirSync } from "node:fs";
import { pathToFileURL } from "node:url";

const root = path.resolve(import.meta.dirname, "..");
const outDir = path.join(root, "out", "stills");
mkdirSync(outDir, { recursive: true });

// Lit le montage réel (timeline.ts) pour viser les bonnes frames
const tmp = path.join(root, "out", "timeline.mjs");
await build({ entryPoints: [path.join(root, "src/timeline.ts")], bundle: true, format: "esm", outfile: tmp, platform: "node", logLevel: "error" });
const { sections, TOTAL_FRAMES, HALF, cues } = await import(pathToFileURL(tmp).href);

const args = process.argv.slice(2);
let targets = args.filter((a) => /^\d+$/.test(a)).map((a) => ({ name: `f${a}`, frame: Number(a) }));
if (args.includes("--cues")) {
  // milieu de chaque réplique (vérifie la synchro labiale et les visuels)
  targets = cues.map((c) => ({ name: `cue-${c.id}`, frame: Math.round((c.from + c.speechEnd) / 2) }));
}
if (!targets.length) {
  targets = [];
  for (const [id, s] of Object.entries(sections)) {
    targets.push({ name: `${id}-start`, frame: s.from + HALF + 2 });
    targets.push({ name: `${id}-mid`, frame: s.from + Math.round(s.frames * 0.55) });
    targets.push({ name: `${id}-end`, frame: s.from + s.frames - HALF - 2 });
  }
  Object.entries(sections)
    .slice(1)
    .forEach(([id, s]) => targets.push({ name: `transition-${id}`, frame: s.from }));
}

console.log("Sections :", Object.fromEntries(Object.entries(sections).map(([k, v]) => [k, `${v.start.toFixed(2)}s (${v.duration.toFixed(2)}s)`])));
console.log(`Total : ${TOTAL_FRAMES} frames = ${(TOTAL_FRAMES / 30).toFixed(2)} s`);

const serveUrl = await bundle({ entryPoint: path.join(root, "src/index.ts") });
const compArg = args.find((a) => a.startsWith("--comp="));
const compId = compArg ? compArg.slice(7) : "Presentation";
const composition = await selectComposition({ serveUrl, id: compId });
for (const t of targets) {
  const output = path.join(outDir, `${compId === "Presentation" ? "" : compId + "-"}${t.name}.png`);
  await renderStill({ composition, serveUrl, frame: Math.min(t.frame, TOTAL_FRAMES - 1), output, scale: 0.5 });
  console.log("still", t.name, t.frame);
}
