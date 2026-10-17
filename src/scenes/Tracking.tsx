import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { Card, Headline, IconBox, IconChef, IconReceipt, IconUtensils, LiveDot } from "../components/Kit";
import { useSceneFrame } from "../components/Scene";
import { easeInOut, easeOut, mix, progress } from "../ease";
import { colors, displayFont, fontFamily, sceneBg } from "../theme";
import { wordAt } from "../timeline";

/** Séquence 5 — le suivi de la commande se met à jour en direct, jusqu'à l'assiette. */
const CheckGlyph: React.FC<{ size?: number; color?: string }> = ({ size = 24, color = "#fff" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M5 12.5l4.5 4.5L19 7.5" stroke={color} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const Tracking: React.FC = () => {
  const f = useSceneFrame();
  const w = (word: string) => wordAt("tracking", word);
  const card = progress(f, -14, 24, easeOut); // visible dès le raccord avec l'écran du téléphone
  const shot = progress(f, -6, 26, easeOut);
  const drift = progress(f, 0, 170, easeInOut);
  // statuts réels d'une commande (frontend : suivi de commande)
  const steps = [
    { label: "Nouvelle", Icon: IconReceipt, at: 0 },
    { label: "Acceptée", Icon: CheckGlyph, at: w("commande") },
    { label: "En préparation", Icon: IconChef, at: w("jour") },
    { label: "Prête", Icon: IconBox, at: w("direct") },
    { label: "Servie", Icon: IconUtensils, at: w("l'assiette") },
  ];
  const current = steps.reduce((n, s, i) => (f >= s.at ? i : n), 0);

  return (
    <AbsoluteFill style={{ background: sceneBg("light", "30% 50%"), fontFamily }}>
      <Headline
        frame={f}
        step="04"
        label="Suivi"
        parts={[
          { text: "En direct,", at: w("direct") - 4 },
          { text: "jusqu'à l'assiette.", at: w("l'assiette") - 4, accent: true },
        ]}
      />

      <Card style={{ left: 120, top: 270, width: 760, padding: "34px 40px", opacity: card, transform: `translateY(${mix(card, 50, 0)}px)` }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontFamily: displayFont, fontSize: 36, fontWeight: 800, letterSpacing: "-0.02em" }}>Suivi de commande</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 19, fontWeight: 700, color: colors.brandText }}>
            <LiveDot color={colors.brand} size={11} /> En direct
          </div>
        </div>
        <div style={{ fontSize: 19, color: colors.inkMuted, marginTop: 4 }}>Table 3 · 3 750 FCFA · cette page se met à jour toute seule</div>
        <div style={{ marginTop: 26, position: "relative" }}>
          {steps.map((s, i) => {
            const on = progress(f, s.at - 2, 10, easeOut);
            const isCurrent = i === current;
            const fill = i <= current ? colors.brand : colors.surface;
            const line = i < steps.length - 1 ? progress(f, steps[i + 1].at - 10, 10, easeInOut) : 0;
            return (
              <div key={s.label} style={{ position: "relative", display: "flex", alignItems: "center", gap: 22, height: 92 }}>
                {i < steps.length - 1 && (
                  <div style={{ position: "absolute", left: 31, top: 64, width: 4, height: 56, borderRadius: 2, background: colors.line }}>
                    <div style={{ width: 4, height: `${line * 100}%`, borderRadius: 2, background: colors.brand }} />
                  </div>
                )}
                <div
                  style={{
                    width: 66,
                    height: 66,
                    borderRadius: 33,
                    background: fill,
                    border: `3px solid ${i <= current ? colors.brand : colors.line}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transform: `scale(${isCurrent ? mix(on, 0.8, 1.08) : 1})`,
                    boxShadow: isCurrent ? `0 0 0 ${8 * on}px rgba(255,75,0,0.16)` : "none",
                    boxSizing: "border-box",
                  }}
                >
                  <s.Icon size={30} color={i <= current ? "#fff" : colors.inkSubtle} />
                </div>
                <div>
                  <div style={{ fontSize: 30, fontWeight: isCurrent ? 800 : 600, color: i <= current ? colors.ink : colors.inkSubtle }}>{s.label}</div>
                  {isCurrent && <div style={{ fontSize: 18, color: colors.inkMuted, opacity: on }}>Mis à jour à l'instant</div>}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* la vraie page de suivi */}
      <div
        style={{
          position: "absolute",
          left: 1220,
          top: 230,
          width: 480,
          borderRadius: 24,
          overflow: "hidden",
          border: `1.5px solid ${colors.line}`,
          boxShadow: `0 40px 90px ${colors.shadow}`,
          opacity: shot,
          transform: `translateY(${mix(shot, 80, 0) - drift * 20}px) rotate(${mix(shot, 8, 3)}deg)`,
        }}
      >
        <Img src={staticFile("screens/suivi.jpg")} style={{ width: 480, height: (480 * 845) / 610, display: "block" }} />
      </div>
    </AbsoluteFill>
  );
};
