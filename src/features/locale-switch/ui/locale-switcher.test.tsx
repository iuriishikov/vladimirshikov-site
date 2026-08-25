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

    // `aria-current` is what a screen reader announces; the brackets and the
    // weight are only the sighted half of the same information.
    expect(screen.getByTestId('locale-option-ru')).toHaveAttribute('aria-current', 'true')
    expect(screen.getByTestId('locale-option-en')).not.toHaveAttribute('aria-current')
  })

  it('follows the rendered locale rather than a fixed default', () => {
    renderWithProviders(<LocaleSwitcher />, { locale: 'en' })

    expect(screen.getByTestId('locale-option-en')).toHaveAttribute('aria-current', 'true')
    expect(screen.getByTestId('locale-option-ru')).not.toHaveAttribute('aria-current')
  })

  it('brackets the current edition in the markup, not in the stylesheet', () => {
    renderWithProviders(<LocaleSwitcher />, { locale: 'ru' })

    // Strip the CSS and the page still says which edition you are reading.
    // Only the active option renders brackets at all, which is also why the
    // pair keeps its width whichever locale is current.
    expect(screen.getByTestId('locale-option-ru')).toHaveTextContent('[ru]')
    expect(screen.getByTestId('locale-option-en')).not.toHaveTextContent('[')
  })

  it('keeps the brackets out of what is announced', () => {
    renderWithProviders(<LocaleSwitcher />, { locale: 'ru' })

    // `aria-current` already says which one is current; a bracket read aloud
    // would be a second, worse telling of the same thing.
    const brackets = screen.getByTestId('locale-option-ru').querySelectorAll('[aria-hidden="true"]')

    expect(brackets).toHaveLength(2)
  })

  it('declares the language of each language name', () => {
    renderWithProviders(<LocaleSwitcher />)

    // WCAG 3.1.2. Without this an English voice reads "Русский" in English.
    const name = screen.getByTestId('locale-option-ru').querySelector('.sr-only')
    expect(name).toHaveAttribute('lang', 'ru')
  })

  it('advertises each destination with a full BCP 47 tag', () => {
    renderWithProviders(<LocaleSwitcher />)

    // It has to agree with the alternates the sitemap and the page metadata
    // emit for these very URLs, rather than offer a looser second spelling.
    expect(screen.getByTestId('locale-option-ru')).toHaveAttribute('hreflang', 'ru-RU')
    expect(screen.getByTestId('locale-option-en')).toHaveAttribute('hreflang', 'en-US')
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
