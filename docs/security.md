# Security

A personal site is a small target, but it is a target with a supply chain, a build pipeline and a
server. The posture here is layered: no single control is trusted alone, and every control fails
closed.

To report a vulnerability, see [SECURITY.md](../SECURITY.md).

---

## Layers

| Layer                 | Control                                                           | Fails                     |
| --------------------- | ----------------------------------------------------------------- | ------------------------- |
| Dependency intake     | `minimumReleaseAge`, `allowBuilds`, isolated node linker          | `pnpm install`            |
| Secrets in code       | secretlint on `pre-commit`, gitleaks over history in CI           | Commit / `secrets-scan`   |
| Code defects          | CodeQL, typed ESLint, `strict` TypeScript                         | PR / `lint` / `typecheck` |
| Known vulnerabilities | Dependency review on PRs, Renovate and Dependabot for updates     | `dependency-review`       |
| Repository posture    | OSSF Scorecard, branch protection, environment approvals          | Weekly report             |
| Browser runtime       | CSP with a per-request nonce, static security headers             | Runtime                   |
| Server runtime        | Non-root read-only container, no published app port, TLS at Caddy | Runtime                   |

---

## Supply chain

### Quarantine: `minimumReleaseAge`

[`pnpm-workspace.yaml`](../pnpm-workspace.yaml) sets:

```yaml
minimumReleaseAge: 1440 # 24 hours
```

A package version must have existed on the registry for at least 24 hours before pnpm will install
it. Nearly every registry compromise of the last few years followed the same pattern — a maintainer
account is taken over, a malicious version is published, and it is yanked within hours once someone
notices. A 24-hour delay converts that class of attack into a non-event, at the cost of never being
first to a release.

When a specific version genuinely must skip the queue, it is listed explicitly under
`minimumReleaseAgeExclude` with the exact version pinned. That list is small, reviewed, and is the
right place to look when an install resolves to something older than expected.

### Blocked install scripts: `allowBuilds`

Postinstall scripts are the other classic execution vector, so pnpm blocks them by default here. A
package may only run one if it is listed:

```yaml
allowBuilds:
  '@parcel/watcher': true # native file watching for vite/storybook dev servers
  '@swc/core': true # SWC binary used by Storybook's Next.js builder
  esbuild: true # vite/vitest dependency, needs its platform binary
  unrs-resolver: true # native resolver behind eslint-plugin-import-x
  msw: false # only its Node interceptor is used; no browser worker in ./public
```

Each entry names a reason. `msw: false` is the interesting one: it is listed explicitly as _denied_,
so nobody has to rediscover that its postinstall step is unnecessary in this project.

If an install warns that a package's build script was ignored, the correct response is to work out
what that script does before adding it — not to add it and move on.

### Isolated `node_modules`

```yaml
nodeLinker: isolated
shamefullyHoist: false
```

A module can only import what it declares in its own `package.json`. Beyond correctness, this shrinks
the blast radius: a compromised transitive dependency is not silently importable from application
code that never asked for it.

`preferFrozenLockfile: true` locally and `--frozen-lockfile` in CI mean the lockfile is the truth. A
dependency change is always a visible diff in `pnpm-lock.yaml`, reviewed like any other code.

### Automated updates

Two bots, split by ecosystem:

- **Renovate** ([`.github/renovate.json5`](../.github/renovate.json5)) owns npm and Docker. It
  understands pnpm's lockfile, groups related packages, and honours the minimum release age above.
- **Dependabot** ([`.github/dependabot.yml`](../.github/dependabot.yml)) owns GitHub Actions only.
  The overlap is deliberate: Dependabot needs no app installation, so action versions keep moving
  even if the Renovate app is ever removed.

Both open PRs titled `build(deps): ...`, which semantic-release treats as a patch. Those PRs go
through the same `ci-ok` gate and the same `dependency-review` check as everything else — automation
raises the pull request, it does not merge it.

---

## Secrets

Two independent nets, deliberately using different tools:

1. **`pre-commit` — secretlint.** [`lint-staged.config.mjs`](../lint-staged.config.mjs) runs
   `secretlint` over every staged file (not just source files), configured by
   [`.secretlintrc.json`](../.secretlintrc.json) with the recommended rule preset. Obvious
   placeholders (`EXAMPLE`, `PLACEHOLDER`, `CHANGE_ME`, `your-*-here`) are allowed so that
   `.env.example` and documentation do not trip it.
2. **CI — gitleaks.** The `secrets-scan` job in `ci.yml` scans the **full history**, not the diff. It
   catches anything committed before the hooks existed, and anything committed by a client that
   bypassed them.

`.gitignore` excludes every `.env*` variant except `.env.example`, plus `*.pem` and `*.key`.

If a secret does reach the repository: rotate it first, then clean the history. In that order —
history rewriting is slow and the credential is live the whole time.

**Never put a secret behind `NEXT_PUBLIC_`.** That prefix inlines the value into the client bundle at
build time, where it is visible to anyone and cannot be changed afterwards.

The schema in `src/shared/config/env.ts` takes this further: almost everything is declared
server-side, including the canonical origin (`SITE_URL`) and the deployment tier (`APP_ENV`). Only
genuinely browser-side configuration gets the public prefix — currently just the optional analytics
domain. That keeps the public surface as small as it can be, and has the useful side effect that one
image serves every environment.

---

## Static analysis

> **This repository is private, so three of the controls below are dormant.** CodeQL, GitHub's
> dependency review and OSSF Scorecard all depend on GitHub Advanced Security or on the repository
> being public. Rather than failing every pull request with "Advanced Security must be enabled",
> each of those jobs carries `if: github.event.repository.private == false` and skips. Make the
> repository public, or enable GHAS for it, and all three start working with no further change.
>
> What still runs on a private repository: `pnpm audit`, gitleaks, secretlint, typed linting and
> every gate in `ci.yml`.

**CodeQL** (`codeql.yml`) runs the `javascript-typescript` query pack on pull requests, on pushes to
the long-lived branches, and weekly. The weekly schedule exists because new queries find old bugs —
code that was clean in January is not necessarily clean in June.

**Dependency review** (`dependency-review.yml`) has two jobs. The `review` job compares the manifests
on both sides of a PR and fails when a new dependency carries a known advisory or an unacceptable
licence — the check that catches a vulnerable _transitive_ dependency arriving inside a routine
update. The `audit` job runs `pnpm audit --audit-level=high`, works on any repository, and is
deliberately outside the `ci-ok` gate: a new advisory can land overnight against a dependency the
pull request never touched, and that is worth an alert rather than a merge block.

Advisories that cannot be fixed yet are listed, with a reason and an expiry condition, under
`auditConfig.ignoreGhsas` in `pnpm-workspace.yaml`. An empty list is the goal; a silent
`continue-on-error` is not an acceptable substitute.

**OSSF Scorecard** (`scorecard.yml`) grades the repository's own practices weekly — branch
protection, pinned action SHAs, signed releases, token permissions, dependency automation — and
publishes to the code-scanning dashboard. It is the only control here aimed at the repository rather
than the code.

**Typed linting.** `typescript-eslint`'s `strictTypeChecked` configuration uses type information, so
it catches unsafe `any` propagation, floating promises and misused promise returns — a real class of
security bugs, not just style. `strict` TypeScript with `noUncheckedIndexedAccess` and
`exactOptionalPropertyTypes` removes another.

---

## Runtime headers

### CSP with a per-request nonce

The Content-Security-Policy is generated in `src/proxy.ts` — Next.js 16's name for what earlier
versions called `middleware.ts` — rather than in `next.config.ts`, because it carries a nonce that
must be unique per request. The nonce is passed to Next.js, which stamps it on the scripts it emits,
so inline scripts work without `unsafe-inline` and an injected script has no valid nonce and does not
execute.

This is why `csp-xss` is a warning rather than an error in
[`lighthouserc.json`](../lighthouserc.json): Lighthouse evaluates the policy statically and cannot
see that the nonce is per-request.

### Static headers

Everything that does not vary per request is set in
[`next.config.ts`](../next.config.ts) and applied to `/:path*`:

| Header                         | Value                                                                              | Prevents                                   |
| ------------------------------ | ---------------------------------------------------------------------------------- | ------------------------------------------ |
| `Strict-Transport-Security`    | `max-age=63072000; includeSubDomains; preload`                                     | Protocol downgrade, SSL stripping          |
| `X-Content-Type-Options`       | `nosniff`                                                                          | MIME confusion attacks                     |
| `X-Frame-Options`              | `DENY`                                                                             | Clickjacking                               |
| `Referrer-Policy`              | `strict-origin-when-cross-origin`                                                  | Leaking paths to third parties             |
| `Cross-Origin-Opener-Policy`   | `same-origin`                                                                      | Cross-window scripting via `window.opener` |
| `Cross-Origin-Resource-Policy` | `same-origin`                                                                      | Cross-origin resource inclusion            |
| `Origin-Agent-Cluster`         | `?1`                                                                               | Shared agent-cluster side channels         |
| `Permissions-Policy`           | `camera=(), microphone=(), geolocation=(), browsing-topics=(), interest-cohort=()` | Silent capability and tracking access      |
| `X-DNS-Prefetch-Control`       | `on`                                                                               | (Performance, not security)                |

`poweredByHeader: false` removes the `X-Powered-By` banner. `images.remotePatterns` is an empty
array on purpose — a wildcard there turns the Next.js image endpoint into an open proxy, and every
allowed host must be added deliberately.

---

## Container and server

The production image is built from the `output: 'standalone'` bundle, so it contains the server and
its traced dependencies rather than the whole `node_modules` tree — a smaller image with a smaller
attack surface.

At runtime:

- **Non-root user.** The image runs as an unprivileged user; nothing in the container needs root.
- **Read-only root filesystem**, with a `tmpfs` for `/tmp`. A write primitive has nowhere to persist.
- **`cap_drop: ALL`** and **`no-new-privileges:true`** — no Linux capabilities, no setuid escalation.
- **No published port.** `web` only `expose`s `3000` on the internal network; the only ingress is
  Caddy on `80`/`443`, which means TLS cannot be bypassed by accident.
- **Environment validated at start.** The image is built with `SKIP_ENV_VALIDATION=1` and validates
  the real values when the container boots, so a misconfigured deploy fails the health check and
  rolls back rather than serving.
- **SBOM and provenance attestation** are generated by `docker.yml` and attached to the image in
  GHCR, so what is running can be traced back to the commit that produced it.

The deploy itself uses a dedicated non-root SSH user with a deploy-only key, and pins the server's
host key via `SSH_KNOWN_HOSTS` rather than trusting it on first connection. Production deploys
additionally require a reviewer through the GitHub `production` environment.

---

## Related

- [SECURITY.md](../SECURITY.md) — how to report a vulnerability
- [ci-cd.md](./ci-cd.md) — where each of these checks runs
- [deployment.md](./deployment.md) — the server-side configuration
- [ADR 0004](./adr/0004-pnpm-and-supply-chain-hardening.md) — why these pnpm settings
- [ADR 0007](./adr/0007-docker-ghcr-ssh-deployment.md) — why this deployment shape
