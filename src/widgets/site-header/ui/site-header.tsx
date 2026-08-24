import { useTranslations } from 'next-intl'

import { LocaleSwitcher } from '@/features/locale-switch'
import { ThemeToggle } from '@/features/theme-switch'
import { Link } from '@/shared/i18n/navigation'
import { Container } from '@/shared/ui'

import { PrimaryNav } from './primary-nav'

/**
 * A Server Component that composes three client islands (nav, locale switcher,
 * theme toggle). Only those three ship JavaScript; the header shell does not.
 */
export function SiteHeader() {
  const t = useTranslations('Header')

  return (
    <header
      data-testid="site-header"
      className="border-border bg-background/80 sticky top-0 z-40 border-b backdrop-blur"
    >
      <Container className="relative flex h-16 items-center justify-between gap-4">
        <Link
          href="/"
          className="focus-visible:ring-ring rounded-md text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        >
          {t('brand')}
        </Link>

        <div className="flex items-center gap-2">
          <PrimaryNav />
          <LocaleSwitcher />
          <ThemeToggle />
        </div>
      </Container>
    </header>
  )
}
