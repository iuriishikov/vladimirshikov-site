import { useTranslations } from 'next-intl'

import { Container } from '@/shared/ui'

/**
 * The opening screen: the name set as large as the measure allows, the three
 * meta columns beneath it, and the statement.
 */
export function Hero() {
  const t = useTranslations('Hero')

  return (
    <Container as="section" id="top">
      {/*
       * The canvas sets this line at `clamp(48px,17.8vw,258px)`, sized for an
       * eleven-character placeholder. Ours is "Vladimir Shikov" (15) and
       * "Владимир Шиков" (14) — and Cyrillic lowercase has almost no narrow
       * letters, so the Russian line sets the widest of the three. At 17.8vw it
       * would run past the gutter and, with `nowrap`, off the page. 12vw is the
       * largest step that still lands inside the gutters in both locales, and
       * the 520px override keeps that margin once the gutter stops shrinking
       * with the viewport — the same small-screen step the canvas makes.
       */}
      <h1 className="mt-6 text-[clamp(34px,12vw,174px)] leading-[0.94] font-bold tracking-[-0.045em] whitespace-nowrap max-[520px]:text-[11vw]">
        {t('name')}
      </h1>

      <ul className="border-border text-foreground-soft mt-11 flex justify-between gap-6 border-t pt-[18px] text-[13.5px] leading-[1.5]">
        <li>
          {t('roleA')}
          <br />
          {t('roleB')}
        </li>
        <li>
          {t('placeA')}
          <br />
          {t('placeB')}
        </li>
        <li className="text-right">
          {t('scopeA')}
          <br />
          {t('scopeB')}
        </li>
      </ul>

      <p className="mx-auto mt-[clamp(64px,9vw,116px)] mb-[clamp(72px,9.5vw,124px)] max-w-[1000px] text-center text-[clamp(25px,3.3vw,44px)] leading-[1.28] font-semibold tracking-[-0.02em] text-balance">
        {t('statement')}
      </p>
    </Container>
  )
}
