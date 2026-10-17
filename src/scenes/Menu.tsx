import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { BrowserFrame, Card, Chip, Headline, IconClock, IconStar, LiveDot, Shot } from "../components/Kit";
import { useSceneFrame } from "../components/Scene";
import { easeInOut, easeOut, mix, pop, progress } from "../ease";
import { colors, displayFont, fontFamily, sceneBg } from "../theme";
import { wordAt } from "../timeline";

/** Séquence 3 — chaque restaurant a sa page : photos, plats, horaires, avis. */
const FRAME = { x: 300, y: 290, w: 1000, h: 620 };
const BOX = { w: FRAME.w, h: FRAME.h - 48 };

export const Menu: React.FC = () => {
  const f = useSceneFrame();
  const w = (word: string) => wordAt("menu", word);
  const frame = progress(f, 0, 24, easeOut);
  // la page du restaurant, puis la carte d'un autre établissement (on « feuillette »)
  const flip = progress(f, w("plats") - 8, 22, easeInOut);
  const hero = progress(f, 0, w("plats"), easeInOut);
  const scroll = progress(f, w("plats") + 10, 120, easeInOut);
  const dish = Math.max(0, pop(f, w("photos") - 3, 13, 160));
  const hours = progress(f, w("horaires") - 3, 14, easeOut);
  const review = Math.max(0, pop(f, w("avis") - 3, 13, 170));
  const url = flip < 0.5 ? "douminidouman.cloud/r/djoliba-grill" : "douminidouman.cloud/r/saveurs-de-segou";

  return (
    <AbsoluteFill style={{ background: sceneBg("light", "40% 60%"), fontFamily }}>
      <Headline
        frame={f}
        step="02"
        label="La page du restaurant"
        parts={[
          { text: "Une vitrine,", at: w("page") - 4 },
          { text: "une carte,", at: w("plats") - 2 },
          { text: "des avis.", at: w("avis") - 2, accent: true },
        ]}
      />

      <BrowserFrame
        url={url}
        width={FRAME.w}
        height={FRAME.h}
        style={{ left: FRAME.x, top: FRAME.y, opacity: frame, transform: `translateY(${mix(frame, 50, 0)}px)` }}
      >
        <div style={{ position: "absolute", inset: 0, transform: `translateY(${-flip * BOX.h}px)` }}>
          <div style={{ position: "absolute", left: 0, top: 0, width: BOX.w, height: BOX.h, overflow: "hidden" }}>
            <Shot src="restaurant" aspect={1768 / 932} width={BOX.w} zoom={mix(hero, 1.12, 1.02)} x={0.3} y={0.35} boxW={BOX.w} boxH={BOX.h} />
          </div>
          <div style={{ position: "absolute", left: 0, top: BOX.h, width: BOX.w, height: BOX.h, overflow: "hidden" }}>
            <Shot src="carte" aspect={1781 / 930} width={BOX.w} zoom={1.25} x={0.25} y={mix(scroll, 0.05, 0.6)} boxW={BOX.w} boxH={BOX.h} />
          </div>
        </div>
      </BrowserFrame>

      {/* fiche plat réelle */}
      <div
        style={{
          position: "absolute",
          left: 1360,
          top: 250,
          width: 440,
          borderRadius: 22,
          overflow: "hidden",
          boxShadow: `0 40px 80px ${colors.shadow}`,
          border: `1.5px solid ${colors.line}`,
          transform: `scale(${dish}) rotate(${mix(dish, -6, 2)}deg)`,
          transformOrigin: "20% 50%",
        }}
      >
        <Img src={staticFile("screens/plat.jpg")} style={{ width: 440, height: (440 * 571) / 640, display: "block" }} />
      </div>

      {/* horaires et ouverture */}
      <div style={{ position: "absolute", left: 1380, top: 670, display: "flex", gap: 12, opacity: hours, transform: `translateY(${mix(hours, 20, 0)}px)` }}>
        <Chip color={colors.success}>
          <LiveDot size={11} /> Ouvert maintenant
        </Chip>
        <Chip color={colors.inkMuted} style={{ background: colors.surface, border: `1.5px solid ${colors.line}` }}>
          <IconClock size={24} color={colors.inkMuted} /> Horaires
        </Chip>
      </div>

      {/* avis clients (pseudonyme, note, commentaire — sans compte) */}
      <Card
        style={{
          left: 1360,
          top: 750,
          width: 440,
          padding: "20px 24px",
          transform: `scale(${review})`,
          transformOrigin: "0% 0%",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontFamily: displayFont, fontSize: 40, fontWeight: 800 }}>4,4</span>
          <span style={{ display: "flex", gap: 2 }}>
            {[0, 1, 2, 3, 4].map((i) => (
              <IconStar key={i} size={22} fill={i < 4 ? undefined : "transparent"} />
            ))}
          </span>
          <span style={{ fontSize: 19, color: colors.inkMuted }}>8 avis</span>
        </div>
        <div style={{ marginTop: 8, fontSize: 21, fontWeight: 700, lineHeight: 1.3 }}>
          « Commande par QR code très pratique, servie en quinze minutes. »
        </div>
        <div style={{ marginTop: 6, fontSize: 17, color: colors.inkSubtle }}>Mariam</div>
      </Card>
    </AbsoluteFill>
  );
};
