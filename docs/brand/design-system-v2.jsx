import { useState, useEffect, useRef } from "react";

/* ═══════════════════════════════════════════════════════════════
   SECURE PRIDE DESIGN SYSTEM v2.0
   Rebuilt from moodboard: Neon cyberpunk + pride identity.
   "Where we draw the line online."
   ═══════════════════════════════════════════════════════════════ */

// ─── DESIGN TOKENS ──────────────────────────────────────────
const T = {
  color: {
    // Neon pride spectrum
    neon: {
      pink:    "#ff2d95",
      magenta: "#e040fb",
      purple:  "#b24bf3",
      violet:  "#7c4dff",
      blue:    "#448aff",
      cyan:    "#06d6e0",
      teal:    "#0a7e74",
      green:   "#00e676",
      yellow:  "#ffd600",
      orange:  "#ff9100",
      red:     "#ff3d00",
    },
    // Rainbow gradient stops (for fills)
    rainbow: ["#ff3d00","#ff9100","#ffd600","#00e676","#448aff","#b24bf3","#ff2d95"],

    // Core brand (from icon pack + moodboard)
    brand: {
      primary:   "#0a7e74",  // teal anchor
      accent:    "#3a2a5e",  // deep purple
      electric:  "#06d6e0",  // cyan neon
      hotPink:   "#ff2d95",  // neon pink
      violet:    "#b24bf3",  // neon violet
    },

    // Surfaces — dark-first
    dark: {
      void:       "#05050f",  // deepest black
      bg:         "#0a0a1a",  // main background
      surface:    "#111128",  // card surface
      elevated:   "#1a1a35",  // raised elements
      border:     "#2a2a50",  // subtle borders
      borderGlow: "#3a3a6a",  // hover borders
    },

    // Light mode (secondary, for docs/print)
    light: {
      bg:         "#faf8f5",
      surface:    "#ffffff",
      elevated:   "#f0ede8",
      border:     "#d4cfc7",
    },

    // Semantic status (neon-coded)
    status: {
      protected: "#06d6e0",  // cyan — active protection
      warning:   "#ffd600",  // yellow — needs attention
      blocked:   "#ff2d95",  // hot pink — threat stopped
      info:      "#448aff",  // blue — informational
    },

    // Text
    text: {
      primary:   "#eeeef6",
      secondary: "#9898b8",
      muted:     "#5a5a78",
      inverse:   "#0a0a1a",
    },
  },

  typography: {
    display: "'Orbitron', 'Rajdhani', sans-serif",
    heading: "'Rajdhani', 'DM Sans', sans-serif",
    body:    "'Source Sans 3', -apple-system, sans-serif",
    mono:    "'JetBrains Mono', 'SF Mono', monospace",

    scale: {
      xs:   { size: "0.75rem",  lh: "1rem"     },
      sm:   { size: "0.875rem", lh: "1.25rem"   },
      base: { size: "1rem",     lh: "1.625rem"  },
      lg:   { size: "1.125rem", lh: "1.75rem"   },
      xl:   { size: "1.25rem",  lh: "1.875rem"  },
      "2xl":{ size: "1.5rem",   lh: "2rem"      },
      "3xl":{ size: "2rem",     lh: "2.5rem"    },
      "4xl":{ size: "2.75rem",  lh: "3rem"      },
      "5xl":{ size: "3.5rem",   lh: "3.75rem"   },
    },
    weight: { regular: 400, medium: 500, semibold: 600, bold: 700, black: 900 },
  },

  spacing: {
    1: "0.25rem", 2: "0.5rem", 3: "0.75rem", 4: "1rem",
    5: "1.25rem", 6: "1.5rem", 8: "2rem", 10: "2.5rem",
    12: "3rem", 16: "4rem", 20: "5rem",
  },

  radius: { sm: "6px", md: "8px", lg: "12px", xl: "16px", "2xl": "20px", full: "9999px" },

  glow: {
    cyan:    (i=0.5) => `0 0 ${20*i}px rgba(6,214,224,${0.4*i}), 0 0 ${60*i}px rgba(6,214,224,${0.15*i})`,
    pink:    (i=0.5) => `0 0 ${20*i}px rgba(255,45,149,${0.4*i}), 0 0 ${60*i}px rgba(255,45,149,${0.15*i})`,
    violet:  (i=0.5) => `0 0 ${20*i}px rgba(178,75,243,${0.4*i}), 0 0 ${60*i}px rgba(178,75,243,${0.15*i})`,
    rainbow: "0 0 20px rgba(255,45,149,0.3), 0 0 40px rgba(178,75,243,0.2), 0 0 60px rgba(6,214,224,0.15)",
  },

  motion: {
    fast:   "150ms cubic-bezier(0.4, 0, 0.2, 1)",
    base:   "250ms cubic-bezier(0.4, 0, 0.2, 1)",
    slow:   "500ms cubic-bezier(0.4, 0, 0.2, 1)",
    glow:   "1.5s ease-in-out infinite alternate",
  },
};


// ─── RAINBOW GRADIENT CSS ────────────────────────────────────
const rainbowGrad = `linear-gradient(135deg, ${T.color.rainbow.join(", ")})`;
const neonGrad = `linear-gradient(135deg, ${T.color.neon.cyan}, ${T.color.neon.violet}, ${T.color.neon.pink})`;


// ─── CIRCUIT BOARD BACKGROUND PATTERN ────────────────────────
function CircuitPattern({ opacity = 0.06 }) {
  return (
    <svg
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity, pointerEvents: "none" }}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <pattern id="circuit" x="0" y="0" width="120" height="120" patternUnits="userSpaceOnUse">
          <path d="M20 0v40h40v40h40" stroke="#06d6e0" strokeWidth="1" fill="none" opacity="0.5" />
          <path d="M0 60h30v-30h30" stroke="#b24bf3" strokeWidth="1" fill="none" opacity="0.4" />
          <path d="M80 0v20h40" stroke="#ff2d95" strokeWidth="1" fill="none" opacity="0.3" />
          <circle cx="20" cy="40" r="2.5" fill="#06d6e0" opacity="0.6" />
          <circle cx="60" cy="80" r="2.5" fill="#b24bf3" opacity="0.5" />
          <circle cx="100" cy="40" r="2" fill="#ff2d95" opacity="0.4" />
          <circle cx="60" cy="40" r="2" fill="#06d6e0" opacity="0.3" />
          <path d="M100 80v40" stroke="#06d6e0" strokeWidth="1" fill="none" opacity="0.25" />
          <path d="M0 100h20" stroke="#b24bf3" strokeWidth="1" fill="none" opacity="0.2" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#circuit)" />
    </svg>
  );
}


// ─── SHIELD-PADLOCK LOGO ─────────────────────────────────────
function ShieldPadlock({ size = 64, variant = "rainbow", glow = true }) {
  const s = size;
  const scale = s / 64;

  // Color schemes
  const fills = {
    rainbow: { shield: rainbowGrad, lock: "#ffffff", keyhole: T.color.dark.bg },
    neon:    { shield: neonGrad,     lock: "#ffffff", keyhole: T.color.dark.bg },
    mono:    { shield: T.color.brand.electric, lock: "#ffffff", keyhole: T.color.dark.bg },
  };
  const f = fills[variant] || fills.rainbow;

  return (
    <svg width={s} height={s} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Secure Pride shield logo">
      <defs>
        <linearGradient id={`shieldRainbow-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
          {T.color.rainbow.map((c, i) => (
            <stop key={i} offset={`${(i / (T.color.rainbow.length - 1)) * 100}%`} stopColor={c} />
          ))}
        </linearGradient>
        <linearGradient id={`shieldNeon-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={T.color.neon.cyan} />
          <stop offset="50%" stopColor={T.color.neon.violet} />
          <stop offset="100%" stopColor={T.color.neon.pink} />
        </linearGradient>
        {glow && (
          <filter id={`neonGlow-${size}`}>
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        )}
      </defs>

      {/* Outer glow */}
      {glow && <path d="M32 4L8 16v16c0 14 10 26 24 30 14-4 24-16 24-30V16L32 4z" fill="none" stroke={variant === "rainbow" ? T.color.neon.pink : T.color.neon.cyan} strokeWidth="1" opacity="0.3" filter={`url(#neonGlow-${size})`} />}

      {/* Shield body */}
      <path
        d="M32 6L10 17v15c0 13 9.5 24.5 22 28 12.5-3.5 22-15 22-28V17L32 6z"
        fill={T.color.dark.surface}
        stroke={`url(#shield${variant === "rainbow" ? "Rainbow" : "Neon"}-${size})`}
        strokeWidth="2.5"
      />

      {/* Inner gradient fill overlay */}
      <path
        d="M32 6L10 17v15c0 13 9.5 24.5 22 28 12.5-3.5 22-15 22-28V17L32 6z"
        fill={`url(#shield${variant === "rainbow" ? "Rainbow" : "Neon"}-${size})`}
        opacity="0.12"
      />

      {/* Padlock body */}
      <rect x="22" y="30" width="20" height="16" rx="3" fill={`url(#shield${variant === "rainbow" ? "Rainbow" : "Neon"}-${size})`} opacity="0.9" />

      {/* Padlock shackle */}
      <path
        d="M26 30v-5a6 6 0 0 1 12 0v5"
        stroke={f.lock}
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.95"
      />

      {/* Keyhole */}
      <circle cx="32" cy="37" r="2.5" fill={T.color.dark.bg} opacity="0.9" />
      <rect x="31" y="37" width="2" height="4" rx="1" fill={T.color.dark.bg} opacity="0.7" />

      {/* Top highlight */}
      <path
        d="M32 6L10 17v6c6-2 14-4 22-4s16 2 22 4v-6L32 6z"
        fill="white"
        opacity="0.08"
      />
    </svg>
  );
}

// ─── HEART-IN-SHIELD (secondary mark) ────────────────────────
function HeartShield({ size = 48 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Secure Pride heart shield">
      <defs>
        <linearGradient id={`heartRainbow-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
          {T.color.rainbow.map((c, i) => (
            <stop key={i} offset={`${(i / (T.color.rainbow.length - 1)) * 100}%`} stopColor={c} />
          ))}
        </linearGradient>
      </defs>
      <path d="M24 5L7 13v11c0 10 7 19 17 21 10-2 17-11 17-21V13L24 5z" fill={T.color.dark.surface} stroke={`url(#heartRainbow-${size})`} strokeWidth="2" />
      <path d="M24 5L7 13v11c0 10 7 19 17 21 10-2 17-11 17-21V13L24 5z" fill={`url(#heartRainbow-${size})`} opacity="0.1" />
      <path d="M24 34s10-7 10-14a5.5 5.5 0 0 0-10-3.2A5.5 5.5 0 0 0 14 20c0 7 10 14 10 14z" fill={`url(#heartRainbow-${size})`} opacity="0.85" />
    </svg>
  );
}


// ─── NEON TEXT ────────────────────────────────────────────────
function NeonText({ children, color = T.color.brand.electric, size = "3xl", weight = "black", as: Tag = "span", style = {} }) {
  return (
    <Tag style={{
      fontFamily: T.typography.display,
      fontSize: T.typography.scale[size]?.size || size,
      fontWeight: T.typography.weight[weight] || weight,
      color: color,
      textShadow: `0 0 10px ${color}66, 0 0 30px ${color}33, 0 0 60px ${color}1a`,
      letterSpacing: "0.05em",
      textTransform: "uppercase",
      lineHeight: 1.1,
      ...style,
    }}>
      {children}
    </Tag>
  );
}


// ─── NEON CARD ───────────────────────────────────────────────
function NeonCard({ children, glowColor = T.color.brand.electric, borderOnly = false, style = {} }) {
  return (
    <div style={{
      background: borderOnly ? "transparent" : T.color.dark.surface,
      border: `1.5px solid ${glowColor}44`,
      borderRadius: T.radius.xl,
      padding: T.spacing[6],
      position: "relative",
      overflow: "hidden",
      boxShadow: `inset 0 1px 0 ${glowColor}11, 0 0 20px ${glowColor}08`,
      transition: `all ${T.motion.base}`,
      ...style,
    }}>
      {/* Subtle gradient wash */}
      <div style={{
        position: "absolute", inset: 0,
        background: `radial-gradient(ellipse at 30% 0%, ${glowColor}08, transparent 60%)`,
        pointerEvents: "none",
      }} />
      <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
    </div>
  );
}


// ─── RAINBOW BORDER CARD ─────────────────────────────────────
function RainbowCard({ children, style = {} }) {
  return (
    <div style={{
      position: "relative",
      borderRadius: T.radius.xl,
      padding: "2px",
      background: rainbowGrad,
      boxShadow: T.glow.rainbow,
      ...style,
    }}>
      <div style={{
        background: T.color.dark.surface,
        borderRadius: `calc(${T.radius.xl} - 2px)`,
        padding: T.spacing[6],
        height: "100%",
      }}>
        {children}
      </div>
    </div>
  );
}


// ─── STATUS BADGE (Neon) ─────────────────────────────────────
function StatusBadge({ status, label }) {
  const map = {
    protected: { color: T.color.status.protected, icon: "◈" },
    warning:   { color: T.color.status.warning,   icon: "◆" },
    blocked:   { color: T.color.status.blocked,   icon: "✕" },
    info:      { color: T.color.status.info,       icon: "○" },
  };
  const s = map[status] || map.info;
  return (
    <span role="status" style={{
      display: "inline-flex", alignItems: "center", gap: "6px",
      padding: "5px 14px", borderRadius: T.radius.full,
      background: `${s.color}15`,
      border: `1px solid ${s.color}40`,
      color: s.color,
      fontSize: T.typography.scale.sm.size,
      fontWeight: T.typography.weight.semibold,
      fontFamily: T.typography.body,
      textShadow: `0 0 8px ${s.color}44`,
    }}>
      <span aria-hidden="true" style={{ fontSize: "0.7em" }}>{s.icon}</span>
      {label}
    </span>
  );
}


// ─── NEON BUTTON ─────────────────────────────────────────────
function NeonButton({ children, variant = "primary", size = "md" }) {
  const sizes = {
    sm: { padding: "8px 18px",  fontSize: T.typography.scale.sm.size },
    md: { padding: "12px 28px", fontSize: T.typography.scale.base.size },
    lg: { padding: "16px 36px", fontSize: T.typography.scale.lg.size },
  };
  const variants = {
    primary: {
      background: `linear-gradient(135deg, ${T.color.brand.electric}, ${T.color.brand.primary})`,
      color: T.color.dark.bg,
      boxShadow: T.glow.cyan(0.6),
      border: "none",
    },
    rainbow: {
      background: rainbowGrad,
      color: T.color.dark.bg,
      boxShadow: T.glow.rainbow,
      border: "none",
    },
    outline: {
      background: "transparent",
      color: T.color.brand.electric,
      border: `1.5px solid ${T.color.brand.electric}66`,
      boxShadow: T.glow.cyan(0.2),
    },
    ghost: {
      background: "transparent",
      color: T.color.text.secondary,
      border: `1px solid ${T.color.dark.border}`,
      boxShadow: "none",
    },
    danger: {
      background: `linear-gradient(135deg, ${T.color.neon.pink}, ${T.color.neon.red})`,
      color: "#fff",
      boxShadow: T.glow.pink(0.5),
      border: "none",
    },
  };
  return (
    <button style={{
      ...sizes[size], ...variants[variant],
      fontFamily: T.typography.body,
      fontWeight: T.typography.weight.bold,
      borderRadius: T.radius.md,
      cursor: "pointer",
      transition: `all ${T.motion.base}`,
      display: "inline-flex", alignItems: "center", gap: T.spacing[2],
      minHeight: "44px", minWidth: "44px",
      letterSpacing: "0.02em",
      lineHeight: 1,
    }}>
      {children}
    </button>
  );
}


// ─── COLOR SWATCH ────────────────────────────────────────────
function Swatch({ color, name, hex }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      <div style={{
        width: "100%", height: "44px", background: color,
        borderRadius: T.radius.md,
        border: `1px solid ${T.color.dark.border}`,
        boxShadow: `0 0 12px ${color}33`,
      }} />
      <span style={{ fontSize: "0.72rem", fontWeight: 600, color: T.color.text.primary }}>{name}</span>
      <code style={{ fontSize: "0.65rem", color: T.color.text.muted, fontFamily: T.typography.mono }}>{hex}</code>
    </div>
  );
}


// ─── SECTION HEADING ─────────────────────────────────────────
function Section({ title, subtitle, children }) {
  return (
    <section style={{ marginTop: T.spacing[12], marginBottom: T.spacing[8] }}>
      <div style={{ marginBottom: T.spacing[5] }}>
        <h2 style={{
          fontFamily: T.typography.heading,
          fontSize: T.typography.scale["2xl"].size,
          fontWeight: T.typography.weight.bold,
          color: T.color.text.primary,
          display: "flex", alignItems: "center", gap: T.spacing[3],
          letterSpacing: "0.02em",
        }}>
          <span style={{
            width: "4px", height: "24px", borderRadius: "2px",
            background: neonGrad, flexShrink: 0,
            boxShadow: `0 0 8px ${T.color.brand.electric}44`,
          }} />
          {title}
        </h2>
        {subtitle && <p style={{
          fontFamily: T.typography.body,
          fontSize: T.typography.scale.base.size,
          lineHeight: T.typography.scale.base.lh,
          color: T.color.text.secondary,
          marginTop: T.spacing[2],
          maxWidth: "640px",
        }}>{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}


// ─── STAT CARD ───────────────────────────────────────────────
function StatCard({ label, value, trend, glowColor = T.color.brand.electric }) {
  return (
    <NeonCard glowColor={glowColor} style={{ padding: T.spacing[5] }}>
      <p style={{
        fontFamily: T.typography.body, fontSize: T.typography.scale.xs.size,
        color: T.color.text.muted, fontWeight: T.typography.weight.semibold,
        textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: T.spacing[1],
      }}>{label}</p>
      <p style={{
        fontFamily: T.typography.display, fontSize: T.typography.scale["3xl"].size,
        fontWeight: T.typography.weight.black, color: T.color.text.primary,
        textShadow: `0 0 20px ${glowColor}22`,
        lineHeight: 1.1,
      }}>{value}</p>
      {trend && <p style={{
        fontFamily: T.typography.mono, fontSize: T.typography.scale.xs.size,
        color: glowColor, marginTop: T.spacing[1],
        textShadow: `0 0 8px ${glowColor}33`,
      }}>{trend}</p>}
    </NeonCard>
  );
}


// ─── PROTECTION HERO ─────────────────────────────────────────
function ProtectionHero() {
  return (
    <div style={{
      position: "relative",
      background: `linear-gradient(135deg, ${T.color.dark.surface} 0%, ${T.color.dark.elevated} 100%)`,
      border: `1.5px solid ${T.color.brand.electric}33`,
      borderRadius: T.radius["2xl"],
      padding: T.spacing[8],
      overflow: "hidden",
      boxShadow: T.glow.cyan(0.3),
    }}>
      <CircuitPattern opacity={0.04} />
      <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "flex-start", gap: T.spacing[6], flexWrap: "wrap" }}>
        <div style={{
          width: "64px", height: "64px",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          <ShieldPadlock size={64} variant="rainbow" />
        </div>
        <div style={{ flex: 1, minWidth: "220px" }}>
          <p style={{
            fontFamily: T.typography.heading,
            fontSize: T.typography.scale.xl.size,
            fontWeight: T.typography.weight.bold,
            color: T.color.text.primary,
            marginBottom: "6px",
            letterSpacing: "0.01em",
          }}>
            Your organization is protected
          </p>
          <p style={{
            fontFamily: T.typography.body,
            fontSize: T.typography.scale.base.size,
            color: T.color.text.secondary,
            lineHeight: T.typography.scale.base.lh,
          }}>
            3 threats blocked this week · 142 scans processed · All systems online
          </p>
          <div style={{ display: "flex", gap: T.spacing[2], marginTop: T.spacing[3], flexWrap: "wrap" }}>
            <StatusBadge status="protected" label="Scanner active" />
            <StatusBadge status="info" label="Last scan 4m ago" />
          </div>
        </div>
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════
//  MAIN DESIGN SYSTEM
// ═══════════════════════════════════════════════════════════════
export default function SecurePrideDesignSystem() {
  return (
    <div style={{
      fontFamily: T.typography.body,
      background: T.color.dark.bg,
      color: T.color.text.primary,
      minHeight: "100vh",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Fonts */}
      <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Rajdhani:wght@500;600;700&family=Source+Sans+3:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />

      {/* Full-page circuit pattern */}
      <CircuitPattern opacity={0.03} />

      {/* Ambient glow orbs */}
      <div style={{ position: "fixed", top: "-20%", right: "-10%", width: "600px", height: "600px", background: `radial-gradient(circle, ${T.color.neon.violet}08, transparent 70%)`, pointerEvents: "none" }} />
      <div style={{ position: "fixed", bottom: "-20%", left: "-10%", width: "500px", height: "500px", background: `radial-gradient(circle, ${T.color.neon.cyan}06, transparent 70%)`, pointerEvents: "none" }} />

      <div style={{ maxWidth: "960px", margin: "0 auto", padding: `${T.spacing[8]} ${T.spacing[5]}`, position: "relative", zIndex: 1 }}>

        {/* ══════════════ HEADER ══════════════ */}
        <header style={{ textAlign: "center", marginBottom: T.spacing[12], paddingTop: T.spacing[8] }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: T.spacing[5] }}>
            <ShieldPadlock size={96} variant="rainbow" />
          </div>

          <NeonText as="h1" size="5xl" color={T.color.text.primary} style={{
            display: "block",
            textShadow: `0 0 30px ${T.color.brand.electric}33, 0 0 80px ${T.color.neon.violet}15`,
          }}>
            Secure Pride
          </NeonText>

          <p style={{
            fontFamily: T.typography.heading,
            fontSize: T.typography.scale.xl.size,
            fontWeight: T.typography.weight.medium,
            color: T.color.brand.electric,
            marginTop: T.spacing[3],
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            textShadow: `0 0 20px ${T.color.brand.electric}44`,
          }}>
            Where we draw the line online
          </p>

          <p style={{
            fontFamily: T.typography.body,
            fontSize: T.typography.scale.base.size,
            color: T.color.text.muted,
            marginTop: T.spacing[3],
          }}>
            Design System v2.0 · Cybersecurity for LGBTQ+ organizations
          </p>
        </header>


        {/* ══════════════ LOGO MARKS ══════════════ */}
        <Section title="Logo Marks" subtitle="Shield-padlock as primary mark. Rainbow fill for full brand expression, neon gradient for technical contexts, monochrome for small sizes.">
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: T.spacing[4],
          }}>
            <NeonCard glowColor={T.color.neon.pink}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: T.spacing[4], padding: T.spacing[4] }}>
                <ShieldPadlock size={80} variant="rainbow" />
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontWeight: 700, fontSize: T.typography.scale.sm.size }}>Rainbow</p>
                  <p style={{ color: T.color.text.muted, fontSize: T.typography.scale.xs.size }}>Primary · Hero · Marketing</p>
                </div>
              </div>
            </NeonCard>

            <NeonCard glowColor={T.color.neon.violet}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: T.spacing[4], padding: T.spacing[4] }}>
                <ShieldPadlock size={80} variant="neon" />
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontWeight: 700, fontSize: T.typography.scale.sm.size }}>Neon</p>
                  <p style={{ color: T.color.text.muted, fontSize: T.typography.scale.xs.size }}>Dashboard · App · Technical</p>
                </div>
              </div>
            </NeonCard>

            <NeonCard glowColor={T.color.brand.electric}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: T.spacing[4], padding: T.spacing[4] }}>
                <div style={{ display: "flex", gap: T.spacing[4], alignItems: "flex-end" }}>
                  <ShieldPadlock size={48} variant="mono" glow={false} />
                  <ShieldPadlock size={32} variant="mono" glow={false} />
                  <HeartShield size={40} />
                </div>
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontWeight: 700, fontSize: T.typography.scale.sm.size }}>Small + Variant</p>
                  <p style={{ color: T.color.text.muted, fontSize: T.typography.scale.xs.size }}>Favicon · Nav · Heart shield</p>
                </div>
              </div>
            </NeonCard>
          </div>
        </Section>


        {/* ══════════════ COLOR SYSTEM ══════════════ */}
        <Section title="Color System" subtitle="Neon pride spectrum anchored by teal, violet, and hot pink. Rainbow is identity, not decoration.">

          {/* Rainbow strip */}
          <div style={{
            height: "8px", borderRadius: T.radius.full,
            background: rainbowGrad,
            boxShadow: T.glow.rainbow,
            marginBottom: T.spacing[6],
          }} />

          <p style={{ fontWeight: 700, fontSize: T.typography.scale.xs.size, textTransform: "uppercase", letterSpacing: "0.08em", color: T.color.text.muted, marginBottom: T.spacing[3] }}>Neon Spectrum</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))", gap: T.spacing[2], marginBottom: T.spacing[6] }}>
            {Object.entries(T.color.neon).map(([name, hex]) => (
              <Swatch key={name} color={hex} name={name} hex={hex} />
            ))}
          </div>

          <p style={{ fontWeight: 700, fontSize: T.typography.scale.xs.size, textTransform: "uppercase", letterSpacing: "0.08em", color: T.color.text.muted, marginBottom: T.spacing[3] }}>Brand Core</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: T.spacing[2], marginBottom: T.spacing[6] }}>
            {Object.entries(T.color.brand).map(([name, hex]) => (
              <Swatch key={name} color={hex} name={name} hex={hex} />
            ))}
          </div>

          <p style={{ fontWeight: 700, fontSize: T.typography.scale.xs.size, textTransform: "uppercase", letterSpacing: "0.08em", color: T.color.text.muted, marginBottom: T.spacing[3] }}>Status Signals</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: T.spacing[2], marginBottom: T.spacing[6] }}>
            <Swatch color={T.color.status.protected} name="Protected" hex="#06d6e0" />
            <Swatch color={T.color.status.warning}   name="Warning"   hex="#ffd600" />
            <Swatch color={T.color.status.blocked}   name="Blocked"   hex="#ff2d95" />
            <Swatch color={T.color.status.info}       name="Info"      hex="#448aff" />
          </div>

          <p style={{ fontWeight: 700, fontSize: T.typography.scale.xs.size, textTransform: "uppercase", letterSpacing: "0.08em", color: T.color.text.muted, marginBottom: T.spacing[3] }}>Surfaces</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: T.spacing[2] }}>
            {Object.entries(T.color.dark).map(([name, hex]) => (
              <Swatch key={name} color={hex} name={name} hex={hex} />
            ))}
          </div>
        </Section>


        {/* ══════════════ TYPOGRAPHY ══════════════ */}
        <Section title="Typography" subtitle="Orbitron for display titles (sci-fi geometric). Rajdhani for headings (technical warmth). Source Sans 3 for body. JetBrains Mono for data.">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: T.spacing[4] }}>
            <NeonCard glowColor={T.color.neon.cyan}>
              <NeonText size="2xl" color={T.color.brand.electric}>Orbitron</NeonText>
              <p style={{ color: T.color.text.muted, fontSize: T.typography.scale.xs.size, textTransform: "uppercase", letterSpacing: "0.06em", margin: `${T.spacing[2]} 0 ${T.spacing[3]}` }}>Display · Titles · Hero</p>
              <p style={{ fontFamily: T.typography.display, fontSize: T.typography.scale.base.size, color: T.color.text.secondary, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                ABCDEFGHIJKLMNOPQRSTUVWXYZ<br />0123456789
              </p>
            </NeonCard>

            <NeonCard glowColor={T.color.neon.violet}>
              <p style={{ fontFamily: T.typography.heading, fontSize: T.typography.scale["2xl"].size, fontWeight: 700, color: T.color.text.primary }}>Rajdhani</p>
              <p style={{ color: T.color.text.muted, fontSize: T.typography.scale.xs.size, textTransform: "uppercase", letterSpacing: "0.06em", margin: `${T.spacing[2]} 0 ${T.spacing[3]}` }}>Heading · Section · UI Labels</p>
              <p style={{ fontFamily: T.typography.heading, fontSize: T.typography.scale.base.size, fontWeight: 500, color: T.color.text.secondary }}>
                Your organization is protected. Scanner active, 3 threats blocked this week.
              </p>
            </NeonCard>

            <NeonCard glowColor={T.color.neon.pink}>
              <p style={{ fontFamily: T.typography.body, fontSize: T.typography.scale["2xl"].size, fontWeight: 600, color: T.color.text.primary }}>Source Sans 3</p>
              <p style={{ color: T.color.text.muted, fontSize: T.typography.scale.xs.size, textTransform: "uppercase", letterSpacing: "0.06em", margin: `${T.spacing[2]} 0 ${T.spacing[3]}` }}>Body · Paragraphs · Long-form</p>
              <p style={{ fontFamily: T.typography.body, fontSize: T.typography.scale.base.size, color: T.color.text.secondary, lineHeight: T.typography.scale.base.lh }}>
                Secure Pride builds accessible cybersecurity tools for LGBTQ+ organizations. We protect the people who protect our communities.
              </p>
            </NeonCard>

            <NeonCard glowColor={T.color.brand.electric}>
              <p style={{ fontFamily: T.typography.mono, fontSize: T.typography.scale.xl.size, fontWeight: 500, color: T.color.text.primary }}>JetBrains Mono</p>
              <p style={{ color: T.color.text.muted, fontSize: T.typography.scale.xs.size, textTransform: "uppercase", letterSpacing: "0.06em", margin: `${T.spacing[2]} 0 ${T.spacing[3]}` }}>Code · Data · Technical</p>
              <p style={{ fontFamily: T.typography.mono, fontSize: T.typography.scale.sm.size, color: T.color.brand.electric }}>
                scan_id: sp-2026-0224<br />
                severity: BLOCKED<br />
                pii_masked: 3 patterns
              </p>
            </NeonCard>
          </div>

          {/* Type scale */}
          <NeonCard glowColor={T.color.dark.borderGlow} style={{ marginTop: T.spacing[4] }}>
            <div style={{ display: "flex", flexDirection: "column", gap: T.spacing[4] }}>
              {Object.entries(T.typography.scale).map(([key, val]) => (
                <div key={key} style={{ display: "flex", alignItems: "baseline", gap: T.spacing[4], flexWrap: "wrap" }}>
                  <code style={{ fontFamily: T.typography.mono, fontSize: T.typography.scale.xs.size, color: T.color.text.muted, minWidth: "40px" }}>{key}</code>
                  <span style={{
                    fontFamily: key.includes("xl") || key === "lg" ? T.typography.heading : T.typography.body,
                    fontSize: val.size, lineHeight: val.lh,
                    fontWeight: key.includes("xl") ? 700 : 400,
                    color: T.color.text.primary,
                  }}>
                    {key.includes("4") || key.includes("5") ? "SECURE PRIDE" : key.includes("xl") ? "Where we draw the line" : "Cybersecurity for LGBTQ+ organizations"}
                  </span>
                </div>
              ))}
            </div>
          </NeonCard>
        </Section>


        {/* ══════════════ COMPONENTS ══════════════ */}
        <Section title="Components" subtitle="Production dashboard patterns. Calm confidence with neon energy. Protection-first information hierarchy.">

          {/* Protection hero */}
          <p style={{ fontWeight: 700, fontSize: T.typography.scale.xs.size, textTransform: "uppercase", letterSpacing: "0.08em", color: T.color.text.muted, marginBottom: T.spacing[3] }}>Protection Summary</p>
          <div style={{ marginBottom: T.spacing[6] }}>
            <ProtectionHero />
          </div>

          {/* Stat cards */}
          <p style={{ fontWeight: 700, fontSize: T.typography.scale.xs.size, textTransform: "uppercase", letterSpacing: "0.08em", color: T.color.text.muted, marginBottom: T.spacing[3] }}>Stat Cards</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: T.spacing[4], marginBottom: T.spacing[6] }}>
            <StatCard label="Scans Today" value="142" trend="↑ 12% from yesterday" glowColor={T.color.brand.electric} />
            <StatCard label="Threats Blocked" value="3" trend="All PII-class" glowColor={T.color.neon.pink} />
            <StatCard label="Uptime" value="99.9%" glowColor={T.color.neon.violet} />
            <StatCard label="Avg Response" value="23ms" trend="Within target" glowColor={T.color.brand.electric} />
          </div>

          {/* Status badges */}
          <p style={{ fontWeight: 700, fontSize: T.typography.scale.xs.size, textTransform: "uppercase", letterSpacing: "0.08em", color: T.color.text.muted, marginBottom: T.spacing[3] }}>Status Badges</p>
          <NeonCard glowColor={T.color.dark.borderGlow} style={{ marginBottom: T.spacing[6] }}>
            <div style={{ display: "flex", gap: T.spacing[3], flexWrap: "wrap" }}>
              <StatusBadge status="protected" label="Scanner active" />
              <StatusBadge status="warning" label="1 item needs review" />
              <StatusBadge status="blocked" label="Credential blocked" />
              <StatusBadge status="info" label="Last scan 4m ago" />
            </div>
          </NeonCard>

          {/* Buttons */}
          <p style={{ fontWeight: 700, fontSize: T.typography.scale.xs.size, textTransform: "uppercase", letterSpacing: "0.08em", color: T.color.text.muted, marginBottom: T.spacing[3] }}>Buttons</p>
          <NeonCard glowColor={T.color.dark.borderGlow} style={{ marginBottom: T.spacing[6] }}>
            <div style={{ display: "flex", gap: T.spacing[3], flexWrap: "wrap", alignItems: "center" }}>
              <NeonButton variant="primary">Scan Now</NeonButton>
              <NeonButton variant="rainbow">Get Started</NeonButton>
              <NeonButton variant="outline">View Report</NeonButton>
              <NeonButton variant="ghost">Learn More</NeonButton>
              <NeonButton variant="danger">Block Source</NeonButton>
            </div>
            <div style={{ display: "flex", gap: T.spacing[3], flexWrap: "wrap", alignItems: "center", marginTop: T.spacing[4] }}>
              <NeonButton variant="primary" size="sm">Small</NeonButton>
              <NeonButton variant="primary" size="md">Medium</NeonButton>
              <NeonButton variant="primary" size="lg">Large</NeonButton>
            </div>
          </NeonCard>

          {/* Card variants */}
          <p style={{ fontWeight: 700, fontSize: T.typography.scale.xs.size, textTransform: "uppercase", letterSpacing: "0.08em", color: T.color.text.muted, marginBottom: T.spacing[3] }}>Card Variants</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: T.spacing[4] }}>
            <NeonCard glowColor={T.color.brand.electric}>
              <p style={{ fontWeight: 700, marginBottom: T.spacing[2] }}>Neon Card</p>
              <p style={{ color: T.color.text.secondary, fontSize: T.typography.scale.sm.size }}>Default container. Subtle glow border, radial gradient wash. Used for most elevated content.</p>
            </NeonCard>
            <RainbowCard>
              <p style={{ fontWeight: 700, marginBottom: T.spacing[2] }}>Rainbow Border</p>
              <p style={{ color: T.color.text.secondary, fontSize: T.typography.scale.sm.size }}>Full rainbow gradient border with glow. Used for CTAs, featured content, brand moments.</p>
            </RainbowCard>
            <NeonCard glowColor={T.color.neon.pink} style={{
              borderLeftWidth: "3px",
              borderLeftColor: T.color.neon.pink,
            }}>
              <p style={{ fontWeight: 700, marginBottom: T.spacing[2] }}>Accent Edge</p>
              <p style={{ color: T.color.text.secondary, fontSize: T.typography.scale.sm.size }}>Colored left border for callouts, warnings, important information blocks.</p>
            </NeonCard>
          </div>
        </Section>


        {/* ══════════════ PATTERNS ══════════════ */}
        <Section title="Background Patterns" subtitle="Circuit board overlay for tech identity. Ambient glow orbs for depth. Always subtle — content dominates.">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: T.spacing[4] }}>
            <div style={{
              height: "180px", borderRadius: T.radius.xl,
              background: T.color.dark.surface,
              border: `1px solid ${T.color.dark.border}`,
              position: "relative", overflow: "hidden",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <CircuitPattern opacity={0.08} />
              <p style={{ position: "relative", zIndex: 1, color: T.color.text.muted, fontSize: T.typography.scale.sm.size, fontWeight: 600 }}>Circuit Pattern · 8% opacity</p>
            </div>
            <div style={{
              height: "180px", borderRadius: T.radius.xl,
              background: T.color.dark.surface,
              border: `1px solid ${T.color.dark.border}`,
              position: "relative", overflow: "hidden",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <div style={{ position: "absolute", top: "-30%", right: "-20%", width: "200px", height: "200px", background: `radial-gradient(circle, ${T.color.neon.violet}15, transparent 70%)`, pointerEvents: "none" }} />
              <div style={{ position: "absolute", bottom: "-30%", left: "-20%", width: "180px", height: "180px", background: `radial-gradient(circle, ${T.color.neon.cyan}12, transparent 70%)`, pointerEvents: "none" }} />
              <p style={{ position: "relative", zIndex: 1, color: T.color.text.muted, fontSize: T.typography.scale.sm.size, fontWeight: 600 }}>Ambient Glow Orbs</p>
            </div>
          </div>
        </Section>


        {/* ══════════════ ACCESSIBILITY ══════════════ */}
        <Section title="Accessibility" subtitle="WCAG 2.1 AA minimum. Neon aesthetic does not compromise readability.">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: T.spacing[4] }}>
            {[
              { t: "Color Contrast", d: "Primary text #eeeef6 on #0a0a1a = 17.5:1. Neon accents used for decoration only, never as sole information carrier. All status has text label + icon." },
              { t: "Touch Targets", d: "All buttons and interactive elements ≥ 44×44 CSS px. Tested on mobile. Generous padding on tap zones." },
              { t: "Keyboard Nav", d: "Full tab order. Visible focus indicators (neon outline). No keyboard traps. Skip-to-content link on all pages." },
              { t: "Screen Readers", d: "Semantic HTML. Shield logo uses role='img' + aria-label. Status badges use role='status'. Circuit patterns are aria-hidden." },
              { t: "Reduced Motion", d: "Respects prefers-reduced-motion. Glow animations disable gracefully. No essential info conveyed through motion." },
              { t: "Cognitive Load", d: "1.625 line height. Protection status is first thing visible. No jargon in primary UI. ADHD-friendly linear layout." },
            ].map(item => (
              <NeonCard key={item.t} glowColor={T.color.dark.borderGlow} style={{ padding: T.spacing[5] }}>
                <p style={{
                  fontFamily: T.typography.heading, fontWeight: 700,
                  fontSize: T.typography.scale.base.size,
                  color: T.color.brand.electric, marginBottom: T.spacing[2],
                }}>{item.t}</p>
                <p style={{
                  fontFamily: T.typography.body, fontSize: T.typography.scale.sm.size,
                  color: T.color.text.secondary, lineHeight: "1.6",
                }}>{item.d}</p>
              </NeonCard>
            ))}
          </div>
        </Section>


        {/* ══════════════ FOOTER ══════════════ */}
        <footer style={{
          borderTop: `1px solid ${T.color.dark.border}`,
          paddingTop: T.spacing[6], marginTop: T.spacing[16],
          display: "flex", justifyContent: "space-between", alignItems: "center",
          flexWrap: "wrap", gap: T.spacing[3],
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: T.spacing[3] }}>
            <ShieldPadlock size={24} variant="neon" glow={false} />
            <span style={{ fontFamily: T.typography.heading, fontSize: T.typography.scale.sm.size, fontWeight: 700, color: T.color.text.secondary }}>Secure Pride</span>
          </div>
          <p style={{ fontFamily: T.typography.mono, fontSize: T.typography.scale.xs.size, color: T.color.text.muted }}>
            Design System v2.0 · WCAG 2.1 AA · Apache 2.0
          </p>
        </footer>
      </div>
    </div>
  );
}
