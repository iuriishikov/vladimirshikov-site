'use client'

import { useQuery, type UseQueryResult } from '@tanstack/react-query'

import type { Health } from '@/entities/health'

import { getHealth } from '../api/get-health'

export const healthQueryKey = ['health'] as const

/**
 * The query key is exported so a Server Component can prefetch into the same
 * cache entry the client hydrates — the two must not drift apart.
 */
export function useHealth(): UseQueryResult<Health> {
  return useQuery({
    queryKey: healthQueryKey,
    queryFn: getHealth,
    refetchInterval: 60_000,
    staleTime: 30_000,
  })
}
