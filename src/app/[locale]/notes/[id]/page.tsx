import type { Metadata } from 'next'
import { hasLocale } from 'next-intl'
import { getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'

import { ComingSoonView } from '@/views/coming-soon'
import { routing } from '@/shared/i18n/routing'
import { buildPageMetadata } from '@/shared/lib/seo'

/** The notes that exist in the dictionary. Anything else is a 404. */
const NOTE_IDS = ['n1', 'n2', 'n3'] as const
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
  const comingSoon = await getTranslations({ locale, namespace: 'ComingSoon' })

  return buildPageMetadata({
    locale,
    title: blog(`items.${id}.title`),
    description: comingSoon('body'),
    path: `/notes/${id}`,
  })
}

export default async function NotePage({ params }: NotePageProps) {
  const { locale, id } = await params
  if (!hasLocale(routing.locales, locale) || !isNoteId(id)) notFound()

  const blog = await getTranslations({ locale, namespace: 'Blog' })
  const comingSoon = await getTranslations({ locale, namespace: 'ComingSoon' })

  return <ComingSoonView title={blog(`items.${id}.title`)} kind={comingSoon('noteMeta')} />
}
