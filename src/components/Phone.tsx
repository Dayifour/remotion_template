import React from "react";
import { font } from "../theme";

/** Taille logique de l'écran (dp) : les écrans de l'application sont dessinés dans ce repère. */
export const SCREEN_W = 400;
export const SCREEN_H = 868;
const BEZEL = 13;
const FRAME_W = SCREEN_W + BEZEL * 2;
const FRAME_H = SCREEN_H + BEZEL * 2;

/**
 * Téléphone Android (bords fins, poinçon caméra), rendu en vectoriel :
 * l'écran reste net à toutes les échelles. `width` = largeur affichée en px.
 */
export const Phone: React.FC<{
  width: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
  glare?: number; // position du reflet (0–1), suit les mouvements de caméra
  shadow?: number;
}> = ({ width, children, style, glare = 0.3, shadow = 1 }) => {
  const k = width / FRAME_W;
  return (
    <div style={{ width, height: FRAME_H * k, position: "relative", ...style }}>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: FRAME_W,
          height: FRAME_H,
          transform: `scale(${k})`,
          transformOrigin: "0 0",
          borderRadius: 62,
          background: "linear-gradient(145deg, #3a3d44 0%, #15161a 30%, #0b0b0d 60%, #2b2d33 100%)",
          boxShadow: [
            `0 ${60 * shadow}px ${120 * shadow}px rgba(15,23,42,${0.35 * shadow})`,
            `0 ${18 * shadow}px ${40 * shadow}px rgba(15,23,42,${0.25 * shadow})`,
            "inset 0 0 0 1.5px rgba(255,255,255,0.14)",
            "inset 0 0 0 4px #050506",
          ].join(","),
        }}
      >
        {/* boutons latéraux */}
        <div style={{ position: "absolute", right: -4, top: 190, width: 5, height: 70, borderRadius: 3, background: "linear-gradient(90deg,#2a2c31,#4a4d55)" }} />
        <div style={{ position: "absolute", right: -4, top: 290, width: 5, height: 120, borderRadius: 3, background: "linear-gradient(90deg,#2a2c31,#4a4d55)" }} />
        <div
          style={{
            position: "absolute",
            left: BEZEL,
            top: BEZEL,
            width: SCREEN_W,
            height: SCREEN_H,
            borderRadius: 50,
            overflow: "hidden",
            background: "#000",
            fontFamily: font,
          }}
        >
          {children}
          {/* poinçon caméra */}
          <div style={{ position: "absolute", left: SCREEN_W / 2 - 9, top: 12, width: 18, height: 18, borderRadius: 9, background: "#050505", boxShadow: "inset 0 0 0 3px #15161a" }} />
          {/* reflet du verre */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              background: `linear-gradient(115deg, transparent ${glare * 100 - 22}%, rgba(255,255,255,0.10) ${glare * 100}%, transparent ${glare * 100 + 18}%)`,
              mixBlendMode: "screen",
            }}
          />
        </div>
      </div>
    </div>
  );
};

/** Écran logique 400 × 868 dans lequel on compose une page de l'application. */
export const Screen: React.FC<{ children: React.ReactNode; bg?: string; style?: React.CSSProperties }> = ({ children, bg = "#1c1c1e", style }) => (
  <div style={{ position: "absolute", inset: 0, background: bg, color: "#f4f4f5", overflow: "hidden", ...style }}>{children}</div>
);
