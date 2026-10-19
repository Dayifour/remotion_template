import React from "react";

type P = { size?: number; color?: string; stroke?: number; style?: React.CSSProperties };

const Svg: React.FC<P & { children: React.ReactNode; fill?: string }> = ({ size = 24, color = "currentColor", stroke = 2, style, children, fill = "none" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" style={style}>
    {children}
  </svg>
);

export const IconStore: React.FC<P> = (p) => (
  <Svg {...p}>
    <path d="M3 9l1.5-5h15L21 9" />
    <path d="M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0" />
    <path d="M5 11v9h14v-9" />
    <path d="M10 20v-5h4v5" />
  </Svg>
);
export const IconCart: React.FC<P> = (p) => (
  <Svg {...p}>
    <circle cx="9" cy="20" r="1.3" />
    <circle cx="18" cy="20" r="1.3" />
    <path d="M2 3h3l2.6 12.4a1.5 1.5 0 0 0 1.5 1.1h8.8a1.5 1.5 0 0 0 1.5-1.1L21 7H6" />
  </Svg>
);
export const IconBox: React.FC<P> = (p) => (
  <Svg {...p}>
    <path d="M21 8l-9-5-9 5v8l9 5 9-5z" />
    <path d="M3 8l9 5 9-5M12 13v8" />
  </Svg>
);
export const IconUser: React.FC<P> = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
  </Svg>
);
export const IconBike: React.FC<P> = (p) => (
  <Svg {...p}>
    <circle cx="5.5" cy="17" r="3.5" />
    <circle cx="18.5" cy="17" r="3.5" />
    <path d="M15 6h2l1.5 11M5.5 17L9 9h6l-3.5 8M9 9L8 6H6" />
  </Svg>
);
export const IconSearch: React.FC<P> = (p) => (
  <Svg {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-4-4" />
  </Svg>
);
export const IconCheck: React.FC<P> = (p) => (
  <Svg {...p}>
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </Svg>
);
export const IconPlus: React.FC<P> = (p) => (
  <Svg {...p}>
    <path d="M12 5v14M5 12h14" />
  </Svg>
);
export const IconMinus: React.FC<P> = (p) => (
  <Svg {...p}>
    <path d="M5 12h14" />
  </Svg>
);
export const IconPin: React.FC<P> = (p) => (
  <Svg {...p}>
    <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" />
    <circle cx="12" cy="9.5" r="2.5" />
  </Svg>
);
export const IconTruck: React.FC<P> = (p) => (
  <Svg {...p}>
    <path d="M2 6h11v10H2zM13 9h4.5l3.5 3.5V16h-8" />
    <circle cx="6" cy="17.5" r="2" />
    <circle cx="17" cy="17.5" r="2" />
  </Svg>
);
export const IconClock: React.FC<P> = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </Svg>
);
export const IconCash: React.FC<P> = (p) => (
  <Svg {...p}>
    <rect x="2" y="6" width="20" height="12" rx="2" />
    <circle cx="12" cy="12" r="2.5" />
    <path d="M6 9v.01M18 15v.01" />
  </Svg>
);
export const IconPhone: React.FC<P> = (p) => (
  <Svg {...p}>
    <rect x="6" y="2" width="12" height="20" rx="2.5" />
    <path d="M11 18h2" />
  </Svg>
);
export const IconBell: React.FC<P> = (p) => (
  <Svg {...p}>
    <path d="M6 9a6 6 0 0 1 12 0c0 6 2.5 7.5 2.5 7.5h-17S6 15 6 9z" />
    <path d="M10 20a2 2 0 0 0 4 0" />
  </Svg>
);
export const IconBack: React.FC<P> = (p) => (
  <Svg {...p}>
    <path d="M19 12H5M11 6l-6 6 6 6" />
  </Svg>
);
export const IconChevron: React.FC<P> = (p) => (
  <Svg {...p}>
    <path d="M9 6l6 6-6 6" />
  </Svg>
);
export const IconGrid: React.FC<P> = (p) => (
  <Svg {...p}>
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
  </Svg>
);
export const IconLock: React.FC<P> = (p) => (
  <Svg {...p}>
    <rect x="5" y="11" width="14" height="10" rx="2" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
  </Svg>
);
export const IconSend: React.FC<P> = (p) => (
  <Svg {...p}>
    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4z" />
  </Svg>
);

/** Logo WhatsApp (bulle + combiné), plein. */
export const IconWhatsApp: React.FC<{ size?: number; color?: string; style?: React.CSSProperties }> = ({ size = 24, color = "#fff", style }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" style={style}>
    <path
      fill={color}
      d="M16 3C8.8 3 3 8.7 3 15.8c0 2.5.7 4.9 2.1 7L3.2 29l6.4-1.8c2 1.1 4.2 1.6 6.4 1.6 7.2 0 13-5.7 13-12.8S23.2 3 16 3zm0 23.4c-2 0-3.9-.5-5.6-1.5l-.4-.2-3.8 1 1-3.7-.3-.4a10.4 10.4 0 0 1-1.6-5.7C5.3 10 10.1 5.3 16 5.3S26.7 10 26.7 15.8 21.9 26.4 16 26.4zm5.9-7.9c-.3-.2-1.9-.9-2.2-1-.3-.1-.5-.2-.7.2-.2.3-.8 1-1 1.2-.2.2-.4.2-.7.1-.3-.2-1.4-.5-2.6-1.6-1-.9-1.6-1.9-1.8-2.2-.2-.3 0-.5.1-.7l.5-.6c.2-.2.2-.3.3-.6.1-.2 0-.4 0-.6l-1-2.4c-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.3-1.2 1.1-1.2 2.8s1.2 3.2 1.4 3.5c.2.2 2.4 3.6 5.8 5 2.8 1.1 3.4.9 4 .8.6-.1 1.9-.8 2.2-1.5.3-.7.3-1.4.2-1.5-.1-.1-.3-.2-.6-.3z"
    />
  </svg>
);
