/**
 * Next.js loads this module once per server process, before anything else.
 *
 * It is the correct place to start an OpenTelemetry SDK, an APM agent or a
 * profiler — anything that must wrap the runtime rather than be imported by it.
 * The hooks are wired up and deliberately minimal; swap the bodies for a real
 * exporter without touching any call site.
 */

/** Runs once at server start, in both the Node.js and Edge runtimes. */
export function register(): void {
  // Intentionally empty. Example of what belongs here:
  //   if (process.env.NEXT_RUNTIME === 'nodejs') await import('./otel.node')
}

/**
 * Called for every error Next.js catches while handling a request — including
 * errors that a route's `error.tsx` boundary swallows, which would otherwise
 * never reach the server log.
 */
export function onRequestError(
  error: unknown,
  request: Readonly<{ path: string; method: string }>,
  context: Readonly<{ routerKind: string; routePath: string; routeType: string }>,
): void {
  // One JSON object per line: greppable in `docker compose logs`, and ready to
  // be shipped to a log aggregator without a custom parser.
  console.error(
    JSON.stringify({
      level: 'error',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      digest: error instanceof Error && 'digest' in error ? String(error.digest) : undefined,
      request: { path: request.path, method: request.method },
      context,
      timestamp: new Date().toISOString(),
    }),
  )
}
