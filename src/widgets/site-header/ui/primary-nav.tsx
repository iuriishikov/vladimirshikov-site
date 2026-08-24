'use client'

import { MenuIcon, XIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect } from 'react'

import { Link, usePathname } from '@/shared/i18n/navigation'
import { cn } from '@/shared/lib/cn'
import { Button } from '@/shared/ui'

import { useMobileNavStore } from '../model/mobile-nav-store'
import { NAV_ITEMS } from '../model/nav-items'

export function PrimaryNav() {
  const t = useTranslations('Header')
  const pathname = usePathname()
  const isOpen = useMobileNavStore((state) => state.isOpen)
  const toggle = useMobileNavStore((state) => state.toggle)
  const close = useMobileNavStore((state) => state.close)

  const labels = { home: t('nav.home'), about: t('nav.about') }

  // Leaving a page with the menu still open would strand the visitor behind an
  // overlay on the next one.
  useEffect(() => {
    close()
  }, [pathname, close])

  return (
    <>
      <nav aria-label={t('navigationLabel')} className="hidden md:block">
        <ul className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <NavLink
                href={item.href}
                label={labels[item.messageKey]}
                isActive={pathname === item.href}
              />
            </li>
          ))}
        </ul>
      </nav>

      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        aria-expanded={isOpen}
        aria-controls="mobile-navigation"
        aria-label={t(isOpen ? 'closeMenu' : 'openMenu')}
        data-testid="mobile-nav-toggle"
        onClick={toggle}
      >
        {isOpen ? <XIcon aria-hidden="true" /> : <MenuIcon aria-hidden="true" />}
      </Button>

      {/* Kept in the DOM and hidden, so the expanded/collapsed state that
          aria-controls points at always resolves to a real element. */}
      <nav
        id="mobile-navigation"
        aria-label={t('navigationLabel')}
        hidden={!isOpen}
        className="border-border bg-background absolute inset-x-0 top-full border-b p-4 md:hidden"
      >
        <ul className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <NavLink
                href={item.href}
                label={labels[item.messageKey]}
                isActive={pathname === item.href}
                className="block w-full"
              />
            </li>
          ))}
        </ul>
      </nav>
    </>
  )
}

interface NavLinkProps {
  href: string
  label: string
  isActive: boolean
  className?: string
}

function NavLink({ href, label, isActive, className }: NavLinkProps) {
  return (
    <Link
      href={href}
      // `aria-current="page"` is what a screen reader announces; the colour
      // change is only the sighted half of the same information.
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'rounded-md px-3 py-2 text-sm font-medium transition-colors',
        'focus-visible:ring-ring focus-visible:ring-offset-background outline-none',
        'focus-visible:ring-2 focus-visible:ring-offset-2',
        isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
        className,
      )}
    >
      {label}
    </Link>
  )
}
