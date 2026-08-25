import { useTranslations } from 'next-intl'

import { AuthorCard } from '@/entities/author'
import { Container } from '@/shared/ui'

export function AboutView() {
  const t = useTranslations('About')

  return (
    <Container className="py-16 sm:py-24">
      <h1 className="text-4xl font-semibold tracking-tight text-balance">{t('title')}</h1>
      <p className="text-muted-foreground mt-4 max-w-2xl text-lg text-pretty">{t('lead')}</p>
      <p className="mt-4 max-w-2xl leading-relaxed">{t('body')}</p>

      <AuthorCard className="mt-10 max-w-md" />
    </Container>
  )
}
