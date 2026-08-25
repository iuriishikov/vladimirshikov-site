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
   * The `hreflang` tag: a bare language subtag.
   *
   * There is exactly one edition per language, so there is nothing for a region
   * to distinguish. `en-US` would have told a crawler to serve the English
   * edition to American readers specifically and leave a British or Australian
   * one unmatched — for a site written in Almaty, an odd thing to say. Serbian
   * is the one exception: it is published here in Cyrillic and widely written
   * in Latin elsewhere, so its script subtag is load-bearing.
   */
  hreflang: string
  /**
   * `og:locale`, which is not a BCP 47 tag however much it looks like one.
   * Open Graph wants `language_TERRITORY` with an underscore, and rejects both
   * `en-US` and a bare `en` — so it cannot share a field with `hreflang`, which
   * wants the opposite of each.
   */
  ogLocale: string
}

/**
 * Order matters: it is the reading order of the language index, and the first
 * entry is the default locale.
 */
export const LOCALE_CATALOGUE = {
  en: { endonym: 'English', script: 'latin', hreflang: 'en', ogLocale: 'en_US' },
  de: { endonym: 'Deutsch', script: 'latin', hreflang: 'de', ogLocale: 'de_DE' },
  fr: { endonym: 'Français', script: 'latin', hreflang: 'fr', ogLocale: 'fr_FR' },
  es: { endonym: 'Español', script: 'latin', hreflang: 'es', ogLocale: 'es_ES' },
  pt: { endonym: 'Português', script: 'latin', hreflang: 'pt', ogLocale: 'pt_PT' },
  it: { endonym: 'Italiano', script: 'latin', hreflang: 'it', ogLocale: 'it_IT' },
  nl: { endonym: 'Nederlands', script: 'latin', hreflang: 'nl', ogLocale: 'nl_NL' },
  pl: { endonym: 'Polski', script: 'latin', hreflang: 'pl', ogLocale: 'pl_PL' },
  cs: { endonym: 'Čeština', script: 'latin', hreflang: 'cs', ogLocale: 'cs_CZ' },
  sk: { endonym: 'Slovenčina', script: 'latin', hreflang: 'sk', ogLocale: 'sk_SK' },
  hu: { endonym: 'Magyar', script: 'latin', hreflang: 'hu', ogLocale: 'hu_HU' },
  ro: { endonym: 'Română', script: 'latin', hreflang: 'ro', ogLocale: 'ro_RO' },
  hr: { endonym: 'Hrvatski', script: 'latin', hreflang: 'hr', ogLocale: 'hr_HR' },
  sl: { endonym: 'Slovenščina', script: 'latin', hreflang: 'sl', ogLocale: 'sl_SI' },
  lt: { endonym: 'Lietuvių', script: 'latin', hreflang: 'lt', ogLocale: 'lt_LT' },
  lv: { endonym: 'Latviešu', script: 'latin', hreflang: 'lv', ogLocale: 'lv_LV' },
  et: { endonym: 'Eesti', script: 'latin', hreflang: 'et', ogLocale: 'et_EE' },
  fi: { endonym: 'Suomi', script: 'latin', hreflang: 'fi', ogLocale: 'fi_FI' },
  sv: { endonym: 'Svenska', script: 'latin', hreflang: 'sv', ogLocale: 'sv_SE' },
  da: { endonym: 'Dansk', script: 'latin', hreflang: 'da', ogLocale: 'da_DK' },
  nb: { endonym: 'Norsk', script: 'latin', hreflang: 'nb', ogLocale: 'nb_NO' },
  is: { endonym: 'Íslenska', script: 'latin', hreflang: 'is', ogLocale: 'is_IS' },
  tr: { endonym: 'Türkçe', script: 'latin', hreflang: 'tr', ogLocale: 'tr_TR' },
  sq: { endonym: 'Shqip', script: 'latin', hreflang: 'sq', ogLocale: 'sq_AL' },
  ca: { endonym: 'Català', script: 'latin', hreflang: 'ca', ogLocale: 'ca_ES' },
  id: { endonym: 'Bahasa Indonesia', script: 'latin', hreflang: 'id', ogLocale: 'id_ID' },
  ms: { endonym: 'Bahasa Melayu', script: 'latin', hreflang: 'ms', ogLocale: 'ms_MY' },
  fil: { endonym: 'Filipino', script: 'latin', hreflang: 'fil', ogLocale: 'fil_PH' },
  sw: { endonym: 'Kiswahili', script: 'latin', hreflang: 'sw', ogLocale: 'sw_KE' },
  vi: { endonym: 'Tiếng Việt', script: 'latin', hreflang: 'vi', ogLocale: 'vi_VN' },
  ru: { endonym: 'Русский', script: 'cyrillic', hreflang: 'ru', ogLocale: 'ru_RU' },
  uk: { endonym: 'Українська', script: 'cyrillic', hreflang: 'uk', ogLocale: 'uk_UA' },
  be: { endonym: 'Беларуская', script: 'cyrillic', hreflang: 'be', ogLocale: 'be_BY' },
  bg: { endonym: 'Български', script: 'cyrillic', hreflang: 'bg', ogLocale: 'bg_BG' },
  sr: { endonym: 'Српски', script: 'cyrillic', hreflang: 'sr-Cyrl', ogLocale: 'sr_RS' },
  mk: { endonym: 'Македонски', script: 'cyrillic', hreflang: 'mk', ogLocale: 'mk_MK' },
  kk: { endonym: 'Қазақша', script: 'cyrillic', hreflang: 'kk', ogLocale: 'kk_KZ' },
  ky: { endonym: 'Кыргызча', script: 'cyrillic', hreflang: 'ky', ogLocale: 'ky_KG' },
  mn: { endonym: 'Монгол', script: 'cyrillic', hreflang: 'mn', ogLocale: 'mn_MN' },
  tg: { endonym: 'Тоҷикӣ', script: 'cyrillic', hreflang: 'tg', ogLocale: 'tg_TJ' },
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

/** BCP 47 tags for `hreflang` alternates and `inLanguage`. */
export const localeHreflang: Record<Locale, string> = Object.fromEntries(
  Object.entries(LOCALE_CATALOGUE).map(([code, entry]) => [code, entry.hreflang]),
) as Record<Locale, string>

/** `language_TERRITORY` tags, which only Open Graph asks for. */
export const localeOpenGraph: Record<Locale, string> = Object.fromEntries(
  Object.entries(LOCALE_CATALOGUE).map(([code, entry]) => [code, entry.ogLocale]),
) as Record<Locale, string>

/** The index groups itself by writing system, in catalogue order within each. */
export const localesByScript: readonly { script: LocaleEntry['script']; codes: Locale[] }[] = [
  { script: 'latin', codes: [] },
  { script: 'cyrillic', codes: [] },
].map((group) => ({
  script: group.script as LocaleEntry['script'],
  codes: localeCodes.filter((code) => LOCALE_CATALOGUE[code].script === group.script),
}))
