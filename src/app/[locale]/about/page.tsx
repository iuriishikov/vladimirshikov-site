import type { Metadata } from 'next'
import { hasLocale } from 'next-intl'
import { getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'

import { AboutView } from '@/views/about'
import { routing } from '@/shared/i18n/routing'
import { buildPageMetadata } from '@/shared/lib/seo'

interface AboutPageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: AboutPageProps): Promise<Metadata> {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()

  const t = await getTranslations({ locale, namespace: 'Metadata.about' })

  return buildPageMetadata({
    locale,
    title: t('title'),
    description: t('description'),
    path: '/about',
  })
}

export default function AboutPage() {
  return <AboutView />
}
