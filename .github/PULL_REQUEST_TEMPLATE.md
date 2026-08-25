<!--
The title of this pull request becomes the squash-merge commit message, so it
must be a valid Conventional Commit:

    <type>(<scope>): <subject>

  type   feat fix perf refactor docs test build ci chore style revert
  scope  app views widgets features entities shared | i18n seo a11y ui config
         deps ci docker docs test e2e release security
  subject imperative, lower case, no trailing period, ≤ 100 chars in total

Example: feat(features): add contact form with server-side validation
-->

## What changed

<!-- One or two sentences. What does the site do now that it did not before? -->

## Why

<!--
The reason, not the mechanism. Link the issue if there is one:
Closes #123
-->

## How to verify

<!--
The exact steps a reviewer runs to see it work. Include the route
(/ru/…, /en/…) when the change is user-visible.

1. pnpm dev
2. Open http://localhost:3000/ru
3. …
-->

## Screenshots

<!--
Required for any visible change. Include light and dark themes, and both
locales when the layout depends on text length.
-->

## Checklist

- [ ] `pnpm validate` passes locally (format, lint, typecheck, unit tests)
- [ ] The branch name matches `<type>/<kebab-case>` and is based on `develop`
- [ ] New or changed behaviour is covered by a test
- [ ] Imports respect the FSD layer order (`app > views > widgets > features > entities > shared`) and cross-slice imports go through a slice's `index.ts`
- [ ] User-visible strings exist in both `ru` and `en`
- [ ] Interactive elements are reachable by keyboard and carry an accessible name
- [ ] New environment variables are declared in `src/shared/config/env.ts` and in `.env.example`
- [ ] No secret, token or personal data is added to the repository

## Risk and rollback

<!--
What breaks if this is wrong, and how it is undone. For most changes:
"Low — revert this commit." For a deploy-affecting change, name the image tag
to roll back to via the Rollback workflow.
-->
