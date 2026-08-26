import createMiddleware from 'next-intl/middleware'
import type { NextRequest } from 'next/server'

import { isDevelopment } from '@/shared/config/runtime'
import { routing } from '@/shared/i18n/routing'

const handleI18nRouting = createMiddleware(routing)

/**
 * A fresh, unguessable nonce per request. `crypto` is the Web Crypto API that
 * the Edge runtime provides globally — Node's `crypto` module is not available
 * in middleware.
 */
function createNonce(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  return btoa(String.fromCodePoint(...bytes))
}

/**
 * Nonce-based Content-Security-Policy.
 *
 * `'strict-dynamic'` is what makes this worth having: modern browsers ignore
 * the host allowlist and trust only scripts that carry the nonce plus whatever
 * those scripts load themselves. That covers Next.js's chunk loading without
 * opening the door to injected `<script>` tags.
 *
 * `style-src` keeps `'unsafe-inline'`: Next.js and Tailwind emit inline style
 * elements during hydration, and inline styles are a far weaker XSS vector
 * than inline scripts.
 */
function buildContentSecurityPolicy(nonce: string): string {
  return [
    `default-src 'self'`,
    // 'unsafe-eval' is required by Turbopack's dev-time HMR only.
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDevelopment ? " 'unsafe-eval'" : ''}`,
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' blob: data: https:`,
    `font-src 'self' data:`,
    `connect-src 'self'${isDevelopment ? ' ws: wss:' : ''}`,
    `media-src 'self'`,
    `worker-src 'self' blob:`,
    `manifest-src 'self'`,
    `object-src 'none'`,
    `base-uri 'none'`,
    `form-action 'self'`,
    `frame-ancestors 'none'`,
    ...(isDevelopment ? [] : ['upgrade-insecure-requests']),
  ].join('; ')
}

function isRedirect(status: number): boolean {
  return status >= 300 && status < 400
}

/**
 * Adds a field to `Vary` without discarding what is already there — next-intl
 * and Next both contribute to it, and overwriting would silently undo theirs.
 */
function appendVary(response: Response, field: string): void {
  const current = response.headers.get('Vary')
  const fields = current ? current.split(',').map((entry) => entry.trim()) : []

  if (fields.some((entry) => entry.toLowerCase() === field.toLowerCase())) return

  response.headers.set('Vary', [...fields, field].filter(Boolean).join(', '))
}

/**
 * Next 16 renamed the `middleware` file convention to `proxy`. Same request
 * hook, same contract — only the filename and the default export's name moved.
 */
export default function proxy(request: NextRequest) {
  const nonce = createNonce()
  const csp = buildContentSecurityPolicy(nonce)

  // Next.js reads the nonce back out of the *request* CSP header and stamps it
  // onto every script tag it renders. `x-nonce` is the copy application code
  // reads (via `headers()`) when it needs to nonce a script of its own.
  //
  // next-intl forwards these request headers into its rewrite/next response, so
  // mutating them before delegating is what makes the nonce reach the renderer.
  request.headers.set('x-nonce', nonce)
  request.headers.set('content-security-policy', csp)

  const response = handleI18nRouting(request)

  response.headers.set('Content-Security-Policy', csp)
  response.headers.set('x-nonce', nonce)

  /*
   * The response to `/` is negotiated: next-intl reads `Accept-Language` and
   * the `NEXT_LOCALE` cookie and redirects to one of forty editions. Without a
   * `Vary`, any shared cache in front of this — a CDN, a corporate proxy — is
   * entitled to store the first visitor's redirect and hand it to everybody
   * afterwards, so one German reader would send Japanese, Kazakh and English
   * ones all to `/de`. The bug is invisible in development, where nothing
   * caches, and total in production.
   *
   * Applied only to the negotiated redirect. Locale-prefixed URLs are the same
   * document for every visitor and must stay freely cacheable.
   */
  if (isRedirect(response.status)) {
    appendVary(response, 'Accept-Language')
    appendVary(response, 'Cookie')
  }

  return response
}

export const config = {
  /**
   * Everything except Next.js internals, the API routes and files with an
   * extension. Those either serve no HTML or are handled by the static headers
   * in `next.config.ts`.
   */
  // Next.js reads this value by parsing the file, not by executing it, so the
  // matcher has to be a plain string literal. A `String.raw` tagged template
  // (which ESLint's prefer-string-raw rule would rather see here) is not
  // statically analysable and fails the build with
  // "Invalid segment configuration export detected".
  // eslint-disable-next-line unicorn/prefer-string-raw -- see the note above
  matcher: ['/((?!api|_next|_vercel|monitoring|.*\\..*).*)'],
}
