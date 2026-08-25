import { defineRouting } from 'next-intl/routing'

import { localeCodes } from './locales'

/**
 * Locale routing is `always`-prefixed: `/en/...`, `/ru/...`, `/kk/...` and the
 * rest are the only canonical URLs, and `/` redirects to a locale. A prefix-less
 * default locale would give the same page two URLs and split its SEO signal.
 *
 * English is the default. That is the fallback for a visitor whose browser asks
 * for a language this site does not serve, and it is the `x-default` a crawler
 * is pointed at. It is not a redirect for everyone: `localeDetection` stays on,
 * so a browser that asks for Russian still lands on `/ru`, and a browser asking
 * for any of the other thirty-eight editions lands on its own.
 *
 * The list itself, and why it stops where it does, is in `./locales`.
 */
export const routing = defineRouting({
  locales: localeCodes,
  defaultLocale: 'en',
  localePrefix: 'always',
  localeDetection: true,
  /*
   * next-intl otherwise stamps a `Link:` header of forty-one hreflang
   * alternates onto every response, including the PNG at
   * `/[locale]/opengraph-image`. The head already carries that set, built from
   * this catalogue in `shared/lib/seo`, and the two do not agree: the header
   * labels Serbian `sr` where the catalogue says `sr-Cyrl`, and it points
   * `x-default` at the locale-less `/about`, which is not a page but a redirect
   * to `/en/about` — and an hreflang alternate has to be a canonical URL that
   * does not redirect. Two annotation surfaces that disagree are worse than
   * either alone, so there is one, and it is the head.
   */
  alternateLinks: false,
})

export {
  LOCALE_CATALOGUE,
  localeCodes,
  localeHreflang,
  localeOpenGraph,
  localeLabels,
  localesByScript,
  PRIMARY_LOCALES,
  type Locale,
  type LocaleEntry,
  type PrimaryLocale,
} from './locales'
