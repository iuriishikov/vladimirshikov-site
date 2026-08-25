import { describe, expect, it } from 'vitest'

import { createRandom } from './random'

describe('createRandom', () => {
  it('produces the same sequence for the same seed', () => {
    // Determinism is the contract: without it the portrait would redraw as a
    // different face on every resize and every theme change.
    const a = createRandom(7)
    const b = createRandom(7)

    const first = Array.from({ length: 20 }, () => a())
    const second = Array.from({ length: 20 }, () => b())

    expect(first).toStrictEqual(second)
  })

  it('produces different sequences for different seeds', () => {
    const a = createRandom(7)
    const b = createRandom(8)

    expect(Array.from({ length: 10 }, () => a())).not.toStrictEqual(
      Array.from({ length: 10 }, () => b()),
    )
  })

  it('stays inside [0, 1)', () => {
    const random = createRandom(42)

    for (let index = 0; index < 500; index += 1) {
      const value = random()
      expect(value).toBeGreaterThanOrEqual(0)
      expect(value).toBeLessThan(1)
    }
  })

  it('does not immediately repeat itself', () => {
    const random = createRandom(1)
    const values = new Set(Array.from({ length: 200 }, () => random()))

    expect(values.size).toBe(200)
  })

  it('tolerates a fractional seed', () => {
    expect(() => createRandom(7.9)()).not.toThrow()
    expect(createRandom(7.9)()).toStrictEqual(createRandom(7)())
  })
})
