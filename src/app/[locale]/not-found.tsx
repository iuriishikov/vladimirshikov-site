import { useTranslations } from 'next-intl'

import { Link } from '@/shared/i18n/navigation'
import { Button, Container } from '@/shared/ui'

/**
 * Written out rather than translated: an HTTP status code is a protocol
 * constant, and all forty editions are set in Latin or Cyrillic, so the digits
 * read the same in every one of them.
 */
const STATUS_CODE = '404'

/**
 * One line of the ledger — ordinal, field, value — on the same ordinal gutter
 * the services and education rows fold to below 860px, so all three ledgers on
 * this site collapse in step.
 */
const ROW_CLASSNAME = [
  'border-border grid grid-cols-[52px_1fr_auto] items-baseline gap-4 border-b px-1 py-[18px]',
  'max-[860px]:grid-cols-[44px_1fr]',
].join(' ')

const ORDINAL_CLASSNAME = 'text-faint text-[14px] font-medium'
const FIELD_CLASSNAME = 'text-[15px] font-semibold tracking-[-0.01em]'

/** The fields the ledger would carry, in the order it carries them. */
const FIELDS = ['section', 'entry'] as const

/**
 * Rendered for any unmatched path inside a locale segment, and by an explicit
 * `notFound()` call. It stays inside the locale layout, so it is translated and
 * keeps the site's header and footer.
 *
 * The page is built out of the site's own numbering. Services, education and
 * the edition index all run [01] [02] [03]; every case cover carries its
 * ordinal. A 404 is the one address with no number — so this is that ledger
 * with the entry missing: the number drawn hollow the way the covers draw
 * theirs, two fields that cannot be filled in, and the rules carrying on into
 * nothing underneath.
 *
 * Nothing here needs the browser, so nothing here ships to it.
 */
export default function LocaleNotFound() {
  const t = useTranslations('NotFound')

  return (
    <Container className="pt-[clamp(36px,5vw,72px)] pb-[clamp(80px,10vw,150px)]">
      {/*
       * The ordinal, drawn hollow — the outline numeral from the case covers at
       * the scale the hero and the footer wordmark set. It is a graphic made of
       * digits, and the ledger below states 404 in text, so it is hidden rather
       * than announced twice.
       *
       * The stroke is sized in `em` so it thickens with the clamp instead of
       * thinning to a hairline at 268px, and it is the same optical weight the
       * covers use (1.5px at ~120px). Where `-webkit-text-stroke` is not
       * understood the numeral does not paint, which costs a decoration and
       * nothing else — the heading carries the meaning.
       */}
      <div
        aria-hidden="true"
        className="text-[clamp(88px,20vw,268px)] leading-[0.86] font-extrabold tracking-[-0.05em] text-transparent"
        style={{ WebkitTextStroke: '0.015em var(--foreground-soft)' }}
      >
        [{STATUS_CODE}]
      </div>

      {/*
       * `auto-fit` rather than a breakpoint, the same as the case page: the
       * statement and the ledger sit side by side until the narrower of them
       * can no longer hold 340px.
       */}
      <div className="mt-[clamp(28px,4vw,52px)] grid grid-cols-[repeat(auto-fit,minmax(min(100%,340px),1fr))] items-start gap-x-[72px] gap-y-[clamp(40px,5vw,64px)]">
        <div>
          <h1 className="max-w-[14ch] text-[clamp(32px,4.4vw,58px)] leading-[1.06] font-bold tracking-[-0.03em]">
            {t('title')}
          </h1>

          <p className="text-muted-foreground mt-6 max-w-[420px] text-[16px] leading-[1.65]">
            {t('description')}
          </p>

          {/* The only way out, and the same control the case and essay pages go
              back with — arriving at a dead end should not introduce a new
              button. The footer already carries the rest of the sitemap. */}
          <Button asChild size="lg" className="mt-[clamp(32px,4vw,48px)]">
            <Link href="/">{t('backHome')}</Link>
          </Button>
        </div>

        <ol className="border-border border-t">
          {FIELDS.map((field, index) => (
            <li key={field} className={ROW_CLASSNAME}>
              {/* The bracketed ordinal only restates the list's own numbering. */}
              <span aria-hidden="true" className={ORDINAL_CLASSNAME}>
                [{String(index + 1).padStart(2, '0')}]
              </span>
              <span className={FIELD_CLASSNAME}>{t(`record.${field}`)}</span>
              {/* The dash is the null mark the questions list rules its rows
                  with; the word behind it is what a screen reader hears, since
                  an em dash alone announces as nothing at all. */}
              <span className="text-faint text-[15px] max-[860px]:col-start-2">
                <span aria-hidden="true">—</span>
                <span className="sr-only">{t('record.none')}</span>
              </span>
            </li>
          ))}

          <li className={ROW_CLASSNAME}>
            <span aria-hidden="true" className={ORDINAL_CLASSNAME}>
              [03]
            </span>
            <span className={FIELD_CLASSNAME}>{t('record.status')}</span>
            {/* The page spends the site's one accent exactly once, on the only
                field this address can answer. Ink on lime, both fixed brand
                values rather than themed surfaces, so the mark reads the same
                in light and dark. */}
            <span className="bg-brand-lime rounded-sm px-2 py-[3px] text-[13px] font-semibold text-[#111110] max-[860px]:col-start-2 max-[860px]:justify-self-start">
              {STATUS_CODE}
            </span>
          </li>

          {/*
           * The ledger goes on ruling lines past the last field it can fill in.
           * That is the whole page in one gesture — and it is drawing rather
           * than content, so it stays out of the accessibility tree.
           *
           * Built from the same row class as the filled rows rather than a
           * guessed height: a blank rule that is two pixels off the rhythm it
           * is imitating reads as a mistake instead of as an ending.
           */}
          {[70, 40, 18].map((opacity) => (
            <li
              key={opacity}
              aria-hidden="true"
              className={ROW_CLASSNAME}
              style={{ opacity: opacity / 100 }}
            >
              <span className={ORDINAL_CLASSNAME}>&nbsp;</span>
              <span className={FIELD_CLASSNAME}>&nbsp;</span>
              <span />
            </li>
          ))}
        </ol>
      </div>
    </Container>
  )
}
