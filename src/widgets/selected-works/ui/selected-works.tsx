import { useTranslations } from 'next-intl'

import { CASE_STUDIES, CaseCover } from '@/entities/case-study'
import { Link } from '@/shared/i18n/navigation'
import { Container, SectionHeading } from '@/shared/ui'

/**
 * The case grid. The covers themselves belong to the `case-study` entity, since
 * a case page has to draw the very same artwork; this widget only arranges them
 * and attaches the words.
 */
export function SelectedWorks() {
  const t = useTranslations('Works')

  return (
    <Container as="section" id="cases" className="pb-[clamp(80px,9vw,130px)]">
      <SectionHeading title={t('heading')} lead={t('lead')} className="max-w-[660px]" />

      <ul className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,480px),1fr))] gap-x-7 gap-y-14">
        {CASE_STUDIES.map((caseStudy) => (
          <li key={caseStudy.slug}>
            {/*
             * The cover carries the wordmark, the index, a badge and the
             * caption, so an unlabelled link would announce all four before the
             * name a reader is listening for. `aria-label` replaces that pile
             * with one sentence that names the case.
             */}
            <Link
              href={`/cases/${caseStudy.slug}`}
              data-testid="case-card"
              aria-label={t('viewCase', { name: t(`items.${caseStudy.slug}.name`) })}
              // `rounded-xl` is here for the focus ring, not for the card: the
              // global `:focus-visible` outline follows the element's radius,
              // and a square ring around a rounded cover looks like a bug.
              className="group block rounded-xl"
            >
              <CaseCover caseStudy={caseStudy} caption={t(`items.${caseStudy.slug}.caption`)} />

              <div className="mt-4 flex items-baseline justify-between gap-4">
                <span className="text-[18px] font-bold tracking-[-0.01em]">
                  {t(`items.${caseStudy.slug}.name`)}
                </span>
                <span className="text-faint text-right text-[13px]">
                  {t(`items.${caseStudy.slug}.tag`)}
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </Container>
  )
}
