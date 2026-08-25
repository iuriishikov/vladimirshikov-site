import { useTranslations } from 'next-intl'

import { NAV_SECTIONS } from '@/shared/config/site'

/**
 * The in-page navigation shown from 761px up; below that the burger takes over.
 *
 * Every entry is a fragment on the same document, which is why these are plain
 * anchors: the locale-aware `Link` would rewrite `#about` into `/ru#about` and
 * turn a scroll into a full navigation.
 */
export function DesktopNav() {
  const t = useTranslations('Header')

  return (
    <nav aria-label={t('navigationLabel')} className="hidden min-[761px]:block">
      <ul className="text-foreground-soft flex flex-wrap items-center gap-x-[clamp(14px,2.2vw,30px)] gap-y-2 text-[14px] font-medium">
        {NAV_SECTIONS.map((section) => (
          <li key={section.id}>
            <a href={`#${section.id}`} className="rounded-sm transition-opacity hover:opacity-55">
              {t(section.labelKey)}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
