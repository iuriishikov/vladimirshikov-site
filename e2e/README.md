# End-to-end tests

Playwright specs that drive the real site in a real browser. They are the last gate before a
release: everything below them (unit tests, type checking, lint) can pass while the assembled page
is still broken.

Configuration lives in [`playwright.config.ts`](../playwright.config.ts) at the repository root —
not in this folder.

## Running

```bash
pnpm e2e:install          # one-off: download the Chromium build and its OS dependencies
pnpm e2e                  # the whole suite, every project
pnpm e2e --project=chromium
pnpm e2e e2e/home.spec.ts
pnpm e2e -g "skip link"   # only tests whose title matches
```

`pnpm e2e:install` fetches Chromium only, which is what CI needs. To run the Firefox, WebKit and
mobile-safari projects locally, install the rest once:

```bash
pnpm exec playwright install
```

You do not need to start the app yourself. The `webServer` block boots one for you — `pnpm dev`
locally, `pnpm start` in CI, so CI exercises the production build that actually ships. An already
running dev server on port 3000 is reused locally; set `PLAYWRIGHT_BASE_URL` to point the suite at
a deployed environment instead:

```bash
PLAYWRIGHT_BASE_URL=https://staging.example.com pnpm e2e
```

## Debugging a failure

| Command                                 | What it gives you                                             |
| --------------------------------------- | ------------------------------------------------------------- |
| `pnpm e2e:ui`                           | The UI mode: pick tests, watch them run, step through actions |
| `pnpm e2e --debug`                      | Playwright Inspector, paused before the first action          |
| `pnpm e2e --headed --project=chromium`  | Watch it happen in a visible browser                          |
| `pnpm exec playwright show-report`      | The HTML report from the last run                             |
| `pnpm exec playwright show-trace <zip>` | A recorded trace: DOM snapshots, network, console per step    |

Traces are captured on the first retry (`trace: 'on-first-retry'`), screenshots and video only on
failure, and everything lands in `test-results/`. A failed accessibility scan additionally attaches
`axe-violations.txt` — the failing selectors and the Deque rule documentation URL — and annotates
the test with one line per violated rule.

Locally there are no retries, so a flaky test fails immediately rather than hiding behind a rerun.
Force the CI behaviour with `CI=1 pnpm e2e` when you are chasing one.

## Adding a spec

1. Create `e2e/<area>.spec.ts` and import from the local fixture, never from `@playwright/test`
   directly — that is what makes `a11yScan` and the shared `routes` available:

   ```ts
   import { expect, routes, test } from './fixtures/test'
   ```

2. Wrap the tests in a `test.describe` named after the behaviour under test, not after the
   component that implements it.

3. Add any new URL to `routes` in [`fixtures/test.ts`](./fixtures/test.ts) rather than inlining it,
   so a moved page is a one-line change.

### House rules

- **Never assert on visible copy.** The Russian and English text will change; the structure will
  not. Assert on `getByTestId`, `getByRole`, attributes and URLs.
- **Prefer `getByTestId` and `getByRole` over CSS selectors.** A CSS selector needs a written
  justification — matching a link by its `href` is one, matching by class name is not.
- **Web-first assertions only.** `await expect(locator).toBeVisible()` retries until the timeout;
  reading a value first and asserting on it afterwards does not, and turns every slow render into a
  flake.
- **No `waitForTimeout`.** If something needs waiting for, assert on it. `expect.poll()` covers the
  cases where the thing being observed is not a locator.
- **Every test is independent.** Tests run fully parallel across four browser projects; a test that
  depends on another having run first will fail in a way that looks random.
- **Add an `a11yScan` to `a11y.spec.ts` for every new page.** A page that is not scanned is a page
  where accessibility regressions land silently.
