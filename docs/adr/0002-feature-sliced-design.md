# ADR 0002: Use Feature-Sliced Design, with the pages layer named `views`

- **Status**: Accepted
- **Date**: 2026-08-24
- **Related**: [ADR 0003](./0003-nextjs-app-router-and-rsc.md), [ADR 0006](./0006-eslint-flat-config-over-biome.md)

## Context

Next.js gives you a router and no opinion whatsoever about where the rest of the code goes. Left
alone, a project accumulates `components/`, `utils/`, `hooks/`, `lib/` and `helpers/` — directories
grouped by what a file _is_ rather than what it is _for_. That layout has a specific failure mode:
nothing tells you which module may depend on which, so within a year the import graph is a cycle and
every change has an unbounded blast radius.

The site is small today and expected to grow slowly and intermittently. The scarce resource is not
build time or bundle size; it is the ability to return after three months away and change one thing
without reading everything.

The requirement, then: a structure whose rules are **mechanically checkable**. A convention that
lives only in a document is a convention that has already been broken somewhere in the codebase.

## Decision

We use [Feature-Sliced Design](https://feature-sliced.design/) with six layers, most abstract first:

```text
app > views > widgets > features > entities > shared
```

A module may import only from layers strictly below its own. Within a layer, code is split into
slices; each slice exposes a public API through `index.ts`, and cross-slice deep imports are
forbidden.

**The FSD `pages` layer is named `views` here.** Next.js App Router owns `src/app`, and `src/pages`
is a reserved directory that would activate the legacy Pages Router — Next.js would attempt to route
from it. `views` sidesteps the collision without changing the model: `src/app` holds only Next.js
file-convention wrappers, and each wrapper renders a slice from `src/views`.

Enforcement is `eslint-plugin-boundaries` in [`eslint.config.mjs`](../../eslint.config.mjs):

- A single `boundaries/dependencies` rule with `default: 'disallow'`, so an unlisted combination is
  an error rather than a gap. Its allowed matrix is generated from one `LAYERS` array, so the layer
  order exists in exactly one place.
- Ordered policies inside that same rule, where the last match wins: the layer matrix first, then a
  narrowing that makes `views`, `widgets`, `features` and `entities` reachable only through their
  `index.ts`, then a re-permit for a module reaching the other segments of its own slice. `shared`
  is left out of the narrowing, because its segments are plain libraries and deep imports keep
  bundles small.
- `no-restricted-imports` — blocks any import of `@/app`, the composition root. Relative paths are
  deliberately not pattern-banned: `boundaries/dependencies` resolves imports to files, so it
  already catches a cross-slice reach however it is spelled.

The full working detail is in [architecture.md](../architecture.md).

## Consequences

- **Positive**: An architectural violation fails `pnpm lint`, which fails `ci-ok`, which blocks the
  merge. The rule cannot rot.
- **Positive**: The layer of a file tells you its dependency budget before you open it.
- **Positive**: Commit scopes mirror the layers, so `git log --grep 'features'` is a usable history
  of one layer.
- **Positive**: Prettier's import sorter groups imports in layer order, so an upward import is
  visible in the diff before ESLint reports it.
- **Negative**: Boilerplate. Every slice needs an `index.ts`, and small changes sometimes touch three
  files instead of one.
- **Negative**: FSD's vocabulary is unfamiliar, and the `entities` / `features` / `widgets`
  distinction takes a few days to internalise. The "choosing a layer" checklist in
  [architecture.md](../architecture.md) exists to shorten that.
- **Negative**: `views` is a local deviation from canonical FSD, so external FSD material needs
  mental translation.
- **Neutral**: The structure is heavier than a site of this size strictly requires. That is a
  deliberate bet that the cost is paid once, up front, while the alternative is paid repeatedly.

## Alternatives considered

### Flat, conventional Next.js layout (`components/`, `lib/`, `hooks/`)

Rejected. It is the lowest-friction option on day one and has no answer to "may this import that?".
There is no lint rule that can express the intent because there is no intent — grouping by file type
carries no dependency information. This is precisely the layout whose failure mode motivated the
decision.

### Atomic Design (atoms / molecules / organisms / templates / pages)

Rejected. It classifies components by visual complexity, which correlates poorly with dependency
direction: an "atom" may legitimately need domain state, and the atom/molecule boundary is a matter
of taste, so it is not enforceable. It also says nothing about non-component code — stores, schemas,
API clients — which is most of the interesting part. Its useful half (a primitives layer) survives
here as `shared/ui`.

### Layered by technical role (`api/`, `store/`, `ui/`, `domain/`) across the whole app

Rejected. Enforceable, but it optimises for the wrong axis: a change to one feature touches every
directory, and a feature cannot be deleted by deleting a folder. FSD applies exactly this split
_inside_ a slice, as segments, where it works well.

### Nx or a monorepo with package-level boundaries

Rejected as disproportionate. Package boundaries enforce the same rule more strongly, at the cost of
a build graph, package manifests and a release story for internal packages — real overhead for a
single-deployable personal site. `eslint-plugin-boundaries` achieves the same guarantee for the
price of one config block.

## Revisit when

- A second deployable appears (a CMS admin, a shared component library published for reuse) — then
  package-level boundaries start to earn their keep.
- Next.js stops reserving `src/pages`, which would allow the canonical FSD name. Cosmetic, and not
  worth a migration on its own.
