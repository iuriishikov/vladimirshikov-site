import { afterEach, describe, expect, it, vi } from 'vitest'
import { z } from 'zod'

import { HttpError, httpRequest } from './http'

const schema = z.object({ status: z.literal('ok'), count: z.number() })

function jsonResponse(body: unknown, init: ResponseInit = {}): Response {
  return Response.json(body, {
    status: 200,
    headers: { 'content-type': 'application/json' },
    ...init,
  })
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('httpRequest', () => {
  it('returns the parsed body when it matches the schema', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ status: 'ok', count: 2 })))

    await expect(httpRequest('/api/thing', { schema })).resolves.toStrictEqual({
      status: 'ok',
      count: 2,
    })
  })

  it('rejects a body that does not match the schema', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ status: 'ok' })))

    await expect(httpRequest('/api/thing', { schema })).rejects.toThrow(HttpError)
  })

  it('surfaces a non-2xx status on the error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({}, { status: 503 })))

    await expect(httpRequest('/api/thing')).rejects.toMatchObject({
      name: 'HttpError',
      status: 503,
      url: '/api/thing',
    })
  })

  it('returns undefined for 204 without touching the body', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 204 })))

    await expect(httpRequest('/api/thing')).resolves.toBeUndefined()
  })

  it('turns a network failure into an HttpError with status 0', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('fetch failed')))

    await expect(httpRequest('/api/thing')).rejects.toMatchObject({
      name: 'HttpError',
      status: 0,
    })
  })

  it('reports a timeout distinctly from a generic network error', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new DOMException('The operation timed out.', 'TimeoutError')),
    )

    await expect(httpRequest('/api/thing', { timeoutMs: 5 })).rejects.toThrow(
      /timed out after 5ms/u,
    )
  })

  it('sends an accept header that callers can override', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({}))
    vi.stubGlobal('fetch', fetchMock)

    await httpRequest('/api/thing', { headers: { accept: 'text/plain' } })

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/thing',
      expect.objectContaining({ headers: { accept: 'text/plain' } }),
    )
  })
})
