import { useTranslations } from 'next-intl'

import { ContactForm } from '@/features/contact-form'
import { StatusBadge } from '@/features/health-status'
import { AuthorCard } from '@/entities/author'
import { Container } from '@/shared/ui'

/**
 * A secondary page, kept from the scaffold.
 *
 * The portfolio's own "About" is a section on the home page, reached by anchor.
 * This route is where the pieces that prove the plumbing still live — the
 * Server Action behind the contact form, the TanStack Query call behind the
 * status badge, and the author entity. It is not in the site navigation, and it
 * disappears the day those flows have a real home in the design.
 */
export function AboutView() {
  const t = useTranslations('About')

  return (
    <Container className="py-[clamp(80px,9vw,130px)]">
      <h1 className="text-[clamp(40px,5vw,64px)] font-bold tracking-[-0.03em] text-balance">
        {t('title')}
      </h1>
      <p className="text-muted-foreground mt-4 max-w-2xl text-[18px] leading-[1.6] text-pretty">
        {t('lead')}
      </p>
      <p className="mt-4 max-w-2xl leading-relaxed">{t('body')}</p>

      <div className="mt-12 grid gap-6 md:grid-cols-2">
        <AuthorCard />
        <div className="flex flex-col gap-6">
          <StatusBadge />
          <ContactForm />
        </div>
      </div>
    </Container>
  )
}
