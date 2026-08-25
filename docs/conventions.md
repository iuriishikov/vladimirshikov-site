# Conventions

Everything on this page is machine-checked. If a rule below is not enforced by commitlint, ESLint,
Prettier or CI, it is not a rule — it is a preference, and it is not written here.

---

## Commits

[Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/), enforced by commitlint on
`commit-msg` and re-checked on PR titles in CI.

```text
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

Use `pnpm commit` for a guided prompt (cz-git) rather than remembering the grammar.

### Types and their release effect

The commit type decides the next version number. semantic-release reads it directly from
[`.releaserc.json`](../.releaserc.json) — there is no manual version bump anywhere in this repo.

| Type       | Use for                              | Release effect                                       |
| ---------- | ------------------------------------ | ---------------------------------------------------- |
| `feat`     | A user-visible capability            | **minor** — `1.2.0` → `1.3.0`                        |
| `fix`      | A user-visible defect repaired       | **patch** — `1.2.0` → `1.2.1`                        |
| `perf`     | Faster or lighter, same behaviour    | **patch**                                            |
| `refactor` | Internal change, identical behaviour | **patch**                                            |
| `revert`   | Reverts a previous commit            | **patch**                                            |
| `build`    | Build system, bundler, dependencies  | **patch** when the scope is `deps`, otherwise none   |
| `docs`     | Documentation only                   | **patch** when the scope is `readme`, otherwise none |
| `test`     | Tests only                           | none                                                 |
| `ci`       | Pipelines and automation             | none                                                 |
| `chore`    | Housekeeping that fits nowhere else  | none                                                 |
| `style`    | Formatting only, no code change      | none                                                 |

A `BREAKING CHANGE:` footer (or `BREAKING:` / `BREAKING CHANGES:`) triggers a **major** release
regardless of type. On a personal site this is rare and deserves a paragraph explaining what broke.

Release-note sections come from the same config: `Features`, `Bug Fixes`, `Performance`,
`Refactoring`, `Reverts`, `Documentation`, `Build & Dependencies`. `ci`, `test`, `chore` and `style`
are hidden from the notes but still appear in the git history.

### Scopes

A scope is required in practice (`scope-empty` warns when it is missing) and must come from this
list — commitlint rejects anything else:

| Group          | Scopes                                                             |
| -------------- | ------------------------------------------------------------------ |
| FSD layers     | `app` · `views` · `widgets` · `features` · `entities` · `shared`   |
| Cross-cutting  | `i18n` · `seo` · `a11y` · `ui` · `config` · `deps`                 |
| Infrastructure | `ci` · `docker` · `docs` · `test` · `e2e` · `release` · `security` |

The layer scopes intentionally mirror [architecture.md](./architecture.md): `git log --oneline
--grep 'features'` becomes a usable history of that layer.

### Subject line

- Imperative mood: `add`, not `added` or `adds`.
- No trailing full stop.
- Not Start Case, PascalCase or UPPER CASE.
- Header at most 100 characters; body lines at most 120.
- Blank line before the body and before the footer.

```text
feat(features): add newsletter subscription form
fix(i18n): fall back to ru when the Accept-Language header is absent
build(deps): bump next to 16.3.2
refactor(shared): extract the cn() helper from the button component

feat(shared): replace the toast API with sonner

BREAKING CHANGE: `useToast()` is gone. Import `toast` from `@/shared/ui/toast`.
```

---

## Branches

```text
^(main|develop)$|^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert|hotfix|release)/[a-z0-9._-]+$
```

That pattern lives under `validate-branch-name` in `package.json` and is checked both by the
pre-push hook and by `pr-lint.yml`. In short: `main`, `develop`, or `<type>/<kebab-case>`.

```text
feat/newsletter-form
fix/locale-switch-404
chore/bump-playwright
hotfix/csp-nonce-missing
```

Branch types are the commit types plus `hotfix` and `release`. Keep branches short-lived — one PR's
worth of work. The full model is in [branching.md](./branching.md).

---

## Pull requests

- **The PR title is a Conventional Commit.** Merges are squash-only, so the PR title _becomes_ the
  commit on `develop` or `main` — and therefore the changelog entry. `pr-lint.yml` validates it
  against the same type and scope lists as commitlint.
- **The description explains why**, and links the issue if one exists. What changed is visible in
  the diff; why it changed is not.
- **One concern per PR.** A refactor bundled with a feature makes both harder to review and
  impossible to revert cleanly.
- **`ci-ok` must be green.** It is the only required status check, and it aggregates every CI job —
  see [ci-cd.md](./ci-cd.md).

---

## Code style

Formatting is entirely Prettier's job ([`prettier.config.mjs`](../prettier.config.mjs)). Do not
argue with it; run `pnpm format`.

| Setting        | Value                                     |
| -------------- | ----------------------------------------- |
| Semicolons     | off                                       |
| Quotes         | single in TS/JS, double in JSX attributes |
| Trailing comma | `all`                                     |
| Print width    | 100                                       |
| Indentation    | 2 spaces                                  |
| Arrow parens   | always                                    |
| Line endings   | `lf` (also pinned by `.gitattributes`)    |

Two Prettier plugins do real architectural work:

- **`@ianvs/prettier-plugin-sort-imports`** groups imports in FSD layer order — builtins, third
  party, then `@/app` → `@/views` → `@/widgets` → `@/features` → `@/entities` → `@/shared`, then
  relative, then CSS last. An import that reaches upwards therefore appears in the wrong group, and
  the diff shows it before ESLint has to.
- **`prettier-plugin-tailwindcss`** sorts Tailwind class names into canonical order, which makes
  class-list diffs meaningful.

### TypeScript rules worth knowing before your first PR

These come from [`eslint.config.mjs`](../eslint.config.mjs) and catch people out:

| Rule                                                        | What it means in practice                                              |
| ----------------------------------------------------------- | ---------------------------------------------------------------------- |
| `@typescript-eslint/consistent-type-definitions: interface` | `interface` for object shapes; `type` only for unions and mapped types |
| `@typescript-eslint/consistent-type-imports`                | Inline type imports: `import { type Foo, bar } from '...'`             |
| `no-restricted-globals: process`                            | Read config through `@/shared/config/env`, never `process.env`         |
| `no-restricted-syntax` on `import.meta.env`                 | Same reason — one validated source of configuration                    |
| `no-console`                                                | `console.warn` and `console.error` only                                |
| `@typescript-eslint/ban-ts-comment`                         | `@ts-expect-error` needs a description of at least 10 characters       |
| `import-x/no-cycle`                                         | Circular imports fail the lint, up to a depth of 6                     |
| `react-hooks/react-compiler`                                | Code that breaks the React Compiler's assumptions is an error          |

`tsconfig.json` runs with `strict` plus `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`,
`noImplicitReturns`, `noUnusedLocals` and `noUnusedParameters`. Turning one of them off is an
ADR-worthy decision, not a PR comment.

---

## File and directory naming

**kebab-case, always** — enforced by `unicorn/filename-case`, with dynamic route segments (`[slug]`,
`[...rest]`) exempted.

| Kind             | Example                                                          |
| ---------------- | ---------------------------------------------------------------- |
| Component        | `src/shared/ui/theme-toggle.tsx`                                 |
| Hook             | `src/features/contact-form/model/use-contact-form.ts`            |
| Unit test        | `theme-toggle.test.tsx` — next to the subject                    |
| Story            | `theme-toggle.stories.tsx` — next to the subject                 |
| E2E spec         | `e2e/navigation.spec.ts`                                         |
| Slice public API | `src/features/contact-form/index.ts`                             |
| Next.js files    | `page.tsx`, `layout.tsx`, `route.ts` — the framework's names win |

The component _inside_ `theme-toggle.tsx` is still `ThemeToggle`. Only the filename is kebab-case;
that keeps the repository case-insensitive-filesystem safe, which `forceConsistentCasingInFileNames`
alone does not guarantee across platforms.

---

## Exports

**Named exports.** `import-x/no-default-export` is an error, because a default export can be
imported under any name, which makes it un-greppable and defeats safe renames.

```ts
export function ThemeToggle() {} // ✅
export default function ThemeToggle() {} // ❌ outside the exceptions below
```

### Framework exceptions

Some files _must_ default-export to satisfy a framework contract. The rule is switched off for
exactly these paths, and nowhere else:

| Path                          | Why                                                                                           |
| ----------------------------- | --------------------------------------------------------------------------------------------- |
| `src/app/**/*.{ts,tsx}`       | Next.js resolves `page`, `layout`, `route`, `sitemap`, `robots`, `manifest` by default export |
| `src/proxy.ts`                | Next.js proxy (middleware) contract                                                           |
| `src/instrumentation.ts`      | Next.js instrumentation contract                                                              |
| `src/shared/i18n/request.ts`  | next-intl's plugin resolves the request config by default export                              |
| `**/*.stories.{ts,tsx}`       | Storybook CSF: the meta object is the default export                                          |
| `**/*.config.{ts,mts,mjs,js}` | Config files are consumed by their tool's loader                                              |
| `.storybook/**/*.{ts,tsx}`    | Same                                                                                          |
| `e2e/**/*.ts`                 | Playwright config and fixtures                                                                |

`unicorn/filename-case` is relaxed for the same set, because Next.js dictates those names.

Within a slice, do not re-export with `export *`. List the symbols in `index.ts` — see the public
API rule in [architecture.md](./architecture.md).

---

## Related

- [architecture.md](./architecture.md) — the layers these scopes refer to
- [branching.md](./branching.md) — the branch model in full
- [ADR 0008](./adr/0008-conventional-commits-and-semantic-release.md) — why commits drive versions
