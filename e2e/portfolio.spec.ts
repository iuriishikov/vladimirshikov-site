import { expect, routes, test } from './fixtures/test'

/** Every section the page lays out, in order, by its anchor. */
const SECTION_IDS = [
  'top',
  'about',
  'services',
  'cases',
  'partners',
  'education',
  'blog',
  'contact',
]

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
    await page.getByTestId('site-header').getByRole('link', { name: 'Проекты' }).click()

    await expect(page).toHaveURL(/#cases$/)
    await expect(page.locator('#cases')).toBeInViewport()
  })

  test('lists every project as a link that says which one it opens', async ({ page }) => {
    const cards = page.getByTestId('case-card')
    await expect(cards).toHaveCount(3)

    const everyCard = await cards.all()
    for (const card of everyCard) {
      await expect(card).toHaveAccessibleName(/.+/)
    }
  })

  test('opens a project from its card', async ({ page }) => {
    await page.getByTestId('case-card').first().click()

    await expect(page).toHaveURL(/\/ru\/cases\/[a-z]+$/)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })

  test('opens the essay from the writing list', async ({ page }) => {
    await page.getByTestId('note-card').first().click()

    await expect(page).toHaveURL(/\/ru\/notes\/growth$/)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })
})

test.describe('the questions section', () => {
  test('states every question in full, with nothing to expand', async ({ page }) => {
    await page.goto(routes.home.ru)

    const items = page.getByTestId('question-item')
    await expect(items).toHaveCount(5)

    // The section replaced an accordion. Each question has to be readable as
    // it stands — a disclosure control here would expand to nothing.
    await expect(items.first()).toBeVisible()
    await expect(items.first().getByRole('button')).toHaveCount(0)
  })
})

test.describe('a project page', () => {
  test('shows the summary and the detail behind the cover', async ({ page }) => {
    await page.goto(routes.caseStudy)

    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Самрук-Казына')
    await expect(page.getByTestId('case-cover')).toBeVisible()
    await expect(page.getByText(/единая методология диагностики/)).toBeVisible()
  })
})

test.describe('the essay', () => {
  test('renders the whole piece, headings and closing questions included', async ({ page }) => {
    await page.goto(routes.note)

    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Из малого — в средний. Из среднего — в большой',
    )
    // Five section headings carry the argument; losing them would leave a wall
    // of prose that still passes a "page renders" check. Scoped to the article
    // because the footer's call to action is an h2 on every page.
    await expect(page.locator('article').getByRole('heading', { level: 2 })).toHaveCount(5)
    await expect(page.getByText('Какой компанией вы хотите стать?')).toBeVisible()
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
