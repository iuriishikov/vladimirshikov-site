import { documentTheme, expect, routes, test } from './fixtures/test'

test.describe('theme switching', () => {
  test('flips the document theme and remembers the choice across a reload', async ({ page }) => {
    await page.goto(routes.home.ru)

    const initial = await documentTheme(page)
    await page.getByTestId('theme-toggle').click()

    // Asserting "not the previous value" rather than a literal keeps the test
    // honest whichever theme the visitor's OS preference started us on.
    await expect.poll(() => documentTheme(page)).not.toBe(initial)
    const chosen = await documentTheme(page)

    await page.reload()
    await expect.poll(() => documentTheme(page)).toBe(chosen)
  })

  test('paints the persisted theme before the page becomes interactive', async ({ page }) => {
    await page.goto(routes.home.ru)

    const initial = await documentTheme(page)
    await page.getByTestId('theme-toggle').click()
    await expect.poll(() => documentTheme(page)).not.toBe(initial)
    const chosen = await documentTheme(page)

    // next-themes writes the theme from a blocking inline script, so a fresh
    // navigation already has it on <html> by the time DOMContentLoaded fires.
    // Reading once — deliberately without polling — is what makes this a guard
    // against the flash of the wrong theme rather than a slow-loading page.
    // That script is inline, so the app's CSP must let it run: <ThemeProvider>
    // needs the `nonce` the proxy publishes on `x-nonce`. If this assertion
    // fails while the test above passes, the nonce is missing and real visitors
    // see the flash.
    await page.goto(routes.about.ru, { waitUntil: 'domcontentloaded' })
    expect(await documentTheme(page)).toBe(chosen)
  })
})
