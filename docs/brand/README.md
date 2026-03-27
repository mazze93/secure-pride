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

- **Typography**: Orbitron (display), Rajdhani (headings), Source Sans 3 (body), JetBrains Mono (code)
- **Core palette**: Teal `#0a7e74`, Purple `#3a2a5e`, Cyan `#06d6e0`, Pink `#ff2d95`
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
