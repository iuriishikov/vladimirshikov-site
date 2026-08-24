import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

/**
 * The single place this application reads configuration from.
 *
 * Everything is validated once, at module load. A missing or malformed variable
 * fails the build — it never reaches production as an `undefined` that only
 * shows up under load. ESLint forbids touching `process.env` anywhere else.
 *
 * ## Why almost everything here is server-side
 *
 * Next.js inlines `NEXT_PUBLIC_*` values into the JavaScript bundle at BUILD
 * time. A variable behind that prefix is therefore baked into the image and
 * cannot be changed by the container that runs it — which would force a
 * separate image per environment and break "build once, promote the artefact".
 *
 * So only genuinely browser-side configuration gets the public prefix. The
 * canonical URL and the deployment tier are read on the server (metadata,
 * sitemap, robots, OG images all render there), which keeps one image valid for
 * staging and production alike.
 */
export const env = createEnv({
  server: {
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

    /**
     * Canonical origin. Drives metadataBase, sitemap.xml, robots.txt and OG
     * tags. Set per environment at *runtime*.
     */
    SITE_URL: z.url().default('http://localhost:3000'),

    /** Deployment tier. Anything other than `production` serves `noindex`. */
    APP_ENV: z.enum(['development', 'staging', 'production']).default('development'),

    /** Optional upstream API. Absent means the site is fully self-contained. */
    API_BASE_URL: z.url().optional(),

    /**
     * Reported by `/api/health`. The release pipeline sets it to the released
     * version so a running container can be traced back to a git tag.
     */
    APP_VERSION: z.string().default('0.0.0-dev'),
  },

  client: {
    /**
     * Privacy-friendly analytics domain. Empty disables analytics entirely.
     * Genuinely needed in the browser, hence the public prefix and the
     * build-time cost that comes with it.
     */
    NEXT_PUBLIC_ANALYTICS_DOMAIN: z.string().optional(),
  },

  // Next.js only inlines statically-analysable `process.env.X` references, so
  // each variable has to be spelled out here rather than spread.
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    SITE_URL: process.env.SITE_URL,
    APP_ENV: process.env.APP_ENV,
    API_BASE_URL: process.env.API_BASE_URL,
    APP_VERSION: process.env.APP_VERSION,
    NEXT_PUBLIC_ANALYTICS_DOMAIN: process.env.NEXT_PUBLIC_ANALYTICS_DOMAIN,
  },

  /**
   * Escape hatch for `docker build`, which has no runtime configuration
   * available. Note the trade-off: with validation skipped, zod defaults are
   * not applied either, so anything read at build time reads as `undefined`.
   * Everything in this schema is deliberately read at request time instead.
   */
  skipValidation: Boolean(process.env.SKIP_ENV_VALIDATION),
  emptyStringAsUndefined: true,
})

// `isDevelopment` deliberately lives in ./runtime and is imported from there,
// not re-exported here: code that only needs to know "is this dev?" — the Edge
// proxy, a Client Component — must not pull in this module and drag zod plus
// the whole schema along with it.
