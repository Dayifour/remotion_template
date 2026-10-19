// Finitions après rendu.
//   node scripts/finish.mjs master <fichier.mp4…>   son normalisé à -14 LUFS (réseaux sociaux), image copiée
//   node scripts/finish.mjs srt                      out/yelen-sugu-16x9.srt (sous-titres séparés du 16:9)
//   node scripts/finish.mjs short                    out/yelen-sugu-20s.mp4, extrait du 9:16 (brief : panier + notification + logo)
import { spawnSync } from "node:child_process";
import { readFileSync, renameSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const out = (f) => path.join(root, "out", f);
const tl = JSON.parse(readFileSync(path.join(root, "src/audio/timeline.json"), "utf8"));
const ff = (args) => {
  const r = spawnSync("ffmpeg", ["-hide_banner", "-y", ...args], { encoding: "utf8" });
  if (r.status !== 0) throw new Error(r.stderr.slice(-2000));
  return r.stderr;
};
const [cmd, ...files] = process.argv.slice(2);

if (cmd === "master") {
  for (const f of files) {
    const log = ff(["-i", f, "-af", "loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"]);
    const m = JSON.parse(log.slice(log.lastIndexOf("{"), log.lastIndexOf("}") + 1));
    const tmp = f.replace(/\.mp4$/, ".tmp.mp4");
    const af = `loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}:measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true`;
    ff(["-i", f, "-c:v", "copy", "-af", af, "-ar", "48000", "-c:a", "aac", "-b:a", "256k", "-movflags", "+faststart", tmp]);
    renameSync(tmp, f);
    console.log(`master ${path.basename(f)} : ${m.input_i} LUFS -> -14 LUFS`);
  }
}

if (cmd === "srt") {
  // une ligne de sous-titre par proposition (coupée à la ponctuation ou vers 42 caractères)
  const ts = (s) => {
    const ms = Math.max(0, Math.round(s * 1000));
    const p = (n, w = 2) => String(n).padStart(w, "0");
    return `${p(Math.floor(ms / 3600000))}:${p(Math.floor(ms / 60000) % 60)}:${p(Math.floor(ms / 1000) % 60)},${p(ms % 1000, 3)}`;
  };
  const cues = [];
  for (const l of tl.lines) {
    let cur = [];
    l.captions.forEach((w, i) => {
      cur.push(w);
      const len = cur.map((x) => x.text).join(" ").length;
      if (/[.,:;!?…]$/.test(w.text) && len > 14 || len > 42 || i === l.captions.length - 1) {
        cues.push({ start: cur[0].start, end: cur[cur.length - 1].end + 0.4, text: cur.map((x) => x.text).join(" ") });
        cur = [];
      }
    });
  }
  cues.forEach((c, i) => (c.end = Math.min(c.end, cues[i + 1]?.start ?? c.end)));
  writeFileSync(out("yelen-sugu-16x9.srt"), cues.map((c, i) => `${i + 1}\n${ts(c.start)} --> ${ts(c.end)}\n${c.text}\n`).join("\n"), "utf8");
  console.log(`srt : ${cues.length} sous-titres -> out/yelen-sugu-16x9.srt`);
}

if (cmd === "short") {
  // trois extraits coupés sur des premiers temps de mesure : la musique reste en place
  const db = tl.downbeats;
  const at = (n) => db[Math.floor(n)] + (n % 1) * tl.barPeriod;
  const parts = [
    [at(14), at(18)], // panier : « livraison gratuite partout à Bamako »
    [at(22.5), at(27)], // l'équipe confirme, la notification arrive
    [at(40), at(43.5)], // logo, adresse du site
  ];
  const src = out("yelen-sugu-9x16.mp4");
  const inputs = parts.flatMap(([a, b]) => ["-ss", a.toFixed(3), "-t", (b - a).toFixed(3), "-i", src]);
  const n = parts.length;
  const graph =
    parts.map((_, i) => `[${i}:v]setpts=PTS-STARTPTS[v${i}];[${i}:a]asetpts=PTS-STARTPTS,afade=t=in:d=0.03,afade=t=out:st=${(parts[i][1] - parts[i][0] - 0.05).toFixed(3)}:d=0.05[a${i}];`).join("") +
    parts.map((_, i) => `[v${i}][a${i}]`).join("") +
    `concat=n=${n}:v=1:a=1[v][a];[v]fade=t=out:st=${(parts.reduce((s, [a, b]) => s + b - a, 0) - 0.5).toFixed(3)}:d=0.5[vo]`;
  ff([...inputs, "-filter_complex", graph, "-map", "[vo]", "-map", "[a]", "-c:v", "libx264", "-crf", "17", "-preset", "slow", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "256k", "-movflags", "+faststart", out("yelen-sugu-20s.mp4")]);
  console.log(`short : ${parts.reduce((s, [a, b]) => s + b - a, 0).toFixed(1)} s -> out/yelen-sugu-20s.mp4`);
}
