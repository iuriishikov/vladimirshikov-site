# ADR 0004: Use pnpm with supply-chain hardening

- **Status**: Accepted
- **Date**: 2026-08-24
- **Related**: [ADR 0007](./0007-docker-ghcr-ssh-deployment.md), [security.md](../security.md)

## Context

A Next.js application of this shape resolves to several hundred transitive packages. Every one of
them is code that runs on a developer machine, in CI with a `GITHUB_TOKEN`, and — for anything that
survives tree-shaking — in visitors' browsers.

The realistic threat is not a targeted attack on a personal website. It is collateral damage from a
generic registry compromise, which has a well-documented shape:

1. A maintainer account is taken over, usually by phishing or a leaked token.
2. A malicious version of a popular package is published.
3. It exfiltrates environment variables and tokens, most often from a `postinstall` script.
4. Someone notices within hours, and the version is unpublished.

Steps 3 and 4 are where the defences belong: block install-time script execution, and never install a
version young enough to still be in step 4's window.

Secondary requirement: reproducibility. A dependency change must be a reviewable diff, and CI must
install exactly what the developer installed.

## Decision

We use **pnpm 11.22.0**, pinned via the `packageManager` field and Corepack, with project settings in
[`pnpm-workspace.yaml`](../../pnpm-workspace.yaml).

### `minimumReleaseAge: 1440`

A version must have been on the registry for 24 hours before it may be installed. This closes the
window between publication and discovery for the overwhelming majority of registry compromises.
Deliberate exceptions are listed by exact version under `minimumReleaseAgeExclude` — currently the
TanStack Query 5.102.2 family and `@types/react-dom@19.2.5`.

### `allowBuilds` — postinstall scripts denied by default

Lifecycle scripts do not run unless the package is listed, and each entry carries a comment
explaining why:

```yaml
allowBuilds:
  '@parcel/watcher': true # native file watching for vite/storybook dev servers
  '@swc/core': true # SWC binary used by Storybook's Next.js builder
  esbuild: true # vite/vitest dependency, needs its platform binary
  unrs-resolver: true # native resolver behind eslint-plugin-import-x
  msw: false # only its Node interceptor is used; no browser worker in ./public
```

`msw: false` is an explicit denial rather than an omission, so the finding is recorded and nobody
has to re-derive it.

### `nodeLinker: isolated`, `shamefullyHoist: false`

A module may import only what it declares. This fixes phantom dependencies — code that works locally
because something else hoisted the package — and it limits what a compromised transitive dependency
is reachable from.

### Lockfile discipline

`preferFrozenLockfile: true` locally, `--frozen-lockfile` in CI. `verifyDepsBeforeRun: warn` catches
a `node_modules` that has gone stale after a rebase, which is the usual cause of "works on my
machine".

### npm-compatible settings only in `.npmrc`

`.npmrc` carries just `engine-strict=true`. pnpm-specific settings live in `pnpm-workspace.yaml`, so
running `npm` in this repository does not emit a wall of "unknown config" warnings.

### Independent verification

The quarantine is not trusted alone. `dependency-review.yml` blocks PRs that introduce known
advisories, CodeQL analyses the code, and OSSF Scorecard grades the repository's own posture weekly.
See [security.md](../security.md).

## Consequences

- **Positive**: The dominant registry attack pattern is defeated by a configuration value rather
  than by vigilance.
- **Positive**: Install-time code execution is an explicit, reviewed, five-entry list.
- **Positive**: Isolated `node_modules` makes undeclared dependencies fail immediately instead of at
  an unlucky moment later.
- **Positive**: pnpm's content-addressable store means disk usage and install time stay low despite
  the strictness.
- **Negative**: You cannot install a package on release day. When a genuinely urgent fix lands, it
  needs an explicit `minimumReleaseAgeExclude` entry — friction that is the point, but friction all
  the same.
- **Negative**: A new native dependency fails until someone adds it to `allowBuilds`, and the error
  message is not always obvious the first time.
- **Negative**: Corepack is required. `npm i -g pnpm` produces a different pnpm and, eventually, a
  different lockfile.
- **Neutral**: `minimumReleaseAgeExclude` needs occasional pruning; a stale entry is a permanently
  disabled defence for that package.

## Alternatives considered

### npm

Rejected. It hoists by default, which reintroduces phantom dependencies, and it has no equivalent of
`minimumReleaseAge`. `--ignore-scripts` is all-or-nothing rather than a reviewed allowlist, and
`node_modules` is much larger.

### Yarn (Berry) with PnP

Strong on the same axes — strict resolution, good lockfile discipline, and Plug'n'Play removes
`node_modules` entirely. Rejected because PnP still requires per-tool compatibility patches, and this
project depends on a long tail of tooling (Storybook, Playwright, Vitest, Lighthouse CI, semantic
release) where "mostly works" is a bad trade for a small ergonomic gain. pnpm's isolated linker gets
most of the benefit with none of the compatibility surface.

### Bun

Rejected for now. Fast, and its install semantics are improving, but the runtime is not the target
(the container runs Node 24), and there is no equivalent to the quarantine. Interesting again once
the security controls exist.

### No quarantine, rely on `npm audit` and Dependabot alerts

Rejected: both are reactive. They tell you about a bad version after it has been catalogued —
typically after you have already installed it. `minimumReleaseAge` is the only control here that is
preventive rather than detective.

## Revisit when

- pnpm changes the semantics or the home of these settings; they moved to `pnpm-workspace.yaml` in
  pnpm 10 already.
- The 24-hour window proves either insufficient (a compromise stays undetected longer) or too
  costly (exclusions are needed routinely rather than rarely).
- npm or Yarn ships a comparable quarantine, which would make the package manager choice less
  load-bearing.
