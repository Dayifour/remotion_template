import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Eyebrow, StudioBg, useVertical } from "../components/Fx";
import { Browser, WebHome } from "../components/Web";
import { C, DEMO, font } from "../theme";
import { bar, easeInOut, mix, prog, word } from "../timing";

/** Mesures 6–10 : la boutique web. Les catégories s'allument sur la voix, puis retour au bandeau d'accueil. */
export const Web: React.FC = () => {
  const f = useCurrentFrame();
  const v = useVertical();
  const s = bar(6);
  const e = bar(10);
  const enter = prog(f, s, 26, easeInOut);
  const cats = [word("web", "Smartphones"), word("web", "ordinateurs"), word("web", "audio"), word("web", "accessoires")];
  const cat = cats.reduce((n, at, i) => (f >= at ? i + 1 : n), 0);
  const back = prog(f, word("web", "tout") - 4, 26, easeInOut);
  const scroll = mix(back, 640, 0);
  const heroIn = prog(f, word("web", "tout"), 22);
  const zoom = prog(f, word("web", "livre") - 6, e - word("web", "livre") + 6, (x) => x);

  const k = v ? 0.72 : 1.08;
  const bw = 1440;
  const bh = v ? 1250 : 880;
  return (
    <AbsoluteFill>
      <StudioBg />
      <AbsoluteFill style={{ perspective: 2400, display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
        <div
          style={{
            transform: [
              `translateY(${v ? 90 : 30}px)`,
              `scale(${k * mix(zoom, 1, 1.12)})`,
              `rotateX(${mix(enter, 28, 6) - back * 4}deg)`,
              `rotateY(${mix(enter, -26, v ? -4 : -7) + back * (v ? 4 : 5)}deg)`,
              `rotateZ(${mix(enter, 6, 0)}deg)`,
              `translateZ(${mix(enter, -400, 0)}px)`,
            ].join(" "),
            transformStyle: "preserve-3d",
          }}
        >
          <Browser url={DEMO.site} width={bw} height={bh}>
            <WebHome scroll={scroll} cat={cat} cardsIn={prog(f, s + 6, 30)} heroIn={Math.max(heroIn, f < word("web", "tout") ? 1 : 0)} />
          </Browser>
          {/* reflet de sol */}
          <div style={{ position: "absolute", left: 60, right: 60, bottom: -70, height: 60, borderRadius: "50%", background: "radial-gradient(closest-side, rgba(15,23,42,0.25), transparent)", filter: "blur(10px)" }} />
        </div>
      </AbsoluteFill>
      <div style={{ position: "absolute", ...(v ? { left: 80, top: 150 } : { left: 90, top: 48 }), fontFamily: font }}>
        <Eyebrow n="01" label="La boutique en ligne" at={s + 4} />
        {v && (
          <div style={{ marginTop: 18, fontSize: 64, fontWeight: 800, letterSpacing: -2, color: C.ink, opacity: prog(f, s + 8, 14) }}>
            <span style={{ color: C.brand }}>{DEMO.site}</span>
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
