# Brand Assets

Secure Pride brand voice, design system, and documentation templates.

## Contents

| File | Description | Format |
|------|-------------|--------|
| `brand-voice-guide-v1.pdf` | Brand voice principles, website copy, terminology | PDF (print-ready) |
| `brand-voice-guide-v1.docx` | Same content, editable | Word |
| `design-system-v2.jsx` | Living design system artifact — colors, typography, components | React |

## Brand Voice (Summary)

Five principles govern all Secure Pride communications:

1. **Calm confidence** — competence without alarm
2. **Culturally competent** — we speak as community members, not outsiders
3. **Approachable professional** — expertise without jargon
4. **Protection-first framing** — lead with what we protect, not what we prevent
5. **Honest about limitations** — we say what we do and what we don't

## Design System

- **Typography**: Orbitron (display), Rajdhani (headings), Inter (body), JetBrains Mono (code)
- **Core palette (Kintsugi, live as of PR #44)**: Teal `#0a7e74`, Deep Purple `#2a1f54`, Cyan `#0fb5c9`, Hot Pink `#c81e6c`, plus a brass/gem accent set — see `secure-pride/src/styles/tokens.css` (mirrors `secure-pride-design/colors_and_type.css`, the tracked source of truth) for the full token list. This replaces the earlier neon-cyberpunk palette (Cyan `#06d6e0`, Pink `#ff2d95`, Purple `#3a2a5e`), retired 2026-08-14.
- **Primary mark**: Shield-padlock (point-down orientation)
- **Screen surface**: Dark-first (`#0a0a1a` background)
- **Print surface**: White backgrounds with teal/purple accents only

## Document Engine

The document engine (`docs/securepride-document-engine.jsx`) generates branded PDF output from structured content. Four templates: Brand Guide, Report/Proposal, Technical Documentation, One-Pager.

Supports Markdown with Secure Pride extensions:

- `[Label]: Copy text` → branded copy blocks
- `✗ Don't | ✓ Do` → comparison cards
- `> Quote` → teal-bordered blockquotes

## Licensing

- Code: Apache 2.0
- Documentation: CC BY 4.0

## Public-site alignment (October 2026)

The homepage uses the live catalog’s brass/indigo composition, Rajdhani
headings, and Inter prose. Four brass roles now match the live CSS source.
The dated source snapshot and SHA-256 digest live in `upstream/`.
`npm run check:tokens` verifies shared values without network access.
Upstream changes require a reviewed snapshot update; this check does not
claim to detect changes on the remote site automatically.

The upstream stylesheet retains Orbitron and cyan action aliases, while
the catalog's public composition foregrounds Rajdhani and brass. The
homepage follows the catalog; other surfaces retain their semantic roles.
Fonts remain self-hosted in the application.
