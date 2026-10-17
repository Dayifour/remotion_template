import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import logo from "../brand/logo-paths.json";
import { BrandLogo, IconStar, LiveDot, MaskWord } from "../components/Kit";
import { useSceneFrame } from "../components/Scene";
import { easeInOut, easeOut, mix, pop, progress } from "../ease";
import { brand, displayFont, fontFamily, FPS, sceneBg } from "../theme";
import { cueStart, wordAt } from "../timeline";

/**
 * Séquence 1 — l'accroche, dans la manchette orange de l'accueil du site.
 * Doumi se présente, puis pose la question du soir : « On mange où ce soir ? ».
 */
const Photo: React.FC<{ src: string; p: number; style: React.CSSProperties; rot: number; drift: number }> = ({ src, p, style, rot, drift }) => (
  <div
    style={{
      position: "absolute",
      borderRadius: 40,
      overflow: "hidden",
      border: "10px solid #fff7ef",
      boxShadow: "0 40px 90px rgba(90,25,0,0.35)",
      opacity: p,
      transform: `translateY(${mix(p, 120, 0) - drift * 30}px) rotate(${mix(p, rot * 3, rot)}deg) scale(${mix(p, 0.9, 1)})`,
      ...style,
    }}
  >
    <Img src={staticFile(`photos/${src}.webp`)} style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${1.08 - drift * 0.06})` }} />
  </div>
);

export const Hook: React.FC = () => {
  const f = useSceneFrame();
  const w = (word: string) => wordAt("hook", word);
  const q = cueStart("hook");
  const drift = progress(f, q, 220, easeInOut);
  const photos = progress(f, q - 4, 26, easeOut);
  const photos2 = progress(f, q + 4, 26, easeOut);
  const intro = 1 - progress(f, q - 14, 14, easeInOut); // la marque s'efface quand la question arrive
  const logoIn = progress(f, 12, 22, easeOut);
  const card = Math.max(0, pop(f, w("ouvert") - 4, 12, 180));
  const questions = [
    { text: "Ouvert maintenant ?", at: w("ouvert"), x: 120, y: 650, r: -3 },
    { text: "Quelle carte ?", at: w("restaurant"), x: 560, y: 660, r: 2.5 },
    { text: "Combien en FCFA ?", at: w("prix"), x: 300, y: 770, r: -2 },
  ];

  return (
    <AbsoluteFill style={{ background: sceneBg("brand", "70% 30%"), fontFamily, overflow: "hidden" }}>
      {/* Filigrane : le cœur du logo, à échelle monumentale et presque effacé */}
      <svg viewBox="240 430 460 600" style={{ position: "absolute", right: -260, top: -160, width: 1300, height: 1700, opacity: 0.1 }}>
        <path d={logo.arc.d} fill={brand.cream} />
        <path d={logo.heart.d} fill={brand.cream} />
      </svg>

      {/* Accueil : le logo officiel au-dessus de Doumi */}
      <div
        style={{
          position: "absolute",
          left: 960,
          top: 70,
          transform: `translateX(-50%) translateY(${mix(logoIn, -30, 0)}px) scale(${mix(intro, 0.9, 1)})`,
          opacity: logoIn * intro,
          padding: "18px 34px",
          borderRadius: 30,
          background: brand.cream,
          boxShadow: "0 24px 60px rgba(90,25,0,0.28)",
        }}
      >
        <BrandLogo height={118} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 270,
          textAlign: "center",
          color: brand.cream,
          fontSize: 30,
          fontWeight: 700,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          opacity: progress(f, 30, 20, easeOut) * intro,
        }}
      >
        Bamako · de la découverte à la commande
      </div>

      {/* La question du soir — le titre de l'accueil du site */}
      <div
        style={{
          position: "absolute",
          left: 120,
          top: 250,
          fontFamily: displayFont,
          fontSize: 172,
          fontWeight: 800,
          lineHeight: 0.98,
          letterSpacing: "-0.05em",
          color: brand.cream,
        }}
      >
        <div>
          <MaskWord frame={f} at={w("ce")}>On</MaskWord> <MaskWord frame={f} at={w("ce") + 3}>mange</MaskWord>
        </div>
        <div>
          <MaskWord frame={f} at={w("ce") + 6}>où</MaskWord> <MaskWord frame={f} at={w("ce") + 9}>ce</MaskWord>{" "}
          <MaskWord frame={f} at={w("ce") + 12}>soir</MaskWord> <MaskWord frame={f} at={w("où")} style={{ color: brand.yellow }}>?</MaskWord>
        </div>
      </div>

      {questions.map((qq) => {
        const p = Math.max(0, pop(f, qq.at - 3, 10, 190));
        const bob = Math.sin(((f - qq.at) / FPS) * Math.PI * 0.8) * 5;
        return (
          <div
            key={qq.text}
            style={{
              position: "absolute",
              left: qq.x,
              top: qq.y + bob,
              padding: "16px 28px",
              borderRadius: 999,
              background: brand.cream,
              color: "#1a1410",
              fontSize: 34,
              fontWeight: 700,
              boxShadow: "0 18px 40px rgba(90,25,0,0.25)",
              transform: `rotate(${qq.r}deg) scale(${p})`,
              transformOrigin: "left center",
            }}
          >
            {qq.text}
          </div>
        );
      })}

      {/* Photos d'ambiance (Unsplash, comme sur l'accueil du site) */}
      <Photo src="poissons-braises" p={photos} rot={3} drift={drift} style={{ left: 1290, top: 120, width: 520, height: 660 }} />
      <Photo src="poulet-riz-au-gras" p={photos2} rot={-4} drift={drift * 1.6} style={{ left: 1150, top: 560, width: 330, height: 400 }} />

      {/* Carte flottante, comme dans la manchette de l'accueil */}
      <div
        style={{
          position: "absolute",
          left: 1110,
          top: 300,
          padding: "20px 26px",
          borderRadius: 28,
          background: "#ffffff",
          boxShadow: "0 24px 60px rgba(90,25,0,0.3)",
          transform: `scale(${card}) translateY(${-drift * 14}px)`,
          transformOrigin: "right center",
          color: "#292622",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 21, fontWeight: 700, color: "#3f7a24" }}>
          <LiveDot color="#3f7a24" size={11} /> Ouvert maintenant
        </div>
        <div style={{ fontFamily: displayFont, fontSize: 36, fontWeight: 750, marginTop: 6, letterSpacing: "-0.02em" }}>Djoliba Grill</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6, fontSize: 21, color: "#625c55" }}>
          <IconStar size={22} /> <b style={{ color: "#292622" }}>4,4</b> Badalabougou
        </div>
      </div>
    </AbsoluteFill>
  );
};
