import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import { HttpError } from '@/shared/api/http'
import { server } from '@/shared/test/msw/server'

import { getHealth } from './get-health'

describe('getHealth', () => {
  it('returns the parsed health payload from the default handler', async () => {
    await expect(getHealth()).resolves.toMatchObject({
      status: 'ok',
      version: '0.0.0-test',
      uptime: 4242,
    })
  })

  it('fails when the endpoint answers with a payload that breaks the contract', async () => {
    // The point of validating at the boundary: a backend that starts returning
    // `uptime` as a string must fail here, not three components deeper.
    server.use(
      http.get('*/api/health', () =>
        HttpResponse.json({ status: 'ok', version: '1', uptime: 'a while', timestamp: 'now' }),
      ),
    )

    await expect(getHealth()).rejects.toThrow(HttpError)
  })

  it('surfaces a server error as an HttpError carrying the status', async () => {
    server.use(http.get('*/api/health', () => new HttpResponse(null, { status: 503 })))

    await expect(getHealth()).rejects.toMatchObject({ name: 'HttpError', status: 503 })
  })
})
