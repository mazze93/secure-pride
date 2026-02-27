# Secure Pride — Claude Context

> Full context: `~/.claude/projects/-Users-daedalus/memory/secure-pride.md`
> Canonical AI instructions: `docs/COPILOT-INSTRUCTIONS.md`

## Authority Tiers
- **Autonomous**: Architecture, refactoring, tests, docs, library recommendations, security per standards
- **Document first**: Schema changes, auth decisions, UX/a11y, third-party integrations, infra
- **Escalate (wait)**: SOGI data handling, external credentials, third-party data sharing, policy/legal

## Non-Negotiable Security Rules
- No telemetry, no tracking, no exceptions
- TLS 1.3+ all network comms; HTTPS + HSTS
- AES-256-GCM at rest for SOGI data; Web Crypto API preferred client-side
- No wildcard CORS; strict CSP headers
- No real-name enforcement; pseudonymous accounts supported

## SOGI Data
- Collect only when necessary + documented; must be optional for core features
- Never log; RBAC + quarterly audit; absolute ban on third-party sharing

## Accessibility (Non-Negotiable)
- WCAG AA (4.5:1 contrast), ADHD-accessible, dark mode + low-stimulation palette
- Sans-serif fonts, line-height 1.5–2.0, 2 clicks max from main page
- Short sentences (8–15 words), chunked text, descriptive headings

## Project State
- **Hosting**: Cloudflare Pages + DNS — domain: securepride.org
- **Repo**: `mazze93/Secure-Pride` / local: `/Users/daedalus/Code/secure-pride`
- **Outstanding**: `_headers`, `_redirects` files not yet created; Cloudflare Pages not configured
- **Hardware**: MacBook Pro M3 8GB RAM — avoid memory-heavy tooling
