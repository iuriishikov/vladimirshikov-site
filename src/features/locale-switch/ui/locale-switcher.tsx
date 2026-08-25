'use client'

import { useLocale, useTranslations } from 'next-intl'

import { Link, usePathname } from '@/shared/i18n/navigation'
import { localeLabels, type Locale } from '@/shared/i18n/routing'
import { cn } from '@/shared/lib/cn'

/**
 * The canvas puts English on the left of the pill, which is the opposite of the
 * routing order (Russian is the default locale and therefore listed first).
 */
const PILL_ORDER: readonly Locale[] = ['en', 'ru']

/**
 * Plain links, not a JavaScript-driven menu.
 *
 * Each locale gets a real, crawlable URL for the *current* page, which is what
 * search engines follow from the `hreflang` alternates — and it keeps working
 * if the JavaScript never arrives.
 */
export function LocaleSwitcher() {
  const t = useTranslations('LocaleSwitch')
  const activeLocale = useLocale()
  // next-intl returns the pathname without the locale prefix, so the same
  // value can be re-prefixed with any locale.
  const pathname = usePathname()

  return (
    <nav
      data-testid="locale-switcher"
      aria-label={t('label')}
      className="border-control-border bg-background relative flex items-center rounded-full border p-[3px]"
    >
      {/* The moving half of the track. Purely decorative: which locale is
          current is announced by `aria-current`, not by the highlight. */}
      <span
        aria-hidden="true"
        className={cn(
          'bg-foreground absolute top-[3px] bottom-[3px] left-[3px] w-[calc(50%_-_3px)] rounded-full',
          'transition-transform duration-[450ms] ease-[cubic-bezier(.3,1.35,.4,1)]',
          activeLocale === PILL_ORDER[0] ? 'translate-x-0' : 'translate-x-full',
        )}
      />

      {PILL_ORDER.map((locale) => {
        const isActive = locale === activeLocale

        return (
          <Link
            key={locale}
            href={pathname}
            locale={locale}
            data-testid={`locale-option-${locale}`}
            hrefLang={locale}
            aria-current={isActive ? 'true' : undefined}
            className={cn(
              'relative w-[38px] rounded-full py-2 text-center',
              'text-[11.5px] font-extrabold tracking-[0.06em] uppercase transition-colors',
              // The active label sits on the thumb, so it takes the background
              // colour and the thumb supplies its contrast.
              isActive ? 'text-background' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {locale}
            <span className="sr-only"> — {localeLabels[locale]}</span>
          </Link>
        )
      })}
    </nav>
  )
}
