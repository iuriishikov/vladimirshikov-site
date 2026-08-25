// Metadata is only ever built during a server render, and this module reads
// server-only configuration. Importing it from a Client Component is a build
// error rather than a runtime leak.
import 'server-only'

import type { Metadata } from 'next'

import { env } from '../config/env'
import { siteConfig } from '../config/site'
import { localeHreflang, localeOpenGraph, routing, type Locale } from '../i18n/routing'

interface PageMetadataOptions {
  locale: Locale
  title: string
  description: string
  /** Locale-less path, e.g. `''` for the home page or `'/about'`. */
  path?: string
}

/** `https://example.com/en/about` */
function absoluteUrl(locale: Locale, path: string): string {
  return `${env.SITE_URL}/${locale}${path}`
}

/**
 * Builds the metadata for one page.
 *
 * Two things here are easy to get wrong by hand and expensive to get wrong in
 * production: the `hreflang` alternates (every locale must point at its own
 * URL, plus an `x-default`) and the indexing policy — only the production tier
 * may be indexed, otherwise staging outranks the real site.
 */
export function buildPageMetadata({
  locale,
  title,
  description,
  path = '',
}: PageMetadataOptions): Metadata {
  const canonical = absoluteUrl(locale, path)

  const languages = Object.fromEntries(
    routing.locales.map((candidate) => [localeHreflang[candidate], absoluteUrl(candidate, path)]),
  )

  const isIndexable = env.APP_ENV === 'production'

  return {
    metadataBase: new URL(env.SITE_URL),
    title,
    description,
    applicationName: siteConfig.name,
    authors: [{ name: siteConfig.author.name, url: env.SITE_URL }],
    creator: siteConfig.author.name,
    alternates: {
      canonical,
      languages: {
        ...languages,
        'x-default': absoluteUrl(routing.defaultLocale, path),
      },
    },
    openGraph: {
      type: 'website',
      siteName: siteConfig.name,
      // `language_TERRITORY`, not the `hreflang` tag: Open Graph is the one
      // consumer here that does not speak BCP 47.
      locale: localeOpenGraph[locale],
      alternateLocale: routing.locales
        .filter((candidate) => candidate !== locale)
        .map((candidate) => localeOpenGraph[candidate]),
      url: canonical,
      title,
      description,
      // `og:image` is contributed by src/app/[locale]/opengraph-image.tsx via
      // Next's file convention, which also fills in the correct absolute URL
      // and dimensions. Setting it here as well would duplicate the tag.
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    robots: {
      index: isIndexable,
      follow: isIndexable,
      googleBot: {
        index: isIndexable,
        follow: isIndexable,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    },
  }
}
