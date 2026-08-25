import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import { StructuredData } from './structured-data'

const requestHeaders = new Map<string, string>()

vi.mock('next/headers', () => ({
  headers: () => Promise.resolve({ get: (key: string) => requestHeaders.get(key) ?? null }),
}))

/** The component is async, so it has to be awaited before it can be rendered. */
async function markupFor(data: Record<string, unknown>): Promise<string> {
  const element = await StructuredData({ data })
  return renderToStaticMarkup(element)
}

describe('StructuredData', () => {
  it('emits the graph as a JSON-LD block', async () => {
    requestHeaders.clear()

    const view = await markupFor({ '@type': 'Person', name: 'Vladimir Shikov' })

    expect(view).toContain('type="application/ld+json"')
    expect(view).toContain('"@type":"Person"')
  })

  it('cannot be closed early by the content it carries', async () => {
    requestHeaders.clear()

    // The payload is interpolated straight into HTML. Without escaping, this
    // string would end the script element and put the rest of the graph into
    // the document as markup — and, with translated copy in forty languages,
    // "content that happens to contain markup" is not a hypothetical.
    const view = await markupFor({ name: '</script><img src=x onerror=alert(1)>' })

    expect(view).not.toContain('</script><img')
    // Built from a code point for the same reason the source is: a literal
    // backslash here is one tool away from becoming a bare `<`, and the
    // assertion would then pass against the very bug it exists to catch.
    expect(view).toContain(`${String.fromCodePoint(0x5c)}u003c/script`)
  })

  it('still parses back to exactly what went in', async () => {
    requestHeaders.clear()

    const view = await markupFor({ name: 'a < b </script>', nested: { of: ['x'] } })
    const payload = /<script[^>]*>(?<json>.*)<\/script>/su.exec(view)?.groups?.json ?? ''

    expect(JSON.parse(payload)).toStrictEqual({ name: 'a < b </script>', nested: { of: ['x'] } })
  })

  it('carries the request nonce when the policy published one', async () => {
    requestHeaders.set('x-nonce', 'test-nonce')

    const view = await markupFor({ '@type': 'WebSite' })

    expect(view).toContain('nonce="test-nonce"')
  })

  it('omits the attribute rather than emitting an empty one', async () => {
    // An empty `nonce=""` is not "no nonce" — under a nonce policy it is a
    // nonce that matches nothing.
    requestHeaders.clear()

    const view = await markupFor({ '@type': 'WebSite' })

    expect(view).not.toContain('nonce=')
  })
})
