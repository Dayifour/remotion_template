import React from "react";
import { AbsoluteFill } from "remotion";
import { BrowserFrame, Chip, Headline, Shot } from "../components/Kit";
import { useSceneFrame } from "../components/Scene";
import { easeInOut, easeOut, mix, progress } from "../ease";
import { colors, fontFamily, sceneBg } from "../theme";
import { wordAt } from "../timeline";

/** Séquence 7 — le propriétaire règle sa page, imprime ses QR codes, invite ses managers. */
const W = 1080;
const H = 610;
const PAGES = [
  { src: "apparence", url: "douminidouman.cloud/tableau-de-bord/apparence", chip: "Atelier · Tablée · Comptoir", y: 0.12 },
  { src: "qr-codes", url: "douminidouman.cloud/tableau-de-bord/qr-codes", chip: "Un QR code par table", y: 0.3 },
  { src: "equipe", url: "douminidouman.cloud/tableau-de-bord/equipe", chip: "Inviter un manager", y: 0.2 },
];
// emplacement selon le rang relatif à la page active (0 = devant)
const slot = (r: number) => {
  if (r <= 0) return { x: mix(-r, 140, -900), y: mix(-r, 290, 330), s: 1, o: 1 - Math.min(1, -r) };
  return { x: 140 + r * 300, y: 290 - r * 34, s: 1 - r * 0.16, o: 1 - r * 0.25 };
};

export const Manage: React.FC = () => {
  const f = useSceneFrame();
  const w = (word: string) => wordAt("manage", word);
  const enter = progress(f, 0, 26, easeOut);
  const switches = [w("imprime") - 6, w("invite") - 6];
  const active = switches.reduce((n, at) => n + progress(f, at, 16, easeInOut), 0);
  const chipAt = [w("l'apparence"), w("QR"), w("managers")];

  return (
    <AbsoluteFill style={{ background: sceneBg("light", "60% 50%"), fontFamily }}>
      <Headline
        frame={f}
        step="06"
        label="Gestion"
        parts={[
          { text: "Votre page,", at: w("l'apparence") - 4 },
          { text: "vos QR codes,", at: w("QR") - 4 },
          { text: "votre équipe.", at: w("invite") - 2, accent: true },
        ]}
      />

      {PAGES.map((page, i) => ({ page, i, r: i - active }))
        .sort((a, b) => b.r - a.r) // les plus lointaines d'abord
        .map(({ page, i, r }) => {
          const s = slot(r);
          const chip = progress(f, chipAt[i] - 2, 14, easeOut) * (1 - Math.min(1, Math.abs(r) * 2));
          return (
            <div
              key={page.src}
              style={{
                position: "absolute",
                left: s.x,
                top: s.y,
                opacity: s.o * enter,
                transform: `translateY(${mix(enter, 80, 0)}px) scale(${s.s})`,
                transformOrigin: "0% 0%",
              }}
            >
              <BrowserFrame url={page.url} width={W} height={H} style={{ position: "relative" }}>
                <Shot src={page.src} aspect={1768 / 934} width={W} zoom={1.15} x={0.4} y={page.y} boxW={W} boxH={H - 48} />
                <div style={{ position: "absolute", inset: 0, background: `rgba(41,38,34,${Math.min(0.25, Math.max(0, r) * 0.25)})` }} />
              </BrowserFrame>
              <div style={{ position: "absolute", right: 30, bottom: -26, opacity: chip, transform: `translateY(${mix(chip, 20, 0)}px)` }}>
                <Chip color={colors.brand} solid style={{ fontSize: 26, boxShadow: `0 14px 30px ${colors.shadow}` }}>
                  {page.chip}
                </Chip>
              </div>
            </div>
          );
        })}
    </AbsoluteFill>
  );
};
