import { describe, expect, it } from 'vitest'

import { renderWithProviders, screen } from '@/shared/test/render'

import { Services } from './services'

describe('Services', () => {
  it('renders the heading from the dictionary', () => {
    renderWithProviders(<Services />)

    // A renamed or missing message key is the likeliest regression here: the
    // section would still render, just with the key echoed back as its title.
    expect(screen.getByRole('heading', { level: 2, name: 'Услуги' })).toBeInTheDocument()
  })

  it('lists every service with its title and description', () => {
    renderWithProviders(<Services />)

    expect(screen.getAllByRole('listitem')).toHaveLength(4)
    expect(
      screen.getByRole('heading', { level: 3, name: 'Брендинг и айдентика' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: 'Разработка сайтов' })).toBeInTheDocument()
  })

  it('hides the decorative tile pairs from assistive technology', () => {
    renderWithProviders(<Services />)

    // The tiles carry bare initials — "B", "P", "W", "D" — which a screen
    // reader would otherwise spell out after every service title.
    for (const initial of ['B', 'P', 'W', 'D']) {
      expect(screen.getByText(initial).closest('[aria-hidden="true"]')).not.toBeNull()
    }
  })
})
