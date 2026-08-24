# Documentation

Reference material for working on **vladimirshikov-site**. Start with
[onboarding.md](./onboarding.md) if this is your first day; the rest is written to be read when you
need it, not front to back.

## Guides

| Document                             | Covers                                                                                            |
| ------------------------------------ | ------------------------------------------------------------------------------------------------- |
| [onboarding.md](./onboarding.md)     | First day: tooling, install, the checks, your first pull request                                  |
| [architecture.md](./architecture.md) | Feature-Sliced Design — layers, the import rule, segments, and a worked example of a new slice    |
| [conventions.md](./conventions.md)   | Commits, scopes, branch names, PR titles, code style, file naming, exports                        |
| [branching.md](./branching.md)       | `main` / `develop` / short-lived branches, protections, squash merges, release channels, hotfixes |
| [ci-cd.md](./ci-cd.md)               | Every workflow, its triggers, the `ci-ok` gate, and the secrets and variables table               |
| [deployment.md](./deployment.md)     | The VPS, the compose stack, deploys, health checks, rollback, logs                                |
| [testing.md](./testing.md)           | Vitest, Storybook, Playwright, axe and Lighthouse — what belongs where                            |
| [security.md](./security.md)         | Supply chain, secrets, static analysis, headers, container hardening                              |

## Decision records

[`adr/`](./adr/) holds the Architecture Decision Records — what was decided, why, and which
alternatives were rejected. Read one when a choice in this repository looks surprising; the answer to
"why not X?" is usually there with X named explicitly.

| ADR                                                             | Decision                                               |
| --------------------------------------------------------------- | ------------------------------------------------------ |
| [0000](./adr/0000-template.md)                                  | Template for new records                               |
| [0001](./adr/0001-record-architecture-decisions.md)             | Record architecture decisions                          |
| [0002](./adr/0002-feature-sliced-design.md)                     | Feature-Sliced Design, with `views` as the pages layer |
| [0003](./adr/0003-nextjs-app-router-and-rsc.md)                 | Next.js App Router with Server Components              |
| [0004](./adr/0004-pnpm-and-supply-chain-hardening.md)           | pnpm with supply-chain hardening                       |
| [0005](./adr/0005-typescript-6-over-7.md)                       | TypeScript pinned to 6.0.3, not 7.x                    |
| [0006](./adr/0006-eslint-flat-config-over-biome.md)             | ESLint flat config and Prettier, not Biome             |
| [0007](./adr/0007-docker-ghcr-ssh-deployment.md)                | Docker image from GHCR to a single VPS over SSH        |
| [0008](./adr/0008-conventional-commits-and-semantic-release.md) | Conventional Commits drive versions and changelogs     |
| [0009](./adr/0009-next-intl-for-i18n.md)                        | next-intl for internationalisation                     |

Adding one: copy [`adr/0000-template.md`](./adr/0000-template.md), take the next number, and link it
from the table above. Accepted ADRs are immutable — a changed decision gets a new record that
supersedes the old one.

## Elsewhere in the repository

- [README.md](../README.md) — what this project is, the stack, quick start, scripts
- [CONTRIBUTING.md](../CONTRIBUTING.md) — the contribution workflow and the definition of done
- [SECURITY.md](../SECURITY.md) — reporting a vulnerability
- [CODE_OF_CONDUCT.md](../CODE_OF_CONDUCT.md) — Contributor Covenant 2.1
- [CLAUDE.md](../CLAUDE.md) — the same rules, condensed for AI coding agents
