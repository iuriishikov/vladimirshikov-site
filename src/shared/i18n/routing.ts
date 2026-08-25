import { defineRouting } from 'next-intl/routing'

/**
 * Locale routing is `always`-prefixed: `/en/...` and `/ru/...` are the only
 * canonical URLs, and `/` redirects to a locale. A prefix-less default locale
 * would give the same page two URLs and split its SEO signal.
 *
 * English is the default. That is the fallback for a visitor whose browser asks
 * for a language this site does not serve, and it is the `x-default` a crawler
 * is pointed at. It is not a redirect for everyone: `localeDetection` stays on,
 * so a browser that asks for Russian still lands on `/ru`.
 *
 * The order of `locales` is the reading order of the edition mark in the
 * header, which is why the default is listed first.
 */
export const routing = defineRouting({
  locales: ['en', 'ru'],
  defaultLocale: 'en',
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
