import '@testing-library/jest-dom/vitest'

import { afterAll, afterEach, beforeAll, vi } from 'vitest'

import { server } from './msw/server'

/*
 * HTTP is mocked at the network boundary, not by stubbing modules: a test then
 * exercises the real URL, the real fetch and the real schema validation.
 *
 * `onUnhandledRequest: 'error'` is the part that earns its keep — a request the
 * suite did not plan for fails loudly instead of hanging or silently hitting
 * the network.
 */
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})

/*
 * Testing Library unmounts between tests on its own, because vitest.config.ts
 * enables `globals` and therefore exposes the `afterEach` it hooks into.
 *
 * The polyfills below are assigned with `Object.defineProperty` rather than
 * `vi.stubGlobal`, because `unstubGlobals: true` tears every stub down after
 * each test — which would remove them before the second test ran.
 */

function defineGlobal(name: string, value: unknown): void {
  Object.defineProperty(globalThis, name, { writable: true, configurable: true, value })
}

/**
 * Server-only modules are tested with `@vitest-environment node`, where none of
 * the DOM shims below exist to be patched — and where patching them would throw.
 */
// `'document' in globalThis` rather than a typeof check: the DOM lib types
// `document` as always present, so TypeScript would narrow a typeof comparison
// away as impossible — which it is not, in the node environment.
const hasDom = 'document' in globalThis

// jsdom has no media queries, and next-themes reads one during mount.
if (hasDom) {
  defineGlobal('matchMedia', (query: string): MediaQueryList => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))
}

class MockResizeObserver implements ResizeObserver {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
}

const noEntries = (): IntersectionObserverEntry[] => []

class MockIntersectionObserver implements IntersectionObserver {
  readonly root = null
  readonly rootMargin = ''
  readonly scrollMargin = ''
  readonly thresholds: readonly number[] = []
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
  takeRecords = vi.fn(noEntries)
}

if (hasDom) {
  defineGlobal('ResizeObserver', MockResizeObserver)
  defineGlobal('IntersectionObserver', MockIntersectionObserver)
}

// Radix relies on these for focus and pointer management inside overlays.
if (hasDom) {
  Element.prototype.scrollIntoView = vi.fn()
  Element.prototype.hasPointerCapture = vi.fn(() => false)
  Element.prototype.setPointerCapture = vi.fn()
  Element.prototype.releasePointerCapture = vi.fn()
}
