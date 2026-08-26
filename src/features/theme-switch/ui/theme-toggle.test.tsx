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

  it('offers all three states the provider has', () => {
    renderWithProviders(<ThemeToggle />)

    const toggle = screen.getByTestId('theme-toggle')

    expect(toggle).toHaveTextContent('Свет')
    expect(toggle).toHaveTextContent('Авто')
    expect(toggle).toHaveTextContent('Тьма')
  })

  it('starts on the provider default before the stored choice is known', () => {
    // The server cannot resolve the theme, so the first paint shows what the
    // provider is configured with rather than guessing at a colour.
    renderWithProviders(<ThemeToggle />)

    expect(screen.getByTestId('theme-option-system')).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByTestId('theme-option-light')).toHaveAttribute('aria-pressed', 'false')
  })

  it('switches the document to dark and back to light', async () => {
    const { user } = renderWithProviders(<ThemeToggle />)

    await user.click(screen.getByTestId('theme-option-dark'))
    await waitFor(() => {
      expect(document.documentElement).toHaveClass('dark')
    })
    expect(screen.getByTestId('theme-option-dark')).toHaveAttribute('aria-pressed', 'true')

    await user.click(screen.getByTestId('theme-option-light'))
    await waitFor(() => {
      expect(document.documentElement).not.toHaveClass('dark')
    })
  })

  it('lets a visitor hand the theme back to the operating system', async () => {
    // The reason this control has three segments. With two, the first press is
    // a one-way door and the site can never follow the OS again.
    const { user } = renderWithProviders(<ThemeToggle />)

    await user.click(screen.getByTestId('theme-option-dark'))
    await waitFor(() => {
      expect(screen.getByTestId('theme-option-dark')).toHaveAttribute('aria-pressed', 'true')
    })

    await user.click(screen.getByTestId('theme-option-system'))
    await waitFor(() => {
      expect(screen.getByTestId('theme-option-system')).toHaveAttribute('aria-pressed', 'true')
    })
    expect(screen.getByTestId('theme-option-dark')).toHaveAttribute('aria-pressed', 'false')
  })

  it('renders usable buttons even before the theme is known', () => {
    renderWithProviders(<ThemeToggle />)

    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(3)
    for (const button of buttons) {
      expect(button).toBeEnabled()
    }
  })
})
