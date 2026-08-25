import { healthSchema, type Health } from '@/entities/health'
import { httpRequest } from '@/shared/api/http'

/** Reads the app's own health endpoint. Same-origin, so a relative URL is enough. */
export function getHealth(): Promise<Health> {
  return httpRequest('/api/health', { schema: healthSchema, timeoutMs: 5000 })
}
