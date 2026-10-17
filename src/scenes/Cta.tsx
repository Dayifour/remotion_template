import React from "react";
import { AbsoluteFill, staticFile } from "remotion";
import logo from "../brand/logo-paths.json";
import { Hat } from "../components/Doumi";
import { IconNav, MaskWord } from "../components/Kit";
import { useSceneFrame } from "../components/Scene";
import { easeInOut, easeOut, mix, pop, progress } from "../ease";
import { brand, colors, displayFont, fontFamily, sceneBg } from "../theme";
import { wordAt } from "../timeline";

/**
 * Séquence 10 — le logo se reconstitue à partir de ses tracés officiels
 * (cœur, arc, virgule, toque, lettrage), puis la signature du site.
 */
export const CTA_CENTER = { x: 860, y: 400 };
const VIEW = { x: 240, y: 430, w: 1040, h: 600 };
const LOGO_W = 1000;
const LOGO_H = (LOGO_W * VIEW.h) / VIEW.w;

export const Cta: React.FC<{ ctaLabel: string; url: string }> = ({ ctaLabel, url }) => {
  const f = useSceneFrame();
  const w = (word: string, nth = 0) => wordAt("cta", word, nth);

  const heart = Math.max(0, pop(f, 2, 12, 150));
  const arc = progress(f, 8, 16, easeOut);
  const swoosh = progress(f, 14, 18, easeInOut);
  const hatDrop = pop(f, 20, 9, 170);
  const text = progress(f, w("Doumini") - 4, 20, easeInOut);
  const breathe = progress(f, 30, 240, easeInOut);
  const pills = progress(f, w("Rendez") - 4, 18, easeOut);
  const sign: { t: string; at: number; accent?: boolean }[][] = [
    [
      { t: "Les", at: w("les") },
      { t: "restaurants", at: w("restaurants") },
      { t: "de", at: w("de", 0) },
      { t: "Bamako,", at: w("Bamako") },
    ],
    [
      { t: "de", at: w("de", 1) },
      { t: "la", at: w("la", 0) },
      { t: "découverte", at: w("découverte") },
      { t: "à", at: w("à") },
      { t: "la", at: w("la", 1) },
      { t: "commande.", at: w("commande"), accent: true },
    ],
  ];

  return (
    <AbsoluteFill style={{ background: sceneBg("light", `${CTA_CENTER.x}px ${CTA_CENTER.y}px`), fontFamily }}>
      {/* le logo, reconstitué */}
      <svg
        viewBox={`${VIEW.x} ${VIEW.y} ${VIEW.w} ${VIEW.h}`}
        width={LOGO_W}
        height={LOGO_H}
        style={{ position: "absolute", left: CTA_CENTER.x - LOGO_W / 2, top: 90, overflow: "visible", transform: `scale(${mix(breathe, 1, 1.03)})` }}
      >
        <defs>
          <clipPath id="cta-swoosh">
            <rect x={540} y={880} width={mix(swoosh, 0, 460)} height={140} />
          </clipPath>
          <clipPath id="cta-text">
            <rect x={400} y={640} width={mix(text, 0, 900)} height={280} />
          </clipPath>
        </defs>
        <g transform={`translate(467 830) scale(${heart}) translate(-467 -830)`}>
          <path d={logo.heart.d} fill={brand.yellow} />
        </g>
        <g opacity={arc} transform={`rotate(${mix(arc, -24, 0)} 460 820)`}>
          <path d={logo.arc.d} fill={brand.orange} />
        </g>
        <path d={logo.swoosh.d} fill={brand.orange} clipPath="url(#cta-swoosh)" />
        <g transform={`translate(0 ${(1 - hatDrop) * -380}) rotate(${(1 - hatDrop) * -25} 430 612)`} opacity={f >= 20 ? 1 : 0}>
          <Hat />
        </g>
        <image href={staticFile("brand/logo-text.png")} x={0} y={0} width={1500} height={1500} clipPath="url(#cta-text)" />
      </svg>

      {/* signature du site */}
      <div
        style={{
          position: "absolute",
          left: CTA_CENTER.x - 640,
          width: 1280,
          top: 90 + LOGO_H + 10,
          textAlign: "center",
          fontFamily: displayFont,
          fontSize: 54,
          fontWeight: 700,
          letterSpacing: "-0.03em",
          lineHeight: 1.18,
          color: colors.ink,
        }}
      >
        {sign.map((line, i) => (
          <div key={i}>
            {line.map((word, j) => (
              <React.Fragment key={j}>
                <MaskWord frame={f} at={word.at} style={{ color: word.accent ? colors.brand : undefined }}>
                  {word.t}
                </MaskWord>{" "}
              </React.Fragment>
            ))}
          </div>
        ))}
      </div>

      {/* rendez-vous */}
      <div
        style={{
          position: "absolute",
          left: CTA_CENTER.x,
          top: 90 + LOGO_H + 180,
          transform: `translateX(-50%) translateY(${mix(pills, 24, 0)}px)`,
          opacity: pills,
          display: "flex",
          gap: 18,
          alignItems: "center",
          whiteSpace: "nowrap",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            padding: "18px 34px",
            borderRadius: 999,
            background: colors.brand,
            color: "#ffffff",
            fontSize: 34,
            fontWeight: 800,
            boxShadow: "0 20px 44px rgba(255,75,0,0.35)",
          }}
        >
          <IconNav size={30} color="#ffffff" /> {url}
        </div>
        {ctaLabel && (
          <div
            style={{
              padding: "18px 30px",
              borderRadius: 999,
              border: `2px solid ${colors.ink}`,
              color: colors.ink,
              fontSize: 28,
              fontWeight: 700,
              opacity: progress(f, w("Rendez") + 8, 16, easeOut),
            }}
          >
            {ctaLabel} →
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
