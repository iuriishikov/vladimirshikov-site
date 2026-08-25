/**
 * Facts about the site that are neither translated nor environment-dependent.
 *
 * Deliberately free of any `env` access: this module is imported by Client
 * Components, and reading a server-only variable there would throw at runtime.
 * The canonical URL lives in `env.SITE_URL` and is only read on the server.
 */
export const siteConfig = {
  name: 'Vladimir Shikov',
  /** Used for `<title>` templates: "Page — Vladimir Shikov". */
  titleSeparator: '—',
  /** The address the footer and every contact call-to-action points at. */
  email: 'hello@vladimirshikov.com',
  author: {
    name: 'Vladimir Shikov',
  },
  links: {
    github: 'https://github.com/iuriishikov',
    telegram: 'https://t.me/',
    linkedin: 'https://www.linkedin.com/',
    behance: 'https://www.behance.net/',
  },
  /** Keep in sync with `src/app/manifest.ts`. */
  themeColor: {
    light: '#ffffff',
    dark: '#0f0f0e',
  },
} as const

/**
 * The single-page navigation. Every entry is an in-page anchor, which is why
 * these are ids rather than routes — the portfolio is one document.
 */
export const NAV_SECTIONS = [
  { id: 'top', labelKey: 'nav.home' },
  { id: 'about', labelKey: 'nav.about' },
  { id: 'education', labelKey: 'nav.education' },
  { id: 'cases', labelKey: 'nav.cases' },
  { id: 'blog', labelKey: 'nav.blog' },
] as const
