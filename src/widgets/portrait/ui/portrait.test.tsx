import { describe, expect, it } from 'vitest'

import { renderWithProviders, screen } from '@/shared/test/render'

import { Portrait } from './portrait'

describe('Portrait', () => {
  it('shows the portrait on a full-bleed panel', () => {
    renderWithProviders(<Portrait />)

    expect(screen.getByRole('img', { name: 'Владимир Шиков' })).toBeInTheDocument()
    expect(document.querySelector('section')).toHaveClass('bg-panel')
  })

  it('names the person in the alternative text', () => {
    // The band carries no text of its own, so this alt is the only thing a
    // screen reader has to go on — and an empty one would be an axe violation.
    renderWithProviders(<Portrait />)

    expect(screen.getByRole('img')).toHaveAccessibleName('Владимир Шиков')
  })
})
