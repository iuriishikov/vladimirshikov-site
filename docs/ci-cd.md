# CI/CD

Every workflow lives in [`.github/workflows/`](../.github/workflows/). This page says what each one
does, when it runs and what it prevents.

One idea underpins the whole setup: **`ci-ok` is the only required status check.** It depends on
every other job in `ci.yml` and fails if any of them failed or was skipped. Adding, renaming or
splitting a CI job therefore never requires editing the branch protection rule.

---

## Workflows at a glance

| Workflow                | Triggers                                               | Gates                                                               |
| ----------------------- | ------------------------------------------------------ | ------------------------------------------------------------------- |
| `ci.yml`                | PR to `main`/`develop`, push to `main`/`develop`       | Formatting, lint, types, unit tests, build, e2e, dead code, secrets |
| `codeql.yml`            | PR, push to `main`/`develop`, weekly schedule          | Static security analysis of JS/TS                                   |
| `dependency-review.yml` | `pull_request`                                         | New dependencies with known vulnerabilities or bad licences         |
| `scorecard.yml`         | Weekly schedule, push to `main`                        | Supply-chain posture score (reporting)                              |
| `lighthouse.yml`        | `pull_request`                                         | Performance, a11y, best-practices and SEO budgets                   |
| `pr-lint.yml`           | `pull_request` (opened, edited, synchronize, reopened) | PR title is a Conventional Commit; branch name matches the pattern  |
| `labeler.yml`           | `pull_request_target`                                  | Applies path-based labels (reporting)                               |
| `stale.yml`             | Daily schedule                                         | Marks and closes abandoned issues and PRs                           |
| `release.yml`           | Push to `main` or `develop`                            | Runs semantic-release; tags and writes the changelog                |
| `docker.yml`            | `workflow_call` (reusable)                             | Builds and pushes the multi-arch image, SBOM and provenance         |
| `deploy.yml`            | Push to `develop`; tag `v*`; `release: published`      | Ships to staging or production, health-checks, rolls back           |
| `rollback.yml`          | `workflow_dispatch`                                    | Redeploys a previously published image tag                          |

---

## `ci.yml` — the gate

Jobs, in dependency order:

| Job            | Runs                                                        | Fails when                                                                                                           |
| -------------- | ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `install`      | `pnpm install --frozen-lockfile`, warms the shared cache    | The lockfile is out of date with `package.json`                                                                      |
| `lint`         | `pnpm format:check` and `pnpm lint`                         | Formatting drifted, or any ESLint error/warning (`--max-warnings=0`) — this is where FSD boundary violations surface |
| `typecheck`    | `pnpm typecheck`                                            | Any type error under the project's strict settings                                                                   |
| `test`         | `pnpm test:coverage`                                        | A unit test fails, or coverage drops below the thresholds                                                            |
| `build`        | `pnpm build`                                                | The production build fails, or env validation rejects the environment                                                |
| `e2e`          | `pnpm e2e --project=chromium` against the production server | A Playwright spec fails, including the axe accessibility sweep                                                       |
| `knip`         | `pnpm knip`                                                 | Unused files, exports or dependencies appear                                                                         |
| `secrets-scan` | gitleaks over the full history                              | A credential-shaped string is found                                                                                  |
| `ci-ok`        | Nothing — it aggregates                                     | Any job above failed, was cancelled or was skipped                                                                   |

Notes that matter when a job is red:

- **`install` is the cache producer.** The other jobs restore the pnpm store and `node_modules` from
  it, so a cache miss shows up as several slow jobs rather than one.
- **`e2e` runs against `pnpm start`, not `pnpm dev`.** `playwright.config.ts` switches the
  `webServer` command on `CI`, so end-to-end tests exercise the artefact that actually ships. The
  server is considered ready when `GET /api/health` responds.
- **CI runs Chromium only.** `pnpm e2e:install` provisions just that browser, and the job passes
  `--project=chromium`. The firefox, webkit and mobile-safari projects in `playwright.config.ts` are
  for local cross-browser runs — asking CI to run them without their binaries would fail rather than
  inform. Run them yourself before a release, after `pnpm exec playwright install firefox webkit`.
- **`test` uploads coverage** to Codecov when `CODECOV_TOKEN` is present. Without the token the
  upload step is skipped; the thresholds are still enforced locally by Vitest, so coverage remains a
  hard gate either way.
- **`secrets-scan` scans history**, not just the diff. secretlint already blocked the commit locally
  (see [security.md](./security.md)); gitleaks is the independent second net.

---

## `release.yml`

Runs `pnpm release` (semantic-release) on every push to `main` and `develop`, after `ci.yml` has
passed on that branch.

What it does: reads the commits since the last tag, decides the next version, generates release
notes, writes `CHANGELOG.md`, creates the git tag and the GitHub release, and pushes
`CHANGELOG.md` + `package.json` back with a `chore(release): x.y.z [skip ci]` message.

- `main` → stable release, tag `vX.Y.Z`
- `develop` → prerelease on the `rc` channel, tag `vX.Y.Z-rc.N`

`CHANGELOG.md` is generated. Editing it by hand guarantees a conflict on the next release.

---

## `docker.yml`

A reusable workflow (`workflow_call`) — it has no trigger of its own and is invoked by `deploy.yml`.

- Builds the standalone Next.js image for `linux/amd64` and `linux/arm64` with Buildx.
- Pushes to **`ghcr.io/iuriishikov/vladimirshikov-site`**, tagged with the git SHA, the branch or
  release tag, and `latest` for stable releases.
- Generates an SBOM and a build provenance attestation, both attached to the image in GHCR.
- Builds with `SKIP_ENV_VALIDATION=1`: the image is environment-agnostic, and validation happens on
  the server at container start with the real values.

Authentication uses the workflow's `GITHUB_TOKEN` with `packages: write` — no personal access token
is stored anywhere.

---

## `deploy.yml`

| Trigger                          | Environment  | Approval          |
| -------------------------------- | ------------ | ----------------- |
| Push to `develop`                | `staging`    | None              |
| Tag `v*` or `release: published` | `production` | Reviewer required |

The job calls `docker.yml` to produce the image, then connects to the VPS over SSH and runs the
compose stack update. It polls `/api/health` and rolls back automatically if the new container does
not become healthy. The server-side detail is in [deployment.md](./deployment.md).

---

## `rollback.yml`

`workflow_dispatch` with three inputs — `environment` (`staging` or `production`), `image_tag` (a tag
or digest GHCR already holds), and an optional `reason` recorded in the run summary. It redeploys
that already-published image and never rebuilds, so what goes back out is byte-identical to what was
known to work. Use it when a deploy succeeded technically but the result is wrong.

---

## Security and quality workflows

> While the repository is **private**, the three GitHub-Advanced-Security-dependent jobs below skip
> instead of running — see [security.md](./security.md#static-analysis). They need no edit to come
> back: they turn themselves on the moment the repository is public or GHAS is enabled.

**`codeql.yml`** — CodeQL analysis for `javascript-typescript`, on pull requests, on pushes to the
long-lived branches, and weekly. The weekly run matters because new queries find old bugs.

**`dependency-review.yml`** — two jobs. `review` compares the dependency manifests before and after
a PR and fails on newly introduced advisories or disallowed licences (GHAS-dependent). `audit` runs
`pnpm audit --audit-level=high` on any repository and is intentionally not part of `ci-ok`, so a
fresh advisory against an untouched dependency raises an alert rather than blocking every merge.

**`scorecard.yml`** — OSSF Scorecard weekly, publishing results to the code-scanning dashboard. It
grades things this repository already does (branch protection, pinned actions, signed releases,
dependency update automation) and is the cheapest way to notice a regression in the posture itself.

**`lighthouse.yml`** — Lighthouse CI on each PR, using [`lighthouserc.json`](../lighthouserc.json).
It builds, starts the production server, and audits `/ru` and `/en` three times each on the desktop
preset. Budgets:

| Assertion                | Threshold |
| ------------------------ | --------- |
| Performance              | ≥ 0.90    |
| Accessibility            | = 1.00    |
| Best practices           | ≥ 0.95    |
| SEO                      | = 1.00    |
| First Contentful Paint   | ≤ 2000 ms |
| Largest Contentful Paint | ≤ 2500 ms |
| Cumulative Layout Shift  | ≤ 0.1     |
| Total Blocking Time      | ≤ 200 ms  |

Reports upload to temporary public storage; with `LHCI_GITHUB_APP_TOKEN` set they also appear as a
PR status.

---

## Repository hygiene workflows

**`pr-lint.yml`** — validates the PR title against the Conventional Commits type and scope lists,
and the head branch name against the `validate-branch-name` pattern. Because merges are squashes,
the title becomes the commit message and hence a changelog line.

**`labeler.yml`** — applies labels from [`.github/labeler.yml`](../.github/labeler.yml) based on the
paths a PR touches (`docs`, `ci`, `deps`, `e2e`, and the FSD layers). Labels drive nothing
automatically; they make the PR list readable.

**`stale.yml`** — marks inactive issues and PRs stale and closes them later. It keeps the backlog
honest on a single-maintainer project.

---

## Secrets and variables

Configured under **Settings → Secrets and variables → Actions**. Environment-scoped entries live
under the environment, not at repository level, so a staging credential can never deploy to
production.

### Secrets

| Name                    | Scope                   | Purpose                                                      | Required  |
| ----------------------- | ----------------------- | ------------------------------------------------------------ | --------- |
| `SSH_HOST`              | `staging`, `production` | VPS hostname or IP for that environment                      | Yes       |
| `SSH_PORT`              | `staging`, `production` | SSH port                                                     | Yes       |
| `SSH_USER`              | `staging`, `production` | Deploy user — a non-root account in the `docker` group       | Yes       |
| `SSH_PRIVATE_KEY`       | `staging`, `production` | Private key for that user, deploy-only, no passphrase        | Yes       |
| `SSH_KNOWN_HOSTS`       | `staging`, `production` | Pinned host key — prevents a man-in-the-middle on the deploy | Yes       |
| `ACME_EMAIL`            | `staging`, `production` | Let's Encrypt contact, rendered into the server's `.env`     | Yes       |
| `CODECOV_TOKEN`         | Repository              | Coverage upload from the `test` job                          | Optional  |
| `LHCI_GITHUB_APP_TOKEN` | Repository              | Lighthouse CI status checks on PRs                           | Optional  |
| `GITHUB_TOKEN`          | Provided by Actions     | GHCR push, releases, tags, PR comments                       | Automatic |

### Variables

| Name          | Scope                   | Example                      | Purpose                                                           |
| ------------- | ----------------------- | ---------------------------- | ----------------------------------------------------------------- |
| `DEPLOY_PATH` | `staging`, `production` | `~/vladimirshikov-site`      | The directory the rollout ships the compose stack into            |
| `SITE_URL`    | `staging`, `production` | `https://vladimirshikov.com` | The public origin the workflow links to and health-checks against |

`SITE_URL` is a **variable**, not a secret — a public URL by definition. It is a
deploy-time value: the environment's deployment URL, and the base of the post-deploy health check.
It is not baked into the image — the `Dockerfile` declares no build argument for it — so the
artefact stays environment-agnostic. The application's own canonical origin is `SITE_URL`, read at
runtime from the server's `.env` (see [deployment.md](./deployment.md#first-time-setup)).

Nothing behind a `NEXT_PUBLIC_` prefix may ever be a secret: those values are inlined into the client
bundle at build time and are visible to anyone.

---

## Running the same checks locally

CI runs nothing that you cannot run yourself:

```bash
pnpm validate       # format:check + lint + typecheck + test — the fast four
pnpm build          # what the build job does
pnpm e2e            # what the e2e job does (needs pnpm e2e:install once)
pnpm knip           # what the knip job does
pnpm test:coverage  # the coverage thresholds
```

The pre-push hook already runs the expensive local subset, so a red CI on a pushed branch usually
means an environment difference — a stale lockfile, or a browser you have not installed.

---

## Related

- [branching.md](./branching.md) — which branch triggers what
- [deployment.md](./deployment.md) — the server side of `deploy.yml` and `rollback.yml`
- [security.md](./security.md) — what CodeQL, gitleaks, Scorecard and dependency review each cover
- [testing.md](./testing.md) — what the `test` and `e2e` jobs actually assert
