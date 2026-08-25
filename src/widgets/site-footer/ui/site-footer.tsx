import { useTranslations } from 'next-intl'

import { ThemeToggle } from '@/features/theme-switch'
import { CASE_STUDIES } from '@/entities/case-study'
import { NAV_SECTIONS, siteConfig } from '@/shared/config/site'
import { Link } from '@/shared/i18n/navigation'
import { Container } from '@/shared/ui'

/** Keep in sync with `Blog.items` and with `src/app/sitemap.ts`. */
const NOTE_IDS = ['n1', 'n2', 'n3'] as const

/** The footer lists the first four cases; the section above shows all of them. */
const FOOTER_CASES = CASE_STUDIES.slice(0, 4)

/**
 * Platform names, not copy: "Telegram" reads the same in every language, which
 * is why these labels live here rather than in `messages/`.
 */
const SOCIAL_LINKS = [
  { label: 'Telegram', href: siteConfig.links.telegram },
  { label: 'LinkedIn', href: siteConfig.links.linkedin },
  { label: 'Behance', href: siteConfig.links.behance },
] as const

const COLUMN_CLASSNAME = 'flex flex-col gap-3'
const COLUMN_HEADING_CLASSNAME = 'mb-1.5 text-sm font-bold'
const FOOTER_LINK_CLASSNAME = 'text-footer-muted hover:text-footer-foreground text-sm'

/**
 * The dark closing block of the page: the contact call to action, the sitemap
 * columns and the wordmark that bleeds off the bottom edge.
 *
 * It stays dark in both themes — that is the design, not an oversight — so it
 * uses the `footer-*` tokens rather than the themed surface ones. Only the
 * appearance switch inside it ships JavaScript.
 */
export function SiteFooter() {
  const t = useTranslations('Footer')
  const tNav = useTranslations('Header')
  const tWorks = useTranslations('Works')
  const tBlog = useTranslations('Blog')
  const tHero = useTranslations('Hero')

  const mailto = `mailto:${siteConfig.email}`

  return (
    <footer id="contact" data-testid="site-footer" className="bg-footer-bg text-footer-foreground">
      <Container className="pt-[clamp(70px,8vw,110px)]">
        <div className="flex flex-wrap items-start justify-between gap-12">
          <div className="max-w-[340px]">
            <h2 className="text-[clamp(22px,2vw,27px)] leading-[1.25] font-bold tracking-[-0.02em]">
              {t('cta')}
            </h2>
            <a
              href={mailto}
              className="hover:bg-brand-lime mt-[26px] inline-block rounded-sm bg-white px-5 py-3 text-[13.5px] font-semibold text-[#111110]"
            >
              {t('ctaButton')}
            </a>
          </div>

          <a
            href={mailto}
            className="hover:text-brand-lime text-[clamp(30px,6.2vw,90px)] leading-[1.05] font-bold tracking-[-0.035em] whitespace-nowrap max-[420px]:text-[24px]"
          >
            {siteConfig.email}
            {/* Punctuation, not information — a screen reader announcing
                "right arrow" after the address only gets in the way. */}
            <span aria-hidden="true"> →</span>
          </a>
        </div>

        <div className="border-footer-line mt-[clamp(56px,7vw,96px)] grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-10 border-t pt-12">
          <nav aria-labelledby="footer-menu-heading" className={COLUMN_CLASSNAME}>
            <h3 id="footer-menu-heading" className={COLUMN_HEADING_CLASSNAME}>
              {t('colMenu')}
            </h3>
            <ul className={COLUMN_CLASSNAME}>
              {NAV_SECTIONS.map((section) => (
                <li key={section.id}>
                  <a href={`#${section.id}`} className={FOOTER_LINK_CLASSNAME}>
                    {tNav(section.labelKey)}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-labelledby="footer-cases-heading" className={COLUMN_CLASSNAME}>
            <h3 id="footer-cases-heading" className={COLUMN_HEADING_CLASSNAME}>
              {t('colCases')}
            </h3>
            <ul className={COLUMN_CLASSNAME}>
              {FOOTER_CASES.map((caseStudy) => (
                <li key={caseStudy.slug}>
                  <Link href={`/cases/${caseStudy.slug}`} className={FOOTER_LINK_CLASSNAME}>
                    {tWorks(`items.${caseStudy.slug}.name`)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-labelledby="footer-blog-heading" className={COLUMN_CLASSNAME}>
            <h3 id="footer-blog-heading" className={COLUMN_HEADING_CLASSNAME}>
              {t('colBlog')}
            </h3>
            <ul className={COLUMN_CLASSNAME}>
              {NOTE_IDS.map((id) => (
                <li key={id}>
                  <Link href={`/notes/${id}`} className={FOOTER_LINK_CLASSNAME}>
                    {tBlog(`items.${id}.title`)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className={COLUMN_CLASSNAME}>
            <h3 className={COLUMN_HEADING_CLASSNAME}>{t('colContact')}</h3>
            <ul className={COLUMN_CLASSNAME}>
              <li>
                <a href={mailto} className={FOOTER_LINK_CLASSNAME}>
                  {siteConfig.email}
                </a>
              </li>
              {SOCIAL_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    className={FOOTER_LINK_CLASSNAME}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col items-start gap-3">
            <h3 className={COLUMN_HEADING_CLASSNAME}>{t('appearance')}</h3>
            <ThemeToggle />
          </div>
        </div>

        <div className="border-footer-line text-footer-faint mt-14 flex flex-wrap justify-between gap-4 border-t py-[22px] text-[12.5px]">
          <span>{t('designBy')}</span>
          {/* Rendered on the server on every request, so it cannot go stale on
              New Year. Passed as a string: an ICU number placeholder would
              render "2 026". */}
          <span>{t('copyright', { year: String(new Date().getFullYear()) })}</span>
          <span>{t('poweredBy')}</span>
        </div>
      </Container>

      {/* The wordmark is a graphic that happens to be made of letters: it is
          already the page's <h1> up in the hero, so here it is hidden from the
          accessibility tree instead of repeated as a heading. */}
      <div aria-hidden="true" className="overflow-hidden px-2">
        <div className="translate-y-[14%] text-center text-[clamp(64px,15.4vw,228px)] leading-[0.9] font-extrabold tracking-[-0.045em] whitespace-nowrap">
          {tHero('name')}
        </div>
      </div>
    </footer>
  )
}
