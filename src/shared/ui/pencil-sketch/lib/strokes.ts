/* eslint-disable unicorn/prefer-path2d -- Every stroke in this module is a
   one-off path built from freshly jittered points: the geometry is never the
   same twice, so there is nothing for a Path2D to cache, and drawing straight
   onto the context is both simpler and cheaper. */

import type { Random } from './random'

export type Point = readonly [x: number, y: number]

export const TAU = Math.PI * 2

/**
 * Draws a point list as one smoothed stroke.
 *
 * Successive points are joined with quadratic curves through their midpoints,
 * which is what turns a jittered polyline into something that reads as a
 * confident pencil line rather than a shaky one.
 */
export function stroke(
  context: CanvasRenderingContext2D,
  points: readonly Point[],
  alpha: number,
  width: number,
): void {
  const first = points[0]
  if (!first || points.length < 2) return

  context.globalAlpha = Math.max(0, Math.min(1, alpha))
  context.lineWidth = width
  context.beginPath()
  context.moveTo(first[0], first[1])

  for (let index = 1; index < points.length - 1; index += 1) {
    const current = points[index]
    const next = points[index + 1]
    if (!current || !next) continue
    context.quadraticCurveTo(
      current[0],
      current[1],
      (current[0] + next[0]) / 2,
      (current[1] + next[1]) / 2,
    )
  }

  const last = points.at(-1)
  if (last) context.lineTo(last[0], last[1])

  context.stroke()
  context.globalAlpha = 1
}

/**
 * A straight run broken into jittered points. Ends wobble less than the middle
 * (`endDamping`), which is how a hand-drawn line actually behaves — it is
 * placed accurately and drifts in between.
 */
export function jitteredLine(
  random: Random,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  jitter: number,
): Point[] {
  const steps = Math.max(2, Math.round(Math.hypot(x2 - x1, y2 - y1) / 16))
  const points: Point[] = []

  for (let index = 0; index <= steps; index += 1) {
    const t = index / steps
    const endDamping = index === 0 || index === steps ? 0.35 : 1
    points.push([
      x1 + (x2 - x1) * t + (random() - 0.5) * 2 * jitter * endDamping,
      y1 + (y2 - y1) * t + (random() - 0.5) * 2 * jitter * endDamping,
    ])
  }

  return points
}

interface HatchOptions {
  /** Returns true where the hatching is allowed to land. */
  inside: (x: number, y: number) => boolean
  bounds: readonly [x0: number, y0: number, x1: number, y1: number]
  /** Degrees. */
  angle: number
  spacing: number
  alpha: number
  width: number
  /** 0..1 — chance of dropping a whole line, so the fill never looks printed. */
  skip?: number
}

/**
 * Parallel shading confined to an arbitrary shape.
 *
 * It walks each line and emits only the runs that fall inside the mask, then
 * trims a few pixels off both ends so strokes stop short of the outline — the
 * detail that separates pencil shading from a fill.
 */
export function hatch(
  context: CanvasRenderingContext2D,
  random: Random,
  { inside, bounds, angle, spacing, alpha, width, skip = 0 }: HatchOptions,
): void {
  const [x0, y0, x1, y1] = bounds
  const radians = (angle * Math.PI) / 180
  const dx = Math.cos(radians)
  const dy = Math.sin(radians)
  const normalX = -dy
  const normalY = dx
  const centerX = (x0 + x1) / 2
  const centerY = (y0 + y1) / 2
  const reach = Math.hypot(x1 - x0, y1 - y0) / 2

  for (let offset = -reach; offset <= reach; offset += spacing * (0.8 + random() * 0.4)) {
    if (random() < skip) continue

    const baseX = centerX + normalX * offset
    const baseY = centerY + normalY * offset
    let run: [number, number] | null = null

    for (let t = -reach; t <= reach + 4; t += 3) {
      const px = baseX + dx * t
      const py = baseY + dy * t
      const isInside = t <= reach && px >= x0 && px <= x1 && py >= y0 && py <= y1 && inside(px, py)

      if (isInside) {
        if (run) run[1] = t
        else run = [t, t]
      } else if (run) {
        // The run just ended. Anything shorter than 5px is pencil noise; the
        // rest is drawn with both ends pulled in a little so the stroke stops
        // short of the outline the way a real one does.
        if (run[1] - run[0] > 5) {
          const start = run[0] + random() * 3
          const end = run[1] - random() * 3
          if (end > start) {
            stroke(
              context,
              jitteredLine(
                random,
                baseX + dx * start,
                baseY + dy * start,
                baseX + dx * end,
                baseY + dy * end,
                1.1,
              ),
              alpha * (0.65 + random() * 0.6),
              width * (0.75 + random() * 0.5),
            )
          }
        }
        run = null
      }
    }
  }
}

/** A tightening spiral — the unit the hair is built from. */
export function curl(
  context: CanvasRenderingContext2D,
  random: Random,
  centerX: number,
  centerY: number,
  radius: number,
  alpha: number,
  width: number,
): void {
  const points: Point[] = []
  const turns = 1.4 + random() * 1.6
  const phase = random() * TAU
  const steps = 12 + Math.floor(random() * 10)

  for (let index = 0; index <= steps; index += 1) {
    const t = index / steps
    const theta = phase + t * turns * TAU
    const r = radius * (1 - t * 0.5)
    points.push([
      centerX + Math.cos(theta) * r + (random() - 0.5) * 1.6,
      centerY + Math.sin(theta) * r * 0.85 + (random() - 0.5) * 1.6,
    ])
  }

  stroke(context, points, alpha, width)
}

/** A jittered elliptical arc. `flatten` squashes it vertically. */
export function arc(
  context: CanvasRenderingContext2D,
  random: Random,
  centerX: number,
  centerY: number,
  radius: number,
  from: number,
  to: number,
  alpha: number,
  width: number,
  flatten = 1,
): void {
  const points: Point[] = []
  const steps = Math.max(6, Math.round((Math.abs(to - from) * radius) / 9))

  for (let index = 0; index <= steps; index += 1) {
    const theta = from + ((to - from) * index) / steps
    points.push([
      centerX + Math.cos(theta) * radius + (random() - 0.5) * 1.2,
      centerY + Math.sin(theta) * radius * flatten + (random() - 0.5) * 1.2,
    ])
  }

  stroke(context, points, alpha, width)
}
