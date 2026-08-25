import 'server-only'

import { env } from '../config/env'
import { siteConfig } from '../config/site'
import { localeHreflang, type Locale } from '../i18n/routing'

/**
 * schema.org graphs, built from what the site actually says.
 *
 * The discipline here is subtraction. Structured data is a set of claims made
 * to a machine that cannot check them, and Google penalises the ones it later
 * finds untrue far more than it rewards the ones it finds. So:
 *
 * - No `FAQPage`. The questions section on this site has questions and no
 *   answers, on purpose; the type requires `acceptedAnswer`.
 * - No `Review`, `AggregateRating` or `testimonial`. There are none.
 * - No `datePublished` on the essay. Nobody knows when it was written, and a
 *   guessed date is a lie with a timestamp on it.
 * - No `sameAs`. There are no verified profiles to point at yet.
 * - No `SearchAction`. There is no search.
 *
 * Everything below can be pointed at on the rendered page.
 */

/** JSON-LD carries no behaviour, only claims, so the shape is deliberately loose. */
export type JsonLd = Record<string, unknown>

interface PersonOptions {
  locale: Locale
  /** The person's name as this edition spells it. */
  name: string
  /** The one-sentence positioning the page opens with. */
  description: string
  jobTitle: string
  /** The four practice areas, in this edition's words. */
  knowsAbout: readonly string[]
  alumniOf: string
}

const personId = `${env.SITE_URL}/#person`
const websiteId = `${env.SITE_URL}/#website`

function absoluteUrl(locale: Locale, path = ''): string {
  return `${env.SITE_URL}/${locale}${path}`
}

/**
 * The person the site is about. Referenced by `@id` from every other node, so
 * a crawler reading three pages understands them as three views of one subject
 * rather than as three people with the same name.
 */
export function buildPerson({
  locale,
  name,
  description,
  jobTitle,
  knowsAbout,
  alumniOf,
}: PersonOptions): JsonLd {
  return {
    '@type': 'Person',
    '@id': personId,
    name,
    description,
    jobTitle,
    url: absoluteUrl(locale),
    email: `mailto:${siteConfig.email}`,
    knowsAbout: [...knowsAbout],
    alumniOf: { '@type': 'CollegeOrUniversity', name: alumniOf },
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Almaty',
      addressCountry: 'KZ',
    },
  }
}

export function buildWebsite(locale: Locale): JsonLd {
  return {
    '@type': 'WebSite',
    '@id': websiteId,
    url: env.SITE_URL,
    name: siteConfig.name,
    inLanguage: localeHreflang[locale],
    publisher: { '@id': personId },
  }
}

interface ProfilePageOptions {
  locale: Locale
  title: string
  description: string
  person: JsonLd
  website: JsonLd
}

/**
 * `ProfilePage` rather than `WebPage`: this is the type Google documents for a
 * site that is about one person, and it is what lets the Person node be read as
 * the subject of the page rather than as a mention on it.
 */
export function buildProfilePage({
  locale,
  title,
  description,
  person,
  website,
}: ProfilePageOptions): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'ProfilePage',
        '@id': `${absoluteUrl(locale)}#page`,
        url: absoluteUrl(locale),
        name: title,
        description,
        inLanguage: localeHreflang[locale],
        isPartOf: { '@id': websiteId },
        mainEntity: { '@id': personId },
        about: { '@id': personId },
      },
      person,
      website,
    ],
  }
}

interface CrumbsOptions {
  locale: Locale
  /** Each step but the last is a link; the last is the page you are on. */
  trail: readonly { name: string; path: string }[]
}

export function buildBreadcrumbs({ locale, trail }: CrumbsOptions): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((step, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: step.name,
      item: absoluteUrl(locale, step.path),
    })),
  }
}

interface ArticleOptions {
  locale: Locale
  path: string
  headline: string
  description: string
  personName: string
}

/**
 * The essay. No `datePublished`, no `dateModified`, no `image`: none of the
 * three is known, and Article tolerates their absence far better than it
 * tolerates an invented value.
 */
export function buildArticle({
  locale,
  path,
  headline,
  description,
  personName,
}: ArticleOptions): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${absoluteUrl(locale, path)}#article`,
    url: absoluteUrl(locale, path),
    headline,
    description,
    inLanguage: localeHreflang[locale],
    author: { '@type': 'Person', '@id': personId, name: personName },
    publisher: { '@id': personId },
    isPartOf: { '@id': websiteId },
  }
}

interface ProjectOptions {
  locale: Locale
  path: string
  name: string
  description: string
  personName: string
  /** The client, when the source material named one. */
  client?: string
}

/**
 * A consulting engagement is not an `Article` and not a `Product`. `CreativeWork`
 * is the honest supertype: a thing that was made, by someone, for someone.
 */
export function buildProject({
  locale,
  path,
  name,
  description,
  personName,
  client,
}: ProjectOptions): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    '@id': `${absoluteUrl(locale, path)}#project`,
    url: absoluteUrl(locale, path),
    name,
    description,
    inLanguage: localeHreflang[locale],
    creator: { '@type': 'Person', '@id': personId, name: personName },
    isPartOf: { '@id': websiteId },
    ...(client !== undefined && { about: { '@type': 'Organization', name: client } }),
  }
}
