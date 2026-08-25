import type messages from '../../../messages/ru.json'
import type { routing } from '../i18n/routing'

/**
 * Makes next-intl aware of this project's locales and message shape, so
 * `useTranslations('Hero')` autocompletes and a typo in a message key is a
 * type error rather than a blank string in production.
 *
 * `ru` is the source of truth for the key set; `en` must mirror it.
 */
declare module 'next-intl' {
  interface AppConfig {
    Locale: (typeof routing.locales)[number]
    Messages: typeof messages
  }
}
