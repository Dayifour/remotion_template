import React from "react";
import { C, font } from "../theme";
import { IconCart } from "./Icons";

/**
 * Marque Yelen Sugu : pastille au chariot orange + nom.
 * Sur fond orange (`onBrand`), la pastille passe en blanc (brief, « Logo »).
 * Remplaçable par le PNG officiel (public/brand/logo.png) dès qu'il est fourni.
 */
export const Logo: React.FC<{ height: number; onBrand?: boolean; mark?: boolean; style?: React.CSSProperties }> = ({ height, onBrand, mark = false, style }) => {
  const badge = (
    <div
      style={{
        width: height,
        height,
        borderRadius: height * 0.28,
        background: onBrand ? "#fff" : C.brand,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        boxShadow: onBrand ? "0 10px 30px rgba(120,20,0,0.25)" : "0 6px 16px rgba(255,80,0,0.3)",
      }}
    >
      <IconCart size={height * 0.62} color={onBrand ? C.brand : "#fff"} stroke={2.3} />
    </div>
  );
  if (mark) return badge;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: height * 0.28, fontFamily: font, ...style }}>
      {badge}
      <div style={{ fontSize: height * 0.62, fontWeight: 800, letterSpacing: -height * 0.02, lineHeight: 1, color: onBrand ? "#fff" : C.ink, whiteSpace: "nowrap" }}>
        Yelen <span style={{ color: onBrand ? "#fff" : C.brand, fontWeight: onBrand ? 400 : 800 }}>Sugu</span>
      </div>
    </div>
  );
};
