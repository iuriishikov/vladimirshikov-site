import type { MetadataRoute } from 'next'

import { CASE_STUDIES } from '@/entities/case-study'
import { env } from '@/shared/config/env'
import { localeHreflang, routing } from '@/shared/i18n/routing'

/** The notes the blog section links to. Keep in sync with `Blog.items`. */
const NOTE_IDS = ['n1', 'n2', 'n3']

/**
 * Locale-less paths that should appear in the sitemap, with their priority.
 *
 * The portfolio is one page, so its sections are anchors rather than entries —
 * a crawler that follows `#cases` would only find the page it is already on.
 * The case and note pages are real routes and do belong here.
 */
const ROUTES = [
  { path: '', priority: 1, changeFrequency: 'monthly' as const },
  { path: '/about', priority: 0.5, changeFrequency: 'yearly' as const },
  ...CASE_STUDIES.map((study) => ({
    path: `/cases/${study.slug}`,
    priority: 0.8,
    changeFrequency: 'monthly' as const,
  })),
  ...NOTE_IDS.map((id) => ({
    path: `/notes/${id}`,
    priority: 0.6,
    changeFrequency: 'monthly' as const,
  })),
]

/**
 * Every route is listed once per locale, and each entry declares the other
 * locales as `alternates.languages`. That is what tells a crawler these are
 * translations of one page rather than duplicate content.
 */
// Rendered per request so that SITE_URL comes from the running container
// rather than from whatever was set on the build machine.
export const dynamic = 'force-dynamic'

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()

  return routing.locales.flatMap((locale) =>
    ROUTES.map((route) => ({
      url: `${env.SITE_URL}/${locale}${route.path}`,
      lastModified,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
      alternates: {
        languages: Object.fromEntries(
          routing.locales.map((alternate) => [
            localeHreflang[alternate],
            `${env.SITE_URL}/${alternate}${route.path}`,
          ]),
        ),
      },
    })),
  )
}
