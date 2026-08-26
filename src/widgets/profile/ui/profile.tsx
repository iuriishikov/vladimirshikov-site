import { useTranslations } from 'next-intl'

import { Container } from '@/shared/ui'

/** The dictionary numbers the statistics rather than nesting them. */
const STAT_IDS = ['1', '2', '3'] as const

/**
 * The "about" section: who the name at the top belongs to, on the left, and
 * what they do, on the right, closing on the three headline numbers.
 */
export function Profile() {
  const t = useTranslations('Profile')

  return (
    <Container
      as="section"
      id="about"
      className="pt-[clamp(80px,9vw,130px)] pb-[clamp(70px,8vw,120px)]"
    >
      {/*
       * `auto-fit` rather than a breakpoint: the two columns collapse when the
       * narrower of them can no longer hold 380px, which is a property of the
       * layout rather than of a device width.
       */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,380px),1fr))] items-start gap-x-[88px] gap-y-14">
        <div>
          <p className="text-faint text-[13px] font-semibold tracking-[0.02em]">{t('tag')}</p>
          <h2 className="mt-[18px] text-[clamp(40px,4.6vw,64px)] leading-[1.02] font-bold tracking-[-0.03em]">
            {t('nameLine1')}
            <br />
            {t('nameLine2')}
          </h2>
          <p className="text-muted-foreground mt-6 text-[15px] leading-[1.65]">
            {t('roleLine')}
            <br />
            {t('placeLine')}
          </p>
        </div>

        <div>
          <p className="-mt-1.5 text-[clamp(20px,2vw,27px)] leading-[1.45] font-semibold tracking-[-0.015em]">
            {t('lead')}
          </p>
          <p className="text-muted-foreground mt-[26px] text-[15.5px] leading-[1.72]">
            {t('body')}
          </p>
          <p className="text-muted-foreground mt-[18px] text-[15.5px] leading-[1.72]">
            {t('experience')}
          </p>
        </div>
      </div>

      {/*
       * The numbers span both columns rather than sitting under the prose.
       * "320 000+" is set at display size and does not fit a third of half the
       * page — it collided with the stat beside it — and it carries a
       * non-breaking space precisely so it can never wrap out of the collision.
       * Full width also fills the space the short left column leaves behind.
       */}
      <ul className="border-border mt-[clamp(48px,6vw,76px)] grid grid-cols-[repeat(auto-fit,minmax(min(100%,220px),1fr))] gap-x-10 gap-y-8 border-t pt-9">
        {STAT_IDS.map((id) => (
          <li key={id}>
            <p className="text-[clamp(34px,3.8vw,54px)] font-bold tracking-[-0.03em]">
              {t(`statValue${id}`)}
            </p>
            <p className="text-faint mt-2 max-w-[34ch] text-[13.5px] leading-[1.5]">
              {t(`statLabel${id}`)}
            </p>
          </li>
        ))}
      </ul>
    </Container>
  )
}
