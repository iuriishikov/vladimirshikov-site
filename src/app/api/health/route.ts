import { NextResponse } from 'next/server'

import { healthSchema, type Health } from '@/entities/health'
import { env } from '@/shared/config/env'

/**
 * Liveness endpoint. Consumed by three independent things — the container
 * HEALTHCHECK, the deploy script's post-deploy probe, and the status badge on
 * the home page — so its shape is pinned by a schema rather than by convention.
 */

// Never cached: a cached health check reports the health of the past.
export const dynamic = 'force-dynamic'

/** Module evaluation happens once per process, so this is the process start. */
const startedAt = Date.now()

export function GET(): NextResponse<Health> {
  const payload = healthSchema.parse({
    status: 'ok',
    version: env.APP_VERSION,
    uptime: Math.floor((Date.now() - startedAt) / 1000),
    timestamp: new Date().toISOString(),
  })

  return NextResponse.json(payload, {
    headers: {
      'cache-control': 'no-store, no-cache, must-revalidate',
    },
  })
}
