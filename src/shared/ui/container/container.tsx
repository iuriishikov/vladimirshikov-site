import type { ComponentProps, ElementType } from 'react'

import { cn } from '../../lib/cn'

interface ContainerProps extends ComponentProps<'div'> {
  /** Render as `<main>`, `<section>`, `<footer>` … Defaults to `<div>`. */
  as?: ElementType
}

/**
 * The single horizontal rhythm of the site. Every page-level block goes through
 * it, so changing the max width or the gutter is one edit rather than a search.
 */
export function Container({ as: Component = 'div', className, ...props }: ContainerProps) {
  return (
    <Component
      className={cn('mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8', className)}
      {...props}
    />
  )
}
