import { beforeEach, describe, expect, it, vi } from 'vitest'

import { renderWithProviders, screen, waitFor } from '@/shared/test/render'

import { subscribe } from '../api/subscribe'
import { ContactForm } from './contact-form'

// The Server Action cannot run in jsdom, and its behaviour is not what this
// test is about: the contract between the form and the action is.
vi.mock('../api/subscribe', () => ({ subscribe: vi.fn() }))

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

const subscribeMock = vi.mocked(subscribe)

describe('ContactForm', () => {
  beforeEach(() => {
    subscribeMock.mockReset()
  })

  it('rejects an empty submission client-side without calling the server', async () => {
    const { user } = renderWithProviders(<ContactForm />)

    await user.click(screen.getByTestId('contact-form-submit'))

    expect(await screen.findByTestId('contact-form-error')).toHaveTextContent(
      'Укажите адрес электронной почты',
    )
    expect(subscribeMock).not.toHaveBeenCalled()
  })

  it('rejects a malformed address client-side', async () => {
    const { user } = renderWithProviders(<ContactForm />)

    await user.type(screen.getByTestId('contact-form-email'), 'not-an-email')
    await user.click(screen.getByTestId('contact-form-submit'))

    expect(await screen.findByTestId('contact-form-error')).toHaveTextContent(
      'Похоже, это не адрес электронной почты',
    )
    expect(subscribeMock).not.toHaveBeenCalled()
  })

  it('marks the field invalid for assistive technology', async () => {
    const { user } = renderWithProviders(<ContactForm />)

    await user.click(screen.getByTestId('contact-form-submit'))

    await waitFor(() => {
      expect(screen.getByTestId('contact-form-email')).toHaveAttribute('aria-invalid', 'true')
    })
  })

  it('submits a valid address and reports success', async () => {
    subscribeMock.mockResolvedValue({ status: 'success' })
    const { user } = renderWithProviders(<ContactForm />)

    await user.type(screen.getByTestId('contact-form-email'), 'reader@example.com')
    await user.click(screen.getByTestId('contact-form-submit'))

    expect(await screen.findByTestId('contact-form-success')).toBeInTheDocument()
    expect(subscribeMock).toHaveBeenCalledWith({ email: 'reader@example.com' })
  })

  it('surfaces a server-side validation verdict on the field', async () => {
    subscribeMock.mockResolvedValue({ status: 'invalid', errorKey: 'emailInvalid' })
    const { user } = renderWithProviders(<ContactForm />)

    await user.type(screen.getByTestId('contact-form-email'), 'reader@example.com')
    await user.click(screen.getByTestId('contact-form-submit'))

    expect(await screen.findByTestId('contact-form-error')).toHaveTextContent(
      'Похоже, это не адрес электронной почты',
    )
    expect(screen.queryByTestId('contact-form-success')).not.toBeInTheDocument()
  })

  it('does not claim success when the server fails', async () => {
    subscribeMock.mockResolvedValue({ status: 'error' })
    const { user } = renderWithProviders(<ContactForm />)

    await user.type(screen.getByTestId('contact-form-email'), 'reader@example.com')
    await user.click(screen.getByTestId('contact-form-submit'))

    await waitFor(() => {
      expect(subscribeMock).toHaveBeenCalledOnce()
    })
    expect(screen.queryByTestId('contact-form-success')).not.toBeInTheDocument()
  })
})
