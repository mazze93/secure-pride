# syntax=docker/dockerfile:1

# ── Stage 1: Build the Astro site ──────────────────────────────────────────
FROM node:24.19.0-alpine AS builder
WORKDIR /app

# Install deps before copying source so layer is cached on dep changes only
COPY package.json package-lock.json .npmrc ./
RUN npm ci

# Only the inputs astro build actually reads — keeps the layer cache tight
# and avoids pulling unrelated top-level files (docs/, functions/, etc.)
# into the build stage.
COPY astro.config.mjs tsconfig.json tailwind.config.ts postcss.config.mjs ./
COPY src/ ./src/
COPY public/ ./public/
RUN npm run build           # astro build → dist/

# ── Stage 2: Serve with nginx ────────────────────────────────────────────────
# Unprivileged variant: runs as the `nginx` user (not root) out of the box,
# listens on 8080 instead of 80. Removes the most common container-escape
# escalation path for a static file server.
FROM nginxinc/nginx-unprivileged:1.30.4-alpine

LABEL org.opencontainers.image.title="Secure Pride" \
      org.opencontainers.image.description="Privacy-first security tools and standards for LGBTQ+ and other high-risk groups — the securepride.org site, served static." \
      org.opencontainers.image.source="https://github.com/mazze93/secure-pride" \
      org.opencontainers.image.licenses="Apache-2.0" \
      org.opencontainers.image.vendor="Secure Pride"

# Harden: drop all default config, add minimal one
USER root
RUN rm /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

# Minimal config: gzip, long-lived static assets, correct MIME types
RUN printf 'server {\n\
    listen 8080;\n\
    root /usr/share/nginx/html;\n\
    index index.html;\n\
    gzip on;\n\
    gzip_types text/css application/javascript image/svg+xml;\n\
    location / { try_files $uri $uri/ /index.html; }\n\
    location ~* \\.(js|css|png|jpg|svg|woff2)$ {\n\
        expires 1y;\n\
        add_header Cache-Control "public, immutable";\n\
    }\n\
}\n' > /etc/nginx/conf.d/app.conf \
    && chown -R nginx:nginx /usr/share/nginx/html
USER nginx

EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost:8080/ || exit 1
