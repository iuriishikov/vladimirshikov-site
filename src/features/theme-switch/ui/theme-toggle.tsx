'use client'

import { MoonIcon, SunIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useTheme } from 'next-themes'

import { useIsMounted } from '@/shared/lib/use-is-mounted'
import { Button } from '@/shared/ui'

/**
 * Toggles between light and dark, honouring the system preference until the
 * visitor states one of their own.
 *
 * The `mounted` guard is not ceremony: the server cannot know the resolved
 * theme, so rendering the real icon immediately would guarantee a hydration
 * mismatch. Until mount, the markup matches what the server produced.
 */
export function ThemeToggle() {
  const t = useTranslations('ThemeSwitch')
  const { resolvedTheme, setTheme } = useTheme()
  const isMounted = useIsMounted()

  const isDark = resolvedTheme === 'dark'
  const nextTheme = isDark ? 'light' : 'dark'

  return (
    <Button
      variant="ghost"
      size="icon"
      data-testid="theme-toggle"
      aria-label={t('label')}
      // Announces what the control switches *to*, which is what a screen
      // reader user needs before activating it.
      title={t(isMounted ? nextTheme : 'label')}
      onClick={() => {
        setTheme(nextTheme)
      }}
    >
      {isMounted && isDark ? (
        <SunIcon aria-hidden="true" />
      ) : (
        <MoonIcon aria-hidden="true" className={isMounted ? undefined : 'opacity-0'} />
      )}
    </Button>
  )
}
