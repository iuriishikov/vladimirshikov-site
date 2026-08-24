# syntax=docker/dockerfile:1
# -----------------------------------------------------------------------------
# vladimirshikov-site — production image.
#
# Four stages so that each layer is invalidated only by what it actually
# depends on:
#   base    toolchain (Node + the exact pnpm from package.json#packageManager)
#   deps    node_modules from a frozen lockfile, with a shared pnpm store
#   builder `next build` against those deps
#   runner  the standalone server and nothing else
#
# Build:
#   docker build -t vladimirshikov-site:local .
#
# The image is environment-agnostic: the origin and the deployment tier are read
# at runtime (SITE_URL, APP_ENV), so one build is promoted from staging to
# production unchanged.
#
# BuildKit is required (cache mounts). It is the default since Docker 23.
# -----------------------------------------------------------------------------

# Pinned by tag here for readability. Renovate rewrites this line to
# `node:24-alpine@sha256:...` and keeps the digest current, which is what makes
# the build reproducible — the tag alone is a moving target.
FROM node:24-alpine AS base

# Corepack ships with Node 24 and installs the pnpm version recorded in
# package.json#packageManager, so the image can never drift from the lockfile.
ENV PNPM_HOME=/pnpm \
    PATH=/pnpm:$PATH \
    COREPACK_ENABLE_DOWNLOAD_PROMPT=0 \
    NEXT_TELEMETRY_DISABLED=1 \
    CI=1
RUN corepack enable && corepack prepare pnpm@11.22.0 --activate

WORKDIR /app

# -----------------------------------------------------------------------------
# deps — dependency resolution only. Changing application source does not
# invalidate this layer.
# -----------------------------------------------------------------------------
FROM base AS deps

# .npmrc carries engine-strict; pnpm-workspace.yaml carries the supply-chain
# settings (allowBuilds, minimumReleaseAge). Both must be present or the install
# silently runs with different rules than a developer's machine.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./

# The cache mount keeps the content-addressed pnpm store between builds; it is
# never copied into an image layer. sharing=locked serialises concurrent builds
# that would otherwise corrupt the store.
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store,sharing=locked \
    pnpm install --frozen-lockfile --store-dir /pnpm/store

# -----------------------------------------------------------------------------
# builder — compile the app.
# -----------------------------------------------------------------------------
FROM base AS builder

# NEXT_PUBLIC_* values are inlined into the client bundle by the compiler, so
# they are build-time inputs, not runtime configuration: changing one at
# `docker run` time has no effect whatsoever. Only genuinely browser-side
# configuration is allowed to pay that cost. The canonical origin and the
# deployment tier are deliberately NOT here — src/shared/config/env.ts declares
# them as server variables read per request, which keeps one image valid for
# staging and production alike.
ARG NEXT_PUBLIC_ANALYTICS_DOMAIN=
ENV NEXT_PUBLIC_ANALYTICS_DOMAIN=$NEXT_PUBLIC_ANALYTICS_DOMAIN

# next.config.ts imports src/shared/config/env.ts, which throws on a missing
# server variable. The image build has no runtime secrets and must not need
# them; validation happens again for real when the container starts.
ENV SKIP_ENV_VALIDATION=1 \
    NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN pnpm build

# `public/` is optional in this scaffold but the runner copies it
# unconditionally; creating it here keeps the COPY below from failing on a tree
# that has no static assets yet.
RUN mkdir -p /app/public

# -----------------------------------------------------------------------------
# runner — minimal surface: no pnpm, no source, no dev dependencies.
# -----------------------------------------------------------------------------
FROM node:24-alpine AS runner

# tini reaps zombies and forwards SIGTERM, so `docker compose down` stops the
# Next.js server gracefully instead of waiting out the kill timeout.
RUN apk add --no-cache tini

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

WORKDIR /app

# `output: 'standalone'` emits a server bundle with its own pruned node_modules.
# Static assets and public files are deliberately not traced, hence the two
# extra copies.
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
COPY --from=builder --chown=node:node /app/public ./public

# The ISR/fetch cache is the only path the server writes to at runtime. It is a
# mount point in docker-compose.yml; pre-creating it with the right owner means
# the named volume inherits that ownership instead of defaulting to root.
RUN mkdir -p /app/.next/cache && chown -R node:node /app/.next/cache

# `node` (uid 1000) already exists in the official image.
USER node

EXPOSE 3000

# Node 24 has a global fetch, so the health probe needs no extra package in the
# image. --start-interval requires Docker Engine >= 25.
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --start-interval=2s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "server.js"]

# OCI metadata last: these arguments change on every commit and would otherwise
# invalidate the layers above.
ARG VERSION=0.0.0
ARG VCS_REF=unknown
ARG BUILD_DATE=unknown
LABEL org.opencontainers.image.title="vladimirshikov-site" \
      org.opencontainers.image.description="Vladimir Shikov — personal site." \
      org.opencontainers.image.authors="Iurii Shikov" \
      org.opencontainers.image.url="https://github.com/iuriishikov/vladimirshikov-site" \
      org.opencontainers.image.source="https://github.com/iuriishikov/vladimirshikov-site" \
      org.opencontainers.image.documentation="https://github.com/iuriishikov/vladimirshikov-site#readme" \
      org.opencontainers.image.licenses="MIT" \
      org.opencontainers.image.vendor="Iurii Shikov" \
      org.opencontainers.image.base.name="docker.io/library/node:24-alpine" \
      org.opencontainers.image.version="$VERSION" \
      org.opencontainers.image.revision="$VCS_REF" \
      org.opencontainers.image.created="$BUILD_DATE"
