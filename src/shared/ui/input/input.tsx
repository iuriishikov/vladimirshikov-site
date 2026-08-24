import type { ComponentProps } from 'react'

import { cn } from '../../lib/cn'

export type InputProps = ComponentProps<'input'>

/**
 * A plain input with the project's field styling.
 *
 * The invalid state is driven by `aria-invalid` rather than a `hasError` prop:
 * the attribute is what a screen reader announces, so tying the visual state to
 * it makes the two impossible to get out of sync.
 */
export function Input({ className, type = 'text', ...props }: InputProps) {
  return (
    <input
      type={type}
      className={cn(
        'border-input bg-background flex h-10 w-full rounded-md border px-3 py-2 text-sm',
        'placeholder:text-muted-foreground',
        'focus-visible:ring-ring/60 focus-visible:border-ring outline-none focus-visible:ring-2',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'aria-[invalid=true]:border-destructive aria-[invalid=true]:ring-destructive/30',
        'aria-[invalid=true]:focus-visible:ring-destructive/40',
        className,
      )}
      {...props}
    />
  )
}
