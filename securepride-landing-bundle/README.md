# Secure Pride Landing Bundle (Astro)

This bundle adds three Astro pages and shared components:

- `/audit-toolkit` landing page
- `/get-started` skeleton
- `/contact` skeleton
- `SiteCTA` shared CTA component

## Integration
Copy the `site/` subtree into your Secure Pride Astro project (merge with existing `site/src/...`).

## Next refinement tasks (for Claude Code / Codex)
- Replace `<pre>` rendering with safe Markdown-to-HTML rendering (Astro MD/MDX or sanitized parser).
- Ensure single H1 (Hero), semantic headings, and accessible focus states.
- Add OG image asset at `public/og/securepride-audit-toolkit.png`.
- Wire `/contact` to your real form component or endpoint.

## Security notes
Avoid client-side HTML injection; if rendering Markdown, sanitize or compile at build time.
