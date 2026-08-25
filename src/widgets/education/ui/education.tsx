import { useTranslations } from 'next-intl'

import { Container, SectionHeading } from '@/shared/ui'

const EDUCATION_IDS = ['e1', 'e2'] as const

/**
 * The education ledger: one bordered row per entry.
 *
 * The canvas drew four columns — school, note, degree, years. Only the school
 * and the faculty are on record here, and printing two empty columns to keep
 * the drawing would leave the row looking broken rather than sparse, so the
 * faculty sits under the school name and the row is two columns wide.
 */
export function Education() {
  const t = useTranslations('Education')

  return (
    <Container as="section" id="education" className="pb-[clamp(80px,9vw,130px)]">
      <SectionHeading title={t('heading')} lead={t('lead')} />

      <ol className="border-border border-t">
        {EDUCATION_IDS.map((id, index) => (
          <li
            key={id}
            className="border-border grid grid-cols-[64px_1fr] items-baseline gap-6 border-b px-1 py-8 max-[860px]:grid-cols-[44px_1fr]"
          >
            {/* The bracketed ordinal only restates the list's own numbering. */}
            <span aria-hidden="true" className="text-faint text-[14px] font-medium">
              [{String(index + 1).padStart(2, '0')}]
            </span>

            <div>
              <h3 className="text-[clamp(20px,2vw,25px)] font-bold tracking-[-0.015em]">
                {t(`items.${id}.school`)}
              </h3>
              <p className="text-foreground-soft mt-2 text-[15px] font-medium empty:hidden">
                {t(`items.${id}.degree`)}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </Container>
  )
}
