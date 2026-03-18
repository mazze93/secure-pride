# Secure Pride — Identity Usage Guidelines

> Version 1.0 | Vector System

## Core Principle

Abrasion is structural, not decorative. The system encodes philosophy:

| Layer | Meaning |
|---|---|
| Heart | Human core |
| Shield | Protection system |
| Abrasion | Real-world stress |
| Prism | Signal revealed under pressure |

This is not branding. Do not treat it as decoration.

---

## File Selection Guide

| Use case | File |
|---|---|
| Primary brand, print, large digital | `01_primary/brass_master.svg` |
| App icons, profile photos ≥128px | `02_scaled/medium_256.svg` |
| App icons, avatars 64px | `02_scaled/small_64.svg` |
| Favicons, 32px icons | `02_scaled/micro_32.svg` or `04_social/favicon_32.svg` |
| LinkedIn, social profile (1024px) | `04_social/linkedin_1024.svg` |
| Dark backgrounds, single color | `03_mono/mono_dark.svg` |
| Light backgrounds, single color | `03_mono/mono_light.svg` |

---

## Color System

**Base field:** `#0B0F14`

**Brass gradient:** `#D6B97A → #B08D57 → #7A623A` (145°)

**Prismatic capture:** `#6FE7FF → #8A6CFF → #C86BFF` (opacity 8–15% only)

**Abrasion strokes:** `#E6C98A` at 4–10% opacity only

**Mono dark:** `#FFFFFF`

**Mono light:** `#0B0F14`

---

## Minimum Size

| Variant | Minimum |
|---|---|
| Full (brass + abrasion + prism) | 512px |
| Medium (brass + reduced abrasion) | 128px |
| Small (brass only) | 32px |
| Mono | Any size |

---

## Clear Space

Maintain a minimum clear space of 12% of the logo width on all sides. Do not crowd the mark.

---

## Background Rules

- **Preferred:** `#0B0F14` (base field) or near-black
- **Acceptable:** Any dark surface where brass reads clearly
- **Mono dark (`#FFFFFF`):** Use on dark surfaces only
- **Mono light (`#0B0F14`):** Use on light surfaces only
- **Avoid:** Busy photographic backgrounds, mid-tone greys that flatten contrast

---

## Accessibility

- WCAG AA contrast required in all display contexts
- SVG files include `role="img"` and `aria-label` — preserve these when embedding
- Do not remove or override `aria-label` text

---

## What This Is Not

This identity is not a mascot, not a trend mark, not decoration. Every element
is load-bearing. Refer to `do_not_use.md` before modifying anything.
