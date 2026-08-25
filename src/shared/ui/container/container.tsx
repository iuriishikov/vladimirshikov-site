import type { ComponentProps, ElementType } from 'react'

import { cn } from '../../lib/cn'

interface ContainerProps extends ComponentProps<'div'> {
  /** Render as `<main>`, `<section>`, `<footer>` … Defaults to `<div>`. */
  as?: ElementType
}

/**
 * The single horizontal rhythm of the site: a 1440px measure with a gutter that
 * grows with the viewport. Every page-level block goes through it, so changing
 * the width or the gutter is one edit rather than a search.
 */
export function Container({ as: Component = 'div', className, ...props }: ContainerProps) {
  return (
    <Component
      className={cn('mx-auto w-full max-w-[1440px] px-[clamp(20px,4vw,48px)]', className)}
      {...props}
    />
  )
}
