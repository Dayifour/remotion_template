import React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import { C, font, FPS } from "../theme";
import { beatPulse, easeOut, lines, mix, prog } from "../timing";

export const useVertical = () => {
  const { width, height } = useVideoConfig();
  return height > width;
};

/** Fond clair « studio » : halos orange qui dérivent lentement, grille fine, respiration sur le beat. */
export const StudioBg: React.FC<{ tint?: string; dark?: boolean }> = ({ tint = C.brand, dark }) => {
  const f = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const t = f / FPS;
  const pulse = beatPulse(f, 4);
  const base = dark ? "radial-gradient(130% 90% at 50% 0%, #1a2136 0%, #0b1020 60%, #05070f 100%)" : "radial-gradient(120% 80% at 50% 10%, #ffffff 0%, #f8fafc 55%, #eef2f7 100%)";
  return (
    <AbsoluteFill style={{ background: base, overflow: "hidden" }}>
      {[0, 1, 2].map((i) => {
        const x = width * (0.2 + 0.6 * ((Math.sin(t * 0.21 + i * 2.1) + 1) / 2));
        const y = height * (0.15 + 0.7 * ((Math.cos(t * 0.17 + i * 1.7) + 1) / 2));
        const r = Math.max(width, height) * (0.42 + i * 0.08);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x - r / 2,
              top: y - r / 2,
              width: r,
              height: r,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${i === 1 && !dark ? "rgba(16,163,127,0.10)" : hexA(tint, dark ? 0.22 : 0.16 + pulse * 0.03)} 0%, transparent 65%)`,
            }}
          />
        );
      })}
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(${dark ? "rgba(255,255,255,0.035)" : "rgba(15,23,42,0.035)"} 1px, transparent 1px), linear-gradient(90deg, ${dark ? "rgba(255,255,255,0.035)" : "rgba(15,23,42,0.035)"} 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
          backgroundPosition: `${(t * 6) % 60}px ${(t * 10) % 60}px`,
          maskImage: "radial-gradient(70% 60% at 50% 45%, #000 0%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(70% 60% at 50% 45%, #000 0%, transparent 100%)",
        }}
      />
    </AbsoluteFill>
  );
};

export const hexA = (hex: string, a: number) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
};

/** Grain de film léger + vignette : donne de la matière à l'image (rendu « caméra »). */
export const Grain: React.FC<{ amount?: number; vignette?: number }> = ({ amount = 0.05, vignette = 0.22 }) => {
  const f = useCurrentFrame();
  const seed = Math.floor(f / 2) % 8;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, opacity: amount, mixBlendMode: "overlay" }}>
        <filter id={`g${seed}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={seed} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#g${seed})`} />
      </svg>
      <AbsoluteFill style={{ background: `radial-gradient(110% 80% at 50% 50%, transparent 55%, rgba(0,0,0,${vignette}) 100%)` }} />
    </AbsoluteFill>
  );
};

/** Particules lumineuses (poussière dans la lumière) — profondeur sur les fonds sombres et orange. */
export const Dust: React.FC<{ count?: number; color?: string; opacity?: number }> = ({ count = 40, color = "#fff", opacity = 0.5 }) => {
  const f = useCurrentFrame();
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {Array.from({ length: count }).map((_, i) => {
        const s = 2 + random(`s${i}`) * 5;
        const x = (random(`x${i}`) * width + f * (random(`vx${i}`) - 0.5) * 1.2 + width) % width;
        const y = (random(`y${i}`) * height - f * (0.4 + random(`vy${i}`) * 1.4) + height * 10) % height;
        const tw = 0.4 + 0.6 * Math.abs(Math.sin(f / 20 + i));
        return <div key={i} style={{ position: "absolute", left: x, top: y, width: s, height: s, borderRadius: s, background: color, opacity: opacity * tw * random(`o${i}`), filter: `blur(${s > 5 ? 1.5 : 0}px)` }} />;
      })}
    </AbsoluteFill>
  );
};

/** Titre cinétique : chaque mot monte derrière un masque, à son instant (frame absolue). */
export const Kinetic: React.FC<{
  words: { t: string; at: number; color?: string }[];
  size: number;
  style?: React.CSSProperties;
  align?: "left" | "center";
  out?: number; // frame de sortie
  weight?: number;
  color?: string;
}> = ({ words, size, style, align = "center", out, weight = 800, color = C.ink }) => {
  const f = useCurrentFrame();
  const o = out !== undefined ? prog(f, out, 10) : 0;
  return (
    <div style={{ fontFamily: font, fontSize: size, fontWeight: weight, letterSpacing: -size * 0.035, lineHeight: 1.06, textAlign: align, color, ...style }}>
      {words.map((w, i) => {
        const p = prog(f, w.at, 14, easeOut);
        if (w.t === "\n") return <br key={i} />;
        return (
          <span key={i} style={{ display: "inline-block", overflow: "hidden", verticalAlign: "top", padding: "0.06em 0.04em 0.14em", margin: "-0.06em -0.04em -0.14em" }}>
            <span
              style={{
                display: "inline-block",
                color: w.color ?? color,
                transform: `translateY(${mix(p, 110, 0) + o * -110}%) rotate(${mix(p, 7, 0)}deg)`,
                transformOrigin: "0 100%",
              }}
            >
              {w.t}
              {i < words.length - 1 && words[i + 1].t !== "\n" ? " " : ""}
            </span>
          </span>
        );
      })}
    </div>
  );
};

/** Sous-titres incrustés (lisibles sans le son) : groupes de mots, mot prononcé en orange. */
type Chunk = { words: { text: string; start: number; end: number }[]; start: number; end: number };
const CHUNKS: Chunk[] = (() => {
  const out: Chunk[] = [];
  for (const l of lines) {
    let cur: Chunk | null = null;
    l.captions.forEach((w, i) => {
      if (!cur) cur = { words: [], start: w.start, end: w.end };
      cur.words.push(w);
      cur.end = w.end;
      const len = cur.words.reduce((n, x) => n + x.text.length + 1, 0);
      const brk = /[.,:;!?…]$/.test(w.text) || len > 22 || i === l.captions.length - 1;
      if (brk) {
        out.push(cur);
        cur = null;
      }
    });
  }
  out.forEach((c, i) => {
    const next = out[i + 1];
    c.end = Math.min(c.end + 0.35, next ? next.start : c.end + 0.35);
  });
  return out;
})();

export const Captions: React.FC<{ bottom: number; size?: number }> = ({ bottom, size = 50 }) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const c = CHUNKS.find((x) => t >= x.start - 0.05 && t < x.end);
  if (!c) return null;
  const inP = prog(f, Math.round((c.start - 0.05) * FPS), 6);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: 0, right: 0, bottom, display: "flex", justifyContent: "center" }}>
        <div
          style={{
            maxWidth: "86%",
            padding: `${size * 0.22}px ${size * 0.42}px`,
            borderRadius: size * 0.36,
            background: "rgba(15,23,42,0.86)",
            backdropFilter: "blur(10px)",
            fontFamily: font,
            fontSize: size,
            fontWeight: 800,
            letterSpacing: -size * 0.015,
            lineHeight: 1.2,
            textAlign: "center",
            color: "#fff",
            boxShadow: "0 12px 30px rgba(15,23,42,0.25)",
            transform: `translateY(${mix(inP, 18, 0)}px) scale(${mix(inP, 0.94, 1)})`,
            opacity: inP,
          }}
        >
          {c.words.map((w, i) => {
            const on = t >= w.start - 0.03;
            const now = t >= w.start - 0.03 && t < w.end + 0.05;
            return (
              <span key={i} style={{ color: now ? "#ff7a3d" : "#fff", opacity: on ? 1 : 0.38 }}>
                {w.text}
                {i < c.words.length - 1 ? " " : ""}
              </span>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** Doigt (pastille translucide) qui vient appuyer : `at` = frame absolue du contact. */
export const Tap: React.FC<{ x: number; y: number; at: number; size?: number }> = ({ x, y, at, size = 70 }) => {
  const f = useCurrentFrame();
  const appear = prog(f, at - 12, 10);
  const press = interpolate(f, [at - 2, at, at + 5], [0, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const gone = prog(f, at + 8, 10);
  const ring = prog(f, at, 18);
  if (f < at - 14 || f > at + 24) return null;
  return (
    <div style={{ position: "absolute", left: x - size / 2, top: y - size / 2, width: size, height: size, pointerEvents: "none" }}>
      <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "rgba(255,255,255,0.55)", border: "3px solid rgba(255,255,255,0.9)", boxShadow: "0 6px 20px rgba(0,0,0,0.35)", opacity: appear * (1 - gone), transform: `scale(${mix(appear, 1.6, 1) * (1 - press * 0.18)})` }} />
      <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "3px solid rgba(255,255,255,0.9)", opacity: f >= at ? 1 - ring : 0, transform: `scale(${1 + ring * 1.4})` }} />
    </div>
  );
};

/** Flash blanc bref (impact d'une coupe sur le temps fort). */
export const Flash: React.FC<{ at: number; color?: string; strength?: number }> = ({ at, color = "#fff", strength = 0.85 }) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [at - 1, at, at + 8], [0, strength, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  if (o <= 0) return null;
  return <AbsoluteFill style={{ background: color, opacity: o, pointerEvents: "none" }} />;
};

/** Pastille de surtitre (« 01 · Boutique »). */
export const Eyebrow: React.FC<{ n: string; label: string; at: number; size?: number; dark?: boolean; style?: React.CSSProperties }> = ({ n, label, at, size = 26, dark, style }) => {
  const f = useCurrentFrame();
  const p = prog(f, at, 16);
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: size * 0.5, fontFamily: font, fontSize: size, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: dark ? "rgba(255,255,255,0.8)" : C.gray, opacity: p, transform: `translateY(${mix(p, 14, 0)}px)`, ...style }}>
      <span style={{ color: C.brand }}>{n}</span>
      <span style={{ width: mix(p, 0, size * 1.3), height: 3, borderRadius: 2, background: C.brand }} />
      {label}
    </div>
  );
};
