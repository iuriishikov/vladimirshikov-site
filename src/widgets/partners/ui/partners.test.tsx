import { describe, expect, it } from 'vitest'

import { renderWithProviders, screen, within } from '@/shared/test/render'

import { Partners } from './partners'

describe('Partners', () => {
  it('renders both heading lines and the lead from the dictionary', () => {
    renderWithProviders(<Partners />)

    const heading = screen.getByRole('heading', { level: 2 })
    expect(heading).toHaveTextContent('120+ доверенных')
    expect(heading).toHaveTextContent('партнёров')
    expect(screen.getByText(/Lorem ipsum dolor sit amet/)).toBeInTheDocument()
  })

  it('names the marquee band so the scrolling row is not an unlabelled group', () => {
    renderWithProviders(<Partners />)

    expect(screen.getByRole('group', { name: 'Названия партнёров' })).toBeInTheDocument()
  })

  it('splits each row into trimmed items', () => {
    renderWithProviders(<Partners />)

    const band = screen.getByRole('group', { name: 'Названия партнёров' })

    // The `|`-separated string must never reach the page as-is…
    expect(within(band).queryByText(/\|/)).not.toBeInTheDocument()
    // …and `textContent`, unlike the query matcher, does not forgive the
    // whitespace `split('|')` leaves around every item.
    const [firstOfRowA] = within(band).getAllByText('Loremova®')
    const [firstOfRowB] = within(band).getAllByText('Pulvinar')
    expect(firstOfRowA).toHaveProperty('textContent', 'Loremova®')
    expect(firstOfRowB).toHaveProperty('textContent', 'Pulvinar')
  })
})
