import { describe, expect, it } from 'vitest'

import { mergeMessages } from './merge-messages'

const BASE = {
  Header: { brand: 'Shikov.V', nav: { home: 'Home', about: 'About' } },
  Footer: { cta: 'Sometimes an owner does not need a project.' },
}

describe('mergeMessages', () => {
  it('prefers the translation wherever it has one', () => {
    const merged = mergeMessages(BASE, { Header: { brand: 'Шиков.В' } })

    expect(merged.Header).toMatchObject({ brand: 'Шиков.В' })
  })

  it('falls back to English for a key the translation never supplied', () => {
    // Forty editions is a lot of surface for a key to go missing from, and the
    // alternative is `Footer.cta` printed in the middle of the page.
    const merged = mergeMessages(BASE, { Header: { brand: 'Шиков.В' } })

    expect(merged.Footer).toStrictEqual(BASE.Footer)
  })

  it('merges a branch rather than replacing it wholesale', () => {
    const merged = mergeMessages(BASE, { Header: { nav: { home: 'Главная' } } })

    // A translation that got halfway through the navigation keeps the English
    // other half instead of deleting it.
    expect(merged.Header).toStrictEqual({
      brand: 'Shikov.V',
      nav: { home: 'Главная', about: 'About' },
    })
  })

  it('treats an empty string as a real value, not as absent', () => {
    // Several section leads in this dictionary are blank on purpose.
    const merged = mergeMessages({ Blog: { lead: 'Writing' } }, { Blog: { lead: '' } })

    expect(merged.Blog).toStrictEqual({ lead: '' })
  })

  it('leaves the base untouched', () => {
    const before = JSON.stringify(BASE)
    mergeMessages(BASE, { Header: { brand: 'Шиков.В', nav: { home: 'Главная' } } })

    expect(JSON.stringify(BASE)).toBe(before)
  })
})
