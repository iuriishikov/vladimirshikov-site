import type { Random } from './random'
import { arc, curl, hatch, jitteredLine, stroke, type Point } from './strokes'

/**
 * The head-and-shoulders portrait.
 *
 * Built the way a life-drawing is: construction lines first, then the mass of
 * the shoulders, then the collar, then the head outline, and only at the end
 * the features and the hair. Later strokes sit on top of earlier ones, which is
 * what gives the pencil its layered look.
 */
export function drawBust(
  context: CanvasRenderingContext2D,
  random: Random,
  width: number,
  height: number,
  density: number,
): void {
  const centerX = width * 0.5
  const radiusY = height * 0.15
  const radiusX = radiusY * 0.76
  const centerY = height * 0.245
  const chinY = centerY + radiusY

  /** Squares the jaw slightly towards the chin. */
  const jawSquash = (ty: number): number => 1 - 0.17 * Math.max(0, ty)

  const headPoint = (theta: number): Point => {
    const ty = Math.sin(theta)
    return [centerX + Math.cos(theta) * radiusX * jawSquash(ty), centerY + ty * radiusY]
  }

  const isInsideHead = (px: number, py: number): boolean => {
    const ty = (py - centerY) / radiusY
    const tx = (px - centerX) / (radiusX * jawSquash(ty))
    return tx * tx + ty * ty <= 1
  }

  const collarY = height * 0.485
  const shoulderY = height * 0.6
  const shoulderWidth = Math.min(width * 0.36, height * 0.315)
  const fadeY = height * 0.84

  /** Half-width of the torso at a given height — neck, then a smooth flare. */
  const halfWidth = (py: number): number => {
    const neckEnd = collarY - height * 0.02
    if (py < neckEnd) return radiusX * 0.52
    const t = Math.min(1, (py - neckEnd) / (shoulderY - neckEnd))
    const smooth = t * t * (3 - 2 * t)
    return (
      radiusX * 0.52 +
      (shoulderWidth - radiusX * 0.52) * smooth +
      Math.max(0, py - shoulderY) * 0.04
    )
  }

  const isInsideBody = (px: number, py: number): boolean => {
    if (py < collarY - height * 0.012 || py > height) return false
    if (Math.abs(px - centerX) > halfWidth(py)) return false

    // Carve the collar opening out of the torso.
    const neckX = (px - centerX) / (radiusX * 0.66)
    const neckY = (py - (collarY - 6)) / (radiusY * 0.4)
    if (neckY < 1 && neckX * neckX + neckY * neckY < 1) return false

    // Dissolve the bottom edge instead of cutting it off.
    if (py > fadeY && random() < ((py - fadeY) / (height - fadeY)) * 0.92) return false
    return true
  }

  // Construction lines — faint, and deliberately left visible.
  stroke(
    context,
    jitteredLine(random, centerX, centerY - radiusY * 1.3, centerX, chinY + height * 0.012, 0.5),
    0.07,
    1,
  )
  stroke(
    context,
    jitteredLine(random, centerX - radiusX * 1.55, centerY, centerX + radiusX * 1.55, centerY, 0.5),
    0.06,
    1,
  )

  // Torso shading, in three passes at different angles.
  hatch(context, random, {
    inside: isInsideBody,
    bounds: [centerX - shoulderWidth - 24, collarY - 20, centerX + shoulderWidth + 24, height],
    angle: -38,
    spacing: 7.2 / density,
    alpha: 0.15,
    width: 1.1,
    skip: 0.1,
  })
  hatch(context, random, {
    inside: (px, py) => isInsideBody(px, py) && py < collarY + height * 0.085,
    bounds: [
      centerX - radiusX * 1.7,
      collarY - 16,
      centerX + radiusX * 1.7,
      collarY + height * 0.1,
    ],
    angle: 44,
    spacing: 9,
    alpha: 0.1,
    width: 1,
    skip: 0.2,
  })
  hatch(context, random, {
    inside: (px, py) => isInsideBody(px, py) && Math.abs(px - centerX) > halfWidth(py) * 0.78,
    bounds: [centerX - shoulderWidth - 24, collarY, centerX + shoulderWidth + 24, height],
    angle: -82,
    spacing: 9.5,
    alpha: 0.07,
    width: 1,
    skip: 0.3,
  })

  // Shoulder contours, twice each for weight.
  for (const side of [-1, 1]) {
    for (let pass = 0; pass < 2; pass += 1) {
      const points: Point[] = []
      const endY = fadeY + height * 0.04 + random() * height * 0.06
      for (let py = collarY - height * 0.008; py < endY; py += 13) {
        points.push([
          centerX + side * halfWidth(py) + (random() - 0.5) * 2.4,
          py + (random() - 0.5) * 2,
        ])
      }
      stroke(context, points, 0.5 - pass * 0.18, 1.5 - pass * 0.3)
    }
  }

  // Collar.
  arc(
    context,
    random,
    centerX,
    collarY - 4,
    radiusX * 0.68,
    Math.PI * 0.12,
    Math.PI * 0.88,
    0.5,
    1.4,
    0.5,
  )
  arc(
    context,
    random,
    centerX,
    collarY - 8,
    radiusX * 0.66,
    Math.PI * 0.16,
    Math.PI * 0.84,
    0.32,
    1.1,
    0.48,
  )
  for (let index = 0; index <= 11; index += 1) {
    const theta = Math.PI * (0.14 + (0.72 * index) / 11)
    const px = centerX + Math.cos(theta) * radiusX * 0.67
    const py = collarY - 4 + Math.sin(theta) * radiusX * 0.67 * 0.5
    stroke(context, jitteredLine(random, px, py - 3, px, py + 3, 0.4), 0.28, 1)
  }

  // Neck.
  for (const side of [-1, 1]) {
    stroke(
      context,
      jitteredLine(
        random,
        centerX + side * radiusX * 0.42,
        chinY - radiusY * 0.16,
        centerX + side * radiusX * 0.5,
        collarY - 8,
        1.2,
      ),
      0.5,
      1.3,
    )
  }
  hatch(context, random, {
    inside: (px, py) =>
      py > chinY - radiusY * 0.26 &&
      py < collarY - 4 &&
      px > centerX - radiusX * 0.4 &&
      px < centerX + radiusX * 0.2,
    bounds: [centerX - radiusX * 0.5, chinY - radiusY * 0.3, centerX + radiusX * 0.3, collarY],
    angle: 80,
    spacing: 5.5,
    alpha: 0.15,
    width: 1,
    skip: 0.15,
  })

  // Cheek and jaw shading.
  hatch(context, random, {
    inside: (px, py) =>
      isInsideHead(px, py) && px < centerX - radiusX * 0.3 && py > centerY - radiusY * 0.5,
    bounds: [centerX - radiusX, centerY - radiusY, centerX, chinY],
    angle: 70,
    spacing: 6,
    alpha: 0.09,
    width: 1,
    skip: 0.2,
  })
  hatch(context, random, {
    inside: (px, py) =>
      isInsideHead(px, py) && py > centerY + radiusY * 0.74 && px < centerX + radiusX * 0.3,
    bounds: [centerX - radiusX, centerY + radiusY * 0.5, centerX + radiusX, chinY],
    angle: 25,
    spacing: 7,
    alpha: 0.06,
    width: 1,
    skip: 0.35,
  })

  // Head outline.
  for (let pass = 0; pass < 2; pass += 1) {
    const points: Point[] = []
    for (let index = 0; index <= 30; index += 1) {
      const theta = -Math.PI * 0.18 + (Math.PI * 1.36 * index) / 30
      const [px, py] = headPoint(theta)
      points.push([px + (random() - 0.5) * 2.2, py + (random() - 0.5) * 2.2])
    }
    stroke(context, points, 0.55 - pass * 0.2, 1.4 - pass * 0.3)
  }

  // Ears.
  arc(
    context,
    random,
    centerX - radiusX * 0.95,
    centerY + radiusY * 0.1,
    radiusX * 0.14,
    Math.PI * 0.5,
    Math.PI * 1.5,
    0.4,
    1.1,
    1.3,
  )
  arc(
    context,
    random,
    centerX + radiusX * 0.95,
    centerY + radiusY * 0.1,
    radiusX * 0.14,
    -Math.PI * 0.5,
    Math.PI * 0.5,
    0.4,
    1.1,
    1.3,
  )

  // Hair: four passes of curls, from the hairline outwards.
  const curlCount = Math.round(115 * density)
  for (let index = 0; index < curlCount; index += 1) {
    const theta = Math.PI * (1 + random())
    const spread = 0.86 + random() * 0.42
    const px = centerX + Math.cos(theta) * radiusX * 1.06 * spread
    const py = centerY + Math.sin(theta) * radiusY * 1.04 * spread - radiusY * 0.06
    if (py > centerY + radiusY * 0.12) continue
    curl(
      context,
      random,
      px,
      py,
      radiusX * 0.11 * (0.5 + random() * 0.9),
      0.24 + random() * 0.26,
      0.9 + random() * 0.6,
    )
  }
  for (let index = 0; index < Math.round(45 * density); index += 1) {
    const px = centerX + (random() - 0.5) * radiusX * 1.7
    const py = centerY - radiusY * (0.42 + random() * 0.68)
    curl(
      context,
      random,
      px,
      py,
      radiusX * 0.1 * (0.5 + random() * 0.8),
      0.22 + random() * 0.22,
      0.9 + random() * 0.5,
    )
  }
  for (let index = 0; index < 30; index += 1) {
    const theta = Math.PI * (1.02 + random() * 0.96)
    const px = centerX + Math.cos(theta) * radiusX * 1.2
    const py = centerY + Math.sin(theta) * radiusY * 1.16 - radiusY * 0.06
    if (py > centerY + radiusY * 0.05) continue
    curl(context, random, px, py, radiusX * 0.09 * (0.6 + random() * 0.5), 0.3, 1)
  }
  for (let index = 0; index < 14; index += 1) {
    const px = centerX + (random() - 0.5) * radiusX * 1.15
    const py = centerY - radiusY * (0.32 + random() * 0.16)
    curl(context, random, px, py, radiusX * 0.07 * (0.6 + random() * 0.6), 0.28, 0.9)
  }

  // Eyes: brow, lid, and a heavier lash line.
  const eyeY = centerY + radiusY * 0.03
  const eyeOffset = radiusX * 0.38
  for (const side of [-1, 1]) {
    arc(
      context,
      random,
      centerX + side * eyeOffset,
      eyeY - radiusY * 0.13,
      radiusX * 0.18,
      Math.PI * 1.15,
      Math.PI * 1.85,
      0.48,
      1.5,
      0.55,
    )
    arc(
      context,
      random,
      centerX + side * eyeOffset,
      eyeY + radiusY * 0.015,
      radiusX * 0.13,
      Math.PI * 1.1,
      Math.PI * 1.9,
      0.52,
      1.2,
      0.6,
    )
    stroke(
      context,
      jitteredLine(
        random,
        centerX + side * eyeOffset - 2,
        eyeY + 2.5,
        centerX + side * eyeOffset + 2,
        eyeY + 2.5,
        0.4,
      ),
      0.5,
      1.7,
    )
  }

  // Nose.
  stroke(
    context,
    jitteredLine(
      random,
      centerX + radiusX * 0.04,
      eyeY + 2,
      centerX - radiusX * 0.03,
      centerY + radiusY * 0.36,
      1,
    ),
    0.4,
    1.2,
  )
  stroke(
    context,
    jitteredLine(
      random,
      centerX - radiusX * 0.03,
      centerY + radiusY * 0.36,
      centerX + radiusX * 0.1,
      centerY + radiusY * 0.43,
      0.6,
    ),
    0.4,
    1.2,
  )

  // Mouth, with a lighter lower-lip line.
  const mouth: Point[] = []
  for (let index = 0; index <= 12; index += 1) {
    const t = index / 12
    mouth.push([
      centerX - radiusX * 0.3 + radiusX * 0.6 * t,
      centerY + radiusY * 0.58 + Math.sin(t * Math.PI) * radiusY * 0.07 + (random() - 0.5),
    ])
  }
  stroke(context, mouth, 0.5, 1.5)

  const lowerLip: Point[] = []
  for (let index = 0; index <= 8; index += 1) {
    const t = index / 8
    lowerLip.push([
      centerX - radiusX * 0.13 + radiusX * 0.26 * t,
      centerY + radiusY * 0.73 + Math.sin(t * Math.PI) * radiusY * 0.025 + (random() - 0.5),
    ])
  }
  stroke(context, lowerLip, 0.22, 1.1)
}
