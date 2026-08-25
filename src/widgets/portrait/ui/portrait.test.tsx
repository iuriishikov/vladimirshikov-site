import { describe, expect, it } from 'vitest'

import { renderWithProviders } from '@/shared/test/render'

import { Portrait } from './portrait'

describe('Portrait', () => {
  it('draws the bust on a full-bleed panel', () => {
    renderWithProviders(<Portrait />)

    expect(document.querySelector('canvas')).toBeInTheDocument()
    expect(document.querySelector('section')).toHaveClass('bg-panel')
  })

  it('keeps the sketch out of the accessibility tree', () => {
    renderWithProviders(<Portrait />)

    // The band carries no text, so a bare "canvas" would be the only thing a
    // screen reader could announce here — noise, and an axe violation in the
    // e2e sweep.
    expect(document.querySelector('canvas')).toHaveAttribute('aria-hidden', 'true')
  })
})
