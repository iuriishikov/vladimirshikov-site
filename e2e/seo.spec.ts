import type { Page } from '@playwright/test'

import { expect, routes, test } from './fixtures/test'

const LOCATION_PATTERN = /<loc>(?<url>[^<]+)<\/loc>/gu

/** Every JSON-LD block on the page, parsed. A block that will not parse is invisible. */
async function graphs(page: Page): Promise<Record<string, unknown>[]> {
  const blocks = await page.locator('script[type="application/ld+json"]').allTextContents()
  return blocks.map((block) => JSON.parse(block) as Record<string, unknown>)
}

/** Only the pathnames matter here; the origin depends on the environment. */
function sitemapPathnames(xml: string): string[] {
  const pathnames: string[] = []

  for (const match of xml.matchAll(LOCATION_PATTERN)) {
    // A base is supplied so a relative or empty <loc> cannot throw and turn a
    // sitemap assertion into an unrelated URL parsing failure.
    pathnames.push(new URL(match.groups?.url ?? '', 'https://sitemap.invalid').pathname)
  }

  return pathnames
}

test.describe('crawlability', () => {
  test('serves a robots.txt with crawl rules', async ({ request }) => {
    const response = await request.get(routes.robots)

    expect(response.status()).toBe(200)
    expect(response.headers()['content-type'] ?? '').toContain('text/plain')

    // Only the rules are asserted. Whether the file invites crawlers and points
    // at the sitemap depends on APP_ENV — a non-production tier
    // deliberately disallows everything — so pinning that here would make the
    // suite pass or fail on which environment it happens to run against.
    expect(await response.text()).toMatch(/^user-agent:/imu)
  })

  test('lists every locale in the sitemap', async ({ request }) => {
    const response = await request.get(routes.sitemap)

    expect(response.status()).toBe(200)
    expect(response.headers()['content-type'] ?? '').toContain('xml')

    const pathnames = sitemapPathnames(await response.text())
    expect(pathnames.length).toBeGreaterThan(0)

    // Every route is locale-prefixed, so the first path segment is the locale.
    const localePrefixes = pathnames.map((pathname) => pathname.split('/', 2)[1])
    expect(localePrefixes).toContain('ru')
    expect(localePrefixes).toContain('en')
  })

  test('serves an installable web app manifest', async ({ request }) => {
    const response = await request.get(routes.manifest)

    expect(response.status()).toBe(200)
    expect(response.headers()['content-type'] ?? '').toMatch(/manifest\+json|application\/json/u)
  })
})

test.describe('page metadata', () => {
  test('exposes what crawlers and social cards read', async ({ page }) => {
    await page.goto(routes.home.ru)

    await expect(page).toHaveTitle(/\S/u)
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /\S/u)

    // Absolute, because a relative canonical is silently ignored by crawlers.
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /^https?:\/\//u)

    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', /\S/u)
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /\S/u)
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', /\S/u)
  })
})

test.describe('structured data', () => {
  test('describes the person as the subject of the home page', async ({ page }) => {
    await page.goto(routes.home.ru)

    const [graph] = await graphs(page)
    const nodes = graph?.['@graph'] as Record<string, unknown>[] | undefined

    expect(nodes?.map((node) => node['@type'])).toStrictEqual(['ProfilePage', 'Person', 'WebSite'])
    // The name in the graph has to be the name on the page, in this edition.
    const person = nodes?.find((node) => node['@type'] === 'Person')
    expect(person?.name).toBe('Владимир Шиков')
  })

  test('describes the essay and where it sits', async ({ page }) => {
    await page.goto(routes.note)

    const found = await graphs(page)
    expect(found.map((graph) => graph['@type'])).toStrictEqual(['Article', 'BreadcrumbList'])

    // Nobody knows when the essay was written, so nothing may claim to.
    expect(found[0]).not.toHaveProperty('datePublished')
  })

  test('survives the nonce policy that governs every other script', async ({ page, request }) => {
    const refusals: string[] = []
    page.on('console', (message) => {
      if (message.text().includes('Content Security Policy')) refusals.push(message.text())
    })

    await page.goto(routes.home.ru)

    // A block refused by the CSP fails silently: it is simply never read.
    expect(refusals).toStrictEqual([])

    // Asserted against the served HTML, not the DOM: a browser under a CSP
    // deliberately hides the nonce from `getAttribute`, so reading it back
    // through the page would say "absent" about a nonce that is really there.
    const served = await request.get(routes.home.ru)
    const html = await served.text()
    const block = /<script type="application\/ld\+json"[^>]*>/u.exec(html)

    expect(block?.[0]).toMatch(/nonce="[^"]+"/u)
  })
})

test.describe('the negotiated redirect', () => {
  test('tells shared caches that it varies by reader', async ({ request }) => {
    // Without this a CDN may store the first visitor's redirect and hand it to
    // everyone: one German reader would send every Japanese, Kazakh and English
    // one to /de. Invisible in development, total in production.
    const response = await request.get(routes.root, {
      headers: { 'Accept-Language': 'de-DE,de;q=0.9' },
      maxRedirects: 0,
    })

    expect(response.status()).toBeGreaterThanOrEqual(300)
    expect(response.status()).toBeLessThan(400)

    const vary = response.headers().vary ?? ''
    expect(vary.toLowerCase()).toContain('accept-language')
    expect(vary.toLowerCase()).toContain('cookie')
  })
})
