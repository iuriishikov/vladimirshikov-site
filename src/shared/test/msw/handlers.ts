import { http, HttpResponse } from 'msw'

import type { Health } from '@/entities/health'

const healthyResponse: Health = {
  status: 'ok',
  version: '0.0.0-test',
  uptime: 4242,
  timestamp: '2026-08-24T00:00:00.000Z',
}

/**
 * The default network for every test.
 *
 * Handlers live at the network boundary rather than in a mocked module, so a
 * test exercises the real fetch call, the real URL and the real schema
 * validation. Override one of these per test with `server.use(...)` — the
 * setup file resets the overrides after each test.
 */
export const handlers = [http.get('*/api/health', () => HttpResponse.json(healthyResponse))]
