import { describe, expect, it } from 'vitest'

import { renderWithProviders, screen, within } from '@/shared/test/render'

import { Partners } from './partners'

const BAND_NAME = 'Компании и организации'

describe('Partners', () => {
  it('renders both heading lines and the lead from the dictionary', () => {
    renderWithProviders(<Partners />)

    const heading = screen.getByRole('heading', { level: 2 })
    expect(heading).toHaveTextContent('Компании')
    expect(heading).toHaveTextContent('и организации')
    expect(screen.getByText(/международными корпорациями/)).toBeInTheDocument()
  })

  it('names the marquee band so the scrolling row is not an unlabelled group', () => {
    renderWithProviders(<Partners />)

    expect(screen.getByRole('group', { name: BAND_NAME })).toBeInTheDocument()
  })

  it('splits each row into trimmed items', () => {
    renderWithProviders(<Partners />)

    const band = screen.getByRole('group', { name: BAND_NAME })

    // The `|`-separated string must never reach the page as-is…
    expect(within(band).queryByText(/\|/)).not.toBeInTheDocument()
    // …and `textContent`, unlike the query matcher, does not forgive the
    // whitespace `split('|')` leaves around every item.
    const [firstOfRowA] = within(band).getAllByText('Philip Morris')
    const [firstOfRowB] = within(band).getAllByText('Казатомпром')
    expect(firstOfRowA).toHaveProperty('textContent', 'Philip Morris')
    expect(firstOfRowB).toHaveProperty('textContent', 'Казатомпром')
  })
})
