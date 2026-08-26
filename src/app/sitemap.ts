import type { MetadataRoute } from 'next'

import { CASE_STUDIES } from '@/entities/case-study'
import { env } from '@/shared/config/env'
import { localeHreflang, routing } from '@/shared/i18n/routing'

/** The notes the blog section links to. Keep in sync with `Blog.items`. */
const NOTE_IDS = ['growth']

/**
 * Locale-less paths that should appear in the sitemap, with their priority.
 *
 * The portfolio is one page, so its sections are anchors rather than entries —
 * a crawler that follows `#cases` would only find the page it is already on.
 * The case and note pages are real routes and do belong here.
 */
const ROUTES = [
  { path: '', priority: 1, changeFrequency: 'monthly' as const },
  /*
   * `/about` is deliberately absent. It carries `noindex` until it has content
   * of its own, and submitting a URL you have asked a crawler not to index is
   * a contradiction it has to spend budget resolving — forty times over.
   */
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

/*
 * No `lastModified`. It used to be `new Date()`, which told a crawler that
 * every one of these URLs had changed in the second it asked — every time it
 * asked. A field that always says "just now" is indistinguishable from noise,
 * and Google's documented response to a sitemap whose dates it cannot trust is
 * to stop reading them at all. There is no real per-page modification date to
 * put here yet, and an absent field costs nothing; a false one costs the
 * credibility of the whole file.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return routing.locales.flatMap((locale) =>
    ROUTES.map((route) => ({
      url: `${env.SITE_URL}/${locale}${route.path}`,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
      alternates: {
        languages: {
          ...Object.fromEntries(
            routing.locales.map((alternate) => [
              localeHreflang[alternate],
              `${env.SITE_URL}/${alternate}${route.path}`,
            ]),
          ),
          // The same `x-default` the page's own head carries. A crawler may
          // read either source; the two disagreeing about which edition an
          // unmatched visitor gets is worse than only one of them saying so.
          'x-default': `${env.SITE_URL}/${routing.defaultLocale}${route.path}`,
        },
      },
    })),
  )
}
