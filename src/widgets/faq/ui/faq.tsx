import { useTranslations } from 'next-intl'

import { Container } from '@/shared/ui'

import { FaqAccordion } from './faq-accordion'

export function Faq() {
  const t = useTranslations('Faq')

  return (
    <Container as="section" className="pb-[clamp(80px,9vw,130px)]">
      {/* auto-fit rather than a breakpoint: the two columns collapse when the
          narrower of them can no longer hold 320px. */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,320px),1fr))] items-start gap-x-[88px] gap-y-12">
        <div>
          <h2 className="text-[clamp(64px,9vw,120px)] leading-[0.95] font-bold tracking-[-0.03em]">
            {t('heading')}
          </h2>
          <p className="text-muted-foreground mt-[22px] max-w-[320px] text-[15px] leading-[1.65]">
            {t('lead')}
          </p>
        </div>

        <FaqAccordion />
      </div>
    </Container>
  )
}
