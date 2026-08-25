import { useTranslations } from 'next-intl'
import Image from 'next/image'

import portrait from '../../../../public/vladimir-shikov.jpg'

/**
 * The full-bleed band between the hero and the profile, holding the portrait.
 *
 * It steps outside the page measure on purpose: the panel runs edge to edge
 * while the portrait stays centred on it.
 *
 * The canvas drew a generated bust here at up to 760px wide. The real
 * photograph is 600x600, so it is shown at 380px at most — beyond that a
 * high-density screen would be upscaling it and the softness would show. The
 * band is shorter to match, keeping the proportion the canvas set between the
 * figure and the space around it. A larger original would lift both numbers;
 * they are the only reason the section is not full height.
 */
export function Portrait() {
  const t = useTranslations('Portrait')

  return (
    <section className="bg-panel flex h-[clamp(420px,62vh,660px)] items-center justify-center overflow-hidden px-[clamp(20px,4vw,48px)]">
      <Image
        src={portrait}
        alt={t('alt')}
        // Square source, square box: no cropping, and the circle does the framing.
        className="aspect-square w-[clamp(200px,42vw,380px)] rounded-full object-cover"
        sizes="(max-width: 480px) 42vw, 380px"
        placeholder="blur"
        priority
      />
    </section>
  )
}
