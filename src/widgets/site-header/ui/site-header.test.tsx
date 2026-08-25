import type * as NextIntl from 'next-intl'
import type { ComponentProps } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { Locale } from '@/shared/i18n/routing'
import { act, renderWithProviders, screen, within } from '@/shared/test/render'

import { useMobileNavStore } from '../model/mobile-nav-store'
import { SiteHeader } from './site-header'

/**
 * next-intl's navigation helpers need a live Next.js router, which does not
 * exist in jsdom. A plain anchor keeps these tests about the header's own
 * behaviour rather than about the router.
 */
const currentPathname = vi.fn(() => '/')

vi.mock('@/shared/i18n/navigation', () => ({
  usePathname: () => currentPathname(),
  // The real one prefixes the locale; the stub reproduces exactly that, which
  // is the only thing the header asks of it.
  getPathname: ({ locale, href }: { locale: string; href: string }) =>
    href === '/' ? `/${locale}` : `/${locale}${href}`,
  Link: ({ href, children, ...rest }: ComponentProps<'a'> & { href: string }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}))

/**
 * The provider's locale is fixed for the lifetime of a render, so a locale
 * switch can only be simulated by moving what `useLocale` reports.
 */
const currentLocale = vi.fn((): Locale => 'ru')

vi.mock('next-intl', async (importOriginal) => ({
  ...(await importOriginal<typeof NextIntl>()),
  useLocale: () => currentLocale(),
}))

/** Zustand stores are module singletons, so state leaks between tests. */
beforeEach(() => {
  currentPathname.mockReturnValue('/')
  currentLocale.mockReturnValue('ru')
  useMobileNavStore.setState({ isOpen: false })
})

describe('SiteHeader', () => {
  it('renders the wordmark and the contact call to action from the dictionary', () => {
    renderWithProviders(<SiteHeader />)

    expect(screen.getByTestId('site-header')).toBeInTheDocument()
    // The canonical home URL: this link is on every page, and pointing it at a
    // scroll position would waste the strongest internal link the site has.
    expect(screen.getByRole('link', { name: 'Шиков.В' })).toHaveAttribute('href', '/ru')
    expect(screen.getByRole('link', { name: 'Связаться →' })).toHaveAttribute('href', '#contact')
  })

  it('points every navigation entry at the section it names', () => {
    renderWithProviders(<SiteHeader />)

    const nav = screen.getByRole('navigation', { name: 'Основная навигация' })
    const entries = [
      { label: 'Главная', href: '/ru#top' },
      { label: 'Обо мне', href: '/ru#about' },
      { label: 'Что я делаю', href: '/ru#services' },
      { label: 'Проекты', href: '/ru#cases' },
      { label: 'Статьи', href: '/ru#blog' },
    ]

    for (const entry of entries) {
      // The home document in front of every fragment. A bare `#cases` means
      // something only on the home page: from a project page or the essay the
      // whole navigation would point at sections that are not there.
      expect(within(nav).getByRole('link', { name: entry.label })).toHaveAttribute(
        'href',
        entry.href,
      )
    }
  })

  it('exposes each navigation entry exactly once while the panel is closed', () => {
    renderWithProviders(<SiteHeader />)

    // The markup carries a desktop and a mobile copy of every link; the closed
    // panel is `hidden`, so assistive technology sees one of each. Duplicated
    // links in the accessibility tree are a real defect.
    expect(screen.getAllByRole('link', { name: 'Обо мне' })).toHaveLength(1)
  })

  it('opens and closes the mobile panel, reporting its state on the toggle', async () => {
    const { user } = renderWithProviders(<SiteHeader />)
    const toggle = screen.getByTestId('mobile-nav-toggle')

    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(toggle).toHaveAccessibleName('Открыть меню')

    await user.click(toggle)

    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    expect(toggle).toHaveAccessibleName('Закрыть меню')
    expect(screen.getAllByRole('link', { name: 'Обо мне' })).toHaveLength(2)
  })

  it('points aria-controls at an element that exists in both states', () => {
    renderWithProviders(<SiteHeader />)

    const controls = screen.getByTestId('mobile-nav-toggle').getAttribute('aria-controls')
    expect(controls).toBe('mobile-navigation')
    // Present but hidden, rather than absent: a dangling aria-controls is a
    // broken promise to a screen reader.
    expect(document.querySelector('#mobile-navigation')).toBeInTheDocument()
  })

  it('offers the contact call to action inside the panel, where the button is hidden', async () => {
    const { user } = renderWithProviders(<SiteHeader />)

    await user.click(screen.getByTestId('mobile-nav-toggle'))

    const panel = within(screen.getByTestId('mobile-nav-panel'))
    expect(panel.getByRole('link', { name: 'Связаться →' })).toHaveAttribute('href', '#contact')
  })

  it('closes the panel when a section is chosen', async () => {
    const { user } = renderWithProviders(<SiteHeader />)

    await user.click(screen.getByTestId('mobile-nav-toggle'))
    const panel = within(screen.getByTestId('mobile-nav-panel'))
    await user.click(panel.getByRole('link', { name: 'Проекты' }))

    // Leaving it open would cover the section the visitor just jumped to.
    expect(useMobileNavStore.getState().isOpen).toBe(false)
  })

  it('closes the panel when the route changes', () => {
    const { rerender } = renderWithProviders(<SiteHeader />)
    // Opened after mount on purpose: the panel also closes itself as it mounts,
    // and opening beforehand would let that run satisfy the assertion.
    act(() => {
      useMobileNavStore.setState({ isOpen: true })
    })

    currentPathname.mockReturnValue('/about')
    rerender(<SiteHeader />)

    expect(useMobileNavStore.getState().isOpen).toBe(false)
  })

  it('closes the panel when the locale switch navigates to the other locale', () => {
    const { rerender } = renderWithProviders(<SiteHeader />)
    act(() => {
      useMobileNavStore.setState({ isOpen: true })
    })

    // The edition mark stays in the bar below 761px, so a visitor can switch
    // language with the panel open — and `usePathname` does not move when they do.
    currentLocale.mockReturnValue('en')
    rerender(<SiteHeader />)

    expect(useMobileNavStore.getState().isOpen).toBe(false)
  })
})
