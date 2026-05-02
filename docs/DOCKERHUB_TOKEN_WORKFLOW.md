# Docker Hub Token Workflow

Step-by-step guide for the CI release pipeline that builds and pushes the secure-pride Docker image on version tags.

---

## One-time setup

### 1. Create a Docker Hub PAT

1. Sign in to [hub.docker.com](https://hub.docker.com)
2. **Account Settings** → **Personal access tokens** → **Generate new token**
3. Settings:
   - **Name:** `ci-<YYYY-MM>` (e.g. `ci-2026-05`)
   - **Access:** Read, Write (**not** Delete)
   - **Expiration:** 90 days
4. Copy the token — shown once

### 2. Save secrets to GitHub

```bash
export DOCKERHUB_TOKEN="paste-token-here"
./bin/gh-secrets-setup.sh
```

This sets two GitHub Actions secrets:
- `DOCKERHUB_USERNAME` — your Docker Hub handle (`mazze93`)
- `DOCKERHUB_TOKEN` — the PAT you just created

Verify they appear at `https://github.com/mazze93/Secure-Pride/settings/secrets/actions`.

### 3. Verify locally (optional)

```bash
export DOCKERHUB_USERNAME="mazze93"
export DOCKERHUB_TOKEN="paste-token-here"
./bin/dockerhub-login-test.sh
```

---

## Releasing a new version

```bash
# Commit everything you want in the release
git tag -a v1.0.0 -m "v1.0.0"
git push origin v1.0.0
```

The `release.yml` workflow fires automatically and pushes:

| Tag | When |
|-----|------|
| `docker.io/mazze93/secure-pride:1.0.0` | always |
| `docker.io/mazze93/secure-pride:1.0` | always |
| `docker.io/mazze93/secure-pride:latest` | always (toggle `PUSH_LATEST` to disable) |

Multi-platform: `linux/amd64` + `linux/arm64` (M-series Mac compatible).

---

## Monthly token rotation

On the 1st of every month the `token-reminder.yml` workflow opens a GitHub issue reminding you to rotate. To rotate:

1. Generate a new PAT in Docker Hub (same settings, new name `ci-<YYYY-MM>`)
2. Run `./bin/gh-secrets-setup.sh` with the new token
3. Revoke the old PAT in Docker Hub
4. Close the reminder issue

---

## The Docker image

The `Dockerfile` is a two-stage build:

| Stage | Base | Purpose |
|-------|------|---------|
| `builder` | `node:20-alpine` | Runs `npm run build` to compile the Astro site |
| runtime | `nginx:1.27-alpine` | Serves `site/dist/` on port 80 |

Run locally:

```bash
docker build -t secure-pride .
docker run -p 8080:80 secure-pride
# open http://localhost:8080
```

Note: Cloudflare Pages Functions (`/api/scan`, `/api/health`) are not included in the Docker image — they run on the CF runtime. For full-stack local dev use `npx wrangler pages dev`.
