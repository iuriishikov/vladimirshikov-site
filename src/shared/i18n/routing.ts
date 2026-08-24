import { defineRouting } from 'next-intl/routing'

/**
 * Locale routing is `always`-prefixed: `/ru/...` and `/en/...` are the only
 * canonical URLs, and `/` redirects to the default locale. A prefix-less
 * default locale would give the same page two URLs and split its SEO signal.
 */
export const routing = defineRouting({
  locales: ['ru', 'en'],
  defaultLocale: 'ru',
  localePrefix: 'always',
  localeDetection: true,
})

export type Locale = (typeof routing.locales)[number]

/** Display names for the locale switcher, in each locale's own language. */
export const localeLabels: Record<Locale, string> = {
  ru: 'Русский',
  en: 'English',
}

/** BCP 47 tags for `<html lang>` and `hreflang` alternates. */
export const localeHreflang: Record<Locale, string> = {
  ru: 'ru-RU',
  en: 'en-US',
}
