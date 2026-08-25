import { z } from 'zod'

// Disables Zod's `new Function()` JIT, which the production CSP blocks.
import '@/shared/config/zod'

/**
 * Validation messages are *keys*, not sentences.
 *
 * The same schema runs in the browser and again inside the Server Action, and
 * only one of those two places has a translator. Emitting a key lets each side
 * render the message in the visitor's language from `messages/*.json`.
 */
export const SUBSCRIPTION_ERROR_KEYS = ['emailRequired', 'emailInvalid', 'emailTooLong'] as const

export type SubscriptionErrorKey = (typeof SUBSCRIPTION_ERROR_KEYS)[number]

export function isSubscriptionErrorKey(value: string): value is SubscriptionErrorKey {
  return (SUBSCRIPTION_ERROR_KEYS as readonly string[]).includes(value)
}

export const subscriptionSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { message: 'emailRequired' satisfies SubscriptionErrorKey })
    // 254 is the maximum length of an email address per RFC 5321.
    .max(254, { message: 'emailTooLong' satisfies SubscriptionErrorKey })
    .refine((value) => z.email().safeParse(value).success, {
      message: 'emailInvalid' satisfies SubscriptionErrorKey,
    }),
})

export type SubscriptionInput = z.infer<typeof subscriptionSchema>
