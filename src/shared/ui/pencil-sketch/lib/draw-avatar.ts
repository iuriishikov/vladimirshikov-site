import type { Random } from './random'
import { arc, curl, hatch, jitteredLine, stroke, TAU, type Point } from './strokes'

/**
 * A small head for review cards.
 *
 * The seed picks a hairstyle and whether the face wears glasses, so a list of
 * avatars reads as a list of different people rather than one repeated icon —
 * without shipping a single photograph.
 */
export function drawAvatar(
  context: CanvasRenderingContext2D,
  random: Random,
  width: number,
  height: number,
  seed: number,
): void {
  const unit = Math.min(width, height)
  const centerX = width * 0.5
  const centerY = height * 0.46
  const radiusY = unit * 0.26
  const radiusX = radiusY * 0.78

  const jawSquash = (ty: number): number => 1 - 0.15 * Math.max(0, ty)
  const headPoint = (theta: number): Point => {
    const ty = Math.sin(theta)
    return [centerX + Math.cos(theta) * radiusX * jawSquash(ty), centerY + ty * radiusY]
  }

  // Head outline, twice.
  for (let pass = 0; pass < 2; pass += 1) {
    const points: Point[] = []
    for (let index = 0; index <= 24; index += 1) {
      const theta = -Math.PI * 0.5 + (TAU * index) / 24
      const [px, py] = headPoint(theta)
      points.push([px + (random() - 0.5) * 1.4, py + (random() - 0.5) * 1.4])
    }
    const first = points[0]
    if (first) points.push(first)
    stroke(context, points, 0.6 - pass * 0.25, 1.1)
  }

  // Hair — four styles, chosen by seed.
  const hairStyle = seed % 4

  switch (hairStyle) {
    case 0: {
      for (let index = 0; index < 10; index += 1) {
        const theta = Math.PI * (1.05 + 0.9 * random())
        curl(
          context,
          random,
          centerX + Math.cos(theta) * radiusX * 1.02,
          centerY + Math.sin(theta) * radiusY * 1.02,
          radiusX * 0.28 * (0.5 + random() * 0.7),
          0.55,
          0.9,
        )
      }

      break
    }
    case 1: {
      hatch(context, random, {
        inside: (px, py) => {
          const ty = (py - centerY) / radiusY
          const tx = (px - centerX) / (radiusX * 1.06)
          return tx * tx + ty * ty <= 1.15 && py < centerY - radiusY * 0.25
        },
        bounds: [
          centerX - radiusX * 1.2,
          centerY - radiusY * 1.3,
          centerX + radiusX * 1.2,
          centerY,
        ],
        angle: -35,
        spacing: 2.6,
        alpha: 0.5,
        width: 0.8,
        skip: 0.1,
      })

      break
    }
    case 2: {
      for (let index = 0; index < 26; index += 1) {
        const theta = Math.PI * (1.08 + 0.84 * random())
        const spread = 0.8 + random() * 0.28
        const px = centerX + Math.cos(theta) * radiusX * spread
        const py = centerY + Math.sin(theta) * radiusY * spread
        stroke(context, jitteredLine(random, px, py, px + 1.5, py + 1.5, 0.3), 0.5, 0.9)
      }

      break
    }
    case 3: {
      for (let index = 0; index < 7; index += 1) {
        const t = index / 6
        const px = centerX - radiusX * 0.9 + radiusX * 1.8 * t
        arc(
          context,
          random,
          px,
          centerY - radiusY * 0.62,
          radiusX * 0.24,
          Math.PI,
          TAU,
          0.55,
          0.9,
          0.9,
        )
      }

      break
    }
    // No default
  }

  // Glasses on every third seed, plain eyes otherwise.
  if (seed % 3 === 0) {
    for (const side of [-1, 1]) {
      arc(
        context,
        random,
        centerX + side * radiusX * 0.42,
        centerY + radiusY * 0.02,
        radiusX * 0.3,
        0,
        TAU,
        0.55,
        0.9,
        0.95,
      )
    }
    stroke(
      context,
      jitteredLine(
        random,
        centerX - radiusX * 0.12,
        centerY + radiusY * 0.02,
        centerX + radiusX * 0.12,
        centerY + radiusY * 0.02,
        0.3,
      ),
      0.5,
      0.9,
    )
  } else {
    for (const side of [-1, 1]) {
      stroke(
        context,
        jitteredLine(
          random,
          centerX + side * radiusX * 0.42 - 1.6,
          centerY - radiusY * 0.02,
          centerX + side * radiusX * 0.42 + 1.6,
          centerY - radiusY * 0.02,
          0.3,
        ),
        0.6,
        1.2,
      )
    }
  }

  // Nose.
  stroke(
    context,
    jitteredLine(
      random,
      centerX,
      centerY + radiusY * 0.05,
      centerX - 1,
      centerY + radiusY * 0.32,
      0.4,
    ),
    0.45,
    0.9,
  )

  // Mouth.
  const mouth: Point[] = []
  for (let index = 0; index <= 8; index += 1) {
    const t = index / 8
    mouth.push([
      centerX - radiusX * 0.26 + radiusX * 0.52 * t,
      centerY + radiusY * 0.55 + Math.sin(t * Math.PI) * radiusY * 0.06,
    ])
  }
  stroke(context, mouth, 0.55, 1)

  // Shoulders running off the bottom edge.
  for (const side of [-1, 1]) {
    const points: Point[] = []
    for (let index = 0; index <= 6; index += 1) {
      const t = index / 6
      points.push([
        centerX + side * (radiusX * 0.35 + (unit * 0.34 - radiusX * 0.35) * t * t),
        centerY + radiusY * 1.02 + (height - (centerY + radiusY * 1.02)) * t + (random() - 0.5),
      ])
    }
    stroke(context, points, 0.5, 1)
  }

  // Shading on the left of the face.
  hatch(context, random, {
    inside: (px, py) => {
      const ty = (py - centerY) / radiusY
      const tx = (px - centerX) / (radiusX * jawSquash(ty))
      return tx * tx + ty * ty <= 1 && px < centerX - radiusX * 0.3
    },
    bounds: [centerX - radiusX, centerY - radiusY, centerX, centerY + radiusY],
    angle: 70,
    spacing: 3,
    alpha: 0.15,
    width: 0.7,
    skip: 0.2,
  })
}
