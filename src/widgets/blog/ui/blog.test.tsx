import type { ComponentProps } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { renderWithProviders, screen } from '@/shared/test/render'

import { Blog } from './blog'

/**
 * next-intl's `Link` needs a live Next.js router, which jsdom does not provide.
 * A plain anchor keeps the test about the note cards.
 */
vi.mock('@/shared/i18n/navigation', () => ({
  usePathname: () => '/',
  Link: ({ href, children, ...rest }: ComponentProps<'a'> & { href: string }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}))

describe('Blog', () => {
  it('renders the section heading from the dictionary', () => {
    renderWithProviders(<Blog />)

    expect(screen.getByRole('heading', { level: 2, name: 'Блог и статьи' })).toBeInTheDocument()
  })

  it('renders the three notes, each linking to its own page', () => {
    renderWithProviders(<Blog />)

    const cards = screen.getAllByTestId('note-card')

    expect(cards).toHaveLength(3)
    expect(cards.map((card) => card.getAttribute('href'))).toEqual([
      '/notes/n1',
      '/notes/n2',
      '/notes/n3',
    ])
  })

  it('titles every note with an h3 taken from the dictionary', () => {
    renderWithProviders(<Blog />)

    const titles = screen.getAllByRole('heading', { level: 3 })

    expect(titles.map((title) => title.textContent)).toEqual([
      'Lorem ipsum dolor sit amet consectetur',
      'Sed do eiusmod tempor incididunt labore',
      'Ut enim ad minim veniam quis nostrud',
    ])
  })

  it('shows the label and the meta line of each note', () => {
    renderWithProviders(<Blog />)

    expect(screen.getByText('[Заметка 01]')).toBeInTheDocument()
    expect(screen.getByText('9 октября 2026 · 8 мин чтения')).toBeInTheDocument()
  })

  it('translates the section for the other locale', () => {
    renderWithProviders(<Blog />, { locale: 'en' })

    expect(screen.getByRole('heading', { level: 2, name: 'Blog & Articles' })).toBeInTheDocument()
    expect(screen.getByText('[Note 03]')).toBeInTheDocument()
  })
})
