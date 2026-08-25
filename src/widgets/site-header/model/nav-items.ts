/**
 * The site's primary navigation, in order.
 *
 * `href` values are locale-less: next-intl's `Link` adds the active locale
 * prefix, so `/about` becomes `/ru/about` or `/en/about` on its own.
 */
export const NAV_ITEMS = [
  { href: '/', messageKey: 'home' },
  { href: '/about', messageKey: 'about' },
] as const
