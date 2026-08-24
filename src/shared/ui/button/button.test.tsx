import { describe, expect, it, vi } from 'vitest'

import { renderWithProviders, screen } from '../../test/render'
import { Button } from './button'

describe('Button', () => {
  it('renders its children as an accessible button', () => {
    renderWithProviders(<Button>Subscribe</Button>)

    expect(screen.getByRole('button', { name: 'Subscribe' })).toBeInTheDocument()
  })

  it('defaults to type="button" so it cannot submit a form by accident', () => {
    renderWithProviders(<Button>Cancel</Button>)

    expect(screen.getByRole('button')).toHaveAttribute('type', 'button')
  })

  it('still honours an explicit type', () => {
    renderWithProviders(<Button type="submit">Send</Button>)

    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit')
  })

  it('calls onClick when activated', async () => {
    const onClick = vi.fn()
    const { user } = renderWithProviders(<Button onClick={onClick}>Go</Button>)

    await user.click(screen.getByRole('button', { name: 'Go' }))

    expect(onClick).toHaveBeenCalledOnce()
  })

  it('does not fire while disabled', async () => {
    const onClick = vi.fn()
    const { user } = renderWithProviders(
      <Button disabled onClick={onClick}>
        Go
      </Button>,
    )

    await user.click(screen.getByRole('button', { name: 'Go' }))

    expect(onClick).not.toHaveBeenCalled()
  })

  it('merges a caller className over the variant default', () => {
    renderWithProviders(<Button className="rounded-none">Go</Button>)

    const button = screen.getByRole('button')
    expect(button).toHaveClass('rounded-none')
    expect(button).not.toHaveClass('rounded-md')
  })

  it('renders as its child element when asChild is set', () => {
    renderWithProviders(
      <Button asChild>
        <a href="/ru/about">About</a>
      </Button>,
    )

    const link = screen.getByRole('link', { name: 'About' })
    expect(link).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
    // The button styling must travel to the child, otherwise asChild is a lie.
    expect(link).toHaveClass('inline-flex')
  })
})
