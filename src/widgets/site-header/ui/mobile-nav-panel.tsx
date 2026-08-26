'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useEffect } from 'react'

import { NAV_SECTIONS } from '@/shared/config/site'
import { getPathname, usePathname } from '@/shared/i18n/navigation'
import { Container } from '@/shared/ui'

import { useMobileNavStore } from '../model/mobile-nav-store'

/**
 * The full-width panel that drops out of the bar below 761px.
 *
 * It stays in the DOM and carries `hidden` while closed, so the element that
 * the toggle's `aria-controls` names resolves in both states.
 */
export function MobileNavPanel() {
  const t = useTranslations('Header')
  const locale = useLocale()
  const pathname = usePathname()
  const isOpen = useMobileNavStore((state) => state.isOpen)
  const close = useMobileNavStore((state) => state.close)
  // Every entry is a section of the home document, so the fragment needs that
  // document in front of it or the panel is a list of dead links everywhere
  // except the home page.
  const home = getPathname({ locale, href: '/' })

  // Switching locale is a real navigation; arriving on the next document behind
  // an open overlay would strand the visitor. next-intl's `usePathname` reports
  // the path with the locale prefix already stripped, so on a locale switch it
  // never changes — the locale is the value that moves, and the panel would
  // otherwise stay open over the new document.
  useEffect(() => {
    close()
  }, [locale, pathname, close])

  return (
    <nav
      id="mobile-navigation"
      data-testid="mobile-nav-panel"
      aria-label={t('navigationLabel')}
      hidden={!isOpen}
      className="bg-header-solid border-header-border absolute inset-x-0 top-full border-b backdrop-blur-[18px] min-[761px]:hidden"
    >
      <Container className="pt-[6px] pb-4">
        <ul>
          {NAV_SECTIONS.map((section) => (
            <li key={section.id} className="border-border border-b">
              <MobileNavLink href={`${home}#${section.id}`} onSelect={close}>
                {t(section.labelKey)}
              </MobileNavLink>
            </li>
          ))}
          {/* Last in the list and without a rule under it — the panel's closing
              edge is the panel's own border. */}
          <li>
            <MobileNavLink href="#contact" onSelect={close}>
              {t('contact')}
            </MobileNavLink>
          </li>
        </ul>
      </Container>
    </nav>
  )
}

interface MobileNavLinkProps {
  href: string
  onSelect: () => void
  children: string
}

function MobileNavLink({ href, onSelect, children }: MobileNavLinkProps) {
  return (
    <a href={href} onClick={onSelect} className="block py-[14px] text-[16px] font-semibold">
      {children}
    </a>
  )
}
