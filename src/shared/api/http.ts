import type { ZodType } from 'zod'

/** A non-2xx response, or a response whose body failed schema validation. */
export class HttpError extends Error {
  readonly status: number
  readonly url: string
  override readonly cause: unknown

  constructor(message: string, options: { status: number; url: string; cause?: unknown }) {
    super(message)
    this.name = 'HttpError'
    this.status = options.status
    this.url = options.url
    this.cause = options.cause
  }
}

interface RequestOptions<TSchema> extends Omit<RequestInit, 'signal' | 'headers'> {
  /**
   * A plain record rather than `HeadersInit`: the union also allows an array
   * and a `Headers` instance, neither of which can be merged with a spread.
   */
  headers?: Record<string, string>
  /**
   * Validates and *types* the response body. Without it the caller gets
   * `unknown` — the network is untyped input and pretending otherwise is how
   * `undefined is not a function` reaches production.
   */
  schema?: ZodType<TSchema>
  /** Hard ceiling on the whole request. Defaults to 10s. */
  timeoutMs?: number
}

/**
 * The one place this app talks HTTP.
 *
 * Centralising it buys three things every call site would otherwise re-invent:
 * a timeout, a typed error, and schema-validated parsing.
 */
export async function httpRequest<TSchema = unknown>(
  url: string,
  { schema, timeoutMs = 10_000, headers, ...init }: RequestOptions<TSchema> = {},
): Promise<TSchema> {
  let response: Response

  try {
    response = await fetch(url, {
      ...init,
      headers: { accept: 'application/json', ...headers },
      signal: AbortSignal.timeout(timeoutMs),
    })
  } catch (error) {
    const isTimedOut = error instanceof DOMException && error.name === 'TimeoutError'
    throw new HttpError(
      isTimedOut ? `Request timed out after ${String(timeoutMs)}ms` : 'Network error',
      {
        status: 0,
        url,
        cause: error,
      },
    )
  }

  if (!response.ok) {
    throw new HttpError(`Request failed with status ${String(response.status)}`, {
      status: response.status,
      url,
    })
  }

  if (response.status === 204) {
    return undefined as TSchema
  }

  const payload: unknown = await response.json()

  if (!schema) {
    return payload as TSchema
  }

  const parsed = schema.safeParse(payload)
  if (!parsed.success) {
    throw new HttpError('Response did not match the expected schema', {
      status: response.status,
      url,
      cause: parsed.error,
    })
  }

  return parsed.data
}
