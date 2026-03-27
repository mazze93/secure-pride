# DECISION-002: Brand Identity & Design Direction

**Status**: Approved  
**Date**: 2026-03-11  
**Authority**: Tier 2 (Document first)  
**Decision maker**: @mazze93  

## Context

Secure Pride needed a cohesive brand identity that communicates both security competence and community authenticity. Early iterations were too restrained and corporate. A moodboard review redirected the aesthetic toward neon cyberpunk with bold pride identity.

## Decision

### Visual Identity

- **Primary mark**: Shield-padlock icon (padlock nested inside shield, point-down heraldic orientation)
- **Secondary mark**: Heart-in-shield variant for community/social contexts
- **Rainbow gradient**: Identity-level, not decorative — applied to shield borders, padlock fills, accent elements
- **Design language**: Neon cyberpunk with liquid glass influences — electric outlines, light bloom, circuit board textures
- **Screen surface**: Dark-first (`#0a0a1a` background with neon accents)
- **Print surface**: White backgrounds with teal/purple accents only (no dark covers — ink cost matters for nonprofits)

### Color System

| Token | Hex | Usage |
|-------|-----|-------|
| Teal (primary) | `#0a7e74` | Brand anchor, CTA, protection status |
| Purple (accent) | `#3a2a5e` | Headings, depth, secondary brand |
| Cyan (electric) | `#06d6e0` | Neon highlights, active states |
| Pink (hot) | `#ff2d95` | Neon accent, blocked/threat status |
| Violet | `#b24bf3` | Gradient stops, tertiary accent |

### Typography

| Role | Family | Usage |
|------|--------|-------|
| Display | Orbitron | Hero titles, splash screens |
| Heading | Rajdhani | Section headings, UI labels |
| Body | Source Sans 3 | Paragraphs, long-form, UI text |
| Mono | JetBrains Mono | Code, data, technical values |

### Brand Voice

Five principles (see `docs/brand/brand-voice-guide-v1.pdf` for full guide):

1. **Calm confidence** — competence without alarm
2. **Culturally competent** — speak as community members, not outsiders
3. **Approachable professional** — expertise without jargon
4. **Protection-first framing** — lead with what we protect
5. **Honest about limitations** — say what we do and what we don't

### Key Vocabulary Decisions

| Prefer | Over | Reason |
|--------|------|--------|
| Protect | Secure / defend | Warmer, centers people |
| Community | Users / customers | Human, relational |
| Attention | Alert / warning | Calmer, invites action |
| Blocked | Prevented / mitigated | Concrete |
| Scanner | Engine / pipeline | Accessible |

## Consequences

- All UI, documentation, and marketing materials follow this system
- Design system artifact (`docs/brand/design-system-v2.jsx`) is the source of truth for tokens
- Document engine (`docs/securepride-document-engine.jsx`) enforces branded output
- Dashboard v2 rebuild will use these tokens (pending)
- Landing page build will use this copy and brand system (pending)

## Supersedes

- Earlier heart-padlock concept (replaced by shield-padlock as primary mark; heart-in-shield retained as secondary)
- v1 design system (restrained corporate aesthetic replaced by neon cyberpunk direction)
