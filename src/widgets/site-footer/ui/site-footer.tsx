import { useTranslations } from 'next-intl'

import { author } from '@/entities/author'
import { Container } from '@/shared/ui'

export function SiteFooter() {
  const t = useTranslations('Footer')
  // Rendered on the server on every request, so it cannot go stale on New Year.
  const year = new Date().getFullYear()

  return (
    <footer data-testid="site-footer" className="border-border mt-auto border-t py-8">
      <Container className="text-muted-foreground flex flex-col gap-2 text-sm sm:flex-row sm:items-center sm:justify-between">
        {/* Passed as a string: an ICU number placeholder would render "2 026". */}
        <p>{t('rights', { year: String(year) })}</p>

        <div className="flex items-center gap-4">
          <p>{t('builtWith')}</p>
          {author.links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              rel="me noreferrer"
              target="_blank"
              className="hover:text-foreground underline-offset-4 hover:underline"
            >
              {link.label}
            </a>
          ))}
        </div>
      </Container>
    </footer>
  )
}
