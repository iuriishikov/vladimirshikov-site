import { setupServer } from 'msw/node'

import { handlers } from './handlers'

/**
 * Node-side request interceptor, started once in `src/shared/test/setup.ts`.
 *
 * Only the Node interceptor is used — there is no service worker in `public/`,
 * which is why `msw` is denied build scripts in pnpm-workspace.yaml.
 */
export const server = setupServer(...handlers)
