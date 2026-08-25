import { useTranslations } from 'next-intl'

import { Link } from '@/shared/i18n/navigation'
import { Button, Container } from '@/shared/ui'

/**
 * The essay, in the order it argues itself.
 *
 * The dictionary numbers its paragraphs rather than nesting them, so the shape
 * of the piece — which heading owns which paragraphs — lives here, where it can
 * be read at a glance, instead of being spelled out twice in two languages.
 */
const SECTIONS = [
  { heading: undefined, paragraphs: ['p1', 'p2'] },
  { heading: 'h1', paragraphs: ['p3', 'p4', 'p5'] },
  { heading: 'h2', paragraphs: ['p6', 'p7', 'p8'] },
  { heading: 'h3', paragraphs: ['p9', 'p10', 'p11'] },
  { heading: 'h4', paragraphs: ['p12', 'p13'] },
] as const

const QUESTION_IDS = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7'] as const

const CLOSING_IDS = ['p15', 'p16', 'p17', 'p18'] as const

const PARAGRAPH_CLASSNAME = 'text-foreground-soft mt-6 text-[17px] leading-[1.75]'
const HEADING_CLASSNAME =
  'mt-[clamp(44px,5vw,72px)] text-[clamp(24px,2.6vw,32px)] leading-[1.2] font-bold tracking-[-0.02em]'

export function NoteView() {
  const t = useTranslations('Note.growth')
  const tMeta = useTranslations('Note')

  return (
    <Container className="pt-[clamp(56px,7vw,96px)] pb-[clamp(80px,10vw,150px)]">
      {/* A measure, not a breakpoint: 68 characters is where a line stops being
          comfortable to read, whatever the window is doing. */}
      <article className="max-w-[68ch]">
        <p className="text-faint text-[13px] font-semibold tracking-[0.02em] uppercase">
          {tMeta('meta')}
        </p>

        <h1 className="mt-5 text-[clamp(34px,5.4vw,68px)] leading-[1.04] font-bold tracking-[-0.03em]">
          {t('title')}
        </h1>

        <p className="mt-8 text-[clamp(19px,2vw,23px)] leading-[1.5] font-semibold tracking-[-0.015em]">
          {t('lead')}
        </p>

        {SECTIONS.map((section) => (
          <section key={section.heading ?? 'opening'}>
            {section.heading ? <h2 className={HEADING_CLASSNAME}>{t(section.heading)}</h2> : null}
            {section.paragraphs.map((id) => (
              <p key={id} className={PARAGRAPH_CLASSNAME}>
                {t(id)}
              </p>
            ))}
          </section>
        ))}

        <section>
          <h2 className={HEADING_CLASSNAME}>{t('h5')}</h2>
          <p className={PARAGRAPH_CLASSNAME}>{t('p14')}</p>

          <ol className="border-border mt-8 border-t">
            {QUESTION_IDS.map((id) => (
              <li key={id} className="border-border border-b py-5 text-[17px] leading-[1.5]">
                {t(id)}
              </li>
            ))}
          </ol>

          {CLOSING_IDS.map((id) => (
            <p key={id} className={PARAGRAPH_CLASSNAME}>
              {t(id)}
            </p>
          ))}
        </section>
      </article>

      <Button asChild size="lg" className="mt-[clamp(48px,6vw,80px)]">
        <Link href="/">{tMeta('back')}</Link>
      </Button>
    </Container>
  )
}
