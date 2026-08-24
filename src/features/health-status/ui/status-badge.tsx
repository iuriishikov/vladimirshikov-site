'use client'

import { useTranslations } from 'next-intl'

import { cn } from '@/shared/lib/cn'
import { formatDuration } from '@/shared/lib/format'

import { useHealth } from '../model/use-health'

type HealthState = 'checking' | 'healthy' | 'unhealthy'

const dotClassName: Record<HealthState, string> = {
  checking: 'bg-muted-foreground animate-pulse',
  healthy: 'bg-success',
  unhealthy: 'bg-destructive',
}

interface StatusBadgeProps {
  className?: string
}

/**
 * A small live view of the app's own health endpoint. It exists mostly to keep
 * the data layer honest: if TanStack Query, the fetch wrapper or the schema
 * break, this badge turns red on the home page.
 */
export function StatusBadge({ className }: StatusBadgeProps) {
  const t = useTranslations('StatusBadge')
  const { data, isPending, isError } = useHealth()

  const state: HealthState = isPending ? 'checking' : isError ? 'unhealthy' : 'healthy'

  const label: Record<HealthState, string> = {
    checking: t('checking'),
    healthy: t('healthy'),
    unhealthy: t('unhealthy'),
  }

  return (
    <p
      data-testid="status-badge"
      data-state={state}
      role="status"
      aria-label={t('label')}
      className={cn(
        'border-border text-muted-foreground inline-flex items-center gap-2',
        'w-fit rounded-full border px-3 py-1 text-xs',
        className,
      )}
    >
      <span aria-hidden="true" className={cn('size-2 rounded-full', dotClassName[state])} />
      <span className="text-foreground font-medium">{label[state]}</span>
      {data !== undefined && <span>{t('uptime', { value: formatDuration(data.uptime) })}</span>}
    </p>
  )
}
