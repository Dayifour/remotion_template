import React from "react";
import { Img, staticFile } from "remotion";
import { C, DEMO, fcfa } from "../theme";
import { mix } from "../timing";
import { IconBack, IconBike, IconBox, IconCart, IconCheck, IconMinus, IconPin, IconPlus, IconSearch, IconStore, IconUser, IconWhatsApp } from "./Icons";
import { Screen, SCREEN_H, SCREEN_W } from "./Phone";

/**
 * Écrans de l'application Android Yelen Sugu (thème sombre), redessinés d'après
 * les captures fournies — avec les données du compte de démonstration.
 */
const A = {
  bg: "#19191b",
  head: "#202022",
  card: "#1f1f22",
  line: "#2e2e33",
  text: "#f4f4f5",
  muted: "#9aa4b2",
  brand: "#e53b00",
  navy: "#101a33",
  green: "#0f8f6f",
};

export const StatusBar: React.FC<{ time?: string; light?: boolean }> = ({ time = "14:32", light = true }) => {
  const c = light ? "#fff" : C.ink;
  return (
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 40, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 26px", fontSize: 15, fontWeight: 600, color: c, zIndex: 5 }}>
      <span>{time}</span>
      <span style={{ display: "flex", gap: 6, alignItems: "center" }}>
        {[0, 1].map((k) => (
          <span key={k} style={{ display: "flex", gap: 1.5, alignItems: "flex-end" }}>
            {[5, 7, 9, 11].map((h) => (
              <span key={h} style={{ width: 2.5, height: h, background: c, borderRadius: 1 }} />
            ))}
          </span>
        ))}
        <svg width="16" height="12" viewBox="0 0 16 12">
          <path d="M8 11.5L.5 4a10.6 10.6 0 0 1 15 0z" fill={c} />
        </svg>
        <span style={{ width: 26, height: 13, borderRadius: 4, border: `1.5px solid ${c}`, padding: 1.5, display: "flex" }}>
          <span style={{ width: "78%", background: c, borderRadius: 1.5 }} />
        </span>
      </span>
    </div>
  );
};

const NavBar: React.FC = () => (
  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 44, background: "#141416", display: "flex", justifyContent: "space-around", alignItems: "center", padding: "0 70px" }}>
    <span style={{ width: 13, height: 13, background: "#d4d4d8", borderRadius: 1.5 }} />
    <span style={{ width: 17, height: 17, borderRadius: 9, border: "2.5px solid #d4d4d8" }} />
    <span style={{ width: 0, height: 0, borderTop: "8px solid transparent", borderBottom: "8px solid transparent", borderRight: "13px solid #d4d4d8" }} />
  </div>
);

export type Tab = "boutique" | "panier" | "commandes" | "compte";
export const TabBar: React.FC<{ active: Tab; cart?: number; badgePop?: number; glow?: Tab; glowP?: number }> = ({ active, cart = 0, badgePop = 0, glow, glowP = 0 }) => {
  const tabs: { id: Tab; label: string; Icon: React.FC<{ size?: number; color?: string; stroke?: number }> }[] = [
    { id: "boutique", label: "Boutique", Icon: IconStore },
    { id: "panier", label: "Panier", Icon: IconCart },
    { id: "commandes", label: "Mes commandes", Icon: IconBox },
    { id: "compte", label: "Mon compte", Icon: IconUser },
  ];
  return (
    <div style={{ position: "absolute", bottom: 44, left: 0, right: 0, height: 74, background: A.head, borderTop: `1px solid ${A.line}`, display: "flex" }}>
      {tabs.map(({ id, label, Icon }) => {
        const on = id === active;
        const col = on ? "#ff6a2b" : "#b6bcc6";
        return (
          <div key={id} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, position: "relative" }}>
            {glow === id && glowP > 0 && (
              <div style={{ position: "absolute", width: 70, height: 70, borderRadius: 35, background: `radial-gradient(circle, rgba(255,80,0,${0.45 * glowP}), transparent 70%)` }} />
            )}
            <Icon size={28} color={col} stroke={1.7} />
            <span style={{ fontSize: 12, fontWeight: 600, color: col }}>{label}</span>
            {id === "panier" && cart > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: 8,
                  left: "56%",
                  minWidth: 21,
                  height: 21,
                  borderRadius: 11,
                  background: A.brand,
                  color: "#fff",
                  fontSize: 12,
                  fontWeight: 800,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transform: `scale(${1 + badgePop * 0.6})`,
                  boxShadow: `0 0 ${badgePop * 24}px rgba(255,80,0,0.9)`,
                }}
              >
                {cart}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};

const Header: React.FC<{ title: string; back?: boolean }> = ({ title, back }) => (
  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 100, background: A.head, display: "flex", alignItems: "flex-end", padding: "0 20px 18px", gap: 12, zIndex: 3 }}>
    {back && <IconBack size={24} color="#fff" />}
    <span style={{ fontSize: 26, fontWeight: 800, letterSpacing: -0.4 }}>{title}</span>
  </div>
);

/** Corps défilant, entre l'en-tête et la barre d'onglets. */
const Body: React.FC<{ children: React.ReactNode; scroll?: number; bottom?: number }> = ({ children, scroll = 0, bottom = 118 }) => (
  <div style={{ position: "absolute", top: 100, left: 0, right: 0, bottom, overflow: "hidden" }}>
    <div style={{ transform: `translateY(${-scroll}px)`, padding: "18px 18px 40px" }}>{children}</div>
  </div>
);

export const FreeBanner: React.FC<{ glow?: number }> = ({ glow = 0 }) => (
  <div
    style={{
      height: 46,
      borderRadius: 12,
      background: A.brand,
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "0 16px",
      fontSize: 14.5,
      fontWeight: 700,
      boxShadow: `0 0 ${glow * 40}px rgba(255,80,0,${glow * 0.8})`,
    }}
  >
    <IconBike size={22} color="#fff" stroke={1.8} />
    Livraison gratuite partout à Bamako
  </div>
);

const CATS = [
  { e: "🛍️", t: "Tout" },
  { e: "📱", t: "Smartphones" },
  { e: "🎧", t: "Audio" },
  { e: "🔌", t: "Accessoires" },
  { e: "💻", t: "Ordinateurs" },
];

export const ProductCard: React.FC<{ p: (typeof DEMO.products)[number]; press?: number; added?: number; width?: number }> = ({ p, press = 0, added = 0, width = 173 }) => (
  <div style={{ width, borderRadius: 16, background: A.card, border: `1px solid ${A.line}`, overflow: "hidden" }}>
    <Img src={staticFile(p.img)} style={{ width: "100%", height: width * 0.88, objectFit: "cover", display: "block" }} />
    <div style={{ padding: "12px 12px 13px" }}>
      <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.25, height: 36 }}>{p.name}</div>
      <div style={{ fontSize: 15.5, fontWeight: 800, color: "#ff5a1a", marginTop: 4 }}>{fcfa(p.price)}</div>
      <div
        style={{
          marginTop: 10,
          height: 38,
          borderRadius: 11,
          background: added > 0.5 ? A.green : A.brand,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          fontSize: 14.5,
          fontWeight: 700,
          transform: `scale(${1 - press * 0.08})`,
          filter: `brightness(${1 - press * 0.15})`,
        }}
      >
        {added > 0.5 ? <IconCheck size={18} color="#fff" stroke={2.6} /> : <IconPlus size={18} color="#fff" stroke={2.4} />}
        {added > 0.5 ? "Ajouté" : "Ajouter"}
      </div>
    </div>
  </div>
);

export const BoutiqueScreen: React.FC<{
  scroll?: number;
  cat?: number;
  press?: Record<string, number>;
  added?: Record<string, number>;
  cart?: number;
  badgePop?: number;
  bannerGlow?: number;
}> = ({ scroll = 0, cat = 0, press = {}, added = {}, cart = 0, badgePop = 0, bannerGlow = 0 }) => (
  <Screen bg={A.bg}>
    <Header title="Boutique" />
    <Body scroll={scroll}>
      <FreeBanner glow={bannerGlow} />
      <div style={{ marginTop: 14, height: 50, borderRadius: 13, border: `1px solid ${A.line}`, background: "#1d1d20", display: "flex", alignItems: "center", gap: 10, padding: "0 16px", color: A.muted, fontSize: 15.5 }}>
        <IconSearch size={19} color={A.muted} />
        Rechercher un produit…
      </div>
      <div style={{ marginTop: 14, display: "flex", gap: 8, whiteSpace: "nowrap" }}>
        {CATS.map((c, i) => (
          <div
            key={c.t}
            style={{
              height: 38,
              padding: "0 14px",
              borderRadius: 19,
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 14.5,
              fontWeight: 600,
              flexShrink: 0,
              background: i === cat ? A.navy : "transparent",
              border: `1px solid ${i === cat ? "#24345e" : A.line}`,
              color: i === cat ? "#fff" : "#c3c8d1",
            }}
          >
            <span style={{ fontSize: 15 }}>{c.e}</span>
            {c.t}
          </div>
        ))}
      </div>
      <div style={{ marginTop: 18, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {[...DEMO.products, ...DEMO.products].map((p, i) => (
          <ProductCard key={i} p={p} press={press[`${p.id}${i >= 4 ? "-2" : ""}`] ?? 0} added={i < 4 ? added[p.id] ?? 0 : 0} />
        ))}
      </div>
    </Body>
    <TabBar active="boutique" cart={cart} badgePop={badgePop} />
    <StatusBar />
    <NavBar />
  </Screen>
);

const Row: React.FC<{ l: React.ReactNode; r: React.ReactNode; style?: React.CSSProperties }> = ({ l, r, style }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 15.5, ...style }}>
    <span>{l}</span>
    <span>{r}</span>
  </div>
);

export const PanierScreen: React.FC<{ highlight?: number; cart?: number; press?: number }> = ({ highlight = 0, cart = 2, press = 0 }) => {
  const [a, b] = DEMO.products;
  const total = a.price + b.price;
  return (
    <Screen bg={A.bg}>
      <Header title="Panier" />
      <Body>
        {[a, b].map((p) => (
          <div key={p.id} style={{ display: "flex", gap: 14, padding: 12, borderRadius: 16, background: A.card, border: `1px solid ${A.line}`, marginBottom: 12 }}>
            <Img src={staticFile(p.img)} style={{ width: 84, height: 84, borderRadius: 12, objectFit: "cover" }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 600 }}>{p.name}</div>
              <div style={{ fontSize: 15.5, fontWeight: 800, color: "#ff5a1a", marginTop: 4 }}>{fcfa(p.price)}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 8 }}>
                {[IconMinus, null, IconPlus].map((I, k) =>
                  I ? (
                    <span key={k} style={{ width: 30, height: 30, borderRadius: 9, border: `1px solid ${A.line}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <I size={16} color="#e4e4e7" />
                    </span>
                  ) : (
                    <span key={k} style={{ fontSize: 16, fontWeight: 700 }}>1</span>
                  ),
                )}
              </div>
            </div>
          </div>
        ))}
        <div style={{ marginTop: 8, padding: "18px 18px", borderRadius: 16, background: A.card, border: `1px solid ${A.line}` }}>
          <Row l={<span style={{ color: A.muted }}>Sous-total</span>} r={<b>{fcfa(total)}</b>} />
          <div
            style={{
              margin: "14px -10px",
              padding: "10px 10px",
              borderRadius: 12,
              background: `rgba(16,163,127,${0.18 * highlight})`,
              boxShadow: `0 0 0 ${2 * highlight}px rgba(16,163,127,${0.9 * highlight}), 0 0 ${30 * highlight}px rgba(16,163,127,${0.5 * highlight})`,
              transform: `scale(${1 + highlight * 0.04})`,
            }}
          >
            <Row l={<span style={{ color: A.muted, display: "flex", gap: 8, alignItems: "center" }}><IconBike size={18} color={A.muted} />Livraison</span>} r={<b style={{ color: "#16c79a" }}>Gratuite</b>} />
          </div>
          <div style={{ height: 1, background: A.line, margin: "4px 0 14px" }} />
          <Row l={<b style={{ fontSize: 18 }}>Total</b>} r={<b style={{ fontSize: 20 }}>{fcfa(total)}</b>} />
        </div>
        <div style={{ marginTop: 16, height: 54, borderRadius: 14, background: A.brand, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, fontWeight: 800, transform: `scale(${1 - press * 0.05})` }}>
          Finaliser ma commande
        </div>
      </Body>
      <TabBar active="panier" cart={cart} />
      <StatusBar />
      <NavBar />
    </Screen>
  );
};

const Field: React.FC<{ label: string; value: string; typed?: number; focus?: boolean }> = ({ label, value, typed = 1, focus }) => (
  <div style={{ marginBottom: 14 }}>
    <div style={{ fontSize: 14.5, fontWeight: 600, marginBottom: 8 }}>{label}</div>
    <div style={{ height: 50, borderRadius: 13, border: `1.5px solid ${focus ? "#ff6a2b" : A.line}`, background: "#1d1d20", display: "flex", alignItems: "center", padding: "0 16px", fontSize: 16 }}>
      {value.slice(0, Math.round(value.length * typed))}
      {focus && <span style={{ width: 2, height: 20, background: "#ff6a2b", marginLeft: 1 }} />}
    </div>
  </div>
);

export const CheckoutScreen: React.FC<{ press?: number; typed?: number }> = ({ press = 0, typed = 1 }) => {
  const total = DEMO.products[0].price + DEMO.products[1].price;
  return (
    <Screen bg={A.bg}>
      <Header title="Finaliser ma commande" back />
      <Body bottom={44}>
        <Field label="Nom complet" value={DEMO.client} />
        <Field label="Téléphone WhatsApp" value={DEMO.phone} />
        <div style={{ fontSize: 14.5, fontWeight: 600, marginBottom: 8 }}>Ville</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
          {["ACI 2000", "Badalabougou", "Hamdallaye", "Kalabancoura", "Sotuba"].map((v) => (
            <span key={v} style={{ height: 36, padding: "0 14px", borderRadius: 18, display: "flex", alignItems: "center", fontSize: 14, fontWeight: 600, background: v === DEMO.city ? A.brand : "transparent", border: `1px solid ${v === DEMO.city ? A.brand : A.line}`, color: v === DEMO.city ? "#fff" : "#c3c8d1" }}>
              {v}
            </span>
          ))}
        </div>
        <Field label="Adresse" value={DEMO.address} typed={typed} focus={typed < 1} />
        <div style={{ padding: "14px 16px", borderRadius: 14, background: A.card, border: `1px solid ${A.line}` }}>
          <Row l={<span style={{ color: A.muted }}>Livraison</span>} r={<b style={{ color: "#16c79a" }}>Gratuite</b>} />
          <Row l={<b>Total</b>} r={<b style={{ fontSize: 18 }}>{fcfa(total)}</b>} style={{ marginTop: 8 }} />
        </div>
        <div
          style={{
            marginTop: 16,
            height: 56,
            borderRadius: 14,
            background: C.wa,
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            fontSize: 17,
            fontWeight: 800,
            transform: `scale(${1 - press * 0.06})`,
            boxShadow: `0 10px 30px rgba(37,211,102,${0.35 + press * 0.3})`,
          }}
        >
          <IconWhatsApp size={24} />
          Commander sur WhatsApp
        </div>
      </Body>
      <StatusBar />
      <NavBar />
    </Screen>
  );
};

/** Conversation WhatsApp : le message de commande, déjà rédigé, numéro inclus. */
export const WhatsAppScreen: React.FC<{ reveal?: number; sent?: number; glowOrder?: number }> = ({ reveal = 1, sent = 1, glowOrder = 0 }) => {
  const [a, b] = DEMO.products;
  const msg: React.ReactNode[] = [
    "Bonjour Yelen Service, je souhaite commander :",
    "",
    <span key="o" style={{ background: `rgba(37,211,102,${0.3 * glowOrder})`, borderRadius: 6, padding: "1px 4px", boxShadow: `0 0 ${18 * glowOrder}px rgba(37,211,102,${0.8 * glowOrder})`, fontWeight: glowOrder > 0.3 ? 700 : 400 }}>
      Commande n° {DEMO.order}
    </span>,
    "",
    `• 1× ${a.name} — ${fcfa(a.price)}`,
    `• 1× ${b.name} — ${fcfa(b.price)}`,
    "",
    "Livraison : Gratuite",
    `Total : ${fcfa(a.price + b.price)}`,
    "",
    `Nom : ${DEMO.client}`,
    `Adresse : ${DEMO.address}`,
  ];
  const shown = Math.ceil(msg.length * reveal);
  return (
    <Screen bg="#0b141a">
      <div style={{ position: "absolute", inset: 0, opacity: 0.06, backgroundImage: "radial-gradient(#fff 1px, transparent 1.4px)", backgroundSize: "22px 22px" }} />
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 104, background: "#1f2c34", display: "flex", alignItems: "flex-end", gap: 12, padding: "0 16px 14px" }}>
        <IconBack size={24} color="#fff" />
        <div style={{ width: 42, height: 42, borderRadius: 21, background: C.brand, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <IconCart size={22} color="#fff" stroke={2.2} />
        </div>
        <div>
          <div style={{ fontSize: 18, fontWeight: 600 }}>Yelen Services</div>
          <div style={{ fontSize: 13, color: "#8696a0" }}>Compte professionnel</div>
        </div>
      </div>
      <div style={{ position: "absolute", top: 124, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <span style={{ fontSize: 13, color: "#8696a0", background: "#182229", padding: "5px 12px", borderRadius: 8 }}>Aujourd'hui</span>
      </div>
      <div
        style={{
          position: "absolute",
          top: 170,
          right: 14,
          width: 318,
          background: "#005c4b",
          borderRadius: "14px 4px 14px 14px",
          padding: "12px 14px 26px",
          fontSize: 15.5,
          lineHeight: 1.42,
          color: "#e9edef",
          opacity: reveal > 0 ? 1 : 0,
          transformOrigin: "100% 0",
          transform: `scale(${mix(Math.min(1, reveal * 4), 0.85, 1)})`,
        }}
      >
        {msg.slice(0, shown).map((m, i) => (
          <div key={i} style={{ minHeight: m === "" ? 10 : undefined }}>{m}</div>
        ))}
        <div style={{ position: "absolute", right: 10, bottom: 6, fontSize: 12, color: "#8fb4ad", display: "flex", gap: 4, alignItems: "center" }}>
          14:32
          <svg width="18" height="11" viewBox="0 0 18 11">
            <path d="M1 6l3 3 6-7M7 9l1 0.5 7-8" stroke={sent > 0.5 ? "#53bdeb" : "#8fb4ad"} strokeWidth="1.8" fill="none" />
          </svg>
        </div>
      </div>
      <div style={{ position: "absolute", bottom: 56, left: 10, right: 10, height: 52, display: "flex", gap: 8 }}>
        <div style={{ flex: 1, borderRadius: 26, background: "#1f2c34", display: "flex", alignItems: "center", padding: "0 20px", color: "#8696a0", fontSize: 16 }}>Message</div>
        <div style={{ width: 52, borderRadius: 26, background: C.wa, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="20" height="22" viewBox="0 0 20 22">
            <rect x="6" y="1" width="8" height="13" rx="4" fill="#0b141a" />
            <path d="M3 10a7 7 0 0 0 14 0M10 17v4" stroke="#0b141a" strokeWidth="2" fill="none" />
          </svg>
        </div>
      </div>
      <StatusBar />
      <NavBar />
    </Screen>
  );
};

export const STEPS = [
  { t: "En attente", d: "19 oct. à 14:32" },
  { t: "Confirmée", d: "19 oct. à 14:35" },
  { t: "En préparation", d: "19 oct. à 15:10" },
  { t: "En cours de livraison", d: "19 oct. à 16:02" },
  { t: "Livrée", d: "19 oct. à 16:47" },
];

/** Mes commandes : suivi en cinq étapes. `done` = nombre d'étapes franchies (fractionnaire = animation). */
export const OrdersScreen: React.FC<{ done: number; dateGlow?: number; cardScale?: number; flash?: number }> = ({ done, dateGlow = 0, flash = 0 }) => {
  const total = DEMO.products[0].price + DEMO.products[1].price;
  const status = done >= 5 ? "Livrée" : done >= 4 ? "En route" : done >= 3 ? "En préparation" : done >= 2 ? "Confirmée" : "En attente";
  const green = done >= 2;
  return (
    <Screen bg={A.bg}>
      <Header title="Mes commandes" />
      <Body>
        <div style={{ borderRadius: 20, background: A.card, border: `1px solid ${A.line}`, padding: "20px 20px", boxShadow: `0 0 ${flash * 40}px rgba(16,163,127,${flash * 0.6})` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <span style={{ fontSize: 19, fontWeight: 800 }}>#{DEMO.order}</span>
                <span style={{ fontSize: 13, fontWeight: 700, padding: "4px 10px", borderRadius: 10, color: green ? "#34d3a6" : "#ff8a50", background: green ? "rgba(16,163,127,0.16)" : "rgba(255,80,0,0.16)" }}>{status}</span>
              </div>
              <div style={{ fontSize: 13.5, color: A.muted, marginTop: 6 }}>19 oct. 2026 · 2 articles</div>
            </div>
            <span style={{ fontSize: 16.5, fontWeight: 800 }}>{fcfa(total)}</span>
          </div>
          <div style={{ height: 1, background: A.line, margin: "16px 0 14px" }} />
          {STEPS.map((s, i) => {
            const p = Math.max(0, Math.min(1, done - i)); // 0 → 1 : l'étape passe au vert
            const nextP = Math.max(0, Math.min(1, done - i - 1));
            return (
              <div key={s.t} style={{ display: "flex", gap: 14, position: "relative", height: i < 4 ? 64 : 48 }}>
                {i < 4 && (
                  <div style={{ position: "absolute", left: 15, top: 32, width: 3, height: 34, background: A.line, borderRadius: 2, overflow: "hidden" }}>
                    <div style={{ width: "100%", height: `${nextP * 100}%`, background: C.green }} />
                  </div>
                )}
                <div
                  style={{
                    width: 33,
                    height: 33,
                    borderRadius: 17,
                    flexShrink: 0,
                    background: p > 0 ? C.green : "transparent",
                    border: `2.5px solid ${p > 0 ? C.green : "#4a4a52"}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transform: `scale(${1 + Math.sin(p * Math.PI) * 0.35})`,
                    boxShadow: p > 0 && p < 1 ? `0 0 ${24 * Math.sin(p * Math.PI)}px rgba(16,163,127,0.9)` : "none",
                  }}
                >
                  {p > 0.2 && <IconCheck size={19} color="#fff" stroke={3} style={{ opacity: Math.min(1, (p - 0.2) * 3) }} />}
                </div>
                <div>
                  <div style={{ fontSize: 16.5, fontWeight: 700, color: p > 0 ? A.text : "#71717a" }}>{s.t}</div>
                  <div
                    style={{
                      fontSize: 14,
                      color: p > 0 ? (dateGlow > 0 ? `rgb(${mix(dateGlow, 154, 52)},${mix(dateGlow, 164, 211)},${mix(dateGlow, 178, 166)})` : A.muted) : "#52525b",
                      marginTop: 2,
                      fontWeight: dateGlow > 0.5 ? 700 : 400,
                    }}
                  >
                    {p > 0 ? s.d : "—"}
                  </div>
                </div>
              </div>
            );
          })}
          <div style={{ marginTop: 14, fontSize: 14.5, color: A.muted, display: "flex", flexDirection: "column", gap: 6 }}>
            <Row l={`1 × ${DEMO.products[0].name}`} r={<b style={{ color: A.text }}>{fcfa(DEMO.products[0].price)}</b>} style={{ fontSize: 14.5 }} />
            <Row l={`1 × ${DEMO.products[1].name}`} r={<b style={{ color: A.text }}>{fcfa(DEMO.products[1].price)}</b>} style={{ fontSize: 14.5 }} />
            <span style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <IconPin size={16} color="#ef4444" /> {DEMO.address}
            </span>
          </div>
        </div>
      </Body>
      <TabBar active="commandes" cart={0} />
      <StatusBar />
      <NavBar />
    </Screen>
  );
};

/** Écran verrouillé + notification Yelen Sugu. */
export const LockScreen: React.FC<{ notif: number; time?: string; press?: number }> = ({ notif, time = "14:35", press = 0 }) => (
  <Screen bg="#000">
    <div style={{ position: "absolute", inset: 0, background: "radial-gradient(120% 80% at 30% 20%, #3b1d12 0%, #160d0a 45%, #050506 100%)" }} />
    <div style={{ position: "absolute", inset: 0, background: "radial-gradient(70% 50% at 80% 90%, rgba(255,80,0,0.25), transparent 70%)" }} />
    <StatusBar time={time} />
    <div style={{ position: "absolute", top: 120, width: "100%", textAlign: "center", color: "#fff" }}>
      <div style={{ fontSize: 17, fontWeight: 500, opacity: 0.85 }}>dimanche 19 octobre</div>
      <div style={{ fontSize: 104, fontWeight: 300, letterSpacing: -4, lineHeight: 1.05 }}>{time}</div>
    </div>
    <div
      style={{
        position: "absolute",
        top: 330,
        left: 14,
        right: 14,
        borderRadius: 24,
        padding: "16px 18px",
        background: "rgba(245,245,247,0.92)",
        color: C.ink,
        boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
        opacity: Math.min(1, notif * 2),
        transform: `translateY(${mix(notif, -140, 0)}px) scale(${mix(notif, 0.9, 1) * (1 - press * 0.04)})`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, color: C.gray, fontWeight: 600 }}>
        <span style={{ width: 22, height: 22, borderRadius: 6, background: C.brand, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <IconCart size={14} color="#fff" stroke={2.4} />
        </span>
        Yelen Sugu · maintenant
      </div>
      <div style={{ fontSize: 17, fontWeight: 800, marginTop: 8 }}>Commande confirmée ✅</div>
      <div style={{ fontSize: 15, marginTop: 3, color: "#334155" }}>Votre commande #{DEMO.order} est confirmée.</div>
    </div>
    <div style={{ position: "absolute", bottom: 40, width: "100%", display: "flex", justifyContent: "center" }}>
      <div style={{ width: 130, height: 5, borderRadius: 3, background: "rgba(255,255,255,0.7)" }} />
    </div>
  </Screen>
);

export { SCREEN_H, SCREEN_W };
