import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Conditional class names with conflict resolution.
 *
 * `clsx` flattens the conditionals; `twMerge` makes the *last* Tailwind utility
 * win, so a caller can override a component's default padding without fighting
 * CSS specificity: `cn('p-4', className)`.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
