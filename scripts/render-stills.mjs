// Images de contrôle. Usage : node scripts/render-stills.mjs <Composition> <frame> [frame…]
// Sortie : out/stills/<Composition>-<frame>.jpg (demi-résolution)
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "node:path";
import { mkdirSync } from "node:fs";

const root = path.resolve(import.meta.dirname, "..");
const outDir = path.join(root, "out", "stills");
mkdirSync(outDir, { recursive: true });
const [compId = "YelenSugu", ...frames] = process.argv.slice(2);
const serveUrl = await bundle({ entryPoint: path.join(root, "src/index.ts") });
const composition = await selectComposition({ serveUrl, id: compId });
for (const fr of frames.map(Number)) {
  const output = path.join(outDir, `${compId}-${fr}.jpg`);
  await renderStill({ composition, serveUrl, frame: Math.min(fr, composition.durationInFrames - 1), output, scale: 0.5, imageFormat: "jpeg", jpegQuality: 85 });
  console.log("ok", output);
}
