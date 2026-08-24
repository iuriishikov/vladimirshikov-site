import { hasLocale } from 'next-intl'
import { getRequestConfig } from 'next-intl/server'

import { isDevelopment } from '../config/runtime'
import { routing } from './routing'

/**
 * Resolves the active locale for every server render and loads its messages.
 * Wired up in `next.config.ts` via `createNextIntlPlugin`.
 *
 * A default export is the contract next-intl expects here.
 */
// next-intl points at `next/root-params` as the successor to `requestLocale`.
// Its types are generated into `.next/types` by a build, so adopting it would
// make `pnpm typecheck` depend on `pnpm build` having run first — a CI ordering
// constraint not worth taking on while `requestLocale` still works. Revisit once
// the root-params types ship with the package itself.
// eslint-disable-next-line @typescript-eslint/no-deprecated -- see the note above
export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale

  // Whatever is in the URL is untrusted input.
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale

  const imported = (await import(`../../../messages/${locale}.json`)) as {
    default: Record<string, unknown>
  }

  return {
    locale,
    messages: imported.default,
    // Pinning the timezone keeps a server render and a browser render of the
    // same date byte-identical, which is what hydration compares.
    timeZone: 'UTC',
    // Formatting defaults, so `useFormatter()` is consistent site-wide.
    formats: {
      dateTime: {
        short: { day: 'numeric', month: 'short', year: 'numeric' },
      },
    },
    onError(error) {
      // A missing translation must be loud in development and silent-but-logged
      // in production: a half-translated page is better than a crashed one.
      if (isDevelopment) {
        throw error
      }
      console.error(error)
    },
  }
})
