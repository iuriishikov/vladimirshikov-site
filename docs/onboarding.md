# Onboarding

A first day, from an empty machine to a merged pull request. Work through it in order; each step
assumes the previous one succeeded.

---

## 1. Tooling

| Requirement | Version  | Check                    |
| ----------- | -------- | ------------------------ |
| Node.js     | 24       | `node -v`                |
| pnpm        | 11.22.0  | `pnpm -v`                |
| Git         | any 2.x  | `git --version`          |
| Docker      | optional | `docker compose version` |

```bash
nvm install && nvm use   # reads .nvmrc — fnm works too
corepack enable          # pins pnpm to the packageManager field in package.json
```

Do not `npm i -g pnpm`. Corepack guarantees everyone runs the same pnpm, which is what keeps
`pnpm-lock.yaml` stable.

Docker is only needed if you want to reproduce the production image locally.

---

## 2. Clone and install

```bash
git clone git@github.com:iuriishikov/vladimirshikov-site.git
cd vladimirshikov-site
make bootstrap
```

`make bootstrap` runs [`scripts/bootstrap.sh`](../scripts/bootstrap.sh), which checks your Node
version against `.nvmrc`, activates the exact pnpm through corepack, installs from the frozen
lockfile, creates `.env.local` from `.env.example` if it is missing, and installs the Playwright
browser. It is safe to re-run, and it never overwrites an existing `.env.local`. Set
`SKIP_PLAYWRIGHT=1` to skip the browser download for now.

By hand, if you prefer:

```bash
pnpm install
cp .env.example .env.local
```

Either way, `pnpm install` also installs the husky hooks via the `prepare` script. Confirm:

```bash
ls .husky   # pre-commit, commit-msg, pre-push
```

If the install refuses a package because it is too new, that is `minimumReleaseAge` doing its job —
see [security.md](./security.md).

---

## 3. Run it

```bash
pnpm dev
```

- `http://localhost:3000` redirects to `/ru`
- `/en` and `/en/about` are the English routes
- `curl -fsS http://localhost:3000/api/health | jq` returns `status`, `version`, `uptime`,
  `timestamp`

Then check the other surfaces:

```bash
pnpm storybook      # component workshop on :6006
pnpm e2e:install    # once — installs Chromium and its OS dependencies
pnpm e2e            # the end-to-end suite
```

For the non-Chromium Playwright projects: `pnpm exec playwright install firefox webkit`.

---

## 4. Prove the gates work

```bash
pnpm validate
```

That is `format:check` → `lint` → `typecheck` → `test`, exactly what CI's `ci-ok` depends on. It
must be green on a fresh clone. If it is not, stop and fix that before writing code — you have found
a genuine problem or a tooling mismatch, and either way it will not get easier later.

---

## 5. Read three documents

In this order, roughly 25 minutes:

1. [architecture.md](./architecture.md) — the FSD layers and the one-way import rule. Everything you
   add to `src/` depends on getting the layer right.
2. [conventions.md](./conventions.md) — commit grammar, scopes, naming, the named-exports rule.
3. [branching.md](./branching.md) — where your branch belongs and how it reaches production.

Skim [docs/adr/](./adr/) for the reasoning behind anything that looks unusual. The answer to "why
not X?" is usually there, with X named explicitly.

---

## 6. Set up your editor

VS Code will offer the workspace recommendations from
[`.vscode/extensions.json`](../.vscode/extensions.json) — accept them. The important ones are ESLint,
Prettier and Tailwind CSS IntelliSense.

Then switch TypeScript to the workspace version: **Cmd/Ctrl+Shift+P → TypeScript: Select TypeScript
Version → Use Workspace Version**. Without it your editor type-checks with a different compiler from
`pnpm typecheck`, and you will chase phantom errors.

[`.vscode/launch.json`](../.vscode/launch.json) has debug configurations for the Next.js server, the
browser, and Vitest on the current file.

---

## 7. Your first change

```bash
git switch develop
git pull --ff-only
git switch -c docs/onboarding-notes
```

Pick something small and real — a typo, a missing test, a clearer error message. The goal of the
first PR is to exercise the pipeline, not to impress anyone.

```bash
# ... make the change ...
pnpm validate
git add -A
pnpm commit          # guided Conventional Commit prompt
git push -u origin docs/onboarding-notes
```

You will hit the hooks along the way. Each one is doing something specific:

| Hook         | What it runs                                                          | Why                                         |
| ------------ | --------------------------------------------------------------------- | ------------------------------------------- |
| `pre-commit` | ESLint `--fix` + Prettier on staged files, `tsc --noEmit`, secretlint | Keeps the commit clean and secret-free      |
| `commit-msg` | commitlint                                                            | The message becomes a changelog entry       |
| `pre-push`   | branch-name check, then `pnpm typecheck` and `pnpm test`              | Fails in seconds locally, not minutes in CI |

Open the PR **into `develop`** with a Conventional Commit title — squash-merge means the title
becomes the commit message. Wait for `ci-ok`. When it is green and reviewed, squash-merge.

Your change then flows automatically: an `rc` prerelease, an image in GHCR, a deploy to staging. See
[ci-cd.md](./ci-cd.md).

---

## 8. Know where to look when something breaks

| Situation                                  | Go to                                                               |
| ------------------------------------------ | ------------------------------------------------------------------- |
| ESLint says a layer may not import another | [architecture.md](./architecture.md) — you picked the wrong layer   |
| commitlint rejects your message            | [conventions.md](./conventions.md) — check the type and scope lists |
| A CI job is red                            | [ci-cd.md](./ci-cd.md) — what each job asserts                      |
| Coverage dropped below the threshold       | [testing.md](./testing.md) — and do not lower the threshold         |
| The site is down or a deploy failed        | [deployment.md](./deployment.md)                                    |
| You found a vulnerability                  | [SECURITY.md](../SECURITY.md) — do not open a public issue          |
| You want to know why something is so       | [docs/adr/](./adr/)                                                 |

---

## First-day checklist

- [ ] Node 24 and pnpm 11.22.0 via corepack
- [ ] Repository cloned, `pnpm install` clean
- [ ] `.env.local` created from `.env.example`
- [ ] `pnpm dev` serves `/ru`, `/en` and `/api/health`
- [ ] `pnpm storybook` opens
- [ ] `pnpm e2e` passes after `pnpm e2e:install`
- [ ] `pnpm validate` is green
- [ ] Husky hooks present in `.husky/`
- [ ] Editor extensions installed, workspace TypeScript selected
- [ ] architecture.md, conventions.md and branching.md read
- [ ] One small PR opened, `ci-ok` green, squash-merged
