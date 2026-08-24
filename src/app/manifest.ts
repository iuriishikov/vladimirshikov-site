import type { MetadataRoute } from 'next'

import { siteConfig } from '@/shared/config/site'
import { routing } from '@/shared/i18n/routing'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: siteConfig.name,
    description: `${siteConfig.name} — personal site`,
    // Installing the app lands on the default locale rather than on `/`, which
    // would only redirect.
    start_url: `/${routing.defaultLocale}`,
    scope: '/',
    display: 'standalone',
    background_color: siteConfig.themeColor.light,
    theme_color: siteConfig.themeColor.light,
    lang: routing.defaultLocale,
    dir: 'ltr',
    categories: ['personal'],
  }
}
