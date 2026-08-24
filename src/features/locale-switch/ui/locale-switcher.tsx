'use client'

import { useLocale, useTranslations } from 'next-intl'

import { Link, usePathname } from '@/shared/i18n/navigation'
import { localeLabels, routing } from '@/shared/i18n/routing'
import { cn } from '@/shared/lib/cn'

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
    <nav data-testid="locale-switcher" aria-label={t('label')} className="flex items-center gap-1">
      {routing.locales.map((locale) => {
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
              'rounded-md px-2 py-1 text-xs font-medium uppercase transition-colors',
              'focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2',
              'focus-visible:ring-offset-background outline-none',
              isActive
                ? 'bg-accent text-accent-foreground'
                : 'text-muted-foreground hover:text-foreground',
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
