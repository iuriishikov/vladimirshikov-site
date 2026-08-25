import type { MetadataRoute } from 'next'

import { env } from '@/shared/config/env'
import { localeHreflang, routing } from '@/shared/i18n/routing'

/** Locale-less paths that should appear in the sitemap, with their priority. */
const ROUTES = [
  { path: '', priority: 1, changeFrequency: 'monthly' as const },
  { path: '/about', priority: 0.8, changeFrequency: 'yearly' as const },
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
