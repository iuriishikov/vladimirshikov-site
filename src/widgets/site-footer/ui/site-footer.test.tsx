import type { ComponentProps } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { renderWithProviders, screen, within } from '@/shared/test/render'

import { SiteFooter } from './site-footer'

vi.mock('@/shared/i18n/navigation', () => ({
  usePathname: () => '/',
  Link: ({ href, children, ...rest }: ComponentProps<'a'> & { href: string }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}))

describe('SiteFooter', () => {
  it('renders the contact call to action from the dictionary', () => {
    renderWithProviders(<SiteFooter />)

    expect(
      screen.getByRole('heading', { name: /Иногда собственнику нужен не проект/ }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Написать →' })).toHaveAttribute(
      'href',
      'mailto:hello@vladimirshikov.com',
    )
  })

  it('links the oversized address at the e-mail, arrow excluded from its name', () => {
    renderWithProviders(<SiteFooter />)

    // Two links carry the address — the oversized one and the contact column.
    const mailLinks = screen.getAllByRole('link', { name: 'hello@vladimirshikov.com' })

    expect(mailLinks).toHaveLength(2)
    for (const link of mailLinks) {
      expect(link).toHaveAttribute('href', 'mailto:hello@vladimirshikov.com')
    }
  })

  it('names every column navigation so the landmarks stay distinguishable', () => {
    renderWithProviders(<SiteFooter />)

    const menu = screen.getByRole('navigation', { name: 'Меню' })

    expect(within(menu).getAllByRole('listitem')).toHaveLength(5)
    expect(within(menu).getByRole('link', { name: 'Что я делаю' })).toHaveAttribute(
      'href',
      '#services',
    )
    expect(screen.getByRole('navigation', { name: 'Проекты' })).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Статьи' })).toBeInTheDocument()
  })

  it('lists every project and every note at its own route', () => {
    renderWithProviders(<SiteFooter />)

    const cases = screen.getByRole('navigation', { name: 'Проекты' })
    const blog = screen.getByRole('navigation', { name: 'Статьи' })

    expect(within(cases).getAllByRole('link')).toHaveLength(3)
    expect(within(cases).getByRole('link', { name: 'Самрук-Казына' })).toHaveAttribute(
      'href',
      '/cases/samruk',
    )

    expect(within(blog).getAllByRole('link')).toHaveLength(1)
    expect(
      within(blog).getByRole('link', { name: 'Из малого — в средний. Из среднего — в большой' }),
    ).toHaveAttribute('href', '/notes/growth')
  })

  it('lists no social profile until a real one exists', () => {
    renderWithProviders(<SiteFooter />)

    // A link to a bare t.me domain reads as a working profile right up until
    // it is pressed, which is worse than showing nothing.
    const contact = screen.getByRole('heading', { name: 'Контакты' }).parentElement
    expect(contact).not.toBeNull()
    expect(within(contact!).getAllByRole('link')).toHaveLength(1)
  })

  it('prints the year as a plain number, not a formatted one', () => {
    renderWithProviders(<SiteFooter />)

    const year = String(new Date().getFullYear())
    // An ICU number placeholder would render "2 026" and this would fail.
    const copyright = new RegExp(String.raw`©\s${year}\s`)

    expect(screen.getByText(copyright)).toBeInTheDocument()
  })

  it('hides the oversized wordmark from the accessibility tree', () => {
    renderWithProviders(<SiteFooter />)

    // It repeats the hero's <h1>, so it must be decoration here — never a
    // heading, never announced twice.
    expect(screen.getByText('Владимир Шиков').closest('[aria-hidden="true"]')).not.toBeNull()
    expect(screen.queryByRole('heading', { name: 'Владимир Шиков' })).not.toBeInTheDocument()
  })

  it('carries the appearance switch', () => {
    renderWithProviders(<SiteFooter />)

    const footer = screen.getByRole('contentinfo')

    expect(within(footer).getByTestId('theme-toggle')).toBeInTheDocument()
  })
})
