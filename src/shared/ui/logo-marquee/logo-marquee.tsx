'use client'

import { useEffect, useRef, type ReactNode } from 'react'

import { cn } from '../../lib/cn'

/**
 * How many times the list is repeated inside the track.
 *
 * The loop is seamless because the animation translates by exactly one copy's
 * width (100 / COPIES percent). Three copies also guarantee the track is wider
 * than any realistic viewport for the eight-item lists this is used with, so no
 * gap ever appears at the trailing edge.
 */
const COPIES = 3

export interface MarqueeItem {
  /** Stable identity for the item, repeated across every copy of the track. */
  key: string
  content: ReactNode
}

interface LogoMarqueeProps {
  items: readonly MarqueeItem[]
  /** Pixels per second. */
  speed?: number
  direction?: 'left' | 'right'
  /** Gap around the diamond separator, in pixels. */
  gap?: number
  className?: string
}

/**
 * An endlessly scrolling row of names.
 *
 * Driven by a CSS animation rather than requestAnimationFrame: the compositor
 * runs it off the main thread, it keeps going while React is busy, and it stops
 * on its own for visitors who asked for reduced motion — the global media query
 * in globals.css neutralises the animation without this component knowing.
 *
 * Only the first copy is exposed to assistive technology; the rest are padding.
 */
export function LogoMarquee({
  items,
  speed = 55,
  direction = 'left',
  gap = 34,
  className,
}: LogoMarqueeProps) {
  const trackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const track = trackRef.current
    if (!track) return

    // Duration is derived from the rendered width so `speed` stays honest in
    // px/s whatever the font, the locale or the viewport does to the text.
    const setDuration = (): void => {
      const cycleWidth = track.scrollWidth / COPIES
      if (!cycleWidth) return
      track.style.setProperty('--marquee-duration', `${String(cycleWidth / speed)}s`)
    }

    setDuration()

    const observer = new ResizeObserver(setDuration)
    observer.observe(track)
    return () => {
      observer.disconnect()
    }
  }, [speed, items])

  return (
    <div className={cn('overflow-hidden', className)}>
      <div
        ref={trackRef}
        data-testid="marquee-track"
        className="animate-marquee flex w-max items-center will-change-transform"
        style={{ animationDirection: direction === 'right' ? 'reverse' : 'normal' }}
      >
        {Array.from({ length: COPIES }, (_, copy) => (
          <div
            key={copy}
            className="flex items-center"
            // The duplicates exist for the visual loop only.
            aria-hidden={copy > 0 ? 'true' : undefined}
          >
            {items.map((item) => (
              <div key={item.key} className="flex flex-none items-center">
                <div className="flex flex-none items-center">{item.content}</div>
                <span
                  aria-hidden="true"
                  className="size-[7px] flex-none rotate-45 bg-current opacity-80"
                  style={{ marginInline: `${String(gap)}px` }}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
