'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useEffect, useRef } from 'react'

import { Link, usePathname } from '@/shared/i18n/navigation'
import {
  LOCALE_CATALOGUE,
  localeCodes,
  localeHreflang,
  localeLabels,
  localesByScript,
  PRIMARY_LOCALES,
  type Locale,
} from '@/shared/i18n/routing'
import { cn } from '@/shared/lib/cn'

/**
 * The specimen letters that head each half of the index. A writing system named
 * by a letter of itself needs no translation, and it shows the reader which of
 * the two typefaces their edition is set in.
 */
const SCRIPT_SPECIMEN = { latin: 'Aa', cyrillic: 'Аа' } as const

/**
 * The edition mark, and the index behind it.
 *
 * Two codes stay in the bar — `en [ru]` — because that is what nearly every
 * visitor wants and forty codes is not a header. The rest live one press away,
 * in an index that lists each edition in its own language and its own script.
 * When the current edition is neither English nor Russian it joins the mark, so
 * the bar always says which one you are reading.
 *
 * Plain links throughout, and a `<details>` for the disclosure: the index opens,
 * closes and is reachable by keyboard with no JavaScript at all, and every one
 * of the forty URLs is in the markup for a crawler to follow. The effects below
 * only add Escape and click-away, which are conveniences, not the mechanism.
 *
 * Which edition is current is said by the markup, not by the stylesheet: only
 * the active option renders brackets, so with CSS stripped the text still reads
 * `[ru]`.
 */
export function LocaleSwitcher() {
  const t = useTranslations('LocaleSwitch')
  const activeLocale = useLocale()
  // next-intl returns the pathname without the locale prefix, so the same
  // value can be re-prefixed with any locale.
  const pathname = usePathname()
  const indexRef = useRef<HTMLDetailsElement>(null)

  useEffect(() => {
    const index = indexRef.current
    if (!index) return

    const close = (): void => {
      index.open = false
    }

    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') close()
    }

    const onPointerDown = (event: PointerEvent): void => {
      if (event.target instanceof Node && !index.contains(event.target)) close()
    }

    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('pointerdown', onPointerDown)

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('pointerdown', onPointerDown)
    }
  }, [])

  const isPrimary = (PRIMARY_LOCALES as readonly Locale[]).includes(activeLocale)
  const marked: Locale[] = isPrimary ? [...PRIMARY_LOCALES] : [...PRIMARY_LOCALES, activeLocale]
  const hiddenCount = localeCodes.length - marked.length

  return (
    <nav
      data-testid="locale-switcher"
      aria-label={t('label')}
      className="flex items-center text-[14px] leading-none"
    >
      {marked.map((locale) => (
        <Link
          key={locale}
          href={pathname}
          locale={locale}
          data-testid={`locale-option-${locale}`}
          // The full BCP 47 tag, so the anchor agrees with the alternates
          // `shared/lib/seo` and the sitemap already emit for these URLs.
          hrefLang={localeHreflang[locale]}
          aria-current={locale === activeLocale ? 'true' : undefined}
          className={cn(
            // The box is invisible but generous: `rounded-sm` paints nothing,
            // it is the radius the global focus ring traces.
            'flex h-11 min-w-[36px] items-center justify-center rounded-sm px-1',
            locale === activeLocale
              ? 'text-foreground font-bold'
              : 'text-muted-foreground hover:text-foreground-soft font-medium',
          )}
        >
          {locale === activeLocale && (
            <span aria-hidden="true" className="text-faint font-medium">
              [
            </span>
          )}
          {locale}
          {locale === activeLocale && (
            <span aria-hidden="true" className="text-faint font-medium">
              ]
            </span>
          )}
          <span lang={locale} className="sr-only">
            {' '}
            — {localeLabels[locale]}
          </span>
        </Link>
      ))}

      <details ref={indexRef} data-testid="locale-index">
        <summary
          data-testid="locale-index-toggle"
          className={cn(
            'text-muted-foreground hover:text-foreground-soft flex h-11 cursor-pointer',
            'list-none items-center justify-center rounded-sm px-1 font-medium',
            // Safari draws its own disclosure triangle through `::-webkit-details-marker`,
            // which `list-none` alone does not remove.
            '[&::-webkit-details-marker]:hidden',
          )}
        >
          <span aria-hidden="true">+{hiddenCount}</span>
          <span className="sr-only">{t('more')}</span>
        </summary>

        {/*
         * The header is `fixed`, and therefore the containing block for this —
         * so `absolute` here means the full width of the bar, flush underneath
         * it, without the sheet needing to know anything about the layout.
         */}
        <div className="bg-background border-header-border absolute inset-x-0 top-full max-h-[calc(100dvh-68px)] overflow-y-auto border-b px-[clamp(20px,4vw,48px)] py-[clamp(24px,3vw,40px)]">
          <ul className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,190px),1fr))] gap-x-6">
            {localesByScript.map((group) => (
              <li key={group.script} className="contents">
                {/* Decoration: the list below names every language in itself,
                    and a screen reader gains nothing from "Aa". */}
                <p
                  aria-hidden="true"
                  className="text-faint col-span-full mt-6 mb-2 text-[13px] font-medium first:mt-0"
                >
                  {SCRIPT_SPECIMEN[group.script]} · {group.codes.length}
                </p>

                {group.codes.map((locale, index) => {
                  const isActive = locale === activeLocale

                  return (
                    <Link
                      key={locale}
                      href={pathname}
                      locale={locale}
                      hrefLang={localeHreflang[locale]}
                      aria-current={isActive ? 'true' : undefined}
                      className={cn(
                        'border-border flex items-baseline gap-3 rounded-sm border-b py-3',
                        isActive
                          ? 'text-foreground font-bold'
                          : 'text-foreground-soft hover:text-foreground font-medium',
                      )}
                    >
                      {/* The same bracketed ordinal the services and education
                          ledgers number themselves with. */}
                      <span aria-hidden="true" className="text-faint w-8 flex-none text-[12px]">
                        [{String(index + 1).padStart(2, '0')}]
                      </span>
                      <span lang={locale} className="flex-1 text-[15px] tracking-[-0.01em]">
                        {LOCALE_CATALOGUE[locale].endonym}
                      </span>
                      <span aria-hidden="true" className="text-faint flex-none text-[12px]">
                        {locale}
                      </span>
                    </Link>
                  )
                })}
              </li>
            ))}
          </ul>
        </div>
      </details>
    </nav>
  )
}
