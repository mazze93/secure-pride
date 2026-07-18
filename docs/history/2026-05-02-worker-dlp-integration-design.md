# Design: Cloudflare Pages Function DLP Integration

**Date:** 2026-05-02
**Status:** Approved
**Scope:** Wire the Secure Pride DLP scanner to the securepride.org audit dashboard via a Cloudflare Pages Function

---

## Summary

The audit dashboard on securepride.org currently shows mock credential findings. This integration replaces that mock with a live DLP scanner: users paste text into a textarea, click "Run Scan", and get real results showing detected PII, prompt injections, and the enforced policy action. The scanner backend is a Cloudflare Pages Function (TypeScript) that ports the logic from `secure-pride-dlp/` — pure regex, no ML dependencies.

The framing is "Check your AI safety before you send" — a tool LGBTQ+ org staff can use today to catch SOGI data or credentials before they accidentally reach an external AI service.

---

## Architecture

```
secure-pride/               (Pages repo, wrangler.toml already present)
  functions/
    api/
      scan.ts               POST /api/scan  — main DLP endpoint
      health.ts             GET  /api/health — liveness probe
    _lib/
      dlp/
        types.ts            Enums + shared interfaces
        patterns.ts         Injection detection (ported from Python)
        pii.ts              PII detection + masking
        engine.ts           Scan pipeline orchestration
  assets/
    main.js                 Updated: real fetch call + result rendering
  index.html                Updated: textarea input added to dashboard
```

`functions/_lib/` is private (Cloudflare excludes `_`-prefixed paths from routing). No new `wrangler.toml` config needed — Pages auto-routes `functions/api/*.ts` to `/api/*`.

**No npm dependencies.** The function runs on Cloudflare's V8 runtime using TypeScript compiled by Pages at deploy time.

The Python source in `secure-pride-dlp/` stays intact as the canonical reference and test suite. The TypeScript is a direct translation — same regex patterns, same policy logic, same masking functions.

---

## Data Flow

```
User pastes text → clicks "Run Scan"
  → JS disables button, sets aria-busy="true"

POST /api/scan
  Body: { text: string, actor_id: "anonymous" }

Pages Function (scan.ts):
  1. Validate: text present, ≤ 50,000 chars, no null bytes → 400 if invalid
  2. detectInjections(text)  → InjectionMatch[]
  3. detectPII(text)         → PIIMatch[]
  4. evaluatePolicies():
       CRITICAL/HIGH injection  → BLOCK
       CREDENTIAL found         → BLOCK
       PCI/PHI found            → BLOCK
       PII found                → MASK_AND_ALLOW
       Clean                    → LOG_ONLY
  5. Return ScanResponse JSON

Response → main.js renders findings into audit feed
  + confidence gauge updates from real scores
```

The function **never logs input text** — only scan metadata (trace ID, blocked boolean, classification types found). Matches the Python audit logger's no-PII-in-logs rule and the project's no-telemetry requirement.

---

## ScanResponse Shape

```typescript
{
  trace_id: string;         // UUID
  blocked: boolean;
  action: "log_only" | "mask_and_allow" | "block";
  masked_text?: string;     // present when action === "mask_and_allow"
  injection_count: number;
  injections: Array<{
    pattern_name: string;
    severity: "low" | "medium" | "high" | "critical";
    description: string;
  }>;
  pii_count: number;
  pii_matches: Array<{
    pii_type: string;
    classification: string;
    masked: string;
  }>;
  policy_violations: string[];
}
```

---

## Frontend UX Changes

### New input area (inserted above audit feed)

```
┌─────────────────────────────────────────────────┐
│ Paste text to scan — email draft, AI prompt,    │
│ message containing member info…                 │
│                                                 │
│  [textarea, 6 rows, resizable]                  │
│                                                 │
│  [Run Scan ▶]          [Clear]                  │
└─────────────────────────────────────────────────┘
```

### Result rendering

- Finding cards reuse existing `buildFindingCard()` DOM structure and CSS classes — no new styles
- Injection cards: severity badge (CRITICAL/HIGH = `fail` pill, MEDIUM = `warn` pill), description text
- PII cards: type label + masked value displayed (shows users what was caught)
- Clean result: single green `pass` card — "No threats detected"
- Blocked: full-width red banner above feed

### Confidence gauge scoring (real)

| Result | Gauge target |
|--------|-------------|
| Clean | ~85% |
| PII masked (allowed) | ~55% |
| Blocked | ~20% |

### Accessibility (non-negotiable per CLAUDE.md)

- `<textarea>` has `aria-label` and `aria-describedby` pointing to helper text
- "Run Scan" button sets `aria-busy="true"` during fetch
- Audit feed container gets `role="status"` so screen readers announce updates
- All contrast ratios follow existing tokens (no new CSS)

---

## Error Handling

| Condition | User-facing message |
|---|---|
| Empty textarea | Button disabled until text entered |
| Network failure | Amber card: "Scanner unavailable — check your connection" |
| 429 rate limit | Amber card: "Too many requests — please wait a moment" |
| 400 bad input | Amber card with specific validation message from API |
| 500 server error | Amber card: "Scanner error — please try again" |

Errors render as finding cards using the existing `warn` CSS class — no new error UI needed.

---

## Security

- Input validated: max 50,000 chars, no null bytes — matches Python server exactly
- Response never echoes raw input — only masked values and metadata
- CORS: same-origin by default for Pages Functions; no `Access-Control-Allow-Origin` header set
- No API key or auth required — public demo tool; Cloudflare edge DDoS protection is the v1 rate-limit layer
- No wildcard CORS, strict CSP maintained via existing `_headers` file

---

## Testing

### Unit tests — `functions/_lib/dlp/*.test.ts` (Vitest)

- `patterns.test.ts`: each injection pattern fires on known strings; clean strings produce no matches; severity sort order correct
- `pii.test.ts`: each PII type detected and masked; right-to-left replacement preserves positions
- `engine.test.ts`: BLOCK on CRITICAL injection; MASK_AND_ALLOW on PII-only; LOG_ONLY on clean; oversized input blocked

### Integration smoke test (wrangler dev)

- Injection payload → `blocked: true`
- PII-only payload → `blocked: false`, `masked_text` present
- Clean payload → `blocked: false`, zero matches

### Manual acceptance criteria

- [ ] Paste email address → masked in result, gauge ~55%
- [ ] Paste "Ignore all previous instructions" → blocked banner, gauge ~20%
- [ ] Paste clean text → green card, gauge ~85%
- [ ] Empty textarea → button disabled, no request
- [ ] Screen reader: result feed announced on update

---

## Out of Scope (v1)

- KV-backed per-IP rate limiting (addable later without interface changes)
- Audit log persistence (Worker logs nothing; acceptable for public scanner)
- PHI-specific regex patterns (gap exists in Python source too; carry forward)
- The credential/cert audit mock — stays as-is, labelled "full audit coming soon"
