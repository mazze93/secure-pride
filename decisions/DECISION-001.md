## Decision: Restore audit logging to the AI Safety Scanner (DLP engine)

**Date**: 2026-07-18
**Category**: Security | Architecture
**Decision ID**: DECISION-001

### Context

The AI Safety Scanner (`functions/_lib/dlp/`) is a TypeScript port of an earlier
Python DLP prototype. The port (commit `395565b`, PR #21, live on `main` since
2026-06-06) faithfully carried over the injection-detection patterns, PII/credential
patterns, and policy engine — verified pattern-for-pattern against the Python
original. It did **not** carry over audit logging: the Python engine called an
`AuditLogger.log_scan(...)` on every scan (hashed actor ID, structured JSON,
explicitly built "for ingestion into any SIEM"); the TS `scan()` function accepts
an `actorId` parameter and silently discards it. `wrangler.toml` has no KV/D1/
Analytics Engine binding standing in for it — there is currently no accountability
trail for this tool at all, despite it being live and public.

For a DLP/safety tool, "who scanned what, when, and what happened" is not a
nice-to-have — it's the mechanism that makes the block/mask decisions
accountable and auditable after the fact. This gap was found via a manual
pattern-by-pattern comparison against the original, not by an automated test,
because the DLP test suite (`functions/_lib/dlp/*.test.ts`) turned out to be
excluded from `vitest.config.ts`'s `include` glob and has never actually run
(fixed alongside this change — see commit history on this branch).

### Options Considered

**Option A: Cloudflare Analytics Engine binding**
- Pros: Purpose-built for high-volume structured event logging; queryable.
- Cons: New infrastructure to provision (Analytics Engine dataset), new
  `wrangler.toml` binding, new deploy-time dependency — out of proportion for
  a first pass, and the project currently has zero bindings by design.
- Estimated effort: ~1 day incl. provisioning and CI wiring.

**Option B: KV or D1-backed log store**
- Pros: Durable, queryable from a future admin view.
- Cons: Same new-infrastructure cost as Option A, plus write-amplification
  concerns on a per-request KV write; overkill for "log a JSON line."
- Estimated effort: ~1 day.

**Option C: Structured `console.log` JSON, matching the Python original's
"JSON lines for SIEM ingestion" design intent**
- Pros: Zero new infrastructure or bindings. Cloudflare Workers/Pages
  Functions logs are captured by the platform (Workers Logs) and can be
  forwarded via Logpush to any external SIEM — the same end goal the Python
  version stated, just via the platform's native log pipeline instead of a
  local file handler. No new secrets required (salt is optional, falls back
  to a documented default exactly as the Python version did).
- Cons: Not independently queryable without external Logpush configured;
  this is a "restore the accountability signal" fix, not a full observability
  build-out.
- Estimated effort: ~2 hours.

### Decision

We chose **Option C: structured `console.log` JSON output**, matching the
original schema field-for-field (snake_case keys: `trace_id`, `timestamp`,
`actor_hash`, `action`, `classifications_found`, `injection_detected`,
`max_severity`, `policy_action`, `pii_types_found`, `input_length`, `blocked`)
so any downstream log pipeline built for the Python version's output would
still parse this one unchanged.

### Rationale

- **Alignment with Secure Pride values**: restores the "who accessed what,
  when" accountability signal without adding new attack surface — no new
  binding, no new credential, no new third-party service. Matches the
  privacy-first mandate: actor identity is SHA-256 hashed with a salt before
  it ever leaves the function; raw actor IDs and raw scanned text are never
  logged.
- **Trade-offs accepted**: logs are only as durable/queryable as whatever the
  operator configures Cloudflare Logpush to do with them. That's an
  infrastructure decision for a future pass (Option A/B), not blocking here.
- **Risks mitigated**: closes a silent accountability gap on a tool that is
  already public. `crypto.subtle.digest` (Web Crypto SHA-256) is used for the
  hash — this makes `scan()` async, which is a real, deliberate API change
  (documented in code and tests), not an accidental side effect.
- **Success criteria**: every call to `scan()` emits exactly one structured
  audit entry, matching the original schema; no raw PII, raw actor ID, or raw
  scanned text ever appears in a log line (covered by test); the DLP test
  suite actually runs in CI going forward (`vitest.config.ts` fix).

### Implementation Plan

1. Fix `vitest.config.ts` include glob so `functions/_lib/dlp/*.test.ts` runs.
2. Fix the unrelated, already-broken `src/__tests__/package-lock.test.ts`
   regressions (stale after an intentional, already-merged dependency
   removal — not a real regression to revert).
3. Add `functions/_lib/dlp/audit.ts`: `hashActor()` (Web Crypto SHA-256,
   salted), `logScan()` (structured JSON `console.log`).
4. Wire into `engine.ts`'s `scan()` — now `async`; call `logScan` on every
   scan, matching the Python original's "always, even for clean scans."
5. Thread an optional `SP_AUDIT_SALT` from `functions/api/scan.ts`'s
   `context.env` through to `scan()`.
6. Add tests: hash determinism/salt-sensitivity, entry shape matches schema,
   no raw text/PII/actor ID ever appears in a logged entry, `logScan` called
   exactly once per `scan()` call.
7. Update existing `engine.test.ts` calls to `await scan(...)`.
8. Full suite green, push branch, open PR against `main` (not a direct push)
   for review before this second version goes live.

### Outcome

Implemented as planned. Along the way, two additional broken pieces were
found and fixed since they were touched directly by this change:

- `vitest.config.ts`'s `include` glob only matched `src/**`, so the entire
  `functions/_lib/dlp/*.test.ts` suite (42 tests, including this change's
  own tests) had never actually run. Fixed.
- `src/__tests__/package-lock.test.ts` was a one-time snapshot test pinning
  an exact historical lockfile diff (vitest 2.1.9). Legitimate later
  dependency bumps (vitest → 4.1.0) made 81 of its 116 assertions fail. Not
  referenced by any CI workflow; removed rather than endlessly re-pinned,
  since it tested npm's lockfile output for third-party packages, not this
  project's own code.
- `functions/api/scan.ts` and `functions/api/health.ts` both had a
  pre-existing `PagesFunction` type error (DOM lib's `Response`/`Headers`
  clashing with `@cloudflare/workers-types`' own, because the root
  `tsconfig.json` implicitly pulled in DOM lib for everything including
  server-side Workers code). No typecheck script or CI step existed to catch
  this. Fixed by splitting `functions/` into its own `tsconfig.json`
  (`lib: ["ES2022"]`, no DOM) separate from the site's browser-facing config.

Adversarially tested via `/touchstone` before finalizing: the audit layer
itself held under 4 targeted probes (JSON-injection via a malicious actor
ID, using the salt string as an actor ID, hash-collision check on short
inputs, control-character scanned text) — no leak in any case. Touchstone
also surfaced real, pre-existing evasion gaps in the detection engine
(Unicode homoglyphs, zero-width characters, paraphrase, credit-card
separator tolerance) — confirmed identical to the Python original, not
introduced by this change. Filed separately as DECISION-002 rather than
blocking this PR.

Final state: 61/61 tests passing (42 existing + 10 new in `audit.test.ts` +
9 new audit-logging integration tests added to `engine.test.ts`), both
`tsconfig.json`s typecheck clean, `npm run build` succeeds.
