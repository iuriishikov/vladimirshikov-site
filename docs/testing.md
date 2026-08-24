# Testing

Four tiers, each answering a question the tier below cannot. The rule for choosing between them: use
the cheapest tier that can actually fail when the behaviour breaks.

```text
        ╱  Lighthouse CI  ╲        is it fast enough, on every PR
       ╱   Playwright      ╲       does the real browser do the real thing
      ╱    Storybook        ╲      does the component look and behave right in isolation
     ╱     Vitest            ╲     does the unit do what it claims
```

---

## Unit — Vitest + Testing Library

```bash
pnpm test           # single run
pnpm test:watch     # watch mode while working
pnpm test:coverage  # with v8 coverage and thresholds
```

Configuration: [`vitest.config.ts`](../vitest.config.ts).

- **Environment**: `jsdom`, globals enabled, setup file `src/shared/test/setup.ts`.
- **Location**: colocated. `contact-form.tsx` is tested by `contact-form.test.tsx` in the same
  folder. Vitest collects `src/**/*.{test,spec}.{ts,tsx}` and ignores `e2e/**`.
- **Isolation**: `restoreMocks`, `clearMocks`, `unstubEnvs` and `unstubGlobals` are all on, so a test
  cannot leak state into the next one. There is no need to clean up mocks by hand.
- **HTTP**: mock at the network boundary with `msw`, not by stubbing `fetch`. A handler that returns
  the wrong shape then fails the test, which is the point.

Write tests against behaviour a user can observe:

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

it('shows a validation error for a malformed address', async () => {
  render(<ContactForm />)

  await userEvent.type(screen.getByTestId('contact-form-email'), 'not-an-email')
  await userEvent.click(screen.getByTestId('contact-form-submit'))

  expect(await screen.findByTestId('contact-form-error')).toBeVisible()
})
```

Prefer accessible queries (`getByRole`, `getByLabelText`) — they fail when the component becomes
unusable with a screen reader, which a `data-testid` query cannot detect. Reserve `getByTestId` for
elements with no accessible identity, and for the shared testids that e2e also depends on.

`eslint-plugin-testing-library` is active on test files and will reject the common mistakes
(`container.querySelector`, missing `await` on `findBy*`, `waitFor` with a side effect inside).

### What to test at this tier

| Test it here                                    | Do not test it here                      |
| ----------------------------------------------- | ---------------------------------------- |
| Pure functions in `lib` and `model`             | Routing and redirects                    |
| Zod schemas — the messages, not just the pass   | Real network calls                       |
| Component states: empty, loading, error, filled | Cross-browser rendering                  |
| Hooks and stores                                | Anything that needs a real layout engine |

### Coverage

Thresholds are 70% for statements, branches, functions and lines. The build fails below any of them.
Excluded from measurement: test files, stories, `index.ts` barrels, type declarations,
`src/shared/test/**`, and the Next.js `layout`/`error`/`not-found`/`loading`/`global-error` files
(framework shells with no logic of their own).

**Raising the thresholds** is a deliberate, one-way ratchet:

1. Run `pnpm test:coverage` and read the summary — find the lowest-covered real module.
2. Write the missing tests, then check the number the run reports.
3. Raise `thresholds` in `vitest.config.ts` to just below the new figure, in one PR of its own,
   scoped `test`.

Never lower a threshold to make a build pass. If a genuine architectural change makes the target
unreachable, that is an [ADR](./adr/), not a config tweak. The comment in `vitest.config.ts` says the
same thing to whoever gets there first.

---

## Component workshop — Storybook

```bash
pnpm storybook        # dev server on 6006
pnpm build-storybook  # static build for review
```

Stories live next to the component as `*.stories.tsx` and use CSF with a default-exported meta
object — one of the documented exceptions to the named-exports rule
([conventions.md](./conventions.md#framework-exceptions)).

Storybook is not a second test suite. It is where you develop a component's states without wiring up
a whole page, and where the **a11y addon** runs axe against each story as you look at it. Catching a
contrast or label problem there costs seconds; catching it in the `e2e` job costs a CI round trip.

Cover the states that are awkward to reach in the running app: error, loading, empty, long text,
both themes, both locales.

---

## End-to-end — Playwright

```bash
pnpm e2e:install   # once: Chromium plus its OS dependencies
pnpm e2e           # every installed project
pnpm e2e:ui        # interactive runner
```

Configuration: [`playwright.config.ts`](../playwright.config.ts). Specs live in `e2e/`.

**Four projects**, so a WebKit-only layout bug cannot ship unnoticed:

| Project         | Device profile  | Runs in CI                 |
| --------------- | --------------- | -------------------------- |
| `chromium`      | Desktop Chrome  | Yes                        |
| `firefox`       | Desktop Firefox | No — local and pre-release |
| `webkit`        | Desktop Safari  | No — local and pre-release |
| `mobile-safari` | iPhone 15       | No — local and pre-release |

`pnpm e2e:install` provisions Chromium only, and the CI job passes `--project=chromium` to match.
Keeping three browser downloads out of every pull request is worth the trade; run the full matrix
locally before a release:

```bash
pnpm exec playwright install firefox webkit
pnpm e2e
```

Behaviour worth knowing:

- **CI runs against the production server.** `webServer.command` is `pnpm start` when `CI` is set and
  `pnpm dev` otherwise; either way the runner waits for `/api/health` before starting.
- **`testIdAttribute` is `data-testid`**, so `page.getByTestId('site-header')` works directly.
- **`forbidOnly` in CI** — a stray `test.only` fails the run instead of silently shrinking it.
- **Two retries in CI**, `trace: 'on-first-retry'`, screenshots and video retained on failure. The
  trace file in the `playwright-report` artefact is the fastest way to debug a flake.

### Stable test ids

These exist in the DOM and are the contract between the app and the e2e suite. Changing one is a
breaking change to the tests; removing one without updating `e2e/` will fail CI.

```text
site-header        site-footer        skip-to-content
theme-toggle       locale-switcher    status-badge
hero-title         hero-cta           author-card
contact-form       contact-form-email      contact-form-submit
contact-form-error contact-form-success
```

### What belongs in e2e

Only the flows whose breakage would matter to a real visitor: `/` redirecting to `/ru`, switching
locale and staying on the same page, toggling the theme and having it survive a reload, submitting
the contact form, and the health endpoint responding. Everything else is cheaper and more precise as
a unit test.

---

## Accessibility

Two enforcement points, plus one during development:

1. **Storybook a11y addon** — axe on every story, while you build it.
2. **axe in Playwright** — `@axe-core/playwright` runs a scan on each key page in the e2e suite,
   asserting no violations. This runs on real browsers with real CSS, so it catches contrast and
   focus problems jsdom cannot see.
3. **Lighthouse CI** — accessibility category must score exactly **1.00**. No partial credit.

`eslint-plugin-jsx-a11y` runs in `strict` mode at lint time, so most markup-level mistakes never
reach a test. The `skip-to-content` link and visible focus styles are part of the contract, not a
nicety — the e2e suite asserts the skip link is reachable by keyboard.

---

## Performance budgets — Lighthouse CI

`lighthouse.yml` audits `/ru` and `/en`, three runs each on the desktop preset, against
[`lighthouserc.json`](../lighthouserc.json):

| Assertion                | Threshold |
| ------------------------ | --------- |
| Performance              | ≥ 0.90    |
| Accessibility            | = 1.00    |
| Best practices           | ≥ 0.95    |
| SEO                      | = 1.00    |
| First Contentful Paint   | ≤ 2000 ms |
| Largest Contentful Paint | ≤ 2500 ms |
| Cumulative Layout Shift  | ≤ 0.1     |
| Total Blocking Time      | ≤ 200 ms  |

Three assertions from the recommended preset are deliberately relaxed: `unused-javascript` is off
(Next.js route chunks always trip it), and `csp-xss` and `uses-long-cache-ttl` are warnings — the CSP
is set with a per-request nonce in middleware, which Lighthouse's static analysis cannot evaluate,
and caching is configured explicitly in `next.config.ts`.

When a budget fails, `pnpm analyze` is the next step: it builds with the bundle analyzer and shows
which import grew.

---

## Local gates

The husky hooks run a subset of the above, chosen so that a commit stays fast and a push stays safe:

| Hook         | Runs                                                                                                                            |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| `pre-commit` | lint-staged: ESLint `--fix` + Prettier on staged files, `tsc --noEmit` when TypeScript changed, secretlint on everything staged |
| `commit-msg` | commitlint against the Conventional Commits rules                                                                               |
| `pre-push`   | branch-name validation, then `pnpm typecheck` and `pnpm test` — the slow half of `pnpm validate`                                |

Full details in [CONTRIBUTING.md](../CONTRIBUTING.md).

---

## Related

- [architecture.md](./architecture.md) — where a test file lives inside a slice
- [ci-cd.md](./ci-cd.md) — which job runs which suite
- [conventions.md](./conventions.md) — the `test` and `e2e` commit scopes
