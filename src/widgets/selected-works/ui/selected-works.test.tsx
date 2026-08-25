import type { ComponentProps } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { CASE_STUDIES } from '@/entities/case-study'
import { renderWithProviders, screen } from '@/shared/test/render'

import { SelectedWorks } from './selected-works'

/**
 * next-intl's `Link` needs a live Next.js router, which jsdom does not provide.
 * A plain anchor keeps the test about the grid and its labels.
 */
vi.mock('@/shared/i18n/navigation', () => ({
  usePathname: () => '/',
  Link: ({ href, children, ...rest }: ComponentProps<'a'> & { href: string }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}))

describe('SelectedWorks', () => {
  it('renders the section heading from the dictionary', () => {
    renderWithProviders(<SelectedWorks />)

    expect(screen.getByRole('heading', { level: 2, name: 'Избранные работы' })).toBeInTheDocument()
  })

  it('renders one card per case study', () => {
    renderWithProviders(<SelectedWorks />)

    expect(screen.getAllByTestId('case-card')).toHaveLength(CASE_STUDIES.length)
    expect(CASE_STUDIES).toHaveLength(6)
  })

  it('gives every card an accessible name that identifies its case', () => {
    renderWithProviders(<SelectedWorks />)

    // Without this the six links announce as a wall of wordmarks and captions,
    // which is exactly what the aria-label exists to prevent.
    for (const { slug } of CASE_STUDIES) {
      const name = slug.charAt(0).toUpperCase() + slug.slice(1)
      expect(screen.getByRole('link', { name: `Открыть кейс ${name}` })).toHaveAttribute(
        'href',
        `/cases/${slug}`,
      )
    }
  })

  it('prints the name and the tag under each cover', () => {
    renderWithProviders(<SelectedWorks />)

    expect(screen.getByText('Брендинг | Сайт | Разработка')).toBeInTheDocument()
    expect(screen.getByText('Loremova')).toBeInTheDocument()
  })

  it('translates the section for the other locale', () => {
    renderWithProviders(<SelectedWorks />, { locale: 'en' })

    expect(screen.getByRole('heading', { level: 2, name: 'Selected Works' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'View the Elitra case' })).toBeInTheDocument()
  })
})
