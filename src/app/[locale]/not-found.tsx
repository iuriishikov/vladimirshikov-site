import { useTranslations } from 'next-intl'

import { Link } from '@/shared/i18n/navigation'
import { Button, Container } from '@/shared/ui'

/**
 * Rendered for any unmatched path inside a locale segment, and by an explicit
 * `notFound()` call. It stays inside the locale layout, so it is translated
 * and keeps the site chrome.
 */
export default function LocaleNotFound() {
  const t = useTranslations('NotFound')

  return (
    <Container className="flex flex-col items-start gap-4 py-24">
      <p className="text-muted-foreground text-sm font-medium">404</p>
      <h1 className="text-3xl font-semibold tracking-tight">{t('title')}</h1>
      <p className="text-muted-foreground max-w-prose">{t('description')}</p>
      <Button asChild className="mt-2">
        <Link href="/">{t('backHome')}</Link>
      </Button>
    </Container>
  )
}
