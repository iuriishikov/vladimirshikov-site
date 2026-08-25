import { describe, expect, it } from 'vitest'

import { renderWithProviders, screen, waitFor } from '@/shared/test/render'

import { ThemeToggle } from './theme-toggle'

describe('ThemeToggle', () => {
  it('exposes a stable accessible name', () => {
    renderWithProviders(<ThemeToggle />)

    // The label must not change with the theme: a control whose name flips is
    // announced as a different control every time it is used.
    expect(screen.getByTestId('theme-toggle')).toHaveAccessibleName('Тема оформления')
  })

  it('advertises the theme it will switch to, not the current one', async () => {
    renderWithProviders(<ThemeToggle />)

    await waitFor(() => {
      expect(screen.getByTestId('theme-toggle')).toHaveAttribute('title', 'Тёмная')
    })
  })

  it('switches the document to dark and back', async () => {
    const { user } = renderWithProviders(<ThemeToggle />)
    const toggle = screen.getByTestId('theme-toggle')

    await user.click(toggle)
    await waitFor(() => {
      expect(document.documentElement).toHaveClass('dark')
    })

    await user.click(toggle)
    await waitFor(() => {
      expect(document.documentElement).not.toHaveClass('dark')
    })
  })

  it('renders a button even before the theme is known', () => {
    // The server cannot resolve the theme, so the first paint must still be a
    // usable control rather than an empty slot that shifts the layout.
    renderWithProviders(<ThemeToggle />)

    expect(screen.getByRole('button')).toBeEnabled()
  })
})
