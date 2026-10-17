import React from "react";
import { AbsoluteFill } from "remotion";
import { BrowserFrame, Card, Headline, IconPin, LiveDot, Shot } from "../components/Kit";
import { useSceneFrame } from "../components/Scene";
import { easeInOut, easeOut, mix, pop, progress } from "../ease";
import { colors, displayFont, fontFamily, FPS, isDark, sceneBg } from "../theme";
import { wordAt } from "../timeline";

/** Séquence 2 — découvrir : les restaurants ouverts autour de soi, à Bamako, avec carte et prix. */
const MAP = { x: 1230, y: 290, w: 570, h: 600 };
const ME = { x: 280, y: 270 };
const PINS = [
  { name: "Saveurs de Ségou", x: 150, y: 190 },
  { name: "Chez Fatou", x: 430, y: 170 },
  { name: "Fonio & Co", x: 120, y: 420 },
  { name: "Djoliba Grill", x: 410, y: 455 },
];
const QUARTIERS = [
  { name: "Hamdallaye", x: 40, y: 70 },
  { name: "Niarela", x: 400, y: 80 },
  { name: "Bamako-Coura", x: 210, y: 140 },
  { name: "Badalabougou", x: 330, y: 540 },
  { name: "Niger", x: 480, y: 318, river: true },
];

export const Discover: React.FC = () => {
  const f = useSceneFrame();
  const w = (word: string, nth = 0) => wordAt("discover", word, nth);
  const dark = isDark();
  const browser = progress(f, 2, 24, easeOut);
  const map = progress(f, 8, 24, easeOut);
  const zoom = progress(f, 10, 200, easeInOut);
  const me = Math.max(0, pop(f, w("autour") - 2, 12, 180));
  const selected = progress(f, w("carte") - 6, 14, easeOut);
  const info = progress(f, w("carte") - 2, 18, easeOut);
  const prices = [w("prix"), w("francs")];

  return (
    <AbsoluteFill style={{ background: sceneBg("light", "75% 40%"), fontFamily }}>
      <Headline
        frame={f}
        step="01"
        label="Découvrir"
        parts={[
          { text: "Je recherche.", at: w("montre") - 4 },
          { text: "Je découvre.", at: w("ouverts") - 2 },
          { text: "Je consulte.", at: w("carte") - 2, accent: true },
        ]}
      />

      {/* L'accueil réel du site */}
      <BrowserFrame
        url="douminidouman.cloud"
        width={980}
        height={600}
        style={{ left: 200, top: 290, opacity: browser, transform: `translateY(${mix(browser, 50, 0)}px)` }}
      >
        <Shot src="accueil" aspect={1768 / 929} width={980} zoom={mix(zoom, 1, 1.1)} x={0.05} y={0.55} boxW={980} boxH={552} />
      </BrowserFrame>

      {/* Carte stylisée de Bamako */}
      <Card
        style={{
          left: MAP.x,
          top: MAP.y,
          width: MAP.w,
          height: MAP.h,
          overflow: "hidden",
          opacity: map,
          transform: `translateY(${mix(map, 60, 0)}px) rotate(${mix(map, 3, 0)}deg)`,
        }}
      >
        <svg width={MAP.w} height={MAP.h} style={{ position: "absolute", inset: 0 }}>
          <rect width={MAP.w} height={MAP.h} fill={dark ? "#26211d" : "#efe8dc"} />
          {/* routes */}
          <g stroke={dark ? "#3b332d" : "#ffffff"} strokeLinecap="round" fill="none">
            <path d="M -10 120 L 600 210" strokeWidth={12} />
            <path d="M 90 -10 L 250 620" strokeWidth={10} />
            <path d="M 330 -10 C 360 200, 420 400, 470 620" strokeWidth={12} />
            <path d="M -10 520 L 600 470" strokeWidth={9} />
            <path d="M 30 240 L 560 280" strokeWidth={6} />
          </g>
          {/* le fleuve Niger et ses ponts */}
          <path d="M -40 390 C 120 330, 250 420, 380 360 S 560 300, 640 340" stroke={dark ? "#24373b" : "#bfd6da"} strokeWidth={78} fill="none" />
          <g stroke={dark ? "#4a3f37" : "#e3dccf"} strokeWidth={14}>
            <path d="M 200 330 L 225 430" />
            <path d="M 395 300 L 410 410" />
          </g>
          {QUARTIERS.map((q) => (
            <text
              key={q.name}
              x={q.x}
              y={q.y}
              fontFamily={fontFamily}
              fontSize={q.river ? 18 : 15}
              fontStyle={q.river ? "italic" : "normal"}
              fontWeight={700}
              letterSpacing={q.river ? 1 : 2}
              fill={q.river ? (dark ? "#6f9aa1" : "#6c9aa2") : colors.inkSubtle}
            >
              {q.river ? q.name : q.name.toUpperCase()}
            </text>
          ))}
          {/* « Vous êtes ici » */}
          <g transform={`translate(${ME.x} ${ME.y}) scale(${me})`}>
            {[0, 0.5].map((o) => {
              const t = (((f / FPS) * 0.7 + o) % 1 + 1) % 1;
              return <circle key={o} r={14 + t * 60} fill="none" stroke="#2f6fd0" strokeWidth={3} opacity={(1 - t) * 0.6} />;
            })}
            <circle r={14} fill="#2f6fd0" stroke="#fff" strokeWidth={5} />
          </g>
        </svg>

        {/* restaurants ouverts */}
        {PINS.map((pin, i) => {
          const p = Math.max(0, pop(f, w("restaurants") + i * 4, 10, 200));
          const isSel = i === 0;
          const s = isSel ? mix(selected, 1, 1.25) : mix(selected, 1, 0.9);
          return (
            <div
              key={pin.name}
              style={{
                position: "absolute",
                left: pin.x,
                top: pin.y,
                transform: `translate(-50%, -100%) scale(${p * s})`,
                transformOrigin: "50% 100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                opacity: isSel ? 1 : mix(selected, 1, 0.75),
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  padding: "6px 12px",
                  borderRadius: 999,
                  background: colors.surface,
                  boxShadow: `0 8px 20px ${colors.shadow}`,
                  fontSize: 17,
                  fontWeight: 700,
                  color: colors.ink,
                  whiteSpace: "nowrap",
                  marginBottom: 6,
                }}
              >
                <LiveDot size={9} /> {pin.name}
              </div>
              <div
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: "50% 50% 50% 0",
                  transform: "rotate(-45deg)",
                  background: colors.brand,
                  border: "4px solid #fff",
                  boxShadow: `0 8px 18px ${colors.shadow}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div style={{ width: 14, height: 14, borderRadius: 7, background: "#fff" }} />
              </div>
            </div>
          );
        })}

        {/* fiche du restaurant choisi : sa carte, ses prix */}
        <div
          style={{
            position: "absolute",
            left: 18,
            right: 18,
            bottom: 18,
            padding: "18px 22px",
            borderRadius: 20,
            background: colors.surface,
            border: `1.5px solid ${colors.line}`,
            boxShadow: `0 18px 40px ${colors.shadow}`,
            opacity: info,
            transform: `translateY(${mix(info, 80, 0)}px)`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ fontFamily: displayFont, fontSize: 28, fontWeight: 750, letterSpacing: "-0.02em" }}>Saveurs de Ségou</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 17, fontWeight: 700, color: colors.success }}>
              <LiveDot size={9} /> Ouvert
            </div>
          </div>
          {[
            { dish: "Riz gras au bœuf", price: "2 000 FCFA" },
            { dish: "Riz sauce feuille", price: "1 750 FCFA" },
          ].map((row, i) => {
            const hp = progress(f, prices[i] - 2, 12, easeOut);
            return (
              <div key={row.dish} style={{ display: "flex", alignItems: "baseline", gap: 10, marginTop: 10, fontSize: 21 }}>
                <span style={{ color: colors.ink }}>{row.dish}</span>
                <span style={{ flex: 1, borderBottom: `2px dotted ${colors.line}` }} />
                <span
                  style={{
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: 8,
                    color: hp > 0.5 ? colors.brandText : colors.ink,
                    background: `rgba(255,75,0,${0.14 * hp})`,
                  }}
                >
                  {row.price}
                </span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* repère de lecture : « autour de vous » */}
      <div
        style={{
          position: "absolute",
          left: MAP.x + 20,
          top: MAP.y - 58,
          display: "flex",
          alignItems: "center",
          gap: 10,
          fontSize: 24,
          fontWeight: 700,
          color: colors.inkMuted,
          opacity: progress(f, w("autour") - 2, 14, easeOut),
        }}
      >
        <IconPin size={26} color={colors.brand} /> Autour de vous · Bamako
      </div>
    </AbsoluteFill>
  );
};
