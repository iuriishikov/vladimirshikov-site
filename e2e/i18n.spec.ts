import { expect, routes, test } from './fixtures/test'

/** Any locale the site does not serve — used to prove the 404 path works. */
const UNSUPPORTED_LOCALE_PATH = '/de'

/*
 * `localePrefix: 'always'` means there is no unprefixed page to land on, so the
 * bare root always redirects. Which locale it redirects *to* is negotiated from
 * Accept-Language (`localeDetection: true`), so each of these pins the browser
 * locale — otherwise the test would assert whatever language the CI runner
 * happens to be configured with.
 */
test.describe('content negotiation at the root', () => {
  test.describe('a Russian-speaking browser', () => {
    test.use({ locale: 'ru-RU' })

    test('lands on /ru', async ({ page }) => {
      await page.goto(routes.root)
      await expect(page).toHaveURL(/\/ru\/?$/)
      await expect(page.locator('html')).toHaveAttribute('lang', 'ru')
    })
  })

  test.describe('an English-speaking browser', () => {
    test.use({ locale: 'en-GB' })

    test('lands on /en', async ({ page }) => {
      await page.goto(routes.root)
      await expect(page).toHaveURL(/\/en\/?$/)
      await expect(page.locator('html')).toHaveAttribute('lang', 'en')
    })
  })

  test.describe('a browser asking for a language the site does not serve', () => {
    test.use({ locale: 'ja-JP' })

    test('falls back to the default locale', async ({ page }) => {
      // English is the default: it is what an unmatched visitor gets, and what
      // `x-default` points a crawler at.
      await page.goto(routes.root)
      await expect(page).toHaveURL(/\/en\/?$/)
    })
  })
})

test.describe('localised routing', () => {
  test('switches locale and updates the document language', async ({ page }) => {
    await page.goto(routes.home.ru)
    await expect(page.locator('html')).toHaveAttribute('lang', 'ru')

    // The switcher renders one plain link per locale, each with its own test id,
    // so nothing here depends on the visible label.
    const toEnglish = page.getByTestId('locale-switcher').getByTestId('locale-option-en')
    await expect(toEnglish).toHaveAttribute('href', routes.home.en)
    await toEnglish.click()

    await expect(page).toHaveURL(/\/en\/?$/)
    await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  })

  test('answers an unsupported locale with a 404', async ({ page }) => {
    const response = await page.goto(UNSUPPORTED_LOCALE_PATH)

    // A soft 404 — a "not found" page served with status 200 — would keep the
    // bogus URL in search indexes indefinitely.
    expect(response).not.toBeNull()
    expect(response?.status()).toBe(404)
  })

  test('advertises every locale to crawlers with hreflang alternates', async ({ page }) => {
    await page.goto(routes.home.ru)

    // Prefix-matched: the alternates carry full BCP 47 tags (`ru-RU`, `en-US`),
    // and narrowing or widening a region tag must not break this test.
    await expect(page.locator('link[rel="alternate"][hreflang^="ru"]')).toHaveCount(1)
    await expect(page.locator('link[rel="alternate"][hreflang^="en"]')).toHaveCount(1)
    // `x-default` tells a crawler which locale to serve an unmatched visitor.
    await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveCount(1)
  })
})
