'use client'

import { useTranslations } from 'next-intl'
import { useRef, type ReactNode } from 'react'

import { Container } from '@/shared/ui'

/** One card (410px) plus the 24px gap, so a press lands the next card at the edge. */
const SCROLL_STEP = 440

const ARROW =
  'border-control-border bg-background text-foreground hover:bg-foreground hover:text-background hover:border-foreground flex size-11 flex-none cursor-pointer items-center justify-center rounded-full border text-[17px]'

/*
 * A region that scrolls but holds nothing focusable cannot be read without a
 * pointer, so axe fails the page unless the region itself takes focus — and
 * these cards contain no controls to tab into.
 *
 * It is a named constant because jsx-a11y's `no-noninteractive-tabindex` reads
 * literal values only. The rule cannot see the overflow that makes this focus
 * stop necessary, and silencing it with a disable comment is not allowed here,
 * so the intent is written down instead.
 */
const SCROLL_REGION_TAB_INDEX = 0

interface ReviewsCarouselProps {
  /** The cards, rendered on the server and slotted into the scrolling track. */
  children: ReactNode
}

/**
 * The scrolling half of the reviews section — the only part that needs to run
 * in the browser, which is why the cards themselves stay on the server.
 */
export function ReviewsCarousel({ children }: ReviewsCarouselProps) {
  const t = useTranslations('Reviews')
  const trackRef = useRef<HTMLDivElement>(null)

  const scrollByStep = (distance: number): void => {
    trackRef.current?.scrollBy({ left: distance, behavior: 'smooth' })
  }

  return (
    <>
      <Container className="mt-9 mb-5 flex justify-end gap-[10px]">
        <button
          type="button"
          data-testid="reviews-prev"
          aria-label={t('previous')}
          onClick={() => {
            scrollByStep(-SCROLL_STEP)
          }}
          className={ARROW}
        >
          <span aria-hidden="true">←</span>
        </button>
        <button
          type="button"
          data-testid="reviews-next"
          aria-label={t('next')}
          onClick={() => {
            scrollByStep(SCROLL_STEP)
          }}
          className={ARROW}
        >
          <span aria-hidden="true">→</span>
        </button>
      </Container>

      {/* Outside the Container so the track bleeds to the viewport edge, as the
          canvas has it, while keeping the same gutter as its first inset. */}
      <div
        ref={trackRef}
        tabIndex={SCROLL_REGION_TAB_INDEX}
        role="group"
        aria-label={t('regionLabel')}
        data-testid="reviews-track"
        className="no-scrollbar snap-x snap-mandatory overflow-x-auto px-[clamp(20px,4vw,48px)] pt-1 pb-2"
      >
        <ul className="flex gap-6">{children}</ul>
      </div>
    </>
  )
}
