import type { ReactNode } from 'react'

import { cn } from '@/shared/lib/cn'

import type { ServiceId } from '../model/service-ids'

const TILE = 'flex size-[62px] shrink-0 items-center justify-center rounded-lg'
const GLYPH = 'text-[24px] leading-none font-extrabold'

/**
 * `#111110` rather than `text-foreground`: these two tiles keep their brand
 * colour in both themes, so a glyph that followed the theme would turn near
 * white on lime and vanish.
 */
const DARK_GLYPH = 'text-[#111110]'

/**
 * The decorative tile pair that closes each service row, keyed by service id.
 *
 * Every pair is a coloured initial next to a black tile carrying a bare shape,
 * so the set reads as one family rather than four unrelated marks.
 */
export const SERVICE_ICONS: Record<ServiceId, ReactNode> = {
  s1: (
    <>
      <div className={cn(TILE, GLYPH, 'bg-brand-blue text-white')}>B</div>
      <div className={cn(TILE, 'bg-brand-black')}>
        <div className="size-[22px] rounded-full border-2 border-white" />
      </div>
    </>
  ),
  s2: (
    <>
      <div className={cn(TILE, GLYPH, DARK_GLYPH, 'bg-brand-lime')}>P</div>
      <div className={cn(TILE, 'bg-brand-black')}>
        <div className="size-[20px] rotate-45 border-2 border-white" />
      </div>
    </>
  ),
  s3: (
    <>
      <div className={cn(TILE, GLYPH, 'bg-brand-red text-white')}>W</div>
      <div className={cn(TILE, 'bg-brand-black gap-[5px]')}>
        <div className="h-[24px] w-[5px] bg-white" />
        <div className="h-[24px] w-[5px] bg-white" />
      </div>
    </>
  ),
  s4: (
    <>
      <div className={cn(TILE, GLYPH, DARK_GLYPH, 'bg-brand-lavender')}>D</div>
      <div className={cn(TILE, 'bg-brand-black')}>
        <div className="size-[20px] rounded-[4px] border-2 border-white" />
      </div>
    </>
  ),
}
