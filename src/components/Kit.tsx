import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import { easeInOut, easeOut, mix, progress } from "../ease";
import { colors, displayFont, fontFamily, FPS } from "../theme";
import { cues } from "../timeline";

/** Mot révélé derrière un masque de ligne, calé sur la voix. */
export const MaskWord: React.FC<{
  at: number;
  frame: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ at, frame, children, style }) => {
  const p = progress(frame, at - 3, 14, easeOut);
  return (
    <span style={{ display: "inline-block", overflow: "hidden", verticalAlign: "top", paddingBottom: "0.16em", marginBottom: "-0.16em" }}>
      <span
        style={{
          display: "inline-block",
          transform: `translateY(${mix(p, 105, 0)}%) rotate(${mix(p, 6, 0)}deg)`,
          transformOrigin: "left bottom",
          ...style,
        }}
      >
        {children}
      </span>
    </span>
  );
};

/**
 * Titre de séquence : surtitre numéroté + phrase(s) révélées mot à mot.
 * Chaque fragment a son instant d'apparition (frame relative à la scène).
 */
export const Headline: React.FC<{
  frame: number;
  step: string;
  label: string;
  parts: { text: string; at: number; accent?: boolean }[];
  size?: number;
  left?: number;
  top?: number;
  width?: number;
  onBrand?: boolean;
}> = ({ frame, step, label, parts, size = 58, left = 120, top = 84, width = 1500, onBrand }) => {
  const over = progress(frame, 0, 18, easeOut);
  const accent = onBrand ? colors.gold : colors.brand;
  return (
    <div style={{ position: "absolute", left, top, width, fontFamily }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          fontSize: 22,
          fontWeight: 700,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: onBrand ? "rgba(255,247,239,0.85)" : colors.inkMuted,
          opacity: over,
          transform: `translateY(${mix(over, 10, 0)}px)`,
        }}
      >
        <span style={{ color: accent }}>{step}</span>
        <span style={{ width: 28, height: 3, borderRadius: 2, background: accent }} />
        {label}
      </div>
      <div
        style={{
          marginTop: 10,
          fontFamily: displayFont,
          fontSize: size,
          fontWeight: 750,
          letterSpacing: "-0.035em",
          lineHeight: 1.08,
          color: onBrand ? colors.cream : colors.ink,
        }}
      >
        {parts.map((part, i) =>
          part.text.split(" ").map((word, j) => (
            <React.Fragment key={`${i}-${j}`}>
              <MaskWord frame={frame} at={part.at + j * 2} style={{ color: part.accent ? accent : undefined }}>
                {word}
              </MaskWord>{" "}
            </React.Fragment>
          )),
        )}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Sous-titres intégrés : groupes courts, mot prononcé mis en valeur
type Word = { text: string; at: number };
type Chunk = { words: Word[]; start: number; end: number };

const MAX_WORDS = 8;
const MIN_WORDS = 3;

/** Groupes lisibles : coupe à la ponctuation, fusionne les bribes, équilibre les longs segments. */
const group = (words: Word[]): Word[][] => {
  const segs: Word[][] = [];
  let cur: Word[] = [];
  for (const w of words) {
    cur.push(w);
    if (/[,.:;!?…]$/.test(w.text)) {
      segs.push(cur);
      cur = [];
    }
  }
  if (cur.length) segs.push(cur);
  const merged: Word[][] = [];
  for (const seg of segs) {
    const prev = merged[merged.length - 1];
    if (prev && (prev.length < MIN_WORDS || seg.length < MIN_WORDS) && prev.length + seg.length <= MAX_WORDS + 1) {
      merged[merged.length - 1] = [...prev, ...seg];
    } else {
      merged.push(seg);
    }
  }
  return merged.flatMap((seg) => {
    if (seg.length <= MAX_WORDS + 1) return [seg];
    const parts = Math.ceil(seg.length / MAX_WORDS);
    const size = Math.ceil(seg.length / parts);
    return Array.from({ length: parts }, (_, i) => seg.slice(i * size, (i + 1) * size));
  });
};

const chunks: Chunk[] = (() => {
  const out: Chunk[] = [];
  for (const c of cues) {
    const mine = group(c.captions).map((words) => ({ words, start: words[0].at, end: 0 }));
    mine.forEach((ch, i) => {
      ch.end = i < mine.length - 1 ? mine[i + 1].start : c.speechEnd + 12;
    });
    out.push(...mine);
  }
  return out;
})();

export const Subtitles: React.FC = () => {
  const f = useCurrentFrame();
  const ch = chunks.find((c) => f >= c.start - 3 && f < c.end);
  if (!ch) return null;
  const pin = progress(f, ch.start - 3, 6, easeOut);
  const last = !chunks.some((c) => c.start === ch.end); // dernier groupe de la réplique : fondu de sortie
  const pout = last ? progress(f, ch.end - 6, 6, easeInOut) : 0;
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 34, pointerEvents: "none" }}>
      <div
        style={{
          maxWidth: 1240,
          padding: "12px 26px",
          borderRadius: 18,
          background: "rgba(26, 20, 16, 0.82)",
          fontFamily,
          fontSize: 36,
          fontWeight: 600,
          lineHeight: 1.3,
          textAlign: "center",
          opacity: pin * (1 - pout),
          transform: `translateY(${mix(pin, 8, 0)}px)`,
          boxShadow: "0 10px 30px rgba(26,20,16,0.22)",
        }}
      >
        {ch.words.map((w, i) => (
          <span key={i} style={{ color: f >= w.at - 1 ? "#fff7ef" : "rgba(255,247,239,0.5)" }}>
            {w.text}
            {i < ch.words.length - 1 ? " " : ""}
          </span>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Cadres pour les vraies captures de l'application

/** Fenêtre de navigateur sobre, avec l'adresse réelle de la page. */
export const BrowserFrame: React.FC<{
  url: string;
  width: number;
  height: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ url, width, height, children, style }) => (
  <div
    style={{
      position: "absolute",
      width,
      height,
      borderRadius: 22,
      overflow: "hidden",
      background: colors.surface,
      border: `1.5px solid ${colors.line}`,
      boxShadow: `0 40px 90px ${colors.shadow}, 0 8px 24px ${colors.shadow}`,
      ...style,
    }}
  >
    <div
      style={{
        height: 48,
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "0 18px",
        background: colors.surfaceMuted,
        borderBottom: `1.5px solid ${colors.line}`,
      }}
    >
      {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
        <span key={c} style={{ width: 13, height: 13, borderRadius: 7, background: c }} />
      ))}
      <div
        style={{
          marginLeft: 18,
          flex: 1,
          maxWidth: 560,
          height: 30,
          borderRadius: 15,
          background: colors.surface,
          border: `1px solid ${colors.line}`,
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "0 14px",
          fontFamily,
          fontSize: 17,
          color: colors.inkMuted,
          whiteSpace: "nowrap",
          overflow: "hidden",
        }}
      >
        <IconLock size={15} color={colors.inkSubtle} />
        {url}
      </div>
    </div>
    <div style={{ position: "relative", width: "100%", height: height - 48, overflow: "hidden" }}>{children}</div>
  </div>
);

/**
 * Capture réelle (public/screens) cadrée dans son conteneur : `zoom` et
 * `x`/`y` (0..1, point visé) permettent des panoramiques easés.
 */
export const Shot: React.FC<{
  src: string;
  width: number; // largeur d'affichage de la capture à zoom 1
  zoom?: number;
  x?: number;
  y?: number;
  aspect: number; // largeur / hauteur de la capture
  boxW: number;
  boxH: number;
}> = ({ src, width, zoom = 1, x = 0, y = 0, aspect, boxW, boxH }) => {
  const w = width * zoom;
  const h = w / aspect;
  const left = -Math.max(0, w - boxW) * x;
  const top = -Math.max(0, h - boxH) * y;
  return <Img src={staticFile(`screens/${src}.jpg`)} style={{ position: "absolute", left, top, width: w, height: h }} />;
};

/** Téléphone générique (aucune marque), écran en enfant. */
export const PhoneFrame: React.FC<{ width: number; height: number; children: React.ReactNode; style?: React.CSSProperties }> = ({
  width,
  height,
  children,
  style,
}) => (
  <div
    style={{
      position: "absolute",
      width,
      height,
      borderRadius: 56,
      background: "#1a1410",
      padding: 14,
      boxSizing: "border-box",
      boxShadow: `0 50px 100px ${colors.shadow}, inset 0 0 0 2px #3a322b`,
      ...style,
    }}
  >
    <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: 44, overflow: "hidden", background: "#faf9f7" }}>
      {children}
      <div style={{ position: "absolute", top: 12, left: "50%", width: 110, height: 30, marginLeft: -55, borderRadius: 15, background: "#1a1410" }} />
    </div>
  </div>
);

/** Carte de surface (style des cartes du tableau de bord). */
export const Card: React.FC<{ style?: React.CSSProperties; children: React.ReactNode }> = ({ style, children }) => (
  <div
    style={{
      position: "absolute",
      background: colors.surface,
      border: `1.5px solid ${colors.line}`,
      borderRadius: 24,
      boxShadow: `0 24px 60px ${colors.shadow}`,
      fontFamily,
      color: colors.ink,
      boxSizing: "border-box",
      ...style,
    }}
  >
    {children}
  </div>
);

/** Pastille / puce texte. */
export const Chip: React.FC<{ color: string; children: React.ReactNode; p?: number; style?: React.CSSProperties; solid?: boolean }> = ({
  color,
  children,
  p = 1,
  style,
  solid,
}) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 10,
      padding: "11px 20px",
      borderRadius: 999,
      background: solid ? color : `${color}1F`,
      color: solid ? "#ffffff" : color,
      fontFamily,
      fontSize: 25,
      fontWeight: 700,
      whiteSpace: "nowrap",
      opacity: p,
      transform: `scale(${mix(p, 0.8, 1)})`,
      ...style,
    }}
  >
    {children}
  </div>
);

/** Point « en direct » qui pulse. */
export const LiveDot: React.FC<{ color?: string; size?: number }> = ({ color = colors.success, size = 12 }) => {
  const f = useCurrentFrame();
  const t = ((f / FPS) * 0.9) % 1;
  return (
    <span style={{ position: "relative", display: "inline-block", width: size, height: size }}>
      <span style={{ position: "absolute", inset: 0, borderRadius: size, background: color }} />
      <span
        style={{
          position: "absolute",
          inset: -size * t * 0.9,
          borderRadius: size * 2,
          border: `2px solid ${color}`,
          opacity: 1 - t,
        }}
      />
    </span>
  );
};

/** Logo officiel (image fournie par le frontend). */
export const BrandLogo: React.FC<{ height: number; style?: React.CSSProperties }> = ({ height, style }) => (
  <Img src={staticFile("brand/brand-logo.png")} style={{ height, width: (height * 1400) / 781, ...style }} />
);

// ---------------------------------------------------------------------------
// Icônes au trait (24×24), dans l'esprit de lucide utilisé par le site
type IP = { size?: number; color?: string; stroke?: number };
const svg = (size: number, children: React.ReactNode) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);
export const IconLock: React.FC<IP> = ({ size = 24, color = colors.ink, stroke = 2 }) =>
  svg(size, <g stroke={color} strokeWidth={stroke}><rect x={5} y={11} width={14} height={10} rx={2} /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></g>);
export const IconSearch: React.FC<IP> = ({ size = 24, color = colors.ink, stroke = 2 }) =>
  svg(size, <g stroke={color} strokeWidth={stroke}><circle cx={11} cy={11} r={7} /><path d="M20 20l-4-4" /></g>);
export const IconPin: React.FC<IP> = ({ size = 24, color = colors.ink, stroke = 2 }) =>
  svg(size, <g stroke={color} strokeWidth={stroke}><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z" /><circle cx={12} cy={9.5} r={2.5} /></g>);
export const IconNav: React.FC<IP> = ({ size = 24, color = colors.ink, stroke = 2 }) =>
  svg(size, <g stroke={color} strokeWidth={stroke}><path d="M3 11l18-8-8 18-2-8z" /></g>);
export const IconStar: React.FC<IP & { fill?: string }> = ({ size = 24, color = colors.gold, fill }) =>
  svg(size, <path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z" fill={fill ?? color} stroke={color} strokeWidth={1.5} />);
export const IconClock: React.FC<IP> = ({ size = 24, color = colors.ink, stroke = 2 }) =>
  svg(size, <g stroke={color} strokeWidth={stroke}><circle cx={12} cy={12} r={9} /><path d="M12 7v5l3 2" /></g>);
export const IconCamera: React.FC<IP> = ({ size = 24, color = colors.ink, stroke = 2 }) =>
  svg(size, <g stroke={color} strokeWidth={stroke}><path d="M4 8h3l2-3h6l2 3h3v11H4z" /><circle cx={12} cy={13} r={3.5} /></g>);
export const IconBag: React.FC<IP> = ({ size = 24, color = colors.ink, stroke = 2 }) =>
  svg(size, <g stroke={color} strokeWidth={stroke}><path d="M5 8h14l-1 12H6z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></g>);
export const IconCash: React.FC<IP> = ({ size = 24, color = colors.ink, stroke = 2 }) =>
  svg(size, <g stroke={color} strokeWidth={stroke}><rect x={2.5} y={6} width={19} height={12} rx={2} /><circle cx={12} cy={12} r={2.8} /><path d="M6 9.5v5M18 9.5v5" /></g>);
export const IconUserOff: React.FC<IP> = ({ size = 24, color = colors.ink, stroke = 2 }) =>
  svg(size, <g stroke={color} strokeWidth={stroke}><circle cx={10} cy={8} r={3.5} /><path d="M3.5 20c0-3.6 2.9-6 6.5-6 1.2 0 2.3.3 3.2.7" /><path d="M16 15l5 5M21 15l-5 5" /></g>);
export const IconNoApp: React.FC<IP> = ({ size = 24, color = colors.ink, stroke = 2 }) =>
  svg(size, <g stroke={color} strokeWidth={stroke}><rect x={6.5} y={2.5} width={11} height={19} rx={2.5} /><path d="M12 8v6M9.5 11.5L12 14l2.5-2.5" /><path d="M3 3l18 18" /></g>);
export const IconBell: React.FC<IP> = ({ size = 24, color = colors.ink, stroke = 2 }) =>
  svg(size, <g stroke={color} strokeWidth={stroke}><path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z" /><path d="M10 20.5a2 2 0 0 0 4 0" /></g>);
export const IconCheck: React.FC<IP & { bg?: string }> = ({ size = 28, color = "#fff", bg = colors.success }) =>
  svg(size, <g><circle cx={12} cy={12} r={10.5} fill={bg} /><path d="M7.5 12.5l3 3 6-6.5" stroke={color} strokeWidth={2.4} /></g>);
export const IconEye: React.FC<IP> = ({ size = 24, color = colors.ink, stroke = 2 }) =>
  svg(size, <g stroke={color} strokeWidth={stroke}><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" /><circle cx={12} cy={12} r={3} /></g>);
export const IconBolt: React.FC<IP> = ({ size = 24, color = colors.ink, stroke = 2 }) =>
  svg(size, <g stroke={color} strokeWidth={stroke}><path d="M13 2L4 14h7l-1 8 9-12h-7z" /></g>);
export const IconHeart: React.FC<IP> = ({ size = 24, color = colors.ink, stroke = 2 }) =>
  svg(size, <g stroke={color} strokeWidth={stroke}><path d="M12 20s-7.5-4.6-9-9.4C1.9 7 4.2 4 7.4 4c2 0 3.5 1.1 4.6 2.7C13.1 5.1 14.6 4 16.6 4c3.2 0 5.5 3 4.4 6.6-1.5 4.8-9 9.4-9 9.4z" /></g>);
export const IconStore: React.FC<IP> = ({ size = 24, color = colors.ink, stroke = 2 }) =>
  svg(size, <g stroke={color} strokeWidth={stroke}><path d="M4 10v10h16V10" /><path d="M3 10l2-6h14l2 6c0 1.7-1.3 3-3 3s-3-1.3-3-3c0 1.7-1.3 3-3 3s-3-1.3-3-3c0 1.7-1.3 3-3 3s-3-1.3-3-3z" /><path d="M10 20v-5h4v5" /></g>);
export const IconChef: React.FC<IP> = ({ size = 24, color = colors.ink, stroke = 2 }) =>
  svg(size, <g stroke={color} strokeWidth={stroke}><path d="M7 14a4 4 0 1 1 1.5-7.7A4 4 0 0 1 16 6.5 4 4 0 1 1 17 14z" /><path d="M7 14v6h10v-6M7 17h10" /></g>);
export const IconBox: React.FC<IP> = ({ size = 24, color = colors.ink, stroke = 2 }) =>
  svg(size, <g stroke={color} strokeWidth={stroke}><path d="M3 7.5L12 3l9 4.5v9L12 21l-9-4.5z" /><path d="M3 7.5L12 12l9-4.5M12 12v9" /></g>);
export const IconUtensils: React.FC<IP> = ({ size = 24, color = colors.ink, stroke = 2 }) =>
  svg(size, <g stroke={color} strokeWidth={stroke}><path d="M5 3v7a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V3M7 3v18" /><path d="M17 21V3c-2 1-3 3.5-3 7v3h3" /></g>);
export const IconReceipt: React.FC<IP> = ({ size = 24, color = colors.ink, stroke = 2 }) =>
  svg(size, <g stroke={color} strokeWidth={stroke}><path d="M5 3h14v18l-3-2-2 2-2-2-2 2-2-2-3 2z" /><path d="M9 8h6M9 12h6" /></g>);
