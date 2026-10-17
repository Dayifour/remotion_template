import React from "react";
import { AbsoluteFill } from "remotion";
import logo from "../brand/logo-paths.json";
import { Headline, IconBolt, IconEye, IconHeart } from "../components/Kit";
import { useSceneFrame } from "../components/Scene";
import { easeOut, mix, pop, progress } from "../ease";
import { brand, displayFont, fontFamily, FPS, sceneBg } from "../theme";
import { wordAt } from "../timeline";

/** Séquence 9 — ce que DouminiDouman change : visibilité, rapidité, fidélité. */
const CARDS = [
  { title: "Plus visibles", text: "Votre carte en ligne, trouvée par ceux qui ont faim, autour de vous.", Icon: IconEye, word: "visibles" },
  { title: "Un service plus rapide", text: "La commande part de la table et arrive en cuisine, en direct.", Icon: IconBolt, word: "rapide" },
  { title: "Des clients qui reviennent", text: "Une expérience simple : sans compte, sans application.", Icon: IconHeart, word: "reviennent" },
];

export const Closing: React.FC = () => {
  const f = useSceneFrame();
  const w = (word: string) => wordAt("closing", word);

  return (
    <AbsoluteFill style={{ background: sceneBg("brand", "40% 60%"), fontFamily }}>
      <svg viewBox="240 430 460 600" style={{ position: "absolute", left: -320, bottom: -420, width: 1100, height: 1440, opacity: 0.1 }}>
        <path d={logo.arc.d} fill={brand.cream} />
        <path d={logo.heart.d} fill={brand.cream} />
      </svg>
      <Headline frame={f} step="08" label="Résultat" parts={[{ text: "Ce qui change, au quotidien.", at: 4 }]} onBrand size={62} />

      {CARDS.map((c, i) => {
        const p = Math.max(0, pop(f, w(c.word) - 6, 12, 160));
        const icon = progress(f, w(c.word), 16, easeOut);
        const bob = Math.sin(((f - w(c.word)) / FPS) * Math.PI * 0.7 + i) * 6;
        return (
          <div
            key={c.title}
            style={{
              position: "absolute",
              left: 120 + i * 500,
              top: 300 + bob,
              width: 460,
              height: 450,
              padding: "38px 36px",
              boxSizing: "border-box",
              borderRadius: 34,
              background: brand.cream,
              boxShadow: "0 40px 80px rgba(90,25,0,0.3)",
              transform: `translateY(${mix(Math.min(1, p), 120, 0)}px) rotate(${mix(Math.min(1, p), (i - 1) * 6, (i - 1) * 1.5)}deg) scale(${Math.min(1.05, p)})`,
              opacity: Math.min(1, p * 2),
            }}
          >
            <div
              style={{
                width: 100,
                height: 100,
                borderRadius: 30,
                background: i === 1 ? brand.yellow : brand.orangeUi,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transform: `rotate(${mix(icon, -20, 0)}deg) scale(${mix(icon, 0.6, 1)})`,
              }}
            >
              <c.Icon size={54} color={i === 1 ? "#332900" : "#ffffff"} stroke={2.2} />
            </div>
            <div style={{ fontFamily: displayFont, fontSize: 46, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.05, color: "#1a1410", marginTop: 34 }}>
              {c.title}
            </div>
            <div style={{ fontSize: 25, lineHeight: 1.35, color: "#625c55", marginTop: 14 }}>{c.text}</div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
