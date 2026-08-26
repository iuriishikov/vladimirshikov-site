# ADR 0009: Use next-intl for internationalisation

- **Status**: Accepted; the locale set and the default locale are amended by
  [ADR 0010](./0010-editions-bounded-by-the-typeface.md)
- **Date**: 2026-08-24
- **Related**: [ADR 0003](./0003-nextjs-app-router-and-rsc.md), [ADR 0002](./0002-feature-sliced-design.md)

> **Amended.** The choice of next-intl, `localePrefix: 'always'` and everything below about routing,
> plural rules and the request pipeline still stands. Two statements no longer do: the site publishes
> forty locales rather than two, and English is the default rather than Russian. See
> [ADR 0010](./0010-editions-bounded-by-the-typeface.md).

## Context

The site ships in Russian and English from the first commit. Russian is the default and the primary
audience; English exists so the site is readable by people who do not read Russian.

That has consequences beyond swapping strings:

- **URLs must be localised and stable.** `/ru/about` and `/en/about` are distinct, indexable pages
  with `hreflang` links to each other. A locale held in a cookie or in client state is invisible to a
  crawler and cannot be shared as a link.
- **Translation must work in Server Components.** Most of this site renders on the server
  ([ADR 0003](./0003-nextjs-app-router-and-rsc.md)). A library that only provides a React context
  hook would force client boundaries onto otherwise static pages, which is the exact cost the App
  Router was chosen to avoid.
- **Russian needs real plural rules.** Russian has `one` / `few` / `many` / `other` categories that a
  count-based ternary cannot express. ICU MessageFormat handles this; ad-hoc interpolation does not.
- **Dates and numbers must be locale-correct** in metadata and content alike.
- **Metadata is per locale.** Title, description, Open Graph tags, `sitemap.xml` entries and the
  canonical URL all vary by locale and are generated on the server.

Next.js 16's App Router provides no built-in i18n routing — the `i18n` config of the Pages Router
does not exist here. Something has to own middleware-based locale detection, the `[locale]` segment,
and locale-aware navigation helpers.

## Decision

We use **next-intl 4.13.7**, configured with:

- **Locales**: `ru` (default) and `en`.
- **`localePrefix: 'always'`** — every URL carries its locale. `/` redirects to `/ru`; there is no
  unprefixed canonical variant, so there is exactly one URL per page per locale and nothing for a
  crawler to treat as duplicate content.
- **The plugin wired in `next.config.ts`** via `createNextIntlPlugin('./src/shared/i18n/request.ts')`.
- **Configuration in the `shared` layer** — `src/shared/i18n/` holds the request configuration,
  routing definition and navigation helpers, and every layer above may import it. That is exactly
  what `shared` is for under [ADR 0002](./0002-feature-sliced-design.md).
- **`src/proxy.ts` handles locale routing**, alongside the per-request CSP nonce. (`proxy.ts` is
  Next.js 16's name for what earlier versions called `middleware.ts`.)
- **Messages are ICU MessageFormat**, so plurals and interpolation are declarative.
- **Validation messages are translation keys**, resolved at render time — Zod schemas carry keys,
  not English sentences, so a validation error is localised like any other string.

## Consequences

- **Positive**: Translation works in Server Components without a client boundary. A static page
  ships no i18n JavaScript at all.
- **Positive**: Locale-aware `Link` and router helpers are typed, and combine with Next.js
  `typedRoutes` so a wrong locale path is a compile error rather than a 404 in production.
- **Positive**: ICU plural rules are correct for Russian without special-case code.
- **Positive**: `localePrefix: 'always'` makes SEO unambiguous — one URL per page per locale, clean
  `hreflang`, and a sitemap that is a straightforward product of routes and locales.
- **Positive**: Locale detection, `Accept-Language` negotiation and the redirect from `/` are the
  library's problem, not hand-written middleware.
- **Negative**: Every internal link and route helper must go through next-intl's navigation exports.
  Using the bare `next/link` silently drops the locale, and the mistake is easy to make and easy to
  miss in review.
- **Negative**: The library tracks Next.js closely, so a Next.js major typically requires a
  coordinated next-intl upgrade. It is on the critical path for framework updates.
- **Negative**: `/` redirecting to `/ru` costs one extra hop for a first-time visitor. The
  alternative — an unprefixed default locale — costs canonical-URL clarity, which is worse.
- **Neutral**: Message files grow with the site. They are flat JSON per locale today; splitting them
  per namespace is a mechanical change if that becomes unwieldy.

## Alternatives considered

### `react-i18next` / `i18next`

The most widely used option, with a large plugin ecosystem. Rejected because it is
client-context-first: using it in the App Router means either a client provider high in the tree —
defeating Server Components — or a parallel server-side setup that duplicates configuration. It also
provides no routing, so locale-prefixed URLs, detection and redirects would all be hand-written
middleware.

### Paraglide JS (inlang)

Genuinely interesting: compiles messages into tree-shakeable functions, so unused translations do not
ship, with excellent type safety. Rejected because it solves the message half well and the routing
half thinly — Next.js App Router locale routing is still largely your problem — and its ecosystem is
much smaller for something on the critical path of every page render.

### `next-i18n-router` plus a message library

Composing a routing library with a translation library. Rejected as two dependencies with an
integration seam to maintain, in exchange for flexibility that is not needed for two locales. next-intl
covers both halves with one configuration.

### Hand-rolled: a `[locale]` segment and JSON message maps

Genuinely tempting at two locales and a few dozen strings. Rejected on the parts that are easy to
underestimate: `Accept-Language` negotiation, ICU plural categories for Russian, locale-aware date and
number formatting, `hreflang` generation, and keeping `Link` locale-aware everywhere. That is a small
library — one that would then need tests, and would be worse than an existing one.

### English-only, with translation deferred

Rejected. Retrofitting i18n means touching every string, every route and every metadata call at once,
and there is no cheap moment to do it. Building bilingual from the first commit costs a `[locale]`
segment and a message file.

## Revisit when

- A third locale arrives with materially different needs — right-to-left layout, or a locale-specific
  content structure rather than translated equivalents of the same pages.
- Message bundle size becomes measurable in the client payload, which is the point at which
  Paraglide's compile-and-tree-shake model starts to pay.
- A Next.js major outpaces next-intl badly enough to block a framework upgrade.
