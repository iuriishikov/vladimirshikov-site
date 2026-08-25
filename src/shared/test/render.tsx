import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, type RenderOptions, type RenderResult } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NextIntlClientProvider } from 'next-intl'
import { ThemeProvider } from 'next-themes'
import type { ReactElement, ReactNode } from 'react'

import enMessages from '../../../messages/en.json'
import ruMessages from '../../../messages/ru.json'
import type { Locale } from '../i18n/routing'

const messagesByLocale = { ru: ruMessages, en: enMessages }

/**
 * A QueryClient with retries and background chatter disabled — a test that
 * retries a deliberately failing request just takes three times as long to fail.
 */
function makeTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: 0, refetchOnWindowFocus: false },
      mutations: { retry: false },
    },
  })
}

interface RenderWithProvidersOptions extends Omit<RenderOptions, 'wrapper'> {
  locale?: Locale
  queryClient?: QueryClient
}

interface RenderWithProvidersResult extends RenderResult {
  queryClient: QueryClient
  user: ReturnType<typeof userEvent.setup>
}

/**
 * Renders a component inside the same providers the real app mounts, so a test
 * exercises the component as it actually ships rather than in a vacuum.
 */
export function renderWithProviders(
  ui: ReactElement,
  {
    locale = 'ru',
    queryClient = makeTestQueryClient(),
    ...options
  }: RenderWithProvidersOptions = {},
): RenderWithProvidersResult {
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <NextIntlClientProvider locale={locale} messages={messagesByLocale[locale]} timeZone="UTC">
        <QueryClientProvider client={queryClient}>
          {/* The same configuration the app ships, so a test cannot pass
              against a provider the visitor never meets. `matchMedia` is
              stubbed to report "not dark" in setup.ts, which is what makes
              `system` resolve to light deterministically here. */}
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {children}
          </ThemeProvider>
        </QueryClientProvider>
      </NextIntlClientProvider>
    )
  }

  return {
    ...render(ui, { wrapper: Wrapper, ...options }),
    queryClient,
    user: userEvent.setup(),
  }
}

// `renderWithProviders` already hands back a configured `user`, so there is no
// separate userEvent re-export to get out of sync with it.
export * from '@testing-library/react'
