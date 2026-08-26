/**
 * @vitest-environment node
 *
 * `seo.ts` reads server-only configuration, and @t3-oss/env refuses that the
 * moment it sees a `window` — correctly, since that is the leak it exists to
 * prevent. Running this file in the node environment is what a server render
 * actually looks like.
 */
import { describe, expect, it } from 'vitest'

import { routing } from '../i18n/routing'
import { buildPageMetadata } from './seo'

/**
 * These assertions are about SEO correctness, which fails silently: a wrong
 * canonical or a missing hreflang costs traffic weeks before anyone notices.
 */
describe('buildPageMetadata', () => {
  const home = buildPageMetadata({ locale: 'ru', title: 'Заголовок', description: 'Описание' })
  const about = buildPageMetadata({
    locale: 'en',
    title: 'About',
    description: 'About the author',
    path: '/about',
  })

  it('points the canonical at the current locale and path', () => {
    expect(home.alternates?.canonical).toBe('http://localhost:3000/ru')
    expect(about.alternates?.canonical).toBe('http://localhost:3000/en/about')
  })

  it('advertises every locale as an alternate, plus x-default', () => {
    const languages = about.alternates?.languages ?? {}

    // Asserted by shape rather than by listing forty tags: a new edition must
    // appear here automatically, and a test that had to be edited for each one
    // would eventually be edited wrongly.
    expect(Object.keys(languages)).toHaveLength(routing.locales.length + 1)
    expect(languages.en).toBe('http://localhost:3000/en/about')
    expect(languages.ru).toBe('http://localhost:3000/ru/about')
    expect(languages.kk).toBe('http://localhost:3000/kk/about')
    expect(languages['x-default']).toBe('http://localhost:3000/en/about')
  })

  it('sends x-default to the default locale, not to the current one', () => {
    // English is the default, so it is what a crawler serves a visitor whose
    // language the site does not match.
    const languages = about.alternates?.languages
    expect(languages?.['x-default']).toBe(languages?.en)
  })

  it('mirrors the title and description into the OpenGraph and Twitter cards', () => {
    expect(home.openGraph).toMatchObject({
      type: 'website',
      title: 'Заголовок',
      description: 'Описание',
      url: 'http://localhost:3000/ru',
      locale: 'ru_RU',
    })
    // Every other edition, and never the current one.
    const alternates =
      home.openGraph && 'alternateLocale' in home.openGraph
        ? home.openGraph.alternateLocale
        : undefined
    expect(alternates).toHaveLength(routing.locales.length - 1)
    expect(alternates).toContain('en_US')
    expect(alternates).not.toContain('ru_RU')
    expect(home.twitter).toMatchObject({ card: 'summary_large_image', title: 'Заголовок' })
  })

  it('leaves og:image to the file convention rather than duplicating the tag', () => {
    expect(home.openGraph).not.toHaveProperty('images')
  })

  it('refuses indexing outside production', () => {
    // APP_ENV defaults to `development` under test, so this is the staging and
    // local case: a non-production deployment must never compete with the real
    // site in search results.
    expect(home.robots).toMatchObject({ index: false, follow: false })
    expect(home.robots).toHaveProperty('googleBot.index', false)
  })

  it('sets metadataBase so relative asset URLs resolve', () => {
    expect(home.metadataBase?.toString()).toBe('http://localhost:3000/')
  })
})
