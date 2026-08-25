import { environmentManager, QueryClient } from '@tanstack/react-query'

import { HttpError } from './http'

/**
 * A fresh client per server request, a single shared client in the browser.
 *
 * Reusing one client across server requests would leak one visitor's data into
 * another's render — the most expensive bug this file exists to prevent.
 */
function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Long enough that a client-side navigation does not immediately
        // re-fetch what the server just streamed down.
        staleTime: 60_000,
        gcTime: 5 * 60_000,
        refetchOnWindowFocus: false,
        retry(failureCount, error) {
          // A 4xx will not fix itself; retrying it just delays the error.
          if (error instanceof HttpError && error.status >= 400 && error.status < 500) return false
          return failureCount < 2
        },
      },
      mutations: {
        retry: false,
      },
    },
  })
}

/** Module-scoped holder, so the browser keeps exactly one cache. */
const browserCache: { client?: QueryClient } = {}

export function getQueryClient(): QueryClient {
  if (environmentManager.isServer()) return makeQueryClient()
  browserCache.client ??= makeQueryClient()
  return browserCache.client
}
