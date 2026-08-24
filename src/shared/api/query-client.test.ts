import { describe, expect, it } from 'vitest'

import { HttpError } from './http'
import { getQueryClient } from './query-client'

/** The retry predicate is the only branching logic in the client's defaults. */
function retryPolicy() {
  const retry = getQueryClient().getDefaultOptions().queries?.retry
  if (typeof retry !== 'function') throw new TypeError('expected a retry predicate')
  return retry
}

describe('getQueryClient', () => {
  it('reuses one client in the browser', () => {
    // A fresh cache per render would refetch everything on every navigation.
    expect(getQueryClient()).toBe(getQueryClient())
  })

  it('does not retry a client error', () => {
    const retry = retryPolicy()

    // A 404 or a 422 will not fix itself; retrying only delays the message.
    expect(retry(0, new HttpError('missing', { status: 404, url: '/x' }))).toBe(false)
    expect(retry(0, new HttpError('bad input', { status: 422, url: '/x' }))).toBe(false)
  })

  it('retries a server error, but only twice', () => {
    const retry = retryPolicy()
    const serverError = new HttpError('boom', { status: 503, url: '/x' })

    expect(retry(0, serverError)).toBe(true)
    expect(retry(1, serverError)).toBe(true)
    expect(retry(2, serverError)).toBe(false)
  })

  it('retries a network failure, which reports no status at all', () => {
    const retry = retryPolicy()

    expect(retry(0, new HttpError('offline', { status: 0, url: '/x' }))).toBe(true)
  })

  it('retries an unrecognised error rather than swallowing it', () => {
    const retry = retryPolicy()

    expect(retry(0, new Error('something else'))).toBe(true)
  })

  it('never retries a mutation', () => {
    expect(getQueryClient().getDefaultOptions().mutations?.retry).toBe(false)
  })
})
