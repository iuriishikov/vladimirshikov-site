# CLAUDE.md

Instructions for AI coding agents working in this repository. Follow them exactly.

## Architecture — Feature-Sliced Design

Layers, most abstract first: `app > views > widgets > features > entities > shared`.

- Import only from layers **strictly below** the current one. Never sideways, never upwards.
- Nothing imports from `@/app` — it is the composition root.
- Import other slices only through their public API: `@/features/contact-form`, never
  `@/features/contact-form/ui/contact-form`. `shared` is the exception; deep-import it.
- Add a symbol to a slice's `index.ts` only when something outside the slice needs it. Never
  `export *`.
- The FSD "pages" layer is `src/views` because Next.js owns `src/app`. Files under `src/app` are thin
  wrappers that render a slice from `src/views`.
- These rules are enforced by `eslint-plugin-boundaries`. If lint reports a violation, move the code
  to the correct layer or invert the dependency. Never add `eslint-disable`.

Read [docs/architecture.md](./docs/architecture.md) before adding any file to `src/`.

## Code rules

- Named exports only. Default exports are allowed solely in `src/app/**`, `src/proxy.ts`,
  `src/instrumentation.ts`, `src/shared/i18n/request.ts`, `*.stories.tsx`, `*.config.*`,
  `.storybook/**` and `e2e/**`.
- File and directory names are kebab-case.
- Read configuration through `@/shared/config/env` (validated, server-side) or
  `@/shared/config/runtime` (`isDevelopment`, safe in the browser and the Edge proxy). Never touch
  `process.env` or `import.meta.env` anywhere else — ESLint rejects it.
- `interface` for object shapes, `type` for unions and mapped types.
- `'use client'` goes on the interactive leaf, never on a layout.
- No user-facing string is hard-coded — every one goes through next-intl, in both `ru` and `en`.
- Colocate tests as `*.test.tsx` next to the file they test.

## Commits and branches

- Conventional Commits. Types: `feat fix perf refactor docs test build ci chore style revert`.
- Scopes — FSD layers: `app views widgets features entities shared`; cross-cutting:
  `i18n seo a11y ui config deps ci docker docs test e2e release security`.
- Branch names: `<type>/<kebab-case>`, off `develop`. Off `main` only for `hotfix/*`.
- Merges are squashes, so the PR title must be a valid Conventional Commit.
- Never run `git commit`, `git push` or `git checkout` unless explicitly asked.

## Before claiming a task is done

Run `pnpm validate` — that is `format:check` → `lint` → `typecheck` → `test` — and pass it. Never
report success on an unverified change. Run `pnpm build` too when the change touches routing, config
or the build.

## Never edit by hand

- `CHANGELOG.md` and the `version` in `package.json` — semantic-release owns both.
- `pnpm-lock.yaml` — change it only through `pnpm` commands.
- `.next/`, `coverage/`, `playwright-report/`, `storybook-static/`, `reports/` — all generated.
- Never run `pnpm install` to add a dependency without being asked; a new dependency is a decision.

## Where to look

`docs/architecture.md` (layers) · `docs/conventions.md` (commits, naming) ·
`docs/branching.md` (branch model) · `docs/testing.md` (which test to write) ·
`docs/ci-cd.md` (pipelines) · `docs/deployment.md` (the server) · `docs/security.md` (hardening) ·
`docs/adr/` (why a decision was made — read before contradicting one).

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
