'use client'

import { useTranslations } from 'next-intl'
import { useEffect } from 'react'

import { Button, Container } from '@/shared/ui'

interface LocaleErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

/**
 * Catches render errors below the locale layout. The layout — and therefore
 * the translations, header and footer — survives, so the visitor keeps a way
 * out of the broken page.
 */
export default function LocaleError({ error, reset }: LocaleErrorProps) {
  const t = useTranslations('ErrorBoundary')

  useEffect(() => {
    // In production the message is redacted by Next; `digest` is the handle
    // that ties this screen to the server-side log entry.
    console.error('Unhandled error boundary', error)
  }, [error])

  return (
    <Container className="flex flex-col items-start gap-4 py-24">
      <h1 className="text-3xl font-semibold tracking-tight">{t('title')}</h1>
      <p className="text-muted-foreground max-w-prose">{t('description')}</p>
      {error.digest !== undefined && (
        <p className="text-muted-foreground font-mono text-xs">
          {t('digest', { digest: error.digest })}
        </p>
      )}
      <Button onClick={reset} className="mt-2">
        {t('retry')}
      </Button>
    </Container>
  )
}
