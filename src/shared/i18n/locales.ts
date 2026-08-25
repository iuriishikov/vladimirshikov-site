/**
 * Every edition of the site, and the two typefaces that decide the list.
 *
 * The site self-hosts Archivo (`latin`, `latin-ext`, `vietnamese`) and Golos
 * Text (`cyrillic`, `cyrillic-ext`). Between them that is the Latin and the
 * Cyrillic writing systems, and nothing else: a language written in Chinese,
 * Japanese, Arabic, Hebrew, Devanagari, Thai, Greek, Armenian or Georgian would
 * fall through to whatever the operating system happens to supply, at a
 * different weight and a different x-height, and the page would stop being the
 * page. So the boundary of this list is not a judgement about audiences — it is
 * the coverage of the type.
 *
 * `script` is which of the two renders the edition, which is also how the
 * language index groups itself.
 */

export interface LocaleEntry {
  /** The language's own name for itself, set in its own script. */
  endonym: string
  script: 'latin' | 'cyrillic'
  /**
   * The `hreflang` tag. The first two editions were published with a region and
   * keep it; the rest have no regional variant to tell apart, so they carry the
   * bare language subtag — which is what a crawler prefers when there is only
   * one edition of a language.
   */
  hreflang: string
}

/**
 * Order matters: it is the reading order of the language index, and the first
 * entry is the default locale.
 */
export const LOCALE_CATALOGUE = {
  en: { endonym: 'English', script: 'latin', hreflang: 'en-US' },
  de: { endonym: 'Deutsch', script: 'latin', hreflang: 'de' },
  fr: { endonym: 'Français', script: 'latin', hreflang: 'fr' },
  es: { endonym: 'Español', script: 'latin', hreflang: 'es' },
  pt: { endonym: 'Português', script: 'latin', hreflang: 'pt' },
  it: { endonym: 'Italiano', script: 'latin', hreflang: 'it' },
  nl: { endonym: 'Nederlands', script: 'latin', hreflang: 'nl' },
  pl: { endonym: 'Polski', script: 'latin', hreflang: 'pl' },
  cs: { endonym: 'Čeština', script: 'latin', hreflang: 'cs' },
  sk: { endonym: 'Slovenčina', script: 'latin', hreflang: 'sk' },
  hu: { endonym: 'Magyar', script: 'latin', hreflang: 'hu' },
  ro: { endonym: 'Română', script: 'latin', hreflang: 'ro' },
  hr: { endonym: 'Hrvatski', script: 'latin', hreflang: 'hr' },
  sl: { endonym: 'Slovenščina', script: 'latin', hreflang: 'sl' },
  lt: { endonym: 'Lietuvių', script: 'latin', hreflang: 'lt' },
  lv: { endonym: 'Latviešu', script: 'latin', hreflang: 'lv' },
  et: { endonym: 'Eesti', script: 'latin', hreflang: 'et' },
  fi: { endonym: 'Suomi', script: 'latin', hreflang: 'fi' },
  sv: { endonym: 'Svenska', script: 'latin', hreflang: 'sv' },
  da: { endonym: 'Dansk', script: 'latin', hreflang: 'da' },
  nb: { endonym: 'Norsk', script: 'latin', hreflang: 'nb' },
  is: { endonym: 'Íslenska', script: 'latin', hreflang: 'is' },
  tr: { endonym: 'Türkçe', script: 'latin', hreflang: 'tr' },
  sq: { endonym: 'Shqip', script: 'latin', hreflang: 'sq' },
  ca: { endonym: 'Català', script: 'latin', hreflang: 'ca' },
  id: { endonym: 'Bahasa Indonesia', script: 'latin', hreflang: 'id' },
  ms: { endonym: 'Bahasa Melayu', script: 'latin', hreflang: 'ms' },
  fil: { endonym: 'Filipino', script: 'latin', hreflang: 'fil' },
  sw: { endonym: 'Kiswahili', script: 'latin', hreflang: 'sw' },
  vi: { endonym: 'Tiếng Việt', script: 'latin', hreflang: 'vi' },
  ru: { endonym: 'Русский', script: 'cyrillic', hreflang: 'ru-RU' },
  uk: { endonym: 'Українська', script: 'cyrillic', hreflang: 'uk' },
  be: { endonym: 'Беларуская', script: 'cyrillic', hreflang: 'be' },
  bg: { endonym: 'Български', script: 'cyrillic', hreflang: 'bg' },
  sr: { endonym: 'Српски', script: 'cyrillic', hreflang: 'sr-Cyrl' },
  mk: { endonym: 'Македонски', script: 'cyrillic', hreflang: 'mk' },
  kk: { endonym: 'Қазақша', script: 'cyrillic', hreflang: 'kk' },
  ky: { endonym: 'Кыргызча', script: 'cyrillic', hreflang: 'ky' },
  mn: { endonym: 'Монгол', script: 'cyrillic', hreflang: 'mn' },
  tg: { endonym: 'Тоҷикӣ', script: 'cyrillic', hreflang: 'tg' },
} as const satisfies Record<string, LocaleEntry>

export type Locale = keyof typeof LOCALE_CATALOGUE

/**
 * A tuple, not a derived array: `defineRouting` infers the `Locale` union from
 * it, and `Object.keys` would hand it `string[]` and lose every type downstream.
 */
export const localeCodes = Object.keys(LOCALE_CATALOGUE) as unknown as readonly [
  Locale,
  ...Locale[],
]

/**
 * The two editions that are always on show in the header. Everything else lives
 * behind the index, because forty codes in a header bar is not a header bar.
 */
export const PRIMARY_LOCALES = ['en', 'ru'] as const satisfies readonly Locale[]

export type PrimaryLocale = (typeof PRIMARY_LOCALES)[number]

/** Display names for the locale switcher, in each locale's own language. */
export const localeLabels: Record<Locale, string> = Object.fromEntries(
  Object.entries(LOCALE_CATALOGUE).map(([code, entry]) => [code, entry.endonym]),
) as Record<Locale, string>

/** BCP 47 tags for `hreflang` alternates. */
export const localeHreflang: Record<Locale, string> = Object.fromEntries(
  Object.entries(LOCALE_CATALOGUE).map(([code, entry]) => [code, entry.hreflang]),
) as Record<Locale, string>

/** The index groups itself by writing system, in catalogue order within each. */
export const localesByScript: readonly { script: LocaleEntry['script']; codes: Locale[] }[] = [
  { script: 'latin', codes: [] },
  { script: 'cyrillic', codes: [] },
].map((group) => ({
  script: group.script as LocaleEntry['script'],
  codes: localeCodes.filter((code) => LOCALE_CATALOGUE[code].script === group.script),
}))
