import { PencilSketch } from '@/shared/ui'

/**
 * The full-bleed band between the hero and the profile, holding the drawn bust.
 *
 * It steps outside the page measure on purpose: the panel runs edge to edge
 * while the sketch stays centred and bottom-aligned, standing on the band.
 */
export function Portrait() {
  return (
    <section className="bg-panel flex h-[clamp(540px,92vh,880px)] items-end justify-center overflow-hidden max-[520px]:h-[clamp(420px,125vw,640px)]">
      {/* The sketch fills whatever it is given, so the size lives on the wrapper. */}
      <div className="h-[94%] w-[min(96vw,760px)]">
        <PencilSketch variant="bust" seed={7} density={1} />
      </div>
    </section>
  )
}
