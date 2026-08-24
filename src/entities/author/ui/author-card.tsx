import { useTranslations } from 'next-intl'

import { cn } from '@/shared/lib/cn'

import { author } from '../model/author'

interface AuthorCardProps {
  className?: string
}

/**
 * A Server Component: it renders once on the server and ships no JavaScript.
 * `useTranslations` works here because next-intl resolves messages during the
 * server render.
 */
export function AuthorCard({ className }: AuthorCardProps) {
  const t = useTranslations('AuthorCard')

  return (
    <article
      data-testid="author-card"
      className={cn(
        'bg-card text-card-foreground border-border rounded-xl border p-6 shadow-sm',
        className,
      )}
    >
      <div className="flex items-center gap-4">
        <span
          aria-hidden="true"
          className="bg-primary text-primary-foreground flex size-12 items-center justify-center rounded-full text-lg font-semibold"
        >
          {author.initials}
        </span>
        <div>
          <h2 className="text-lg font-semibold">{author.name}</h2>
          <p className="text-muted-foreground text-sm">{t('role')}</p>
        </div>
      </div>

      <p className="mt-4 text-sm leading-relaxed">{t('bio')}</p>

      <dl className="text-muted-foreground mt-4 flex gap-6 text-sm">
        <div>
          <dt className="sr-only">{t('sinceLabel')}</dt>
          <dd>
            {t('sinceLabel')} {author.since}
          </dd>
        </div>
        <div>
          <dt className="sr-only">{t('location')}</dt>
          <dd>{t('location')}</dd>
        </div>
      </dl>

      {author.links.length > 0 && (
        <ul className="mt-4 flex gap-4 text-sm">
          {author.links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="text-primary underline-offset-4 hover:underline"
                rel="me noreferrer"
                target="_blank"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </article>
  )
}
