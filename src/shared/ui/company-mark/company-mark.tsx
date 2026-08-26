import Image from 'next/image'

import { COMPANY_LOGOS, type CompanySlug } from '../../config/company-logos'
import { cn } from '../../lib/cn'

interface CompanyMarkProps {
  slug: CompanySlug
  /**
   * The company's name. Translated, so it arrives from the caller. It is the
   * accessible name of the logo, and the visible mark when there is no logo.
   */
  name: string
  /** Height of the box the mark is fitted into, in pixels. */
  height?: number
  /**
   * `ink` sits on the page and follows the theme. `light` is for a mark laid
   * over a saturated cover, where it is always white.
   */
  tone?: 'ink' | 'light'
  className?: string
}

/**
 * One client mark, flattened to a single colour.
 *
 * Every logo arrives in its own palette, from a dozen sources, half of them
 * raster. `brightness(0)` collapses each one to a silhouette, so the row reads
 * as one set rather than as a sticker album — which is also the treatment a
 * client wall conventionally gets.
 *
 * Five of the eighteen companies have no mark that could be sourced in a usable
 * form. Those are set as wordmarks in the site's own type at the same optical
 * size, which is a normal thing for a client wall to do and much better than a
 * gap or a guessed logo.
 */
export function CompanyMark({
  slug,
  name,
  height = 30,
  tone = 'ink',
  className,
}: CompanyMarkProps) {
  const logo = COMPANY_LOGOS[slug]

  if (!logo) {
    return (
      <span
        className={cn('font-semibold tracking-[-0.02em] whitespace-nowrap', className)}
        // Matched to the logos' cap height rather than to the box: type set to
        // the full box height would tower over the marks beside it.
        style={{ fontSize: `${String(Math.round(height * 0.68))}px` }}
      >
        {name}
      </span>
    )
  }

  const boxHeight = Math.round(height * (logo.scale ?? 1))
  const boxWidth = Math.round(boxHeight * (logo.width / logo.height))

  return (
    <Image
      src={logo.src}
      alt={name}
      width={boxWidth}
      height={boxHeight}
      // Served straight from `public`: these are already minimal, and the
      // optimiser does not process SVG without being told to allow it.
      unoptimized
      className={cn(
        'w-auto brightness-0',
        tone === 'light' ? 'invert' : 'opacity-70 dark:invert',
        className,
      )}
      style={{ height: `${String(boxHeight)}px` }}
    />
  )
}
