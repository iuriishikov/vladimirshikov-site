import { expect, routes, test } from './fixtures/test'

test.describe('contact form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(routes.contact)
    await expect(page.getByTestId('contact-form')).toBeVisible()
  })

  test('rejects a malformed address without leaving the page', async ({ page }) => {
    await page.getByTestId('contact-form-email').fill('vladimir@')
    await page.getByTestId('contact-form-submit').click()

    await expect(page.getByTestId('contact-form-error')).toBeVisible()
    await expect(page.getByTestId('contact-form-success')).toBeHidden()

    // A full-page navigation here would mean the client-side guard never ran and
    // the visitor lost whatever else they had typed.
    expect(new URL(page.url()).pathname).toBe(routes.contact)
  })

  test('confirms the submission for a valid address', async ({ page }) => {
    await page.getByTestId('contact-form-email').fill('vladimir@example.com')
    await page.getByTestId('contact-form-submit').click()

    await expect(page.getByTestId('contact-form-success')).toBeVisible()
    await expect(page.getByTestId('contact-form-error')).toBeHidden()
  })
})
