/**
 * @vitest-environment node
 *
 * Forty dictionaries are too many to review by reading them. What can be
 * checked mechanically is checked here: that every edition exists, that none of
 * them lost a key or invented one, that no ICU placeholder was translated, and
 * that the strings which sit in fixed-width furniture still fit it.
 */
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

import { localeCodes } from './locales'

interface MessageTree {
  [key: string]: string | MessageTree
}

function read(locale: string): MessageTree {
  return JSON.parse(readFileSync(`messages/${locale}.json`, 'utf8')) as MessageTree
}

/** Every leaf of the tree, flattened to `Section.key.subkey`. */
function leaves(tree: MessageTree, prefix = ''): Record<string, string> {
  const found: Record<string, string> = {}

  for (const [key, value] of Object.entries(tree)) {
    const path = prefix ? `${prefix}.${key}` : key
    if (typeof value === 'string') {
      found[path] = value
    } else {
      Object.assign(found, leaves(value, path))
    }
  }

  return found
}

const english = leaves(read('en'))
const englishKeys = Object.keys(english)
const translated = localeCodes.filter((code) => code !== 'en')

/**
 * The strings that sit in furniture of a fixed size — three equal segments of
 * one small pill, a single row of five navigation items, a two-line heading.
 * A translation that overruns these does not look translated, it looks broken.
 */
const BUDGETS: Record<string, number> = {
  'ThemeSwitch.light': 8,
  'ThemeSwitch.dark': 8,
  'ThemeSwitch.system': 8,
  'ThemeSwitch.label': 22,
  'LocaleSwitch.label': 22,
  'Header.nav.home': 14,
  'Header.nav.about': 14,
  'Header.nav.services': 14,
  'Header.nav.cases': 14,
  'Header.nav.blog': 14,
  'Header.contact': 18,
  'Works.back': 22,
  'Note.back': 22,
  'Partners.headingLine1': 18,
  'Partners.headingLine2': 18,
}

const PLACEHOLDER = /\{(\w+)\}/g

function placeholders(text: string): string {
  return Array.from(text.matchAll(PLACEHOLDER), (match) => match[1] ?? '')
    .toSorted((a, b) => a.localeCompare(b))
    .join('|')
}

describe('dictionaries', () => {
  it('publishes one for every edition the routing declares', () => {
    // A locale in the routing with no file behind it is a 500, not a fallback.
    for (const code of localeCodes) {
      expect(() => read(code), `messages/${code}.json`).not.toThrow()
    }
  })

  it.each(translated)('%s carries every key English does, and no others', (code) => {
    const actual = leaves(read(code))

    const actualKeys = new Set(Object.keys(actual))
    const expectedKeys = new Set(englishKeys)

    const missing = englishKeys.filter((key) => !actualKeys.has(key))
    const extra = Object.keys(actual).filter((key) => !expectedKeys.has(key))

    expect({ missing, extra }).toStrictEqual({ missing: [], extra: [] })
  })

  it.each(translated)('%s preserves every ICU placeholder verbatim', (code) => {
    const actual = leaves(read(code))
    const broken: string[] = []

    for (const key of englishKeys) {
      const expected = placeholders(english[key] ?? '')
      if (!expected) continue

      const got = placeholders(actual[key] ?? '')
      if (got !== expected) broken.push(`${key}: expected {${expected}}, got {${got || 'none'}}`)
    }

    expect(broken).toStrictEqual([])
  })

  it.each(translated)('%s keeps the fixed-width strings within budget', (code) => {
    const actual = leaves(read(code))
    const overruns: string[] = []

    for (const [key, budget] of Object.entries(BUDGETS)) {
      // UTF-16 units, deliberately: every string under a budget is Latin or
      // Cyrillic, where a unit is a character, and the budget is really about
      // how much room the word takes in a box.
      const text = actual[key] ?? ''
      if (text.length > budget) {
        overruns.push(`${key}: ${String(text.length)} > ${String(budget)} — "${text}"`)
      }
    }

    expect(overruns).toStrictEqual([])
  })

  it.each(translated)('%s is not simply a copy of the English', (code) => {
    const actual = leaves(read(code))

    // A dictionary that "translated" by copying is worse than a missing one:
    // the fallback would at least have been honest about it.
    const identical = englishKeys.filter(
      (key) => (english[key] ?? '').length > 24 && actual[key] === english[key],
    )

    expect(identical.length).toBeLessThan(englishKeys.length / 4)
  })
})
