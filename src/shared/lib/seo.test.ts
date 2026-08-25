/**
 * @vitest-environment node
 *
 * `seo.ts` reads server-only configuration, and @t3-oss/env refuses that the
 * moment it sees a `window` — correctly, since that is the leak it exists to
 * prevent. Running this file in the node environment is what a server render
 * actually looks like.
 */
import { describe, expect, it } from 'vitest'

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
    expect(about.alternates?.languages).toStrictEqual({
      'en-US': 'http://localhost:3000/en/about',
      'ru-RU': 'http://localhost:3000/ru/about',
      'x-default': 'http://localhost:3000/en/about',
    })
  })

  it('sends x-default to the default locale, not to the current one', () => {
    // English is the default, so it is what a crawler serves a visitor whose
    // language the site does not match.
    const languages = about.alternates?.languages
    expect(languages?.['x-default']).toBe(languages?.['en-US'])
  })

  it('mirrors the title and description into the OpenGraph and Twitter cards', () => {
    expect(home.openGraph).toMatchObject({
      type: 'website',
      title: 'Заголовок',
      description: 'Описание',
      url: 'http://localhost:3000/ru',
      locale: 'ru-RU',
      alternateLocale: ['en-US'],
    })
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
