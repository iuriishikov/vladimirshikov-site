import { useTranslations } from 'next-intl'

import { Container, SectionHeading } from '@/shared/ui'

import { SERVICE_IDS } from '../model/service-ids'
import { SERVICE_ICONS } from './service-icons'

/**
 * The services list: one bordered row per offer, closed by a pair of tiles.
 *
 * Below 860px the four-column grid folds to `44px 1fr`, and the description and
 * the tiles stack under the title in the same column — the same collapse the
 * education ledger makes, so the two sections stay in step.
 */
export function Services() {
  const t = useTranslations('Services')

  return (
    <Container as="section" className="pb-[clamp(80px,9vw,130px)]">
      <SectionHeading title={t('heading')} lead={t('lead')} />

      <ol className="border-border border-t">
        {SERVICE_IDS.map((id, index) => (
          <li
            key={id}
            className="border-border grid grid-cols-[64px_1.1fr_1.4fr_auto] items-center gap-6 border-b px-1 py-[30px] max-[860px]:grid-cols-[44px_1fr] max-[860px]:gap-y-[14px]"
          >
            {/* The bracketed ordinal only restates the list's own numbering. */}
            <span aria-hidden="true" className="text-faint text-[14px] font-medium">
              [{String(index + 1).padStart(2, '0')}]
            </span>

            <h3 className="text-[clamp(20px,2.1vw,26px)] font-bold tracking-[-0.015em]">
              {t(`items.${id}.title`)}
            </h3>

            <p className="text-muted-foreground max-w-[460px] text-[14.5px] leading-[1.55] max-[860px]:col-start-2">
              {t(`items.${id}.description`)}
            </p>

            <div
              aria-hidden="true"
              className="flex justify-end gap-2.5 max-[860px]:col-start-2 max-[860px]:justify-start"
            >
              {SERVICE_ICONS[id]}
            </div>
          </li>
        ))}
      </ol>
    </Container>
  )
}
