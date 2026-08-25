import type { Metadata } from 'next'
import { hasLocale } from 'next-intl'
import { getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'

import { HomeView } from '@/views/home'
import { routing } from '@/shared/i18n/routing'
import { buildPageMetadata } from '@/shared/lib/seo'
import { buildPerson, buildProfilePage, buildWebsite } from '@/shared/lib/structured-data'
import { StructuredData } from '@/shared/ui/structured-data/structured-data'

interface HomePageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: HomePageProps): Promise<Metadata> {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()

  const t = await getTranslations({ locale, namespace: 'Metadata.home' })

  return buildPageMetadata({
    locale,
    title: t('title'),
    description: t('description'),
  })
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()

  const [meta, hero, profile, services, education] = await Promise.all([
    getTranslations({ locale, namespace: 'Metadata.home' }),
    getTranslations({ locale, namespace: 'Hero' }),
    getTranslations({ locale, namespace: 'Profile' }),
    getTranslations({ locale, namespace: 'Services' }),
    getTranslations({ locale, namespace: 'Education' }),
  ])

  /*
   * Every value here is on the page a crawler is reading, in the edition it is
   * reading — the name from the hero, the positioning sentence beneath it, the
   * four practice areas, the university from the ledger. Structured data that
   * disagrees with the visible page is the one kind Google acts against.
   */
  const person = buildPerson({
    locale,
    name: hero('name'),
    description: hero('statement'),
    jobTitle: profile('roleLine'),
    knowsAbout: (['s1', 's2', 's3', 's4'] as const).map((id) => services(`items.${id}.title`)),
    alumniOf: education('items.e1.school'),
  })

  return (
    <>
      <StructuredData
        data={buildProfilePage({
          locale,
          title: meta('title'),
          description: meta('description'),
          person,
          website: buildWebsite(locale),
        })}
      />
      <HomeView />
    </>
  )
}
