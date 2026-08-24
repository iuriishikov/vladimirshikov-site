# Contributing

Thanks for taking the time. This is a personal site, so the bar is not bureaucracy — it is that the
repository stays in a state where the next change is easy. Everything below is either automated or
short.

If you are setting up for the first time, [docs/onboarding.md](./docs/onboarding.md) is the
step-by-step version of this page.

---

## Setup

```bash
nvm use          # Node 24, from .nvmrc — fnm works too
corepack enable  # pins pnpm 11.22.0 from the packageManager field

git clone git@github.com:iuriishikov/vladimirshikov-site.git
cd vladimirshikov-site

make bootstrap   # or by hand: pnpm install && cp .env.example .env.local
pnpm dev
```

`http://localhost:3000` redirects to `/ru`.

Do not install pnpm globally — Corepack is what keeps `pnpm-lock.yaml` stable across machines. If the
install refuses a package for being too new, that is the `minimumReleaseAge` quarantine doing its
job; see [docs/security.md](./docs/security.md).

---

## Workflow

### 1. Branch off `develop`

```bash
git switch develop
git pull --ff-only
git switch -c feat/newsletter-form
```

Branch names must match:

```text
^(main|develop)$|^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert|hotfix|release)/[a-z0-9._-]+$
```

Branch off `main` only for a `hotfix/*` — see [docs/branching.md](./docs/branching.md).

### 2. Write the change

Before adding a file to `src/`, know which Feature-Sliced Design layer it belongs to.
[docs/architecture.md](./docs/architecture.md) has a checklist for choosing, and the layer rule is
enforced by ESLint, so guessing wrong fails the lint rather than the review.

### 3. Commit

```bash
pnpm commit   # guided Conventional Commit prompt
```

Or by hand — `<type>(<scope>): <subject>`, with the type and scope from the closed lists in
[docs/conventions.md](./docs/conventions.md). The type decides the next version number, so it is not
cosmetic.

### 4. Validate and push

```bash
pnpm validate
git push -u origin feat/newsletter-form
```

### 5. Open a pull request into `develop`

- **The title must be a Conventional Commit.** Merges are squashes, so the title becomes the commit
  message and hence a changelog line. `pr-lint.yml` checks it.
- The description explains **why**. The diff already shows what.
- Keep it to one concern. A refactor bundled with a feature is harder to review and impossible to
  revert cleanly.

### 6. Merge

`ci-ok` must be green and the review approved. Squash-merge; delete the branch.

Your change then flows on its own: an `rc` prerelease from `develop`, a container image in GHCR, a
deploy to staging. Production happens when `develop` is promoted to `main`
([docs/branching.md](./docs/branching.md)).

---

## Local quality gates

Husky installs three hooks during `pnpm install`. They exist so that failures cost seconds locally
rather than minutes in CI.

### `pre-commit` — fast, staged files only

Runs `lint-staged` ([`lint-staged.config.mjs`](./lint-staged.config.mjs)):

| Files                                      | Runs                                                     |
| ------------------------------------------ | -------------------------------------------------------- |
| `*.{ts,tsx,mts,cts}`, `*.{js,mjs,cjs}`     | `eslint --fix --max-warnings=0`, then `prettier --write` |
| `*.{json,jsonc,json5,md,mdx,yml,yaml,css}` | `prettier --write`                                       |
| `*.{ts,tsx}` (if any changed)              | `tsc --noEmit` over the whole project                    |
| Everything staged                          | `secretlint`                                             |

The typecheck is project-wide rather than per-file on purpose: a type error in one file is usually a
type error in several.

The secretlint pass covers **every** staged file, not just source — that is how a credential pasted
into a config or a markdown file gets caught.

### `commit-msg` — the message

Runs `commitlint` against [`commitlint.config.mjs`](./commitlint.config.mjs). A rejected message is
usually an unlisted type or scope, or a subject in the wrong mood — `add`, not `added`.

### `pre-push` — the expensive checks

Validates the branch name, then runs `pnpm typecheck` and `pnpm test` — the slow half of
`pnpm validate`. `format:check` and `lint` are left out on purpose: pre-commit has already run
Prettier and ESLint `--fix` over everything you staged, and repeating them on every push costs more
than it catches.

It is a subset, so it is not a guarantee. A project-wide lint error in a file you never staged — an
FSD boundary violation, an unformatted file from a merge — still fails CI. Run `pnpm validate`
yourself before opening the PR; that is the full `ci-ok` set.

### If a hook is in your way

Fix the cause. `--no-verify` is not a workflow: CI runs the same checks and will simply fail later,
after you have moved on. The one legitimate use is a genuine tooling bug — in which case say so in
the PR.

---

## Definition of done

A change is done when all of these are true:

- [ ] It does what the PR description says, and nothing else.
- [ ] It sits in the right FSD layer, and imports only downwards.
- [ ] Anything reachable from outside its slice is exported from that slice's `index.ts`.
- [ ] New behaviour has a unit test; a bug fix has a test that fails without the fix.
- [ ] A new or changed component has a Storybook story covering its non-trivial states.
- [ ] Coverage has not dropped below the thresholds in `vitest.config.ts`.
- [ ] It works with a keyboard, and the a11y addon and axe report no violations.
- [ ] Both `ru` and `en` render correctly; no hard-coded user-facing strings.
- [ ] `pnpm validate` is green locally, and `ci-ok` is green on the PR.
- [ ] User-facing documentation is updated in the same PR — including an ADR if a decision changed.
- [ ] `CHANGELOG.md` and `pnpm-lock.yaml` were not hand-edited.

---

## Review expectations

**As the author:**

- Open the PR only once CI is green. Reviewing a red PR wastes both people's time.
- Keep it small. Under ~400 changed lines gets a real review; much beyond that gets a skim.
- Explain the _why_ in the description, and point out the parts you are unsure about — that is where
  review is most valuable.
- Reply to every comment. "Done" is a reply; silence is not.
- Push fixes as new commits during review rather than force-pushing; the squash removes them from
  history anyway.

**As the reviewer:**

- Review within a working day, or say when you can.
- Trust the automation. Formatting, style and layer violations are already enforced — comment on
  design, naming, edge cases, and whether the tests would actually fail if the code were wrong.
- Distinguish blocking from optional. Prefix the latter with "nit:" so the author can judge.
- Ask about anything you do not understand. A confusing diff is a finding, not a personal shortcoming.
- Approve when it is better than what is on `develop`, not when it is perfect.

---

## Reporting problems

- **Bugs and ideas** — open a GitHub issue with steps to reproduce, the expected result and the
  actual one.
- **Security vulnerabilities** — do **not** open a public issue. Follow [SECURITY.md](./SECURITY.md).
- **Conduct** — see [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md).
