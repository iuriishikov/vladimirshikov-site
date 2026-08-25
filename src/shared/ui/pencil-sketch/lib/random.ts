/** A deterministic 0..1 generator. */
export type Random = () => number

/**
 * mulberry32 — small, fast, and seeded.
 *
 * Determinism is the whole point: the same seed must produce the same drawing
 * on the server, on the client and on every resize, or the sketch would flicker
 * into a different face each time React re-rendered it.
 */
export function createRandom(seed: number): Random {
  let state = (Math.trunc(seed) + 0x9e_37_79_b9) >>> 0

  return () => {
    state += 0x6d_2b_79_f5
    let result = Math.imul(state ^ (state >>> 15), 1 | state)
    result ^= result + Math.imul(result ^ (result >>> 7), 61 | result)
    return ((result ^ (result >>> 14)) >>> 0) / 4_294_967_296
  }
}
