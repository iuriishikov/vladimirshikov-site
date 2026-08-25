import { expect, routes, test } from './fixtures/test'

/**
 * A locale the site does not serve — used to prove the 404 path works.
 *
 * Chinese on purpose, and it will stay unserved: neither typeface the site
 * loads has a Han glyph, so the edition could not be set even if it existed.
 */
const UNSUPPORTED_LOCALE_PATH = '/zh'

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

  test('opens the index and switches to an edition that is not in the bar', async ({ page }) => {
    await page.goto(routes.home.ru)

    const index = page.getByTestId('locale-index')
    // Only the two primary editions are on show; the rest are behind the count.
    await expect(page.getByTestId('locale-index-toggle')).toBeVisible()
    await expect(index.getByRole('link')).toHaveCount(0)

    await page.getByTestId('locale-index-toggle').click()

    const kazakh = index.getByRole('link', { name: 'Қазақша' })
    await expect(kazakh).toBeVisible()
    await kazakh.click()

    await expect(page).toHaveURL(/\/kk\/?$/)
    await expect(page.locator('html')).toHaveAttribute('lang', 'kk')
  })

  test('shows the current edition in the bar when it is neither primary', async ({ page }) => {
    // The bar has to say which edition you are reading, whichever it is.
    await page.goto('/kk')

    const bar = page.getByTestId('locale-switcher')
    await expect(bar.getByTestId('locale-option-kk')).toHaveAttribute('aria-current', 'true')
    await expect(bar.getByTestId('locale-option-en')).toBeVisible()
    await expect(bar.getByTestId('locale-option-ru')).toBeVisible()
  })

  test('closes the index on Escape', async ({ page }) => {
    await page.goto(routes.home.ru)

    await page.getByTestId('locale-index-toggle').click()
    await expect(page.getByTestId('locale-index').getByRole('link').first()).toBeVisible()

    await page.keyboard.press('Escape')

    await expect(page.getByTestId('locale-index').getByRole('link')).toHaveCount(0)
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
