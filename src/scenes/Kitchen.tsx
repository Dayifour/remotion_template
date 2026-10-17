import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { BrowserFrame, Headline, IconBell, IconCheck, LiveDot, Shot } from "../components/Kit";
import { useSceneFrame } from "../components/Scene";
import { easeInOut, easeOut, mix, pop, progress } from "../ease";
import { colors, fontFamily, FPS, sceneBg } from "../theme";
import { wordAt } from "../timeline";

/** Séquence 6 — côté restaurant : la commande arrive en temps réel, notifiée, et avance en un geste. */
const FRAME = { x: 120, y: 270, w: 1320, h: 700 };
const BOX = { w: FRAME.w, h: FRAME.h - 48 };
const K = FRAME.w / 1768; // échelle de la capture « commandes »
// première carte de la colonne « Nouvelle » et colonne « Acceptée » (coordonnées de la capture)
const CARD = { x: 377 * K, y: 394 * K, w: 294 * K, h: 398 * K };
const TARGET_X = 725 * K;
const COLUMN_BG = "rgb(240, 239, 235)";

export const Kitchen: React.FC = () => {
  const f = useSceneFrame();
  const w = (word: string) => wordAt("kitchen", word);
  const frame = progress(f, 0, 24, easeOut);
  const arrive = progress(f, w("arrive") - 4, 10, easeOut);
  const pulse = f >= w("arrive") - 4 ? 0.5 + 0.5 * Math.sin(((f - w("arrive")) / FPS) * Math.PI * 3) : 0;
  const toast = progress(f, w("notification") - 6, 16, easeOut);
  const ring = f >= w("notification") - 4 ? Math.sin(((f - w("notification")) / FPS) * Math.PI * 9) * Math.max(0, 1 - (f - w("notification")) / 30) : 0;
  const lift = progress(f, w("avancer") - 8, 8, easeOut);
  const move = progress(f, w("avancer"), 18, easeInOut);
  const drop = progress(f, w("avancer") + 18, 8, easeOut);
  const accepted = Math.max(0, pop(f, w("avancer") + 20, 10, 200));
  const x = mix(move, CARD.x, TARGET_X);
  const y = CARD.y - Math.sin(move * Math.PI) * 30;
  const elev = lift * (1 - drop * 0.6);

  return (
    <AbsoluteFill style={{ background: sceneBg("dark", "40% 40%"), fontFamily }}>
      <Headline
        frame={f}
        step="05"
        label="Côté restaurant"
        parts={[
          { text: "Les commandes arrivent", at: w("arrive") - 4 },
          { text: "en temps réel.", at: w("temps") - 2, accent: true },
        ]}
      />

      <BrowserFrame
        url="douminidouman.cloud/tableau-de-bord/commandes"
        width={FRAME.w}
        height={FRAME.h}
        style={{ left: FRAME.x, top: FRAME.y, opacity: frame, transform: `translateY(${mix(frame, 50, 0)}px)` }}
      >
        <Shot src="commandes" aspect={1768 / 934} width={BOX.w} boxW={BOX.w} boxH={BOX.h} />

        {/* nouvelle commande : la carte s'illumine */}
        <div
          style={{
            position: "absolute",
            left: CARD.x - 6,
            top: CARD.y - 6,
            width: CARD.w + 12,
            height: CARD.h + 12,
            borderRadius: 16,
            border: `4px solid ${colors.brand}`,
            boxShadow: `0 0 ${30 * pulse}px rgba(255,75,0,0.6)`,
            opacity: arrive * (1 - lift),
          }}
        />

        {/* la carte quitte « Nouvelle » pour « Acceptée » */}
        {lift > 0 && (
          <>
            <div style={{ position: "absolute", left: CARD.x - 2, top: CARD.y - 2, width: CARD.w + 4, height: CARD.h + 4, background: COLUMN_BG }} />
            <div
              style={{
                position: "absolute",
                left: x,
                top: y,
                width: CARD.w,
                height: CARD.h,
                overflow: "hidden",
                borderRadius: 10,
                transform: `scale(${1 + elev * 0.06}) rotate(${elev * -3}deg)`,
                boxShadow: `0 ${10 + elev * 30}px ${20 + elev * 40}px rgba(41,38,34,${0.15 + elev * 0.25})`,
              }}
            >
              <Img src={staticFile("screens/commandes.jpg")} style={{ position: "absolute", left: -CARD.x, top: -CARD.y, width: BOX.w, height: BOX.w / (1768 / 934) }} />
              <div style={{ position: "absolute", left: 12, bottom: 14, right: 12, height: 30, borderRadius: 8, background: "#3f7a24", opacity: drop, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 15, fontWeight: 700 }}>
                Acceptée
              </div>
            </div>
            <div style={{ position: "absolute", left: x + CARD.w - 26, top: y - 18, transform: `scale(${accepted})` }}>
              <IconCheck size={46} />
            </div>
          </>
        )}
      </BrowserFrame>

      {/* notification push (PWA) */}
      <div
        style={{
          position: "absolute",
          left: 1250,
          top: 220,
          width: 620,
          padding: "18px 22px",
          borderRadius: 24,
          background: "rgba(36,32,29,0.94)",
          border: "1.5px solid #3e3833",
          boxShadow: "0 30px 70px rgba(0,0,0,0.5)",
          color: "#f7f4f0",
          display: "flex",
          gap: 16,
          opacity: toast,
          transform: `translateY(${mix(toast, -40, 0)}px) scale(${mix(toast, 0.92, 1)})`,
        }}
      >
        <Img src={staticFile("brand/icon-192.png")} style={{ width: 64, height: 64, borderRadius: 16, background: "#fff" }} />
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 17, color: "#c4bdb4" }}>
            <span style={{ fontWeight: 700 }}>DouminiDouman</span>
            <span>maintenant</span>
          </div>
          <div style={{ fontSize: 23, fontWeight: 800, marginTop: 2 }}>Nouvelle commande · Table 2</div>
          <div style={{ fontSize: 18, color: "#c4bdb4", marginTop: 2 }}>Demi-poulet braisé, Attiéké poisson · 12 000 FCFA</div>
        </div>
        <div style={{ transform: `rotate(${ring * 18}deg)`, transformOrigin: "50% 10%" }}>
          <IconBell size={34} color="#ff8a66" />
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: FRAME.x + FRAME.w - 200,
          top: 200,
          display: "flex",
          alignItems: "center",
          gap: 10,
          fontSize: 22,
          fontWeight: 700,
          color: colors.success,
          opacity: progress(f, 10, 16, easeOut) * (1 - toast),
        }}
      >
        <LiveDot size={12} /> En direct
      </div>
    </AbsoluteFill>
  );
};
