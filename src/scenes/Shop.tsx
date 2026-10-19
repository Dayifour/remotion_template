import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { BoutiqueScreen } from "../components/App";
import { Eyebrow, Kinetic, StudioBg, Tap, useVertical } from "../components/Fx";
import { Phone } from "../components/Phone";
import { C, DEMO, fcfa, font } from "../theme";
import { bar, easeInOut, mix, pop, prog, word } from "../timing";

/** Coordonnées écran (dp) des boutons « Ajouter » une fois la grille défilée de SCROLL. */
const SCROLL = 120;
const GRID_Y = 298 - SCROLL;
export const SHOP_TAPS = () => [word("shop", "ajoutez") + 2, word("shop", "panier") + 6];
const BTN = [
  { id: "galaxy-a55", x: 105, y: GRID_Y + 253, img: DEMO.products[0].img },
  { id: "ecouteurs", x: 294, y: GRID_Y + 253, img: DEMO.products[1].img },
];
const CART_TAB = { x: 150, y: 790 };

export const Shop: React.FC = () => {
  const f = useCurrentFrame();
  const v = useVertical();
  const s = bar(10);
  const e = bar(14);
  const taps = SHOP_TAPS();
  const enter = prog(f, s - 6, 24, easeInOut);
  const scroll = mix(prog(f, word("shop", "choisissez") - 4, 22, easeInOut), 0, SCROLL);
  const press: Record<string, number> = {};
  const added: Record<string, number> = {};
  BTN.forEach((b, i) => {
    press[b.id] = interpolate(f, [taps[i] - 3, taps[i], taps[i] + 5], [0, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    added[b.id] = f >= taps[i] + 2 ? 1 : 0;
  });
  const fly = (i: number) => prog(f, taps[i] + 1, 16, easeInOut);
  const landed = taps.map((t) => t + 17);
  const cart = landed.filter((t) => f >= t).length;
  const lastLand = [...landed].reverse().find((t) => f >= t) ?? -999;
  const badgePop = interpolate(f - lastLand, [0, 4, 14], [0, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // « Le prix affiché est le prix payé » : la caméra plonge sur l'étiquette de prix
  const priceAt = word("shop", "prix");
  const focus = prog(f, priceAt - 6, 22, easeInOut);
  const pw = v ? 640 : 470;
  const k = pw / 426;
  const tag = pop(f, priceAt, 11, 160);

  return (
    <AbsoluteFill>
      <StudioBg />
      <AbsoluteFill style={{ perspective: 2000, display: "flex", flexDirection: "row", alignItems: "center", justifyContent: v ? "center" : "flex-end", paddingRight: v ? 0 : 300 }}>
        <div
          style={{
            position: "relative",
            transform: [
              `translateY(${v ? mix(focus, 180, 600) : mix(focus, 0, 170)}px)`,
              `translateX(${mix(enter, 500, 0) + (v ? mix(focus, 0, 140) : 0)}px)`,
              `rotateY(${mix(enter, -40, v ? -10 : -14) + focus * 8}deg)`,
              `rotateX(${mix(enter, 10, 4)}deg)`,
              `rotateZ(${mix(enter, 8, 0)}deg)`,
              `scale(${mix(focus, 1, v ? 1.3 : 1.5)})`,
            ].join(" "),
          }}
        >
          <Phone width={pw} glare={mix(enter, 0, 0.6)}>
            <BoutiqueScreen scroll={scroll} press={press} added={added} cart={cart} badgePop={badgePop} cat={0} />
            {/* la vignette du produit s'envole vers l'onglet Panier */}
            {BTN.map((b, i) => {
              const p = fly(i);
              if (p <= 0 || p >= 1) return null;
              const x = mix(p, b.x, CART_TAB.x);
              const y = mix(p, b.y - 120, CART_TAB.y) - Math.sin(p * Math.PI) * 140;
              const sz = mix(p, 110, 26);
              return (
                <Img
                  key={b.id}
                  src={staticFile(b.img)}
                  style={{ position: "absolute", left: x - sz / 2, top: y - sz / 2, width: sz, height: sz, borderRadius: sz * 0.22, objectFit: "cover", boxShadow: "0 10px 30px rgba(255,80,0,0.6)", border: "3px solid #fff" }}
                />
              );
            })}
          </Phone>
          <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
            {BTN.map((b, i) => (
              <Tap key={b.id} x={(13 + b.x) * k} y={(13 + b.y) * k} at={taps[i]} size={78} />
            ))}
          </div>
        </div>
      </AbsoluteFill>
      {/* étiquette de prix qui sort de l'écran */}
      <div
        style={{
          position: "absolute",
          ...(v ? { left: 80, top: 560 } : { left: 160, top: 520 }),
          transform: `scale(${tag}) rotate(${mix(tag, -12, -4)}deg)`,
          transformOrigin: "0 50%",
          fontFamily: font,
          display: "flex",
          alignItems: "center",
          gap: 18,
          padding: "22px 30px",
          borderRadius: 24,
          background: "#fff",
          boxShadow: "0 30px 70px rgba(15,23,42,0.25)",
          border: `3px solid ${C.brand}`,
        }}
      >
        <span style={{ fontSize: v ? 62 : 54, fontWeight: 900, color: C.brand, letterSpacing: -2 }}>{fcfa(DEMO.products[0].price)}</span>
      </div>
      <div style={{ position: "absolute", ...(v ? { left: 80, right: 80, top: 150 } : { left: 150, width: 760, top: 200 }) }}>
        <Eyebrow n="02" label="L'application" at={s + 2} />
        <div style={{ marginTop: 22 }}>
          {f < priceAt - 4 ? (
            <Kinetic
              align="left"
              size={v ? 84 : 76}
              words={[
                { t: "Vous", at: word("shop", "Vous") },
                { t: "choisissez,", at: word("shop", "choisissez") },
                { t: "\n", at: 0 },
                { t: "vous", at: word("shop", "vous", 1) },
                { t: "ajoutez.", at: word("shop", "ajoutez"), color: C.brand },
              ]}
            />
          ) : (
            <Kinetic
              align="left"
              size={v ? 84 : 76}
              words={[
                { t: "Le", at: priceAt - 4 },
                { t: "prix", at: priceAt },
                { t: "affiché", at: word("shop", "affiche") },
                { t: "\n", at: 0 },
                { t: "est", at: word("shop", "est") },
                { t: "le", at: word("shop", "le", 1) },
                { t: "prix", at: word("shop", "prix", 1) },
                { t: "payé.", at: word("shop", "paye"), color: C.brand },
              ]}
            />
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
};
