/**
 * The dictionary ids for the service rows, in the order the section shows them.
 *
 * They live apart from both the section and its icon set so the two agree by
 * construction: a row without a tile pair — or a tile pair without a row — stops
 * type-checking rather than rendering a hole.
 */
export const SERVICE_IDS = ['s1', 's2', 's3', 's4'] as const

export type ServiceId = (typeof SERVICE_IDS)[number]
