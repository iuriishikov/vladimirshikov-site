import { describe, expect, it } from 'vitest'

import { renderWithProviders, screen } from '../../test/render'
import { SkipLink } from './skip-link'

describe('SkipLink', () => {
  it('points at the main landmark', () => {
    renderWithProviders(<SkipLink targetId="main-content">Skip to content</SkipLink>)

    expect(screen.getByTestId('skip-to-content')).toHaveAttribute('href', '#main-content')
  })

  it('stays in the accessibility tree while visually hidden', () => {
    // `sr-only` rather than `display: none` is the whole point: a hidden element
    // cannot receive focus, so the skip link would be unreachable.
    renderWithProviders(<SkipLink targetId="main-content">Skip to content</SkipLink>)

    const link = screen.getByRole('link', { name: 'Skip to content' })
    expect(link).toBeInTheDocument()
    expect(link).toHaveClass('sr-only')
  })

  it('is the first element a keyboard user reaches', async () => {
    const { user } = renderWithProviders(
      <>
        <SkipLink targetId="main-content">Skip to content</SkipLink>
        <a href="/somewhere">Another link</a>
      </>,
    )

    await user.tab()

    expect(screen.getByTestId('skip-to-content')).toHaveFocus()
  })
})
