import { useTranslations } from 'next-intl'

import { Link } from '@/shared/i18n/navigation'
import { Container, PencilSketch, SectionHeading } from '@/shared/ui'

/**
 * The note ids in the order the canvas prints them, each with the seed that
 * fixes its sketch — a note has to look the same on every render, so the seed
 * is data, not `Math.random()`.
 */
const NOTES = [
  { id: 'n1', seed: 21 },
  { id: 'n2', seed: 22 },
  { id: 'n3', seed: 23 },
] as const

export function Blog() {
  const t = useTranslations('Blog')

  return (
    <Container as="section" id="blog" className="pb-[clamp(90px,10vw,150px)]">
      <SectionHeading title={t('heading')} lead={t('lead')} />

      <ul className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,320px),1fr))] gap-x-7 gap-y-10">
        {NOTES.map(({ id, seed }) => (
          <li key={id}>
            <Link
              href={`/notes/${id}`}
              data-testid="note-card"
              // `rounded-xl` is here for the focus ring, not for the card: the
              // global `:focus-visible` outline follows the element's radius.
              className="group block rounded-xl"
            >
              <div className="bg-tile border-tile-border relative aspect-[16/10] overflow-hidden rounded-xl border transition-transform duration-500 ease-[cubic-bezier(.2,.6,.2,1)] group-hover:scale-[1.015]">
                <PencilSketch variant="tile" seed={seed} className="absolute inset-0" />

                {/*
                 * `--faint` is tuned against the page background, where it just
                 * clears 4.5:1. On the tile, two shades lighter, it lands at
                 * 4.2:1 and fails, so the light theme darkens it here. Dark mode
                 * keeps the token, which passes on its own tile.
                 */}
                <div className="dark:text-faint absolute top-4 left-5 text-[12.5px] font-medium text-[#6d6d68]">
                  {t(`items.${id}.label`)}
                </div>
              </div>

              <div className="text-faint mt-4 text-[12.5px]">{t(`items.${id}.meta`)}</div>

              <h3 className="mt-2 text-[20px] leading-[1.25] font-bold tracking-[-0.01em]">
                {t(`items.${id}.title`)}
              </h3>

              <p className="text-muted-foreground mt-2.5 text-[14.5px] leading-[1.6]">
                {t(`items.${id}.excerpt`)}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </Container>
  )
}
