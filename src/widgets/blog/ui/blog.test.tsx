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

    expect(screen.getByRole('heading', { level: 2, name: 'Статьи' })).toBeInTheDocument()
  })

  it('renders every note, each linking to its own page', () => {
    renderWithProviders(<Blog />)

    const cards = screen.getAllByTestId('note-card')

    expect(cards).toHaveLength(1)
    expect(cards.map((card) => card.getAttribute('href'))).toEqual(['/notes/growth'])
  })

  it('titles every note with an h3 taken from the dictionary', () => {
    renderWithProviders(<Blog />)

    const titles = screen.getAllByRole('heading', { level: 3 })

    expect(titles.map((title) => title.textContent)).toEqual([
      'Из малого — в средний. Из среднего — в большой',
    ])
  })

  it('shows the label and the meta line of each note', () => {
    renderWithProviders(<Blog />)

    expect(screen.getByText('[Эссе]')).toBeInTheDocument()
    expect(screen.getByText('Рост компании')).toBeInTheDocument()
  })

  it('translates the section for the other locale', () => {
    renderWithProviders(<Blog />, { locale: 'en' })

    expect(screen.getByRole('heading', { level: 2, name: 'Writing' })).toBeInTheDocument()
    expect(screen.getByText('[Essay]')).toBeInTheDocument()
  })
})
