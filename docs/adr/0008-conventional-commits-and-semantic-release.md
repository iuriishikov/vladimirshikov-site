# ADR 0008: Drive versions and changelogs from Conventional Commits

- **Status**: Accepted
- **Date**: 2026-08-24
- **Related**: [ADR 0007](./0007-docker-ghcr-ssh-deployment.md), [conventions.md](../conventions.md), [branching.md](../branching.md)

## Context

Deployments are keyed to versions: `docker.yml` tags images by release tag, and `deploy.yml` fires on
`v*` tags and published releases ([ADR 0007](./0007-docker-ghcr-ssh-deployment.md)). So the version
number is not decoration — it is the identifier used to answer "what is running?" and "what do I
roll back to?".

Manual versioning fails predictably on a single-maintainer, intermittently-worked project:

- The bump is forgotten, or made in the wrong PR, or made twice.
- `CHANGELOG.md` is written from memory at release time and is incomplete within two releases.
- The relationship between a version and the commits it contains is reconstructed by reading the
  diff.

The information needed to derive all of it — what changed and how significantly — already exists in
the commit history. It is simply not in a machine-readable shape by default.

## Decision

We adopt [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) as a machine-readable
history, and let **semantic-release** derive versions, tags, changelog and GitHub releases from it.

### Enforcement, at three points

| Point             | Tool                   | Catches                          |
| ----------------- | ---------------------- | -------------------------------- |
| `commit-msg` hook | commitlint             | A malformed message, locally     |
| PR title          | `pr-lint.yml`          | A malformed squash-merge subject |
| Authoring         | `pnpm commit` (cz-git) | Having to remember the grammar   |

[`commitlint.config.mjs`](../../commitlint.config.mjs) fixes the type list (`feat`, `fix`, `perf`,
`refactor`, `docs`, `test`, `build`, `ci`, `chore`, `style`, `revert`) and a closed scope list that
mirrors the FSD layers plus the cross-cutting concerns.

Because **merges are squashes**, the PR title becomes the commit on `develop` or `main` — which is
why it is validated with the same rules.

### Release rules

[`.releaserc.json`](../../.releaserc.json) maps types to version bumps, deliberately diverging from
the stock preset in two places:

- `docs` releases a patch **only** with the `readme` scope — a README fix is user-visible; internal
  documentation is not.
- `build` releases a patch **only** with the `deps` scope, so dependency updates are traceable to a
  version while build-system churn is not.

`refactor`, `perf` and `revert` are patches; `chore`, `style`, `test` and `ci` release nothing.

### Channels

`main` produces stable releases tagged `vX.Y.Z`. `develop` produces prereleases on the `rc` channel,
tagged `vX.Y.Z-rc.N`. Tag format is `v${version}`, which is what `deploy.yml` listens for.

### Generated artefacts

semantic-release writes `CHANGELOG.md`, creates the git tag and the GitHub release, and pushes
`CHANGELOG.md` + `package.json` back with `chore(release): x.y.z [skip ci]`. The package is
`private: true`, so nothing is published to a registry — the release _is_ the tag, the notes and the
matching container image.

**`CHANGELOG.md` is generated.** It is in `.prettierignore`, ignored by ESLint, and marked
`linguist-generated` in `.gitattributes`. Editing it by hand guarantees a conflict on the next
release.

## Consequences

- **Positive**: The version number is a fact derived from history, not a judgement call someone
  might forget.
- **Positive**: The changelog is complete by construction, and its sections come from the same
  config that decides the bump.
- **Positive**: `rc` prereleases from `develop` give staging a real, tagged, deployable version —
  the staging artefact is not a special case.
- **Positive**: History is queryable. `git log --grep '^feat(i18n)'` is a usable answer to "what has
  changed in i18n?".
- **Negative**: The commit grammar is friction, especially at first. `pnpm commit` removes most of
  it; the closed scope list removes the rest of the decision.
- **Negative**: A badly chosen type silently produces a wrong version — a `feat` labelled `chore`
  ships without a release. Review has to catch this, since no tool can.
- **Negative**: The release bot pushes to a protected branch, so its token must be allowed to bypass
  the pull-request requirement. That is a real, if narrow, exception to branch protection.
- **Neutral**: Semantic versioning on a website is partly ceremonial — there is no downstream
  consumer to signal breakage to. It is retained because it gives deploys and rollbacks a stable,
  ordered identifier, which is worth more than its semantic meaning here.

## Alternatives considered

### Manual versioning with a hand-written changelog

Rejected. It is the failure mode described in the context: forgotten bumps, an incomplete changelog,
and no reliable mapping from a version to its commits.

### Changesets

Rejected. Changesets is excellent for monorepos publishing several packages, where a human decides
per-package impact in a dedicated file. Here there is one private package and no consumers, so the
extra file per change is pure overhead — and it moves the decision away from the commit, which is
where the information already is.

### Date-based or SHA-based versioning (CalVer, `main-<sha>`)

Rejected. Simple and forgery-proof, but a bare SHA carries no ordering or significance, and CalVer
does not distinguish a typo fix from a rewrite. Since release notes are wanted anyway, and the notes
come from parsed commits, the parsing might as well produce the number too.

### `release-please`

A close alternative: same Conventional Commits input, but it maintains a standing "release PR" rather
than releasing on merge. Rejected because the extra PR step adds latency to the staging pipeline for
no benefit at this scale — with one maintainer there is nobody to coordinate a release window with.

## Revisit when

- The repository gains a second publishable artefact — a shared component library, for example — at
  which point Changesets becomes the better fit.
- Release-note quality degrades to the point that a human summary would be better than a generated
  one, which usually means squash-merge titles have stopped being descriptive.
