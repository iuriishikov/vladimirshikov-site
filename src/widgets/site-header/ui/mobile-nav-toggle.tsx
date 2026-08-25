'use client'

import { useTranslations } from 'next-intl'

import { useMobileNavStore } from '../model/mobile-nav-store'

/** The three-bar button that opens the panel below the bar, up to 760px. */
export function MobileNavToggle() {
  const t = useTranslations('Header')
  const isOpen = useMobileNavStore((state) => state.isOpen)
  const toggle = useMobileNavStore((state) => state.toggle)

  return (
    <button
      type="button"
      data-testid="mobile-nav-toggle"
      aria-expanded={isOpen}
      aria-controls="mobile-navigation"
      aria-label={t(isOpen ? 'closeMenu' : 'openMenu')}
      onClick={toggle}
      className="border-control-border bg-background flex size-[42px] items-center justify-center rounded-md border min-[761px]:hidden"
    >
      <span aria-hidden="true" className="flex flex-col items-center gap-1">
        <span className="bg-foreground block h-0.5 w-4 rounded-[2px]" />
        <span className="bg-foreground block h-0.5 w-4 rounded-[2px]" />
        <span className="bg-foreground block h-0.5 w-4 rounded-[2px]" />
      </span>
    </button>
  )
}
