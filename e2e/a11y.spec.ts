import { expect, routes, test } from './fixtures/test'

/**
 * Both locales of the home page, because the Russian and English trees differ
 * in text direction-independent ways (link text, abbreviations, form labels),
 * plus one inner page to cover the shared layout in a non-root context.
 */
const SCANNED_ROUTES = [
  routes.home.ru,
  routes.home.en,
  routes.about.ru,
  routes.caseStudy,
  routes.note,
  routes.notFound,
]

test.describe('accessibility', () => {
  for (const route of SCANNED_ROUTES) {
    test(`${route} passes an axe scan`, async ({ a11yScan, page }) => {
      await page.goto(route)

      const { summary } = await a11yScan()

      // Asserting on the summary rather than on the raw violations keeps a
      // failure to one readable line per rule; the offending selectors are
      // attached to the report as `axe-violations.txt`.
      expect(summary).toEqual([])
    })
  }
})
