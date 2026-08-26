'use client'

import { useTheme } from 'next-themes'
import { useEffect, useRef } from 'react'

import { cn } from '../../lib/cn'
import { drawAvatar } from './lib/draw-avatar'
import { drawBust } from './lib/draw-bust'
import { drawTile } from './lib/draw-tile'
import { createRandom } from './lib/random'

export type SketchVariant = 'bust' | 'avatar' | 'tile'

interface PencilSketchProps {
  variant?: SketchVariant
  /** Same seed, same drawing — see `createRandom`. */
  seed?: number
  /** Multiplies the stroke count on the bust. Below 1 draws faster and lighter. */
  density?: number
  className?: string
}

/**
 * A pencil drawing generated on a canvas at render time.
 *
 * It is a stand-in for photography that does not look like a stand-in: no
 * asset to ship, no layout shift while it loads, and it re-inks itself when the
 * theme flips because the stroke colour comes from the `--sketch-ink` token.
 *
 * Purely decorative, hence `aria-hidden`: a screen reader has nothing to gain
 * from "canvas", and every one of these sits next to real text.
 */
export function PencilSketch({
  variant = 'bust',
  seed = 7,
  density = 1,
  className,
}: PencilSketchProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  // Redraw when the theme changes — the ink colour is a themed token.
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const draw = (): void => {
      const width = canvas.clientWidth
      const height = canvas.clientHeight
      if (!width || !height) return

      // Cap the pixel ratio at 2: beyond that the extra strokes cost more than
      // they show on a drawing made of 1px lines.
      const ratio = Math.min(globalThis.devicePixelRatio || 1, 2)
      const pixelWidth = Math.trunc(width * ratio)
      const pixelHeight = Math.trunc(height * ratio)
      if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
        canvas.width = pixelWidth
        canvas.height = pixelHeight
      }

      const context = canvas.getContext('2d')
      if (!context) return

      context.setTransform(ratio, 0, 0, ratio, 0, 0)
      context.clearRect(0, 0, width, height)
      context.lineCap = 'round'
      context.lineJoin = 'round'
      context.strokeStyle =
        getComputedStyle(document.documentElement).getPropertyValue('--sketch-ink').trim() ||
        '#2b2925'

      // The variant contributes to the seed so the same number produces a
      // different face and a different tile.
      const random = createRandom(seed * 7919 + variant.length * 131)

      if (variant === 'bust') drawBust(context, random, width, height, Math.max(0.3, density))
      else if (variant === 'avatar') drawAvatar(context, random, width, height, seed)
      else drawTile(context, random, width, height, seed)
    }

    draw()

    const observer = new ResizeObserver(draw)
    observer.observe(canvas)
    return () => {
      observer.disconnect()
    }
  }, [variant, seed, density, resolvedTheme])

  return (
    <canvas
      ref={canvasRef}
      // Hidden from assistive technology, so there is no role to query it by —
      // the test id is the only handle a test has.
      data-testid="pencil-sketch"
      aria-hidden="true"
      className={cn('block h-full w-full', className)}
    />
  )
}
