import React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame } from "remotion";
import { IconBack, IconCart } from "../components/Icons";
import { Kinetic, StudioBg, Dust, useVertical } from "../components/Fx";
import { Phone, Screen } from "../components/Phone";
import { StatusBar } from "../components/App";
import { C, font } from "../theme";
import { bar, BEAT, easeIn, mix, pop, prog, word } from "../timing";

/** 0 – mesure 4 : la montée du beat. On commande sur WhatsApp… puis plus rien. */
const MSGS = [
  { t: "Bonjour, je prends le Galaxy A55 🙏", h: "14:02", at: 0.3 },
  { t: "Ma commande est confirmée ?", h: "15:10", at: 1.6 },
  { t: "Allô ?", h: "17:45", at: 2.35 },
  { t: "Elle arrive quand ?", h: "09:12", at: 2.9 },
  { t: "???", h: "11:30", at: 3.4 },
];

const Chat: React.FC<{ f: number }> = ({ f }) => (
  <Screen bg="#0b141a">
    <div style={{ position: "absolute", inset: 0, opacity: 0.06, backgroundImage: "radial-gradient(#fff 1px, transparent 1.4px)", backgroundSize: "22px 22px" }} />
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 104, background: "#1f2c34", display: "flex", alignItems: "flex-end", gap: 12, padding: "0 16px 14px" }}>
      <IconBack size={24} color="#fff" />
      <div style={{ width: 42, height: 42, borderRadius: 21, background: "#37474f", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <IconCart size={21} color="#cfd8dc" />
      </div>
      <div>
        <div style={{ fontSize: 18, fontWeight: 600 }}>Boutique téléphones</div>
        <div style={{ fontSize: 13, color: "#8696a0" }}>vu hier à 14:05</div>
      </div>
    </div>
    <div style={{ position: "absolute", top: 126, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10, padding: "0 14px" }}>
      {MSGS.map((m, i) => {
        const p = pop(f, bar(m.at), 13, 220);
        if (f < bar(m.at)) return null;
        return (
          <React.Fragment key={i}>
            {i === 3 && (
              <div style={{ alignSelf: "center", fontSize: 13, color: "#8696a0", background: "#182229", padding: "5px 12px", borderRadius: 8, opacity: p }}>Aujourd'hui</div>
            )}
            <div
              style={{
                maxWidth: 290,
                background: "#005c4b",
                borderRadius: "14px 4px 14px 14px",
                padding: "9px 12px 22px",
                fontSize: 16.5,
                color: "#e9edef",
                position: "relative",
                minWidth: 110,
                transform: `scale(${p})`,
                transformOrigin: "100% 0",
              }}
            >
              {m.t}
              <span style={{ position: "absolute", right: 10, bottom: 5, fontSize: 12, color: "#8fb4ad", display: "flex", gap: 4, alignItems: "center" }}>
                {m.h}
                <svg width="18" height="11" viewBox="0 0 18 11">
                  <path d="M1 6l3 3 6-7M7 9l1 0.5 7-8" stroke="#8fb4ad" strokeWidth="1.8" fill="none" />
                </svg>
              </span>
            </div>
          </React.Fragment>
        );
      })}
    </div>
    <StatusBar time="11:30" />
  </Screen>
);

export const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const v = useVertical();
  const end = bar(4);
  // la caméra se rapproche du téléphone pendant toute la montée, puis tremble juste avant le drop
  const push = prog(f, 0, end, (x) => x);
  const shakeAmt = interpolate(f, [end - 22, end], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const sx = (random(`sx${f}`) - 0.5) * 22 * shakeAmt;
  const sy = (random(`sy${f}`) - 0.5) * 22 * shakeAmt;
  const suck = prog(f, end - 8, 8, easeIn);
  const pw = v ? 560 : 370;

  const t1 = [
    { t: "Vous", at: word("hook1", "Vous") },
    { t: "commandez", at: word("hook1", "commandez") },
    { t: "sur", at: word("hook1", "sur") },
    { t: "WhatsApp…", at: word("hook1", "WhatsApp"), color: C.wa },
  ];
  const t2 = [
    { t: "Et", at: word("hook2", "Et") },
    { t: "puis,", at: word("hook2", "puis") },
    { t: "plus", at: word("hook2", "plus") },
    { t: "rien.", at: word("hook2", "rien"), color: "#ff6a2b" },
  ];
  const t3 = [
    { t: "Elle", at: word("hook2", "Elle") },
    { t: "en", at: word("hook2", "en") },
    { t: "est", at: word("hook2", "est") },
    { t: "où ?", at: word("hook2", "ou"), color: "#ff6a2b" },
  ];
  const swap = word("hook2", "Et") - 4;
  const swap2 = word("hook2", "Elle") - 3;
  const textSize = v ? 92 : 84;

  return (
    <AbsoluteFill style={{ transform: `translate(${sx}px, ${sy}px) scale(${1 + suck * 0.6})`, filter: `blur(${suck * 14}px)` }}>
      <StudioBg dark />
      <Dust count={50} opacity={0.35} />
      <AbsoluteFill style={{ display: "flex", alignItems: "center", flexDirection: "row", justifyContent: v ? "center" : "flex-end", paddingRight: v ? 0 : 230 }}>
        <div style={{ transform: `translateY(${v ? 200 : 0}px) scale(${mix(push, 0.92, 1.08)}) rotate(${mix(push, -4, 2)}deg)`, perspective: 1500 }}>
          <div style={{ transform: `rotateY(${mix(push, v ? 14 : -18, v ? -6 : -8)}deg) rotateX(${mix(push, 8, 2)}deg)` }}>
            <Phone width={pw} glare={mix(push, 0.1, 0.7)}>
              <Chat f={f} />
            </Phone>
          </div>
        </div>
      </AbsoluteFill>
      {/* « silence » : horloge qui tourne — le temps passe et personne ne répond */}
      <div
        style={{
          position: "absolute",
          ...(v ? { left: 80, top: 440 } : { left: 140, top: 760 }),
          display: "flex",
          alignItems: "center",
          gap: 16,
          fontSize: 34,
          fontFamily: font,
          fontWeight: 700,
          color: "rgba(255,255,255,0.75)",
          opacity: prog(f, bar(1.5), 10) * (1 - prog(f, end - 10, 8)),
        }}
      >
        <svg width="54" height="54" viewBox="0 0 54 54">
          <circle cx="27" cy="27" r="24" stroke="rgba(255,255,255,0.6)" strokeWidth="3" fill="none" />
          <line x1="27" y1="27" x2={27 + 15 * Math.sin(f / 3)} y2={27 - 15 * Math.cos(f / 3)} stroke="#ff6a2b" strokeWidth="3.5" strokeLinecap="round" />
          <line x1="27" y1="27" x2={27 + 10 * Math.sin(f / 36)} y2={27 - 10 * Math.cos(f / 36)} stroke="#fff" strokeWidth="3.5" strokeLinecap="round" />
        </svg>
        {f < bar(2.9) ? "pas de réponse" : "toujours rien"}
      </div>
      <div style={{ position: "absolute", ...(v ? { left: 80, right: 80, top: 190 } : { left: 140, width: 820, top: 300 }) }}>
        {f < swap && <Kinetic words={t1} size={textSize} color="#fff" align="left" />}
        {f >= swap && f < swap2 && <Kinetic words={t2} size={textSize * 1.12} color="#fff" align="left" />}
        {f >= swap2 && <Kinetic words={t3} size={textSize * 1.12} color="#fff" align="left" />}
        <div style={{ height: 1, marginTop: 20, width: mix(prog(f, 0, BEAT * 8), 0, 220), background: "rgba(255,255,255,0.3)" }} />
      </div>
    </AbsoluteFill>
  );
};
