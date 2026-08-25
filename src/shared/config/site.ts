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
  author: {
    name: 'Vladimir Shikov',
  },
  links: {
    github: 'https://github.com/iuriishikov',
  },
  /** Keep in sync with `src/app/manifest.ts`. */
  themeColor: {
    light: '#ffffff',
    dark: '#0a0a0a',
  },
} as const
