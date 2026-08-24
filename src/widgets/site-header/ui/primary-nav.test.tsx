import type { ComponentProps } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { renderWithProviders, screen } from '@/shared/test/render'

import { useMobileNavStore } from '../model/mobile-nav-store'
import { PrimaryNav } from './primary-nav'

/**
 * next-intl's navigation helpers need a live Next.js router, which does not
 * exist in jsdom. Replacing them with a plain anchor keeps this test about the
 * component's own logic — the active state and the mobile menu — rather than
 * about the router.
 */
const currentPathname = vi.fn(() => '/')

vi.mock('@/shared/i18n/navigation', () => ({
  usePathname: () => currentPathname(),
  Link: ({ href, children, ...rest }: ComponentProps<'a'> & { href: string }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}))

beforeEach(() => {
  currentPathname.mockReturnValue('/')
  useMobileNavStore.setState({ isOpen: false })
})

describe('PrimaryNav', () => {
  it('exposes each navigation item exactly once while the menu is closed', () => {
    renderWithProviders(<PrimaryNav />)

    // The markup contains both a desktop and a mobile copy of every link, but
    // the collapsed panel carries `hidden`, so assistive technology sees one of
    // each. Duplicated links in the accessibility tree are a real defect.
    expect(screen.getAllByRole('link', { name: 'Главная' })).toHaveLength(1)
    expect(screen.getAllByRole('link', { name: 'Обо мне' })).toHaveLength(1)
  })

  it('exposes the mobile copy once the panel is open', async () => {
    const { user } = renderWithProviders(<PrimaryNav />)

    await user.click(screen.getByTestId('mobile-nav-toggle'))

    expect(screen.getAllByRole('link', { name: 'Главная' })).toHaveLength(2)
  })

  it('marks the current page for assistive technology', () => {
    currentPathname.mockReturnValue('/about')
    renderWithProviders(<PrimaryNav />)

    // `aria-current` is what a screen reader announces; the colour change is
    // only the sighted half of the same information.
    const aboutLinks = screen.getAllByRole('link', { name: 'Обо мне' })
    const homeLinks = screen.getAllByRole('link', { name: 'Главная' })

    for (const link of aboutLinks) {
      expect(link).toHaveAttribute('aria-current', 'page')
    }
    for (const link of homeLinks) {
      expect(link).not.toHaveAttribute('aria-current')
    }
  })

  it('keeps the mobile panel hidden until the toggle is pressed', async () => {
    const { user } = renderWithProviders(<PrimaryNav />)
    const toggle = screen.getByTestId('mobile-nav-toggle')

    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(toggle).toHaveAccessibleName('Открыть меню')

    await user.click(toggle)

    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    expect(toggle).toHaveAccessibleName('Закрыть меню')
  })

  it('points aria-controls at an element that exists in both states', () => {
    renderWithProviders(<PrimaryNav />)

    const controls = screen.getByTestId('mobile-nav-toggle').getAttribute('aria-controls')
    expect(controls).toBe('mobile-navigation')
    // Present but hidden, rather than absent: a dangling aria-controls is a
    // broken promise to a screen reader.
    expect(document.querySelector('#mobile-navigation')).toBeInTheDocument()
  })

  it('closes the menu when the route changes', () => {
    useMobileNavStore.setState({ isOpen: true })
    const { rerender } = renderWithProviders(<PrimaryNav />)

    currentPathname.mockReturnValue('/about')
    rerender(<PrimaryNav />)

    // Otherwise the visitor lands on the next page behind an open overlay.
    expect(useMobileNavStore.getState().isOpen).toBe(false)
  })
})
