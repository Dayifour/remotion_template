import React from "react";
import { AbsoluteFill } from "remotion";
import { BrowserFrame, Card, Headline, IconEye, IconReceipt, IconStar, IconStore, Shot } from "../components/Kit";
import { useSceneFrame } from "../components/Scene";
import { easeInOut, easeOut, mix, pop, progress } from "../ease";
import { colors, displayFont, fontFamily, sceneBg } from "../theme";
import { wordAt } from "../timeline";

/**
 * Séquence 8 — le propriétaire suit ventes, plats et visibilité, et gère plusieurs
 * établissements. Les valeurs sont celles de la capture « vue d'ensemble » montrée.
 */
const fmt = (n: number) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");

export const Pilot: React.FC = () => {
  const f = useSceneFrame();
  const w = (word: string) => wordAt("pilot", word);
  const frame = progress(f, 0, 24, easeOut);
  const pan = progress(f, 10, 200, easeInOut);
  const multi = progress(f, w("plusieurs") - 6, 18, easeOut);
  const tiles = [
    { label: "Encaissé sur 30 jours", Icon: IconReceipt, at: w("ventes"), value: (p: number) => `${fmt(30 * p)} k FCFA` },
    { label: "Meilleure vente · 20 k FCFA", Icon: IconStar, at: w("plats"), value: () => "Poulet bicyclette" },
    { label: "Pages vues", Icon: IconEye, at: w("visibilité"), value: (p: number) => fmt(120 * p) },
  ];
  const quota = progress(f, w("établissements") + 4, 24, easeInOut);

  return (
    <AbsoluteFill style={{ background: sceneBg("dark", "30% 40%"), fontFamily }}>
      <Headline
        frame={f}
        step="07"
        label="Pilotage"
        parts={[
          { text: "Vos ventes,", at: w("ventes") - 4 },
          { text: "vos plats,", at: w("plats") - 4 },
          { text: "votre visibilité.", at: w("visibilité") - 4, accent: true },
        ]}
      />

      <BrowserFrame
        url="douminidouman.cloud/tableau-de-bord"
        width={1160}
        height={650}
        style={{ left: 120, top: 280, opacity: frame, transform: `translateY(${mix(frame, 50, 0)}px)` }}
      >
        <Shot src="vue-ensemble" aspect={1768 / 934} width={1160} zoom={mix(pan, 1.05, 1.18)} x={0.7} y={mix(pan, 0.1, 0.5)} boxW={1160} boxH={602} />
        <div style={{ position: "absolute", inset: 0, background: `rgba(10,8,6,${0.45 * multi})` }} />
      </BrowserFrame>

      {/* indicateurs */}
      {tiles.map((t, i) => {
        const p = Math.max(0, pop(f, t.at - 4, 12, 170));
        const count = progress(f, t.at, 26, easeOut);
        return (
          <Card
            key={t.label}
            style={{
              left: 1340,
              top: 280 + i * 165,
              width: 450,
              padding: "20px 24px",
              opacity: Math.min(1, p) * mix(multi, 1, 0.55),
              transform: `translateX(${mix(Math.min(1, p), 60, 0)}px) scale(${mix(Math.min(1, p), 0.9, 1)})`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 17, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: colors.inkSubtle }}>
              <t.Icon size={22} color={colors.brandText} /> {t.label}
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginTop: 6 }}>
              <span style={{ fontFamily: displayFont, fontSize: 42, fontWeight: 800, letterSpacing: "-0.03em", whiteSpace: "nowrap" }}>{t.value(count)}</span>
            </div>
          </Card>
        );
      })}

      {/* plusieurs établissements, un seul compte */}
      <Card
        style={{
          left: 300,
          top: 400,
          width: 640,
          padding: "26px 30px",
          opacity: multi,
          transform: `translateY(${mix(multi, 50, 0)}px) scale(${mix(multi, 0.94, 1)})`,
        }}
      >
        <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: "0.14em", color: colors.inkSubtle }}>ÉTABLISSEMENTS</div>
        {[
          { name: "Djoliba Grill", on: true },
          { name: "Chez Fatou", on: false },
        ].map((r, i) => {
          const p = progress(f, w("plusieurs") + i * 5, 12, easeOut);
          return (
            <div
              key={r.name}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                marginTop: 14,
                padding: "14px 16px",
                borderRadius: 16,
                background: r.on ? colors.brandSoft : colors.surfaceMuted,
                opacity: p,
                transform: `translateX(${mix(p, 30, 0)}px)`,
              }}
            >
              <div style={{ width: 48, height: 48, borderRadius: 14, background: colors.surface, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <IconStore size={26} color={colors.brand} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 26, fontWeight: 700 }}>{r.name}</div>
                <div style={{ fontSize: 17, color: colors.inkMuted }}>Propriétaire</div>
              </div>
              {r.on && <span style={{ color: colors.brandText, fontSize: 26, fontWeight: 800 }}>✓</span>}
            </div>
          );
        })}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 22 }}>
          <span style={{ fontSize: 19, fontWeight: 700 }}>Quota d'établissements</span>
          <span style={{ fontFamily: displayFont, fontSize: 34, fontWeight: 800 }}>2 / 3</span>
        </div>
        <div style={{ marginTop: 10, height: 12, borderRadius: 6, background: colors.surfaceMuted, overflow: "hidden" }}>
          <div style={{ width: `${(quota * 2 * 100) / 3}%`, height: "100%", borderRadius: 6, background: colors.brand }} />
        </div>
        <div style={{ fontSize: 17, color: colors.inkMuted, marginTop: 8 }}>1 place disponible · abonnement annuel</div>
      </Card>
    </AbsoluteFill>
  );
};
