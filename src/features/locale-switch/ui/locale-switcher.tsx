'use client'

import { useLocale, useTranslations } from 'next-intl'

import { Link, usePathname } from '@/shared/i18n/navigation'
import { localeHreflang, localeLabels, routing } from '@/shared/i18n/routing'
import { cn } from '@/shared/lib/cn'

/**
 * The edition mark: `[ru] en` — two codes set as type rather than built as a
 * control, with the site's own bracket around the one you are reading.
 *
 * Plain links, not a JavaScript-driven menu. Each locale gets a real, crawlable
 * URL for the *current* page, which is what a crawler follows from the
 * `hreflang` alternates, and it keeps working if the JavaScript never arrives.
 * `useLocale()` is known on the server, so unlike the theme toggle this needs no
 * mounted guard: the first HTML already marks the right edition.
 *
 * Nothing here is filled, bordered or rounded, and that is the point. The bar is
 * glass, so an opaque track paints a flat hole in it; the previous pill also put
 * a second black shape a few pixels from the black Contact button and repeated
 * the sliding thumb the theme toggle already uses. Dropping the box leaves the
 * button as the bar's one filled element.
 *
 * The brackets are the house ornament doing the job it already does elsewhere:
 * the services and education rows number themselves `[01]` in `text-faint
 * text-[14px] font-medium`, which is the register used here — and the same 14px
 * as the navigation on the other side of the bar.
 *
 * Which edition is current is said by the markup, not by the stylesheet: only
 * the active option renders brackets at all, so with CSS stripped the text is
 * still `[ru] en`. Exactly one term is bracketed either way, so the pair keeps
 * its width across `/ru` and `/en` without reserving anything.
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
      className="flex items-center text-[14px] leading-none"
    >
      {/* Routing order, so the default locale reads first and a third one would
          simply add a third term — none of this is arithmetic on "half". */}
      {routing.locales.map((locale) => {
        const isActive = locale === activeLocale

        return (
          <Link
            key={locale}
            href={pathname}
            locale={locale}
            data-testid={`locale-option-${locale}`}
            // The full BCP 47 tag, so the anchor agrees with the alternates
            // `shared/lib/seo` and the sitemap already emit for these URLs
            // rather than offering a second, looser spelling of them.
            hrefLang={localeHreflang[locale]}
            aria-current={isActive ? 'true' : undefined}
            className={cn(
              // The box is invisible but generous: this is the one control that
              // never leaves the bar, down to 320px, and it has no border to
              // enlarge. `rounded-sm` paints nothing — it is the radius the
              // global focus ring traces.
              'flex h-11 min-w-[36px] items-center justify-center rounded-sm px-1',
              isActive
                ? // No hover response on the current edition: it links to the
                  // page already on screen.
                  'text-foreground font-bold'
                : // Hover stops one step short of full ink, so the term under
                  // the pointer never ends up looking like the current one.
                  'text-muted-foreground hover:text-foreground-soft font-medium',
            )}
          >
            {/* Decoration, so `aria-current` keeps the announcing to itself and
                the accessible name stays "ru — Русский". A weight below the code
                it encloses: the bracket marks the term, it does not compete. */}
            {isActive && (
              <span aria-hidden="true" className="text-faint font-medium">
                [
              </span>
            )}
            {locale}
            {isActive && (
              <span aria-hidden="true" className="text-faint font-medium">
                ]
              </span>
            )}
            {/* Two letters are ambiguous read aloud; the name a language gives
                itself is not. `lang` is what stops an English voice reading
                "Русский" — `hrefLang` describes the destination, not this
                text. */}
            <span lang={locale} className="sr-only">
              {' '}
              — {localeLabels[locale]}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
