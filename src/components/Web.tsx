import React from "react";
import { Img, staticFile } from "remotion";
import { C, DEMO, fcfa, font } from "../theme";
import { mix } from "../timing";
import { IconBike, IconBox, IconCart, IconCheck, IconGrid, IconSearch, IconUser } from "./Icons";
import { Logo } from "./Logo";

/** Fenêtre de navigateur (barre d'adresse sobre, sans outils de développement). */
export const Browser: React.FC<{ url: string; width: number; height: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ url, width, height, children, style }) => (
  <div
    style={{
      width,
      height,
      borderRadius: 18,
      overflow: "hidden",
      background: "#fff",
      fontFamily: font,
      boxShadow: "0 50px 120px rgba(15,23,42,0.30), 0 12px 30px rgba(15,23,42,0.18), 0 0 0 1px rgba(15,23,42,0.08)",
      position: "relative",
      ...style,
    }}
  >
    <div style={{ height: 52, background: "#eef1f5", display: "flex", alignItems: "center", gap: 16, padding: "0 18px", borderBottom: "1px solid #dfe3ea" }}>
      <div style={{ display: "flex", gap: 8 }}>
        {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
          <span key={c} style={{ width: 13, height: 13, borderRadius: 7, background: c }} />
        ))}
      </div>
      <div style={{ flex: 1, height: 32, borderRadius: 9, background: "#fff", display: "flex", alignItems: "center", gap: 8, padding: "0 14px", fontSize: 15, color: C.gray, border: "1px solid #e2e6ec" }}>
        <svg width="12" height="14" viewBox="0 0 12 14">
          <rect x="1" y="6" width="10" height="7.5" rx="1.5" fill="#64748b" />
          <path d="M3 6V4.5a3 3 0 0 1 6 0V6" stroke="#64748b" strokeWidth="1.6" fill="none" />
        </svg>
        <span style={{ color: C.ink }}>{url}</span>
      </div>
    </div>
    <div style={{ position: "absolute", top: 52, left: 0, right: 0, bottom: 0, overflow: "hidden", background: C.bg }}>{children}</div>
  </div>
);

/**
 * Accueil de yelen-sugu.com, recomposé d'après le brief : barre orange fine,
 * en-tête, bandeau orange plein « Tout ce qu'il vous faut, livré à Bamako »,
 * téléphone en vedette et son prix, puis la grille de la boutique.
 */
export const WebHome: React.FC<{ width?: number; scroll?: number; cat?: number; cardsIn?: number; heroIn?: number }> = ({ width = 1440, scroll = 0, cat = 0, cardsIn = 1, heroIn = 1 }) => {
  const cats = ["Tout", "Smartphones", "Ordinateurs", "Audio", "Accessoires"];
  const feat = DEMO.products[0];
  return (
    <div style={{ width, transform: `translateY(${-scroll}px)`, color: C.ink }}>
      <div style={{ height: 38, background: C.brand, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, fontSize: 15, fontWeight: 600 }}>
        <IconBike size={18} color="#fff" /> Livraison gratuite partout à Bamako
      </div>
      <div style={{ height: 84, background: "#fff", borderBottom: `1px solid ${C.line}`, display: "flex", alignItems: "center", padding: "0 64px", gap: 40 }}>
        <Logo height={44} />
        <div style={{ display: "flex", gap: 30, fontSize: 16, fontWeight: 600, color: "#334155" }}>
          <span style={{ color: C.brand }}>Accueil</span>
          <span>Boutique</span>
          <span>Mes commandes</span>
          <span>Contact</span>
        </div>
        <div style={{ flex: 1, height: 46, borderRadius: 12, background: C.bg, border: `1px solid ${C.line}`, display: "flex", alignItems: "center", gap: 10, padding: "0 16px", color: C.gray, fontSize: 15.5 }}>
          <IconSearch size={18} color={C.gray} /> Rechercher un produit…
        </div>
        <IconUser size={26} color={C.ink} />
        <div style={{ position: "relative" }}>
          <IconCart size={28} color={C.ink} />
          <span style={{ position: "absolute", top: -8, right: -10, width: 20, height: 20, borderRadius: 10, background: C.brand, color: "#fff", fontSize: 12, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>2</span>
        </div>
      </div>
      {/* bandeau d'accueil */}
      <div style={{ margin: "28px 64px 0", height: 520, borderRadius: 28, background: `linear-gradient(120deg, ${C.brandDeep1} 0%, ${C.brandDeep2} 100%)`, position: "relative", overflow: "hidden", color: "#fff" }}>
        <div style={{ position: "absolute", right: -120, top: -160, width: 640, height: 640, borderRadius: 320, background: "rgba(255,255,255,0.08)" }} />
        <div style={{ position: "absolute", right: 140, bottom: -260, width: 520, height: 520, borderRadius: 260, background: "rgba(255,255,255,0.06)" }} />
        <div style={{ position: "absolute", left: 72, top: 92, width: 640, opacity: heroIn, transform: `translateY(${mix(heroIn, 30, 0)}px)` }}>
          <div style={{ display: "inline-flex", gap: 8, alignItems: "center", padding: "8px 14px", borderRadius: 20, background: "rgba(255,255,255,0.16)", fontSize: 15, fontWeight: 600 }}>
            <IconBike size={17} color="#fff" /> Livraison gratuite à Bamako
          </div>
          <div style={{ fontSize: 66, fontWeight: 800, lineHeight: 1.04, letterSpacing: -2, marginTop: 22 }}>Tout ce qu'il vous faut, livré à Bamako</div>
          <div style={{ fontSize: 19, opacity: 0.9, marginTop: 18, lineHeight: 1.45 }}>Smartphones, ordinateurs, audio et accessoires. Paiement à la livraison, Orange Money ou Wave.</div>
          <div style={{ display: "flex", gap: 14, marginTop: 30 }}>
            <span style={{ padding: "16px 26px", borderRadius: 14, background: "#fff", color: C.brand, fontWeight: 800, fontSize: 17 }}>Voir la boutique</span>
            <span style={{ padding: "16px 26px", borderRadius: 14, border: "2px solid rgba(255,255,255,0.7)", fontWeight: 700, fontSize: 17 }}>Commander sur WhatsApp</span>
          </div>
        </div>
        <div style={{ position: "absolute", right: 96, top: 70, width: 420, height: 380, borderRadius: 26, overflow: "hidden", background: "#fff", boxShadow: "0 30px 70px rgba(0,0,0,0.3)", transform: `rotate(${mix(heroIn, 6, 2)}deg) translateY(${mix(heroIn, 40, 0)}px)` }}>
          <Img src={staticFile(feat.img)} style={{ width: "100%", height: 300, objectFit: "cover" }} />
          <div style={{ padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", color: C.ink }}>
            <span style={{ fontSize: 18, fontWeight: 700 }}>Galaxy A55</span>
            <span style={{ fontSize: 20, fontWeight: 800, color: C.brand }}>{fcfa(feat.price)}</span>
          </div>
        </div>
      </div>
      {/* boutique */}
      <div style={{ padding: "48px 64px 0" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 34, fontWeight: 800, letterSpacing: -1 }}>Boutique</span>
          <div style={{ display: "flex", gap: 10 }}>
            {cats.map((c, i) => (
              <span key={c} style={{ padding: "11px 20px", borderRadius: 22, fontSize: 15.5, fontWeight: 600, background: i === cat ? C.brand : "#fff", color: i === cat ? "#fff" : "#334155", border: `1px solid ${i === cat ? C.brand : C.line}`, boxShadow: i === cat ? "0 8px 20px rgba(255,80,0,0.3)" : "none" }}>
                {c}
              </span>
            ))}
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24, marginTop: 28 }}>
          {DEMO.products.map((p, i) => {
            const k = Math.max(0, Math.min(1, cardsIn * 4 - i));
            return (
              <div key={p.id} style={{ borderRadius: 20, background: "#fff", border: `1px solid ${C.line}`, overflow: "hidden", boxShadow: "0 10px 30px rgba(15,23,42,0.06)", opacity: k, transform: `translateY(${mix(k, 40, 0)}px)` }}>
                <Img src={staticFile(p.img)} style={{ width: "100%", height: 230, objectFit: "cover" }} />
                <div style={{ padding: "16px 18px 18px" }}>
                  <div style={{ fontSize: 13, color: C.gray, fontWeight: 600 }}>{p.cat}</div>
                  <div style={{ fontSize: 17.5, fontWeight: 700, marginTop: 4 }}>{p.name}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
                    <span style={{ fontSize: 19, fontWeight: 800, color: C.brand }}>{fcfa(p.price)}</span>
                    <span style={{ padding: "9px 14px", borderRadius: 10, background: C.brand, color: "#fff", fontWeight: 700, fontSize: 14.5 }}>+ Ajouter</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {/* les trois engagements du brief, en bas de page */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24, marginTop: 34 }}>
          {[
            { I: IconBike, t: "Livraison gratuite", d: "partout à Bamako, sans minimum d'achat", c: C.green },
            { I: IconBox, t: "Suivi de commande", d: "chaque étape datée, sur le site et l'application", c: C.brand },
            { I: IconCheck, t: "Paiement à la livraison", d: "en espèces, Orange Money ou Wave", c: C.ink },
          ].map(({ I, t, d, c }) => (
            <div key={t} style={{ display: "flex", gap: 18, alignItems: "center", padding: "24px 26px", borderRadius: 20, background: C.brandSoft, border: "1px solid #ffe2cf" }}>
              <span style={{ width: 60, height: 60, borderRadius: 16, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <I size={30} color={c} stroke={2} />
              </span>
              <span>
                <div style={{ fontSize: 19, fontWeight: 800 }}>{t}</div>
                <div style={{ fontSize: 15, color: C.gray, marginTop: 3 }}>{d}</div>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const ADMIN_ROWS = [
  { id: DEMO.order, client: DEMO.client, total: 210000, status: "En attente", time: "14:32" },
  { id: "YL-2907", client: "Moussa K.", total: 25000, status: "En préparation", time: "13:58" },
  { id: "YL-2906", client: "Fatoumata S.", total: 7500, status: "En cours de livraison", time: "12:41" },
  { id: "YL-2905", client: "Ibrahim T.", total: 185000, status: "Livrée", time: "11:20" },
];
const statusStyle = (s: string) =>
  s === "En attente"
    ? { color: "#c2410c", background: "#fff1e8" }
    : s === "Confirmée" || s === "Livrée"
      ? { color: "#047857", background: "#e7f6f1" }
      : { color: "#334155", background: "#eef2f6" };

/**
 * Back-office admin.yelen-sugu.com : liste des commandes + détail de la nouvelle commande.
 * `confirmed` passe la commande à « Confirmée », `banner` affiche le bandeau de confirmation.
 */
export const WebAdmin: React.FC<{ width?: number; hover?: number; press?: number; confirmed?: number; banner?: number; newRow?: number }> = ({ width = 1440, hover = 0, press = 0, confirmed = 0, banner = 0, newRow = 1 }) => {
  const rows = ADMIN_ROWS.map((r, i) => (i === 0 && confirmed > 0.5 ? { ...r, status: "Confirmée" } : r));
  return (
    <div style={{ width, height: 900, display: "flex", color: C.ink, position: "relative" }}>
      <div style={{ width: 250, background: "#fff", borderRight: `1px solid ${C.line}`, padding: "26px 18px" }}>
        <Logo height={36} />
        <div style={{ marginTop: 36, display: "flex", flexDirection: "column", gap: 6, fontSize: 15.5, fontWeight: 600, color: "#475569" }}>
          {[
            [IconGrid, "Tableau de bord", false],
            [IconBox, "Commandes", true],
            [IconCart, "Produits", false],
            [IconUser, "Clients", false],
          ].map(([I, t, on]) => {
            const Ic = I as React.FC<{ size?: number; color?: string }>;
            return (
              <div key={t as string} style={{ display: "flex", gap: 12, alignItems: "center", padding: "12px 14px", borderRadius: 12, background: on ? C.brandSoft : "transparent", color: on ? C.brand : "#475569" }}>
                <Ic size={20} color={on ? C.brand : "#64748b"} /> {t as string}
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ flex: 1, padding: "30px 40px", background: C.bg }}>
        <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: -0.8 }}>Commandes</div>
        <div style={{ display: "flex", gap: 26, marginTop: 24 }}>
          <div style={{ flex: 1.25, borderRadius: 18, background: "#fff", border: `1px solid ${C.line}`, overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1.6fr 1.2fr 1.4fr", padding: "14px 22px", fontSize: 13.5, fontWeight: 700, color: C.gray, background: "#f8fafc", borderBottom: `1px solid ${C.line}` }}>
              <span>N°</span>
              <span>Client</span>
              <span>Total</span>
              <span>Statut</span>
            </div>
            {rows.map((r, i) => (
              <div
                key={r.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.1fr 1.6fr 1.2fr 1.4fr",
                  padding: "18px 22px",
                  fontSize: 15.5,
                  alignItems: "center",
                  borderBottom: `1px solid ${C.line}`,
                  background: i === 0 ? `rgba(255,80,0,${0.06 * newRow})` : "#fff",
                  opacity: i === 0 ? newRow : 1,
                  transform: i === 0 ? `translateY(${mix(newRow, -20, 0)}px)` : undefined,
                }}
              >
                <b>#{r.id}</b>
                <span>{r.client}</span>
                <span style={{ fontWeight: 700 }}>{fcfa(r.total)}</span>
                <span>
                  <span style={{ padding: "6px 12px", borderRadius: 10, fontSize: 13.5, fontWeight: 700, ...statusStyle(r.status) }}>{r.status}</span>
                </span>
              </div>
            ))}
          </div>
          <div style={{ flex: 1, borderRadius: 18, background: "#fff", border: `1px solid ${C.line}`, padding: "22px 24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 22, fontWeight: 800 }}>#{DEMO.order}</span>
              <span style={{ padding: "6px 12px", borderRadius: 10, fontSize: 13.5, fontWeight: 700, ...statusStyle(rows[0].status) }}>{rows[0].status}</span>
            </div>
            <div style={{ marginTop: 18, fontSize: 15, color: C.gray, lineHeight: 1.7 }}>
              <div>
                <b style={{ color: C.ink }}>Client</b> · {DEMO.client}
              </div>
              <div>
                <b style={{ color: C.ink }}>Adresse</b> · {DEMO.address}
              </div>
            </div>
            <div style={{ marginTop: 14, borderTop: `1px solid ${C.line}`, paddingTop: 14, fontSize: 15, display: "flex", flexDirection: "column", gap: 8 }}>
              {DEMO.products.slice(0, 2).map((p) => (
                <div key={p.id} style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>1 × {p.name}</span>
                  <b>{fcfa(p.price)}</b>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", color: C.gray }}>
                <span>Livraison</span>
                <b style={{ color: C.green }}>Gratuite</b>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 18, marginTop: 4 }}>
                <b>Total</b>
                <b>{fcfa(210000)}</b>
              </div>
            </div>
            <div
              style={{
                marginTop: 22,
                height: 54,
                borderRadius: 14,
                background: confirmed > 0.5 ? C.green : C.brand,
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                fontWeight: 800,
                fontSize: 17,
                transform: `scale(${(1 + hover * 0.03) * (1 - press * 0.06)})`,
                boxShadow: `0 ${8 + hover * 10}px ${20 + hover * 20}px rgba(255,80,0,${0.25 + hover * 0.2})`,
              }}
            >
              {confirmed > 0.5 && <IconCheck size={20} color="#fff" stroke={3} />}
              {confirmed > 0.5 ? "Confirmée" : "Confirmer"}
            </div>
          </div>
        </div>
      </div>
      {/* bandeau de confirmation */}
      <div
        style={{
          position: "absolute",
          top: 24,
          left: "50%",
          transform: `translate(-50%, ${mix(banner, -120, 0)}px)`,
          opacity: banner,
          padding: "16px 24px",
          borderRadius: 14,
          background: "#ecfdf5",
          border: "1px solid #a7f3d0",
          color: "#065f46",
          fontSize: 16.5,
          display: "flex",
          gap: 12,
          alignItems: "center",
          boxShadow: "0 20px 40px rgba(15,23,42,0.15)",
          whiteSpace: "nowrap",
        }}
      >
        <span style={{ width: 28, height: 28, borderRadius: 14, background: C.green, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <IconCheck size={17} color="#fff" stroke={3} />
        </span>
        <span>
          <b>Statut mis à jour</b> — Notification envoyée sur l'application du client.
        </span>
      </div>
    </div>
  );
};
