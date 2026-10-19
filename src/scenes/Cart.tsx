import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { PanierScreen } from "../components/App";
import { Eyebrow, Kinetic, StudioBg, Tap, useVertical } from "../components/Fx";
import { IconBike, IconCheck } from "../components/Icons";
import { Phone } from "../components/Phone";
import { C, font } from "../theme";
import { bar, easeInOut, mix, pop, prog, word } from "../timing";

/** Mesures 14–18 : le panier. La ligne « Livraison — Gratuite » est l'argument : on la sort de l'écran. */
export const CART_TAP = () => bar(17.25);
const ROW = { x: 200, y: 440 };

export const Cart: React.FC = () => {
  const f = useCurrentFrame();
  const v = useVertical();
  const s = bar(14);
  const free = word("cart", "gratuite");
  const enter = prog(f, s - 6, 24, easeInOut);
  const hl = prog(f, free - 4, 12);
  const zoom = prog(f, word("cart", "livraison") - 6, 20, easeInOut) * (1 - prog(f, bar(16.75), 16, easeInOut));
  const stamp = pop(f, free, 9, 200);
  const chip1 = pop(f, word("cart", "partout"), 12, 170);
  const chip2 = pop(f, word("cart", "sans"), 12, 170);
  const tapAt = CART_TAP();
  const press = interpolate(f, [tapAt - 3, tapAt, tapAt + 5], [0, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const pw = v ? 600 : 450;
  const k = pw / 426;
  // la caméra cadre la ligne Livraison : on recentre le téléphone sur elle pendant le zoom
  const dy = (434 - ROW.y) * k * zoom * 0.9;

  return (
    <AbsoluteFill>
      <StudioBg tint={C.green} />
      <AbsoluteFill style={{ perspective: 2000, display: "flex", flexDirection: "row", alignItems: "center", justifyContent: v ? "center" : "flex-start", paddingLeft: v ? 0 : 220 }}>
        <div
          style={{
            position: "relative",
            transform: [
              `translateY(${v ? 430 : 20 + dy}px)`,
              `translateX(${mix(enter, -500, 0)}px)`,
              `rotateY(${mix(enter, 40, v ? 10 : 14) - zoom * 8}deg)`,
              `rotateX(${mix(enter, 10, 4)}deg)`,
              `scale(${mix(zoom, 1, v ? 1.2 : 1.55)})`,
            ].join(" "),
          }}
        >
          <Phone width={pw} glare={mix(enter, 1, 0.4)}>
            <PanierScreen highlight={hl} press={press} />
          </Phone>
          <div style={{ position: "absolute", inset: 0 }}>
            <Tap x={(13 + 200) * k} y={(13 + 580) * k} at={tapAt} size={78} />
          </div>
        </div>
      </AbsoluteFill>

      <div style={{ position: "absolute", fontFamily: font, ...(v ? { left: 80, right: 80, top: 140 } : { right: 120, width: 820, top: 190 }) }}>
        <Eyebrow n="03" label="Le panier" at={s + 2} />
        <div style={{ marginTop: 20 }}>
          <Kinetic
            align="left"
            size={v ? 78 : 70}
            words={[
              { t: "La", at: word("cart", "la") },
              { t: "livraison", at: word("cart", "livraison") },
              { t: "est", at: word("cart", "est") },
            ]}
          />
        </div>
        {/* tampon « GRATUITE » */}
        <div
          style={{
            marginTop: 6,
            display: "inline-flex",
            alignItems: "center",
            gap: 20,
            fontSize: v ? 150 : 130,
            fontWeight: 900,
            letterSpacing: -6,
            color: C.green,
            lineHeight: 1,
            transform: `scale(${mix(stamp, 2.2, 1)}) rotate(${mix(stamp, 8, -3)}deg)`,
            transformOrigin: "0 50%",
            opacity: Math.min(1, stamp * 3),
            textShadow: "0 16px 40px rgba(16,163,127,0.25)",
          }}
        >
          GRATUITE
          <span style={{ width: v ? 110 : 96, height: v ? 110 : 96, borderRadius: "50%", background: C.green, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${pop(f, free + 6, 9, 220)})` }}>
            <IconCheck size={v ? 70 : 60} color="#fff" stroke={3.4} />
          </span>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginTop: 34 }}>
          {[
            { p: chip1, t: "partout à Bamako", I: true },
            { p: chip2, t: "sans minimum d'achat", I: false },
          ].map((c) => (
            <span
              key={c.t}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 12,
                padding: "18px 26px",
                borderRadius: 40,
                background: c.I ? C.brand : "#fff",
                color: c.I ? "#fff" : C.ink,
                border: c.I ? "none" : `2px solid ${C.line}`,
                fontSize: v ? 40 : 34,
                fontWeight: 800,
                boxShadow: "0 16px 40px rgba(15,23,42,0.12)",
                transform: `scale(${c.p}) translateY(${mix(c.p, 30, 0)}px)`,
              }}
            >
              {c.I && <IconBike size={v ? 40 : 34} color="#fff" stroke={2} />}
              {c.t}
            </span>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};
