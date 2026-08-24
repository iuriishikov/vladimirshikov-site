# ADR 0007: Deploy a Docker image from GHCR to a single VPS over SSH

- **Status**: Accepted
- **Date**: 2026-08-24
- **Related**: [ADR 0003](./0003-nextjs-app-router-and-rsc.md), [ADR 0004](./0004-pnpm-and-supply-chain-hardening.md), [deployment.md](../deployment.md)

## Context

The workload is a personal website in two languages: a few pages, a contact form, a health endpoint.
Traffic is measured in tens to low hundreds of visits a day, with occasional spikes when something
gets linked. There is one maintainer, working intermittently.

The requirements that actually matter:

- **Predictable cost.** A fixed monthly figure, not a bill that scales with a link going viral.
- **No lock-in.** Nothing that makes leaving the platform a rewrite.
- **Reproducible artefacts.** What runs in production must be traceable to a commit.
- **Fast rollback.** Restoring the previous version must take a minute, not a rebuild.
- **Low maintenance.** Infrastructure that goes months untouched without becoming a liability.

The requirements that explicitly do **not** apply: autoscaling, multi-region, zero-downtime deploys,
blue/green traffic shifting, high availability. Building for them would add moving parts that need
maintenance and would never be exercised.

## Decision

We deploy a container image to a **single VPS** running a two-service Docker Compose stack.

- **Build**: `docker.yml` (reusable, `workflow_call`) builds the `output: 'standalone'` image with
  Buildx for `linux/amd64` and `linux/arm64`, and pushes it to
  **`ghcr.io/iuriishikov/vladimirshikov-site`** with an SBOM and a build provenance attestation.
- **Registry**: GHCR — same account, same permissions model, authenticated with the workflow's own
  `GITHUB_TOKEN`. No third-party registry credential exists to leak.
- **Deploy**: `deploy.yml` connects over SSH with a deploy-only key, verifying the host against a
  pinned `SSH_KNOWN_HOSTS`. It records the running image, writes the new `IMAGE=` line into the
  server's `.env` and the activated reference into `.deployed-image`, runs
  `docker compose pull && up -d`, then polls `/api/health`.
- **Environments**: `develop` → `staging` automatically; a `v*` tag or a published release →
  `production`, gated on reviewer approval through the GitHub `production` environment.
- **Runtime**: `web` (the Next.js standalone image, no published port) behind `caddy`, which
  terminates TLS with automatic certificates and reverse-proxies to `web:3000`.
- **Rollback**: automatic on a failed health check, plus `rollback.yml` (`workflow_dispatch`) to
  redeploy any previously published tag without rebuilding.

The full operational detail is in [deployment.md](../deployment.md).

## Consequences

- **Positive**: Fixed, small monthly cost, independent of traffic.
- **Positive**: The deployable artefact is a tagged image with an SBOM and provenance. "What is
  running?" is answered by `curl /api/health` and cross-checked against a GHCR tag.
- **Positive**: Rollback redeploys a byte-identical published image rather than rebuilding an old
  commit — the fastest and least surprising recovery available.
- **Positive**: Portable. The same image runs on any host with Docker; moving providers is a DNS
  change and a `docker compose up`.
- **Positive**: Full control over headers, TLS configuration and logs, with no platform-specific
  edge behaviour to reverse-engineer.
- **Negative**: The server is ours to maintain — OS patches, Docker upgrades, disk and log rotation.
  Unattended security upgrades cover most of it, but not all.
- **Negative**: A single point of failure. A VPS outage is a site outage, and there is no failover.
- **Negative**: `docker compose up -d web` stops the old container before starting the new one, so a
  deploy has a gap of a few seconds. Caddy stays up, so the worst case is a brief `502`. Documented
  rather than engineered away.
- **Negative**: No global edge network. For a two-locale personal site with a small audience, latency
  from a single well-placed region is acceptable.
- **Neutral**: The compose files and the `Caddyfile` are version-controlled, and `DEPLOY_PATH` on
  the server is a checkout of this repository — a deploy never depends on a file someone once pasted
  onto a host. The one genuinely server-side file is `.env` (`SITE_DOMAIN`, `ACME_EMAIL`,
  `SITE_URL`, `APP_ENV`, `APP_VERSION`, plus the `IMAGE` line the deploy script rewrites). That
  keeps production values out of git, and is the one piece of state a fresh clone cannot reproduce —
  a trade recorded here so it is not discovered during an incident.

## Alternatives considered

### Vercel

The path of least resistance for Next.js: zero configuration, preview deployments per PR, a global
edge network, and first-party support for every App Router feature. Rejected on three grounds.
First, **cost shape** — the free tier is generous until it is not, and usage-based pricing on a
personal site turns a traffic spike into a bill. Second, **lock-in** — image optimisation, ISR,
middleware and edge functions all behave in platform-specific ways, and depending on them makes
leaving a rewrite rather than a redeploy. Third, **control** — TLS configuration, header policy and
logs are the platform's to define.

This is the closest call in this ADR. If preview deployments per PR became important, or if
maintaining a server became a burden, Vercel is the alternative to reach for.

### Kubernetes (managed or self-hosted)

Rejected as disproportionate by a wide margin. A cluster brings a control plane, manifests, ingress
controllers, cert-manager, secret management and an upgrade cadence — a permanent operational
obligation — in exchange for autoscaling and self-healing that a site this size will never need.
Compose expresses the same two services in forty lines that need no maintenance.

### A platform-as-a-service: Fly.io, Railway, Render, Coolify

Reasonable middle ground: containers without server administration. Rejected because each
reintroduces a degree of platform coupling and a usage-based bill, while the operational saving over
`docker compose pull && up -d` on one box is genuinely small. Coolify, being self-hosted, would add a
control plane to maintain on the same VPS it manages.

### Static export to object storage plus a CDN

Rejected: incompatible with Server Components, server-side i18n routing, the contact form and the
health endpoint. It would mean reverting [ADR 0003](./0003-nextjs-app-router-and-rsc.md).

### `git pull` and `pnpm build` on the server

Rejected. Building on the production host means the toolchain, the source and the registry
credentials all live there; builds compete with the running site for memory; and there is no
immutable artefact, so "rollback" becomes "check out an old commit and hope the build is
reproducible".

## Revisit when

- **Sustained traffic** makes one VPS a genuine constraint — then a load balancer with two `web`
  replicas is the next step, not a cluster.
- **Uptime becomes a real requirement** (the site starts backing something people depend on), which
  makes the single point of failure unacceptable.
- **Maintaining the server stops being enjoyable or safe** — the honest signal that a managed
  platform is worth its cost and its lock-in.
- **Preview deployments per pull request** become part of the review workflow.
