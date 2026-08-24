import { z } from 'zod'

/**
 * The contract of `GET /api/health`.
 *
 * It is defined once and used from three places — the route handler that
 * produces it, the client that consumes it, and the container HEALTHCHECK that
 * depends on it — so the shape cannot drift between them.
 */
export const healthSchema = z.object({
  status: z.literal('ok'),
  /** Application version, from package.json at build time. */
  version: z.string(),
  /** Seconds since the process started. */
  uptime: z.number().nonnegative(),
  timestamp: z.iso.datetime(),
})

export type Health = z.infer<typeof healthSchema>
