import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { OrdersScreen, STEPS } from "../components/App";
import { Eyebrow, Kinetic, StudioBg, useVertical } from "../components/Fx";
import { IconCheck } from "../components/Icons";
import { Phone } from "../components/Phone";
import { C, font } from "../theme";
import { bar, BEAT, easeInOut, line, mix, pop, prog, word } from "../timing";

/**
 * Mesures 28–36 : les cinq étapes, une par mesure, scandées par la voix et le beat.
 * Les deux premières sont déjà vertes (la confirmation vient d'arriver) : elles s'allument,
 * les trois suivantes passent au vert sur leur temps fort.
 */
export const STEP_BARS = [28, 29, 30, 31, 32];
const LABELS = ["En attente", "Confirmée", "En préparation", "En route", "Livrée !"];

export const Track: React.FC = () => {
  const f = useCurrentFrame();
  const v = useVertical();
  const s = bar(28);
  const at = STEP_BARS.map((b, i) => Math.round(line(`step${i + 1}`).start * 30) || bar(b));
  const current = at.reduce((n, t, i) => (f >= t - 2 ? i : n), -1);
  let done = 2;
  for (let i = 2; i < 5; i++) done += prog(f, at[i] - 2, 10);
  const datesAt = word("track", "datee");
  const dateGlow = prog(f, datesAt - 4, 12);
  const outro = prog(f, datesAt - 10, 26, easeInOut);
  const enter = prog(f, s - 6, 20, easeInOut);
  const pw = v ? 620 : 470;

  const big = current >= 0 && f < datesAt - 12 ? LABELS[current] : null;
  const bigP = current >= 0 ? pop(f, at[current] - 2, 10, 220) : 0;
  const greenCol = current >= 1;

  return (
    <AbsoluteFill>
      <StudioBg tint={C.green} />
      {/* frise de progression : se remplit d'une étape par mesure */}
      <div style={{ position: "absolute", ...(v ? { left: 90, right: 90, top: 470 } : { left: 140, width: 760, top: 860 }), height: 60, opacity: 1 - outro * 0.0 }}>
        <div style={{ position: "absolute", top: 26, left: 0, right: 0, height: 8, borderRadius: 4, background: "#e2e8f0" }} />
        <div style={{ position: "absolute", top: 26, left: 0, height: 8, borderRadius: 4, background: C.green, width: `${(Math.max(0, done - 1) / 4) * 100}%` }} />
        {STEPS.map((_, i) => {
          const p = Math.max(0, Math.min(1, done - i));
          const lit = current === i ? Math.exp(-Math.max(0, f - at[i]) / (BEAT * 2)) : 0;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: `${(i / 4) * 100}%`,
                top: 0,
                width: 60,
                height: 60,
                marginLeft: -30,
                borderRadius: 30,
                background: p > 0.5 ? C.green : "#fff",
                border: `4px solid ${p > 0.5 ? C.green : "#cbd5e1"}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transform: `scale(${1 + lit * 0.45})`,
                boxShadow: lit > 0 ? `0 0 ${50 * lit}px rgba(16,163,127,${lit})` : "none",
              }}
            >
              {p > 0.5 && <IconCheck size={34} color="#fff" stroke={3.4} />}
            </div>
          );
        })}
      </div>
      <AbsoluteFill style={{ perspective: 2000, display: "flex", flexDirection: "row", alignItems: "center", justifyContent: v ? "center" : "flex-end", paddingRight: v ? 0 : 260 }}>
        <div
          style={{
            transform: [
              `translateY(${v ? mix(outro, 420, 300) : 40}px)`,
              `translateX(${v ? 0 : mix(outro, 0, -40)}px)`,
              `rotateY(${mix(enter, -20, v ? -6 : -12) + outro * 6}deg)`,
              `rotateX(${v ? 6 : 3}deg)`,
              `scale(${mix(outro, 1, v ? 1.12 : 1.1)})`,
            ].join(" "),
          }}
        >
          <Phone width={pw} glare={0.5}>
            <OrdersScreen done={done} dateGlow={dateGlow} flash={current >= 0 ? Math.exp(-Math.max(0, f - at[current]) / 8) * 0.8 : 0} />
          </Phone>
        </div>
      </AbsoluteFill>
      <div style={{ position: "absolute", fontFamily: font, ...(v ? { left: 80, right: 80, top: 130 } : { left: 140, width: 900, top: 230 }) }}>
        <Eyebrow n="06" label="Le suivi" at={s + 2} />
        {big && (
          <div
            key={big}
            style={{
              marginTop: 24,
              fontSize: v ? (big.length > 12 ? 104 : 124) : 118,
              fontWeight: 900,
              letterSpacing: -5,
              lineHeight: 1,
              color: greenCol ? C.green : C.brand,
              transform: `scale(${mix(bigP, 1.5, 1)})`,
              transformOrigin: "0 50%",
              opacity: Math.min(1, bigP * 2),
              whiteSpace: "nowrap",
            }}
          >
            {big}
          </div>
        )}
        {f >= datesAt - 12 && (
          <div style={{ marginTop: 22 }}>
            <Kinetic
              align="left"
              size={v ? 70 : 64}
              words={[
                { t: "Chaque", at: datesAt - 12 },
                { t: "étape", at: datesAt - 8 },
                { t: "est", at: datesAt - 4 },
                { t: "datée.", at: datesAt, color: C.green },
                { t: "\n", at: 0 },
                { t: "Vous", at: word("track", "vous") },
                { t: "savez", at: word("track", "savez") },
                { t: "toujours", at: word("track", "toujours") },
                { t: "\n", at: 0 },
                { t: "où", at: word("track", "ou") },
                { t: "en", at: word("track", "en") },
                { t: "est", at: word("track", "est", 1) },
                { t: "votre", at: word("track", "votre") },
                { t: "commande.", at: word("track", "commande"), color: C.brand },
              ]}
            />
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
