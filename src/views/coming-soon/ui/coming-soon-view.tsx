import { useTranslations } from 'next-intl'

import { Link } from '@/shared/i18n/navigation'
import { Button, Container } from '@/shared/ui'

interface ComingSoonViewProps {
  /** What the visitor clicked — the case's wordmark or the note's title. */
  title: string
  /** "Case study" / "Note" — names the kind of page that is missing. */
  kind: string
}

/**
 * The landing place for a case or a note that has not been written yet.
 *
 * The portfolio links to every case and every note by design. Rather than
 * shipping those links dead — a 404 reads as a broken site, not an unfinished
 * one — they land here, which says plainly that the page is still coming.
 *
 * This whole view is temporary: it goes away with the Case design.
 */
export function ComingSoonView({ title, kind }: ComingSoonViewProps) {
  const t = useTranslations('ComingSoon')

  return (
    <Container className="flex flex-col items-start gap-5 py-[clamp(80px,12vw,180px)]">
      <p className="text-faint text-[13px] font-semibold tracking-[0.02em] uppercase">
        {kind} · {t('eyebrow')}
      </p>
      <h1 className="text-[clamp(40px,7vw,96px)] leading-[1.02] font-bold tracking-[-0.03em]">
        {title}
      </h1>
      <p className="text-muted-foreground max-w-[52ch] text-[16px] leading-[1.7]">{t('body')}</p>
      <Button asChild size="lg" className="mt-4">
        <Link href="/">{t('back')}</Link>
      </Button>
    </Container>
  )
}
