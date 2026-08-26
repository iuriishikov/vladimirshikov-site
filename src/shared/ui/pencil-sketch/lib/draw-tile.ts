import type { Random } from './random'
import { arc, curl, hatch, jitteredLine, stroke, TAU } from './strokes'

/**
 * An abstract sketch for article thumbnails.
 *
 * Three motifs and four corner positions for the shading, keyed off the seed —
 * enough variety that a row of cards does not look copy-pasted, while every
 * card still belongs to the same hand.
 */
export function drawTile(
  context: CanvasRenderingContext2D,
  random: Random,
  width: number,
  height: number,
  seed: number,
): void {
  const motif = seed % 3
  const unit = Math.min(width, height)
  const corner = seed % 4

  const cornerX = [0, width, width, 0][corner] ?? 0
  const cornerY = [0, 0, height, height][corner] ?? 0

  // A soft wash anchored to one corner.
  hatch(context, random, {
    inside: (px, py) => Math.hypot(px - cornerX, py - cornerY) < unit * 0.55,
    bounds: [0, 0, width, height],
    angle: 45,
    spacing: 9,
    alpha: 0.15,
    width: 1,
    skip: 0.15,
  })

  switch (motif) {
    case 0: {
      for (let pass = 0; pass < 3; pass += 1) {
        arc(
          context,
          random,
          width * 0.6,
          height * 0.46,
          unit * 0.24 + pass * 2.5,
          random() * TAU,
          random() * TAU + TAU * 0.9,
          0.4,
          1.2,
          1,
        )
      }
      curl(context, random, width * 0.6, height * 0.46, unit * 0.1, 0.35, 1)

      break
    }
    case 1: {
      for (let pass = 0; pass < 2; pass += 1) {
        const size = unit * 0.3
        const originX = width * 0.34 + pass * unit * 0.17
        const originY = height * 0.3 + pass * unit * 0.15

        stroke(
          context,
          jitteredLine(random, originX, originY, originX + size, originY, 1),
          0.45,
          1.1,
        )
        stroke(
          context,
          jitteredLine(random, originX + size, originY, originX + size, originY + size, 1),
          0.45,
          1.1,
        )
        stroke(
          context,
          jitteredLine(random, originX + size, originY + size, originX, originY + size, 1),
          0.45,
          1.1,
        )
        stroke(
          context,
          jitteredLine(random, originX, originY + size, originX, originY, 1),
          0.45,
          1.1,
        )

        if (pass === 0) {
          hatch(context, random, {
            inside: (px, py) =>
              px > originX && px < originX + size && py > originY && py < originY + size,
            bounds: [originX, originY, originX + size, originY + size],
            angle: -40,
            spacing: 6,
            alpha: 0.2,
            width: 0.9,
            skip: 0.1,
          })
        }
      }

      break
    }
    case 2: {
      const originX = width * 0.44
      const originY = height * 0.5
      const reach = unit * 0.26

      for (let index = 0; index < 3; index += 1) {
        const angle = (index * Math.PI) / 3 + 0.2
        stroke(
          context,
          jitteredLine(
            random,
            originX - Math.cos(angle) * reach,
            originY - Math.sin(angle) * reach,
            originX + Math.cos(angle) * reach,
            originY + Math.sin(angle) * reach,
            1.2,
          ),
          0.45,
          1.2,
        )
      }
      arc(context, random, width * 0.74, height * 0.28, unit * 0.09, 0, TAU, 0.45, 1, 1)

      break
    }
    // No default
  }

  // Two ruled lines, as if the sketch were annotated.
  stroke(
    context,
    jitteredLine(
      random,
      width * 0.12,
      height * 0.84,
      width * 0.55 + random() * width * 0.2,
      height * 0.84,
      1.5,
    ),
    0.25,
    1,
  )
  stroke(
    context,
    jitteredLine(
      random,
      width * 0.12,
      height * 0.88,
      width * 0.4 + random() * width * 0.2,
      height * 0.88,
      1.5,
    ),
    0.18,
    1,
  )
}
