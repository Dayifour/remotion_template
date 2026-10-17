import React from "react";
import logo from "../brand/logo-paths.json";
import { brand } from "../theme";

/**
 * Doumi — la mascotte de DouminiDouman, et littéralement son logo.
 * Le cœur jaune, l'arc orange et la toque sont les tracés officiels de
 * frontend/public/icon.svg (repère 1500 × 1500), extraits par scripts/extract_logo.py.
 * On leur ajoute un visage, des bras et des pieds, et un liseré blanc
 * « autocollant » pour qu'il reste lisible sur fond clair, orange ou sombre.
 *
 * Tous les paramètres sont numériques pour interpoler les expressions en douceur.
 */
export type DoumiPose = {
  x: number; // position des pieds dans la frame (px)
  y: number;
  scale: number;
  squash: number; // 1 = neutre, <1 écrasé, >1 étiré (volume conservé)
  tilt: number; // inclinaison du corps (deg)
  lookX: number; // regard -1..1
  lookY: number;
  eyeOpen: number; // 1 = normal, 1.3 = écarquillé
  browL: number; // -1 froncé .. 1 levé
  browR: number;
  smile: number; // -1 moue .. 1 sourire
  mouthOpen: number; // 0..1 (« o » de surprise / d'émerveillement)
  armL: number; // angle épaule gauche (deg, 0 = pendant, 90 = horizontal vers l'extérieur)
  elbowL: number; // angle du coude ajouté à l'épaule
  armR: number;
  elbowR: number;
  hatLift: number; // 0..1 : Doumi soulève sa toque pour saluer
  hatTilt: number; // inclinaison propre de la toque (deg)
  blink: number; // 0..1
  shadow: number; // opacité de l'ombre au sol 0..1
  opacity: number;
  glow: number; // halo derrière le personnage (fonds sombres)
  talk: number; // ouverture de la bouche pilotée par la voix 0..1
};

export const basePose: DoumiPose = {
  x: 960,
  y: 900,
  scale: 1,
  squash: 1,
  tilt: 0,
  lookX: 0,
  lookY: 0,
  eyeOpen: 1,
  browL: 0,
  browR: 0,
  smile: 0.8,
  mouthOpen: 0,
  armL: 14,
  elbowL: 8,
  armR: 14,
  elbowR: 8,
  hatLift: 0,
  hatTilt: 0,
  blink: 0,
  shadow: 1,
  opacity: 1,
  glow: 0,
  talk: 0,
};

// Cadre du dessin dans le repère du logo
const VB = { x: 200, y: 420, w: 560, h: 640 };
const GROUND = 1028; // y des semelles
const CX = 484; // axe vertical du personnage

const OUTLINE = "#ffffff";
const INK = brand.ink;
const MOUTH = "#3a1208";

// Intérieur du cœur (le logo est un cœur ouvert : on le remplit pour faire un corps)
const FILL =
  "M 512 705 C 470 665, 420 650, 385 655 C 320 665, 285 730, 285 810 C 285 900, 360 950, 440 970 C 490 982, 520 990, 540 1002 C 570 975, 610 955, 640 930 C 672 880, 680 820, 662 765 C 648 705, 610 668, 578 668 C 545 662, 525 680, 512 705 Z";
// Fond blanc de la toque (le tracé officiel n'en dessine que le contour)
const HAT_FILL =
  "M 300 545 C 280 470, 360 440, 430 465 C 470 445, 540 450, 548 505 C 552 545, 530 560, 512 560 L 505 612 C 450 598, 380 598, 330 612 L 315 570 C 302 565, 298 556, 300 545 Z";
const HAT_PIVOT = { x: 430, y: 612 };

const Sticker: React.FC<{ d: string; fill: string; width?: number }> = ({ d, fill, width = 18 }) => (
  <g>
    <path d={d} fill="none" stroke={OUTLINE} strokeWidth={width} strokeLinejoin="round" />
    <path d={d} fill={fill} />
  </g>
);

const rad = (deg: number) => (deg * Math.PI) / 180;
const armGeometry = (side: -1 | 1, shoulder: number, elbow: number) => {
  const sx = side < 0 ? 302 : 666;
  const sy = 850;
  const UPPER = 70;
  const FORE = 64;
  const a1 = rad(shoulder);
  const a2 = rad(shoulder + elbow);
  const ex = sx + side * Math.sin(a1) * UPPER;
  const ey = sy + Math.cos(a1) * UPPER;
  const hx = ex + side * Math.sin(a2) * FORE;
  const hy = ey + Math.cos(a2) * FORE;
  return { d: `M ${sx},${sy} L ${ex},${ey} L ${hx},${hy}`, hx, hy };
};

const Arm: React.FC<{ d: string }> = ({ d }) => (
  <g>
    <path d={d} stroke={OUTLINE} strokeWidth={36} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <path d={d} stroke={brand.orange} strokeWidth={22} strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </g>
);
const Hand: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <circle cx={x} cy={y} r={18} fill={brand.yellow} stroke={OUTLINE} strokeWidth={7} />
);

/** La toque seule, réutilisée par la mascotte et par l'assemblage du logo. */
export const Hat: React.FC = () => (
  <g>
    <path d={HAT_FILL} fill="#ffffff" />
    <Sticker d={logo.hat.d} fill={brand.orange} />
  </g>
);

export const Doumi: React.FC<{ pose: DoumiPose; size?: number }> = ({ pose, size = 330 }) => {
  const p = pose;
  const sy = p.squash;
  const sx = 1 / Math.sqrt(Math.max(0.2, sy));
  const k = (size / VB.h) * p.scale; // px par unité du logo
  const eyeRy = 25 * Math.max(0.08, p.eyeOpen * (1 - 0.92 * p.blink));
  const eyeRx = 19 * (0.94 + 0.06 * p.eyeOpen);
  const lx = p.lookX * 9;
  const ly = p.lookY * 8;
  const armL = armGeometry(-1, p.armL, p.elbowL);
  const armR = armGeometry(1, p.armR, p.elbowR);
  const mouthY = 866;

  return (
    <div
      style={{
        position: "absolute",
        left: p.x - (CX - VB.x) * k,
        top: p.y - (GROUND - VB.y) * k,
        width: VB.w * k,
        height: VB.h * k,
        opacity: p.opacity,
        pointerEvents: "none",
      }}
    >
      {p.glow > 0.01 && (
        <div
          style={{
            position: "absolute",
            left: "-30%",
            top: "-10%",
            width: "160%",
            height: "120%",
            borderRadius: "50%",
            background: "radial-gradient(closest-side, rgba(255,140,60,0.32), rgba(255,207,0,0.10) 55%, transparent)",
            opacity: p.glow,
          }}
        />
      )}
      <svg
        viewBox={`${VB.x} ${VB.y} ${VB.w} ${VB.h}`}
        style={{ position: "relative", overflow: "visible" }}
        width="100%"
        height="100%"
      >
        {/* Ombre au sol — se contracte quand Doumi est en l'air */}
        <ellipse cx={CX} cy={GROUND + 6} rx={150 * sx} ry={20} fill="#000" opacity={0.16 * p.shadow} />

        {/* Pivot au sol pour l'écrasement / l'étirement */}
        <g transform={`translate(${CX} ${GROUND}) rotate(${p.tilt}) scale(${sx} ${sy}) translate(${-CX} ${-GROUND})`}>
          {/* Pieds */}
          {[466, 556].map((fx) => (
            <rect key={fx} x={fx} y={994} width={54} height={32} rx={16} fill={brand.orange} stroke={OUTLINE} strokeWidth={8} />
          ))}

          {/* Bras derrière le corps */}
          <Arm d={armL.d} />
          <Arm d={armR.d} />

          {/* Corps : intérieur du cœur, puis l'arc orange et le cœur jaune du logo */}
          <path d={FILL} fill={brand.cream} stroke={OUTLINE} strokeWidth={18} strokeLinejoin="round" />
          <path d={FILL} fill={brand.cream} stroke={brand.yellow} strokeOpacity={0.55} strokeWidth={7} />
          <Sticker d={logo.arc.d} fill={brand.orange} />
          <Sticker d={logo.heart.d} fill={brand.yellow} />

          {/* Joues */}
          <ellipse cx={392} cy={858} rx={21} ry={13} fill={brand.orangeUi} opacity={0.26 + 0.1 * Math.max(0, p.smile)} />
          <ellipse cx={590} cy={858} rx={21} ry={13} fill={brand.orangeUi} opacity={0.26 + 0.1 * Math.max(0, p.smile)} />

          {/* Yeux */}
          {[432, 548].map((ex) => (
            <g key={ex}>
              <ellipse cx={ex + lx} cy={808 + ly} rx={eyeRx} ry={eyeRy} fill={INK} />
              {p.blink < 0.6 && <circle cx={ex + lx + 6} cy={799 + ly * 0.8 - (25 - eyeRy) * 0.3} r={6.5} fill="#fff" />}
            </g>
          ))}

          {/* Sourcils */}
          {[
            { cx: 430, s: -1, v: p.browL },
            { cx: 551, s: 1, v: p.browR },
          ].map(({ cx, s, v }) => (
            <path
              key={cx}
              d={`M ${cx - 21},${758 - v * 12 - s * (4 + v * 3)} L ${cx + 21},${758 - v * 12 + s * (4 + v * 3)}`}
              stroke={INK}
              strokeWidth={9}
              strokeLinecap="round"
            />
          ))}

          {/* Bouche : émerveillement (« o »), parole (synchronisée sur la voix) ou sourire */}
          {p.mouthOpen > 0.05 ? (
            <ellipse
              cx={490}
              cy={mouthY + 4}
              rx={12 + p.mouthOpen * 6 + p.talk * 3}
              ry={(6 + p.mouthOpen * 14) * (0.7 + 0.3 * p.talk)}
              fill={MOUTH}
            />
          ) : p.talk > 0.04 ? (
            <g>
              <path
                d={`M 462,${mouthY - p.smile * 4} Q 490,${mouthY + 2 + p.smile * 8} 518,${mouthY - p.smile * 4} Q 490,${mouthY + 12 + p.smile * 10 + p.talk * 26} 462,${mouthY - p.smile * 4} Z`}
                fill={MOUTH}
                stroke={MOUTH}
                strokeWidth={5}
                strokeLinejoin="round"
              />
              {p.talk > 0.3 && (
                <ellipse cx={490} cy={mouthY + 8 + p.smile * 7 + p.talk * 15} rx={9 + p.talk * 3} ry={4 + p.talk * 3} fill={brand.orangeUi} opacity={0.9} />
              )}
            </g>
          ) : (
            <path
              d={`M 462,${mouthY - p.smile * 4} Q 490,${mouthY + p.smile * 26} 518,${mouthY - p.smile * 4}`}
              stroke={INK}
              strokeWidth={10}
              strokeLinecap="round"
              fill="none"
            />
          )}

          {/* Mains devant */}
          <Hand x={armL.hx} y={armL.hy} />
          <Hand x={armR.hx} y={armR.hy} />

          {/* Toque : se soulève et s'incline pour saluer */}
          <g
            transform={`translate(${p.hatLift * 22} ${-p.hatLift * 120}) rotate(${p.hatTilt - p.hatLift * 16} ${HAT_PIVOT.x} ${HAT_PIVOT.y})`}
          >
            <Hat />
          </g>
        </g>
      </svg>
    </div>
  );
};
