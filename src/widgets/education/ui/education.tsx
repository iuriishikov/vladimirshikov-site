import { useTranslations } from 'next-intl'

import { Container, SectionHeading } from '@/shared/ui'

const EDUCATION_IDS = ['e1', 'e2', 'e3', 'e4'] as const

/**
 * The education ledger: one bordered row per entry.
 *
 * Below 860px the four-column grid folds to `44px 1fr` and the degree and the
 * years drop underneath the school name — at that width the two narrow columns
 * would otherwise set one word per line.
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
            className="border-border grid grid-cols-[64px_1.5fr_1fr_140px] items-baseline gap-6 border-b px-1 py-8 max-[860px]:grid-cols-[44px_1fr] max-[860px]:gap-y-2"
          >
            {/* The bracketed ordinal only restates the list's own numbering. */}
            <span aria-hidden="true" className="text-faint text-[14px] font-medium">
              [{String(index + 1).padStart(2, '0')}]
            </span>

            <div>
              <h3 className="text-[clamp(20px,2vw,25px)] font-bold tracking-[-0.015em]">
                {t(`items.${id}.school`)}
              </h3>
              <p className="text-muted-foreground mt-2 max-w-[480px] text-[14.5px] leading-[1.55]">
                {t(`items.${id}.note`)}
              </p>
            </div>

            <p className="text-foreground-soft text-[15px] font-medium max-[860px]:col-start-2">
              {t(`items.${id}.degree`)}
            </p>

            <p className="text-faint text-right text-[14px] max-[860px]:col-start-2 max-[860px]:text-left">
              {t(`items.${id}.years`)}
            </p>
          </li>
        ))}
      </ol>
    </Container>
  )
}
