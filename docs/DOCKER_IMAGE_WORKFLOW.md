# Docker Image Workflow

Guide to the CI release pipeline that builds, scans, and publishes the
secure-pride Docker image on version tags.

---

## Where the image lives

**`ghcr.io/mazze93/secure-pride`** — GitHub Container Registry, not Docker
Hub. Migrated 2026-09-11: GHCR authenticates with the `GITHUB_TOKEN` that
Actions mints automatically for every workflow run and revokes when the run
ends. There is no long-lived credential to create, store, rotate, or leak —
the entire class of "someone forgot to rotate the PAT" incident this doc used
to walk through no longer has a way to happen. The `packages: write`
permission on `GITHUB_TOKEN` (declared in `release.yml`) is all publishing
needs.

Because the package is attached to this GitHub repo (`org.opencontainers.image.source`
label in the `Dockerfile`), the GHCR package page automatically shows this
repo's own description, topics, and avatar — that's the "branded image
display" requirement satisfied structurally rather than by a manual Docker
Hub logo upload nothing was wired up to do.

**No setup steps.** Push a version tag; `release.yml` handles login, scan,
build, and push. Nothing to provision before the first release.

---

## Releasing a new version

```bash
git tag -a v1.0.0 -m "v1.0.0"
git push origin v1.0.0
```

`release.yml` fires automatically and, if the vulnerability scan passes,
pushes:

| Tag | When |
|-----|------|
| `ghcr.io/mazze93/secure-pride:1.0.0` | always |
| `ghcr.io/mazze93/secure-pride:1.0` | always |
| `ghcr.io/mazze93/secure-pride:latest` | always (toggle `PUSH_LATEST` to disable) |

Multi-platform: `linux/amd64` + `linux/arm64` (M-series Mac compatible).

---

## The vulnerability gate

Before anything is pushed, a separate `scan` job builds a single-arch
(`linux/amd64`) copy of the image and runs
[Trivy](https://github.com/aquasecurity/trivy-action) against it with
`severity: CRITICAL,HIGH` and `exit-code: 1`. A vulnerable image fails the
workflow before the `build-push` job — which needs `scan` — ever runs, so a
CVE in a base image or a package layer blocks the release instead of
reaching the registry silently. `ignore-unfixed: true` keeps the gate
actionable: it fails on things a rebuild can actually fix, not on CVEs
upstream hasn't patched yet.

To scan locally before tagging:

```bash
docker build -t secure-pride:local .
trivy image --severity CRITICAL,HIGH secure-pride:local
```

---

## The Docker image

Two-stage build:

| Stage | Base | Purpose |
|-------|------|---------|
| `builder` | `node:24.19.0-alpine` | Runs `npm run build` to compile the Astro site |
| runtime | `nginxinc/nginx-unprivileged:1.30.4-alpine` | Serves `dist/` on port **8080**, as a non-root `nginx` user |

The runtime stage switched from `nginx:1.30.4-alpine` (root, port 80) to the
unprivileged variant 2026-09-11 — same nginx version, but the container no
longer runs as root, closing off the most common container-escape
escalation path for what is otherwise a static file server.

OCI labels (`org.opencontainers.image.title/description/source/licenses/vendor`)
are set directly in the `Dockerfile`, so every build — local or CI — carries
them; nothing depends on a registry-side manual field.

Run locally:

```bash
docker build -t secure-pride .
docker run -p 8080:8080 secure-pride
# open http://localhost:8080
```

Note: Cloudflare Pages Functions (`/api/scan`, `/api/health`) are not
included in the Docker image — they run on the CF runtime. For full-stack
local dev use `npx wrangler pages dev`.

---

## Docker Hub (legacy)

The image previously published to `docker.io/mazze93/secure-pride` under a
90-day Personal Access Token, rotated manually on a reminder from
`token-reminder.yml`. That workflow and the PAT-based publish step are
removed as of 2026-09-11 — GHCR is now the only publish target. Existing
Docker Hub tags are left in place (not deleted) but will not receive new
pushes. `bin/dockerhub-login-test.sh` and `bin/gh-secrets-setup.sh` are kept
for now in case Docker Hub publishing is deliberately re-added later; they
are not invoked by any CI workflow.
