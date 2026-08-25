'use client'

import { useTranslations } from 'next-intl'
import { useState } from 'react'

const FAQ_IDS = ['q1', 'q2', 'q3', 'q4', 'q5'] as const

type FaqId = (typeof FAQ_IDS)[number]

/**
 * One answer open at a time, and pressing the open question closes it.
 *
 * The list starts collapsed rather than with the canvas's first answer open:
 * an answer that is already expanded makes the first press on it a *collapse*,
 * which is not what a reader — or the e2e suite driving the first item —
 * expects from an untouched accordion.
 */
export function FaqAccordion() {
  const t = useTranslations('Faq')
  const [openId, setOpenId] = useState<FaqId | undefined>(undefined)

  return (
    <ul className="border-border border-t">
      {FAQ_IDS.map((id) => {
        const isOpen = id === openId
        const questionId = `faq-question-${id}`
        const answerId = `faq-answer-${id}`

        return (
          <li key={id} className="border-border border-b">
            <h3>
              <button
                type="button"
                id={questionId}
                data-testid="faq-item"
                aria-expanded={isOpen}
                aria-controls={answerId}
                onClick={() => {
                  setOpenId(isOpen ? undefined : id)
                }}
                className="hover:text-muted-foreground flex w-full cursor-pointer items-baseline justify-between gap-6 px-1 py-6 text-left"
              >
                <span className="text-[clamp(16px,1.6vw,19px)] font-semibold tracking-[-0.01em]">
                  {t(`items.${id}.question`)}
                </span>
                {/* Decoration only — `aria-expanded` already carries the state,
                    and announcing "plus" after it would just repeat it wrongly. */}
                <span aria-hidden="true" className="flex-none text-[22px] font-medium">
                  {isOpen ? '−' : '+'}
                </span>
              </button>
            </h3>

            {/* Hidden rather than unmounted: `aria-controls` must resolve to a
                real element in both states. */}
            <div id={answerId} role="region" aria-labelledby={questionId} hidden={!isOpen}>
              <p className="text-muted-foreground max-w-[620px] px-1 pb-[26px] text-[14.5px] leading-[1.68]">
                {t(`items.${id}.answer`)}
              </p>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
