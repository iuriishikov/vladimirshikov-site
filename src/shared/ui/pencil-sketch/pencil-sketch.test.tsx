import { describe, expect, it } from 'vitest'

import { renderWithProviders, screen } from '../../test/render'
import { PencilSketch } from './pencil-sketch'

/**
 * jsdom has no 2D context, so the component's effect bails out before drawing.
 * That is exactly the path worth testing here: the sketch must degrade to an
 * empty canvas rather than throwing and taking the page down with it. The
 * geometry itself is covered in lib/draw.test.ts.
 */
describe('PencilSketch', () => {
  it('renders a canvas', () => {
    renderWithProviders(<PencilSketch />)

    expect(screen.getByTestId('pencil-sketch').tagName).toBe('CANVAS')
  })

  it('stays out of the accessibility tree', () => {
    // It is decoration next to real text; announcing "canvas" helps nobody.
    renderWithProviders(<PencilSketch variant="avatar" seed={3} />)

    expect(screen.getByTestId('pencil-sketch')).toHaveAttribute('aria-hidden', 'true')
  })

  it('does not throw when the canvas has no drawing context', () => {
    expect(() => {
      renderWithProviders(<PencilSketch variant="tile" seed={21} />)
    }).not.toThrow()
  })

  it('accepts a caller className', () => {
    renderWithProviders(<PencilSketch className="absolute inset-0" />)

    expect(screen.getByTestId('pencil-sketch')).toHaveClass('absolute', 'inset-0')
  })
})
