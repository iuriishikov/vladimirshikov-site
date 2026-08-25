/**
 * @vitest-environment node
 *
 * A Server Action runs on the server, and this file is about the one property
 * that matters there: it does not trust anything the client sent.
 */
import { describe, expect, it } from 'vitest'

import { subscribe } from './subscribe'

describe('subscribe', () => {
  it('accepts a valid address', async () => {
    await expect(subscribe({ email: 'reader@example.com' })).resolves.toStrictEqual({
      status: 'success',
    })
  })

  it('re-validates input the client already checked', async () => {
    // The browser cannot be trusted to have run the same schema — a Server
    // Action is a public HTTP endpoint that anyone can post to directly.
    await expect(subscribe({ email: 'not-an-email' })).resolves.toStrictEqual({
      status: 'invalid',
      errorKey: 'emailInvalid',
    })
  })

  it('distinguishes a missing address from a malformed one', async () => {
    await expect(subscribe({ email: '' })).resolves.toStrictEqual({
      status: 'invalid',
      errorKey: 'emailRequired',
    })
  })

  it('rejects a payload of the wrong shape entirely', async () => {
    for (const payload of [null, undefined, 'reader@example.com', { email: 42 }, {}, []]) {
      await expect(subscribe(payload)).resolves.toMatchObject({ status: 'invalid' })
    }
  })

  it('always answers with a translatable key, never a raw zod message', async () => {
    const result = await subscribe({ email: 'nope' })

    expect(result.status).toBe('invalid')
    if (result.status === 'invalid') {
      expect(['emailRequired', 'emailInvalid', 'emailTooLong']).toContain(result.errorKey)
    }
  })
})
