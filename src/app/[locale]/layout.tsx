import type { Metadata, Viewport } from 'next'
import { hasLocale } from 'next-intl'
import { getMessages, getTranslations } from 'next-intl/server'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'

import { SiteFooter } from '@/widgets/site-footer'
import { SiteHeader } from '@/widgets/site-header'
import { fontVariables } from '@/shared/config/fonts'
import { siteConfig } from '@/shared/config/site'
import { routing } from '@/shared/i18n/routing'
import { buildPageMetadata } from '@/shared/lib/seo'
import { SkipLink } from '@/shared/ui'

import { AppProviders } from '../_providers/app-providers'

import '../_styles/globals.css'

const MAIN_CONTENT_ID = 'main-content'

interface LocaleLayoutProps {
  children: ReactNode
  params: Promise<{ locale: string }>
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: siteConfig.themeColor.light },
    { media: '(prefers-color-scheme: dark)', color: siteConfig.themeColor.dark },
  ],
  colorScheme: 'light dark',
}

export async function generateMetadata({ params }: LocaleLayoutProps): Promise<Metadata> {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()

  const t = await getTranslations({ locale, namespace: 'Metadata.home' })

  return {
    ...buildPageMetadata({ locale, title: t('title'), description: t('description') }),
    title: {
      default: t('title'),
      template: `%s ${siteConfig.titleSeparator} ${siteConfig.name}`,
    },
  }
}

/**
 * This is the application's root layout: with every route living under
 * `[locale]`, there is no layout above it. It therefore owns `<html>`/`<body>`.
 */
export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params

  // `locale` is whatever was in the URL — validate before trusting it.
  if (!hasLocale(routing.locales, locale)) notFound()

  const messages = await getMessages({ locale })
  const t = await getTranslations({ locale, namespace: 'Common' })

  // Published by src/proxy.ts alongside the Content-Security-Policy. Any inline
  // script this app renders itself has to carry it, or the policy refuses it.
  const requestHeaders = await headers()
  const nonce = requestHeaders.get('x-nonce') ?? undefined

  return (
    // next-themes writes `class="dark"` onto <html> before React hydrates, so
    // the server markup and the first client render legitimately differ here.
    <html lang={locale} className={fontVariables} suppressHydrationWarning>
      <body className="flex min-h-dvh flex-col antialiased">
        <AppProviders locale={locale} messages={messages} nonce={nonce}>
          <SkipLink targetId={MAIN_CONTENT_ID}>{t('skipToContent')}</SkipLink>
          <SiteHeader />
          {/* tabIndex={-1} makes the skip link's target focusable, which is
              what actually moves the keyboard caret past the navigation. */}
          <main id={MAIN_CONTENT_ID} tabIndex={-1} className="flex-1 outline-none">
            {children}
          </main>
          <SiteFooter />
        </AppProviders>
      </body>
    </html>
  )
}
