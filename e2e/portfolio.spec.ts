import { expect, routes, test } from './fixtures/test'

/** Every section the design lays out, in order, by its anchor or its heading. */
const SECTION_IDS = ['top', 'about', 'education', 'cases', 'partners', 'blog', 'contact']

test.describe('portfolio page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(routes.home.ru)
  })

  test('lays out every section the navigation points at', async ({ page }) => {
    for (const id of SECTION_IDS) {
      await expect(page.locator(`#${id}`)).toHaveCount(1)
    }
  })

  test('navigates to a section from the header', async ({ page }) => {
    await page.getByTestId('site-header').getByRole('link', { name: 'Кейсы' }).click()

    await expect(page).toHaveURL(/#cases$/)
    await expect(page.locator('#cases')).toBeInViewport()
  })

  test('lists six cases, each a link that says which case it opens', async ({ page }) => {
    const cards = page.getByTestId('case-card')
    await expect(cards).toHaveCount(6)

    const everyCard = await cards.all()
    for (const card of everyCard) {
      await expect(card).toHaveAccessibleName(/.+/)
    }
  })

  test('opens a case from its card', async ({ page }) => {
    await page.getByTestId('case-card').first().click()

    await expect(page).toHaveURL(/\/ru\/cases\/[a-z]+$/)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })

  test('opens a note from the blog list', async ({ page }) => {
    await page.getByTestId('note-card').first().click()

    await expect(page).toHaveURL(/\/ru\/notes\/n\d$/)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })
})

test.describe('faq accordion', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(routes.home.ru)
  })

  test('opens one answer at a time', async ({ page }) => {
    const items = page.getByTestId('faq-item')
    const first = items.nth(0)
    const second = items.nth(1)

    await first.click()
    await expect(first).toHaveAttribute('aria-expanded', 'true')

    await second.click()
    // The canvas keeps a single answer open — opening one closes the other.
    await expect(second).toHaveAttribute('aria-expanded', 'true')
    await expect(first).toHaveAttribute('aria-expanded', 'false')
  })

  test('closes the open answer when it is clicked again', async ({ page }) => {
    const first = page.getByTestId('faq-item').first()

    await first.click()
    await expect(first).toHaveAttribute('aria-expanded', 'true')

    await first.click()
    await expect(first).toHaveAttribute('aria-expanded', 'false')
  })

  test('points aria-controls at a panel that exists in both states', async ({ page }) => {
    const first = page.getByTestId('faq-item').first()

    // A dangling aria-controls is a promise to a screen reader that the app
    // then fails to keep, so the panel stays mounted and toggles `hidden`.
    await expect(first).toHaveAttribute('aria-controls', /.+/)

    const controls = await first.getAttribute('aria-controls')
    await expect(page.locator(`#${controls ?? ''}`)).toHaveCount(1)
  })
})

test.describe('reviews carousel', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(routes.home.ru)
  })

  test('scrolls the track with the next control', async ({ page }) => {
    const track = page.getByTestId('reviews-track')
    await track.scrollIntoViewIfNeeded()

    const before = await track.evaluate((node) => node.scrollLeft)
    await page.getByTestId('reviews-next').click()

    await expect.poll(async () => track.evaluate((node) => node.scrollLeft)).toBeGreaterThan(before)
  })

  test('is reachable with the keyboard', async ({ page }) => {
    // A horizontally scrolling region that cannot take focus is unusable
    // without a mouse, and axe reports it.
    const track = page.getByTestId('reviews-track')

    await expect(track).toHaveAttribute('tabindex', '0')
    await expect(track).toHaveAccessibleName(/.+/)
  })
})

test.describe('mobile navigation', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('opens the panel and closes it on selection', async ({ page }) => {
    await page.goto(routes.home.ru)

    const toggle = page.getByTestId('mobile-nav-toggle')
    await expect(toggle).toHaveAttribute('aria-expanded', 'false')

    await toggle.click()
    await expect(toggle).toHaveAttribute('aria-expanded', 'true')

    await page.getByTestId('mobile-nav-panel').getByRole('link', { name: 'Обо мне' }).click()
    await expect(toggle).toHaveAttribute('aria-expanded', 'false')
  })
})
