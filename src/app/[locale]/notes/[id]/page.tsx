import type { Metadata } from 'next'
import { hasLocale } from 'next-intl'
import { getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'

import { NoteView } from '@/views/note'
import { routing } from '@/shared/i18n/routing'
import { buildPageMetadata } from '@/shared/lib/seo'
import { buildArticle, buildBreadcrumbs, buildWorkPage } from '@/shared/lib/structured-data'
import { StructuredData } from '@/shared/ui/structured-data/structured-data'

/** The notes that exist in the dictionary. Anything else is a 404. */
const NOTE_IDS = ['growth'] as const
type NoteId = (typeof NOTE_IDS)[number]

interface NotePageProps {
  params: Promise<{ locale: string; id: string }>
}

function isNoteId(value: string): value is NoteId {
  return (NOTE_IDS as readonly string[]).includes(value)
}

export async function generateMetadata({ params }: NotePageProps): Promise<Metadata> {
  const { locale, id } = await params
  if (!hasLocale(routing.locales, locale) || !isNoteId(id)) notFound()

  const blog = await getTranslations({ locale, namespace: 'Blog' })

  return buildPageMetadata({
    locale,
    title: blog(`items.${id}.title`),
    description: blog(`items.${id}.excerpt`),
    path: `/notes/${id}`,
  })
}

export default async function NotePage({ params }: NotePageProps) {
  const { locale, id } = await params
  if (!hasLocale(routing.locales, locale) || !isNoteId(id)) notFound()

  const [blog, hero, header] = await Promise.all([
    getTranslations({ locale, namespace: 'Blog' }),
    getTranslations({ locale, namespace: 'Hero' }),
    getTranslations({ locale, namespace: 'Header' }),
  ])

  const path = `/notes/${id}`

  const title = blog(`items.${id}.title`)

  return (
    <>
      <StructuredData
        data={buildWorkPage({
          locale,
          path,
          name: title,
          work: buildArticle({
            locale,
            path,
            headline: title,
            description: blog(`items.${id}.excerpt`),
            personName: hero('name'),
          }),
          /*
           * The writing section is an anchor on the home page rather than a
           * route of its own, so the trail is two steps: the site, then the
           * essay. A crumb pointing at a page that does not exist would be
           * worse than a short trail.
           */
          crumbs: buildBreadcrumbs({
            locale,
            trail: [
              { name: header('nav.home'), path: '' },
              { name: title, path },
            ],
          }),
        })}
      />
      <NoteView />
    </>
  )
}
