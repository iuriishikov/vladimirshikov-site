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
    /*
     * The one photograph of the subject this site ships, uncropped, because
     * that is what the file actually is. The page shows a crop of it — he sits
     * right of centre in the frame — so a consumer that centre-crops this to a
     * square gets the stage wall rather than his face. Honest and imperfect
     * beats absent; replace it the day a purpose-made headshot exists.
     */
    image: `${env.SITE_URL}/vladimir-shikov.jpg`,
    knowsAbout: [...knowsAbout],
    alumniOf: { '@type': 'CollegeOrUniversity', name: alumniOf },
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Almaty',
      addressCountry: 'KZ',
    },
  }
}

/**
 * The site itself. No `inLanguage`: `websiteId` is one IRI shared by all forty
 * editions, so a language on it would be forty contradicting claims about a
 * single node. Language belongs on the page, whose `@id` is per-URL.
 */
export function buildWebsite(): JsonLd {
  return {
    '@type': 'WebSite',
    '@id': websiteId,
    url: env.SITE_URL,
    name: siteConfig.name,
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

interface WorkPageOptions {
  locale: Locale
  path: string
  /** The page's own title — the same string its `<h1>` renders. */
  name: string
  /** The Article or CreativeWork this URL exists to present. */
  work: JsonLd
  crumbs: JsonLd
}

/**
 * A URL that presents one work.
 *
 * The `WebPage` node is what says "this address is the document that carries
 * that Article". Without it the work floats free: `isPartOf` points at a
 * `WebSite` node the page never defines, and the crawler is handed two graphs
 * that reference an identity nothing on the page establishes.
 *
 * The Person is deliberately not a node here. `buildArticle` and `buildProject`
 * already inline `{ '@type': 'Person', '@id': personId, name }`, which resolves
 * within this graph and shares the home page's identity — and these pages
 * render none of the strings a full Person node would have to claim.
 */
export function buildWorkPage({ locale, path, name, work, crumbs }: WorkPageOptions): JsonLd {
  const url = absoluteUrl(locale, path)
  const pageId = `${url}#page`
  const crumbId = `${url}#breadcrumb`

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': pageId,
        url,
        name,
        inLanguage: localeHreflang[locale],
        isPartOf: { '@id': websiteId },
        breadcrumb: { '@id': crumbId },
        mainEntity: { '@id': work['@id'] },
      },
      { ...work, mainEntityOfPage: { '@id': pageId } },
      { ...crumbs, '@id': crumbId },
      buildWebsite(),
    ],
  }
}
