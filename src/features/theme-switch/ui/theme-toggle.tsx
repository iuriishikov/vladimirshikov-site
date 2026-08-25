'use client'

import { useTranslations } from 'next-intl'
import { useTheme } from 'next-themes'

import { cn } from '@/shared/lib/cn'
import { useIsMounted } from '@/shared/lib/use-is-mounted'

/**
 * The three states the provider actually has, in the order they run from
 * lightest to darkest — so the thumb travels the way the theme does.
 */
const OPTIONS = ['light', 'system', 'dark'] as const

type ThemeOption = (typeof OPTIONS)[number]

function isThemeOption(value: string | undefined): value is ThemeOption {
  return OPTIONS.includes(value as ThemeOption)
}

/**
 * `flex-1` rather than a fixed width: the three labels are translated into forty
 * languages, and equal flexible thirds keep the thumb's arithmetic true whatever
 * the longest word turns out to be. The minimum is what the Russian set needs.
 */
const OPTION_CLASSNAME =
  'relative flex min-w-[58px] flex-1 cursor-pointer items-center justify-center gap-[6px] px-2 py-2 text-[11px] font-extrabold tracking-[0.09em] transition-colors duration-300'

const DOT_CLASSNAME = 'box-border size-[9px] rounded-full'

/**
 * The Light / Auto / Dark control: a lime thumb that slides under the active
 * segment.
 *
 * Three segments rather than two because `system` is the provider's default and
 * has to be reachable. A two-state toggle makes the first press a one-way door:
 * the site is pinned to a colour for good and can never follow the operating
 * system again, which is exactly the state most visitors arrive in.
 *
 * The `mounted` guard is not ceremony: the server cannot know the stored
 * preference, so committing to a thumb position immediately would guarantee a
 * hydration mismatch. Until mount the control shows `system` — the default the
 * provider is configured with, and therefore what the server's HTML implies.
 *
 * Buttons with `aria-pressed`, not a radio group: these are Tab-reachable one
 * by one, which is what a group of buttons promises. A radio group would owe
 * the visitor arrow-key navigation and a roving tabindex that this does not
 * implement.
 */
export function ThemeToggle() {
  const t = useTranslations('ThemeSwitch')
  const { theme, setTheme } = useTheme()
  const isMounted = useIsMounted()

  const active: ThemeOption = isMounted && isThemeOption(theme) ? theme : 'system'

  return (
    <div
      role="group"
      data-testid="theme-toggle"
      // The name stays the same in every state: a control whose accessible name
      // flips is announced as a different control every time it is used.
      aria-label={t('label')}
      className="relative flex items-center rounded-full border border-white/20 bg-white/5 p-1"
    >
      <span
        aria-hidden="true"
        className={cn(
          'bg-brand-lime absolute top-1 bottom-1 left-1 w-[calc((100%-8px)/3)] rounded-full',
          'transition-transform duration-[450ms] ease-[cubic-bezier(.3,1.35,.4,1)]',
          active === 'system' && 'translate-x-full',
          active === 'dark' && 'translate-x-[200%]',
        )}
      />

      {OPTIONS.map((option) => {
        const isActive = option === active

        return (
          <button
            key={option}
            type="button"
            data-testid={`theme-option-${option}`}
            aria-pressed={isActive}
            onClick={() => {
              setTheme(option)
            }}
            className={cn(
              OPTION_CLASSNAME,
              // The active label sits on the thumb, so it takes the dark ink
              // and the thumb supplies its contrast.
              isActive ? 'text-[#111110]' : 'text-footer-muted hover:text-footer-foreground',
            )}
          >
            {/* Outline, half, solid: the dot says the same thing as the label
                and the thumb, for anyone reading the shapes rather than the
                words. Decoration — `aria-pressed` does the announcing. */}
            {option === 'light' && (
              <span aria-hidden="true" className={cn(DOT_CLASSNAME, 'border-2 border-current')} />
            )}
            {option === 'system' && (
              <span
                aria-hidden="true"
                className={cn(DOT_CLASSNAME, 'relative overflow-hidden border-2 border-current')}
              >
                <span className="absolute inset-y-0 left-0 w-1/2 bg-current" />
              </span>
            )}
            {option === 'dark' && (
              <span aria-hidden="true" className={cn(DOT_CLASSNAME, 'bg-current')} />
            )}

            {t(option)}
          </button>
        )
      })}
    </div>
  )
}
