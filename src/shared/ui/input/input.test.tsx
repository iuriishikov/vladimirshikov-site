import { describe, expect, it } from 'vitest'

import { renderWithProviders, screen } from '../../test/render'
import { Input } from './input'

describe('Input', () => {
  it('defaults to a text input', () => {
    renderWithProviders(<Input aria-label="Field" />)

    expect(screen.getByLabelText('Field')).toHaveAttribute('type', 'text')
  })

  it('honours an explicit type', () => {
    renderWithProviders(<Input type="email" aria-label="Email" />)

    expect(screen.getByLabelText('Email')).toHaveAttribute('type', 'email')
  })

  it('accepts typed input', async () => {
    const { user } = renderWithProviders(<Input aria-label="Field" />)

    await user.type(screen.getByLabelText('Field'), 'hello')

    expect(screen.getByLabelText('Field')).toHaveValue('hello')
  })

  it('exposes the invalid state to assistive technology', () => {
    renderWithProviders(<Input aria-label="Field" aria-invalid />)

    // The visual error style keys off this attribute, so the two cannot drift.
    expect(screen.getByLabelText('Field')).toHaveAttribute('aria-invalid', 'true')
  })

  it('cannot be typed into while disabled', async () => {
    const { user } = renderWithProviders(<Input aria-label="Field" disabled />)

    await user.type(screen.getByLabelText('Field'), 'hello')

    expect(screen.getByLabelText('Field')).toHaveValue('')
  })

  it('merges a caller className with the defaults', () => {
    renderWithProviders(<Input aria-label="Field" className="w-32" />)

    const input = screen.getByLabelText('Field')
    expect(input).toHaveClass('w-32')
    expect(input).toHaveClass('rounded-md')
  })
})
