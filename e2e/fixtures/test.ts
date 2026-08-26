import { AxeBuilder } from '@axe-core/playwright'
import { test as base, type Page } from '@playwright/test'

/**
 * Derived from the builder rather than imported from `axe-core`, which is only
 * a transitive dependency here — this keeps the type accurate without adding a
 * direct dependency the app does not otherwise need.
 */
type AxeResults = Awaited<ReturnType<AxeBuilder['analyze']>>
type AxeViolation = AxeResults['violations'][number]

/**
 * The conformance target for this site: WCAG 2.1 level AA, plus Deque's
 * best-practice rules. `best-practice` is not a legal requirement, but every
 * rule in it (landmark structure, unique ids, heading order) catches the kind of
 * defect that is cheap now and expensive after launch.
 */
const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'] as const

/** Enough nodes to recognise the pattern, few enough to stay readable. */
const MAX_LISTED_NODES = 5

interface A11yScanOptions {
  /** Limit the scan to one sub-tree, e.g. a single widget under test. */
  include?: string
  /** Sub-trees to leave out — third-party embeds you cannot fix. */
  exclude?: string[]
  /** Rules to switch off. Write the reason at the call site, not here. */
  disableRules?: string[]
}

interface A11yScanResult {
  /** The full axe payload, for a test that needs to inspect specific nodes. */
  results: AxeResults
  /** One readable line per violation. Assert on this, not on `results`. */
  summary: string[]
}

interface A11yFixtures {
  a11yScan: (options?: A11yScanOptions) => Promise<A11yScanResult>
}

/** Routes under test. Centralised so a moved page is a one-line change. */
export const routes = {
  root: '/',
  home: { ru: '/ru', en: '/en' },
  about: { ru: '/ru/about', en: '/en/about' },
  /**
   * The contact form lives on the secondary About page: the portfolio's own
   * contact call-to-action is a mailto link, not a form.
   */
  contact: '/ru/about',
  caseStudy: '/ru/cases/samruk',
  note: '/ru/notes/growth',
  /** An address that will never exist — the 404 page has to be as accessible as any other. */
  notFound: '/ru/nope',
  health: '/api/health',
  robots: '/robots.txt',
  sitemap: '/sitemap.xml',
  manifest: '/manifest.webmanifest',
} as const

/**
 * The active colour scheme as the document reports it. next-themes can be
 * configured to write a class, a data attribute, or both, so read either — the
 * test cares about the resulting theme, not about how it is recorded.
 */
export async function documentTheme(page: Page): Promise<'dark' | 'light'> {
  return page.evaluate(() => {
    const root = document.documentElement
    const isDark = root.classList.contains('dark') || root.dataset.theme === 'dark'

    return isDark ? 'dark' : 'light'
  })
}

/** `critical · image-alt — Images must have alternative text (3 nodes)` */
function formatHeadline(violation: AxeViolation): string {
  const impact = violation.impact ?? 'unknown'
  const nodeCount = violation.nodes.length

  return `${impact} · ${violation.id} — ${violation.help} (${nodeCount} node(s))`
}

/** The headline plus the selectors that actually failed and where to read up. */
function formatViolation(violation: AxeViolation): string {
  const listed = violation.nodes.slice(0, MAX_LISTED_NODES)
  const lines = listed.map((node, index) => `  ${index + 1}. ${node.target.join(' >> ')}`)
  const hidden = violation.nodes.length - listed.length

  if (hidden > 0) {
    lines.push(`  …and ${hidden} more node(s)`)
  }

  return [formatHeadline(violation), `  ${violation.helpUrl}`, ...lines].join('\n')
}

export const test = base.extend<A11yFixtures>({
  a11yScan: async ({ page }, use, testInfo) => {
    await use(async (options: A11yScanOptions = {}) => {
      const builder = new AxeBuilder({ page }).withTags([...WCAG_TAGS])

      if (options.include !== undefined) {
        builder.include(options.include)
      }

      const excluded = options.exclude ?? []
      for (const selector of excluded) {
        builder.exclude(selector)
      }

      const disabled = options.disableRules ?? []
      if (disabled.length > 0) {
        builder.disableRules(disabled)
      }

      const results = await builder.analyze()
      const summary = results.violations.map((violation) => formatHeadline(violation))

      if (results.violations.length > 0) {
        // Annotations show up inline against the failing test in the HTML
        // report. A raw `JSON.stringify(violations)` is technically complete and
        // practically unreadable, so the report gets prose and the attachment
        // gets the selectors.
        for (const violation of results.violations) {
          testInfo.annotations.push({
            type: 'a11y-violation',
            description: formatHeadline(violation),
          })
        }

        await testInfo.attach('axe-violations.txt', {
          body: results.violations.map((violation) => formatViolation(violation)).join('\n\n'),
          contentType: 'text/plain',
        })
      }

      return { results, summary }
    })
  },
})

export { expect } from '@playwright/test'
