import 'server-only'

import { headers } from 'next/headers'

import type { JsonLd } from '../../lib/structured-data'

interface StructuredDataProps {
  /** One schema.org graph. Render the component once per graph. */
  data: JsonLd
}

/**
 * The six characters that turn a `<` into a JSON escape sequence.
 *
 * The payload is interpolated straight into HTML, so a translated string
 * containing `</script` would otherwise close the element and spill the rest of
 * the graph into the document as markup.
 *
 * Built from a code point rather than written as a literal: the sequence is a
 * backslash followed by `u003c`, and every layer between here and the file —
 * an editor, a formatter, a tool — is entitled to read a literal backslash as
 * an escape and quietly hand back a bare `<`, which would make the guard a
 * no-op that still looks correct.
 */
const ESCAPED_LESS_THAN = `${String.fromCodePoint(0x5c)}u003c`

/**
 * Emits one JSON-LD block.
 *
 * A `application/ld+json` block is a data island rather than a script, and the
 * specification says `script-src` does not govern it. Browsers disagree about
 * that in the details, and the cost of being wrong is silent — the block simply
 * never reaches the crawler — so it carries the same nonce every other script
 * on this page carries.
 */
export async function StructuredData({ data }: StructuredDataProps) {
  const requestHeaders = await headers()
  const nonce = requestHeaders.get('x-nonce') ?? undefined

  return (
    <script
      type="application/ld+json"
      {...(nonce !== undefined && { nonce })}
      // A replacer function rather than a replacement string: `$` sequences in
      // a replacement are substitution patterns, and this one must be literal.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replaceAll('<', () => ESCAPED_LESS_THAN),
      }}
    />
  )
}
