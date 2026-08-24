/**
 * Runtime facts that must be readable *everywhere* — including the Edge
 * proxy and the browser bundle — without pulling in the validated `env` object.
 *
 * `env.ts` imports zod and validates the whole schema at module load. That is
 * exactly what you want in the app, and exactly what you do not want inside
 * `src/proxy.ts`, where it would run on every request at the edge and where a
 * validation failure would take down routing itself rather than one page.
 *
 * `NODE_ENV` is inlined by Next.js on both sides, so reading it directly is
 * safe and free.
 */
export const isDevelopment = process.env.NODE_ENV === 'development'
