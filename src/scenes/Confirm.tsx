import React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame } from "remotion";
import { LockScreen, OrdersScreen } from "../components/App";
import { Eyebrow, Kinetic, StudioBg, Tap, useVertical } from "../components/Fx";
import { Phone } from "../components/Phone";
import { Browser, WebAdmin } from "../components/Web";
import { C, font } from "../theme";
import { bar, easeInOut, mix, prog, word } from "../timing";

/**
 * Mesures 22–28 — le plan le plus important : l'équipe clique sur « Confirmer »,
 * le téléphone du client reçoit la notification, un appui ouvre Mes commandes.
 */
export const CONFIRM_EVENTS = () => {
  const click = word("confirm", "confirme");
  return {
    click,
    banner: click + 6,
    notif: word("confirm", "prevenu") - 2,
    openTap: bar(26.25),
    toOrders: bar(26.25) + 5,
    stepGreen: bar(26.25) + 16,
  };
};
const BTN = { x: 1159, y: 415 }; // bouton « Confirmer » dans le repère du back-office (1440 × 900)

const Cursor: React.FC<{ x: number; y: number; press: number }> = ({ x, y, press }) => (
  <svg width="44" height="44" viewBox="0 0 24 24" style={{ position: "absolute", left: x - 6, top: y - 3, transform: `scale(${1 - press * 0.15})`, filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.35))" }}>
    <path d="M5 2l14 10.5-6.2 1.1 3.6 7.1-2.8 1.4-3.6-7.2L5 19.5z" fill="#0f172a" stroke="#fff" strokeWidth="1.4" strokeLinejoin="round" />
  </svg>
);

export const Confirm: React.FC = () => {
  const f = useCurrentFrame();
  const v = useVertical();
  const s = bar(22);
  const ev = CONFIRM_EVENTS();
  const enter = prog(f, s - 6, 24, easeInOut);
  const newRow = prog(f, s + 8, 14);
  // le curseur glisse vers « Confirmer » et clique sur le mot « confirme »
  const mv = prog(f, ev.click - 26, 22, easeInOut);
  const cx = mix(mv, 640, BTN.x);
  const cy = mix(mv, 760, BTN.y) - Math.sin(mv * Math.PI) * 80;
  const hover = prog(f, ev.click - 6, 5);
  const press = interpolate(f, [ev.click - 2, ev.click, ev.click + 5], [0, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const confirmed = f >= ev.click + 1 ? 1 : 0;
  const banner = prog(f, ev.banner, 12) * (1 - prog(f, bar(25.75), 10));
  const camIn = prog(f, s + 14, 30, easeInOut);
  const camOut = prog(f, ev.click + 12, 16, easeInOut);
  const notif = prog(f, ev.notif, 14);
  const buzz = interpolate(f, [ev.notif, ev.notif + 14], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const bx = f >= ev.notif ? (random(`b${f}`) - 0.5) * 16 * buzz : 0;

  // phase 2 : le téléphone prend toute la place, on ouvre la notification
  const solo = prog(f, bar(25.5), 22, easeInOut);
  const tapPress = interpolate(f, [ev.openTap - 3, ev.openTap, ev.openTap + 5], [0, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const toOrders = prog(f, ev.toOrders, 12, easeInOut);
  const green = prog(f, ev.stepGreen, 14);

  const bw = 1440;
  const bh = 900;
  const bk = v ? 0.68 : 0.8;
  const pw = v ? mix(solo, 500, 640) : mix(solo, 430, 520);
  const k = pw / 426;
  const pos = v
    ? { x: mix(solo, 0, 0), y: mix(solo, 520, 250) }
    : { x: mix(solo, 560, 0), y: mix(solo, 60, 20) };

  return (
    <AbsoluteFill>
      <StudioBg />
      {/* le back-office */}
      <AbsoluteFill style={{ perspective: 2400, display: "flex", flexDirection: "row", alignItems: v ? "flex-start" : "center", justifyContent: v ? "center" : "flex-start", paddingTop: v ? 250 : 0, paddingLeft: v ? 0 : 90 }}>
        <div
          style={{
            width: bw * bk,
            height: bh * bk,
            transform: [
              `translateY(${solo * (v ? -900 : 0)}px)`,
              `translateX(${solo * (v ? 0 : -1500)}px)`,
              `rotateY(${mix(enter, 30, v ? 0 : 8)}deg)`,
              `rotateX(${mix(enter, 20, v ? 6 : 3)}deg)`,
              `scale(${mix(enter, 0.8, 1)})`,
            ].join(" "),
            opacity: 1 - solo,
          }}
        >
          <div style={{ transform: `scale(${bk})`, transformOrigin: "0 0", width: bw, height: bh, position: "relative" }}>
            <Browser url="admin.yelen-sugu.com" width={bw} height={bh}>
              {/* caméra : on s'approche de la fiche commande pour le clic, on recule quand le bandeau arrive */}
              <div style={{ position: "absolute", inset: 0, transformOrigin: `${BTN.x}px 250px`, transform: `scale(${mix(camIn * (1 - camOut), 1, v ? 1.75 : 1.4)})` }}>
                <WebAdmin hover={hover} press={press} confirmed={confirmed} banner={banner} newRow={newRow} />
                <Cursor x={cx} y={cy} press={press} />
              </div>
            </Browser>
          </div>
        </div>
      </AbsoluteFill>
      {/* le téléphone du client */}
      <AbsoluteFill style={{ perspective: 2000, display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
        <div
          style={{
            position: "relative",
            transform: [
              `translate(${pos.x + bx}px, ${pos.y + mix(enter, 700, 0)}px)`,
              `rotateY(${mix(solo, v ? 0 : -14, v ? -6 : -10)}deg)`,
              `rotateX(${mix(solo, v ? 14 : 4, 3)}deg)`,
              `rotateZ(${bx * 0.3}deg)`,
            ].join(" "),
          }}
        >
          <Phone width={pw} glare={mix(solo, 0.2, 0.7)}>
            <div style={{ position: "absolute", inset: 0, opacity: 1 - toOrders }}>
              <LockScreen notif={notif} press={tapPress} />
            </div>
            {toOrders > 0 && (
              <div style={{ position: "absolute", inset: 0, opacity: toOrders, transform: `scale(${mix(toOrders, 0.92, 1)})` }}>
                <OrdersScreen done={1 + green} flash={green * (1 - prog(f, ev.stepGreen + 14, 20))} />
              </div>
            )}
          </Phone>
          <div style={{ position: "absolute", inset: 0 }}>
            <Tap x={(13 + 200) * k} y={(13 + 390) * k} at={ev.openTap} size={84} />
          </div>
        </div>
      </AbsoluteFill>
      {/* glow de la notification qui arrive */}
      <AbsoluteFill style={{ pointerEvents: "none", background: `radial-gradient(40% 25% at 50% ${v ? 62 : 40}%, rgba(255,80,0,${0.25 * buzz}), transparent 70%)` }} />
      <div style={{ position: "absolute", fontFamily: font, ...(v ? { left: 80, right: 80, top: 130 } : { left: 90, top: 40 }) }}>
        <Eyebrow n="05" label="Côté équipe" at={s + 2} />
        <div style={{ marginTop: 16, height: v ? 140 : 100 }}>
          {f < word("confirm", "et") - 2 ? (
            <Kinetic
              align="left"
              size={v ? 76 : 64}
              out={word("confirm", "et") - 9}
              words={[
                { t: "L'équipe", at: word("confirm", "equipe") - 2 },
                { t: "confirme…", at: ev.click, color: C.brand },
              ]}
            />
          ) : (
            <Kinetic
              align="left"
              size={v ? 76 : 64}
              words={[
                { t: "…et", at: word("confirm", "et") - 2 },
                { t: "vous", at: word("confirm", "vous") },
                { t: "êtes", at: word("confirm", "etes") },
                { t: "prévenu.", at: ev.notif + 2, color: C.green },
              ]}
            />
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
};
