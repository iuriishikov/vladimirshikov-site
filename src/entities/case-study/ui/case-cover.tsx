import { cn } from '@/shared/lib/cn'
import { CompanyMark } from '@/shared/ui'

import type { CaseStudy } from '../model/case-studies'

interface CaseCoverProps {
  caseStudy: CaseStudy
  /** Small print in the corner — translated, so it arrives from the caller. */
  caption: string
}

/**
 * The coloured panel that stands in for a case's artwork.
 *
 * The small print is fully opaque, where the canvas fades it to 65% and 55%.
 * Measured with axe, the translucent versions sit at 3.5:1 on their own
 * backgrounds — under the 4.5:1 that 12.5px text needs — and on the red cover
 * even solid white only reaches 4.34:1, which is why `--brand-red` is a shade
 * darker than the canvas as well. Together the two changes take the page to
 * zero violations while reading as the same design.
 */
export function CaseCover({ caseStudy, caption }: CaseCoverProps) {
  const {
    company,
    index,
    wordmark,
    background,
    ink,
    layout,
    decoration,
    decorationText,
    badge,
    captionSide,
    wordmarkTone,
  } = caseStudy

  const isLightInk = ink === 'light'
  const inkClass = isLightInk ? 'text-white' : 'text-[#111110]'
  const strokeColor = isLightInk ? '#ffffff' : 'rgba(17,17,16,.8)'

  return (
    <div
      data-testid="case-cover"
      className="relative aspect-[4/3.1] overflow-hidden rounded-xl transition-transform duration-500 ease-[cubic-bezier(.2,.6,.2,1)] group-hover:scale-[1.015]"
      // `backgroundColor`, not the `background` shorthand: it says exactly what
      // is being set, and jsdom cannot round-trip the shorthand in tests.
      style={{ backgroundColor: background }}
    >
      {decoration === 'ring' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="aspect-square w-[56%] rounded-full border-[1.5px] border-white/45" />
        </div>
      )}

      {(decoration === 'outline-number-right' || decoration === 'outline-number-left') && (
        <div
          aria-hidden="true"
          className={cn(
            'absolute -top-[10px] text-[clamp(80px,9vw,120px)] leading-none font-extrabold tracking-[-0.04em] text-transparent',
            decoration === 'outline-number-right' ? 'right-5' : 'left-5',
          )}
          style={{ WebkitTextStroke: `1.5px ${strokeColor}` }}
        >
          {decorationText}
        </div>
      )}

      <div
        className={cn(
          'absolute inset-0 flex px-6 text-[clamp(38px,4.4vw,60px)] font-extrabold tracking-[-0.03em]',
          layout === 'center' ? 'items-center justify-center' : 'items-end justify-start pb-14',
          wordmarkTone === 'lime' ? 'text-brand-lime' : inkClass,
        )}
      >
        {/* The client's own mark when there is one; the wordmark names the
            company either way, so it carries over as the alternative text. */}
        {company ? (
          <CompanyMark
            slug={company}
            name={wordmark}
            height={78}
            tone={isLightInk ? 'light' : 'ink'}
            className="max-w-full"
          />
        ) : (
          <span className="max-w-full truncate">{wordmark}</span>
        )}
      </div>

      <div className={cn('absolute top-5 left-6 text-[13px] font-medium', inkClass)}>{index}</div>

      {badge !== undefined && (
        <div className={cn('absolute top-5 right-6 text-[13px] font-medium', inkClass)}>
          {badge}
        </div>
      )}

      <div
        className={cn(
          'absolute bottom-5 max-w-[70%] text-[12.5px]',
          inkClass,
          captionSide === 'left' ? 'left-6' : 'right-6 text-right',
        )}
      >
        {caption}
      </div>
    </div>
  )
}
