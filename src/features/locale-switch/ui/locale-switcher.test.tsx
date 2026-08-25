import type { ComponentProps } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { routing } from '@/shared/i18n/routing'
import { renderWithProviders, screen, within } from '@/shared/test/render'

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

  it('advertises each destination with the same tag the alternates use', () => {
    renderWithProviders(<LocaleSwitcher />)

    // It has to agree with the alternates the sitemap and the page metadata
    // emit for these very URLs, rather than offer a second spelling of them.
    // Bare subtags: there is one edition per language, so a region would be
    // telling a crawler to narrow the audience for no reason.
    expect(screen.getByTestId('locale-option-ru')).toHaveAttribute('hreflang', 'ru')
    expect(screen.getByTestId('locale-option-en')).toHaveAttribute('hreflang', 'en')
  })

  it('keeps only the two primary editions in the bar', () => {
    renderWithProviders(<LocaleSwitcher />, { locale: 'ru' })

    // Forty codes is not a header bar. The rest are one press away.
    expect(screen.getByTestId('locale-option-en')).toBeInTheDocument()
    expect(screen.getByTestId('locale-option-ru')).toBeInTheDocument()
    expect(screen.queryByTestId('locale-option-kk')).not.toBeInTheDocument()
    expect(screen.getByTestId('locale-index-toggle')).toHaveTextContent(
      `+${String(routing.locales.length - 2)}`,
    )
  })

  it('lists every edition in the index, each in its own language', () => {
    renderWithProviders(<LocaleSwitcher />)

    const index = screen.getByTestId('locale-index')
    const links = within(index).getAllByRole('link')

    // One per edition, including the two already in the bar: the index is the
    // whole catalogue, not the remainder of it.
    expect(links).toHaveLength(routing.locales.length)
    expect(within(index).getByText('Қазақша')).toBeInTheDocument()
    expect(within(index).getByText('Tiếng Việt')).toBeInTheDocument()
  })

  it('declares the language of every endonym it sets', () => {
    // WCAG 3.1.2 again, and forty times over: without `lang` a screen reader
    // reads "Українська" with an English voice.
    renderWithProviders(<LocaleSwitcher />)

    const index = screen.getByTestId('locale-index')
    expect(within(index).getByText('Українська')).toHaveAttribute('lang', 'uk')
    expect(within(index).getByText('Türkçe')).toHaveAttribute('lang', 'tr')
  })

  it('opens the index without JavaScript having to run', () => {
    renderWithProviders(<LocaleSwitcher />)

    // A <details>, so the disclosure is the browser's rather than ours. The
    // Escape and click-away handlers are conveniences on top of it.
    const index = screen.getByTestId('locale-index')
    expect(index.tagName).toBe('DETAILS')
    expect(index.querySelector('summary')).not.toBeNull()
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
