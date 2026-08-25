# ADR 0003: Build on Next.js App Router with React Server Components

- **Status**: Accepted
- **Date**: 2026-08-24
- **Related**: [ADR 0002](./0002-feature-sliced-design.md), [ADR 0007](./0007-docker-ghcr-ssh-deployment.md), [ADR 0009](./0009-next-intl-for-i18n.md)

## Context

The site is content-led: a home page, an about page, and more prose over time, in two languages. The
demands are unglamorous and non-negotiable — fast first paint on a phone, correct metadata for
sharing and search, working localised URLs, and a small JavaScript payload. Interactivity is
confined to a handful of islands: a theme toggle, a locale switcher, a contact form.

That profile argues for rendering on the server by default and shipping JavaScript only where the
page genuinely reacts to the user.

Constraints: it must be self-hostable on a small VPS (see
[ADR 0007](./0007-docker-ghcr-ssh-deployment.md)), and it must not require a build-time content
pipeline that makes adding a paragraph a deployment engineering task.

## Decision

We use **Next.js 16 with the App Router** and React Server Components as the default.

Specifics recorded here because each is a decision in its own right:

- **`output: 'standalone'`** — `next build` emits a self-contained server bundle with only the traced
  dependencies. The Docker image copies that plus static assets, which keeps the image small and the
  runtime attack surface narrow.
- **Server Components by default.** `'use client'` goes on the leaf that needs interactivity, never
  on a layout. A client boundary high in the tree pulls everything beneath it into the browser
  bundle.
- **`typedRoutes: true`** — `href` values are checked at compile time. With two locale prefixes and
  localised paths, a broken internal link is otherwise found by a visitor, not by the compiler.
- **React Compiler enabled** (`reactCompiler: true`) — automatic memoisation, so component code is
  free of `useMemo` and `useCallback` noise. `react-hooks/react-compiler` is set to `error`, so code
  that breaks the compiler's assumptions fails lint rather than silently deoptimising.
- **Turbopack for `pnpm dev`**, the standard build for production.
- **Linting is not part of `next build`.** Next 16 dropped the built-in ESLint integration
  altogether, so lint is a dedicated, independently cacheable CI job (`pnpm lint`). Type errors, by
  contrast, still fail the build — `typescript.ignoreBuildErrors` stays `false` — and
  `pnpm typecheck` also runs as its own job, for a faster and isolated signal.
- **The `app` layer is composition only.** Files under `src/app` are thin wrappers that render slices
  from `src/views` — the FSD contract from [ADR 0002](./0002-feature-sliced-design.md).

## Consequences

- **Positive**: Pages that need no client JavaScript ship none. The Lighthouse budgets
  (performance ≥ 0.90, LCP ≤ 2500 ms) are achievable without ongoing effort.
- **Positive**: Metadata, `sitemap.xml`, `robots.txt` and `manifest.webmanifest` are file conventions
  with type-checked APIs rather than hand-maintained templates.
- **Positive**: Data fetching lives next to the component that renders it, with no client-side
  waterfall and no serialisation of secrets to the browser.
- **Positive**: Standalone output makes the container story trivial — one process, one port, no
  runtime `node_modules` install.
- **Negative**: The server/client boundary is a real cognitive cost. "Cannot pass a function to a
  Client Component" is a rite of passage, and the fix is always to move the boundary, not to work
  around it.
- **Negative**: Next.js majors move quickly, and the App Router's ecosystem support (testing,
  Storybook, i18n) is a step behind the framework itself. `@storybook/nextjs-vite` and next-intl are
  both current-generation packages precisely because of this.
- **Negative**: The framework is deeply woven in. Migrating away would be a rewrite, not a
  refactor — which is exactly why the FSD layers keep application logic out of `src/app`.
- **Neutral**: React Compiler is doing real work in the background. When a component behaves
  unexpectedly after a refactor, the compiler rules are worth checking early.

## Alternatives considered

### Astro

The strongest alternative for a content site: less JavaScript by default, an excellent content
collection story, and islands that map neatly onto this site's interactivity profile. Rejected
because the React component ecosystem in use here (radix-ui, react-hook-form, TanStack Query,
next-themes, sonner) is a first-class citizen in Next.js and a bolt-on in Astro, and because the
long-term intent is a site that can grow application-shaped features, not only pages.

### Next.js Pages Router

Rejected. It is the previous generation: no Server Components, no streaming, weaker metadata
handling, and `getServerSideProps` as the only server-side seam. Choosing it in 2026 would mean
starting on a deprecation path.

### Vite + React Router (SPA) or TanStack Start

Rejected for an SPA: a client-rendered personal site is the wrong default for SEO and first paint,
and it would need a separate solution for metadata and prerendering. TanStack Start is promising and
close in shape, but younger, with a smaller deployment and i18n ecosystem — not a bet worth making
for infrastructure meant to sit untouched for months.

### A static site generator (Hugo, Eleventy, Jekyll)

Rejected. Genuinely faster to serve and far simpler to host, but the contact form, theme toggle and
locale switcher would each become bespoke JavaScript bolted onto generated HTML, and the component
model that makes the design system maintainable would be gone.

## Revisit when

- A Next.js major introduces a migration cost comparable to a framework change — at which point
  Astro and TanStack Start deserve a fresh comparison.
- The site settles permanently into pure content with no interactive surface, which would make a
  static generator the honest choice.
