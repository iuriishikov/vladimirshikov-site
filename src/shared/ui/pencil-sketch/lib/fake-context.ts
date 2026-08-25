import { vi } from 'vitest'

/**
 * A stand-in for CanvasRenderingContext2D.
 *
 * jsdom ships no 2D context, so without this the drawing code could never be
 * executed in a unit test — and it is the part most likely to break silently,
 * since a wrong index or a NaN produces a blank canvas rather than an error.
 * Recording the calls lets a test assert that strokes were actually issued.
 */
export interface FakeContext {
  context: CanvasRenderingContext2D
  strokeCount: () => number
  /** Every coordinate handed to the context, for NaN checks. */
  coordinates: () => number[]
}

export function createFakeContext(): FakeContext {
  const coordinates: number[] = []
  let strokes = 0

  const record = (...values: number[]): void => {
    coordinates.push(...values)
  }

  const stub = {
    globalAlpha: 1,
    lineWidth: 1,
    lineCap: 'butt' as CanvasLineCap,
    lineJoin: 'miter' as CanvasLineJoin,
    strokeStyle: '#000000' as string | CanvasGradient | CanvasPattern,
    fillStyle: '#000000' as string | CanvasGradient | CanvasPattern,
    beginPath: vi.fn(),
    closePath: vi.fn(),
    moveTo: vi.fn(record),
    lineTo: vi.fn(record),
    quadraticCurveTo: vi.fn(record),
    bezierCurveTo: vi.fn(record),
    arc: vi.fn(record),
    rect: vi.fn(record),
    fill: vi.fn(),
    clearRect: vi.fn(record),
    setTransform: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    stroke: vi.fn(() => {
      strokes += 1
    }),
  }

  return {
    context: stub as unknown as CanvasRenderingContext2D,
    strokeCount: () => strokes,
    coordinates: () => coordinates,
  }
}
