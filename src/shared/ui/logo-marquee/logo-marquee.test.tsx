import { describe, expect, it } from 'vitest'

import { renderWithProviders, screen } from '../../test/render'
import { LogoMarquee } from './logo-marquee'

const NAMES = ['Loremova', 'Ipsumo', 'Dolorix'] as const

const ITEMS = NAMES.map((name) => ({ key: name, content: <span>{name}</span> }))

describe('LogoMarquee', () => {
  it('exposes each name once and hides the rest of the copies', () => {
    // The track repeats the list to make the loop seamless. If the duplicates
    // reached the accessibility tree, a screen reader would read the partner
    // list three times over.
    renderWithProviders(<LogoMarquee items={ITEMS} />)

    for (const name of NAMES) {
      const copies = screen.getAllByText(name)
      expect(copies).toHaveLength(3)

      const exposed = copies.filter((node) => node.closest('[aria-hidden="true"]') === null)
      expect(exposed).toHaveLength(1)
    }
  })

  it('reverses for a right-running row', () => {
    renderWithProviders(<LogoMarquee items={ITEMS} direction="right" />)

    expect(screen.getByTestId('marquee-track')).toHaveStyle({ animationDirection: 'reverse' })
  })

  it('runs left by default', () => {
    renderWithProviders(<LogoMarquee items={ITEMS} />)

    expect(screen.getByTestId('marquee-track')).toHaveStyle({ animationDirection: 'normal' })
  })

  it('renders nothing but the track for an empty list', () => {
    expect(() => {
      renderWithProviders(<LogoMarquee items={[]} />)
    }).not.toThrow()
  })
})
