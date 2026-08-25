import { documentTheme, expect, routes, test } from './fixtures/test'

test.describe('theme switching', () => {
  test('flips the document theme and remembers the choice across a reload', async ({ page }) => {
    await page.goto(routes.home.ru)

    await page.getByTestId('theme-option-dark').click()
    await expect.poll(() => documentTheme(page)).toBe('dark')

    await page.reload()
    await expect.poll(() => documentTheme(page)).toBe('dark')
  })

  test('hands the theme back to the operating system', async ({ page }) => {
    // The whole point of the third segment: without it the first press pins the
    // site to a colour for good, and `system` — the default — is unreachable.
    await page.emulateMedia({ colorScheme: 'light' })
    await page.goto(routes.home.ru)

    await page.getByTestId('theme-option-dark').click()
    await expect.poll(() => documentTheme(page)).toBe('dark')

    await page.getByTestId('theme-option-system').click()
    await expect.poll(() => documentTheme(page)).toBe('light')

    // And it follows the OS from then on, rather than freezing on whatever it
    // resolved to at the moment of the press.
    await page.emulateMedia({ colorScheme: 'dark' })
    await expect.poll(() => documentTheme(page)).toBe('dark')
  })

  test('paints the persisted theme before the page becomes interactive', async ({ page }) => {
    await page.goto(routes.home.ru)

    await page.getByTestId('theme-option-dark').click()
    await expect.poll(() => documentTheme(page)).toBe('dark')

    // next-themes writes the theme from a blocking inline script, so a fresh
    // navigation already has it on <html> by the time DOMContentLoaded fires.
    // Reading once — deliberately without polling — is what makes this a guard
    // against the flash of the wrong theme rather than a slow-loading page.
    // That script is inline, so the app's CSP must let it run: <ThemeProvider>
    // needs the `nonce` the proxy publishes on `x-nonce`. If this assertion
    // fails while the test above passes, the nonce is missing and real visitors
    // see the flash.
    await page.goto(routes.about.ru, { waitUntil: 'domcontentloaded' })
    expect(await documentTheme(page)).toBe('dark')
  })
})
