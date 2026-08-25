import { expect, routes, test } from './fixtures/test'

test.describe('home page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(routes.home.ru)
  })

  test('renders the site chrome and the hero', async ({ page }) => {
    await expect(page.getByTestId('site-header')).toBeVisible()
    await expect(page.getByTestId('site-footer')).toBeVisible()
    await expect(page.getByTestId('hero-title')).toBeVisible()
    await expect(page.getByTestId('hero-cta')).toBeVisible()
  })

  test('carries exactly one first-level heading', async ({ page }) => {
    // A second h1 leaves screen-reader users without a single "you are here"
    // anchor and breaks every heading-outline tool, including our own axe scan.
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1)
  })

  test('declares the rendered locale on the document element', async ({ page }) => {
    await expect(page.locator('html')).toHaveAttribute('lang', 'ru')
  })

  test('reveals the skip link on Tab and moves focus to the main landmark', async ({ page }) => {
    const skipLink = page.getByTestId('skip-to-content')

    // `sr-only` clips the link to a 1px box rather than removing it, because a
    // display:none element cannot take focus at all. Playwright still counts
    // that box as "visible", so the reveal is measured instead of asserted.
    const clipped = await skipLink.boundingBox()

    // The skip link must be the very first tab stop, otherwise a keyboard user
    // has already walked the whole navigation before being offered the shortcut.
    await page.keyboard.press('Tab')
    await expect(skipLink).toBeFocused()
    await expect(skipLink).toBeVisible()

    const revealed = await skipLink.boundingBox()
    expect(revealed?.width ?? 0).toBeGreaterThan(clipped?.width ?? 0)

    await page.keyboard.press('Enter')

    // Scrolling to the landmark is not enough — focus has to land there, or the
    // next Tab drops the user back at the top of the navigation.
    await expect(page.getByRole('main')).toBeFocused()
  })
})
