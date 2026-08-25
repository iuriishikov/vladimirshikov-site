import { localeHreflang, type Locale } from '../i18n/routing'

/**
 * Formatting helpers that are safe to call on the server *and* the client.
 *
 * They always take an explicit locale: relying on the runtime default gives a
 * server render in `en-US` and a client render in whatever the browser is set
 * to, which is a hydration mismatch waiting to happen.
 */

const DEFAULT_DATE_FORMAT: Intl.DateTimeFormatOptions = {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
}

export function formatDate(
  value: Date | string | number,
  locale: Locale,
  options: Intl.DateTimeFormatOptions = DEFAULT_DATE_FORMAT,
): string {
  const date = value instanceof Date ? value : new Date(value)
  return new Intl.DateTimeFormat(localeHreflang[locale], { timeZone: 'UTC', ...options }).format(
    date,
  )
}

export function formatNumber(
  value: number,
  locale: Locale,
  options: Intl.NumberFormatOptions = {},
): string {
  return new Intl.NumberFormat(localeHreflang[locale], options).format(value)
}

/** Seconds to a compact `1d 3h 12m` style string — used by the health badge. */
export function formatDuration(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds))
  const days = Math.floor(total / 86_400)
  const hours = Math.floor((total % 86_400) / 3600)
  const minutes = Math.floor((total % 3600) / 60)

  const parts: string[] = []
  if (days > 0) parts.push(`${String(days)}d`)
  if (hours > 0) parts.push(`${String(hours)}h`)
  if (minutes > 0 || parts.length === 0) parts.push(`${String(minutes)}m`)

  return parts.join(' ')
}
