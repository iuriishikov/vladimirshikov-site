import { z } from 'zod'

/**
 * Zod 4 compiles object validators with `new Function()` for speed. The
 * production Content-Security-Policy has no `'unsafe-eval'`, so the browser
 * refuses that compilation: Zod falls back to the interpreted path and the page
 * keeps working, but every single page load logs a CSP violation.
 *
 * Two reasons that is worth fixing rather than tolerating:
 *
 * 1. A log full of expected violations is a log nobody reads, and a real
 *    injection attempt would land in the same noise.
 * 2. The fallback happens anyway — this only makes it deliberate, and skips the
 *    failed compilation attempt on every schema.
 *
 * Import this module wherever a schema is constructed. ES modules finish
 * evaluating their imports before the importing module's body runs, so the flag
 * is always set before the first `z.object()` call in that file.
 */
z.config({ jitless: true })
