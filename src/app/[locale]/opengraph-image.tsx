import { hasLocale } from 'next-intl'
import { getTranslations } from 'next-intl/server'
import { ImageResponse } from 'next/og'

import { env } from '@/shared/config/env'
import { siteConfig } from '@/shared/config/site'
import { routing } from '@/shared/i18n/routing'

/**
 * The social preview card, rendered per locale at request time.
 *
 * Next picks this up by file convention and injects the resulting `og:image`
 * tag into every page below this segment, with the right absolute URL and
 * dimensions — which is why `buildPageMetadata` deliberately does not set one.
 *
 * Only system fonts are used: fetching a webfont here would make the build
 * depend on a font CDN being reachable.
 */
export const alt = siteConfig.name
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

interface OpengraphImageProps {
  params: Promise<{ locale: string }>
}

export default async function OpengraphImage({ params }: OpengraphImageProps) {
  const { locale } = await params
  const resolved = hasLocale(routing.locales, locale) ? locale : routing.defaultLocale
  const t = await getTranslations({ locale: resolved, namespace: 'Metadata.home' })

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 80,
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1c1f33 100%)',
        color: '#ffffff',
        fontFamily: 'sans-serif',
      }}
    >
      <div style={{ display: 'flex', fontSize: 28, opacity: 0.7, letterSpacing: 2 }}>
        {env.SITE_URL.replace(/^https?:\/\//u, '')}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ display: 'flex', fontSize: 72, fontWeight: 700, lineHeight: 1.1 }}>
          {t('title')}
        </div>
        <div style={{ display: 'flex', fontSize: 32, opacity: 0.8, lineHeight: 1.4 }}>
          {t('description')}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 26, opacity: 0.7 }}>
        <div
          style={{
            display: 'flex',
            width: 12,
            height: 12,
            borderRadius: 999,
            background: '#6ea8fe',
          }}
        />
        {resolved.toUpperCase()}
      </div>
    </div>,
    size,
  )
}
