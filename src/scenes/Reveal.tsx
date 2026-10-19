import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Dust, Kinetic, useVertical } from "../components/Fx";
import { IconCart } from "../components/Icons";
import { C, font } from "../theme";
import { bar, beatPulse, easeOut, mix, pop, prog, word } from "../timing";

/** Mesure 4 — le drop : fond orange, la marque Yelen Sugu entre sur le temps fort. */
export const OrangeBg: React.FC<{ f: number }> = ({ f }) => {
  const pulse = beatPulse(f);
  return (
    <AbsoluteFill style={{ background: `radial-gradient(120% 90% at 50% 40%, #ff6a1f 0%, ${C.brand} 35%, ${C.brandDeep1} 65%, ${C.brandDeep2} 100%)`, overflow: "hidden" }}>
      {[0, 1, 2, 3].map((i) => {
        const r = 600 + i * 360 + pulse * 30;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: "50%",
              top: "46%",
              width: r,
              height: r,
              marginLeft: -r / 2,
              marginTop: -r / 2,
              borderRadius: "50%",
              border: `${2 + (i === 0 ? pulse * 3 : 0)}px solid rgba(255,255,255,${0.16 - i * 0.03})`,
            }}
          />
        );
      })}
      <AbsoluteFill style={{ background: "radial-gradient(60% 40% at 50% 46%, rgba(255,255,255,0.18), transparent 70%)" }} />
    </AbsoluteFill>
  );
};

export const Reveal: React.FC = () => {
  const f = useCurrentFrame();
  const v = useVertical();
  const s = bar(4);
  const iris = prog(f, s, 10, easeOut);
  const badge = pop(f, s + 2, 10, 140);
  const name = prog(f, s + 6, 16);
  const sub = prog(f, s + 16, 16);
  const big = v ? 1 : 0.85;
  const savez = word("reveal", "savez");
  return (
    <AbsoluteFill style={{ clipPath: `circle(${mix(iris, 0, 150)}% at 50% 46%)` }}>
      <OrangeBg f={f} />
      <Dust count={40} opacity={0.5} />
      <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: font, color: "#fff", transform: `translateY(${v ? -60 : -30}px) scale(${mix(prog(f, s, bar(6) - s, (x) => x), 1, 1.06)})` }}>
        <div
          style={{
            width: 260 * big,
            height: 260 * big,
            borderRadius: 72 * big,
            background: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform: `scale(${badge}) rotate(${mix(badge, -25, 0)}deg)`,
            boxShadow: "0 40px 90px rgba(120,20,0,0.35)",
          }}
        >
          <div style={{ transform: `translateX(${mix(prog(f, s + 4, 14), -60, 0)}px)`, opacity: prog(f, s + 4, 8) }}>
            <IconCart size={160 * big} color={C.brand} stroke={2.2} />
          </div>
        </div>
        <div style={{ marginTop: 50 * big, fontSize: 150 * big, fontWeight: 800, letterSpacing: -6 * big, lineHeight: 1, display: "flex", overflow: "hidden", padding: "0 10px 14px" }}>
          {"Yelen Sugu".split("").map((ch, i) => {
            const p = prog(f, s + 5 + i * 1.6, 14);
            return (
              <span key={i} style={{ display: "inline-block", transform: `translateY(${mix(p, 110, 0)}%)`, fontWeight: i > 5 ? 400 : 800, whiteSpace: "pre" }}>
                {ch}
              </span>
            );
          })}
        </div>
        <div style={{ marginTop: 8, fontSize: 34 * big, fontWeight: 500, letterSpacing: "0.22em", textTransform: "uppercase", opacity: sub * 0.9, transform: `translateY(${mix(sub, 16, 0)}px)` }}>
          le marché de Yelen
        </div>
        <div style={{ marginTop: 70 * big, height: 130 * big }}>
          <Kinetic words={[{ t: "Vous", at: savez - 6 }, { t: "savez.", at: savez }]} size={118 * big} color="#fff" weight={900} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
