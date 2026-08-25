import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import { server } from '@/shared/test/msw/server'
import { renderWithProviders, screen, waitFor } from '@/shared/test/render'

import { StatusBadge } from './status-badge'

describe('StatusBadge', () => {
  it('reports the service as operational once the endpoint answers', async () => {
    renderWithProviders(<StatusBadge />)

    await waitFor(() => {
      expect(screen.getByTestId('status-badge')).toHaveAttribute('data-state', 'healthy')
    })
    expect(screen.getByTestId('status-badge')).toHaveTextContent('Работает')
  })

  it('renders the uptime in human units', async () => {
    // The default handler reports 4242 seconds.
    renderWithProviders(<StatusBadge />)

    await waitFor(() => {
      expect(screen.getByTestId('status-badge')).toHaveTextContent('1h 10m')
    })
  })

  it('turns unhealthy when the endpoint fails', async () => {
    server.use(http.get('*/api/health', () => new HttpResponse(null, { status: 500 })))

    renderWithProviders(<StatusBadge />)

    await waitFor(() => {
      expect(screen.getByTestId('status-badge')).toHaveAttribute('data-state', 'unhealthy')
    })
  })

  it('announces itself as a status region', () => {
    renderWithProviders(<StatusBadge />)

    expect(screen.getByRole('status')).toHaveAccessibleName('Состояние сервиса')
  })
})
