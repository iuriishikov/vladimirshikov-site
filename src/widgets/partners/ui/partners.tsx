import { useTranslations } from 'next-intl'

import { Container, LogoMarquee } from '@/shared/ui'

/**
 * Each marquee row arrives from the dictionary as one `|`-separated string, so
 * a translator can rename or reorder a partner without touching code.
 */
function toItems(row: string): readonly string[] {
  return row.split('|').map((item) => item.trim())
}

const ROW_TYPE = 'text-[clamp(22px,2.4vw,30px)] font-semibold tracking-[-0.02em]'

/**
 * The partner band: a two-line title beside its lead, then the names scrolling
 * past in opposite directions.
 */
export function Partners() {
  const t = useTranslations('Partners')

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
        className="border-border mt-14 border-t border-b [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)] py-[30px] [-webkit-mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]"
      >
        <LogoMarquee items={toItems(t('rowA'))} speed={55} direction="left" className={ROW_TYPE} />
        <LogoMarquee
          items={toItems(t('rowB'))}
          speed={44}
          direction="right"
          className={`text-faint mt-6 ${ROW_TYPE}`}
        />
      </div>
    </section>
  )
}
