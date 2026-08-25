import { describe, expect, it } from 'vitest'

import { drawAvatar } from './draw-avatar'
import { drawBust } from './draw-bust'
import { drawTile } from './draw-tile'
import { createFakeContext } from './fake-context'
import { createRandom } from './random'
import { arc, curl, hatch, jitteredLine, stroke } from './strokes'

/**
 * The drawings fail silently by nature: a NaN coordinate or an off-by-one index
 * produces an empty canvas, not an exception. These tests execute the real
 * geometry against a recording context and check the two things that actually
 * go wrong — nothing was drawn, or something was drawn at a nonsensical place.
 */

function expectSaneCoordinates(coordinates: readonly number[]): void {
  expect(coordinates.length).toBeGreaterThan(0)
  expect(coordinates.every((value) => Number.isFinite(value))).toBe(true)
}

describe('drawBust', () => {
  it('draws a full portrait', () => {
    const fake = createFakeContext()
    drawBust(fake.context, createRandom(7), 760, 880, 1)

    expect(fake.strokeCount()).toBeGreaterThan(200)
    expectSaneCoordinates(fake.coordinates())
  })

  it('keeps every stroke inside the canvas, give or take the pencil wobble', () => {
    const fake = createFakeContext()
    const width = 600
    const height = 700
    drawBust(fake.context, createRandom(3), width, height, 1)

    // A generous margin: hair curls and jitter legitimately overshoot a little.
    const margin = 40
    const xs = fake.coordinates().filter((_, index) => index % 2 === 0)
    const ys = fake.coordinates().filter((_, index) => index % 2 === 1)

    expect(Math.min(...xs)).toBeGreaterThan(-margin)
    expect(Math.max(...xs)).toBeLessThan(width + margin)
    expect(Math.min(...ys)).toBeGreaterThan(-margin)
    expect(Math.max(...ys)).toBeLessThan(height + margin)
  })

  it('draws less at a lower density', () => {
    const dense = createFakeContext()
    const sparse = createFakeContext()

    drawBust(dense.context, createRandom(7), 760, 880, 1.6)
    drawBust(sparse.context, createRandom(7), 760, 880, 0.6)

    expect(sparse.strokeCount()).toBeLessThan(dense.strokeCount())
  })

  it('is deterministic for a given seed', () => {
    const first = createFakeContext()
    const second = createFakeContext()

    drawBust(first.context, createRandom(11), 400, 500, 1)
    drawBust(second.context, createRandom(11), 400, 500, 1)

    expect(first.coordinates()).toStrictEqual(second.coordinates())
  })

  it('survives a very small canvas', () => {
    const fake = createFakeContext()
    expect(() => {
      drawBust(fake.context, createRandom(7), 40, 60, 1)
    }).not.toThrow()
  })
})

describe('drawAvatar', () => {
  // The seed selects one of four hairstyles and whether the face wears glasses,
  // so every branch needs walking.
  it.each([0, 1, 2, 3, 6, 9])('draws seed %i', (seed) => {
    const fake = createFakeContext()
    drawAvatar(fake.context, createRandom(seed), 46, 46, seed)

    expect(fake.strokeCount()).toBeGreaterThan(5)
    expectSaneCoordinates(fake.coordinates())
  })

  it('produces different drawings for different seeds', () => {
    const a = createFakeContext()
    const b = createFakeContext()

    drawAvatar(a.context, createRandom(3), 46, 46, 3)
    drawAvatar(b.context, createRandom(10), 46, 46, 10)

    expect(a.coordinates()).not.toStrictEqual(b.coordinates())
  })
})

describe('drawTile', () => {
  it.each([21, 22, 23])('draws seed %i', (seed) => {
    const fake = createFakeContext()
    drawTile(fake.context, createRandom(seed), 480, 300, seed)

    expect(fake.strokeCount()).toBeGreaterThan(5)
    expectSaneCoordinates(fake.coordinates())
  })
})

describe('stroke primitives', () => {
  it('ignores a path with fewer than two points', () => {
    const fake = createFakeContext()

    stroke(fake.context, [], 1, 1)
    stroke(fake.context, [[0, 0]], 1, 1)

    expect(fake.strokeCount()).toBe(0)
  })

  it('clamps the alpha into range', () => {
    const fake = createFakeContext()

    stroke(
      fake.context,
      [
        [0, 0],
        [10, 10],
      ],
      5,
      1,
    )

    // Restored to 1 after the stroke, so the next call starts clean.
    expect(fake.context.globalAlpha).toBe(1)
    expect(fake.strokeCount()).toBe(1)
  })

  it('places the ends of a jittered line more accurately than its middle', () => {
    const points = jitteredLine(createRandom(5), 0, 0, 100, 0, 4)
    const first = points.at(0)
    const last = points.at(-1)

    // Ends are damped to 35% of the jitter, so they land within ±1.4 of the
    // requested coordinates while the middle is free to wander by ±4.
    const endTolerance = 4 * 0.35 + 0.001
    expect(Math.abs((first?.[0] ?? NaN) - 0)).toBeLessThanOrEqual(endTolerance)
    expect(Math.abs((last?.[0] ?? NaN) - 100)).toBeLessThanOrEqual(endTolerance)

    const middleSpread = Math.max(...points.slice(1, -1).map(([, y]) => Math.abs(y)))
    expect(middleSpread).toBeGreaterThan(endTolerance)
  })

  it('leaves nothing behind when the hatch mask excludes everything', () => {
    const fake = createFakeContext()

    hatch(fake.context, createRandom(1), {
      inside: () => false,
      bounds: [0, 0, 100, 100],
      angle: 45,
      spacing: 6,
      alpha: 0.2,
      width: 1,
    })

    expect(fake.strokeCount()).toBe(0)
  })

  it('fills a mask that accepts everything', () => {
    const fake = createFakeContext()

    hatch(fake.context, createRandom(1), {
      inside: () => true,
      bounds: [0, 0, 100, 100],
      angle: 45,
      spacing: 6,
      alpha: 0.2,
      width: 1,
    })

    expect(fake.strokeCount()).toBeGreaterThan(0)
  })

  it('draws curls and arcs', () => {
    const fake = createFakeContext()

    curl(fake.context, createRandom(2), 50, 50, 10, 0.5, 1)
    arc(fake.context, createRandom(2), 50, 50, 20, 0, Math.PI, 0.5, 1)

    expect(fake.strokeCount()).toBe(2)
    expectSaneCoordinates(fake.coordinates())
  })
})
