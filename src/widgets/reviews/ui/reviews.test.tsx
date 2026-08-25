import { beforeEach, describe, expect, it, vi } from 'vitest'

import { renderWithProviders, screen } from '@/shared/test/render'

import { Reviews } from './reviews'

/*
 * jsdom implements no scrolling at all, so `scrollBy` has to be supplied before
 * the component can call it. It is defined on the prototype rather than stubbed
 * with `vi.spyOn`, which needs an existing method to wrap.
 */
const scrollBy = vi.fn()

beforeEach(() => {
  Object.defineProperty(HTMLElement.prototype, 'scrollBy', {
    configurable: true,
    writable: true,
    value: scrollBy,
  })
})

describe('Reviews', () => {
  it('renders the heading and every review from the dictionary', () => {
    renderWithProviders(<Reviews />)

    expect(screen.getByRole('heading', { level: 2, name: 'Отзывы клиентов' })).toBeInTheDocument()
    expect(screen.getByText('Dolor Sitamet')).toBeInTheDocument()
    expect(screen.getByText('Директор, Consecta')).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(5)
  })

  it('scrolls the track forwards and backwards by one card', async () => {
    const { user } = renderWithProviders(<Reviews />)

    await user.click(screen.getByTestId('reviews-next'))
    expect(scrollBy).toHaveBeenCalledWith({ left: 440, behavior: 'smooth' })

    await user.click(screen.getByTestId('reviews-prev'))
    expect(scrollBy).toHaveBeenLastCalledWith({ left: -440, behavior: 'smooth' })
  })

  it('gives the arrows accessible names, their glyphs being decorative', () => {
    renderWithProviders(<Reviews />)

    // The buttons hold only "←" and "→", which announce as nothing useful.
    expect(screen.getByTestId('reviews-prev')).toHaveAccessibleName('Предыдущие отзывы')
    expect(screen.getByTestId('reviews-next')).toHaveAccessibleName('Следующие отзывы')
  })

  it('makes the scrolling track reachable by keyboard', () => {
    renderWithProviders(<Reviews />)

    // A scrollable region with no focus stop cannot be read without a mouse,
    // and axe fails the page for it.
    const track = screen.getByTestId('reviews-track')
    expect(track).toHaveAttribute('tabindex', '0')
    expect(track).toHaveAccessibleName('Отзывы клиентов')
  })
})
