'use client'

import { QueryClientProvider } from '@tanstack/react-query'
import { NextIntlClientProvider, type Messages } from 'next-intl'
import { ThemeProvider } from 'next-themes'
import dynamic from 'next/dynamic'
import type { ReactNode } from 'react'
import { Toaster } from 'sonner'

import { getQueryClient } from '@/shared/api/query-client'
// From ./runtime, not ./env: this is a Client Component, and pulling in the
// validated server env here would ship zod and the whole schema to the browser.
import { isDevelopment } from '@/shared/config/runtime'
import type { Locale } from '@/shared/i18n/routing'

// Loaded as its own chunk and never requested in production, so the devtools
// cost nothing to the visitors who will never see them.
const ReactQueryDevtools = dynamic(
  async () => {
    const mod = await import('@tanstack/react-query-devtools')
    return mod.ReactQueryDevtools
  },
  { ssr: false },
)

interface AppProvidersProps {
  children: ReactNode
  locale: Locale
  messages: Messages
  /**
   * The per-request CSP nonce. next-themes applies the stored theme from a
   * blocking inline script; without the nonce that script is refused by the
   * policy and the visitor sees a flash of the wrong theme before hydration.
   */
  nonce: string | undefined
}

/**
 * Every client-side context the app needs, in one place.
 *
 * `children` arrives as an already-rendered Server Component tree, so wrapping
 * the app in client providers does not drag the whole page into the client
 * bundle.
 */
export function AppProviders({ children, locale, messages, nonce }: AppProvidersProps) {
  // Not `new QueryClient()` inline: that would create a fresh cache on every
  // render and quietly refetch everything.
  const queryClient = getQueryClient()

  return (
    <NextIntlClientProvider locale={locale} messages={messages} timeZone="UTC">
      <QueryClientProvider client={queryClient}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          // Spread rather than passed directly: `exactOptionalPropertyTypes`
          // rejects an explicit `undefined` for an optional prop.
          {...(nonce === undefined ? {} : { nonce })}
        >
          {children}
          <Toaster richColors closeButton position="bottom-right" />
          {isDevelopment && <ReactQueryDevtools initialIsOpen={false} />}
        </ThemeProvider>
      </QueryClientProvider>
    </NextIntlClientProvider>
  )
}
