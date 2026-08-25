# ADR 0005: Pin TypeScript to 6.0.3, not 7.x

- **Status**: Accepted
- **Date**: 2026-08-24
- **Related**: [ADR 0006](./0006-eslint-flat-config-over-biome.md)

## Context

TypeScript 7 — the native (Go) port of the compiler — is available and is dramatically faster than
the JavaScript implementation. On a project this size the difference in `tsc --noEmit` is seconds
rather than minutes, so speed alone is not the deciding factor. The temptation is simply that newer
looks better.

The blocker is the lint stack. `typescript-eslint` 8 declares a peer range on TypeScript of
**`<6.1.0`**. Its type-aware rules do not merely read `.d.ts` files; they drive the compiler's own
program and type-checker APIs, which the native port reimplements. Until typescript-eslint ships
support for that API surface, installing TypeScript 7 means one of two outcomes:

1. A peer-dependency conflict that is only a warning here (`strictPeerDependencies: false`), followed
   by type-aware rules failing at runtime in a way that is hard to diagnose; or
2. Disabling `strictTypeChecked` and `stylisticTypeChecked` altogether.

Option 2 is unacceptable. The type-aware rules are the ones that carry real weight in this
repository — `no-floating-promises`, `no-misused-promises`, `no-unsafe-*` — and they cannot be
replicated by syntactic linting. Trading them for a faster `tsc` would be trading correctness for
convenience.

## Decision

We pin TypeScript to **exactly `6.0.3`** — an exact version in `devDependencies`, not a caret range,
so a routine update cannot cross the 6.1 boundary and silently break the peer contract.

Consequences for tooling:

- `typescript-eslint` 8 keeps its full `strictTypeChecked` + `stylisticTypeChecked` configuration,
  using `projectService: true` for typed linting without hand-maintained `project` globs.
- `tsconfig.json` runs with `strict` plus `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`,
  `noImplicitOverride`, `noImplicitReturns`, `noFallthroughCasesInSwitch`, `noUnusedLocals` and
  `noUnusedParameters`.
- Editors must be told to use the workspace TypeScript, not their bundled copy —
  [`.vscode/settings.json`](../../.vscode/settings.json) sets `typescript.tsdk`, and
  [onboarding.md](../onboarding.md) makes selecting it a checklist item.

## Consequences

- **Positive**: Type-aware linting keeps working, which is where most of the automated correctness
  guarantee lives.
- **Positive**: An exact pin makes the constraint visible. A Renovate PR bumping to 7.x will fail
  `pnpm lint`, and this ADR explains why before anyone starts debugging.
- **Negative**: We forgo a large compiler speed-up. On this codebase that is seconds per run — real,
  but not limiting.
- **Negative**: TypeScript 7-only language features and diagnostics are unavailable.
- **Neutral**: This is a temporary constraint with a clear exit condition, not a position on the
  native port. The port is the right direction; the lint ecosystem simply has not arrived yet.

## Alternatives considered

### TypeScript 7 with type-aware linting disabled

Rejected. It trades the strongest half of the lint configuration for compile speed that is not a
bottleneck. `no-floating-promises` alone catches a class of bug that no syntactic rule can see.

### TypeScript 7 with Biome for linting

Rejected on the same grounds, and for the reasons in
[ADR 0006](./0006-eslint-flat-config-over-biome.md): Biome's type-aware rules are not yet comparable,
and `eslint-plugin-boundaries` — which enforces the entire FSD architecture — has no Biome
equivalent. Losing the architectural enforcement to gain compile speed inverts the priorities of this
repository.

### A caret range (`^6.0.3`)

Rejected. A caret allows `6.1.0`, which is outside typescript-eslint's declared peer range. With
`strictPeerDependencies: false` that resolves quietly and breaks loudly later. An exact pin turns a
subtle failure into an obvious one.

### Run both — TypeScript 7 for `tsc`, TypeScript 6 for ESLint

Rejected as a maintenance trap: two compilers in one `node_modules`, two sources of type errors that
can legitimately disagree, and a confusing story for editors. The complexity is far larger than the
saving.

## Revisit when

**`typescript-eslint` publishes a release whose peer range admits TypeScript 7 with the native
compiler.** At that point:

1. Bump `typescript-eslint` and `typescript` together in one PR, scoped `build(deps)`.
2. Run `pnpm validate` and confirm the type-aware rules still report — deliberately introduce a
   floating promise to verify, rather than trusting a green run.
3. Supersede this ADR with a new one recording the outcome.

Watch [typescript-eslint/typescript-eslint](https://github.com/typescript-eslint/typescript-eslint)
for the announcement.
