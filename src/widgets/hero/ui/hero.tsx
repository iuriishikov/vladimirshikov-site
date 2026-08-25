import { ArrowRightIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { siteConfig } from '@/shared/config/site'
import { Link } from '@/shared/i18n/navigation'
import { Button, Container } from '@/shared/ui'

export function Hero() {
  const t = useTranslations('Hero')

  return (
    <section className="py-16 sm:py-24">
      <Container>
        <p className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
          {t('eyebrow')}
        </p>

        {/* The page's single h1. Every other heading on the page is an h2. */}
        <h1
          data-testid="hero-title"
          className="mt-3 text-4xl font-semibold tracking-tight text-balance sm:text-5xl"
        >
          {t('title')}
        </h1>

        <p className="text-muted-foreground mt-4 max-w-2xl text-lg text-pretty">{t('subtitle')}</p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild size="lg" data-testid="hero-cta">
            <Link href="/about">
              {t('cta')}
              <ArrowRightIcon aria-hidden="true" />
            </Link>
          </Button>

          <Button asChild size="lg" variant="outline">
            <a href={siteConfig.links.github} target="_blank" rel="noreferrer">
              {t('secondaryCta')}
            </a>
          </Button>
        </div>
      </Container>
    </section>
  )
}
