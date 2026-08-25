import { useTranslations } from 'next-intl'

import { Container, PencilSketch, SectionHeading } from '@/shared/ui'

import { ReviewsCarousel } from './reviews-carousel'

/** Ids from the dictionary, each with the seed that draws its avatar. */
const REVIEWS = [
  { id: 'r1', seed: 3 },
  { id: 'r2', seed: 10 },
  { id: 'r3', seed: 17 },
  { id: 'r4', seed: 24 },
  { id: 'r5', seed: 45 },
] as const

export function Reviews() {
  const t = useTranslations('Reviews')

  return (
    <section className="pb-[clamp(80px,9vw,130px)]">
      <Container>
        {/* The arrows below supply this section's bottom spacing, so the shared
            heading's own margin is dropped rather than doubled. */}
        <SectionHeading title={t('heading')} lead={t('lead')} className="mb-0" />
      </Container>

      <ReviewsCarousel>
        {REVIEWS.map(({ id, seed }) => (
          <li
            key={id}
            className="bg-card flex w-[min(86vw,410px)] flex-none snap-start flex-col gap-5 rounded-[14px] px-[30px] pt-[30px] pb-[26px]"
          >
            {/* Ornamental: the quotation is already marked up as one below. */}
            <span aria-hidden="true" className="text-[64px] leading-[0.5] font-extrabold">
              “
            </span>
            <p className="text-[16.5px] leading-[1.55] font-semibold tracking-[-0.005em]">
              {t(`items.${id}.quote`)}
            </p>
            <div className="mt-auto flex items-center gap-[14px]">
              <div className="bg-panel size-[46px] flex-none overflow-hidden rounded-full">
                <PencilSketch variant="avatar" seed={seed} />
              </div>
              <div>
                <p className="text-[14px] font-bold">{t(`items.${id}.author`)}</p>
                {/*
                 * `--faint` is tuned against the page background, where it just
                 * clears 4.5:1. On the card, a shade darker, it lands at 4.1:1
                 * and fails, so the light theme darkens it here. Dark mode keeps
                 * the token, which passes on its own card.
                 */}
                <p className="dark:text-faint mt-[2px] text-[12.5px] text-[#6d6d68]">
                  {t(`items.${id}.role`)}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ReviewsCarousel>
    </section>
  )
}
