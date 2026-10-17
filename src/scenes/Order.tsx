import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import {
  BrandLogo,
  Card,
  Headline,
  IconBag,
  IconCash,
  IconCheck,
  IconNoApp,
  IconStore,
  IconUserOff,
  PhoneFrame,
} from "../components/Kit";
import { useSceneFrame } from "../components/Scene";
import { easeIn, easeInOut, easeOut, mix, pop, progress } from "../ease";
import { brand, colors, displayFont, fontFamily, FPS, sceneBg } from "../theme";
import { cueStart, wordAt } from "../timeline";

/** Séquence 4 — sur place : je scanne, je choisis, je commande. Sans compte, paiement en espèces. */
export const PHONE = { x: 770, y: 250, w: 400, h: 700 };

/** Motif de QR code déterministe (décoratif) avec ses trois repères d'angle. */
const N = 25;
const QR_CELLS = (() => {
  let s = 7;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const cells: [number, number][] = [];
  const finder = (x: number, y: number) => x < 8 && y < 8;
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      if (finder(x, y) || finder(N - 1 - x, y) || finder(x, N - 1 - y)) continue;
      if (rnd() > 0.52) cells.push([x, y]);
    }
  }
  return cells;
})();
export const Qr: React.FC<{ size: number; color?: string }> = ({ size, color = "#1a1410" }) => (
  <svg width={size} height={size} viewBox={`0 0 ${N} ${N}`} shapeRendering="crispEdges">
    <rect width={N} height={N} fill="#fff" />
    {[
      [0, 0],
      [N - 7, 0],
      [0, N - 7],
    ].map(([x, y]) => (
      <g key={`${x}-${y}`}>
        <rect x={x} y={y} width={7} height={7} fill={color} />
        <rect x={x + 1} y={y + 1} width={5} height={5} fill="#fff" />
        <rect x={x + 2} y={y + 2} width={3} height={3} fill={color} />
      </g>
    ))}
    {QR_CELLS.map(([x, y]) => (
      <rect key={`${x}.${y}`} x={x} y={y} width={1} height={1} fill={color} />
    ))}
  </svg>
);

const DISHES = [
  { name: "Riz gras au bœuf", desc: "Sauce tomate, bœuf et légumes", price: "2 000 FCFA", img: "plat-riz-gras" },
  { name: "Riz sauce feuille", desc: "Feuilles de patate douce, poisson fumé", price: "1 750 FCFA", img: "plat-sauce-feuille" },
  { name: "Tiguadèguè na au poulet", desc: "Sauce d'arachide onctueuse", price: "2 000 FCFA", img: "plat-tiguadegue" },
];

const ScreenMenu: React.FC<{ f: number; adds: number[]; cartIn: number }> = ({ f, adds, cartIn }) => {
  const count = adds.filter((a) => f >= a).length;
  return (
    <div style={{ position: "absolute", inset: 0, background: "#faf9f7", fontFamily, color: "#292622" }}>
      <div style={{ height: 150, background: "linear-gradient(135deg, #ff4b00, #ff7a12)", padding: "64px 24px 0", boxSizing: "border-box" }}>
        <div style={{ fontFamily: displayFont, fontSize: 30, fontWeight: 800, color: "#fff7ef", letterSpacing: "-0.02em" }}>Saveurs de Ségou</div>
        <div style={{ display: "inline-flex", marginTop: 6, padding: "4px 12px", borderRadius: 999, background: "#fff7ef", fontSize: 16, fontWeight: 700, color: "#a83a00" }}>
          Sur place · Table 3
        </div>
      </div>
      <div style={{ padding: "18px 18px 0", fontFamily: displayFont, fontSize: 24, fontWeight: 750 }}>Au riz</div>
      {DISHES.map((d, i) => {
        const at = adds[i];
        const pressed = at !== undefined ? progress(f, at - 2, 6, easeOut) * (1 - progress(f, at + 6, 10, easeOut)) : 0;
        const added = at !== undefined && f >= at;
        return (
          <div key={d.name} style={{ display: "flex", gap: 12, alignItems: "center", padding: "12px 18px", borderBottom: "1px solid #dedad4" }}>
            <Img src={staticFile(`screens/${d.img}.jpg`)} style={{ width: 74, height: 74, borderRadius: 14, objectFit: "cover" }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 18, fontWeight: 700, lineHeight: 1.15 }}>{d.name}</div>
              <div style={{ fontSize: 13.5, color: "#807970", marginTop: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{d.desc}</div>
              <div style={{ fontSize: 16, fontWeight: 700, marginTop: 4 }}>{d.price}</div>
            </div>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 21,
                background: added ? "#3f7a24" : "#ff4b00",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 28,
                fontWeight: 700,
                transform: `scale(${1 - pressed * 0.2})`,
                boxShadow: `0 0 0 ${pressed * 10}px rgba(255,75,0,0.25)`,
              }}
            >
              {added ? "✓" : "+"}
            </div>
          </div>
        );
      })}
      {/* barre panier, comme sur la page réelle */}
      <div
        style={{
          position: "absolute",
          left: 12,
          right: 12,
          bottom: 14,
          padding: "14px 16px",
          borderRadius: 22,
          background: "#ffffff",
          boxShadow: "0 -6px 30px rgba(41,38,34,0.15)",
          display: "flex",
          alignItems: "center",
          gap: 12,
          transform: `translateY(${mix(cartIn, 120, 0)}px)`,
        }}
      >
        <div style={{ position: "relative", width: 40, height: 40, borderRadius: 20, background: "#fff0ea", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <IconBag size={22} color="#ff4b00" />
          <div style={{ position: "absolute", top: -6, right: -6, width: 22, height: 22, borderRadius: 11, background: "#ff4b00", color: "#fff", fontSize: 13, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {count}
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 18, fontWeight: 800 }}>{count >= 2 ? "3 750 FCFA" : "2 000 FCFA"}</div>
          <div style={{ fontSize: 12, color: "#807970" }}>Estimation, confirmée à la validation</div>
        </div>
        <div style={{ padding: "10px 16px", borderRadius: 14, background: "#ff4b00", color: "#fff", fontSize: 16, fontWeight: 700 }}>Commander</div>
      </div>
    </div>
  );
};

const ScreenCheckout: React.FC<{ press: number; done: number }> = ({ press, done }) => (
  <div style={{ position: "absolute", inset: 0, background: "#faf9f7", fontFamily, color: "#292622", padding: "70px 22px 0", boxSizing: "border-box" }}>
    <div style={{ fontFamily: displayFont, fontSize: 34, fontWeight: 800, letterSpacing: "-0.03em" }}>Votre commande</div>
    <div style={{ fontSize: 16, color: "#625c55", marginTop: 4 }}>chez Saveurs de Ségou</div>
    <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.14em", color: "#807970", marginTop: 22 }}>MODE DE COMMANDE</div>
    <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
      {["Sur place", "À emporter", "Livraison"].map((m, i) => (
        <div
          key={m}
          style={{
            flex: 1,
            padding: "10px 8px",
            borderRadius: 14,
            border: `1.5px solid ${i === 0 ? "#ff4b00" : "#dedad4"}`,
            background: i === 0 ? "#fff0ea" : "#fff",
            fontSize: 14,
            fontWeight: 700,
            textAlign: "center",
          }}
        >
          {m}
        </div>
      ))}
    </div>
    <div style={{ fontSize: 15, fontWeight: 700, marginTop: 20 }}>Numéro de table</div>
    <div style={{ marginTop: 6, padding: "12px 14px", borderRadius: 12, border: "1.5px solid #dedad4", background: "#fff", fontSize: 17 }}>
      3 <span style={{ fontSize: 13, color: "#807970" }}>· prérempli par le QR code</span>
    </div>
    <div style={{ marginTop: 20, padding: 14, borderRadius: 16, background: "#fff", border: "1.5px solid #dedad4", fontSize: 15 }}>
      {[
        ["Riz gras au bœuf", "2 000 FCFA"],
        ["Riz sauce feuille", "1 750 FCFA"],
      ].map(([a, b]) => (
        <div key={a} style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span>{a}</span>
          <b>{b}</b>
        </div>
      ))}
      <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #dedad4", paddingTop: 8, fontSize: 18, fontWeight: 800 }}>
        <span>Sous-total</span>
        <span>3 750 FCFA</span>
      </div>
    </div>
    <div
      style={{
        marginTop: 18,
        padding: "16px 0",
        borderRadius: 16,
        background: "#ff4b00",
        color: "#fff",
        textAlign: "center",
        fontSize: 18,
        fontWeight: 700,
        transform: `scale(${1 - press * 0.05})`,
        boxShadow: `0 0 0 ${press * 12}px rgba(255,75,0,0.2)`,
      }}
    >
      Envoyer la commande
    </div>
    {/* confirmation */}
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: `rgba(250,249,247,${0.96 * done})`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        opacity: done,
      }}
    >
      <div style={{ transform: `scale(${done})` }}>
        <IconCheck size={110} />
      </div>
      <div style={{ fontFamily: displayFont, fontSize: 30, fontWeight: 800 }}>Commande envoyée</div>
      <div style={{ fontSize: 16, color: "#625c55" }}>Table 3 · 3 750 FCFA</div>
    </div>
  </div>
);

export const Order: React.FC = () => {
  const f = useSceneFrame();
  const w = (word: string, nth = 0) => wordAt("order1", word, nth);
  const w2 = (word: string) => wordAt("order2", word);
  const phoneIn = progress(f, 2, 26, easeOut);
  const tent = progress(f, 6, 24, easeOut);
  const tentOut = progress(f, cueStart("order2") - 6, 16, easeIn);

  // déroulé de l'écran du téléphone
  const scanAt = w("scanne") + 4;
  const scanned = w("code") + 2;
  const menuAt = w("choisit") - 8;
  const adds = [w("choisit") + 2, w("plats") + 2];
  const checkoutAt = w("commande") - 10;
  const press = progress(f, w("commande") - 2, 5, easeOut) * (1 - progress(f, w("commande") + 4, 8, easeOut));
  const done = progress(f, w("commande") + 6, 14, easeOut);
  const menuSlide = progress(f, menuAt, 14, easeInOut);
  const checkoutSlide = progress(f, checkoutAt, 14, easeInOut);
  const scanLine = (((f - scanAt) / FPS) * 1.6) % 1;
  const flash = progress(f, scanned, 4, easeOut) * (1 - progress(f, scanned + 4, 10, easeOut));
  const qrZoom = progress(f, 10, scanAt, easeInOut);

  const badges = [
    { label: "Sans compte", sub: "Ni inscription, ni mot de passe", Icon: IconUserOff, at: w2("compte") },
    { label: "Sans application", sub: "Tout se passe dans le navigateur", Icon: IconNoApp, at: w2("application") },
    { label: "Paiement en espèces", sub: "Directement au restaurant", Icon: IconCash, at: w2("espèces") },
  ];

  return (
    <AbsoluteFill style={{ background: sceneBg("light", "45% 55%"), fontFamily }}>
      <Headline
        frame={f}
        step="03"
        label="Sur place"
        parts={[
          { text: "Je scanne.", at: w("scanne") - 2 },
          { text: "Je choisis.", at: w("choisit") - 2 },
          { text: "Je commande.", at: w("commande") - 2, accent: true },
        ]}
      />

      {/* chevalet de table avec son QR code */}
      {tentOut < 1 && (
        <Card
          style={{
            left: 190,
            top: 320,
            width: 440,
            padding: "30px 34px",
            background: brand.cream,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 14,
            opacity: tent * (1 - tentOut),
            transform: `translateY(${mix(tent, 60, 0)}px) translateX(${-tentOut * 120}px) rotate(${mix(tent, -6, -2)}deg)`,
          }}
        >
          <BrandLogo height={70} />
          <div style={{ fontFamily: displayFont, fontSize: 44, fontWeight: 800, color: "#1a1410", letterSpacing: "-0.02em" }}>Table 3</div>
          <div style={{ padding: 14, background: "#fff", borderRadius: 18, boxShadow: "0 8px 24px rgba(41,38,34,0.12)" }}>
            <Qr size={230} />
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#625c55", textAlign: "center" }}>Scannez pour voir la carte et commander</div>
        </Card>
      )}

      {/* téléphone */}
      <PhoneFrame
        width={PHONE.w}
        height={PHONE.h}
        style={{ left: PHONE.x, top: PHONE.y, opacity: phoneIn, transform: `translateY(${mix(phoneIn, 80, 0)}px) rotate(${mix(phoneIn, 4, 0)}deg)` }}
      >
        {/* caméra : visée du QR */}
        <div style={{ position: "absolute", inset: 0, background: "#2b241f", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ transform: `scale(${mix(qrZoom, 0.7, 1)}) rotate(${mix(qrZoom, -8, -2)}deg)`, padding: 12, background: "#fff", borderRadius: 12 }}>
            <Qr size={220} />
          </div>
          <svg width={300} height={300} style={{ position: "absolute" }}>
            {[
              "M 10 60 V 10 H 60",
              "M 240 10 H 290 V 60",
              "M 10 240 V 290 H 60",
              "M 240 290 H 290 V 240",
            ].map((d) => (
              <path key={d} d={d} stroke={f >= scanned ? "#7cc35a" : "#fff7ef"} strokeWidth={8} strokeLinecap="round" fill="none" />
            ))}
            {f >= scanAt && f < scanned && <rect x={16} y={20 + scanLine * 260} width={268} height={4} rx={2} fill="#ff4b00" opacity={0.9} />}
          </svg>
          <div style={{ position: "absolute", bottom: 60, color: "#fff7ef", fontSize: 18, fontWeight: 700 }}>
            {f >= scanned ? "Table 3 · Saveurs de Ségou" : "Visez le QR code de la table"}
          </div>
          <div style={{ position: "absolute", inset: 0, background: "#fff", opacity: flash * 0.7 }} />
        </div>
        {/* carte du restaurant */}
        <div style={{ position: "absolute", inset: 0, transform: `translateX(${mix(menuSlide, 100, 0)}%)` }}>
          <ScreenMenu f={f} adds={adds} cartIn={progress(f, adds[0], 12, easeOut)} />
        </div>
        {/* validation */}
        <div style={{ position: "absolute", inset: 0, transform: `translateX(${mix(checkoutSlide, 100, 0)}%)` }}>
          <ScreenCheckout press={press} done={done} />
        </div>
      </PhoneFrame>

      {/* sans compte, sans application, en espèces */}
      {badges.map((b, i) => {
        const p = Math.max(0, pop(f, b.at - 4, 12, 170));
        return (
          <Card
            key={b.label}
            style={{
              left: 150,
              top: 330 + i * 150,
              width: 540,
              padding: "20px 24px",
              display: "flex",
              alignItems: "center",
              gap: 20,
              transform: `translateX(${mix(Math.min(1, p), -60, 0)}px) scale(${mix(Math.min(1, p), 0.9, 1)})`,
              opacity: Math.min(1, p),
            }}
          >
            <div style={{ width: 70, height: 70, borderRadius: 20, background: colors.brandSoft, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <b.Icon size={38} color={colors.brand} />
            </div>
            <div>
              <div style={{ fontFamily: displayFont, fontSize: 32, fontWeight: 750, letterSpacing: "-0.02em" }}>{b.label}</div>
              <div style={{ fontSize: 20, color: colors.inkMuted, marginTop: 2 }}>{b.sub}</div>
            </div>
          </Card>
        );
      })}

      {/* mode de commande choisi */}
      <div
        style={{
          position: "absolute",
          left: PHONE.x + PHONE.w + 40,
          top: 420,
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "12px 20px",
          borderRadius: 999,
          background: colors.surface,
          border: `1.5px solid ${colors.line}`,
          boxShadow: `0 14px 30px ${colors.shadow}`,
          fontSize: 22,
          fontWeight: 700,
          color: colors.ink,
          opacity: progress(f, checkoutAt + 6, 12, easeOut) * (1 - progress(f, cueStart("order2") + 10, 12, easeIn)),
        }}
      >
        <IconStore size={24} color={colors.brand} /> Sur place · à emporter · livraison
      </div>
    </AbsoluteFill>
  );
};
