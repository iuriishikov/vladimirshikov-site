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

/** The project names as the Russian dictionary prints them, in cover order. */
const NAMES_RU = ['Самрук-Казына', 'Philip Morris', 'Атомная отрасль']

describe('SelectedWorks', () => {
  it('renders the section heading from the dictionary', () => {
    renderWithProviders(<SelectedWorks />)

    expect(
      screen.getByRole('heading', { level: 2, name: 'Масштаб имеет значение' }),
    ).toBeInTheDocument()
  })

  it('renders one card per case study', () => {
    renderWithProviders(<SelectedWorks />)

    expect(screen.getAllByTestId('case-card')).toHaveLength(CASE_STUDIES.length)
    expect(CASE_STUDIES).toHaveLength(3)
  })

  it('gives every card an accessible name that identifies its project', () => {
    renderWithProviders(<SelectedWorks />)

    // Without this the links announce as a wall of wordmarks and captions,
    // which is exactly what the aria-label exists to prevent.
    for (const [index, { slug }] of CASE_STUDIES.entries()) {
      expect(
        screen.getByRole('link', { name: `Открыть проект: ${NAMES_RU[index]}` }),
      ).toHaveAttribute('href', `/cases/${slug}`)
    }
  })

  it('prints the name and the tag under each cover', () => {
    renderWithProviders(<SelectedWorks />)

    // `\s` rather than a literal space: the thousands separator is a
    // non-breaking space, so that the number never splits across two lines.
    expect(screen.getByText(/12 компаний · 320\s000\+ сотрудников/)).toBeInTheDocument()
    expect(screen.getByText('Самрук-Казына')).toBeInTheDocument()
  })

  it('translates the section for the other locale', () => {
    renderWithProviders(<SelectedWorks />, { locale: 'en' })

    expect(screen.getByRole('heading', { level: 2, name: 'Scale matters' })).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Open the project: Nuclear-based industry' }),
    ).toBeInTheDocument()
  })
})
