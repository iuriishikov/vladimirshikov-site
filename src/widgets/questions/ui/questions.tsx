import { useTranslations } from 'next-intl'

import { Container } from '@/shared/ui'

const QUESTION_IDS = ['q1', 'q2', 'q3', 'q4', 'q5'] as const

/**
 * "When I am most useful" — the questions that bring an owner here.
 *
 * The canvas drew an accordion in this slot. These questions have no answers
 * to reveal: they are the reader's own questions, and the section that follows
 * is the answer. So the rows keep the drawing's ruled list and drop the
 * disclosure — a control that expands to nothing is worse than no control.
 */
export function Questions() {
  const t = useTranslations('Questions')

  return (
    <Container as="section" className="pb-[clamp(80px,9vw,130px)]">
      {/* auto-fit rather than a breakpoint: the two columns collapse when the
          narrower of them can no longer hold 320px. */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,320px),1fr))] items-start gap-x-[88px] gap-y-12">
        <div>
          <h2 className="text-[clamp(48px,7vw,96px)] leading-[0.98] font-bold tracking-[-0.03em]">
            {t('heading')}
          </h2>
          <p className="text-muted-foreground mt-[22px] max-w-[360px] text-[15px] leading-[1.65]">
            {t('lead')}
          </p>
        </div>

        <div>
          <ul className="border-border border-t">
            {QUESTION_IDS.map((id) => (
              <li
                key={id}
                data-testid="question-item"
                className="border-border flex items-baseline gap-5 border-b px-1 py-6"
              >
                {/* Decoration: the question mark is already in the sentence. */}
                <span aria-hidden="true" className="text-faint flex-none text-[14px] font-medium">
                  —
                </span>
                <span className="text-[clamp(16px,1.6vw,19px)] leading-[1.45] font-semibold tracking-[-0.01em]">
                  {t(`items.${id}`)}
                </span>
              </li>
            ))}
          </ul>

          <p className="text-muted-foreground mt-[26px] max-w-[620px] text-[14.5px] leading-[1.68]">
            {t('closing')}
          </p>
        </div>
      </div>
    </Container>
  )
}
