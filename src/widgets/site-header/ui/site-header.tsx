import { useLocale, useTranslations } from 'next-intl'

import { LocaleSwitcher } from '@/features/locale-switch'
import { getPathname } from '@/shared/i18n/navigation'
import { Container } from '@/shared/ui'

import { DesktopNav } from './desktop-nav'
import { MobileNavPanel } from './mobile-nav-panel'
import { MobileNavToggle } from './mobile-nav-toggle'

/**
 * The fixed glass bar at the top of the document.
 *
 * A Server Component: only the edition mark and the two mobile-navigation leaves
 * ship JavaScript, and the bar itself renders as static markup.
 */
export function SiteHeader() {
  const t = useTranslations('Header')
  const locale = useLocale()

  return (
    <>
      <header
        data-testid="site-header"
        className="bg-header-bg border-header-border fixed inset-x-0 top-0 z-90 border-b backdrop-blur-[18px] backdrop-saturate-[1.4]"
      >
        <Container className="flex h-[68px] items-center justify-between gap-4">
          {/* The canonical home URL, not `#top`. This is the strongest internal
              link on the site — every page carries it — and it should point at
              a page rather than at a scroll position on whatever page the
              reader happens to be on. */}
          <a
            href={getPathname({ locale, href: '/' })}
            className="rounded-sm text-[20px] font-extrabold tracking-[-0.02em]"
          >
            {t('brand')}
          </a>

          <DesktopNav />

          <div className="flex items-center gap-[10px]">
            <LocaleSwitcher />

            <a
              href="#contact"
              className="bg-primary text-primary-foreground hover:bg-brand-blue rounded-sm px-[18px] py-[11px] text-[13.5px] font-semibold whitespace-nowrap transition-colors hover:text-white max-[500px]:hidden"
            >
              {t('contact')}
            </a>

            <MobileNavToggle />
          </div>
        </Container>

        {/* A sibling of the row rather than a child of it: the panel spans the
            whole bar and is positioned against the header, not the measure. */}
        <MobileNavPanel />
      </header>

      {/* The bar is taken out of flow, so the document owes it its own height —
          without this the first section starts underneath the glass. */}
      <div aria-hidden="true" className="h-[68px] shrink-0" />
    </>
  )
}
