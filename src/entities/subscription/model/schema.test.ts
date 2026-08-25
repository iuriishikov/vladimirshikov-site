import { describe, expect, it } from 'vitest'

import { isSubscriptionErrorKey, subscriptionSchema } from './schema'

/** The first issue is what the form shows, so its identity matters. */
function firstErrorKey(email: unknown): string | undefined {
  const result = subscriptionSchema.safeParse({ email })
  return result.success ? undefined : result.error.issues[0]?.message
}

describe('subscriptionSchema', () => {
  it('accepts an ordinary address', () => {
    expect(subscriptionSchema.parse({ email: 'reader@example.com' })).toStrictEqual({
      email: 'reader@example.com',
    })
  })

  it('trims surrounding whitespace before validating', () => {
    expect(subscriptionSchema.parse({ email: '  reader@example.com  ' })).toStrictEqual({
      email: 'reader@example.com',
    })
  })

  it('reports an empty address as missing, not as malformed', () => {
    // The distinction is the whole point of ordering the checks: "enter an
    // address" and "that is not an address" are different instructions.
    expect(firstErrorKey('')).toBe('emailRequired')
    expect(firstErrorKey(' '.repeat(3))).toBe('emailRequired')
  })

  it('reports a malformed address', () => {
    expect(firstErrorKey('not-an-email')).toBe('emailInvalid')
    expect(firstErrorKey('missing@tld')).toBe('emailInvalid')
    expect(firstErrorKey('@example.com')).toBe('emailInvalid')
  })

  it('rejects an address longer than RFC 5321 allows', () => {
    const tooLong = `${'a'.repeat(250)}@example.com`
    expect(firstErrorKey(tooLong)).toBe('emailTooLong')
  })

  it('rejects a non-string payload', () => {
    expect(subscriptionSchema.safeParse({ email: 42 }).success).toBe(false)
    expect(subscriptionSchema.safeParse({}).success).toBe(false)
  })

  it('emits only keys the translator knows about', () => {
    for (const value of ['', 'nope', `${'a'.repeat(250)}@example.com`]) {
      const key = firstErrorKey(value)
      expect(key).toBeDefined()
      expect(isSubscriptionErrorKey(key!)).toBe(true)
    }
  })
})

describe('isSubscriptionErrorKey', () => {
  it('recognises the known keys and nothing else', () => {
    expect(isSubscriptionErrorKey('emailRequired')).toBe(true)
    expect(isSubscriptionErrorKey('emailInvalid')).toBe(true)
    expect(isSubscriptionErrorKey('emailTooLong')).toBe(true)
    expect(isSubscriptionErrorKey('Invalid email')).toBe(false)
  })
})
