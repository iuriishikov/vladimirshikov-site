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

  it('draws a company with a mark as a logo named after it', () => {
    renderWithProviders(<Partners />)

    const band = screen.getByRole('group', { name: BAND_NAME })

    // The track repeats itself to loop seamlessly, and the copies are
    // aria-hidden — so exactly one of each may reach the accessibility tree.
    expect(within(band).getAllByRole('img', { name: 'Philip Morris' })).toHaveLength(1)
    expect(within(band).getAllByRole('img', { name: 'Самрук-Казына' })).toHaveLength(1)
  })

  it('sets a company with no mark as a wordmark rather than dropping it', () => {
    renderWithProviders(<Partners />)

    const band = screen.getByRole('group', { name: BAND_NAME })

    // No usable logo file could be sourced for these. Falling back to the name
    // is the point: a silent gap in the row would be the real defect.
    expect(within(band).queryByRole('img', { name: 'Nestlé' })).not.toBeInTheDocument()
    expect(within(band).getAllByText('Nestlé')).toHaveLength(3)
    expect(within(band).getAllByText('КТЖ')).toHaveLength(3)
  })

  it('translates the names for the other locale', () => {
    renderWithProviders(<Partners />, { locale: 'en' })

    const band = screen.getByRole('group', { name: 'Companies and institutions' })

    expect(within(band).getAllByRole('img', { name: 'Samruk-Kazyna' })).toHaveLength(1)
    expect(within(band).getAllByText('Samruk-Energy')).toHaveLength(3)
  })
})
