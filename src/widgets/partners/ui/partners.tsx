import { useTranslations } from 'next-intl'

import type { CompanySlug } from '@/shared/config/company-logos'
import { CompanyMark, Container, LogoMarquee, type MarqueeItem } from '@/shared/ui'

/**
 * The two rows, by slug. Order and membership are the site's, not a
 * translator's — a logo belongs to a company, not to a language — while the
 * names themselves still come from the dictionary, because five of these are
 * set as words rather than as marks.
 */
const ROW_A: readonly CompanySlug[] = [
  'philipmorris',
  'pfizer',
  'microsoft',
  'nestle',
  'rosnano',
  'alfabank',
  'rolf',
  'bat',
  'bigroup',
  'caterpillar',
  'airastana',
]

const ROW_B: readonly CompanySlug[] = [
  'samruk',
  'kmg',
  'kazatomprom',
  'kegoc',
  'ktz',
  'samrukenergy',
  'supremecourt',
]

/**
 * The second row is a little smaller: it is the state-sector row, it sits
 * behind the first in the hierarchy, and its marks are stacked lockups that
 * would otherwise tower over the wordmarks in the row above.
 */
const ROW_A_HEIGHT = 30
const ROW_B_HEIGHT = 29

/**
 * The partner band: a two-line title beside its lead, then the client marks
 * scrolling past in opposite directions.
 */
export function Partners() {
  const t = useTranslations('Partners')

  const toItems = (slugs: readonly CompanySlug[], height: number): MarqueeItem[] =>
    slugs.map((slug) => ({
      key: slug,
      content: <CompanyMark slug={slug} name={t(`names.${slug}`)} height={height} />,
    }))

  return (
    <section id="partners" className="pb-[clamp(80px,9vw,130px)]">
      <Container className="flex flex-wrap items-end justify-between gap-7">
        <h2 className="text-[clamp(44px,6vw,84px)] leading-[1.02] font-bold tracking-[-0.03em]">
          {t('headingLine1')}
          <br />
          {t('headingLine2')}
        </h2>
        <p className="text-muted-foreground max-w-[430px] text-[15px] leading-[1.65]">
          {t('lead')}
        </p>
      </Container>

      {/*
       * `role="group"` is what makes the label legal: `aria-label` on a bare
       * <div> is a prohibited attribute, and axe fails the page for it.
       *
       * The mask fades both rows into the page edges rather than cutting them
       * off; the prefixed property is there for Safari below 15.4.
       */}
      <div
        role="group"
        aria-label={t('marqueeLabel')}
        className="border-border mt-14 border-t border-b [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)] py-[34px] [-webkit-mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]"
      >
        <LogoMarquee items={toItems(ROW_A, ROW_A_HEIGHT)} speed={55} direction="left" />
        <LogoMarquee
          items={toItems(ROW_B, ROW_B_HEIGHT)}
          speed={44}
          direction="right"
          className="text-faint mt-8"
        />
      </div>
    </section>
  )
}
