import { useLocale, useTranslations } from 'next-intl'

import { NAV_SECTIONS } from '@/shared/config/site'
import { getPathname } from '@/shared/i18n/navigation'

/**
 * The in-page navigation shown from 761px up; below that the burger takes over.
 *
 * Every href carries the locale's home path in front of the fragment. A bare
 * `#cases` only means anything on the home document: on a project page or the
 * essay it points at a section that is not there, so the entire navigation went
 * dead the moment a visitor followed a link — which is also every internal link
 * a crawler could have followed back out of those pages.
 *
 * Still a plain anchor rather than the locale-aware `Link`: these stay Server
 * Components and ship no JavaScript, and an anchor re-scrolls when the same
 * entry is pressed twice, where `Link` only acts when the hash changes.
 */
export function DesktopNav() {
  const t = useTranslations('Header')
  const home = getPathname({ locale: useLocale(), href: '/' })

  return (
    <nav aria-label={t('navigationLabel')} className="hidden min-[761px]:block">
      <ul className="text-foreground-soft flex flex-wrap items-center gap-x-[clamp(14px,2.2vw,30px)] gap-y-2 text-[14px] font-medium">
        {NAV_SECTIONS.map((section) => (
          <li key={section.id}>
            <a
              href={`${home}#${section.id}`}
              className="rounded-sm transition-opacity hover:opacity-55"
            >
              {t(section.labelKey)}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
