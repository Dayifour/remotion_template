import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Eyebrow, Kinetic, StudioBg, useVertical } from "../components/Fx";
import { IconCash, IconCheck, IconPhone } from "../components/Icons";
import { C, DEMO, font } from "../theme";
import { bar, beatPulse, easeInOut, mix, pop, prog, word } from "../timing";

/** Mesures 36–40 : le colis arrive, on paie à la livraison — espèces, Orange Money ou Wave. */
export const PAY_EVENTS = () => ({
  drop: bar(36.25),
  cards: [word("pay", "livraison"), word("pay", "Orange"), word("pay", "Ouève")],
});

/** Colis en 3D (CSS), ruban orange de la marque. */
const Parcel: React.FC<{ size: number }> = ({ size }) => {
  const h = size / 2;
  const face: React.CSSProperties = { position: "absolute", width: size, height: size, left: 0, top: 0, background: "linear-gradient(135deg,#d9a46b,#b9824a)", border: "1px solid rgba(0,0,0,0.08)" };
  const tape = <div style={{ position: "absolute", left: size * 0.42, top: 0, width: size * 0.16, height: "100%", background: C.brand, opacity: 0.95 }} />;
  return (
    <div style={{ width: size, height: size, position: "relative", transformStyle: "preserve-3d" }}>
      <div style={{ ...face, transform: `translateZ(${h}px)` }}>
        {tape}
        <div style={{ position: "absolute", left: size * 0.08, bottom: size * 0.1, padding: "6px 12px", borderRadius: 6, background: "#fff", fontFamily: font, fontWeight: 800, fontSize: size * 0.07, color: C.ink }}>
          #{DEMO.order}
        </div>
      </div>
      <div style={{ ...face, transform: `rotateY(90deg) translateZ(${h}px)`, filter: "brightness(0.8)" }}>{tape}</div>
      <div style={{ ...face, transform: `rotateX(90deg) translateZ(${h}px)`, filter: "brightness(1.12)" }}>
        <div style={{ position: "absolute", top: size * 0.42, left: 0, height: size * 0.16, width: "100%", background: C.brand }} />
        {tape}
      </div>
    </div>
  );
};

export const Pay: React.FC = () => {
  const f = useCurrentFrame();
  const v = useVertical();
  const s = bar(36);
  const ev = PAY_EVENTS();
  const drop = pop(f, ev.drop, 9, 130);
  const spin = prog(f, s, bar(40) - s, (x) => x);
  const badge = pop(f, ev.drop + 10, 10, 200);
  const size = v ? 300 : 280;
  const cards = [
    { t: "À la livraison", sub: "en espèces, de la main à la main", bg: C.ink, fg: "#fff", I: IconCash, acc: "#fff" },
    { t: "Orange Money", sub: "paiement mobile", bg: "#000", fg: "#fff", I: IconPhone, acc: "#ff7900" },
    { t: "Wave", sub: "paiement mobile", bg: "#1dc8ff", fg: C.ink, I: IconPhone, acc: C.ink },
  ];
  const out = prog(f, bar(39.6), 8, easeInOut);
  return (
    <AbsoluteFill>
      <StudioBg />
      <div style={{ position: "absolute", fontFamily: font, ...(v ? { left: 80, right: 80, top: 140 } : { left: 140, width: 820, top: 160 }) }}>
        <Eyebrow n="07" label="La livraison" at={s + 2} />
        <div style={{ marginTop: 20 }}>
          <Kinetic
            align="left"
            size={v ? 84 : 76}
            words={[
              { t: "Vous", at: word("pay", "Vous") },
              { t: "payez", at: word("pay", "payez") },
              { t: "\n", at: 0 },
              { t: "à", at: word("pay", "a") },
              { t: "la", at: word("pay", "la") },
              { t: "livraison.", at: word("pay", "livraison"), color: C.brand },
            ]}
          />
        </div>
      </div>
      {/* le colis tombe et se pose */}
      <div style={{ position: "absolute", ...(v ? { left: 540 - size / 2, top: 470 } : { left: 1380 - size / 2, top: 200 }), perspective: 1400 }}>
        <div style={{ transform: `translateY(${mix(drop, -900, 0)}px) rotateX(-18deg) rotateY(${mix(spin, -30, -60)}deg) rotateZ(${mix(drop, 20, 0)}deg)`, transformStyle: "preserve-3d" }}>
          <Parcel size={size} />
        </div>
        <div style={{ position: "absolute", left: -40, right: -40, top: size * 1.15, height: 50, borderRadius: "50%", background: "radial-gradient(closest-side, rgba(15,23,42,0.3), transparent)", transform: `scale(${drop})` }} />
        <div
          style={{
            position: "absolute",
            right: -70,
            top: -40,
            padding: "14px 24px",
            borderRadius: 40,
            background: C.green,
            color: "#fff",
            fontFamily: font,
            fontWeight: 800,
            fontSize: 36,
            display: "flex",
            gap: 10,
            alignItems: "center",
            transform: `scale(${badge}) rotate(8deg)`,
            boxShadow: "0 16px 40px rgba(16,163,127,0.4)",
          }}
        >
          <IconCheck size={34} color="#fff" stroke={3.2} /> Livrée
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          display: "flex",
          flexDirection: "column",
          gap: v ? 26 : 22,
          ...(v ? { left: 80, right: 80, top: 900 } : { left: 140, width: 760, top: 520 }),
          opacity: 1 - out,
        }}
      >
        {cards.map((c, i) => {
          const p = pop(f, ev.cards[i] - 2, 11, 170);
          const lit = f >= ev.cards[i] ? beatPulse(f) * 0.04 : 0;
          return (
            <div
              key={c.t}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 26,
                padding: v ? "28px 34px" : "22px 30px",
                borderRadius: 28,
                background: c.bg,
                color: c.fg,
                fontFamily: font,
                boxShadow: "0 24px 50px rgba(15,23,42,0.22)",
                transform: `translateX(${mix(p, i % 2 ? 600 : -600, 0)}px) rotate(${mix(p, i % 2 ? 6 : -6, 0)}deg) scale(${1 + lit})`,
                opacity: Math.min(1, p * 2),
              }}
            >
              <span style={{ width: v ? 84 : 70, height: v ? 84 : 70, borderRadius: 22, background: c.acc, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <c.I size={v ? 46 : 38} color={c.bg} stroke={2.2} />
              </span>
              <span>
                <div style={{ fontSize: v ? 52 : 44, fontWeight: 900, letterSpacing: -1.5 }}>{c.t}</div>
                <div style={{ fontSize: v ? 28 : 24, fontWeight: 500, opacity: 0.75 }}>{c.sub}</div>
              </span>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
