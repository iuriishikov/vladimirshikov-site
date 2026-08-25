'use server'

import {
  isSubscriptionErrorKey,
  subscriptionSchema,
  type SubscriptionErrorKey,
} from '@/entities/subscription'

export type SubscribeResult =
  | { status: 'success' }
  | { status: 'invalid'; errorKey: SubscriptionErrorKey }
  | { status: 'error' }

/**
 * A Server Action, so the form works before (and without) hydration.
 *
 * The client already validated with this exact schema — and that is irrelevant.
 * A Server Action is a public HTTP endpoint; anything arriving here is
 * untrusted, so it is validated again.
 */
export async function subscribe(input: unknown): Promise<SubscribeResult> {
  const parsed = subscriptionSchema.safeParse(input)

  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? ''
    return {
      status: 'invalid',
      errorKey: isSubscriptionErrorKey(message) ? message : 'emailInvalid',
    }
  }

  try {
    // Persistence is deliberately not implemented: this scaffold has no data
    // store yet. Replace this with the real call — the contract around it
    // (validation, error shape, i18n keys) is already correct.
    await Promise.resolve(parsed.data.email)

    return { status: 'success' }
  } catch (error) {
    // Never leak an internal error message to the browser; log it instead.
    console.error('subscribe failed', error)
    return { status: 'error' }
  }
}
