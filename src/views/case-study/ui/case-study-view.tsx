import { useTranslations } from 'next-intl'

import { CaseCover, type CaseStudy } from '@/entities/case-study'
import { Link } from '@/shared/i18n/navigation'
import { Button, Container } from '@/shared/ui'

interface CaseStudyViewProps {
  caseStudy: CaseStudy
}

/**
 * One project: the cover it is known by on the home page, then what it was.
 *
 * The cover is the same component the grid uses, on purpose — arriving here
 * should feel like the card opened, not like a second design of the same work.
 */
export function CaseStudyView({ caseStudy }: CaseStudyViewProps) {
  const t = useTranslations('Works')
  const item = `items.${caseStudy.slug}` as const

  return (
    <Container className="pt-[clamp(56px,7vw,96px)] pb-[clamp(80px,10vw,150px)]">
      <p className="text-faint text-[13px] font-semibold tracking-[0.02em] uppercase">
        {t('meta')}
      </p>

      <h1 className="mt-5 max-w-[16ch] text-[clamp(40px,7vw,96px)] leading-[1.02] font-bold tracking-[-0.03em]">
        {t(`${item}.name`)}
      </h1>

      {/*
       * `auto-fit` rather than a breakpoint: the cover and the text sit side by
       * side until the narrower of them can no longer hold 340px.
       */}
      <div className="mt-[clamp(36px,4vw,60px)] grid grid-cols-[repeat(auto-fit,minmax(min(100%,340px),1fr))] items-start gap-x-[72px] gap-y-12">
        <CaseCover caseStudy={caseStudy} caption={t(`${item}.caption`)} />

        <div>
          <p className="text-[clamp(19px,2vw,24px)] leading-[1.45] font-semibold tracking-[-0.015em]">
            {t(`${item}.summary`)}
          </p>
          <p className="text-muted-foreground mt-6 text-[16px] leading-[1.72]">
            {t(`${item}.detail`)}
          </p>

          <p className="border-border text-faint mt-8 border-t pt-6 text-[14px]">
            {t(`${item}.tag`)}
          </p>
        </div>
      </div>

      <Button asChild size="lg" className="mt-[clamp(48px,6vw,80px)]">
        <Link href="/">{t('back')}</Link>
      </Button>
    </Container>
  )
}
