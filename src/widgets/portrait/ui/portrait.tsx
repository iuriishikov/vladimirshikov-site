import { useTranslations } from 'next-intl'
import Image from 'next/image'

import portrait from '../../../../public/vladimir-shikov.jpg'

/**
 * The full-bleed portrait band.
 *
 * Desaturated on purpose. The photograph was taken against a stage wall of
 * saturated colour that fights every other surface on the page; in black and
 * white the same wall reads as texture, and the page keeps its one accent.
 *
 * The crop sits right of centre and high, because that is where the subject is
 * in the frame — a centred crop would put him off to one side and fill the
 * middle with the back of the audience's heads.
 */
export function Portrait() {
  const t = useTranslations('Portrait')

  return (
    <section className="bg-panel relative h-[clamp(300px,54vh,580px)] w-full overflow-hidden">
      <Image
        src={portrait}
        alt={t('alt')}
        fill
        // Full-bleed at every width, so the browser may pick the largest source.
        sizes="100vw"
        className="object-cover object-[57%_26%] grayscale"
        placeholder="blur"
        priority
      />
    </section>
  )
}
