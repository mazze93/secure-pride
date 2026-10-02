# Decision: Ground the public site in people and shipped capability

**Date**: 2026-10-02
**Category**: UX / Accessibility / Privacy
**Decision ID**: DECISION-006

## Context
The founder approved the assessment and implementation in this session. The homepage promised organizational protection, provider integrations, local processing, and a paid pilot beyond the shipped surface. The live scanner is the TypeScript pattern engine; scanner-rs is not deployed. Its UI hid the API's masked draft and assigned hard-coded assurance percentages.

## Options considered
- Patch individual marketing claims: less work, but retains the product funnel and simulated assurance.
- Replace the homepage with a bounded tools entry point: chosen; connects program leaders, consequences, founder accountability, and available capability.

## Decision
Remove the pricing/pilot funnel and simulated dashboard. Describe manual scanning, Cloudflare processing, imperfect detection, static-only Docker distribution, and development-stage work explicitly. Display redacted drafts for review without auto-forwarding to AI providers. Editing input invalidates prior results; clearing or unmounting cancels pending requests. No browser persistence is added.

Use the live design catalog's brass/indigo composition, Rajdhani headings, Inter prose, and restrained seams. Align four brass values with its CSS source. Preserve cyan's existing semantic role elsewhere. Vendor a dated token snapshot with a SHA-256 reference and validate common token values offline; this is a reproducible bridge, not an automatic upstream updater.

## Privacy boundary
The application scanner logs metadata, including classifications and input length, but not the submitted text. Describe this accurately; do not invent Cloudflare log retention or residency. Warn against submitting real client records, credentials, health information, or identity details. Test only synthetic inputs. Retire the unused contact API: it could forward to an external service or log message excerpts and acknowledge undelivered messages. The contact section uses direct email links. Email has its own provider processing and retention.

## Trade-offs and accessibility
A pattern scan cannot establish safety. Drop the percentage gauge and make policy violations visible even when no pattern details are returned. Use visible labels, bounded input, descriptive errors, keyboard controls, 44px buttons, wrapping navigation, and results as text. No decorative motion is needed for the new page. Do not imply incident-response capacity or a research program that has not been defined.

## Validation and rollback
Run `npm run check`, `npm test`, and browser checks at mobile and desktop widths. Cover blocked policy results, no-match wording, redacted drafts, stale results, failed requests, and clipboard denial. Revert the site commit to roll back; dependency PR #66 remains independent.

## Remaining account-side verification
Cloudflare request/log retention, log access, residency, and deployed rate limits require account-side verification before stronger privacy claims. Preview deployment access may require Cloudflare Access. No retention duration, compliance certification, support SLA, or study commitment is asserted.

## Implementation validation

- `npm run check`: token guards, Astro build (six routes), and TypeScript passed.
- `npm test`: 73 tests passed across six files.
- Headless browser: desktop/mobile layout, masked draft, original preservation, clipboard denial, no-match limits, policy-only block, stale-response cancellation after Clear, failure state, and no page errors passed with mocked API responses. These are UI checks, not a deployed API test.
- Cloudflare account settings and authenticated preview endpoints remain unverified.
