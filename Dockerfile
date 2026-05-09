# syntax=docker/dockerfile:1

# ── Stage 1: Build the Astro site ──────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

# Install deps before copying source so layer is cached on dep changes only
COPY package.json ./
COPY site/package.json ./site/
RUN npm install --workspace=site

COPY site/ ./site/
RUN npm run build           # runs `npm -w site run build` → site/dist/

# ── Stage 2: Serve with nginx ────────────────────────────────────────────────
FROM nginx:1.27-alpine

# Harden: drop all default config, add minimal one
RUN rm /etc/nginx/conf.d/default.conf
COPY --from=builder /app/site/dist /usr/share/nginx/html

# Minimal config: gzip, long-lived static assets, correct MIME types
RUN printf 'server {\n\
    listen 80;\n\
    root /usr/share/nginx/html;\n\
    index index.html;\n\
    gzip on;\n\
    gzip_types text/css application/javascript image/svg+xml;\n\
    location / { try_files $uri $uri/ /index.html; }\n\
    location ~* \\.(js|css|png|jpg|svg|woff2)$ {\n\
        expires 1y;\n\
        add_header Cache-Control "public, immutable";\n\
    }\n\
}\n' > /etc/nginx/conf.d/app.conf

EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost/ || exit 1
