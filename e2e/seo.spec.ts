import { expect, routes, test } from './fixtures/test'

const LOCATION_PATTERN = /<loc>(?<url>[^<]+)<\/loc>/gu

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
