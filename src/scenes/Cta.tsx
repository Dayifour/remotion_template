import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Dust, useVertical } from "../components/Fx";
import { IconBike, IconCart, IconPhone, IconWhatsApp } from "../components/Icons";
import { C, DEMO, font } from "../theme";
import { bar, DURATION, easeInOut, mix, pop, prog, word } from "../timing";
import { OrangeBg } from "./Reveal";

/** Mesure 40 → fin : logo sur fond orange, adresse du site, téléphone de la boutique. */
export const CTA_EVENTS = () => ({ logo: bar(40) + 2, site: word("cta", "Sur"), app: word("cta", "application") });

export const Cta: React.FC = () => {
  const f = useCurrentFrame();
  const v = useVertical();
  const ev = CTA_EVENTS();
  const badge = pop(f, ev.logo, 10, 140);
  const site = pop(f, ev.site, 11, 170);
  const app = pop(f, ev.app - 2, 11, 170);
  const phone = pop(f, ev.app + 14, 11, 170);
  const promise = prog(f, bar(43), 20);
  const drift = prog(f, bar(40), DURATION - bar(40), (x) => x);
  const fadeOut = prog(f, DURATION - 24, 24, easeInOut);
  const k = v ? 1 : 0.82;
  const chip = (p: number, children: React.ReactNode, bg: string, fg: string, big = false): React.ReactNode => (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 16 * k,
        padding: `${(big ? 24 : 18) * k}px ${(big ? 40 : 30) * k}px`,
        borderRadius: 60,
        background: bg,
        color: fg,
        fontSize: (big ? 64 : 40) * k,
        fontWeight: big ? 900 : 700,
        letterSpacing: big ? -2 : 0,
        transform: `scale(${p}) translateY(${mix(p, 40, 0)}px)`,
        opacity: Math.min(1, p * 2),
        boxShadow: big ? "0 30px 70px rgba(120,20,0,0.35)" : "none",
      }}
    >
      {children}
    </div>
  );
  return (
    <AbsoluteFill style={{ opacity: 1 - fadeOut }}>
      <OrangeBg f={f} />
      <Dust count={50} opacity={0.5} />
      <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: font, color: "#fff", gap: 0, transform: `scale(${mix(drift, 1, 1.05)})` }}>
        <div style={{ display: "flex", flexDirection: v ? "column" : "row", alignItems: "center", gap: 40 * k }}>
          <div
            style={{
              width: 200 * k,
              height: 200 * k,
              borderRadius: 56 * k,
              background: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transform: `scale(${badge}) rotate(${mix(badge, 30, 0)}deg)`,
              boxShadow: "0 40px 90px rgba(120,20,0,0.35)",
            }}
          >
            <IconCart size={124 * k} color={C.brand} stroke={2.2} />
          </div>
          <div style={{ fontSize: 140 * k, fontWeight: 800, letterSpacing: -5, lineHeight: 1, opacity: prog(f, ev.logo + 4, 12), transform: `translateY(${mix(prog(f, ev.logo + 4, 16), 40, 0)}px)` }}>
            Yelen <span style={{ fontWeight: 400 }}>Sugu</span>
          </div>
        </div>
        <div style={{ marginTop: 70 * k, display: "flex", flexDirection: "column", alignItems: "center", gap: 26 * k }}>
          {chip(site, <span style={{ color: C.brand }}>{DEMO.site}</span>, "#fff", C.brand, true)}
          <div style={{ display: "flex", gap: 20 * k, flexWrap: "wrap", justifyContent: "center" }}>
            {chip(app, <><IconPhone size={44 * k} color="#fff" stroke={2} /> Application Android</>, "rgba(255,255,255,0.16)", "#fff")}
            {chip(phone, <><IconWhatsApp size={44 * k} color="#fff" /> {DEMO.shopPhone}</>, "rgba(255,255,255,0.16)", "#fff")}
          </div>
        </div>
        <div style={{ marginTop: 60 * k, display: "flex", alignItems: "center", gap: 14, fontSize: 34 * k, fontWeight: 600, opacity: promise * 0.95, transform: `translateY(${mix(promise, 20, 0)}px)` }}>
          <IconBike size={38 * k} color="#fff" stroke={2} /> Livraison gratuite partout à Bamako
        </div>
        <div style={{ marginTop: 18 * k, fontSize: 30 * k, fontStyle: "italic", fontWeight: 500, opacity: promise * 0.8 }}>« Nous sommes prêts à la négociation »</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
