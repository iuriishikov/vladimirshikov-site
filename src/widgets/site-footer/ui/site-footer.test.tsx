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
      screen.getByRole('heading', { name: 'Есть идея проекта — расскажите!' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Записаться на созвон →' })).toHaveAttribute(
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
    expect(within(menu).getByRole('link', { name: 'Образование' })).toHaveAttribute(
      'href',
      '#education',
    )
    expect(screen.getByRole('navigation', { name: 'Кейсы' })).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Блог' })).toBeInTheDocument()
  })

  it('lists four cases and three notes at their own routes', () => {
    renderWithProviders(<SiteFooter />)

    const cases = screen.getByRole('navigation', { name: 'Кейсы' })
    const blog = screen.getByRole('navigation', { name: 'Блог' })

    expect(within(cases).getAllByRole('link')).toHaveLength(4)
    expect(within(cases).getByRole('link', { name: 'Loremova' })).toHaveAttribute(
      'href',
      '/cases/loremova',
    )

    expect(within(blog).getAllByRole('link')).toHaveLength(3)
    expect(
      within(blog).getByRole('link', { name: 'Lorem ipsum dolor sit amet consectetur' }),
    ).toHaveAttribute('href', '/notes/n1')
  })

  it('opens the social profiles in a new tab without leaking the referrer', () => {
    renderWithProviders(<SiteFooter />)

    const telegram = screen.getByRole('link', { name: 'Telegram' })

    expect(telegram).toHaveAttribute('href', 'https://t.me/')
    expect(telegram).toHaveAttribute('target', '_blank')
    expect(telegram).toHaveAttribute('rel', 'noreferrer')
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
