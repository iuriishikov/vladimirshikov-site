/**
 * @vitest-environment node
 *
 * `structured-data.ts` reads server-only configuration, and @t3-oss/env refuses
 * that the moment it sees a `window`.
 */
import { describe, expect, it } from 'vitest'

import {
  buildArticle,
  buildBreadcrumbs,
  buildPerson,
  buildProfilePage,
  buildProject,
  buildWebsite,
  buildWorkPage,
} from './structured-data'

const person = buildPerson({
  locale: 'ru',
  name: 'Владимир Шиков',
  description: 'Работаю с собственниками.',
  jobTitle: 'Партнёр TEAM LEAD',
  knowsAbout: ['Стратегия', 'Трансформация'],
  alumniOf: 'МГУ',
})

describe('structured data', () => {
  it('gives the person one stable identity for every page to point at', () => {
    // Three pages describing "Vladimir Shikov" are three views of one subject,
    // not three people who happen to share a name. The shared `@id` is what
    // says so.
    const website = buildWebsite()
    const article = buildArticle({
      locale: 'ru',
      path: '/notes/growth',
      headline: 'Из малого — в средний',
      description: 'Эссе',
      personName: 'Владимир Шиков',
    })

    expect(person['@id']).toBe('http://localhost:3000/#person')
    expect(website.publisher).toStrictEqual({ '@id': person['@id'] })
    expect(article.author).toMatchObject({ '@id': person['@id'] })
  })

  it('makes the person the subject of the profile page, not a mention on it', () => {
    const graph = buildProfilePage({
      locale: 'ru',
      title: 'Владимир Шиков',
      description: 'Описание',
      person,
      website: buildWebsite(),
    })

    const nodes = graph['@graph'] as Record<string, unknown>[]
    expect(nodes[0]).toMatchObject({
      '@type': 'ProfilePage',
      mainEntity: { '@id': person['@id'] },
      inLanguage: 'ru',
    })
    expect(nodes).toHaveLength(3)
  })

  it('claims nothing the site cannot show', () => {
    // Every one of these would be a fabrication: there are no verified
    // profiles, no ratings, no reviews, and nobody knows when the essay was
    // written. Structured data Google later finds untrue costs more than
    // structured data it never saw.
    const article = buildArticle({
      locale: 'en',
      path: '/notes/growth',
      headline: 'From small to mid-size',
      description: 'An essay',
      personName: 'Vladimir Shikov',
    })

    expect(person).not.toHaveProperty('sameAs')
    expect(person).not.toHaveProperty('aggregateRating')
    expect(article).not.toHaveProperty('datePublished')
    expect(article).not.toHaveProperty('dateModified')
    expect(article).not.toHaveProperty('image')
  })

  it('names a client only where the source material named one', () => {
    const named = buildProject({
      locale: 'en',
      path: '/cases/samruk',
      name: 'Samruk-Kazyna',
      description: 'A culture transformation.',
      personName: 'Vladimir Shikov',
      client: 'Samruk-Kazyna',
    })
    const unnamed = buildProject({
      locale: 'en',
      path: '/cases/atom',
      name: 'Nuclear-based industry',
      description: 'A forty-year strategy.',
      personName: 'Vladimir Shikov',
    })

    expect(named.about).toStrictEqual({ '@type': 'Organization', name: 'Samruk-Kazyna' })
    expect(unnamed).not.toHaveProperty('about')
  })

  it('numbers the breadcrumb trail from one and points every crumb at a real URL', () => {
    const crumbs = buildBreadcrumbs({
      locale: 'kk',
      trail: [
        { name: 'Басты бет', path: '' },
        { name: 'Эссе', path: '/notes/growth' },
      ],
    })

    expect(crumbs.itemListElement).toStrictEqual([
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Басты бет',
        item: 'http://localhost:3000/kk',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Эссе',
        item: 'http://localhost:3000/kk/notes/growth',
      },
    ])
  })

  it('declares the language on the page, never on the site', () => {
    // One `@id` for the WebSite across all forty editions, so a language on it
    // would be forty contradicting claims about one node. The page node's id is
    // per-URL, which is where a language can be true.
    expect(buildWebsite()).not.toHaveProperty('inLanguage')

    const kazakh = buildProfilePage({
      locale: 'kk',
      title: 'Владимир Шиков',
      description: 'Сипаттама',
      person,
      website: buildWebsite(),
    })
    const nodes = kazakh['@graph'] as Record<string, unknown>[]

    expect(nodes[0]?.inLanguage).toBe('kk')
  })

  it('binds a work to the page that presents it', () => {
    // Without the WebPage node the Article floats free: `isPartOf` points at a
    // WebSite the page never defines, and the crawler is handed a reference to
    // an identity nothing on that URL establishes.
    const graph = buildWorkPage({
      locale: 'en',
      path: '/notes/growth',
      name: 'From small to mid-size',
      work: buildArticle({
        locale: 'en',
        path: '/notes/growth',
        headline: 'From small to mid-size',
        description: 'An essay',
        personName: 'Vladimir Shikov',
      }),
      crumbs: buildBreadcrumbs({
        locale: 'en',
        trail: [{ name: 'Home', path: '' }],
      }),
    })

    const nodes = graph['@graph'] as Record<string, unknown>[]
    expect(nodes.map((node) => node['@type'])).toStrictEqual([
      'WebPage',
      'Article',
      'BreadcrumbList',
      'WebSite',
    ])

    // Every reference in the graph has to resolve inside it.
    const page = nodes[0]
    const article = nodes[1]
    expect(page?.mainEntity).toStrictEqual({ '@id': article?.['@id'] })
    expect(article?.mainEntityOfPage).toStrictEqual({ '@id': page?.['@id'] })
    expect(page?.breadcrumb).toStrictEqual({ '@id': nodes[2]?.['@id'] })
  })

  it('states the context once per document, not once per node', () => {
    // A node nested inside a `@graph` restating `@context` is noise at best and
    // a second, competing document at worst.
    const nested = buildArticle({
      locale: 'en',
      path: '/notes/growth',
      headline: 'From small to mid-size',
      description: 'An essay',
      personName: 'Vladimir Shikov',
    })

    expect(nested).not.toHaveProperty('@context')
    expect(buildBreadcrumbs({ locale: 'en', trail: [] })).not.toHaveProperty('@context')
  })

  it('points the person at a photograph that is really there', () => {
    // `public/` is served at the root, so a rename is a 404 in the graph and
    // nowhere else — silent, and only to machines.
    expect(person.image).toBe('http://localhost:3000/vladimir-shikov.jpg')
  })
})
