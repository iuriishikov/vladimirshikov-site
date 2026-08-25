'use client'

import { useTranslations } from 'next-intl'
import { useTheme } from 'next-themes'

import { cn } from '@/shared/lib/cn'
import { useIsMounted } from '@/shared/lib/use-is-mounted'

const LABEL_CLASSNAME =
  'relative flex w-[76px] items-center justify-center gap-[7px] py-2 text-[11px] font-extrabold tracking-[0.09em] transition-colors duration-300'

const DOT_CLASSNAME = 'box-border size-[9px] rounded-full'

/**
 * The Light/Dark pill: a lime thumb that slides under whichever half is active.
 *
 * The `mounted` guard is not ceremony: the server cannot know the resolved
 * theme, so committing to a thumb position immediately would guarantee a
 * hydration mismatch. Until mount the pill renders the light state — exactly
 * what the server produced — and slides into place once the theme is known.
 */
export function ThemeToggle() {
  const t = useTranslations('ThemeSwitch')
  const { resolvedTheme, setTheme } = useTheme()
  const isMounted = useIsMounted()

  const isDark = isMounted && resolvedTheme === 'dark'
  const nextTheme = isDark ? 'light' : 'dark'

  return (
    <button
      type="button"
      data-testid="theme-toggle"
      // The name stays the same in both states: a control whose accessible name
      // flips is announced as a different control every time it is used.
      aria-label={t('label')}
      // Announces what the control switches *to*, which is what someone needs
      // before activating it.
      title={t(isMounted ? nextTheme : 'label')}
      onClick={() => {
        setTheme(nextTheme)
      }}
      className="relative flex cursor-pointer items-center rounded-full border border-white/20 bg-white/5 p-1"
    >
      <span
        aria-hidden="true"
        className={cn(
          'bg-brand-lime absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] rounded-full transition-transform duration-[450ms] ease-[cubic-bezier(.3,1.35,.4,1)]',
          isDark ? 'translate-x-full' : 'translate-x-0',
        )}
      />

      <span className={cn(LABEL_CLASSNAME, isDark ? 'text-footer-muted' : 'text-[#111110]')}>
        <span aria-hidden="true" className={cn(DOT_CLASSNAME, 'border-2 border-current')} />
        {t('light')}
      </span>

      <span className={cn(LABEL_CLASSNAME, isDark ? 'text-[#111110]' : 'text-footer-muted')}>
        <span aria-hidden="true" className={cn(DOT_CLASSNAME, 'bg-current')} />
        {t('dark')}
      </span>
    </button>
  )
}
