import { describe, expect, it } from 'vitest'

import { renderWithProviders, screen } from '../../test/render'
import { Container } from './container'

describe('Container', () => {
  it('renders a div by default', () => {
    renderWithProviders(<Container data-testid="box">content</Container>)

    expect(screen.getByTestId('box').tagName).toBe('DIV')
  })

  it('renders the requested element instead', () => {
    // Landmarks matter: the same rhythm has to be usable as <main> and <footer>
    // without wrapping them in a redundant div.
    renderWithProviders(<Container as="main">content</Container>)

    expect(screen.getByRole('main')).toBeInTheDocument()
  })

  it('keeps the shared max width and gutter', () => {
    renderWithProviders(<Container data-testid="box">content</Container>)

    expect(screen.getByTestId('box')).toHaveClass('mx-auto', 'max-w-5xl')
  })

  it('lets a caller override the width', () => {
    renderWithProviders(
      <Container data-testid="box" className="max-w-2xl">
        content
      </Container>,
    )

    const box = screen.getByTestId('box')
    expect(box).toHaveClass('max-w-2xl')
    expect(box).not.toHaveClass('max-w-5xl')
  })
})
