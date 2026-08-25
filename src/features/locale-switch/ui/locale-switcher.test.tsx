import type { ComponentProps } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { renderWithProviders, screen } from '@/shared/test/render'

import { LocaleSwitcher } from './locale-switcher'

/**
 * next-intl's `Link` needs a live Next.js router, which does not exist in
 * jsdom. The stub reproduces the one thing this component depends on: the
 * `locale` prop turning into the prefix of the rendered href.
 */
vi.mock('@/shared/i18n/navigation', () => ({
  usePathname: () => '/',
  Link: ({
    href,
    locale,
    children,
    ...rest
  }: ComponentProps<'a'> & { href: string; locale: string }) => (
    <a href={`/${locale}${href}`} {...rest}>
      {children}
    </a>
  ),
}))

describe('LocaleSwitcher', () => {
  it('is a labelled landmark carrying one crawlable link per locale', () => {
    renderWithProviders(<LocaleSwitcher />)

    expect(screen.getByTestId('locale-switcher')).toHaveAccessibleName('Язык')
    // Real hrefs, not a script-driven menu: a crawler has to be able to follow
    // them, and they have to keep working without JavaScript.
    expect(screen.getByTestId('locale-option-ru')).toHaveAttribute('href', '/ru/')
    expect(screen.getByTestId('locale-option-en')).toHaveAttribute('href', '/en/')
  })

  it('marks the active locale for assistive technology', () => {
    renderWithProviders(<LocaleSwitcher />, { locale: 'ru' })

    // `aria-current` is what a screen reader announces; the sliding thumb is
    // only the sighted half of the same information.
    expect(screen.getByTestId('locale-option-ru')).toHaveAttribute('aria-current', 'true')
    expect(screen.getByTestId('locale-option-en')).not.toHaveAttribute('aria-current')
  })

  it('follows the rendered locale rather than a fixed default', () => {
    renderWithProviders(<LocaleSwitcher />, { locale: 'en' })

    expect(screen.getByTestId('locale-option-en')).toHaveAttribute('aria-current', 'true')
    expect(screen.getByTestId('locale-option-ru')).not.toHaveAttribute('aria-current')
  })

  it('names each option in its own language, so "EN" is not the whole label', () => {
    renderWithProviders(<LocaleSwitcher />)

    // Two letters alone are ambiguous when announced out of context. The name
    // is matched loosely because the accessible-name algorithm collapses the
    // whitespace around the visually hidden half.
    expect(screen.getByTestId('locale-option-en')).toHaveAccessibleName(/^en\s*—\s*English$/)
    expect(screen.getByTestId('locale-option-ru')).toHaveAccessibleName(/^ru\s*—\s*Русский$/)
  })
})
