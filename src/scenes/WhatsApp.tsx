import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { CheckoutScreen, WhatsAppScreen } from "../components/App";
import { Eyebrow, Kinetic, StudioBg, Tap, useVertical } from "../components/Fx";
import { IconWhatsApp } from "../components/Icons";
import { Phone } from "../components/Phone";
import { C, DEMO, font } from "../theme";
import { bar, easeInOut, mix, pop, prog, word } from "../timing";

/** Mesures 18–22 : formulaire court, envoi, bascule sur WhatsApp avec le message déjà rédigé. */
export const WA_TAP = () => word("whatsapp", "comme") - 2;

export const WhatsApp: React.FC = () => {
  const f = useCurrentFrame();
  const v = useVertical();
  const s = bar(18);
  const tapAt = WA_TAP();
  const enter = prog(f, s - 6, 22, easeInOut);
  const typed = prog(f, s, 16, (x) => x);
  const press = interpolate(f, [tapAt - 3, tapAt, tapAt + 5], [0, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const sw = prog(f, tapAt + 4, 14, easeInOut); // bascule vers WhatsApp
  const reveal = prog(f, tapAt + 12, 26, (x) => x);
  const numAt = word("whatsapp", "numero");
  const glow = prog(f, numAt - 2, 10) * (1 - prog(f, bar(21.6), 10));
  const callout = pop(f, numAt + 2, 11, 160);
  const pw = v ? 620 : 460;
  const k = pw / 426;
  const zoom = prog(f, numAt - 8, 24, easeInOut);

  return (
    <AbsoluteFill>
      <StudioBg tint={C.wa} />
      <AbsoluteFill style={{ perspective: 2000, display: "flex", flexDirection: "row", alignItems: "center", justifyContent: v ? "center" : "flex-end", paddingRight: v ? 0 : 280 }}>
        <div
          style={{
            position: "relative",
            transform: [
              `translateY(${v ? mix(zoom, 250, 330) : 20}px)`,
              `translateX(${mix(enter, 0, 0) + (v ? mix(zoom, 0, -60) : 0)}px)`,
              `rotateY(${mix(enter, -25, v ? -8 : -12) + sw * (v ? 14 : 4)}deg)`,
              `rotateX(${mix(enter, 20, 4)}deg)`,
              `scale(${mix(enter, 0.7, 1) * mix(zoom, 1, 1.12)})`,
            ].join(" "),
          }}
        >
          <Phone width={pw} glare={mix(sw, 0.3, 0.8)}>
            <div style={{ position: "absolute", inset: 0, transform: `translateX(${-sw * 30}%)`, opacity: 1 - sw * 0.6 }}>
              <CheckoutScreen typed={typed} press={press} />
            </div>
            <div style={{ position: "absolute", inset: 0, transform: `translateX(${(1 - sw) * 100}%)`, boxShadow: "-20px 0 40px rgba(0,0,0,0.4)" }}>
              <WhatsAppScreen reveal={reveal} glowOrder={glow} sent={f > tapAt + 40 ? 1 : 0} />
            </div>
          </Phone>
          <div style={{ position: "absolute", inset: 0 }}>
            <Tap x={(13 + 200) * k} y={(13 + 634) * k} at={tapAt} size={80} />
          </div>
        </div>
      </AbsoluteFill>
      {/* le numéro de commande, sorti du message */}
      <div
        style={{
          position: "absolute",
          ...(v ? { right: 70, top: 640 } : { left: 220, top: 640 }),
          transform: `scale(${callout}) rotate(${mix(callout, 10, 3)}deg)`,
          transformOrigin: v ? "100% 50%" : "0 50%",
          padding: "20px 28px",
          borderRadius: 22,
          background: "#005c4b",
          color: "#fff",
          fontFamily: font,
          boxShadow: "0 30px 60px rgba(7,94,84,0.35)",
          border: `3px solid ${C.wa}`,
        }}
      >
        <div style={{ fontSize: 24, fontWeight: 600, opacity: 0.8 }}>Commande n°</div>
        <div style={{ fontSize: v ? 64 : 56, fontWeight: 900, letterSpacing: -1 }}>{DEMO.order}</div>
      </div>
      <div style={{ position: "absolute", fontFamily: font, ...(v ? { left: 80, right: 80, top: 140 } : { left: 150, width: 800, top: 200 }) }}>
        <Eyebrow n="04" label="La commande" at={s + 2} />
        <div style={{ marginTop: 20 }}>
          <Kinetic
            align="left"
            size={v ? 80 : 72}
            words={[
              { t: "Vous", at: word("whatsapp", "vous") },
              { t: "commandez", at: word("whatsapp", "commandez") },
              { t: "\n", at: 0 },
              { t: "comme", at: word("whatsapp", "comme") },
              { t: "d'habitude,", at: word("whatsapp", "habitude") - 3 },
            ]}
          />
        </div>
        <div
          style={{
            marginTop: 18,
            display: "inline-flex",
            alignItems: "center",
            gap: 18,
            padding: "16px 28px 16px 20px",
            borderRadius: 50,
            background: C.wa,
            color: "#fff",
            fontSize: v ? 58 : 50,
            fontWeight: 900,
            transform: `scale(${pop(f, word("whatsapp", "WhatsApp"), 10, 180)})`,
            transformOrigin: "0 50%",
            boxShadow: "0 20px 50px rgba(37,211,102,0.4)",
          }}
        >
          <IconWhatsApp size={v ? 66 : 56} /> sur WhatsApp
        </div>
      </div>
    </AbsoluteFill>
  );
};
