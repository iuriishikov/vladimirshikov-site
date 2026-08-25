import { describe, expect, it } from 'vitest'

import { renderWithProviders, screen } from '../../test/render'
import { CompanyMark } from './company-mark'

describe('CompanyMark', () => {
  it('draws the logo, named after the company', () => {
    renderWithProviders(<CompanyMark slug="pfizer" name="Pfizer" />)

    expect(screen.getByRole('img', { name: 'Pfizer' })).toBeInTheDocument()
  })

  it('sets the name as a wordmark when no logo could be sourced', () => {
    // The fallback is the whole reason the table is Partial: five of the
    // eighteen companies have no usable mark, and a gap would be worse.
    renderWithProviders(<CompanyMark slug="nestle" name="Nestlé" />)

    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    expect(screen.getByText('Nestlé')).toBeInTheDocument()
  })

  it('scales the box by the logo’s optical correction', () => {
    // Kazatomprom is a stacked mark and carries a 1.25 correction, so a 40px
    // box renders at 50px — otherwise it reads as smaller than the wordmarks
    // beside it at the very same height.
    renderWithProviders(<CompanyMark slug="kazatomprom" name="Kazatomprom" height={40} />)

    expect(screen.getByRole('img', { name: 'Kazatomprom' })).toHaveAttribute('height', '50')
  })

  it('flips to white ink over a saturated cover', () => {
    renderWithProviders(<CompanyMark slug="samruk" name="Samruk-Kazyna" tone="light" />)

    // `brightness-0` alone would put a black mark on a blue cover.
    expect(screen.getByRole('img', { name: 'Samruk-Kazyna' })).toHaveClass('invert')
  })
})
