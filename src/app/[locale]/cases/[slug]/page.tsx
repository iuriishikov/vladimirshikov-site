import type { Metadata } from 'next'
import { hasLocale } from 'next-intl'
import { getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'

import { CaseStudyView } from '@/views/case-study'
import { CASE_STUDIES } from '@/entities/case-study'
import { routing } from '@/shared/i18n/routing'
import { buildPageMetadata } from '@/shared/lib/seo'
import { buildBreadcrumbs, buildProject, buildWorkPage } from '@/shared/lib/structured-data'
import { StructuredData } from '@/shared/ui/structured-data/structured-data'

interface CasePageProps {
  params: Promise<{ locale: string; slug: string }>
}

/** The slug is untrusted input; only a known case may render. */
function findCase(slug: string) {
  return CASE_STUDIES.find((study) => study.slug === slug)
}

export async function generateMetadata({ params }: CasePageProps): Promise<Metadata> {
  const { locale, slug } = await params
  if (!hasLocale(routing.locales, locale)) notFound()

  const caseStudy = findCase(slug)
  if (!caseStudy) notFound()

  const t = await getTranslations({ locale, namespace: 'Works' })

  return buildPageMetadata({
    locale,
    title: t(`items.${caseStudy.slug}.name`),
    description: t(`items.${caseStudy.slug}.summary`),
    path: `/cases/${caseStudy.slug}`,
  })
}

export default async function CasePage({ params }: CasePageProps) {
  const { locale, slug } = await params
  if (!hasLocale(routing.locales, locale)) notFound()

  const caseStudy = findCase(slug)
  if (!caseStudy) notFound()

  const [works, hero, header] = await Promise.all([
    getTranslations({ locale, namespace: 'Works' }),
    getTranslations({ locale, namespace: 'Hero' }),
    getTranslations({ locale, namespace: 'Header' }),
  ])

  const path = `/cases/${caseStudy.slug}`
  const name = works(`items.${caseStudy.slug}.name`)

  return (
    <>
      <StructuredData
        data={buildWorkPage({
          locale,
          path,
          name,
          work: buildProject({
            locale,
            path,
            name,
            description: works(`items.${caseStudy.slug}.summary`),
            personName: hero('name'),
            // Only where the source material named a client. The third project
            // names a horizon instead, and inventing an organisation for it
            // would be the one thing structured data must never do.
            ...(caseStudy.company !== undefined && { client: caseStudy.wordmark }),
          }),
          crumbs: buildBreadcrumbs({
            locale,
            trail: [
              { name: header('nav.home'), path: '' },
              { name, path },
            ],
          }),
        })}
      />
      <CaseStudyView caseStudy={caseStudy} />
    </>
  )
}
