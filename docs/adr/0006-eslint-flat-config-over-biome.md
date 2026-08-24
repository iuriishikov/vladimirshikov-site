# ADR 0006: Use ESLint flat config and Prettier, not Biome

- **Status**: Accepted
- **Date**: 2026-08-24
- **Related**: [ADR 0002](./0002-feature-sliced-design.md), [ADR 0005](./0005-typescript-6-over-7.md)

## Context

Biome is a compelling proposition: one Rust binary that lints and formats, near-instant on any
codebase this size, one configuration file instead of two, and no plugin resolution to reason about.
Against it stands ESLint — slower, heavier, and configured across
[`eslint.config.mjs`](../../eslint.config.mjs) and [`prettier.config.mjs`](../../prettier.config.mjs)
— but with an ecosystem nothing else matches.

The question is which capabilities this repository actually depends on. Two are load-bearing:

1. **Architectural enforcement.** The entire FSD model from
   [ADR 0002](./0002-feature-sliced-design.md) is a lint rule. `eslint-plugin-boundaries` is what
   makes `app > views > widgets > features > entities > shared` real rather than aspirational.
   Without it, the architecture reverts to a document nobody checks.
2. **Type-aware rules.** `typescript-eslint`'s `strictTypeChecked` set uses the type-checker to find
   floating promises, unsafe `any` flow and misused promise returns. These are correctness bugs, and
   no syntax-only linter can find them.

Neither has a Biome equivalent today. Biome's plugin story is early, and its type-aware rules are a
small, growing subset that does not yet include the ones relied on here.

Lint speed, meanwhile, is not a bottleneck: `pre-commit` lints only staged files, and CI runs `lint`
as its own cacheable job in parallel with the rest.

## Decision

We use **ESLint 10 with flat config**, `typescript-eslint` 8 for type-aware rules, and **Prettier
3.9** for formatting. Biome is not adopted.

The configuration is a single `eslint.config.mjs` composed of ordered blocks:

| Block                                                         | Purpose                                                                                                 |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `js.configs.recommended`                                      | Baseline correctness                                                                                    |
| `tseslint.configs.strictTypeChecked` + `stylisticTypeChecked` | Type-aware rules via `projectService: true`                                                             |
| `unicorn.configs.recommended`                                 | Modern-JavaScript rules, with the dogmatic ones switched off explicitly                                 |
| React / Next.js                                               | `react-hooks` (incl. `react-compiler`), `@next/next` core-web-vitals, `jsx-a11y` strict, TanStack Query |
| `import-x`                                                    | Cycles, duplicates, named-exports rule, restricted import patterns                                      |
| `boundaries`                                                  | One `boundaries/dependencies` rule: the FSD layer matrix plus the public-API narrowing                  |
| Overrides                                                     | Framework files that must default-export; tests; Playwright; Storybook; plain JS                        |
| `eslint-config-prettier`                                      | Last — turns formatting rules off so the two tools never disagree                                       |

Division of labour: **ESLint decides what the code may do; Prettier decides what it looks like.**
`eslint-config-prettier` sits at the end of the array to guarantee there is no overlap.

Two Prettier plugins do more than formatting:

- `@ianvs/prettier-plugin-sort-imports` groups imports in FSD layer order, so an upward import is
  visible in the diff before ESLint reports it.
- `prettier-plugin-tailwindcss` sorts class names canonically, making class-list diffs meaningful.

## Consequences

- **Positive**: The architecture is enforced mechanically. An FSD violation fails `pnpm lint`, fails
  `ci-ok`, and blocks the merge.
- **Positive**: Type-aware rules catch bugs that formatting-and-syntax linters structurally cannot.
- **Positive**: Access to plugins with no alternative anywhere: `jsx-a11y` in strict mode,
  `eslint-plugin-testing-library`, `eslint-plugin-playwright`, `eslint-plugin-storybook`,
  `@tanstack/eslint-plugin-query`, `@next/eslint-plugin-next`.
- **Positive**: Flat config is plain JavaScript. The layer matrix is _generated_ from one `LAYERS`
  array, so the layer order exists in exactly one place — impossible in a static JSON config.
- **Negative**: Slow by comparison. A full `pnpm lint` is seconds to tens of seconds where Biome
  would be near-instant.
- **Negative**: Two tools, two configs, and the `eslint-config-prettier` ordering rule to remember.
- **Negative**: A large `devDependencies` surface — roughly a dozen ESLint plugins, each an update to
  track. Renovate and `pnpm knip` keep that honest.
- **Neutral**: Couples the repository to typescript-eslint's release cadence, which is what pins
  TypeScript to 6.x ([ADR 0005](./0005-typescript-6-over-7.md)).

## Alternatives considered

### Biome for both linting and formatting

Rejected. It cannot express the FSD boundaries, and its type-aware rule set does not yet cover the
rules this project relies on. Adopting it would mean deleting the mechanism that enforces the
architecture — a large loss for a speed gain in a place that is not slow.

### Biome for formatting, ESLint for linting

Rejected. It removes the smaller of the two dependencies while keeping all of ESLint's cost, and it
would forfeit both Prettier plugins — the FSD import grouping and the Tailwind class sorting — which
are the parts of formatting that carry information here.

### `oxlint` alongside ESLint

Rejected for now. `oxlint` is genuinely fast and could run as a pre-filter, but a second linter means
two rule sets that can disagree and two places to silence a false positive. It becomes interesting
if lint time ever becomes a real constraint.

### ESLint legacy `.eslintrc` configuration

Rejected: flat config is the supported format in ESLint 10, and the legacy loader is on its way out.
Flat config is also the reason the boundary matrix can be computed rather than transcribed.

## Revisit when

- `eslint-plugin-boundaries` gains a Biome equivalent, or Biome ships a plugin API capable of
  expressing import-layer rules.
- Biome's type-aware rules reach parity with the `strictTypeChecked` set actually used here.
- Lint time becomes a measurable bottleneck in CI or on `pre-commit` — currently neither.
