# Design history

Docs preserved here document the design process behind features that are
now actually shipped in this repo — kept for historical context, not as
live specs (check the code for current behavior).

## AI Safety Scanner (DLP engine)

- `2026-05-02-worker-dlp-integration-design.md` — design spec
- `2026-05-02-worker-dlp-integration-plan.md` — implementation plan

Both authored 2026-05-02, originally committed to a `secure-pride-dlp`
prototype that lived in the `mazze93/projects-workspace` container repo (a
policy violation — `secure-pride/*` content should never live there — since
corrected by purging that history). The plan and design spec themselves
contain no secrets and have real documentation value: they're the direct
ancestor of the TypeScript DLP engine now live at `functions/_lib/dlp/`
(commit `395565b`, PR #21, 2026-06-06). Preserved here, in the repo where
the shipped code actually lives, rather than lost when that container
history was purged.
