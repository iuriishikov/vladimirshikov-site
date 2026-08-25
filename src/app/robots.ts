import type { MetadataRoute } from 'next'

import { env } from '@/shared/config/env'

/**
 * Only the production tier invites crawlers. A staging deployment that gets
 * indexed competes with the real site for its own keywords, and getting it
 * de-indexed again takes weeks.
 *
 * `APP_ENV` is read at request time, so the same image serves the right
 * robots.txt on staging and on production.
 */
// Rendered per request, not at build time: otherwise the build-time value of
// APP_ENV would be baked into the image and staging would serve production's
// robots.txt.
export const dynamic = 'force-dynamic'

export default function robots(): MetadataRoute.Robots {
  if (env.APP_ENV !== 'production') {
    return { rules: [{ userAgent: '*', disallow: '/' }] }
  }

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/'],
      },
    ],
    sitemap: `${env.SITE_URL}/sitemap.xml`,
    host: env.SITE_URL,
  }
}
