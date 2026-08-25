import { Label as LabelPrimitive } from 'radix-ui'
import type { ComponentProps } from 'react'

import { cn } from '../../lib/cn'

export type LabelProps = ComponentProps<typeof LabelPrimitive.Root>

/**
 * Radix's label handles the one thing a raw `<label>` gets wrong: clicking it
 * must not select text when it is wired to a custom control.
 */
export function Label({ className, ...props }: LabelProps) {
  return (
    <LabelPrimitive.Root
      className={cn(
        'text-sm leading-none font-medium select-none',
        'peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
        className,
      )}
      {...props}
    />
  )
}
